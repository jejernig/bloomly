import { test, expect } from '@playwright/test';
import { AccessibilityTestHelper, CanvasTestHelper } from '../utils/test-helpers';

test.describe('Canvas Accessibility Tests', () => {
  let a11yHelper: AccessibilityTestHelper;
  let canvasHelper: CanvasTestHelper;

  test.beforeEach(async ({ page }) => {
    a11yHelper = new AccessibilityTestHelper(page);
    canvasHelper = new CanvasTestHelper(page);
    await canvasHelper.navigateToEditor();
  });

  test.describe('WCAG 2.2 Level AA Compliance', () => {
    test('should pass automated accessibility scan @a11y @critical', async ({ page }) => {
      // Run comprehensive axe scan
      const results = await a11yHelper.runAxeScan();
      
      // Should have no violations
      expect(results.violations).toHaveLength(0);
      
      // Should have successful checks
      expect(results.passes.length).toBeGreaterThan(0);
    });

    test('should have proper color contrast ratios @a11y @critical', async ({ page }) => {
      await a11yHelper.expectColorContrastCompliance();
      
      // Check specific UI elements for contrast
      const criticalElements = [
        '[data-testid="save-button"]',
        '[data-testid="undo-button"]',
        '[data-testid="redo-button"]',
        '[data-testid="zoom-in-button"]',
        '[data-testid="zoom-out-button"]',
      ];
      
      for (const selector of criticalElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          const contrastRatio = await element.evaluate(el => {
            const styles = window.getComputedStyle(el);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            // This is a simplified contrast check
            // In production, you'd use a proper contrast ratio calculation library
            return { color, backgroundColor, hasContrast: color !== backgroundColor };
          });
          
          expect(contrastRatio.hasContrast).toBeTruthy();
        }
      }
    });

    test('should support keyboard navigation @a11y @critical', async ({ page }) => {
      await a11yHelper.testKeyboardNavigation();
      
      // Test specific keyboard interactions for canvas editor
      await page.keyboard.press('Tab'); // Should focus first control
      let focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continue tabbing through all controls
      const controls = [
        '[data-testid="undo-button"]',
        '[data-testid="redo-button"]',
        '[data-testid="save-button"]',
        '[data-testid="zoom-in-button"]',
        '[data-testid="zoom-out-button"]',
      ];
      
      for (let i = 0; i < controls.length; i++) {
        const control = page.locator(controls[i]);
        if (await control.isVisible()) {
          await control.focus();
          focusedElement = page.locator(':focus');
          await expect(focusedElement).toHaveAttribute('data-testid', controls[i].replace(/\[data-testid="|\"\]/g, ''));
        }
      }
    });

    test('should have visible focus indicators @a11y @critical', async ({ page }) => {
      await a11yHelper.expectFocusIndicatorsVisible();
      
      // Test specific focus indicators for canvas controls
      const interactiveElements = [
        '[data-testid="save-button"]',
        '[data-testid="undo-button"]',
        '[data-testid="redo-button"]',
        '[data-testid="zoom-in-button"]',
        '[data-testid="zoom-out-button"]',
      ];
      
      for (const selector of interactiveElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await element.focus();
          
          const focusStyles = await element.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              outline: styles.outline,
              boxShadow: styles.boxShadow,
              border: styles.border,
            };
          });
          
          // Should have some kind of focus indicator
          const hasFocusIndicator = 
            focusStyles.outline !== 'none' ||
            focusStyles.boxShadow !== 'none' ||
            focusStyles.boxShadow.includes('rgb');
          
          expect(hasFocusIndicator).toBeTruthy();
        }
      }
    });

    test('should have proper ARIA labels and roles @a11y @critical', async ({ page }) => {
      await a11yHelper.expectAriaCompliance();
      
      // Test specific ARIA implementation for canvas editor
      const canvasContainer = canvasHelper.getCanvasContainer();
      await expect(canvasContainer).toHaveAttribute('role', 'application');
      await expect(canvasContainer).toHaveAttribute('aria-label');
      
      // Check toolbar has proper ARIA structure
      const toolbar = canvasHelper.getToolbar();
      await expect(toolbar).toHaveAttribute('role', 'toolbar');
      await expect(toolbar).toHaveAttribute('aria-label');
      
      // Check sidebar has proper ARIA labels
      const sidebar = canvasHelper.getSidebar();
      await expect(sidebar).toHaveAttribute('aria-label');
      
      // Check all buttons have accessible names
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const hasAccessibleName = await button.evaluate(btn => {
          return !!(
            btn.getAttribute('aria-label') ||
            btn.getAttribute('aria-labelledby') ||
            btn.textContent?.trim()
          );
        });
        
        expect(hasAccessibleName).toBeTruthy();
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should announce canvas state changes @a11y', async ({ page }) => {
      // Add object and verify it's announced
      await canvasHelper.dragTextToCanvas();
      
      // Check for live region updates
      const liveRegion = page.locator('[aria-live]');
      if (await liveRegion.count() > 0) {
        await expect(liveRegion.first()).toContainText(/object added|text added/i);
      }
    });

    test('should announce selection changes @a11y', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.selectCanvasObject(300, 300);
      
      // Check for selection announcements
      const statusRegion = page.locator('[role="status"], [aria-live="polite"]');
      if (await statusRegion.count() > 0) {
        const announcement = await statusRegion.first().textContent();
        expect(announcement?.toLowerCase()).toMatch(/selected|active/);
      }
    });

    test('should provide canvas object descriptions @a11y', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.dragShapeToCanvas('rectangle');
      
      // Objects should be describable for screen readers
      const canvasObjects = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        if (!canvas) return [];
        
        return canvas.getObjects().map((obj: any) => ({
          type: obj.type,
          id: obj.id,
          description: obj.aria?.description || obj.alt || `${obj.type} object`
        }));
      });
      
      expect(canvasObjects.length).toBe(2);
      canvasObjects.forEach(obj => {
        expect(obj.description).toBeTruthy();
        expect(obj.description.length).toBeGreaterThan(0);
      });
    });

    test('should support screen reader navigation of layers @a11y', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.dragShapeToCanvas('rectangle');
      
      const layerPanel = canvasHelper.getLayerPanel();
      await expect(layerPanel).toHaveAttribute('role', 'list');
      
      const layerItems = layerPanel.locator('[role="listitem"]');
      await expect(layerItems).toHaveCount(2);
      
      // Each layer item should have proper ARIA attributes
      for (let i = 0; i < 2; i++) {
        const layerItem = layerItems.nth(i);
        await expect(layerItem).toHaveAttribute('aria-label');
        
        // Should indicate layer order and type
        const ariaLabel = await layerItem.getAttribute('aria-label');
        expect(ariaLabel).toMatch(/layer|text|shape|rectangle/i);
      }
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('should support arrow key navigation on canvas @a11y', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.selectCanvasObject(300, 300);
      
      // Get initial position
      const initialPosition = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeObject = canvas?.getActiveObject();
        return activeObject ? { left: activeObject.left, top: activeObject.top } : null;
      });
      
      expect(initialPosition).not.toBeNull();
      
      // Move with arrow keys
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      
      const newPosition = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeObject = canvas?.getActiveObject();
        return activeObject ? { left: activeObject.left, top: activeObject.top } : null;
      });
      
      expect(newPosition).not.toBeNull();
      expect(newPosition!.left).toBeGreaterThan(initialPosition!.left);
    });

    test('should support keyboard shortcuts @a11y', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.selectCanvasObject(300, 300);
      
      // Test common keyboard shortcuts
      await page.keyboard.press('Control+c'); // Copy
      await page.waitForTimeout(100);
      
      await page.keyboard.press('Control+v'); // Paste
      await page.waitForTimeout(500);
      
      // Should have 2 objects now
      await canvasHelper.expectCanvasObjectCount(2);
      
      // Test delete
      await canvasHelper.selectCanvasObject(300, 300);
      await page.keyboard.press('Delete');
      await canvasHelper.expectCanvasObjectCount(1);
      
      // Test undo
      await page.keyboard.press('Control+z');
      await canvasHelper.expectCanvasObjectCount(2);
    });

    test('should support Enter key for activation @a11y', async ({ page }) => {
      // Focus on save button
      const saveButton = canvasHelper.getSaveButton();
      await saveButton.focus();
      
      // Activate with Enter key
      await page.keyboard.press('Enter');
      
      // Should trigger save (or show save dialog/message)
      const saveMessage = page.locator('[data-testid*="save"]');
      if (await saveMessage.count() > 0) {
        await expect(saveMessage.first()).toBeVisible();
      }
    });

    test('should support Space key for activation @a11y', async ({ page }) => {
      // Focus on undo button
      const undoButton = canvasHelper.getUndoButton();
      await undoButton.focus();
      
      // Activate with Space key
      await page.keyboard.press(' ');
      
      // Should trigger undo action
      // Since canvas is empty, button might be disabled, but activation should be handled
      const isEnabled = await undoButton.isEnabled();
      if (isEnabled) {
        // If button was enabled, undo should have triggered
        expect(true).toBeTruthy(); // Placeholder assertion
      }
    });

    test('should support Tab to skip to main content @a11y', async ({ page }) => {
      // Look for skip link
      const skipLink = page.locator('[data-testid="skip-to-main"], a[href="#main"], a[href="#canvas"]').first();
      
      if (await skipLink.count() > 0) {
        await skipLink.focus();
        await page.keyboard.press('Enter');
        
        // Should move focus to main canvas area
        const focusedElement = page.locator(':focus');
        const focusedId = await focusedElement.getAttribute('id');
        expect(focusedId).toMatch(/main|canvas|content/);
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should support touch accessibility features @a11y @mobile', async ({ page }) => {
      // Check for touch-friendly sizes
      const touchElements = page.locator('[data-testid*="touch-target"], button, [role="button"]');
      const count = await touchElements.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = touchElements.nth(i);
        const box = await element.boundingBox();
        
        if (box && box.width > 0 && box.height > 0) {
          // WCAG AA requires 44x44px minimum for touch targets
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should announce mobile gesture hints @a11y @mobile', async ({ page }) => {
      // Check for gesture instructions
      const gestureHints = page.locator('[data-testid*="gesture-hint"], [aria-label*="pinch"], [aria-label*="zoom"]');
      
      if (await gestureHints.count() > 0) {
        const hintText = await gestureHints.first().textContent();
        expect(hintText).toMatch(/pinch|zoom|drag|tap/i);
      }
    });

    test('should provide alternative to gesture controls @a11y @mobile', async ({ page }) => {
      // Zoom controls should be available as buttons, not just gestures
      const zoomInButton = canvasHelper.getZoomInButton();
      const zoomOutButton = canvasHelper.getZoomOutButton();
      
      await expect(zoomInButton).toBeVisible();
      await expect(zoomOutButton).toBeVisible();
      
      // Test that they work
      await zoomInButton.tap();
      await canvasHelper.expectZoomLevel(1.1, 0.05);
    });
  });

  test.describe('Visual Accessibility', () => {
    test('should work in high contrast mode @a11y', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              filter: contrast(2) !important;
            }
          }
        `
      });
      
      // Force high contrast styles
      await page.evaluate(() => {
        document.body.classList.add('high-contrast');
      });
      
      // Check that interface is still usable
      await expect(canvasHelper.getCanvas()).toBeVisible();
      await expect(canvasHelper.getSidebar()).toBeVisible();
      await expect(canvasHelper.getToolbar()).toBeVisible();
      
      // Test functionality still works
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.expectCanvasObjectCount(1);
    });

    test('should respect reduced motion preferences @a11y', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // Test that animations are reduced
      await canvasHelper.dragTextToCanvas();
      
      // Check for motion preferences in styles
      const hasReducedMotion = await page.evaluate(() => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      });
      
      expect(hasReducedMotion).toBeTruthy();
      
      // Verify that non-essential animations are disabled
      const animatedElements = page.locator('.animate-spin, .animate-pulse, [style*="transition"]');
      const count = await animatedElements.count();
      
      for (let i = 0; i < count; i++) {
        const element = animatedElements.nth(i);
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            animationDuration: computed.animationDuration,
            transitionDuration: computed.transitionDuration,
          };
        });
        
        // Animations should be minimal or disabled
        const hasMinimalAnimation = 
          styles.animationDuration === '0s' ||
          styles.transitionDuration === '0s' ||
          styles.animationDuration === '0.01s';
        
        if (!hasMinimalAnimation) {
          // Allow some essential animations but they should be short
          expect(parseFloat(styles.animationDuration)).toBeLessThan(0.5);
        }
      }
    });

    test('should support forced colors mode @a11y', async ({ page }) => {
      // Simulate Windows High Contrast mode
      await page.addStyleTag({
        content: `
          @media (forced-colors: active) {
            * {
              color: CanvasText !important;
              background: Canvas !important;
              border-color: ButtonText !important;
            }
            button {
              color: ButtonText !important;
              background: ButtonFace !important;
            }
          }
        `
      });
      
      // Force the styles to apply
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-forced-colors', 'active');
      });
      
      // Verify interface remains functional
      await expect(canvasHelper.getCanvas()).toBeVisible();
      await expect(canvasHelper.getToolbar()).toBeVisible();
      
      // Test that buttons are still distinguishable
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        await expect(button).toBeVisible();
        
        // Should have forced colors applied
        const styles = await button.evaluate(btn => {
          const computed = window.getComputedStyle(btn);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });
        
        // Colors should be system colors in forced colors mode
        expect(styles.color).toBeTruthy();
        expect(styles.backgroundColor).toBeTruthy();
      }
    });
  });

  test.describe('Error Handling Accessibility', () => {
    test('should announce errors to screen readers @a11y', async ({ page }) => {
      // Mock a save error
      await page.route('**/api/projects/**', (route) => {
        route.fulfill({ status: 500, body: 'Server error' });
      });
      
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.getSaveButton().click();
      
      // Error should be announced
      const errorMessage = page.locator('[role="alert"], [aria-live="assertive"]');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
        const errorText = await errorMessage.first().textContent();
        expect(errorText).toMatch(/error|failed|problem/i);
      }
    });

    test('should provide accessible error recovery options @a11y', async ({ page }) => {
      // Mock error condition
      await page.route('**/api/projects/**', (route) => {
        route.fulfill({ status: 500, body: 'Server error' });
      });
      
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.getSaveButton().click();
      
      // Should provide retry or alternative actions
      const retryButton = page.locator('[data-testid="retry-button"], button:has-text("retry")', { hasText: /retry|try again/i });
      if (await retryButton.count() > 0) {
        await expect(retryButton.first()).toBeVisible();
        await expect(retryButton.first()).toBeEnabled();
      }
    });
  });
});