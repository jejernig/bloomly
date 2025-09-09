import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Wand2, Image, Instagram, BarChart3 } from 'lucide-react'

const quickActions = [
  {
    name: 'Create with AI',
    description: 'Generate captions and images with AI',
    href: '/editor?ai=true',
    icon: Wand2,
    color: 'bg-primary-500 hover:bg-primary-600',
  },
  {
    name: 'Browse Templates',
    description: 'Choose from 15+ fashion templates',
    href: '/templates',
    icon: Image,
    color: 'bg-secondary-500 hover:bg-secondary-600',
  },
  {
    name: 'Connect Instagram',
    description: 'Link your Instagram business account',
    href: '/instagram/connect',
    icon: Instagram,
    color: 'bg-pink-500 hover:bg-pink-600',
  },
  {
    name: 'View Analytics',
    description: 'Track your post performance',
    href: '/analytics',
    icon: BarChart3,
    color: 'bg-indigo-500 hover:bg-indigo-600',
  },
]

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.name} href={action.href}>
            <div className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                {action.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}