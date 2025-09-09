import React from 'react'
import { BarChart3, TrendingUp, Users, Zap } from 'lucide-react'

const stats = [
  {
    name: 'Posts Created',
    value: '24',
    change: '+12%',
    changeType: 'positive',
    icon: BarChart3,
  },
  {
    name: 'Engagement Rate',
    value: '4.2%',
    change: '+8%',
    changeType: 'positive',
    icon: TrendingUp,
  },
  {
    name: 'Followers',
    value: '2.4K',
    change: '+5%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'AI Generations Used',
    value: '18/100',
    change: '82 left',
    changeType: 'neutral',
    icon: Zap,
  },
]

export function DashboardOverview() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="boutique-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {stat.change}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}