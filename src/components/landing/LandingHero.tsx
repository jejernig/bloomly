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
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                <h1 className="text-2xl font-bold font-fashion">Taylor Collection</h1>
              </div>
            </Link>
          </div>

          <div className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="gradient" size="sm">
                Get started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            {/* Announcement Badge */}
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                <span className="font-semibold text-primary-600">Now with AI image generation!</span>
                <Sparkles className="ml-2 inline h-4 w-4" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Create stunning{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Instagram content
              </span>{' '}
              for your boutique in minutes
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg leading-8 text-gray-600">
              AI-powered design tools, fashion-focused templates, and direct Instagram publishing.
              Transform your boutique&apos;s social media presence with professional content that drives sales.
            </p>

            {/* Feature Icons */}
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary-500" />
                AI Design Tools
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-primary-500" />
                Direct Publishing
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary-500" />
                Fashion Templates
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signup">
                <Button variant="gradient" size="xl" className="px-8">
                  Start creating for free
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline" size="xl">
                  Browse templates
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500 mb-6">
                Trusted by 500+ fashion boutiques worldwide
              </p>
              <div className="flex items-center justify-center space-x-8 grayscale opacity-60">
                {/* Placeholder for customer logos */}
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="relative">
              {/* Browser mockup */}
              <div className="rounded-xl bg-gray-900 p-2 shadow-2xl ring-1 ring-gray-900/10">
                <div className="rounded-lg bg-white p-4">
                  {/* Browser header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="ml-4 flex-1 bg-gray-100 rounded px-3 py-1 text-xs text-gray-500">
                      taylorcollection.app/editor
                    </div>
                  </div>
                  
                  {/* App preview */}
                  <div className="bg-gray-50 rounded-lg h-96 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="w-64 h-64 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                        <div className="text-gray-500">
                          <Wand2 className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm">Interactive Demo</p>
                        </div>
                      </div>
                      <p className="text-sm">Create stunning Instagram posts with AI assistance</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 animate-bounce-gentle">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Published to Instagram
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 animate-bounce-gentle delay-1000">
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Sparkles className="w-4 h-4" />
                  AI Caption Generated
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}