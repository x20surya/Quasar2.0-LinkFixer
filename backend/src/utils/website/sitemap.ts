import axios from "axios"
import { parseStringPromise } from "xml2js"

// Parses a sitemap XML document and returns the discovered URLs.
export async function parseSitemap(sitemapUrl: string): Promise<string[]> {
  try {
    const { data: xml } = await axios.get<string>(sitemapUrl, {
      timeout: 10000,
      headers: { "User-Agent": "LinkFixerBot/1.0" },
    })

    const result = await parseStringPromise(xml)
    let links: string[] = []

    if (result.urlset) {
      const urls = result.urlset.url || []
      links = urls.map((entry: { loc?: string[] }) => entry.loc?.[0]).filter(Boolean)
    }

    if (result.sitemapindex) {
      const sitemaps = result.sitemapindex.sitemap || []
      links = sitemaps
        .map((entry: { loc?: string[] }) => entry.loc?.[0])
        .filter(Boolean)
    }

    return links
  } catch (error: any) {
    console.error("Sitemap parse error:", error.message)
    return []
  }
}