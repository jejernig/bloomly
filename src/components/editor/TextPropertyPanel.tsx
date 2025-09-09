'use client'

import React, { useState, useCallback } from 'react'
import { CanvasObject, TextProperties } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Plus,
  Minus
} from 'lucide-react'
import { clsx } from 'clsx'

interface TextPropertyPanelProps {
  object: CanvasObject
  properties: TextProperties
  onUpdate: (updates: Partial<CanvasObject>) => void
}

const fontFamilies = [
  'Inter',
  'Helvetica',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Playfair Display'
]

const fontWeights = [
  { label: 'Thin', value: '100' },
  { label: 'Light', value: '300' },
  { label: 'Regular', value: 'normal' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: 'bold' },
  { label: 'Black', value: '900' }
]

const predefinedColors = [
  '#000000', '#ffffff', '#1f2937', '#6b7280', '#9ca3af',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
]

export function TextPropertyPanel({ object, properties, onUpdate }: TextPropertyPanelProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState(properties.color)

  const handlePropertyUpdate = useCallback((propertyUpdates: Partial<TextProperties>) => {
    onUpdate({
      properties: {
        ...properties,
        ...propertyUpdates
      }
    })
  }, [properties, onUpdate])

  const handleTextChange = (text: string) => {
    handlePropertyUpdate({ text })
  }

  const handleFontFamilyChange = (fontFamily: string) => {
    handlePropertyUpdate({ fontFamily })
  }

  const handleFontSizeChange = (fontSize: number) => {
    handlePropertyUpdate({ fontSize: Math.max(8, Math.min(200, fontSize)) })
  }

  const handleFontWeightChange = (fontWeight: string) => {
    handlePropertyUpdate({ fontWeight })
  }

  const handleColorChange = (color: string) => {
    handlePropertyUpdate({ color })
    setCustomColor(color)
  }

  const handleTextAlignChange = (textAlign: 'left' | 'center' | 'right' | 'justify') => {
    handlePropertyUpdate({ textAlign })
  }

  const handleLineHeightChange = (lineHeight: number) => {
    handlePropertyUpdate({ lineHeight: Math.max(0.5, Math.min(3, lineHeight)) })
  }

  const handleLetterSpacingChange = (letterSpacing: number) => {
    handlePropertyUpdate({ letterSpacing: Math.max(-10, Math.min(10, letterSpacing)) })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Text Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Content
        </label>
        <textarea
          value={properties.text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md resize-none text-sm"
          rows={3}
          placeholder="Enter your text..."
        />
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Family
        </label>
        <select
          value={properties.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
        >
          {fontFamilies.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Size
        </label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFontSizeChange(properties.fontSize - 1)}
            disabled={properties.fontSize <= 8}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={properties.fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 16)}
            className="text-center w-20"
            min="8"
            max="200"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFontSizeChange(properties.fontSize + 1)}
            disabled={properties.fontSize >= 200}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">px</span>
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Weight
        </label>
        <select
          value={properties.fontWeight}
          onChange={(e) => handleFontWeightChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
        >
          {fontWeights.map(weight => (
            <option key={weight.value} value={weight.value}>
              {weight.label}
            </option>
          ))}
        </select>
      </div>

      {/* Text Align */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Alignment
        </label>
        <div className="flex items-center space-x-1">
          <Button
            variant={properties.textAlign === 'left' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTextAlignChange('left')}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={properties.textAlign === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTextAlignChange('center')}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={properties.textAlign === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTextAlignChange('right')}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant={properties.textAlign === 'justify' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTextAlignChange('justify')}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Color
        </label>
        <div className="space-y-2">
          <div
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: properties.color }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <Palette className="h-4 w-4 text-white drop-shadow-sm" />
          </div>
          
          {showColorPicker && (
            <div className="grid grid-cols-6 gap-2 p-2 border border-gray-200 rounded-md">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  className={clsx(
                    'w-8 h-8 rounded border-2 transition-all',
                    properties.color === color 
                      ? 'border-primary-500 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          )}
          
          <input
            type="color"
            value={customColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
            title="Custom color"
          />
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Line Height
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={properties.lineHeight}
            onChange={(e) => handleLineHeightChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-500 w-12 text-right">
            {properties.lineHeight.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Letter Spacing
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="-10"
            max="10"
            step="0.5"
            value={properties.letterSpacing}
            onChange={(e) => handleLetterSpacingChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-500 w-12 text-right">
            {properties.letterSpacing}px
          </span>
        </div>
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
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 20 })}
              className="text-sm"
              min="10"
            />
          </div>
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
    </div>
  )
}