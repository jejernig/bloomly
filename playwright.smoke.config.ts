import { defineConfig, devices } from '@playwright/test';

/**
 * Optimized Playwright configuration for smoke tests
 * Designed for fast execution (target: <2 minutes total)
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in parallel for speed */
  fullyParallel: true,
  /* Fail fast on errors */
  forbidOnly: !!process.env.CI,
  /* No retries for smoke tests - they should be reliable */
  retries: 0,
  /* Use more workers for faster execution */
  workers: process.env.CI ? 2 : undefined,
  /* Minimal reporting for speed */
  reporter: [
    ['list'],
    ['json', { outputFile: 'smoke-test-results.json' }],
  ],
  /* Optimized settings for smoke tests */
  use: {
    /* Base URL */
    baseURL: process.env.BASE_URL || 'http://localhost:3060',

    /* Aggressive timeout settings for smoke tests */
    navigationTimeout: 15 * 1000, // 15s instead of 30s
    actionTimeout: 5 * 1000,      // 5s instead of 10s
    
    /* Minimal tracing for speed */
    trace: 'off',
    
    /* No screenshots or videos for smoke tests */
    screenshot: 'off',
    video: 'off',
    
    /* Optimized for speed */
    ignoreHTTPSErrors: true,
  },

  /* Only test on Chromium for smoke tests */
  projects: [
    {
      name: 'chromium-smoke',
      use: { 
        ...devices['Desktop Chrome'],
        /* Disable images and CSS for faster loading */
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-background-networking',
          ]
        }
      },
    },
  ],

  /* Faster web server timeout */
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3060',
    reuseExistingServer: !process.env.CI,
    timeout: 60000, // 1 minute instead of 2
  },

  /* Aggressive timeouts for smoke tests */
  timeout: 15 * 1000, // 15 seconds per test
  globalTimeout: 120 * 1000, // 2 minutes total
  expect: {
    timeout: 3000, // 3 seconds for assertions
  },
});