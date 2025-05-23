import type { Database } from "@deepcrawl/supabase/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Context } from "hono";

import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

declare module "hono" {
	interface ContextVariableMap {
		supabase: SupabaseClient<Database>;
	}
}

export function getSupabase(c: Context) {
	return c.get("supabase") as SupabaseClient<Database>;
}

export const supabaseMiddleware = createMiddleware<{
	Bindings: CloudflareBindings;
}>(async (c, next) => {
	const supabaseUrl = c.env.SUPABASE_URL;
	const supabaseAnonKey = c.env.SUPABASE_ANON_KEY;

	if (!supabaseUrl) {
		throw new Error("SUPABASE_URL missing!");
	}

	if (!supabaseAnonKey) {
		throw new Error("SUPABASE_ANON_KEY missing!");
	}

	const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return parseCookieHeader(c.req.header("Cookie") ?? "");
			},
			setAll(cookiesToSet) {
				for (const { name, value, options } of cookiesToSet) {
					// @ts-ignore
					setCookie(c, name, value, options);
				}
			},
		},
	});

	c.set("supabase", supabase);

	await next();
});
