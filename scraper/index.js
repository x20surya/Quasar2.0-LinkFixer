import puppeteer from "puppeteer";
import { URL } from "url";
import amqp from "amqplib"
import { Redis } from "ioredis"
/**
 * Redis Variables :: 
 */
let isActive = false
let status = 0
export const RabbitMQ_URL = process.env.RABBITMQ_URL
const Redis_URL = process.env.REDIS_PUBLIC_URL
export const ID = process.env.INSTANCE_ID

let pauseTimeStart = 0
let pauseTimeEnd = 0

if (!ID) {
    console.error(`[${ID}] :: Instance ID not provided`)
    process.exit(1)
}

console.log(`[${ID}] :: Scraper ID ::: `, ID)
if (!RabbitMQ_URL || !Redis_URL) {
    console.error(`[${ID}] :: Essential Environment Variables are not provided`)
    process.exit(1)
}

export let connection, redis, channel, subscriber, pushBrowser
try {
    connection = await amqp.connect(RabbitMQ_URL)
    channel = await connection.createChannel()

    pushBrowser = await connection.createChannel()

    redis = new Redis(Redis_URL)

    subscriber = new Redis(Redis_URL)
}
catch (err) {
    console.log(err)
    throw err
}

await pushBrowser.assertQueue("available_browsers")
await pushBrowser.sendToQueue("available_browsers", Buffer.from(JSON.stringify({id : ID})))
console.log(`[${ID}] :: Browser pushed to queue`)

redis.on("connect", () => console.log(`[${ID}] :: Client Connected to Railway Redis ✅`));
redis.on("error", (err) => console.error(`[${ID}] :: Client Redis error:`, err));

subscriber.on("connect", () => console.log(`[${ID}] :: Subscriber Connected to Railway Redis ✅`));
subscriber.on("error", (err) => console.error(`[${ID}] :: Subscriber Redis error:`, err));

await subscriber.subscribe(`${ID}_domain`)

setInterval(async () => {
    console.log(`[${ID}] :: Sending status = `, status)
    await redis.publish(`${ID}_status`, status)
    if(status == -1){
        status = 0
    }
}, 7000)

subscriber.on(`message`, (domainInfo, message) => {
    if(domainInfo != `${ID}_domain`){
        console.log(`[${ID}] :: Invalid Sucscriber`)
        return;
    }
    if (isActive) {
        console.log(`[${ID}] :: Error :: Another Domain assigned before completion\nAssigned :: ` + domainInfo)
        return;
    }
    isActive = true
    status = 1
    console.log(`[${ID}] :: Domain Assigned :: `, domainInfo)
    // call domain
    const { domain, linkQueue, authentication, maxPages, limit } = JSON.parse(message)
    startConsumers(domain, linkQueue, authentication, maxPages, limit).catch((err) => {
        console.error("Error in starting Consumer for Domain :: " + domain + "\nError :: " + err)
        status = -1
    })
})
// console.log("Subscriber Running at ", `${ID}_domain`)



async function checkLink(link, page) {
    try {
        if (/\.(pdf|jpg|jpeg|png|gif|svg|mp4|mp3|zip|docx?)$/i.test(link)) {
            const response = await fetch(link, { method: "GET" });
            if (response.ok) {
                return {
                    content: "file",
                    url: link,
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok,
                };
            }
        }

        const res = await page.goto(link, {
            waitUntil: "networkidle2",
            timeout: 30000,
        });

        const result = {
            redirectedTo: res.url(),
            content: "site",
            url: link,
            status: res.status(),
            statusText: res.statusText(),
            ok: res.ok(),
        };
        return result;
    } catch (err) {
        console.log(`[${ID}] :: checkLink Failed Link : `, link)
        // console.log("checkLink Failed Error : ", err)
        return {
            content: "site",
            url: link,
            status: 0,
            statusText: err.message,
            ok: false,
        };
    }
}

async function createPage(browser, authentication = undefined) {
    const page = await browser.newPage();
    await Promise.all([
        page.setViewport({ width: 1280, height: 800 }),
        page.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
            Referer: "https://www.google.com/",
            "Upgrade-Insecure-Requests": "1",
            ...(authentication ? { Authorization: `Bearer ${authentication}` } : {}),
        }),
        page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
        )
    ])
    return page
}

async function visitLink(link, page, baseDomain) {
    console.log(`[${ID}] :: Fetching Page :: ` + link)
    let res = await checkLink(link, page)
    const parsedLink = new URL(link);
    if (parsedLink.hostname !== baseDomain) {
        console.log(`[${ID}] :: External Link : `, link)
        if (!res.ok) {
            console.log(`[${ID}] :: Link failed : `, link)
        }
        return { ...res, type: "external" };
    }
    if (!res.ok) {
        console.log(`[${ID}] :: Link failed : `, link)
        return { ...res, type: "internal" }
    }

    if (res.content === "file") {
        return { ...res, type: "internal" }
    }
    // stop futher examination of external links
    // console.log("Internal Link : ", link)

    // continue to find links within the internal pages
    // finding the links present in the page
    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a")).map(
            (link) => link.href
        );
    });

    // pushing the links into urlsToVisit, to further evaluate them
    let urlsToVisit = []
    for (const link of links) {
        // check link to be a valid link
        if (!link || link.trim() === "") {
            continue;
        }
        if (!link.startsWith("http")) {
            continue;
        }
        if (link.endsWith("#")) {
            continue;
        }
        urlsToVisit.push(link)
    }
    // console.log("URL in page : " + urlsToVisit.length)
    return { ...res, urlsToVisit, type: "internal" };
}

async function startConsumers(domain, linkQueue, authentication, maxPages = 3, limit = undefined) {

    console.log(`[${ID}] :: Starting Consumer for Domain :: ${domain}, Queue :: ${linkQueue}, MaxPages :: ${maxPages}, Limit :: ${limit}\n\n`)

    const startTime = Date.now()

    const checkedLinksKey = `${domain}_checkedLinks`
    const pauseStatusKey = `${domain}_pause_status`
    status = 1
    await redis.incr(pauseStatusKey)
    if (!linkQueue.includes("_links")) {
        throw new Error(`Invalid Queue name`)
    }

    try {
        // the link should be asserted by the manager
        await channel.checkQueue(linkQueue)
    } catch (err) {
        console.log(`[${ID}] :: Error Ocurred, Queue does not exist in RabbitMQ server\nQueue :: ` + linkQueue)
        // throw new Error("Error Ocurred, Queue does not exist in RabbitMQ server\nQueue :: " + linkQueue)
    }
    channel.prefetch(maxPages)

    // initializing browser and creating initial pages
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--disable-features=BlockInsecurePrivateNetworkRequests",
            "--disable-blink-features=AutomationControlled",
            "--disable-http2"
        ],
    });
    const pages = await Promise.all(Array(maxPages).fill().map(() => createPage(browser, authentication)))



    let setPauseTimeout = 0
    let isPaused = false
    let pauseStatusTimeout = 0
    let hasCleaned = false

    const checkedLinks = new Set()
    let baseDomain = undefined

    async function cleanup(consumerTag) {
        console.log(`[${ID}] :: Cleanup started`)
        if (hasCleaned) return

        hasCleaned = true
        clearTimeout(setPauseTimeout);
        clearTimeout(pauseStatusTimeout);
        status = 0
        await channel.cancel(consumerTag)
        await browser.close();
        const endTime = Date.now();
        const completionTime = (endTime - startTime) / 1000
        const tempTime = await redis.get(`${domain}_duration`)
        if (tempTime === null) {
            await redis.set(`${domain}_duration`, completionTime)
        } else {
            await redis.set(`${domain}_duration`, Math.max(completionTime, tempTime))
        }
        isActive = false

        const finalCheckedLinks = await redis.smembers(checkedLinksKey)
        const finalDataList = await redis.lrange(`${domain}_results`, 0, -1);
        const finalData = finalDataList.map(item => JSON.parse(item));

        console.log(`[${ID}] :: Checked Links : `, finalCheckedLinks.length)
        console.log(`[${ID}] :: Checked Links Data : `, finalData.length)


        const brokenLinks = []
        for (const data of finalData) {
            const stat = Number(data.status)

            if (stat >= 200 && stat < 300) {
                continue;
            }
            brokenLinks.push(data)
        }

        console.log(`[${ID}] :: Completed Scraping for Domain :: ${domain} in ${completionTime} seconds`)
        console.log(`[${ID}] :: Broken Links  ::: ${brokenLinks.length}`)
        console.log(brokenLinks)


    }

    async function setPauseBrowser(consumerTag) {
        if (!isPaused) {
            console.log(`[${ID}] :: Pausing Browser for Domain :: ` + domain)
            isPaused = true
            const pausedSemaphore = await redis.decr(pauseStatusKey)
            console.log(`[${ID}] :: pausedSemaphore ::: `, pausedSemaphore)
            if (pausedSemaphore <= 0) {
                // handle completion
                try {
                    await cleanup(consumerTag)
                } catch (err) {
                    console.error(`[${ID}] :: Error in cleanup :: `, err)
                    status = -1  // Signal failure
                }
            }
        }
        pauseStatusTimeout = setTimeout(() => { checkPauseStatus(consumerTag) }, 10000)
    }

    async function checkPauseStatus(consumerTag) {
        if (!isActive) return
        const pausedSemaphore = Number(await redis.get(pauseStatusKey))
        if (pausedSemaphore <= 0) {
            try {
                await cleanup(consumerTag)
            } catch (err) {
                console.error(`[${ID}] :: Error in cleanup :: `, err)
                status = -1  // Signal failure
            }
        }
        clearTimeout(pauseStatusTimeout)
        pauseStatusTimeout = setTimeout(() => { checkPauseStatus(consumerTag) }, 10000)
    }

    const fetchPage = async () => {
        console.log(`[${ID}] :: Page fetched `)
        if (pages.length === 0) {
            throw new Error("Unexpected :: Pages more than maxPages fetched")
        } else {
            if (isPaused) {
                isPaused = false
                await redis.incr(pauseStatusKey)
            }
            clearTimeout(setPauseTimeout)
            clearTimeout(pauseStatusTimeout)
            return pages.pop()
        }
    }
    const completedPage = (page, consumerTag) => {
        if (pages.length >= maxPages) {
            // throw new Error("This can never happen, hopefully")
        }
        console.log(`[${ID}] :: Page Completed and returned to pool`)
        pages.push(page)
        clearTimeout(setPauseTimeout)
        setPauseTimeout = setTimeout(() => { setPauseBrowser(consumerTag) }, 10000)
    }
    const { consumerTag } = await channel.consume(linkQueue, async (msg) => {

        try {
            const page = await fetchPage()


            const data = JSON.parse(msg.content.toString())
            if (data.link === undefined || data.depth === undefined) {
                console.error(`[${ID}] :: ERROR :: Invalid type of data found in LinkChannel in Puppeteer`)
                console.log(`[${ID}] :: DATA :: `, data)
                completedPage(page, consumerTag)
                channel.ack(msg)
                return
            }
            console.log(`[${ID}] :: Processing Link :: ${data.link} at Depth :: ${data.depth}`)
            if (checkedLinks.has(data.link)) {
                console.log(`[${ID}] :: Link already checked NO REDIS :: ` + data.link)
                completedPage(page, consumerTag)
                channel.ack(msg);
                return;
            }
            if (await redis.sismember(checkedLinksKey, data.link)) {
                checkedLinks.add(data.link)
                // console.log(`[${ID}] :: Link already checked :: ` + data.link)
                completedPage(page, consumerTag)
                channel.ack(msg);
                return;
            }
            // console.log(`[${ID}] :: Visiting Link :: ` + data.link)
            let linkInfo
            try {
                if (baseDomain === undefined) {
                    const parsedURL = new URL(data.link)
                    baseDomain = parsedURL.hostname
                    console.log(`[${ID}] :: Base Domain Set to :: ` + baseDomain)
                }
                linkInfo = await visitLink(data.link, page, baseDomain)

                console.log(`[${ID}] :: Link Info Recieved for :: ` + data.link)
            } catch (err) {
                console.error(`[${ID}] :: ERROR IN VISITING LINK :: ` + err)
                await page.close();
                pages.push(await createPage(browser, authentication));
                channel.ack(msg)
                return
            }
            const { urlsToVisit, redirectedTo, status: linkStatus, url, content, statusText } = linkInfo

            let linkData = {}

            if (url !== undefined) {
                linkData.url = url
            }
            if (redirectedTo !== undefined) {
                linkData.redirectedTo = redirectedTo
            }
            if (content !== undefined) {
                linkData.content = content
            }
            if (linkStatus !== undefined) {
                linkData.status = linkStatus
            }
            if (statusText !== undefined) {
                linkData.statusText = statusText
            }
            linkData.timestamp = Date.now()

            await redis.sadd(checkedLinksKey, url)
            await redis.rpush(`${domain}_results`, JSON.stringify(linkData));
            const checkedLinksData = await redis.smembers(checkedLinksKey)
            checkedLinks.add(url)
            checkedLinksData.forEach((link) => {
                checkedLinks.add(link)
            })
            if (urlsToVisit !== undefined && urlsToVisit.length !== 0) {
                let count = 0
                for (const url of urlsToVisit) {
                    if (!checkedLinks.has(url)) {
                        await channel.sendToQueue(linkQueue, Buffer.from(JSON.stringify({
                            link: url,
                            depth: Number(data.depth) + 1
                        })))
                        count++;
                    }
                }
                // console.log("Adding new Link to Queue :: " + count)
            } else {
                // console.log("No further URLs to visit from Link :: " + data.link)
            }
            // console.log("Page Completed and returned to pool for Link :: " + data.link)
            completedPage(page, consumerTag)
            if (limit && checkedLinks.size > limit) {
                try {
                    await cleanup(consumerTag)
                } catch (err) {
                    console.error(`[${ID}] :: Error in cleanup: `, err)
                    status = -1  // Signal failure
                }
                return
            }
            channel.ack(msg)

        } catch (err) {
            while (pages.length < maxPages) {
                pages.push(await createPage(browser, authentication));
            }
            console.error(`[${ID}] :: ERROR IN SCRAPING PAGE :: ` + err)
            channel.ack(msg)
        }
    })
}