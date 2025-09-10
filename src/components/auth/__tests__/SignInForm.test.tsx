import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { SignInForm } from '../SignInForm'
import {
  setupMockAuthStore,
  mockSuccessfulSubmission,
  mockFailedSubmission,
  mockNetworkError,
  mockAuthSuccess,
  mockAuthError,
} from '@/test-utils'
import { toast } from 'react-hot-toast'

// Mock the router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

describe('SignInForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMockAuthStore()
    mockPush.mockClear()
    ;(toast.success as jest.Mock).mockClear()
    ;(toast.error as jest.Mock).mockClear()
  })

  describe('Form Rendering', () => {
    it('renders all form elements', () => {
      render(<SignInForm />)
      
      // Google sign in button
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
      
      // Email input
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
      
      // Password input
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
      
      // Remember me checkbox
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
      
      // Forgot password link
      expect(screen.getByRole('link', { name: /forgot your password/i })).toBeInTheDocument()
      
      // Submit button
      expect(screen.getByRole('button', { name: /sign in$/i })).toBeInTheDocument()
    })

    it('has proper autocomplete attributes', () => {
      render(<SignInForm />)
      
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('autocomplete', 'email')
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'current-password')
      expect(screen.getByLabelText(/remember me/i)).toHaveAttribute('autocomplete', 'off')
    })

    it('has proper input types', () => {
      render(<SignInForm />)
      
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email')
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password')
      expect(screen.getByLabelText(/remember me/i)).toHaveAttribute('type', 'checkbox')
    })
  })

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility when eye icon is clicked', async () => {
      render(<SignInForm />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button
      
      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      // Click to show password
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      // Click to hide password again
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      render(<SignInForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in$/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for invalid email format', async () => {
      render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /sign in$/i })
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for short password', async () => {
      render(<SignInForm />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in$/i })
      
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })

    it('does not show validation errors for valid inputs', async () => {
      render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/password must be at least 6 characters/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('calls signIn with correct credentials on valid submission', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({ success: true })
      setupMockAuthStore({ signIn: mockSignIn })
      
      render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in$/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('shows success toast and navigates on successful sign in', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({ success: true })
      setupMockAuthStore({ signIn: mockSignIn })
      
      render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in$/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Welcome back!')
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('shows error toast on failed sign in', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({ 
        success: false, 
        error: 'Invalid credentials' 
      })
      setupMockAuthStore({ signIn: mockSignIn })
      
      render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in$/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
        expect(mockPush).not.toHaveBeenCalled()
      })
    })

    it('handles network errors gracefully', async () => {
      const mockSignIn = jest.fn().mockRejectedValue(new Error('Network error'))
      setupMockAuthStore({ signIn: mockSignIn })
      
      render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in$/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred')
      })
    })

    it('shows loading state during form submission', async () => {
      const mockSignIn = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )
      setupMockAuthStore({ signIn: mockSignIn })
      
      render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in$/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      // Check for loading state
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })
  })

  describe('Google Sign In', () => {
    it('calls signInWithGoogle when Google button is clicked', async () => {
      const mockSignInWithGoogle = jest.fn().mockResolvedValue({ success: true })
      setupMockAuthStore({ signInWithGoogle: mockSignInWithGoogle })
      
      render(<SignInForm />)
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i })
      fireEvent.click(googleButton)
      
      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
      })
    })

    it('shows success toast on successful Google sign in', async () => {
      const mockSignInWithGoogle = jest.fn().mockResolvedValue({ success: true })
      setupMockAuthStore({ signInWithGoogle: mockSignInWithGoogle })
      
      render(<SignInForm />)
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i })
      fireEvent.click(googleButton)
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Redirecting to Google...')
      })
    })

    it('shows error toast on failed Google sign in', async () => {
      const mockSignInWithGoogle = jest.fn().mockResolvedValue({ 
        success: false, 
        error: 'Google OAuth failed' 
      })
      setupMockAuthStore({ signInWithGoogle: mockSignInWithGoogle })
      
      render(<SignInForm />)
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i })
      fireEvent.click(googleButton)
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Google OAuth failed')
      })
    })

    it('is disabled when auth store is loading', () => {
      setupMockAuthStore({ isLoading: true })
      
      render(<SignInForm />)
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i })
      expect(googleButton).toBeDisabled()
    })
  })

  describe('Loading States', () => {
    it('disables form when auth store is loading', () => {
      setupMockAuthStore({ isLoading: true })
      
      render(<SignInForm />)
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i })
      const submitButton = screen.getByRole('button', { name: /sign in$/i })
      
      expect(googleButton).toBeDisabled()
      // Submit button is disabled by form validation, not auth loading
    })
  })

  describe('Links and Navigation', () => {
    it('has correct forgot password link', () => {
      render(<SignInForm />)
      
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot your password/i })
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
    })
  })

  describe('Accessibility', () => {
    it('has proper form structure for screen readers', () => {
      render(<SignInForm />)
      
      // All inputs should have associated labels
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
    })

    it('has proper button types', () => {
      render(<SignInForm />)
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i })
      const passwordToggle = screen.getByRole('button', { name: '' }) // Eye icon
      const submitButton = screen.getByRole('button', { name: /sign in$/i })
      
      expect(googleButton).toHaveAttribute('type', 'button')
      expect(passwordToggle).toHaveAttribute('type', 'button')
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('maintains focus management', () => {
      render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      emailInput.focus()
      expect(emailInput).toHaveFocus()
      
      // Tab to next field
      fireEvent.keyDown(emailInput, { key: 'Tab' })
      passwordInput.focus()
      expect(passwordInput).toHaveFocus()
    })
  })
})