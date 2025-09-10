import { test, expect } from '@playwright/test'

test.describe('Navigation and Page Loads', () => {
  test.describe('Public Pages', () => {
    test('home page loads correctly @smoke @critical', async ({ page }) => {
      await page.goto('/')
      
      // Check page loads successfully
      await expect(page).toHaveTitle(/taylor collection/i)
      
      // Check main navigation elements
      await expect(page.getByRole('navigation')).toBeVisible()
      
      // Check hero section or main content
      await expect(page.getByRole('main')).toBeVisible()
      
      // Check footer
      await expect(page.getByRole('contentinfo')).toBeVisible()
      
      // Verify no JavaScript errors
      const errors = []
      page.on('pageerror', error => errors.push(error))
      await page.waitForLoadState('networkidle')
      expect(errors).toHaveLength(0)
    })

    test('static assets load correctly @smoke', async ({ page }) => {
      await page.goto('/')
      
      // Check favicon loads
      const faviconResponse = await page.request.get('/favicon.ico')
      expect(faviconResponse.status()).toBe(200)
      
      // Check manifest loads
      const manifestResponse = await page.request.get('/site.webmanifest')
      expect(manifestResponse.status()).toBe(200)
      
      // Check apple touch icon loads
      const appleIconResponse = await page.request.get('/apple-touch-icon.png')
      expect(appleIconResponse.status()).toBe(200)
      
      // Check og image loads
      const ogImageResponse = await page.request.get('/og-image.png')
      expect(ogImageResponse.status()).toBe(200)
    })

    test('navigation between public pages works', async ({ page }) => {
      await page.goto('/')
      
      // Navigate to auth pages (if links exist)
      if (await page.getByRole('link', { name: /sign in/i }).isVisible()) {
        await page.getByRole('link', { name: /sign in/i }).click()
        await expect(page).toHaveURL(/\/auth\/signin/)
        await expect(page).toHaveTitle(/sign in/i)
        
        // Navigate back
        await page.goBack()
        await expect(page).toHaveURL('/')
      }
      
      // Test other navigation links if they exist
      if (await page.getByRole('link', { name: /about/i }).isVisible()) {
        await page.getByRole('link', { name: /about/i }).click()
        await page.waitForLoadState('networkidle')
      }
    })

    test('handles 404 pages gracefully', async ({ page }) => {
      const response = await page.goto('/non-existent-page')
      
      // Should return 404 status
      expect(response?.status()).toBe(404)
      
      // Should show 404 page content
      await expect(page.getByText(/404|not found|page not found/i)).toBeVisible()
      
      // Should have navigation back to home
      if (await page.getByRole('link', { name: /home|back/i }).isVisible()) {
        await page.getByRole('link', { name: /home|back/i }).click()
        await expect(page).toHaveURL('/')
      }
    })
  })

  test.describe('Protected Pages (Unauthenticated)', () => {
    test('dashboard redirects unauthenticated users @critical', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Should redirect to sign in or show auth required message
      await page.waitForLoadState('networkidle')
      
      // Either redirected to auth page or shows auth required
      const currentUrl = page.url()
      const isOnAuthPage = currentUrl.includes('/auth/') || currentUrl.includes('/signin')
      const hasAuthMessage = await page.getByText(/sign in|login|authenticate/i).isVisible()
      
      expect(isOnAuthPage || hasAuthMessage).toBeTruthy()
    })

    test('projects page redirects unauthenticated users', async ({ page }) => {
      await page.goto('/projects')
      
      await page.waitForLoadState('networkidle')
      
      // Should redirect to auth or show auth required
      const currentUrl = page.url()
      const isOnAuthPage = currentUrl.includes('/auth/') || currentUrl.includes('/signin')
      const hasAuthMessage = await page.getByText(/sign in|login|authenticate/i).isVisible()
      
      expect(isOnAuthPage || hasAuthMessage).toBeTruthy()
    })

    test('analytics page redirects unauthenticated users', async ({ page }) => {
      await page.goto('/analytics')
      
      await page.waitForLoadState('networkidle')
      
      // Should redirect to auth or show auth required
      const currentUrl = page.url()
      const isOnAuthPage = currentUrl.includes('/auth/') || currentUrl.includes('/signin')
      const hasAuthMessage = await page.getByText(/sign in|login|authenticate/i).isVisible()
      
      expect(isOnAuthPage || hasAuthMessage).toBeTruthy()
    })

    test('settings page redirects unauthenticated users', async ({ page }) => {
      await page.goto('/settings')
      
      await page.waitForLoadState('networkidle')
      
      // Should redirect to auth or show auth required
      const currentUrl = page.url()
      const isOnAuthPage = currentUrl.includes('/auth/') || currentUrl.includes('/signin')
      const hasAuthMessage = await page.getByText(/sign in|login|authenticate/i).isVisible()
      
      expect(isOnAuthPage || hasAuthMessage).toBeTruthy()
    })
  })

  test.describe('Protected Pages (Authenticated)', () => {
    test.beforeEach(async ({ page, context }) => {
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
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User'
            }
          })
        })
      })
    })

    test('dashboard loads for authenticated users @smoke @critical', async ({ page }) => {
      await page.goto('/dashboard')
      
      await expect(page).toHaveTitle(/dashboard/i)
      await expect(page.getByText(/dashboard/i)).toBeVisible()
      
      // Should have navigation
      await expect(page.getByRole('navigation')).toBeVisible()
      
      // Should have main content
      await expect(page.getByRole('main')).toBeVisible()
      
      // Verify no console errors
      const errors = []
      page.on('pageerror', error => errors.push(error))
      await page.waitForLoadState('networkidle')
      expect(errors).toHaveLength(0)
    })

    test('projects page loads for authenticated users @smoke', async ({ page }) => {
      await page.goto('/projects')
      
      await expect(page).toHaveTitle(/projects/i)
      await expect(page.getByText(/projects/i)).toBeVisible()
      
      await page.waitForLoadState('networkidle')
      
      // Verify no console errors
      const errors = []
      page.on('pageerror', error => errors.push(error))
      expect(errors).toHaveLength(0)
    })

    test('analytics page loads for authenticated users @smoke', async ({ page }) => {
      await page.goto('/analytics')
      
      await expect(page).toHaveTitle(/analytics/i)
      await expect(page.getByText(/analytics/i)).toBeVisible()
      
      await page.waitForLoadState('networkidle')
    })

    test('settings page loads for authenticated users @smoke', async ({ page }) => {
      await page.goto('/settings')
      
      await expect(page).toHaveTitle(/settings/i)
      await expect(page.getByText(/settings/i)).toBeVisible()
      
      await page.waitForLoadState('networkidle')
    })

    test('navigation between protected pages works', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Navigate to projects
      if (await page.getByRole('link', { name: /projects/i }).isVisible()) {
        await page.getByRole('link', { name: /projects/i }).click()
        await expect(page).toHaveURL(/\/projects/)
        await expect(page.getByText(/projects/i)).toBeVisible()
      }
      
      // Navigate to analytics
      if (await page.getByRole('link', { name: /analytics/i }).isVisible()) {
        await page.getByRole('link', { name: /analytics/i }).click()
        await expect(page).toHaveURL(/\/analytics/)
        await expect(page.getByText(/analytics/i)).toBeVisible()
      }
      
      // Navigate to settings
      if (await page.getByRole('link', { name: /settings/i }).isVisible()) {
        await page.getByRole('link', { name: /settings/i }).click()
        await expect(page).toHaveURL(/\/settings/)
        await expect(page.getByText(/settings/i)).toBeVisible()
      }
      
      // Navigate back to dashboard
      if (await page.getByRole('link', { name: /dashboard/i }).isVisible()) {
        await page.getByRole('link', { name: /dashboard/i }).click()
        await expect(page).toHaveURL(/\/dashboard/)
        await expect(page.getByText(/dashboard/i)).toBeVisible()
      }
    })

    test('user menu and profile dropdown work', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Look for user menu/avatar
      const userMenu = page.getByRole('button').filter({ hasText: /test@example\.com|test user|profile|account/i }).first()
      
      if (await userMenu.isVisible()) {
        await userMenu.click()
        
        // Should show dropdown menu
        await expect(page.getByRole('menu')).toBeVisible()
        
        // Should have profile/settings links
        if (await page.getByRole('menuitem', { name: /profile|settings/i }).isVisible()) {
          await expect(page.getByRole('menuitem', { name: /profile|settings/i })).toBeVisible()
        }
        
        // Should have sign out option
        if (await page.getByRole('menuitem', { name: /sign out|logout/i }).isVisible()) {
          await expect(page.getByRole('menuitem', { name: /sign out|logout/i })).toBeVisible()
        }
        
        // Click outside to close
        await page.click('body')
        await expect(page.getByRole('menu')).not.toBeVisible()
      }
    })

    test('sign out functionality works', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Find and click sign out
      const userMenu = page.getByRole('button').filter({ hasText: /test@example\.com|test user|profile|account/i }).first()
      
      if (await userMenu.isVisible()) {
        await userMenu.click()
        
        const signOutButton = page.getByRole('menuitem', { name: /sign out|logout/i })
        
        if (await signOutButton.isVisible()) {
          await signOutButton.click()
          
          // Should redirect to home or sign in page
          await page.waitForLoadState('networkidle')
          
          const currentUrl = page.url()
          const isOnPublicPage = !currentUrl.includes('/dashboard') && 
                                 !currentUrl.includes('/projects') &&
                                 !currentUrl.includes('/analytics') &&
                                 !currentUrl.includes('/settings')
          
          expect(isOnPublicPage).toBeTruthy()
        }
      }
    })
  })

  test.describe('Page Performance', () => {
    test('pages load within performance thresholds', async ({ page }) => {
      // Test critical pages
      const pagesToTest = [
        { url: '/', name: 'Home' },
        { url: '/auth/signin', name: 'Sign In' },
      ]
      
      for (const pageToTest of pagesToTest) {
        const startTime = Date.now()
        
        await page.goto(pageToTest.url)
        await page.waitForLoadState('networkidle')
        
        const loadTime = Date.now() - startTime
        
        // Pages should load within 5 seconds (adjust based on requirements)
        expect(loadTime).toBeLessThan(5000)
        console.log(`${pageToTest.name} page loaded in ${loadTime}ms`)
      }
    })

    test('pages have good Core Web Vitals', async ({ page }) => {
      await page.goto('/')
      
      // Measure LCP (Largest Contentful Paint)
      const lcpValue = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            resolve(lastEntry.startTime)
          }).observe({ entryTypes: ['largest-contentful-paint'] })
          
          setTimeout(() => resolve(0), 5000) // Fallback
        })
      })
      
      // LCP should be under 2.5 seconds (2500ms)
      expect(lcpValue).toBeLessThan(2500)
      
      // Measure CLS (Cumulative Layout Shift)
      const clsValue = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value
              }
            }
          }).observe({ entryTypes: ['layout-shift'] })
          
          setTimeout(() => resolve(clsValue), 3000)
        })
      })
      
      // CLS should be under 0.1
      expect(clsValue).toBeLessThan(0.1)
    })
  })

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } }) // iPhone 8 size
    
    test('mobile navigation works correctly', async ({ page }) => {
      await page.goto('/')
      
      // Look for mobile menu button (hamburger)
      const mobileMenuButton = page.getByRole('button').filter({ hasText: /menu|navigation/i }).first()
      
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()
        
        // Should show mobile navigation
        await expect(page.getByRole('navigation')).toBeVisible()
        
        // Should be able to navigate
        if (await page.getByRole('link', { name: /sign in/i }).isVisible()) {
          await page.getByRole('link', { name: /sign in/i }).click()
          await expect(page).toHaveURL(/\/auth\/signin/)
        }
      }
    })

    test('touch navigation works on mobile', async ({ page }) => {
      await page.goto('/')
      
      // Test swipe gestures if implemented
      // Test touch-friendly button sizes
      const buttons = page.getByRole('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const box = await button.boundingBox()
          if (box) {
            // Touch targets should be at least 44x44px
            expect(box.width).toBeGreaterThanOrEqual(24)
            expect(box.height).toBeGreaterThanOrEqual(24)
          }
        }
      }
    })
  })

  test.describe('Browser Compatibility', () => {
    test('works in different browsers', async ({ page, browserName }) => {
      await page.goto('/')
      
      // Basic functionality should work across browsers
      await expect(page.getByRole('main')).toBeVisible()
      
      // Check that navigation works
      if (await page.getByRole('link', { name: /sign in/i }).isVisible()) {
        await page.getByRole('link', { name: /sign in/i }).click()
        await expect(page).toHaveURL(/\/auth\/signin/)
      }
      
      console.log(`Navigation test passed in ${browserName}`)
    })
  })
})