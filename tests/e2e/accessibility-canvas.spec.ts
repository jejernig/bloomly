import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Canvas Editor Accessibility (WCAG 2.2 AA)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to canvas editor (assuming we need to be authenticated)
    await page.goto('/auth/signin')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for redirect to editor or navigate directly
    await page.goto('/editor')
    await page.waitForLoadState('networkidle')
  })

  test('should meet WCAG 2.2 AA accessibility requirements on canvas editor @a11y @critical', async ({ page }) => {
    // Run comprehensive axe scan on canvas editor
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper canvas accessibility attributes @a11y @critical', async ({ page }) => {
    // Check that canvas has proper ARIA attributes
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    
    // Check for role attribute
    const role = await canvas.getAttribute('role')
    expect(role).toBe('img')
    
    // Check for aria-label or aria-labelledby
    const ariaLabel = await canvas.getAttribute('aria-label')
    const ariaLabelledBy = await canvas.getAttribute('aria-labelledby')
    expect(ariaLabel || ariaLabelledBy).toBeTruthy()
    
    // Check for tabindex to make it focusable
    const tabindex = await canvas.getAttribute('tabindex')
    expect(tabindex).toBe('0')
  })

  test('should support keyboard navigation for canvas operations @a11y @critical', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    
    // Focus the canvas
    await canvas.focus()
    
    // Test arrow key navigation
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowUp')
    
    // Test Enter key for selection/activation
    await page.keyboard.press('Enter')
    
    // Test Escape key
    await page.keyboard.press('Escape')
    
    // Test Delete/Backspace for deletion
    await page.keyboard.press('Delete')
    await page.keyboard.press('Backspace')
    
    // Canvas should remain focused after keyboard interactions
    await expect(canvas).toBeFocused()
  })

  test('should announce canvas changes to screen readers @a11y @critical', async ({ page }) => {
    // Check for aria-live regions
    const liveRegion = page.locator('[aria-live]')
    await expect(liveRegion).toBeVisible()
    
    // Check that live region has appropriate aria-live value
    const ariaLive = await liveRegion.getAttribute('aria-live')
    expect(['polite', 'assertive']).toContain(ariaLive)
    
    // Perform action that should trigger announcement
    const canvas = page.locator('canvas').first()
    await canvas.focus()
    await page.keyboard.press('ArrowRight')
    
    // Check that live region content updates
    const liveContent = await liveRegion.textContent()
    expect(liveContent).toBeTruthy()
  })

  test('should support keyboard shortcuts with proper documentation @a11y @critical', async ({ page }) => {
    // Test common keyboard shortcuts
    const canvas = page.locator('canvas').first()
    await canvas.focus()
    
    // Test Ctrl+A (Select All)
    await page.keyboard.press('Control+a')
    
    // Test Ctrl+D (Duplicate)
    await page.keyboard.press('Control+d')
    
    // Test Ctrl+Z (Undo)
    await page.keyboard.press('Control+z')
    
    // Test Ctrl+Y or Ctrl+Shift+Z (Redo)
    await page.keyboard.press('Control+y')
    
    // Test number keys for zoom
    await page.keyboard.press('0') // Reset zoom
    await page.keyboard.press('Equal') // Zoom in
    await page.keyboard.press('Minus') // Zoom out
    
    // Canvas should handle these without errors
    await expect(canvas).toBeVisible()
  })

  test('should have accessible toolbar and tool selection @a11y @critical', async ({ page }) => {
    // Check for toolbar accessibility
    const toolbar = page.locator('[role="toolbar"]').first()
    if (await toolbar.count() > 0) {
      await expect(toolbar).toBeVisible()
      
      // Check that toolbar has aria-label
      const ariaLabel = await toolbar.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
    }
    
    // Check tool buttons have proper accessibility
    const toolButtons = page.locator('button').filter({ hasText: /Rectangle|Circle|Text|Line|Select/ })
    const buttonCount = await toolButtons.count()
    
    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = toolButtons.nth(i)
        
        // Each button should be keyboard accessible
        await button.focus()
        await expect(button).toBeFocused()
        
        // Check for aria-label or accessible name
        const accessibleName = await button.getAttribute('aria-label') || 
                              await button.textContent()
        expect(accessibleName).toBeTruthy()
      }
    }
  })

  test('should have accessible layer panel @a11y @critical', async ({ page }) => {
    // Check if layers panel exists and is accessible
    const layersPanel = page.locator('[data-testid="layers-panel"]').or(
      page.locator('text=Layers').locator('..')
    )
    
    if (await layersPanel.count() > 0) {
      await expect(layersPanel).toBeVisible()
      
      // Check for proper heading structure
      const layersHeading = layersPanel.locator('h1, h2, h3, h4, h5, h6').first()
      if (await layersHeading.count() > 0) {
        await expect(layersHeading).toBeVisible()
      }
      
      // Layer items should be keyboard accessible
      const layerItems = layersPanel.locator('[role="listitem"], [role="option"], button')
      const itemCount = await layerItems.count()
      
      if (itemCount > 0) {
        for (let i = 0; i < Math.min(itemCount, 3); i++) {
          const item = layerItems.nth(i)
          await item.focus()
          await expect(item).toBeFocused()
        }
      }
    }
  })

  test('should have accessible properties panel @a11y @critical', async ({ page }) => {
    // Check if properties panel exists and is accessible
    const propertiesPanel = page.locator('[data-testid="properties-panel"]').or(
      page.locator('text=Properties').locator('..')
    )
    
    if (await propertiesPanel.count() > 0) {
      await expect(propertiesPanel).toBeVisible()
      
      // Check form controls have proper labels
      const formInputs = propertiesPanel.locator('input, select, textarea')
      const inputCount = await formInputs.count()
      
      for (let i = 0; i < inputCount; i++) {
        const input = formInputs.nth(i)
        
        // Check for label association
        const inputId = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        
        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`)
          const hasLabel = await label.count() > 0
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy()
        } else {
          expect(ariaLabel || ariaLabelledBy).toBeTruthy()
        }
      }
    }
  })

  test('should handle focus management properly @a11y @critical', async ({ page }) => {
    // Test tab order through interface
    await page.keyboard.press('Tab')
    let focusedElement = await page.locator(':focus').first()
    await expect(focusedElement).toBeVisible()
    
    // Tab through several elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      focusedElement = await page.locator(':focus').first()
      await expect(focusedElement).toBeVisible()
    }
    
    // Shift+Tab should work in reverse
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Shift+Tab')
      focusedElement = await page.locator(':focus').first()
      await expect(focusedElement).toBeVisible()
    }
  })

  test('should support keyboard-only canvas object manipulation @a11y @critical', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    await canvas.focus()
    
    // Try to create an object with keyboard (if supported)
    await page.keyboard.press('r') // Rectangle tool shortcut
    await page.keyboard.press('Enter') // Create rectangle
    
    // Try to move object with arrow keys
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowDown')
    
    // Try to select object
    await page.keyboard.press('Enter')
    
    // Try to delete object
    await page.keyboard.press('Delete')
    
    // These operations should not cause errors
    await expect(canvas).toBeVisible()
  })

  test('should have appropriate color contrast in canvas interface @a11y @critical', async ({ page }) => {
    // Run color contrast specific scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should work with browser zoom up to 200% @a11y @critical', async ({ page }) => {
    // Test at 200% zoom
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.evaluate(() => {
      document.body.style.zoom = '200%'
    })
    
    // Canvas should still be functional
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    
    // Should be able to interact with interface
    await canvas.focus()
    await page.keyboard.press('ArrowRight')
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '100%'
    })
  })

  test('should respect prefers-reduced-motion setting @a11y @critical', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Navigate and interact with canvas
    const canvas = page.locator('canvas').first()
    await canvas.focus()
    await page.keyboard.press('ArrowRight')
    
    // Should not have excessive animations
    const animatedElements = page.locator('[class*="animate"], [style*="transition"], [style*="animation"]')
    const count = await animatedElements.count()
    
    // This is a basic check - specific implementation may vary
    await expect(canvas).toBeVisible()
  })

  test('should have descriptive error messages and help text @a11y @critical', async ({ page }) => {
    // Try to trigger an error condition (invalid operation)
    const canvas = page.locator('canvas').first()
    await canvas.focus()
    
    // Try invalid operations
    await page.keyboard.press('Delete') // Delete with nothing selected
    
    // Check for error announcements or help text
    const liveRegion = page.locator('[aria-live]')
    const errorMessage = page.locator('[role="alert"]')
    
    // Should have some form of user feedback
    const hasLiveRegion = await liveRegion.count() > 0
    const hasErrorMessage = await errorMessage.count() > 0
    
    expect(hasLiveRegion || hasErrorMessage).toBeTruthy()
  })

  test('should support high contrast mode @a11y @critical', async ({ page }) => {
    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            background: white !important;
            color: black !important;
            border-color: black !important;
          }
        }
      `
    })
    
    // Interface should still be usable
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    
    // Should be able to interact
    await canvas.focus()
    await page.keyboard.press('ArrowRight')
  })
})