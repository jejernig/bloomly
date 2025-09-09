import { test, expect } from '@playwright/test';
import { CanvasTestHelper, MobileCanvasTestHelper } from '../utils/test-helpers';

test.describe('Canvas Integration Tests', () => {
  let canvasHelper: CanvasTestHelper;

  test.beforeEach(async ({ page }) => {
    canvasHelper = new CanvasTestHelper(page);
    await canvasHelper.navigateToEditor();
  });

  test.describe('Canvas Initialization', () => {
    test('should initialize canvas properly @smoke', async ({ page }) => {
      // Verify canvas is loaded and visible
      await expect(canvasHelper.getCanvas()).toBeVisible();
      await expect(canvasHelper.getCanvasContainer()).toBeVisible();
      
      // Verify canvas has correct dimensions
      const canvas = canvasHelper.getCanvas();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      expect(canvasBox!.width).toBeGreaterThan(300);
      expect(canvasBox!.height).toBeGreaterThan(300);
      
      // Verify initial zoom level
      await canvasHelper.expectZoomLevel(1.0);
    });

    test('should load with empty canvas state', async ({ page }) => {
      await canvasHelper.expectCanvasObjectCount(0);
      
      // Verify no objects are selected
      await expect(canvasHelper.getPropertyPanel()).not.toBeVisible();
    });

    test('should display sidebar with drag elements', async ({ page }) => {
      await expect(canvasHelper.getSidebar()).toBeVisible();
      await expect(canvasHelper.getDraggableText()).toBeVisible();
      await expect(canvasHelper.getDraggableShape('rectangle')).toBeVisible();
      await expect(canvasHelper.getDraggableShape('circle')).toBeVisible();
    });

    test('should display toolbar with controls', async ({ page }) => {
      await expect(canvasHelper.getToolbar()).toBeVisible();
      await expect(canvasHelper.getUndoButton()).toBeVisible();
      await expect(canvasHelper.getRedoButton()).toBeVisible();
      await expect(canvasHelper.getSaveButton()).toBeVisible();
      await expect(canvasHelper.getZoomInButton()).toBeVisible();
      await expect(canvasHelper.getZoomOutButton()).toBeVisible();
    });
  });

  test.describe('Drag and Drop Functionality', () => {
    test('should drag text element to canvas @critical', async ({ page }) => {
      // Perform drag and drop
      await canvasHelper.dragTextToCanvas();
      
      // Verify text object was added
      await canvasHelper.expectCanvasObjectCount(1);
      
      // Verify the object can be selected
      await canvasHelper.selectCanvasObject(300, 300);
      await canvasHelper.expectObjectSelected();
      await expect(canvasHelper.getTextPropertyPanel()).toBeVisible();
    });

    test('should drag rectangle shape to canvas @critical', async ({ page }) => {
      // Perform drag and drop
      await canvasHelper.dragShapeToCanvas('rectangle');
      
      // Verify shape object was added
      await canvasHelper.expectCanvasObjectCount(1);
      
      // Verify the object can be selected
      await canvasHelper.selectCanvasObject(400, 300);
      await canvasHelper.expectObjectSelected();
      await expect(canvasHelper.getShapePropertyPanel()).toBeVisible();
    });

    test('should drag circle shape to canvas @critical', async ({ page }) => {
      // Perform drag and drop
      await canvasHelper.dragShapeToCanvas('circle');
      
      // Verify shape object was added
      await canvasHelper.expectCanvasObjectCount(1);
      
      // Verify the object can be selected
      await canvasHelper.selectCanvasObject(400, 300);
      await canvasHelper.expectObjectSelected();
      await expect(canvasHelper.getShapePropertyPanel()).toBeVisible();
    });

    test('should drag multiple elements to canvas', async ({ page }) => {
      // Add multiple objects
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.dragShapeToCanvas('rectangle');
      await canvasHelper.dragShapeToCanvas('circle');
      
      // Verify all objects were added
      await canvasHelper.expectCanvasObjectCount(3);
    });

    test('should maintain object positions after drag', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      
      // Select the object and verify position
      await canvasHelper.selectCanvasObject(300, 300);
      
      const objectPosition = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeObject = canvas?.getActiveObject();
        return activeObject ? { left: activeObject.left, top: activeObject.top } : null;
      });
      
      expect(objectPosition).not.toBeNull();
      expect(objectPosition!.left).toBeCloseTo(300, 50); // Within 50px tolerance
      expect(objectPosition!.top).toBeCloseTo(300, 50);
    });
  });

  test.describe('Object Selection and Manipulation', () => {
    test('should select single object @critical', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.selectCanvasObject(300, 300);
      
      await canvasHelper.expectObjectSelected();
      await expect(canvasHelper.getTextPropertyPanel()).toBeVisible();
    });

    test('should support multi-selection with Shift+click', async ({ page }) => {
      // Add multiple objects
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.dragShapeToCanvas('rectangle');
      
      // Multi-select objects
      await canvasHelper.multiSelectCanvasObjects([
        { x: 300, y: 300 },
        { x: 400, y: 300 }
      ]);
      
      // Verify multi-selection state
      const selectionCount = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeSelection = canvas?.getActiveObject();
        return activeSelection?.type === 'activeSelection' ? activeSelection.size() : 0;
      });
      
      expect(selectionCount).toBe(2);
    });

    test('should move object by dragging @critical', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      
      // Get initial position
      await canvasHelper.selectCanvasObject(300, 300);
      const initialPosition = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeObject = canvas?.getActiveObject();
        return { left: activeObject?.left || 0, top: activeObject?.top || 0 };
      });
      
      // Move object
      await canvasHelper.moveCanvasObject(300, 300, 400, 400);
      
      // Verify new position
      await canvasHelper.selectCanvasObject(400, 400);
      const newPosition = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeObject = canvas?.getActiveObject();
        return { left: activeObject?.left || 0, top: activeObject?.top || 0 };
      });
      
      expect(newPosition.left).toBeGreaterThan(initialPosition.left);
      expect(newPosition.top).toBeGreaterThan(initialPosition.top);
    });

    test('should clear selection when clicking empty area', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.selectCanvasObject(300, 300);
      await canvasHelper.expectObjectSelected();
      
      // Click empty area
      await canvasHelper.selectCanvasObject(100, 100);
      
      // Verify selection is cleared
      await expect(canvasHelper.getPropertyPanel()).not.toBeVisible();
    });
  });

  test.describe('Property Panel Functionality', () => {
    test('should display text properties when text selected', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.selectCanvasObject(300, 300);
      
      const textPanel = canvasHelper.getTextPropertyPanel();
      await expect(textPanel).toBeVisible();
      
      // Check for text-specific controls
      await expect(textPanel.locator('[data-testid="font-family-select"]')).toBeVisible();
      await expect(textPanel.locator('[data-testid="font-size-input"]')).toBeVisible();
      await expect(textPanel.locator('[data-testid="text-color-picker"]')).toBeVisible();
      await expect(textPanel.locator('[data-testid="text-align-buttons"]')).toBeVisible();
    });

    test('should display shape properties when shape selected', async ({ page }) => {
      await canvasHelper.dragShapeToCanvas('rectangle');
      await canvasHelper.selectCanvasObject(400, 300);
      
      const shapePanel = canvasHelper.getShapePropertyPanel();
      await expect(shapePanel).toBeVisible();
      
      // Check for shape-specific controls
      await expect(shapePanel.locator('[data-testid="fill-color-picker"]')).toBeVisible();
      await expect(shapePanel.locator('[data-testid="stroke-color-picker"]')).toBeVisible();
      await expect(shapePanel.locator('[data-testid="stroke-width-input"]')).toBeVisible();
    });

    test('should update object when properties changed', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.selectCanvasObject(300, 300);
      
      // Change font size
      const fontSizeInput = canvasHelper.getTextPropertyPanel().locator('[data-testid="font-size-input"]');
      await fontSizeInput.fill('32');
      await page.keyboard.press('Enter');
      
      // Verify font size changed in canvas
      const fontSize = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeObject = canvas?.getActiveObject();
        return activeObject?.fontSize || 0;
      });
      
      expect(fontSize).toBe(32);
    });

    test('should update object opacity', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.selectCanvasObject(300, 300);
      
      // Change opacity
      const opacitySlider = canvasHelper.getPropertyPanel().locator('[data-testid="opacity-slider"]');
      await opacitySlider.fill('0.5');
      
      // Verify opacity changed
      const opacity = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeObject = canvas?.getActiveObject();
        return activeObject?.opacity || 1;
      });
      
      expect(opacity).toBeCloseTo(0.5, 1);
    });
  });

  test.describe('Layer Management', () => {
    test('should display layers in layer panel', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.dragShapeToCanvas('rectangle');
      
      const layerPanel = canvasHelper.getLayerPanel();
      await expect(layerPanel).toBeVisible();
      
      // Should have 2 layer items
      const layerItems = layerPanel.locator('[data-testid^="layer-item-"]');
      await expect(layerItems).toHaveCount(2);
    });

    test('should reorder layers with drag and drop', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.dragShapeToCanvas('rectangle');
      
      // Get initial layer order
      const initialOrder = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getObjects().map((obj: any) => obj.id || 'unknown');
      });
      
      // Perform layer reorder (simulate drag-drop in layer panel)
      const layerPanel = canvasHelper.getLayerPanel();
      const firstLayer = layerPanel.locator('[data-testid^="layer-item-"]').first();
      const lastLayer = layerPanel.locator('[data-testid^="layer-item-"]').last();
      
      await firstLayer.dragTo(lastLayer);
      await page.waitForTimeout(500);
      
      // Verify layer order changed
      const newOrder = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getObjects().map((obj: any) => obj.id || 'unknown');
      });
      
      expect(newOrder).not.toEqual(initialOrder);
    });

    test('should toggle layer visibility', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      
      const layerPanel = canvasHelper.getLayerPanel();
      const visibilityToggle = layerPanel.locator('[data-testid="layer-visibility-toggle"]').first();
      
      // Toggle visibility off
      await visibilityToggle.click();
      
      // Verify object is hidden
      const isVisible = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const firstObject = canvas?.getObjects()[0];
        return firstObject?.visible !== false;
      });
      
      expect(isVisible).toBe(false);
    });

    test('should lock/unlock layers', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      
      const layerPanel = canvasHelper.getLayerPanel();
      const lockToggle = layerPanel.locator('[data-testid="layer-lock-toggle"]').first();
      
      // Lock the layer
      await lockToggle.click();
      
      // Verify object is not selectable
      await canvasHelper.selectCanvasObject(300, 300);
      
      const isSelectable = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const activeObject = canvas?.getActiveObject();
        return activeObject !== null;
      });
      
      expect(isSelectable).toBe(false);
    });
  });

  test.describe('Undo/Redo Functionality', () => {
    test('should undo object addition @critical', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.expectCanvasObjectCount(1);
      
      // Undo
      await canvasHelper.getUndoButton().click();
      await canvasHelper.expectCanvasObjectCount(0);
    });

    test('should redo object addition @critical', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.expectCanvasObjectCount(1);
      
      // Undo then redo
      await canvasHelper.getUndoButton().click();
      await canvasHelper.expectCanvasObjectCount(0);
      
      await canvasHelper.getRedoButton().click();
      await canvasHelper.expectCanvasObjectCount(1);
    });

    test('should undo object modification', async ({ page }) => {
      await canvasHelper.dragTextToCanvas();
      await canvasHelper.selectCanvasObject(300, 300);
      
      // Get initial position
      const initialPos = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const obj = canvas?.getActiveObject();
        return { left: obj?.left || 0, top: obj?.top || 0 };
      });
      
      // Move object
      await canvasHelper.moveCanvasObject(300, 300, 400, 400);
      
      // Undo move
      await canvasHelper.getUndoButton().click();
      
      // Verify position restored
      const finalPos = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        const obj = canvas?.getObjects()[0];
        return { left: obj?.left || 0, top: obj?.top || 0 };
      });
      
      expect(finalPos.left).toBeCloseTo(initialPos.left, 5);
      expect(finalPos.top).toBeCloseTo(initialPos.top, 5);
    });

    test('should maintain undo history limit', async ({ page }) => {
      // Add more objects than history limit (assuming 20)
      for (let i = 0; i < 25; i++) {
        await canvasHelper.dragTextToCanvas(`Text ${i}`);
      }
      
      // Try to undo all the way back
      let undoCount = 0;
      while (undoCount < 30) { // Try more than should be possible
        const undoButton = canvasHelper.getUndoButton();
        const isEnabled = await undoButton.isEnabled();
        if (!isEnabled) break;
        
        await undoButton.click();
        undoCount++;
        await page.waitForTimeout(100);
      }
      
      // Should not be able to undo more than history limit
      expect(undoCount).toBeLessThanOrEqual(20);
      
      // Should still have some objects left
      const remainingObjects = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getObjects().length || 0;
      });
      
      expect(remainingObjects).toBeGreaterThan(0);
    });
  });

  test.describe('Zoom and Pan Controls', () => {
    test('should zoom in with zoom button @critical', async ({ page }) => {
      await canvasHelper.getZoomInButton().click();
      await canvasHelper.expectZoomLevel(1.1, 0.05);
    });

    test('should zoom out with zoom button @critical', async ({ page }) => {
      // First zoom in
      await canvasHelper.getZoomInButton().click();
      await canvasHelper.expectZoomLevel(1.1, 0.05);
      
      // Then zoom out
      await canvasHelper.getZoomOutButton().click();
      await canvasHelper.expectZoomLevel(1.0, 0.05);
    });

    test('should zoom with mouse wheel', async ({ page }) => {
      const canvas = canvasHelper.getCanvas();
      
      // Zoom in with wheel
      await canvas.hover({ position: { x: 400, y: 400 } });
      await page.mouse.wheel(0, -100);
      
      await page.waitForTimeout(200);
      
      const zoomLevel = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getZoom() || 1;
      });
      
      expect(zoomLevel).toBeGreaterThan(1);
    });

    test('should constrain zoom limits', async ({ page }) => {
      // Try to zoom in beyond limit
      for (let i = 0; i < 20; i++) {
        await canvasHelper.getZoomInButton().click();
        await page.waitForTimeout(50);
      }
      
      const maxZoom = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getZoom() || 1;
      });
      
      expect(maxZoom).toBeLessThanOrEqual(5.1); // Allow small tolerance
      
      // Try to zoom out beyond limit
      for (let i = 0; i < 30; i++) {
        await canvasHelper.getZoomOutButton().click();
        await page.waitForTimeout(50);
      }
      
      const minZoom = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas?.getZoom() || 1;
      });
      
      expect(minZoom).toBeGreaterThanOrEqual(0.09); // Allow small tolerance
    });
  });
});

test.describe('Save and Load Functionality', () => {
  let canvasHelper: CanvasTestHelper;

  test.beforeEach(async ({ page }) => {
    canvasHelper = new CanvasTestHelper(page);
    await canvasHelper.navigateToEditor();
  });

  test('should manually save project @critical', async ({ page }) => {
    // Add some content
    await canvasHelper.dragTextToCanvas();
    await canvasHelper.dragShapeToCanvas('rectangle');
    
    // Save project
    await canvasHelper.triggerManualSave();
    
    // Verify save success message
    await expect(page.locator('[data-testid="save-success-message"]')).toBeVisible();
  });

  test('should trigger auto-save after changes @critical', async ({ page }) => {
    // Add content to trigger auto-save
    await canvasHelper.dragTextToCanvas();
    
    // Wait for auto-save to trigger (30 second interval)
    await canvasHelper.waitForAutoSave();
    
    // Verify auto-save completed
    await expect(page.locator('[data-testid="auto-save-success"]')).toBeVisible();
  });

  test('should preserve canvas state after save/reload', async ({ page }) => {
    // Add multiple objects
    await canvasHelper.dragTextToCanvas();
    await canvasHelper.dragShapeToCanvas('rectangle');
    await canvasHelper.dragShapeToCanvas('circle');
    
    // Save
    await canvasHelper.triggerManualSave();
    
    // Reload page
    await page.reload();
    await canvasHelper.navigateToEditor();
    
    // Verify objects are restored
    await canvasHelper.expectCanvasObjectCount(3);
  });

  test('should handle save errors gracefully', async ({ page }) => {
    // Mock save failure
    await page.route('**/api/projects/**', (route) => {
      route.fulfill({ status: 500, body: 'Server error' });
    });
    
    await canvasHelper.dragTextToCanvas();
    await canvasHelper.getSaveButton().click();
    
    // Verify error handling
    await expect(page.locator('[data-testid="save-error-message"]')).toBeVisible();
  });

  test('should auto-save only when changes exist', async ({ page }) => {
    // Navigate to editor but don't make changes
    await page.waitForTimeout(35000); // Wait past auto-save interval
    
    // Auto-save should not trigger for empty canvas
    await expect(page.locator('[data-testid="auto-save-indicator"]')).not.toBeVisible();
  });
});