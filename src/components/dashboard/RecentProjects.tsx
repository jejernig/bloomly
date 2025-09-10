import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ErrorBoundary, InlineErrorBoundary } from '@/components/error/ErrorBoundary'
import { ProjectCardSkeleton, SkeletonLoader } from '@/components/ui/Skeleton'
import { projectsAPIWithRetry, showErrorToast } from '@/lib/api'
import { Project } from '@/types'
import { MoreHorizontal, Calendar, Edit3, AlertCircle, RefreshCcw } from 'lucide-react'

interface RecentProjectsProps {
  className?: string
  limit?: number
}

export function RecentProjects({ className, limit = 3 }: RecentProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await projectsAPIWithRetry.list()
      
      if (response.success && response.data) {
        // Sort by updatedAt and take the most recent ones
        const sortedProjects = response.data
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit)
        
        setProjects(sortedProjects)
      } else {
        throw new Error(response.error || 'Failed to load projects')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recent projects'
      setError(errorMessage)
      showErrorToast(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [limit])

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else if (diffInDays === 1) {
      return '1 day ago'
    } else {
      return `${diffInDays} days ago`
    }
  }

  if (isLoading) {
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
        
        <div className="space-y-4">
          {Array.from({ length: limit }, (_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
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
        
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button 
            onClick={loadProjects}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <InlineErrorBoundary>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>
        
        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📸</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {project.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatRelativeTime(project.updatedAt)}
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
    </InlineErrorBoundary>
  )
}