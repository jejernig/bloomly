'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  AnalyticsData,
  EngagementTrend,
  AudienceInsights,
  PublishedPost,
  EngagementData
} from '@/types'
import { 
  Calendar,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Download,
  Filter,
  RefreshCcw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  Globe,
  Zap
} from 'lucide-react'

type DateRange = '7d' | '30d' | '90d' | '1y'
type MetricView = 'overview' | 'engagement' | 'audience' | 'posts'

export default function AnalyticsPage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()
  
  // State management
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [activeView, setActiveView] = useState<MetricView>('overview')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)

  // Authentication redirect
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  // Simulate loading analytics data
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setIsLoadingAnalytics(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [user])

  // Mock analytics data - would come from Instagram API integration
  const mockAnalyticsData: AnalyticsData = {
    period: dateRange,
    totalPosts: 47,
    totalEngagement: 12847,
    averageEngagementRate: 5.2,
    topPerformingPosts: [
      {
        id: '1',
        userId: user?.id || '',
        projectId: 'proj-1',
        instagramAccountId: 'ig-1',
        instagramPostId: 'post-123',
        caption: 'Summer collection drop! ☀️ New pieces perfect for your boutique',
        hashtags: ['#summerfashion', '#boutique', '#newcollection', '#style'],
        publishedAt: '2024-08-15T14:30:00Z',
        status: 'published' as const,
        engagementData: {
          likes: 342,
          comments: 28,
          shares: 15,
          reach: 2847,
          impressions: 4521,
          saves: 89,
          profileVisits: 145,
          websiteClicks: 67,
          engagementRate: 7.8,
          lastUpdated: '2024-08-16T10:00:00Z'
        },
        createdAt: '2024-08-15T14:00:00Z'
      },
      {
        id: '2',
        userId: user?.id || '',
        projectId: 'proj-2',
        instagramAccountId: 'ig-1',
        instagramPostId: 'post-124',
        caption: 'Behind the scenes at our photoshoot 📸 Creating magic!',
        hashtags: ['#bts', '#photoshoot', '#creative', '#fashion'],
        publishedAt: '2024-08-12T16:45:00Z',
        status: 'published' as const,
        engagementData: {
          likes: 298,
          comments: 31,
          shares: 22,
          reach: 2156,
          impressions: 3789,
          saves: 76,
          profileVisits: 123,
          websiteClicks: 45,
          engagementRate: 6.9,
          lastUpdated: '2024-08-13T10:00:00Z'
        },
        createdAt: '2024-08-12T16:00:00Z'
      }
    ],
    engagementTrends: [
      { date: '2024-08-01', likes: 245, comments: 18, shares: 12, reach: 1845 },
      { date: '2024-08-02', likes: 189, comments: 15, shares: 8, reach: 1456 },
      { date: '2024-08-03', likes: 267, comments: 22, shares: 14, reach: 1987 },
      { date: '2024-08-04', likes: 198, comments: 16, shares: 9, reach: 1634 },
      { date: '2024-08-05', likes: 312, comments: 28, shares: 19, reach: 2234 },
      { date: '2024-08-06', likes: 278, comments: 24, shares: 16, reach: 2098 },
      { date: '2024-08-07', likes: 234, comments: 19, shares: 11, reach: 1876 }
    ],
    audienceInsights: {
      totalFollowers: 8947,
      followerGrowth: 12.3,
      demographics: {
        ageGroups: [
          { range: '18-24', percentage: 28 },
          { range: '25-34', percentage: 42 },
          { range: '35-44', percentage: 22 },
          { range: '45-54', percentage: 6 },
          { range: '55+', percentage: 2 }
        ],
        genderSplit: [
          { gender: 'Female', percentage: 73 },
          { gender: 'Male', percentage: 25 },
          { gender: 'Other', percentage: 2 }
        ],
        locations: [
          { location: 'United States', percentage: 45 },
          { location: 'Canada', percentage: 18 },
          { location: 'United Kingdom', percentage: 12 },
          { location: 'Australia', percentage: 8 },
          { location: 'Other', percentage: 17 }
        ]
      },
      activeHours: [
        { hour: 0, activity: 12 }, { hour: 1, activity: 8 }, { hour: 2, activity: 5 },
        { hour: 3, activity: 3 }, { hour: 4, activity: 2 }, { hour: 5, activity: 4 },
        { hour: 6, activity: 15 }, { hour: 7, activity: 28 }, { hour: 8, activity: 45 },
        { hour: 9, activity: 62 }, { hour: 10, activity: 78 }, { hour: 11, activity: 85 },
        { hour: 12, activity: 92 }, { hour: 13, activity: 88 }, { hour: 14, activity: 95 },
        { hour: 15, activity: 89 }, { hour: 16, activity: 76 }, { hour: 17, activity: 68 },
        { hour: 18, activity: 82 }, { hour: 19, activity: 95 }, { hour: 20, activity: 88 },
        { hour: 21, activity: 72 }, { hour: 22, activity: 45 }, { hour: 23, activity: 28 }
      ]
    }
  }

  const getDateRangeLabel = (range: DateRange) => {
    switch (range) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case '90d': return 'Last 90 days'
      case '1y': return 'Last year'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const exportData = async () => {
    // Mock export functionality
    const csvData = [
      'Date,Likes,Comments,Shares,Reach',
      ...mockAnalyticsData.engagementTrends.map(trend => 
        `${trend.date},${trend.likes},${trend.comments},${trend.shares},${trend.reach}`
      )
    ].join('\n')
    
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${dateRange}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Unauthenticated state
  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">
              Track your Instagram performance and audience insights
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Period:</span>
              </div>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {(['7d', '30d', '90d', '1y'] as DateRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1 rounded text-sm ${
                      dateRange === range 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {getDateRangeLabel(range)}
                  </button>
                ))}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {([
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'engagement', label: 'Engagement', icon: Heart },
                { id: 'audience', label: 'Audience', icon: Users },
                { id: 'posts', label: 'Posts', icon: Activity }
              ] as { id: MetricView, label: string, icon: any }[]).map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                    activeView === view.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <view.icon className="h-4 w-4" />
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoadingAnalytics ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.totalPosts}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +12% vs last period
                    </p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Activity className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Engagement</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(mockAnalyticsData.totalEngagement)}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +8.3% vs last period
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Engagement Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.averageEngagementRate}%</p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +0.8% vs last period
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Followers</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(mockAnalyticsData.audienceInsights.totalFollowers)}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +{mockAnalyticsData.audienceInsights.followerGrowth}% growth
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {activeView === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Trends Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trends</h3>
                  <div className="space-y-4">
                    {mockAnalyticsData.engagementTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">{new Date(trend.date).toLocaleDateString()}</div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              {trend.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3 text-blue-500" />
                              {trend.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="h-3 w-3 text-green-500" />
                              {trend.shares}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-purple-500" />
                              {trend.reach}
                            </span>
                          </div>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${(trend.reach / 2500) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performing Posts */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
                  <div className="space-y-4">
                    {mockAnalyticsData.topPerformingPosts.map((post, index) => (
                      <div key={post.id} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 line-clamp-2 mb-2">{post.caption}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post.engagementData?.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {post.engagementData?.comments}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {post.engagementData?.reach}
                              </span>
                              <span className="text-green-600 font-medium">
                                {post.engagementData?.engagementRate}% rate
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'audience' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Demographics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Groups</h3>
                  <div className="space-y-3">
                    {mockAnalyticsData.audienceInsights.demographics.ageGroups.map((group, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{group.range}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${group.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{group.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Split</h3>
                  <div className="space-y-3">
                    {mockAnalyticsData.audienceInsights.demographics.genderSplit.map((gender, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{gender.gender}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-secondary-600 h-2 rounded-full" 
                              style={{ width: `${gender.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{gender.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
                  <div className="space-y-3">
                    {mockAnalyticsData.audienceInsights.demographics.locations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{location.location}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${location.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{location.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'engagement' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Audience Active Hours</h3>
                <div className="grid grid-cols-12 gap-1 mb-4">
                  {mockAnalyticsData.audienceInsights.activeHours.map((hour, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="bg-primary-200 rounded-sm mb-1 mx-auto"
                        style={{ 
                          height: `${(hour.activity / 100) * 60}px`,
                          minHeight: '4px',
                          width: '20px'
                        }}
                      ></div>
                      <div className="text-xs text-gray-500">
                        {hour.hour.toString().padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <span>Peak activity: 2-7 PM</span>
                  <span>•</span>
                  <span>Best posting time: 12-2 PM, 7-8 PM</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}