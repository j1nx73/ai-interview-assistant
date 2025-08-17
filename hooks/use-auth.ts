import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { dbClient, UserProfile } from '@/lib/supabase/database-client'

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
          const profile = await dbClient.getUserProfile(session.user.id)
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
          const profile = await dbClient.getUserProfile(session.user.id)
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

      // Create user profile if signup was successful
      if (data.user) {
        try {
          const profile = await dbClient.createUserProfile({
            id: data.user.id,
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

          if (profile) {
            setAuthState(prev => ({ ...prev, profile, loading: false }))
          } else {
            console.warn('User profile creation failed - this may be due to missing database tables')
            // Continue without profile for now
          }
        } catch (profileError) {
          console.error('Error creating user profile:', profileError)
          // Continue even if profile creation fails - user can still sign in
          console.log('User account created but profile creation failed. Please run the database setup script.')
        }
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
      const result = await dbClient.updateUserProfile(authState.user.id, updates)
      
      if (result.error) {
        console.error('Profile update error:', result.error)
        return { error: { message: result.error.message || 'Failed to update profile' } }
      }
      
      if (result.data) {
        setAuthState(prev => ({ ...prev, profile: result.data }))
        return { data: result.data }
      } else {
        return { error: { message: 'Failed to update profile' } }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('Unexpected error in updateProfile:', error)
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
      const profile = await dbClient.getUserProfile(authState.user.id)
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
