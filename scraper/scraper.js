import puppeteer from "puppeteer";
import { URL } from "url";
import amqp from "amqplib"
import { Redis } from "ioredis"
import dotenv from "dotenv";

dotenv.config()

/**
 * Redis Variables :: 
 */
let isActive = false
export const RabbitMQ_URL = process.env.RABBITMQ_URL
const Redis_URL = process.env.REDIS_PUBLIC_URL
const ID = process.env.INSTANCE_ID

if (!ID) {
    console.error("Instance ID not provided")
    process.exit(1)
}

console.log("Scraper ID ::: ", ID)
if (!RabbitMQ_URL || !Redis_URL) {
    console.error("Essential Environment Variables are not provided")
    process.exit(1)
}

export let connection, redis, channel, subscriber
try {
    connection = await amqp.connect(RabbitMQ_URL)
    channel = await connection.createChannel()

    redis = new Redis(Redis_URL)

    subscriber = new Redis(Redis_URL)
}
catch (err) {
    console.log(err)
    throw err
}

redis.on("connect", () => console.log("Client Connected to Railway Redis ✅"));
redis.on("error", (err) => console.error("Client Redis error:", err));

subscriber.on("connect", () => console.log("Subscriber Connected to Railway Redis ✅"));
subscriber.on("error", (err) => console.error("Subscriber Redis error:", err));

await subscriber.subscribe(`${ID}_domain`)

subscriber.on(`message`, (domainInfo, message) => {
    if (isActive) {
        console.log("Error :: Another Domain assigned before completion\nAssigned :: " + domainInfo)
        return;
    }
    isActive = true
    console.log("Domain Assigned :: ", domainInfo)
    // call domain
    const { domain, linkQueue, authentication, maxPages, limit } = JSON.parse(message)
    startConsumers(domain, linkQueue, authentication, maxPages, limit).catch((err) => {
        console.error("Error in starting Consumer for Domain :: " + domain + "\nError :: " + err)
    })
})
console.log("Subscriber Running at ", `${ID}_domain`)



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
        console.log("checkLink Failed Link : ", link)
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
    console.log("Fetching Page :: " + link)
    let res = await checkLink(link, page)
    const parsedLink = new URL(link);
    if (parsedLink.hostname !== baseDomain) {
        console.log("External Link : ", link)
        if (!res.ok) {
            console.log("Link failed : ", link)
        }
        return { ...res, type: "external" };
    }
    if (!res.ok) {
        console.log("Link failed : ", link)
        return { ...res, type: "internal" }
    }

    if (res.content === "file") {
        return { ...res, type: "internal" }
    }
    // stop futher examination of external links
    console.log("Internal Link : ", link)

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
    console.log("URL in page : " + urlsToVisit.length)
    return { ...res, urlsToVisit, type: "internal" };
}

async function startConsumers(domain, linkQueue, authentication, maxPages = 3, limit = undefined) {

    console.log(`Starting Consumer for Domain :: ${domain}, Queue :: ${linkQueue}, MaxPages :: ${maxPages}, Limit :: ${limit}\n\n`)

    const startTime = Date.now()

    const checkedLinksKey = `${domain}_checkedLinks`
    await redis.del(checkedLinksKey)
    await redis.set(`${ID}_status`, 1)
    await redis.del(`${domain}_results`)
    if (!linkQueue.includes("_links")) {
        throw new Error("Invalid Queue name")
    }

    try {
        // the link should be asserted by the manager
        await channel.checkQueue(linkQueue)
    } catch (err) {
        console.log("Error Ocurred, Queue does not exist in RabbitMQ server\nQueue :: " + linkQueue)
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
        if (hasCleaned) return
        hasCleaned = true
        clearTimeout(setPauseTimeout);
        clearTimeout(pauseStatusTimeout);
        await redis.set(`${ID}_status`, 0)
        await channel.cancel(consumerTag)
        await browser.close();
        const endTime = Date.now();
        const completionTime = (endTime - startTime) / 1000
        const tempTime = await redis.get(`${domain}_duration`)
        if (tempTime === null) {
            await redis.set(`${domain}_duration`, completionTime)
        } else {
            await redis.set(`${domain}_duration`, (completionTime + tempTime) / 2)
        }
        isActive = false
        console.log(`Completed Scraping for Domain :: ${domain} in ${completionTime} seconds`)

    }

    async function setPauseBrowser(consumerTag) {
        const key = `${domain}_pause_status`
        if (!isPaused) {
            console.log("Pausing Browser for Domain :: " + domain)
            isPaused = true
            const pausedSemaphore = await redis.decr(key)
            if (pausedSemaphore <= 0) {
                // handle completion
                await cleanup(consumerTag)
            }
        }
        pauseStatusTimeout = setTimeout(() => { checkPauseStatus(consumerTag) }, 10000)
    }

    async function checkPauseStatus(consumerTag) {
        const key = `${domain}_pause_status`
        if (!isActive) return
        const pausedSemaphore = Number(await redis.get(key))
        if (pausedSemaphore <= 0) {
            await cleanup(consumerTag)
        }
        clearTimeout(pauseStatusTimeout)
        pauseStatusTimeout = setTimeout(() => { checkPauseStatus(consumerTag) }, 10000)
    }

    const fetchPage = async () => {
        const key = `${domain}_pause_status`
        if (pages.length === 0) {
            throw new Error("Unexpected :: Pages more than maxPages fetched")
        } else {
            if (isPaused) {
                isPaused = false
                await redis.incr(key)
            }
            clearTimeout(setPauseTimeout)
            clearTimeout(pauseStatusTimeout)
            return pages.pop()
        }
    }
    const completedPage = (page, consumerTag) => {
        if (pages.length >= maxPages) {
            throw new Error("This can never happen, hopefully")
        }
        console.log("Page Completed and returned to pool")
        pages.push(page)
        clearTimeout(setPauseTimeout)
        setPauseTimeout = setTimeout(() => { setPauseBrowser(consumerTag) }, 10000)
    }
    const { consumerTag } = await channel.consume(linkQueue, async (msg) => {

        try {
            const page = await fetchPage()


            const data = JSON.parse(msg.content.toString())
            if (data.link === undefined || data.depth === undefined) {
                console.error("ERROR :: Invalid type of data found in LinkChannel in Puppeteer")
                console.log("DATA :: ", data)
                completedPage(page, consumerTag)
                channel.ack(msg)
                return
            }
            console.log(`Processing Link :: ${data.link} at Depth :: ${data.depth}`)
            if (checkedLinks.has(data.link)) {
                console.log("Link already checked NO REDIS :: " + data.link)
                completedPage(page, consumerTag)
                channel.ack(msg);
                return;
            }
            if (await redis.sismember(checkedLinksKey, data.link)) {
                checkedLinks.add(data.link)
                console.log("Link already checked :: " + data.link)
                completedPage(page, consumerTag)
                channel.ack(msg);
                return;
            }
            console.log("Visiting Link :: " + data.link)
            let linkInfo
            try {
                if (baseDomain === undefined) {
                    const parsedURL = new URL(data.link)
                    baseDomain = parsedURL.hostname
                    console.log("Base Domain Set to :: " + baseDomain)
                }
                linkInfo = await visitLink(data.link, page, baseDomain)

                // console.log("Link Info Recieved for :: " + data.link)
            } catch (err) {
                console.error("ERROR IN VISITING LINK :: " + err)
                await page.close();
                pages.push(await createPage(browser, authentication));
                channel.ack(msg)
                return
            }
            const { urlsToVisit, redirectedTo, status, url, content, statusText } = linkInfo

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
            if (status !== undefined) {
                linkData.status = status
            }
            if (statusText !== undefined) {
                linkData.statusText = statusText
            }
            linkData.timestamp = Date.now()

            await redis.sadd(checkedLinksKey, url)
            const existingResults = await redis.get(`${domain}_results`);
            // console.log("Before JSON Parse Existing Results :: ", linkData, " Data ::: ", existingResults)
            const results = JSON.parse(existingResults) ?? [];
            // console.log("After JSON Parse Existing Results")
            results.push(linkData);
            await redis.set(`${domain}_results`, JSON.stringify(results));
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
                console.log("Adding new Link to Queue :: " + count)
            } else {
                console.log("No further URLs to visit from Link :: " + data.link)
            }
            console.log("Page Completed and returned to pool for Link :: " + data.link)
            completedPage(page, consumerTag)
            if (limit && checkedLinks.size > limit) {
                await cleanup(consumerTag)
            }
            channel.ack(msg)
        } catch (err) {
            while (pages.length < maxPages) {
                pages.push(await createPage(browser, authentication));
            }
            console.error("ERROR IN SCRAPING PAGE :: " + err)
            channel.ack(msg)
        }
    })
}