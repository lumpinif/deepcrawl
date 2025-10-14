import { DEFAULT_LINK_EXTRACTION_OPTIONS } from '@deepcrawl/types/configs';
import { OptionalBoolWithDefault } from '@deepcrawl/types/utils';
import { z } from 'zod/v4';

const { includeExternal, includeMedia, removeQueryParams } =
  DEFAULT_LINK_EXTRACTION_OPTIONS;
/**
 * Schema for configuring link extraction behavior.
 * Defines validation rules for controlling how links are extracted from HTML.
 *
 * @property {boolean} [includeExternal] - Whether to include links from other domains
 * @property {boolean} [includeMedia] - Whether to include media files (images, videos, docs)
 * @property {string[]} [excludePatterns] - Array of regex patterns to exclude URLs
 * @property {boolean} [removeQueryParams] - Whether to remove query parameters from URLs
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
export const LinkExtractionOptionsSchema = z
  .object({
    includeExternal: OptionalBoolWithDefault(includeExternal).meta({
      description: `Whether to include links from other domains. Default: ${includeExternal}`,
      default: includeExternal,
      examples: [includeExternal, !includeExternal],
    }),
    includeMedia: OptionalBoolWithDefault(includeMedia).meta({
      description: `Whether to include media files (images, videos, docs). Default: ${includeMedia}`,
      default: includeMedia,
      examples: [includeMedia, !includeMedia],
    }),
    excludePatterns: z
      .array(z.string())
      .optional()
      .meta({
        description: 'Array of regex patterns to exclude URLs',
        examples: [['^/admin/', '\\.pdf$', '/private/']],
      }),
    removeQueryParams: OptionalBoolWithDefault(removeQueryParams).meta({
      description: `Whether to remove query parameters from URLs. Default: ${removeQueryParams}`,
      default: removeQueryParams,
      examples: [removeQueryParams, !removeQueryParams],
    }),
  })
  .default(DEFAULT_LINK_EXTRACTION_OPTIONS)
  .meta({
    title: 'LinkExtractionOptions',
    description: 'Schema for configuring link extraction behavior',
    default: DEFAULT_LINK_EXTRACTION_OPTIONS,
    examples: [
      {
        excludePatterns: ['^/admin/', '\\.pdf$', '/private/'],
        ...DEFAULT_LINK_EXTRACTION_OPTIONS,
      },
    ],
  });

/**
 * Schema for storing extracted links categorized by type.
 * Defines the structure for organizing links extracted from a webpage.
 *
 * @property {string[]} [internal] - Array of internal links from the same domain
 * @property {string[]} [external] - Array of external links from other domains
 * @property {object} [media] - Media files categorized by type
 * @property {string[]} [media.images] - Array of image file URLs
 * @property {string[]} [media.videos] - Array of video file URLs
 * @property {string[]} [media.documents] - Array of document file URLs
 *
 * @example
 * ```typescript
 * const links: ExtractedLinks = {
 *   internal: [
 *     'https://example.com/about',
 *     'https://example.com/contact'
 *   ],
 *   external: [
 *     'https://github.com/example/repo',
 *     'https://twitter.com/example'
 *   ],
 *   media: {
 *     images: ['https://example.com/images/logo.png'],
 *     videos: ['https://example.com/videos/intro.mp4'],
 *     documents: ['https://example.com/docs/whitepaper.pdf']
 *   }
 * };
 * ```
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
