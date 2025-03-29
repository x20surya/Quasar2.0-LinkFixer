import puppeteer from "puppeteer";
import {URL} from "url";

export  default async function scrape({startURL, authentication, maxPages = 3, API_KEY = ""}) {
    const startTime = Date.now();
    const browser = await puppeteer.launch({
        headless: "new", // Use the new headless mode
        args: ['--disable-setuid-sandbox', '--no-sandbox', '--disable-features=BlockInsecurePrivateNetworkRequests',
            '--disable-blink-features=AutomationControlled'
        ],
    });
    // console.log("Browser launched");
    // console.log("Start URL: ", startURL);
    // console.log("Authentication: ", authentication);
    // console.log("Max Pages: ", maxPages);
    // console.log("API Key: ", API_KEY);

    const startUrlParsed = new URL(startURL);
    const baseDomain = startUrlParsed.hostname;


    const urlsToVisit = [startURL];
    const visitedUrls = new Set();
    const brokenLinks = new Set();
    const checkedLinks = new Set();

    const start = await browser.newPage();
    await start.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'Upgrade-Insecure-Requests': '1',
        ...authentication ? { 'Authorization': `Bearer ${authentication}` } : {} // Add API key if provided 
      });
    await start.setViewport({ width: 1280, height: 800 });
    await start.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const res = await start.goto(startURL, { waitUntil: "networkidle2" });
    if (res.status() !== 200) {
        brokenLinks.add({link: startURL, status: res.status(), statusText: res.statusText()});
    }


    while (urlsToVisit.length > 0 && visitedUrls.size < maxPages) {
        
        const currentUrl = urlsToVisit.pop();
        if (visitedUrls.has(currentUrl)) {
            continue;
        }
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
            'Upgrade-Insecure-Requests': '1',
            ...authentication ? { 'Authorization': `Bearer ${authentication}` } : {}
          });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36');
        const res = await page.goto(currentUrl, { waitUntil: "networkidle2" });
        
        visitedUrls.add(currentUrl);
        checkedLinks.add({link :currentUrl ,status: res.status(), statusText: res.statusText()});
        try {
            await page.goto(currentUrl, { waitUntil: "networkidle2" });
        } catch (error) {
            continue;
        }

        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("a")).map(link => link.href);
        });

        for (const link of links) {
            if (!link || link.trim() === "") {
                console.error("Invalid or empty URL");
            }
            const parsedLink = new URL(link);
            if (checkedLinks.has(link)) {
                continue; 
            }
            try {
                const response = await page.goto(link, { waitUntil: 'networkidle2', timeout: 10000 });
                console.log(`Checking link: ${link}`);
                console.log(`Response status: ${response.status()}`);
                console.log(`Response status text: ${response.statusText()}`);
                if (response.status() !== 200) {
                    brokenLinks.add({link, status: response.status(), statusText: response.statusText()});
                }
                if (parsedLink.hostname === baseDomain) {
                    urlsToVisit.push(link);
                }
                checkedLinks.add({link, status: response.status(), statusText: response.statusText()});
                
            } catch (error) {
                console.error(`Error checking link ${link}:`, error.message);
                brokenLinks.add({link, error: error.message});
            }
        }
    }

    await browser.close();
    const endTime = Date.now();
    return {brokenLinks: Array.from(brokenLinks), visitedUrls: Array.from(visitedUrls), checkedLinks: Array.from(checkedLinks), timeElapsed : (endTime - startTime)/1000};
}

// const startURL = "https://example.com/"; 
// scrape({startURL, authentication :"1234567890", maxPages :10000}) 
//     .then(data => {
//         console.log("Scraping completed:", data);
//     })
//     .catch(error => {
//         console.error("Error during scraping:", error);
//     });
