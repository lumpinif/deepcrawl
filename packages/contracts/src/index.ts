import type {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from '@orpc/contract';
import { oc } from '@orpc/contract';
import { linksGETContract, linksPOSTContract } from './links';
import { getManyLogsContract, getOneLogContract } from './logs';
import { readGETContract, readPOSTContract } from './read';

export const contract = oc.router({
  read: oc.prefix('/read').router({
    getMarkdown: readGETContract,
    readUrl: readPOSTContract,
  }),
  links: oc.prefix('/links').router({
    getLinks: linksGETContract,
    extractLinks: linksPOSTContract,
  }),
  logs: oc.prefix('/logs').router({
    getOne: getOneLogContract,
    getMany: getManyLogsContract,
  }),
});

export type Inputs = InferContractRouterInputs<typeof contract>;
export type Outputs = InferContractRouterOutputs<typeof contract>;

export * from './errors';
export * from './links';
export * from './logs';
export * from './read';
