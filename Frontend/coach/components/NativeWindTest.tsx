import React from 'react';
import { View, Text, Pressable } from 'react-native';

export function NativeWindTest() {
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-semibold text-foreground mb-4">
        NativeWind Test
      </Text>
      
      <View className="bg-card border border-border rounded-lg p-4 mb-4">
        <Text className="text-card-foreground">
          This card uses NativeWind classes from our design system.
        </Text>
      </View>
      
      <Pressable className="bg-primary px-6 py-3 rounded-lg mb-2 active:opacity-80">
        <Text className="text-primary-foreground text-center font-medium">
          Primary Button
        </Text>
      </Pressable>
      
      <Pressable className="bg-secondary border border-border px-6 py-3 rounded-lg mb-2 active:bg-accent">
        <Text className="text-secondary-foreground text-center font-medium">
          Secondary Button
        </Text>
      </Pressable>
      
      <View className="bg-destructive px-4 py-2 rounded-lg">
        <Text className="text-destructive-foreground text-sm">
          Error message styling
        </Text>
      </View>
    </View>
  );
}