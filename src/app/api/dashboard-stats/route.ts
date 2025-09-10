import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // For now, return mock data since we don't have real analytics yet
    // In a real implementation, this would fetch from Supabase tables
    const dashboardData = {
      postsCreated: {
        value: 24,
        change: 12
      },
      engagementRate: {
        value: 4.2,
        change: 8
      },
      followers: {
        value: 2400,
        change: 5
      },
      aiGenerations: {
        used: 18,
        total: 100
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}