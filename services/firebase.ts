import { createClient } from "@supabase/supabase-js";

// The Supabase URL and Anon Key are now sourced from the environment polyfill in index.html.
const configSupabaseUrl = process.env.SUPABASE_URL || '';
const configSupabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// This flag determines if the app should use the real Supabase backend or fall back to mock data.
// It checks if either the URL or the Key are missing or are still set to their placeholder values.
export const isUsingMocks = 
    !configSupabaseUrl || configSupabaseUrl.startsWith('YOUR_SUPABASE_URL') ||
    !configSupabaseAnonKey || configSupabaseAnonKey.startsWith('YOUR_SUPABASE_ANON_KEY');

// If credentials are missing, show a non-blocking warning in the console and use mock data.
if (isUsingMocks) {
    const warningMessage = "Supabase URL or Anon Key is not set. Falling back to mock data. Please update SUPABASE_URL and SUPABASE_ANON_KEY in index.html to connect to a real backend.";
    // This warning helps the developer understand why the app is using mock data.
    console.warn(warningMessage);
}

// Provide a valid dummy URL for client initialization when in mock mode to prevent errors.
// This dummy client is never used for requests because the `isUsingMocks` flag will route calls to the mock API.
const supabaseUrl = isUsingMocks ? 'http://localhost:8000' : configSupabaseUrl;
const supabaseAnonKey = isUsingMocks ? 'dummy-key' : configSupabaseAnonKey;


// Initialize Supabase. This is now safe as it's always called with valid parameters.
// In mock mode, this client is instantiated but never used for API requests.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);