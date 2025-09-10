import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Create a new QueryClient for each test to avoid cross-test pollution
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock user data for tests
export const mockUser = {
  id: '12345-67890-abcdef',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  email_confirmed_at: '2024-01-01T00:00:00Z',
}

export const mockProfile = {
  id: '12345-67890-abcdef',
  email: 'test@example.com',
  full_name: 'Test User',
  subscription_tier: 'free',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockInstagramAccount = {
  id: 'ig-account-123',
  user_id: '12345-67890-abcdef',
  instagram_account_id: '987654321',
  username: 'testuser',
  name: 'Test User',
  profile_picture_url: 'https://example.com/profile.jpg',
  access_token: 'mock-access-token',
  token_expires_at: '2024-12-31T23:59:59Z',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Test helper to wait for all async operations to complete
export const waitForAsyncOperations = () => 
  new Promise(resolve => setTimeout(resolve, 0))

// Mock fetch responses
export const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
})

// Mock successful auth responses
export const mockAuthSuccess = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() / 1000 + 3600, // 1 hour from now
  user: mockUser,
}

export const mockAuthError = {
  error: 'invalid_credentials',
  error_description: 'Invalid login credentials',
}

// Helper to setup auth store with mock data
export const setupMockAuthStore = (initialState = {}) => {
  const { useAuthStore } = require('@/stores/useAuthStore')
  
  // Reset store state
  useAuthStore.setState({
    user: null,
    profile: null,
    instagramAccounts: [],
    isLoading: false,
    error: null,
    ...initialState,
  })
  
  return useAuthStore
}

// Helper to mock successful form submission
export const mockSuccessfulSubmission = () => {
  global.fetch = jest.fn().mockResolvedValue(
    createMockResponse(mockAuthSuccess)
  )
}

// Helper to mock failed form submission
export const mockFailedSubmission = (error = mockAuthError) => {
  global.fetch = jest.fn().mockResolvedValue(
    createMockResponse(error, 400)
  )
}

// Helper to mock network error
export const mockNetworkError = () => {
  global.fetch = jest.fn().mockRejectedValue(
    new Error('Network error')
  )
}

// Custom matchers for better test assertions
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidEmail(): R
      toHaveValidPassword(): R
      toBeLoadingState(): R
    }
  }
}

// Add custom Jest matchers
expect.extend({
  toHaveValidEmail(element: HTMLElement) {
    const input = element as HTMLInputElement
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    const pass = input.type === 'email' && emailRegex.test(input.value)
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${input.value} not to be a valid email`
          : `Expected ${input.value} to be a valid email`,
    }
  },
  
  toHaveValidPassword(element: HTMLElement) {
    const input = element as HTMLInputElement
    const pass = input.type === 'password' && input.value.length >= 6
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected password not to be valid`
          : `Expected password to be at least 6 characters long`,
    }
  },
  
  toBeLoadingState(element: HTMLElement) {
    const hasLoadingClass = element.classList.contains('opacity-50')
    const hasDisabledAttribute = element.hasAttribute('disabled')
    const hasLoadingSpinner = element.querySelector('.animate-spin')
    
    const pass = hasLoadingClass || hasDisabledAttribute || hasLoadingSpinner
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to be in loading state`
          : `Expected element to be in loading state`,
    }
  },
})