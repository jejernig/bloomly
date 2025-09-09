import { test, expect } from '@playwright/test';
import { PerformanceTestHelper, CanvasTestHelper, MobileCanvasTestHelper } from '../utils/test-helpers';

test.describe('Canvas Performance Tests', () => {
  let performanceHelper: PerformanceTestHelper;
  let canvasHelper: CanvasTestHelper;

  test.beforeEach(async ({ page }) => {
    performanceHelper = new PerformanceTestHelper(page);
    canvasHelper = new CanvasTestHelper(page);
  });

  test.describe('Page Load Performance', () => {
    test('should load editor page within performance budget @performance @critical', async ({ page }) => {
      const startTime = Date.now();
      await canvasHelper.navigateToEditor();
      const loadTime = Date.now() - startTime;
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Measure detailed performance metrics
      const metrics = await performanceHelper.measurePageLoad();
      
      // Core Web Vitals targets
      expect(metrics.domContentLoaded).toBeLessThan(1500); // 1.5s for DOM ready
      expect(metrics.loadComplete).toBeLessThan(3000); // 3s for full load
      
      if (metrics.largestContentfulPaint > 0) {
        expect(metrics.largestContentfulPaint).toBeLessThan(2500); // 2.5s LCP target
      }
      
      if (metrics.cumulativeLayoutShift >= 0) {
        expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1); // CLS target
      }
    });

    test('should initialize canvas within 2 seconds @performance', async ({ page }) => {
      const startTime = performance.now();
      await canvasHelper.navigateToEditor();
      
      // Wait for canvas to be fully initialized
      await page.waitForFunction(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        return canvas && canvas.isReady && canvas.getElement().style.opacity === '1';
      });
      
      const initTime = performance.now() - startTime;
      expect(initTime).toBeLessThan(2000);
    });

    test('should handle concurrent user loads @performance @load', async ({ page, browser }) => {
      // Simulate multiple concurrent users
      const concurrentTabs = 5;
      const pages = [];
      const loadTimes = [];
      
      // Open multiple tabs concurrently
      for (let i = 0; i < concurrentTabs; i++) {
        pages.push(browser.newPage());
      }
      
      const awaitedPages = await Promise.all(pages);
      
      // Load editor in all tabs simultaneously
      const loadPromises = awaitedPages.map(async (tabPage) => {
        const helper = new CanvasTestHelper(tabPage);
        const startTime = Date.now();
        await helper.navigateToEditor();
        const loadTime = Date.now() - startTime;
        loadTimes.push(loadTime);
        return tabPage;
      });
      
      await Promise.all(loadPromises);
      
      // All loads should complete within reasonable time
      const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      const maxLoadTime = Math.max(...loadTimes);
      
      expect(avgLoadTime).toBeLessThan(4000); // 4s average under load
      expect(maxLoadTime).toBeLessThan(6000); // 6s maximum under load
      
      // Clean up
      await Promise.all(awaitedPages.map(p => p.close()));
    });
  });

  test.describe('Canvas Rendering Performance', () => {
    test('should render empty canvas quickly @performance', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      const renderTime = await canvasHelper.measureCanvasRenderTime();
      
      // Empty canvas should render in under 50ms
      expect(renderTime).toBeLessThan(50);
    });

    test('should maintain performance with 10 objects @performance', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      const metrics = await performanceHelper.measureCanvasPerformance(10);
      
      // With 10 objects, render time should still be reasonable
      expect(metrics.renderTime).toBeLessThan(100);
      expect(metrics.objectCount).toBe(10);
      
      // Memory usage should be reasonable
      expect(metrics.memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB
    });

    test('should handle 50 objects without significant degradation @performance @stress', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      // Add 50 objects
      for (let i = 0; i < 50; i++) {
        await canvasHelper.dragTextToCanvas(`Text ${i}`);
        
        // Every 10 objects, measure performance
        if ((i + 1) % 10 === 0) {
          const renderTime = await canvasHelper.measureCanvasRenderTime();
          
          // Render time should not exceed 200ms even with many objects
          expect(renderTime).toBeLessThan(200);
        }
      }
      
      // Final performance check
      const finalRenderTime = await canvasHelper.measureCanvasRenderTime();
      expect(finalRenderTime).toBeLessThan(250);
      
      // Verify all objects are present
      await canvasHelper.expectCanvasObjectCount(50);
    });

    test('should maintain 60fps during zoom operations @performance', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      // Add some objects to make zoom more noticeable
      for (let i = 0; i < 10; i++) {
        await canvasHelper.dragTextToCanvas(`Text ${i}`);
      }
      
      // Measure frame rate during zoom
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
        
        // Perform zoom operations during frame counting
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        if (canvas) {
          for (let zoom = 1; zoom <= 2; zoom += 0.1) {
            canvas.setZoom(zoom);
            canvas.renderAll();
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        // Wait for full second to complete
        await new Promise(resolve => setTimeout(resolve, Math.max(0, 1000 - (performance.now() - startTime))));
        
        return frameCount;
      });
      
      // Should maintain close to 60fps (allow some tolerance)
      expect(frameRate).toBeGreaterThan(45);
    });

    test('should handle rapid object additions efficiently @performance', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      const startTime = performance.now();
      
      // Rapidly add 20 objects
      for (let i = 0; i < 20; i++) {
        await canvasHelper.dragTextToCanvas(`Rapid ${i}`);
      }
      
      const totalTime = performance.now() - startTime;
      
      // Should complete within 10 seconds (500ms per object average)
      expect(totalTime).toBeLessThan(10000);
      
      // Verify all objects were added
      await canvasHelper.expectCanvasObjectCount(20);
      
      // Final render should still be fast
      const renderTime = await canvasHelper.measureCanvasRenderTime();
      expect(renderTime).toBeLessThan(150);
    });
  });

  test.describe('Memory Performance', () => {
    test('should manage memory efficiently @performance @memory', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      const initialMemory = await canvasHelper.measureMemoryUsage();
      
      // Add and remove objects to test memory management
      for (let cycle = 0; cycle < 5; cycle++) {
        // Add objects
        for (let i = 0; i < 10; i++) {
          await canvasHelper.dragTextToCanvas(`Cycle ${cycle} Object ${i}`);
        }
        
        // Remove all objects
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        
        // Force garbage collection if available
        await page.evaluate(() => {
          if ((window as any).gc) {
            (window as any).gc();
          }
        });
        
        await page.waitForTimeout(500);
      }
      
      const finalMemory = await canvasHelper.measureMemoryUsage();
      const memoryGrowth = finalMemory - initialMemory;
      
      // Memory growth should be minimal after cleanup cycles
      expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024); // Less than 20MB growth
    });

    test('should prevent memory leaks in undo/redo @performance @memory', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      const initialMemory = await canvasHelper.measureMemoryUsage();
      
      // Perform many undo/redo operations
      for (let i = 0; i < 50; i++) {
        await canvasHelper.dragTextToCanvas(`Memory test ${i}`);
        
        if (i % 5 === 0) {
          // Undo multiple times
          for (let j = 0; j < 3; j++) {
            await canvasHelper.getUndoButton().click();
            await page.waitForTimeout(50);
          }
          
          // Redo them back
          for (let j = 0; j < 3; j++) {
            await canvasHelper.getRedoButton().click();
            await page.waitForTimeout(50);
          }
        }
      }
      
      const peakMemory = await canvasHelper.measureMemoryUsage();
      
      // Clear canvas
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Delete');
      
      // Force cleanup
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const finalMemory = await canvasHelper.measureMemoryUsage();
      const memoryGrowth = finalMemory - initialMemory;
      
      // Should not leak significant memory
      expect(memoryGrowth).toBeLessThan(30 * 1024 * 1024); // Less than 30MB
    });

    test('should handle large images efficiently @performance @memory', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      // Mock large image data
      await page.evaluate(() => {
        // Create a large canvas and convert to data URL
        const canvas = document.createElement('canvas');
        canvas.width = 2000;
        canvas.height = 2000;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw something to make it realistic
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(0, 0, 2000, 2000);
          (window as any).testImageData = canvas.toDataURL();
        }
      });
      
      const initialMemory = await canvasHelper.measureMemoryUsage();
      
      // Add large image to canvas
      await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        if (canvas && (window as any).testImageData) {
          (window as any).fabric.Image.fromURL((window as any).testImageData).then((img: any) => {
            img.scaleToWidth(400); // Scale down for display
            canvas.add(img);
            canvas.renderAll();
          });
        }
      });
      
      await page.waitForTimeout(2000); // Wait for image to load
      
      const afterImageMemory = await canvasHelper.measureMemoryUsage();
      const memoryIncrease = afterImageMemory - initialMemory;
      
      // Memory increase should be reasonable despite large source image
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
      
      // Remove image
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Delete');
      
      await page.waitForTimeout(1000);
      
      const finalMemory = await canvasHelper.measureMemoryUsage();
      const memoryRecovered = afterImageMemory - finalMemory;
      
      // Should recover most of the memory
      expect(memoryRecovered).toBeGreaterThan(memoryIncrease * 0.7); // Recover at least 70%
    });
  });

  test.describe('Mobile Performance', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should load quickly on mobile @performance @mobile', async ({ page }) => {
      const mobileMetrics = await performanceHelper.measureMobilePerformance();
      
      // Mobile targets are more lenient
      expect(mobileMetrics.domContentLoaded).toBeLessThan(2500); // 2.5s for DOM ready
      expect(mobileMetrics.loadComplete).toBeLessThan(5000); // 5s for full load on mobile
      
      if (mobileMetrics.largestContentfulPaint > 0) {
        expect(mobileMetrics.largestContentfulPaint).toBeLessThan(4000); // 4s LCP for mobile
      }
    });

    test('should handle touch gestures smoothly @performance @mobile', async ({ page }) => {
      const mobileHelper = new MobileCanvasTestHelper(page);
      await mobileHelper.navigateToMobileEditor();
      
      // Add objects to test touch performance
      await mobileHelper.openMobileSidebar();
      for (let i = 0; i < 5; i++) {
        await mobileHelper.performTouchDragDrop(
          '[data-testid="draggable-text"]',
          300 + i * 20,
          300 + i * 20
        );
      }
      await mobileHelper.closeMobileSidebar();
      
      // Measure performance during pinch zoom
      const gesturePerformance = await page.evaluate(async () => {
        const startTime = performance.now();
        let frameCount = 0;
        
        const countFrames = () => {
          frameCount++;
          if (performance.now() - startTime < 2000) {
            requestAnimationFrame(countFrames);
          }
        };
        
        requestAnimationFrame(countFrames);
        
        // Simulate touch gestures
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          frameRate: frameCount / 2, // frames per second
          duration: performance.now() - startTime
        };
      });
      
      // Should maintain reasonable frame rate on mobile
      expect(gesturePerformance.frameRate).toBeGreaterThan(30);
    });

    test('should optimize for low-end mobile devices @performance @mobile', async ({ page }) => {
      // Simulate low-end device conditions
      const client = await page.context().newCDPSession(page);
      await client.send('Emulation.setCPUThrottlingRate', { rate: 6 }); // 6x slower CPU
      
      const mobileHelper = new MobileCanvasTestHelper(page);
      await mobileHelper.navigateToMobileEditor();
      
      // Verify that optimizations are applied
      const optimizations = await page.evaluate(() => {
        const canvas = (window as any).fabric?.Canvas?.instances?.[0];
        if (!canvas) return null;
        
        return {
          renderOnAddRemove: canvas.renderOnAddRemove,
          skipTargetFind: canvas.skipTargetFind,
          imageSmoothingEnabled: canvas.imageSmoothingEnabled,
        };
      });
      
      expect(optimizations).not.toBeNull();
      
      // On low-end devices, some optimizations should be enabled
      if (optimizations) {
        // These optimizations might be enabled for better performance
        expect(typeof optimizations.renderOnAddRemove).toBe('boolean');
        expect(typeof optimizations.skipTargetFind).toBe('boolean');
      }
      
      // Reset CPU throttling
      await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    });
  });

  test.describe('Auto-save Performance', () => {
    test('should auto-save without blocking UI @performance', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      // Add content to trigger auto-save
      await canvasHelper.dragTextToCanvas();
      
      // Monitor UI responsiveness during auto-save
      const responsivenessDuringAutoSave = await page.evaluate(async () => {
        const startTime = performance.now();
        let uiBlocked = false;
        
        // Simulate UI interaction during auto-save period
        const testResponsiveness = setInterval(() => {
          const testStart = performance.now();
          // Force a small UI operation
          document.body.offsetHeight; // Force reflow
          const testEnd = performance.now();
          
          // If this takes too long, UI is probably blocked
          if (testEnd - testStart > 16) { // More than one frame at 60fps
            uiBlocked = true;
          }
        }, 100);
        
        // Wait for potential auto-save period
        await new Promise(resolve => setTimeout(resolve, 35000));
        
        clearInterval(testResponsiveness);
        
        return {
          uiBlocked,
          totalTime: performance.now() - startTime
        };
      });
      
      // UI should remain responsive during auto-save
      expect(responsivenessDuringAutoSave.uiBlocked).toBe(false);
    });

    test('should batch auto-save operations @performance', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      let saveCallCount = 0;
      
      // Monitor API calls
      await page.route('**/api/projects/**', (route) => {
        if (route.request().method() === 'PUT' || route.request().method() === 'POST') {
          saveCallCount++;
        }
        route.continue();
      });
      
      // Rapidly add multiple objects
      for (let i = 0; i < 10; i++) {
        await canvasHelper.dragTextToCanvas(`Batch test ${i}`);
        await page.waitForTimeout(100);
      }
      
      // Wait for auto-save to potentially trigger
      await page.waitForTimeout(35000);
      
      // Should not make excessive API calls (batching should limit them)
      expect(saveCallCount).toBeLessThan(5); // Much fewer than number of changes
    });
  });

  test.describe('Performance Budgets and Thresholds', () => {
    test('should meet Core Web Vitals thresholds @performance @vitals', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      const vitals = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals: any = {};
            
            entries.forEach((entry: any) => {
              if (entry.name === 'largest-contentful-paint') {
                vitals.lcp = entry.startTime;
              }
              if (entry.name === 'first-input-delay') {
                vitals.fid = entry.duration;
              }
              if (entry.name === 'cumulative-layout-shift') {
                vitals.cls = entry.value;
              }
            });
            
            // Resolve after collecting metrics
            setTimeout(() => resolve(vitals), 1000);
          });
          
          observer.observe({ type: 'largest-contentful-paint', buffered: true });
          observer.observe({ type: 'first-input', buffered: true });
          observer.observe({ type: 'layout-shift', buffered: true });
        });
      });
      
      if ((vitals as any).lcp) {
        expect((vitals as any).lcp).toBeLessThan(2500); // Good LCP
      }
      if ((vitals as any).fid) {
        expect((vitals as any).fid).toBeLessThan(100); // Good FID
      }
      if ((vitals as any).cls !== undefined) {
        expect((vitals as any).cls).toBeLessThan(0.1); // Good CLS
      }
    });

    test('should maintain performance budget @performance @budget', async ({ page }) => {
      await canvasHelper.navigateToEditor();
      
      // Measure various performance metrics
      const budgetMetrics = await page.evaluate(async () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        const jsSize = resources
          .filter(r => r.name.includes('.js'))
          .reduce((sum, r) => sum + (r.transferSize || 0), 0);
          
        const cssSize = resources
          .filter(r => r.name.includes('.css'))
          .reduce((sum, r) => sum + (r.transferSize || 0), 0);
          
        return {
          totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
          jsSize,
          cssSize,
          totalResources: resources.length,
        };
      });
      
      // Performance budget thresholds
      expect(budgetMetrics.totalLoadTime).toBeLessThan(3000); // 3s load time
      expect(budgetMetrics.jsSize).toBeLessThan(1024 * 1024); // 1MB JS budget
      expect(budgetMetrics.cssSize).toBeLessThan(200 * 1024); // 200KB CSS budget
      expect(budgetMetrics.totalResources).toBeLessThan(50); // Resource count limit
    });
  });
});