import { createClient } from "@supabase/supabase-js";

// A simple client for reading public data such as the list of cities and
// hospitals shown on the sign up screen. It uses only the public anon key.
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
