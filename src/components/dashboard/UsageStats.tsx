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
  const { user } = useAuthStore()
  const tier = (user?.subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS) || 'free'
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
      name: 'Instagram Accounts',
      used: 1, // Current number of connected accounts
      limit: limits.instagramAccountsLimit,
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ]

  const isNearLimit = (used: number, limit: number) => {
    return limit !== -1 && used / limit >= 0.8
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Usage Overview</h2>
          <p className="text-sm text-gray-600">
            {mockUsage.monthYear} • {tier === 'free' ? 'Free Plan' : `${tier.charAt(0).toUpperCase()}${tier.slice(1)} Plan`}
          </p>
        </div>
        {tier === 'free' && (
          <Link href="/settings">
            <Button variant="gradient" size="sm">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {usageItems.map((item) => {
          const percentage = item.limit === -1 ? 0 : Math.min((item.used / item.limit) * 100, 100)
          const nearLimit = isNearLimit(item.used, item.limit)

          return (
            <div 
              key={item.name}
              className={`p-4 rounded-lg border ${
                nearLimit ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.used.toLocaleString()} of {formatLimit(item.limit)}
                    </p>
                  </div>
                </div>
                {nearLimit && (
                  <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    Near limit
                  </span>
                )}
              </div>
              
              {item.limit !== -1 && (
                <Progress 
                  value={percentage} 
                  className={`h-2 ${nearLimit ? 'progress-orange' : ''}`}
                />
              )}
            </div>
          )
        })}
      </div>

      {tier === 'free' && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200">
          <div className="flex items-start">
            <Crown className="h-5 w-5 text-primary-600 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm font-medium text-primary-900">
                Unlock unlimited potential
              </p>
              <p className="text-xs text-primary-700 mt-1">
                Upgrade to Pro for unlimited AI generations, more projects, and advanced features.
              </p>
              <Link href="/settings" className="inline-block mt-2">
                <Button variant="default" size="sm">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}