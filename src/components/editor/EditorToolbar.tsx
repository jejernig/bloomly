'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Share2, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Menu,
  Instagram
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EditorToolbarProps {
  isMobile?: boolean
  onToggleSidebar?: () => void
}

export function EditorToolbar({ isMobile = false, onToggleSidebar }: EditorToolbarProps) {
  const router = useRouter()
  const { 
    canvas, 
    zoom, 
    setZoom, 
    undo, 
    redo, 
    history, 
    historyStep,
    exportCanvas,
    resetView,
  } = useCanvasStore()

  const canUndo = historyStep > 0
  const canRedo = historyStep < history.length - 1

  const handleSave = async () => {
    try {
      // In a real app, this would save to the database
      toast.success('Project saved!')
    } catch (error) {
      toast.error('Failed to save project')
    }
  }

  const handleExport = async () => {
    try {
      const dataURL = await exportCanvas('png', 0.9)
      
      // Create download link
      const link = document.createElement('a')
      link.download = `bloomly-io-post-${Date.now()}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Image downloaded!')
    } catch (error) {
      toast.error('Failed to export image')
    }
  }

  const handlePublishToInstagram = async () => {
    try {
      // In a real app, this would publish to Instagram via the API
      toast.success('Publishing to Instagram...')
    } catch (error) {
      toast.error('Failed to publish to Instagram')
    }
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5)
    setZoom(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1)
    setZoom(newZoom)
  }

  if (isMobile) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Center */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
            >
              <Save className="h-4 w-4" />
            </Button>
            
            <Button
              variant="gradient"
              size="sm"
              onClick={handlePublishToInstagram}
            >
              <Instagram className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Desktop toolbar
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Center - Zoom Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetView}
            className="min-w-[80px]"
          >
            {Math.round(zoom * 100)}%
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast('Share feature coming soon!')}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button
            variant="gradient"
            size="sm"
            onClick={handlePublishToInstagram}
          >
            <Instagram className="mr-2 h-4 w-4" />
            Publish to Instagram
          </Button>
        </div>
      </div>
    </div>
  )
}