/**
 * Bloomly Backend Server
 *
 * Custom Node.js/Express API server for Bloomly.io
 * Handles custom APIs not covered by Next.js API routes
 */

import express, { Request, Response } from 'express';
import { loadPortConfig, isPortInRange } from './config/port.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Track server start time for uptime calculation
const startTime = Date.now();

/**
 * Health Check Endpoint
 *
 * Returns server health status, port, uptime, and timestamp
 * Used by the health-check.js script to verify server readiness
 */
app.get('/health', (_req: Request, res: Response) => {
  const config = loadPortConfig();
  const uptime = Date.now() - startTime;

  res.status(200).json({
    status: 'ok',
    port: config.port,
    uptime,
    timestamp: new Date().toISOString()
  });
});

/**
 * Root Endpoint
 *
 * Basic endpoint to verify server is responding
 */
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Bloomly Backend Server',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

/**
 * Start the server
 */
function startServer() {
  try {
    const config = loadPortConfig();

    // Validate port is in expected range (warn if not)
    if (!isPortInRange(config)) {
      console.warn(
        `⚠️  Port ${config.port} is outside expected range ${config.portRangeStart}-${config.portRangeEnd}`
      );
    }

    const server = app.listen(config.port, '127.0.0.1', () => {
      console.log(`🚀 Backend listening on http://localhost:${config.port}`);
      console.log(`   Health check: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📦 Received ${signal}, shutting down backend...`);

      server.close(() => {
        console.log('✅ Backend stopped');
        process.exit(0);
      });

      // Force shutdown after 5 seconds if graceful shutdown hangs
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled rejection:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('❌ Failed to start backend server:', (error as Error).message);
    process.exit(1);
  }
}

// Start server if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, startServer };
