/**
 * @jest-environment jsdom
 */

import { isNetworkError, shouldWorkOffline } from '../services/api-client';

// Mock fetch for testing
global.fetch = jest.fn();

describe('API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isNetworkError', () => {
    it('should identify network errors correctly', () => {
      const networkErrors = [
        new Error('Failed to fetch'),
        new Error('Network error occurred'),
        { name: 'TypeError', message: 'Network request failed' },
        { name: 'AbortError', message: 'Request timeout' },
        { errorCode: 'NETWORK_ERROR', message: 'Connection failed' }
      ];

      networkErrors.forEach(error => {
        expect(isNetworkError(error)).toBe(true);
      });
    });

    it('should not identify non-network errors as network errors', () => {
      const nonNetworkErrors = [
        new Error('Validation error'),
        { status: 400, message: 'Bad request' },
        { errorCode: 'VALIDATION_ERROR', message: 'Invalid data' },
        undefined,
        null
      ];

      nonNetworkErrors.forEach(error => {
        expect(isNetworkError(error)).toBe(false);
      });
    });
  });

  describe('shouldWorkOffline', () => {
    it('should return true when server is unreachable', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await shouldWorkOffline();
      expect(result).toBe(true);
    });

    it('should return false when server is reachable', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      const result = await shouldWorkOffline();
      expect(result).toBe(false);
    });

    it('should handle server errors as offline', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

      const result = await shouldWorkOffline();
      expect(result).toBe(true);
    });
  });
});