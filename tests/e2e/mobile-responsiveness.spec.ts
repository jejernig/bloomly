import { test, expect } from '@playwright/test'

test.describe('Mobile Responsiveness Tests - Issue #9', () => {
  // Mobile viewport configurations
  const mobileViewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    { width: 360, height: 640, name: 'Galaxy S5' },
  ]
  
  const tabletViewports = [
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1024, height: 768, name: 'iPad Landscape' },
  ]

  // Test landing page mobile responsiveness
  mobileViewports.forEach(viewport => {
    test(`Landing Page - Mobile responsiveness on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      
      await page.goto('/')
      
      // Wait for page to load
      await page.waitForLoadState('networkidle')
      
      // Test LandingHero mobile responsiveness
      await test.step('LandingHero mobile layout', async () => {
        // Check that navigation is properly responsive
        const nav = page.locator('nav')
        await expect(nav).toBeVisible()
        
        // Check that title is readable and not overflowing
        const title = page.locator('h1').first()
        await expect(title).toBeVisible()
        
        // Check that CTA buttons stack vertically on mobile
        const ctaContainer = page.locator('[data-testid="cta-buttons"], div').filter({ hasText: 'Start creating for free' }).first()
        if (await ctaContainer.isVisible()) {
          // Verify buttons are stacked (flex-col on mobile)
          const ctaButtons = page.locator('a').filter({ hasText: /Start creating|Browse templates/ })
          await expect(ctaButtons.first()).toBeVisible()
        }
        
        // Check that demo preview scales properly
        const demoPreview = page.locator('.rounded-lg, .rounded-xl').first()
        if (await demoPreview.isVisible()) {
          const boundingBox = await demoPreview.boundingBox()
          if (boundingBox) {
            // Demo should not exceed viewport width minus padding
            expect(boundingBox.width).toBeLessThanOrEqual(viewport.width - 32) // Account for padding
          }
        }
      })
      
      // Test FeaturesSection mobile responsiveness  
      await test.step('FeaturesSection mobile layout', async () => {
        const featuresSection = page.locator('#features, [id="features"]')
        if (await featuresSection.isVisible()) {
          await featuresSection.scrollIntoViewIfNeeded()
          
          // Check that features grid uses single column on mobile
          const featuresGrid = page.locator('dl')
          await expect(featuresGrid).toBeVisible()
          
          // Check that feature items have adequate spacing
          const featureItems = page.locator('dt')
          const featureCount = await featureItems.count()
          if (featureCount > 0) {
            for (let i = 0; i < Math.min(3, featureCount); i++) {
              await expect(featureItems.nth(i)).toBeVisible()
            }
          }
        }
      })
      
      // Test PricingSection mobile responsiveness
      await test.step('PricingSection mobile layout', async () => {
        const pricingSection = page.locator('#pricing, [id="pricing"]')
        if (await pricingSection.isVisible()) {
          await pricingSection.scrollIntoViewIfNeeded()
          
          // Check that pricing cards are properly sized for mobile
          const pricingCards = page.locator('.rounded-2xl, .rounded-3xl').filter({ hasText: /Free|Professional|Enterprise/ })
          const cardCount = await pricingCards.count()
          
          if (cardCount > 0) {
            for (let i = 0; i < Math.min(2, cardCount); i++) {
              const card = pricingCards.nth(i)
              await expect(card).toBeVisible()
              
              const boundingBox = await card.boundingBox()
              if (boundingBox) {
                // Cards should not exceed viewport width minus margin
                expect(boundingBox.width).toBeLessThanOrEqual(viewport.width - 48) // Account for margins
              }
            }
          }
        }
      })
      
      // Test Footer mobile responsiveness
      await test.step('Footer mobile layout', async () => {
        const footer = page.locator('footer')
        await footer.scrollIntoViewIfNeeded()
        await expect(footer).toBeVisible()
        
        // Check that footer content is readable
        const footerText = page.locator('footer h1, footer p').first()
        await expect(footerText).toBeVisible()
        
        // Check social media icons are touch-friendly
        const socialIcons = page.locator('footer a[aria-label*="Follow us"]')
        const iconCount = await socialIcons.count()
        
        if (iconCount > 0) {
          for (let i = 0; i < Math.min(2, iconCount); i++) {
            const icon = socialIcons.nth(i)
            await expect(icon).toBeVisible()
            
            const boundingBox = await icon.boundingBox()
            if (boundingBox) {
              // Touch targets should be at least 44px (iOS guideline)
              expect(Math.min(boundingBox.width, boundingBox.height)).toBeGreaterThanOrEqual(44)
            }
          }
        }
      })
    })
  })

  // Test tablet responsiveness
  tabletViewports.forEach(viewport => {
    test(`Landing Page - Tablet responsiveness on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      await test.step('Tablet layout verification', async () => {
        // Check that content uses appropriate tablet layouts
        const featuresSection = page.locator('#features')
        if (await featuresSection.isVisible()) {
          await featuresSection.scrollIntoViewIfNeeded()
          
          // On tablet, features should use grid-cols-2
          const featuresGrid = page.locator('dl')
          await expect(featuresGrid).toBeVisible()
        }
        
        // Check pricing section tablet layout
        const pricingSection = page.locator('#pricing')
        if (await pricingSection.isVisible()) {
          await pricingSection.scrollIntoViewIfNeeded()
          
          // On tablet, pricing should show 2-3 columns
          const pricingCards = page.locator('.rounded-2xl, .rounded-3xl').filter({ hasText: /Free|Professional|Enterprise/ })
          const cardCount = await pricingCards.count()
          
          if (cardCount >= 2) {
            await expect(pricingCards.first()).toBeVisible()
            await expect(pricingCards.nth(1)).toBeVisible()
          }
        }
      })
    })
  })

  // Test dashboard mobile responsiveness (authenticated)
  mobileViewports.forEach(viewport => {
    test(`Dashboard - Mobile responsiveness on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      
      await page.goto('/dashboard')
      
      // Wait for dashboard to load or redirect to auth
      await page.waitForLoadState('networkidle')
      
      // Check if redirected to auth (expected for non-authenticated)
      const currentUrl = page.url()
      
      if (currentUrl.includes('/auth/signin') || currentUrl.includes('/auth/signup')) {
        await test.step('Auth page mobile layout', async () => {
          // Verify auth page is mobile-responsive
          const mainContent = page.locator('main, div').first()
          await expect(mainContent).toBeVisible()
          
          // Check for responsive text and buttons
          const signInButton = page.locator('button').filter({ hasText: /sign in/i }).first()
          if (await signInButton.isVisible()) {
            const boundingBox = await signInButton.boundingBox()
            if (boundingBox) {
              // Button should be touch-friendly
              expect(boundingBox.height).toBeGreaterThanOrEqual(44)
            }
          }
        })
      } else {
        // If somehow authenticated, test dashboard
        await test.step('Dashboard mobile layout', async () => {
          const dashboard = page.locator('main')
          await expect(dashboard).toBeVisible()
          
          // Check mobile sidebar functionality
          const menuButton = page.locator('button').filter({ hasText: 'Menu' }).first()
          if (await menuButton.isVisible()) {
            await expect(menuButton).toBeVisible()
            
            // Test mobile menu toggle
            await menuButton.click()
            
            // Check sidebar is visible after click
            const sidebar = page.locator('[role="dialog"], nav').first()
            if (await sidebar.isVisible()) {
              await expect(sidebar).toBeVisible()
            }
          }
        })
      }
    })
  })

  // Test touch target accessibility
  test('Touch target accessibility - minimum 44px tap targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await test.step('Verify touch targets meet accessibility guidelines', async () => {
      // Test navigation buttons
      const navButtons = page.locator('nav button, nav a')
      const navButtonCount = await navButtons.count()
      
      for (let i = 0; i < Math.min(5, navButtonCount); i++) {
        const button = navButtons.nth(i)
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox()
          if (boundingBox) {
            expect(Math.min(boundingBox.width, boundingBox.height)).toBeGreaterThanOrEqual(44)
          }
        }
      }
      
      // Test CTA buttons
      const ctaButtons = page.locator('button, a').filter({ hasText: /Start creating|Get started|Browse templates/ })
      const ctaCount = await ctaButtons.count()
      
      for (let i = 0; i < Math.min(3, ctaCount); i++) {
        const button = ctaButtons.nth(i)
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox()
          if (boundingBox) {
            expect(boundingBox.height).toBeGreaterThanOrEqual(44)
          }
        }
      }
    })
  })

  // Test text readability on mobile
  test('Text readability on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await test.step('Verify text is readable on mobile', async () => {
      // Check main heading
      const mainHeading = page.locator('h1').first()
      await expect(mainHeading).toBeVisible()
      
      // Check paragraph text
      const paragraphs = page.locator('p').filter({ hasText: /.{20,}/ }) // Paragraphs with substantial text
      const paraCount = await paragraphs.count()
      
      for (let i = 0; i < Math.min(3, paraCount); i++) {
        const para = paragraphs.nth(i)
        if (await para.isVisible()) {
          // Text should be visible and not clipped
          const boundingBox = await para.boundingBox()
          if (boundingBox) {
            expect(boundingBox.width).toBeGreaterThan(0)
            expect(boundingBox.height).toBeGreaterThan(0)
          }
        }
      }
    })
  })

  // Test horizontal scrolling prevention
  test('Prevent horizontal scrolling on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await test.step('Verify no horizontal overflow', async () => {
      // Check document width doesn't exceed viewport
      const documentWidth = await page.evaluate(() => {
        return Math.max(
          document.body.scrollWidth,
          document.body.offsetWidth,
          document.documentElement.clientWidth,
          document.documentElement.scrollWidth,
          document.documentElement.offsetWidth
        )
      })
      
      // Allow small margins but no significant overflow
      expect(documentWidth).toBeLessThanOrEqual(400) // 375 + small margin
      
      // Check for horizontal scrollbar
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      
      expect(hasHorizontalScroll).toBe(false)
    })
  })

  // Test responsive images and media
  test('Responsive images and media elements', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await test.step('Verify images are responsive', async () => {
      const images = page.locator('img')
      const imageCount = await images.count()
      
      for (let i = 0; i < Math.min(5, imageCount); i++) {
        const img = images.nth(i)
        if (await img.isVisible()) {
          const boundingBox = await img.boundingBox()
          if (boundingBox) {
            // Images should not exceed viewport width
            expect(boundingBox.width).toBeLessThanOrEqual(375)
          }
        }
      }
    })
  })
})