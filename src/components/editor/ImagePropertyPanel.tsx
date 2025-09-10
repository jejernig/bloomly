'use client'

import React, { useState, useCallback } from 'react'
import { CanvasObject, ImageProperties, ImageFilter } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Image as ImageIcon,
  Upload,
  RotateCw,
  RotateCcw,
  Crop,
  Filter,
  Sun,
  Contrast,
  Palette,
  Focus,
  Film
} from 'lucide-react'
import { clsx } from 'clsx'

interface ImagePropertyPanelProps {
  object: CanvasObject
  properties: ImageProperties
  onUpdate: (updates: Partial<CanvasObject>) => void
}

const imageFilters = [
  { type: 'brightness', label: 'Brightness', icon: Sun, min: -100, max: 100, step: 5 },
  { type: 'contrast', label: 'Contrast', icon: Contrast, min: -100, max: 100, step: 5 },
  { type: 'saturation', label: 'Saturation', icon: Palette, min: -100, max: 100, step: 5 },
  { type: 'blur', label: 'Blur', icon: Focus, min: 0, max: 10, step: 1 },
  { type: 'sepia', label: 'Sepia', icon: Film, min: 0, max: 100, step: 5 },
] as const

export function ImagePropertyPanel({ object, properties, onUpdate }: ImagePropertyPanelProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handlePropertyUpdate = useCallback((propertyUpdates: Partial<ImageProperties>) => {
    onUpdate({
      properties: {
        ...properties,
        ...propertyUpdates
      }
    })
  }, [properties, onUpdate])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {return}

    try {
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file)
      
      // In a real app, you'd upload to your storage service here
      // For now, we'll use the object URL
      handlePropertyUpdate({
        src: imageUrl,
        originalSrc: imageUrl
      })
      
      // Reset the input
      event.target.value = ''
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
  }

  const handleBorderRadiusChange = (borderRadius: number) => {
    handlePropertyUpdate({ 
      borderRadius: Math.max(0, Math.min(50, borderRadius)) 
    })
  }

  const getFilterValue = (filterType: string): number => {
    const filter = properties.filters.find(f => f.type === filterType)
    return filter ? filter.value : 0
  }

  const handleFilterChange = (filterType: string, value: number) => {
    const existingFilters = properties.filters.filter(f => f.type !== filterType)
    const newFilter: ImageFilter = { type: filterType as any, value }
    
    handlePropertyUpdate({
      filters: value === 0 ? existingFilters : [...existingFilters, newFilter]
    })
  }

  const resetFilters = () => {
    handlePropertyUpdate({ filters: [] })
  }

  const handleRotation = (direction: 'left' | 'right') => {
    const currentRotation = object.rotation || 0
    const newRotation = direction === 'right' 
      ? (currentRotation + 90) % 360
      : (currentRotation - 90 + 360) % 360
    
    onUpdate({ rotation: newRotation })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Image Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Preview
        </label>
        <div className="relative">
          <div className="w-full h-32 bg-gray-100 border border-gray-300 rounded-md overflow-hidden">
            {properties.src ? (
              <img
                src={properties.src}
                alt="Image preview for canvas object"
                className="w-full h-full object-cover"
                style={{
                  borderRadius: `${properties.borderRadius}px`,
                  filter: properties.filters.map(f => 
                    `${f.type}(${f.value}${f.type === 'blur' ? 'px' : '%'})`
                  ).join(' ')
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload New Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Replace Image
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center w-full p-3 border border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <Upload className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Upload new image</span>
          </label>
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Corner Radius
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={properties.borderRadius}
            onChange={(e) => handleBorderRadiusChange(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-500 w-12 text-right">
            {properties.borderRadius}px
          </span>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rotation
        </label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotation('left')}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <span className="flex-1 text-center text-sm text-gray-600">
            {object.rotation || 0}°
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotation('right')}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Filters
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {showFilters ? 'Hide' : 'Show'}
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-4 p-3 bg-gray-50 rounded-md">
            {imageFilters.map(({ type, label, icon: Icon, min, max, step }) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {getFilterValue(type)}
                    {type === 'blur' ? 'px' : '%'}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={getFilterValue(type)}
                  onChange={(e) => handleFilterChange(type, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
            
            <div className="pt-2 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Position & Size */}
      <div className="pt-4 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position & Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">X</label>
            <Input
              type="number"
              value={Math.round(object.x)}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y</label>
            <Input
              type="number"
              value={Math.round(object.y)}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Width</label>
            <Input
              type="number"
              value={Math.round(object.width)}
              onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 100 })}
              className="text-sm"
              min="10"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height</label>
            <Input
              type="number"
              value={Math.round(object.height)}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 100 })}
              className="text-sm"
              min="10"
            />
          </div>
        </div>

        {/* Maintain aspect ratio toggle */}
        <div className="mt-3 flex items-center">
          <input
            type="checkbox"
            id="maintain-aspect"
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
          <label htmlFor="maintain-aspect" className="ml-2 text-sm text-gray-600">
            Maintain aspect ratio
          </label>
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opacity
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={object.opacity}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            className="flex-1"
          />
          <span className="text-sm text-gray-500 w-12 text-right">
            {Math.round(object.opacity * 100)}%
          </span>
        </div>
      </div>

      {/* Image Info */}
      <div className="pt-4 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Info
        </label>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Original: {properties.originalSrc ? 'Available' : 'Not set'}</div>
          <div>Filters: {properties.filters.length} active</div>
          <div>Border: {properties.borderRadius}px radius</div>
        </div>
      </div>
    </div>
  )
}