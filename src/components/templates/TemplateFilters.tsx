import React from 'react'
import { Button } from '@/components/ui/Button'
import { TemplateCategory } from '@/types'
import { Crown, Filter } from 'lucide-react'

const templateCategories: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Templates' },
  { value: 'product-showcase', label: 'Product Showcase' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'sale-promotion', label: 'Sale & Promotion' },
  { value: 'quote-inspiration', label: 'Quote & Inspiration' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'brand-story', label: 'Brand Story' },
]

interface TemplateFiltersProps {
  selectedCategory: TemplateCategory | 'all'
  onCategoryChange: (category: TemplateCategory | 'all') => void
  showPremiumOnly: boolean
  onPremiumFilterChange: (showPremiumOnly: boolean) => void
}

export function TemplateFilters({
  selectedCategory,
  onCategoryChange,
  showPremiumOnly,
  onPremiumFilterChange,
}: TemplateFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onCategoryChange('all')
            onPremiumFilterChange(false)
          }}
        >
          Clear all
        </Button>
      </div>

      {/* Category Filters */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
          <div className="flex flex-wrap gap-2">
            {templateCategories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(category.value)}
                className="text-sm"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Premium Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Access Level</h4>
          <div className="flex gap-2">
            <Button
              variant={showPremiumOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPremiumFilterChange(!showPremiumOnly)}
              className="text-sm"
            >
              <Crown className="mr-2 h-4 w-4" />
              Premium Only
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedCategory !== 'all' || showPremiumOnly) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-1">
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                {templateCategories.find(cat => cat.value === selectedCategory)?.label}
                <button
                  onClick={() => onCategoryChange('all')}
                  className="ml-1 hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
            {showPremiumOnly && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                Premium Only
                <button
                  onClick={() => onPremiumFilterChange(false)}
                  className="ml-1 hover:text-yellow-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}