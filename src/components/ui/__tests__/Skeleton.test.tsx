import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  Skeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
  ProjectCardSkeleton,
  DashboardStatSkeleton,
  TableRowSkeleton,
  ListItemSkeleton,
  SkeletonLoader
} from '../Skeleton'

describe('Skeleton', () => {
  describe('Basic Skeleton', () => {
    test('renders with default props', () => {
      render(<Skeleton />)
      
      const skeleton = document.querySelector('.bg-gray-200')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse', 'rounded-none') // default variant
    })

    test('applies custom width and height', () => {
      render(<Skeleton width="200px" height="100px" />)
      
      const skeleton = document.querySelector('.bg-gray-200')
      expect(skeleton).toHaveStyle({
        width: '200px',
        height: '100px'
      })
    })

    test('applies different variants', () => {
      const { rerender } = render(<Skeleton variant="rectangular" />)
      expect(document.querySelector('.bg-gray-200')).toHaveClass('rounded-none')

      rerender(<Skeleton variant="circular" />)
      expect(document.querySelector('.bg-gray-200')).toHaveClass('rounded-full')

      rerender(<Skeleton variant="text" />)
      expect(document.querySelector('.bg-gray-200')).toHaveClass('rounded-sm')

      rerender(<Skeleton variant="rounded" />)
      expect(document.querySelector('.bg-gray-200')).toHaveClass('rounded-lg')
    })

    test('applies different animations', () => {
      const { rerender } = render(<Skeleton animation="pulse" />)
      expect(document.querySelector('.bg-gray-200')).toHaveClass('animate-pulse')

      rerender(<Skeleton animation="wave" />)
      expect(document.querySelector('.bg-gray-200')).toHaveClass('loading-shimmer')

      rerender(<Skeleton animation="none" />)
      expect(document.querySelector('.bg-gray-200')).not.toHaveClass('animate-pulse', 'loading-shimmer')
    })

    test('applies custom className', () => {
      render(<Skeleton className="custom-class" />)
      
      const skeleton = document.querySelector('.bg-gray-200')
      expect(skeleton).toHaveClass('custom-class')
    })

    test('forwards additional props', () => {
      render(<Skeleton data-testid="skeleton-test" />)
      
      expect(screen.getByTestId('skeleton-test')).toBeInTheDocument()
    })
  })

  describe('TextSkeleton', () => {
    test('renders single line by default', () => {
      render(<TextSkeleton />)
      
      const textSkeleton = document.querySelector('.rounded-sm')
      expect(textSkeleton).toBeInTheDocument()
      expect(textSkeleton).toHaveClass('w-3/4')
      expect(textSkeleton).toHaveStyle('height: 1rem')
    })

    test('renders multiple lines', () => {
      render(<TextSkeleton lines={3} />)
      
      const container = document.querySelector('.space-y-2')
      expect(container).toBeInTheDocument()
      
      const lines = container?.querySelectorAll('.rounded-sm')
      expect(lines).toHaveLength(3)
      
      // Last line should be shorter
      const lastLine = lines?.[2]
      expect(lastLine).toHaveClass('w-1/2')
    })

    test('applies custom className', () => {
      render(<TextSkeleton className="custom-text-skeleton" />)
      
      const textSkeleton = document.querySelector('.rounded-sm')
      expect(textSkeleton).toHaveClass('custom-text-skeleton')
    })
  })

  describe('AvatarSkeleton', () => {
    test('renders with default size', () => {
      render(<AvatarSkeleton />)
      
      const avatar = document.querySelector('.rounded-full')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveStyle({
        width: '40px',
        height: '40px'
      })
    })

    test('renders with custom size', () => {
      render(<AvatarSkeleton size={64} />)
      
      const avatar = document.querySelector('.rounded-full')
      expect(avatar).toHaveStyle({
        width: '64px',
        height: '64px'
      })
    })
  })

  describe('CardSkeleton', () => {
    test('renders card structure', () => {
      const { container } = render(<CardSkeleton />)
      
      const card = container.querySelector('.border.border-gray-200.rounded-lg')
      expect(card).toBeInTheDocument()
      
      const content = card?.querySelector('.space-y-4')
      expect(content).toBeInTheDocument()
      
      // Should have image placeholder
      const imagePlaceholder = content?.querySelector('[style*="height: 12rem"]')
      expect(imagePlaceholder).toBeInTheDocument()
      
      // Should have text skeletons
      const textSkeletons = content?.querySelectorAll('.rounded-sm')
      expect(textSkeletons!.length).toBeGreaterThan(0)
    })

    test('applies custom className', () => {
      render(<CardSkeleton className="custom-card" />)
      
      const card = document.querySelector('.border.border-gray-200.rounded-lg')
      expect(card).toHaveClass('custom-card')
    })
  })

  describe('ProjectCardSkeleton', () => {
    test('renders project card structure', () => {
      const { container } = render(<ProjectCardSkeleton />)
      
      const card = container.querySelector('.border.border-gray-200.rounded-lg')
      expect(card).toBeInTheDocument()
      
      // Should have image placeholder
      const imagePlaceholder = card?.querySelector('[style*="height: 12rem"]')
      expect(imagePlaceholder).toBeInTheDocument()
      
      // Should have content area
      const content = card?.querySelector('.p-4.space-y-3')
      expect(content).toBeInTheDocument()
      
      // Should have avatar in content
      const avatar = content?.querySelector('.rounded-full')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('DashboardStatSkeleton', () => {
    test('renders dashboard stat structure', () => {
      const { container } = render(<DashboardStatSkeleton />)
      
      const card = container.querySelector('.bg-white.rounded-lg.shadow-sm.border')
      expect(card).toBeInTheDocument()
      
      const flexContainer = card?.querySelector('.flex.items-center')
      expect(flexContainer).toBeInTheDocument()
      
      // Should have circular icon placeholder
      const icon = flexContainer?.querySelector('.rounded-full')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveStyle({
        width: '32px',
        height: '32px'
      })
    })
  })

  describe('TableRowSkeleton', () => {
    test('renders table row with default columns', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRowSkeleton />
          </tbody>
        </table>
      )
      
      const row = container.querySelector('tr')
      expect(row).toBeInTheDocument()
      
      const cells = row?.querySelectorAll('td')
      expect(cells).toHaveLength(4) // default columns
    })

    test('renders custom number of columns', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRowSkeleton columns={6} />
          </tbody>
        </table>
      )
      
      const cells = container.querySelectorAll('td')
      expect(cells).toHaveLength(6)
    })

    test('applies custom className', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRowSkeleton className="custom-row" />
          </tbody>
        </table>
      )
      
      const row = container.querySelector('tr')
      expect(row).toHaveClass('custom-row')
    })
  })

  describe('ListItemSkeleton', () => {
    test('renders list item structure', () => {
      const { container } = render(<ListItemSkeleton />)
      
      const item = container.querySelector('.flex.items-center.space-x-3')
      expect(item).toBeInTheDocument()
      
      // Should have avatar
      const avatar = item?.querySelector('.rounded-full')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveStyle({
        width: '48px',
        height: '48px'
      })
      
      // Should have content area
      const content = item?.querySelector('.flex-1.space-y-2')
      expect(content).toBeInTheDocument()
      
      // Should have action button placeholder
      const button = item?.querySelector('.w-20')
      expect(button).toBeInTheDocument()
    })
  })

  describe('SkeletonLoader', () => {
    const TestSkeleton = <div data-testid="skeleton">Loading...</div>
    const TestContent = <div data-testid="content">Content loaded</div>
    const TestError = <div data-testid="error">Error occurred</div>

    test('shows skeleton when loading', () => {
      render(
        <SkeletonLoader loading={true} skeleton={TestSkeleton}>
          {TestContent}
        </SkeletonLoader>
      )

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    })

    test('shows content when not loading', () => {
      render(
        <SkeletonLoader loading={false} skeleton={TestSkeleton}>
          {TestContent}
        </SkeletonLoader>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })

    test('shows error fallback when error occurs', () => {
      render(
        <SkeletonLoader 
          loading={false} 
          skeleton={TestSkeleton}
          error={true}
          errorFallback={TestError}
        >
          {TestContent}
        </SkeletonLoader>
      )

      expect(screen.getByTestId('error')).toBeInTheDocument()
      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })

    test('prioritizes error over loading state', () => {
      render(
        <SkeletonLoader 
          loading={true} 
          skeleton={TestSkeleton}
          error={true}
          errorFallback={TestError}
        >
          {TestContent}
        </SkeletonLoader>
      )

      expect(screen.getByTestId('error')).toBeInTheDocument()
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })

    test('shows content when error is true but no errorFallback provided', () => {
      render(
        <SkeletonLoader 
          loading={false} 
          skeleton={TestSkeleton}
          error={true}
        >
          {TestContent}
        </SkeletonLoader>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('skeleton elements do not interfere with screen readers', () => {
      render(<Skeleton aria-hidden="true" />)
      
      const skeleton = document.querySelector('.bg-gray-200')
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })

    test('complex skeletons maintain proper structure', () => {
      const { container } = render(<DashboardStatSkeleton />)
      
      // Should maintain semantic structure even in skeleton form
      const card = container.querySelector('.bg-white.rounded-lg')
      expect(card).toBeInTheDocument()
      
      const flexContainer = card?.querySelector('.flex.items-center')
      expect(flexContainer).toBeInTheDocument()
    })
  })

  describe('Animation Classes', () => {
    test('loading-shimmer class is applied correctly', () => {
      render(<Skeleton animation="wave" />)
      
      const skeleton = document.querySelector('.loading-shimmer')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).not.toHaveClass('animate-pulse')
    })

    test('animate-pulse is default animation', () => {
      render(<Skeleton />)
      
      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).not.toHaveClass('loading-shimmer')
    })

    test('no animation class when animation is none', () => {
      render(<Skeleton animation="none" />)
      
      const skeleton = document.querySelector('.bg-gray-200')
      expect(skeleton).not.toHaveClass('animate-pulse', 'loading-shimmer')
    })
  })
})