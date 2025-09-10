'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ErrorBoundary, InlineErrorBoundary } from '@/components/error/ErrorBoundary'
import { ProjectCardSkeleton, SkeletonLoader } from '@/components/ui/Skeleton'
import { projectsAPIWithRetry, showErrorToast, showSuccessToast } from '@/lib/api'
import { Project } from '@/types'
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Share,
  Eye,
  Settings,
  SortAsc,
  SortDesc,
  AlertCircle,
  RefreshCcw,
  Folder,
  FileText,
  Bookmark
} from 'lucide-react'
import { clsx } from 'clsx'

interface ProjectWithStatus extends Project {
  status?: 'published' | 'draft' | 'scheduled'
}

interface ProjectViewProps {
  projects: ProjectWithStatus[]
  isLoading: boolean
  error: string | null
  searchTerm: string
  sortBy: 'date' | 'name' | 'status'
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
  statusFilter: 'all' | 'published' | 'draft' | 'scheduled'
  onSearchChange: (term: string) => void
  onSortChange: (by: 'date' | 'name' | 'status') => void
  onSortOrderToggle: () => void
  onViewModeChange: (mode: 'grid' | 'list') => void
  onStatusFilterChange: (status: 'all' | 'published' | 'draft' | 'scheduled') => void
  onDeleteProject: (id: string) => void
  onDuplicateProject: (id: string) => void
  onRefresh: () => void
}

function ProjectsView({
  projects,
  isLoading,
  error,
  searchTerm,
  sortBy,
  sortOrder,
  viewMode,
  statusFilter,
  onSearchChange,
  onSortChange,
  onSortOrderToggle,
  onViewModeChange,
  onStatusFilterChange,
  onDeleteProject,
  onDuplicateProject,
  onRefresh
}: ProjectViewProps) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'date':
          comparison = new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
          break
        case 'status':
          comparison = (a.status || 'draft').localeCompare(b.status || 'draft')
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatRelativeTime = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown time'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return formatDate(dateString)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <InlineErrorBoundary>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load projects</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button 
            onClick={onRefresh}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </InlineErrorBoundary>
    )
  }

  if (filteredAndSortedProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          {searchTerm || statusFilter !== 'all' ? (
            <Search className="h-12 w-12 mx-auto" />
          ) : (
            <Folder className="h-12 w-12 mx-auto" />
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchTerm || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
        </h3>
        <p className="text-gray-500 mb-6">
          {searchTerm || statusFilter !== 'all' 
            ? 'Try adjusting your search or filters to find what you\'re looking for.'
            : 'Get started by creating your first project.'
          }
        </p>
        {!searchTerm && statusFilter === 'all' && (
          <Link href="/editor">
            <Button variant="gradient" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Project
            </Button>
          </Link>
        )}
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredAndSortedProjects.map((project) => (
            <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-16 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt={`${project.title} thumbnail`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FileText className="h-6 w-6 text-primary-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {project.title}
                      </h3>
                      {project.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(project.updatedAt)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatRelativeTime(project.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link href={`/editor?project=${project.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  
                  <div className="relative group">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="py-1">
                        <button
                          onClick={() => onDuplicateProject(project.id)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Copy className="h-4 w-4 mr-3" />
                          Duplicate
                        </button>
                        
                        <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Share className="h-4 w-4 mr-3" />
                          Share
                        </button>
                        
                        <div className="border-t border-gray-100 my-1" />
                        
                        <button
                          onClick={() => onDeleteProject(project.id)}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedProjects.map((project) => (
        <InlineErrorBoundary key={project.id}>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group">
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
              {project.thumbnailUrl ? (
                <img
                  src={project.thumbnailUrl}
                  alt={`${project.title} preview`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="h-12 w-12 text-primary-400" />
                </div>
              )}
              
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center space-x-2">
                  <Link href={`/editor?project=${project.id}`}>
                    <Button variant="default" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="bg-white border-white text-gray-900 hover:bg-gray-100">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Status badge */}
              {project.status && (
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
                  {project.title}
                </h3>
                
                <div className="relative group/menu">
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                    <div className="py-1">
                      <button
                        onClick={() => onDuplicateProject(project.id)}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4 mr-3" />
                        Duplicate
                      </button>
                      
                      <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Share className="h-4 w-4 mr-3" />
                        Share
                      </button>
                      
                      <Link href={`/editor?project=${project.id}`} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      
                      <div className="border-t border-gray-100 my-1" />
                      
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {project.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(project.updatedAt)}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatRelativeTime(project.updatedAt)}
                </span>
              </div>
              
              {project.tags && project.tags.length > 0 && (
                <div className="flex items-center space-x-1 mt-3">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </InlineErrorBoundary>
      ))}
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all')

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await projectsAPIWithRetry.list()
      
      if (response.success) {
        // Add status to projects (mock implementation)
        const projectsWithStatus = (response.data || []).map(project => ({
          ...project,
          status: ['published', 'draft', 'scheduled'][Math.floor(Math.random() * 3)] as 'published' | 'draft' | 'scheduled'
        }))
        setProjects(projectsWithStatus)
      } else {
        throw new Error(response.error || 'Failed to load projects')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects'
      setError(errorMessage)
      showErrorToast(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(id)
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const response = await projectsAPIWithRetry.delete(id)
      
      if (response.success) {
        showSuccessToast('Project deleted successfully')
        loadProjects()
      } else {
        throw new Error(response.error || 'Failed to delete project')
      }
    } catch (err) {
      showErrorToast(err)
    }
  }

  const handleDuplicateProject = async (id: string) => {
    try {
      const project = projects.find(p => p.id === id)
      if (!project) return

      const duplicateData = {
        title: `${project.title} (Copy)`,
        description: project.description,
        canvasData: project.canvasData,
        tags: project.tags || []
      }

      const response = await projectsAPIWithRetry.create(duplicateData)
      
      if (response.success) {
        showSuccessToast('Project duplicated successfully')
        loadProjects()
      } else {
        throw new Error(response.error || 'Failed to duplicate project')
      }
    } catch (err) {
      showErrorToast(err)
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="mt-1 text-gray-600">
                Manage and organize your creative projects
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <Link href="/editor">
                <Button variant="gradient" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft' | 'scheduled')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'status')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                </select>

                {/* Sort Order */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>

                {/* View Mode */}
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={clsx(
                      'p-2 rounded-l-md transition-colors',
                      viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={clsx(
                      'p-2 rounded-r-md transition-colors',
                      viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Projects */}
          <ProjectsView
            projects={projects}
            isLoading={isLoading}
            error={error}
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortOrder={sortOrder}
            viewMode={viewMode}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onSortChange={setSortBy}
            onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            onViewModeChange={setViewMode}
            onStatusFilterChange={setStatusFilter}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onRefresh={loadProjects}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}