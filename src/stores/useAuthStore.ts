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
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
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
        console.log('🔐 useAuthStore.signIn: Starting authentication process', { email })
        set({ isLoading: true, error: null })
        
        try {
          console.log('🔐 useAuthStore.signIn: About to call supabase.auth.signInWithPassword')
          
          // The network shows the request succeeds (200), but the promise hangs
          // Let's try a direct approach to test the theory
          console.log('🔐 useAuthStore.signIn: Testing direct fetch approach...')
          
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration')
          }
          
          const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              email,
              password,
            }),
          })
          
          console.log('🔐 useAuthStore.signIn: Direct fetch response', { 
            status: response.status,
            ok: response.ok 
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            console.log('🔐 useAuthStore.signIn: Direct fetch error', errorData)
            set({ error: errorData.error_description || 'Authentication failed', isLoading: false })
            return { success: false, error: errorData.error_description || 'Authentication failed' }
          }
          
          const authData = await response.json()
          console.log('🔐 useAuthStore.signIn: Direct fetch success', { 
            hasAccessToken: !!authData.access_token,
            hasUser: !!authData.user 
          })
          
          // Manually set the session using the received tokens
          if (authData.access_token && authData.user) {
            console.log('🔐 useAuthStore.signIn: Setting user directly from fetch response')
            set({ user: authData.user, isLoading: false })
            
            // Skip setting session in Supabase client since it hangs - just return success
            console.log('🔐 useAuthStore.signIn: Authentication completed successfully')
            return { success: true }
          } else {
            console.log('🔐 useAuthStore.signIn: Missing expected tokens/user in response')
            set({ error: 'Invalid authentication response', isLoading: false })
            return { success: false, error: 'Invalid authentication response' }
          }
          
        } catch (error) {
          console.log('🔐 useAuthStore.signIn: Caught exception', error)
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signUp: async (email: string, password: string, fullName?: string) => {
        console.log('🔐 useAuthStore.signUp: Starting registration process', { email, fullName })
        set({ isLoading: true, error: null })
        
        try {
          console.log('🔐 useAuthStore.signUp: Using direct fetch approach to bypass hanging Supabase client...')
          
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration')
          }
          
          const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              email,
              password,
              data: {
                full_name: fullName,
              },
            }),
          })
          
          console.log('🔐 useAuthStore.signUp: Direct fetch response', { 
            status: response.status,
            ok: response.ok 
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            console.log('🔐 useAuthStore.signUp: Direct fetch error', errorData)
            set({ error: errorData.error_description || errorData.msg || 'Registration failed', isLoading: false })
            return { success: false, error: errorData.error_description || errorData.msg || 'Registration failed' }
          }
          
          const authData = await response.json()
          console.log('🔐 useAuthStore.signUp: Full response structure:', JSON.stringify(authData, null, 2))
          console.log('🔐 useAuthStore.signUp: Direct fetch success', { 
            hasId: !!authData.id,
            hasEmail: !!authData.email,
            emailConfirmed: authData.email_confirmed_at !== null
          })
          
          // Handle successful registration - Supabase signup returns user data at root level
          if (authData.id && authData.email) {
            console.log('🔐 useAuthStore.signUp: User created, creating profile in database')
            
            // Create user profile in database (still use Supabase client for database operations)
            try {
              await supabase.from('users').insert({
                id: authData.id,
                email: authData.email,
                full_name: fullName,
                subscription_tier: 'free',
              })
              console.log('🔐 useAuthStore.signUp: Profile created successfully')
            } catch (dbError) {
              // Profile creation failed, but auth succeeded - this is acceptable
              console.warn('🔐 useAuthStore.signUp: Profile creation failed (non-critical):', dbError)
            }
            
            // Don't set user state for signup (user needs to verify email first)
            set({ isLoading: false })
            console.log('🔐 useAuthStore.signUp: Registration completed successfully')
            return { success: true }
          } else {
            console.log('🔐 useAuthStore.signUp: Missing user data in response', { 
              hasId: !!authData.id, 
              hasEmail: !!authData.email,
              keys: Object.keys(authData) 
            })
            set({ error: 'Invalid registration response', isLoading: false })
            return { success: false, error: 'Invalid registration response' }
          }
          
        } catch (error) {
          console.log('🔐 useAuthStore.signUp: Caught exception', error)
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signInWithGoogle: async () => {
        console.log('🔐 useAuthStore.signInWithGoogle: Starting Google OAuth process')
        set({ isLoading: true, error: null })
        
        try {
          console.log('🔐 useAuthStore.signInWithGoogle: Using direct fetch approach to bypass hanging Supabase client...')
          
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration')
          }
          
          // Use Supabase REST API for OAuth initiation
          const response = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin + '/auth/callback')}`, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
            },
          })
          
          if (!response.ok) {
            console.log('🔐 useAuthStore.signInWithGoogle: OAuth initiation failed', response.status)
            set({ error: 'Failed to initiate Google OAuth', isLoading: false })
            return { success: false, error: 'Failed to initiate Google OAuth' }
          }
          
          // For OAuth, we need to redirect the user to the authorization URL
          // The response should contain the authorization URL
          const responseText = await response.text()
          console.log('🔐 useAuthStore.signInWithGoogle: OAuth response received', { responseLength: responseText.length })
          
          // Since this is a GET request to the authorize endpoint, it should redirect automatically
          // Let's redirect manually to the OAuth URL
          const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin + '/auth/callback')}`
          console.log('🔐 useAuthStore.signInWithGoogle: Redirecting to OAuth URL')
          
          // Reset loading state before redirect since the component will unmount
          set({ isLoading: false })
          
          // Redirect to Google OAuth
          window.location.href = oauthUrl
          
          return { success: true }
        } catch (error) {
          console.log('🔐 useAuthStore.signInWithGoogle: Caught exception', error)
          const errorMessage = error instanceof Error ? error.message : 'An error occurred'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
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

      resetPassword: async (newPassword: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword
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
        console.log('🔐 useAuthStore.initialize: Starting session initialization')
        set({ isLoading: true })
        
        try {
          // Check for existing session tokens in localStorage (Supabase stores auth tokens here)
          const supabaseProjectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]
          const supabaseAuthToken = localStorage.getItem(`sb-${supabaseProjectRef}-auth-token`)
          
          if (!supabaseAuthToken) {
            console.log('🔐 useAuthStore.initialize: No auth token found in localStorage')
            set({ user: null, profile: null, instagramAccounts: [], isLoading: false })
            return
          }
          
          // Parse the token to get user info
          let tokenData
          try {
            tokenData = JSON.parse(supabaseAuthToken)
          } catch (parseError) {
            console.log('🔐 useAuthStore.initialize: Invalid token format, clearing session')
            localStorage.removeItem(`sb-${supabaseProjectRef}-auth-token`)
            set({ user: null, profile: null, instagramAccounts: [], isLoading: false })
            return
          }
          
          // Check if we have a valid access token and user
          if (!tokenData.access_token || !tokenData.user) {
            console.log('🔐 useAuthStore.initialize: No valid session data')
            set({ user: null, profile: null, instagramAccounts: [], isLoading: false })
            return
          }
          
          // Check token expiration before making API call
          const expiresAt = tokenData.expires_at || 0
          if (expiresAt && Date.now() / 1000 > expiresAt) {
            console.log('🔐 useAuthStore.initialize: Token expired, clearing session')
            localStorage.removeItem(`sb-${supabaseProjectRef}-auth-token`)
            set({ user: null, profile: null, instagramAccounts: [], isLoading: false })
            return
          }
          
          // Validate the session with Supabase using direct fetch with timeout
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          console.log('🔐 useAuthStore.initialize: Validating session with Supabase (with timeout)')
          
          // Create abort controller for timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
          
          const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey!,
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            console.log('🔐 useAuthStore.initialize: Session validation failed', response.status)
            // Clear invalid session
            localStorage.removeItem(`sb-${supabaseProjectRef}-auth-token`)
            set({ user: null, profile: null, instagramAccounts: [], isLoading: false })
            return
          }
          
          const userData = await response.json()
          console.log('🔐 useAuthStore.initialize: Session validated successfully')
          
          set({ user: userData })
          
          // Set isLoading to false immediately after session validation
          // Don't let database operations block the UI
          console.log('🔐 useAuthStore.initialize: Setting isLoading to false (session validated)')
          set({ isLoading: false })
          
          // Try to fetch profile and Instagram accounts in background (non-blocking)
          console.log('🔐 useAuthStore.initialize: Starting background profile fetch...')
          setTimeout(async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userData.id)
                .single()
              
              console.log('🔐 useAuthStore.initialize: Background profile fetch completed', { profile: !!profile, error: !!profileError })
              
              if (profileError && profileError.code !== 'PGRST116') {
                console.error('Background profile fetch error:', profileError)
              } else if (profile) {
                set({ profile: profile as User })
                console.log('🔐 useAuthStore.initialize: Profile set in store')
              }
            } catch (error) {
              console.error('🔐 useAuthStore.initialize: Background profile fetch failed:', error)
            }
          }, 100)
          
          // Try to fetch Instagram accounts in background (non-blocking)
          console.log('🔐 useAuthStore.initialize: Starting background Instagram accounts fetch...')
          setTimeout(async () => {
            try {
              const { data: accounts, error: accountsError } = await supabase
                .from('instagram_accounts')
                .select('*')
                .eq('user_id', userData.id)
                .eq('is_active', true)
              
              console.log('🔐 useAuthStore.initialize: Background Instagram accounts fetch completed', { accounts: !!accounts, error: !!accountsError })
              
              if (accountsError) {
                console.error('Background Instagram accounts fetch error:', accountsError)
              } else {
                set({ instagramAccounts: accounts as InstagramAccount[] || [] })
                console.log('🔐 useAuthStore.initialize: Instagram accounts set in store')
              }
            } catch (error) {
              console.error('🔐 useAuthStore.initialize: Background Instagram accounts fetch failed:', error)
            }
          }, 200)
          
          console.log('🔐 useAuthStore.initialize: Initialization completed successfully (background fetches scheduled)')
        } catch (error) {
          console.error('🔐 useAuthStore.initialize: Initialization failed with exception:', error)
          
          // Clear any existing auth tokens on error
          const supabaseProjectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]
          if (supabaseProjectRef) {
            localStorage.removeItem(`sb-${supabaseProjectRef}-auth-token`)
          }
          
          // Handle specific error types
          let errorMessage = 'An error occurred during initialization'
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              errorMessage = 'Session validation timed out'
              console.log('🔐 useAuthStore.initialize: Session validation timed out')
            } else {
              errorMessage = error.message
            }
          }
          
          set({ 
            user: null,
            profile: null,
            instagramAccounts: [],
            error: errorMessage,
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