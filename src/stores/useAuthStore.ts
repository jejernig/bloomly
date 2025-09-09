import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User, InstagramAccount } from '@/types'

interface AuthState {
  user: SupabaseUser | null
  profile: User | null
  instagramAccounts: InstagramAccount[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: SupabaseUser | null) => void
  setProfile: (profile: User | null) => void
  setInstagramAccounts: (accounts: InstagramAccount[]) => void
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  connectInstagram: (authCode: string) => Promise<{ success: boolean; error?: string }>
  refreshInstagramToken: (accountId: string) => Promise<{ success: boolean; error?: string }>
  initialize: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      instagramAccounts: [],
      isLoading: true,
      error: null,

      setUser: (user) => set({ user }),
      
      setProfile: (profile) => set({ profile }),
      
      setInstagramAccounts: (accounts) => set({ instagramAccounts: accounts }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false, error: error.message }
          }
          
          set({ user: data.user, isLoading: false })
          return { success: true }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signUp: async (email: string, password: string, fullName?: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          })
          
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false, error: error.message }
          }
          
          // Create user profile in database
          if (data.user) {
            await supabase.from('users').insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              subscription_tier: 'free',
            })
            
            set({ user: data.user, isLoading: false })
          }
          
          return { success: true }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })
          
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false, error: error.message }
          }
          
          return { success: true }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        
        try {
          const { error } = await supabase.auth.signOut()
          
          if (error) {
            set({ error: error.message, isLoading: false })
            return
          }
          
          set({ 
            user: null, 
            profile: null, 
            instagramAccounts: [], 
            isLoading: false, 
            error: null 
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
        }
      },

      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) {
          return { success: false, error: 'No user found' }
        }
        
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()
          
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false, error: error.message }
          }
          
          set({ profile: data as User, isLoading: false })
          return { success: true }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      connectInstagram: async (authCode: string) => {
        const { user } = get()
        if (!user) {
          return { success: false, error: 'No user found' }
        }
        
        set({ isLoading: true, error: null })
        
        try {
          // Call edge function to exchange code for token and store account
          const { data, error } = await supabase.functions.invoke('connect-instagram', {
            body: { code: authCode, userId: user.id },
          })
          
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false, error: error.message }
          }
          
          // Refresh Instagram accounts list
          const { data: accounts } = await supabase
            .from('instagram_accounts')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
          
          set({ 
            instagramAccounts: accounts as InstagramAccount[] || [], 
            isLoading: false 
          })
          
          return { success: true }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      refreshInstagramToken: async (accountId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase.functions.invoke('refresh-instagram-token', {
            body: { accountId },
          })
          
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false, error: error.message }
          }
          
          // Update the account in the local state
          const { instagramAccounts } = get()
          const updatedAccounts = instagramAccounts.map(account => 
            account.id === accountId 
              ? { ...account, accessToken: data.access_token, expiresAt: data.expires_at }
              : account
          )
          
          set({ instagramAccounts: updatedAccounts, isLoading: false })
          return { success: true }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      initialize: async () => {
        set({ isLoading: true })
        
        try {
          // Get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            set({ error: sessionError.message, isLoading: false })
            return
          }
          
          if (!session) {
            set({ user: null, profile: null, instagramAccounts: [], isLoading: false })
            return
          }
          
          set({ user: session.user })
          
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError)
          } else if (profile) {
            set({ profile: profile as User })
          }
          
          // Get Instagram accounts
          const { data: accounts, error: accountsError } = await supabase
            .from('instagram_accounts')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('is_active', true)
          
          if (accountsError) {
            console.error('Error fetching Instagram accounts:', accountsError)
          } else {
            set({ instagramAccounts: accounts as InstagramAccount[] || [] })
          }
          
          set({ isLoading: false })
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false 
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist basic user info, not sensitive tokens
      partialize: (state) => ({
        user: state.user ? {
          id: state.user.id,
          email: state.user.email,
        } : null,
        profile: state.profile,
      }),
    }
  )
)

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const { setUser, initialize } = useAuthStore.getState()
  
  if (event === 'SIGNED_IN' && session) {
    setUser(session.user)
    await initialize()
  } else if (event === 'SIGNED_OUT') {
    setUser(null)
    useAuthStore.setState({ 
      profile: null, 
      instagramAccounts: [], 
      error: null 
    })
  }
})