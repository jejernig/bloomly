'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { EditorLayout } from '@/components/editor/EditorLayout'
import { toast } from 'react-hot-toast'

export default function EditorPage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('project')
  const templateId = searchParams?.get('template')
  
  const { initialize } = useCanvasStore()

  // Authentication check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  // Load project if specified
  useEffect(() => {
    if (projectId) {
      // Load project from API
      const loadProjectData = async () => {
        try {
          // In a real app, this would fetch from your API
          // For now, we'll initialize with a default canvas
          initialize()
        } catch (error) {
          console.error('Failed to load project:', error)
          toast.error('Failed to load project')
          initialize()
        }
      }
      
      loadProjectData()
    } else if (templateId) {
      // Load template
      const loadTemplateData = async () => {
        try {
          // In a real app, this would fetch template data
          initialize()
        } catch (error) {
          console.error('Failed to load template:', error)
          toast.error('Failed to load template')
          initialize()
        }
      }
      
      loadTemplateData()
    } else {
      // Initialize empty canvas
      initialize()
    }
  }, [projectId, templateId, initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading editor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return <EditorLayout />
}