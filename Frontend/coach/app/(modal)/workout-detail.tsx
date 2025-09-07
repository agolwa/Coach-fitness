/**
 * Workout Detail Modal Screen - React Native Version
 * Displays detailed information about a specific workout from history
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from 'expo-haptics';

// Store imports
import { useWorkoutStore } from '@/stores/workout-store';
import { useUserStore } from '@/stores/user-store';
import { useUnifiedColors } from '@/hooks/use-unified-theme';

// Type imports
import type { WorkoutHistoryItem, WorkoutExercise } from '@/types/workout';

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // Store state
  const workoutStore = useWorkoutStore();
  const userStore = useUserStore();
  const colors = useUnifiedColors();
  
  // Local state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Get workout from history by ID
  const workoutId = params.id ? parseInt(params.id as string) : null;
  const workout = workoutId 
    ? workoutStore.history.find(w => w.id === workoutId)
    : null;

  // Initialize edited title when workout loads
  useEffect(() => {
    if (workout && !editedTitle) {
      setEditedTitle(workout.title);
    }
  }, [workout, editedTitle]);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingTitle]);

  // If no workout found, show error
  if (!workoutId || !workout) {
    return (
      <View className="flex-1 bg-background items-center justify-center" style={{ paddingTop: insets.top }}>
        <View className="items-center">
          <Text className="text-6xl mb-4">🤔</Text>
          <Text className="text-foreground text-xl font-semibold mb-2">Workout Not Found</Text>
          <Text className="text-muted-foreground text-center mb-6 px-6">
            The workout you're looking for could not be found or may have been deleted.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary rounded-xl py-3 px-6"
            activeOpacity={0.8}
          >
            <Text className="text-primary-foreground font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Helper functions
  const formatWeight = (weight: number): string => {
    return weight > 0 ? `${weight} ${userStore.weightUnit}` : "BW";
  };

  const getTotalSets = (): number => {
    if (!workout.exercises || workout.exercises.length === 0) return 0;
    return workout.exercises.reduce((total, exercise) => {
      return total + (exercise.sets || 0);
    }, 0);
  };

  const getTotalReps = (): number => {
    if (!workout.exercises || workout.exercises.length === 0) return 0;
    return workout.exercises.reduce((total, exercise) => {
      if (!exercise.detailSets || !Array.isArray(exercise.detailSets)) return total;
      return total + exercise.detailSets.reduce((setTotal, set) => setTotal + (set.reps || 0), 0);
    }, 0);
  };

  const getTotalVolume = (): number => {
    if (!workout.exercises || workout.exercises.length === 0) return 0;
    return workout.exercises.reduce((total, exercise) => {
      if (!exercise.detailSets || !Array.isArray(exercise.detailSets)) return total;
      return total + exercise.detailSets.reduce((setTotal, set) => {
        const weight = set.weight || 0;
        const reps = set.reps || 0;
        return setTotal + (weight * reps);
      }, 0);
    }, 0);
  };

  // Handler functions
  const handleEditTitle = () => {
    Haptics.selectionAsync();
    setIsEditingTitle(true);
    setEditedTitle(workout.title);
  };

  const handleSaveTitle = async () => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle && trimmedTitle !== workout.title && trimmedTitle.length <= 30) {
      setIsLoading(true);
      
      try {
        // Update workout title in history
        workoutStore.updateWorkoutInHistory(workout.id, { title: trimmedTitle });
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Workout title updated successfully!');
      } catch (error) {
        console.error('Error updating workout title:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to update workout title. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    Haptics.selectionAsync();
    setIsEditingTitle(false);
    setEditedTitle(workout.title);
  };

  const handleAddToCurrentSession = () => {
    Alert.alert(
      'Add to Current Session',
      `Add all ${workout.exercises.length} exercises from "${workout.title}" to your current workout?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add Exercises',
          style: 'default',
          onPress: async () => {
            setIsLoading(true);
            
            try {
              // Convert workout exercises to current session format
              const exercisesToAdd: WorkoutExercise[] = workout.exercises.map(exercise => ({
                id: Date.now() + Math.random(),
                name: exercise.name,
                sets: exercise.detailSets?.map((set, index) => ({
                  set: (index + 1).toString(),
                  weight: set.weight.toString(),
                  reps: set.reps.toString(),
                  notes: set.notes || ''
                })) || [],
                detailSets: exercise.detailSets?.map((set, index) => ({
                  id: index + 1,
                  weight: set.weight,
                  reps: set.reps,
                  notes: set.notes || ''
                })) || [],
                weightUnit: workout.weightUnit
              }));
              
              // Add exercises to current session
              workoutStore.addToCurrentSession(exercisesToAdd);
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              // Show success message and navigate back
              Alert.alert(
                'Success!',
                `Added ${exercisesToAdd.length} exercises to your current session!`,
                [
                  {
                    text: 'Continue Workout',
                    onPress: () => {
                      router.dismiss();
                      router.push('/(tabs)/');
                    }
                  },
                  {
                    text: 'Stay Here',
                    style: 'cancel'
                  }
                ]
              );
              
            } catch (error) {
              console.error('Error adding exercises to session:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to add exercises to current session. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };


  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 flex-shrink-0">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -m-2 rounded-lg"
            activeOpacity={0.7}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={colors.foreground} 
            />
          </TouchableOpacity>
          
          <Text className="text-foreground text-lg font-semibold">Workout Details</Text>
          
          <View className="w-6" />
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-6">
          {/* Workout Header Info */}
          <View className="bg-card border border-border rounded-xl p-6 mb-6">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center">
                <Text className="text-3xl">🏋🏼‍♂️</Text>
              </View>
              
              <View className="flex-1">
                {/* Title Section */}
                <View className="flex-row items-center gap-2 mb-2">
                  {isEditingTitle ? (
                    <View className="flex-1 flex-row items-center gap-2">
                      <TextInput
                        ref={inputRef}
                        value={editedTitle}
                        onChangeText={setEditedTitle}
                        maxLength={30}
                        returnKeyType="done"
                        onSubmitEditing={handleSaveTitle}
                        className="flex-1 bg-transparent text-foreground text-xl font-medium border-b border-border focus:border-primary py-1"
                        style={{ 
                          color: colors.foreground,
                          borderBottomColor: colors.border 
                        }}
                        autoFocus
                        selectTextOnFocus
                      />
                      <TouchableOpacity
                        onPress={handleSaveTitle}
                        disabled={isLoading}
                        className="p-1 rounded-md"
                        activeOpacity={0.7}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color={colors.tokens.primary} />
                        ) : (
                          <Ionicons 
                            name="checkmark" 
                            size={20} 
                            color={colors.tokens.primary} 
                          />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        disabled={isLoading}
                        className="p-1 rounded-md"
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name="close" 
                          size={20} 
                          color={colors.tokens.mutedForeground} 
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="flex-1 flex-row items-center gap-2">
                      <Text 
                        className="text-foreground text-xl font-medium flex-1"
                        numberOfLines={2}
                      >
                        {workout.title}
                      </Text>
                      <TouchableOpacity
                        onPress={handleEditTitle}
                        className="p-1 rounded-md"
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name="pencil" 
                          size={16} 
                          color={colors.tokens.mutedForeground} 
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                {/* Date and Time Info */}
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons 
                    name="calendar-outline" 
                    size={16} 
                    color={colors.tokens.mutedForeground} 
                  />
                  <Text className="text-muted-foreground">
                    {workout.date}
                  </Text>
                </View>
                
                <View className="flex-row items-center gap-4 text-sm">
                  <View className="flex-row items-center gap-1">
                    <Ionicons 
                      name="time-outline" 
                      size={16} 
                      color={colors.tokens.mutedForeground} 
                    />
                    <Text className="text-muted-foreground text-sm">
                      {workout.duration}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons 
                      name="pulse-outline" 
                      size={16} 
                      color={colors.tokens.mutedForeground} 
                    />
                    <Text className="text-muted-foreground text-sm">
                      {workout.exercises.length} exercises
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Stats */}
            <View className="pt-4 border-t border-border">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-foreground text-xl font-bold">
                    {getTotalSets()}
                  </Text>
                  <Text className="text-muted-foreground text-xs">Sets</Text>
                </View>
                <View className="items-center">
                  <Text className="text-foreground text-xl font-bold">
                    {getTotalReps()}
                  </Text>
                  <Text className="text-muted-foreground text-xs">Reps</Text>
                </View>
                <View className="items-center">
                  <Text className="text-foreground text-xl font-bold">
                    {getTotalVolume().toLocaleString()}
                  </Text>
                  <Text className="text-muted-foreground text-xs">Volume</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleAddToCurrentSession}
            disabled={isLoading}
            className="bg-secondary border border-border rounded-xl py-4 flex-row items-center justify-center gap-2 mb-6"
            activeOpacity={0.8}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color={colors.tokens.mutedForeground} />
                <Text className="text-muted-foreground font-medium">Adding...</Text>
              </>
            ) : (
              <>
                <Ionicons 
                  name="add-circle-outline" 
                  size={20} 
                  color={colors.foreground} 
                />
                <Text className="text-foreground font-medium">
                  Add to Current Session
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Exercise Details */}
          <View>
            <Text className="text-muted-foreground text-base font-medium mb-4">
              Exercise Details
            </Text>
            
            {workout.exercises && workout.exercises.length > 0 ? (
              workout.exercises.map((exercise, exerciseIndex) => {
                const exerciseSets = exercise.detailSets || [];
                return (
                  <View key={exerciseIndex} className="bg-card border border-border rounded-xl p-6 mb-4">
                    {/* Exercise Header */}
                    <View className="flex-row items-center gap-4 mb-4">
                      <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                        <Text className="text-2xl">💪</Text>
                      </View>
                      <View className="flex-1">
                        <Text 
                          className="text-foreground text-lg font-medium"
                          numberOfLines={2}
                        >
                          {exercise.name}
                        </Text>
                        <Text className="text-muted-foreground text-sm">
                          {exerciseSets.length} sets completed
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View className="h-px bg-border mb-4" />

                    {exerciseSets.length > 0 ? (
                      <>
                        {/* Sets Table Header */}
                        <View className="flex-row mb-2 px-1">
                          <View className="w-8">
                            <Text className="text-muted-foreground text-xs font-medium">SET</Text>
                          </View>
                          <View className="w-16">
                            <Text className="text-muted-foreground text-xs font-medium text-center">WGT</Text>
                          </View>
                          <View className="w-16">
                            <Text className="text-muted-foreground text-xs font-medium text-center">REPS</Text>
                          </View>
                          <View className="flex-1 ml-4">
                            <Text className="text-muted-foreground text-xs font-medium">NOTES</Text>
                          </View>
                        </View>

                        {/* Sets Data */}
                        <View className="gap-2">
                          {exerciseSets.map((set, setIndex) => (
                            <View key={setIndex} className="flex-row items-center px-1 py-2">
                              <View className="w-8">
                                <Text className="text-muted-foreground text-sm text-center">
                                  {setIndex + 1}
                                </Text>
                              </View>
                              <View className="w-16">
                                <Text className="text-foreground text-sm text-center font-medium">
                                  {formatWeight(set.weight || 0)}
                                </Text>
                              </View>
                              <View className="w-16">
                                <Text className="text-foreground text-sm text-center font-medium">
                                  {set.reps || 0}
                                </Text>
                              </View>
                              <View className="flex-1 ml-4">
                                <Text 
                                  className="text-foreground text-sm"
                                  numberOfLines={2}
                                >
                                  {set.notes || '-'}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>

                        {/* Exercise Summary */}
                        <View className="mt-4 pt-3 border-t border-border">
                          <View className="flex-row justify-around">
                            <View className="items-center">
                              <Text className="text-foreground font-medium">
                                {exerciseSets.length}
                              </Text>
                              <Text className="text-muted-foreground text-xs">
                                Sets
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text className="text-foreground font-medium">
                                {exerciseSets.reduce((total, set) => total + (set.reps || 0), 0)}
                              </Text>
                              <Text className="text-muted-foreground text-xs">
                                Reps
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text className="text-foreground font-medium">
                                {formatWeight(
                                  exerciseSets.length > 0 
                                    ? Math.max(...exerciseSets.map(set => set.weight || 0)) 
                                    : 0
                                )}
                              </Text>
                              <Text className="text-muted-foreground text-xs">
                                Max Weight
                              </Text>
                            </View>
                          </View>
                        </View>
                      </>
                    ) : (
                      <View className="items-center py-8">
                        <Text className="text-muted-foreground">
                          No sets recorded for this exercise
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View className="bg-card border border-border rounded-xl p-8 items-center">
                <Text className="text-6xl mb-2">🤔</Text>
                <Text className="text-foreground font-medium mb-2">No Exercises Found</Text>
                <Text className="text-muted-foreground text-center">
                  This workout doesn't have any recorded exercises.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}