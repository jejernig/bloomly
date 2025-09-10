'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/useAuthStore'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { projectsAPIWithRetry, showErrorToast, showSuccessToast } from '@/lib/api'
import { Project } from '@/types'
import { 
  Search,
  Plus,
  Grid3X3,
  List,
  Calendar,
  Edit3,
  Copy,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  RefreshCcw,
  Wand2,
  Image as ImageIcon,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { toast } from 'react-hot-toast'

type ViewMode = 'grid' | 'list'
type SortBy = 'updatedAt' | 'createdAt' | 'title'
type SortOrder = 'asc' | 'desc'

export default function ProjectsPage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()
  
  // Projects data state
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  
  // Authentication redirect
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  // Load projects
  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true)
      setError(null)
      
      const response = await projectsAPIWithRetry.list()
      
      if (response.success && response.data) {
        setProjects(response.data)
      } else {
        throw new Error(response.error || 'Failed to load projects')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects'
      setError(errorMessage)
      showErrorToast(err)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])

  // Filter and sort projects
  const filteredAndSortedProjects = React.useMemo(() => {
    const filtered = projects.filter(project =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return filtered.sort((a, b) => {
      let aValue: string | Date
      let bValue: string | Date

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [projects, searchQuery, sortBy, sortOrder])

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this project? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    try {
      const response = await projectsAPIWithRetry.delete(projectId)
      
      if (response.success) {
        setProjects(projects.filter(p => p.id !== projectId))
        setSelectedProjects(selectedProjects.filter(id => id !== projectId))
        showSuccessToast('Project deleted successfully')
      } else {
        throw new Error(response.error || 'Failed to delete project')
      }
    } catch (err) {
      showErrorToast(err)
    }
  }

  // Handle project duplication
  const handleDuplicateProject = async (project: Project) => {
    try {
      const response = await projectsAPIWithRetry.create({
        title: `${project.title} (Copy)`,
        description: project.description,
        canvasData: project.canvasData,
        thumbnailUrl: project.thumbnailUrl,
        tags: project.tags
      })
      
      if (response.success && response.data) {
        setProjects([response.data, ...projects])
        showSuccessToast('Project duplicated successfully')
      } else {
        throw new Error(response.error || 'Failed to duplicate project')
      }
    } catch (err) {
      showErrorToast(err)
    }
  }

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) {
      return 'Just now'
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }
    if (diffInDays === 1) {
      return '1 day ago'
    }
    return `${diffInDays} days ago`
  }

  // Toggle sort order for current sort field
  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage and organize your Instagram content projects
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <Link href="/editor">
              <Button variant="gradient" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Sort Controls */}
              <div className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-50 rounded-lg">
                <span className="text-gray-500">Sort by:</span>
                <button
                  onClick={() => toggleSort('updatedAt')}
                  className={`px-2 py-1 rounded ${sortBy === 'updatedAt' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Modified {sortBy === 'updatedAt' && (sortOrder === 'asc' ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />)}
                </button>
                <button
                  onClick={() => toggleSort('title')}
                  className={`px-2 py-1 rounded ${sortBy === 'title' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Name {sortBy === 'title' && (sortOrder === 'asc' ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />)}
                </button>
                <button
                  onClick={() => toggleSort('createdAt')}
                  className={`px-2 py-1 rounded ${sortBy === 'createdAt' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />)}
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Content */}
        {isLoadingProjects ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load projects</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button onClick={loadProjects} variant="outline" className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredAndSortedProjects.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                {searchQuery ? <Search className="h-12 w-12 mx-auto" /> : <Wand2 className="h-12 w-12 mx-auto" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? 
                  `No projects match your search "${searchQuery}"` :
                  'Create your first project to get started with designing Instagram posts'
                }
              </p>
              {!searchQuery && (
                <Link href="/editor">
                  <Button variant="gradient" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Project
                  </Button>
                </Link>
              )}
              {searchQuery && (
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Projects Grid/List
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProjects.map((project) => (
                  <div key={project.id} className="group bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all">
                    {/* Project Thumbnail */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative overflow-hidden">
                      {project.thumbnailUrl ? (
                        <img 
                          src={project.thumbnailUrl} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <Link href={`/editor?project=${project.id}`}>
                            <Button size="sm" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="bg-white text-gray-900 hover:bg-gray-100"
                            onClick={() => handleDuplicateProject(project)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="bg-white text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">{project.title}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{project.description}</p>
                      )}
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatRelativeTime(project.updatedAt)}
                      </div>
                      {project.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                              +{project.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-2">
                {filteredAndSortedProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {project.thumbnailUrl ? (
                          <img 
                            src={project.thumbnailUrl} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{project.title}</h3>
                        {project.description && (
                          <p className="text-sm text-gray-500 truncate">{project.description}</p>
                        )}
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(project.updatedAt)}
                          </span>
                          {project.tags.length > 0 && (
                            <>
                              <span className="mx-2 text-gray-300">•</span>
                              <div className="flex gap-1">
                                {project.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link href={`/editor?project=${project.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDuplicateProject(project)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}