import { smartboolTrue } from '@deepcrawl/types/common/smart-schemas';
import { z } from 'zod/v4';

/**
 * Schema for configuring metadata extraction options.
 * Controls which metadata fields should be extracted from a webpage.
 */
export const MetadataOptionsSchema = z
  .object({
    title: smartboolTrue().meta({
      description: 'Extract page title from title tag or meta title',
      examples: [true],
    }),
    description: smartboolTrue().meta({
      description: 'Extract meta description content',
      examples: [true],
    }),
    language: smartboolTrue().meta({
      description: 'Extract page language from html lang attribute',
      examples: [true],
    }),
    canonical: smartboolTrue().meta({
      description: 'Extract canonical URL from link rel="canonical"',
      examples: [true],
    }),
    robots: smartboolTrue().meta({
      description: 'Extract robots directives from meta robots',
      examples: [false],
    }),
    author: smartboolTrue().meta({
      description: 'Extract author information from meta author',
      examples: [true],
    }),
    keywords: smartboolTrue().meta({
      description: 'Extract meta keywords and convert to array',
      examples: [true],
    }),
    favicon: smartboolTrue().meta({
      description: 'Extract favicon URL from link rel="icon" or similar',
      examples: [true],
    }),
    openGraph: smartboolTrue().meta({
      description: 'Extract Open Graph metadata (og:* properties)',
      examples: [true],
    }),
    twitter: smartboolTrue().meta({
      description: 'Extract Twitter Card metadata (twitter:* properties)',
      examples: [false],
    }),
    isIframeAllowed: smartboolTrue().meta({
      description: 'Check if iframe embedding is allowed',
      examples: [true],
    }),
  })
  .meta({
    title: 'MetadataOptions',
    description: 'Schema for configuring metadata extraction options',
    examples: [
      {
        title: true,
        description: true,
        language: true,
        canonical: true,
        robots: false,
        author: true,
        keywords: true,
        favicon: true,
        openGraph: true,
        twitter: false,
        isIframeAllowed: true,
      },
    ],
  });

/**
 * Schema for page metadata extracted from a webpage.
 * Defines the structure and validation rules for all possible metadata fields.
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
      .string()
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
      .string()
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
 * Options for controlling which metadata fields should be extracted.
 * Each property is a boolean flag that enables or disables extraction of specific metadata.
 * All fields default to true if not specified.
 *
 * @property title - Extract page title from title tag or meta title
 * @property description - Extract meta description content
 * @property language - Extract page language from html lang attribute
 * @property canonical - Extract canonical URL from link rel="canonical"
 * @property robots - Extract robots directives from meta robots
 * @property author - Extract author information from meta author
 * @property keywords - Extract meta keywords and convert to array
 * @property favicon - Extract favicon URL from link rel="icon" or similar
 * @property openGraph - Extract Open Graph metadata (og:* properties)
 * @property twitter - Extract Twitter Card metadata (twitter:* properties)
 *
 * @example
 * ```typescript
 * const options: MetadataOptions = {
 *   title: true,
 *   description: true,
 *   language: true,
 *   canonical: true,
 *   robots: false,
 *   author: true,
 *   keywords: true,
 *   favicon: true,
 *   openGraph: true,
 *   twitter: false
 * };
 * ```
 */
export type MetadataOptions = z.infer<typeof MetadataOptionsSchema>;

/**
 * Represents all metadata that can be extracted from a webpage.
 * All fields are optional as they may not be present in every webpage.
 * The structure combines standard HTML metadata with social media metadata.
 *
 * @property title - Page title from title tag or meta title
 * @property description - Page description from meta description
 * @property language - Page language from html lang attribute
 * @property canonical - Canonical URL from link rel="canonical"
 * @property robots - Robots directives from meta robots
 * @property author - Author information from meta author
 * @property keywords - Keywords array from meta keywords
 * @property lastModified - Last modified date from HTTP headers
 * @property favicon - Favicon URL from link rel="icon" or similar
 * @property ogTitle - OpenGraph title from meta property="og:title"
 * @property ogDescription - OpenGraph description from meta property="og:description"
 * @property ogImage - OpenGraph image URL from meta property="og:image"
 * @property ogUrl - OpenGraph URL from meta property="og:url"
 * @property ogType - OpenGraph type from meta property="og:type"
 * @property ogSiteName - OpenGraph site name from meta property="og:site_name"
 * @property twitterCard - Twitter card type from meta name="twitter:card"
 * @property twitterSite - Twitter site username from meta name="twitter:site"
 * @property twitterCreator - Twitter creator username from meta name="twitter:creator"
 * @property twitterTitle - Twitter title from meta name="twitter:title"
 * @property twitterDescription - Twitter description from meta name="twitter:description"
 * @property twitterImage - Twitter image URL from meta name="twitter:image"
 *
 * @example
 * ```typescript
 * const metadata: PageMetadata = {
 *   title: "Example Website - Home Page",
 *   description: "This is an example website demonstrating metadata extraction.",
 *   language: "en",
 *   canonical: "https://example.com/",
 *   robots: "index, follow",
 *   author: "John Doe",
 *   keywords: ["example", "metadata", "extraction"],
 *   lastModified: "2023-04-15T14:32:21Z",
 *   favicon: "https://example.com/favicon.ico",
 *   ogTitle: "Example Website",
 *   ogDescription: "Learn about our services",
 *   ogImage: "https://example.com/images/og-image.jpg",
 *   ogUrl: "https://example.com/",
 *   ogType: "website",
 *   ogSiteName: "Example Website",
 *   twitterCard: "summary_large_image",
 *   twitterSite: "@examplesite",
 *   twitterCreator: "@johndoe",
 *   twitterTitle: "Example Website - Official Site",
 *   twitterDescription: "The best example website on the internet",
 *   twitterImage: "https://example.com/images/twitter-card.jpg"
 * };
 * ```
 */
export type PageMetadata = z.infer<typeof PageMetadataSchema>;
