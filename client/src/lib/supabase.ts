import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl) {
    throw new Error(
        "Missing VITE_SUPABASE_URL in client/.env — add it and restart the dev server"
    );
}

if (!supabaseAnonKey) {
    throw new Error(
        "Missing VITE_SUPABASE_ANON_KEY in client/.env — add it and restart the dev server"
    );
}

export const supabase: SupabaseClient = createClient(
    supabaseUrl,
    supabaseAnonKey
);