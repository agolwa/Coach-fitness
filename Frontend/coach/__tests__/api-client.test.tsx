/**
 * @jest-environment jsdom
 * API Client Integration Tests
 * 
 * Comprehensive test suite for:
 * - API client initialization and configuration
 * - JWT token management and refresh logic
 * - HTTP method handlers (GET, POST, PUT, DELETE)
 * - Error handling and retry mechanisms
 * - Environment-aware base URL configuration
 * - Request/response interceptors
 */

import { APIClient, APIError, TokenManager, apiClient } from '../services/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock console methods to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

describe('APIClient', () => {
  let client: APIClient;

  beforeEach(() => {
    client = new APIClient('http://localhost:8000', 5000);
    mockFetch.mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.multiSet as jest.Mock).mockClear();
    (AsyncStorage.multiRemove as jest.Mock).mockClear();
    consoleSpy.mockClear();
    consoleWarnSpy.mockClear();
    consoleLogSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Initialization', () => {
    it('should create client with default configuration', () => {
      const defaultClient = new APIClient();
      expect(defaultClient).toBeInstanceOf(APIClient);
    });

    it('should create client with custom base URL and timeout', () => {
      const customClient = new APIClient('https://api.example.com', 10000);
      expect(customClient).toBeInstanceOf(APIClient);
    });

    it('should use environment-aware base URL configuration', () => {
      // Test that default client uses appropriate URL based on environment
      expect(apiClient).toBeInstanceOf(APIClient);
    });
  });

  describe('HTTP Methods', () => {
    it('should make GET requests correctly', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      const result = await client.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make POST requests with data', async () => {
      const requestData = { name: 'test' };
      const mockResponse = { id: 1, name: 'test' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      const result = await client.post('/test', requestData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make PUT requests with data', async () => {
      const requestData = { id: 1, name: 'updated' };
      const mockResponse = { id: 1, name: 'updated' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      const result = await client.put('/test/1', requestData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make DELETE requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers({ 'content-length': '0' }),
      });

      const result = await client.delete('/test/1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual({});
    });

    it('should handle empty responses (204 No Content)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers({ 'content-length': '0' }),
      });

      const result = await client.get('/test');
      expect(result).toEqual({});
    });
  });

  describe('Authentication', () => {
    it('should include Authorization header when token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('test-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
        headers: new Headers(),
      });

      await client.get('/protected');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/protected',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should not include Authorization header when no token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
        headers: new Headers(),
      });

      await client.get('/public');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/public',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });

    it('should attempt token refresh on 401 response', async () => {
      // Setup: token exists, first request fails with 401, refresh succeeds, retry succeeds
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('expired-token') // First getAccessToken call
        .mockResolvedValueOnce('refresh-token'); // getRefreshToken call

      // First request fails with 401
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
        })
        // Token refresh succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            access_token: 'new-token',
            token_type: 'bearer',
            expires_in: 3600,
          }),
          headers: new Headers(),
        })
        // Retry request succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: 'success' }),
          headers: new Headers(),
        });

      const result = await client.get('/protected');
      
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
      expect(AsyncStorage.multiSet).toHaveBeenCalled();
    });

    it('should clear tokens and throw error when refresh fails', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('expired-token')
        .mockResolvedValueOnce('invalid-refresh-token');

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        });

      await expect(client.get('/protected')).rejects.toThrow(APIError);
      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should throw APIError for HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          detail: 'Invalid request data',
          error_code: 'VALIDATION_ERROR',
        }),
      });

      await expect(client.get('/error')).rejects.toThrow(APIError);
      
      try {
        await client.get('/error');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).errorCode).toBe('VALIDATION_ERROR');
        expect((error as APIError).message).toBe('Invalid request data');
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('/network-error')).rejects.toThrow(APIError);
      
      try {
        await client.get('/network-error');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).isNetworkError()).toBe(true);
      }
    });

    it('should handle timeout errors', async () => {
      jest.useFakeTimers();
      
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      const timeoutClient = new APIClient('http://localhost:8000', 1000);
      const requestPromise = timeoutClient.get('/timeout');
      
      jest.advanceTimersByTime(2000);
      
      await expect(requestPromise).rejects.toThrow(APIError);
      
      try {
        await requestPromise;
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).errorCode).toBe('TIMEOUT');
      }
      
      jest.useRealTimers();
    });

    it('should handle malformed JSON responses gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(client.get('/malformed')).rejects.toThrow(APIError);
      
      try {
        await client.get('/malformed');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).message).toBe('Internal Server Error');
      }
    });
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      const mockResponse = {
        status: 'healthy',
        message: 'API is running',
        version: '1.0.0',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      const result = await client.healthCheck();
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/health',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

describe('TokenManager', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.multiSet as jest.Mock).mockClear();
    (AsyncStorage.multiRemove as jest.Mock).mockClear();
  });

  it('should get access token from storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('test-token');
    
    const token = await TokenManager.getAccessToken();
    
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@auth_access_token');
    expect(token).toBe('test-token');
  });

  it('should return null when no token exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    
    const token = await TokenManager.getAccessToken();
    expect(token).toBeNull();
  });

  it('should set tokens correctly', async () => {
    const tokenResponse = {
      access_token: 'new-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'refresh-token',
    };

    await TokenManager.setTokens(tokenResponse);
    
    expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
      ['@auth_access_token', 'new-token'],
      ['@auth_token_expiry', expect.any(String)],
    ]);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@auth_refresh_token',
      'refresh-token'
    );
  });

  it('should clear all tokens', async () => {
    await TokenManager.clearTokens();
    
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      '@auth_access_token',
      '@auth_refresh_token',
      '@auth_token_expiry',
    ]);
  });

  it('should check token expiration correctly', async () => {
    const futureTime = Date.now() + 600000; // 10 minutes from now
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(futureTime.toString());
    
    const isExpired = await TokenManager.isTokenExpired();
    expect(isExpired).toBe(false);
  });

  it('should consider token expired if expiry time is close', async () => {
    const soonTime = Date.now() + 200000; // 3.3 minutes from now (less than 5 minute buffer)
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(soonTime.toString());
    
    const isExpired = await TokenManager.isTokenExpired();
    expect(isExpired).toBe(true);
  });

  it('should handle storage errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
    
    const token = await TokenManager.getAccessToken();
    expect(token).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('APIError', () => {
  it('should create API error with correct properties', () => {
    const error = new APIError('Test error', 400, 'TEST_ERROR');
    
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
    expect(error.errorCode).toBe('TEST_ERROR');
    expect(error.name).toBe('APIError');
  });

  it('should identify error types correctly', () => {
    const networkError = new APIError('Network error', 0, 'NETWORK_ERROR');
    const authError = new APIError('Unauthorized', 401, 'AUTH_ERROR');
    const validationError = new APIError('Validation failed', 422, 'VALIDATION_ERROR');
    const serverError = new APIError('Server error', 500, 'SERVER_ERROR');
    
    expect(networkError.isNetworkError()).toBe(true);
    expect(authError.isAuthenticationError()).toBe(true);
    expect(validationError.isValidationError()).toBe(true);
    expect(serverError.isServerError()).toBe(true);
  });

  it('should include original error when provided', () => {
    const originalError = new Error('Original error');
    const apiError = new APIError('API error', 500, 'ERROR', originalError);
    
    expect(apiError.originalError).toBe(originalError);
  });
});