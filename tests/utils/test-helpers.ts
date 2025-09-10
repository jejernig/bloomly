import { Page, Locator, expect } from '@playwright/test';

export class CanvasTestHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to the canvas editor page
   */
  async navigateToEditor(): Promise<void> {
    // Intercept navigation to prevent auth redirects during tests
    await this.page.route('**/auth/signin', async route => {
      // Redirect back to editor instead of signin page
      await route.fulfill({
        status: 302,
        headers: { 'Location': '/editor' }
      });
    });

    // Set up comprehensive authentication mocking
    await this.page.addInitScript(() => {
      // Mock environment variables and auth state
      process.env.NODE_ENV = 'test';
      
      // Set up mock user data in localStorage first
      const mockAuthData = {
        state: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            aud: 'authenticated',
            role: 'authenticated',
            email_confirmed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          profile: {
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            subscription_tier: 'free',
          },
          instagramAccounts: [],
          isLoading: false,
          error: null,
        },
        version: 0,
      };
      
      localStorage.setItem('auth-storage', JSON.stringify(mockAuthData));

      // Mock Next.js router to prevent redirects
      (window as any).__NEXT_ROUTER_MOCK__ = true;
    });

    await this.page.goto('/editor');
    
    // Force set auth state after page loads
    await this.page.evaluate(() => {
      // Wait for stores to be available and force set auth state
      const checkAndSetAuth = () => {
        const authStore = (window as any).useAuthStore;
        if (authStore && authStore.setState) {
          authStore.setState({
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              aud: 'authenticated',
              role: 'authenticated',
            },
            profile: {
              id: 'test-user-id',
              email: 'test@example.com',
              full_name: 'Test User',
              subscription_tier: 'free',
            },
            isLoading: false,
            error: null,
          });
        } else {
          setTimeout(checkAndSetAuth, 100);
        }
      };
      checkAndSetAuth();
    });

    await this.page.waitForLoadState('networkidle');
    
    // Wait for canvas to be initialized with longer timeout
    await this.page.waitForSelector('[data-testid="canvas-container"]', { timeout: 45000 });
    await this.page.waitForFunction(() => {
      return window.getComputedStyle(document.querySelector('[data-testid="canvas-container"]') as Element).opacity === '1';
    }, { timeout: 10000 });
  }

  /**
   * Set up mock authentication for tests
   */
  private async setupMockAuthentication(): Promise<void> {
    // Mock the auth store with an authenticated user
    await this.page.addInitScript(() => {
      // Mock localStorage for auth persistence
      const mockAuthData = {
        state: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          profile: {
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            subscription_tier: 'free',
          },
          isLoading: false,
          error: null,
        },
        version: 0,
      };
      
      localStorage.setItem('auth-storage', JSON.stringify(mockAuthData));
    });

    // Also mock the Supabase session on the page
    await this.page.addInitScript(() => {
      // Mock Supabase auth for tests
      (window as any).__SUPABASE_AUTH_MOCK__ = {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
        session: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        },
      };

      // Override auth state for the duration of the test
      const originalAddEventListener = window.addEventListener;
      window.addEventListener = function(type: string, listener: any, options?: any) {
        if (type === 'load') {
          const wrappedListener = function(event: Event) {
            // Set auth state immediately after page load
            setTimeout(() => {
              if ((window as any).useAuthStore && typeof (window as any).useAuthStore.setState === 'function') {
                (window as any).useAuthStore.setState({
                  user: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                  },
                  profile: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    full_name: 'Test User',
                    subscription_tier: 'free',
                  },
                  isLoading: false,
                  error: null,
                });
              }
            }, 100);
            
            if (typeof listener === 'function') {
              listener.call(this, event);
            } else if (listener && typeof listener.handleEvent === 'function') {
              listener.handleEvent(event);
            }
          };
          originalAddEventListener.call(this, type, wrappedListener, options);
        } else {
          originalAddEventListener.call(this, type, listener, options);
        }
      };
    });
  }

  /**
   * Get the canvas element
   */
  getCanvas(): Locator {
    return this.page.locator('canvas').first();
  }

  /**
   * Get the canvas container
   */
  getCanvasContainer(): Locator {
    return this.page.locator('[data-testid="canvas-container"]');
  }

  /**
   * Get sidebar elements
   */
  getSidebar(): Locator {
    return this.page.locator('[data-testid="editor-sidebar"]');
  }

  /**
   * Get draggable items from sidebar
   */
  getDraggableText(): Locator {
    return this.page.locator('[data-testid="draggable-text"]');
  }

  getDraggableShape(shape: string): Locator {
    return this.page.locator(`[data-testid="draggable-shape-${shape}"]`);
  }

  getDraggableImage(): Locator {
    return this.page.locator('[data-testid="draggable-image"]');
  }

  /**
   * Get property panels
   */
  getPropertyPanel(): Locator {
    return this.page.locator('[data-testid="property-panel"]');
  }

  getTextPropertyPanel(): Locator {
    return this.page.locator('[data-testid="text-property-panel"]');
  }

  getImagePropertyPanel(): Locator {
    return this.page.locator('[data-testid="image-property-panel"]');
  }

  getShapePropertyPanel(): Locator {
    return this.page.locator('[data-testid="shape-property-panel"]');
  }

  /**
   * Get layer panel
   */
  getLayerPanel(): Locator {
    return this.page.locator('[data-testid="layer-panel"]');
  }

  getLayerItem(layerId: string): Locator {
    return this.page.locator(`[data-testid="layer-item-${layerId}"]`);
  }

  /**
   * Get toolbar controls
   */
  getToolbar(): Locator {
    return this.page.locator('[data-testid="editor-toolbar"]');
  }

  getUndoButton(): Locator {
    return this.page.locator('[data-testid="undo-button"]');
  }

  getRedoButton(): Locator {
    return this.page.locator('[data-testid="redo-button"]');
  }

  getSaveButton(): Locator {
    return this.page.locator('[data-testid="save-button"]');
  }

  getZoomInButton(): Locator {
    return this.page.locator('[data-testid="zoom-in-button"]');
  }

  getZoomOutButton(): Locator {
    return this.page.locator('[data-testid="zoom-out-button"]');
  }

  /**
   * Drag and drop operations
   */
  async dragTextToCanvas(text: string = 'Sample Text'): Promise<void> {
    const textItem = this.getDraggableText();
    const canvas = this.getCanvas();
    
    await textItem.dragTo(canvas, {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: 300, y: 300 }
    });
    
    // Wait for the object to be added
    await this.page.waitForTimeout(500);
  }

  async dragShapeToCanvas(shape: string = 'rectangle'): Promise<void> {
    const shapeItem = this.getDraggableShape(shape);
    const canvas = this.getCanvas();
    
    await shapeItem.dragTo(canvas, {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: 400, y: 300 }
    });
    
    // Wait for the object to be added
    await this.page.waitForTimeout(500);
  }

  /**
   * Canvas object manipulation
   */
  async selectCanvasObject(x: number, y: number): Promise<void> {
    const canvas = this.getCanvas();
    await canvas.click({ position: { x, y } });
    await this.page.waitForTimeout(200);
  }

  async multiSelectCanvasObjects(positions: Array<{x: number, y: number}>): Promise<void> {
    // Start selection with first object while holding Shift
    await this.selectCanvasObject(positions[0].x, positions[0].y);
    
    // Add additional objects to selection
    for (let i = 1; i < positions.length; i++) {
      const canvas = this.getCanvas();
      await canvas.click({ 
        position: { x: positions[i].x, y: positions[i].y },
        modifiers: ['Shift']
      });
      await this.page.waitForTimeout(200);
    }
  }

  async moveCanvasObject(fromX: number, fromY: number, toX: number, toY: number): Promise<void> {
    const canvas = this.getCanvas();
    
    await canvas.hover({ position: { x: fromX, y: fromY } });
    await this.page.mouse.down();
    await canvas.hover({ position: { x: toX, y: toY } });
    await this.page.mouse.up();
    
    await this.page.waitForTimeout(200);
  }

  /**
   * Touch gesture simulation
   */
  async simulatePinchZoom(scale: number, centerX: number = 400, centerY: number = 400): Promise<void> {
    const canvas = this.getCanvas();
    const canvasBounds = await canvas.boundingBox();
    
    if (!canvasBounds) return;
    
    const touch1Start = { x: centerX - 50, y: centerY };
    const touch2Start = { x: centerX + 50, y: centerY };
    const touch1End = { x: centerX - (50 * scale), y: centerY };
    const touch2End = { x: centerX + (50 * scale), y: centerY };
    
    // Start pinch gesture
    await this.page.touchscreen.tap(touch1Start.x, touch1Start.y);
    await this.page.touchscreen.tap(touch2Start.x, touch2Start.y);
    
    // Simulate pinch movement
    await Promise.all([
      this.page.touchscreen.tap(touch1End.x, touch1End.y),
      this.page.touchscreen.tap(touch2End.x, touch2End.y)
    ]);
    
    await this.page.waitForTimeout(300);
  }

  async simulatePanGesture(deltaX: number, deltaY: number): Promise<void> {
    const canvas = this.getCanvas();
    const canvasBounds = await canvas.boundingBox();
    
    if (!canvasBounds) return;
    
    const startX = canvasBounds.width / 2;
    const startY = canvasBounds.height / 2;
    
    await canvas.hover({ position: { x: startX, y: startY } });
    await this.page.mouse.down();
    await canvas.hover({ position: { x: startX + deltaX, y: startY + deltaY } });
    await this.page.mouse.up();
    
    await this.page.waitForTimeout(200);
  }

  /**
   * Validation helpers
   */
  async expectCanvasObjectCount(count: number): Promise<void> {
    // Wait for canvas to be ready and check object count
    await this.page.waitForFunction((expectedCount) => {
      const canvas = (window as any).fabric?.Canvas?.instances?.[0];
      return canvas && canvas.getObjects().length === expectedCount;
    }, count);
  }

  async expectObjectSelected(): Promise<void> {
    await expect(this.getPropertyPanel()).toBeVisible();
  }

  async expectZoomLevel(expectedZoom: number, tolerance: number = 0.1): Promise<void> {
    await this.page.waitForFunction(([zoom, tol]) => {
      const canvas = (window as any).fabric?.Canvas?.instances?.[0];
      if (!canvas) return false;
      const currentZoom = canvas.getZoom();
      return Math.abs(currentZoom - zoom) <= tol;
    }, [expectedZoom, tolerance]);
  }

  /**
   * Performance measurement helpers
   */
  async measureCanvasRenderTime(): Promise<number> {
    return await this.page.evaluate(() => {
      const canvas = (window as any).fabric?.Canvas?.instances?.[0];
      if (!canvas) return 0;
      
      const startTime = performance.now();
      canvas.renderAll();
      const endTime = performance.now();
      
      return endTime - startTime;
    });
  }

  async measureMemoryUsage(): Promise<number> {
    return await this.page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
  }

  /**
   * Auto-save testing helpers
   */
  async waitForAutoSave(timeoutMs: number = 35000): Promise<void> {
    // Wait for auto-save indicator or success message
    await this.page.waitForSelector('[data-testid="auto-save-indicator"]', { 
      timeout: timeoutMs,
      state: 'visible'
    });
    
    await this.page.waitForSelector('[data-testid="auto-save-success"]', {
      timeout: 5000,
      state: 'visible'
    });
  }

  async triggerManualSave(): Promise<void> {
    await this.getSaveButton().click();
    await this.page.waitForSelector('[data-testid="save-success-message"]', {
      timeout: 10000,
      state: 'visible'
    });
  }
}

/**
 * Mobile-specific test helper
 */
export class MobileCanvasTestHelper extends CanvasTestHelper {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Mobile-specific navigation
   */
  async navigateToMobileEditor(): Promise<void> {
    await this.page.goto('/editor');
    await this.page.waitForLoadState('networkidle');
    
    // Wait for mobile layout to initialize
    await this.page.waitForSelector('[data-testid="mobile-editor-layout"]');
    await this.page.waitForSelector('[data-testid="canvas-container"]');
  }

  /**
   * Mobile panel controls
   */
  getMobileBottomNav(): Locator {
    return this.page.locator('[data-testid="mobile-bottom-nav"]');
  }

  getMobileSidebarToggle(): Locator {
    return this.page.locator('[data-testid="mobile-sidebar-toggle"]');
  }

  getMobileLayerToggle(): Locator {
    return this.page.locator('[data-testid="mobile-layer-toggle"]');
  }

  getMobilePropertyToggle(): Locator {
    return this.page.locator('[data-testid="mobile-property-toggle"]');
  }

  /**
   * Mobile-specific interactions
   */
  async openMobileSidebar(): Promise<void> {
    await this.getMobileSidebarToggle().tap();
    await this.page.waitForSelector('[data-testid="mobile-sidebar"]', { state: 'visible' });
  }

  async closeMobileSidebar(): Promise<void> {
    // Tap outside or use close button
    await this.page.locator('[data-testid="mobile-sidebar-overlay"]').tap();
    await this.page.waitForSelector('[data-testid="mobile-sidebar"]', { state: 'hidden' });
  }

  async openMobileLayerPanel(): Promise<void> {
    await this.getMobileLayerToggle().tap();
    await this.page.waitForSelector('[data-testid="mobile-layer-panel"]', { state: 'visible' });
  }

  /**
   * Touch-specific gestures
   */
  async performTouchDragDrop(fromSelector: string, toX: number, toY: number): Promise<void> {
    const sourceElement = this.page.locator(fromSelector);
    
    // Get source element position
    const sourceBox = await sourceElement.boundingBox();
    if (!sourceBox) return;
    
    // Perform touch drag
    await this.page.touchscreen.tap(sourceBox.x + sourceBox.width/2, sourceBox.y + sourceBox.height/2);
    await this.page.waitForTimeout(100);
    
    // Move to target position
    await this.page.touchscreen.tap(toX, toY);
    await this.page.waitForTimeout(300);
  }

  async performPinchZoom(scale: number): Promise<void> {
    const canvas = this.getCanvas();
    const bounds = await canvas.boundingBox();
    if (!bounds) return;
    
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    await this.simulatePinchZoom(scale, centerX, centerY);
  }

  /**
   * Validate mobile-specific behaviors
   */
  async expectMobileLayoutActive(): Promise<void> {
    await expect(this.page.locator('[data-testid="mobile-editor-layout"]')).toBeVisible();
    await expect(this.getMobileBottomNav()).toBeVisible();
  }

  async expectTouchFriendlyControls(): Promise<void> {
    // Check that touch targets meet minimum size requirements (44x44px)
    const touchElements = await this.page.locator('[data-testid*="touch-target"]').all();
    
    for (const element of touchElements) {
      const box = await element.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
}

/**
 * Accessibility test helper
 */
export class AccessibilityTestHelper {
  constructor(private page: Page) {}

  /**
   * Run axe accessibility scan
   */
  async runAxeScan(): Promise<any> {
    const { injectAxe, checkA11y } = await import('axe-playwright');
    
    await injectAxe(this.page);
    const results = await checkA11y(this.page);
    
    return results;
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<void> {
    // Test Tab navigation
    await this.page.keyboard.press('Tab');
    await expect(this.page.locator(':focus')).toBeVisible();
    
    // Test through all focusable elements
    const focusableElements = await this.page.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])').count();
    
    for (let i = 0; i < focusableElements; i++) {
      await this.page.keyboard.press('Tab');
      const focusedElement = this.page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  }

  /**
   * Test focus indicators
   */
  async expectFocusIndicatorsVisible(): Promise<void> {
    const focusableElements = this.page.locator('button, input, select, textarea, a[href]');
    const count = await focusableElements.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) { // Test first 10 elements
      const element = focusableElements.nth(i);
      await element.focus();
      
      // Check that focus styles are applied
      const focusOutline = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });
      
      expect(focusOutline).toBeTruthy();
    }
  }

  /**
   * Test ARIA labels and roles
   */
  async expectAriaCompliance(): Promise<void> {
    // Check that interactive elements have proper ARIA labels
    const interactiveElements = this.page.locator('button, input, select, [role="button"]');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      const hasAriaLabel = await element.getAttribute('aria-label');
      const hasAriaLabelledBy = await element.getAttribute('aria-labelledby');
      const hasTextContent = await element.textContent();
      
      expect(hasAriaLabel || hasAriaLabelledBy || hasTextContent).toBeTruthy();
    }
  }

  /**
   * Test color contrast
   */
  async expectColorContrastCompliance(): Promise<void> {
    // This would typically use a contrast checking library
    // For now, we'll check that text elements have sufficient contrast
    const textElements = this.page.locator('p, h1, h2, h3, h4, h5, h6, span, button');
    const count = await textElements.count();
    
    for (let i = 0; i < Math.min(count, 20); i++) { // Test first 20 text elements
      const element = textElements.nth(i);
      
      const { color, backgroundColor } = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      // Basic check that color is not the same as background
      expect(color).not.toBe(backgroundColor);
    }
  }
}

/**
 * Performance test helper
 */
export class PerformanceTestHelper {
  constructor(private page: Page) {}

  /**
   * Measure page load performance
   */
  async measurePageLoad(): Promise<any> {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstContentfulPaint: (performance as any).getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: (performance as any).getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
        cumulativeLayoutShift: (performance as any).getEntriesByName('layout-shift').reduce((sum: number, entry: any) => sum + entry.value, 0),
      };
    });
    
    return performanceMetrics;
  }

  /**
   * Measure canvas rendering performance
   */
  async measureCanvasPerformance(objectCount: number = 10): Promise<any> {
    const canvasHelper = new CanvasTestHelper(this.page);
    
    // Add objects to canvas
    for (let i = 0; i < objectCount; i++) {
      await canvasHelper.dragTextToCanvas(`Text ${i}`);
    }
    
    // Measure render time
    const renderTime = await canvasHelper.measureCanvasRenderTime();
    const memoryUsage = await canvasHelper.measureMemoryUsage();
    
    return { renderTime, memoryUsage, objectCount };
  }

  /**
   * Measure mobile performance
   */
  async measureMobilePerformance(): Promise<any> {
    // Throttle CPU and network to simulate mobile conditions
    const client = await this.page.context().newCDPSession(this.page);
    
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 40
    });
    
    const mobileHelper = new MobileCanvasTestHelper(this.page);
    await mobileHelper.navigateToMobileEditor();
    
    const performanceMetrics = await this.measurePageLoad();
    
    // Reset throttling
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    });
    
    return performanceMetrics;
  }
}

/**
 * Authentication test helper
 */
export class AuthTestHelper {
  constructor(private page: Page) {}

  /**
   * Navigation methods
   */
  async navigateToSignIn(): Promise<void> {
    await this.page.goto('/auth/signin');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid="signin-form"], form');
  }

  async navigateToSignUp(): Promise<void> {
    await this.page.goto('/auth/signup');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid="signup-form"], form');
  }

  /**
   * Form element getters - Sign In
   */
  getSignInForm(): Locator {
    return this.page.locator('form').first();
  }

  getEmailInput(): Locator {
    return this.page.locator('input[name="email"], input[type="email"]').first();
  }

  getPasswordInput(): Locator {
    return this.page.locator('input[name="password"], input[type="password"]').first();
  }

  getSignInButton(): Locator {
    return this.page.locator('button[type="submit"], button:has-text("Sign in")').first();
  }

  getGoogleSignInButton(): Locator {
    return this.page.locator('button:has-text("Continue with Google"), button:has-text("Sign up with Google")').first();
  }

  getRememberMeCheckbox(): Locator {
    return this.page.locator('input[name="remember-me"], input[type="checkbox"]').first();
  }

  getForgotPasswordLink(): Locator {
    return this.page.locator('a:has-text("Forgot your password?"), a[href*="forgot"]').first();
  }

  getSignUpLink(): Locator {
    return this.page.locator('a:has-text("Sign up"), a[href*="signup"]').first();
  }

  /**
   * Form element getters - Sign Up
   */
  getSignUpForm(): Locator {
    return this.page.locator('form').first();
  }

  getFullNameInput(): Locator {
    return this.page.locator('input[name="fullName"], input[placeholder*="full name"], input[placeholder*="name"]').first();
  }

  getConfirmPasswordInput(): Locator {
    return this.page.locator('input[name="confirmPassword"], input[placeholder*="confirm"], input[placeholder*="Confirm"]').first();
  }

  getTermsCheckbox(): Locator {
    return this.page.locator('input[type="checkbox"]:near(:text("Terms"))').first();
  }

  getSignUpButton(): Locator {
    return this.page.locator('button[type="submit"], button:has-text("Create Account"), button:has-text("Sign up")').first();
  }

  getGoogleSignUpButton(): Locator {
    return this.page.locator('button:has-text("Sign up with Google")').first();
  }

  getSignInLink(): Locator {
    return this.page.locator('a:has-text("Sign in"), a[href*="signin"]').first();
  }

  /**
   * Form interaction methods
   */
  async fillEmail(email: string): Promise<void> {
    await this.getEmailInput().fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.getPasswordInput().fill(password);
  }

  async fillFullName(fullName: string): Promise<void> {
    await this.getFullNameInput().fill(fullName);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.getConfirmPasswordInput().fill(password);
  }

  async checkTermsAgreement(): Promise<void> {
    await this.getTermsCheckbox().check();
  }

  async clickSignIn(): Promise<void> {
    await this.getSignInButton().click();
    await this.page.waitForTimeout(500); // Wait for form submission
  }

  async clickSignUp(): Promise<void> {
    await this.getSignUpButton().click();
    await this.page.waitForTimeout(500); // Wait for form submission
  }

  async clickGoogleSignIn(): Promise<void> {
    await this.getGoogleSignInButton().click();
  }

  async clickGoogleSignUp(): Promise<void> {
    await this.getGoogleSignUpButton().click();
  }

  async clickSignUpLink(): Promise<void> {
    await this.getSignUpLink().click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickSignInLink(): Promise<void> {
    await this.getSignInLink().click();
    await this.page.waitForLoadState('networkidle');
  }

  async togglePasswordVisibility(): Promise<void> {
    // Look for password visibility toggle button (eye icon)
    const toggleButton = this.page.locator('button:near(input[type="password"]), [data-testid="password-toggle"]').first();
    await toggleButton.click();
  }

  /**
   * Validation and error checking methods
   */
  async expectEmailError(message: string): Promise<void> {
    const errorElement = this.page.locator('text=' + message + ', [data-testid="email-error"], .error:near(input[name="email"])').first();
    await expect(errorElement).toBeVisible({ timeout: 3000 });
  }

  async expectPasswordError(message: string): Promise<void> {
    const errorElement = this.page.locator('text=' + message + ', [data-testid="password-error"], .error:near(input[name="password"])').first();
    await expect(errorElement).toBeVisible({ timeout: 3000 });
  }

  async expectFullNameError(message: string): Promise<void> {
    const errorElement = this.page.locator('text=' + message + ', [data-testid="fullName-error"], .error:near(input[name="fullName"])').first();
    await expect(errorElement).toBeVisible({ timeout: 3000 });
  }

  async expectConfirmPasswordError(message: string): Promise<void> {
    const errorElement = this.page.locator('text=' + message + ', [data-testid="confirmPassword-error"], .error:near(input[name="confirmPassword"])').first();
    await expect(errorElement).toBeVisible({ timeout: 3000 });
  }

  async expectTermsError(message: string): Promise<void> {
    const errorElement = this.page.locator('text=' + message + ', [data-testid="terms-error"], .error:near(input[type="checkbox"])').first();
    await expect(errorElement).toBeVisible({ timeout: 3000 });
  }

  async expectAuthError(message: string): Promise<void> {
    // Look for toast messages, status messages, or general error messages
    const errorElement = this.page.locator(`text=${message}, [data-testid="auth-error"], [role="alert"]:has-text("${message}"), .toast:has-text("${message}")`).first();
    await expect(errorElement).toBeVisible({ timeout: 5000 });
  }

  async expectPasswordStrength(strength: string): Promise<void> {
    const strengthElement = this.page.locator(`text=${strength}, [data-testid="password-strength"]:has-text("${strength}")`).first();
    await expect(strengthElement).toBeVisible({ timeout: 3000 });
  }

  async expectLoadingState(): Promise<void> {
    const loadingElement = this.page.locator('[data-testid="loading"], .loading, button:disabled:has-text("Sign"), .spinner').first();
    await expect(loadingElement).toBeVisible({ timeout: 3000 });
  }

  async expectLoadingStateGone(): Promise<void> {
    const loadingElement = this.page.locator('[data-testid="loading"], .loading, .spinner').first();
    await expect(loadingElement).not.toBeVisible();
  }

  /**
   * Complete authentication flows
   */
  async performSignIn(email: string, password: string): Promise<void> {
    await this.navigateToSignIn();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  async performSignUp(fullName: string, email: string, password: string): Promise<void> {
    await this.navigateToSignUp();
    await this.fillFullName(fullName);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
    await this.checkTermsAgreement();
    await this.clickSignUp();
  }

  /**
   * Authentication state validation
   */
  async expectSignedIn(): Promise<void> {
    // Wait for redirect to dashboard or authenticated page
    await this.page.waitForURL(/\/dashboard|\/editor|\/profile/, { timeout: 10000 });
    
    // Verify user is authenticated (look for user menu, profile info, etc.)
    const authIndicators = this.page.locator('[data-testid="user-menu"], .user-avatar, :has-text("Sign out"), :has-text("Profile")');
    await expect(authIndicators.first()).toBeVisible({ timeout: 5000 });
  }

  async expectSignedOut(): Promise<void> {
    // Verify user is signed out (redirected to sign-in or home page)
    await expect(this.page).toHaveURL(/\/|\/auth\/signin|\/home/);
    
    // Verify no authentication indicators are present
    const authIndicators = this.page.locator('[data-testid="user-menu"], .user-avatar');
    await expect(authIndicators.first()).not.toBeVisible();
  }

  /**
   * OAuth flow testing
   */
  async initiateGoogleOAuth(): Promise<void> {
    await this.clickGoogleSignIn();
    
    // Wait for redirect or popup (in actual implementation, we'd mock this)
    await this.page.waitForTimeout(1000);
  }

  /**
   * Accessibility helpers for auth forms
   */
  async expectAccessibleForm(): Promise<void> {
    // Verify form has proper labels
    const emailInput = this.getEmailInput();
    const passwordInput = this.getPasswordInput();
    
    await expect(emailInput).toHaveAttribute('aria-label', /.+/);
    await expect(passwordInput).toHaveAttribute('aria-label', /.+/);
    
    // Verify form has proper structure
    await expect(this.getSignInForm()).toHaveRole('form');
  }

  /**
   * Security testing helpers
   */
  async expectPasswordMasked(): Promise<void> {
    await expect(this.getPasswordInput()).toHaveAttribute('type', 'password');
  }

  async expectNoSensitiveDataInStorage(): Promise<void> {
    const localStorage = await this.page.evaluate(() => JSON.stringify(window.localStorage));
    const sessionStorage = await this.page.evaluate(() => JSON.stringify(window.sessionStorage));
    
    // Verify no passwords or sensitive tokens are stored
    expect(localStorage).not.toMatch(/password|secret|private_key/i);
    expect(sessionStorage).not.toMatch(/password|secret|private_key/i);
  }
}