'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CanvasEditor } from '../canvas/CanvasEditor'
import { EditorSidebar } from './EditorSidebar'
import { LayerPanel } from './LayerPanel'
import { PropertyPanel } from './PropertyPanel'
import { EditorToolbar } from './EditorToolbar'
import { MobileEditorLayout } from './MobileEditorLayout'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { Button } from '@/components/ui/Button'
import { projectsAPI, showErrorToast, showSuccessToast } from '@/lib/api'
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
  Download
} from 'lucide-react'
import { clsx } from 'clsx'

interface EditorLayoutProps {
  projectId?: string
  className?: string
}

export function EditorLayout({ projectId, className }: EditorLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [layerPanelOpen, setLayerPanelOpen] = useState(true)
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(true)
  const [activeRightPanel, setActiveRightPanel] = useState<'layers' | 'properties'>('layers')

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
    clearSelection
  } = useCanvasStore()

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-hide panels on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
      setLayerPanelOpen(false)
      setPropertyPanelOpen(false)
    } else {
      setSidebarOpen(true)
      setLayerPanelOpen(true)
      setPropertyPanelOpen(true)
    }
  }, [isMobile])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'a':
            e.preventDefault()
            // Select all objects
            const allIds = canvasState.objects.map(obj => obj.id)
            if (allIds.length > 0) {
              useCanvasStore.getState().selectMultiple(allIds)
            }
            break
          case 'd':
            e.preventDefault()
            // Duplicate selected
            if (selectedObjectIds.length > 0) {
              useCanvasStore.getState().duplicateSelected()
            }
            break
          case 's':
            e.preventDefault()
            // Save (export)
            handleExport('png')
            break
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault()
            if (selectedObjectIds.length > 0) {
              useCanvasStore.getState().deleteSelected()
            }
            break
          case 'Escape':
            e.preventDefault()
            clearSelection()
            break
          case '=':
          case '+':
            e.preventDefault()
            setZoom(Math.min(5, zoom * 1.1))
            break
          case '-':
            e.preventDefault()
            setZoom(Math.max(0.1, zoom * 0.9))
            break
          case '0':
            e.preventDefault()
            resetView()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canvasState.objects, selectedObjectIds, clearSelection, zoom, setZoom, resetView])

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

  // Auto-save functionality
  useEffect(() => {
    if (!projectId || !canvasState) {return}

    const autoSaveInterval = setInterval(() => {
      if (!isSaving) {
        handleSave()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [handleSave, projectId, canvasState, isSaving])

  // Mobile layout
  if (isMobile) {
    return (
      <MobileEditorLayout
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        <CanvasEditor className="flex-1" isMobile={true} />
      </MobileEditorLayout>
    )
  }

  // Desktop layout
  return (
    <div className={clsx('flex flex-col h-screen bg-gray-50', className)}>
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-4">
          {/* Left controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyStep <= 0}
                title="Undo (Cmd+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                title="Redo (Cmd+Shift+Z)"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.1, zoom * 0.9))}
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(5, zoom * 1.1))}
                title="Zoom In (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                title="Reset View (0)"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Center - Selection info */}
          <div className="flex items-center space-x-4">
            {selectedObjectIds.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-primary-50 rounded-full">
                <span className="text-sm text-primary-700">
                  {selectedObjectIds.length} selected
                </span>
                {isMultiSelecting && (
                  <span className="text-xs text-primary-600">
                    • Multi-select
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLayerPanelOpen(!layerPanelOpen)}
              className={layerPanelOpen ? 'bg-gray-100' : ''}
            >
              <Layers className="h-4 w-4 mr-1" />
              Layers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPropertyPanelOpen(!propertyPanelOpen)}
              className={propertyPanelOpen ? 'bg-gray-100' : ''}
            >
              <Settings className="h-4 w-4 mr-1" />
              Properties
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !projectId}
              className={clsx(isSaving && 'animate-pulse')}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('png')}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        {sidebarOpen && (
          <div className="w-80 flex-shrink-0 border-r border-gray-200">
            <EditorSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              isMobile={false}
            />
          </div>
        )}

        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <CanvasEditor
              className="w-full h-full rounded-lg border border-gray-200 shadow-sm"
              isMobile={false}
            />
          </div>

          {/* Canvas footer with stats */}
          <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>{canvasState.objects.length} objects</span>
                <span>{canvasState.width} × {canvasState.height}px</span>
                <span>Zoom: {Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center space-x-4">
                {canvas && (
                  <span>Ready</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right panels */}
        <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-white">
          {/* Panel tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveRightPanel('layers')}
              className={clsx(
                'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeRightPanel === 'layers'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Layers className="h-4 w-4 mr-2 inline-block" />
              Layers
            </button>
            <button
              onClick={() => setActiveRightPanel('properties')}
              className={clsx(
                'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeRightPanel === 'properties'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Settings className="h-4 w-4 mr-2 inline-block" />
              Properties
            </button>
          </div>

          {/* Panel content */}
          <div className="h-full overflow-hidden">
            {activeRightPanel === 'layers' && (
              <LayerPanel className="h-full border-0" />
            )}
            {activeRightPanel === 'properties' && (
              <PropertyPanel className="h-full border-0" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}