import amqp from "amqplib"
import dotenv from "dotenv"
import { Redis } from '@upstash/redis'
import { v4 as uuidv4 } from "uuid";
import { connectDB, Website } from "./db.js";

/**
 * Queues Used :---
 * 
 * priority_low / priority_mid / priority_high : 
 * stores : website domains 
 * format : message : {
 *              id : uid for the website in mongo
 *              password : Env variable common in server and manager
 *              attempt : number of tries given to current website, max 3
 *          }
 * 
 * 
 * <domain>_links :
 * stores : internal and external links of domains currently being processed
 * format : link : {
 *              link : string,
 *              depth : smallest diff from a sitemap link         
 *          }
 * 
 * 
 * available_browsers : 
 * stores : stores links of puppeteer browser instances currently idle
 * format : browser : {
 *              link : hosted link of this instance
 *              endpoint : endpoint to assign queue name to the browser instance
 *          }
 */


dotenv.config()
await connectDB()

const queue = process.env.QUEUE || "priority_low"
const nextQueue = process.env.NEXT_QUEUE || "priority_mid"
const instances = Number.parseInt(process.env.INSTANCES) || 1
const maxLimit = Number.parseInt(process.env.LINK_LIMIT) || undefined
const authorization_token = process.env.AUTHORIZATION_TOKEN

const reddisURL = process.env.REDDIS_URL
const reddisToken = process.env.REDDIS_TOKEN
const rabbitMQURL = process.env.RABBITMQ_URL

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let redis
try {
    redis = new Redis({
        url: reddisURL,
        token: reddisToken,
    })
} catch (err) {
    console.error(err)
    process.exit(1)
}

try {
    const connection = await amqp.connect(rabbitMQURL)

    let linkChannel, browserChannel, channel

    try {
        [linkChannel, browserChannel, channel] = await Promise.all(
            [connection.createChannel(), connection.createChannel(), connection.createChannel()]
        )
    }
    catch (err) {
        console.log("Error During Channel Creation")
        console.error(err)
        process.exit(1)
    }
    const websiteQueue = queue + "_domain"
    try {
        channel.assertQueue(websiteQueue, {
            durable: true
        })

        channel.prefetch(1)

        // takes a website from its queue, and processes its starting links
        channel.consume(websiteQueue, async (msg_website) => {
            const message = JSON.parse(msg_website.content.toString())
            /*
            *    message : {
            *    id : uid for the website in mongo
            *    password : Env variable common in server and manager
            *    attempt : number of tries given to current website, max 3
            *    }
            */
           if (!message.id) {
               console.log("Invalid Queue Message :: ", message)
               channel.ack(msg_website)
               return;
            }
            const currWebsite = await Website.findById(message.id)
            if (!currWebsite) {
                // log invalid request
                channel.ack(msg_website)
                return
            }
            const domain = currWebsite.domain
            const sitemapLinks = currWebsite.sitemapLinks
            
            console.log(`Recieved :: ${domain}, By :: ${queue}` )
            // Initialize active browser counter for this domain
            await redis.set(`${domain}_active_browsers`, 0)

            // create a queue and push links into queue
            linkChannel.assertQueue(domain + "_links", {
                durable: true
            })
            for (const link of sitemapLinks) {

                linkChannel.sendToQueue(domain + "_links", Buffer.from(JSON.stringify({
                    link,
                    depth: 0
                })), {
                    persistent: true
                })
            }

            // allocate queue to available vacant pupeteer instances
            browserChannel.assertQueue("available_browsers", {
                durable: true
            })
            browserChannel.prefetch(instances)

            browserChannel.consume("available_browsers", async (msg_browser) => {
                /*
                *    browser : {
                *        link : hosted link of this instance
                *        endpoint : endpoint to assign queue name to the browser instance
                *    }
                */
                // wait for pupeteer intance to complete, by checking a queue or redis
                const browser = JSON.parse(msg_browser.content.toString())

                const uid = uuidv4()

                // Increment active browser count
                await redis.incr(`${domain}_active_browsers`)

                const response = await fetch(browser.link + browser.endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": "Bearer " + authorization_token
                    },
                    body: maxLimit ? JSON.stringify({
                        id: uid,
                        queue: domain + "_links",
                        limit: maxLimit
                    }) : JSON.stringify({
                        id: uid,
                        queue: domain + "_links"
                    }),
                });

                if (!response.ok) {
                    // Decrement counter on failure
                    await redis.decr(`${domain}_active_browsers`)
                    browserChannel.sendToQueue("available_browsers", Buffer.from(msg_browser.content))
                    return;
                }

                // monitor for failures of the browsers or completion
                const ETA = currWebsite.estimatedTime[queue] != -1 ?
                    currWebsite.estimatedTime[queue] : 100
                // 1 -> working fine        0 -> idle / completed       -1 -> failure & removed from active queue
                let status = 1
                let delay = ETA / 2

                while (status === 1) {
                    await sleep(delay)
                    const newStatus = await redis.get(`${uid}_status`)
                    status = Number(newStatus)
                    delay = Math.max(20, delay / 2)
                }

                // Return browser to pool
                browserChannel.sendToQueue("available_browsers", Buffer.from(msg_browser.content))
                browserChannel.ack(msg_browser)

                // Decrement active browser count
                const activeBrowsers = await redis.decr(`${domain}_active_browsers`)

                if (status !== 0) {
                    // log error
                    // Check if all browsers are done and handle failure
                    if (activeBrowsers <= 0) {
                        if (Number(message.attempt) >= 3) {
                            // log FATAL ERROR and write error to Mongo
                            await redis.del(`queued:${domain}`)
                            await redis.del(`${domain}_active_browsers`)
                            channel.ack(msg_website)
                            return
                        }
                        message.attempt = Number(message.attempt) + 1
                        channel.sendToQueue(websiteQueue, Buffer.from(JSON.stringify(message)))
                        channel.ack(msg_website)
                    }
                    return
                }

                // Only proceed with completion check if this is the last browser
                if (activeBrowsers <= 0) {
                    // after completion confirmation check if links queue is empty, If not empty push to next priority_queue
                    const info = await linkChannel.checkQueue(`${domain}_links`)
                    if (info.messageCount === 0) {
                        const checked_links = await redis.getdel(`${domain}_checkedLinks`)
                        const broken_links = await redis.getdel(`${domain}_brokenLinks`)
                        currWebsite.checkedLinks = checked_links
                        currWebsite.brokenLinks = broken_links
                        const currentTime = await redis.getdel(`${domain}_duration`)
                        const newApproximateTime = (currWebsite.estimatedTime[queue] + currentTime) / 2
                        currWebsite.estimatedTime[queue] = newApproximateTime
                        await currWebsite.save()
                        await redis.del(`queued:${domain}`)
                        // Clean up active browser counter
                        await redis.del(`${domain}_active_browsers`)
                        channel.ack(msg_website)
                        return;
                    }

                    if (queue === "priority_high" && info.messageCount !== 0) {
                        // log unexpexted situation as high priority websites should be completed full
                        await redis.del(`queued:${domain}`)
                        // Clean up active browser counter
                        await redis.del(`${domain}_active_browsers`)
                        channel.ack(msg_website)
                        return;
                    }

                    const currentTime = await redis.getdel(`${domain}_duration`)
                    const newApproximateTime = (currWebsite.estimatedTime[queue] + currentTime) / 2
                    currWebsite.estimatedTime[queue] = newApproximateTime

                    await currWebsite.save()
                    channel.sendToQueue(nextQueue + "_domain", Buffer.from(JSON.stringify({
                        id: currWebsite.id,
                        password: message.password,
                        attempt: 1
                    })))
                    await redis.del(`queued:${domain}`)
                    // Clean up active browser counter
                    await redis.del(`${domain}_active_browsers`)
                    channel.ack(msg_website)
                }
                // acknowledge completion
            }, { noAck: false })

        }, {
            noAck: false
        })
    } catch (err) {
        console.error("Error::")
        console.error(err)
        process.exit(1)
    }
}
catch (err) {
    console.error("Error :: ")
    console.error(err)
    process.exit(1)
}