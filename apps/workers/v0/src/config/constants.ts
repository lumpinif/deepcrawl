export const MAX_KIN_LIMIT = 30;
export const MAX_VISITED_URLS_LIMIT = 1000;
export const DEFAULT_KV_CACHE_EXPIRATION_TTL = 86400 * 1; // 1 day

// CACHE GLOBAL CONFIGURATIONS
export const ENABLE_READ_CACHE = true as const;
export const ENABLE_LINKS_CACHE = true as const;

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
