import { writeFileSync } from 'node:fs';
import * as yaml from 'js-yaml';
import configureOpenAPI, { openAPIObjectConfig } from './configure-open-api';
import createApp from './create-hono-app';

import linksRouter from '../routers/links/links.routes';
import readRouter from '../routers/read/read.routes';
import root from '../routers/root/root.route';

const app = createApp();

configureOpenAPI(app);

const routes = [
  { router: root, path: '/' },
  { router: readRouter, path: '/read' },
  { router: linksRouter, path: '/links' },
] as const;

for (const route of routes) {
  app.route(route.path, route.router);
}

// Convert the OpenAPIObject to a YAML string
const yamlString = yaml.dump(app.getOpenAPI31Document(openAPIObjectConfig));

// Save the YAML string to a file
writeFileSync('openapi.yaml', yamlString);
