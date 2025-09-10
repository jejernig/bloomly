import { test, expect } from '@playwright/test'

test.describe('Privacy Policy Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/privacy')
  })

  test('should load privacy policy page successfully @smoke @critical', async ({ page }) => {
    // Verify page loads with correct title
    await expect(page).toHaveTitle('Privacy Policy | Bloomly.io')
    
    // Verify URL is correct
    expect(page.url()).toContain('/privacy')
    
    // Verify main heading is visible
    await expect(page.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeVisible()
  })

  test('should display all required content sections @critical', async ({ page }) => {
    // Verify main sections are present
    await expect(page.getByRole('heading', { name: '1. Introduction and Data Controller Information', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '2. Information We Collect', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '3. How We Use Your Information', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '4. Your Privacy Rights', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '5. Data Security and Protection', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '6. Cookies and Tracking', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '7. Data Retention and International Transfers', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '8. Contact Us', level: 2 })).toBeVisible()

    // Verify data controller subsections
    await expect(page.getByRole('heading', { name: '1.1 Data Controller Identity', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '1.2 Scope of This Policy', level: 3 })).toBeVisible()
    
    // Verify data collection subsections
    await expect(page.getByRole('heading', { name: '2.1 Information You Provide Directly', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '2.2 Information Collected Automatically', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '2.3 Information from Third-Party Sources', level: 3 })).toBeVisible()

    // Verify privacy rights subsections
    await expect(page.getByRole('heading', { name: 'GDPR Rights (EU/EEA Users)', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'CCPA Rights (California Users)', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'How to Exercise Your Rights', level: 3 })).toBeVisible()

    // Verify security subsections
    await expect(page.getByRole('heading', { name: 'Technical Safeguards', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Organizational Safeguards', level: 3 })).toBeVisible()

    // Verify data retention subsections
    await expect(page.getByRole('heading', { name: 'Data Retention', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'International Data Transfers', level: 3 })).toBeVisible()
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

    // Test "View Terms of Service" link
    const termsLink = page.getByRole('link', { name: 'View Terms of Service' })
    await expect(termsLink).toBeVisible()
    await expect(termsLink).toHaveAttribute('href', '/terms')

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
    await page.getByRole('heading', { name: '8. Contact Us', level: 2 }).scrollIntoViewIfNeeded()
    
    // Verify contact information is displayed
    await expect(page.locator('text=privacy@taylorcollection.app')).toBeVisible()
    await expect(page.locator('text=support@taylorcollection.app')).toBeVisible()
    await expect(page.locator('text=https://taylorcollection.app')).toBeVisible()
  })

  test('should display GDPR compliance information @critical', async ({ page }) => {
    // Verify GDPR rights section
    const gdprSection = page.getByRole('heading', { name: 'GDPR Rights (EU/EEA Users)', level: 3 })
    await gdprSection.scrollIntoViewIfNeeded()
    await expect(gdprSection).toBeVisible()
    
    // Verify specific GDPR rights
    await expect(page.locator('text=Right of Access:')).toBeVisible()
    await expect(page.locator('text=Right to Rectification:')).toBeVisible()
    await expect(page.locator('text=Right to Erasure:')).toBeVisible()
    await expect(page.locator('text=Right to Restrict Processing:')).toBeVisible()
    await expect(page.locator('text=Right to Data Portability:')).toBeVisible()
    await expect(page.locator('text=Right to Object:')).toBeVisible()
  })

  test('should display CCPA compliance information @critical', async ({ page }) => {
    // Verify CCPA rights section
    const ccpaSection = page.getByRole('heading', { name: 'CCPA Rights (California Users)', level: 3 })
    await ccpaSection.scrollIntoViewIfNeeded()
    await expect(ccpaSection).toBeVisible()
    
    // Verify specific CCPA rights
    await expect(page.locator('text=Right to Know:')).toBeVisible()
    await expect(page.locator('text=Right to Delete:')).toBeVisible()
    await expect(page.locator('text=Right to Correct:')).toBeVisible()
    await expect(page.locator('text=Right to Opt-Out:')).toBeVisible()
    await expect(page.locator('text=Right to Portability:')).toBeVisible()
    await expect(page.locator('text=Non-Discrimination:')).toBeVisible()
  })

  test('should display data security information @critical', async ({ page }) => {
    // Verify Technical Safeguards
    const techSafeguards = page.getByRole('heading', { name: 'Technical Safeguards', level: 3 })
    await techSafeguards.scrollIntoViewIfNeeded()
    await expect(techSafeguards).toBeVisible()
    
    // Verify security measures
    await expect(page.locator('text=TLS 1.3 in transit, AES-256 at rest')).toBeVisible()
    await expect(page.locator('text=Role-based access and multi-factor authentication')).toBeVisible()
    await expect(page.locator('text=SOC 2 Type II compliant cloud providers')).toBeVisible()
    
    // Verify Organizational Safeguards
    await expect(page.getByRole('heading', { name: 'Organizational Safeguards', level: 3 })).toBeVisible()
    await expect(page.locator('text=Privacy by Design:')).toBeVisible()
    await expect(page.locator('text=Staff Training:')).toBeVisible()
  })

  test('should display cookie information @critical', async ({ page }) => {
    // Verify cookie section
    const cookieSection = page.getByRole('heading', { name: '6. Cookies and Tracking', level: 2 })
    await cookieSection.scrollIntoViewIfNeeded()
    await expect(cookieSection).toBeVisible()
    
    // Verify different cookie types
    await expect(page.locator('text=Essential Cookies (Always Active)')).toBeVisible()
    await expect(page.locator('text=Analytics Cookies (With Consent)')).toBeVisible()
    await expect(page.locator('text=Marketing Cookies (With Consent)')).toBeVisible()
    
    // Verify GPC respect statement
    await expect(page.locator('text=Global Privacy Control (GPC) preferences')).toBeVisible()
  })

  test('should display data collection categories @critical', async ({ page }) => {
    // Verify data collection section
    await page.getByRole('heading', { name: '2. Information We Collect', level: 2 }).scrollIntoViewIfNeeded()
    
    // Verify Account Information category
    await expect(page.getByRole('heading', { name: 'Account Information', level: 4 })).toBeVisible()
    await expect(page.locator('text=Full name and business name')).toBeVisible()
    await expect(page.locator('text=Email address and phone number')).toBeVisible()
    
    // Verify Content and Preferences category
    await expect(page.getByRole('heading', { name: 'Content and Preferences', level: 4 })).toBeVisible()
    await expect(page.locator('text=Instagram content and captions you create')).toBeVisible()
    
    // Verify third-party integrations
    await expect(page.getByRole('heading', { name: 'Instagram Business API', level: 4 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Google OAuth', level: 4 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Payment Processors', level: 4 })).toBeVisible()
  })

  test('should display data usage purposes @critical', async ({ page }) => {
    // Verify how we use information section
    await page.getByRole('heading', { name: '3. How We Use Your Information', level: 2 }).scrollIntoViewIfNeeded()
    
    // Verify service provision purposes
    await expect(page.getByRole('heading', { name: 'Service Provision', level: 3 })).toBeVisible()
    await expect(page.locator('text=AI-powered design tools and content creation')).toBeVisible()
    await expect(page.locator('text=Instagram integration and publishing')).toBeVisible()
    
    // Verify AI-powered services
    await expect(page.getByRole('heading', { name: 'AI-Powered Services', level: 3 })).toBeVisible()
    await expect(page.locator('text=Content generation and design suggestions')).toBeVisible()
    await expect(page.locator('text=Machine learning model improvement')).toBeVisible()
    
    // Verify communication purposes
    await expect(page.getByRole('heading', { name: 'Communication & Support', level: 3 })).toBeVisible()
    await expect(page.locator('text=Customer support and technical assistance')).toBeVisible()
  })

  test('should display data retention policies @critical', async ({ page }) => {
    // Verify data retention section
    await page.getByRole('heading', { name: 'Data Retention', level: 3 }).scrollIntoViewIfNeeded()
    
    // Verify retention periods
    await expect(page.locator('text=Active Accounts:')).toBeVisible()
    await expect(page.locator('text=Retained while account remains active')).toBeVisible()
    await expect(page.locator('text=Inactive Accounts:')).toBeVisible()
    await expect(page.locator('text=Deleted after 3 years of inactivity')).toBeVisible()
    await expect(page.locator('text=Closed Accounts:')).toBeVisible()
    await expect(page.locator('text=Core data deleted within 30 days')).toBeVisible()
  })

  test('should be responsive on mobile devices @mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verify page still loads correctly
    await expect(page.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeVisible()
    
    // Verify navigation is still accessible
    await expect(page.getByRole('link', { name: 'Back to Bloomly.io' })).toBeVisible()
    
    // Verify main content sections are visible
    await expect(page.getByRole('heading', { name: '1. Introduction and Data Controller Information', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '4. Your Privacy Rights', level: 2 })).toBeVisible()
    
    // Verify footer navigation works
    await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible()
  })

  test('should be accessible to screen readers @a11y', async ({ page }) => {
    // Verify proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4').all()
    expect(headings.length).toBeGreaterThan(20) // Should have many headings for comprehensive policy

    // Verify main landmark
    await expect(page.locator('main')).toBeVisible()
    
    // Verify all links have accessible names
    const links = await page.locator('a').all()
    for (const link of links) {
      const accessibleName = await link.getAttribute('aria-label') || await link.textContent()
      expect(accessibleName).toBeTruthy()
    }
    
    // Verify lists are properly structured for privacy rights
    await expect(page.locator('ul li')).toHaveCount(50) // Should have many list items for rights and data categories
  })

  test('should have proper semantic HTML structure @a11y', async ({ page }) => {
    // Verify semantic structure
    await expect(page.locator('main')).toBeVisible()
    
    // Verify proper heading hierarchy (h1 -> h2 -> h3 -> h4)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h2')).toHaveCount(8) // Main sections
    await expect(page.locator('h3')).toHaveCount(12) // Subsections
    await expect(page.locator('h4')).toHaveCount(9) // Category headers
    
    // Verify lists are properly marked up
    await expect(page.locator('ul')).toHaveCount(15) // Should have multiple unordered lists for rights and categories
    
    // Verify paragraphs contain substantial content
    const paragraphs = await page.locator('p').all()
    expect(paragraphs.length).toBeGreaterThan(15)
  })

  test('should load within performance benchmarks @performance', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/privacy')
    
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
    await page.getByRole('heading', { name: '8. Contact Us', level: 2 }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('heading', { name: '8. Contact Us', level: 2 })).toBeInViewport()
    
    // Test scrolling to privacy rights section
    await page.getByRole('heading', { name: '4. Your Privacy Rights', level: 2 }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('heading', { name: '4. Your Privacy Rights', level: 2 })).toBeInViewport()
    
    // Scroll back to top
    await page.getByRole('heading', { name: 'Privacy Policy', level: 1 }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeInViewport()
  })

  test('should display proper styling and visual elements @visual', async ({ page }) => {
    // Verify background gradient is applied
    const mainElement = page.locator('main')
    await expect(mainElement).toHaveClass(/bg-gradient-to-br/)
    
    // Verify content containers have proper styling
    const contentContainers = page.locator('.bg-white.rounded-2xl.shadow-lg')
    await expect(contentContainers).toHaveCount(2) // Header and main content
    
    // Verify colored information boxes are present
    await expect(page.locator('.bg-blue-50')).toBeVisible() // GDPR rights box
    await expect(page.locator('.bg-green-50')).toBeVisible() // CCPA rights box
    await expect(page.locator('.bg-gray-50')).toBeVisible() // Contact info and data retention boxes
    await expect(page.locator('.bg-red-50')).toBeVisible() // Technical safeguards box
    await expect(page.locator('.bg-yellow-50')).toBeVisible() // Organizational safeguards box
    
    // Verify button styling
    const homeButton = page.getByRole('link', { name: 'Back to Home' })
    await expect(homeButton).toHaveClass(/bg-pink-600/)
  })

  test('should handle text content properly @content', async ({ page }) => {
    // Verify key privacy terms are mentioned
    await expect(page.locator('text=Bloomly.io')).toHaveCount(3) // Should appear multiple times
    await expect(page.locator('text=GDPR')).toBeVisible()
    await expect(page.locator('text=CCPA')).toBeVisible()
    await expect(page.locator('text=personal information')).toBeVisible()
    await expect(page.locator('text=data protection')).toBeVisible()
    
    // Verify important legal language is present
    await expect(page.locator('text=Data Controller')).toBeVisible()
    await expect(page.locator('text=privacy@taylorcollection')).toBeVisible()
    await expect(page.locator('text=AI-powered')).toBeVisible()
    
    // Verify service descriptions are comprehensive
    await expect(page.locator('text=Instagram content creation platform')).toBeVisible()
    await expect(page.locator('text=fashion boutiques')).toBeVisible()
    await expect(page.locator('text=machine learning')).toBeVisible()
  })

  test('should display compliance framework information @critical', async ({ page }) => {
    // Verify SOC 2 compliance mention
    await expect(page.locator('text=SOC 2 Type II compliant')).toBeVisible()
    
    // Verify encryption standards
    await expect(page.locator('text=TLS 1.3')).toBeVisible()
    await expect(page.locator('text=AES-256')).toBeVisible()
    
    // Verify international transfer safeguards
    await expect(page.locator('text=Standard Contractual Clauses')).toBeVisible()
    await expect(page.locator('text=adequacy decisions')).toBeVisible()
    
    // Verify response timeframes are mentioned
    await expect(page.locator('text=Within 30 days (GDPR)')).toBeVisible()
    await expect(page.locator('text=45 days (CCPA)')).toBeVisible()
  })

  test('should navigate to terms of service page @critical', async ({ page }) => {
    // Click the terms of service link
    await page.getByRole('link', { name: 'View Terms of Service' }).click()
    
    // Verify navigation to terms page
    await expect(page).toHaveURL('/terms')
    await expect(page).toHaveTitle(/Terms of Service/)
  })

  test('should display fashion industry specific content @content', async ({ page }) => {
    // Verify fashion industry specific language
    await expect(page.locator('text=fashion boutiques')).toBeVisible()
    await expect(page.locator('text=Instagram content creation')).toBeVisible()
    await expect(page.locator('text=fashion marketing')).toBeVisible()
    await expect(page.locator('text=Instagram Business API')).toBeVisible()
    
    // Verify target audience mentions
    await expect(page.locator('text=Fashion boutique owners and staff')).toBeVisible()
    await expect(page.locator('text=Content creators and marketers')).toBeVisible()
  })
})