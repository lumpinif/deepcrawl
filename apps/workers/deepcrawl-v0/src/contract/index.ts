import type {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from '@orpc/contract';
import { oc } from '@orpc/contract';
import { readGETContract } from './read';

export const contract = oc.router({
  read: oc.prefix('/read').router({
    getMarkdown: readGETContract,
  }),
});

export type Inputs = InferContractRouterInputs<typeof contract>;
export type Outputs = InferContractRouterOutputs<typeof contract>;
