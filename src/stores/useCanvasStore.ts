import { create } from 'zustand'
import * as fabric from 'fabric'
import { CanvasState, CanvasObject, Point, TouchGesture } from '@/types'

interface CanvasStore {
  // Canvas instance and state
  canvas: fabric.Canvas | null
  canvasState: CanvasState
  selectedObjectId: string | null
  selectedObjectIds: string[]
  isMultiSelecting: boolean
  
  // History management
  history: CanvasState[]
  historyStep: number
  maxHistorySteps: number
  isHistoryDisabled: boolean
  
  // Debouncing for performance
  historySaveTimeout: NodeJS.Timeout | null
  renderTimeout: NodeJS.Timeout | null
  lastRenderTime: number
  renderingThrottled: boolean
  
  // UI state
  zoom: number
  pan: Point
  isLoading: boolean
  error: string | null
  
  // Mobile touch state
  touchGesture: TouchGesture | null
  deviceProfile: 'high' | 'medium' | 'low'
  
  // Actions
  setCanvas: (canvas: fabric.Canvas) => void
  updateCanvasState: (state: Partial<CanvasState>) => void
  setSelectedObject: (objectId: string | null) => void
  
  // Canvas operations
  addObject: (object: CanvasObject) => void
  updateObject: (objectId: string, updates: Partial<CanvasObject>) => void
  deleteObject: (objectId: string) => void
  duplicateObject: (objectId: string) => void
  moveObject: (objectId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void
  
  // Multi-selection operations
  selectMultiple: (objectIds: string[]) => void
  addToSelection: (objectId: string) => void
  removeFromSelection: (objectId: string) => void
  clearSelection: () => void
  deleteSelected: () => void
  duplicateSelected: () => void
  groupSelected: () => void
  ungroupSelected: () => void
  
  // History operations
  saveToHistory: () => void
  saveToHistoryDebounced: () => void
  undo: () => void
  redo: () => void
  clearHistory: () => void
  
  // Canvas controls
  setZoom: (zoom: number) => void
  setPan: (pan: Point) => void
  resetView: () => void
  fitToScreen: () => void
  
  // Mobile optimizations
  setTouchGesture: (gesture: TouchGesture | null) => void
  handlePinchZoom: (scale: number, center: Point) => void
  handlePanGesture: (delta: Point) => void
  optimizeForDevice: () => void
  
  // Performance optimizations
  optimizeForObjectCount: () => void
  throttledRender: () => void
  enableVirtualization: () => void
  disableVirtualization: () => void
  
  // Template and project operations
  loadTemplate: (templateData: CanvasState) => void
  loadProject: (projectData: CanvasState) => void
  exportCanvas: (format: 'png' | 'jpg' | 'svg', quality?: number) => Promise<string>
  
  // Utility functions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initialize: () => void
  cleanup: () => void
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  // Initial state
  canvas: null,
  canvasState: {
    width: 1080,
    height: 1080,
    backgroundColor: '#ffffff',
    objects: [],
    version: '1.0',
  },
  selectedObjectId: null,
  selectedObjectIds: [],
  isMultiSelecting: false,
  
  // History
  history: [],
  historyStep: -1,
  maxHistorySteps: 20,
  isHistoryDisabled: false,
  historySaveTimeout: null,
  renderTimeout: null,
  lastRenderTime: 0,
  renderingThrottled: false,
  
  // UI state
  zoom: 1,
  pan: { x: 0, y: 0 },
  isLoading: false,
  error: null,
  
  // Mobile touch
  touchGesture: null,
  deviceProfile: 'medium',
  
  // Actions
  setCanvas: (canvas) => {
    const store = get()
    if (store.canvas) {
      // Clean up existing canvas event listeners
      store.canvas.off()
    }
    
    // Set up canvas event listeners with debounced history saving
    canvas.on('object:added', store.saveToHistoryDebounced)
    canvas.on('object:modified', store.saveToHistoryDebounced)
    canvas.on('object:removed', store.saveToHistoryDebounced)
    canvas.on('selection:created', (e) => {
      const object = e.selected?.[0]
      if (object) {
        set({ selectedObjectId: (object as any).id || null })
      }
    })
    canvas.on('selection:cleared', () => {
      set({ selectedObjectId: null })
    })
    
    set({ canvas })
  },
  
  updateCanvasState: (updates) => {
    set(state => ({
      canvasState: { ...state.canvasState, ...updates }
    }))
  },
  
  setSelectedObject: (objectId) => {
    const { canvas } = get()
    if (canvas && objectId) {
      const object = canvas.getObjects().find(obj => (obj as any).id === objectId)
      if (object) {
        canvas.setActiveObject(object)
        get().throttledRender()
      }
    } else if (canvas) {
      canvas.discardActiveObject()
      get().throttledRender()
    }
    set({ selectedObjectId: objectId })
  },
  
  // Canvas operations
  addObject: (object) => {
    const { canvas, canvasState } = get()
    if (!canvas) {
      return
    }
    
    let fabricObject: fabric.Object
    
    switch (object.type) {
      case 'text':
        const textProps = object.properties as any
        fabricObject = new fabric.IText(textProps.text, {
          left: object.x,
          top: object.y,
          fontSize: textProps.fontSize,
          fontFamily: textProps.fontFamily,
          fill: textProps.color,
          textAlign: textProps.textAlign,
        })
        break
        
      case 'image':
        const imageProps = object.properties as any
        fabric.Image.fromURL(imageProps.src, {
          crossOrigin: 'anonymous'
        }).then((img) => {
          img.set({
            left: object.x,
            top: object.y,
            scaleX: object.width / (img.width || 1),
            scaleY: object.height / (img.height || 1),
          })
          ;(img as any).id = object.id
          canvas.add(img)
          get().throttledRender()
        }).catch((error) => {
          console.error('Failed to load image:', error)
        })
        return
        
      case 'shape':
        const shapeProps = object.properties as any
        if (shapeProps.shapeType === 'rectangle') {
          fabricObject = new fabric.Rect({
            left: object.x,
            top: object.y,
            width: object.width,
            height: object.height,
            fill: shapeProps.fill,
            stroke: shapeProps.stroke,
            strokeWidth: shapeProps.strokeWidth,
          })
        } else if (shapeProps.shapeType === 'circle') {
          fabricObject = new fabric.Circle({
            left: object.x,
            top: object.y,
            radius: Math.min(object.width, object.height) / 2,
            fill: shapeProps.fill,
            stroke: shapeProps.stroke,
            strokeWidth: shapeProps.strokeWidth,
          })
        } else {
          return // Unsupported shape type
        }
        break
        
      default:
        return // Unsupported object type
    }
    
    ;(fabricObject as any).set({
      id: object.id,
      selectable: !object.locked,
      opacity: object.opacity,
      angle: object.rotation,
    })
    
    canvas.add(fabricObject)
    get().throttledRender()
    
    // Update state
    set(state => ({
      canvasState: {
        ...state.canvasState,
        objects: [...state.canvasState.objects, object]
      }
    }))
    
    // Reoptimize for new object count
    get().optimizeForObjectCount()
  },
  
  updateObject: (objectId, updates) => {
    const { canvas, canvasState } = get()
    if (!canvas) {
      return
    }
    
    const fabricObject = canvas.getObjects().find(obj => (obj as any).id === objectId)
    if (!fabricObject) {
      return
    }
    
    // Apply updates to fabric object
    if (updates.x !== undefined) {
      fabricObject.set('left', updates.x)
    }
    if (updates.y !== undefined) {
      fabricObject.set('top', updates.y)
    }
    if (updates.width !== undefined) {
      fabricObject.set('scaleX', updates.width / fabricObject.width!)
    }
    if (updates.height !== undefined) {
      fabricObject.set('scaleY', updates.height / fabricObject.height!)
    }
    if (updates.rotation !== undefined) {
      fabricObject.set('angle', updates.rotation)
    }
    if (updates.opacity !== undefined) {
      fabricObject.set('opacity', updates.opacity)
    }
    if (updates.locked !== undefined) {
      fabricObject.set('selectable', !updates.locked)
    }
    if (updates.visible !== undefined) {
      fabricObject.set('visible', updates.visible)
    }
    
    get().throttledRender()
    
    // Update state
    const objectIndex = canvasState.objects.findIndex(obj => obj.id === objectId)
    if (objectIndex >= 0) {
      const updatedObjects = [...canvasState.objects]
      updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], ...updates }
      
      set(state => ({
        canvasState: {
          ...state.canvasState,
          objects: updatedObjects
        }
      }))
    }
  },
  
  deleteObject: (objectId) => {
    const { canvas, canvasState } = get()
    if (!canvas) {
      return
    }
    
    const fabricObject = canvas.getObjects().find(obj => (obj as any).id === objectId)
    if (fabricObject) {
      canvas.remove(fabricObject)
      get().throttledRender()
    }
    
    // Update state
    set(state => ({
      canvasState: {
        ...state.canvasState,
        objects: state.canvasState.objects.filter(obj => obj.id !== objectId)
      },
      selectedObjectId: state.selectedObjectId === objectId ? null : state.selectedObjectId
    }))
    
    // Reoptimize for new object count
    get().optimizeForObjectCount()
  },
  
  duplicateObject: (objectId) => {
    const { canvasState } = get()
    const object = canvasState.objects.find(obj => obj.id === objectId)
    if (!object) {
      return
    }
    
    const duplicatedObject = {
      ...object,
      id: `${object.id}-copy-${Date.now()}`,
      x: object.x + 20,
      y: object.y + 20,
    }
    
    get().addObject(duplicatedObject)
  },
  
  moveObject: (objectId, direction) => {
    const { canvas } = get()
    if (!canvas) {
      return
    }
    
    const object = canvas.getObjects().find(obj => (obj as any).id === objectId)
    if (!object) {
      return
    }
    
    switch (direction) {
      case 'up':
        canvas.bringObjectForward(object)
        break
      case 'down':
        canvas.sendObjectBackwards(object)
        break
      case 'top':
        canvas.bringObjectToFront(object)
        break
      case 'bottom':
        canvas.sendObjectToBack(object)
        break
    }
    
    get().throttledRender()
  },
  
  // History operations
  saveToHistory: () => {
    const { canvasState, history, historyStep, maxHistorySteps, isHistoryDisabled } = get()
    
    if (isHistoryDisabled) {
      return
    }
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyStep + 1)
    
    // Add current state to history
    newHistory.push({ ...canvasState })
    
    // Limit history size
    if (newHistory.length > maxHistorySteps) {
      newHistory.shift()
    }
    
    set({
      history: newHistory,
      historyStep: newHistory.length - 1,
    })
  },
  
  saveToHistoryDebounced: () => {
    const { historySaveTimeout, isHistoryDisabled } = get()
    
    if (isHistoryDisabled) {
      return
    }
    
    // Clear existing timeout
    if (historySaveTimeout) {
      clearTimeout(historySaveTimeout)
    }
    
    // Set new timeout - save history after 500ms of no activity
    const newTimeout = setTimeout(() => {
      get().saveToHistory()
      set({ historySaveTimeout: null })
    }, 500)
    
    set({ historySaveTimeout: newTimeout })
  },
  
  undo: () => {
    const { history, historyStep } = get()
    if (historyStep > 0) {
      const previousState = history[historyStep - 1]
      set({
        canvasState: previousState,
        historyStep: historyStep - 1,
      })
      
      // Apply state to canvas
      get().loadProject(previousState)
    }
  },
  
  redo: () => {
    const { history, historyStep } = get()
    if (historyStep < history.length - 1) {
      const nextState = history[historyStep + 1]
      set({
        canvasState: nextState,
        historyStep: historyStep + 1,
      })
      
      // Apply state to canvas
      get().loadProject(nextState)
    }
  },
  
  clearHistory: () => {
    set({
      history: [],
      historyStep: -1,
    })
  },
  
  // Canvas controls
  setZoom: (zoom) => {
    const { canvas } = get()
    if (canvas) {
      canvas.setZoom(zoom)
      get().throttledRender()
    }
    set({ zoom })
  },
  
  setPan: (pan) => {
    const { canvas } = get()
    if (canvas) {
      canvas.relativePan(new fabric.Point(pan.x, pan.y))
      get().throttledRender()
    }
    set({ pan })
  },
  
  resetView: () => {
    const { canvas } = get()
    if (canvas) {
      canvas.setZoom(1)
      canvas.absolutePan(new fabric.Point(0, 0))
      get().throttledRender()
    }
    set({ zoom: 1, pan: { x: 0, y: 0 } })
  },
  
  fitToScreen: () => {
    const { canvas, canvasState } = get()
    if (!canvas) {
      return
    }
    
    const containerWidth = canvas.getWidth()
    const containerHeight = canvas.getHeight()
    const canvasWidth = canvasState.width
    const canvasHeight = canvasState.height
    
    const scaleX = containerWidth / canvasWidth
    const scaleY = containerHeight / canvasHeight
    const scale = Math.min(scaleX, scaleY) * 0.9 // Leave some margin
    
    canvas.setZoom(scale)
    canvas.centerObject(canvas as any) // Center the viewport
    get().throttledRender()
    
    set({ zoom: scale })
  },
  
  // Mobile optimizations
  setTouchGesture: (gesture) => set({ touchGesture: gesture }),
  
  handlePinchZoom: (scale, center) => {
    const { canvas, zoom } = get()
    if (!canvas) {
      return
    }
    
    const newZoom = Math.max(0.1, Math.min(5, zoom * scale))
    canvas.zoomToPoint(new fabric.Point(center.x, center.y), newZoom)
    get().throttledRender()
    
    set({ zoom: newZoom })
  },
  
  handlePanGesture: (delta) => {
    const { canvas } = get()
    if (!canvas) {
      return
    }
    
    canvas.relativePan(new fabric.Point(delta.x, delta.y))
    get().throttledRender()
    
    set(state => ({
      pan: {
        x: state.pan.x + delta.x,
        y: state.pan.y + delta.y,
      }
    }))
  },
  
  optimizeForDevice: () => {
    const deviceMemory = (navigator as any).deviceMemory || 4
    const hardwareConcurrency = navigator.hardwareConcurrency || 2
    
    let deviceProfile: 'high' | 'medium' | 'low' = 'medium'
    
    if (deviceMemory >= 8 && hardwareConcurrency >= 4) {
      deviceProfile = 'high'
    } else if (deviceMemory >= 4 && hardwareConcurrency >= 2) {
      deviceProfile = 'medium'
    } else {
      deviceProfile = 'low'
    }
    
    const { canvas } = get()
    if (canvas) {
      // Apply performance settings based on device profile
      if (deviceProfile === 'low') {
        canvas.renderOnAddRemove = false
        canvas.skipTargetFind = true
      } else if (deviceProfile === 'medium') {
        canvas.renderOnAddRemove = true
        canvas.skipTargetFind = false
      } else {
        canvas.renderOnAddRemove = true
        canvas.skipTargetFind = false
        canvas.imageSmoothingEnabled = true
      }
    }
    
    set({ deviceProfile })
  },
  
  // Template and project operations
  loadTemplate: (templateData) => {
    const { canvas } = get()
    if (!canvas) {
      return
    }
    
    // Clear existing objects
    canvas.clear()
    
    // Set canvas background
    canvas.backgroundColor = templateData.backgroundColor
    
    // Load template data
    set({ canvasState: templateData })
    
    // Add objects to canvas
    templateData.objects.forEach(obj => {
      get().addObject(obj)
    })
    
    get().throttledRender()
    get().saveToHistory()
  },
  
  loadProject: (projectData) => {
    get().loadTemplate(projectData) // Same as template loading
  },
  
  exportCanvas: async (format = 'png', quality = 0.9) => {
    const { canvas } = get()
    if (!canvas) {
      throw new Error('No canvas instance')
    }
    
    return new Promise<string>((resolve, reject) => {
      try {
        if (format === 'svg') {
          // For SVG export, use toSVG method
          const svgString = canvas.toSVG()
          const dataURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)
          resolve(dataURL)
        } else {
          // For PNG/JPEG, use toDataURL
          const imageFormat = format === 'jpg' ? 'jpeg' : format
          const dataURL = canvas.toDataURL({
            format: imageFormat as 'png' | 'jpeg',
            quality,
            multiplier: 1,
          })
          resolve(dataURL)
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  
  // Utility functions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  initialize: () => {
    get().optimizeForDevice()
    get().optimizeForObjectCount()
    get().saveToHistory()
  },
  
  // Performance optimizations for 50+ objects
  optimizeForObjectCount: () => {
    const { canvas, canvasState, deviceProfile } = get()
    if (!canvas) {
      return
    }
    
    const objectCount = canvasState.objects.length
    
    // Apply aggressive optimizations for 50+ objects
    if (objectCount >= 50) {
      canvas.renderOnAddRemove = false
      canvas.skipTargetFind = true
      canvas.imageSmoothingEnabled = false
      canvas.allowTouchScrolling = false
      canvas.selection = false // Disable multi-selection for performance
      set({ renderingThrottled: true })
      
      // Additional optimizations for very large object counts
      if (objectCount >= 100) {
        canvas.perPixelTargetFind = false
        canvas.targetFindTolerance = 10 // Increase hit detection tolerance
        
        // Disable animations and transitions
        if ((canvas as any).fxCenterObjectH) {
          (canvas as any).fxCenterObjectH = null
        }
      }
    } else if (objectCount >= 20) {
      // Moderate optimizations for 20-49 objects
      canvas.renderOnAddRemove = deviceProfile === 'high'
      canvas.skipTargetFind = deviceProfile === 'low'
      canvas.imageSmoothingEnabled = deviceProfile === 'high'
      set({ renderingThrottled: deviceProfile !== 'high' })
    } else {
      // Enable full features for < 20 objects
      canvas.renderOnAddRemove = true
      canvas.skipTargetFind = false
      canvas.imageSmoothingEnabled = true
      canvas.selection = true
      canvas.allowTouchScrolling = true
      set({ renderingThrottled: false })
    }
  },
  
  throttledRender: () => {
    const { canvas, renderTimeout, renderingThrottled, lastRenderTime } = get()
    if (!canvas || !renderingThrottled) {
      canvas?.renderAll()
      return
    }
    
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime
    
    // If enough time has passed, render immediately
    if (timeSinceLastRender >= 16) { // ~60fps
      get().throttledRender()
      set({ lastRenderTime: now })
      return
    }
    
    // Otherwise, schedule a render
    if (renderTimeout) {
      clearTimeout(renderTimeout)
    }
    
    const timeout = setTimeout(() => {
      get().throttledRender()
      set({ 
        lastRenderTime: Date.now(),
        renderTimeout: null 
      })
    }, 16 - timeSinceLastRender)
    
    set({ renderTimeout: timeout })
  },
  
  enableVirtualization: () => {
    const { canvas, canvasState, zoom } = get()
    if (!canvas) {
      return
    }
    
    // Simple object culling based on viewport
    const vpt = canvas.viewportTransform
    if (!vpt) {
      return
    }
    
    const canvasWidth = canvas.getWidth() / zoom
    const canvasHeight = canvas.getHeight() / zoom
    const viewportLeft = -vpt[4] / zoom
    const viewportTop = -vpt[5] / zoom
    
    canvasState.objects.forEach(obj => {
      const fabricObj = canvas.getObjects().find(fObj => (fObj as any).id === obj.id)
      if (!fabricObj) {
        return
      }
      
      // Hide objects outside viewport (with some margin for performance)
      const margin = 100
      const isVisible = 
        obj.x + obj.width >= viewportLeft - margin &&
        obj.x <= viewportLeft + canvasWidth + margin &&
        obj.y + obj.height >= viewportTop - margin &&
        obj.y <= viewportTop + canvasHeight + margin
      
      fabricObj.visible = isVisible
    })
    
    get().throttledRender()
  },
  
  disableVirtualization: () => {
    const { canvas, canvasState } = get()
    if (!canvas) {
      return
    }
    
    // Make all objects visible
    canvasState.objects.forEach(obj => {
      const fabricObj = canvas.getObjects().find(fObj => (fObj as any).id === obj.id)
      if (fabricObj) {
        fabricObj.visible = obj.visible // Restore original visibility
      }
    })
    
    get().throttledRender()
  },
  
  cleanup: () => {
    const { canvas, historySaveTimeout, renderTimeout } = get()
    
    // Clear timeouts if they exist
    if (historySaveTimeout) {
      clearTimeout(historySaveTimeout)
    }
    if (renderTimeout) {
      clearTimeout(renderTimeout)
    }
    
    if (canvas) {
      canvas.off()
      canvas.dispose()
    }
    
    set({
      canvas: null,
      selectedObjectId: null,
      selectedObjectIds: [],
      history: [],
      historyStep: -1,
      historySaveTimeout: null,
      renderTimeout: null,
      lastRenderTime: 0,
      renderingThrottled: false,
      error: null,
    })
  },
  
  // Multi-selection operations
  selectMultiple: (objectIds) => {
    const { canvas } = get()
    if (!canvas) {return}
    
    const objects = canvas.getObjects().filter(obj => 
      objectIds.includes((obj as any).id)
    )
    
    if (objects.length > 0) {
      const activeSelection = new fabric.ActiveSelection(objects, { canvas })
      canvas.setActiveObject(activeSelection)
      get().throttledRender()
    }
    
    set({ 
      selectedObjectIds: objectIds,
      selectedObjectId: objectIds.length === 1 ? objectIds[0] : null,
      isMultiSelecting: objectIds.length > 1 
    })
  },
  
  addToSelection: (objectId) => {
    const { selectedObjectIds } = get()
    const newSelection = [...selectedObjectIds, objectId]
    get().selectMultiple(newSelection)
  },
  
  removeFromSelection: (objectId) => {
    const { selectedObjectIds } = get()
    const newSelection = selectedObjectIds.filter(id => id !== objectId)
    if (newSelection.length > 0) {
      get().selectMultiple(newSelection)
    } else {
      get().clearSelection()
    }
  },
  
  clearSelection: () => {
    const { canvas } = get()
    if (canvas) {
      canvas.discardActiveObject()
      get().throttledRender()
    }
    set({ 
      selectedObjectIds: [], 
      selectedObjectId: null, 
      isMultiSelecting: false 
    })
  },
  
  deleteSelected: () => {
    const { selectedObjectIds } = get()
    selectedObjectIds.forEach(id => {
      get().deleteObject(id)
    })
    get().clearSelection()
  },
  
  duplicateSelected: () => {
    const { selectedObjectIds } = get()
    const newIds: string[] = []
    
    selectedObjectIds.forEach(id => {
      const original = get().canvasState.objects.find(obj => obj.id === id)
      if (original) {
        const newId = `${id}-copy-${Date.now()}`
        const duplicated = {
          ...original,
          id: newId,
          x: original.x + 20,
          y: original.y + 20,
        }
        get().addObject(duplicated)
        newIds.push(newId)
      }
    })
    
    // Select the duplicated objects
    if (newIds.length > 0) {
      setTimeout(() => get().selectMultiple(newIds), 100)
    }
  },
  
  groupSelected: () => {
    // TODO: Implement grouping functionality
    // eslint-disable-next-line no-console
    console.log('Group selected objects')
  },
  
  ungroupSelected: () => {
    // TODO: Implement ungrouping functionality  
    // eslint-disable-next-line no-console
    console.log('Ungroup selected objects')
  },
}))

// Auto-save functionality
let autoSaveTimer: NodeJS.Timeout | null = null

export const startAutoSave = (callback: () => void, interval = 30000) => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
  
  autoSaveTimer = setInterval(() => {
    const { canvasState } = useCanvasStore.getState()
    if (canvasState.objects.length > 0) {
      callback()
    }
  }, interval)
}

export const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}