import { createBrowserClient } from "@supabase/ssr";

// Browser client for use inside client components after the user is signed in.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
