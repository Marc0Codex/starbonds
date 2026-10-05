import type { SupabaseClient } from "@supabase/supabase-js"

// Realtime evaluates RLS with the socket's JWT, so hand it the user's access token
// explicitly (setAuth() with no argument can fall back to the anon key).
export async function authorizeRealtime(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getSession()
  await supabase.realtime.setAuth(data.session?.access_token ?? null)
}
