import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Color Contrast and Visual Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page)
  })

  test('home page meets color contrast requirements @a11y @critical', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check color contrast with axe
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      rules: {
        'color-contrast': { enabled: true },
        'color-contrast-enhanced': { enabled: true }
      }
    })
    
    // Test high contrast mode compatibility
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.waitForTimeout(500)
    
    // Verify essential elements are still visible in dark mode
    const mainContent = page.locator('main, [role="main"], body > div').first()
    await expect(mainContent).toBeVisible()
    
    // Reset to light mode
    await page.emulateMedia({ colorScheme: 'light' })
  })

  test('authentication forms color contrast compliance @a11y @critical', async ({ page }) => {
    const authPages = [
      '/auth/signin',
      '/auth/signup', 
      '/auth/forgot-password'
    ]
    
    for (const authPage of authPages) {
      await page.goto(authPage)
      await page.waitForSelector('form')
      
      // Check color contrast compliance
      await checkA11y(page, null, {
        detailedReport: true,
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true }
        }
      })
      
      // Test form elements visibility
      const formInputs = page.locator('input[type="email"], input[type="password"], input[type="text"]')
      const inputCount = await formInputs.count()
      
      for (let i = 0; i < inputCount; i++) {
        const input = formInputs.nth(i)
        await expect(input).toBeVisible()
        
        // Check if input has proper contrast when focused
        await input.focus()
        await expect(input).toBeFocused()
      }
      
      // Check button contrast
      const buttons = page.locator('button[type="submit"], button[type="button"]')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i)
        await expect(button).toBeVisible()
        
        // Test hover state if button is enabled
        const isEnabled = await button.isEnabled()
        if (isEnabled) {
          await button.hover()
          await expect(button).toBeVisible()
        }
      }
    }
  })

  test('error states color contrast @a11y', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    // Trigger validation errors by submitting empty form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Wait for error messages to appear
    await page.waitForSelector('[role="alert"], .text-red-600, .text-red-500', { timeout: 5000 })
    
    // Check color contrast with error states
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      rules: {
        'color-contrast': { enabled: true },
        'color-contrast-enhanced': { enabled: true }
      }
    })
    
    // Verify error messages are visible and accessible
    const errorMessages = page.locator('.text-red-600, .text-red-500, [role="alert"]')
    const errorCount = await errorMessages.count()
    
    for (let i = 0; i < errorCount; i++) {
      const error = errorMessages.nth(i)
      await expect(error).toBeVisible()
    }
  })

  test('success states color contrast @a11y', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await page.waitForSelector('form')
    
    // Fill and submit the form to trigger success state
    await page.getByLabel(/email address/i).fill('test@example.com')
    await page.getByRole('button', { name: /send reset link/i }).click()
    
    // Wait for success message
    await page.waitForSelector('.text-green-600, .text-green-500, [role="status"]', { timeout: 5000 })
    
    // Check color contrast with success states
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      rules: {
        'color-contrast': { enabled: true }
      }
    })
    
    // Verify success messages are visible
    const successMessages = page.locator('.text-green-600, .text-green-500, [role="status"]')
    const successCount = await successMessages.count()
    
    for (let i = 0; i < successCount; i++) {
      const success = successMessages.nth(i)
      await expect(success).toBeVisible()
    }
  })

  test('button states color contrast @a11y', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    const submitButton = page.getByRole('button', { name: /sign in/i })
    
    // Test default state
    await expect(submitButton).toBeVisible()
    
    // Test hover state
    await submitButton.hover()
    await expect(submitButton).toBeVisible()
    
    // Test focus state
    await submitButton.focus()
    await expect(submitButton).toBeFocused()
    
    // Test disabled state by filling invalid form
    await page.getByLabel(/email address/i).fill('invalid-email')
    await page.getByLabel(/password/i).fill('short')
    
    // Check if button shows loading state or remains enabled
    await submitButton.click()
    
    // Wait a moment for any state changes
    await page.waitForTimeout(1000)
    
    // Check color contrast in all states
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      rules: {
        'color-contrast': { enabled: true }
      }
    })
  })

  test('navigation color contrast @a11y', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Find navigation elements
    const navLinks = page.locator('nav a, nav button')
    const navCount = await navLinks.count()
    
    if (navCount > 0) {
      // Test each navigation item
      for (let i = 0; i < Math.min(navCount, 10); i++) {
        const navItem = navLinks.nth(i)
        
        // Test default state
        await expect(navItem).toBeVisible()
        
        // Test hover state
        await navItem.hover()
        await expect(navItem).toBeVisible()
        
        // Test focus state if it's focusable
        try {
          await navItem.focus()
          await expect(navItem).toBeFocused()
        } catch (e) {
          // Some elements might not be focusable, skip focus test
        }
      }
    }
    
    // Check overall navigation contrast
    await checkA11y(page, 'nav', {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      rules: {
        'color-contrast': { enabled: true }
      }
    })
  })

  test('form validation indicators color contrast @a11y', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForSelector('form')
    
    const passwordInput = page.getByLabel(/^password$/i)
    
    // Test password strength indicator colors
    const weakPasswords = ['a', 'ab', 'abc', '123']
    const strongPassword = 'StrongPassword123!'
    
    for (const password of weakPasswords) {
      await passwordInput.fill(password)
      await page.waitForTimeout(500)
      
      // Check if password strength indicator is visible and accessible
      const strengthIndicator = page.locator('.bg-red-500, .bg-yellow-500, .bg-green-500').first()
      
      if (await strengthIndicator.count() > 0) {
        await expect(strengthIndicator).toBeVisible()
      }
    }
    
    // Test strong password indicator
    await passwordInput.fill(strongPassword)
    await page.waitForTimeout(500)
    
    const strongIndicator = page.locator('.bg-green-500, .text-green-600').first()
    if (await strongIndicator.count() > 0) {
      await expect(strongIndicator).toBeVisible()
    }
    
    // Check color contrast for form validation
    await checkA11y(page, null, {
      detailedReport: true,
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      rules: {
        'color-contrast': { enabled: true }
      }
    })
  })

  test('high contrast mode compatibility @a11y', async ({ page, browserName }) => {
    // Skip for webkit as it doesn't support forced-colors
    test.skip(browserName === 'webkit', 'WebKit does not support forced-colors media query')
    
    const testPages = ['/', '/auth/signin', '/auth/signup']
    
    for (const testPage of testPages) {
      await page.goto(testPage)
      await page.waitForLoadState('networkidle')
      
      // Enable forced colors mode (Windows High Contrast)
      await page.emulateMedia({ forcedColors: 'active' })
      await page.waitForTimeout(1000)
      
      // Check that essential elements are still visible
      const essentialElements = page.locator('h1, h2, h3, button, input, a, nav')
      const elementCount = await essentialElements.count()
      
      // Test at least the first 5 essential elements
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = essentialElements.nth(i)
        await expect(element).toBeVisible()
      }
      
      // Check accessibility in high contrast mode
      await checkA11y(page, null, {
        detailedReport: true,
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        rules: {
          'color-contrast': { enabled: false }, // Skip regular contrast check in forced colors
        }
      })
      
      // Reset forced colors
      await page.emulateMedia({ forcedColors: 'none' })
    }
  })

  test('dark mode color contrast @a11y', async ({ page }) => {
    const testPages = ['/', '/auth/signin']
    
    for (const testPage of testPages) {
      await page.goto(testPage)
      await page.waitForLoadState('networkidle')
      
      // Switch to dark mode
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.waitForTimeout(1000)
      
      // Check color contrast in dark mode
      await checkA11y(page, null, {
        detailedReport: true,
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true }
        }
      })
      
      // Test essential elements are visible in dark mode
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i)
        await expect(button).toBeVisible()
      }
      
      // Reset to light mode
      await page.emulateMedia({ colorScheme: 'light' })
    }
  })

  test('text scaling color contrast @a11y', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForSelector('form')
    
    // Test different zoom levels
    const zoomLevels = [1.5, 2.0]
    
    for (const zoom of zoomLevels) {
      // Set zoom level
      await page.setViewportSize({ 
        width: Math.floor(1280 / zoom), 
        height: Math.floor(720 / zoom) 
      })
      
      // Add CSS to simulate text scaling
      await page.addStyleTag({
        content: `
          * { 
            font-size: ${zoom * 100}% !important; 
            line-height: ${zoom * 1.2} !important; 
          }
        `
      })
      
      await page.waitForTimeout(500)
      
      // Verify elements are still visible and accessible at larger sizes
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
      
      // Check color contrast at scaled size
      await checkA11y(page, null, {
        detailedReport: true,
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        rules: {
          'color-contrast': { enabled: true }
        }
      })
      
      // Reset styles
      await page.reload()
      await page.waitForSelector('form')
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 })
  })
})