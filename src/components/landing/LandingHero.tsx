'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Sparkles, Instagram, Wand2, Zap } from 'lucide-react'

export function LandingHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow delay-1000"></div>
        <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow delay-2000"></div>
      </div>

      <div className="relative">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-4 sm:p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                <h1 className="text-xl sm:text-2xl font-bold font-fashion">Bloomly.io</h1>
              </div>
            </Link>
          </div>

          <div className="flex gap-2 sm:gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="text-sm px-4 py-3 min-h-[44px]">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="gradient" size="sm" className="text-sm px-4 py-3 min-h-[44px]">
                Get started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 lg:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            {/* Announcement Badge */}
            <div className="mb-6 sm:mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                <span className="font-semibold text-primary-600">Now with AI image generation!</span>
                <Sparkles className="ml-2 inline h-4 w-4" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Create stunning{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Instagram content
              </span>{' '}
              for your boutique in minutes
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground px-4 sm:px-0">
              AI-powered design tools, fashion-focused templates, and direct Instagram publishing.
              Transform your boutique&apos;s social media presence with professional content that drives sales.
            </p>

            {/* Feature Icons */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                <span className="whitespace-nowrap">AI Design Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                <span className="whitespace-nowrap">Direct Publishing</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                <span className="whitespace-nowrap">Fashion Templates</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button variant="gradient" size="xl" className="w-full sm:w-auto px-8 py-4 text-base">
                  Start creating for free
                </Button>
              </Link>
              <Link href="/templates" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full sm:w-auto px-8 py-4 text-base">
                  Browse templates
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-10 sm:mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-4 sm:mb-6 px-4">
                Trusted by 500+ fashion boutiques worldwide
              </p>
              <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 md:gap-8 grayscale opacity-60 px-4">
                {/* Placeholder for customer logos */}
                <div className="h-6 sm:h-8 w-16 sm:w-24 bg-gray-200 rounded"></div>
                <div className="h-6 sm:h-8 w-16 sm:w-24 bg-gray-200 rounded"></div>
                <div className="h-6 sm:h-8 w-16 sm:w-24 bg-gray-200 rounded"></div>
                <div className="h-6 sm:h-8 w-16 sm:w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="mx-auto mt-12 sm:mt-16 max-w-5xl px-4 sm:px-0">
            <div className="relative">
              {/* Browser mockup */}
              <div className="rounded-lg sm:rounded-xl bg-gray-900 p-1 sm:p-2 shadow-2xl ring-1 ring-gray-900/10">
                <div className="rounded-md sm:rounded-lg bg-white p-2 sm:p-4">
                  {/* Browser header */}
                  <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-red-500"></div>
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 sm:ml-4 flex-1 bg-gray-100 rounded px-2 sm:px-3 py-1 text-xs text-muted-foreground">
                      <span className="hidden sm:inline">bloomly.io/editor</span>
                      <span className="sm:hidden">editor</span>
                    </div>
                  </div>
                  
                  {/* App preview */}
                  <div className="bg-gray-50 rounded-md sm:rounded-lg h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 sm:mb-4">
                        <div className="text-muted-foreground">
                          <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 mx-auto mb-1 sm:mb-2" />
                          <p className="text-xs sm:text-sm">Interactive Demo</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm px-2">Create stunning Instagram posts with AI assistance</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-white rounded-lg shadow-lg p-2 sm:p-3 animate-bounce-gentle">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="hidden sm:inline">Published to Instagram</span>
                  <span className="sm:hidden">Published</span>
                </div>
              </div>
              
              <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-white rounded-lg shadow-lg p-2 sm:p-3 animate-bounce-gentle delay-1000">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-foreground">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">AI Caption Generated</span>
                  <span className="sm:hidden">AI Caption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}