import { test, expect } from '@playwright/test'

test.describe('Terms of Service Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/terms')
  })

  test('should load terms of service page successfully @smoke @critical', async ({ page }) => {
    // Verify page loads with correct title
    await expect(page).toHaveTitle('Terms of Service | Bloomly.io')
    
    // Verify URL is correct
    expect(page.url()).toContain('/terms')
    
    // Verify main heading is visible
    await expect(page.getByRole('heading', { name: 'Terms of Service', level: 1 })).toBeVisible()
  })

  test('should display all required content sections @critical', async ({ page }) => {
    // Verify all main sections are present
    await expect(page.getByRole('heading', { name: '1. Agreement to Terms', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '2. Description of Service', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '3. User Accounts and Registration', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Key Legal Provisions', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Contact Us', level: 2 })).toBeVisible()

    // Verify subsections are present
    await expect(page.getByRole('heading', { name: '2.1 Core Services', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '2.2 AI-Generated Content', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '2.3 Third-Party Integrations', level: 3 })).toBeVisible()
    
    await expect(page.getByRole('heading', { name: '3.1 Account Creation', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '3.2 Authentication Methods', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '3.3 Account Responsibilities', level: 3 })).toBeVisible()

    // Verify key legal provisions
    await expect(page.getByRole('heading', { name: 'AI Content Disclaimer', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Limitation of Liability', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Your Content Rights', level: 3 })).toBeVisible()
  })

  test('should display current date in effective date @critical', async ({ page }) => {
    // Get current date in expected format
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    // Verify effective date shows current date
    await expect(page.locator('text=Effective Date:')).toBeVisible()
    await expect(page.locator(`text=${currentDate}`).first()).toBeVisible()
    
    // Verify last updated date shows current date
    await expect(page.locator('text=Last Updated:')).toBeVisible()
    await expect(page.locator(`text=${currentDate}`).nth(1)).toBeVisible()
  })

  test('should have working navigation links @critical', async ({ page }) => {
    // Test "Back to Bloomly.io" link
    const backLink = page.getByRole('link', { name: 'Back to Bloomly.io' })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/')

    // Test "View Privacy Policy" link
    const privacyLink = page.getByRole('link', { name: 'View Privacy Policy' })
    await expect(privacyLink).toBeVisible()
    await expect(privacyLink).toHaveAttribute('href', '/privacy')

    // Test "Back to Home" button
    const homeButton = page.getByRole('link', { name: 'Back to Home' })
    await expect(homeButton).toBeVisible()
    await expect(homeButton).toHaveAttribute('href', '/')
  })

  test('should navigate to home page when clicking back links @critical', async ({ page }) => {
    // Click the main back link
    await page.getByRole('link', { name: 'Back to Bloomly.io' }).click()
    
    // Verify navigation to home page
    await expect(page).toHaveURL('/')
    await expect(page).toHaveTitle(/Bloomly.io/)
  })

  test('should display contact information @critical', async ({ page }) => {
    // Scroll to contact section
    await page.getByRole('heading', { name: 'Contact Us', level: 2 }).scrollIntoViewIfNeeded()
    
    // Verify contact information is displayed
    await expect(page.locator('text=legal@taylorcollection.app')).toBeVisible()
    await expect(page.locator('text=support@taylorcollection.app')).toBeVisible()
    await expect(page.locator('text=https://taylorcollection.app')).toBeVisible()
  })

  test('should display legal notices and disclaimers @critical', async ({ page }) => {
    // Verify AI Content Disclaimer
    const aiDisclaimer = page.locator('text=Our AI-powered tools generate suggestions based on machine learning algorithms')
    await expect(aiDisclaimer).toBeVisible()
    
    // Verify Limitation of Liability notice
    const liabilityNotice = page.locator('text=THE SERVICE IS PROVIDED "AS-IS" AND "AS-AVAILABLE" WITHOUT WARRANTIES')
    await expect(liabilityNotice).toBeVisible()
    
    // Verify Content Rights information
    const contentRights = page.locator('text=You retain ownership of content you create using our AI tools')
    await expect(contentRights).toBeVisible()
    
    // Verify footer legal notice
    const footerNotice = page.locator('text=This document contains key provisions from our complete Terms of Service')
    await expect(footerNotice).toBeVisible()
  })

  test('should be responsive on mobile devices @mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verify page still loads correctly
    await expect(page.getByRole('heading', { name: 'Terms of Service', level: 1 })).toBeVisible()
    
    // Verify navigation is still accessible
    await expect(page.getByRole('link', { name: 'Back to Bloomly.io' })).toBeVisible()
    
    // Verify main content sections are visible
    await expect(page.getByRole('heading', { name: '1. Agreement to Terms', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '2. Description of Service', level: 2 })).toBeVisible()
    
    // Verify footer navigation works
    await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible()
  })

  test('should be accessible to screen readers @a11y', async ({ page }) => {
    // Verify proper heading hierarchy
    const headings = await page.locator('h1, h2, h3').all()
    expect(headings.length).toBeGreaterThan(10) // Should have multiple headings
    
    // Verify main landmark
    await expect(page.locator('main')).toBeVisible()
    
    // Verify all links have accessible names
    const links = await page.locator('a').all()
    for (const link of links) {
      const accessibleName = await link.getAttribute('aria-label') || await link.textContent()
      expect(accessibleName).toBeTruthy()
    }
    
    // Verify lists are properly structured
    await expect(page.locator('ul li')).toHaveCount(20) // Should have multiple list items
  })

  test('should have proper semantic HTML structure @a11y', async ({ page }) => {
    // Verify semantic structure
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('section')).toHaveCount(4) // Multiple sections
    
    // Verify proper heading hierarchy (h1 -> h2 -> h3)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h2')).toHaveCount(4) // Main sections
    await expect(page.locator('h3')).toHaveCount(9) // Subsections
    
    // Verify lists are properly marked up
    await expect(page.locator('ul')).toHaveCount(6) // Should have multiple unordered lists
    
    // Verify paragraphs contain substantial content
    const paragraphs = await page.locator('p').all()
    expect(paragraphs.length).toBeGreaterThan(10)
  })

  test('should load within performance benchmarks @performance', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/terms')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Verify first contentful paint is reasonable
    const performanceEntries = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (entries.length > 0) {
        const entry = entries[0]
        return {
          domContentLoaded: entry.domContentLoadedEventEnd - entry.fetchStart,
          loadComplete: entry.loadEventEnd - entry.fetchStart
        }
      }
      return null
    })
    
    if (performanceEntries) {
      expect(performanceEntries.domContentLoaded).toBeLessThan(2000)
      expect(performanceEntries.loadComplete).toBeLessThan(3000)
    }
  })

  test('should handle page scrolling correctly @usability', async ({ page }) => {
    // Verify page is scrollable
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight)
    const viewportHeight = await page.evaluate(() => window.innerHeight)
    
    expect(pageHeight).toBeGreaterThan(viewportHeight) // Page should be longer than viewport
    
    // Test scrolling to different sections
    await page.getByRole('heading', { name: 'Contact Us', level: 2 }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('heading', { name: 'Contact Us', level: 2 })).toBeInViewport()
    
    // Scroll back to top
    await page.getByRole('heading', { name: 'Terms of Service', level: 1 }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('heading', { name: 'Terms of Service', level: 1 })).toBeInViewport()
  })

  test('should display proper styling and visual elements @visual', async ({ page }) => {
    // Verify background gradient is applied
    const mainElement = page.locator('main')
    await expect(mainElement).toHaveClass(/bg-gradient-to-br/)
    
    // Verify content containers have proper styling
    const contentContainers = page.locator('.bg-white.rounded-2xl.shadow-lg')
    await expect(contentContainers).toHaveCount(2) // Header and main content
    
    // Verify colored notice boxes are present
    await expect(page.locator('.bg-blue-50')).toBeVisible() // Complete terms notice
    await expect(page.locator('.bg-amber-50')).toBeVisible() // AI disclaimer
    await expect(page.locator('.bg-red-50')).toBeVisible() // Liability notice
    await expect(page.locator('.bg-green-50')).toBeVisible() // Content rights
    
    // Verify button styling
    const homeButton = page.getByRole('link', { name: 'Back to Home' })
    await expect(homeButton).toHaveClass(/bg-pink-600/)
  })

  test('should handle text content properly @content', async ({ page }) => {
    // Verify key terms are mentioned
    await expect(page.locator('text=Bloomly.io')).toHaveCount(4) // Should appear multiple times
    await expect(page.locator('text=AI-powered')).toBeVisible()
    await expect(page.locator('text=Instagram')).toBeVisible()
    await expect(page.locator('text=fashion boutiques')).toBeVisible()
    
    // Verify important legal language is present
    await expect(page.locator('text="Terms of Service"')).toBeVisible()
    await expect(page.locator('text="AS-IS"')).toBeVisible()
    await expect(page.locator('text="AS-AVAILABLE"')).toBeVisible()
    
    // Verify service descriptions are comprehensive
    await expect(page.locator('text=design tools and content templates')).toBeVisible()
    await expect(page.locator('text=scheduling, and publishing capabilities')).toBeVisible()
    await expect(page.locator('text=Analytics and performance tracking')).toBeVisible()
  })
})