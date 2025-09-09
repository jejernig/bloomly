'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { CanvasEditor } from '@/components/canvas/CanvasEditor'
import { EditorSidebar } from '@/components/editor/EditorSidebar'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { MobileEditorLayout } from '@/components/editor/MobileEditorLayout'
import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { Project, Template } from '@/types'
import { toast } from 'react-hot-toast'

export default function EditorPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const { canvas, isLoading: canvasLoading, loadTemplate, loadProject } = useCanvasStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const templateId = searchParams.get('template')
  const projectId = searchParams.get('project')

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  // Load template data
  const { data: template, isLoading: templateLoading } = useQuery<Template | null>({
    queryKey: ['template', templateId],
    queryFn: () => templateId ? db.getTemplate(templateId) : null,
    enabled: !!templateId,
  })

  // Load project data
  const { data: project, isLoading: projectLoading } = useQuery<Project | null>({
    queryKey: ['project', projectId],
    queryFn: () => projectId && user ? db.getProject(projectId, user.id) : null,
    enabled: !!projectId && !!user,
  })

  // Load template or project into canvas
  useEffect(() => {
    if (canvas && template && !templateLoading) {
      try {
        loadTemplate(template.canvasData)
        toast.success('Template loaded successfully')
      } catch (error) {
        console.error('Error loading template:', error)
        toast.error('Failed to load template')
      }
    }
  }, [canvas, template, templateLoading, loadTemplate])

  useEffect(() => {
    if (canvas && project && !projectLoading) {
      try {
        loadProject(project.canvasData)
        toast.success('Project loaded successfully')
      } catch (error) {
        console.error('Error loading project:', error)
        toast.error('Failed to load project')
      }
    }
  }, [canvas, project, projectLoading, loadProject])

  if (authLoading || templateLoading || projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Authenticating...' : 
             templateLoading ? 'Loading template...' : 
             projectLoading ? 'Loading project...' : 
             'Loading editor...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Mobile layout
  if (isMobile) {
    return (
      <MobileEditorLayout
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        <div className="h-full flex flex-col">
          <EditorToolbar 
            isMobile={true}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <div className="flex-1 relative">
            <CanvasEditor 
              className="h-full w-full"
              isMobile={true}
            />
          </div>
        </div>
        
        <EditorSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={true}
        />
      </MobileEditorLayout>
    )
  }

  // Desktop layout
  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
        <EditorSidebar 
          isOpen={true}
          onClose={() => {}}
          isMobile={false}
        />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <EditorToolbar 
          isMobile={false}
          onToggleSidebar={() => {}}
        />

        {/* Canvas Container */}
        <div className="flex-1 p-4">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <CanvasEditor 
              className="h-full w-full"
              isMobile={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}