import React from 'react'
import { Wand2, Instagram, Palette, Zap, Users, BarChart3 } from 'lucide-react'

const features = [
  {
    name: 'AI-Powered Design',
    description: 'Generate stunning captions, hashtags, and even product images using advanced AI specifically trained for fashion content.',
    icon: Wand2,
  },
  {
    name: 'Direct Instagram Publishing',
    description: 'Publish directly to your Instagram account with one click. No more manual posting or scheduling complications.',
    icon: Instagram,
  },
  {
    name: 'Fashion-Focused Templates',
    description: '15+ professionally designed templates specifically created for boutiques, with categories for products, lifestyle, and sales.',
    icon: Palette,
  },
  {
    name: 'Mobile-Optimized Editor',
    description: 'Create content on any device with our mobile-first canvas editor featuring touch gestures and responsive design.',
    icon: Zap,
  },
  {
    name: 'Brand Consistency',
    description: 'Upload your brand colors, fonts, and logos to ensure every post maintains your unique boutique aesthetic.',
    icon: Users,
  },
  {
    name: 'Performance Analytics',
    description: 'Track engagement, reach, and sales attribution to understand which content drives the most business results.',
    icon: BarChart3,
  },
]

export function FeaturesSection() {
  return (
    <div className="py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Professional Instagram content made simple
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Stop spending hours on content creation. Our AI-powered platform helps fashion boutiques create 
            engaging Instagram posts in minutes, not hours.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}