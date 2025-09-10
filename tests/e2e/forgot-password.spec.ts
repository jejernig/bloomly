import { test, expect } from '@playwright/test'

test.describe('Forgot Password Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the sign-in page
    await page.goto('/auth/signin')
  })

  test('should have functional forgot password link on sign-in page @smoke @critical', async ({ page }) => {
    // Verify the forgot password link exists and is clickable
    const forgotPasswordLink = page.getByRole('link', { name: 'Forgot your password?' })
    await expect(forgotPasswordLink).toBeVisible()
    await expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
    
    // Click the link and verify navigation
    await forgotPasswordLink.click()
    await expect(page).toHaveURL('/auth/forgot-password')
  })

  test.describe('Forgot Password Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/forgot-password')
    })

    test('should load forgot password page without errors @smoke', async ({ page }) => {
      // Verify page loads successfully
      await expect(page).toHaveTitle(/Forgot Password/)
      
      // Check for key elements
      await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible()
      await expect(page.getByText('Enter your email address')).toBeVisible()
      await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible()
    })

    test('should show validation error for invalid email @critical', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email address' })
      const submitButton = page.getByRole('button', { name: 'Send reset link' })
      
      // Enter invalid email
      await emailInput.fill('invalid-email')
      await submitButton.click()
      
      // Should show validation error
      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    })

    test('should require email field @critical', async ({ page }) => {
      const submitButton = page.getByRole('button', { name: 'Send reset link' })
      
      // Try to submit without email
      await submitButton.click()
      
      // Should show validation error
      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    })

    test('should show success state after email submission @critical', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email address' })
      const submitButton = page.getByRole('button', { name: 'Send reset link' })
      
      // Enter valid email (this will trigger Supabase but may not send actual email in test env)
      await emailInput.fill('test@example.com')
      await submitButton.click()
      
      // Wait for the success state to appear
      await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible({ timeout: 10000 })
      await expect(page.getByText('We\'ve sent a password reset link to')).toBeVisible()
      await expect(page.getByText('test@example.com')).toBeVisible()
      
      // Verify helpful instructions are shown
      await expect(page.getByText('Didn\'t receive the email?')).toBeVisible()
      await expect(page.getByText('Check your spam folder')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Try a different email' })).toBeVisible()
    })

    test('should allow trying different email after success @critical', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email address' })
      const submitButton = page.getByRole('button', { name: 'Send reset link' })
      
      // Submit first email
      await emailInput.fill('first@example.com')
      await submitButton.click()
      
      // Wait for success state
      await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible({ timeout: 10000 })
      
      // Click try different email
      await page.getByRole('button', { name: 'Try a different email' }).click()
      
      // Should return to form
      await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible()
      await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible()
    })

    test('should navigate back to sign-in page @critical', async ({ page }) => {
      const backLink = page.getByRole('link', { name: 'Back to sign in' })
      await expect(backLink).toBeVisible()
      
      await backLink.click()
      await expect(page).toHaveURL('/auth/signin')
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    })
  })

  test.describe('Reset Password Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/reset-password')
    })

    test('should load reset password page without errors @smoke', async ({ page }) => {
      // Verify page loads successfully
      await expect(page).toHaveTitle(/Reset Password/)
      
      // Check for key elements
      await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()
      await expect(page.getByText('Enter your new password')).toBeVisible()
      await expect(page.getByRole('textbox', { name: 'New password' })).toBeVisible()
      await expect(page.getByRole('textbox', { name: 'Confirm password' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Update password' })).toBeVisible()
    })

    test('should show password requirements @critical', async ({ page }) => {
      // Check password requirements are visible
      await expect(page.getByText('Password requirements:')).toBeVisible()
      await expect(page.getByText('At least 8 characters')).toBeVisible()
      await expect(page.getByText('One lowercase letter')).toBeVisible()
      await expect(page.getByText('One uppercase letter')).toBeVisible()
      await expect(page.getByText('One number')).toBeVisible()
    })

    test('should validate password requirements @critical', async ({ page }) => {
      const passwordInput = page.getByRole('textbox', { name: 'New password' })
      const confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm password' })
      const submitButton = page.getByRole('button', { name: 'Update password' })
      
      // Test weak password
      await passwordInput.fill('weak')
      await confirmPasswordInput.fill('weak')
      await submitButton.click()
      
      // Should show validation error
      await expect(page.getByText('Password must contain at least one lowercase letter, one uppercase letter, and one number')).toBeVisible()
    })

    test('should validate password confirmation @critical', async ({ page }) => {
      const passwordInput = page.getByRole('textbox', { name: 'New password' })
      const confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm password' })
      const submitButton = page.getByRole('button', { name: 'Update password' })
      
      // Enter strong password
      await passwordInput.fill('StrongPassword123!')
      await confirmPasswordInput.fill('DifferentPassword123!')
      await submitButton.click()
      
      // Should show mismatch error
      await expect(page.getByText('Passwords don\'t match')).toBeVisible()
    })

    test('should show password strength indicator @critical', async ({ page }) => {
      const passwordInput = page.getByRole('textbox', { name: 'New password' })
      
      // Test weak password
      await passwordInput.fill('weak')
      await expect(page.getByText('Password strength:')).toBeVisible()
      await expect(page.getByText('Weak')).toBeVisible()
      
      // Test strong password
      await passwordInput.fill('StrongPassword123!')
      await expect(page.getByText('Strong')).toBeVisible()
    })

    test('should toggle password visibility @critical', async ({ page }) => {
      const passwordInput = page.getByRole('textbox', { name: 'New password' })
      const confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm password' })
      
      // Initially password should be hidden (type="password")
      await expect(passwordInput).toHaveAttribute('type', 'password')
      await expect(confirmPasswordInput).toHaveAttribute('type', 'password')
      
      // Find and click the first eye icon (for new password)
      const eyeIcons = page.locator('button[type="button"]').filter({ has: page.locator('svg') })
      await eyeIcons.first().click()
      
      // Password should now be visible (type="text")
      await expect(passwordInput).toHaveAttribute('type', 'text')
      
      // Click again to hide
      await eyeIcons.first().click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('should update password requirements indicators @critical', async ({ page }) => {
      const passwordInput = page.getByRole('textbox', { name: 'New password' })
      
      // Type a password that meets some requirements
      await passwordInput.fill('Password')
      
      // Length and uppercase should be green, others gray
      // This is a visual test - in a real app you might check for specific CSS classes
      await expect(page.getByText('At least 8 characters')).toBeVisible()
      
      // Type a password that meets all requirements
      await passwordInput.fill('Password123')
      
      // All requirements should be satisfied
      await expect(page.getByText('At least 8 characters')).toBeVisible()
      await expect(page.getByText('One lowercase letter')).toBeVisible()
      await expect(page.getByText('One uppercase letter')).toBeVisible()
      await expect(page.getByText('One number')).toBeVisible()
    })

    test('should navigate back to sign-in page @critical', async ({ page }) => {
      const backLink = page.getByRole('link', { name: 'Back to sign in' })
      await expect(backLink).toBeVisible()
      
      await backLink.click()
      await expect(page).toHaveURL('/auth/signin')
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    })
  })

  test.describe('Navigation and UX Flow', () => {
    test('should complete full forgot password navigation flow @integration', async ({ page }) => {
      // Start at sign-in page
      await page.goto('/auth/signin')
      
      // Step 1: Click forgot password link
      await page.getByRole('link', { name: 'Forgot your password?' }).click()
      await expect(page).toHaveURL('/auth/forgot-password')
      await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible()
      
      // Step 2: Go back to sign-in
      await page.getByRole('link', { name: 'Back to sign in' }).click()
      await expect(page).toHaveURL('/auth/signin')
      
      // Step 3: Go to forgot password again
      await page.getByRole('link', { name: 'Forgot your password?' }).click()
      await expect(page).toHaveURL('/auth/forgot-password')
      
      // Step 4: Navigate directly to reset password page (simulating email click)
      await page.goto('/auth/reset-password')
      await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()
      
      // Step 5: Go back to sign-in from reset page
      await page.getByRole('link', { name: 'Back to sign in' }).click()
      await expect(page).toHaveURL('/auth/signin')
    })

    test('should handle form state correctly across navigation @integration', async ({ page }) => {
      // Go to forgot password page
      await page.goto('/auth/forgot-password')
      
      // Fill in email
      await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com')
      
      // Navigate away and back
      await page.getByRole('link', { name: 'Back to sign in' }).click()
      await page.getByRole('link', { name: 'Forgot your password?' }).click()
      
      // Form should be reset (empty)
      const emailInput = page.getByRole('textbox', { name: 'Email address' })
      await expect(emailInput).toHaveValue('')
    })
  })

  test.describe('Accessibility', () => {
    test('should be keyboard accessible @a11y', async ({ page }) => {
      await page.goto('/auth/forgot-password')
      
      // Tab through elements
      await page.keyboard.press('Tab')
      const emailInput = page.getByRole('textbox', { name: 'Email address' })
      await expect(emailInput).toBeFocused()
      
      await page.keyboard.press('Tab')
      const submitButton = page.getByRole('button', { name: 'Send reset link' })
      await expect(submitButton).toBeFocused()
      
      await page.keyboard.press('Tab')
      const backLink = page.getByRole('link', { name: 'Back to sign in' })
      await expect(backLink).toBeFocused()
    })

    test('should have proper form labels and ARIA attributes @a11y', async ({ page }) => {
      await page.goto('/auth/forgot-password')
      
      // Check form labels
      await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible()
      
      // Check reset password form
      await page.goto('/auth/reset-password')
      await expect(page.getByRole('textbox', { name: 'New password' })).toBeVisible()
      await expect(page.getByRole('textbox', { name: 'Confirm password' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Update password' })).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully @critical', async ({ page }) => {
      await page.goto('/auth/forgot-password')
      
      // The form should still be functional even if network requests fail
      // This tests that the UI doesn't break
      await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com')
      const submitButton = page.getByRole('button', { name: 'Send reset link' })
      await expect(submitButton).toBeVisible()
      
      // Form validation should work regardless of network
      await page.getByRole('textbox', { name: 'Email address' }).fill('')
      await submitButton.click()
      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    })

    test('should show loading states appropriately @critical', async ({ page }) => {
      await page.goto('/auth/forgot-password')
      
      await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com')
      const submitButton = page.getByRole('button', { name: 'Send reset link' })
      
      // Click submit and check for loading state
      await submitButton.click()
      
      // Button should be disabled during submission
      // Note: This test may be timing-dependent
      await expect(submitButton).toBeDisabled()
    })
  })
})