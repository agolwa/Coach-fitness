require('@testing-library/jest-native/extend-expect');

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