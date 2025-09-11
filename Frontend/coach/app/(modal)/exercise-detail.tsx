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
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useWorkoutStore } from '../../stores/workout-store';
import { useUserStore } from '../../stores/user-store';
import { useUnifiedColors } from '../../hooks/use-unified-theme';
import { showDestructive } from '@/utils/alert-utils';
import type { DetailSet } from '../../types/workout';

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
  const colors = useUnifiedColors();
  
  // Store hooks
  const { 
    exercises, 
    updateExerciseSets, 
    isLoading,
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
    
    showDestructive(
      'Delete Set',
      'Are you sure you want to delete this set?',
      () => {
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
      }
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
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2 -m-2 rounded-lg"
            activeOpacity={0.7}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={colors.tokens.foreground} 
            />
          </TouchableOpacity>
          
          <Text className="text-foreground text-lg font-semibold">
            {exerciseName}
          </Text>
          
          <View className="w-6" />
        </View>
      </View>

      {/* Today Section */}
      <View className="px-6 mb-4">
        <Text className="text-muted-foreground text-base font-medium">Today&apos;s Sets</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Weight and Reps Controls */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-8">
              {/* Weight Control */}
              <View className="flex-1">
                <Text className="text-muted-foreground text-sm font-medium mb-4">
                  Weight ({weightUnitDisplay})
                </Text>
                <View className="flex-row items-center justify-center gap-1">
                  <TouchableOpacity
                    onPress={() => handleWeightChange(-1)}
                    className="w-12 h-12 bg-secondary border border-border rounded-lg items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={20} color={colors.tokens.mutedForeground} />
                  </TouchableOpacity>
                  
                  {isEditingWeight ? (
                    <TextInput
                      value={weightInput}
                      onChangeText={handleWeightInputChange}
                      onBlur={handleWeightInputSubmit}
                      onSubmitEditing={handleWeightInputSubmit}
                      className="text-3xl font-semibold text-foreground min-w-[80px] text-center bg-transparent border-b-2 border-primary"
                      keyboardType="numeric"
                      autoFocus
                      selectTextOnFocus
                      style={{ color: colors.tokens.foreground }}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={handleWeightClick}
                      className="min-w-[80px] py-2"
                      activeOpacity={0.7}
                    >
                      <Text className="text-3xl font-semibold text-foreground text-center">
                        {isBodyweightExercise() && weight === 0 ? 'BW' : weight}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    onPress={() => handleWeightChange(1)}
                    className="w-12 h-12 bg-secondary border border-border rounded-lg items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color={colors.tokens.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reps Control */}
              <View className="flex-1">
                <Text className="text-muted-foreground text-sm font-medium mb-4">
                  Reps
                </Text>
                <View className="flex-row items-center justify-center gap-1">
                  <TouchableOpacity
                    onPress={() => handleRepsChange(-1)}
                    className="w-12 h-12 bg-secondary border border-border rounded-lg items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={20} color={colors.tokens.mutedForeground} />
                  </TouchableOpacity>
                  
                  {isEditingReps ? (
                    <TextInput
                      value={repsInput}
                      onChangeText={handleRepsInputChange}
                      onBlur={handleRepsInputSubmit}
                      onSubmitEditing={handleRepsInputSubmit}
                      className="text-3xl font-semibold text-foreground min-w-[80px] text-center bg-transparent border-b-2 border-primary"
                      keyboardType="numeric"
                      autoFocus
                      selectTextOnFocus
                      style={{ color: colors.tokens.foreground }}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={handleRepsClick}
                      className="min-w-[80px] py-2"
                      activeOpacity={0.7}
                    >
                      <Text className="text-3xl font-semibold text-foreground text-center">
                        {reps}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    onPress={() => handleRepsChange(1)}
                    className="w-12 h-12 bg-secondary border border-border rounded-lg items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color={colors.tokens.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>
          </View>
        </View>

        {/* Notes Input */}
        <View className="px-6 mb-6">
          <View className="bg-card border border-border rounded-xl p-4">
            <Text className="text-muted-foreground text-sm font-medium mb-3">
              Notes (Optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this set..."
              placeholderTextColor={colors.tokens.mutedForeground}
              className="text-foreground bg-transparent min-h-[80px]"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ color: colors.tokens.foreground }}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={isUpdateMode ? handleUpdateSet : handleAddSet}
              disabled={isUpdateMode && !isUpdateEnabled}
              className={`flex-1 py-3 rounded-xl items-center justify-center ${
                (isUpdateMode && !isUpdateEnabled) 
                  ? 'bg-muted' 
                  : 'bg-primary'
              }`}
              activeOpacity={0.8}
            >
              <Text className={`font-semibold ${
                (isUpdateMode && !isUpdateEnabled)
                  ? 'text-muted-foreground'
                  : 'text-primary-foreground'
              }`}>
                {isUpdateMode ? 'Update Set' : 'Add Set'}
              </Text>
            </TouchableOpacity>
            
            {isDeleteEnabled && (
              <TouchableOpacity
                onPress={handleDeleteSet}
                className="flex-1 py-3 rounded-xl border border-destructive items-center justify-center"
                activeOpacity={0.8}
              >
                <Text className="text-destructive font-semibold">
                  Delete Set
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sets List */}
        <View className="px-6 pb-6">
          {currentSets.length > 0 && (
            <>
              <Text className="text-muted-foreground text-base font-medium mb-4">
                Completed Sets
              </Text>
              
              {currentSets.map((set, index) => (
                <TouchableOpacity
                  key={set.id}
                  onPress={() => handleSetSelect(set.id)}
                  className={`bg-card border rounded-xl p-4 mb-3 ${
                    selectedSetId === set.id
                      ? 'border-primary'
                      : 'border-border'
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                        <Text className="text-primary font-semibold">
                          {index + 1}
                        </Text>
                      </View>
                      <Text className="text-foreground font-medium">
                        {isBodyweightExercise() && set.weight === 0 
                          ? 'Bodyweight' 
                          : `${set.weight} ${weightUnit}`
                        }
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-foreground font-medium">
                        {set.reps} reps
                      </Text>
                      {selectedSetId === set.id && (
                        <View className="bg-primary/10 px-2 py-1 rounded">
                          <Text className="text-primary text-xs font-medium">Selected</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {set.notes && (
                    <Text className="text-muted-foreground text-sm mt-2" numberOfLines={2}>
                      {set.notes}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Loading overlay */}
      {isLoading && (
        <View className="absolute inset-0 bg-background/80 items-center justify-center">
          <ActivityIndicator size="large" color={colors.tokens.primary} />
        </View>
      )}
    </View>
  );
}