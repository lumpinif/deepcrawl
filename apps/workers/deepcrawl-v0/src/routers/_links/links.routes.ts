// import { createRouter } from '@/lib/create-hono-app';

// import * as handlers from './links.handlers';

// import { createRoute } from '@hono/zod-openapi';
// import * as HttpStatusCodes from 'stoker/http-status-codes';
// import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';

// import { LinksOptionsSchema } from '@/middlewares/links.validator';
// import {
//   LinksPostErrorResponseSchema,
//   LinksPostSuccessResponseSchema,
// } from '@deepcrawl/types/index';

// const tags = ['Extract Links'];

// export const linksGETRoute = createRoute({
//   tags,
//   path: '/',
//   method: 'get',
//   'x-speakeasy-group': '',
//   'x-speakeasy-name-override': 'getLinks',
//   operationId: 'extractLinksGet',
//   description: 'Returning extracted links sitemap results for the request URL.',
//   'x-speakeasy-usage-example': {
//     title: 'Get Links from a URL (GET)',
//     description:
//       'Returning extracted links sitemap results for the request URL.',
//     position: 1,
//   },
//   request: {
//     query: LinksOptionsSchema,
//   },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(
//       LinksPostSuccessResponseSchema,
//       'Extracted links sitemap results for request URL',
//     ),
//     [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
//       LinksPostErrorResponseSchema,
//       'Bad request error',
//     ),
//   },
// });

// export const linksPOSTRoute = createRoute({
//   tags,
//   path: '/',
//   method: 'post',
//   operationId: 'extractLinksPost',
//   'x-speakeasy-group': '',
//   'x-speakeasy-name-override': 'extractLinks',
//   description: 'Returning extracted links sitemap results for the request URL.',
//   'x-speakeasy-usage-example': {
//     title: 'Extract Links from a URL (POST)',
//     description:
//       'Returning extracted links sitemap results for the request URL.',
//     position: 2,
//   },
//   request: {
//     body: jsonContentRequired(
//       LinksOptionsSchema,
//       '/links POST request body, links options schema',
//     ),
//   },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(
//       LinksPostSuccessResponseSchema,
//       'Extracted links sitemap results for request URL',
//     ),
//     [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
//       LinksPostErrorResponseSchema,
//       'Internal server error',
//     ),
//   },
// });

// export type LinksGETRoute = typeof linksGETRoute;
// export type LinksPOSTRoute = typeof linksPOSTRoute;

// const router = createRouter()
//   // .openapi(linksGETRoute, handlers.linksGET)
//   .openapi(linksPOSTRoute, handlers.linksPOST);

// export default router;
