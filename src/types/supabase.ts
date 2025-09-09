// Temporary Supabase types - to be generated from actual schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          subscription_tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          subscription_tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          subscription_tier?: string;
          updated_at?: string;
        };
      };
      instagram_accounts: {
        Row: {
          id: string;
          user_id: string;
          instagram_user_id: string;
          username: string;
          access_token: string;
          expires_at?: string;
          account_type: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          instagram_user_id: string;
          username: string;
          access_token: string;
          expires_at?: string;
          account_type?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          access_token?: string;
          expires_at?: string;
          account_type?: string;
          is_active?: boolean;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description?: string;
          canvas_data: any;
          thumbnail_url?: string;
          template_id?: string;
          is_template: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          canvas_data: any;
          thumbnail_url?: string;
          template_id?: string;
          is_template?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          canvas_data?: any;
          thumbnail_url?: string;
          tags?: string[];
          updated_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          category: string;
          canvas_data: any;
          thumbnail_url: string;
          is_premium: boolean;
          usage_count: number;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          canvas_data: any;
          thumbnail_url: string;
          is_premium?: boolean;
          usage_count?: number;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          name?: string;
          category?: string;
          canvas_data?: any;
          thumbnail_url?: string;
          is_premium?: boolean;
          usage_count?: number;
          tags?: string[];
        };
      };
      ai_generations: {
        Row: {
          id: string;
          user_id: string;
          project_id?: string;
          generation_type: string;
          prompt: string;
          result_data?: any;
          tokens_used?: number;
          processing_time_ms?: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string;
          generation_type: string;
          prompt: string;
          result_data?: any;
          tokens_used?: number;
          processing_time_ms?: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          result_data?: any;
          tokens_used?: number;
          processing_time_ms?: number;
          status?: string;
        };
      };
      published_posts: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          instagram_account_id: string;
          instagram_post_id?: string;
          caption: string;
          hashtags: string[];
          scheduled_for?: string;
          published_at?: string;
          status: string;
          engagement_data?: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          instagram_account_id: string;
          instagram_post_id?: string;
          caption: string;
          hashtags?: string[];
          scheduled_for?: string;
          published_at?: string;
          status?: string;
          engagement_data?: any;
          created_at?: string;
        };
        Update: {
          instagram_post_id?: string;
          caption?: string;
          hashtags?: string[];
          scheduled_for?: string;
          published_at?: string;
          status?: string;
          engagement_data?: any;
        };
      };
      user_usage: {
        Row: {
          id: string;
          user_id: string;
          month_year: string;
          ai_generations_used: number;
          projects_created: number;
          posts_published: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month_year: string;
          ai_generations_used?: number;
          projects_created?: number;
          posts_published?: number;
          created_at?: string;
        };
        Update: {
          ai_generations_used?: number;
          projects_created?: number;
          posts_published?: number;
        };
      };
    };
  };
}