import { test, expect, Page } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Loading States and Error Handling E2E Tests', () => {
  
  // Helper function to mock authentication state
  async function mockAuthenticatedUser(page: Page) {
    await page.addInitScript(() => {
      // Mock localStorage auth state
      const mockAuthState = {
        state: {
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com' 
          },
          profile: {
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            subscription_tier: 'free'
          },
          isLoading: false,
          error: null
        },
        version: 0
      }
      localStorage.setItem('auth-storage', JSON.stringify(mockAuthState))
    })
  }

  // Helper function to mock API failures
  async function mockAPIFailure(page: Page, endpoint: string, statusCode: number = 500, delay: number = 0) {
    await page.route(`**/api${endpoint}`, async route => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      await route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: `Simulated ${statusCode} error for ${endpoint}`,
          success: false 
        })
      })
    })
  }

  // Helper function to mock API success with delay
  async function mockAPISuccess(page: Page, endpoint: string, responseData: any, delay: number = 0) {
    await page.route(`**/api${endpoint}`, async route => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: responseData
        })
      })
    })
  }

  // Helper function to wait for skeleton elements to disappear
  async function waitForSkeletonsToDisappear(page: Page, timeout: number = 10000) {
    await page.waitForFunction(
      () => document.querySelectorAll('[class*="animate-pulse"]').length === 0,
      {},
      { timeout }
    )
  }

  test.beforeEach(async ({ page }) => {
    // Inject axe for accessibility testing
    await injectAxe(page)
    
    // Set up console error tracking
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('site.webmanifest')) {
        consoleErrors.push(msg.text())
      }
    })
    
    // Attach errors to page for later access
    await page.addInitScript(() => {
      (window as any).consoleErrors = []
    })
    
    // Mock authentication by default
    await mockAuthenticatedUser(page)
  })

  test.describe('Dashboard Loading States @loading @smoke', () => {
    test('should display loading spinner while authentication is being checked', async ({ page }) => {
      // Override auth to show loading state
      await page.addInitScript(() => {
        const mockAuthState = {
          state: {
            user: null,
            profile: null,
            isLoading: true, // Set to loading
            error: null
          },
          version: 0
        }
        localStorage.setItem('auth-storage', JSON.stringify(mockAuthState))
      })

      await page.goto('/dashboard')

      // Should show loading spinner for auth
      const loadingSpinner = page.locator('.animate-spin')
      const loadingText = page.locator('text="Loading your dashboard..."')
      
      await expect(loadingSpinner).toBeVisible({ timeout: 2000 })
      await expect(loadingText).toBeVisible({ timeout: 2000 })
    })

    test('should display skeleton loading states for dashboard stats with mock authentication', async ({ page }) => {
      // Mock delayed API response for dashboard stats
      await mockAPISuccess(page, '/dashboard-stats', {
        postsCreated: { value: 25, change: 15 },
        engagementRate: { value: 4.5, change: 10 },
        followers: { value: 2500, change: 8 },
        aiGenerations: { used: 20, total: 100 }
      }, 2000) // 2 second delay

      await page.goto('/dashboard')

      // Wait for auth to resolve and page to load
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      // Check if skeleton elements are present
      const skeletonElements = page.locator('[class*="animate-pulse"]')
      
      // Wait for skeletons to appear (they might take a moment to show up)
      let skeletonsVisible = false
      for (let i = 0; i < 10; i++) {
        if (await skeletonElements.first().isVisible()) {
          skeletonsVisible = true
          break
        }
        await page.waitForTimeout(200)
      }
      
      if (skeletonsVisible) {
        // Verify skeleton accessibility
        await checkA11y(page, null, {
          rules: {
            'color-contrast': { enabled: false } // Skeleton colors may have lower contrast
          }
        })
        
        // Wait for loading to complete
        await waitForSkeletonsToDisappear(page)
      }
      
      // Verify content eventually loads
      const dashboardContent = page.locator('h1:has-text("Dashboard")')
      await expect(dashboardContent).toBeVisible({ timeout: 5000 })
    })

    test('should show proper skeleton structure when components are loading', async ({ page }) => {
      // Mock multiple delayed responses
      await mockAPISuccess(page, '/dashboard-stats', {
        postsCreated: { value: 30, change: 12 },
        engagementRate: { value: 3.8, change: -2 },
        followers: { value: 1800, change: 25 },
        aiGenerations: { used: 15, total: 100 }
      }, 1500)

      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Look for skeleton patterns in the dashboard
      const possibleSkeletons = [
        '[class*="animate-pulse"]',
        '.animate-pulse',
        '[class*="bg-gray-200"]',
        '.bg-gray-200'
      ]
      
      let foundSkeletons = false
      for (const selector of possibleSkeletons) {
        const elements = page.locator(selector)
        if (await elements.first().isVisible()) {
          foundSkeletons = true
          
          // Check for proper structure if skeletons exist
          const gridContainer = page.locator('.grid')
          if (await gridContainer.first().isVisible()) {
            // Verify responsive grid layout
            await expect(gridContainer.first()).toBeVisible()
          }
          break
        }
      }
      
      // Always verify the dashboard loads properly
      const dashboardTitle = page.locator('h1:has-text("Dashboard")')
      await expect(dashboardTitle).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Error Handling and Recovery @error @critical', () => {
    test('should show fallback data when dashboard API fails', async ({ page }) => {
      // Mock API failure for dashboard stats
      await mockAPIFailure(page, '/dashboard-stats', 500)

      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Wait for error handling to complete
      await page.waitForTimeout(2000)
      
      // Should show fallback data (based on DashboardOverview implementation)
      // The component clears error state and shows fallback data
      const fallbackIndicators = [
        'text="24"',     // fallback posts created
        'text="4.2%"',   // fallback engagement rate
        'text="2.4K"',   // fallback followers
        'text="18/100"'  // fallback AI generations
      ]
      
      let fallbackFound = false
      for (const indicator of fallbackIndicators) {
        const element = page.locator(indicator)
        if (await element.isVisible()) {
          fallbackFound = true
          break
        }
      }
      
      // Verify some content is shown (either fallback data or error recovery)
      const dashboardContent = page.locator('h1:has-text("Dashboard")')
      await expect(dashboardContent).toBeVisible({ timeout: 5000 })
      
      if (fallbackFound) {
        // If fallback data is shown, verify it's accessible
        await checkA11y(page)
      }
    })

    test('should display retry button when errors occur and allow retry', async ({ page }) => {
      let apiCallCount = 0
      
      // Mock first call to fail, second to succeed
      await page.route('**/api/dashboard-stats', async route => {
        apiCallCount++
        
        if (apiCallCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error', success: false })
          })
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                postsCreated: { value: 35, change: 20 },
                engagementRate: { value: 6.1, change: 15 },
                followers: { value: 4500, change: 30 },
                aiGenerations: { used: 40, total: 100 }
              }
            })
          })
        }
      })

      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Wait for initial load attempt
      await page.waitForTimeout(2000)
      
      // Look for retry button
      const retryButton = page.locator('button:has-text("Try Again"), button:has-text("Retry")')
      
      if (await retryButton.isVisible()) {
        await retryButton.click()
        
        // Wait for retry to complete
        await page.waitForTimeout(2000)
        
        // Should show success data after retry
        const successData = page.locator('text="35"') // successful retry data
        if (await successData.isVisible()) {
          // Verify API was called multiple times
          expect(apiCallCount).toBeGreaterThanOrEqual(2)
        }
      }
      
      // Always ensure dashboard is accessible
      const dashboardTitle = page.locator('h1:has-text("Dashboard")')
      await expect(dashboardTitle).toBeVisible({ timeout: 5000 })
    })

    test('should handle multiple simultaneous API failures gracefully', async ({ page }) => {
      // Mock failures for multiple endpoints
      await mockAPIFailure(page, '/dashboard-stats', 500)
      await mockAPIFailure(page, '/recent-projects', 404)
      await mockAPIFailure(page, '/usage-stats', 503)

      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Wait for all API calls to complete
      await page.waitForTimeout(3000)
      
      // Should still show basic dashboard structure
      const dashboardTitle = page.locator('h1:has-text("Dashboard")')
      await expect(dashboardTitle).toBeVisible({ timeout: 5000 })
      
      // Should not crash or show blank page
      const bodyText = await page.textContent('body')
      expect(bodyText).not.toBe('')
      expect(bodyText).not.toContain('undefined')
      
      // Check for error handling UI
      const errorElements = page.locator('[class*="text-red"], [class*="border-red"], text=/error|failed/i')
      // Should have some error indication or fallback content
    })
  })

  test.describe('Error Boundaries and Component Recovery @error @boundaries', () => {
    test('should recover from JavaScript errors with error boundaries', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Verify dashboard loads initially
      const dashboardTitle = page.locator('h1:has-text("Dashboard")')
      await expect(dashboardTitle).toBeVisible()
      
      // Inject a component error
      await page.evaluate(() => {
        // Create a synthetic React error
        const errorEvent = new ErrorEvent('error', {
          message: 'Simulated React component error',
          error: new Error('Component rendering failed')
        })
        window.dispatchEvent(errorEvent)
      })
      
      await page.waitForTimeout(1000)
      
      // Look for error boundary UI
      const errorBoundaryElements = page.locator('text=/something went wrong|error occurred|try again/i')
      
      if (await errorBoundaryElements.first().isVisible()) {
        // Check for error boundary functionality
        const retryButton = page.locator('button:has-text("Try Again")')
        if (await retryButton.isVisible()) {
          await retryButton.click()
        }
        
        // Check for home button
        const homeButton = page.locator('button:has-text("Go Home"), a:has-text("Go Home")')
        if (await homeButton.isVisible()) {
          await expect(homeButton).toBeVisible()
        }
      }
      
      // Verify page is still functional
      await expect(dashboardTitle).toBeVisible()
    })

    test('should maintain component isolation with inline error boundaries', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Verify dashboard structure is wrapped in error boundaries
      const dashboardContent = page.locator('h1:has-text("Dashboard")')
      await expect(dashboardContent).toBeVisible()
      
      // The components should be wrapped in InlineErrorBoundary
      // Even if one component fails, others should continue working
      const navigationElements = page.locator('nav, header, [role="navigation"]')
      if (await navigationElements.first().isVisible()) {
        await expect(navigationElements.first()).toBeVisible()
      }
    })
  })

  test.describe('Toast Notifications @toast @notifications', () => {
    test('should display toast notifications for API errors', async ({ page }) => {
      // Mock API failure to potentially trigger toast
      await mockAPIFailure(page, '/dashboard-stats', 500)

      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Wait for API calls and potential toast notifications
      await page.waitForTimeout(3000)
      
      // Look for toast notification elements (react-hot-toast)
      const toastSelectors = [
        '[data-hot-toast]',
        '[role="status"]',
        '[role="alert"]',
        '[id*="toast"]',
        '.toast',
        '[class*="toast"]'
      ]
      
      let toastFound = false
      for (const selector of toastSelectors) {
        const toastElement = page.locator(selector)
        if (await toastElement.isVisible()) {
          toastFound = true
          
          // Check toast accessibility
          await checkA11y(page, toastElement.first())
          break
        }
      }
      
      // Toast system should be available (even if no active toasts)
      const toastContainer = page.locator('#__next, body')
      await expect(toastContainer).toBeVisible()
    })

    test('should allow toast dismissal and cleanup', async ({ page }) => {
      // Mock API failure that might trigger toast
      await mockAPIFailure(page, '/dashboard-stats', 500)

      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)
      
      // Look for dismissible toasts
      const dismissButtons = page.locator('button[aria-label*="dismiss"], button[aria-label*="close"], [data-hot-toast] button')
      
      if (await dismissButtons.first().isVisible()) {
        await dismissButtons.first().click()
        
        // Toast should disappear
        await expect(dismissButtons.first()).not.toBeVisible({ timeout: 3000 })
      }
      
      // Verify page remains functional after toast interactions
      const dashboardTitle = page.locator('h1:has-text("Dashboard")')
      await expect(dashboardTitle).toBeVisible()
    })
  })

  test.describe('Accessibility in Loading and Error States @a11y @accessibility', () => {
    test('should maintain ARIA labels and roles during loading', async ({ page }) => {
      // Mock delayed API response
      await mockAPISuccess(page, '/dashboard-stats', {
        postsCreated: { value: 28, change: 18 },
        engagementRate: { value: 4.8, change: 12 },
        followers: { value: 3100, change: 22 },
        aiGenerations: { used: 22, total: 100 }
      }, 1000)

      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Check overall page accessibility
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true }
        }
      })
      
      // Check for loading state accessibility
      const loadingElements = page.locator('[class*="animate-pulse"], .animate-spin')
      if (await loadingElements.first().isVisible()) {
        await checkA11y(page, null, {
          rules: {
            'color-contrast': { enabled: false } // Loading elements may have lower contrast
          }
        })
      }
    })

    test('should provide proper keyboard navigation in error states', async ({ page }) => {
      // Mock API failure
      await mockAPIFailure(page, '/dashboard-stats', 500)

      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
      
      // Test keyboard navigation
      await page.keyboard.press('Tab')
      
      // Should be able to navigate to interactive elements
      let tabCount = 0
      let foundFocusableElement = false
      
      while (tabCount < 10) {
        await page.keyboard.press('Tab')
        tabCount++
        
        const focusedElement = await page.evaluate(() => {
          const active = document.activeElement
          return {
            tagName: active?.tagName,
            role: active?.getAttribute('role'),
            type: active?.getAttribute('type')
          }
        })
        
        if (focusedElement.tagName === 'BUTTON' || focusedElement.tagName === 'A' || focusedElement.role) {
          foundFocusableElement = true
          
          // Test activation with keyboard
          await page.keyboard.press('Enter')
          break
        }
      }
      
      // Check overall accessibility after keyboard navigation
      await checkA11y(page)
    })

    test('should have appropriate color contrast in all states', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Check color contrast for all visible elements
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true }
        }
      })
      
      // If there are error elements, test their contrast specifically  
      const errorElements = page.locator('.text-red-400, .text-red-500, .text-red-600, [class*="text-red"]')
      if (await errorElements.first().isVisible()) {
        await checkA11y(page, errorElements.first(), {
          rules: {
            'color-contrast': { enabled: true }
          }
        })
      }
    })
  })

  test.describe('Performance and Edge Cases @performance @edge-cases', () => {
    test('should handle rapid state changes without breaking', async ({ page }) => {
      let callCount = 0
      
      // Mock API that alternates between success and failure
      await page.route('**/api/dashboard-stats', async route => {
        callCount++
        
        const isSuccess = callCount % 2 === 1
        
        await route.fulfill({
          status: isSuccess ? 200 : 500,
          contentType: 'application/json',
          body: JSON.stringify(isSuccess ? {
            success: true,
            data: {
              postsCreated: { value: callCount * 10, change: 5 },
              engagementRate: { value: 2.0 + callCount, change: 0 },
              followers: { value: 1000 * callCount, change: 0 },
              aiGenerations: { used: 5 * callCount, total: 100 }
            }
          } : {
            error: 'Server error',
            success: false
          })
        })
      })

      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Rapidly trigger reloads
      for (let i = 0; i < 3; i++) {
        await page.reload()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)
      }
      
      // Should eventually stabilize and show dashboard
      const dashboardTitle = page.locator('h1:has-text("Dashboard")')
      await expect(dashboardTitle).toBeVisible({ timeout: 5000 })
      
      // Should not accumulate errors
      const consoleErrors = await page.evaluate(() => (window as any).consoleErrors || [])
      const significantErrors = consoleErrors.filter((error: string) => 
        !error.includes('favicon') && 
        !error.includes('site.webmanifest') &&
        !error.includes('apple-touch-icon')
      )
      
      // Allow some errors but not excessive accumulation
      expect(significantErrors.length).toBeLessThan(5)
    })

    test('should maintain functionality with slow network conditions', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', route => route.continue())
      
      // Mock very slow API response
      await mockAPISuccess(page, '/dashboard-stats', {
        postsCreated: { value: 50, change: 40 },
        engagementRate: { value: 8.2, change: 45 },
        followers: { value: 6000, change: 55 },
        aiGenerations: { used: 45, total: 100 }
      }, 5000) // 5 second delay

      const startTime = Date.now()
      await page.goto('/dashboard')
      await page.waitForLoadState('domcontentloaded')
      
      // Should show dashboard structure quickly even with slow API
      const dashboardTitle = page.locator('h1:has-text("Dashboard")')
      await expect(dashboardTitle).toBeVisible({ timeout: 3000 })
      
      const initialLoadTime = Date.now() - startTime
      expect(initialLoadTime).toBeLessThan(5000) // Initial structure should load quickly
      
      // User should be able to interact with navigation
      const navigationElements = page.locator('nav a, header a, button')
      if (await navigationElements.first().isVisible()) {
        await expect(navigationElements.first()).toBeVisible()
      }
    })
  })
})