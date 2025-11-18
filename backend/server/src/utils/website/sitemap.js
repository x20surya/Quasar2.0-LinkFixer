import axios from "axios";
import { parseStringPromise } from "xml2js";

export async function parseSitemap(sitemapUrl) {
  try {
    // Fetch sitemap XML
    const { data: xml } = await axios.get(sitemapUrl, {
      timeout: 10000,
      headers: { "User-Agent": "LinkFixerBot/1.0" }
    });

    // Parse XML into JS object
    const result = await parseStringPromise(xml);

    let links = [];

    // If it's a normal sitemap: <urlset><url><loc>...</loc></url>
    if (result.urlset) {
      const urls = result.urlset.url || [];
      links = urls
        .map(entry => entry.loc?.[0])
        .filter(Boolean);
    }

    // If it's a sitemap index: <sitemapindex><sitemap><loc>...</loc></sitemap>
    if (result.sitemapindex) {
      const sitemaps = result.sitemapindex.sitemap || [];
      links = sitemaps
        .map(entry => entry.loc?.[0])
        .filter(Boolean);
    }

    return links;
  } catch (err) {
    console.error("Sitemap parse error:", err.message);
    return [];
  }
}
