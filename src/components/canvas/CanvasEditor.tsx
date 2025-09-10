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
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [focusedObjectIndex, setFocusedObjectIndex] = useState<number>(-1)
  const [announcement, setAnnouncement] = useState<string>('')
  const [currentTool, setCurrentTool] = useState<string>('select')
  const [isManipulating, setIsManipulating] = useState<boolean>(false)
  const [keyboardMode, setKeyboardMode] = useState<'navigate' | 'manipulate' | 'create'>('navigate')
  
  const {
    canvas,
    canvasState,
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
    setSelectedObject,
    selectedObjectId,
    undo,
    redo,
    history,
    historyStep,
  } = useCanvasStore()
  
  // Compute undo/redo availability
  const canUndo = historyStep > 0
  const canRedo = historyStep < history.length - 1

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

    // Add comprehensive accessibility features to canvas
    fabricCanvas.upperCanvasEl.setAttribute('role', 'application')
    fabricCanvas.upperCanvasEl.setAttribute('tabindex', '0')
    fabricCanvas.upperCanvasEl.setAttribute('aria-label', 'Interactive design canvas')
    fabricCanvas.upperCanvasEl.setAttribute('aria-describedby', 'canvas-instructions canvas-status')
    fabricCanvas.upperCanvasEl.setAttribute('aria-live', 'polite')
    fabricCanvas.upperCanvasEl.setAttribute('aria-atomic', 'false')
    
    // Canvas selection handlers for accessibility  
    const handleSelectionCreated = (e: any) => {
      const obj = e.selected?.[0]
      if (obj) {
        const type = obj.type || 'object'
        const left = Math.round(obj.left || 0)
        const top = Math.round(obj.top || 0)
        let description = `${type} at position ${left}, ${top}`
        
        if (obj.type === 'text' || obj.type === 'textbox') {
          const textContent = (obj as any).text || (obj.properties as any)?.text || ''
          description = `text "${textContent}" at position ${left}, ${top}`
        }
        
        setAnnouncement(`Selected ${description}`)
        const objects = fabricCanvas.getObjects()
        const index = objects.indexOf(obj)
        setFocusedObjectIndex(index)
      }
    }
    
    const handleSelectionUpdated = (e: any) => {
      const obj = e.selected?.[0]
      if (obj) {
        const type = obj.type || 'object'
        const left = Math.round(obj.left || 0)
        const top = Math.round(obj.top || 0)
        let description = `${type} at position ${left}, ${top}`
        
        if (obj.type === 'text' || obj.type === 'textbox') {
          const textContent = (obj as any).text || (obj.properties as any)?.text || ''
          description = `text "${textContent}" at position ${left}, ${top}`
        }
        
        setAnnouncement(`Selected ${description}`)
        const objects = fabricCanvas.getObjects()
        const index = objects.indexOf(obj)
        setFocusedObjectIndex(index)
      }
    }
    
    const handleSelectionCleared = () => {
      setAnnouncement('Selection cleared')
      setFocusedObjectIndex(-1)
    }
    
    const handleObjectModified = (e: any) => {
      const obj = e.target
      if (obj) {
        const type = obj.type || 'object'
        const left = Math.round(obj.left || 0)
        const top = Math.round(obj.top || 0)
        let description = `${type} at position ${left}, ${top}`
        
        if (obj.type === 'text' || obj.type === 'textbox') {
          const textContent = (obj as any).text || (obj.properties as any)?.text || ''
          description = `text "${textContent}" at position ${left}, ${top}`
        }
        
        setAnnouncement(`Modified ${description}`)
      }
    }
    
    fabricCanvas.on('selection:created', handleSelectionCreated)
    fabricCanvas.on('selection:updated', handleSelectionUpdated)
    fabricCanvas.on('selection:cleared', handleSelectionCleared)
    fabricCanvas.on('object:modified', handleObjectModified)

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
      fabricCanvas.off('selection:created', handleSelectionCreated)
      fabricCanvas.off('selection:updated', handleSelectionUpdated)
      fabricCanvas.off('selection:cleared', handleSelectionCleared)
      fabricCanvas.off('object:modified', handleObjectModified)
      fabricCanvas.dispose()
      cleanup()
    }
  }, [canvas, setCanvas, optimizeForDevice, initialize, cleanup, isMobile, isInitialized])

  // Accessibility helper functions
  const getObjectDescription = useCallback((obj: fabric.Object): string => {
    const objWithId = obj as any
    const type = obj.type || 'object'
    const left = Math.round(obj.left || 0)
    const top = Math.round(obj.top || 0)
    
    let description = `${type} at position ${left}, ${top}`
    
    if (obj.type === 'text' || obj.type === 'textbox') {
      const textObj = obj as fabric.Text
      description = `text "${textObj.text}" at position ${left}, ${top}`
    } else if (obj.type === 'image') {
      description = `image at position ${left}, ${top}`
    } else if (obj.type === 'rect') {
      description = `rectangle at position ${left}, ${top}`
    } else if (obj.type === 'circle') {
      description = `circle at position ${left}, ${top}`
    }
    
    return description
  }, [])
  
  const announceToScreenReader = useCallback((message: string) => {
    setAnnouncement(message)
    // Clear after announcement to allow repeat announcements
    setTimeout(() => setAnnouncement(''), 100)
  }, [])
  
  const updateFocusedObject = useCallback((obj: fabric.Object) => {
    if (!canvas) {
      return
    }
    const objects = canvas.getObjects()
    const index = objects.indexOf(obj)
    setFocusedObjectIndex(index)
  }, [canvas])
  
  const getCanvasDescription = useCallback((): string => {
    if (!canvasState || !canvasState.objects) {
      return 'Empty canvas, 800 by 800 pixels'
    }
    
    const objectCount = canvasState.objects.length
    const descriptions = canvasState.objects.map(obj => {
      const type = obj.type || 'object'
      if (obj.type === 'text' && (obj.properties as any)?.text) {
        return `text "${(obj.properties as any).text}"`
      }
      return type
    })
    
    if (objectCount === 0) {
      return 'Empty canvas, 800 by 800 pixels'
    } else if (objectCount === 1) {
      return `Canvas with 1 ${descriptions[0]}, 800 by 800 pixels`
    } else {
      return `Canvas with ${objectCount} objects: ${descriptions.join(', ')}, 800 by 800 pixels`
    }
  }, [canvasState])
  
  // Enhanced keyboard navigation and tool control
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!canvas) {
      return
    }
    
    const objects = canvas.getObjects()
    const activeObject = canvas.getActiveObject()
    
    // Handle modifier key combinations first
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            if (canRedo) {
              redo()
              announceToScreenReader('Redid last action')
            } else {
              announceToScreenReader('Nothing to redo')
            }
          } else {
            if (canUndo) {
              undo()
              announceToScreenReader('Undid last action')
            } else {
              announceToScreenReader('Nothing to undo')
            }
          }
          return
        case 'a':
          e.preventDefault()
          if (objects.length > 0) {
            const selection = new fabric.ActiveSelection(objects, {
              canvas: canvas,
            })
            canvas.setActiveObject(selection)
            canvas.renderAll()
            announceToScreenReader(`Selected all ${objects.length} objects`)
          }
          return
        case 'c':
          e.preventDefault()
          if (activeObject) {
            // Store object for paste (simplified - in real app would use clipboard)
            (window as any).copiedObject = activeObject.toObject()
            announceToScreenReader('Copied object')
          }
          return
        case 'v':
          e.preventDefault()
          if ((window as any).copiedObject) {
            fabric.util.enlivenObjects([(window as any).copiedObject]).then((objects: any[]) => {
              const newObj = objects[0]
              newObj.set({
                left: (newObj.left || 0) + 20,
                top: (newObj.top || 0) + 20,
              })
              canvas.add(newObj)
              canvas.setActiveObject(newObj)
              canvas.renderAll()
              announceToScreenReader('Pasted object')
            })
          }
          return
        case 'd':
          e.preventDefault()
          if (activeObject) {
            // Fabric.js v6 clone API - use async clone method
            activeObject.clone().then((cloned: any) => {
              cloned.set({
                left: (cloned.left || 0) + 20,
                top: (cloned.top || 0) + 20,
              })
              canvas.add(cloned)
              canvas.setActiveObject(cloned)
              canvas.renderAll()
              announceToScreenReader('Duplicated object')
            })
          }
          return
        case '=':
        case '+':
          e.preventDefault()
          const newZoom = Math.min(zoom * 1.2, 5)
          setZoom(newZoom)
          announceToScreenReader(`Zoomed in to ${Math.round(newZoom * 100)}%`)
          return
        case '-':
          e.preventDefault()
          const reducedZoom = Math.max(zoom * 0.8, 0.1)
          setZoom(reducedZoom)
          announceToScreenReader(`Zoomed out to ${Math.round(reducedZoom * 100)}%`)
          return
        case '0':
          e.preventDefault()
          setZoom(1)
          announceToScreenReader('Reset zoom to 100%')
          return
      }
    }
    
    // Tool selection shortcuts (numbers)
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      switch (e.key) {
        case '1':
          e.preventDefault()
          setCurrentTool('select')
          announceToScreenReader('Select tool activated')
          return
        case '2':
          e.preventDefault()
          setCurrentTool('rectangle')
          announceToScreenReader('Rectangle tool activated. Press Enter to create rectangle')
          return
        case '3':
          e.preventDefault()
          setCurrentTool('circle')
          announceToScreenReader('Circle tool activated. Press Enter to create circle')
          return
        case '4':
          e.preventDefault()
          setCurrentTool('text')
          announceToScreenReader('Text tool activated. Press Enter to create text')
          return
        case '5':
          e.preventDefault()
          setCurrentTool('line')
          announceToScreenReader('Line tool activated. Press Enter to create line')
          return
      }
    }
    
    // Navigation and object manipulation
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        if (keyboardMode === 'manipulate' && activeObject && !e.shiftKey) {
          // Move object
          const step = e.ctrlKey ? 1 : 10
          if (e.key === 'ArrowDown') {
            activeObject.set({ top: (activeObject.top || 0) + step })
          } else {
            activeObject.set({ left: (activeObject.left || 0) + step })
          }
          canvas.renderAll()
          const description = getObjectDescription(activeObject)
          announceToScreenReader(`Moved ${description}`)
        } else if (keyboardMode === 'manipulate' && activeObject && e.shiftKey) {
          // Resize object
          const scale = activeObject.scaleX || 1
          const newScale = Math.min(scale * 1.1, 5)
          activeObject.set({ scaleX: newScale, scaleY: newScale })
          canvas.renderAll()
          announceToScreenReader(`Resized object to ${Math.round(newScale * 100)}%`)
        } else {
          // Navigate between objects
          if (objects.length === 0) { return }
          if (focusedObjectIndex < objects.length - 1) {
            const nextIndex = focusedObjectIndex + 1
            const nextObject = objects[nextIndex]
            canvas.setActiveObject(nextObject)
            setFocusedObjectIndex(nextIndex)
            const description = getObjectDescription(nextObject)
            announceToScreenReader(`Focused on ${description}. Press M to manipulate, N to navigate`)
          } else {
            const firstObject = objects[0]
            canvas.setActiveObject(firstObject)
            setFocusedObjectIndex(0)
            const description = getObjectDescription(firstObject)
            announceToScreenReader(`Focused on ${description}. Press M to manipulate, N to navigate`)
          }
          canvas.renderAll()
        }
        break
        
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        if (keyboardMode === 'manipulate' && activeObject && !e.shiftKey) {
          // Move object
          const step = e.ctrlKey ? 1 : 10
          if (e.key === 'ArrowUp') {
            activeObject.set({ top: (activeObject.top || 0) - step })
          } else {
            activeObject.set({ left: (activeObject.left || 0) - step })
          }
          canvas.renderAll()
          const description = getObjectDescription(activeObject)
          announceToScreenReader(`Moved ${description}`)
        } else if (keyboardMode === 'manipulate' && activeObject && e.shiftKey) {
          // Resize object
          const scale = activeObject.scaleX || 1
          const newScale = Math.max(scale * 0.9, 0.1)
          activeObject.set({ scaleX: newScale, scaleY: newScale })
          canvas.renderAll()
          announceToScreenReader(`Resized object to ${Math.round(newScale * 100)}%`)
        } else {
          // Navigate between objects
          if (objects.length === 0) { return }
          if (focusedObjectIndex > 0) {
            const prevIndex = focusedObjectIndex - 1
            const prevObject = objects[prevIndex]
            canvas.setActiveObject(prevObject)
            setFocusedObjectIndex(prevIndex)
            const description = getObjectDescription(prevObject)
            announceToScreenReader(`Focused on ${description}. Press M to manipulate, N to navigate`)
          } else {
            const lastIndex = objects.length - 1
            const lastObject = objects[lastIndex]
            canvas.setActiveObject(lastObject)
            setFocusedObjectIndex(lastIndex)
            const description = getObjectDescription(lastObject)
            announceToScreenReader(`Focused on ${description}. Press M to manipulate, N to navigate`)
          }
          canvas.renderAll()
        }
        break
        
      case 'Enter':
        e.preventDefault()
        if (currentTool !== 'select' && keyboardMode === 'create') {
          // Create new object
          const centerX = canvas.width! / 2
          const centerY = canvas.height! / 2
          let newObject: fabric.Object
          
          switch (currentTool) {
            case 'rectangle':
              newObject = new fabric.Rect({
                left: centerX - 50,
                top: centerY - 25,
                width: 100,
                height: 50,
                fill: '#3b82f6',
                stroke: '#1d4ed8',
                strokeWidth: 2,
              })
              break
            case 'circle':
              newObject = new fabric.Circle({
                left: centerX - 25,
                top: centerY - 25,
                radius: 25,
                fill: '#10b981',
                stroke: '#059669',
                strokeWidth: 2,
              })
              break
            case 'text':
              newObject = new fabric.Text('New Text', {
                left: centerX - 40,
                top: centerY - 10,
                fontSize: 20,
                fill: '#1f2937',
              })
              break
            case 'line':
              newObject = new fabric.Line([centerX - 50, centerY, centerX + 50, centerY], {
                stroke: '#ef4444',
                strokeWidth: 3,
              })
              break
            default:
              return
          }
          
          canvas.add(newObject)
          canvas.setActiveObject(newObject)
          canvas.renderAll()
          setFocusedObjectIndex(objects.length)
          const description = getObjectDescription(newObject)
          announceToScreenReader(`Created ${description}`)
        } else if (focusedObjectIndex >= 0 && focusedObjectIndex < objects.length) {
          const object = objects[focusedObjectIndex]
          const description = getObjectDescription(object)
          announceToScreenReader(`Selected ${description}`)
          setSelectedObject((object as any).id)
        }
        break
        
      case ' ':
        e.preventDefault()
        if (focusedObjectIndex >= 0 && focusedObjectIndex < objects.length) {
          const object = objects[focusedObjectIndex]
          const description = getObjectDescription(object)
          announceToScreenReader(`Activated ${description}`)
        }
        break
        
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        if (activeObject) {
          const description = getObjectDescription(activeObject)
          canvas.remove(activeObject)
          setFocusedObjectIndex(-1)
          announceToScreenReader(`Deleted ${description}`)
        }
        break
        
      case 'Escape':
        e.preventDefault()
        canvas.discardActiveObject()
        canvas.renderAll()
        setFocusedObjectIndex(-1)
        setKeyboardMode('navigate')
        announceToScreenReader('Selection cleared, navigation mode')
        break
        
      case 'm':
      case 'M':
        e.preventDefault()
        if (activeObject) {
          setKeyboardMode('manipulate')
          announceToScreenReader('Manipulation mode. Use arrow keys to move, Shift+arrows to resize')
        }
        break
        
      case 'n':
      case 'N':
        e.preventDefault()
        setKeyboardMode('navigate')
        announceToScreenReader('Navigation mode. Use arrow keys to move between objects')
        break
        
      case 'c':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          setKeyboardMode('create')
          announceToScreenReader(`Create mode. Current tool: ${currentTool}. Press Enter to create object`)
        }
        break
        
      case 'Tab':
        if (!e.shiftKey) {
          // Allow normal tab navigation
        }
        break
        
      case 'h':
      case 'H':
      case '?':
        e.preventDefault()
        announceToScreenReader('Keyboard shortcuts: 1-5 for tools, Ctrl+Z undo, Ctrl+Y redo, M manipulate, N navigate, C create, Enter to create/select, Delete to remove, Escape to clear')
        break
    }
  }, [canvas, focusedObjectIndex, getObjectDescription, announceToScreenReader, setSelectedObject, currentTool, keyboardMode, canUndo, canRedo, undo, redo, zoom, setZoom])

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
      data-testid="canvas-container"
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
      {/* Enhanced accessibility announcements */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>
      
      {/* Canvas status region */}
      <div
        id="canvas-status"
        className="sr-only"
        aria-live="polite"
        aria-atomic="false"
      >
        Mode: {keyboardMode}. Tool: {currentTool}. Objects: {canvasState?.objects?.length || 0}. Zoom: {Math.round(zoom * 100)}%.
      </div>
      
      {/* Comprehensive canvas instructions for screen readers */}
      <div className="sr-only">
        <h2>Canvas Editor - Interactive Design Tool</h2>
        <p>This is an interactive design canvas. You can create, select, and manipulate objects using comprehensive keyboard commands.</p>
        
        <h3>Tool Selection:</h3>
        <p>Press 1 for Select tool, 2 for Rectangle, 3 for Circle, 4 for Text, 5 for Line</p>
        
        <h3>Object Creation:</h3>
        <p>Select a tool (2-5), press C for create mode, then Enter to create object at center</p>
        
        <h3>Navigation Modes:</h3>
        <p>Press N for navigation mode - use arrow keys to move between objects</p>
        <p>Press M for manipulation mode - use arrow keys to move objects, Shift+arrows to resize</p>
        <p>Press C for create mode - press Enter to create objects with selected tool</p>
        
        <h3>Keyboard Shortcuts:</h3>
        <p>Ctrl+Z: Undo, Ctrl+Shift+Z: Redo, Ctrl+A: Select all, Ctrl+C: Copy, Ctrl+V: Paste, Ctrl+D: Duplicate</p>
        <p>Ctrl+Plus: Zoom in, Ctrl+Minus: Zoom out, Ctrl+0: Reset zoom</p>
        <p>Enter/Space: Select, Delete: Remove, Escape: Clear selection, H: Help</p>
      </div>
      
      <canvas
        ref={canvasRef}
        className="mx-auto my-auto block border border-gray-200 shadow-sm bg-white"
        aria-label={getCanvasDescription()}
        aria-describedby="canvas-instructions canvas-status"
        onKeyDown={handleKeyDown}
        style={{
          touchAction: 'none',
          userSelect: 'none',
        }}
      />
      
      {/* Detailed instructions for screen readers */}
      <div id="canvas-instructions" className="sr-only">
        <h3>Interactive Design Canvas</h3>
        <p>This canvas supports full keyboard navigation with comprehensive screen reader support.</p>
        
        <h4>Current Status:</h4>
        <p>Mode: {keyboardMode}, Tool: {currentTool}, Objects: {canvasState?.objects?.length || 0}</p>
        <p>Canvas state: {getCanvasDescription()}</p>
        
        <h4>Quick Start:</h4>
        <p>Press H for complete help, 1-5 to select tools, N to navigate, M to manipulate, C to create</p>
        
        <h4>Navigation Modes:</h4>
        <p>Navigate mode (N): Move between objects with arrow keys, objects announced when focused</p>
        <p>Manipulate mode (M): Move selected object with arrows, resize with Shift+arrows</p>
        <p>Create mode (C): Create new objects at canvas center with Enter key</p>
        
        <h4>Accessibility Features:</h4>
        <p>All actions are announced to screen readers with object descriptions and positions</p>
        <p>Canvas state changes are reported in real-time</p>
        <p>Comprehensive keyboard navigation eliminates need for mouse interaction</p>
      </div>
      
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