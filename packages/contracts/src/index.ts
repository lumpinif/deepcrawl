import type {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from '@orpc/contract';
import { oc } from '@orpc/contract';
import { linksGETContract, linksPOSTContract } from './links';
import { readGETContract, readPOSTContract } from './read';

export const contract = oc.router({
  read: oc.prefix('/read').router({
    getMarkdown: readGETContract,
    readWebsite: readPOSTContract,
  }),
  links: oc.prefix('/links').router({
    getLinks: linksGETContract,
    extractLinks: linksPOSTContract,
  }),
});

export type Inputs = InferContractRouterInputs<typeof contract>;
export type Outputs = InferContractRouterOutputs<typeof contract>;

export * from './read';
export * from './links';
