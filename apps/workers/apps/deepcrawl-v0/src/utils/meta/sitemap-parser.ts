export class SitemapParser {
  async parse(sitemapUrl: string): Promise<string[]> {
    try {
      const response = await fetch(sitemapUrl);
      if (!response.ok) {
        return [];
      }

      const content = await response.text();
      const urls: string[] = [];

      // Extract URLs from both XML sitemaps and sitemap indexes
      const urlMatches = content.match(/<loc>([^<]+)<\/loc>/g);
      if (urlMatches) {
        for (const match of urlMatches) {
          const url = match.replace(/<\/?loc>/g, '');
          urls.push(url);
        }
      }

      // If this is a sitemap index, recursively fetch all sub-sitemaps
      if (content.includes('<sitemapindex')) {
        const subSitemapUrls = urls.slice();
        urls.length = 0;

        for (const subSitemapUrl of subSitemapUrls) {
          const subUrls = await this.parse(subSitemapUrl);
          urls.push(...subUrls);
        }
      }

      return urls;
    } catch (error) {
      return [];
    }
  }
}
