// Load environment variables for testing
require('dotenv').config({ path: '.env.local' });

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@testing-library/react-native|@react-native-async-storage/async-storage|nativewind|react-native-css-interop|zustand|@tanstack/react-query|crypto-js|lucide-react-native|class-variance-authority|clsx|tailwind-merge))',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.expo/',
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
    '!**/jest-setup.js',
    '!**/.expo/**',
    '!**/assets/**',
    '!**/app/_layout.tsx',
    '!**/app/index.tsx',
    '!**/__tests__/**',
    '!**/types/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  // Performance and stability
  maxWorkers: '50%',
  testTimeout: 15000,
  clearMocks: true,
  restoreMocks: true,
  // React 19 compatibility
  testEnvironmentOptions: {
    customExportConditions: ['react-native'],
  },
};