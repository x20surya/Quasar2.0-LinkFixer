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
  consumerTag: string | null
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
