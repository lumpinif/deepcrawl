import createHonoApp from "./lib/hono/create-hono-app";
import authRouter from "./router/auth";

const app = createHonoApp();

app.get("/", (c) => {
  return c.text("Hello Deepcrawl");
});

app.route("/", authRouter);

export default app;
