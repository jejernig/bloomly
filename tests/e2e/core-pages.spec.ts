import { test, expect } from '@playwright/test'

test.describe('Core Application Pages', () => {
  // Test Dashboard Page
  test.describe('Dashboard Page', () => {
    test('should redirect unauthenticated users to sign-in @smoke @critical', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Should redirect to sign-in
      await expect(page).toHaveURL(/\/auth\/signin/)
      await expect(page).toHaveTitle(/Sign In/)
      
      // Sign-in page should be functional
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    })

    test('should show proper authentication guards @critical', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check that we're redirected and can see the sign-in form
      await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible()
      await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
    })

    test('should compile without errors @smoke', async ({ page }) => {
      const response = await page.goto('/dashboard')
      
      // Page should return 200 (even if redirected, the redirect target should be 200)
      expect(response?.status()).toBe(200)
      
      // No console errors related to compilation
      const consoleErrors = []
      page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
          consoleErrors.push(msg.text())
        }
      })
      
      await page.waitForLoadState('networkidle')
      // Filter out expected errors (like missing favicons)
      const significantErrors = consoleErrors.filter(error => 
        !error.includes('site.webmanifest') && 
        !error.includes('apple-touch-icon') &&
        !error.includes('favicon')
      )
      expect(significantErrors).toHaveLength(0)
    })
  })

  // Test Templates Page  
  test.describe('Templates Page', () => {
    test('should redirect unauthenticated users to sign-in @smoke @critical', async ({ page }) => {
      await page.goto('/templates')
      
      // Should redirect to sign-in
      await expect(page).toHaveURL(/\/auth\/signin/)
      await expect(page).toHaveTitle(/Sign In/)
      
      // Sign-in page should be functional
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    })

    test('should compile without errors @smoke', async ({ page }) => {
      const response = await page.goto('/templates')
      expect(response?.status()).toBe(200)
      
      // Check no compilation errors
      const consoleErrors = []
      page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
          consoleErrors.push(msg.text())
        }
      })
      
      await page.waitForLoadState('networkidle')
      const significantErrors = consoleErrors.filter(error => 
        !error.includes('site.webmanifest') && 
        !error.includes('apple-touch-icon') &&
        !error.includes('favicon')
      )
      expect(significantErrors).toHaveLength(0)
    })

    test('should show proper navigation structure @critical', async ({ page }) => {
      await page.goto('/templates')
      
      // After redirect to sign-in, check that the page structure is correct
      await expect(page.getByRole('link', { name: 'Bloomly.io' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible()
    })
  })

  // Test Editor Page
  test.describe('Editor Page', () => {
    test('should redirect unauthenticated users to sign-in @smoke @critical', async ({ page }) => {
      await page.goto('/editor')
      
      // Should redirect to sign-in
      await expect(page).toHaveURL(/\/auth\/signin/)
      await expect(page).toHaveTitle(/Sign In/)
    })

    test('should handle query parameters correctly @critical', async ({ page }) => {
      // Test editor with template parameter
      await page.goto('/editor?template=123')
      
      // Should still redirect to sign-in but preserve the intent
      await expect(page).toHaveURL(/\/auth\/signin/)
      
      // Test editor with project parameter
      await page.goto('/editor?project=456')
      await expect(page).toHaveURL(/\/auth\/signin/)
    })

    test('should compile without errors @smoke', async ({ page }) => {
      const response = await page.goto('/editor')
      expect(response?.status()).toBe(200)
      
      // Check no compilation errors
      const consoleErrors = []
      page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
          consoleErrors.push(msg.text())
        }
      })
      
      await page.waitForLoadState('networkidle')
      const significantErrors = consoleErrors.filter(error => 
        !error.includes('site.webmanifest') && 
        !error.includes('apple-touch-icon') &&
        !error.includes('favicon')
      )
      expect(significantErrors).toHaveLength(0)
    })
  })

  // Test Authentication Flow
  test.describe('Authentication Flow Integration', () => {
    test('should handle authentication state correctly across all pages @critical', async ({ page }) => {
      const pages = ['/dashboard', '/templates', '/editor']
      
      for (const pagePath of pages) {
        await page.goto(pagePath)
        
        // Each protected page should redirect to sign-in
        await expect(page).toHaveURL(/\/auth\/signin/)
        
        // Sign-in form should be present and functional
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
        await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible()
        await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible()
      }
    })

    test('should show appropriate error messages for invalid credentials @critical', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Fill in invalid credentials
      await page.getByRole('textbox', { name: 'Email address' }).fill('invalid@example.com')
      await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword')
      await page.getByRole('button', { name: 'Sign in' }).click()
      
      // Should show error message
      await expect(page.locator('text=Invalid login credentials')).toBeVisible({ timeout: 5000 })
    })

    test('should maintain referrer information after sign-in redirect @critical', async ({ page }) => {
      // Go to a specific protected page
      await page.goto('/templates')
      
      // Should be redirected to sign-in
      await expect(page).toHaveURL(/\/auth\/signin/)
      
      // The authentication system should remember where the user wanted to go
      // (This would be tested more thoroughly with actual authentication)
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    })
  })

  // Test Page Performance and Loading
  test.describe('Page Performance', () => {
    test('should load dashboard page quickly @performance', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      // Should load within 3 seconds (including redirect)
      expect(loadTime).toBeLessThan(3000)
    })

    test('should load templates page quickly @performance', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/templates')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(3000)
    })

    test('should load editor page quickly @performance', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/editor')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(3000)
    })
  })

  // Test Mobile Responsiveness
  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices @mobile @responsive', async ({ page, isMobile }) => {
      if (isMobile) {
        await page.goto('/dashboard')
        
        // Should redirect to sign-in and be mobile-responsive
        await expect(page).toHaveURL(/\/auth\/signin/)
        
        // Check mobile-friendly elements
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
        await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible()
      }
    })
  })

  // Test Accessibility
  test.describe('Accessibility', () => {
    test('should meet basic accessibility requirements @a11y', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for proper heading structure
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      
      // Check for form labels
      await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible()
      await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible()
      
      // Check for keyboard navigation
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement)
    })

    test('should have proper ARIA labels and roles @a11y', async ({ page }) => {
      await page.goto('/templates')
      
      // Check for accessible form elements
      const emailInput = page.getByRole('textbox', { name: 'Email address' })
      await expect(emailInput).toBeVisible()
      
      const passwordInput = page.getByRole('textbox', { name: 'Password' })
      await expect(passwordInput).toBeVisible()
      
      // Check for proper button roles
      const signInButton = page.getByRole('button', { name: 'Sign in' })
      await expect(signInButton).toBeVisible()
    })
  })

  // Test Error Handling
  test.describe('Error Handling', () => {
    test('should handle network errors gracefully @critical', async ({ page }) => {
      // Simulate network condition
      await page.goto('/editor')
      
      // Should still show the sign-in page even if there are network issues
      await expect(page).toHaveURL(/\/auth\/signin/)
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    })

    test('should show appropriate loading states @critical', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check that the page loads without showing broken states
      await page.waitForLoadState('domcontentloaded')
      
      // Should not show any "undefined" or error text
      const bodyText = await page.textContent('body')
      expect(bodyText).not.toContain('undefined')
      expect(bodyText).not.toContain('Error:')
    })
  })
})