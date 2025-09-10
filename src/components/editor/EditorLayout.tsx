'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CanvasEditor } from '../canvas/CanvasEditor'
import { EditorSidebar } from './EditorSidebar'
import { LayerPanel } from './LayerPanel'
import { PropertyPanel } from './PropertyPanel'
import { EditorToolbar } from './EditorToolbar'
import { MobileEditorLayout } from './MobileEditorLayout'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { clsx } from 'clsx'

interface EditorLayoutProps {
  className?: string
}

export function EditorLayout({ className }: EditorLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  
  // Panel states
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [layerPanelOpen, setLayerPanelOpen] = useState(true)
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(true)
  
  // Canvas store
  const {
    canvasState,
    selectedObjectIds,
    zoom,
    setZoom,
    undo,
    redo,
    clearSelection,
    resetView
  } = useCanvasStore()

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile layout handling
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

  // Mobile layout
  if (isMobile) {
    return (
      <div className={clsx('h-full bg-gray-50 flex flex-col', className)}>
        <MobileEditorLayout className={className} />
      </div>
    )
  }

  // Desktop layout
  return (
    <div className={clsx('h-full bg-gray-50 flex flex-col', className)}>
      {/* Toolbar */}
      <EditorToolbar 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="w-80 border-r border-gray-200 bg-white">
            <EditorSidebar 
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CanvasEditor />
          </div>
        </div>

        {/* Right Panels */}
        <div className="flex">
          {/* Layer Panel */}
          {layerPanelOpen && (
            <div className="w-72 border-l border-gray-200 bg-white">
              <LayerPanel />
            </div>
          )}

          {/* Property Panel */}
          {propertyPanelOpen && (
            <div className="w-80 border-l border-gray-200 bg-white">
              <PropertyPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}