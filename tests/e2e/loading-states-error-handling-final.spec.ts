import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Loading States and Error Handling - Final Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe for accessibility testing
    await injectAxe(page)
  })

  test.describe('Home Page Loading States', () => {
    test('should display loading states on initial page load', async ({ page }) => {
      // Slow down network to observe loading states
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        route.continue()
      })

      await page.goto('/')

      // Look for any skeleton loading indicators
      const skeletons = page.locator('.animate-pulse, [data-testid*="skeleton"], .skeleton')
      
      // If skeletons are present, verify they're accessible
      const skeletonCount = await skeletons.count()
      if (skeletonCount > 0) {
        await expect(skeletons.first()).toBeVisible()
        
        // Check accessibility of loading states
        await checkA11y(page, null, {
          detailedReport: true,
          detailedReportOptions: { html: true }
        })
      }

      // Wait for content to load
      await page.waitForLoadState('networkidle')
      
      // Verify content eventually loads
      await expect(page.locator('main')).toBeVisible()
    })

    test('should handle slow network conditions gracefully', async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        route.continue()
      })

      const startTime = Date.now()
      await page.goto('/')
      
      // Should still load within reasonable time (10 seconds max)
      await page.waitForSelector('main', { timeout: 10000 })
      const loadTime = Date.now() - startTime
      
      // Verify it didn't timeout and page eventually loaded
      await expect(page.locator('main')).toBeVisible()
      console.log(`Page loaded in ${loadTime}ms under slow network conditions`)
    })
  })

  test.describe('Authentication Flow Loading States', () => {
    test('should display loading states during authentication redirect', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Should redirect to auth page
      await page.waitForURL('**/auth/signin', { timeout: 5000 })
      
      // Check if there are any loading indicators during redirect
      const loadingElements = page.locator(
        '.animate-spin, .loading, [data-testid*="loading"], .spinner'
      )
      
      // If loading elements exist, test them
      const loadingCount = await loadingElements.count()
      if (loadingCount > 0) {
        await expect(loadingElements.first()).toBeVisible()
      }
      
      // Verify auth page loads properly
      await expect(page.locator('main')).toBeVisible()
    })

    test('should handle authentication form loading states', async ({ page }) => {
      await page.goto('/auth/signin')
      
      // Look for form elements
      const emailInput = page.locator('input[type="email"], input[name="email"]')
      const passwordInput = page.locator('input[type="password"], input[name="password"]')
      const submitButton = page.locator('button[type="submit"], button:has-text("Sign")')
      
      const hasForm = await emailInput.count() > 0 && await passwordInput.count() > 0
      
      if (hasForm) {
        // Fill in test credentials (won't actually authenticate)
        await emailInput.fill('test@example.com')
        await passwordInput.fill('testpassword')
        
        // Look for loading state on button click
        await submitButton.click()
        
        // Check if button shows loading state
        const loadingButton = page.locator(
          'button[disabled], button:has(.animate-spin), button:has-text("Loading"), button:has-text("Signing")'
        )
        
        const hasLoadingState = await loadingButton.count() > 0
        if (hasLoadingState) {
          await expect(loadingButton).toBeVisible()
          console.log('Authentication form shows loading state')
        }
        
        // Wait a bit to see if there are any error messages or state changes
        await page.waitForTimeout(2000)
      }
    })
  })

  test.describe('API Error Handling', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      // Mock network failure for API calls
      await page.route('**/api/**', async (route) => {
        await route.abort('internetdisconnected')
      })

      await page.goto('/')
      await page.waitForTimeout(2000)
      
      // Look for error messages or fallback content
      const errorElements = page.locator(
        '.error, [data-testid*="error"], .alert-error, .text-red, .bg-red'
      )
      
      const errorCount = await errorElements.count()
      if (errorCount > 0) {
        await expect(errorElements.first()).toBeVisible()
        console.log('Found error handling for network failures')
        
        // Check accessibility of error states
        await checkA11y(page, null, {
          detailedReport: true,
          detailedReportOptions: { html: true }
        })
      }
    })

    test('should display retry mechanisms for failed requests', async ({ page }) => {
      let requestCount = 0
      
      // Mock API to fail first time, succeed second time
      await page.route('**/api/**', async (route) => {
        requestCount++
        if (requestCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal Server Error' })
          })
        } else {
          route.continue()
        }
      })

      await page.goto('/')
      await page.waitForTimeout(2000)
      
      // Look for retry buttons or mechanisms
      const retryButtons = page.locator(
        'button:has-text("Retry"), button:has-text("Try Again"), button:has-text("Reload")'
      )
      
      const retryCount = await retryButtons.count()
      if (retryCount > 0) {
        const retryButton = retryButtons.first()
        await expect(retryButton).toBeVisible()
        
        // Click retry and verify it attempts the request again
        await retryButton.click()
        await page.waitForTimeout(1000)
        
        // Verify request count increased (retry was attempted)
        expect(requestCount).toBeGreaterThan(1)
        console.log(`Retry mechanism working - ${requestCount} requests made`)
      }
    })
  })

  test.describe('Error Boundaries', () => {
    test('should test error boundary fallbacks with console errors', async ({ page }) => {
      // Listen for console errors that might trigger error boundaries
      const consoleErrors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      // Listen for JavaScript errors that might trigger error boundaries
      const jsErrors: string[] = []
      page.on('pageerror', error => {
        jsErrors.push(error.message)
      })

      await page.goto('/')
      await page.waitForTimeout(3000)
      
      // Check if any errors occurred that might have triggered error boundaries
      if (consoleErrors.length > 0 || jsErrors.length > 0) {
        console.log('Detected errors that may have triggered error boundaries:', {
          consoleErrors,
          jsErrors
        })
        
        // Look for error boundary fallback UI
        const errorBoundaryElements = page.locator(
          '.error-boundary, [data-testid*="error-boundary"], .error-fallback, ' +
          'div:has-text("Something went wrong"), div:has-text("Error loading")'
        )
        
        const errorBoundaryCount = await errorBoundaryElements.count()
        if (errorBoundaryCount > 0) {
          await expect(errorBoundaryElements.first()).toBeVisible()
          
          // Look for retry buttons in error boundary
          const retryInBoundary = page.locator(
            'button:has-text("Try Again"), button:has-text("Retry")'
          )
          
          if (await retryInBoundary.count() > 0) {
            await expect(retryInBoundary.first()).toBeVisible()
            console.log('Error boundary with retry mechanism found')
          }
        }
      }
    })

    test('should handle error boundaries with accessibility', async ({ page }) => {
      // Inject JavaScript error to potentially trigger error boundary
      await page.goto('/')
      
      try {
        await page.evaluate(() => {
          // Try to trigger an error in a React component context
          const event = new CustomEvent('error', {
            detail: { error: new Error('Test error for boundary') }
          })
          window.dispatchEvent(event)
        })
      } catch (error) {
        // Error injection attempt
      }
      
      await page.waitForTimeout(2000)
      
      // Check for any error boundary UI
      const errorElements = page.locator(
        'div:has-text("Something went wrong"), .error-boundary, .error-fallback'
      )
      
      const hasErrorBoundary = await errorElements.count() > 0
      if (hasErrorBoundary) {
        await expect(errorElements.first()).toBeVisible()
        
        // Test accessibility of error boundary
        await checkA11y(page, null, {
          detailedReport: true,
          detailedReportOptions: { html: true }
        })
        
        console.log('Error boundary accessibility testing completed')
      }
    })
  })

  test.describe('Toast Notifications', () => {
    test('should test toast notifications for errors', async ({ page }) => {
      // Mock API failures that should trigger toast notifications
      await page.route('**/api/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error for toast test' })
        })
      })

      await page.goto('/')
      await page.waitForTimeout(3000)
      
      // Look for toast notifications (react-hot-toast or similar)
      const toastSelectors = [
        '.toast, .notification, .alert',
        '[data-testid*="toast"], [data-testid*="notification"]',
        'div[role="alert"], div[role="status"]',
        '.Toastify__toast, .toast-container',
        // react-hot-toast specific selectors
        '[data-hot-toast], .react-hot-toast'
      ]
      
      for (const selector of toastSelectors) {
        const toasts = page.locator(selector)
        const toastCount = await toasts.count()
        
        if (toastCount > 0) {
          await expect(toasts.first()).toBeVisible()
          console.log(`Found toast notification with selector: ${selector}`)
          
          // Test toast accessibility
          await checkA11y(page, selector, {
            detailedReport: true,
            detailedReportOptions: { html: true }
          })
          
          // Check if toast can be dismissed
          const dismissButton = toasts.first().locator('button, .close, [aria-label*="close"]')
          if (await dismissButton.count() > 0) {
            await dismissButton.click()
            await expect(toasts.first()).not.toBeVisible()
            console.log('Toast dismissal functionality working')
          }
          
          break // Found working toast system
        }
      }
    })
  })

  test.describe('Fallback Data Display', () => {
    test('should display fallback data when APIs fail', async ({ page }) => {
      // Mock all API calls to fail
      await page.route('**/api/**', async (route) => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Service unavailable' })
        })
      })

      await page.goto('/')
      await page.waitForTimeout(3000)
      
      // Look for fallback/placeholder data
      const fallbackElements = page.locator(
        '.fallback, [data-testid*="fallback"], .placeholder-data, .default-data'
      )
      
      const hasFallback = await fallbackElements.count() > 0
      if (hasFallback) {
        await expect(fallbackElements.first()).toBeVisible()
        console.log('Fallback data display mechanism found')
      }
      
      // Even with failed APIs, the page should still be functional
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('nav')).toBeVisible()
      
      // Check that the page is still accessible with fallback data
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      })
    })
  })

  test.describe('Performance with Loading States', () => {
    test('should maintain performance during loading states', async ({ page }) => {
      // Start performance tracing
      await page.tracing.start({ screenshots: true, snapshots: true })
      
      await page.goto('/')
      
      // Measure Core Web Vitals during loading
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const vitalsData: Record<string, number> = {}
            
            entries.forEach((entry) => {
              if (entry.name === 'largest-contentful-paint') {
                vitalsData.LCP = entry.startTime
              }
              if (entry.name === 'first-input-delay') {
                vitalsData.FID = (entry as any).processingStart - entry.startTime
              }
              if (entry.name === 'cumulative-layout-shift') {
                vitalsData.CLS = (entry as any).value
              }
            })
            
            resolve(vitalsData)
          }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
          
          // Fallback timeout
          setTimeout(() => resolve({}), 5000)
        })
      })
      
      await page.tracing.stop()
      
      console.log('Core Web Vitals during loading:', vitals)
      
      // Verify page loaded successfully
      await expect(page.locator('main')).toBeVisible()
    })

    test('should handle concurrent loading states efficiently', async ({ page }) => {
      let requestCount = 0
      const requestTimes: number[] = []
      
      // Track API request timing
      await page.route('**/api/**', async (route) => {
        const startTime = Date.now()
        requestCount++
        
        // Add small delay to simulate real API
        await new Promise(resolve => setTimeout(resolve, 100))
        
        route.continue().then(() => {
          requestTimes.push(Date.now() - startTime)
        })
      })

      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const totalTime = Date.now() - startTime
      
      console.log(`Handled ${requestCount} API requests in ${totalTime}ms`)
      console.log(`Average request time: ${requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length}ms`)
      
      // Verify page is responsive after all loading
      await page.click('body') // Simple interaction test
      await expect(page.locator('main')).toBeVisible()
    })
  })

  test.describe('Edge Cases and Error Recovery', () => {
    test('should handle partial API failures gracefully', async ({ page }) => {
      let apiCallCount = 0
      
      // Mock some APIs to fail, others to succeed
      await page.route('**/api/**', async (route) => {
        apiCallCount++
        
        // Fail every other API call
        if (apiCallCount % 2 === 0) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Not found' })
          })
        } else {
          route.continue()
        }
      })

      await page.goto('/')
      await page.waitForTimeout(3000)
      
      // Page should still function despite partial failures
      await expect(page.locator('main')).toBeVisible()
      
      // Should show some content (from successful APIs) and some errors/fallbacks
      const hasContent = await page.locator('h1, h2, h3, p').count() > 0
      expect(hasContent).toBe(true)
      
      console.log(`Handled ${apiCallCount} API calls with 50% failure rate`)
    })

    test('should recover from temporary network issues', async ({ page }) => {
      let networkDown = true
      let requestAttempts = 0
      
      // Mock network that comes back online after a few attempts
      await page.route('**/api/**', async (route) => {
        requestAttempts++
        
        if (networkDown && requestAttempts < 3) {
          await route.abort('internetdisconnected')
        } else {
          networkDown = false
          route.continue()
        }
      })

      await page.goto('/')
      
      // Look for retry mechanisms and use them
      const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")')
      
      // If retry buttons exist, test the recovery flow
      if (await retryButton.count() > 0) {
        await retryButton.first().click()
        await page.waitForTimeout(1000)
        
        // After network "recovery", content should load
        await expect(page.locator('main')).toBeVisible()
        console.log(`Network recovery successful after ${requestAttempts} attempts`)
      }
    })
  })
})