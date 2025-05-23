import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";

export const authEmailLoginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export function authEmailLoginValidator() {
	return zValidator("form", authEmailLoginSchema);
}
