import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';

import type { ContractRouterClient } from '@orpc/contract';
import type { contract } from '../../contract';

const rpcLink = new RPCLink({
  url: 'http://localhost:8787/rpc',
  headers: () => ({
    Authorization: 'Bearer default-token',
  }),
});

export const orpcClient: ContractRouterClient<typeof contract> =
  createORPCClient(rpcLink);
