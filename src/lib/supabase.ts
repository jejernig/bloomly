import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client for client-side operations  
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Create Supabase client for server-side operations
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Database helper functions
export const db = {
  // Users
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      throw error
    }
    return data
  },

  async updateUser(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    return data
  },

  // Projects
  async getProjects(userId: string, limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      throw error
    }
    return data
  },

  async getProject(projectId: string, userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      throw error
    }
    return data
  },

  async createProject(projectData: Database['public']['Tables']['projects']['Insert']) {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    return data
  },

  async updateProject(projectId: string, userId: string, updates: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    return data
  },

  async deleteProject(projectId: string, userId: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId)
    
    if (error) {
      throw error
    }
  },

  // Templates
  async getTemplates(category?: string, isPremium?: boolean, limit = 20, offset = 0) {
    let query = supabase
      .from('templates')
      .select('*')
      .order('usage_count', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (isPremium !== undefined) {
      query = query.eq('is_premium', isPremium)
    }
    
    const { data, error } = await query
    
    if (error) {
      throw error
    }
    return data
  },

  async getTemplate(templateId: string) {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()
    
    if (error) {
      throw error
    }
    return data
  },

  // Instagram Accounts
  async getInstagramAccounts(userId: string) {
    const { data, error } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (error) {
      throw error
    }
    return data
  },

  async createInstagramAccount(accountData: Database['public']['Tables']['instagram_accounts']['Insert']) {
    const { data, error } = await supabase
      .from('instagram_accounts')
      .insert(accountData)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    return data
  },

  // AI Generations
  async createAIGeneration(generationData: Database['public']['Tables']['ai_generations']['Insert']) {
    const { data, error } = await supabase
      .from('ai_generations')
      .insert(generationData)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    return data
  },

  async updateAIGeneration(generationId: string, updates: any) {
    const { data, error } = await supabase
      .from('ai_generations')
      .update(updates)
      .eq('id', generationId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    return data
  },

  // Published Posts
  async getPublishedPosts(userId: string, limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('published_posts')
      .select(`
        *,
        instagram_accounts (
          username,
          instagram_user_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      throw error
    }
    return data
  },

  async createPublishedPost(postData: Database['public']['Tables']['published_posts']['Insert']) {
    const { data, error } = await supabase
      .from('published_posts')
      .insert(postData)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    return data
  },

  // User Usage Tracking
  async getUserUsage(userId: string, monthYear: string) {
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error // Ignore "not found" errors
    }
    return data
  },

  async updateUserUsage(userId: string, monthYear: string, updates: Partial<Database['public']['Tables']['user_usage']['Update']>) {
    const { data, error } = await supabase
      .from('user_usage')
      .upsert({
        user_id: userId,
        month_year: monthYear,
        ...updates,
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    return data
  },
}

// Storage helpers
export const storage = {
  // Upload image to Supabase Storage
  async uploadImage(bucket: string, filePath: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })
    
    if (error) {
      throw error
    }
    return data
  },

  // Get public URL for an image
  getPublicUrl(bucket: string, filePath: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return data.publicUrl
  },

  // Delete image from storage
  async deleteImage(bucket: string, filePath: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])
    
    if (error) {
      throw error
    }
  },

  // List images in a bucket
  async listImages(bucket: string, folder = '') {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder)
    
    if (error) {
      throw error
    }
    return data
  },
}

// Real-time subscriptions
export const realtime = {
  // Subscribe to project changes
  subscribeToProject(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to user's projects
  subscribeToUserProjects(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user-projects:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to published posts
  subscribeToPublishedPosts(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user-posts:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'published_posts',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()
  },
}