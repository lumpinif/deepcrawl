import { LinksSuccessResponse } from '@deepcrawl/types';
import {
  ExtractLinksOptionsSchema,
  ExtractLinksResponseSchema,
  type ExtractLinksResponseWithoutTreeSchema,
  type ExtractLinksResponseWithTreeSchema,
  GetLinksOptionsSchema,
  GetLinksResponseSchema,
  type GetLinksResponseWithoutTreeSchema,
  type GetLinksResponseWithTreeSchema,
} from '@deepcrawl/types/schemas';
import { oc } from '@orpc/contract';
import type z from 'zod/v4';
import type { Inputs, Outputs } from '.';
import { errorSpec } from './errors';

const tags = ['Extract Links'];

const linksOC = oc.errors({
  RATE_LIMITED: errorSpec.RATE_LIMITED,
  LINKS_ERROR_RESPONSE: errorSpec.LINKS_ERROR_RESPONSE,
});

export const getLinksContract = linksOC
  .route({
    tags,
    path: '/',
    method: 'GET',
    summary: 'Get page links',
    description: `Endpoint: GET \`/links?url=example.com\`\n\nDirectly return page links from the request URL as a string response.`,
  })
  .input(GetLinksOptionsSchema)
  /* LinksSuccessResponse is a union of two shapes.
  LinksSuccessResponseWithTree (when tree is enabled in options) – includes a tree hierarchy you can traverse, and metadata is nested in the tree node.
  LinksSuccessResponseWithoutTree (when tree is false in options) – omits tree, returning only extracted links and metadata. */
  .output(GetLinksResponseSchema);

export type GetLinksOptions = Inputs['links']['getLinks'];
/**
 * @description Tree is in discriminated union. Check {@link LinksSuccessResponse} to see details of type narrowing
 */
export type GetLinksResponse = Outputs['links']['getLinks'];

/** Helper types for type narrowing
 * Type representing a successful links extraction response with tree.
 * @see {@link GetLinksResponseWithTreeSchema}
 */
export type GetLinksResponseWithTree = z.infer<
  typeof GetLinksResponseWithTreeSchema
>;

/** Helper types for type narrowing
 * Type representing a successful links extraction response without tree.
 * @see {@link GetLinksResponseWithoutTreeSchema}
 */
export type GetLinksResponseWithoutTree = z.output<
  typeof GetLinksResponseWithoutTreeSchema
>;

export const ExtractLinksContract = linksOC
  .route({
    tags,
    path: '/',
    method: 'POST',
    summary: 'Extract links from a URL',
    description: `Endpoint: POST \`/links\`\n\nExtract links from a URL and return the full detailed result object. This is a POST request can handle more complex requests and use cases.`,
  })
  .input(ExtractLinksOptionsSchema)
  .output(ExtractLinksResponseSchema);

export type ExtractLinksOptions = Inputs['links']['extractLinks'];
/**
 * @description Tree is in discriminated union. Check {@link LinksSuccessResponse} to see details of type narrowing
 */
export type ExtractLinksResponse = Outputs['links']['extractLinks'];

/** Helper types for type narrowing
 * Type representing a successful links extraction response with tree.
 * @see {@link ExtractLinksResponseWithTreeSchema}
 */
export type ExtractLinksResponseWithTree = z.infer<
  typeof ExtractLinksResponseWithTreeSchema
>;
/** Helper types for type narrowing
 * Type representing a successful links extraction response without tree.
 * @see {@link ExtractLinksResponseWithoutTreeSchema}
 */
export type ExtractLinksResponseWithoutTree = z.output<
  typeof ExtractLinksResponseWithoutTreeSchema
>;
