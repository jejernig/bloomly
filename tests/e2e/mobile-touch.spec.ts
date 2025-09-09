import { test, expect, devices } from '@playwright/test';
import { MobileCanvasTestHelper } from '../utils/test-helpers';

test.describe('Mobile Touch Testing', () => {
  let mobileHelper: MobileCanvasTestHelper;

  test.beforeEach(async ({ page }) => {
    mobileHelper = new MobileCanvasTestHelper(page);
    await mobileHelper.navigateToMobileEditor();
  });

  test.describe('Mobile Layout and Responsiveness', () => {
    test('should display mobile layout on mobile devices @mobile @critical', async ({ page }) => {
      await mobileHelper.expectMobileLayoutActive();
      
      // Verify mobile-specific UI elements
      await expect(mobileHelper.getMobileBottomNav()).toBeVisible();
      await expect(mobileHelper.getMobileSidebarToggle()).toBeVisible();
      await expect(mobileHelper.getMobileLayerToggle()).toBeVisible();
      await expect(mobileHelper.getMobilePropertyToggle()).toBeVisible();
    });

    test('should have touch-friendly control sizes @mobile @a11y', async ({ page }) => {
      await mobileHelper.expectTouchFriendlyControls();
      
      // Verify specific touch target sizes
      const touchTargets = [
        mobileHelper.getMobileSidebarToggle(),
        mobileHelper.getMobileLayerToggle(),
        mobileHelper.getMobilePropertyToggle(),
      ];
      
      for (const target of touchTargets) {
        const box = await target.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('should adapt canvas size to mobile viewport @mobile', async ({ page }) => {
      const canvas = mobileHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      const viewport = page.viewportSize();
      
      expect(canvasBox).not.toBeNull();
      expect(viewport).not.toBeNull();
      
      // Canvas should fit within mobile viewport with reasonable margins
      expect(canvasBox!.width).toBeLessThan(viewport!.width);
      expect(canvasBox!.height).toBeLessThan(viewport!.height - 100); // Account for mobile navigation
    });

    test('should hide desktop-only controls on mobile @mobile', async ({ page }) => {
      // Desktop-specific elements should be hidden
      await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="desktop-property-panel"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="desktop-toolbar-extended"]')).not.toBeVisible();
    });
  });

  test.describe('Touch Drag and Drop', () => {
    test('should perform touch drag-drop from sidebar to canvas @mobile @critical', async ({ page }) => {
      // Open sidebar
      await mobileHelper.openMobileSidebar();
      
      // Get canvas center position
      const canvas = mobileHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      
      const centerX = canvasBox!.x + canvasBox!.width / 2;
      const centerY = canvasBox!.y + canvasBox!.height / 2;
      
      // Perform touch drag-drop
      await mobileHelper.performTouchDragDrop('[data-testid="draggable-text"]', centerX, centerY);
      
      // Verify object was added
      await mobileHelper.expectCanvasObjectCount(1);
      
      // Close sidebar to see canvas clearly
      await mobileHelper.closeMobileSidebar();
      
      // Verify object is visible and selectable
      await canvas.tap({ position: { x: centerX - canvasBox!.x, y: centerY - canvasBox!.y } });
      await mobileHelper.expectObjectSelected();
    });

    test('should perform touch drag-drop for shapes @mobile', async ({ page }) => {
      await mobileHelper.openMobileSidebar();
      
      const canvas = mobileHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      
      const dropX = canvasBox!.x + canvasBox!.width * 0.7;
      const dropY = canvasBox!.y + canvasBox!.height * 0.3;
      
      // Drag rectangle shape
      await mobileHelper.performTouchDragDrop('[data-testid="draggable-shape-rectangle"]', dropX, dropY);
      
      await mobileHelper.expectCanvasObjectCount(1);
      await mobileHelper.closeMobileSidebar();
      
      // Verify shape is selectable
      await canvas.tap({ position: { x: dropX - canvasBox!.x, y: dropY - canvasBox!.y } });
      await mobileHelper.expectObjectSelected();
    });

    test('should handle touch drag without drop @mobile', async ({ page }) => {
      await mobileHelper.openMobileSidebar();
      
      const draggableText = page.locator('[data-testid="draggable-text"]');
      
      // Start drag but don't complete drop
      const dragBox = await draggableText.boundingBox();
      expect(dragBox).not.toBeNull();
      
      await page.touchscreen.tap(dragBox!.x + dragBox!.width/2, dragBox!.y + dragBox!.height/2);
      await page.waitForTimeout(100);
      
      // Move a little but not to canvas
      await page.touchscreen.tap(dragBox!.x + 50, dragBox!.y + 50);
      
      // Verify no object was added
      await mobileHelper.expectCanvasObjectCount(0);
    });
  });

  test.describe('Pinch Zoom Gestures', () => {
    test('should perform pinch-to-zoom in @mobile @critical', async ({ page }) => {
      // Add an object first
      await mobileHelper.openMobileSidebar();
      const canvas = mobileHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      
      await mobileHelper.performTouchDragDrop(
        '[data-testid="draggable-text"]', 
        canvasBox!.x + canvasBox!.width/2, 
        canvasBox!.y + canvasBox!.height/2
      );
      await mobileHelper.closeMobileSidebar();
      
      // Get initial zoom level
      const initialZoom = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getZoom() || 1;
      });
      
      // Perform pinch zoom in
      await mobileHelper.performPinchZoom(1.5);
      
      // Verify zoom level increased
      const newZoom = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getZoom() || 1;
      });
      
      expect(newZoom).toBeGreaterThan(initialZoom);
    });

    test('should perform pinch-to-zoom out @mobile @critical', async ({ page }) => {
      // Start with zoomed in state
      await mobileHelper.performPinchZoom(2.0);
      
      const zoomedInLevel = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getZoom() || 1;
      });
      
      // Perform pinch zoom out
      await mobileHelper.performPinchZoom(0.7);
      
      // Verify zoom level decreased
      const zoomedOutLevel = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getZoom() || 1;
      });
      
      expect(zoomedOutLevel).toBeLessThan(zoomedInLevel);
    });

    test('should constrain zoom limits on mobile @mobile', async ({ page }) => {
      // Try to zoom in beyond maximum
      for (let i = 0; i < 10; i++) {
        await mobileHelper.performPinchZoom(1.3);
        await page.waitForTimeout(100);
      }
      
      const maxZoom = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getZoom() || 1;
      });
      
      expect(maxZoom).toBeLessThanOrEqual(5.1);
      
      // Try to zoom out beyond minimum
      for (let i = 0; i < 15; i++) {
        await mobileHelper.performPinchZoom(0.8);
        await page.waitForTimeout(100);
      }
      
      const minZoom = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getZoom() || 1;
      });
      
      expect(minZoom).toBeGreaterThanOrEqual(0.09);
    });

    test('should display zoom indicator during pinch @mobile', async ({ page }) => {
      await mobileHelper.performPinchZoom(1.3);
      
      // Verify zoom indicator is displayed
      const zoomIndicator = page.locator('[data-testid="mobile-zoom-indicator"]');
      await expect(zoomIndicator).toBeVisible();
      
      // Verify it shows the current zoom percentage
      const zoomText = await zoomIndicator.textContent();
      expect(zoomText).toMatch(/\d+%/);
    });
  });

  test.describe('Pan Gestures', () => {
    test('should pan canvas with touch drag @mobile @critical', async ({ page }) => {
      // First zoom in so panning is more noticeable
      await mobileHelper.performPinchZoom(1.5);
      
      // Get initial pan position
      const initialPan = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const vpt = canvas?.viewportTransform;
        return vpt ? { x: vpt[4], y: vpt[5] } : { x: 0, y: 0 };
      });
      
      // Perform pan gesture
      await mobileHelper.simulatePanGesture(100, 50);
      
      // Verify pan position changed
      const newPan = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const vpt = canvas?.viewportTransform;
        return vpt ? { x: vpt[4], y: vpt[5] } : { x: 0, y: 0 };
      });
      
      expect(Math.abs(newPan.x - initialPan.x)).toBeGreaterThan(10);
      expect(Math.abs(newPan.y - initialPan.y)).toBeGreaterThan(10);
    });

    test('should not pan when zoom is at 100% @mobile', async ({ page }) => {
      // Ensure zoom is at 100%
      await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        if (canvas) {
          canvas.setZoom(1);
          canvas.absolutePan({ x: 0, y: 0 });
        }
      });
      
      const initialPan = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const vpt = canvas?.viewportTransform;
        return vpt ? { x: vpt[4], y: vpt[5] } : { x: 0, y: 0 };
      });
      
      // Try to pan
      await mobileHelper.simulatePanGesture(50, 50);
      
      // Verify pan position didn't change significantly
      const newPan = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const vpt = canvas?.viewportTransform;
        return vpt ? { x: vpt[4], y: vpt[5] } : { x: 0, y: 0 };
      });
      
      expect(Math.abs(newPan.x - initialPan.x)).toBeLessThan(5);
      expect(Math.abs(newPan.y - initialPan.y)).toBeLessThan(5);
    });
  });

  test.describe('Touch Object Manipulation', () => {
    test('should select object with tap @mobile @critical', async ({ page }) => {
      // Add object
      await mobileHelper.openMobileSidebar();
      const canvas = mobileHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      
      const objectX = canvasBox!.x + canvasBox!.width/2;
      const objectY = canvasBox!.y + canvasBox!.height/2;
      
      await mobileHelper.performTouchDragDrop('[data-testid="draggable-text"]', objectX, objectY);
      await mobileHelper.closeMobileSidebar();
      
      // Tap to select
      await canvas.tap({ position: { x: objectX - canvasBox!.x, y: objectY - canvasBox!.y } });
      
      // Verify selection
      await mobileHelper.expectObjectSelected();
    });

    test('should move object with touch drag @mobile @critical', async ({ page }) => {
      // Add and select object
      await mobileHelper.openMobileSidebar();
      const canvas = mobileHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      
      const startX = canvasBox!.x + canvasBox!.width * 0.3;
      const startY = canvasBox!.y + canvasBox!.height * 0.3;
      
      await mobileHelper.performTouchDragDrop('[data-testid="draggable-text"]', startX, startY);
      await mobileHelper.closeMobileSidebar();
      
      // Select object
      await canvas.tap({ position: { x: startX - canvasBox!.x, y: startY - canvasBox!.y } });
      
      // Get initial position
      const initialPosition = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeObject = canvas?.getActiveObject();
        return activeObject ? { left: activeObject.left, top: activeObject.top } : null;
      });
      expect(initialPosition).not.toBeNull();
      
      // Move object with touch
      const endX = canvasBox!.x + canvasBox!.width * 0.7;
      const endY = canvasBox!.y + canvasBox!.height * 0.7;
      
      await canvas.touchscreen.tap(startX, startY);
      await page.waitForTimeout(100);
      await canvas.touchscreen.tap(endX, endY);
      await page.waitForTimeout(300);
      
      // Verify position changed
      const newPosition = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeObject = canvas?.getActiveObject();
        return activeObject ? { left: activeObject.left, top: activeObject.top } : null;
      });
      
      expect(newPosition).not.toBeNull();
      expect(Math.abs(newPosition!.left - initialPosition!.left)).toBeGreaterThan(50);
      expect(Math.abs(newPosition!.top - initialPosition!.top)).toBeGreaterThan(50);
    });

    test('should deselect object when tapping empty area @mobile', async ({ page }) => {
      // Add and select object
      await mobileHelper.openMobileSidebar();
      const canvas = mobileHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      
      await mobileHelper.performTouchDragDrop(
        '[data-testid="draggable-text"]',
        canvasBox!.x + canvasBox!.width/2,
        canvasBox!.y + canvasBox!.height/2
      );
      await mobileHelper.closeMobileSidebar();
      
      // Select object
      await canvas.tap({ position: { x: canvasBox!.width/2, y: canvasBox!.height/2 } });
      await mobileHelper.expectObjectSelected();
      
      // Tap empty area
      await canvas.tap({ position: { x: 50, y: 50 } });
      
      // Verify deselection
      await expect(mobileHelper.getPropertyPanel()).not.toBeVisible();
    });
  });

  test.describe('Mobile Panel Management', () => {
    test('should open and close mobile sidebar @mobile', async ({ page }) => {
      // Initially closed
      await expect(page.locator('[data-testid="mobile-sidebar"]')).not.toBeVisible();
      
      // Open sidebar
      await mobileHelper.openMobileSidebar();
      await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible();
      
      // Close sidebar
      await mobileHelper.closeMobileSidebar();
      await expect(page.locator('[data-testid="mobile-sidebar"]')).not.toBeVisible();
    });

    test('should open mobile layer panel @mobile', async ({ page }) => {
      // Add objects first
      await mobileHelper.openMobileSidebar();
      const canvas = mobileHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      
      await mobileHelper.performTouchDragDrop(
        '[data-testid="draggable-text"]',
        canvasBox!.x + canvasBox!.width/2,
        canvasBox!.y + canvasBox!.height/2
      );
      await mobileHelper.closeMobileSidebar();
      
      // Open layer panel
      await mobileHelper.openMobileLayerPanel();
      await expect(page.locator('[data-testid="mobile-layer-panel"]')).toBeVisible();
      
      // Verify layer is shown
      const layerItems = page.locator('[data-testid^="layer-item-"]');
      await expect(layerItems).toHaveCount(1);
    });

    test('should show mobile property panel when object selected @mobile', async ({ page }) => {
      // Add and select object
      await mobileHelper.openMobileSidebar();
      const canvas = mobileHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      
      await mobileHelper.performTouchDragDrop(
        '[data-testid="draggable-text"]',
        canvasBox!.x + canvasBox!.width/2,
        canvasBox!.y + canvasBox!.height/2
      );
      await mobileHelper.closeMobileSidebar();
      
      // Select object
      await canvas.tap({ position: { x: canvasBox!.width/2, y: canvasBox!.height/2 } });
      
      // Open property panel
      await mobileHelper.getMobilePropertyToggle().tap();
      await expect(page.locator('[data-testid="mobile-property-panel"]')).toBeVisible();
      
      // Verify text properties are shown
      await expect(page.locator('[data-testid="mobile-text-properties"]')).toBeVisible();
    });

    test('should slide panels up from bottom on mobile @mobile', async ({ page }) => {
      // Test sidebar slide animation
      await mobileHelper.getMobileSidebarToggle().tap();
      
      // Verify sidebar slides up with animation
      const sidebar = page.locator('[data-testid="mobile-sidebar"]');
      await expect(sidebar).toBeVisible();
      
      // Check if transform animation classes are applied
      const hasSlideAnimation = await sidebar.evaluate(el => {
        const computedStyle = window.getComputedStyle(el);
        return computedStyle.transform !== 'none' || computedStyle.transition.includes('transform');
      });
      
      expect(hasSlideAnimation).toBeTruthy();
    });
  });

  test.describe('Mobile Performance and Responsiveness', () => {
    test('should handle rapid touch interactions @mobile @performance', async ({ page }) => {
      await mobileHelper.openMobileSidebar();
      const canvas = mobileHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      
      // Perform rapid drag-drops
      const positions = [
        { x: canvasBox!.x + 100, y: canvasBox!.y + 100 },
        { x: canvasBox!.x + 200, y: canvasBox!.y + 150 },
        { x: canvasBox!.x + 300, y: canvasBox!.y + 200 },
      ];
      
      for (const pos of positions) {
        await mobileHelper.performTouchDragDrop('[data-testid="draggable-text"]', pos.x, pos.y);
      }
      
      await mobileHelper.closeMobileSidebar();
      
      // Verify all objects were added
      await mobileHelper.expectCanvasObjectCount(3);
      
      // Verify canvas is still responsive
      await canvas.tap({ position: { x: 100, y: 100 } });
      await mobileHelper.expectObjectSelected();
    });

    test('should maintain 60fps during touch interactions @mobile @performance', async ({ page }) => {
      // Add objects to make canvas more complex
      await mobileHelper.openMobileSidebar();
      for (let i = 0; i < 5; i++) {
        await mobileHelper.performTouchDragDrop(
          '[data-testid="draggable-text"]',
          300 + i * 20,
          300 + i * 20
        );
      }
      await mobileHelper.closeMobileSidebar();
      
      // Measure frame rate during pinch zoom
      const frameRate = await page.evaluate(async () => {
        let frameCount = 0;
        const startTime = performance.now();
        
        const countFrames = () => {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          }
        };
        
        requestAnimationFrame(countFrames);
        
        // Wait for 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return frameCount;
      });
      
      // Should be close to 60fps (allow some tolerance)
      expect(frameRate).toBeGreaterThan(45);
    });

    test('should handle memory efficiently on mobile @mobile @performance', async ({ page }) => {
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Add many objects
      await mobileHelper.openMobileSidebar();
      for (let i = 0; i < 20; i++) {
        await mobileHelper.performTouchDragDrop(
          '[data-testid="draggable-text"]',
          200 + (i % 5) * 50,
          200 + Math.floor(i / 5) * 50
        );
      }
      await mobileHelper.closeMobileSidebar();
      
      const peakMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Clear objects
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Delete');
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Memory should not grow excessively
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
    });
  });
});

// Additional test configuration for specific mobile devices
test.describe('Device-Specific Mobile Tests', () => {
  test('should work on iPhone 12 @mobile @device-specific', async ({ page, browserName }) => {
    // Use iPhone 12 device specs
    await page.setViewportSize({ width: 390, height: 844 });
    
    const mobileHelper = new MobileCanvasTestHelper(page);
    await mobileHelper.navigateToMobileEditor();
    
    await mobileHelper.expectMobileLayoutActive();
    
    // Test basic functionality
    await mobileHelper.openMobileSidebar();
    const canvas = mobileHelper.getCanvas();
    const canvasBox = await canvas.boundingBox();
    
    if (canvasBox) {
      await mobileHelper.performTouchDragDrop(
        '[data-testid="draggable-text"]',
        canvasBox.x + canvasBox.width/2,
        canvasBox.y + canvasBox.height/2
      );
    }
    
    await mobileHelper.expectCanvasObjectCount(1);
  });

  test('should work on Pixel 5 @mobile @device-specific', async ({ page, browserName }) => {
    // Use Pixel 5 device specs
    await page.setViewportSize({ width: 393, height: 851 });
    
    const mobileHelper = new MobileCanvasTestHelper(page);
    await mobileHelper.navigateToMobileEditor();
    
    await mobileHelper.expectMobileLayoutActive();
    
    // Test pinch zoom on Android
    await mobileHelper.performPinchZoom(1.5);
    
    const zoomLevel = await page.evaluate(() => {
      const canvas = (window as any).fabric?.Canvas?.instances?.[0];
      return canvas?.getZoom() || 1;
    });
    
    expect(zoomLevel).toBeGreaterThan(1.2);
  });

  test('should handle landscape orientation @mobile @orientation', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 390, height: 844 });
    
    const mobileHelper = new MobileCanvasTestHelper(page);
    await mobileHelper.navigateToMobileEditor();
    
    // Rotate to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500);
    
    // Verify layout adapts
    const canvas = mobileHelper.getCanvas();
    const canvasBox = await canvas.boundingBox();
    
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.width).toBeGreaterThan(canvasBox!.height); // Landscape aspect ratio
    
    // Verify functionality still works
    await mobileHelper.expectMobileLayoutActive();
    
    await mobileHelper.openMobileSidebar();
    await mobileHelper.performTouchDragDrop(
      '[data-testid="draggable-text"]',
      canvasBox!.x + canvasBox!.width/2,
      canvasBox!.y + canvasBox!.height/2
    );
    
    await mobileHelper.expectCanvasObjectCount(1);
  });
});