import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL in server/.env");
}
if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in server/.env");
}
if (!supabaseAnonKey) {
    throw new Error("Missing SUPABASE_ANON_KEY in server/.env");
}

/**
 * Admin client — uses service role key.
 * Bypasses RLS. Only use server-side for admin operations.
 * Never expose to client.
 */
export const supabaseAdmin: SupabaseClient = createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

/**
 * Anon client — uses anon/public key.
 * Used for operations that must go through normal Supabase auth flow.
 * This triggers email verification on signup.
 */
export const supabaseAnon: SupabaseClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);