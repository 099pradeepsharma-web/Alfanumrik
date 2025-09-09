import { createClient } from "@supabase/supabase-js";

// The Supabase URL and Anon Key are now sourced from the environment polyfill in index.html.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// This flag determines if the app should use the real Supabase backend or fall back to mock data.
// It checks if either the URL or the Key are missing or are still set to their placeholder values.
export const isUsingMocks = 
    !supabaseUrl || supabaseUrl.startsWith('YOUR_SUPABASE_URL') ||
    !supabaseAnonKey || supabaseAnonKey.startsWith('YOUR_SUPABASE_ANON_KEY');

// If credentials are missing, show a non-blocking warning in the console and use mock data.
if (isUsingMocks) {
    const warningMessage = "Supabase URL or Anon Key is not set. Falling back to mock data. Please update SUPABASE_URL and SUPABASE_ANON_KEY in index.html to connect to a real backend.";
    // This warning helps the developer understand why the app is using mock data.
    console.warn(warningMessage);
}

// Initialize Supabase. createClient does not throw on invalid credentials, so this is safe.
// The app's logic will prevent it from being used if isUsingMocks is true.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);