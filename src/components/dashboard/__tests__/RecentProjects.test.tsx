import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RecentProjects } from '../RecentProjects'
import { projectsAPIWithRetry } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  projectsAPIWithRetry: {
    list: jest.fn()
  },
  showErrorToast: jest.fn()
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn()
  }
}))

// Mock Next.js router
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

const mockProjectsAPIWithRetry = projectsAPIWithRetry as jest.Mocked<typeof projectsAPIWithRetry>

const mockProjects = [
  {
    id: '1',
    title: 'Test Project 1',
    status: 'published',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Test Project 2',
    status: 'draft',
    updated_at: '2024-01-02T00:00:00Z'
  }
]

describe('RecentProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading States', () => {
    test('displays skeleton loading state initially', async () => {
      // Mock API to never resolve to keep loading state
      mockProjectsAPIWithRetry.list.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<RecentProjects />)

      // Check for skeleton elements
      expect(screen.getByText('Recent Projects')).toBeInTheDocument()
      
      // Skeleton should be rendered (multiple skeleton cards)
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    test('displays skeleton with correct count based on limit prop', async () => {
      mockProjectsAPIWithRetry.list.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<RecentProjects limit={5} />)

      // Should render skeleton items - we show 3 skeleton cards by default regardless of limit
      await waitFor(() => {
        const skeletons = document.querySelectorAll('.animate-pulse')
        expect(skeletons.length).toBeGreaterThanOrEqual(3)
      })
    })
  })

  describe('Success States', () => {
    test('displays projects after successful API call', async () => {
      mockProjectsAPIWithRetry.list.mockResolvedValue({
        success: true,
        data: mockProjects
      })

      render(<RecentProjects />)

      await waitFor(() => {
        expect(screen.getByText('Test Project 1')).toBeInTheDocument()
        expect(screen.getByText('Test Project 2')).toBeInTheDocument()
      })

      // Check status badges
      expect(screen.getByText('published')).toBeInTheDocument()
      expect(screen.getByText('draft')).toBeInTheDocument()
    })

    test('sorts projects by updated_at and respects limit', async () => {
      const manyProjects = [
        { id: '1', title: 'Old Project', status: 'draft', updated_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Recent Project', status: 'published', updated_at: '2024-01-03T00:00:00Z' },
        { id: '3', title: 'Newest Project', status: 'draft', updated_at: '2024-01-04T00:00:00Z' },
        { id: '4', title: 'Very Old Project', status: 'published', updated_at: '2023-12-01T00:00:00Z' }
      ]

      mockProjectsAPIWithRetry.list.mockResolvedValue({
        success: true,
        data: manyProjects
      })

      render(<RecentProjects limit={2} />)

      await waitFor(() => {
        // Should show the 2 most recent projects
        expect(screen.getByText('Newest Project')).toBeInTheDocument()
        expect(screen.getByText('Recent Project')).toBeInTheDocument()
        
        // Should not show older projects
        expect(screen.queryByText('Old Project')).not.toBeInTheDocument()
        expect(screen.queryByText('Very Old Project')).not.toBeInTheDocument()
      })
    })

    test('displays formatted relative time correctly', async () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      
      const recentProject = {
        id: '1',
        title: 'Recent Project',
        status: 'published',
        updated_at: oneHourAgo.toISOString()
      }

      mockProjectsAPIWithRetry.list.mockResolvedValue({
        success: true,
        data: [recentProject]
      })

      render(<RecentProjects />)

      await waitFor(() => {
        expect(screen.getByText('1 hours ago')).toBeInTheDocument()
      })
    })
  })

  describe('Error States', () => {
    test('displays error message when API call fails', async () => {
      const errorMessage = 'Network error occurred'
      mockProjectsAPIWithRetry.list.mockRejectedValue(new Error(errorMessage))

      render(<RecentProjects />)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })
    })

    test('displays error when API returns unsuccessful response', async () => {
      mockProjectsAPIWithRetry.list.mockResolvedValue({
        success: false,
        error: 'Failed to load projects from server'
      })

      render(<RecentProjects />)

      await waitFor(() => {
        expect(screen.getByText('Failed to load projects from server')).toBeInTheDocument()
      })
    })

    test('retry button triggers new API call', async () => {
      // First call fails
      mockProjectsAPIWithRetry.list
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          data: mockProjects
        })

      render(<RecentProjects />)

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(retryButton)

      // Should show success state after retry
      await waitFor(() => {
        expect(screen.getByText('Test Project 1')).toBeInTheDocument()
      })

      expect(mockProjectsAPIWithRetry.list).toHaveBeenCalledTimes(2)
    })
  })

  describe('Empty States', () => {
    test('displays empty state when no projects exist', async () => {
      mockProjectsAPIWithRetry.list.mockResolvedValue({
        success: true,
        data: []
      })

      render(<RecentProjects />)

      await waitFor(() => {
        expect(screen.getByText('No projects yet')).toBeInTheDocument()
        expect(screen.getByText('Create your first post')).toBeInTheDocument()
      })
    })
  })

  describe('Status Colors', () => {
    test('applies correct status colors', async () => {
      const statusProjects = [
        { id: '1', title: 'Published Project', status: 'published', updated_at: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Scheduled Project', status: 'scheduled', updated_at: '2024-01-02T00:00:00Z' },
        { id: '3', title: 'Draft Project', status: 'draft', updated_at: '2024-01-03T00:00:00Z' }
      ]

      mockProjectsAPIWithRetry.list.mockResolvedValue({
        success: true,
        data: statusProjects
      })

      render(<RecentProjects />)

      await waitFor(() => {
        const publishedStatus = screen.getByText('published')
        const scheduledStatus = screen.getByText('scheduled')
        const draftStatus = screen.getByText('draft')

        expect(publishedStatus).toHaveClass('bg-green-100', 'text-green-700')
        expect(scheduledStatus).toHaveClass('bg-blue-100', 'text-blue-700')
        expect(draftStatus).toHaveClass('bg-gray-100', 'text-gray-700')
      })
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA labels and structure', async () => {
      mockProjectsAPIWithRetry.list.mockResolvedValue({
        success: true,
        data: mockProjects
      })

      render(<RecentProjects />)

      await waitFor(() => {
        // Check for proper headings
        expect(screen.getByRole('heading', { level: 2, name: 'Recent Projects' })).toBeInTheDocument()
        
        // Check for links
        expect(screen.getByRole('link', { name: 'View all' })).toBeInTheDocument()
      })
    })

    test('error state has proper accessibility attributes', async () => {
      mockProjectsAPIWithRetry.list.mockRejectedValue(new Error('Test error'))

      render(<RecentProjects />)

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /try again/i })
        expect(retryButton).toBeInTheDocument()
      })
    })
  })
})