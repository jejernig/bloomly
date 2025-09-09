import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  showAuthToggle?: boolean
  authToggleText?: string
  authToggleLink?: string
  authToggleLinkText?: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showAuthToggle,
  authToggleText,
  authToggleLink,
  authToggleLinkText,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto h-12 w-auto">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                <h1 className="text-3xl font-bold font-fashion">
                  Taylor Collection
                </h1>
              </div>
            </div>
          </Link>
        </div>

        {/* Title and Subtitle */}
        <div className="mt-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
          {children}
        </div>
        
        {showAuthToggle && authToggleText && authToggleLink && authToggleLinkText && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {authToggleText}{' '}
              <Link 
                href={authToggleLink}
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                {authToggleLinkText}
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Back to Home */}
      <div className="mt-8 text-center">
        <Link 
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </div>
    </div>
  )
}