"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { User, Session } from "@supabase/supabase-js"
import { dbClient, UserProfile } from "@/lib/supabase/database-client"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => Promise<{ data?: any; error?: any }>
  signOut: () => Promise<void>
  profile: UserProfile | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        // Fetch user profile if session exists
        if (session?.user) {
          try {
            const userProfile = await dbClient.getUserProfile(session.user.id)
            setProfile(userProfile)
          } catch (error) {
            console.error("Error fetching user profile:", error)
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Fetch user profile if session exists
        if (session?.user) {
          try {
            const userProfile = await dbClient.getUserProfile(session.user.id)
            setProfile(userProfile)
          } catch (error) {
            console.error("Error fetching user profile:", error)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      if (!supabase?.auth) {
        return { error: { message: 'Supabase not configured' } }
      }

      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setLoading(false)
        return { error }
      }

      // Update auth state with the new session data
      if (data.session && data.user) {
        setUser(data.user)
        setSession(data.session)
        
        // Fetch user profile
        try {
          const userProfile = await dbClient.getUserProfile(data.user.id)
          setProfile(userProfile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }

      setLoading(false)
      return { data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setLoading(false)
      return { error: { message: errorMessage } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => {
    try {
      if (!supabase?.auth) {
        return { error: { message: 'Supabase not configured' } }
      }

      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        setLoading(false)
        return { error }
      }

      // Create user profile if signup was successful
      if (data.user) {
        try {
          const userProfile = await dbClient.createUserProfile({
            email: data.user.email!,
            first_name: metadata?.first_name || null,
            last_name: metadata?.last_name || null,
            full_name: metadata?.first_name && metadata?.last_name ? `${metadata.first_name} ${metadata.last_name}` : null,
            avatar_url: null,
            role: 'user',
            subscription_tier: null,
            subscription_expires_at: null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            preferences: {}
          })
          setProfile(userProfile)
        } catch (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }

      setLoading(false)
      return { data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setLoading(false)
      return { error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    profile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
