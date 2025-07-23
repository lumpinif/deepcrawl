import {
  LinksOptionsSchema,
  LinksSuccessResponseSchema,
} from '@deepcrawl/types';
import { oc } from '@orpc/contract';
import { errorSpec, type Inputs, type Outputs } from '.';

const tags = ['Extract Links'];

const linksOC = oc.errors({
  RATE_LIMITED: errorSpec.RATE_LIMITED,
  LINKS_ERROR_RESPONSE: errorSpec.LINKS_ERROR_RESPONSE,
});

export const linksGETContract = linksOC
  .route({
    tags,
    path: '/',
    method: 'GET',
    summary: 'Get page links',
    description: `Endpoint: GET \`api.deepcrawl.dev/links?url=example.com\`\n\nDirectly return page links from the request URL as a string response.`,
  })
  .input(LinksOptionsSchema.pick({ url: true }))
  .output(LinksSuccessResponseSchema);

export type LinksGETInput = Inputs['links']['getLinks'];
export type GetLinksOutput = Outputs['links']['getLinks'];

export const linksPOSTContract = linksOC
  .route({
    tags,
    path: '/',
    method: 'POST',
    summary: 'Extract links from a URL',
    description: `Endpoint: POST \`api.deepcrawl.dev/links\`\n\nExtract links from a URL and return the full detailed result object. This is a POST request can handle more complex requests and use cases.`,
  })
  .input(LinksOptionsSchema)
  .output(LinksSuccessResponseSchema);

export type LinksPOSTInput = Inputs['links']['extractLinks'];
export type ExtractLinksOutput = Outputs['links']['extractLinks'];
