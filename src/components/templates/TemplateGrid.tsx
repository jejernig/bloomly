import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { TemplateCategory } from '@/types'
import { Crown, Heart, Wand2 } from 'lucide-react'
import { clsx } from 'clsx'

interface TemplateGridProps {
  category?: TemplateCategory
  showPremiumOnly?: boolean
  limit?: number
  showHeader?: boolean
  className?: string
}

// Mock template data - in real app this would come from the API
const mockTemplates = [
  {
    id: '1',
    name: 'Summer Sale Banner',
    category: 'sale-promotion' as TemplateCategory,
    thumbnailUrl: '/templates/summer-sale.jpg',
    isPremium: false,
    usageCount: 124,
    tags: ['sale', 'summer', 'bright'],
  },
  {
    id: '2',
    name: 'Product Showcase - Minimal',
    category: 'product-showcase' as TemplateCategory,
    thumbnailUrl: '/templates/product-minimal.jpg',
    isPremium: true,
    usageCount: 89,
    tags: ['product', 'minimal', 'clean'],
  },
  {
    id: '3',
    name: 'Lifestyle - Coffee Shop',
    category: 'lifestyle' as TemplateCategory,
    thumbnailUrl: '/templates/lifestyle-coffee.jpg',
    isPremium: false,
    usageCount: 156,
    tags: ['lifestyle', 'coffee', 'cozy'],
  },
  {
    id: '4',
    name: 'Motivational Quote',
    category: 'quote-inspiration' as TemplateCategory,
    thumbnailUrl: '/templates/quote-motivation.jpg',
    isPremium: true,
    usageCount: 67,
    tags: ['quote', 'inspiration', 'elegant'],
  },
  {
    id: '5',
    name: 'New Arrivals Grid',
    category: 'product-showcase' as TemplateCategory,
    thumbnailUrl: '/templates/new-arrivals.jpg',
    isPremium: false,
    usageCount: 201,
    tags: ['product', 'grid', 'modern'],
  },
  {
    id: '6',
    name: 'Winter Collection',
    category: 'seasonal' as TemplateCategory,
    thumbnailUrl: '/templates/winter-collection.jpg',
    isPremium: true,
    usageCount: 43,
    tags: ['seasonal', 'winter', 'cozy'],
  },
]

export function TemplateGrid({ 
  category, 
  showPremiumOnly = false, 
  limit, 
  showHeader = true,
  className = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
}: TemplateGridProps) {
  let filteredTemplates = mockTemplates

  if (category) {
    filteredTemplates = filteredTemplates.filter(template => template.category === category)
  }

  if (showPremiumOnly) {
    filteredTemplates = filteredTemplates.filter(template => template.isPremium)
  }

  if (limit) {
    filteredTemplates = filteredTemplates.slice(0, limit)
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
            <p className="text-gray-600">
              Choose from our collection of fashion-focused Instagram templates
            </p>
          </div>
        </div>
      )}

      {filteredTemplates.length > 0 ? (
        <div className={clsx('grid gap-6', className)}>
          {filteredTemplates.map((template) => (
            <div key={template.id} className="group">
              <div className="boutique-card p-4 hover:shadow-lg transition-all cursor-pointer">
                {/* Template Preview */}
                <div className="aspect-square bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg mb-4 overflow-hidden relative">
                  {/* Placeholder for template preview */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="w-16 h-16 bg-white rounded-lg shadow-sm mb-2 mx-auto flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <p className="text-xs font-medium">{template.name}</p>
                    </div>
                  </div>
                  
                  {/* Premium badge */}
                  {template.isPremium && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="space-y-2">
                      <Link href={`/editor?template=${template.id}`}>
                        <Button variant="secondary" size="sm">
                          <Wand2 className="mr-2 h-4 w-4" />
                          Use Template
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="w-full text-white hover:bg-white/20">
                        <Heart className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {template.name}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="capitalize">
                      {template.category.replace('-', ' ')}
                    </span>
                    <span>{template.usageCount} uses</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Wand2 className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500 mb-4">No templates found</p>
          <p className="text-sm text-gray-400">
            Try adjusting your filters or browse all templates
          </p>
        </div>
      )}
    </div>
  )
}