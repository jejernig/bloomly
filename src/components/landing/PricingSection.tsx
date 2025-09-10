import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Check, Star } from 'lucide-react'

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '5 AI generations per month',
      '3 projects',
      'Basic templates',
      '1 Instagram account',
      'Basic support',
    ],
    cta: 'Get started for free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'For growing boutiques',
    features: [
      '100 AI generations per month',
      '50 projects',
      'Premium templates',
      '3 Instagram accounts',
      '3 brand kits',
      'Priority support',
      'Analytics dashboard',
    ],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For established boutiques',
    features: [
      'Unlimited AI generations',
      'Unlimited projects',
      'All templates',
      'Unlimited Instagram accounts',
      'Unlimited brand kits',
      'Team collaboration',
      'Advanced analytics',
      'API access',
    ],
    cta: 'Contact sales',
    popular: false,
  },
]

export function PricingSection() {
  return (
    <div className="py-16 sm:py-20 md:py-24 lg:py-32" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-sm sm:text-base font-semibold leading-7 text-primary-600">Pricing</h2>
          <p className="mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 px-4 sm:px-0">
            Choose the perfect plan for your boutique
          </p>
        </div>
        
        <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-center text-base sm:text-lg leading-6 sm:leading-8 text-gray-600 px-4 sm:px-0">
          Start for free and upgrade as your business grows. All plans include our AI-powered design tools 
          and direct Instagram publishing.
        </p>

        <div className="mt-12 sm:mt-16 md:mt-20 grid max-w-xs sm:max-w-lg mx-auto grid-cols-1 items-center gap-y-6 gap-x-6 sm:gap-y-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`${
                tier.popular
                  ? 'relative bg-white shadow-2xl ring-2 ring-primary-600'
                  : 'bg-white/60 shadow-lg ring-1 ring-gray-900/10'
              } rounded-2xl sm:rounded-3xl p-6 sm:p-8 ${
                index === 1 ? 'lg:z-10 lg:rounded-b-none md:col-span-1' : 'lg:rounded-t-none'
              } ${
                index === 2 ? 'md:col-span-2 lg:col-span-1' : ''
              } w-full max-w-[280px] mx-auto md:max-w-none`}
            >
              {tier.popular && (
                <div className="absolute -top-4 sm:-top-5 left-0 right-0 mx-auto w-28 sm:w-32 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 px-2 sm:px-3 py-1.5 sm:py-2 text-center text-xs sm:text-sm font-medium text-white">
                  <Star className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xs:inline">Most </span>Popular
                </div>
              )}

              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.name}
                  className={`${
                    tier.popular ? 'text-primary-600' : 'text-gray-900'
                  } text-base sm:text-lg font-semibold leading-6 sm:leading-8`}
                >
                  {tier.name}
                </h3>
              </div>

              <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-5 sm:leading-6 text-gray-600">{tier.description}</p>

              <p className="mt-4 sm:mt-6 flex items-baseline gap-x-1">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                  {tier.price}
                </span>
                <span className="text-xs sm:text-sm font-semibold leading-5 sm:leading-6 text-gray-600">
                  {tier.period}
                </span>
              </p>

              <Link href="/auth/signup" className="block">
                <Button
                  variant={tier.popular ? 'gradient' : 'outline'}
                  className="mt-4 sm:mt-6 w-full min-h-[44px]"
                  size="lg"
                >
                  <span className="text-sm sm:text-base">{tier.cta}</span>
                </Button>
              </Link>

              <ul role="list" className="mt-6 sm:mt-8 space-y-2 sm:space-y-3 text-xs sm:text-sm leading-5 sm:leading-6 text-gray-600">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-2 sm:gap-x-3">
                    <Check
                      className="h-5 w-5 sm:h-6 sm:w-6 flex-none text-primary-600 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="flex-1">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center px-4 sm:px-0">
          <p className="text-xs sm:text-sm text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </div>
  )
}