import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/supabase/database'
import { UserProfile } from '@/lib/supabase/database'

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null
  })

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        if (session?.user) {
          // Fetch user profile
          const profile = await db.getUserProfile(session.user.id)
          setAuthState({
            user: session.user,
            session,
            profile,
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setAuthState(prev => ({ 
          ...prev, 
          error: 'Failed to get session', 
          loading: false 
        }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          // Fetch user profile
          const profile = await db.getUserProfile(session.user.id)
          setAuthState({
            user: session.user,
            session,
            profile,
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: null
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { error }
      }

      return { data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: { message: errorMessage } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { error }
      }

      return { data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { error }
      }

      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null
      })

      return { data: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: { message: errorMessage } }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) {
      return { error: { message: 'No user logged in' } }
    }

    try {
      const profile = await db.updateUserProfile(authState.user.id, updates)
      
      if (profile) {
        setAuthState(prev => ({ ...prev, profile }))
        return { data: profile }
      } else {
        return { error: { message: 'Failed to update profile' } }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      return { error: { message: errorMessage } }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { error }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: { message: errorMessage } }
    }
  }

  const refreshProfile = async () => {
    if (!authState.user) return

    try {
      const profile = await db.getUserProfile(authState.user.id)
      setAuthState(prev => ({ ...prev, profile }))
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    refreshProfile,
    isAuthenticated: !!authState.user,
    isPremium: authState.profile?.role === 'premium'
  }
}

// Hook for protecting routes
export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  return {
    user,
    loading,
    isAuthenticated: !!user
  }
}

// Hook for getting user profile
export function useProfile() {
  const { profile, loading, error } = useAuth()
  
  return {
    profile,
    loading,
    error,
    isPremium: profile?.role === 'premium'
  }
}
