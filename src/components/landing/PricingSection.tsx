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
    <div className="py-24 sm:py-32" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the perfect plan for your boutique
          </p>
        </div>
        
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start for free and upgrade as your business grows. All plans include our AI-powered design tools 
          and direct Instagram publishing.
        </p>

        <div className="mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`${
                tier.popular
                  ? 'relative bg-white shadow-2xl ring-2 ring-primary-600'
                  : 'bg-white/60 shadow-lg ring-1 ring-gray-900/10'
              } rounded-3xl p-8 ${
                index === 1 ? 'lg:z-10 lg:rounded-b-none' : 'lg:rounded-t-none'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 px-3 py-2 text-center text-sm font-medium text-white">
                  <Star className="inline h-4 w-4 mr-1" />
                  Most Popular
                </div>
              )}

              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.name}
                  className={`${
                    tier.popular ? 'text-primary-600' : 'text-gray-900'
                  } text-lg font-semibold leading-8`}
                >
                  {tier.name}
                </h3>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>

              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  {tier.price}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  {tier.period}
                </span>
              </p>

              <Link href="/auth/signup">
                <Button
                  variant={tier.popular ? 'gradient' : 'outline'}
                  className="mt-6 w-full"
                  size="lg"
                >
                  {tier.cta}
                </Button>
              </Link>

              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      className="h-6 w-5 flex-none text-primary-600"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </div>
  )
}