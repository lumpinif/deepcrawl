import {
  LinksErrorResponseSchema,
  LinksOptionsSchema,
  LinksSuccessResponseSchema,
} from '@deepcrawl/types';
import { oc } from '@orpc/contract';
import { oo } from '@orpc/openapi';
import type { Inputs, Outputs } from '.';

const tags = ['Extract Links'];

const errorConfig = {
  LINKS_ERROR_RESPONSE: {
    status: 500,
    message: 'Failed to extract links from URL',
    data: LinksErrorResponseSchema,
  },
};

const linksOC = oc.errors({
  LINKS_ERROR_RESPONSE: oo.spec(
    errorConfig.LINKS_ERROR_RESPONSE,
    (currentOperation) => ({
      ...currentOperation,
      responses: {
        ...currentOperation.responses,
        500: {
          ...currentOperation.responses?.[500],
          description: 'Links extraction failed',
        },
      },
    }),
  ),
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
export type LinksGETOutput = Outputs['links']['getLinks'];

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
export type LinksPOSTOutput = Outputs['links']['extractLinks'];
