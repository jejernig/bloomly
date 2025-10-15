/**
 * Unit Tests for health-check.js
 * 
 * Tests health check polling functionality including:
 * - Command line argument parsing
 * - HTTP health check requests
 * - Polling with timeout behavior
 * - Error handling for failed checks
 */

import { jest } from '@jest/globals';
import http from 'http';
import { EventEmitter } from 'events';

// Import functions to test
const { parseArgs, checkHealth, pollHealth } = await import('../health-check.js');

describe('health-check.js', () => {
  describe('parseArgs', () => {
    const originalArgv = process.argv;
    const originalExit = process.exit;
    const originalConsoleError = console.error;

    beforeEach(() => {
      process.exit = jest.fn();
      console.error = jest.fn();
    });

    afterEach(() => {
      process.argv = originalArgv;
      process.exit = originalExit;
      console.error = originalConsoleError;
    });

    it('should parse port from command line', () => {
      process.argv = ['node', 'health-check.js', '3401'];

      const config = parseArgs();

      expect(config).toEqual({ port: 3401, timeout: 30 });
    });

    it('should parse port and timeout from command line', () => {
      process.argv = ['node', 'health-check.js', '3402', '60'];

      const config = parseArgs();

      expect(config).toEqual({ port: 3402, timeout: 60 });
    });

    it('should use default timeout when not provided', () => {
      process.argv = ['node', 'health-check.js', '3403'];

      const config = parseArgs();

      expect(config.timeout).toBe(30);
    });

    it('should exit with error when port is missing', () => {
      process.argv = ['node', 'health-check.js'];

      parseArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('❌ Port argument is required and must be a number');
    });

    it('should exit with error when port is invalid', () => {
      process.argv = ['node', 'health-check.js', 'invalid'];

      parseArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('❌ Port argument is required and must be a number');
    });

    it('should exit with error when timeout is invalid', () => {
      process.argv = ['node', 'health-check.js', '3401', 'invalid'];

      parseArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('❌ Timeout must be a positive number');
    });

    it('should exit with error when timeout is negative', () => {
      process.argv = ['node', 'health-check.js', '3401', '-5'];

      parseArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('❌ Timeout must be a positive number');
    });
  });

  describe('checkHealth', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
      mockResponse = new EventEmitter();
      mockResponse.statusCode = 200;

      mockRequest = new EventEmitter();
      mockRequest.end = jest.fn();
      mockRequest.destroy = jest.fn();

      jest.spyOn(http, 'request').mockReturnValue(mockRequest);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return true when health check succeeds', async () => {
      const checkPromise = checkHealth(3401);

      // Simulate successful response
      http.request.mock.calls[0][1](mockResponse);
      mockResponse.emit('data', JSON.stringify({ status: 'ok' }));
      mockResponse.emit('end');

      const result = await checkPromise;

      expect(result).toBe(true);
      expect(http.request).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: 'localhost',
          port: 3401,
          path: '/health',
          method: 'GET',
          timeout: 2000
        }),
        expect.any(Function)
      );
    });

    it('should return false when status code is not 200', async () => {
      mockResponse.statusCode = 500;

      const checkPromise = checkHealth(3401);

      http.request.mock.calls[0][1](mockResponse);
      mockResponse.emit('data', JSON.stringify({ status: 'error' }));
      mockResponse.emit('end');

      const result = await checkPromise;

      expect(result).toBe(false);
    });

    it('should return false when status is not "ok"', async () => {
      const checkPromise = checkHealth(3401);

      http.request.mock.calls[0][1](mockResponse);
      mockResponse.emit('data', JSON.stringify({ status: 'error' }));
      mockResponse.emit('end');

      const result = await checkPromise;

      expect(result).toBe(false);
    });

    it('should return false when response is invalid JSON', async () => {
      const checkPromise = checkHealth(3401);

      http.request.mock.calls[0][1](mockResponse);
      mockResponse.emit('data', 'invalid json');
      mockResponse.emit('end');

      const result = await checkPromise;

      expect(result).toBe(false);
    });

    it('should return false on request error', async () => {
      const checkPromise = checkHealth(3401);

      mockRequest.emit('error', new Error('Connection refused'));

      const result = await checkPromise;

      expect(result).toBe(false);
    });

    it('should return false on request timeout', async () => {
      const checkPromise = checkHealth(3401);

      mockRequest.emit('timeout');

      const result = await checkPromise;

      expect(result).toBe(false);
      expect(mockRequest.destroy).toHaveBeenCalled();
    });
  });

  describe('pollHealth', () => {
    const originalConsoleLog = console.log;

    beforeEach(() => {
      console.log = jest.fn();
      jest.useFakeTimers();
    });

    afterEach(() => {
      console.log = originalConsoleLog;
      jest.useRealTimers();
    });

    it('should resolve when health check passes', async () => {
      // Mock checkHealth to return true immediately
      const mockCheckHealth = jest.fn().mockResolvedValue(true);
      
      // Replace the import with mock
      const healthCheckModule = await import('../health-check.js');
      const originalCheckHealth = healthCheckModule.checkHealth;
      healthCheckModule.checkHealth = mockCheckHealth;

      const pollPromise = pollHealth(3401, 30);
      
      // Fast-forward time to trigger the check
      await jest.runAllTimersAsync();

      await pollPromise;

      expect(console.log).toHaveBeenCalledWith('✓ Backend health check passed (port 3401)');
      
      // Restore original
      healthCheckModule.checkHealth = originalCheckHealth;
    });

    it('should reject when timeout is reached', async () => {
      // Mock checkHealth to always return false
      const mockCheckHealth = jest.fn().mockResolvedValue(false);
      
      const healthCheckModule = await import('../health-check.js');
      const originalCheckHealth = healthCheckModule.checkHealth;
      healthCheckModule.checkHealth = mockCheckHealth;

      const pollPromise = pollHealth(3401, 1); // 1 second timeout

      // Fast-forward past the timeout
      jest.advanceTimersByTime(2000);
      await jest.runAllTimersAsync();

      await expect(pollPromise).rejects.toThrow('Health check timeout after 1s (port 3401)');
      
      // Restore original
      healthCheckModule.checkHealth = originalCheckHealth;
    });
  });
});
