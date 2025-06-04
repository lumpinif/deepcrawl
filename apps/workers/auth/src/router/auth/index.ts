// auth.ts
import { Hono } from "hono";
import { AppBindings } from "@/types";

const app = new Hono<AppBindings>();

app.get("/signup", async (c) => {
  const auth = c.var.betterAuth;
  const email = `test${Date.now().toString().slice(7, 10)}@example.com`;
  const password = "password";

  const response = await auth.api.signUpEmail({
    returnHeaders: true,
    body: {
      email,
      password,
      name: `test${Date.now().toString().slice(7, 10)}`,
    },
    asResponse: true,
  });
  return response;
});

app.get("/session", (c) => {
  const user = c.var.user;
  const session = c.var.session;

  if (!user) return c.json({ error: "Unauthorized" }, 401);

  return c.json({
    session,
    user,
  });
});

app.get("/signin", async (c) => {
  const auth = c.var.betterAuth;
  const response = await auth.api.signInEmail({
    body: {
      email: "test@example.com",
      password: "password",
    },
    headers: c.req.raw.headers, // optional but would be useful to get the user IP, user agent, etc
    returnHeaders: true,
    asResponse: true,
  });

  return response;
});

app.get("/signout", async (c) => {
  const auth = c.var.betterAuth;
  await auth.api.signOut({
    headers: c.req.raw.headers,
  });

  return c.json({ message: "Signed out" });
});

export default app;
