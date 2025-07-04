// import type { AppRouteHandler } from '@/lib/types';
// import * as HttpStatusCodes from 'stoker/http-status-codes';

// import type {
//   LinksPostErrorResponse,
//   LinksPostSuccessResponse,
// } from '@deepcrawl/types/index';
// import {
//   createLinksErrorResponse,
//   processLinksRequest,
// } from './links.processor';
// import type { LinksGETRoute, LinksPOSTRoute } from './links.routes';

// export const linksGET: AppRouteHandler<LinksGETRoute> = async (c) => {
//   const params = c.req.valid('query');
//   try {
//     const result = await processLinksRequest(c, params);

//     return c.json(result as LinksPostSuccessResponse, HttpStatusCodes.OK);
//   } catch (error) {
//     const err =
//       error instanceof Error
//         ? `${error.name}: ${error.message} - ${error.stack}`
//         : String(error);

//     const linksPostErrorResponse: LinksPostErrorResponse =
//       createLinksErrorResponse({
//         targetUrl: params.url,
//         error: err,
//         withTree: false,
//         existingTree: undefined,
//         tree: undefined,
//       });

//     return c.json(
//       linksPostErrorResponse,
//       HttpStatusCodes.INTERNAL_SERVER_ERROR,
//     );
//   }
// };

// export const linksPOST: AppRouteHandler<LinksPOSTRoute> = async (c) => {
//   const body = c.req.valid('json');
//   try {
//     const result = await processLinksRequest(c, body);

//     return c.json(result as LinksPostSuccessResponse, HttpStatusCodes.OK);
//   } catch (error) {
//     const err =
//       error instanceof Error
//         ? `${error.name}: ${error.message} - ${error.stack}`
//         : String(error);

//     const linksPostErrorResponse: LinksPostErrorResponse =
//       createLinksErrorResponse({
//         targetUrl: body.url,
//         error: err,
//         withTree: false,
//         existingTree: undefined,
//         tree: undefined,
//       });

//     return c.json(
//       linksPostErrorResponse,
//       HttpStatusCodes.INTERNAL_SERVER_ERROR,
//     );
//   }
// };
