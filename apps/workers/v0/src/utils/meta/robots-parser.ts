export class RobotsParser {
  async parse(
    baseUrl: string,
    options?: { signal?: AbortSignal },
  ): Promise<{
    sitemaps: string[];
    rules: { userAgent: string; allow: string[]; disallow: string[] }[];
    content: string | null;
  }> {
    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString();
      const response = await fetch(robotsUrl, { signal: options?.signal });

      if (!response.ok) {
        return { sitemaps: [], rules: [], content: null };
      }

      const content = await response.text();
      const lines = content.split('\n');

      const result = {
        sitemaps: [] as string[],
        rules: [] as {
          userAgent: string;
          allow: string[];
          disallow: string[];
        }[],
      };

      let currentRule = {
        userAgent: '',
        allow: [] as string[],
        disallow: [] as string[],
      };

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        const [directive, ...value] = trimmedLine
          .split(':')
          .map((s) => s.trim());
        const directiveLower = directive.toLowerCase();
        const valueCombined = value.join(':');

        if (directiveLower === 'user-agent') {
          if (
            currentRule.userAgent &&
            (currentRule.allow.length > 0 || currentRule.disallow.length > 0)
          ) {
            result.rules.push({ ...currentRule });
          }
          currentRule = {
            userAgent: valueCombined,
            allow: [],
            disallow: [],
          };
        } else if (directiveLower === 'allow') {
          currentRule.allow.push(valueCombined);
        } else if (directiveLower === 'disallow') {
          currentRule.disallow.push(valueCombined);
        } else if (directiveLower === 'sitemap') {
          result.sitemaps.push(valueCombined);
        }
      }

      if (
        currentRule.userAgent &&
        (currentRule.allow.length > 0 || currentRule.disallow.length > 0)
      ) {
        result.rules.push(currentRule);
      }

      return { ...result, content };
    } catch (error) {
      return { sitemaps: [], rules: [], content: null };
    }
  }
}
