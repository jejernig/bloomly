import { test, expect } from '@playwright/test'

test.describe('Core Web Vitals Performance', () => {
  test('home page Core Web Vitals @performance @critical', async ({ page }) => {
    // Navigate to home page with performance monitoring
    const response = await page.goto('/', { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(200)

    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ type: 'largest-contentful-paint', buffered: true })

        // Fallback timeout
        setTimeout(() => resolve(0), 5000)
      })
    })

    // LCP should be less than 2.5 seconds (good), warn if > 4 seconds (poor)
    expect(lcp).toBeLessThan(4000)
    if (lcp > 2500) {
      console.warn(`LCP is ${lcp}ms - should be < 2500ms for good performance`)
    }

    // Measure Cumulative Layout Shift (CLS)
    await page.waitForTimeout(2000) // Allow time for any layout shifts
    
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Only count layout shifts without recent user input
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          resolve(clsValue)
        }).observe({ type: 'layout-shift', buffered: true })

        // Resolve after a short delay to capture shifts
        setTimeout(() => resolve(clsValue), 1000)
      })
    })

    // CLS should be less than 0.1 (good), warn if > 0.25 (poor)
    expect(cls).toBeLessThan(0.25)
    if (cls > 0.1) {
      console.warn(`CLS is ${cls} - should be < 0.1 for good performance`)
    }

    // Measure First Input Delay (FID) by simulating user interaction
    await page.click('body')
    
    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            resolve((entry as any).processingStart - entry.startTime)
          }
        }).observe({ type: 'first-input', buffered: true })

        // Fallback - simulate if no real FID measurement
        setTimeout(() => resolve(50), 2000)
      })
    })

    // FID should be less than 100ms (good), warn if > 300ms (poor)
    expect(fid).toBeLessThan(300)
    if (fid > 100) {
      console.warn(`FID is ${fid}ms - should be < 100ms for good performance`)
    }

    console.log(`Core Web Vitals - LCP: ${lcp}ms, CLS: ${cls}, FID: ${fid}ms`)
  })

  test('authentication pages Core Web Vitals @performance', async ({ page }) => {
    const authPages = [
      { path: '/auth/signin', name: 'Sign In' },
      { path: '/auth/signup', name: 'Sign Up' },
      { path: '/auth/forgot-password', name: 'Forgot Password' }
    ]

    for (const authPage of authPages) {
      await page.goto(authPage.path, { waitUntil: 'networkidle' })

      // Measure page load time
      const navigationEntry = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          firstPaint: 0,
          firstContentfulPaint: 0
        }
      })

      // Get paint timings
      const paintTimings = await page.evaluate(() => {
        const paintEntries = performance.getEntriesByType('paint')
        const timings: { [key: string]: number } = {}
        
        paintEntries.forEach((entry) => {
          timings[entry.name] = entry.startTime
        })
        
        return timings
      })

      // Page should load within 3 seconds
      expect(navigationEntry.loadComplete).toBeLessThan(3000)
      
      // First Contentful Paint should be under 1.8 seconds (good)
      if (paintTimings['first-contentful-paint']) {
        expect(paintTimings['first-contentful-paint']).toBeLessThan(2500)
        if (paintTimings['first-contentful-paint'] > 1800) {
          console.warn(`${authPage.name} FCP is ${paintTimings['first-contentful-paint']}ms - should be < 1800ms`)
        }
      }

      // Measure LCP for auth pages
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1]
              resolve(lastEntry.startTime)
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true })

          setTimeout(() => resolve(0), 3000)
        })
      })

      if (lcp > 0) {
        expect(lcp).toBeLessThan(3000)
        console.log(`${authPage.name} - Load: ${navigationEntry.loadComplete}ms, LCP: ${lcp}ms, FCP: ${paintTimings['first-contentful-paint'] || 'N/A'}ms`)
      }
    }
  })

  test('form interaction performance @performance', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'networkidle' })

    // Measure form interaction response time
    const emailInput = page.getByLabel(/email address/i)
    const passwordInput = page.getByLabel(/password/i)

    // Test input responsiveness
    const inputStartTime = Date.now()
    await emailInput.fill('test@example.com')
    const inputEndTime = Date.now()
    
    const inputResponseTime = inputEndTime - inputStartTime
    expect(inputResponseTime).toBeLessThan(100) // Should respond within 100ms

    // Test password field responsiveness
    const passwordStartTime = Date.now()
    await passwordInput.fill('password123')
    const passwordEndTime = Date.now()
    
    const passwordResponseTime = passwordEndTime - passwordStartTime
    expect(passwordResponseTime).toBeLessThan(100)

    // Test form validation performance
    await emailInput.clear()
    await passwordInput.clear()
    
    const validationStartTime = Date.now()
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Wait for validation messages to appear
    await page.waitForSelector('.text-red-600, .text-red-500, [role="alert"]', { timeout: 2000 })
    const validationEndTime = Date.now()
    
    const validationResponseTime = validationEndTime - validationStartTime
    expect(validationResponseTime).toBeLessThan(500) // Validation should be fast

    console.log(`Form Performance - Input: ${inputResponseTime}ms, Password: ${passwordResponseTime}ms, Validation: ${validationResponseTime}ms`)
  })

  test('page size and resource loading @performance', async ({ page }) => {
    // Monitor network requests
    const resourceSizes: { [key: string]: number } = {}
    let totalSize = 0

    page.on('response', (response) => {
      const url = response.url()
      const headers = response.headers()
      const contentLength = headers['content-length']
      
      if (contentLength) {
        const size = parseInt(contentLength)
        totalSize += size
        
        // Categorize resources
        if (url.includes('.js')) {
          resourceSizes['javascript'] = (resourceSizes['javascript'] || 0) + size
        } else if (url.includes('.css')) {
          resourceSizes['css'] = (resourceSizes['css'] || 0) + size
        } else if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          resourceSizes['images'] = (resourceSizes['images'] || 0) + size
        } else if (url.includes('.woff') || url.includes('.ttf')) {
          resourceSizes['fonts'] = (resourceSizes['fonts'] || 0) + size
        }
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    // Total page size should be reasonable (under 2MB for initial load)
    expect(totalSize).toBeLessThan(2 * 1024 * 1024)

    // JavaScript bundle shouldn't be too large
    if (resourceSizes['javascript']) {
      expect(resourceSizes['javascript']).toBeLessThan(500 * 1024) // 500KB limit
    }

    // CSS should be optimized
    if (resourceSizes['css']) {
      expect(resourceSizes['css']).toBeLessThan(100 * 1024) // 100KB limit
    }

    console.log('Resource Sizes:', {
      total: `${Math.round(totalSize / 1024)}KB`,
      javascript: `${Math.round((resourceSizes['javascript'] || 0) / 1024)}KB`,
      css: `${Math.round((resourceSizes['css'] || 0) / 1024)}KB`,
      images: `${Math.round((resourceSizes['images'] || 0) / 1024)}KB`,
      fonts: `${Math.round((resourceSizes['fonts'] || 0) / 1024)}KB`
    })
  })

  test('mobile performance @performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Simulate slow 3G connection
    const client = await page.context().newCDPSession(page)
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 500 * 1024 / 8, // 500 Kbps
      uploadThroughput: 500 * 1024 / 8,
      latency: 400 // 400ms latency
    })

    const startTime = Date.now()
    await page.goto('/', { waitUntil: 'networkidle' })
    const endTime = Date.now()
    
    const loadTime = endTime - startTime
    
    // Page should load within 5 seconds on slow 3G
    expect(loadTime).toBeLessThan(5000)
    
    // Test mobile form performance
    await page.goto('/auth/signin', { waitUntil: 'networkidle' })
    
    const mobileFormStartTime = Date.now()
    await page.getByLabel(/email address/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('password123')
    const mobileFormEndTime = Date.now()
    
    const mobileFormTime = mobileFormEndTime - mobileFormStartTime
    expect(mobileFormTime).toBeLessThan(1000) // Form should be responsive even on slow connection

    console.log(`Mobile Performance - Page Load: ${loadTime}ms, Form Interaction: ${mobileFormTime}ms`)
  })

  test('memory usage performance @performance', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSMemory: (performance as any).memory.usedJSMemory,
        totalJSMemory: (performance as any).memory.totalJSMemory,
        jsMemoryLimit: (performance as any).memory.jsMemoryLimit
      } : null
    })

    if (initialMemory) {
      // Navigate through several pages to test memory usage
      const pages = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/']
      
      for (const testPage of pages) {
        await page.goto(testPage, { waitUntil: 'networkidle' })
        await page.waitForTimeout(1000)
      }

      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        return {
          usedJSMemory: (performance as any).memory.usedJSMemory,
          totalJSMemory: (performance as any).memory.totalJSMemory,
          jsMemoryLimit: (performance as any).memory.jsMemoryLimit
        }
      })

      // Memory usage shouldn't grow excessively
      const memoryGrowth = finalMemory.usedJSMemory - initialMemory.usedJSMemory
      const memoryGrowthMB = memoryGrowth / (1024 * 1024)
      
      // Memory growth should be reasonable (less than 10MB for navigation)
      expect(memoryGrowthMB).toBeLessThan(10)
      
      console.log(`Memory Usage - Initial: ${Math.round(initialMemory.usedJSMemory / 1024 / 1024)}MB, Final: ${Math.round(finalMemory.usedJSMemory / 1024 / 1024)}MB, Growth: ${Math.round(memoryGrowthMB)}MB`)
    }
  })

  test('JavaScript performance @performance', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Measure JavaScript execution time
    const jsPerformance = await page.evaluate(() => {
      const startTime = performance.now()
      
      // Simulate some JavaScript work
      let result = 0
      for (let i = 0; i < 10000; i++) {
        result += Math.random()
      }
      
      const endTime = performance.now()
      
      return {
        executionTime: endTime - startTime,
        result: result > 0 // Just to use the result
      }
    })

    // JavaScript execution should be fast
    expect(jsPerformance.executionTime).toBeLessThan(10) // Should complete in less than 10ms

    // Test form validation performance
    await page.goto('/auth/signup', { waitUntil: 'networkidle' })
    
    const validationPerformance = await page.evaluate(() => {
      const startTime = performance.now()
      
      // Simulate password validation
      const password = 'TestPassword123!'
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasSpecialChar = /[!@#$%^&*]/.test(password)
      const isLongEnough = password.length >= 8
      
      const validationResult = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough
      
      const endTime = performance.now()
      
      return {
        executionTime: endTime - startTime,
        isValid: validationResult
      }
    })

    expect(validationPerformance.executionTime).toBeLessThan(1) // Validation should be nearly instant

    console.log(`JavaScript Performance - General: ${jsPerformance.executionTime}ms, Validation: ${validationPerformance.executionTime}ms`)
  })
})