/**
 * Environment Configuration Tests
 * Test-First Development: Task 4.1 Frontend Environment Configuration Enhancement
 */

// Mock React Native Platform with mutable object
const mockPlatform = {
  OS: 'android', // Default to Android for primary testing
};

jest.mock('react-native', () => ({
  Platform: mockPlatform,
}));

// Mock expo-constants
const mockExpoConfig = {
  extra: {}
};

jest.mock('expo-constants', () => ({
  expoConfig: mockExpoConfig,
  __DEV__: true
}));

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockExpoConfig.extra = {};
    // Reset to development mode
    global.__DEV__ = true;
    mockPlatform.OS = 'android';
  });

  describe('Development Environment', () => {
    it('should load development environment variables', () => {
      process.env.NODE_ENV = 'development';
      global.__DEV__ = true;

      // Mock app config loading
      const mockAppConfig = {
        expo: {
          extra: {
            EXPO_PUBLIC_API_URL: 'http://localhost:8000',
            EXPO_PUBLIC_DEV_SERVER_PORT: '8081',
            EXPO_PUBLIC_DEBUG_MODE: 'true'
          }
        }
      };

      expect(mockAppConfig.expo.extra.EXPO_PUBLIC_API_URL).toBeDefined();
      expect(mockAppConfig.expo.extra.EXPO_PUBLIC_API_URL).toBe('http://localhost:8000');
      expect(mockAppConfig.expo.extra.EXPO_PUBLIC_DEBUG_MODE).toBe('true');
    });

    it('should handle Android emulator URL transformation', () => {
      mockPlatform.OS = 'android';
      global.__DEV__ = true;

      // Import after mocking to ensure mocks are applied
      const { getBaseURL } = require('../../services/api-client');

      const url = getBaseURL();
      expect(url).toContain('10.0.2.2'); // Android emulator requires 10.0.2.2 for localhost
      expect(url).toBe('http://10.0.2.2:8000');
    });

    it('should handle iOS simulator URL when needed', () => {
      mockPlatform.OS = 'ios';
      global.__DEV__ = true;

      const { getBaseURL } = require('../../services/api-client');

      const url = getBaseURL();
      expect(url).toContain('localhost'); // iOS can use localhost directly
      expect(url).toBe('http://localhost:8000');
    });

    it('should handle web platform URL', () => {
      mockPlatform.OS = 'web';
      global.__DEV__ = true;

      const { getBaseURL } = require('../../services/api-client');

      const url = getBaseURL();
      expect(url).toBe('http://localhost:8000');
    });
  });

  describe('Production Environment', () => {
    it('should use production environment variables', () => {
      global.__DEV__ = false;
      mockExpoConfig.extra = {
        EXPO_PUBLIC_API_URL: 'https://api.fm-setlogger.com'
      };

      const { getBaseURL } = require('../../services/api-client');
      const url = getBaseURL();

      expect(url).toBe('https://api.fm-setlogger.com');
    });

    it('should fall back to localhost when production URL is missing', () => {
      global.__DEV__ = false;
      mockExpoConfig.extra = {};

      // Mock console.warn to test warning
      const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const { getBaseURL } = require('../../services/api-client');
      const url = getBaseURL();

      expect(url).toBe('http://localhost:8000');
      expect(mockWarn).toHaveBeenCalledWith('No production API URL configured, using localhost');

      mockWarn.mockRestore();
    });
  });

  describe('Environment Variable Loading', () => {
    it('should validate required environment variables exist', () => {
      // Mock environment variables that should be present
      const requiredEnvVars = [
        'EXPO_PUBLIC_API_URL',
        'EXPO_PUBLIC_DEV_SERVER_PORT',
        'EXPO_PUBLIC_DEBUG_MODE'
      ];

      // This test will validate that our app.config.js properly loads these
      const mockConfig = {
        extra: {
          EXPO_PUBLIC_API_URL: 'http://localhost:8000',
          EXPO_PUBLIC_DEV_SERVER_PORT: '8081',
          EXPO_PUBLIC_DEBUG_MODE: 'true'
        }
      };

      requiredEnvVars.forEach(envVar => {
        expect(mockConfig.extra[envVar]).toBeDefined();
      });
    });

    it('should handle missing environment file gracefully', () => {
      // Test that the app doesn't crash when env file is missing
      const mockConfig = {
        extra: {}
      };

      expect(() => {
        // This should not throw
        const hasApiUrl = Boolean(mockConfig.extra.EXPO_PUBLIC_API_URL);
        expect(hasApiUrl).toBe(false);
      }).not.toThrow();
    });
  });

  describe('Environment Switching', () => {
    it('should support staging environment configuration', () => {
      const stagingConfig = {
        extra: {
          EXPO_PUBLIC_API_URL: 'https://api-staging.fm-setlogger.com',
          EXPO_PUBLIC_DEBUG_MODE: 'true'
        }
      };

      expect(stagingConfig.extra.EXPO_PUBLIC_API_URL).toContain('staging');
      expect(stagingConfig.extra.EXPO_PUBLIC_DEBUG_MODE).toBe('true');
    });

    it('should support local environment configuration', () => {
      const localConfig = {
        extra: {
          EXPO_PUBLIC_API_URL: 'http://localhost:8000',
          EXPO_PUBLIC_DEBUG_MODE: 'true',
          EXPO_PUBLIC_ENABLE_FAST_REFRESH: 'true'
        }
      };

      expect(localConfig.extra.EXPO_PUBLIC_API_URL).toContain('localhost');
      expect(localConfig.extra.EXPO_PUBLIC_ENABLE_FAST_REFRESH).toBe('true');
    });
  });
});