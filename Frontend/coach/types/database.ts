/**
 * Database Type Definitions
 * Phase P1.3: TypeScript types for Supabase database schema
 * 
 * Generated types based on the database schema in Backend/database/schema.sql
 * These provide type safety for all database operations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          title: string
          started_at: string
          completed_at: string | null
          duration: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          started_at?: string
          completed_at?: string | null
          duration?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          started_at?: string
          completed_at?: string | null
          duration?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      exercises: {
        Row: {
          id: string
          name: string
          category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'bodyweight'
          body_part: string[]
          equipment: string[]
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'bodyweight'
          body_part: string[]
          equipment: string[]
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'bodyweight'
          body_part?: string[]
          equipment?: string[]
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          order_index: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          order_index: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          order_index?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          }
        ]
      }
      sets: {
        Row: {
          id: string
          workout_exercise_id: string
          reps: number | null
          weight: number | null
          duration: number | null
          distance: number | null
          completed: boolean
          rest_time: number | null
          notes: string | null
          order_index: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          workout_exercise_id: string
          reps?: number | null
          weight?: number | null
          duration?: number | null
          distance?: number | null
          completed?: boolean
          rest_time?: number | null
          notes?: string | null
          order_index?: number
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          workout_exercise_id?: string
          reps?: number | null
          weight?: number | null
          duration?: number | null
          distance?: number | null
          completed?: boolean
          rest_time?: number | null
          notes?: string | null
          order_index?: number
          completed_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Entity types
export type User = Tables<'users'>
export type Workout = Tables<'workouts'>
export type Exercise = Tables<'exercises'>
export type WorkoutExercise = Tables<'workout_exercises'>
export type Set = Tables<'sets'>

// Insert types
export type NewUser = Inserts<'users'>
export type NewWorkout = Inserts<'workouts'>
export type NewExercise = Inserts<'exercises'>
export type NewWorkoutExercise = Inserts<'workout_exercises'>
export type NewSet = Inserts<'sets'>

// Update types
export type UserUpdate = Updates<'users'>
export type WorkoutUpdate = Updates<'workouts'>
export type ExerciseUpdate = Updates<'exercises'>
export type WorkoutExerciseUpdate = Updates<'workout_exercises'>
export type SetUpdate = Updates<'sets'>

// Enum types
export type ExerciseCategory = Database['public']['Tables']['exercises']['Row']['category']

// User preferences type
export interface UserPreferences {
  weightUnit: 'lbs' | 'kg'
  theme: 'light' | 'dark' | 'auto'
  defaultRestTimer: number
  hapticFeedback: boolean
}

// Extended types for joined queries
export interface WorkoutWithExercises extends Workout {
  workout_exercises: (WorkoutExercise & {
    exercises: Exercise
    sets: Set[]
  })[]
}

export interface ExerciseWithSets extends Exercise {
  sets?: Set[]
}

export interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercises: Exercise
  sets: Set[]
}