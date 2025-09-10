import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  fullName?: string
  subscriptionTier?: 'free' | 'pro' | 'enterprise'
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>
  initialize: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        if (get().isInitialized) return
        
        set({ isLoading: true })
        
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            set({ 
              user: {
                id: user.id,
                email: user.email!,
                fullName: user.user_metadata?.full_name,
                subscriptionTier: 'free'
              },
              isLoading: false,
              isInitialized: true
            })
          } else {
            set({ 
              user: null, 
              isLoading: false,
              isInitialized: true
            })
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ 
            user: null, 
            isLoading: false, 
            isInitialized: true,
            error: 'Failed to initialize authentication'
          })
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false, error: error.message }
          }

          if (data.user) {
            set({ 
              user: {
                id: data.user.id,
                email: data.user.email!,
                fullName: data.user.user_metadata?.full_name,
                subscriptionTier: 'free'
              },
              isLoading: false 
            })
            return { success: true }
          }

          return { success: false, error: 'No user data returned' }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signUp: async (email: string, password: string, fullName?: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration')
          }
          
          // Use Supabase REST API for better error handling during registration
          const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
            },
            body: JSON.stringify({
              email,
              password,
              data: fullName ? { full_name: fullName } : {}
            }),
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            const errorMessage = errorData.error_description || errorData.msg || 'Registration failed'
            set({ error: errorMessage, isLoading: false })
            return { success: false, error: errorMessage }
          }
          
          const authData = await response.json()
          
          // Handle successful registration - Supabase signup returns user data at root level
          if (authData.id && authData.email) {
            // Create user profile in database (still use Supabase client for database operations)
            try {
              // Use type assertion to bypass Supabase type issues
              const { error: insertError } = await (supabase.from('users') as any).insert({
                id: authData.id,
                email: authData.email,
                full_name: fullName || null,
                subscription_tier: 'free',
              })
              
              if (insertError) {
                console.warn('Profile creation failed (non-critical):', insertError)
              }
            } catch (dbError) {
              // Profile creation failed, but auth succeeded - this is acceptable
              console.warn('Profile creation failed (non-critical):', dbError)
            }
            
            // Don't set user state for signup (user needs to verify email first)
            set({ isLoading: false })
            return { success: true }
          } else {
            const errorMessage = 'Invalid registration response'
            set({ error: errorMessage, isLoading: false })
            return { success: false, error: errorMessage }
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration')
          }
          
          // Use Supabase REST API for OAuth initiation
          const redirectTo = `${window.location.origin}/auth/callback`
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo
            }
          })
          
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false, error: error.message }
          }
          
          // OAuth redirect will handle the rest
          set({ isLoading: false })
          return { success: true }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut()
          set({ user: null, error: null })
        } catch (error) {
          console.error('Sign out error:', error)
          // Still clear user state even if sign out fails
          set({ user: null, error: null })
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
          })
          
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false, error: error.message }
          }
          
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.updateUser({
            password
          })
          
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false, error: error.message }
          }
          
          if (data.user) {
            set({ 
              user: {
                id: data.user.id,
                email: data.user.email!,
                fullName: data.user.user_metadata?.full_name,
                subscriptionTier: 'free'
              },
              isLoading: false 
            })
            return { success: true }
          }
          
          return { success: false, error: 'Password reset failed' }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        user: state.user,
        isInitialized: state.isInitialized
      }),
    }
  )
)