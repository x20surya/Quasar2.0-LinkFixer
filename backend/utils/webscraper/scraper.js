import puppeteer from "puppeteer";
import { URL } from "url";

import { Redis } from '@upstash/redis'
const redis = new Redis({
  url: 'https://loving-stinkbug-23988.upstash.io',
  token: 'AV20AAIncDJkZTg2N2I0ZThiM2M0ZjljYWEwZWVhMWJmM2RjNzY2OXAyMjM5ODg',
})

async function checkLink(link, page) {
  try {

    if (/\.(pdf|jpg|jpeg|png|gif|svg|mp4|mp3|zip|docx?)$/i.test(link)) {
      const response = await fetch(link, { method: "GET" });
      if (response.ok) {
        return {
          url: link,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        };
      }}

      const res = await page.goto(link, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const result = {
        url: res.url(),
        status: res.status(),
        statusText: res.statusText(),
        ok: res.ok(),
      };
      return result;
    } catch (err) {
      return {
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

  export async function scrape({
    startURL,
    authentication,
    maxPages = 3,
    API_KEY = "",
  }) {
    console.log("--------------------scraper has started-----------------------------")
    const startTime = Date.now();

    // const browserCreateStartTime = Date.now()
    const browser = await puppeteer.launch({
      headless: "new", // Use the new headless mode
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--disable-features=BlockInsecurePrivateNetworkRequests",
        "--disable-blink-features=AutomationControlled",
        "--disable-http2"
      ],
    });
    // const browserCreateEndTime = Date.now()

    // console.log("Browser Create Time = " + (browserCreateEndTime - browserCreateStartTime)/ 1000 + " s")

    // console.log("Browser launched");
    // console.log("Start URL: ", startURL);
    // console.log("Authentication: ", authentication);
    // console.log("Max Pages: ", maxPages);
    // console.log("API Key: ", API_KEY);

    const startUrlParsed = new URL(startURL);
    const baseDomain = startUrlParsed.hostname;

    const urlsToVisit = [startURL];

    const visitedLinks = new Set();
    const brokenLinks = new Set()
    const checkedLinks = new Set()

    const visitedLinkReports = new Map();
    const brokenLinkReports = new Map();
    const checkedLinkReports = new Map();

    let maxConcurrentRequests = 5


    // const start = await createPage(browser, authentication)

    // const result = await start.goto(startURL, {
    //   waitUntil: "networkidle2",
    //   timeout: 60000,
    // });
    // if (!result.ok()) {
    //   brokenLinks.add(startURL)
    //   brokenLinkReports.set(startURL, ({
    //     link: startURL,
    //     status: result.status(),
    //     statusText: result.statusText(),
    //   }));
    // }

    const page = await createPage(browser, authentication)

    const externalLinkPages = await Promise.all(
      Array(maxConcurrentRequests).fill().map(() => createPage(browser, authentication))
    );

    while (urlsToVisit.length > 0 && visitedLinks.size < maxPages) {
      const currentUrl = urlsToVisit.pop();

      let concurrentPageIndex = 0

      if (visitedLinks.has(currentUrl)) {
        continue;
      }


      try {
        console.log("Fetching Page :: " + currentUrl)
        let res = await page.goto(currentUrl, { waitUntil: "networkidle2", timeout: 60000 });
        checkedLinks.add(currentUrl)
        checkedLinkReports.set(currentUrl, {
          link: currentUrl,
          status: res.status(),
          statusText: res.statusText(),
        });
        // console.log("Page Fetched Without issues")
      } catch (error) {
        continue;
      }

      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a")).map(
          (link) => link.href
        );
      });
      visitedLinks.add(currentUrl);
      visitedLinkReports.set(currentUrl, { link: currentUrl, child: links.length })
      // console.log("new page\n\n");
      // console.log(currentUrl);

      let externalLinkPromises = []

      for (const link of links) {
        if (!link || link.trim() === "") {
          // console.error("Invalid or empty URL");
        }
        if (!link.startsWith("http")) {
          continue;
        }
        if (link.endsWith("#")) {
          continue;
        }
        const parsedLink = new URL(link);
        if (checkedLinkReports.has(link)) {
          continue;
        }
        try {
          if (parsedLink.hostname === baseDomain) {
            // internal links will be visited later
            urlsToVisit.push(link);
            // console.log("Internal Detected : " + link)
            continue;
          }

          // visiting external links
          // console.log("Enternal Detected : " + link)
          externalLinkPromises.push(checkLink(link, externalLinkPages[concurrentPageIndex]))
          concurrentPageIndex = (concurrentPageIndex + 1) % maxConcurrentRequests
        } catch (error) {
          console.error(`Error checking link ${link}:`, error.message);
          brokenLinkReports.set(link, { link, error: error.message });
        }
      }
      // console.log("\n\n\nFetching External Links :::")

      const externalLinkResponses = [];

      for (let i = 0; i < externalLinkPromises.length; i += maxConcurrentRequests) {
        const batch = externalLinkPromises.slice(i, i + maxConcurrentRequests);
        const settled = await Promise.allSettled(batch);
        externalLinkResponses.push(...settled);
      }


      for (const result of externalLinkResponses) {
        if (result.status === "fulfilled") {
          const response = result.value;
          if (!response.ok) {
            brokenLinks.add(response.url)
            brokenLinkReports.set(response.url, {
              link: response.url,
              status: response.status,
              statusText: response.statusText,
              parent: currentUrl,
            });
          } else {
            visitedLinks.add(response.url)
            visitedLinkReports.set(response.url, {
              link: response.url,
              status: response.status,
              statusText: response.statusText,
              parent: currentUrl,
            });
          }
        } else {
          brokenLinks.add(result.reason?.url)
          brokenLinkReports.set(result.reason?.url || "unknown", {
            link: result.reason?.url || "unknown",
            error: result.reason?.message || "Network error",
            parent: currentUrl,
          });
        }
      }

    }

    await browser.close();
    const endTime = Date.now();
    return {
      brokenLinks: brokenLinkReports,
      visitedUrls: visitedLinkReports,
      checkedLinks: checkedLinkReports,
      timeElapsed: (endTime - startTime) / 1000,
    };
  }

  const startURL = "https://sail.co.in/";
  scrape({ startURL, maxPages: 1 })
    .then((data) => {
      console.log("Scraping completed:", data);
      process.exit(1)
    })
    .catch((error) => {
      console.error("Error during scraping:", error);
      process.exit(1)
    });

