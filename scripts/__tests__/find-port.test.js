/**
 * Unit Tests for find-port.js
 * 
 * Tests port detection utility functionality including:
 * - Default port range behavior
 * - Environment variable overrides
 * - Command line argument parsing
 * - Error handling for invalid inputs
 * - Port availability detection
 */

import { jest } from '@jest/globals';

// Mock get-port before importing find-port
const mockGetPort = jest.fn();
jest.unstable_mockModule('get-port', () => ({
  default: mockGetPort,
  portNumbers: (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i)
}));

// Import after mocking
const { findAvailablePort, getPortRange } = await import('../find-port.js');

describe('find-port.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.BACKEND_PORT_RANGE_START;
    delete process.env.BACKEND_PORT_RANGE_END;
  });

  describe('getPortRange', () => {
    it('should return default port range when no env vars or args provided', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'find-port.js'];

      const range = getPortRange();

      expect(range).toEqual({ start: 3401, end: 3410 });
      process.argv = originalArgv;
    });

    it('should use environment variables when provided', () => {
      process.env.BACKEND_PORT_RANGE_START = '4000';
      process.env.BACKEND_PORT_RANGE_END = '4010';
      
      const originalArgv = process.argv;
      process.argv = ['node', 'find-port.js'];

      const range = getPortRange();

      expect(range).toEqual({ start: 4000, end: 4010 });
      process.argv = originalArgv;
    });

    it('should use command line arguments when provided', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'find-port.js', '5000', '5010'];

      const range = getPortRange();

      expect(range).toEqual({ start: 5000, end: 5010 });
      process.argv = originalArgv;
    });

    it('should prioritize command line args over environment variables', () => {
      process.env.BACKEND_PORT_RANGE_START = '4000';
      process.env.BACKEND_PORT_RANGE_END = '4010';
      
      const originalArgv = process.argv;
      process.argv = ['node', 'find-port.js', '5000', '5010'];

      const range = getPortRange();

      expect(range).toEqual({ start: 5000, end: 5010 });
      process.argv = originalArgv;
    });

    it('should handle invalid start port gracefully', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'find-port.js', 'invalid', '4010'];

      expect(() => getPortRange()).toThrow('Invalid port range');
      process.argv = originalArgv;
    });

    it('should handle invalid end port gracefully', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'find-port.js', '4000', 'invalid'];

      expect(() => getPortRange()).toThrow('Invalid port range');
      process.argv = originalArgv;
    });

    it('should reject port range where start > end', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'find-port.js', '5000', '4000'];

      expect(() => getPortRange()).toThrow('Invalid port range: start (5000) must be less than or equal to end (4000)');
      process.argv = originalArgv;
    });

    it('should reject ports below 1024', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'find-port.js', '80', '1000'];

      expect(() => getPortRange()).toThrow('Port range must be between 1024 and 65535');
      process.argv = originalArgv;
    });

    it('should reject ports above 65535', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'find-port.js', '70000', '70010'];

      expect(() => getPortRange()).toThrow('Port range must be between 1024 and 65535');
      process.argv = originalArgv;
    });
  });

  describe('findAvailablePort', () => {
    it('should return available port from get-port', async () => {
      mockGetPort.mockResolvedValue(3401);

      const port = await findAvailablePort(3401, 3410);

      expect(port).toBe(3401);
      expect(mockGetPort).toHaveBeenCalledWith({
        port: expect.arrayContaining([3401, 3402, 3403, 3404, 3405, 3406, 3407, 3408, 3409, 3410]),
        host: '127.0.0.1'
      });
    });

    it('should throw error when no ports available', async () => {
      mockGetPort.mockResolvedValue(undefined);

      await expect(findAvailablePort(3401, 3410)).rejects.toThrow(
        'All ports in range 3401-3410 are in use'
      );
    });

    it('should throw error when get-port fails', async () => {
      mockGetPort.mockRejectedValue(new Error('Network error'));

      await expect(findAvailablePort(3401, 3410)).rejects.toThrow(
        'Failed to find available port: Network error'
      );
    });

    it('should handle different port ranges', async () => {
      mockGetPort.mockResolvedValue(5555);

      const port = await findAvailablePort(5000, 6000);

      expect(port).toBe(5555);
    });
  });
});
