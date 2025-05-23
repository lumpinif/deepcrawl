import { createSupabaseClientWithApiKey } from "@deepcrawl/supabase/clients/api-client";
import { Hono } from "hono";

import {
	createApikeyPostValidator,
	getApikeyLoadKeysPostValidator,
	revokeApikeyPostValidator,
	testApiKeyPostValidator,
} from "@/middlewares/api-key.validator";
import { getSupabase } from "@/middlewares/auth.middleware";
import { authEmailLoginValidator } from "@/middlewares/auth.validator";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app
	.get("/", async (c) => {
		const supabase = getSupabase(c);
		const { data, error } = await supabase.auth.getUser();

		if (error) {
			return c.json({
				message:
					"Not logged in. You need to login POST /auth/login with email and password first.",
			});
		}

		return c.json({
			message: "Already logged in",
			user: data.user,
		});
	})
	.post("/login", authEmailLoginValidator(), async (c) => {
		const supabase = getSupabase(c);
		const { email, password } = c.req.valid("form");

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return c.json({
				error: error?.message,
			});
		}

		return c.redirect("/auth");
	})
	.post("/logout", async (c) => {
		const supabase = getSupabase(c);
		await supabase.auth.signOut();
		return c.redirect("/auth");
	})
	.get("/load-api-keys", async (c) => {
		const supabase = getSupabase(c);
		// Get the authenticated user
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const id_of_user = user.id;
		const { data, error } = await supabase.rpc("load_api_keys", {
			id_of_user,
		});

		if (error) {
			return c.json({
				error: error?.message,
			});
		}

		// return secret_ids and descriptions
		return c.json({
			api_keys: data,
		});
	})
	.post("/get-api-key", getApikeyLoadKeysPostValidator(), async (c) => {
		const { secret_id } = c.req.valid("form");
		const supabase = getSupabase(c);

		// Get the authenticated user
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const id_of_user = user.id;

		const { data, error } = await supabase.rpc("get_api_key", {
			id_of_user,
			secret_id,
		});

		if (error) {
			return c.json({
				error: error?.message,
			});
		}

		return c.json({
			api_key: data,
		});
	})
	.post("/create-api-key", createApikeyPostValidator(), async (c) => {
		const { key_description } = c.req.valid("form");

		const supabase = getSupabase(c);

		// Get the authenticated user
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const id_of_user = user.id;

		const { error } = await supabase.rpc("create_api_key", {
			id_of_user,
			key_description,
		});

		if (error) {
			return c.json({
				error: error?.message,
			});
		}

		return c.json({
			message: "API key created successfully",
		});
	})
	.post("/revoke-api-key", revokeApikeyPostValidator(), async (c) => {
		const { secret_id } = c.req.valid("form");

		const supabase = getSupabase(c);
		// Get the authenticated user
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const id_of_user = user.id;

		const { error } = await supabase.rpc("revoke_api_key", {
			id_of_user,
			secret_id,
		});

		if (error) {
			return c.json({
				error: error?.message,
			});
		}

		return c.json({
			message: "API key revoked successfully",
		});
	})
	.get("/test-api-key", testApiKeyPostValidator(), async (c) => {
		const { Authorization: token } = c.req.valid("header");
		const user_api_key = token.split(" ")[1] ?? "";

		if (!user_api_key) {
			return c.json(
				{
					error: "Unauthorized",
				},
				401,
			);
		}

		const supabase = getSupabase(c);

		// Step 1: Try cookie-based auth first
		const {
			data: { user: cookieUser },
			error: cookieError,
		} = await supabase.auth.getUser();

		if (!cookieError && cookieUser) {
			// User found via cookie-based auth
			return c.json({
				user: {
					id: cookieUser.id,
					email: cookieUser.email,
					created_at: cookieUser.created_at,
				},
				auth_method: "cookie",
			});
		}

		// Step 2: If no user from cookies, try API key auth
		if (user_api_key) {
			// Create a Supabase client with the API key in the Authorization header
			const apiSupabase = createSupabaseClientWithApiKey(
				c.env.SUPABASE_URL,
				c.env.SUPABASE_ANON_KEY,
				user_api_key,
			);

			const { data, error } = await apiSupabase.rpc("get_user_by_api_key", {
				user_api_key,
			});

			if (error || !data) {
				return c.json(
					{
						error: error?.message || "Invalid API key",
					},
					401,
				);
			}

			return c.json({
				data,
			});
		}
	});
export default app;
