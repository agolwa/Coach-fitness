require('@testing-library/jest-native/extend-expect');

// Global test timeout
jest.setTimeout(10000);

// Simple cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});