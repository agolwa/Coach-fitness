/**
 * ExerciseDetailScreen - React Native Implementation
 * Task 4.6.1: Convert ExerciseDetailScreen.tsx to React Native components
 * 
 * Features:
 * - Set management (weight, reps, notes)
 * - Bodyweight exercise handling
 * - Set validation logic
 * - Set deletion with confirmation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useWorkoutStore } from '../../stores/workout-store';
import { useUserStore } from '../../stores/user-store';
import { useTheme } from '../../hooks/use-theme';
import type { DetailSet, WorkoutExercise, WeightUnit } from '../../types/workout';

// Set interface for this screen
interface Set {
  id: number;
  weight: number;
  reps: number;
  notes: string;
}

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    exerciseId?: string;
    exerciseName?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { theme, colorScheme } = useTheme();
  const colors = theme.colors;
  const isDark = colorScheme === 'dark';
  
  // Store hooks
  const { 
    exercises, 
    updateExerciseSets, 
    isLoading,
    error,
    clearError,
  } = useWorkoutStore();
  const { weightUnit } = useUserStore();
  
  // Get current exercise
  const exerciseId = params.exerciseId ? parseInt(params.exerciseId) : null;
  const currentExercise = exerciseId ? exercises.find(ex => ex.id === exerciseId) : null;
  const exerciseName = params.exerciseName || currentExercise?.name || 'Unknown Exercise';

  // Local state
  const [weight, setWeight] = useState(50);
  const [reps, setReps] = useState(8);
  const [notes, setNotes] = useState('');
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [currentSets, setCurrentSets] = useState<Set[]>([]);
  
  // Input editing states
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isEditingReps, setIsEditingReps] = useState(false);
  const [weightInput, setWeightInput] = useState('50');
  const [repsInput, setRepsInput] = useState('8');
  
  // Change tracking
  const [originalWeight, setOriginalWeight] = useState<number | null>(null);
  const [originalReps, setOriginalReps] = useState<number | null>(null);
  const [originalNotes, setOriginalNotes] = useState('');

  // Check if exercise is bodyweight
  const isBodyweightExercise = () => {
    const name = exerciseName.toLowerCase();
    return name.includes('pull-up') || name.includes('push-up') || 
           name.includes('dip') || name.includes('squat') ||
           name.includes('plank') || name.includes('crunch');
  };

  // Initialize sets from current exercise
  useEffect(() => {
    if (currentExercise?.detailSets) {
      const sets: Set[] = currentExercise.detailSets.map((set, index) => ({
        id: set.id || index + 1,
        weight: set.weight,
        reps: set.reps,
        notes: set.notes,
      }));
      setCurrentSets(sets);
    }
  }, [currentExercise]);

  // Validation for numeric input
  const validateNumericInput = (value: string): boolean => {
    return /^$|^\d*\.?\d*$/.test(value) && (value.match(/\./g) || []).length <= 1;
  };

  // Weight control handlers
  const handleWeightChange = (delta: number) => {
    if (isBodyweightExercise() && weight + delta <= 0) return; // Prevent negative for bodyweight
    setWeight(prev => Math.max(0, prev + delta));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Reps control handlers
  const handleRepsChange = (delta: number) => {
    setReps(prev => Math.max(0, prev + delta));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Input change handlers
  const handleWeightInputChange = (value: string) => {
    if (validateNumericInput(value)) {
      setWeightInput(value);
    }
  };

  const handleRepsInputChange = (value: string) => {
    if (validateNumericInput(value)) {
      setRepsInput(value);
    }
  };

  // Input submission handlers
  const handleWeightInputSubmit = () => {
    const numValue = parseFloat(weightInput);
    if (!isNaN(numValue) && numValue >= 0) {
      setWeight(numValue);
    } else {
      setWeightInput(weight.toString());
    }
    setIsEditingWeight(false);
  };

  const handleRepsInputSubmit = () => {
    const numValue = parseInt(repsInput);
    if (!isNaN(numValue) && numValue >= 0) {
      setReps(numValue);
    } else {
      setRepsInput(reps.toString());
    }
    setIsEditingReps(false);
  };

  // Input click handlers
  const handleWeightClick = () => {
    setWeightInput(weight.toString());
    setIsEditingWeight(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRepsClick = () => {
    setRepsInput(reps.toString());
    setIsEditingReps(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Set selection handler
  const handleSetSelect = (setId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Toggle functionality
    if (selectedSetId === setId) {
      setSelectedSetId(null);
      resetForm();
      return;
    }

    // Select new set
    const selectedSet = currentSets.find(set => set.id === setId);
    if (selectedSet) {
      setSelectedSetId(setId);
      setWeight(selectedSet.weight);
      setReps(selectedSet.reps);
      setNotes(selectedSet.notes);
      setWeightInput(selectedSet.weight.toString());
      setRepsInput(selectedSet.reps.toString());
      
      // Store original values for change detection
      setOriginalWeight(selectedSet.weight);
      setOriginalReps(selectedSet.reps);
      setOriginalNotes(selectedSet.notes);
    }
  };

  // Form reset helper
  const resetForm = () => {
    setWeight(50);
    setReps(8);
    setNotes('');
    setWeightInput('50');
    setRepsInput('8');
    setOriginalWeight(null);
    setOriginalReps(null);
    setOriginalNotes('');
  };

  // Add set handler
  const handleAddSet = () => {
    const newSet: Set = {
      id: Date.now(),
      weight: isBodyweightExercise() && weight === 50 ? 0 : weight, // Default to 0 for bodyweight
      reps,
      notes,
    };

    const updatedSets = [...currentSets, newSet];
    setCurrentSets(updatedSets);

    // Update workout store
    if (exerciseId) {
      const detailSets: DetailSet[] = updatedSets.map((set, index) => ({
        id: index + 1,
        weight: set.weight,
        reps: set.reps,
        notes: set.notes,
      }));
      updateExerciseSets(exerciseId, detailSets);
    }

    resetForm();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Update set handler
  const handleUpdateSet = () => {
    if (selectedSetId === null) return;
    
    const updatedSets = currentSets.map(set => 
      set.id === selectedSetId 
        ? { ...set, weight, reps, notes }
        : set
    );
    setCurrentSets(updatedSets);

    // Update workout store
    if (exerciseId) {
      const detailSets: DetailSet[] = updatedSets.map((set, index) => ({
        id: index + 1,
        weight: set.weight,
        reps: set.reps,
        notes: set.notes,
      }));
      updateExerciseSets(exerciseId, detailSets);
    }

    setSelectedSetId(null);
    resetForm();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Delete set handler with confirmation
  const handleDeleteSet = () => {
    if (selectedSetId === null) return;
    
    Alert.alert(
      'Delete Set',
      'Are you sure you want to delete this set?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedSets = currentSets.filter(set => set.id !== selectedSetId);
            setCurrentSets(updatedSets);

            // Update workout store
            if (exerciseId) {
              const detailSets: DetailSet[] = updatedSets.map((set, index) => ({
                id: index + 1,
                weight: set.weight,
                reps: set.reps,
                notes: set.notes,
              }));
              updateExerciseSets(exerciseId, detailSets);
            }

            setSelectedSetId(null);
            resetForm();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  // Back handler
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Check for changes
  const hasChanges = () => {
    if (selectedSetId === null || originalWeight === null || originalReps === null) {
      return false;
    }
    
    return (
      weight !== originalWeight ||
      reps !== originalReps ||
      notes !== originalNotes
    );
  };

  const isUpdateMode = selectedSetId !== null;
  const isDeleteEnabled = selectedSetId !== null;
  const isUpdateEnabled = isUpdateMode && hasChanges();

  // Weight unit display
  const weightUnitDisplay = isBodyweightExercise() ? 'BW' : weightUnit.toUpperCase();

  return (
    <View 
      className="bg-background flex-1"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4 border-b border-border/10">
        <Pressable
          onPress={handleBack}
          className="p-2 -m-2 rounded-lg active:bg-accent"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={colors.foreground} 
          />
        </Pressable>
        <Text className="text-foreground text-lg font-medium flex-1" numberOfLines={1}>
          {exerciseName}
        </Text>
      </View>

      {/* Today Section */}
      <View className="px-6 py-4">
        <View className="relative">
          <Text className="text-muted-foreground text-sm mb-2">Today</Text>
          <View className="absolute bottom-0 left-0 w-12 h-1 bg-primary rounded-full" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Weight and Reps Controls */}
        <View className="px-6 py-6">
          <View className="flex-row gap-8">
            {/* Weight Control */}
            <View className="flex-1 space-y-4">
              <Text className="text-muted-foreground text-xs uppercase tracking-wider">
                Weight ({weightUnitDisplay})
              </Text>
              <View className="flex-row items-center justify-center gap-4">
                <Pressable
                  onPress={() => handleWeightChange(-1)}
                  className="w-12 h-12 border border-border rounded-lg items-center justify-center active:bg-accent"
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Ionicons name="remove" size={20} color={colors.muted.foreground} />
                </Pressable>
                
                {isEditingWeight ? (
                  <TextInput
                    value={weightInput}
                    onChangeText={handleWeightInputChange}
                    onBlur={handleWeightInputSubmit}
                    onSubmitEditing={handleWeightInputSubmit}
                    className="text-4xl font-medium text-foreground min-w-[80px] text-center bg-transparent border-b-2 border-primary"
                    keyboardType="numeric"
                    autoFocus
                    selectTextOnFocus
                  />
                ) : (
                  <Pressable
                    onPress={handleWeightClick}
                    className="min-w-[80px] py-1 px-2 rounded active:bg-accent/50"
                  >
                    <Text className="text-4xl font-medium text-foreground text-center">
                      {isBodyweightExercise() && weight === 0 ? 'BW' : weight}
                    </Text>
                  </Pressable>
                )}
                
                <Pressable
                  onPress={() => handleWeightChange(1)}
                  className="w-12 h-12 border border-border rounded-lg items-center justify-center active:bg-accent"
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Ionicons name="add" size={20} color={colors.muted.foreground} />
                </Pressable>
              </View>
            </View>

            {/* Reps Control */}
            <View className="flex-1 space-y-4">
              <Text className="text-muted-foreground text-xs uppercase tracking-wider">
                Reps
              </Text>
              <View className="flex-row items-center justify-center gap-4">
                <Pressable
                  onPress={() => handleRepsChange(-1)}
                  className="w-12 h-12 border border-border rounded-lg items-center justify-center active:bg-accent"
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Ionicons name="remove" size={20} color={colors.muted.foreground} />
                </Pressable>
                
                {isEditingReps ? (
                  <TextInput
                    value={repsInput}
                    onChangeText={handleRepsInputChange}
                    onBlur={handleRepsInputSubmit}
                    onSubmitEditing={handleRepsInputSubmit}
                    className="text-4xl font-medium text-foreground min-w-[80px] text-center bg-transparent border-b-2 border-primary"
                    keyboardType="numeric"
                    autoFocus
                    selectTextOnFocus
                  />
                ) : (
                  <Pressable
                    onPress={handleRepsClick}
                    className="min-w-[80px] py-1 px-2 rounded active:bg-accent/50"
                  >
                    <Text className="text-4xl font-medium text-foreground text-center">
                      {reps}
                    </Text>
                  </Pressable>
                )}
                
                <Pressable
                  onPress={() => handleRepsChange(1)}
                  className="w-12 h-12 border border-border rounded-lg items-center justify-center active:bg-accent"
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Ionicons name="add" size={20} color={colors.muted.foreground} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Notes Input */}
        <View className="px-6 py-4">
          <View className="space-y-3">
            <Text className="text-muted-foreground text-xs uppercase tracking-wider">
              Notes (Optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this set..."
              placeholderTextColor={colors.muted.foreground}
              className="border border-border rounded-lg px-4 py-3 text-foreground bg-background min-h-[80px]"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 py-4">
          <View className="flex-row gap-4">
            <Pressable
              onPress={isUpdateMode ? handleUpdateSet : handleAddSet}
              disabled={isUpdateMode && !isUpdateEnabled}
              className={`flex-1 h-12 rounded-lg items-center justify-center ${
                isUpdateMode
                  ? isUpdateEnabled
                    ? 'bg-primary'
                    : 'bg-muted opacity-50'
                  : 'bg-primary'
              }`}
              style={{
                opacity: (isUpdateMode && !isUpdateEnabled) ? 0.5 : 1,
              }}
            >
              <Text className="text-primary-foreground font-medium">
                {isUpdateMode ? 'Update' : 'Add'}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDeleteSet}
              disabled={!isDeleteEnabled}
              className={`flex-1 h-12 rounded-lg border items-center justify-center ${
                isDeleteEnabled 
                  ? 'border-destructive bg-transparent' 
                  : 'border-border bg-muted opacity-50'
              }`}
              style={{
                opacity: isDeleteEnabled ? 1 : 0.5,
              }}
            >
              <Text className={`font-medium ${
                isDeleteEnabled ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Sets List */}
        <View className="flex-1 px-6">
          <View className="space-y-3 pt-3 pb-6">
            {currentSets.map((set, index) => (
              <Pressable
                key={set.id}
                onPress={() => handleSetSelect(set.id)}
                className={`bg-card rounded-lg p-4 border ${
                  selectedSetId === set.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border/20 active:bg-accent/20'
                }`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: selectedSetId === set.id ? 4 : 2,
                  },
                  shadowOpacity: selectedSetId === set.id ? 0.15 : 0.1,
                  shadowRadius: selectedSetId === set.id ? 8 : 4,
                  elevation: selectedSetId === set.id ? 8 : 2,
                }}
              >
                <View className="space-y-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center">
                        <Text className="text-sm font-medium text-primary">
                          {index + 1}
                        </Text>
                      </View>
                      <Text className="text-foreground">
                        {isBodyweightExercise() && set.weight === 0 
                          ? 'Bodyweight' 
                          : `${set.weight} ${weightUnit}`
                        }
                      </Text>
                    </View>
                    <Text className="text-foreground">
                      {set.reps} reps
                    </Text>
                  </View>
                  {set.notes && (
                    <Text className="text-sm text-muted-foreground pl-12" numberOfLines={2}>
                      {set.notes}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Loading overlay */}
      {isLoading && (
        <View className="absolute inset-0 bg-background/80 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      )}
    </View>
  );
}