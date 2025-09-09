'use client'

import React, { useState, useCallback } from 'react'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { CanvasObject } from '@/types'
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Type,
  Image,
  Shapes,
  Layers,
  GripVertical
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'

interface LayerPanelProps {
  className?: string
}

interface LayerItemProps {
  object: CanvasObject
  isSelected: boolean
  onSelect: (objectId: string) => void
  onToggleVisibility: (objectId: string) => void
  onToggleLock: (objectId: string) => void
  onDelete: (objectId: string) => void
  onDuplicate: (objectId: string) => void
  onMoveUp: (objectId: string) => void
  onMoveDown: (objectId: string) => void
  onMoveToTop: (objectId: string) => void
  onMoveToBottom: (objectId: string) => void
}

function LayerItem({
  object,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom
}: LayerItemProps) {
  const [showMenu, setShowMenu] = useState(false)

  const getLayerIcon = () => {
    switch (object.type) {
      case 'text':
        return <Type className="h-4 w-4" />
      case 'image':
        return <Image className="h-4 w-4" />
      case 'shape':
        return <Shapes className="h-4 w-4" />
      default:
        return <Layers className="h-4 w-4" />
    }
  }

  const getLayerName = () => {
    switch (object.type) {
      case 'text':
        const textProps = object.properties as any
        return textProps.text.length > 20 
          ? `${textProps.text.substring(0, 20)}...`
          : textProps.text
      case 'image':
        return 'Image'
      case 'shape':
        const shapeProps = object.properties as any
        return shapeProps.shapeType.charAt(0).toUpperCase() + shapeProps.shapeType.slice(1)
      default:
        return 'Layer'
    }
  }

  return (
    <div
      className={clsx(
        'group flex items-center p-2 rounded-lg border transition-all duration-150 cursor-pointer relative',
        isSelected
          ? 'bg-primary-50 border-primary-200 shadow-sm'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      )}
      onClick={() => onSelect(object.id)}
    >
      {/* Drag handle */}
      <div className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      {/* Layer icon */}
      <div className={clsx(
        'mr-3 p-1.5 rounded',
        isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
      )}>
        {getLayerIcon()}
      </div>

      {/* Layer info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={clsx(
            'text-sm font-medium truncate',
            isSelected ? 'text-primary-900' : 'text-gray-900'
          )}>
            {getLayerName()}
          </p>
          <span className="text-xs text-gray-500 ml-2">
            {object.type}
          </span>
        </div>
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-xs text-gray-500">
            {Math.round(object.x)}, {Math.round(object.y)}
          </span>
          <span className="text-xs text-gray-500">
            {Math.round(object.width)} × {Math.round(object.height)}
          </span>
        </div>
      </div>

      {/* Layer controls */}
      <div className="flex items-center space-x-1 ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleVisibility(object.id)
          }}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title={object.visible ? 'Hide layer' : 'Show layer'}
        >
          {object.visible ? (
            <Eye className="h-4 w-4 text-gray-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" />
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleLock(object.id)
          }}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title={object.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {object.locked ? (
            <Lock className="h-4 w-4 text-amber-600" />
          ) : (
            <Unlock className="h-4 w-4 text-gray-600" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate(object.id)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-3" />
                  Duplicate
                </button>
                
                <div className="border-t border-gray-100 my-1" />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveToTop(object.id)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ChevronUp className="h-4 w-4 mr-3" />
                  Bring to Front
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveUp(object.id)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ChevronUp className="h-4 w-4 mr-3" />
                  Bring Forward
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveDown(object.id)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ChevronDown className="h-4 w-4 mr-3" />
                  Send Backward
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveToBottom(object.id)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ChevronDown className="h-4 w-4 mr-3" />
                  Send to Back
                </button>
                
                <div className="border-t border-gray-100 my-1" />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(object.id)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}

export function LayerPanel({ className }: LayerPanelProps) {
  const {
    canvasState,
    selectedObjectId,
    setSelectedObject,
    updateObject,
    deleteObject,
    duplicateObject,
    moveObject
  } = useCanvasStore()

  // Sort objects by zIndex (highest first for display)
  const sortedObjects = [...canvasState.objects].sort((a, b) => b.zIndex - a.zIndex)

  const handleToggleVisibility = useCallback((objectId: string) => {
    const object = canvasState.objects.find(obj => obj.id === objectId)
    if (object) {
      updateObject(objectId, { visible: !object.visible })
    }
  }, [canvasState.objects, updateObject])

  const handleToggleLock = useCallback((objectId: string) => {
    const object = canvasState.objects.find(obj => obj.id === objectId)
    if (object) {
      updateObject(objectId, { locked: !object.locked })
    }
  }, [canvasState.objects, updateObject])

  const handleSelectAll = useCallback(() => {
    // For simplicity, just select the top layer
    if (sortedObjects.length > 0) {
      setSelectedObject(sortedObjects[0].id)
    }
  }, [sortedObjects, setSelectedObject])

  const handleDeselectAll = useCallback(() => {
    setSelectedObject(null)
  }, [setSelectedObject])

  const handleDeleteSelected = useCallback(() => {
    if (selectedObjectId) {
      deleteObject(selectedObjectId)
    }
  }, [selectedObjectId, deleteObject])

  const handleDuplicateSelected = useCallback(() => {
    if (selectedObjectId) {
      duplicateObject(selectedObjectId)
    }
  }, [selectedObjectId, duplicateObject])

  if (sortedObjects.length === 0) {
    return (
      <div className={clsx('bg-white border border-gray-200 rounded-lg', className)}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Layers className="h-5 w-5 mr-2" />
              Layers
            </h3>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Layers className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-sm text-gray-500 mb-2">No layers yet</p>
          <p className="text-xs text-gray-400">
            Drag elements from the sidebar to create layers
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('bg-white border border-gray-200 rounded-lg', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            Layers
          </h3>
          <span className="text-sm text-gray-500">
            {sortedObjects.length} layer{sortedObjects.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={sortedObjects.length === 0}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={!selectedObjectId}
          >
            Deselect
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicateSelected}
            disabled={!selectedObjectId}
          >
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={!selectedObjectId}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Layer list */}
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {sortedObjects.map((object) => (
          <LayerItem
            key={object.id}
            object={object}
            isSelected={selectedObjectId === object.id}
            onSelect={setSelectedObject}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
            onDelete={deleteObject}
            onDuplicate={duplicateObject}
            onMoveUp={(id) => moveObject(id, 'up')}
            onMoveDown={(id) => moveObject(id, 'down')}
            onMoveToTop={(id) => moveObject(id, 'top')}
            onMoveToBottom={(id) => moveObject(id, 'bottom')}
          />
        ))}
      </div>

      {/* Layer stats */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            {sortedObjects.filter(obj => obj.visible).length} visible • {sortedObjects.filter(obj => obj.locked).length} locked
          </span>
          {selectedObjectId && (
            <span className="text-primary-600 font-medium">
              1 selected
            </span>
          )}
        </div>
      </div>
    </div>
  )
}