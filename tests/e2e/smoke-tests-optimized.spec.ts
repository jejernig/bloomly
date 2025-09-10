import { test, expect } from '@playwright/test'

/**
 * Optimized Smoke Tests - Realistic Development Environment
 * 
 * This version accounts for Next.js development mode compilation times
 * and focuses on critical functionality rather than strict performance thresholds
 */
test.describe('Smoke Tests - Critical Functionality @smoke', () => {

  test.describe('Level 1: Critical Infrastructure @smoke @fast', () => {
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
  })

  test.describe('Level 2: Core Page Functionality @smoke @critical', () => {
    test('home page loads and displays critical content', async ({ page }) => {
      // Give plenty of time for Next.js compilation
      const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })
      
      // Verify successful response
      expect(response?.status()).toBe(200)
      
      // Verify critical elements are visible
      await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 })
      
      // Verify page title (updated branding)
      await expect(page).toHaveTitle(/AI-Powered Instagram Content Creator|Bloomly\.io/i)
      
      // Check for brand elements
      await expect(page.getByText(/Bloomly\.io/i).first()).toBeVisible()
      
      console.log('✅ Home page loads and displays correctly')
    })

    test('sign in page loads and displays auth form', async ({ page }) => {
      const response = await page.goto('/auth/signin', { waitUntil: 'domcontentloaded', timeout: 30000 })
      
      // Verify successful response
      expect(response?.status()).toBe(200)
      
      // Verify auth form elements are present
      await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 10000 })
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible()
      
      // Verify Google auth option
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
      
      console.log('✅ Sign in page loads with proper form elements')
    })

    test('unauthenticated users are handled correctly', async ({ page }) => {
      // Test dashboard without authentication (should redirect or show sign-in)
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 })
      
      // Wait for potential redirect or auth handling
      await page.waitForTimeout(2000)
      
      // Should redirect to auth or show login prompt
      const currentUrl = page.url()
      const isRedirectedToAuth = currentUrl.includes('/auth/') || currentUrl.includes('/signin')
      
      // Check for authentication indicators
      const hasSignInButton = await page.getByRole('button', { name: /sign in/i }).isVisible().catch(() => false)
      const hasSignInLink = await page.getByRole('link', { name: /sign in/i }).isVisible().catch(() => false)
      const hasAuthForm = await page.getByLabel(/email/i).isVisible().catch(() => false)
      
      const hasAuthIndicator = hasSignInButton || hasSignInLink || hasAuthForm
      
      expect(isRedirectedToAuth || hasAuthIndicator).toBeTruthy()
      
      console.log('✅ Unauthenticated access properly handled')
    })
  })

  test.describe('Level 3: Error Handling @smoke', () => {
    test('404 page handles non-existent routes', async ({ page }) => {
      const response = await page.goto('/non-existent-page-12345', { timeout: 30000 })
      
      // Should return 404 status
      expect(response?.status()).toBe(404)
      
      // Should display 404 content
      await expect(page.getByText(/404|not found|page not found/i)).toBeVisible({ timeout: 5000 })
      
      console.log('✅ 404 page displays correctly for invalid routes')
    })
  })

  test.describe('Level 4: Performance Baseline @smoke', () => {
    test('home page meets basic performance criteria', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 45000 })
      
      // Check basic performance metrics (more lenient for dev mode)
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        }
      })
      
      // Very lenient thresholds for development mode
      expect(performanceMetrics.loadTime).toBeLessThan(15000) // 15 seconds
      expect(performanceMetrics.domContentLoaded).toBeLessThan(10000) // 10 seconds
      
      console.log(`⚡ Performance - Load: ${performanceMetrics.loadTime}ms, DOMContentLoaded: ${performanceMetrics.domContentLoaded}ms`)
    })
  })

  test.describe('Level 5: Network Resilience @smoke', () => {
    test('handles basic network conditions', async ({ page, context }) => {
      // Add a small delay to simulate slightly slow network
      await context.route('**/*', async (route, request) => {
        await new Promise(resolve => setTimeout(resolve, 50))
        await route.continue()
      })
      
      await page.goto('/', { timeout: 30000 })
      
      // Basic content should load
      await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 })
      
      console.log('✅ Handles network delays gracefully')
    })
  })

  test.describe('Cross-Browser Compatibility @smoke', () => {
    test('critical functionality works across browsers', async ({ page, browserName }) => {
      await page.goto('/', { timeout: 30000 })
      
      // Basic page load
      await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 })
      
      // Navigation works
      const signInLink = page.getByRole('link', { name: /sign in/i })
      if (await signInLink.isVisible()) {
        await signInLink.click()
        await expect(page).toHaveURL(/\/auth\/signin/)
        
        // Form interaction works
        await page.getByLabel(/email address/i).fill('test@example.com')
        const emailValue = await page.getByLabel(/email address/i).inputValue()
        expect(emailValue).toBe('test@example.com')
      }
      
      console.log(`✅ Cross-browser functionality verified in ${browserName}`)
    })
  })
})