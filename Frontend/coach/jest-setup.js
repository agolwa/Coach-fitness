require('@testing-library/jest-native/extend-expect');

// Load environment variables for testing
require('dotenv').config({ path: '.env.local' });

// Set test environment variables if not loaded
if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://bqddialgmcfszoeyzcuj.supabase.co';
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZGRpYWxnbWNmc3pvZXl6Y3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5Njk0OTEsImV4cCI6MjA3MjU0NTQ5MX0.4DKRDi31G6sQ06bgzqlRWFDFwX98Q3OQTmXH27Wv5-Q';
}

// Mock AsyncStorage for React Native testing
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Global test timeout
jest.setTimeout(15000);

// Simple cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});