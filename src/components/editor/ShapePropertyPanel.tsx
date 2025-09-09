'use client'

import React, { useState, useCallback } from 'react'
import { CanvasObject, ShapeProperties } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Shapes,
  Square,
  Circle,
  Triangle,
  Palette,
  Paintbrush,
  Plus,
  Minus
} from 'lucide-react'
import { clsx } from 'clsx'

interface ShapePropertyPanelProps {
  object: CanvasObject
  properties: ShapeProperties
  onUpdate: (updates: Partial<CanvasObject>) => void
}

const shapeTypes = [
  { value: 'rectangle', label: 'Rectangle', icon: Square },
  { value: 'circle', label: 'Circle', icon: Circle },
  { value: 'triangle', label: 'Triangle', icon: Triangle }
] as const

const predefinedColors = [
  '#000000', '#ffffff', '#1f2937', '#6b7280', '#9ca3af',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
]

const strokeWidths = [0, 1, 2, 3, 4, 5, 8, 10, 12, 16, 20]

export function ShapePropertyPanel({ object, properties, onUpdate }: ShapePropertyPanelProps) {
  const [showFillPicker, setShowFillPicker] = useState(false)
  const [showStrokePicker, setShowStrokePicker] = useState(false)
  const [customFillColor, setCustomFillColor] = useState(properties.fill)
  const [customStrokeColor, setCustomStrokeColor] = useState(properties.stroke)

  const handlePropertyUpdate = useCallback((propertyUpdates: Partial<ShapeProperties>) => {
    onUpdate({
      properties: {
        ...properties,
        ...propertyUpdates
      }
    })
  }, [properties, onUpdate])

  const handleShapeTypeChange = (shapeType: 'rectangle' | 'circle' | 'triangle') => {
    handlePropertyUpdate({ shapeType })
  }

  const handleFillColorChange = (fill: string) => {
    handlePropertyUpdate({ fill })
    setCustomFillColor(fill)
  }

  const handleStrokeColorChange = (stroke: string) => {
    handlePropertyUpdate({ stroke })
    setCustomStrokeColor(stroke)
  }

  const handleStrokeWidthChange = (strokeWidth: number) => {
    handlePropertyUpdate({ strokeWidth: Math.max(0, Math.min(50, strokeWidth)) })
  }

  const handleBorderRadiusChange = (borderRadius: number) => {
    if (properties.shapeType === 'rectangle') {
      handlePropertyUpdate({ 
        borderRadius: Math.max(0, Math.min(50, borderRadius)) 
      })
    }
  }

  const renderShapePreview = () => {
    const baseStyle = {
      width: '60px',
      height: '60px',
      backgroundColor: properties.fill,
      border: `${properties.strokeWidth}px solid ${properties.stroke}`,
    }

    switch (properties.shapeType) {
      case 'circle':
        return (
          <div
            className="mx-auto"
            style={{
              ...baseStyle,
              borderRadius: '50%'
            }}
          />
        )
      case 'triangle':
        return (
          <div
            className="mx-auto"
            style={{
              width: 0,
              height: 0,
              borderLeft: '30px solid transparent',
              borderRight: '30px solid transparent',
              borderBottom: `60px solid ${properties.fill}`,
              borderTop: 'none'
            }}
          />
        )
      case 'rectangle':
      default:
        return (
          <div
            className="mx-auto"
            style={{
              ...baseStyle,
              borderRadius: `${properties.borderRadius || 0}px`
            }}
          />
        )
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Shape Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shape Preview
        </label>
        <div className="w-full h-24 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center">
          {renderShapePreview()}
        </div>
      </div>

      {/* Shape Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shape Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {shapeTypes.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={properties.shapeType === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleShapeTypeChange(value)}
              className="flex flex-col items-center p-3 h-auto"
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Fill Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fill Color
        </label>
        <div className="space-y-2">
          <div
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: properties.fill }}
            onClick={() => setShowFillPicker(!showFillPicker)}
          >
            <Palette className="h-4 w-4 text-white drop-shadow-sm" />
          </div>
          
          {showFillPicker && (
            <div className="grid grid-cols-6 gap-2 p-2 border border-gray-200 rounded-md">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  className={clsx(
                    'w-8 h-8 rounded border-2 transition-all',
                    properties.fill === color 
                      ? 'border-primary-500 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleFillColorChange(color)}
                />
              ))}
            </div>
          )}
          
          <input
            type="color"
            value={customFillColor}
            onChange={(e) => handleFillColorChange(e.target.value)}
            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
            title="Custom fill color"
          />
        </div>
      </div>

      {/* Stroke Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stroke Color
        </label>
        <div className="space-y-2">
          <div
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: properties.stroke }}
            onClick={() => setShowStrokePicker(!showStrokePicker)}
          >
            <Paintbrush className="h-4 w-4 text-white drop-shadow-sm" />
          </div>
          
          {showStrokePicker && (
            <div className="grid grid-cols-6 gap-2 p-2 border border-gray-200 rounded-md">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  className={clsx(
                    'w-8 h-8 rounded border-2 transition-all',
                    properties.stroke === color 
                      ? 'border-primary-500 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleStrokeColorChange(color)}
                />
              ))}
            </div>
          )}
          
          <input
            type="color"
            value={customStrokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
            title="Custom stroke color"
          />
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stroke Width
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStrokeWidthChange(properties.strokeWidth - 1)}
              disabled={properties.strokeWidth <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={properties.strokeWidth}
              onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value) || 0)}
              className="text-center w-20"
              min="0"
              max="50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStrokeWidthChange(properties.strokeWidth + 1)}
              disabled={properties.strokeWidth >= 50}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500">px</span>
          </div>

          {/* Quick stroke width options */}
          <div className="flex flex-wrap gap-1">
            {strokeWidths.map(width => (
              <button
                key={width}
                onClick={() => handleStrokeWidthChange(width)}
                className={clsx(
                  'px-2 py-1 text-xs rounded border transition-colors',
                  properties.strokeWidth === width
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary-300'
                )}
              >
                {width}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Border Radius (Rectangle only) */}
      {properties.shapeType === 'rectangle' && (
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
              value={properties.borderRadius || 0}
              onChange={(e) => handleBorderRadiusChange(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-12 text-right">
              {properties.borderRadius || 0}px
            </span>
          </div>
        </div>
      )}

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
              onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 10 })}
              className="text-sm"
              min="10"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height</label>
            <Input
              type="number"
              value={Math.round(object.height)}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 10 })}
              className="text-sm"
              min="10"
            />
          </div>
        </div>

        {/* Lock aspect ratio for squares/circles */}
        {(properties.shapeType === 'circle' || properties.shapeType === 'triangle') && (
          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="lock-aspect"
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              defaultChecked
              disabled
            />
            <label htmlFor="lock-aspect" className="ml-2 text-sm text-gray-500">
              Aspect ratio locked for {properties.shapeType}
            </label>
          </div>
        )}
      </div>

      {/* Rotation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rotation
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={object.rotation}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
            className="flex-1"
          />
          <Input
            type="number"
            value={object.rotation}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) || 0 })}
            className="w-16 text-sm text-center"
            min="0"
            max="360"
          />
          <span className="text-sm text-gray-500">°</span>
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

      {/* Shape Info */}
      <div className="pt-4 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shape Info
        </label>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Type: {properties.shapeType}</div>
          <div>Fill: {properties.fill}</div>
          <div>Stroke: {properties.strokeWidth}px {properties.stroke}</div>
          {properties.borderRadius && (
            <div>Radius: {properties.borderRadius}px</div>
          )}
        </div>
      </div>
    </div>
  )
}