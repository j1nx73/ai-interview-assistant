import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Singleton instance
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

// Create a singleton instance of the Supabase client for Client Components
export function createClient() {
  // Return existing instance if already created
  if (supabaseClient) {
    return supabaseClient
  }

  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    supabaseClient = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: "Supabase not configured" } }),
        signUp: () => Promise.resolve({ data: { user: null }, error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as any
    return supabaseClient
  }
  
  // Create new instance only once
  supabaseClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return supabaseClient
}

// Export a default client instance for direct imports
export const supabase = createClient()
