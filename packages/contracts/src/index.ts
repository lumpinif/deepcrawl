import type {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from '@orpc/contract';
import { oc } from '@orpc/contract';
import { ExtractLinksContract, getLinksContract } from './links';
import {
  exportResponseContract,
  getManyLogsContract,
  getOneLogContract,
} from './logs';
import { getMarkdownContract, readUrlContract } from './read';

export const contract = oc.router({
  read: oc.prefix('/read').router({
    getMarkdown: getMarkdownContract,
    readUrl: readUrlContract,
  }),
  links: oc.prefix('/links').router({
    getLinks: getLinksContract,
    extractLinks: ExtractLinksContract,
  }),
  logs: oc.prefix('/logs').router({
    getOne: getOneLogContract,
    getMany: getManyLogsContract,
    exportResponse: exportResponseContract,
  }),
});

export type Inputs = InferContractRouterInputs<typeof contract>;
export type Outputs = InferContractRouterOutputs<typeof contract>;

export * from './errors';
export * from './links';
export * from './logs';
export * from './read';
