import { createBetterAuth } from "@/lib/better-auth";
import { AppBindings } from "@/types";
import { createMiddleware } from "hono/factory";

export const authInstanceMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const auth = createBetterAuth(c.env);
    c.set("betterAuth", auth);
    await next();
  }
);

export const authContextMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const auth = c.var.betterAuth;
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session || !session.session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    // Set both the user and session objects from the session response
    c.set("user", session.user);
    c.set("session", session.session);

    await next();
  }
);
