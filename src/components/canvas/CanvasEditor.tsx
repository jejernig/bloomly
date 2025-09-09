'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { clsx } from 'clsx'
import { Point } from '@/types'

interface CanvasEditorProps {
  className?: string
  isMobile?: boolean
}

export function CanvasEditor({ className, isMobile = false }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const {
    canvas,
    setCanvas,
    zoom,
    setZoom,
    setPan,
    handlePinchZoom,
    handlePanGesture,
    setTouchGesture,
    optimizeForDevice,
    initialize,
    cleanup,
  } = useCanvasStore()

  // Touch handling for mobile
  const [touchData, setTouchData] = useState<{
    startTouches: React.TouchList | null
    lastCenter: Point | null
    lastDistance: number | null
    isPinching: boolean
    isPanning: boolean
  }>({
    startTouches: null,
    lastCenter: null,
    lastDistance: null,
    isPinching: false,
    isPanning: false,
  })

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || isInitialized) {
      return
    }

    const container = containerRef.current
    const canvasElement = canvasRef.current

    // Set canvas size to container size
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect()
      const size = Math.min(rect.width, rect.height) - 40 // Leave some padding
      
      canvasElement.width = size
      canvasElement.height = size
      canvasElement.style.width = `${size}px`
      canvasElement.style.height = `${size}px`

      if (canvas) {
        canvas.setDimensions({ width: size, height: size })
        canvas.renderAll()
      }
    }

    updateCanvasSize()

    // Create fabric canvas instance
    const fabricCanvas = new fabric.Canvas(canvasElement, {
      width: canvasElement.width,
      height: canvasElement.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      imageSmoothingEnabled: true,
      allowTouchScrolling: isMobile,
      selection: true,
      hoverCursor: 'pointer',
      moveCursor: 'pointer',
      defaultCursor: 'default',
    })

    // Mobile-specific optimizations
    if (isMobile) {
      // Disable context menu on long press
      fabricCanvas.upperCanvasEl.addEventListener('contextmenu', (e) => {
        e.preventDefault()
      })

      // Optimize for touch
      fabricCanvas.selection = true
      fabricCanvas.skipTargetFind = false
      fabricCanvas.perPixelTargetFind = true
    }

    // Set canvas instance in store
    setCanvas(fabricCanvas)
    optimizeForDevice()
    initialize()
    setIsInitialized(true)

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      fabricCanvas.dispose()
      cleanup()
    }
  }, [canvas, setCanvas, optimizeForDevice, initialize, cleanup, isMobile, isInitialized])

  // Touch event handlers for mobile gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !canvas) {
      return
    }

    e.preventDefault()
    const touches = e.touches

    if (touches.length === 1) {
      // Single touch - potential pan
      setTouchData(prev => ({
        ...prev,
        startTouches: touches,
        isPanning: true,
        isPinching: false,
      }))
      
      setTouchGesture({
        type: 'pan',
        startPosition: { x: touches[0].clientX, y: touches[0].clientY },
        currentPosition: { x: touches[0].clientX, y: touches[0].clientY },
      })
    } else if (touches.length === 2) {
      // Two touches - pinch zoom
      const touch1 = touches[0]
      const touch2 = touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      }

      setTouchData(prev => ({
        ...prev,
        startTouches: touches,
        lastDistance: distance,
        lastCenter: center,
        isPinching: true,
        isPanning: false,
      }))

      setTouchGesture({
        type: 'pinch',
        startPosition: center,
        currentPosition: center,
        scale: 1,
      })
    }
  }, [isMobile, canvas, setTouchGesture])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !canvas) {
      return
    }

    e.preventDefault()
    const touches = e.touches

    if (touches.length === 1 && touchData.isPanning) {
      // Pan gesture
      const touch = touches[0]
      const startTouch = touchData.startTouches?.[0]
      
      if (startTouch) {
        const deltaX = touch.clientX - startTouch.clientX
        const deltaY = touch.clientY - startTouch.clientY
        
        handlePanGesture({ x: deltaX * 0.5, y: deltaY * 0.5 })
        
        setTouchGesture({
          type: 'pan',
          startPosition: { x: startTouch.clientX, y: startTouch.clientY },
          currentPosition: { x: touch.clientX, y: touch.clientY },
        })
      }
    } else if (touches.length === 2 && touchData.isPinching) {
      // Pinch zoom gesture
      const touch1 = touches[0]
      const touch2 = touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      }

      if (touchData.lastDistance && touchData.lastCenter) {
        const scale = distance / touchData.lastDistance
        const canvasRect = canvas.getElement().getBoundingClientRect()
        const canvasCenter = {
          x: center.x - canvasRect.left,
          y: center.y - canvasRect.top,
        }

        handlePinchZoom(scale, canvasCenter)
        
        setTouchGesture({
          type: 'pinch',
          startPosition: touchData.lastCenter,
          currentPosition: center,
          scale: scale,
        })
      }

      setTouchData(prev => ({
        ...prev,
        lastDistance: distance,
        lastCenter: center,
      }))
    }
  }, [isMobile, canvas, touchData, handlePanGesture, handlePinchZoom, setTouchGesture])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile) {
      return
    }

    setTouchData({
      startTouches: null,
      lastCenter: null,
      lastDistance: null,
      isPinching: false,
      isPanning: false,
    })
    
    setTouchGesture(null)
  }, [isMobile, setTouchGesture])

  // Wheel zoom for desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (isMobile || !canvas) {
      return
    }

    e.preventDefault()
    
    const delta = e.deltaY
    const zoom = canvas.getZoom()
    let newZoom = zoom * (1 - delta / 1000)
    
    newZoom = Math.max(0.1, Math.min(5, newZoom))
    
    const canvasRect = canvas.getElement().getBoundingClientRect()
    const point = new fabric.Point(
      e.clientX - canvasRect.left,
      e.clientY - canvasRect.top
    )
    
    canvas.zoomToPoint(point, newZoom)
    canvas.renderAll()
    setZoom(newZoom)
  }, [isMobile, canvas, setZoom])

  if (!isInitialized) {
    return (
      <div className={clsx('flex items-center justify-center', className)}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Initializing canvas...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={clsx(
        'canvas-container relative bg-gray-50 overflow-hidden',
        isMobile ? 'touch-optimized' : '',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className="mx-auto my-auto block border border-gray-200 shadow-sm bg-white"
        style={{
          touchAction: 'none',
          userSelect: 'none',
        }}
      />
      
      {/* Canvas overlay for mobile gestures */}
      {isMobile && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/75 text-white px-3 py-1 rounded-lg text-xs">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {!canvas && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mb-2"></div>
            <p className="text-sm text-gray-600">Loading canvas...</p>
          </div>
        </div>
      )}
    </div>
  )
}