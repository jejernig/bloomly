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
    
    // Set up canvas event listeners
    canvas.on('object:added', store.saveToHistory)
    canvas.on('object:modified', store.saveToHistory)
    canvas.on('object:removed', store.saveToHistory)
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
        canvas.renderAll()
      }
    } else if (canvas) {
      canvas.discardActiveObject()
      canvas.renderAll()
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
          canvas.renderAll()
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
    canvas.renderAll()
    
    // Update state
    set(state => ({
      canvasState: {
        ...state.canvasState,
        objects: [...state.canvasState.objects, object]
      }
    }))
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
    
    canvas.renderAll()
    
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
      canvas.renderAll()
    }
    
    // Update state
    set(state => ({
      canvasState: {
        ...state.canvasState,
        objects: state.canvasState.objects.filter(obj => obj.id !== objectId)
      },
      selectedObjectId: state.selectedObjectId === objectId ? null : state.selectedObjectId
    }))
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
    
    canvas.renderAll()
  },
  
  // History operations
  saveToHistory: () => {
    const { canvasState, history, historyStep, maxHistorySteps } = get()
    
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
      canvas.renderAll()
    }
    set({ zoom })
  },
  
  setPan: (pan) => {
    const { canvas } = get()
    if (canvas) {
      canvas.relativePan(new fabric.Point(pan.x, pan.y))
      canvas.renderAll()
    }
    set({ pan })
  },
  
  resetView: () => {
    const { canvas } = get()
    if (canvas) {
      canvas.setZoom(1)
      canvas.absolutePan(new fabric.Point(0, 0))
      canvas.renderAll()
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
    canvas.renderAll()
    
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
    canvas.renderAll()
    
    set({ zoom: newZoom })
  },
  
  handlePanGesture: (delta) => {
    const { canvas } = get()
    if (!canvas) {
      return
    }
    
    canvas.relativePan(new fabric.Point(delta.x, delta.y))
    canvas.renderAll()
    
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
    
    canvas.renderAll()
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
    get().saveToHistory()
  },
  
  cleanup: () => {
    const { canvas } = get()
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
      canvas.renderAll()
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
      canvas.renderAll()
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