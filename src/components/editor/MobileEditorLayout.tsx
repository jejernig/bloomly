'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { CanvasEditor } from '../canvas/CanvasEditor'
import { EditorSidebar } from './EditorSidebar'
import { LayerPanel } from './LayerPanel'
import { PropertyPanel } from './PropertyPanel'

import { useCanvasStore } from '@/stores/useCanvasStore'
import { Button } from '@/components/ui/Button'
import { projectsAPI, showErrorToast, showSuccessToast } from '@/lib/api'

interface MobileEditorLayoutProps {
  children: React.ReactNode
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}
import {
  Menu,
  X,
  Layers,
  Settings,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Download,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Plus
} from 'lucide-react'
import { clsx } from 'clsx'

interface MobileEditorLayoutProps {
  projectId?: string
  className?: string
}

type MobilePanel = 'sidebar' | 'layers' | 'properties' | null
type MobileView = 'canvas' | 'fullscreen-canvas' | 'panels'

export function MobileEditorLayout({ projectId, className }: MobileEditorLayoutProps) {
  const [activePanel, setActivePanel] = useState<MobilePanel>(null)
  const [currentView, setCurrentView] = useState<MobileView>('canvas')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const {
    canvas,
    canvasState,
    history,
    historyStep,
    selectedObjectId,
    selectedObjectIds,
    isMultiSelecting,
    zoom,
    undo,
    redo,
    setZoom,
    resetView,
    fitToScreen,
    exportCanvas,
    clearSelection,
    deleteSelected,
    duplicateSelected
  } = useCanvasStore()

  // Auto-hide quick actions after inactivity
  useEffect(() => {
    if (!showQuickActions) {return}

    const timer = setTimeout(() => {
      setShowQuickActions(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [showQuickActions, selectedObjectId])

  // Show quick actions when object is selected
  useEffect(() => {
    if (selectedObjectId || selectedObjectIds.length > 0) {
      setShowQuickActions(true)
    }
  }, [selectedObjectId, selectedObjectIds])

  // Handle canvas tap to show/hide controls
  const handleCanvasTap = () => {
    if (isFullscreen) {
      setIsFullscreen(false)
    } else {
      setShowQuickActions(!showQuickActions)
    }
  }

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        if (activePanel) {
          setActivePanel(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activePanel])

  const handleExport = async (format: 'png' | 'jpg' | 'svg' = 'png') => {
    try {
      const dataURL = await exportCanvas(format)
      
      // Create download link
      const link = document.createElement('a')
      link.download = `canvas-export.${format}`
      link.href = dataURL
      link.click()
    } catch (error) {
      console.error('Failed to export canvas:', error)
    }
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!projectId || !canvasState || isSaving) {
      return
    }

    setIsSaving(true)
    try {
      // Generate thumbnail from canvas
      const thumbnailUrl = canvas?.toDataURL() || undefined

      // Save to database
      const response = await projectsAPI.saveCanvas(
        projectId,
        canvasState,
        thumbnailUrl
      )

      if (response.success) {
        showSuccessToast('Project saved successfully')
      }
    } catch (error) {
      console.error('Save failed:', error)
      showErrorToast(error)
    } finally {
      setIsSaving(false)
    }
  }, [projectId, canvasState, canvas, isSaving])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setActivePanel(null)
    setShowQuickActions(false)
  }

  const renderMobilePanel = () => {
    if (!activePanel) {return null}

    const panelContent = () => {
      switch (activePanel) {
        case 'sidebar':
          return (
            <EditorSidebar
              isOpen={true}
              onClose={() => setActivePanel(null)}
              isMobile={true}
            />
          )
        case 'layers':
          return <LayerPanel className="border-0" />
        case 'properties':
          return <PropertyPanel className="border-0" />
        default:
          return null
      }
    }

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-25" onClick={() => setActivePanel(null)}>
        <div 
          ref={panelRef}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {activePanel}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePanel(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto">
            {panelContent()}
          </div>
        </div>
      </div>
    )
  }

  const renderQuickActions = () => {
    if (!showQuickActions || (!selectedObjectId && selectedObjectIds.length === 0)) {
      return null
    }

    return (
      <div className="absolute bottom-20 left-4 right-4 z-30">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">
              {selectedObjectIds.length > 1 
                ? `${selectedObjectIds.length} objects selected`
                : 'Object selected'
              }
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSelection()
                setShowQuickActions(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateSelected()}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePanel('properties')}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteSelected()}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isFullscreen) {
    return (
      <div className={clsx('fixed inset-0 z-50 bg-black', className)}>
        <div 
          className="w-full h-full"
          onClick={handleCanvasTap}
        >
          <CanvasEditor
            className="w-full h-full"
            isMobile={true}
          />
        </div>

        {/* Fullscreen exit button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-40 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className={clsx('flex flex-col h-screen bg-gray-50 relative', className)}>
      {/* Mobile toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePanel('sidebar')}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyStep <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyStep >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Center - Zoom controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.1, zoom * 0.9))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-600 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(5, zoom * 1.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Right controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          className="w-full h-full p-4"
          onClick={handleCanvasTap}
        >
          <CanvasEditor
            className="w-full h-full rounded-lg border border-gray-200 shadow-sm"
            isMobile={true}
          />
        </div>

        {/* Quick actions overlay */}
        {renderQuickActions()}
      </div>

      {/* Bottom navigation */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePanel('sidebar')}
            className={clsx(
              'flex flex-col items-center space-y-1',
              activePanel === 'sidebar' && 'text-primary-600'
            )}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePanel('layers')}
            className={clsx(
              'flex flex-col items-center space-y-1',
              activePanel === 'layers' && 'text-primary-600'
            )}
          >
            <Layers className="h-5 w-5" />
            <span className="text-xs">Layers</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePanel('properties')}
            className={clsx(
              'flex flex-col items-center space-y-1',
              activePanel === 'properties' && 'text-primary-600'
            )}
            disabled={!selectedObjectId && selectedObjectIds.length === 0}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Edit</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !projectId}
            className={clsx(
              'flex flex-col items-center space-y-1',
              isSaving && 'animate-pulse'
            )}
          >
            <Save className="h-5 w-5" />
            <span className="text-xs">{isSaving ? 'Saving...' : 'Save'}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport('png')}
            className="flex flex-col items-center space-y-1"
          >
            <Download className="h-5 w-5" />
            <span className="text-xs">Export</span>
          </Button>
        </div>
      </div>

      {/* Mobile panels */}
      {renderMobilePanel()}

      {/* Canvas stats overlay */}
      {showQuickActions && (
        <div className="absolute top-20 right-4 z-20 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg">
          <div className="text-xs space-y-1">
            <div>{canvasState.objects.length} objects</div>
            <div>{Math.round(zoom * 100)}% zoom</div>
          </div>
        </div>
      )}
    </div>
  )
}