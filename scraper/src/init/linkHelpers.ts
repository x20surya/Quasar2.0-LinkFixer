import { URL } from "url"
import type { Browser, Page } from "puppeteer"
import { config } from "../config/index.js"
import type { CheckLinkResult, VisitLinkResult } from "./types.js"

// Checks a link and returns its response metadata.
export async function checkLink(link: string, page: Page): Promise<CheckLinkResult> {
  try {
    if (/\.(pdf|jpg|jpeg|png|gif|svg|mp4|mp3|zip|docx?)$/i.test(link)) {
      const response = await fetch(link, { method: "GET" })
      if (response.ok) {
        return {
          content: "file",
          url: link,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        }
      }
    }

    const res = await page.goto(link, {
      waitUntil: "networkidle2",
      timeout: 30000,
    })

    if (!res) {
      return {
        content: "site",
        url: link,
        status: 0,
        statusText: "Navigation returned no response",
        ok: false,
      }
    }

    return {
      redirectedTo: res.url(),
      content: "site",
      url: link,
      status: res.status(),
      statusText: res.statusText(),
      ok: res.ok(),
    }
  } catch (err: any) {
    console.log(`[${config.ID}] :: checkLink Failed Link : `, link)
    return {
      content: "site",
      url: link,
      status: 0,
      statusText: err.message,
      ok: false,
    }
  }
}

// Creates a preconfigured Puppeteer page.
export async function createPage(browser: Browser, authentication?: string) {
  const page = await browser.newPage()
  await Promise.all([
    page.setViewport({ width: 1280, height: 800 }),
    page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.google.com/",
      "Upgrade-Insecure-Requests": "1",
      ...(authentication ? { Authorization: `Bearer ${authentication}` } : {}),
    }),
    page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36",
    ),
  ])
  return page
}

// Visits a link and collects any same-domain URLs found on the page.
export async function visitLink(
  link: string,
  page: Page,
  baseDomain: string,
): Promise<VisitLinkResult> {
  console.log(`[${config.ID}] :: Fetching Page :: ` + link)
  const res = await checkLink(link, page)
  const parsedLink = new URL(link)

  if (parsedLink.hostname !== baseDomain) {
    console.log(`[${config.ID}] :: External Link : `, link)
    if (!res.ok) {
      console.log(`[${config.ID}] :: Link failed : `, link)
    }
    return { ...res, type: "external" }
  }

  if (!res.ok) {
    console.log(`[${config.ID}] :: Link failed : `, link)
    return { ...res, type: "internal" }
  }

  if (res.content === "file") {
    return { ...res, type: "internal" }
  }

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a")).map((link) => link.href)
  })

  const urlsToVisit: string[] = []
  for (const candidate of links) {
    if (!candidate || candidate.trim() === "") {
      continue
    }
    if (!candidate.startsWith("http")) {
      continue
    }
    if (candidate.endsWith("#")) {
      continue
    }
    urlsToVisit.push(candidate)
  }

  return { ...res, urlsToVisit, type: "internal" }
}
