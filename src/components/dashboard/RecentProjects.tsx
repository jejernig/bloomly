import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { MoreHorizontal, Calendar, Eye, Edit3 } from 'lucide-react'

const recentProjects = [
  {
    id: '1',
    title: 'Summer Collection Launch',
    thumbnail: '/projects/summer-collection.jpg',
    updatedAt: '2 hours ago',
    status: 'published',
  },
  {
    id: '2',
    title: 'New Arrivals - Dresses',
    thumbnail: '/projects/new-arrivals.jpg',
    updatedAt: '1 day ago',
    status: 'draft',
  },
  {
    id: '3',
    title: 'Flash Sale - 30% Off',
    thumbnail: '/projects/flash-sale.jpg',
    updatedAt: '3 days ago',
    status: 'scheduled',
  },
]

export function RecentProjects() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </div>
      
      {recentProjects.length > 0 ? (
        <div className="space-y-4">
          {recentProjects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                  {/* Placeholder for project thumbnail */}
                  <span className="text-xl">📸</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {project.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {project.updatedAt}
                    <span className="mx-2">•</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      project.status === 'published' ? 'bg-green-100 text-green-700' :
                      project.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link href={`/editor?project=${project.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Edit3 className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500 mb-4">No projects yet</p>
          <Link href="/editor">
            <Button variant="default" size="sm">
              Create your first post
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}