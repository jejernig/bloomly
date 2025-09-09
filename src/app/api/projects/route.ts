import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Project, CanvasState } from '@/types'

// GET /api/projects - List user projects
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('userId', session.user.id)
      .order('updatedAt', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: projects,
      message: `Found ${projects?.length || 0} projects`
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, canvasData, thumbnailUrl, tags = [] } = body

    // Validation
    if (!title || !canvasData) {
      return NextResponse.json(
        { error: 'Title and canvas data are required' },
        { status: 400 }
      )
    }

    // Create new project
    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: session.user.id,
      title: title.trim(),
      description: description?.trim() || undefined,
      canvasData,
      thumbnailUrl: thumbnailUrl || undefined,
      templateId: undefined,
      isTemplate: false,
      tags: Array.isArray(tags) ? tags : []
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create project' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}