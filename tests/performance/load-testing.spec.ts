import { test, expect } from '@playwright/test'

test.describe('Load Testing and Stress Performance', () => {
  test('concurrent user simulation @performance @stress', async ({ page, context }) => {
    const concurrentUsers = 5
    const userSessions: Promise<void>[] = []

    // Simulate multiple concurrent users
    for (let i = 0; i < concurrentUsers; i++) {
      const userSession = (async () => {
        const userPage = await context.newPage()
        
        try {
          // Each user navigates through the application
          await userPage.goto('/', { waitUntil: 'networkidle' })
          await userPage.waitForTimeout(1000 + Math.random() * 2000) // Random delay 1-3s
          
          await userPage.goto('/auth/signin', { waitUntil: 'networkidle' })
          await userPage.waitForTimeout(500 + Math.random() * 1000) // Random delay 0.5-1.5s
          
          // Simulate form interaction
          await userPage.getByLabel(/email address/i).fill(`user${i}@example.com`)
          await userPage.getByLabel(/password/i).fill('password123')
          
          await userPage.waitForTimeout(500)
          
          await userPage.goto('/auth/signup', { waitUntil: 'networkidle' })
          await userPage.waitForTimeout(500)
          
          await userPage.close()
        } catch (error) {
          console.error(`User ${i} session failed:`, error)
          await userPage.close()
        }
      })()
      
      userSessions.push(userSession)
    }

    // Wait for all user sessions to complete
    const startTime = Date.now()
    await Promise.all(userSessions)
    const endTime = Date.now()

    const totalTime = endTime - startTime
    const averageTimePerUser = totalTime / concurrentUsers

    // All concurrent sessions should complete within reasonable time
    expect(totalTime).toBeLessThan(30000) // 30 seconds total
    expect(averageTimePerUser).toBeLessThan(10000) // 10 seconds per user average

    console.log(`Concurrent Users Test - Total Time: ${totalTime}ms, Average per User: ${averageTimePerUser}ms`)
  })

  test('rapid navigation stress test @performance @stress', async ({ page }) => {
    const pages = ['/', '/auth/signin', '/auth/signup', '/auth/forgot-password']
    const navigationTimes: number[] = []

    // Rapidly navigate between pages
    for (let iteration = 0; iteration < 3; iteration++) {
      for (const testPage of pages) {
        const startTime = Date.now()
        
        await page.goto(testPage, { waitUntil: 'domcontentloaded' })
        await page.waitForLoadState('networkidle')
        
        const endTime = Date.now()
        const navigationTime = endTime - startTime
        
        navigationTimes.push(navigationTime)
        
        // Each navigation should complete within reasonable time
        expect(navigationTime).toBeLessThan(5000) // 5 seconds max per navigation
        
        // Brief pause between navigations
        await page.waitForTimeout(100)
      }
    }

    const averageNavigationTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length
    const maxNavigationTime = Math.max(...navigationTimes)

    expect(averageNavigationTime).toBeLessThan(2000) // Average should be under 2 seconds
    expect(maxNavigationTime).toBeLessThan(5000) // No single navigation over 5 seconds

    console.log(`Rapid Navigation - Average: ${averageNavigationTime}ms, Max: ${maxNavigationTime}ms, Total Navigations: ${navigationTimes.length}`)
  })

  test('form submission stress test @performance @stress', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'networkidle' })

    const submissionTimes: number[] = []
    const maxSubmissions = 10

    // Rapidly submit forms (will trigger validation errors)
    for (let i = 0; i < maxSubmissions; i++) {
      // Fill form with invalid data to trigger validation
      await page.getByLabel(/email address/i).fill(`test${i}@invalid`)
      await page.getByLabel(/password/i).fill('weak')

      const startTime = Date.now()
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Wait for validation errors
      await page.waitForSelector('.text-red-600, .text-red-500, [role="alert"]', { timeout: 3000 })
      
      const endTime = Date.now()
      const submissionTime = endTime - startTime
      
      submissionTimes.push(submissionTime)
      
      // Each form submission should respond quickly
      expect(submissionTime).toBeLessThan(1000) // 1 second max
      
      // Clear form for next iteration
      await page.getByLabel(/email address/i).clear()
      await page.getByLabel(/password/i).clear()
      
      await page.waitForTimeout(50) // Brief pause
    }

    const averageSubmissionTime = submissionTimes.reduce((a, b) => a + b, 0) / submissionTimes.length
    
    expect(averageSubmissionTime).toBeLessThan(500) // Average under 500ms
    
    console.log(`Form Submission Stress - Average: ${averageSubmissionTime}ms, Submissions: ${maxSubmissions}`)
  })

  test('memory leak detection @performance @stress', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Get baseline memory
    const getMemoryUsage = async () => {
      return await page.evaluate(() => {
        if ((performance as any).memory) {
          return {
            used: (performance as any).memory.usedJSMemory,
            total: (performance as any).memory.totalJSMemory
          }
        }
        return null
      })
    }

    const initialMemory = await getMemoryUsage()
    
    if (!initialMemory) {
      test.skip('Memory API not available in this browser')
      return
    }

    const memorySnapshots: { used: number; total: number }[] = [initialMemory]

    // Perform memory-intensive operations
    const operations = 20
    for (let i = 0; i < operations; i++) {
      // Navigate to different pages
      await page.goto('/auth/signin', { waitUntil: 'networkidle' })
      await page.goto('/auth/signup', { waitUntil: 'networkidle' })
      await page.goto('/', { waitUntil: 'networkidle' })
      
      // Create some DOM elements and remove them
      await page.evaluate(() => {
        const container = document.createElement('div')
        for (let j = 0; j < 100; j++) {
          const element = document.createElement('div')
          element.textContent = `Test element ${j}`
          container.appendChild(element)
        }
        document.body.appendChild(container)
        
        // Remove after a brief delay
        setTimeout(() => {
          container.remove()
        }, 10)
      })
      
      await page.waitForTimeout(100)
      
      // Take memory snapshot every 5 operations
      if (i % 5 === 0) {
        const currentMemory = await getMemoryUsage()
        if (currentMemory) {
          memorySnapshots.push(currentMemory)
        }
      }
    }

    const finalMemory = await getMemoryUsage()
    if (finalMemory) {
      memorySnapshots.push(finalMemory)
    }

    // Analyze memory growth
    const memoryGrowth = (finalMemory?.used || 0) - initialMemory.used
    const memoryGrowthMB = memoryGrowth / (1024 * 1024)
    
    // Memory growth should be reasonable (less than 50MB after all operations)
    expect(memoryGrowthMB).toBeLessThan(50)
    
    // Check for consistent memory growth pattern (potential leak)
    if (memorySnapshots.length >= 3) {
      const growthRates = []
      for (let i = 1; i < memorySnapshots.length; i++) {
        const growth = memorySnapshots[i].used - memorySnapshots[i - 1].used
        growthRates.push(growth)
      }
      
      // Memory shouldn't consistently grow at a high rate
      const averageGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length
      const averageGrowthMB = averageGrowth / (1024 * 1024)
      
      expect(averageGrowthMB).toBeLessThan(5) // Less than 5MB average growth per snapshot
    }

    console.log(`Memory Leak Test - Initial: ${Math.round(initialMemory.used / 1024 / 1024)}MB, Final: ${Math.round((finalMemory?.used || 0) / 1024 / 1024)}MB, Growth: ${Math.round(memoryGrowthMB)}MB`)
  })

  test('network throttling stress test @performance @stress', async ({ page }) => {
    // Test different network conditions
    const networkConditions = [
      { name: 'Fast 3G', download: 1.5 * 1024, upload: 750, latency: 150 },
      { name: 'Slow 3G', download: 500, upload: 500, latency: 400 },
      { name: 'Very Slow', download: 100, upload: 100, latency: 1000 }
    ]

    const client = await page.context().newCDPSession(page)

    for (const condition of networkConditions) {
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: condition.download * 1024 / 8, // Convert Kbps to bytes/second
        uploadThroughput: condition.upload * 1024 / 8,
        latency: condition.latency
      })

      const startTime = Date.now()
      await page.goto('/', { waitUntil: 'networkidle' })
      const endTime = Date.now()
      
      const loadTime = endTime - startTime
      
      // Adjust expectations based on network speed
      let maxLoadTime
      if (condition.name === 'Fast 3G') {
        maxLoadTime = 5000 // 5 seconds
      } else if (condition.name === 'Slow 3G') {
        maxLoadTime = 10000 // 10 seconds
      } else {
        maxLoadTime = 15000 // 15 seconds for very slow
      }
      
      expect(loadTime).toBeLessThan(maxLoadTime)
      
      // Test form interaction under network conditions
      await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' })
      
      const formStartTime = Date.now()
      await page.getByLabel(/email address/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password123')
      const formEndTime = Date.now()
      
      const formInteractionTime = formEndTime - formStartTime
      
      // Form interaction should remain responsive even under poor network
      expect(formInteractionTime).toBeLessThan(2000) // 2 seconds max for form interaction
      
      console.log(`${condition.name} - Page Load: ${loadTime}ms, Form Interaction: ${formInteractionTime}ms`)
      
      await page.waitForTimeout(1000) // Brief pause between tests
    }

    // Reset network conditions
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    })
  })

  test('resource loading stress test @performance @stress', async ({ page }) => {
    const resourceLoadTimes: { [key: string]: number[] } = {
      html: [],
      css: [],
      js: [],
      images: [],
      fonts: []
    }

    let resourceCount = 0

    page.on('response', async (response) => {
      const url = response.url()
      const timing = response.timing()
      
      if (timing.responseEnd > 0) {
        const loadTime = timing.responseEnd
        resourceCount++
        
        // Categorize resources by type
        if (url.includes('.html') || response.headers()['content-type']?.includes('text/html')) {
          resourceLoadTimes.html.push(loadTime)
        } else if (url.includes('.css')) {
          resourceLoadTimes.css.push(loadTime)
        } else if (url.includes('.js')) {
          resourceLoadTimes.js.push(loadTime)
        } else if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          resourceLoadTimes.images.push(loadTime)
        } else if (url.includes('.woff') || url.includes('.ttf')) {
          resourceLoadTimes.fonts.push(loadTime)
        }
      }
    })

    // Load multiple pages to stress test resource loading
    const testPages = ['/', '/auth/signin', '/auth/signup', '/auth/forgot-password']
    
    for (let iteration = 0; iteration < 2; iteration++) {
      for (const testPage of testPages) {
        await page.goto(testPage, { waitUntil: 'networkidle' })
        await page.waitForTimeout(500)
      }
    }

    // Analyze resource loading performance
    for (const [resourceType, loadTimes] of Object.entries(resourceLoadTimes)) {
      if (loadTimes.length > 0) {
        const averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
        const maxLoadTime = Math.max(...loadTimes)
        
        // Set expectations based on resource type
        let maxExpected, averageExpected
        switch (resourceType) {
          case 'html':
            maxExpected = 2000
            averageExpected = 1000
            break
          case 'css':
          case 'js':
            maxExpected = 3000
            averageExpected = 1500
            break
          case 'images':
            maxExpected = 5000
            averageExpected = 2000
            break
          case 'fonts':
            maxExpected = 4000
            averageExpected = 2000
            break
          default:
            maxExpected = 5000
            averageExpected = 2500
        }
        
        expect(maxLoadTime).toBeLessThan(maxExpected)
        expect(averageLoadTime).toBeLessThan(averageExpected)
        
        console.log(`${resourceType.toUpperCase()} Resources - Count: ${loadTimes.length}, Average: ${Math.round(averageLoadTime)}ms, Max: ${Math.round(maxLoadTime)}ms`)
      }
    }

    expect(resourceCount).toBeGreaterThan(0) // Should have loaded some resources
    console.log(`Total Resources Loaded: ${resourceCount}`)
  })

  test('cache effectiveness test @performance', async ({ page }) => {
    // First load - no cache
    const firstLoadStart = Date.now()
    await page.goto('/', { waitUntil: 'networkidle' })
    const firstLoadEnd = Date.now()
    const firstLoadTime = firstLoadEnd - firstLoadStart

    // Second load - should use cache
    const secondLoadStart = Date.now()
    await page.reload({ waitUntil: 'networkidle' })
    const secondLoadEnd = Date.now()
    const secondLoadTime = secondLoadEnd - secondLoadStart

    // Third load - navigate away and back
    await page.goto('/auth/signin', { waitUntil: 'networkidle' })
    
    const thirdLoadStart = Date.now()
    await page.goto('/', { waitUntil: 'networkidle' })
    const thirdLoadEnd = Date.now()
    const thirdLoadTime = thirdLoadEnd - thirdLoadStart

    // Cached loads should be faster than initial load
    // Allow some variance due to network conditions
    const cacheEffectivenessThreshold = 0.8 // Cached load should be at most 80% of initial load time
    
    expect(secondLoadTime).toBeLessThan(firstLoadTime * cacheEffectivenessThreshold)
    expect(thirdLoadTime).toBeLessThan(firstLoadTime * cacheEffectivenessThreshold)

    const cacheImprovement = ((firstLoadTime - secondLoadTime) / firstLoadTime) * 100
    
    console.log(`Cache Effectiveness - Initial: ${firstLoadTime}ms, Cached: ${secondLoadTime}ms, Navigation Return: ${thirdLoadTime}ms, Improvement: ${Math.round(cacheImprovement)}%`)
  })
})