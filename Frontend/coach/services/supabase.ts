/**
 * Supabase Client Configuration
 * Phase P1.3: Frontend connection to real Supabase project
 * 
 * This service provides:
 * 1. Configured Supabase client with proper environment variables
 * 2. TypeScript support for database operations
 * 3. Authentication state management
 * 4. Error handling and logging
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js'
import { Database } from '../types/database'

// Environment validation
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
  throw new Error('Invalid SUPABASE_URL format. Expected https://<project>.supabase.co')
}

// Create Supabase client with type safety
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // Configure auth options
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false // Disable for mobile apps
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'fm-setlogger-mobile@1.0.0'
      }
    }
  }
)

/**
 * Auth helper functions
 */
export const auth = {
  /**
   * Get current user session
   */
  async getSession(): Promise<{ data: { session: Session | null }, error: any }> {
    return await supabase.auth.getSession()
  },

  /**
   * Get current user
   */
  async getUser(): Promise<{ data: { user: User | null }, error: any }> {
    return await supabase.auth.getUser()
  },

  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password })
  },

  /**
   * Sign out current user
   */
  async signOut() {
    return await supabase.auth.signOut()
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

/**
 * Database helper functions
 */
export const db = {
  /**
   * Get exercises from the library
   */
  async getExercises(options?: {
    category?: string
    bodyPart?: string[]
    limit?: number
  }) {
    let query = supabase
      .from('exercises')
      .select('id, name, category, body_part, equipment, description')

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    if (options?.bodyPart && options.bodyPart.length > 0) {
      query = query.overlaps('body_part', options.bodyPart)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    return await query.order('name')
  },

  /**
   * Get user's workouts
   */
  async getUserWorkouts(userId: string, options?: { limit?: number }) {
    let query = supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    return await query.order('created_at', { ascending: false })
  },

  /**
   * Create a new workout
   */
  async createWorkout(workoutData: {
    user_id: string
    title: string
    started_at?: string
  }) {
    return await supabase
      .from('workouts')
      .insert(workoutData)
      .select()
      .single()
  },

  /**
   * Get workout details with exercises
   */
  async getWorkoutDetails(workoutId: string) {
    return await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercises (
            id,
            name,
            category,
            body_part,
            equipment
          ),
          sets (*)
        )
      `)
      .eq('id', workoutId)
      .single()
  }
}

/**
 * Error handling utility
 */
export const handleSupabaseError = (error: any): string => {
  if (!error) return ''
  
  // Handle common Supabase errors
  if (error.message.includes('permission denied')) {
    return 'You do not have permission to perform this action.'
  }
  
  if (error.message.includes('row-level security')) {
    return 'Access denied. Please make sure you are signed in.'
  }
  
  if (error.message.includes('duplicate key')) {
    return 'This item already exists.'
  }
  
  if (error.message.includes('foreign key')) {
    return 'Unable to complete action due to data relationships.'
  }
  
  // Return the original error message for debugging
  return error.message || 'An unexpected error occurred.'
}

/**
 * Development logging utility
 */
export const logSupabaseOperation = (operation: string, data?: any, error?: any) => {
  if (process.env.EXPO_PUBLIC_SUPABASE_DEBUG === 'true') {
    console.log(`[Supabase] ${operation}`, { data, error })
  }
}

// Export the configured client as default
export default supabase