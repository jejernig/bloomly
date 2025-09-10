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
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useAuthStore.setState({
        user: null,
        profile: null,
        instagramAccounts: [],
        isLoading: false,
        error: null,
      })
    })
    
    // Clear localStorage
    localStorage.clear()
    
    // Reset fetch mock
    global.fetch = jest.fn()
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useAuthStore())
      
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
      
      global.fetch = jest.fn().mockResolvedValue(
        createMockResponse(mockAuthError, 400)
      )
      
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
      
      global.fetch = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(createMockResponse(mockAuthSuccess)), 100))
      )
      
      const signInPromise = act(async () => {
        return result.current.signIn('test@example.com', 'password123')
      })
      
      // Check loading state is set
      expect(result.current.isLoading).toBe(true)
      
      await signInPromise
      
      // Check loading state is cleared
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
    // Mock window.location
    const originalLocation = window.location
    
    beforeEach(() => {
      delete (window as any).location
      window.location = { ...originalLocation, href: '' }
    })
    
    afterEach(() => {
      window.location = originalLocation
    })

    it('redirects to Google OAuth URL', async () => {
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

    it('handles OAuth initiation failure', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      global.fetch = jest.fn().mockResolvedValue(
        createMockResponse({}, 500)
      )
      
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
        `sb-test-project-auth-token`,
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
        `sb-test-project-auth-token`,
        JSON.stringify(expiredTokenData)
      )
      
      await act(async () => {
        await result.current.initialize()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(localStorage.getItem(`sb-test-project-auth-token`)).toBeNull()
    })

    it('handles invalid token format', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Mock invalid token format
      localStorage.setItem(
        `sb-test-project-auth-token`,
        'invalid-json'
      )
      
      await act(async () => {
        await result.current.initialize()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(localStorage.getItem(`sb-test-project-auth-token`)).toBeNull()
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
        `sb-test-project-auth-token`,
        JSON.stringify(tokenData)
      )
      
      // Mock fetch that times out
      global.fetch = jest.fn().mockImplementation(
        () => new Promise((_, reject) => {
          setTimeout(() => reject({ name: 'AbortError' }), 10)
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
      
      // Mock successful update
      const mockUpdate = jest.fn().mockResolvedValue({
        data: updatedProfile,
        error: null,
      })
      require('@/lib/supabase').supabase.from = jest.fn(() => ({
        update: mockUpdate,
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
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}), // Empty response
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
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON')
        },
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