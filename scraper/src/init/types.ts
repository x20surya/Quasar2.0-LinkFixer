import type { Browser, Page } from "puppeteer"

export type DomainAssignment = {
  domain: string
  linkQueue: string
  authentication?: string
  maxPages?: number
  limit?: number
}


export type TimerHandle = ReturnType<typeof setTimeout>

export type CrawlSession = {
  domain: string
  linkQueue: string
  authentication: string | undefined
  maxPages: number
  limit: number | undefined
  startTime: number
  checkedLinksKey: string
  pauseStatusKey: string
  browser: Browser
  pages: Page[]
  checkedLinks: Set<string>
  baseDomain?: string
  hasCleaned: boolean
  isPaused: boolean
  pauseTimeStart: number
  totalPauseTime: number
  setPauseTimeout: TimerHandle | null
  pauseStatusTimeout: TimerHandle | null
  consumerTag: string | null,
  utilities: typeof SCRAPER_UTILITIES[number][]
}

export type CheckLinkResult = {
  content: "site" | "file"
  url: string
  status: number
  statusText: string
  ok: boolean
  redirectedTo?: string
}

export type VisitLinkResult = CheckLinkResult & {
  type: "internal" | "external"
  urlsToVisit?: string[]
}

export type LinkMessage = {
  link?: string
  depth?: number
}

export type LinkRecord = {
  url?: string
  redirectedTo?: string
  content?: string
  status?: number
  statusText?: string
  timestamp: number
}

/**
 * visit : visit a page and check for dead links(internal and external)
 * eval_metadata : visit a page and check validity of metadata for a page using AI LLM parser
 * eval_schema : visit a page and check validity of metadata for a page using AI LLM parser
 * response_time : visit a page and record the response_times for the page, to five a value for the frontend latencies
 */
export const SCRAPER_UTILITIES = ["visit", "eval_metadata", "eval_schema", "response_time"] as const
