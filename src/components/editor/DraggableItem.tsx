'use client'

import React, { useState, useRef, useCallback } from 'react'
import { clsx } from 'clsx'
import { CanvasObject } from '@/types'
import { useCanvasStore } from '@/stores/useCanvasStore'

interface DraggableItemProps {
  children: React.ReactNode
  objectData: Omit<CanvasObject, 'id' | 'x' | 'y'>
  className?: string
  disabled?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}

interface DragState {
  isDragging: boolean
  startPosition: { x: number; y: number }
  currentPosition: { x: number; y: number }
}

export function DraggableItem({ 
  children, 
  objectData, 
  className,
  disabled = false,
  onDragStart,
  onDragEnd 
}: DraggableItemProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 }
  })
  
  const dragRef = useRef<HTMLDivElement>(null)
  const { canvas, addObject } = useCanvasStore()

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) {return}
    
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const startPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    setDragState({
      isDragging: true,
      startPosition,
      currentPosition: { x: e.clientX, y: e.clientY }
    })

    onDragStart?.()
  }, [disabled, onDragStart])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging) {return}

    setDragState(prev => ({
      ...prev,
      currentPosition: { x: e.clientX, y: e.clientY }
    }))
  }, [dragState.isDragging])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !canvas) {return}

    const canvasElement = canvas.getElement()
    const canvasRect = canvasElement.getBoundingClientRect()
    
    // Check if mouse is over canvas
    const isOverCanvas = (
      e.clientX >= canvasRect.left &&
      e.clientX <= canvasRect.right &&
      e.clientY >= canvasRect.top &&
      e.clientY <= canvasRect.bottom
    )

    if (isOverCanvas) {
      // Convert screen coordinates to canvas coordinates
      const canvasX = (e.clientX - canvasRect.left) / canvas.getZoom()
      const canvasY = (e.clientY - canvasRect.top) / canvas.getZoom()
      
      // Adjust for canvas pan
      const vpt = canvas.viewportTransform
      const canvasPanX = vpt ? -vpt[4] / canvas.getZoom() : 0
      const canvasPanY = vpt ? -vpt[5] / canvas.getZoom() : 0

      // Create new canvas object
      const newObject: CanvasObject = {
        ...objectData,
        id: `${objectData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: canvasX + canvasPanX,
        y: canvasY + canvasPanY,
      }

      // Add object to canvas
      addObject(newObject)
    }

    setDragState({
      isDragging: false,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 }
    })

    onDragEnd?.()
  }, [dragState.isDragging, canvas, objectData, addObject, onDragEnd])

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) {return}
    
    e.preventDefault()
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const startPosition = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }

    setDragState({
      isDragging: true,
      startPosition,
      currentPosition: { x: touch.clientX, y: touch.clientY }
    })

    onDragStart?.()
  }, [disabled, onDragStart])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragState.isDragging) {return}
    
    e.preventDefault()
    const touch = e.touches[0]
    setDragState(prev => ({
      ...prev,
      currentPosition: { x: touch.clientX, y: touch.clientY }
    }))
  }, [dragState.isDragging])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!dragState.isDragging || !canvas) {return}

    e.preventDefault()
    const touch = e.changedTouches[0]
    const canvasElement = canvas.getElement()
    const canvasRect = canvasElement.getBoundingClientRect()
    
    // Check if touch ended over canvas
    const isOverCanvas = (
      touch.clientX >= canvasRect.left &&
      touch.clientX <= canvasRect.right &&
      touch.clientY >= canvasRect.top &&
      touch.clientY <= canvasRect.bottom
    )

    if (isOverCanvas) {
      // Convert screen coordinates to canvas coordinates
      const canvasX = (touch.clientX - canvasRect.left) / canvas.getZoom()
      const canvasY = (touch.clientY - canvasRect.top) / canvas.getZoom()
      
      // Adjust for canvas pan
      const vpt = canvas.viewportTransform
      const canvasPanX = vpt ? -vpt[4] / canvas.getZoom() : 0
      const canvasPanY = vpt ? -vpt[5] / canvas.getZoom() : 0

      // Create new canvas object
      const newObject: CanvasObject = {
        ...objectData,
        id: `${objectData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: canvasX + canvasPanX,
        y: canvasY + canvasPanY,
      }

      // Add object to canvas
      addObject(newObject)
    }

    setDragState({
      isDragging: false,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 }
    })

    onDragEnd?.()
  }, [dragState.isDragging, canvas, objectData, addObject, onDragEnd])

  // Set up global event listeners for drag operations
  React.useEffect(() => {
    if (!dragState.isDragging) {return}

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Render drag preview
  const renderDragPreview = () => {
    if (!dragState.isDragging) {return null}

    const offset = {
      x: dragState.currentPosition.x - dragState.startPosition.x,
      y: dragState.currentPosition.y - dragState.startPosition.y
    }

    return (
      <div
        className="fixed pointer-events-none z-50 opacity-75 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: dragState.currentPosition.x,
          top: dragState.currentPosition.y,
        }}
      >
        <div className="bg-white border-2 border-primary-300 rounded-lg shadow-lg p-2 scale-90">
          {children}
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        ref={dragRef}
        className={clsx(
          'cursor-grab select-none transition-all duration-150',
          dragState.isDragging && 'cursor-grabbing opacity-50 scale-95',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="button"
        tabIndex={0}
        aria-label="Drag to canvas"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            // For keyboard users, add to center of canvas
            if (canvas) {
              const canvasWidth = canvas.getWidth()
              const canvasHeight = canvas.getHeight()
              const newObject: CanvasObject = {
                ...objectData,
                id: `${objectData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                x: canvasWidth / 2 - objectData.width / 2,
                y: canvasHeight / 2 - objectData.height / 2,
              }
              addObject(newObject)
            }
          }
        }}
      >
        {children}
      </div>
      
      {renderDragPreview()}
    </>
  )
}