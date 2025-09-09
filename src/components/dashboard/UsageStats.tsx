import React from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { SUBSCRIPTION_LIMITS } from '@/types'
import { Progress } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Crown, Zap, Image, Instagram } from 'lucide-react'

// Mock usage data - in real app this would come from the API
const mockUsage = {
  aiGenerationsUsed: 18,
  projectsCreated: 5,
  postsPublished: 12,
  monthYear: '2024-09',
}

export function UsageStats() {
  const { profile } = useAuthStore()
  const tier = (profile?.subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS) || 'free'
  const limits = SUBSCRIPTION_LIMITS[tier]

  const usageItems = [
    {
      name: 'AI Generations',
      used: mockUsage.aiGenerationsUsed,
      limit: limits.aiGenerationsPerMonth,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Projects',
      used: mockUsage.projectsCreated,
      limit: limits.projectsLimit,
      icon: Image,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Posts Published',
      used: mockUsage.postsPublished,
      limit: -1, // No limit for posts
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ]

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) {
      return 0 // Unlimited
    }
    return Math.min((used / limit) * 100, 100)
  }

  const shouldShowUpgrade = tier === 'free' && (
    mockUsage.aiGenerationsUsed >= limits.aiGenerationsPerMonth * 0.8 ||
    mockUsage.projectsCreated >= limits.projectsLimit * 0.8
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Usage This Month</h2>
          <p className="text-sm text-gray-500">Your current plan: {tier} tier</p>
        </div>
        {shouldShowUpgrade && (
          <Link href="/#pricing">
            <Button variant="gradient" size="sm">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {usageItems.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.used} {item.limit === -1 ? 'used' : `of ${item.limit}`}
                  {item.limit === -1 && ' (unlimited)'}
                </p>
              </div>
            </div>
            
            {item.limit !== -1 && (
              <div className="flex items-center space-x-3">
                <div className="w-24">
                  <Progress 
                    value={getUsagePercentage(item.used, item.limit)}
                    className="h-2"
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {Math.round(getUsagePercentage(item.used, item.limit))}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {tier === 'free' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
          <div className="flex items-start space-x-3">
            <Crown className="h-5 w-5 text-primary-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-primary-900">
                Upgrade to Professional
              </h3>
              <p className="text-sm text-primary-700 mt-1">
                Get 100 AI generations, 50 projects, and premium templates for just $29/month.
              </p>
              <Link href="/#pricing">
                <Button variant="default" size="sm" className="mt-2">
                  Upgrade now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}