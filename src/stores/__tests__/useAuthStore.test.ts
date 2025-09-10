import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../useAuthStore'
import {
  createMockResponse,
  mockUser,
  mockProfile,
  mockInstagramAccount,
  mockAuthSuccess,
  mockAuthError,
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
})