'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { TemplateGrid } from '@/components/templates/TemplateGrid'
import { TemplateFilters } from '@/components/templates/TemplateFilters'
import { TemplateCategory } from '@/types'

export default function TemplatesPage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

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
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-1">
            Choose from our collection of fashion-focused Instagram templates
          </p>
        </div>

        {/* Filters */}
        <TemplateFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          showPremiumOnly={showPremiumOnly}
          onPremiumFilterChange={setShowPremiumOnly}
        />

        {/* Templates Grid */}
        <TemplateGrid
          category={selectedCategory !== 'all' ? selectedCategory : undefined}
          showPremiumOnly={showPremiumOnly}
          showHeader={false}
        />
      </div>
    </DashboardLayout>
  )
}