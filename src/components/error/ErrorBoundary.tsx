'use client'

import React from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  hasRetried?: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to error monitoring service
    this.reportError(error, errorInfo)
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // Here you would integrate with error monitoring services like Sentry, LogRocket, etc.
    console.error('Error Boundary - Error Details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary'
    })
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error!} 
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            We apologize for the inconvenience. The application has encountered an unexpected error.
          </p>
        </div>

        {isDevelopment && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="text-sm font-medium text-red-800 mb-2">Error Details (Development Only):</h3>
            <pre className="text-xs text-red-700 whitespace-pre-wrap break-words">
              {error.message}
              {error.stack && '\n\nStack Trace:\n' + error.stack}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={resetError}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

// Simplified error boundary for inline use
export function InlineErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <ErrorBoundary
      fallback={fallback ? () => <>{fallback}</> : SimpleErrorFallback}
    >
      {children}
    </ErrorBoundary>
  )
}

function SimpleErrorFallback({ resetError }: ErrorFallbackProps) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 text-red-800 mb-2">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">Error loading content</span>
      </div>
      <p className="text-red-600 text-sm mb-3">
        Something went wrong while loading this section.
      </p>
      <Button 
        onClick={resetError} 
        size="sm" 
        variant="outline"
        className="text-red-700 border-red-300 hover:bg-red-100"
      >
        <RefreshCcw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  )
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}