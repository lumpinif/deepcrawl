import type {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from '@orpc/contract';
import { oc } from '@orpc/contract';
import { readGETContract, readPOSTContract } from './read';

export const contract = oc.router({
  read: oc.prefix('/read').router({
    getMarkdown: readGETContract,
    readWebsite: readPOSTContract,
  }),
});

export type Inputs = InferContractRouterInputs<typeof contract>;
export type Outputs = InferContractRouterOutputs<typeof contract>;
