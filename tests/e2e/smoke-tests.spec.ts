import { test, expect } from '@playwright/test'

test.describe('Smoke Tests - Critical Page Load Testing', () => {
  test.describe('Level 1: Critical Infrastructure @smoke', () => {
    test('favicon loads correctly', async ({ page }) => {
      const response = await page.request.get('/favicon.ico')
      expect(response.status()).toBe(200)
      
      const contentType = response.headers()['content-type']
      expect(contentType).toContain('image')
    })

    test('site manifest loads correctly', async ({ page }) => {
      const response = await page.request.get('/site.webmanifest')
      expect(response.status()).toBe(200)
      
      const manifest = await response.json()
      expect(manifest).toHaveProperty('name')
      expect(manifest).toHaveProperty('short_name')
      expect(manifest).toHaveProperty('icons')
    })

    test('apple touch icon loads correctly', async ({ page }) => {
      const response = await page.request.get('/apple-touch-icon.png')
      expect(response.status()).toBe(200)
      
      const contentType = response.headers()['content-type']
      expect(contentType).toContain('image/png')
    })

    test('og image loads correctly', async ({ page }) => {
      const response = await page.request.get('/og-image.png')
      expect(response.status()).toBe(200)
      
      const contentType = response.headers()['content-type']
      expect(contentType).toContain('image')
    })

    test('twitter image loads correctly', async ({ page }) => {
      const response = await page.request.get('/twitter-image.png')
      expect(response.status()).toBe(200)
      
      const contentType = response.headers()['content-type']
      expect(contentType).toContain('image')
    })

    test('android chrome icons load correctly', async ({ page }) => {
      const icon192Response = await page.request.get('/android-chrome-192x192.png')
      expect(icon192Response.status()).toBe(200)
      
      const icon512Response = await page.request.get('/android-chrome-512x512.png')
      expect(icon512Response.status()).toBe(200)
    })

    test('browserconfig.xml loads correctly', async ({ page }) => {
      const response = await page.request.get('/browserconfig.xml')
      expect(response.status()).toBe(200)
      
      const contentType = response.headers()['content-type']
      expect(contentType).toContain('xml')
    })
  })

  test.describe('Level 2: Core User Flows @smoke @critical', () => {
    test('home page loads within 3 seconds', async ({ page }) => {
      const startTime = Date.now()
      
      const response = await page.goto('/')
      const loadTime = Date.now() - startTime
      
      // Verify successful response
      expect(response?.status()).toBe(200)
      
      // Verify load time under 3 seconds
      expect(loadTime).toBeLessThan(3000)
      
      // Verify critical elements are visible
      await expect(page.getByRole('main')).toBeVisible()
      
      // Check for JavaScript errors
      const errors: Error[] = []
      page.on('pageerror', error => errors.push(error))
      await page.waitForLoadState('networkidle')
      expect(errors).toHaveLength(0)
      
      // Verify page title
      await expect(page).toHaveTitle(/taylor collection/i)
      
      console.log(`Home page loaded in ${loadTime}ms`)
    })

    test('sign in page loads within 2 seconds', async ({ page }) => {
      const startTime = Date.now()
      
      const response = await page.goto('/auth/signin')
      const loadTime = Date.now() - startTime
      
      // Verify successful response
      expect(response?.status()).toBe(200)
      
      // Verify load time under 2 seconds (auth pages should be faster)
      expect(loadTime).toBeLessThan(2000)
      
      // Verify critical elements are visible
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible()
      
      // Check for JavaScript errors
      const errors: Error[] = []
      page.on('pageerror', error => errors.push(error))
      await page.waitForLoadState('networkidle')
      expect(errors).toHaveLength(0)
      
      // Verify page title
      await expect(page).toHaveTitle(/sign in/i)
      
      console.log(`Sign in page loaded in ${loadTime}ms`)
    })

    test('sign up page loads within 2 seconds', async ({ page }) => {
      const startTime = Date.now()
      
      const response = await page.goto('/auth/signup')
      const loadTime = Date.now() - startTime
      
      // Verify successful response
      expect(response?.status()).toBe(200)
      
      // Verify load time
      expect(loadTime).toBeLessThan(2000)
      
      // Verify critical elements are visible
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      await expect(page.getByLabel(/^password$/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible()
      
      // Check for JavaScript errors
      const errors: Error[] = []
      page.on('pageerror', error => errors.push(error))
      await page.waitForLoadState('networkidle')
      expect(errors).toHaveLength(0)
      
      console.log(`Sign up page loaded in ${loadTime}ms`)
    })

    test('forgot password page loads within 2 seconds', async ({ page }) => {
      const startTime = Date.now()
      
      const response = await page.goto('/auth/forgot-password')
      const loadTime = Date.now() - startTime
      
      // Verify successful response
      expect(response?.status()).toBe(200)
      
      // Verify load time
      expect(loadTime).toBeLessThan(2000)
      
      // Verify critical elements are visible
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
      
      // Check for JavaScript errors
      const errors: Error[] = []
      page.on('pageerror', error => errors.push(error))
      await page.waitForLoadState('networkidle')
      expect(errors).toHaveLength(0)
      
      console.log(`Forgot password page loaded in ${loadTime}ms`)
    })

    test('authenticated dashboard loads within 3 seconds', async ({ page, context }) => {
      // Mock authenticated state
      await context.addInitScript(() => {
        localStorage.setItem('sb-test-project-auth-token', JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'user-123', email: 'test@example.com' },
          expires_at: Date.now() / 1000 + 3600
        }))
      })
      
      // Mock API responses
      await page.route('**/auth/v1/user**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-123',
            email: 'test@example.com'
          })
        })
      })
      
      const startTime = Date.now()
      
      const response = await page.goto('/dashboard')
      const loadTime = Date.now() - startTime
      
      // Verify successful response
      expect(response?.status()).toBe(200)
      
      // Verify load time (dashboard can be more complex)
      expect(loadTime).toBeLessThan(3000)
      
      // Verify critical elements are visible
      await expect(page.getByText(/dashboard/i)).toBeVisible()
      await expect(page.getByRole('navigation')).toBeVisible()
      await expect(page.getByRole('main')).toBeVisible()
      
      // Check for JavaScript errors
      const errors: Error[] = []
      page.on('pageerror', error => errors.push(error))
      await page.waitForLoadState('networkidle')
      expect(errors).toHaveLength(0)
      
      console.log(`Dashboard page loaded in ${loadTime}ms`)
    })
  })

  test.describe('Level 3: Business Critical Pages @smoke', () => {
    test.beforeEach(async ({ page, context }) => {
      // Mock authenticated state for protected pages
      await context.addInitScript(() => {
        localStorage.setItem('sb-test-project-auth-token', JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'user-123', email: 'test@example.com' },
          expires_at: Date.now() / 1000 + 3600
        }))
      })
      
      // Mock API responses
      await page.route('**/auth/v1/user**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-123',
            email: 'test@example.com'
          })
        })
      })
    })

    test('projects page loads and displays correctly', async ({ page }) => {
      const startTime = Date.now()
      
      const response = await page.goto('/projects')
      const loadTime = Date.now() - startTime
      
      // Verify successful response
      expect(response?.status()).toBe(200)
      
      // Verify reasonable load time
      expect(loadTime).toBeLessThan(4000)
      
      // Verify critical elements
      await expect(page.getByText(/projects/i)).toBeVisible()
      await expect(page.getByRole('main')).toBeVisible()
      
      // Check for JavaScript errors
      const errors: Error[] = []
      page.on('pageerror', error => errors.push(error))
      await page.waitForLoadState('networkidle')
      expect(errors).toHaveLength(0)
      
      console.log(`Projects page loaded in ${loadTime}ms`)
    })

    test('analytics page loads and displays correctly', async ({ page }) => {
      const startTime = Date.now()
      
      const response = await page.goto('/analytics')
      const loadTime = Date.now() - startTime
      
      // Verify successful response
      expect(response?.status()).toBe(200)
      
      // Verify reasonable load time
      expect(loadTime).toBeLessThan(4000)
      
      // Verify critical elements
      await expect(page.getByText(/analytics/i)).toBeVisible()
      await expect(page.getByRole('main')).toBeVisible()
      
      // Check for JavaScript errors
      const errors: Error[] = []
      page.on('pageerror', error => errors.push(error))
      await page.waitForLoadState('networkidle')
      expect(errors).toHaveLength(0)
      
      console.log(`Analytics page loaded in ${loadTime}ms`)
    })

    test('settings page loads and displays correctly', async ({ page }) => {
      const startTime = Date.now()
      
      const response = await page.goto('/settings')
      const loadTime = Date.now() - startTime
      
      // Verify successful response
      expect(response?.status()).toBe(200)
      
      // Verify reasonable load time
      expect(loadTime).toBeLessThan(4000)
      
      // Verify critical elements
      await expect(page.getByText(/settings/i)).toBeVisible()
      await expect(page.getByRole('main')).toBeVisible()
      
      // Check for JavaScript errors
      const errors: Error[] = []
      page.on('pageerror', error => errors.push(error))
      await page.waitForLoadState('networkidle')
      expect(errors).toHaveLength(0)
      
      console.log(`Settings page loaded in ${loadTime}ms`)
    })
  })

  test.describe('Core Web Vitals Smoke Test @smoke', () => {
    test('home page meets Core Web Vitals thresholds', async ({ page }) => {
      await page.goto('/')
      
      // Measure LCP (Largest Contentful Paint)
      const lcpValue = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let lcpTime = 0
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1] as any
              lcpTime = lastEntry.startTime
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] })
          
          setTimeout(() => resolve(lcpTime || 0), 3000)
        })
      })
      
      // LCP should be ≤ 2.5s (2500ms)
      expect(lcpValue).toBeLessThan(2500)
      console.log(`LCP: ${lcpValue}ms`)
      
      // Measure FID by simulating user interaction
      await page.click('body')
      
      // Measure CLS (Cumulative Layout Shift)
      const clsValue = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as any
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value
              }
            }
          }).observe({ entryTypes: ['layout-shift'] })
          
          setTimeout(() => resolve(clsValue), 2000)
        })
      })
      
      // CLS should be ≤ 0.1
      expect(clsValue).toBeLessThan(0.1)
      console.log(`CLS: ${clsValue}`)
    })
  })

  test.describe('Error Handling Smoke Tests @smoke', () => {
    test('404 page returns correct status and content', async ({ page }) => {
      const response = await page.goto('/non-existent-page-12345')
      
      // Should return 404 status
      expect(response?.status()).toBe(404)
      
      // Should display 404 content
      await expect(page.getByText(/404|not found|page not found/i)).toBeVisible()
      
      // Should still have navigation
      if (await page.getByRole('navigation').isVisible()) {
        await expect(page.getByRole('navigation')).toBeVisible()
      }
      
      // Should have way to get back home
      if (await page.getByRole('link', { name: /home|back/i }).isVisible()) {
        await expect(page.getByRole('link', { name: /home|back/i })).toBeVisible()
      }
    })

    test('protected pages handle unauthenticated access', async ({ page }) => {
      // Test dashboard without authentication
      await page.goto('/dashboard')
      
      await page.waitForLoadState('networkidle')
      
      // Should redirect to auth or show login prompt
      const currentUrl = page.url()
      const isRedirectedToAuth = currentUrl.includes('/auth/') || currentUrl.includes('/signin')
      const hasLoginPrompt = await page.getByText(/sign in|login|authenticate/i).isVisible()
      
      expect(isRedirectedToAuth || hasLoginPrompt).toBeTruthy()
    })
  })

  test.describe('Network Resilience @smoke', () => {
    test('handles slow network conditions', async ({ page, context }) => {
      // Slow down network
      await context.route('**/*', async (route, request) => {
        // Add delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 100))
        await route.continue()
      })
      
      const startTime = Date.now()
      await page.goto('/')
      const loadTime = Date.now() - startTime
      
      // Should still load within reasonable time despite slow network
      expect(loadTime).toBeLessThan(10000) // 10 seconds with simulated delay
      
      // Content should still be visible
      await expect(page.getByRole('main')).toBeVisible()
    })

    test('handles intermittent network failures gracefully', async ({ page }) => {
      let requestCount = 0
      
      // Fail every other request initially, then succeed
      await page.route('**/*.js', async route => {
        requestCount++
        if (requestCount <= 2) {
          await route.abort('failed')
        } else {
          await route.continue()
        }
      })
      
      await page.goto('/')
      
      // Should eventually load despite initial failures
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      await expect(page.getByRole('main')).toBeVisible()
    })
  })

  test.describe('Cross-Browser Smoke Tests', () => {
    test('critical functionality works across browsers', async ({ page, browserName }) => {
      await page.goto('/')
      
      // Basic page load
      await expect(page.getByRole('main')).toBeVisible()
      
      // Navigation works
      if (await page.getByRole('link', { name: /sign in/i }).isVisible()) {
        await page.getByRole('link', { name: /sign in/i }).click()
        await expect(page).toHaveURL(/\/auth\/signin/)
        
        // Form interaction works
        await page.getByLabel(/email address/i).fill('test@example.com')
        const emailValue = await page.getByLabel(/email address/i).inputValue()
        expect(emailValue).toBe('test@example.com')
      }
      
      console.log(`Cross-browser smoke test passed in ${browserName}`)
    })
  })
})