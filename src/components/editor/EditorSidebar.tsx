'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DraggableItem } from './DraggableItem'
import { 
  Image, 
  Type, 
  Shapes, 
  Wand2, 
  Upload,
  X,
  Search,
  Sparkles,
  Square,
  Circle,
  Triangle,
  Plus
} from 'lucide-react'
import { clsx } from 'clsx'
import { CanvasObject } from '@/types'

interface EditorSidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
}

type SidebarTab = 'templates' | 'elements' | 'text' | 'images' | 'ai'

const sidebarTabs = [
  { id: 'templates' as SidebarTab, label: 'Templates', icon: Image },
  { id: 'text' as SidebarTab, label: 'Text', icon: Type },
  { id: 'elements' as SidebarTab, label: 'Elements', icon: Shapes },
  { id: 'images' as SidebarTab, label: 'Images', icon: Upload },
  { id: 'ai' as SidebarTab, label: 'AI Assistant', icon: Wand2 },
]

// Default text styles
const textPresets = [
  {
    name: 'Heading',
    data: {
      type: 'text' as const,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      locked: false,
      visible: true,
      properties: {
        text: 'Heading',
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'left' as const,
        lineHeight: 1.2,
        letterSpacing: 0,
      }
    }
  },
  {
    name: 'Subheading',
    data: {
      type: 'text' as const,
      width: 180,
      height: 30,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      locked: false,
      visible: true,
      properties: {
        text: 'Subheading',
        fontFamily: 'Inter',
        fontSize: 24,
        fontWeight: '600',
        color: '#4b5563',
        textAlign: 'left' as const,
        lineHeight: 1.3,
        letterSpacing: 0,
      }
    }
  },
  {
    name: 'Body Text',
    data: {
      type: 'text' as const,
      width: 160,
      height: 24,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      locked: false,
      visible: true,
      properties: {
        text: 'Body text',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#6b7280',
        textAlign: 'left' as const,
        lineHeight: 1.5,
        letterSpacing: 0,
      }
    }
  }
]

// Shape presets
const shapePresets = [
  {
    name: 'Rectangle',
    icon: Square,
    data: {
      type: 'shape' as const,
      width: 120,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      locked: false,
      visible: true,
      properties: {
        shapeType: 'rectangle' as const,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        borderRadius: 8,
      }
    }
  },
  {
    name: 'Circle',
    icon: Circle,
    data: {
      type: 'shape' as const,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      locked: false,
      visible: true,
      properties: {
        shapeType: 'circle' as const,
        fill: '#ef4444',
        stroke: '#dc2626',
        strokeWidth: 2,
      }
    }
  },
  {
    name: 'Triangle',
    icon: Triangle,
    data: {
      type: 'shape' as const,
      width: 100,
      height: 90,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      locked: false,
      visible: true,
      properties: {
        shapeType: 'triangle' as const,
        fill: '#10b981',
        stroke: '#059669',
        strokeWidth: 2,
      }
    }
  }
]

export function EditorSidebar({ isOpen, onClose, isMobile = false }: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('templates')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'templates':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search templates..." 
                className="text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 text-center">Template {i + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )
        
      case 'text':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Drag text elements onto the canvas
            </p>
            
            <div className="space-y-3">
              {textPresets.map((preset, index) => (
                <DraggableItem
                  key={index}
                  objectData={preset.data}
                  className="w-full"
                >
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all">
                    <div className="flex items-center space-x-3">
                      <Type className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                        <p className="text-xs text-gray-500">
                          {preset.data.properties.fontSize}px • {preset.data.properties.fontWeight}
                        </p>
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </DraggableItem>
              ))}
            </div>

            {/* Quick text add button */}
            <div className="pt-4 border-t border-gray-100">
              <DraggableItem
                objectData={{
                  type: 'text',
                  width: 120,
                  height: 24,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 1,
                  locked: false,
                  visible: true,
                  properties: {
                    text: 'Click to edit',
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: 'normal',
                    color: '#1f2937',
                    textAlign: 'left',
                    lineHeight: 1.4,
                    letterSpacing: 0,
                  }
                }}
                className="w-full"
              >
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Text
                </Button>
              </DraggableItem>
            </div>
          </div>
        )
        
      case 'elements':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Drag shapes and elements onto the canvas
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {shapePresets.map((shape, index) => (
                <DraggableItem
                  key={index}
                  objectData={shape.data}
                >
                  <div className="aspect-square bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all flex flex-col items-center justify-center p-4 group">
                    <shape.icon 
                      className="h-8 w-8 mb-2 text-gray-600 group-hover:text-primary-600 transition-colors" 
                      style={{ color: shape.data.properties.fill }}
                    />
                    <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                      {shape.name}
                    </span>
                  </div>
                </DraggableItem>
              ))}
            </div>

            {/* Color variations */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Colors</h4>
              <div className="grid grid-cols-8 gap-2">
                {[
                  '#ef4444', '#f97316', '#f59e0b', '#10b981', 
                  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
                ].map((color, index) => (
                  <DraggableItem
                    key={index}
                    objectData={{
                      type: 'shape',
                      width: 100,
                      height: 100,
                      rotation: 0,
                      opacity: 1,
                      zIndex: 1,
                      locked: false,
                      visible: true,
                      properties: {
                        shapeType: 'circle',
                        fill: color,
                        stroke: color,
                        strokeWidth: 0,
                      }
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-grab hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  </DraggableItem>
                ))}
              </div>
            </div>
          </div>
        )
        
      case 'images':
        return (
          <div className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <DraggableItem
                  key={i}
                  objectData={{
                    type: 'image',
                    width: 150,
                    height: 150,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 1,
                    locked: false,
                    visible: true,
                    properties: {
                      src: `https://picsum.photos/300/300?random=${i}`,
                      originalSrc: `https://picsum.photos/300/300?random=${i}`,
                      filters: [],
                      borderRadius: 8,
                    }
                  }}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-grab hover:bg-gray-200 transition-colors group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
                  </div>
                </DraggableItem>
              ))}
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Stock Photos</p>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DraggableItem
                    key={i}
                    objectData={{
                      type: 'image',
                      width: 200,
                      height: 200,
                      rotation: 0,
                      opacity: 1,
                      zIndex: 1,
                      locked: false,
                      visible: true,
                      properties: {
                        src: `https://picsum.photos/400/400?random=${i + 10}`,
                        originalSrc: `https://picsum.photos/400/400?random=${i + 10}`,
                        filters: [],
                        borderRadius: 0,
                      }
                    }}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-md cursor-grab hover:scale-105 transition-transform">
                      <img
                        src={`https://picsum.photos/150/150?random=${i + 10}`}
                        alt={`Stock photo ${i + 1}`}
                        className="w-full h-full object-cover rounded-md"
                        loading="lazy"
                      />
                    </div>
                  </DraggableItem>
                ))}
              </div>
            </div>
          </div>
        )
        
      case 'ai':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-lg border border-primary-200">
              <div className="flex items-center mb-2">
                <Sparkles className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="font-medium text-primary-900">AI Assistant</h3>
              </div>
              <p className="text-sm text-primary-700 mb-3">
                Let AI help you create stunning content
              </p>
            </div>
            
            <Button className="w-full" variant="gradient">
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Caption
            </Button>
            
            <Button className="w-full" variant="outline">
              <Image className="mr-2 h-4 w-4" aria-hidden="true" />
              Generate Image
            </Button>
            
            <Button className="w-full" variant="outline">
              <Type className="mr-2 h-4 w-4" />
              Suggest Hashtags
            </Button>

            {/* AI-generated text suggestions */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">AI Suggestions</p>
              <div className="space-y-2">
                {[
                  'New Collection Alert!',
                  'Style Your Way',
                  'Fashion Forward'
                ].map((text, i) => (
                  <DraggableItem
                    key={i}
                    objectData={{
                      type: 'text',
                      width: 180,
                      height: 32,
                      rotation: 0,
                      opacity: 1,
                      zIndex: 1,
                      locked: false,
                      visible: true,
                      properties: {
                        text,
                        fontFamily: 'Inter',
                        fontSize: 20,
                        fontWeight: '600',
                        color: '#1f2937',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        letterSpacing: -0.5,
                      }
                    }}
                  >
                    <div className="p-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded border border-primary-200 text-xs text-center cursor-grab hover:from-primary-100 hover:to-secondary-100 transition-colors">
                      {text}
                    </div>
                  </DraggableItem>
                ))}
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  const sidebarClasses = clsx(
    'bg-white border-r border-gray-200 flex flex-col h-full',
    isMobile && 'fixed inset-y-0 left-0 z-50 w-80 transform transition-transform',
    isMobile && !isOpen && '-translate-x-full'
  )

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={onClose}
        />
      )}

      <div className={sidebarClasses}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Editor Tools</h2>
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0" aria-label="Tabs">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-1 py-3 px-1 text-center border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-4 w-4 mx-auto mb-1" />
                <span className="block text-xs">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {renderTabContent()}
        </div>

        {/* Drag instructions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            💡 Drag elements onto the canvas to add them
          </p>
        </div>
      </div>
    </>
  )
}