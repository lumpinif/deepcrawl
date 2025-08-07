import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';
import { ScrapeService } from '@/services/scrape/scrape.service';

// Request-scoped service factory to prevent resource leaks in workerd
// This ensures proper IoContext lifecycle management while maintaining performance
// Only creates scrapeService (used by all endpoints) - other services created on-demand
function createRequestScopedServices() {
  const services = {
    scrapeService: new ScrapeService(),
  };

  return services;
}

export const servicesAppMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    // Create services per request to respect IoContext boundaries
    // This prevents resource leaks in production workerd
    const services = createRequestScopedServices();

    c.set('scrapeService', services.scrapeService);

    return next();
  },
);
