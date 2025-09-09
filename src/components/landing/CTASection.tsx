import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTASection() {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-secondary-600">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your boutique&apos;s Instagram?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
            Join 500+ fashion boutiques already creating stunning content with AI. 
            Start your free trial today - no credit card required.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/signup">
              <Button variant="secondary" size="xl" className="px-8">
                <Sparkles className="mr-2 h-5 w-5" />
                Start creating for free
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="ghost" size="xl" className="text-white hover:bg-white/10">
                Browse templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-4 text-sm text-primary-100">
              <div className="flex items-center gap-1">
                ✓ 14-day free trial
              </div>
              <div className="flex items-center gap-1">
                ✓ No credit card required
              </div>
              <div className="flex items-center gap-1">
                ✓ Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}