#!/usr/bin/env node

/**
 * Health Check Utility
 *
 * Polls the backend /health endpoint until it responds with 200 status
 * or timeout is reached. Used to verify backend is ready before continuing.
 *
 * Usage:
 *   node health-check.js <port> [timeout]
 *
 * Arguments:
 *   port    - Backend port to check (required)
 *   timeout - Maximum wait time in seconds (default: 30)
 *
 * Exit Codes:
 *   0 - Health check passed
 *   1 - Health check failed or timeout
 *
 * Examples:
 *   node health-check.js 3401       # Check port 3401, 30s timeout
 *   node health-check.js 3402 60    # Check port 3402, 60s timeout
 */

import http from 'http';

/**
 * Parse command line arguments
 * @returns {{port: number, timeout: number}} Configuration
 */
function parseArgs() {
  const port = parseInt(process.argv[2], 10);
  const timeout = parseInt(process.argv[3] || '30', 10);

  if (!port || isNaN(port)) {
    console.error('❌ Port argument is required and must be a number');
    console.error('Usage: node health-check.js <port> [timeout]');
    process.exit(1);
  }

  if (isNaN(timeout) || timeout < 1) {
    console.error('❌ Timeout must be a positive number');
    process.exit(1);
  }

  return { port, timeout };
}

/**
 * Perform a single health check HTTP request
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} True if healthy, false otherwise
 */
function checkHealth(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 2000 // 2 second timeout per request
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const health = JSON.parse(data);
            if (health.status === 'ok') {
              resolve(true);
              return;
            }
          } catch (error) {
            // Invalid JSON response
          }
        }
        resolve(false);
      });
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Poll health endpoint until healthy or timeout
 * @param {number} port - Port to check
 * @param {number} timeout - Maximum wait time in seconds
 * @returns {Promise<void>}
 */
async function pollHealth(port, timeout) {
  const startTime = Date.now();
  const maxTime = timeout * 1000;
  const pollInterval = 500; // Check every 500ms

  while (Date.now() - startTime < maxTime) {
    const isHealthy = await checkHealth(port);

    if (isHealthy) {
      console.log(`✓ Backend health check passed (port ${port})`);
      return;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Health check timeout after ${timeout}s (port ${port})`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const { port, timeout } = parseArgs();
    await pollHealth(port, timeout);
    process.exit(0);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export for testing
export { parseArgs, checkHealth, pollHealth };
