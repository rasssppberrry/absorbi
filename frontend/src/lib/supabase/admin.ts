import { createClient } from "@supabase/supabase-js";

// Trusted server side client using the service role key. It bypasses row
// level security. NEVER import this file into a client component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
