import amqp from "amqplib"
import { Redis } from 'ioredis'
import { connectDB, Website } from "./db.js";

/**
 * Queues Used :---
 * 
 * priority_low_domain / priority_mid_domain / priority_high_domain : 
 * stores : website domains 
 * format : message : {
 *              id : uid for the website in mongo
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
 *              id : unique
 *              link : hosted link of this instance
 *              endpoint : endpoint to assign queue name to the browser instance
 *          }
 */

/**  Redis -> 
 * 
 *  queued:${websiteID}
 *      VALUE : 0 -> stop execution 1 -> continue execution
 *      status of website queue
 *  
 *  <website_id>_active_browsers
 *      VALUE :: number
 *      number of browsers currently working on a website_id
 * 
 *  SERVICES:DOWN
 *      1 -> all services down, no scraper available
 * 
 *  reports
 *      value -> as needed by coder for admin portal
 *  
 *  
*/

await connectDB()

const queue = process.env.QUEUE || "priority_low"
const nextQueue = process.env.NEXT_QUEUE || "priority_mid"
const instances = Number.parseInt(process.env.INSTANCES) || 1
const maxLimit = Number.parseInt(process.env.LINK_LIMIT) || undefined

const browserChannelQueue = "available_browsers"
const websiteQueue = queue + "_domain"

const redisURL = process.env.REDIS_URL
const rabbitMQURL = process.env.RABBITMQ_URL

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

await sleep(15000)
let redis
try {
    redis = new Redis(redisURL)
} catch (err) {
    console.error(err)
    process.exit(1)
}

redis.on("connect", () => {
    console.log("Connected to Redis ✅")
})
redis.on("error", (error) => {
    console.log("Error in connection to Redis ❌")
    console.error(error.message)
    process.exit(1)
})

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
            *       id : uid for the website in mongo
            *       attempt : number of tries given to current website, max 3
            *    }
            */
            if (message.id === undefined || message.attempt === undefined) {
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

            const websiteID = currWebsite.id
            const domain = currWebsite.domain
            const sitemapLinks = currWebsite.sitemapLinks
            console.log("website ::::::: ", domain)

            const linkQueue = domain + "_links"
            const activeBrowserKey = `${websiteID}_active_browsers`
            const queuedKey = `queued:${websiteID}`

            console.log(`Recieved :: ${domain}, By :: ${queue}`)

            // checking if website execution cancelled after queuing
            const isCancelled = await redis.get(queuedKey)
            if (Number(isCancelled) !== 1) {
                console.log("WEBSITE EXECUTION CANCELLED")
                console.log("isCancelled ::: ", isCancelled)
                channel.ack(msg_website)
                return
            }

            // Initialize active browser counter for this domain
            await redis.set(activeBrowserKey, 0)

            // create a queue and push links into queue
            linkChannel.assertQueue(linkQueue, {
                durable: true
            })

            for (const link of sitemapLinks) {
                linkChannel.sendToQueue(linkQueue, Buffer.from(JSON.stringify({
                    link,
                    baseDomain: domain,
                    depth: 0
                })), {
                    persistent: true
                })
            }

            let browser_message_batch = []

            // allocate queue to available vacant pupeteer instances
            browserChannel.assertQueue(browserChannelQueue, {
                durable: true
            })
            browserChannel.prefetch(instances)

            let browserConsumerTag

            browserChannel.consume(browserChannelQueue, async (msg_browser) => {
                /*
                *    browser : {
                *        id,
                *        failure
                *    }
                */
                // wait for pupeteer intance to complete, by checking a queue or redis
                const browser = JSON.parse(msg_browser.content.toString())
                browser_message_batch.push(msg_browser)
                const uid = browser.id

                // Increment active browser count
                await redis.incr(activeBrowserKey)

                const authentication = currWebsite.options.authentication, maxPages = 3, limit = maxLimit

                console.log(`Browser :::::::::::::::::::::::::::::::::::::: `, browser)

                await redis.set(`${domain}_pause_status`, 0)
                await redis.del(`${domain}_checkedLinks`)
                await redis.del(`${domain}_results`)
                await redis.publish(`${uid}_domain`, JSON.stringify({
                    domain,
                    limit,
                    maxPages,
                    linkQueue,
                    authentication
                }))
                console.log("")
                // health check to ensure the Pupeteer browser didn't breakdown and stopped without giving error or updating status
                const statusSubscriber = new Redis(redisURL)

                await statusSubscriber.subscribe(`${uid}_status`)

                async function handleFailure(status = 1) {
                    console.log("Handling Failure")
                    await statusSubscriber.unsubscribe(`${uid}_status`).catch(() => { })
                    await statusSubscriber.quit().catch(() => { })
                    const activeBrowsers = await redis.decr(activeBrowserKey)
                    if (activeBrowsers <= 0) {
                        console.log("Failure and 0 ACTIVE BROWSER\n")
                        console.log(message)
                        if (Number(message.attempt) >= 3) {
                            // log FATAL ERROR and write error to Mongo
                            await redis.del(queuedKey)
                            await redis.del(activeBrowserKey)
                            channel.ack(msg_website)
                            await redis.rpush(`reports`, JSON.stringify({
                                trace: `/backend/workers/index.js`,
                                level: `high`,
                                type: `worker`,
                                queue_name: queue,
                                caller: `handleFailure()`,
                                message: `handleFailure() called for ${browser.id}`
                            }))
                            try {
                                await browserChannel.cancel(browserConsumerTag)
                            } catch (err) {
                                console.error("Error cancelling browser consumer:", err)
                            }
                            for (const temp_msg of browser_message_batch) {
                                try {
                                    if (temp_msg === msg_browser) {
                                        if (status === 0) browser.failure = Number(browser.failure) + 1
                                        if (browser.failure < 3) { browserChannel.sendToQueue(browserChannelQueue, Buffer.from(JSON.stringify(browser))) }
                                        else {
                                            const remaining_browsers = await browserChannel.checkQueue(browserChannelQueue)
                                            if(remaining_browsers.messageCount === 0){
                                                console.log(`!!! NO SCRAPERS WORKING !!!`)
                                                await redis.set(`SERVICES:DOWN`, 1)
                                                channel.nack(msg_website)
                                                return
                                            }
                                        }
                                    } else {
                                        browserChannel.sendToQueue(browserChannelQueue, Buffer.from(temp_msg.content))
                                    }
                                    browserChannel.ack(temp_msg)
                                } catch (err) {
                                    console.error("Error returning browser to pool:", err)
                                }

                            }
                            browser_message_batch = []
                            return
                        }
                        message.attempt = Number(message.attempt) + 1
                        channel.sendToQueue(websiteQueue, Buffer.from(JSON.stringify(message)))
                        channel.ack(msg_website)
                        try {
                            await browserChannel.cancel(browserConsumerTag)
                        } catch (err) {
                            console.error("Error cancelling browser consumer:", err)
                        }
                        for (const temp_msg of browser_message_batch) {
                            try {
                                browserChannel.sendToQueue(browserChannelQueue, Buffer.from(temp_msg.content))
                                browserChannel.ack(temp_msg)

                            } catch (err) {
                                console.error("Error returning browser to pool:", err)
                            }
                        }
                        browser_message_batch = []
                        return
                    }
                    // browserChannel.sendToQueue(browserChannelQueue, Buffer.from(msg_browser.content))
                    browserChannel.ack(msg_browser)
                    browser_message_batch = browser_message_batch.filter((x) => x !== msg_browser)
                    return
                }

                let failureTimeout = setTimeout(() => { handleFailure(0) }, 30000)


                async function unsubscribe() {
                    console.log("Unsubscribing")
                    await statusSubscriber.unsubscribe(`${uid}_status`).catch((err) => {
                        console.log("Error in unsubscribing")
                        console.log(err)
                    })
                    await statusSubscriber.quit()
                }


                statusSubscriber.on("message", async (ch, msg) => {
                    // 1 -> working fine        0 -> idle / completed       -1 -> failure & removed from active queue
                    console.log("Recieving status = ", msg)

                    if (ch !== `${uid}_status`) {
                        console.log("F")
                    }
                    if (isNaN(Number(msg))) {
                        console.log("Message recieved :: ", msg)
                        return
                    }

                    if (Number(msg) == 1) {
                        clearTimeout(failureTimeout)
                        failureTimeout = setTimeout(handleFailure, 30000)
                        return
                    }
                    if (Number(msg) == -1) {
                        await handleFailure()
                        clearTimeout(failureTimeout)
                        return
                    }

                    console.log("0   Recieving status -> stop execution")

                    clearTimeout(failureTimeout)
                    await unsubscribe()

                    const activeBrowsers = await redis.decr(activeBrowserKey)

                    console.log(`Active Browsers for :: ${domain} :: ${activeBrowsers}`)

                    if (activeBrowsers <= 0) {
                        // after completion confirmation check if links queue is empty, If not empty push to next priority_queue
                        const info = await linkChannel.checkQueue(linkQueue)
                        console.log("ACTIVE BROWSER 0")
                        if (info.messageCount === 0) {
                            console.log(`EXECUTION COMPLETED :::: ${domain}`)
                            // TODO Add checks later
                            const resultsList = await redis.lrange(`${domain}_results`, 0, -1);
                            await redis.del(`${domain}_results`);
                            const results = resultsList.map(item => JSON.parse(item));
                            currWebsite.checkedLinks = results;

                            console.log(results)

                            const currentCompletionTime = await redis.getdel(`${domain}_duration`)
                            const newApproximateTime = (currWebsite.estimatedTime[queue] + Number(currentCompletionTime)) / 2
                            currWebsite.estimatedTime[queue] = newApproximateTime

                            console.log("New Approximate time ::::::::::::::::::: ", newApproximateTime)
                            const isCancelled = await redis.getdel(queuedKey)
                            if (Number(isCancelled) === 1 || isCancelled === "1") {
                                console.log("Saving to db")
                                await currWebsite.save()
                            }

                            // Clean up active browser counter
                            await redis.del(activeBrowserKey)
                            channel.ack(msg_website)

                            try {
                                await browserChannel.cancel(browserConsumerTag)
                            } catch (err) {
                                console.error("Error cancelling browser consumer:", err)
                            }

                            for (const temp_msg of browser_message_batch) {
                                try {
                                    const temp = JSON.parse(temp_msg.content.toString()).id
                                    browserChannel.sendToQueue(browserChannelQueue, Buffer.from(temp_msg.content))
                                    browserChannel.ack(temp_msg)
                                    console.log(`Acked :: ${temp} :: sent in rotation`)
                                } catch (err) {
                                    console.error("Error returning browser to pool:", err)
                                }

                            }
                            browser_message_batch = []
                            return;
                        }

                        if (queue === "priority_high" && info.messageCount !== 0) {
                            console.log(`EXECUTION INCOMPLETE :::: ${domain} :::: ${queue}`)

                            // log unexpexted situation as high priority websites should be completed full
                            await redis.del(queuedKey)
                            // Clean up active browser counter
                            await redis.del(activeBrowserKey)
                            channel.ack(msg_website)
                            try {
                                await browserChannel.cancel(browserConsumerTag)
                            } catch (err) {
                                console.error("Error cancelling browser consumer:", err)
                            }
                            for (const temp_msg of browser_message_batch) {
                                try {
                                    browserChannel.sendToQueue(browserChannelQueue, Buffer.from(temp_msg.content))
                                    browserChannel.ack(temp_msg)
                                } catch (err) {
                                    console.error("Error returning browser to pool:", err)
                                }

                            }
                            browser_message_batch = []
                            clearTimeout(failureTimeout)
                            return;
                        }

                        console.log("INCOMPLETE EXECUTION")

                        const currentTime = Number(await redis.getdel(`${domain}_duration`))
                        const newApproximateTime = (currWebsite.estimatedTime[queue] + currentTime) / 2
                        currWebsite.estimatedTime[queue] = newApproximateTime

                        await currWebsite.save()
                        channel.sendToQueue(nextQueue + "_domain", Buffer.from(JSON.stringify({
                            id: currWebsite.id,
                            attempt: 1
                        })))
                        await redis.del(queuedKey)
                        // Clean up active browser counter
                        await redis.del(activeBrowserKey)
                        channel.ack(msg_website)
                        await statusSubscriber.quit()
                        for (const temp_msg of browser_message_batch) {
                            try {
                                browserChannel.sendToQueue(browserChannelQueue, Buffer.from(temp_msg.content))
                                browserChannel.ack(temp_msg)
                            } catch (err) {
                                console.error("Error returning browser to pool:", err)
                            }

                        }
                        browser_message_batch = []
                    }
                    // Return browser to pool
                    await statusSubscriber.quit()
                })
                statusSubscriber.on("error", (err) => {
                    console.error(`Subscriber error for ${uid}:`, err)
                })
            }, { noAck: false }).then(({ consumerTag }) => {
                browserConsumerTag = consumerTag
            })

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