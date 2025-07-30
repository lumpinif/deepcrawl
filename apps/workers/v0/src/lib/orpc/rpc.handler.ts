import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { CORSPlugin } from '@orpc/server/plugins';
import { CORS_OPTIONS } from '@/middlewares/cors.hono';
import { router } from '@/routers';

export const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error('❌ RPCHandler error', error);
    }),
  ],
  plugins: [
    new CORSPlugin({
      origin: (origin) => origin,
      credentials: CORS_OPTIONS.credentials,
      maxAge: CORS_OPTIONS.maxAge,
      allowMethods: CORS_OPTIONS.allowMethods,
      allowHeaders: CORS_OPTIONS.allowHeaders,
      exposeHeaders: CORS_OPTIONS.exposeHeaders,
    }),
  ],
});
