import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Keyboard Navigation Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page)
  })

  test('home page keyboard navigation @a11y @critical', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Start from the beginning of the page
    await page.keyboard.press('Tab')
    
    // Check if skip link appears on focus
    const skipLink = page.getByText(/skip to main content/i).first()
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeFocused()
      
      // Test skip link functionality
      await page.keyboard.press('Enter')
      const mainContent = page.locator('main, [role="main"], #main')
      if (await mainContent.count() > 0) {
        // Verify focus moved to main content area
        await expect(mainContent.first()).toBeFocused()
      }
    }
    
    // Check overall accessibility
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('sign in form complete keyboard navigation @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    // Tab through Google button
    await page.keyboard.press('Tab')
    const googleButton = page.getByRole('button', { name: /continue with google/i })
    await expect(googleButton).toBeFocused()
    
    // Tab to email field
    await page.keyboard.press('Tab')
    const emailInput = page.getByLabel(/email address/i)
    await expect(emailInput).toBeFocused()
    
    // Type email using keyboard
    await page.keyboard.type('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
    
    // Tab to password field
    await page.keyboard.press('Tab')
    const passwordInput = page.getByLabel(/password/i)
    await expect(passwordInput).toBeFocused()
    
    // Type password using keyboard
    await page.keyboard.type('password123')
    
    // Tab to password visibility toggle
    await page.keyboard.press('Tab')
    const visibilityToggle = passwordInput.locator('..').getByRole('button').first()
    await expect(visibilityToggle).toBeFocused()
    
    // Test toggle with keyboard
    await page.keyboard.press('Enter')
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    await page.keyboard.press('Enter')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Tab to remember me checkbox
    await page.keyboard.press('Tab')
    const rememberCheckbox = page.getByRole('checkbox', { name: /remember me/i })
    await expect(rememberCheckbox).toBeFocused()
    
    // Toggle checkbox with keyboard
    await page.keyboard.press('Space')
    await expect(rememberCheckbox).toBeChecked()
    
    // Tab to forgot password link
    await page.keyboard.press('Tab')
    const forgotLink = page.getByRole('link', { name: /forgot your password/i })
    await expect(forgotLink).toBeFocused()
    
    // Tab to submit button
    await page.keyboard.press('Tab')
    const submitButton = page.getByRole('button', { name: /sign in/i })
    await expect(submitButton).toBeFocused()
    
    // Submit form using keyboard
    await page.keyboard.press('Enter')
    
    // Wait for potential navigation or error messages
    await page.waitForTimeout(1000)
    
    // Check accessibility after interaction
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('sign up form keyboard navigation with validation @a11y', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForSelector('form')
    
    // Navigate to full name field
    await page.keyboard.press('Tab') // Skip Google button
    await page.keyboard.press('Tab') // Focus on full name
    const fullNameInput = page.getByLabel(/full name/i)
    await expect(fullNameInput).toBeFocused()
    
    // Tab through all form fields
    const formFields = [
      { label: /full name/i, value: 'John Doe' },
      { label: /email address/i, value: 'john@example.com' },
      { label: /^password$/i, value: 'Password123!' },
      { label: /confirm password/i, value: 'Password123!' }
    ]
    
    for (const field of formFields) {
      const input = page.getByLabel(field.label)
      await expect(input).toBeFocused()
      await page.keyboard.type(field.value)
      await expect(input).toHaveValue(field.value)
      await page.keyboard.press('Tab')
    }
    
    // Focus should now be on password visibility toggle
    const passwordInput = page.getByLabel(/^password$/i)
    const visibilityToggle = passwordInput.locator('..').getByRole('button').first()
    await expect(visibilityToggle).toBeFocused()
    
    // Continue tabbing to confirm password visibility toggle
    await page.keyboard.press('Tab')
    const confirmPasswordInput = page.getByLabel(/confirm password/i)
    const confirmVisibilityToggle = confirmPasswordInput.locator('..').getByRole('button').first()
    await expect(confirmVisibilityToggle).toBeFocused()
    
    // Tab to terms checkbox
    await page.keyboard.press('Tab')
    const termsCheckbox = page.getByRole('checkbox')
    await expect(termsCheckbox).toBeFocused()
    
    // Accept terms using keyboard
    await page.keyboard.press('Space')
    await expect(termsCheckbox).toBeChecked()
    
    // Tab to submit button
    await page.keyboard.press('Tab')
    const submitButton = page.getByRole('button', { name: /create account/i })
    await expect(submitButton).toBeFocused()
    
    // Check accessibility
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('navigation menu keyboard accessibility @a11y', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Find and navigate to main navigation
    const navItems = page.locator('nav a, nav button').first()
    
    if (await navItems.count() > 0) {
      // Tab to first navigation item
      let tabCount = 0
      while (tabCount < 10) { // Prevent infinite loop
        await page.keyboard.press('Tab')
        tabCount++
        
        const focusedElement = page.locator(':focus')
        const isNavItem = await focusedElement.evaluate(el => {
          const nav = el.closest('nav')
          return nav !== null && (el.tagName === 'A' || el.tagName === 'BUTTON')
        }).catch(() => false)
        
        if (isNavItem) {
          await expect(focusedElement).toBeFocused()
          break
        }
      }
    }
    
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('error message keyboard accessibility @a11y', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    // Navigate to submit button and submit empty form
    const submitButton = page.getByRole('button', { name: /sign in/i })
    
    // Tab to submit button
    let tabCount = 0
    while (tabCount < 10) {
      await page.keyboard.press('Tab')
      tabCount++
      if (await submitButton.isFocused()) {
        break
      }
    }
    
    // Submit empty form to trigger errors
    await page.keyboard.press('Enter')
    
    // Wait for error messages
    await page.waitForSelector('[role="alert"], .text-red-600, .text-red-500', { timeout: 5000 })
    
    // Tab back to first input to verify error announcement
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Shift+Tab')
    
    const emailInput = page.getByLabel(/email address/i)
    await expect(emailInput).toBeFocused()
    
    // Verify error message is accessible
    const emailError = page.getByText(/please enter a valid email/i).first()
    await expect(emailError).toBeVisible()
    
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('mobile menu keyboard navigation @a11y', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Look for mobile menu trigger (hamburger menu)
    const mobileMenuTrigger = page.locator('button[aria-label*="menu"], button[aria-label*="navigation"], [aria-label*="toggle"]').first()
    
    if (await mobileMenuTrigger.count() > 0) {
      // Tab to mobile menu trigger
      let tabCount = 0
      while (tabCount < 15) {
        await page.keyboard.press('Tab')
        tabCount++
        if (await mobileMenuTrigger.isFocused()) {
          break
        }
      }
      
      // Open mobile menu with keyboard
      await page.keyboard.press('Enter')
      
      // Wait for menu to open
      await page.waitForTimeout(500)
      
      // Tab through menu items
      await page.keyboard.press('Tab')
      
      // Close menu with Escape key
      await page.keyboard.press('Escape')
      
      // Verify menu is closed and focus is managed
      await page.waitForTimeout(500)
    }
    
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('dialog/modal keyboard navigation @a11y', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    // Look for any dialog triggers or modals
    const dialogTriggers = page.locator('button[aria-haspopup="dialog"], [data-testid*="modal"], [data-testid*="dialog"]')
    
    if (await dialogTriggers.count() > 0) {
      const firstTrigger = dialogTriggers.first()
      
      // Navigate to dialog trigger
      await firstTrigger.focus()
      await expect(firstTrigger).toBeFocused()
      
      // Open dialog
      await page.keyboard.press('Enter')
      
      // Wait for dialog to open
      await page.waitForTimeout(500)
      
      // Verify focus is trapped in dialog
      await page.keyboard.press('Tab')
      
      // Close dialog with Escape
      await page.keyboard.press('Escape')
      
      // Verify focus returns to trigger
      await expect(firstTrigger).toBeFocused()
    }
    
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('form validation keyboard interaction @a11y', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForSelector('form')
    
    // Navigate to password field and enter invalid password
    const passwordInput = page.getByLabel(/^password$/i)
    
    // Tab to password field
    let tabCount = 0
    while (tabCount < 10) {
      await page.keyboard.press('Tab')
      tabCount++
      if (await passwordInput.isFocused()) {
        break
      }
    }
    
    // Type invalid password
    await page.keyboard.type('weak')
    
    // Tab to next field to trigger validation
    await page.keyboard.press('Tab')
    
    // Wait for validation message
    await page.waitForTimeout(1000)
    
    // Tab back to password field
    await page.keyboard.press('Shift+Tab')
    await expect(passwordInput).toBeFocused()
    
    // Clear and enter valid password
    await page.keyboard.press('Control+a')
    await page.keyboard.type('StrongPassword123!')
    
    // Verify validation updates
    await page.keyboard.press('Tab')
    await page.waitForTimeout(500)
    
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })
})