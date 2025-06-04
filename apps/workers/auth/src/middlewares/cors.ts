import { allowedOrigins } from "@/lib/hono/create-hono-app";
import { AppBindings } from "@/types";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";

export const corsMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  cors({
    maxAge: 600,
    credentials: true,
    origin: allowedOrigins,
    exposeHeaders: ["Content-Length"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });
  await next();
});
