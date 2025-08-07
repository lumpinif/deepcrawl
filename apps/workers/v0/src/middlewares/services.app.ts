import { createMiddleware } from 'hono/factory';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import type { AppBindings } from '@/lib/context';
import { LinkService } from '@/services/link/link.service';
import { ScrapeService } from '@/services/scrape/scrape.service';
import { nhmCustomTranslators, nhmTranslators } from '@/utils/markdown';

// Request-scoped service factory to prevent resource leaks in workerd
// This ensures proper IoContext lifecycle management while maintaining performance
function createRequestScopedServices() {
  const services = {
    scrapeService: new ScrapeService(),
    linkService: new LinkService(),
    markdownConverter: new NodeHtmlMarkdown(
      {}, // options
      nhmCustomTranslators, // customTransformers
      nhmTranslators, // customCodeBlockTranslators
    ),
  };

  return services;
}

export const servicesAppMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    // Create services per request to respect IoContext boundaries
    // This prevents resource leaks in production workerd
    const services = createRequestScopedServices();

    c.set('scrapeService', services.scrapeService);
    c.set('linkService', services.linkService);
    c.set('markdownConverter', services.markdownConverter);

    return next();
  },
);
