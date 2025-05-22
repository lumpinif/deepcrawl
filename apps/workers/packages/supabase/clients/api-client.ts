import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

/**
 * Creates a Supabase client with an API key in the Authorization header
 * @param supabaseUrl The Supabase project URL
 * @param supabaseKey The Supabase API key (anon)
 * @param user_api_key The user's API key
 * @returns Supabase client instance
 */
export const createSupabaseClientWithApiKey = (
	supabaseUrl: string,
	supabaseKey: string,
	user_api_key: string,
) => {
	const options = {
		auth: {
			persistSession: false,
			detectSessionInUrl: false,
			autoRefreshToken: false,
		},
		global: {
			headers: { Authorization: user_api_key },
		},
	};

	return createClient<Database>(supabaseUrl, supabaseKey, options);
};
