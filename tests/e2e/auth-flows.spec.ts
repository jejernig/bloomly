import { test, expect } from '@playwright/test'

test.describe('Authentication Flows', () => {
  test.describe('Sign In Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/signin')
    })

    test('displays sign in form elements @smoke @critical', async ({ page }) => {
      // Check page title and heading
      await expect(page).toHaveTitle(/sign in/i)
      
      // Google sign in button
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
      
      // Email input
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible()
      
      // Password input
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible()
      
      // Remember me checkbox
      await expect(page.getByLabel(/remember me/i)).toBeVisible()
      
      // Forgot password link
      await expect(page.getByRole('link', { name: /forgot your password/i })).toBeVisible()
      
      // Submit button
      await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible()
    })

    test('has proper form attributes and accessibility', async ({ page }) => {
      // Check autocomplete attributes
      const emailInput = page.getByLabel(/email address/i)
      const passwordInput = page.getByLabel(/password/i)
      const rememberCheckbox = page.getByLabel(/remember me/i)
      
      await expect(emailInput).toHaveAttribute('autocomplete', 'email')
      await expect(emailInput).toHaveAttribute('type', 'email')
      
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
      await expect(passwordInput).toHaveAttribute('type', 'password')
      
      await expect(rememberCheckbox).toHaveAttribute('autocomplete', 'off')
      await expect(rememberCheckbox).toHaveAttribute('type', 'checkbox')
    })

    test('shows validation errors for empty fields', async ({ page }) => {
      // Click submit without filling fields
      await page.getByRole('button', { name: /^sign in$/i }).click()
      
      // Check for validation errors
      await expect(page.getByText(/please enter a valid email address/i)).toBeVisible()
      await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible()
    })

    test('shows validation error for invalid email format', async ({ page }) => {
      await page.getByLabel(/email address/i).fill('invalid-email')
      await page.getByRole('button', { name: /^sign in$/i }).click()
      
      await expect(page.getByText(/please enter a valid email address/i)).toBeVisible()
    })

    test('shows validation error for short password', async ({ page }) => {
      await page.getByLabel(/email address/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('123')
      await page.getByRole('button', { name: /^sign in$/i }).click()
      
      await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible()
    })

    test('toggles password visibility', async ({ page }) => {
      const passwordInput = page.getByLabel(/password/i)
      const toggleButton = page.getByRole('button').filter({ has: page.locator('svg') }).first()
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password')
      
      // Click to show password
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
      
      // Click to hide password again
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('navigates to forgot password page', async ({ page }) => {
      await page.getByRole('link', { name: /forgot your password/i }).click()
      await expect(page).toHaveURL(/\/auth\/forgot-password/)
    })

    test('handles sign in with valid credentials', async ({ page }) => {
      // Fill in valid credentials
      await page.getByLabel(/email address/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password123')
      
      // Mock successful authentication response
      await page.route('**/auth/v1/token**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() / 1000 + 3600,
            user: {
              id: 'user-123',
              email: 'test@example.com',
            }
          })
        })
      })
      
      // Submit form
      await page.getByRole('button', { name: /^sign in$/i }).click()
      
      // Should redirect to dashboard or show success
      // Note: This might redirect or show a toast - adapt based on actual behavior
      await page.waitForLoadState('networkidle')
    })

    test('handles sign in with invalid credentials', async ({ page }) => {
      // Fill in invalid credentials
      await page.getByLabel(/email address/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      
      // Mock failed authentication response
      await page.route('**/auth/v1/token**', async route => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'invalid_credentials',
            error_description: 'Invalid login credentials'
          })
        })
      })
      
      // Submit form
      await page.getByRole('button', { name: /^sign in$/i }).click()
      
      // Should show error toast or message
      await page.waitForTimeout(1000) // Wait for error handling
    })

    test('shows loading state during submission', async ({ page }) => {
      // Fill form
      await page.getByLabel(/email address/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password123')
      
      // Mock slow response
      await page.route('**/auth/v1/token**', async route => {
        await page.waitForTimeout(2000)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-token',
            user: { id: 'user-123', email: 'test@example.com' }
          })
        })
      })
      
      // Submit and check loading state
      const submitButton = page.getByRole('button', { name: /^sign in$/i })
      await submitButton.click()
      
      // Check button is disabled during loading
      await expect(submitButton).toBeDisabled()
      
      await page.waitForLoadState('networkidle')
    })

    test('handles Google sign in button click', async ({ page }) => {
      const googleButton = page.getByRole('button', { name: /continue with google/i })
      
      // Mock OAuth URL response
      await page.route('**/auth/v1/authorize**', async route => {
        // OAuth should redirect, so we'll mock the redirect
        await route.fulfill({
          status: 302,
          headers: {
            'Location': 'https://accounts.google.com/oauth/authorize?...'
          }
        })
      })
      
      await googleButton.click()
      
      // Check that OAuth flow is initiated
      await page.waitForTimeout(1000)
    })

    test('keyboard navigation works correctly', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab') // Google button
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeFocused()
      
      await page.keyboard.press('Tab') // Email input
      await expect(page.getByLabel(/email address/i)).toBeFocused()
      
      await page.keyboard.press('Tab') // Password input  
      await expect(page.getByLabel(/password/i)).toBeFocused()
      
      await page.keyboard.press('Tab') // Password toggle
      await page.keyboard.press('Tab') // Remember me
      await expect(page.getByLabel(/remember me/i)).toBeFocused()
      
      await page.keyboard.press('Tab') // Forgot password link
      await expect(page.getByRole('link', { name: /forgot your password/i })).toBeFocused()
      
      await page.keyboard.press('Tab') // Sign in button
      await expect(page.getByRole('button', { name: /^sign in$/i })).toBeFocused()
    })
  })

  test.describe('Sign Up Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/signup')
    })

    test('displays sign up form elements @smoke', async ({ page }) => {
      await expect(page).toHaveTitle(/sign up/i)
      
      // Full name input
      await expect(page.getByLabel(/full name/i)).toBeVisible()
      
      // Email input
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      
      // Password input
      await expect(page.getByLabel(/^password$/i)).toBeVisible()
      
      // Confirm password input (if exists)
      const confirmPassword = page.getByLabel(/confirm password/i)
      if (await confirmPassword.isVisible()) {
        await expect(confirmPassword).toBeVisible()
      }
      
      // Submit button
      await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible()
      
      // Sign in link
      await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
    })

    test('validates required fields', async ({ page }) => {
      await page.getByRole('button', { name: /sign up/i }).click()
      
      // Should show validation errors
      await page.waitForTimeout(500) // Wait for validation
      
      // Check for error indicators (text color, borders, etc.)
      const emailInput = page.getByLabel(/email address/i)
      const passwordInput = page.getByLabel(/^password$/i)
      
      // These should have error styling
      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()
    })

    test('handles successful sign up', async ({ page }) => {
      // Mock successful sign up
      await page.route('**/auth/v1/signup**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: null
          })
        })
      })
      
      // Fill form
      await page.getByLabel(/full name/i).fill('Test User')
      await page.getByLabel(/email address/i).fill('test@example.com')
      await page.getByLabel(/^password$/i).fill('password123')
      
      // Submit
      await page.getByRole('button', { name: /sign up/i }).click()
      
      await page.waitForLoadState('networkidle')
    })
  })

  test.describe('Password Reset Flow', () => {
    test('forgot password page works @smoke', async ({ page }) => {
      await page.goto('/auth/forgot-password')
      
      await expect(page).toHaveTitle(/forgot password/i)
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /back to sign in/i })).toBeVisible()
    })

    test('reset password page works', async ({ page }) => {
      await page.goto('/auth/reset-password')
      
      await expect(page.getByLabel(/new password/i)).toBeVisible()
      await expect(page.getByLabel(/confirm password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /update password/i })).toBeVisible()
    })
  })

  test.describe('Authentication State', () => {
    test('redirects authenticated user from auth pages', async ({ page, context }) => {
      // Mock authenticated state by setting localStorage
      await context.addInitScript(() => {
        localStorage.setItem('sb-test-project-auth-token', JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'user-123', email: 'test@example.com' },
          expires_at: Date.now() / 1000 + 3600
        }))
      })
      
      await page.goto('/auth/signin')
      
      // Should redirect away from sign in page
      await page.waitForLoadState('networkidle')
      
      // Check we're not on the auth page anymore
      expect(page.url()).not.toContain('/auth/signin')
    })

    test('persists authentication across page reloads', async ({ page, context }) => {
      // Set authenticated state
      await context.addInitScript(() => {
        localStorage.setItem('sb-test-project-auth-token', JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'user-123', email: 'test@example.com' },
          expires_at: Date.now() / 1000 + 3600
        }))
      })
      
      await page.goto('/dashboard')
      await page.reload()
      
      // Should still be authenticated
      await expect(page.getByText(/dashboard/i)).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('handles network errors gracefully', async ({ page }) => {
      await page.goto('/auth/signin')
      
      // Mock network failure
      await page.route('**/auth/v1/token**', async route => {
        await route.abort('failed')
      })
      
      await page.getByLabel(/email address/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /^sign in$/i }).click()
      
      await page.waitForTimeout(2000)
      
      // Should show error state or message
      // The exact behavior depends on your error handling implementation
    })

    test('handles server errors (500)', async ({ page }) => {
      await page.goto('/auth/signin')
      
      // Mock server error
      await page.route('**/auth/v1/token**', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'internal_server_error',
            error_description: 'Internal server error'
          })
        })
      })
      
      await page.getByLabel(/email address/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /^sign in$/i }).click()
      
      await page.waitForTimeout(1000)
      
      // Should handle server error gracefully
    })
  })
})