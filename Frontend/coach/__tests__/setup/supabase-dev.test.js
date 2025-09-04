/**
 * TDD Test: Supabase Development Environment Connection
 * Phase P1.3: Validates real Supabase project connection from Frontend
 * 
 * This test ensures:
 * 1. Supabase client can be initialized with production credentials
 * 2. Connection to bqddialgmcfszoeyzcuj.supabase.co succeeds
 * 3. Anonymous authentication works correctly
 * 4. Basic database queries function properly
 */

import { createClient } from '@supabase/supabase-js'

describe('Supabase Development Environment Connection', () => {
  let supabase

  beforeAll(() => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

    expect(supabaseUrl).toBeDefined()
    expect(supabaseAnonKey).toBeDefined()
    expect(supabaseUrl).toBe('https://bqddialgmcfszoeyzcuj.supabase.co')

    supabase = createClient(supabaseUrl, supabaseAnonKey)
  })

  test('should initialize Supabase client successfully', () => {
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
    expect(supabase.from).toBeInstanceOf(Function)
  })

  test('should connect to Supabase project', async () => {
    // Test connection by attempting to access the exercises table
    // This should work even without authentication as exercises are public
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .limit(1)

    // After schema deployment, this should succeed
    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(Array.isArray(data)).toBe(true)
  })

  test('should handle anonymous authentication correctly', async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // No active session initially (anonymous access)
    expect(error).toBeNull()
    expect(session).toBeNull()
  })

  test('should access exercises table after schema deployment', async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name, category')
      .limit(5)

    // This test ensures the schema is properly deployed
    // and RLS policies allow public read access to exercises
    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(Array.isArray(data)).toBe(true)
  })

  test('should validate RLS policies prevent unauthorized user data access', async () => {
    // Attempt to access users table without authentication
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    // RLS should either block access (error) or return empty results (data=[])
    // Both scenarios are valid for proper RLS implementation
    if (error) {
      expect(error.message).toMatch(/permission denied|no permission|not allowed|RLS/i)
    } else {
      // RLS allows query but returns no data for unauthorized users
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)
    }
  })

  test('should validate exercise data structure after seeding', async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('name, category, body_part, equipment')
      .eq('category', 'strength')
      .limit(1)

    expect(error).toBeNull()
    expect(data).toBeDefined()
    
    if (data && data.length > 0) {
      const exercise = data[0]
      expect(exercise.name).toBeDefined()
      expect(exercise.category).toBe('strength')
      expect(Array.isArray(exercise.body_part)).toBe(true)
      expect(Array.isArray(exercise.equipment)).toBe(true)
    }
  })
})