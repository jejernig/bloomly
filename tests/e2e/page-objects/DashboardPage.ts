import { Page, Locator, expect } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly url: string = '/dashboard'
  
  // Loading state elements
  readonly skeletonElements: Locator
  readonly dashboardStatSkeletons: Locator
  readonly circularSkeletons: Locator
  readonly textSkeletons: Locator
  readonly loadingSpinner: Locator
  
  // Content elements
  readonly statCards: Locator
  readonly statValues: Locator
  readonly statGrid: Locator
  
  // Error state elements
  readonly errorIcon: Locator
  readonly errorMessage: Locator
  readonly retryButton: Locator
  readonly errorBoundary: Locator
  readonly inlineErrorBoundary: Locator
  
  // Toast elements
  readonly toastContainer: Locator
  readonly errorToast: Locator
  readonly successToast: Locator
  readonly toastDismissButton: Locator
  
  // Navigation elements
  readonly homeButton: Locator
  readonly navigationLinks: Locator

  constructor(page: Page) {
    this.page = page
    
    // Loading state selectors
    this.skeletonElements = page.locator('[class*="animate-pulse"]')
    this.dashboardStatSkeletons = page.locator('[class*="bg-gray-200"][class*="animate-pulse"]')
    this.circularSkeletons = page.locator('[class*="rounded-full"][class*="animate-pulse"]')
    this.textSkeletons = page.locator('[class*="rounded-sm"][class*="animate-pulse"]')
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]')
    
    // Content selectors
    this.statCards = page.locator('[class*="boutique-card"]')
    this.statValues = page.locator('[class*="text-2xl"][class*="font-bold"]')
    this.statGrid = page.locator('.grid').first()
    
    // Error state selectors
    this.errorIcon = page.locator('[data-testid="error-icon"], .text-red-400 svg, [class*="text-red-"] svg')
    this.errorMessage = page.locator('text=/error|failed|something went wrong/i')
    this.retryButton = page.locator('button:has-text("Try Again"), button:has-text("Retry")')
    this.errorBoundary = page.locator('text=/something went wrong|error occurred/i')
    this.inlineErrorBoundary = page.locator('[data-testid="inline-error"], .border-red-200')
    
    // Toast selectors
    this.toastContainer = page.locator('[data-hot-toast], [role="status"], [role="alert"]')
    this.errorToast = page.locator('text=/error|failed|server error/i')
    this.successToast = page.locator('text=/success|completed|saved/i')
    this.toastDismissButton = page.locator('[data-hot-toast] button, [role="status"] button, [role="alert"] button')
    
    // Navigation selectors
    this.homeButton = page.locator('button:has-text("Go Home"), a:has-text("Go Home")')
    this.navigationLinks = page.locator('nav a, header a')
  }

  async goto() {
    await this.page.goto(this.url)
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded')
    // Wait a moment for any initial JavaScript to run
    await this.page.waitForTimeout(500)
  }

  // Loading state methods
  async waitForSkeletonToAppear() {
    await expect(this.skeletonElements.first()).toBeVisible({ timeout: 3000 })
  }

  async waitForSkeletonToDisappear() {
    await this.page.waitForFunction(
      () => document.querySelectorAll('[class*="animate-pulse"]').length === 0,
      {},
      { timeout: 10000 }
    )
  }

  async hasLoadingState(): Promise<boolean> {
    return await this.skeletonElements.first().isVisible()
  }

  async verifySkeletonStructure() {
    // Verify skeleton has proper grid layout
    await expect(this.statGrid).toHaveClass(/grid-cols-1.*sm:grid-cols-2.*lg:grid-cols-4/)
    
    // Verify skeleton components are present
    await expect(this.circularSkeletons.first()).toBeVisible()
    await expect(this.textSkeletons.first()).toBeVisible()
  }

  // Content methods
  async waitForContentToLoad() {
    await this.waitForSkeletonToDisappear()
    await expect(this.statCards.first()).toBeVisible({ timeout: 5000 })
  }

  async verifyFallbackData() {
    // Verify specific fallback values from DashboardOverview component
    await expect(this.page.locator('text="24"')).toBeVisible() // fallback posts created
    await expect(this.page.locator('text="4.2%"')).toBeVisible() // fallback engagement rate
    await expect(this.page.locator('text="2.4K"')).toBeVisible() // fallback followers
    await expect(this.page.locator('text="18/100"')).toBeVisible() // fallback AI generations
  }

  async verifyCustomData(data: { postsCreated: number; engagementRate: number; followers: string; aiGenerations: string }) {
    await expect(this.page.locator(`text="${data.postsCreated}"`)).toBeVisible()
    await expect(this.page.locator(`text="${data.engagementRate}%"`)).toBeVisible()
    await expect(this.page.locator(`text="${data.followers}"`)).toBeVisible()
    await expect(this.page.locator(`text="${data.aiGenerations}"`)).toBeVisible()
  }

  // Error state methods
  async waitForErrorState() {
    try {
      await expect(this.errorIcon).toBeVisible({ timeout: 5000 })
      return true
    } catch {
      // If error icon doesn't appear, check for error message
      try {
        await expect(this.errorMessage).toBeVisible({ timeout: 2000 })
        return true
      } catch {
        return false
      }
    }
  }

  async clickRetry() {
    if (await this.retryButton.isVisible()) {
      await this.retryButton.click()
      return true
    }
    return false
  }

  async hasErrorBoundary(): Promise<boolean> {
    return await this.errorBoundary.isVisible()
  }

  async clickHomeButton() {
    await this.homeButton.click()
  }

  // Toast methods
  async waitForToast(type: 'error' | 'success' = 'error', timeout: number = 3000): Promise<boolean> {
    try {
      const toastLocator = type === 'error' ? this.errorToast : this.successToast
      await expect(toastLocator).toBeVisible({ timeout })
      return true
    } catch {
      // Check for generic toast container
      try {
        await expect(this.toastContainer.first()).toBeVisible({ timeout: 1000 })
        return true
      } catch {
        return false
      }
    }
  }

  async dismissToast(): Promise<boolean> {
    if (await this.toastDismissButton.isVisible()) {
      await this.toastDismissButton.first().click()
      await expect(this.toastDismissButton.first()).not.toBeVisible({ timeout: 2000 })
      return true
    }
    return false
  }

  // Accessibility methods
  async checkKeyboardNavigation() {
    await this.page.keyboard.press('Tab')
    
    // Look for retry button and test keyboard access
    if (await this.retryButton.isVisible()) {
      let focused = false
      for (let i = 0; i < 10; i++) {
        await this.page.keyboard.press('Tab')
        const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName)
        if (focusedElement === 'BUTTON') {
          focused = true
          break
        }
      }
      
      if (focused) {
        await this.page.keyboard.press('Enter')
        return true
      }
    }
    return false
  }

  // Utility methods
  async setViewportSize(width: number, height: number) {
    await this.page.setViewportSize({ width, height })
  }

  async getConsoleErrors(): Promise<string[]> {
    return await this.page.evaluate(() => (window as any).consoleErrors || [])
  }

  async triggerComponentError() {
    // Inject JavaScript error to potentially trigger error boundary
    await this.page.evaluate(() => {
      const originalError = console.error
      console.error = () => {} // Suppress expected error logs
      
      // Trigger error in React component
      window.setTimeout(() => {
        throw new Error('Simulated component error for testing')
      }, 100)
      
      // Restore console.error after a delay
      setTimeout(() => {
        console.error = originalError
      }, 1000)
    })
  }

  // Mock API helpers (to be used with page.route())
  static async mockAPIFailure(page: Page, endpoint: string, statusCode: number = 500, delay: number = 0) {
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

  static async mockAPISuccess(page: Page, endpoint: string, responseData: any, delay: number = 0) {
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
}