import { smartboolOptional } from '@deepcrawl/types/common/smart-schemas';
import { z } from 'zod/v4';

/**
 * Schema for configuring link extraction behavior.
 * Defines validation rules for controlling how links are extracted from HTML.
 */
export const LinkExtractionOptionsSchema = z
  .object({
    includeExternal: smartboolOptional().meta({
      description: 'Whether to include links from other domains',
      examples: [false],
    }),
    includeMedia: smartboolOptional().meta({
      description: 'Whether to include media files (images, videos, docs)',
      examples: [true],
    }),
    excludePatterns: z
      .array(z.string())
      .optional()
      .meta({
        description: 'Array of regex patterns to exclude URLs',
        examples: [['^/admin/', '\\.pdf$', '/private/']],
      }),
    removeQueryParams: smartboolOptional().meta({
      description: 'Whether to remove query parameters from URLs',
      examples: [true],
    }),
  })
  .strict()
  .meta({
    title: 'LinkExtractionOptions',
    description: 'Schema for configuring link extraction behavior',
    examples: [
      {
        includeExternal: false,
        includeMedia: true,
        excludePatterns: ['^/admin/', '\\.pdf$', '/private/'],
        removeQueryParams: true,
      },
    ],
  });

/**
 * Schema for storing extracted links by category.
 * Defines the structure for organizing links extracted from a webpage.
 */
export const ExtractedLinksSchema = z
  .object({
    internal: z
      .array(z.string())
      .optional()
      .meta({
        description: 'Array of internal links from the same domain',
        examples: [
          'https://example.com/about',
          'https://example.com/contact',
          'https://example.com/services',
        ],
      }),
    external: z
      .array(z.string())
      .optional()
      .meta({
        description: 'Array of external links from other domains',
        examples: [
          'https://github.com/example/repo',
          'https://twitter.com/example',
          'https://linkedin.com/company/example',
        ],
      }),
    media: z
      .object({
        images: z
          .array(z.string())
          .optional()
          .meta({
            description: 'Array of image file URLs',
            examples: [
              'https://example.com/images/logo.png',
              'https://example.com/images/banner.jpg',
            ],
          }),
        videos: z
          .array(z.string())
          .optional()
          .meta({
            description: 'Array of video file URLs',
            examples: [
              'https://example.com/videos/intro.mp4',
              'https://example.com/videos/demo.webm',
            ],
          }),
        documents: z
          .array(z.string())
          .optional()
          .meta({
            description: 'Array of document file URLs',
            examples: [
              'https://example.com/docs/whitepaper.pdf',
              'https://example.com/docs/manual.docx',
            ],
          }),
      })
      .optional()
      .meta({
        description: 'Media files categorized by type',
      }),
  })
  .meta({
    title: 'ExtractedLinks',
    description: 'Schema for storing extracted links by category',
    examples: [
      {
        internal: [
          'https://example.com/about',
          'https://example.com/contact',
          'https://example.com/services',
        ],
        external: [
          'https://github.com/example/repo',
          'https://twitter.com/example',
          'https://linkedin.com/company/example',
        ],
        media: {
          images: [
            'https://example.com/images/logo.png',
            'https://example.com/images/banner.jpg',
          ],
          videos: [
            'https://example.com/videos/intro.mp4',
            'https://example.com/videos/demo.webm',
          ],
          documents: [
            'https://example.com/docs/whitepaper.pdf',
            'https://example.com/docs/manual.docx',
          ],
        },
      },
    ],
  });

/**
 * Configuration options for link extraction behavior.
 * Controls which types of links are extracted and how they are processed.
 *
 * @property includeExternal - Whether to include links from other domains
 * @property includeMedia - Whether to include media files (images, videos, docs)
 * @property excludePatterns - List of regex patterns to exclude URLs
 * @property removeQueryParams - Whether to remove query parameters from URLs
 *
 * @example
 * ```typescript
 * const options: LinkExtractionOptions = {
 *   includeExternal: false,
 *   includeMedia: true,
 *   excludePatterns: ['^/admin/', '\\.pdf$'],
 *   removeQueryParams: true
 * };
 * ```
 */
export type LinkExtractionOptions = z.infer<typeof LinkExtractionOptionsSchema>;

/**
 * Structure containing extracted links categorized by type.
 * Organizes links extracted from a webpage into logical groups.
 *
 * @property internal - Array of links from the same domain
 * @property external - Array of links from other domains
 * @property media - Object containing arrays of media links categorized by type
 * @property media.images - Array of image file URLs
 * @property media.videos - Array of video file URLs
 * @property media.documents - Array of document file URLs
 *
 * @example
 * ```typescript
 * const links: ExtractedLinks = {
 *   internal: [
 *     'https://example.com/about',
 *     'https://example.com/contact'
 *   ],
 *   external: [
 *     'https://othersite.com/reference',
 *     'https://api.example.org/data'
 *   ],
 *   media: {
 *     images: [
 *       'https://example.com/images/logo.png',
 *       'https://example.com/images/banner.jpg'
 *     ],
 *     videos: [
 *       'https://example.com/videos/intro.mp4'
 *     ],
 *     documents: [
 *       'https://example.com/docs/whitepaper.pdf'
 *     ]
 *   }
 * };
 * ```
 */
export type ExtractedLinks = z.infer<typeof ExtractedLinksSchema>;
