import React from 'react';
import { render, screen } from '../test-utils';
import { View, Text } from 'react-native';

// Simple test component to validate React Native Testing Library
const TestComponent: React.FC<{ title: string }> = ({ title }) => {
  return (
    <View testID="test-container">
      <Text testID="test-title">{title}</Text>
    </View>
  );
};

describe('Component Testing Infrastructure', () => {
  it('should render React Native components correctly', () => {
    render(<TestComponent title="Hello World" />);
    
    expect(screen.getByTestId('test-container')).toBeTruthy();
    expect(screen.getByTestId('test-title')).toBeTruthy();
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('should handle props correctly', () => {
    const testTitle = 'Test Title';
    render(<TestComponent title={testTitle} />);
    
    expect(screen.getByText(testTitle)).toBeTruthy();
  });

  it('should work with custom render function from test-utils', () => {
    // This validates our custom render function with providers
    render(<TestComponent title="Provider Test" />);
    
    expect(screen.getByText('Provider Test')).toBeTruthy();
  });
});