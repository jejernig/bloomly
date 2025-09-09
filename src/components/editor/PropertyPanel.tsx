'use client'

import React from 'react'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { CanvasObject, TextProperties, ImageProperties, ShapeProperties } from '@/types'
import { TextPropertyPanel } from './TextPropertyPanel'
import { ImagePropertyPanel } from './ImagePropertyPanel'
import { ShapePropertyPanel } from './ShapePropertyPanel'
import { Settings, Info } from 'lucide-react'
import { clsx } from 'clsx'

interface PropertyPanelProps {
  className?: string
}

export function PropertyPanel({ className }: PropertyPanelProps) {
  const { canvasState, selectedObjectId, updateObject } = useCanvasStore()

  const selectedObject = selectedObjectId 
    ? canvasState.objects.find(obj => obj.id === selectedObjectId)
    : null

  const handleUpdateObject = (updates: Partial<CanvasObject>) => {
    if (selectedObjectId) {
      updateObject(selectedObjectId, updates)
    }
  }

  const renderPropertyContent = () => {
    if (!selectedObject) {
      return (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Settings className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-sm text-gray-500 mb-2">No object selected</p>
          <p className="text-xs text-gray-400">
            Select an object on the canvas to edit its properties
          </p>
        </div>
      )
    }

    switch (selectedObject.type) {
      case 'text':
        return (
          <TextPropertyPanel
            object={selectedObject}
            properties={selectedObject.properties as TextProperties}
            onUpdate={handleUpdateObject}
          />
        )
      
      case 'image':
        return (
          <ImagePropertyPanel
            object={selectedObject}
            properties={selectedObject.properties as ImageProperties}
            onUpdate={handleUpdateObject}
          />
        )
      
      case 'shape':
        return (
          <ShapePropertyPanel
            object={selectedObject}
            properties={selectedObject.properties as ShapeProperties}
            onUpdate={handleUpdateObject}
          />
        )
      
      default:
        return (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Info className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-sm text-gray-500 mb-2">Unsupported object type</p>
            <p className="text-xs text-gray-400">
              Properties for {selectedObject.type} objects are not yet supported
            </p>
          </div>
        )
    }
  }

  return (
    <div className={clsx('bg-white border border-gray-200 rounded-lg', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Properties
          </h3>
          {selectedObject && (
            <span className="text-sm text-gray-500 capitalize">
              {selectedObject.type}
            </span>
          )}
        </div>
      </div>

      {/* Properties content */}
      <div className="max-h-96 overflow-y-auto">
        {renderPropertyContent()}
      </div>
    </div>
  )
}