import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../useAuthStore'
import {
  createMockResponse,
  mockUser,
  mockProfile,
  mockInstagramAccount,
  mockAuthSuccess,
  mockAuthError,
  TEST_USERS,
  setupAuthStoreForTier,
  createMockUserForTier,
  testRBACAccess,
} from '@/test-utils'

describe('useAuthStore', () => {
  beforeEach(async () => {
    // Clear localStorage first (this clears the 'auth-storage' key)
    localStorage.clear()
    localStorage.removeItem('auth-storage')
    
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      profile: null,
      instagramAccounts: [],
      isLoading: false,
      error: null,
    })
    
    // Reset all mocks but don't override fetch completely - let the jest.setup.js mock handle it
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      expect(result.current).not.toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.profile).toBeNull()
      expect(result.current.instagramAccounts).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('State Setters', () => {
    it('setUser updates user state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setUser(mockUser as any)
      })
      
      expect(result.current.user).toEqual(mockUser)
    })

    it('setProfile updates profile state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setProfile(mockProfile as any)
      })
      
      expect(result.current.profile).toEqual(mockProfile)
    })

    it('setInstagramAccounts updates accounts state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setInstagramAccounts([mockInstagramAccount as any])
      })
      
      expect(result.current.instagramAccounts).toEqual([mockInstagramAccount])
    })

    it('setLoading updates loading state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setLoading(true)
      })
      
      expect(result.current.isLoading).toBe(true)
    })

    it('setError updates error state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setError('Test error')
      })
      
      expect(result.current.error).toBe('Test error')
    })
  })

  describe('signIn', () => {
    it('handles successful sign in', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      global.fetch = jest.fn().mockResolvedValue(
        createMockResponse(mockAuthSuccess)
      )
      
      let signInResult
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'password123')
      })
      
      expect(signInResult).toEqual({ success: true })
      expect(result.current.user).toEqual(mockAuthSuccess.user)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('handles failed sign in', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Mock fetch to return 400 error for this specific test
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/auth/v1/token?grant_type=password')) {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve(mockAuthError)
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({})
        });
      })
      
      let signInResult
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'wrongpassword')
      })
      
      expect(signInResult).toEqual({ 
        success: false, 
        error: 'Invalid login credentials' 
      })
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Invalid login credentials')
    })

    it('handles network error', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Mock fetch to throw network error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
      
      let signInResult
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'password123')
      })
      
      expect(signInResult).toEqual({ 
        success: false, 
        error: 'Network error' 
      })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Network error')
    })

    it('sets loading state during sign in', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Create a Promise we can control manually
      let resolveSignIn: (value: any) => void
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve
      })
      
      // Mock fetch to return our controlled promise
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/auth/v1/token?grant_type=password')) {
          return signInPromise.then(() => ({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              access_token: 'fake-access-token',
              refresh_token: 'fake-refresh-token',
              user: {
                id: '12345-67890-abcdef',
                email: 'test@example.com',
                user_metadata: { full_name: 'Test User' },
              },
            })
          }))
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({})
        });
      })
      
      // Start the sign in process
      let signInResult: Promise<any>
      act(() => {
        signInResult = result.current.signIn('test@example.com', 'password123')
      })
      
      // Give the promise a chance to start
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      // Check loading state is set
      expect(result.current.isLoading).toBe(true)
      
      // Resolve the mock promise
      resolveSignIn(null)
      
      // Wait for the sign in to complete
      await act(async () => {
        await signInResult!
      })
      
      // Check loading state is cleared after completion
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('signUp', () => {
    const mockSignUpSuccess = {
      id: mockUser.id,
      email: mockUser.email,
      email_confirmed_at: null,
    }

    it('handles successful sign up', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      global.fetch = jest.fn().mockResolvedValue(
        createMockResponse(mockSignUpSuccess)
      )
      
      let signUpResult
      await act(async () => {
        signUpResult = await result.current.signUp('test@example.com', 'password123', 'Test User')
      })
      
      expect(signUpResult).toEqual({ success: true })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      // Note: user is not set for signup (needs email verification)
      expect(result.current.user).toBeNull()
    })

    it('handles failed sign up', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      const signUpError = {
        error_description: 'User already registered',
      }
      
      global.fetch = jest.fn().mockResolvedValue(
        createMockResponse(signUpError, 400)
      )
      
      let signUpResult
      await act(async () => {
        signUpResult = await result.current.signUp('test@example.com', 'password123')
      })
      
      expect(signUpResult).toEqual({ 
        success: false, 
        error: 'User already registered' 
      })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('User already registered')
    })

    it('includes full name in sign up request', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      global.fetch = jest.fn().mockResolvedValue(
        createMockResponse(mockSignUpSuccess)
      )
      
      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'John Doe')
      })
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            data: {
              full_name: 'John Doe',
            },
          }),
        })
      )
    })
  })

  describe('signInWithGoogle', () => {
    // Mock window.location using a jest spy approach
    let mockLocationHref: string = ''
    
    beforeEach(() => {
      // Mock window.location.href as a getter/setter
      mockLocationHref = ''
      jest.spyOn(window.location, 'href', 'set').mockImplementation((value: string) => {
        mockLocationHref = value
      })
      jest.spyOn(window.location, 'href', 'get').mockImplementation(() => mockLocationHref)
      
      // Mock window.location.origin
      Object.defineProperty(window.location, 'origin', {
        value: 'http://localhost:3000',
        writable: true,
      })
    })
    
    afterEach(() => {
      jest.restoreAllMocks()
    })

    // TODO: Fix window.location mocking for jsdom
    it.skip('redirects to Google OAuth URL', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      global.fetch = jest.fn().mockResolvedValue(
        createMockResponse({}, 200)
      )
      
      let googleSignInResult
      await act(async () => {
        googleSignInResult = await result.current.signInWithGoogle()
      })
      
      expect(googleSignInResult).toEqual({ success: true })
      expect(window.location.href).toContain('/auth/v1/authorize?provider=google')
      expect(result.current.isLoading).toBe(false)
    })

    it.skip('handles OAuth initiation failure', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Mock fetch to return 500 error for OAuth endpoint
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/auth/v1/authorize?provider=google')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            text: () => Promise.resolve('Internal Server Error')
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({})
        });
      })
      
      let googleSignInResult
      await act(async () => {
        googleSignInResult = await result.current.signInWithGoogle()
      })
      
      expect(googleSignInResult).toEqual({ 
        success: false, 
        error: 'Failed to initiate Google OAuth' 
      })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Failed to initiate Google OAuth')
    })
  })

  describe('signOut', () => {
    it('clears user state on sign out', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Set initial state
      act(() => {
        result.current.setUser(mockUser as any)
        result.current.setProfile(mockProfile as any)
        result.current.setInstagramAccounts([mockInstagramAccount as any])
      })
      
      // Mock successful sign out
      const mockSignOut = jest.fn().mockResolvedValue({ error: null })
      require('@/lib/supabase').supabase.auth.signOut = mockSignOut
      
      await act(async () => {
        await result.current.signOut()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.profile).toBeNull()
      expect(result.current.instagramAccounts).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('initialize', () => {
    it('initializes with no token', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      await act(async () => {
        await result.current.initialize()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('initializes with valid token', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Mock valid token in localStorage
      const tokenData = {
        access_token: 'valid-token',
        user: mockUser,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      }
      
      localStorage.setItem(
        `sb-amvpmljsregjrmhwcfkt-auth-token`,
        JSON.stringify(tokenData)
      )
      
      // Mock successful token validation
      global.fetch = jest.fn().mockResolvedValue(
        createMockResponse(mockUser)
      )
      
      await act(async () => {
        await result.current.initialize()
      })
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isLoading).toBe(false)
    })

    it('clears expired token', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Mock expired token in localStorage
      const expiredTokenData = {
        access_token: 'expired-token',
        user: mockUser,
        expires_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      }
      
      localStorage.setItem(
        `sb-amvpmljsregjrmhwcfkt-auth-token`,
        JSON.stringify(expiredTokenData)
      )
      
      await act(async () => {
        await result.current.initialize()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(localStorage.getItem(`sb-amvpmljsregjrmhwcfkt-auth-token`)).toBeNull()
    })

    it('handles invalid token format', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Mock invalid token format
      localStorage.setItem(
        `sb-amvpmljsregjrmhwcfkt-auth-token`,
        'invalid-json'
      )
      
      await act(async () => {
        await result.current.initialize()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(localStorage.getItem(`sb-amvpmljsregjrmhwcfkt-auth-token`)).toBeNull()
    })

    it('handles session validation timeout', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Mock valid token
      const tokenData = {
        access_token: 'valid-token',
        user: mockUser,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }
      
      localStorage.setItem(
        `sb-amvpmljsregjrmhwcfkt-auth-token`,
        JSON.stringify(tokenData)
      )
      
      // Mock fetch that times out
      global.fetch = jest.fn().mockImplementation(
        () => new Promise((_, reject) => {
          const error = new Error('This operation was aborted')
          error.name = 'AbortError'
          setTimeout(() => reject(error), 10)
        })
      )
      
      await act(async () => {
        await result.current.initialize()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Session validation timed out')
    })
  })

  describe('updateProfile', () => {
    it('updates profile successfully', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Set initial user
      act(() => {
        result.current.setUser(mockUser as any)
      })
      
      const updatedProfile = { ...mockProfile, full_name: 'Updated Name' }
      
      // Mock successful update with complete chain
      require('@/lib/supabase').supabase.from = jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: updatedProfile,
                error: null,
              })),
            })),
          })),
        })),
      }))
      
      let updateResult
      await act(async () => {
        updateResult = await result.current.updateProfile({ full_name: 'Updated Name' })
      })
      
      expect(updateResult).toEqual({ success: true })
      expect(result.current.profile).toEqual(updatedProfile)
    })

    it('fails when no user is present', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      let updateResult
      await act(async () => {
        updateResult = await result.current.updateProfile({ full_name: 'New Name' })
      })
      
      expect(updateResult).toEqual({ 
        success: false, 
        error: 'No user found' 
      })
    })
  })

  describe('Error Handling', () => {
    it('handles malformed API responses', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Mock fetch to return malformed response
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/auth/v1/token?grant_type=password')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({}) // Empty response
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({})
        });
      })
      
      let signInResult
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'password123')
      })
      
      expect(signInResult.success).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    it('handles JSON parsing errors', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Mock fetch to throw JSON parsing error
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/auth/v1/token?grant_type=password')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => {
              throw new Error('Invalid JSON')
            },
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({})
        });
      })
      
      let signInResult
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'password123')
      })
      
      expect(signInResult.success).toBe(false)
      expect(result.current.error).toBe('Invalid JSON')
    })
  })

  describe('RBAC Integration Tests', () => {
    describe('Sign In with Different Subscription Tiers', () => {
      it('should sign in FREE tier user with correct subscription data', async () => {
        const { result } = renderHook(() => useAuthStore())
        const freeUserData = createMockUserForTier('FREE')
        
        const mockAuthResponse = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: {
            ...freeUserData.user,
            email: TEST_USERS.FREE.email,
          }
        }
        
        global.fetch = jest.fn().mockResolvedValue(
          createMockResponse(mockAuthResponse)
        )
        
        let signInResult
        await act(async () => {
          signInResult = await result.current.signIn(TEST_USERS.FREE.email, TEST_USERS.FREE.password)
        })
        
        expect(signInResult).toEqual({ success: true })
        expect(result.current.user?.email).toBe(TEST_USERS.FREE.email)
        expect(result.current.user?.fullName).toBe(TEST_USERS.FREE.fullName)
        expect(result.current.user?.subscriptionTier).toBe(TEST_USERS.FREE.tier)
      })

      it('should sign in PRO tier user with correct subscription data', async () => {
        const { result } = renderHook(() => useAuthStore())
        const proUserData = createMockUserForTier('PRO')
        
        const mockAuthResponse = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: {
            ...proUserData.user,
            email: TEST_USERS.PRO.email,
          }
        }
        
        global.fetch = jest.fn().mockResolvedValue(
          createMockResponse(mockAuthResponse)
        )
        
        let signInResult
        await act(async () => {
          signInResult = await result.current.signIn(TEST_USERS.PRO.email, TEST_USERS.PRO.password)
        })
        
        expect(signInResult).toEqual({ success: true })
        expect(result.current.user?.email).toBe(TEST_USERS.PRO.email)
        expect(result.current.user?.fullName).toBe(TEST_USERS.PRO.fullName)
        expect(result.current.user?.subscriptionTier).toBe(TEST_USERS.PRO.tier)
      })

      it('should sign in ENTERPRISE tier user with correct subscription data', async () => {
        const { result } = renderHook(() => useAuthStore())
        const enterpriseUserData = createMockUserForTier('ENTERPRISE')
        
        const mockAuthResponse = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: {
            ...enterpriseUserData.user,
            email: TEST_USERS.ENTERPRISE.email,
          }
        }
        
        global.fetch = jest.fn().mockResolvedValue(
          createMockResponse(mockAuthResponse)
        )
        
        let signInResult
        await act(async () => {
          signInResult = await result.current.signIn(TEST_USERS.ENTERPRISE.email, TEST_USERS.ENTERPRISE.password)
        })
        
        expect(signInResult).toEqual({ success: true })
        expect(result.current.user?.email).toBe(TEST_USERS.ENTERPRISE.email)
        expect(result.current.user?.fullName).toBe(TEST_USERS.ENTERPRISE.fullName)
        expect(result.current.user?.subscriptionTier).toBe(TEST_USERS.ENTERPRISE.tier)
      })
    })

    describe('Subscription Tier Setup Validation', () => {
      it('should setup FREE tier auth store correctly', () => {
        const store = setupAuthStoreForTier('FREE')
        const state = store.getState()
        
        expect(state.user?.email).toBe(TEST_USERS.FREE.email)
        expect(state.user?.subscriptionTier).toBe('free')
        expect(state.user?.fullName).toBe('Free User')
        expect(state.isLoading).toBe(false)
        expect(state.isInitialized).toBe(true)
      })

      it('should setup PRO tier auth store correctly', () => {
        const store = setupAuthStoreForTier('PRO')
        const state = store.getState()
        
        expect(state.user?.email).toBe(TEST_USERS.PRO.email)
        expect(state.user?.subscriptionTier).toBe('pro')
        expect(state.user?.fullName).toBe('Pro User')
        expect(state.isLoading).toBe(false)
        expect(state.isInitialized).toBe(true)
      })

      it('should setup ENTERPRISE tier auth store correctly', () => {
        const store = setupAuthStoreForTier('ENTERPRISE')
        const state = store.getState()
        
        expect(state.user?.email).toBe(TEST_USERS.ENTERPRISE.email)
        expect(state.user?.subscriptionTier).toBe('enterprise')
        expect(state.user?.fullName).toBe('Enterprise User')
        expect(state.isLoading).toBe(false)
        expect(state.isInitialized).toBe(true)
      })
    })

    describe('Feature Access Validation', () => {
      it('should validate feature access for different tiers', () => {
        // FREE tier limitations
        expect(testRBACAccess.hasFeatureAccess('free', 'unlimited_ai_generations')).toBe(false)
        expect(testRBACAccess.hasFeatureAccess('free', 'advanced_templates')).toBe(false)
        expect(testRBACAccess.hasFeatureAccess('free', 'custom_branding')).toBe(false)
        expect(testRBACAccess.hasFeatureAccess('free', 'api_access')).toBe(false)
        
        // PRO tier benefits
        expect(testRBACAccess.hasFeatureAccess('pro', 'unlimited_ai_generations')).toBe(true)
        expect(testRBACAccess.hasFeatureAccess('pro', 'advanced_templates')).toBe(true)
        expect(testRBACAccess.hasFeatureAccess('pro', 'priority_support')).toBe(true)
        expect(testRBACAccess.hasFeatureAccess('pro', 'custom_branding')).toBe(false) // Still Enterprise only
        
        // ENTERPRISE tier access
        expect(testRBACAccess.hasFeatureAccess('enterprise', 'all_features')).toBe(true)
        expect(testRBACAccess.hasFeatureAccess('enterprise', 'custom_branding')).toBe(true)
        expect(testRBACAccess.hasFeatureAccess('enterprise', 'api_access')).toBe(true)
        expect(testRBACAccess.hasFeatureAccess('enterprise', 'dedicated_support')).toBe(true)
      })

      it('should validate subscription limits for different tiers', () => {
        const freeLimits = testRBACAccess.getLimitsForTier('free')
        const proLimits = testRBACAccess.getLimitsForTier('pro')
        const enterpriseLimits = testRBACAccess.getLimitsForTier('enterprise')
        
        // AI Generation limits
        expect(freeLimits.aiGenerationsPerMonth).toBe(25)
        expect(proLimits.aiGenerationsPerMonth).toBe(-1) // unlimited
        expect(enterpriseLimits.aiGenerationsPerMonth).toBe(-1) // unlimited
        
        // Project limits
        expect(freeLimits.projectsLimit).toBe(3)
        expect(proLimits.projectsLimit).toBe(50)
        expect(enterpriseLimits.projectsLimit).toBe(-1) // unlimited
        
        // Instagram account limits
        expect(freeLimits.instagramAccountsLimit).toBe(1)
        expect(proLimits.instagramAccountsLimit).toBe(5)
        expect(enterpriseLimits.instagramAccountsLimit).toBe(-1) // unlimited
      })
    })

    describe('Test Account Security', () => {
      it('should use secure test passwords for all tiers', () => {
        Object.values(TEST_USERS).forEach(user => {
          // Password should be at least 8 characters
          expect(user.password.length).toBeGreaterThanOrEqual(8)
          
          // Should contain uppercase, lowercase, number, and special character
          expect(user.password).toMatch(/[A-Z]/) // uppercase
          expect(user.password).toMatch(/[a-z]/) // lowercase
          expect(user.password).toMatch(/[0-9]/) // number
          expect(user.password).toMatch(/[!@#$%^&*]/) // special character
        })
      })

      it('should use proper test domain for all accounts', () => {
        Object.values(TEST_USERS).forEach(user => {
          expect(user.email).toEndWith('@bloomly.io')
          expect(user.email).not.toMatch(/@(gmail|yahoo|hotmail|outlook)\.com/)
        })
      })

      it('should have unique identifiers for each tier', () => {
        const emails = Object.values(TEST_USERS).map(user => user.email)
        const uniqueEmails = new Set(emails)
        expect(uniqueEmails.size).toBe(3) // All 3 emails should be unique
        
        const tiers = Object.values(TEST_USERS).map(user => user.tier)
        const uniqueTiers = new Set(tiers)
        expect(uniqueTiers.size).toBe(3) // All 3 tiers should be unique
      })
    })
  })
})