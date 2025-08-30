/**
 * Add Exercises Screen - Modal for selecting exercises
 * Phase 4.5 Implementation - React Native Migration
 */

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useExerciseStore } from '@/stores/exercise-store';
import { useExercises, useExerciseBodyParts, useExerciseEquipment, useOfflineExercises } from '@/hooks/use-exercises';
import { useWorkoutStore } from '@/stores/workout-store';
import { useUserStore } from '@/stores/user-store';
import { useTheme } from '@/hooks/use-theme';
import type { SelectedExercise } from '@/types/workout';

// Dropdown option types
interface DropdownOption {
  label: string;
  value: string;
}

// Dropdown state
interface DropdownState {
  muscle: string;
  equipment: string;
  showMuscleDropdown: boolean;
  showEquipmentDropdown: boolean;
}

export default function AddExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  // Store hooks
  const exerciseStore = useExerciseStore();
  const workoutStore = useWorkoutStore();
  const { weightUnit, isSignedIn } = useUserStore();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dropdown, setDropdown] = useState<DropdownState>({
    muscle: 'All',
    equipment: 'All', 
    showMuscleDropdown: false,
    showEquipmentDropdown: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // React Query hooks for exercise data
  const exerciseFilters = {
    search: debouncedSearchTerm || undefined,
    body_part: dropdown.muscle !== 'All' ? [dropdown.muscle] : undefined,
    equipment: dropdown.equipment !== 'All' ? [dropdown.equipment] : undefined,
    limit: 1000, // Load large batch for better UX
  };

  // Use offline-first approach with server sync
  const {
    exercises: serverExercises,
    isLoading: serverLoading,
    isOffline,
    error: serverError
  } = useOfflineExercises();

  // Load body parts and equipment for dropdowns
  const { data: bodyParts, isLoading: bodyPartsLoading } = useExerciseBodyParts();
  const { data: equipmentTypes, isLoading: equipmentLoading } = useExerciseEquipment();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initialize loading state
  useEffect(() => {
    setIsLoading(serverLoading || bodyPartsLoading || equipmentLoading);
  }, [serverLoading, bodyPartsLoading, equipmentLoading]);

  // Convert server exercises to local format and sync selection state
  const exercises = useMemo(() => {
    if (!serverExercises || serverExercises.length === 0) {
      return exerciseStore.exercises; // Fallback to local store
    }

    // Convert server format to local format while preserving selection state
    return serverExercises.map((exercise, index) => {
      const existingExercise = exerciseStore.exercises.find(ex => 
        ex.name.toLowerCase() === exercise.name.toLowerCase()
      );
      
      return {
        id: parseInt(exercise.id, 10) || index,
        name: exercise.name,
        muscle: Array.isArray(exercise.body_part) ? exercise.body_part[0] : exercise.body_part,
        equipment: Array.isArray(exercise.equipment) ? exercise.equipment[0] : exercise.equipment,
        selected: existingExercise?.selected || false,
      };
    });
  }, [serverExercises, exerciseStore.exercises]);

  // Client-side filtering for immediate feedback
  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply muscle filter
    if (dropdown.muscle !== 'All') {
      filtered = filtered.filter(exercise => 
        exercise.muscle === dropdown.muscle
      );
    }

    // Apply equipment filter
    if (dropdown.equipment !== 'All') {
      filtered = filtered.filter(exercise => 
        exercise.equipment === dropdown.equipment
      );
    }

    return filtered;
  }, [exercises, searchTerm, dropdown.muscle, dropdown.equipment]);

  // Get dropdown options from server data with local fallback
  const muscleOptions = useMemo((): DropdownOption[] => {
    let muscleGroups: string[] = [];
    
    if (bodyParts && bodyParts.length > 0) {
      // Use server data
      muscleGroups = bodyParts.map(bp => bp.name);
    } else {
      // Fallback to local data
      const uniqueMuscles = Array.from(new Set(exercises.map(ex => ex.muscle))).sort();
      muscleGroups = uniqueMuscles;
    }
    
    return [{ label: 'All', value: 'All' }, ...muscleGroups.map(muscle => ({
      label: muscle,
      value: muscle,
    }))];
  }, [bodyParts, exercises]);

  const equipmentOptions = useMemo((): DropdownOption[] => {
    let equipmentList: string[] = [];
    
    if (equipmentTypes && equipmentTypes.length > 0) {
      // Use server data
      equipmentList = equipmentTypes.map(eq => eq.name);
    } else {
      // Fallback to local data
      const uniqueEquipment = Array.from(new Set(exercises.map(ex => ex.equipment))).sort();
      equipmentList = uniqueEquipment;
    }
    
    return [{ label: 'All', value: 'All' }, ...equipmentList.map(equipment => ({
      label: equipment,
      value: equipment,
    }))];
  }, [equipmentTypes, exercises]);

  // Get exercise count information
  const exerciseCount = exercises.length;
  const selectedCount = exercises.filter(ex => ex.selected).length;

  // Direct search - no need for additional debouncing since we have debouncedSearchTerm
  const handleSearchChange = useCallback((text: string) => {
    setSearchTerm(text);
    // The useEffect above handles debouncing for server requests
  }, []);

  // Handle search input
  const handleSearch = handleSearchChange;

  // Handle muscle dropdown selection
  const handleMuscleSelect = (muscle: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setDropdown(prev => ({
      ...prev,
      muscle,
      showMuscleDropdown: false,
    }));
    
    // Filtering is now handled by filteredExercises memo
  };

  // Handle equipment dropdown selection
  const handleEquipmentSelect = (equipment: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setDropdown(prev => ({
      ...prev,
      equipment,
      showEquipmentDropdown: false,
    }));
    
    // Filtering is now handled by filteredExercises memo
  };

  // Handle exercise selection toggle
  const handleExerciseToggle = useCallback((exerciseId: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      exerciseStore.toggleExerciseSelection(exerciseId);
      
      // Force re-render by updating exercises array
      const updatedExercises = exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, selected: !ex.selected } : ex
      );
      // Note: This will be handled by the store, but we ensure UI updates immediately
    } catch (error) {
      console.error('Error toggling exercise selection:', error);
      Alert.alert('Error', 'Failed to select exercise. Please try again.');
    }
  }, [exercises, exerciseStore]);

  // Handle select all exercises
  const handleSelectAll = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Select all filtered exercises
      filteredExercises.forEach(exercise => {
        if (!exercise.selected) {
          exerciseStore.toggleExerciseSelection(exercise.id);
        }
      });
    } catch (error) {
      console.error('Error selecting all exercises:', error);
      Alert.alert('Error', 'Failed to select all exercises.');
    }
  }, [filteredExercises, exerciseStore]);

  // Handle clear all selections
  const handleClearSelection = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      exerciseStore.clearSelection();
    } catch (error) {
      console.error('Error clearing selection:', error);
      Alert.alert('Error', 'Failed to clear selection.');
    }
  }, [exerciseStore]);

  // Handle adding selected exercises to workout
  const handleAddExercises = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      const selectedExercises = exercises.filter(ex => ex.selected);
      
      if (selectedExercises.length === 0) {
        Alert.alert('No Exercises Selected', 'Please select at least one exercise to add to your workout.');
        return;
      }

      // Add to workout store
      workoutStore.addExercises(selectedExercises);
      
      // Clear selection for next time
      exerciseStore.clearSelection();
      
      // Navigate back to home screen
      try {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push('/(tabs)');
        }
      } catch (error) {
        console.error('Navigation error after adding exercises:', error);
        router.push('/(tabs)');
      }
      
      // Show success feedback
      setTimeout(() => {
        Alert.alert(
          'Success!',
          `${selectedExercises.length} exercise${selectedExercises.length > 1 ? 's' : ''} added to your workout!`
        );
      }, 100);
    } catch (error) {
      console.error('Error adding exercises:', error);
      Alert.alert('Error', 'Failed to add exercises to workout. Please try again.');
    }
  }, [exercises, workoutStore, exerciseStore]);

  // Handle close/back navigation
  const handleClose = () => {
    console.log('Back button pressed, selectedCount:', selectedCount);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      if (selectedCount > 0) {
        Alert.alert(
          'Discard Selection?',
          `You have ${selectedCount} exercise${selectedCount > 1 ? 's' : ''} selected. Are you sure you want to go back?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Discard', 
              style: 'destructive',
              onPress: () => {
                exerciseStore.clearSelection();
                // Try multiple navigation methods
                console.log('Attempting navigation back...');
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push('/(tabs)');
                }
              }
            },
          ]
        );
      } else {
        // Try multiple navigation methods
        console.log('Attempting navigation back...');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      router.push('/(tabs)');
    }
  };

  // Handle clear all filters
  const handleClearFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setDropdown(prev => ({
      ...prev,
      muscle: 'All',
      equipment: 'All',
      showMuscleDropdown: false,
      showEquipmentDropdown: false,
    }));
  }, []);

  // Toggle dropdown visibility
  const toggleMuscleDropdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDropdown(prev => ({
      ...prev,
      showMuscleDropdown: !prev.showMuscleDropdown,
      showEquipmentDropdown: false, // Close other dropdown
    }));
  };

  const toggleEquipmentDropdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDropdown(prev => ({
      ...prev,
      showEquipmentDropdown: !prev.showEquipmentDropdown,
      showMuscleDropdown: false, // Close other dropdown
    }));
  };

  // Close dropdowns when clicking outside
  const closeDropdowns = () => {
    setDropdown(prev => ({
      ...prev,
      showMuscleDropdown: false,
      showEquipmentDropdown: false,
    }));
  };

  // Get exercise icon based on muscle group
  const getExerciseIcon = (muscle: string): string => {
    const icons: { [key: string]: string } = {
      'Chest': '🏋🏼‍♂️',
      'Back': '🔥',
      'Shoulders': '🏆',
      'Arms': '💪',
      'Legs': '🥇',
      'Core': '⚡',
    };
    return icons[muscle] || '🏋🏼‍♂️';
  };

  // Render exercise item
  const renderExerciseItem = ({ item }: { item: SelectedExercise }) => {
    const isSelected = item.selected || false;
    
    return (
      <TouchableOpacity
        onPress={() => handleExerciseToggle(item.id)}
        className={`bg-card rounded-lg p-4 mb-3 border-2 ${
          isSelected ? 'border-primary' : 'border-border'
        }`}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Exercise Icon */}
          <View className="w-12 h-12 bg-muted rounded-full items-center justify-center mr-3">
            <Text className="text-xl">{getExerciseIcon(item.muscle)}</Text>
          </View>
          
          {/* Exercise Info */}
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground mb-1">
              {item.name}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-sm text-muted.foreground">
                {item.muscle}
              </Text>
              <View className="w-1 h-1 bg-muted.foreground rounded-full mx-2" />
              <Text className="text-sm text-muted.foreground">
                {item.equipment}
              </Text>
            </View>
          </View>
          
          {/* Selection Checkbox */}
          <View className={`w-6 h-6 rounded border-2 items-center justify-center ${
            isSelected 
              ? 'bg-primary border-primary' 
              : 'border-muted.foreground'
          }`}>
            {isSelected && (
              <Ionicons 
                name="checkmark" 
                size={16} 
                color="white" 
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render dropdown option
  const renderDropdownOption = ({ 
    option, 
    onPress,
    isSelected,
  }: { 
    option: DropdownOption; 
    onPress: (value: string) => void;
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      onPress={() => onPress(option.value)}
      className={`px-4 py-3 ${
        isSelected ? 'bg-primary/10' : 'bg-card'
      }`}
      activeOpacity={0.7}
    >
      <Text className={`text-base ${
        isSelected 
          ? 'text-primary font-semibold' 
          : 'text-foreground'
      }`}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  // Render dropdown button
  const renderDropdownButton = ({
    label,
    isOpen,
    onPress,
  }: {
    label: string;
    isOpen: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`border rounded-xl px-4 py-3 flex-row items-center justify-between flex-1 ${
        isOpen ? 'border-primary bg-primary/5' : 'border-border bg-muted'
      }`}
      activeOpacity={0.7}
    >
      <Text className={`font-medium ${
        isOpen ? 'text-primary' : 'text-foreground'
      }`}>{label}</Text>
      <Ionicons 
        name={isOpen ? "chevron-up" : "chevron-down"} 
        size={16} 
        color={isOpen ? theme.colors.primary : theme.colors.foreground} 
      />
    </TouchableOpacity>
  );

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="text-muted.foreground mt-4 text-center">
            {isOffline ? 'Loading from local database...' : 'Loading exercise database...'}
          </Text>
          <Text className="text-muted.foreground text-sm text-center mt-2">
            {isOffline ? 'Working offline' : 'Please wait a moment'}
          </Text>
        </View>
      </View>
    );
  }

  // Show error state if no exercises loaded
  if (!isLoading && exercises.length === 0) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="warning" size={48} color={theme.colors.muted.foreground} />
          <Text className="text-foreground text-lg font-semibold mt-4 text-center">No Exercises Available</Text>
          <Text className="text-muted.foreground text-center mt-2">
            {isOffline ? 'Unable to load exercises offline.' : 'Unable to load the exercise database.'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary px-6 py-3 rounded-xl mt-6"
            activeOpacity={0.9}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4 border-b border-border bg-background">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => {
                  console.log('Back button touch detected');
                  handleClose();
                }} 
                className="mr-3 p-3"
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={24} 
                  color={theme.colors.foreground} 
                />
              </TouchableOpacity>
              <Text className="text-lg font-medium text-foreground">
                Add exercises
              </Text>
          </View>
          
          {selectedCount > 0 && (
            <View className="bg-primary w-8 h-8 rounded-full items-center justify-center">
              <Text className="text-white text-sm font-bold">
                {selectedCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 py-4">
        <View className="relative">
          <Ionicons 
            name="search" 
            size={18} 
            color={theme.colors.muted.foreground} 
            style={{ position: 'absolute', left: 16, top: 14, zIndex: 1 }}
          />
          <TextInput
            value={searchTerm}
            onChangeText={handleSearch}
            placeholder="Search exercises..."
            placeholderTextColor={theme.colors.muted.foreground}
            className="bg-muted border border-border rounded-xl pl-12 pr-4 py-3 text-foreground text-base"
            selectionColor={theme.colors.primary}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Filter Section */}
      <View className="px-6 pb-4 relative">
        {/* Dropdown Buttons */}
        <View className="flex-row mb-4 gap-3">
          <View className="flex-1 relative">
            {renderDropdownButton({
              label: dropdown.muscle,
              isOpen: dropdown.showMuscleDropdown,
              onPress: toggleMuscleDropdown,
            })}
            
            {/* Muscle Dropdown */}
            {dropdown.showMuscleDropdown && (
              <View className="absolute top-full left-0 right-0 bg-card border border-border rounded-xl mt-1 z-50 shadow-lg">
                {muscleOptions.map((option, index) => (
                  <View key={option.value}>
                    {renderDropdownOption({
                      option,
                      onPress: handleMuscleSelect,
                      isSelected: dropdown.muscle === option.value,
                    })}
                  </View>
                ))}
              </View>
            )}
          </View>
          
          <View className="flex-1 relative">
            {renderDropdownButton({
              label: dropdown.equipment,
              isOpen: dropdown.showEquipmentDropdown,
              onPress: toggleEquipmentDropdown,
            })}
            
            {/* Equipment Dropdown */}
            {dropdown.showEquipmentDropdown && (
              <View className="absolute top-full left-0 right-0 bg-card border border-border rounded-xl mt-1 z-50 shadow-lg">
                {equipmentOptions.map((option, index) => (
                  <View key={option.value}>
                    {renderDropdownOption({
                      option,
                      onPress: handleEquipmentSelect,
                      isSelected: dropdown.equipment === option.value,
                    })}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        
        {/* Clear Filters Button */}
        {(dropdown.muscle !== 'All' || dropdown.equipment !== 'All' || searchTerm !== '') && (
          <View className="flex-row justify-end mb-3">
            <TouchableOpacity
              onPress={handleClearFilters}
              className="bg-muted border border-border rounded-lg px-4 py-2 flex-row items-center"
              activeOpacity={0.7}
            >
              <Ionicons 
                name="close" 
                size={16} 
                color={theme.colors.foreground} 
              />
              <Text className="text-foreground ml-2">Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Exercise Count and Actions */}
        <View className="flex-row items-center justify-between">
          <Text className="text-muted.foreground text-sm">
            {searchTerm || dropdown.muscle !== 'All' || dropdown.equipment !== 'All' ? (
              `Showing ${filteredExercises.length} of ${exercises.length} exercises`
            ) : (
              `${exercises.length} exercises`
            )}
            {isOffline && (
              <Text className="text-yellow-600 text-xs mt-1">• Working offline</Text>
            )}
          </Text>
          
          {filteredExercises.length > 0 && (
            <View className="flex-row">
              <TouchableOpacity 
                onPress={handleSelectAll}
                className="mr-3"
                activeOpacity={0.7}
              >
                <Text className="text-primary text-sm font-medium">Select All</Text>
              </TouchableOpacity>
              
              {selectedCount > 0 && (
                <TouchableOpacity 
                  onPress={handleClearSelection}
                  activeOpacity={0.7}
                >
                  <Text className="text-red-500 text-sm font-medium">Clear ({selectedCount})</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Exercise List */}
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={closeDropdowns}
        className="flex-1"
      >
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ 
            paddingHorizontal: 24, 
            paddingBottom: selectedCount > 0 ? 100 : 24 
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Ionicons 
                name="search" 
                size={48} 
                color={theme.colors.muted.foreground} 
              />
              <Text className="text-foreground text-center mt-4 text-lg font-medium">
                No exercises found
              </Text>
              <Text className="text-muted.foreground text-center mt-2 text-sm">
                {searchTerm 
                  ? `No results for "${searchTerm}"`
                  : 'Try adjusting your filters'
                }
              </Text>
              {(searchTerm || dropdown.muscle !== 'All' || dropdown.equipment !== 'All') && (
                <TouchableOpacity
                  onPress={handleClearFilters}
                  className="bg-muted px-4 py-2 rounded-lg mt-4"
                  activeOpacity={0.7}
                >
                  <Text className="text-primary font-medium">Clear all filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </TouchableOpacity>

      {/* Bottom Action Button */}
      {selectedCount > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-4">
          <TouchableOpacity
            onPress={handleAddExercises}
            className="bg-primary py-4 rounded-xl"
            activeOpacity={0.9}
          >
            <Text className="text-white text-center font-semibold text-base">
              Add {selectedCount} exercise{selectedCount > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Display */}
      {(exerciseStore.error || serverError) && (
        <View className="absolute top-20 left-4 right-4 bg-destructive p-3 rounded-lg">
          <Text className="text-destructive-foreground text-center">
            {serverError?.message || exerciseStore.error || 'An error occurred'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (exerciseStore.error) {
                exerciseStore.clearError();
              }
            }}
            className="absolute top-1 right-3"
          >
            <Ionicons name="close" size={16} color={theme.colors.background} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}