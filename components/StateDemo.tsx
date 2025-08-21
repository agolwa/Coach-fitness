/**
 * State Management Demo Component
 * Demonstrates the new Zustand stores in action
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useWorkout } from '../hooks/use-workout';
import { useUser } from '../hooks/use-user';
import { useExerciseStore } from '../stores/exercise-store';
import { useTheme } from '../hooks/use-theme';

export function StateDemo() {
  const [selectedTab, setSelectedTab] = useState<'workout' | 'user' | 'exercises' | 'theme'>('workout');
  
  // Store hooks
  const workout = useWorkout();
  const user = useUser();
  const exerciseStore = useExerciseStore();
  const theme = useTheme();

  const renderWorkoutDemo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Workout Store</Text>
      
      <View style={styles.row}>
        <Text>Active: {workout.isActive ? 'Yes' : 'No'}</Text>
        <Text>Exercises: {workout.exercises.length}</Text>
      </View>
      
      <View style={styles.row}>
        <Text>Title: "{workout.title}"</Text>
        <Text>Weight Unit: {workout.weightUnit}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => workout.updateWorkoutTitle('Demo Workout')}
      >
        <Text style={styles.buttonText}>Set Demo Title</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          const demoExercises = [
            { id: 1, name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', selected: true },
            { id: 2, name: 'Squats', muscle: 'Legs', equipment: 'Barbell', selected: true }
          ];
          workout.addExercises(demoExercises);
        }}
      >
        <Text style={styles.buttonText}>Add Demo Exercises</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.dangerButton]} 
        onPress={() => workout.clearAllExercises()}
      >
        <Text style={styles.buttonText}>Clear Workout</Text>
      </TouchableOpacity>
      
      {workout.error && (
        <Text style={styles.error}>Error: {workout.error}</Text>
      )}
    </View>
  );

  const renderUserDemo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>User Store</Text>
      
      <View style={styles.row}>
        <Text>Weight Unit: {user.weightUnit}</Text>
        <Text>Can Change: {user.canChangeWeightUnit ? 'Yes' : 'No'}</Text>
      </View>
      
      <View style={styles.row}>
        <Text>Signed In: {user.isSignedIn ? 'Yes' : 'No'}</Text>
        <Text>Guest: {user.isGuest ? 'Yes' : 'No'}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => user.setWeightUnit(user.weightUnit === 'kg' ? 'lbs' : 'kg')}
      >
        <Text style={styles.buttonText}>Toggle Weight Unit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => user.isSignedIn ? user.signOut() : user.signIn()}
      >
        <Text style={styles.buttonText}>
          {user.isSignedIn ? 'Sign Out' : 'Sign In'}
        </Text>
      </TouchableOpacity>
      
      {user.error && (
        <Text style={styles.error}>Error: {user.error}</Text>
      )}
    </View>
  );

  const renderExerciseDemo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Exercise Store</Text>
      
      <View style={styles.row}>
        <Text>Total: {exerciseStore.exercises.length}</Text>
        <Text>Selected: {exerciseStore.selectedExercises.length}</Text>
      </View>
      
      <View style={styles.row}>
        <Text>Search: "{exerciseStore.filters.searchTerm}"</Text>
        <Text>Muscle Filters: {exerciseStore.filters.muscle.length}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => exerciseStore.searchExercises('bench')}
      >
        <Text style={styles.buttonText}>Search "bench"</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => exerciseStore.filterByMuscle(['Chest'])}
      >
        <Text style={styles.buttonText}>Filter Chest</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => exerciseStore.clearFilters()}
      >
        <Text style={styles.buttonText}>Clear Filters</Text>
      </TouchableOpacity>
      
      {exerciseStore.error && (
        <Text style={styles.error}>Error: {exerciseStore.error}</Text>
      )}
    </View>
  );

  const renderThemeDemo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Theme Store</Text>
      
      <View style={styles.row}>
        <Text>Theme: {theme.colorScheme}</Text>
        <Text>Is Dark: {theme.isDark ? 'Yes' : 'No'}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => theme.toggleColorScheme()}
      >
        <Text style={styles.buttonText}>Toggle Theme</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => theme.setColorScheme('light')}
      >
        <Text style={styles.buttonText}>Force Light</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => theme.setColorScheme('dark')}
      >
        <Text style={styles.buttonText}>Force Dark</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Zustand State Management Demo</Text>
      
      <View style={styles.tabs}>
        {(['workout', 'user', 'exercises', 'theme'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default StateDemo;