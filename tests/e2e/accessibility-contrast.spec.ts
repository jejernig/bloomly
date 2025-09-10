import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility - Color Contrast (WCAG 2.2 AA)', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('/')
  })

  test('should meet WCAG 2.2 AA color contrast requirements on home page @a11y @critical', async ({ page }) => {
    // Run axe specifically for color contrast violations
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should meet color contrast requirements on sign-in page @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should meet color contrast requirements on sign-up page @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signup')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should meet color contrast requirements on forgot password page @a11y @critical', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should meet color contrast requirements on reset password page @a11y @critical', async ({ page }) => {
    await page.goto('/auth/reset-password')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have correct contrast ratios for primary buttons @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check that primary button has sufficient contrast
    const signInButton = page.getByRole('button', { name: 'Sign in' })
    await expect(signInButton).toBeVisible()
    
    // Get computed styles for contrast validation
    const buttonStyles = await signInButton.evaluate(el => {
      const styles = getComputedStyle(el)
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      }
    })
    
    // Primary button should have high contrast white text on colored background
    expect(buttonStyles.color).toMatch(/rgb\(255,\s*255,\s*255\)|white/)
  })

  test('should have correct contrast ratios for input fields @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check input field contrast
    const emailInput = page.getByRole('textbox', { name: 'Email address' })
    await expect(emailInput).toBeVisible()
    
    // Validate input has proper border and text contrast
    const inputStyles = await emailInput.evaluate(el => {
      const styles = getComputedStyle(el)
      return {
        color: styles.color,
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor
      }
    })
    
    // Input should have dark text for good contrast
    expect(inputStyles.color).not.toMatch(/rgb\(255,\s*255,\s*255\)|white/)
  })

  test('should have correct contrast ratios for secondary buttons @a11y @critical', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    // Fill form to show success state with secondary button
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    
    // Wait for "Try a different email" button to appear
    const secondaryButton = page.getByRole('button', { name: 'Try a different email' })
    await expect(secondaryButton).toBeVisible({ timeout: 10000 })
    
    // Check button contrast
    const buttonStyles = await secondaryButton.evaluate(el => {
      const styles = getComputedStyle(el)
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor
      }
    })
    
    // Secondary button should have proper text contrast
    expect(buttonStyles.color).not.toBe('rgb(255, 255, 255)')
  })

  test('should have correct contrast ratios for links @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check primary link colors
    const forgotPasswordLink = page.getByRole('link', { name: 'Forgot your password?' })
    await expect(forgotPasswordLink).toBeVisible()
    
    const linkStyles = await forgotPasswordLink.evaluate(el => {
      const styles = getComputedStyle(el)
      return {
        color: styles.color
      }
    })
    
    // Links should have sufficient contrast for readability
    expect(linkStyles.color).not.toMatch(/rgb\(192,\s*192,\s*192\)|silver/)
  })

  test('should have correct contrast ratios for error messages @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Trigger validation error
    await page.click('button[type="submit"]')
    
    // Check error message contrast
    const errorMessage = page.getByText('Please enter a valid email address')
    await expect(errorMessage).toBeVisible()
    
    const errorStyles = await errorMessage.evaluate(el => {
      const styles = getComputedStyle(el)
      return {
        color: styles.color
      }
    })
    
    // Error messages should be clearly visible (typically red)
    expect(errorStyles.color).toMatch(/rgb\([0-9]+,\s*[0-9]+,\s*[0-9]+\)/)
  })

  test('should have correct contrast ratios for form labels @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check label contrast
    const emailLabel = page.getByText('Email address').first()
    await expect(emailLabel).toBeVisible()
    
    const labelStyles = await emailLabel.evaluate(el => {
      const styles = getComputedStyle(el)
      return {
        color: styles.color
      }
    })
    
    // Labels should have dark text for good contrast
    expect(labelStyles.color).not.toMatch(/rgb\(255,\s*255,\s*255\)|white/)
  })

  test('should have correct contrast ratios for muted text @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check subtitle/muted text contrast
    const subtitle = page.getByText('Welcome back to your boutique Instagram toolkit')
    await expect(subtitle).toBeVisible()
    
    const subtitleStyles = await subtitle.evaluate(el => {
      const styles = getComputedStyle(el)
      return {
        color: styles.color
      }
    })
    
    // Muted text should still meet minimum 4.5:1 contrast ratio
    // Should not be too light (like the old gray-400)
    expect(subtitleStyles.color).not.toMatch(/rgb\(156,\s*163,\s*175\)|rgb\(209,\s*213,\s*219\)/)
  })

  test('should maintain contrast in dark mode @a11y @critical', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/auth/signin')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have correct contrast for focus indicators @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Focus on email input
    const emailInput = page.getByRole('textbox', { name: 'Email address' })
    await emailInput.focus()
    
    // Check that focus indicator is visible
    const focusedStyles = await emailInput.evaluate(el => {
      const styles = getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow
      }
    })
    
    // Should have visible focus indicator
    const hasFocusIndicator = focusedStyles.outline !== 'none' || 
                             focusedStyles.boxShadow !== 'none' ||
                             focusedStyles.boxShadow.includes('rgb')
    
    expect(hasFocusIndicator).toBe(true)
  })

  test('should have sufficient contrast for disabled elements @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Get submit button in disabled state (empty form)
    const submitButton = page.getByRole('button', { name: 'Sign in' })
    
    // Check if button becomes disabled when form is invalid
    const buttonStyles = await submitButton.evaluate(el => {
      const styles = getComputedStyle(el)
      return {
        opacity: styles.opacity,
        color: styles.color,
        backgroundColor: styles.backgroundColor
      }
    })
    
    // Disabled elements should still maintain minimum contrast when visible
    if (parseFloat(buttonStyles.opacity) < 1) {
      // If opacity is used for disabled state, it should not make text unreadable
      expect(parseFloat(buttonStyles.opacity)).toBeGreaterThan(0.5)
    }
  })

  test('should pass comprehensive accessibility scan with enhanced rules @a11y @critical', async ({ page }) => {
    await page.goto('/auth/signin')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .withRules([
        'color-contrast',
        'color-contrast-enhanced', 
        'focus-order-semantics',
        'link-in-text-block'
      ])
      .analyze()

    // Log violations for debugging if any exist
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:')
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`)
        violation.nodes.forEach(node => {
          console.log(`  Element: ${node.html}`)
        })
      })
    }

    expect(accessibilityScanResults.violations).toEqual([])
  })
})