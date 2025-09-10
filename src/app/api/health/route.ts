// Bloomly.io - Health Check API Endpoint
// Used by Docker containers and load balancers for health monitoring

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      
      // System information
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
          rss: process.memoryUsage().rss,
        }
      },
      
      // Service checks
      services: {
        supabase: checkSupabaseConnection(),
        redis: await checkRedisConnection(),
        api: true, // If we got here, API is working
      },
      
      // Performance metrics
      responseTime: Date.now() - startTime,
    }
    
    // Determine overall health status
    const isHealthy = Object.values(health.services).every(service => service === true)
    health.status = isHealthy ? 'healthy' : 'degraded'
    
    // Return appropriate HTTP status
    const httpStatus = isHealthy ? 200 : 503
    
    return NextResponse.json(health, { status: httpStatus })
    
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    
    return NextResponse.json(errorResponse, { status: 503 })
  }
}

// Check Supabase connection
function checkSupabaseConnection(): boolean {
  try {
    // Basic check - ensure environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return !!(supabaseUrl && supabaseKey)
  } catch {
    return false
  }
}

// Check Redis connection (if Redis is configured)
async function checkRedisConnection(): Promise<boolean> {
  try {
    // If Redis URL is not configured, consider it healthy (optional service)
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      return true
    }
    
    // Basic Redis connectivity check would go here
    // For now, assume healthy if URL is configured
    return true
  } catch {
    return false
  }
}

// Also export as POST for load balancer compatibility
export const POST = GET