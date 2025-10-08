export const MAX_KIN_LIMIT = 30;
export const MAX_VISITED_URLS_LIMIT = 1000;

/**
 * @note DON'T USE THIS IN TYPES OR OPTIONS
 * @description These are global configurations for the service.
 */
export const _ENABLE_READ_CACHE = true as const;
export const _ENABLE_LINKS_CACHE = true as const;

export const DEFAULT_FETCH_TIMEOUT = 15000; // 15 seconds

export const PLATFORM_URLS = [
  // GitHub
  'https://github.com',
  'https://www.github.com',
  // Gist
  'https://gist.github.com',
  'https://www.gist.github.com',
  // GitLab
  'https://gitlab.com',
  'https://www.gitlab.com',
  // Bitbucket
  'https://bitbucket.org',
  'https://www.bitbucket.org',
  // Azure DevOps
  'https://dev.azure.com',
  'https://www.dev.azure.com',
  // Gitea
  'https://gitea.com',
  'https://www.gitea.com',
  // SourceForge
  'https://sourceforge.net',
  'https://www.sourceforge.net',
  // Google Code Archive (legacy)
  'https://code.google.com',
  // Notion (workspace/page)
  'https://www.notion.so',
  'https://notion.so',
  // Confluence Cloud
  'https://atlassian.net',
  // Add more as needed
] as const;

/**
 * Predefined safe headers for common scraping scenarios.
 */
export const COMMON_HEADERS = {
  /** Standard browser-like headers - mimics Chrome exactly */
  browserLike: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    DNT: '1',
    'Upgrade-Insecure-Requests': '1',
    'Sec-CH-UA':
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': '"Windows"',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    Priority: 'u=0, i',
  },

  /** Minimal bot headers */
  botFriendly: {
    'User-Agent': 'Deepcrawl-Bot/1.0 (+https://deepcrawl.dev)',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },

  /** Mobile browser headers */
  mobile: {
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
} as const;

export const MEDIA_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'],
  videos: ['.mp4', '.webm', '.ogg', '.mov', '.avi'],
  documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
} as const;

// Framework-specific patterns to filter out
export const FRAMEWORK_PATTERNS = [
  // Next.js
  '/_next/',
  // React
  '/static/js/',
  '/static/css/',
  '/static/media/',
  // Vue
  '/_nuxt/',
  // Angular
  '/assets/js/',
  '/assets/css/',
  // WordPress
  '/wp-content/',
  '/wp-includes/',
  '/wp-admin/',
  // Others
  '/_sites/',
  '/cdn-cgi/',
];

export const DEFAULT_METADATA_OPTIONS = {
  title: true,
  description: true,
  language: true,
  canonical: true,
  robots: true,
  author: true,
  keywords: true,
  favicon: true,
  openGraph: true,
  twitter: true,
} as const;

export const DEFAULT_HTML_REWRITER_OPTIONS = {
  extractMainContent: true,
  removeBase64Images: true,
} as const;

export const DEFAULT_CHEERIO_OPTIONS = {} as const;

export const DEFAULT_READER_OPTIONS = {} as const;

export const DEFAULT_READER_CLEANING_OPTIONS = {
  cheerioOptions: DEFAULT_CHEERIO_OPTIONS,
  readerOptions: DEFAULT_READER_OPTIONS,
} as const;

export const DEFAULT_FETCH_OPTIONS = {} as const;

export const DEFAULT_METRICS_OPTIONS = {
  enable: true,
} as const;

/** Markdown Converter */

export const DEFAULT_MARKDOWN_CONVERTER_OPTIONS = {
  preferNativeParser: false,
  codeFence: '```' as const,
  bulletMarker: '*' as const,
  codeBlockStyle: 'fenced' as const,
  emDelimiter: '_' as const,
  strongDelimiter: '**' as const,
  strikeDelimiter: '~~' as const,
  maxConsecutiveNewlines: 3,
  keepDataImages: false,
  useLinkReferenceDefinitions: false,
  useInlineLinks: true,
} as const;

export const DEFAULT_SCRAPE_OPTIONS = {
  metadata: true,
  cleanedHtml: false,
  robots: false,
  sitemapXML: false,
  metadataOptions: DEFAULT_METADATA_OPTIONS,
  markdownConverterOptions: DEFAULT_MARKDOWN_CONVERTER_OPTIONS,
  cleaningProcessor: 'cheerio-reader',
  htmlRewriterOptions: DEFAULT_HTML_REWRITER_OPTIONS,
  readerCleaningOptions: DEFAULT_READER_CLEANING_OPTIONS,
  fetchOptions: DEFAULT_FETCH_OPTIONS,
} as const;

/** Read  */

export const DEFAULT_CACHE_OPTIONS = {
  enabled: true,
  expirationTtl: 86400 * 4, // 4 days in seconds
} as const;

export const DEFAULT_READ_OPTIONS = {
  markdown: true,
  rawHtml: false,
  cacheOptions: DEFAULT_CACHE_OPTIONS,
  metricsOptions: DEFAULT_METRICS_OPTIONS,
  ...DEFAULT_SCRAPE_OPTIONS,
} as const;

export const DEFAULT_GET_MARKDOWN_OPTIONS = {
  cacheOptions: DEFAULT_CACHE_OPTIONS,
  cleaningProcessor: DEFAULT_READ_OPTIONS.cleaningProcessor,
  markdownConverterOptions: DEFAULT_MARKDOWN_CONVERTER_OPTIONS,
} as const;

/** Links  */

export const DEFAULT_LINK_EXTRACTION_OPTIONS = {
  includeExternal: false,
  includeMedia: false,
  removeQueryParams: true,
} as const;

/* BE CAREFUL: THESE ARE FLATTEND IN THE LINKSOPTIONS ROOT LEVEL INSTEAD OF A NESTED OBJECT */
export const DEFAULT_TREE_OPTIONS = {
  folderFirst: true,
  linksOrder: 'page',
  extractedLinks: true,
  subdomainAsRootUrl: true,
  isPlatformUrl: false,
} as const;

export const DEFAULT_LINKS_OPTIONS = {
  tree: true,
  linkExtractionOptions: DEFAULT_LINK_EXTRACTION_OPTIONS,
  cacheOptions: DEFAULT_CACHE_OPTIONS,
  metricsOptions: DEFAULT_METRICS_OPTIONS,
  ...DEFAULT_SCRAPE_OPTIONS,
  ...DEFAULT_TREE_OPTIONS,
} as const;

/* ------------------------- Logs ------------------------- */

export const GET_MANY_LOGS_DEFAULT_LIMIT = 5;
export const GET_MANY_LOGS_MAX_LIMIT = 100;
export const GET_MANY_LOGS_DEFAULT_OFFSET = 0;
export const GET_MANY_LOGS_DEFAULT_WINDOW_IN_DAYS = 2;
