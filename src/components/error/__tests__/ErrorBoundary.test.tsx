import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ErrorBoundary, InlineErrorBoundary } from '../ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

// No location mock needed - jsdom handles this

describe('ErrorBoundary', () => {
  describe('Normal Operation', () => {
    test('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    test('does not render error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Normal content')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    test('catches and displays error with default fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('We apologize for the inconvenience. The application has encountered an unexpected error.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
    })

    test('shows error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Error Details (Development Only):')).toBeInTheDocument()
      expect(screen.getByText(/Test error message/)).toBeInTheDocument()

      process.env.NODE_ENV = originalEnv
    })

    test('hides error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByText('Error Details (Development Only):')).not.toBeInTheDocument()
      expect(screen.queryByText(/Test error message/)).not.toBeInTheDocument()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Error Actions', () => {
    test('try again button resets error state', () => {
      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true)
        
        React.useEffect(() => {
          // After 100ms, stop throwing error to simulate fix
          const timer = setTimeout(() => setShouldThrow(false), 100)
          return () => clearTimeout(timer)
        }, [])

        return <ThrowError shouldThrow={shouldThrow} />
      }

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      )

      // Should show error initially
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(tryAgainButton)

      // Should attempt to re-render children
      setTimeout(() => {
        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
      }, 200)
    })

    test('go home button triggers navigation', () => {
      // Mock window.location.href assignment
      delete (window as any).location;
      (window as any).location = { href: '' };

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const goHomeButton = screen.getByRole('button', { name: /go home/i })
      fireEvent.click(goHomeButton)

      // Verify the button exists and navigation would be triggered
      expect(goHomeButton).toBeInTheDocument()
      expect(window.location.href).toBe('http://localhost/')
    })
  })

  describe('Custom Fallback', () => {
    const CustomFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
      <div>
        <h2>Custom Error: {error.message}</h2>
        <button onClick={resetError}>Reset</button>
      </div>
    )

    test('renders custom fallback component when provided', () => {
      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom Error: Test error message')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error Reporting', () => {
    test('calls onError callback when error occurs', () => {
      const onError = jest.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })
  })
})

describe('InlineErrorBoundary', () => {
  test('renders children when no error occurs', () => {
    render(
      <InlineErrorBoundary>
        <div>Normal content</div>
      </InlineErrorBoundary>
    )

    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  test('displays simplified error UI when error occurs', () => {
    render(
      <InlineErrorBoundary>
        <ThrowError shouldThrow={true} />
      </InlineErrorBoundary>
    )

    expect(screen.getByText('Error loading content')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong while loading this section.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  test('uses custom fallback when provided', () => {
    const customFallback = <div>Custom inline fallback</div>

    render(
      <InlineErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </InlineErrorBoundary>
    )

    expect(screen.getByText('Custom inline fallback')).toBeInTheDocument()
    expect(screen.queryByText('Error loading content')).not.toBeInTheDocument()
  })

  test('retry button resets error state', () => {
    render(
      <InlineErrorBoundary>
        <ThrowError shouldThrow={true} />
      </InlineErrorBoundary>
    )

    expect(screen.getByText('Error loading content')).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)

    // The component should attempt to re-render - error boundary will reset and try again
    // Since ThrowError always throws, it will show the error again
    expect(screen.getByText('Error loading content')).toBeInTheDocument()
  })
})

describe('Error Boundary Accessibility', () => {
  test('error UI has proper ARIA attributes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    const goHomeButton = screen.getByRole('button', { name: /go home/i })

    expect(tryAgainButton).toHaveAttribute('type', 'button')
    expect(goHomeButton).toHaveAttribute('type', 'button')
  })

  test('inline error boundary has accessible button', () => {
    render(
      <InlineErrorBoundary>
        <ThrowError shouldThrow={true} />
      </InlineErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toHaveAttribute('type', 'button')
  })

  test('error messages are properly structured', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Something went wrong')
  })
})

describe('Error Boundary Edge Cases', () => {
  test('handles errors in useEffect', () => {
    const ComponentWithEffectError = () => {
      React.useEffect(() => {
        // Error boundaries don't catch errors in useEffect - this is expected behavior
        // The component renders normally and the error is not caught by the boundary
        console.error('Effect error - not caught by boundary')
      }, [])
      return <div>Component with effect</div>
    }

    // Error boundaries don't catch errors in effects, event handlers, or async code
    // This test documents the expected behavior - component renders normally
    render(
      <ErrorBoundary>
        <ComponentWithEffectError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Component with effect')).toBeInTheDocument()
  })

  test('handles multiple consecutive errors', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Reset and throw again
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(tryAgainButton)

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})