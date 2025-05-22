import type { Readability } from '@mozilla/readability';
import type TurndownService from 'turndown';

/**
 * Global namespace containing interfaces for the Turndown library and the
 * GitHub Flavored Markdown plugin.
 *
 * @see https://github.com/mixmark-io/turndown
 * @see https://github.com/domchristie/turndown-plugin-gfm
 */
declare global {
  interface Window {
    TurndownService: {
      new (options?: TurndownService.Options): TurndownService;
    };
    turndownPluginGfm: {
      gfm: (service: TurndownService) => void;
    };
    Readability: typeof Readability;
  }
}
