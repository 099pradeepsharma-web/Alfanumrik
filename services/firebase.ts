import { createClient } from "@supabase/supabase-js";

// The Supabase URL is derived from your project settings.
const supabaseUrl = 'https://yawo9slkpnbvwupijjrneq.supabase.co';

// The Supabase Anon Key is now sourced from the environment polyfill in index.html.
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// This flag determines if the app should use the real Supabase backend or fall back to mock data.
export const isUsingMocks = !supabaseAnonKey || supabaseAnonKey.startsWith('REPLACE_WITH');

// If the key is missing, show a non-blocking warning in the console and use mock data.
if (isUsingMocks) {
    const warningMessage = "Supabase anon key is not set. Falling back to mock data. Please update the SUPABASE_ANON_KEY in index.html to connect to a real backend.";
    // This warning helps the developer understand why the app is using mock data.
    console.warn(warningMessage);
}

// Initialize Supabase. createClient does not throw on invalid key, so this is safe.
// The app's logic will prevent it from being used if isUsingMocks is true.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);