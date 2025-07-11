import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';

import type { contract } from '@deepcrawl/contracts';
import type { ContractRouterClient } from '@orpc/contract';
import { env } from 'cloudflare:workers';

const rpcLink = new RPCLink({
  url: `${env.API_URL}/rpc`,
  method: ({ context }, path) => {  
    // Use GET for read operations (like getMarkdown, getLinks)  
    if (path.at(-1)?.match(/^(?:get|find|list|search)(?:[A-Z].*)?$/)) {  
      return 'GET'  
    }  
    return 'POST'  
  },  
  headers: () => ({
    'Content-Type': 'application/json',  
  }),
});

export const orpcClient: ContractRouterClient<typeof contract> =
  createORPCClient(rpcLink);

