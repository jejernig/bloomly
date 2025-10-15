#!/usr/bin/env node

/**
 * Port Detection Utility
 *
 * Finds the first available port in a specified range using the get-port library.
 * Returns the port number to stdout or exits with error code 1 if no ports are available.
 *
 * Usage:
 *   node find-port.js [start] [end]
 *
 * Arguments:
 *   start - First port to try (default: 3401)
 *   end   - Last port to try (default: 3410)
 *
 * Environment Variables:
 *   BACKEND_PORT_RANGE_START - Override start port
 *   BACKEND_PORT_RANGE_END   - Override end port
 *
 * Examples:
 *   node find-port.js           # Uses defaults (3401-3410)
 *   node find-port.js 4000 4010 # Custom range
 */

import getPort, { portNumbers } from 'get-port';

/**
 * Parse port range from environment variables or command line arguments
 * @returns {{start: number, end: number}} Port range configuration
 */
function getPortRange() {
  const envStart = process.env.BACKEND_PORT_RANGE_START;
  const envEnd = process.env.BACKEND_PORT_RANGE_END;

  const start = parseInt(envStart || process.argv[2] || '3401', 10);
  const end = parseInt(envEnd || process.argv[3] || '3410', 10);

  if (isNaN(start) || isNaN(end)) {
    console.error('❌ Invalid port range: start and end must be numbers');
    process.exit(1);
  }

  if (start > end) {
    console.error(`❌ Invalid port range: start (${start}) must be less than or equal to end (${end})`);
    process.exit(1);
  }

  if (start < 1 || end > 65535) {
    console.error(`❌ Invalid port range: ports must be between 1 and 65535`);
    process.exit(1);
  }

  return { start, end };
}

/**
 * Find first available port in range
 * @param {number} start - First port to try
 * @param {number} end - Last port to try
 * @returns {Promise<number>} Available port number
 */
async function findAvailablePort(start, end) {
  try {
    const port = await getPort({
      port: portNumbers(start, end),
      host: '127.0.0.1'
    });

    if (!port) {
      throw new Error(`All ports in range ${start}-${end} are in use`);
    }

    return port;
  } catch (error) {
    throw new Error(`Failed to find available port: ${error.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const { start, end } = getPortRange();
    const port = await findAvailablePort(start, end);

    // Output only the port number to stdout (for piping/capture)
    console.log(port);
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
export { getPortRange, findAvailablePort };
