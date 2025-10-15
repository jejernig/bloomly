import { Project, CanvasState, APIResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Generic API error class
export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Generic API request function
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE_URL}/api${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new APIError(response.status, data.error || 'API request failed', data)
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    console.error('API request failed:', error)
    throw new APIError(500, 'Network error or server unavailable')
  }
}

// Project API functions
export const projectsAPI = {
  // Get all user projects
  async list(): Promise<APIResponse<Project[]>> {
    return apiRequest<Project[]>('/projects')
  },

  // Get specific project by ID
  async get(id: string): Promise<APIResponse<Project>> {
    return apiRequest<Project>(`/projects/${id}`)
  },

  // Create new project
  async create(data: {
    title: string
    description?: string
    canvasData: CanvasState
    thumbnailUrl?: string
    tags?: string[]
  }): Promise<APIResponse<Project>> {
    return apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update existing project
  async update(
    id: string,
    data: Partial<{
      title: string
      description: string
      canvasData: CanvasState
      thumbnailUrl: string
      tags: string[]
    }>
  ): Promise<APIResponse<Project>> {
    return apiRequest<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete project
  async delete(id: string): Promise<APIResponse<void>> {
    return apiRequest<void>(`/projects/${id}`, {
      method: 'DELETE',
    })
  },

  // Save canvas state to project (convenience method)
  async saveCanvas(
    projectId: string, 
    canvasData: CanvasState,
    thumbnailUrl?: string
  ): Promise<APIResponse<Project>> {
    return this.update(projectId, { 
      canvasData,
      ...(thumbnailUrl && { thumbnailUrl })
    })
  }
}

// Error handling utilities
export function isAPIError(error: any): error is APIError {
  return error instanceof APIError
}

export function handleAPIError(error: any): string {
  if (isAPIError(error)) {
    switch (error.status) {
      case 401:
        return 'You must be logged in to perform this action'
      case 403:
        return 'You do not have permission to perform this action'
      case 404:
        return 'The requested resource was not found'
      case 409:
        return 'This action conflicts with existing data'
      case 422:
        return 'The provided data is invalid'
      case 429:
        return 'Too many requests. Please wait a moment and try again'
      case 500:
        return 'Server error. Please try again later'
      default:
        return error.message || 'An unexpected error occurred'
    }
  }
  
  return 'An unexpected error occurred'
}

// Toast notification helpers (integrated with react-hot-toast)
import { toast } from 'react-hot-toast'

export function showErrorToast(error: any) {
  const message = handleAPIError(error)
  console.error('API Error:', message, error)
  toast.error(message)
}

export function showSuccessToast(message: string) {
  toast.success(message)
}

// Enhanced API request wrapper with automatic retry logic
async function apiRequestWithRetry<T = any>(
  endpoint: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<APIResponse<T>> {
  let lastError: APIError | Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest<T>(endpoint, options)
    } catch (error) {
      lastError = error as APIError | Error
      
      // Don't retry for client errors (4xx) or on the last attempt
      if (attempt === maxRetries || (error instanceof APIError && error.status >= 400 && error.status < 500)) {
        throw lastError
      }
      
      // Wait before retrying with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Updated project API functions with retry logic
export const projectsAPIWithRetry = {
  // Get all user projects with retry
  async list(): Promise<APIResponse<Project[]>> {
    return apiRequestWithRetry<Project[]>('/projects')
  },

  // Get specific project by ID with retry
  async get(id: string): Promise<APIResponse<Project>> {
    return apiRequestWithRetry<Project>(`/projects/${id}`)
  },

  // Create new project with retry
  async create(data: {
    title: string
    description?: string
    canvasData: CanvasState
    thumbnailUrl?: string
    tags?: string[]
  }): Promise<APIResponse<Project>> {
    return apiRequestWithRetry<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 1) // Only retry once for creation operations
  },

  // Update existing project with retry
  async update(
    id: string,
    data: Partial<{
      title: string
      description: string
      canvasData: CanvasState
      thumbnailUrl: string
      tags: string[]
    }>
  ): Promise<APIResponse<Project>> {
    return apiRequestWithRetry<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, 1) // Only retry once for update operations
  },

  // Delete project with retry
  async delete(id: string): Promise<APIResponse<void>> {
    return apiRequestWithRetry<void>(`/projects/${id}`, {
      method: 'DELETE',
    }, 1) // Only retry once for delete operations
  },

  // Save canvas state to project (convenience method with retry)
  async saveCanvas(
    projectId: string, 
    canvasData: CanvasState,
    thumbnailUrl?: string
  ): Promise<APIResponse<Project>> {
    return this.update(projectId, { 
      canvasData,
      ...(thumbnailUrl && { thumbnailUrl })
    })
  }
}