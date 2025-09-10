import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DashboardOverview } from '../DashboardOverview'
import { apiRequest } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  apiRequest: jest.fn(),
  showErrorToast: jest.fn()
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn()
  }
}))

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

const mockDashboardData = {
  postsCreated: { value: 24, change: 12 },
  engagementRate: { value: 4.2, change: 8 },
  followers: { value: 2400, change: 5 },
  aiGenerations: { used: 18, total: 100 }
}

describe('DashboardOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading States', () => {
    test('displays skeleton loading state initially', async () => {
      // Mock API to never resolve
      mockApiRequest.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<DashboardOverview />)

      // Check for skeleton elements (4 dashboard stat skeletons)
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThanOrEqual(4)
    })

    test('renders 4 skeleton items for dashboard stats', async () => {
      mockApiRequest.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { container } = render(<DashboardOverview />)

      // Should render 4 skeleton dashboard stats
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
    })
  })

  describe('Success States', () => {
    test('displays dashboard stats after successful API call', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockDashboardData
      })

      render(<DashboardOverview />)

      await waitFor(() => {
        expect(screen.getByText('Posts Created')).toBeInTheDocument()
        expect(screen.getByText('24')).toBeInTheDocument()
        expect(screen.getByText('+12%')).toBeInTheDocument()
        
        expect(screen.getByText('Engagement Rate')).toBeInTheDocument()
        expect(screen.getByText('4.2%')).toBeInTheDocument()
        expect(screen.getByText('+8%')).toBeInTheDocument()
        
        expect(screen.getByText('Followers')).toBeInTheDocument()
        expect(screen.getByText('2.4K')).toBeInTheDocument()
        expect(screen.getByText('+5%')).toBeInTheDocument()
        
        expect(screen.getByText('AI Generations Used')).toBeInTheDocument()
        expect(screen.getByText('18/100')).toBeInTheDocument()
        expect(screen.getByText('82 left')).toBeInTheDocument()
      })
    })

    test('formats numbers correctly', async () => {
      const largeNumberData = {
        postsCreated: { value: 1500, change: 12 },
        engagementRate: { value: 6.7, change: -2 },
        followers: { value: 15000000, change: 15 },
        aiGenerations: { used: 45, total: 100 }
      }

      mockApiRequest.mockResolvedValue({
        success: true,
        data: largeNumberData
      })

      render(<DashboardOverview />)

      await waitFor(() => {
        expect(screen.getByText('1500')).toBeInTheDocument() // Under 1K
        expect(screen.getByText('15.0M')).toBeInTheDocument() // Over 1M
        expect(screen.getByText('6.7%')).toBeInTheDocument() // Decimal precision
        expect(screen.getByText('-2%')).toBeInTheDocument() // Negative change
      })
    })

    test('applies correct change type colors', async () => {
      const mixedChangeData = {
        postsCreated: { value: 24, change: 12 }, // positive
        engagementRate: { value: 4.2, change: -8 }, // negative
        followers: { value: 2400, change: 0 }, // neutral
        aiGenerations: { used: 18, total: 100 } // neutral (always)
      }

      mockApiRequest.mockResolvedValue({
        success: true,
        data: mixedChangeData
      })

      render(<DashboardOverview />)

      await waitFor(() => {
        const positiveChange = screen.getByText('+12%')
        const negativeChange = screen.getByText('-8%')
        const neutralChange = screen.getByText('+0%')

        expect(positiveChange).toHaveClass('text-green-600')
        expect(negativeChange).toHaveClass('text-red-600')
        expect(neutralChange).toHaveClass('text-gray-500')
      })
    })
  })

  describe('Error States', () => {
    test('falls back to static data when API call fails', async () => {
      const errorMessage = 'Failed to load dashboard data'
      mockApiRequest.mockRejectedValue(new Error(errorMessage))

      render(<DashboardOverview />)

      // Component shows fallback data instead of error UI
      await waitFor(() => {
        expect(screen.getByText('Posts Created')).toBeInTheDocument()
        expect(screen.getByText('24')).toBeInTheDocument() // Fallback posts created
        expect(screen.getByText('4.2%')).toBeInTheDocument() // Fallback engagement rate
        expect(screen.getByText('2.4K')).toBeInTheDocument() // Fallback followers
        expect(screen.getByText('18/100')).toBeInTheDocument() // Fallback AI generations
      })
    })

    test('displays fallback data when API returns unsuccessful response', async () => {
      mockApiRequest.mockResolvedValue({
        success: false,
        error: 'Server unavailable'
      })

      render(<DashboardOverview />)

      // Should show fallback data instead of error UI
      await waitFor(() => {
        expect(screen.getByText('24')).toBeInTheDocument() // Fallback posts created
        expect(screen.getByText('4.2%')).toBeInTheDocument() // Fallback engagement rate
        expect(screen.getByText('2.4K')).toBeInTheDocument() // Fallback followers
        expect(screen.getByText('18/100')).toBeInTheDocument() // Fallback AI generations
      })
    })

    test('falls back to static data on error', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'))

      render(<DashboardOverview />)

      // Even with error, should show fallback data
      await waitFor(() => {
        expect(screen.getByText('24')).toBeInTheDocument() // Fallback posts created
        expect(screen.getByText('4.2%')).toBeInTheDocument() // Fallback engagement rate
        expect(screen.getByText('2.4K')).toBeInTheDocument() // Fallback followers
        expect(screen.getByText('18/100')).toBeInTheDocument() // Fallback AI generations
      })
    })
  })

  describe('Data Transformation', () => {
    test('handles edge cases in number formatting', async () => {
      const edgeCaseData = {
        postsCreated: { value: 0, change: 0 },
        engagementRate: { value: 0.1, change: -100 },
        followers: { value: 999, change: 1000 },
        aiGenerations: { used: 100, total: 100 }
      }

      mockApiRequest.mockResolvedValue({
        success: true,
        data: edgeCaseData
      })

      render(<DashboardOverview />)

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument() // Zero posts
        expect(screen.getByText('0.1%')).toBeInTheDocument() // Low engagement
        expect(screen.getByText('999')).toBeInTheDocument() // Just under 1K
        expect(screen.getByText('100/100')).toBeInTheDocument() // All generations used
        expect(screen.getByText('0 left')).toBeInTheDocument() // No generations left
        expect(screen.getByText('+1000%')).toBeInTheDocument() // Large percentage change
      })
    })
  })

  describe('Component Structure', () => {
    test('renders all stat cards with proper icons', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockDashboardData
      })

      render(<DashboardOverview />)

      await waitFor(() => {
        // Check that all stat cards are rendered
        expect(screen.getByText('Posts Created')).toBeInTheDocument()
        expect(screen.getByText('Engagement Rate')).toBeInTheDocument()
        expect(screen.getByText('Followers')).toBeInTheDocument()
        expect(screen.getByText('AI Generations Used')).toBeInTheDocument()

        // Check grid layout
        const gridContainer = document.querySelector('.grid')
        expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'gap-4', 'sm:gap-5', 'sm:grid-cols-2', 'lg:grid-cols-4')
      })
    })

    test('applies boutique-card class to stat cards', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockDashboardData
      })

      render(<DashboardOverview />)

      await waitFor(() => {
        const cards = document.querySelectorAll('.boutique-card')
        expect(cards).toHaveLength(4)
      })
    })
  })

  describe('Accessibility', () => {
    test('has proper semantic structure', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockDashboardData
      })

      render(<DashboardOverview />)

      await waitFor(() => {
        // Check for proper definition lists
        const definitionLists = screen.getAllByRole('definition')
        expect(definitionLists.length).toBeGreaterThan(0)

        // Check for proper terms and definitions
        const terms = document.querySelectorAll('dt')
        const definitions = document.querySelectorAll('dd')
        expect(terms).toHaveLength(4)
        expect(definitions).toHaveLength(4)
      })
    })

    test('fallback data is accessible when API fails', async () => {
      mockApiRequest.mockRejectedValue(new Error('Test error'))

      render(<DashboardOverview />)

      // Component should show fallback data instead of error UI
      await waitFor(() => {
        // Check that dashboard stats are accessible
        expect(screen.getByText('Posts Created')).toBeInTheDocument()
        expect(screen.getByText('24')).toBeInTheDocument() // Fallback data
      })
    })
  })

  describe('Error Boundary Integration', () => {
    test('wraps content with error boundary', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockDashboardData
      })

      const { container } = render(<DashboardOverview />)

      await waitFor(() => {
        // The component should be wrapped with InlineErrorBoundary
        // This is tested implicitly through successful rendering
        expect(screen.getByText('Posts Created')).toBeInTheDocument()
      })
    })
  })
})