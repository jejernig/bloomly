import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

const templateCategories = [
  {
    name: 'Product Showcase',
    description: 'Clean, professional layouts perfect for highlighting your latest arrivals',
    image: '/templates/product-showcase.jpg',
    templates: 5,
  },
  {
    name: 'Lifestyle',
    description: 'Aspirational layouts featuring your products in real-life settings',
    image: '/templates/lifestyle.jpg',
    templates: 4,
  },
  {
    name: 'Sale & Promotion',
    description: 'Eye-catching designs that drive urgency and boost conversions',
    image: '/templates/sale-promotion.jpg',
    templates: 3,
  },
  {
    name: 'Quote & Inspiration',
    description: 'Motivational content that builds brand connection and engagement',
    image: '/templates/quote-inspiration.jpg',
    templates: 3,
  },
]

export function TemplatesShowcase() {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Fashion-focused templates
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            15+ professionally designed templates created specifically for fashion boutiques.
            Each template is optimized for Instagram&apos;s format and designed to drive engagement.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
          {templateCategories.map((category) => (
            <div key={category.name} className="boutique-card group cursor-pointer hover:shadow-lg transition-all">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
                {/* Placeholder for template preview */}
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-white rounded-lg shadow-sm mb-2 mx-auto flex items-center justify-center">
                      <span className="text-2xl">📸</span>
                    </div>
                    <p className="text-sm font-medium">{category.name}</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-600 font-medium">
                  {category.templates} templates
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/templates">
            <Button variant="gradient" size="lg">
              Browse all templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}