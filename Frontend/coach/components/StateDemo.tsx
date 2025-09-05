/**
 * State Management Demo Component - MIGRATED ✅
 * Demonstrates the new Zustand stores in action
 * 
 * MIGRATION NOTES:
 * - Converted from StyleSheet to NativeWind classes
 * - Uses unified theme system with Figma colors
 * - All colors now come from CSS variables
 * - Automatic light/dark mode support
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useWorkout } from '../hooks/use-workout';
import { useUser } from '../hooks/use-user';
import { useExerciseStore } from '../stores/exercise-store';
import { useUnifiedTheme } from '../hooks/use-unified-theme';

export function StateDemo() {
  const [selectedTab, setSelectedTab] = useState<'workout' | 'user' | 'exercises' | 'theme'>('workout');
  
  // Store hooks
  const workout = useWorkout();
  const user = useUser();
  const exerciseStore = useExerciseStore();
  const theme = useUnifiedTheme();

  const renderWorkoutDemo = () => (
    <View className="bg-card p-4 rounded-lg mb-4 border border-border">
      <Text className="text-lg font-semibold mb-3 text-card-foreground">Workout Store</Text>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-foreground">Active: {workout.isActive ? 'Yes' : 'No'}</Text>
        <Text className="text-foreground">Exercises: {workout.exercises.length}</Text>
      </View>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-foreground">Title: "{workout.title}"</Text>
        <Text className="text-foreground">Weight Unit: {workout.weightUnit}</Text>
      </View>
      
      <TouchableOpacity 
        className="bg-primary py-2.5 px-4 rounded-md my-1 items-center active:opacity-80" 
        onPress={() => workout.updateWorkoutTitle('Demo Workout')}
      >
        <Text className="text-primary-foreground font-semibold text-sm">Set Demo Title</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-primary py-2.5 px-4 rounded-md my-1 items-center active:opacity-80" 
        onPress={() => {
          const demoExercises = [
            { id: 1, name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', selected: true },
            { id: 2, name: 'Squats', muscle: 'Legs', equipment: 'Barbell', selected: true }
          ];
          workout.addExercises(demoExercises);
        }}
      >
        <Text className="text-primary-foreground font-semibold text-sm">Add Demo Exercises</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-destructive py-2.5 px-4 rounded-md my-1 items-center active:opacity-80" 
        onPress={() => workout.clearAllExercises()}
      >
        <Text className="text-destructive-foreground font-semibold text-sm">Clear Workout</Text>
      </TouchableOpacity>
      
      {workout.error && (
        <Text className="text-destructive text-xs mt-2 italic">Error: {workout.error}</Text>
      )}
    </View>
  );

  const renderUserDemo = () => (
    <View className="bg-card p-4 rounded-lg mb-4 border border-border">
      <Text className="text-lg font-semibold mb-3 text-card-foreground">User Store</Text>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-foreground">Weight Unit: {user.weightUnit}</Text>
        <Text className="text-foreground">Can Change: {user.canChangeWeightUnit ? 'Yes' : 'No'}</Text>
      </View>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-foreground">Signed In: {user.isSignedIn ? 'Yes' : 'No'}</Text>
        <Text className="text-foreground">Guest: {user.isGuest ? 'Yes' : 'No'}</Text>
      </View>
      
      <TouchableOpacity 
        className="bg-primary py-2.5 px-4 rounded-md my-1 items-center active:opacity-80" 
        onPress={() => user.setWeightUnit(user.weightUnit === 'kg' ? 'lbs' : 'kg')}
      >
        <Text className="text-primary-foreground font-semibold text-sm">Toggle Weight Unit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-primary py-2.5 px-4 rounded-md my-1 items-center active:opacity-80" 
        onPress={() => user.isSignedIn ? user.signOut() : user.signIn()}
      >
        <Text className="text-primary-foreground font-semibold text-sm">
          {user.isSignedIn ? 'Sign Out' : 'Sign In'}
        </Text>
      </TouchableOpacity>
      
      {user.error && (
        <Text className="text-destructive text-xs mt-2 italic">Error: {user.error}</Text>
      )}
    </View>
  );

  const renderExerciseDemo = () => (
    <View className="bg-card p-4 rounded-lg mb-4 border border-border">
      <Text className="text-lg font-semibold mb-3 text-card-foreground">Exercise Store</Text>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-foreground">Total: {exerciseStore.exercises.length}</Text>
        <Text className="text-foreground">Selected: {exerciseStore.selectedExercises.length}</Text>
      </View>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-foreground">Search: "{exerciseStore.filters.searchTerm}"</Text>
        <Text className="text-foreground">Muscle Filters: {exerciseStore.filters.muscle.length}</Text>
      </View>
      
      <TouchableOpacity 
        className="bg-primary py-2.5 px-4 rounded-md my-1 items-center active:opacity-80" 
        onPress={() => exerciseStore.searchExercises('bench')}
      >
        <Text className="text-primary-foreground font-semibold text-sm">Search "bench"</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-primary py-2.5 px-4 rounded-md my-1 items-center active:opacity-80" 
        onPress={() => exerciseStore.filterByMuscle(['Chest'])}
      >
        <Text className="text-primary-foreground font-semibold text-sm">Filter Chest</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-primary py-2.5 px-4 rounded-md my-1 items-center active:opacity-80" 
        onPress={() => exerciseStore.clearFilters()}
      >
        <Text className="text-primary-foreground font-semibold text-sm">Clear Filters</Text>
      </TouchableOpacity>
      
      
      {exerciseStore.error && (
        <Text className="text-destructive text-xs mt-2 italic">Error: {exerciseStore.error}</Text>
      )}
    </View>
  );

  const renderThemeDemo = () => (
    <View className="bg-card p-4 rounded-lg mb-4 border border-border">
      <Text className="text-lg font-semibold mb-3 text-card-foreground">Theme Store</Text>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-foreground">Theme: {theme.colorScheme}</Text>
        <Text className="text-foreground">Is Dark: {theme.isDark ? 'Yes' : 'No'}</Text>
      </View>
      
      {/* Show actual color values being used */}
      <View className="bg-muted p-2 rounded mb-3">
        <Text className="text-muted-foreground text-xs mb-1">Current Colors:</Text>
        <Text className="text-muted-foreground text-xs">Primary: {theme.newTokens.colors.primary}</Text>
        <Text className="text-muted-foreground text-xs">Background: {theme.newTokens.colors.background}</Text>
      </View>
      
      <TouchableOpacity 
        className="bg-primary py-2.5 px-4 rounded-md my-1 items-center active:opacity-80" 
        onPress={() => theme.toggleColorScheme()}
      >
        <Text className="text-primary-foreground font-semibold text-sm">Toggle Theme</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-secondary border border-border py-2.5 px-4 rounded-md my-1 items-center active:bg-accent" 
        onPress={() => theme.setColorScheme('light')}
      >
        <Text className="text-secondary-foreground font-semibold text-sm">Force Light</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-secondary border border-border py-2.5 px-4 rounded-md my-1 items-center active:bg-accent" 
        onPress={() => theme.setColorScheme('dark')}
      >
        <Text className="text-secondary-foreground font-semibold text-sm">Force Dark</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      <Text className="text-2xl font-bold text-center mb-5 text-foreground">
        Zustand State Management Demo
      </Text>
      
      {/* Migration indicator */}
      <View className="bg-primary/10 p-3 rounded-lg mb-5 border border-primary/20">
        <Text className="text-primary text-sm font-medium text-center">
          ✅ MIGRATED: Now using unified theme system with Figma colors
        </Text>
      </View>
      
      <View className="flex-row mb-5 rounded-lg bg-secondary p-1">
        {(['workout', 'user', 'exercises', 'theme'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-2 px-3 rounded-md items-center ${
              selectedTab === tab ? 'bg-primary' : ''
            }`}
            onPress={() => setSelectedTab(tab)}
          >
            <Text className={`text-sm ${
              selectedTab === tab 
                ? 'text-primary-foreground font-semibold' 
                : 'text-muted-foreground'
            }`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {selectedTab === 'workout' && renderWorkoutDemo()}
      {selectedTab === 'user' && renderUserDemo()}
      {selectedTab === 'exercises' && renderExerciseDemo()}
      {selectedTab === 'theme' && renderThemeDemo()}
    </ScrollView>
  );
}

// ✅ MIGRATION COMPLETE: All StyleSheet removed
// All styling now uses NativeWind classes with Figma design tokens

export default StateDemo;

// MIGRATION NOTES:
// ✅ Converted from StyleSheet.create to NativeWind classes
// ✅ All hardcoded colors (#007AFF, #FF3B30, etc.) replaced with theme tokens
// ✅ Uses unified theme system: primary = #00b561 (exact Figma value)
// ✅ Automatic light/dark mode support
// ✅ Shows actual color values being used in theme demo
// ✅ Added migration indicator to show successful conversion