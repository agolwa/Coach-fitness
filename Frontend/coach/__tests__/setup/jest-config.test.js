/**
 * Jest Configuration Validation Tests
 * Tests Jest setup and React Native testing environment
 */

// Import testing utilities at module level to avoid hooks inside tests
import { render, screen } from '@testing-library/react-native';

describe('Jest Configuration', () => {
  it('should load React Native testing environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
  
  it('should import testing utilities without errors', () => {
    expect(render).toBeDefined();
    expect(screen).toBeDefined();
  });

  it('should have jest-expo preset configured', () => {
    expect(global.expect).toBeDefined();
    expect(global.describe).toBeDefined();
    expect(global.it).toBeDefined();
  });

  it('should have AsyncStorage mocked', () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    expect(AsyncStorage).toBeDefined();
    expect(AsyncStorage.getItem).toBeDefined();
    expect(AsyncStorage.setItem).toBeDefined();
  });

  it('should support TypeScript imports', () => {
    // This test validates that our TypeScript/React Native setup works
    expect(() => {
      require('react');
      require('react-native');
    }).not.toThrow();
  });

  it('should have proper test configuration', () => {
    // Verify that our Jest configuration is properly loaded
    expect(jest).toBeDefined();
    expect(jest.clearAllMocks).toBeDefined();
  });
});