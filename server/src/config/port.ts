/**
 * Port Configuration Module
 *
 * Loads and validates port configuration from environment variables.
 * Provides defaults for all configuration values.
 */

export interface PortConfig {
  port: number;
  portRangeStart: number;
  portRangeEnd: number;
}

/**
 * Load port configuration from environment variables
 *
 * @returns {PortConfig} Port configuration object
 * @throws {Error} If PORT environment variable is missing or invalid
 */
export function loadPortConfig(): PortConfig {
  const portStr = process.env.PORT;

  if (!portStr) {
    throw new Error(
      'PORT environment variable is required. ' +
      'This should be set by the start-backend.js script.'
    );
  }

  const port = parseInt(portStr, 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT environment variable: ${portStr}. ` +
      'PORT must be a number between 1 and 65535.'
    );
  }

  // Load port range configuration (used for validation/logging)
  const portRangeStart = parseInt(process.env.BACKEND_PORT_RANGE_START || '3401', 10);
  const portRangeEnd = parseInt(process.env.BACKEND_PORT_RANGE_END || '3410', 10);

  return {
    port,
    portRangeStart,
    portRangeEnd
  };
}

/**
 * Validate that the configured port is within the expected range
 *
 * @param {PortConfig} config - Port configuration to validate
 * @returns {boolean} True if port is in range, false otherwise
 */
export function isPortInRange(config: PortConfig): boolean {
  return config.port >= config.portRangeStart && config.port <= config.portRangeEnd;
}
