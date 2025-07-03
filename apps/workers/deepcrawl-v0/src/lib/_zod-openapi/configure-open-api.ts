import { Scalar } from '@scalar/hono-api-reference';

import type { AppOpenAPI } from './types';

import packageJSON from '../../../package.json' with { type: 'json' };

// NOTE: Currently, it is not typed
export const openAPIObjectConfig = {
  openapi: '3.1.0',
  info: {
    version: packageJSON.version,
    title: 'DeepcrawlApp',
  },
  servers: [
    {
      // static url for openapi.yaml generation
      url: 'https://api.deepcrawl.dev',
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
      name: 'API Root',
      description: 'Root API endpoints and system information',
    },
    {
      name: 'Read Website',
      description: 'API endpoints for reading and extracting content from URLs',
    },
    {
      name: 'Extract Links',
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
};

export default function configureOpenAPI(app: AppOpenAPI) {
  app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
    'x-speakeasy-example': 'Bearer <YOUR_API_KEY_HERE>',
  });

  app.doc31('/openapi', (c) => ({
    ...openAPIObjectConfig,
    // override the servers url with the API_URL from the environment
    servers: [
      {
        url: (() => {
          try {
            return new URL(c.env.API_URL).toString();
          } catch {
            return new URL(`https://${c.env.API_URL}`).toString();
          }
        })(),
        description: 'Deepcrawl Official API server',
      },
    ],
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
