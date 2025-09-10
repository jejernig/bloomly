import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y, getViolations } from 'axe-playwright'

test.describe('Authentication Forms Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe-core into the page
    await injectAxe(page)
  })

  test('sign in form meets WCAG 2.1 AA standards @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Wait for form to be fully loaded
    await page.waitForSelector('form')
    await page.waitForLoadState('networkidle')
    
    // Check accessibility with WCAG 2.1 AA level
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
    
    // Additional specific checks for form elements
    const violations = await getViolations(page)
    expect(violations).toHaveLength(0)
    
    // Verify form has proper structure
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    // Check for proper labels
    const emailInput = page.getByLabel(/email address/i)
    const passwordInput = page.getByLabel(/password/i)
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    
    // Verify button accessibility
    const submitButton = page.getByRole('button', { name: /sign in/i })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })

  test('sign up form meets WCAG 2.1 AA standards @a11y', async ({ page }) => {
    await page.goto('/auth/signup')
    
    await page.waitForSelector('form')
    await page.waitForLoadState('networkidle')
    
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
    
    // Verify all form fields have proper labels
    await expect(page.getByLabel(/full name/i)).toBeVisible()
    await expect(page.getByLabel(/email address/i)).toBeVisible()
    await expect(page.getByLabel(/^password$/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    
    // Check terms checkbox has proper labeling
    const termsCheckbox = page.getByRole('checkbox')
    await expect(termsCheckbox).toBeVisible()
  })

  test('forgot password form meets WCAG 2.1 AA standards @a11y', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    await page.waitForSelector('form')
    await page.waitForLoadState('networkidle')
    
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
    
    // Verify email input has proper label
    await expect(page.getByLabel(/email address/i)).toBeVisible()
    
    // Check submit button
    const submitButton = page.getByRole('button', { name: /send reset link/i })
    await expect(submitButton).toBeVisible()
  })

  test('reset password form meets WCAG 2.1 AA standards @a11y', async ({ page }) => {
    // Navigate to reset password with mock token
    await page.goto('/auth/reset-password?token=mock-token')
    
    await page.waitForSelector('form')
    await page.waitForLoadState('networkidle')
    
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
    
    // Verify password fields have proper labels
    await expect(page.getByLabel(/new password/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    
    // Check password requirements section is accessible
    const requirementsSection = page.getByText(/password requirements/i)
    await expect(requirementsSection).toBeVisible()
  })

  test('form error states are accessible @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    // Submit empty form to trigger validation errors
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Wait for errors to appear
    await page.waitForSelector('[role="alert"], .text-red-600, .text-red-500', { timeout: 5000 })
    
    // Check accessibility with errors present
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
    
    // Verify error messages are properly associated with inputs
    const emailError = page.getByText(/please enter a valid email/i).first()
    const passwordError = page.getByText(/password must be at least/i).first()
    
    await expect(emailError).toBeVisible()
    await expect(passwordError).toBeVisible()
  })

  test('Google OAuth button is accessible @a11y', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    // Check accessibility of Google sign-in button
    const googleButton = page.getByRole('button', { name: /continue with google/i })
    await expect(googleButton).toBeVisible()
    await expect(googleButton).toBeEnabled()
    
    // Verify button has proper accessible name and role
    await expect(googleButton).toHaveAttribute('type', 'button')
    
    // Check overall accessibility
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('password visibility toggle is accessible @a11y', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    // Find password input and visibility toggle
    const passwordInput = page.getByLabel(/password/i)
    const visibilityToggle = passwordInput.locator('..').getByRole('button').first()
    
    await expect(passwordInput).toBeVisible()
    await expect(visibilityToggle).toBeVisible()
    
    // Test toggle functionality
    await visibilityToggle.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    await visibilityToggle.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Check accessibility after interaction
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('form focus management is accessible @a11y', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    // Test tab navigation through form
    const emailInput = page.getByLabel(/email address/i)
    const passwordInput = page.getByLabel(/password/i)
    const rememberCheckbox = page.getByRole('checkbox', { name: /remember me/i })
    const forgotLink = page.getByRole('link', { name: /forgot your password/i })
    const submitButton = page.getByRole('button', { name: /sign in/i })
    
    // Start at email input
    await emailInput.focus()
    await expect(emailInput).toBeFocused()
    
    // Tab to password
    await page.keyboard.press('Tab')
    await expect(passwordInput).toBeFocused()
    
    // Tab to remember me checkbox
    await page.keyboard.press('Tab')
    await expect(rememberCheckbox).toBeFocused()
    
    // Tab to forgot password link
    await page.keyboard.press('Tab')
    await expect(forgotLink).toBeFocused()
    
    // Tab to submit button
    await page.keyboard.press('Tab')
    await expect(submitButton).toBeFocused()
    
    // Check accessibility during focus states
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('high contrast mode compatibility @a11y', async ({ page, browserName }) => {
    // Skip for webkit as it doesn't support forced-colors
    test.skip(browserName === 'webkit', 'WebKit does not support forced-colors media query')
    
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    // Emulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' })
    
    // Wait for styles to apply
    await page.waitForTimeout(1000)
    
    // Check accessibility in high contrast mode
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
    
    // Verify form elements are still visible
    await expect(page.getByLabel(/email address/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })
})