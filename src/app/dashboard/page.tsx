'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { UsageStats } from '@/components/dashboard/UsageStats'
import { TemplateGrid } from '@/components/templates/TemplateGrid'

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Create stunning Instagram content for your boutique.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Overview Stats */}
        <DashboardOverview />

        {/* Usage Statistics */}
        <UsageStats />

        {/* Recent Projects and Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentProjects />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Templates
            </h2>
            <TemplateGrid 
              limit={4} 
              showHeader={false}
              className="grid-cols-2"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}