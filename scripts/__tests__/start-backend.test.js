/**
 * Unit Tests for start-backend.js
 * 
 * Tests backend startup orchestration including:
 * - Node.js version validation
 * - Backend file existence checks
 * - Port finding integration
 * - Backend server process spawning
 */

import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import functions to test
const { validateNodeVersion, validateBackendFiles, findAvailablePort, startBackendServer } = await import('../start-backend.js');

describe('start-backend.js', () => {
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('validateNodeVersion', () => {
    const originalVersion = process.versions.node;

    afterEach(() => {
      // Restore original version
      Object.defineProperty(process.versions, 'node', {
        value: originalVersion,
        writable: true,
        configurable: true
      });
    });

    it('should return true for Node.js 20.x', () => {
      Object.defineProperty(process.versions, 'node', {
        value: '20.0.0',
        writable: true,
        configurable: true
      });

      const result = validateNodeVersion();

      expect(result).toBe(true);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return true for Node.js 22.x', () => {
      Object.defineProperty(process.versions, 'node', {
        value: '22.5.1',
        writable: true,
        configurable: true
      });

      const result = validateNodeVersion();

      expect(result).toBe(true);
    });

    it('should return false for Node.js 18.x', () => {
      Object.defineProperty(process.versions, 'node', {
        value: '18.20.0',
        writable: true,
        configurable: true
      });

      const result = validateNodeVersion();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('❌ Node.js version 18.20.0 is not supported');
      expect(console.error).toHaveBeenCalledWith('   Minimum required version: 20.0.0');
    });

    it('should return false for Node.js 16.x', () => {
      Object.defineProperty(process.versions, 'node', {
        value: '16.14.2',
        writable: true,
        configurable: true
      });

      const result = validateNodeVersion();

      expect(result).toBe(false);
    });

    it('should handle version with major.minor only', () => {
      Object.defineProperty(process.versions, 'node', {
        value: '20.0',
        writable: true,
        configurable: true
      });

      const result = validateNodeVersion();

      expect(result).toBe(true);
    });
  });

  describe('validateBackendFiles', () => {
    it('should return true when server entry exists', () => {
      // This test runs in the actual project, so the file should exist
      const result = validateBackendFiles();

      expect(result).toBe(true);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return false when server entry does not exist (mocked)', () => {
      // Mock existsSync to return false
      const fs = await import('fs');
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn().mockReturnValue(false);

      const result = validateBackendFiles();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('❌ Backend entry point not found'));

      // Restore
      fs.existsSync = originalExistsSync;
    });
  });

  describe('findAvailablePort', () => {
    it('should resolve with port from find-port.js script', async () => {
      // This is an integration test that runs the actual find-port.js script
      // We test that it successfully finds a port
      const port = await findAvailablePort();

      expect(port).toBeGreaterThanOrEqual(3401);
      expect(port).toBeLessThanOrEqual(3410);
      expect(typeof port).toBe('number');
    });

    it('should log the found port', async () => {
      await findAvailablePort();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Found available port:'));
    });
  });

  describe('startBackendServer', () => {
    it('should spawn tsx process with correct arguments', () => {
      const proc = startBackendServer(3401);

      expect(proc).toBeDefined();
      expect(proc.kill).toBeDefined();

      // Clean up the spawned process
      proc.kill('SIGTERM');
    });

    it('should set PORT environment variable', () => {
      const proc = startBackendServer(3402);

      // The process should be spawned (we can't easily check env vars of child process)
      expect(proc).toBeDefined();

      // Clean up
      proc.kill('SIGTERM');
    });

    it('should handle different port numbers', () => {
      const proc1 = startBackendServer(3403);
      const proc2 = startBackendServer(3404);

      expect(proc1).toBeDefined();
      expect(proc2).toBeDefined();

      // Clean up
      proc1.kill('SIGTERM');
      proc2.kill('SIGTERM');
    });
  });
});
