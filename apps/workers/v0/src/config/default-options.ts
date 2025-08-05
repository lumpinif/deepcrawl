import {
  HTMLRewriterOptionsSchema,
  LinkExtractionOptionsSchema,
  MetadataOptionsSchema,
} from '@deepcrawl/types/index';

// Disable read cache for now
export const ENABLE_READ_CACHE = false as const;

// Default markdown options (manual)
export const DEFAULT_MARKDOWN_OPTIONS = {
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  preformattedCode: true,
  fence: '```',
};

// Default metadata options (manual)
// export const DEFAULT_METADATA_OPTIONS: MetadataOptions = {
//   title: true,
//   description: true,
//   language: true,
//   canonical: true,
//   robots: true,
//   author: true,
//   keywords: true,
//   favicon: true,
//   openGraph: true,
//   twitter: true,
//   isIframeAllowed: true,
// };

export const DEFAULT_METADATA_OPTIONS = MetadataOptionsSchema.parse({});

// export const DEFAULT_LINK_OPTIONS: LinkExtractionOptions = {
//   includeExternal: true,
//   includeMedia: true,
//   removeQueryParams: true,
// };

export const DEFAULT_LINK_OPTIONS = LinkExtractionOptionsSchema.parse({});

// export const DEFAULT_HTMLCLEANING_OPTIONS: HTMLRewriterOptionsSchema = {
//   extractMainContent: true,
//   removeBase64Images: true,
// };

export const DEFAULT_HTMLCLEANING_OPTIONS = HTMLRewriterOptionsSchema.parse({});
