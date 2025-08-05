export class SitemapParser {
  async parse(
    sitemapUrl: string,
    options?: { signal?: AbortSignal | null },
  ): Promise<{ urls: string[]; content: string | null }> {
    try {
      const response = await fetch(sitemapUrl, { signal: options?.signal });
      if (!response.ok) {
        return { urls: [], content: null };
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
          const subResult = await this.parse(subSitemapUrl, options);
          urls.push(...subResult.urls);
        }
      }

      return { urls, content };
    } catch (error) {
      return { urls: [], content: null };
    }
  }
}
