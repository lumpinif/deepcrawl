import { Scalar } from '@scalar/hono-api-reference';

import type { AppOpenAPI } from './types';

import { isProduction } from '@/utils/worker-env';
import packageJSON from '../../package.json' with { type: 'json' };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
  });

  app.doc31('/openapi', (c) => ({
    openapi: '3.1.0',
    info: {
      version: packageJSON.version,
      title: 'Deepcrawl OpenAPI',
    },
    servers: [
      {
        url: isProduction(c)
          ? new URL(c.req.url).origin
          : 'http://127.0.0.1:8787',
        description: 'Deepcrawl Official API server',
      },
    ],
    security: [
      {
        Bearer: [],
      },
    ],
    tags: [
      {
        name: 'Deepcrawl API Root',
        description: 'Root API endpoints',
      },
      {
        name: 'Deepcrawl Read URL API',
        description:
          'API endpoints for reading and extracting content from URLs',
      },
      {
        name: 'Deepcrawl Links Extractor API',
        description: 'API endpoints for extracting links and building sitemaps',
      },
    ],
    'x-speakeasy-retries': {
      strategy: 'backoff',
      backoff: {
        initialInterval: 500,
        maxInterval: 60000,
        maxElapsedTime: 3600000,
        exponent: 1.5,
      },
      statusCodes: ['5XX'],
      retryConnectionErrors: true,
    },
  }));

  app.get(
    '/reference',
    Scalar({
      url: '/openapi',
      theme: 'default',
      layout: 'modern',
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
    }),
  );
}
