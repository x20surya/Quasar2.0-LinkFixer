import puppeteer from "puppeteer";
import { URL } from "url";

async function checkLink(link, page) {
    try {

        if (/\.(pdf|jpg|jpeg|png|gif|svg|mp4|mp3|zip|docx?)$/i.test(link)) {
            const response = await fetch(link, { method: "GET" });
            if (response.ok) {
                return {
                    type: "file",
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
            finalURL : res.url(),
            type: "site",
            url: link,
            status: res.status(),
            statusText: res.statusText(),
            ok: res.ok(),
        };
        return result;
    } catch (err) {
        console.log("checkLink Failed Link : ", link)
        console.log("checkLink Failed Error : ", err)
        return {
            type: "site",
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
        return { ...res, form: "external" };
    }
    if (!res.ok) {
        console.log("Link failed : ", link)
        return { ...res, form: "internal" }
    }

    if(res.type === "file"){
        return { ...res, form: "internal" }
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
    return { ...res, urlsToVisit, form: "internal" };
}

export default async function scrape({
    startURL,
    authentication,
    maxDepth = 3,
    maxParallel = 1,
}) {
    console.log("--------------------scraper has started-----------------------------")
    const startTime = Date.now();

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
    console.log("browser launched")

    const startUrlParsed = new URL(startURL);
    const baseDomain = startUrlParsed.hostname;

    const urlsToVisit = [startURL];

    const brokenLinks = new Set()
    const checkedLinks = new Set()

    const brokenLinkReports = new Map();
    const checkedLinkReports = new Map();
    const parents = new Map()

    const pages = await Promise.all(Array(maxParallel).fill().map(() => createPage(browser, authentication)))

    console.log("Initial Pages : ", urlsToVisit)

    while (urlsToVisit.length > 0) {
        console.log("Enter while")
        let visitLinkPromises = []

        for (let i = 0; i < pages.length && urlsToVisit.length > 0; i++) {
            let currentUrl = urlsToVisit.pop();
            // console.log("currentUrl : ", currentUrl)
            while (checkedLinks.has(currentUrl)) {
                // console.log("already checked")
                currentUrl = urlsToVisit.pop()
                // console.log("currentUrl : ", currentUrl)
                if (urlsToVisit.length <= 0) {
                    console.log("::::::::::::::::::::::::::::::::::::: Empty  ::::::::::::::::::::::::::::::::::::")
                    break;
                }
            }
            if (!currentUrl) break
            if (checkedLinks.has(currentUrl)) {
                // console.log("already checked")
                break;
            }
            visitLinkPromises.push(
                visitLink(currentUrl, pages[i], baseDomain)
            )
        }

        console.log("Parallel used : " + visitLinkPromises.length)

        const res = await Promise.allSettled(visitLinkPromises)

        console.log("Promise resolution : " + res)

        for (const visitLink of res) {
            if (visitLink.status === "fulfilled") {
                const result = visitLink.value

                if (!result.ok) {
                    brokenLinks.add(result.url)
                    brokenLinkReports.set(result.url, result)
                }

                checkedLinks.add(result.url)
                checkedLinkReports.set(result.url, result)

                // if valid links present in the link visited
                if (result.urlsToVisit) {
                    
                    for(const url of result.urlsToVisit){
                        if(!checkedLinks.has(url)){ urlsToVisit.push(url)
                            console.log("pushes " + url)
                        }
                        let currParents = parents.get(url)
                        if(!currParents) currParents = []
                        parents.set(url, [...currParents, result.url])
                    }
                }
            } else {
                console.log(res)
                console.error("visitlink promise rejected")
                process.exit(1)
            }
        }
        console.log("links remaining : " + urlsToVisit.length)
        console.log("checked links : " + checkedLinks.size)
        console.log("broken links : " + brokenLinks.size)
    }

    await browser.close();
    const endTime = Date.now();
    return {
        brokenLinks: brokenLinkReports,
        checkedLinks: checkedLinkReports,
        parents,
        timeElapsed: (endTime - startTime) / 1000,
    };
}


const link = "https://iiitranchi.ac.in"
scrape({
    startURL: link,
    maxParallel: 5,
}).then((res) => {
    const output = {
        summary: {
            totalChecked: res.checkedLinks.size,
            totalBroken: res.brokenLinks.size,
            timeElapsed: res.timeElapsed
        },
        brokenLinks: Array.from(res.brokenLinks.entries()).map(([url, data]) => data),
        checkedLinks: Array.from(res.checkedLinks.entries()).map(([url, data]) => data),
        parents: Array.from(res.parents.entries()).map(([url, parentUrls]) => ({
            url,
            foundOn: parentUrls
        }))
    };
    console.log(`Scraped ${output.summary.totalChecked} links in ${output.summary.timeElapsed}s`);
    console.log(`Found ${output.summary.totalBroken} broken links`);
    console.log('Results saved to scrape-results.json');
});