import { router } from '@/routers/rpc';
import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { ResponseHeadersPlugin } from '@orpc/server/plugins';

export const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error('❌ RPCHandler error', error);
    }),
  ],
  plugins: [new ResponseHeadersPlugin()],
});
