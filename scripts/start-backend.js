#!/usr/bin/env node

/**
 * Backend Startup Script
 *
 * Orchestrates the backend server startup process:
 * 1. Validates Node.js version (>= 20.0.0)
 * 2. Finds available port in range using find-port.js
 * 3. Launches backend with tsx --watch for auto-restart
 * 4. Runs health check to verify readiness
 *
 * This script is called by the npm run dev:backend command.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Validate Node.js version meets minimum requirement
 * @returns {boolean} True if version is valid
 */
function validateNodeVersion() {
  const version = process.versions.node;
  const [major] = version.split('.').map(Number);

  if (major < 20) {
    console.error(`❌ Node.js version ${version} is not supported`);
    console.error('   Minimum required version: 20.0.0');
    console.error('   Please upgrade Node.js: https://nodejs.org/');
    return false;
  }

  return true;
}

/**
 * Check if required backend files exist
 * @returns {boolean} True if all required files exist
 */
function validateBackendFiles() {
  const serverEntry = join(projectRoot, 'server', 'src', 'index.ts');

  if (!existsSync(serverEntry)) {
    console.error(`❌ Backend entry point not found: ${serverEntry}`);
    console.error('   Run this script from the project root directory');
    return false;
  }

  return true;
}

/**
 * Find available port using find-port.js utility
 * @returns {Promise<number>} Available port number
 */
function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const findPortScript = join(__dirname, 'find-port.js');

    const proc = spawn('node', [findPortScript], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      // Forward error messages immediately
      process.stderr.write(data);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        const port = parseInt(stdout.trim(), 10);
        if (!isNaN(port)) {
          console.log(`🔍 Found available port: ${port}`);
          resolve(port);
        } else {
          reject(new Error('Invalid port number returned from find-port.js'));
        }
      } else {
        reject(new Error(`Failed to find available port (exit code ${code})`));
      }
    });

    proc.on('error', (error) => {
      reject(new Error(`Failed to run find-port.js: ${error.message}`));
    });
  });
}

/**
 * Start backend server with tsx --watch
 * @param {number} port - Port to run server on
 * @returns {ChildProcess} Child process running the server
 */
function startBackendServer(port) {
  const serverEntry = join(projectRoot, 'server', 'src', 'index.ts');

  const proc = spawn('npx', ['tsx', 'watch', serverEntry], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port.toString(),
      NODE_ENV: process.env.NODE_ENV || 'development'
    },
    shell: process.platform === 'win32' // Use shell on Windows for npx
  });

  proc.on('error', (error) => {
    console.error(`❌ Failed to start backend: ${error.message}`);
    if (error.message.includes('ENOENT')) {
      console.error('   Make sure tsx is installed: npm install --save-dev tsx');
    }
    process.exit(1);
  });

  return proc;
}

/**
 * Run health check to verify backend is ready
 * @param {number} port - Port to check
 * @returns {Promise<void>}
 */
function runHealthCheck(port) {
  return new Promise((resolve, reject) => {
    const healthCheckScript = join(__dirname, 'health-check.js');

    const proc = spawn('node', [healthCheckScript, port.toString()], {
      stdio: 'inherit',
      env: process.env
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Health check failed (exit code ${code})`));
      }
    });

    proc.on('error', (error) => {
      reject(new Error(`Failed to run health check: ${error.message}`));
    });
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔧 Starting backend server...\n');

    // Validate environment
    if (!validateNodeVersion()) {
      process.exit(1);
    }

    if (!validateBackendFiles()) {
      process.exit(1);
    }

    // Find available port
    const port = await findAvailablePort();

    // Start backend server
    const backendProc = startBackendServer(port);

    // Wait a moment for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Run health check
    await runHealthCheck(port);

    // Keep process alive and forward signals to backend
    process.on('SIGINT', () => {
      backendProc.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      backendProc.kill('SIGTERM');
    });

    backendProc.on('exit', (code) => {
      process.exit(code || 0);
    });

  } catch (error) {
    console.error(`\n❌ Failed to start: ${error.message}`);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateNodeVersion, validateBackendFiles, findAvailablePort, startBackendServer };
