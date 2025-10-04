import { OptionalBoolWithDefault } from '@deepcrawl/types/common/shared-schemas';
import { DEFAULT_METADATA_OPTIONS } from '@deepcrawl/types/configs';
import { z } from 'zod/v4';

const {
  title,
  description,
  language,
  canonical,
  robots,
  author,
  keywords,
  favicon,
  openGraph,
  twitter,
} = DEFAULT_METADATA_OPTIONS;

/**
 * Schema for configuring metadata extraction options.
 * Controls which metadata fields should be extracted from a webpage.
 *
 * @property {boolean} [title] - Extract page title from title tag or meta title
 * @property {boolean} [description] - Extract meta description content
 * @property {boolean} [language] - Extract page language from html lang attribute
 * @property {boolean} [canonical] - Extract canonical URL from link rel="canonical"
 * @property {boolean} [robots] - Extract robots directives from meta robots
 * @property {boolean} [author] - Extract author information from meta author
 * @property {boolean} [keywords] - Extract meta keywords and convert to array
 * @property {boolean} [favicon] - Extract favicon URL from link rel="icon" or similar
 * @property {boolean} [openGraph] - Extract Open Graph metadata (og:* properties)
 * @property {boolean} [twitter] - Extract Twitter Card metadata (twitter:* properties)
 *
 * @example
 * ```typescript
 * const options: MetadataOptions = {
 *   title: true,
 *   description: true,
 *   openGraph: true,
 *   twitter: false,
 *   keywords: true
 * };
 * ```
 */
export const MetadataOptionsSchema = z
  .object({
    title: OptionalBoolWithDefault(title).meta({
      description: 'Extract page title from title tag or meta title',
      default: title,
      examples: [title, !title],
    }),
    description: OptionalBoolWithDefault(description).meta({
      description: 'Extract meta description content',
      default: description,
      examples: [description, !description],
    }),
    language: OptionalBoolWithDefault(language).meta({
      description: 'Extract page language from html lang attribute',
      default: language,
      examples: [language, !language],
    }),
    canonical: OptionalBoolWithDefault(canonical).meta({
      description: 'Extract canonical URL from link rel="canonical"',
      default: canonical,
      examples: [canonical, !canonical],
    }),
    robots: OptionalBoolWithDefault(robots).meta({
      description: 'Extract robots directives from meta robots',
      default: robots,
      examples: [robots, !robots],
    }),
    author: OptionalBoolWithDefault(author).meta({
      description: 'Extract author information from meta author',
      default: author,
      examples: [author, !author],
    }),
    keywords: OptionalBoolWithDefault(keywords).meta({
      description: 'Extract meta keywords and convert to array',
      default: keywords,
      examples: [keywords, !keywords],
    }),
    favicon: OptionalBoolWithDefault(favicon).meta({
      description: 'Extract favicon URL from link rel="icon" or similar',
      default: favicon,
      examples: [favicon, !favicon],
    }),
    openGraph: OptionalBoolWithDefault(openGraph).meta({
      description: 'Extract Open Graph metadata (og:* properties)',
      default: openGraph,
      examples: [openGraph, !openGraph],
    }),
    twitter: OptionalBoolWithDefault(twitter).meta({
      description: 'Extract Twitter Card metadata (twitter:* properties)',
      default: twitter,
      examples: [twitter, !twitter],
    }),
  })
  .default(DEFAULT_METADATA_OPTIONS)
  .meta({
    title: 'MetadataOptions',
    description: 'Schema for configuring metadata extraction options',
    default: DEFAULT_METADATA_OPTIONS,
    examples: [
      {
        title,
        description,
        language,
        canonical,
        robots,
        author,
        keywords,
        favicon,
        openGraph,
        twitter,
      },
    ],
  });

/**
 * Type representing options for controlling metadata extraction.
 * Each property is a boolean flag that enables or disables extraction of specific metadata fields.
 * All fields default to true if not specified.
 *
 * @property {boolean} [title] - Extract page title from title tag or meta title
 * @property {boolean} [description] - Extract meta description content
 * @property {boolean} [language] - Extract page language from html lang attribute
 * @property {boolean} [canonical] - Extract canonical URL from link rel="canonical"
 * @property {boolean} [robots] - Extract robots directives from meta robots
 * @property {boolean} [author] - Extract author information from meta author
 * @property {boolean} [keywords] - Extract meta keywords and convert to array
 * @property {boolean} [favicon] - Extract favicon URL from link rel="icon" or similar
 * @property {boolean} [openGraph] - Extract Open Graph metadata (og:* properties)
 * @property {boolean} [twitter] - Extract Twitter Card metadata (twitter:* properties)
 *
 * @example
 * ```typescript
 * const options: MetadataOptions = {
 *   title: true,
 *   description: true,
 *   openGraph: true,
 *   twitter: false,
 *   keywords: true
 * };
 * ```
 *
 * @description This is the output type for the `MetadataOptions` schema.
 * If you wish to use this type as input which contains both string and boolean for smartbool, you can use the Input types re-exported from the `@deepcrawl/contracts` package for each endpoint such as `ReadUrlOptions['metadataOptions']`.
 */
export type MetadataOptions = z.infer<typeof MetadataOptionsSchema>;

// @DEPRECATED AS WE REMOVED SMARTBOOL
// /**
//  * @description This is the input type for the `MetadataOptions` schema.
//  * This is a standalone export type that can be used as input which contains both string and boolean for smartbool.
//  */
// export type MetadataOptionsInput = z.input<typeof MetadataOptionsSchema>;

/**
 * Schema for page metadata extracted from a webpage.
 * Defines the structure and validation rules for all possible metadata fields.
 *
 * @property {string} [title] - Page title from title tag or meta title
 * @property {string} [description] - Page description from meta description
 * @property {string} [language] - Page language from html lang attribute
 * @property {string} [canonical] - Canonical URL from link rel="canonical"
 * @property {string} [robots] - Robots directives from meta robots
 * @property {string} [author] - Author information from meta author
 * @property {string[]} [keywords] - Keywords array from meta keywords
 * @property {string} [lastModified] - Last modified date from HTTP headers
 * @property {string} [favicon] - Favicon URL from link rel="icon"
 * @property {string} [ogTitle] - OpenGraph title
 * @property {string} [ogDescription] - OpenGraph description
 * @property {string} [ogImage] - OpenGraph image URL
 * @property {string} [ogUrl] - OpenGraph URL
 * @property {string} [ogType] - OpenGraph type
 * @property {string} [ogSiteName] - OpenGraph site name
 * @property {string} [twitterCard] - Twitter card type
 * @property {string} [twitterSite] - Twitter site username
 * @property {string} [twitterCreator] - Twitter creator username
 * @property {string} [twitterTitle] - Twitter title
 * @property {string} [twitterDescription] - Twitter description
 * @property {string} [twitterImage] - Twitter image URL
 * @property {boolean} [isIframeAllowed] - Whether iframe embedding is allowed
 *
 * @example
 * ```typescript
 * const metadata: PageMetadata = {
 *   title: "Example Website - Home Page",
 *   description: "This is an example website",
 *   language: "en",
 *   canonical: "https://example.com/",
 *   keywords: ["example", "metadata"],
 *   ogTitle: "Example Website",
 *   twitterCard: "summary_large_image"
 * };
 * ```
 */
export const PageMetadataSchema = z
  .object({
    // Basic metadata
    title: z
      .string()
      .optional()
      .meta({
        description: 'Page title from title tag or meta title',
        examples: ['Example Website - Home Page'],
      }),
    description: z
      .string()
      .optional()
      .meta({
        description: 'Page description from meta description',
        examples: [
          'This is an example website demonstrating metadata extraction.',
        ],
      }),
    language: z
      .string()
      .optional()
      .meta({
        description: 'Page language from html lang attribute',
        examples: ['en'],
      }),
    canonical: z
      .url()
      .optional()
      .meta({
        description: 'Canonical URL from link rel="canonical"',
        examples: ['https://example.com/'],
      }),
    robots: z
      .string()
      .optional()
      .meta({
        description: 'Robots directives from meta robots',
        examples: ['index, follow'],
      }),
    author: z
      .string()
      .optional()
      .meta({
        description: 'Author information from meta author',
        examples: ['John Doe'],
      }),
    keywords: z
      .array(z.string())
      .optional()
      .meta({
        description: 'Keywords array from meta keywords',
        examples: ['example', 'metadata', 'extraction'],
      }),
    lastModified: z
      .string()
      .optional()
      .nullable()
      .meta({
        description: 'Last modified date from HTTP headers',
        examples: ['2023-04-15T14:32:21Z'],
      }),
    favicon: z
      .url()
      .optional()
      .meta({
        description: 'Favicon URL from link rel="icon" or similar',
        examples: ['https://example.com/favicon.ico'],
      }),

    // OpenGraph metadata (flattened)
    ogTitle: z
      .string()
      .optional()
      .meta({
        description: 'OpenGraph title from meta property="og:title"',
        examples: ['Example Website'],
      }),
    ogDescription: z
      .string()
      .optional()
      .meta({
        description:
          'OpenGraph description from meta property="og:description"',
        examples: ['Learn about our services'],
      }),
    ogImage: z
      .url()
      .optional()
      .meta({
        description: 'OpenGraph image URL from meta property="og:image"',
        examples: ['https://example.com/images/og-image.jpg'],
      }),
    ogUrl: z
      .url()
      .optional()
      .meta({
        description: 'OpenGraph URL from meta property="og:url"',
        examples: ['https://example.com/'],
      }),
    ogType: z
      .string()
      .optional()
      .meta({
        description: 'OpenGraph type from meta property="og:type"',
        examples: ['website'],
      }),
    ogSiteName: z
      .string()
      .optional()
      .meta({
        description: 'OpenGraph site name from meta property="og:site_name"',
        examples: ['Example Website'],
      }),

    // Twitter Card metadata (flattened)
    twitterCard: z
      .string()
      .optional()
      .meta({
        description: 'Twitter card type from meta name="twitter:card"',
        examples: ['summary_large_image'],
      }),
    twitterSite: z
      .string()
      .optional()
      .meta({
        description: 'Twitter site username from meta name="twitter:site"',
        examples: ['@examplesite'],
      }),
    twitterCreator: z
      .string()
      .optional()
      .meta({
        description:
          'Twitter creator username from meta name="twitter:creator"',
        examples: ['@johndoe'],
      }),
    twitterTitle: z
      .string()
      .optional()
      .meta({
        description: 'Twitter title from meta name="twitter:title"',
        examples: ['Example Website - Official Site'],
      }),
    twitterDescription: z
      .string()
      .optional()
      .meta({
        description: 'Twitter description from meta name="twitter:description"',
        examples: ['The best example website on the internet'],
      }),
    twitterImage: z
      .url()
      .optional()
      .meta({
        description: 'Twitter image URL from meta name="twitter:image"',
        examples: ['https://example.com/images/twitter-card.jpg'],
      }),

    // Additional metadata
    isIframeAllowed: z
      .boolean()
      .optional()
      .meta({
        description: 'Whether iframe embedding is allowed',
        examples: [true],
      }),
  })
  .meta({
    title: 'PageMetadata',
    description: 'Schema for page metadata extracted from a webpage',
    examples: [
      {
        title: 'Example Website - Home Page',
        description:
          'This is an example website demonstrating metadata extraction.',
        language: 'en',
        canonical: 'https://example.com/',
        robots: 'index, follow',
        author: 'John Doe',
        keywords: ['example', 'metadata', 'extraction'],
        lastModified: '2023-04-15T14:32:21Z',
        favicon: 'https://example.com/favicon.ico',
        ogTitle: 'Example Website',
        ogDescription: 'Learn about our services',
        ogImage: 'https://example.com/images/og-image.jpg',
        ogUrl: 'https://example.com/',
        ogType: 'website',
        ogSiteName: 'Example Website',
        twitterCard: 'summary_large_image',
        twitterSite: '@examplesite',
        twitterCreator: '@johndoe',
        twitterTitle: 'Example Website - Official Site',
        twitterDescription: 'The best example website on the internet',
        twitterImage: 'https://example.com/images/twitter-card.jpg',
        isIframeAllowed: true,
      },
    ],
  });

/**
 * Type representing all metadata that can be extracted from a webpage.
 * All fields are optional as they may not be present in every webpage.
 * The structure combines standard HTML metadata with social media metadata.
 *
 * @property {string} [title] - Page title from title tag or meta title
 * @property {string} [description] - Page description from meta description
 * @property {string} [language] - Page language from html lang attribute
 * @property {string} [canonical] - Canonical URL from link rel="canonical"
 * @property {string} [robots] - Robots directives from meta robots
 * @property {string} [author] - Author information from meta author
 * @property {string[]} [keywords] - Keywords array from meta keywords
 * @property {string} [lastModified] - Last modified date from HTTP headers
 * @property {string} [favicon] - Favicon URL from link rel="icon"
 * @property {string} [ogTitle] - OpenGraph title
 * @property {string} [ogDescription] - OpenGraph description
 * @property {string} [ogImage] - OpenGraph image URL
 * @property {string} [ogUrl] - OpenGraph URL
 * @property {string} [ogType] - OpenGraph type
 * @property {string} [ogSiteName] - OpenGraph site name
 * @property {string} [twitterCard] - Twitter card type
 * @property {string} [twitterSite] - Twitter site username
 * @property {string} [twitterCreator] - Twitter creator username
 * @property {string} [twitterTitle] - Twitter title
 * @property {string} [twitterDescription] - Twitter description
 * @property {string} [twitterImage] - Twitter image URL
 * @property {boolean} [isIframeAllowed] - Whether iframe embedding is allowed
 *
 * @example
 * ```typescript
 * const metadata: PageMetadata = {
 *   title: "Example Website - Home Page",
 *   description: "This is an example website",
 *   language: "en",
 *   canonical: "https://example.com/",
 *   keywords: ["example", "metadata"],
 *   ogTitle: "Example Website",
 *   twitterCard: "summary_large_image"
 * };
 * ```
 */
export type PageMetadata = z.infer<typeof PageMetadataSchema>;
