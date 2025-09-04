/**
 * API Client Configuration Tests
 * Test-First Development: Task 4.2 - API Client URL Configuration with Android Emulator Focus
 * 
 * Primary testing platform: Android emulator (development workflow priority)
 * Secondary testing: iOS simulator (backup platform compatibility)
 */

// Mock React Native Platform - Default to Android for primary testing
const mockPlatform = {
  OS: 'android',
};

jest.mock('react-native', () => ({
  Platform: mockPlatform,
}));

// Mock expo-constants for environment configuration testing
const mockExpoConfig = {
  extra: {}
};

jest.mock('expo-constants', () => ({
  expoConfig: mockExpoConfig,
  __DEV__: true
}));

describe('API Client Configuration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.resetModules();
    
    // Reset mock state
    mockExpoConfig.extra = {};
    global.__DEV__ = true;
    mockPlatform.OS = 'android';
  });

  describe('Production Environment Configuration', () => {
    it('should use environment variable for production API URL', () => {
      global.__DEV__ = false;
      mockExpoConfig.extra = { 
        EXPO_PUBLIC_API_URL: 'https://api.fm-setlogger.com' 
      };

      const { getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      
      expect(baseURL).toBe('https://api.fm-setlogger.com');
    });

    it('should use staging URL when configured', () => {
      global.__DEV__ = false;
      mockExpoConfig.extra = { 
        EXPO_PUBLIC_API_URL: 'https://api-staging.fm-setlogger.com' 
      };

      const { getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      
      expect(baseURL).toBe('https://api-staging.fm-setlogger.com');
    });
  });

  describe('Android Emulator Development Configuration (Primary Platform)', () => {
    it('should handle Android emulator localhost transformation for development', () => {
      // Primary testing scenario - Android emulator development
      mockPlatform.OS = 'android';
      global.__DEV__ = true;

      const { getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      
      // Critical requirement: Android emulator requires 10.0.2.2 for localhost
      expect(baseURL).toBe('http://10.0.2.2:8000');
      expect(baseURL).toContain('10.0.2.2');
    });

    it('should validate Android emulator URL works with backend connection', async () => {
      // Integration test for Android emulator connectivity
      mockPlatform.OS = 'android';
      global.__DEV__ = true;
      
      const { APIClient } = require('../../services/api-client');
      const client = new APIClient();
      
      // Verify base URL is set correctly for Android emulator
      expect(client.baseURL).toBe('http://10.0.2.2:8000');
      expect(client.baseURL).toContain('10.0.2.2');
    });

    it('should preserve Android emulator transformation even with localhost env var', () => {
      mockPlatform.OS = 'android';
      global.__DEV__ = true;
      mockExpoConfig.extra = { 
        EXPO_PUBLIC_API_URL: 'http://localhost:8000' 
      };

      const { getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      
      // Should still transform to 10.0.2.2 for Android emulator compatibility
      expect(baseURL).toBe('http://10.0.2.2:8000');
    });
  });

  describe('iOS Simulator Configuration (Secondary Platform)', () => {
    it('should handle iOS simulator URL when needed', () => {
      // Secondary testing scenario - iOS simulator for completeness
      mockPlatform.OS = 'ios';
      global.__DEV__ = true;

      const { getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      
      expect(baseURL).toContain('localhost'); // iOS can use localhost directly
      expect(baseURL).toBe('http://localhost:8000');
    });

    it('should not transform localhost for iOS platform', () => {
      mockPlatform.OS = 'ios';
      global.__DEV__ = true;
      mockExpoConfig.extra = { 
        EXPO_PUBLIC_API_URL: 'http://localhost:8000' 
      };

      const { getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      
      // iOS should keep localhost as-is
      expect(baseURL).toBe('http://localhost:8000');
      expect(baseURL).not.toContain('10.0.2.2');
    });
  });

  describe('Web Platform Configuration', () => {
    it('should handle web platform URL configuration', () => {
      mockPlatform.OS = 'web';
      global.__DEV__ = true;

      const { getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      
      expect(baseURL).toBe('http://localhost:8000');
    });
  });

  describe('Error Handling and Configuration Validation', () => {
    it('should provide fallback when production URL is missing', () => {
      global.__DEV__ = false;
      mockExpoConfig.extra = {}; // No production URL configured

      // Mock console.warn to test warning message
      const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const { getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      
      expect(baseURL).toBe('http://localhost:8000');
      expect(mockWarn).toHaveBeenCalledWith('No production API URL configured, using localhost');

      mockWarn.mockRestore();
    });

    it('should handle missing expo config gracefully', () => {
      global.__DEV__ = false;
      // Completely remove expo config
      jest.doMock('expo-constants', () => ({
        expoConfig: null
      }));

      expect(() => {
        const { getBaseURL } = require('../../services/api-client');
        const baseURL = getBaseURL();
        expect(baseURL).toBe('http://localhost:8000');
      }).not.toThrow();
    });
  });

  describe('APIClient Integration', () => {
    it('should create APIClient with correct Android emulator base URL', () => {
      mockPlatform.OS = 'android';
      global.__DEV__ = true;

      const { APIClient } = require('../../services/api-client');
      const client = new APIClient();

      expect(client.baseURL).toBe('http://10.0.2.2:8000');
    });

    it('should create APIClient with production URL when configured', () => {
      global.__DEV__ = false;
      mockExpoConfig.extra = { 
        EXPO_PUBLIC_API_URL: 'https://api.fm-setlogger.com' 
      };

      // Clear module cache to ensure fresh getBaseURL call
      delete require.cache[require.resolve('../../services/api-client')];
      delete require.cache[require.resolve('expo-constants')];

      const { APIClient, getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      const client = new APIClient(baseURL);

      expect(client.baseURL).toBe('https://api.fm-setlogger.com');
    });
  });

  describe('Environment Variable Priority', () => {
    it('should prioritize expo config over default values', () => {
      global.__DEV__ = false;
      mockExpoConfig.extra = { 
        EXPO_PUBLIC_API_URL: 'https://custom-api.example.com' 
      };

      // Clear module cache to ensure fresh getBaseURL call
      delete require.cache[require.resolve('../../services/api-client')];
      delete require.cache[require.resolve('expo-constants')];
      
      const { getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      
      expect(baseURL).toBe('https://custom-api.example.com');
    });

    it('should use development defaults when expo config is empty', () => {
      mockPlatform.OS = 'android';
      global.__DEV__ = true;
      mockExpoConfig.extra = {};

      const { getBaseURL } = require('../../services/api-client');
      const baseURL = getBaseURL();
      
      expect(baseURL).toBe('http://10.0.2.2:8000');
    });
  });
});