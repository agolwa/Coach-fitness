/**
 * Activity Tab Screen - React Native Version - MIGRATED ✅
 * 
 * MIGRATION NOTES:
 * - Replaced useTheme with useUnifiedColors for all color access
 * - All theme.colors references updated to unified token system
 * - Hex color concatenation replaced with proper opacity tokens
 * - Perfect integration with exact Figma design values
 * - All workout history functionality preserved
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Store imports
import { useWorkoutStore } from '@/stores/workout-store';
import { useUserStore } from '@/stores/user-store';
import { useUnifiedColors } from '@/hooks/use-unified-theme';
import { showConfirm, showSuccess, showAlert } from '@/utils/alert-utils';

// Type imports
import type { WorkoutHistoryItem, WorkoutExercise } from '@/types/workout';

interface DateFilterOption {
  value: 'all' | 'week' | 'month';
  label: string;
}

const dateFilterOptions: DateFilterOption[] = [
  { value: 'all', label: 'All time' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  // Store state
  const workoutStore = useWorkoutStore();
  const userStore = useUserStore();
  const colors = useUnifiedColors();

  // Local state
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [displayedWorkouts, setDisplayedWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Constants
  const WORKOUTS_PER_PAGE = 3;

  // Get filtered workouts
  const filteredWorkouts = useMemo(() => {
    // In real implementation, filter by actual dates
    return workoutStore.history;
  }, [workoutStore.history, dateFilter]);

  // Initialize displayed workouts
  if (!hasInitialized && filteredWorkouts.length > 0) {
    setDisplayedWorkouts(filteredWorkouts.slice(0, WORKOUTS_PER_PAGE));
    setHasInitialized(true);
  }

  // Load more workouts function
  const loadMoreWorkouts = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentCount = displayedWorkouts.length;
    const nextWorkouts = filteredWorkouts.slice(currentCount, currentCount + WORKOUTS_PER_PAGE);
    
    // Defensive deduplication: filter out workouts that are already displayed
    const currentWorkoutIds = new Set(displayedWorkouts.map(w => w.id));
    const uniqueNextWorkouts = nextWorkouts.filter(workout => !currentWorkoutIds.has(workout.id));
    
    setDisplayedWorkouts(prev => [...prev, ...uniqueNextWorkouts]);
    setIsLoading(false);
  }, [displayedWorkouts, filteredWorkouts]);

  // Check if there are more workouts to load
  const hasMoreWorkouts = displayedWorkouts.length < filteredWorkouts.length;

  // Helper functions
  const formatWeight = (weight: number, unit: string) => {
    return weight > 0 ? `${weight} ${unit}` : "Bodyweight";
  };

  const getTotalExercises = (exercises: WorkoutHistoryItem['exercises']) => {
    return exercises.length;
  };

  const getTotalSets = (exercises: WorkoutHistoryItem['exercises']) => {
    return exercises.reduce((total, exercise) => total + exercise.sets, 0);
  };

  const calculateAverageTime = () => {
    if (filteredWorkouts.length === 0) return 0;
    
    const totalMinutes = filteredWorkouts.reduce((total, workout) => {
      // Parse duration like "1h 15m" or "45m"
      const duration = workout.duration;
      let minutes = 0;
      
      const hourMatch = duration.match(/(\d+)h/);
      const minMatch = duration.match(/(\d+)m/);
      
      if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
      if (minMatch) minutes += parseInt(minMatch[1]);
      
      return total + minutes;
    }, 0);
    
    return Math.round(totalMinutes / filteredWorkouts.length);
  };

  // Handle navigation to workout detail
  const handleWorkoutClick = (workout: WorkoutHistoryItem) => {
    // Navigate to workout detail screen
    router.push({
      pathname: '/(modal)/workout-detail',
      params: { id: workout.id.toString() }
    });
  };

  // Handle add to current session
  const handleAddToCurrentSession = (workout: WorkoutHistoryItem) => {
    showConfirm(
      'Add to Current Session',
      `Add all exercises from "${workout.title}" to your current workout?`,
      () => {
        // Convert workout exercises to current session format
        const exercisesToAdd: WorkoutExercise[] = workout.exercises.map(exercise => ({
          id: Date.now() + Math.random(),
          name: exercise.name,
          sets: exercise.detailSets.map((set, index) => ({
            set: (index + 1).toString(),
            weight: set.weight.toString(),
            reps: set.reps.toString(),
            notes: set.notes
          })),
          detailSets: exercise.detailSets.map((set, index) => ({
            id: index + 1,
            weight: set.weight,
            reps: set.reps,
            notes: set.notes
          })),
          weightUnit: workout.weightUnit
        }));
        
        workoutStore.addToCurrentSession(exercisesToAdd);
        
        // Show success feedback
        showSuccess(
          'Success',
          `Added ${exercisesToAdd.length} exercises to your current session!`
        );
      }
    );
  };

  // Handle date filter selection
  const showDateFilterPicker = () => {
    // Create buttons for each date filter option
    const buttons = [
      ...dateFilterOptions.map(option => ({
        text: option.label,
        onPress: () => setDateFilter(option.value),
        style: dateFilter === option.value ? 'default' as const : 'cancel' as const,
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ];

    showAlert('Filter by Date', 'Select time period to view', buttons);
  };

  // Colors already available from useUnifiedColors hook

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4">
        <View className="flex-row items-center gap-3">
          <Ionicons 
            name="pulse-outline" 
            size={24} 
            color={colors.tokens.primary} 
          />
          <Text className="text-foreground text-xl font-semibold">
            Workout History
          </Text>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-6">
          {/* Date Filter */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-muted-foreground text-base font-medium">
                Statistics
              </Text>
              <TouchableOpacity
                onPress={showDateFilterPicker}
                className="bg-card border border-border rounded-lg px-3 py-2 flex-row items-center gap-2"
              >
                <Text className="text-foreground text-sm">
                  {dateFilterOptions.find(opt => opt.value === dateFilter)?.label}
                </Text>
                <Ionicons 
                  name="chevron-down" 
                  size={16} 
                  color={colors.tokens.mutedForeground} 
                />
              </TouchableOpacity>
            </View>

            {/* Stats Summary */}
            <View className="flex-row gap-4">
              <View className="flex-1 bg-card border border-border rounded-xl p-4 items-center">
                <Text className="text-primary text-2xl font-bold mb-1">
                  {filteredWorkouts.length}
                </Text>
                <Text className="text-muted-foreground text-sm">Workouts</Text>
              </View>
              <View className="flex-1 bg-card border border-border rounded-xl p-4 items-center">
                <Text className="text-primary text-2xl font-bold mb-1">
                  {filteredWorkouts.reduce((total, workout) => total + getTotalSets(workout.exercises), 0)}
                </Text>
                <Text className="text-muted-foreground text-sm">Total Sets</Text>
              </View>
              <View className="flex-1 bg-card border border-border rounded-xl p-4 items-center">
                <Text className="text-primary text-2xl font-bold mb-1">
                  {calculateAverageTime()}m
                </Text>
                <Text className="text-muted-foreground text-sm">Avg Time</Text>
              </View>
            </View>
          </View>

          {/* Current Workout Preview */}
          {workoutStore.isActive && workoutStore.exercises.length > 0 && (
            <View className="mb-6">
              <Text className="text-muted-foreground text-base font-medium mb-4">
                Current Session
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/')}
                className="bg-card border border-primary/20 rounded-xl p-4"
                style={{ backgroundColor: colors.tokens.primaryMuted }}
              >
                <View className="flex-row items-center gap-3 mb-2">
                  <View 
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.tokens.primaryHover }}
                  >
                    <Text className="text-lg">🔥</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-foreground font-semibold truncate"
                      numberOfLines={1}
                    >
                      {workoutStore.title || "Untitled Workout"}
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                      {workoutStore.exercises.length} exercises added
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Workout History List */}
          <View>
            <Text className="text-muted-foreground text-base font-medium mb-4">
              Recent Sessions
            </Text>
            
            {/* Guest user message */}
            {!userStore.isSignedIn && displayedWorkouts.length === 0 && (
              <View className="bg-card border border-muted/50 rounded-xl p-6 items-center">
                <Text className="text-4xl mb-2">📊</Text>
                <Text className="text-foreground font-semibold mb-2">
                  No Workout History
                </Text>
                <Text className="text-muted-foreground text-sm text-center">
                  Sign up to save your workouts and track your progress over time
                </Text>
              </View>
            )}
            
            {displayedWorkouts.map((workout, index) => (
              <TouchableOpacity
                key={workout.id || `workout-${index}`}
                onPress={() => handleWorkoutClick(workout)}
                className="bg-card border border-border rounded-xl p-6 mb-4"
              >
                {/* Workout Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                      <Text className="text-xl">🏋🏼‍♂️</Text>
                    </View>
                    <View className="flex-1">
                      <Text 
                        className="text-foreground font-semibold mb-1"
                        numberOfLines={1}
                      >
                        {workout.title}
                      </Text>
                      <View className="flex-row items-center gap-3">
                        <Text className="text-muted-foreground text-sm">
                          {workout.date}
                        </Text>
                        <Text className="text-muted-foreground text-sm">•</Text>
                        <Text className="text-muted-foreground text-sm">
                          {workout.duration}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Action Button */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddToCurrentSession(workout);
                    }}
                    className="p-2 rounded-lg opacity-60"
                  >
                    <Ionicons 
                      name="add-circle-outline" 
                      size={20} 
                      color={colors.tokens.mutedForeground} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Exercise Summary */}
                <Text className="text-muted-foreground text-sm mb-3">
                  {getTotalExercises(workout.exercises)} exercises • {getTotalSets(workout.exercises)} sets
                </Text>

                {/* Exercise Preview */}
                <View className="gap-2">
                  {workout.exercises.slice(0, 3).map((exercise, index) => (
                    <View key={`${workout.id}-exercise-${index}`} className="flex-row items-center justify-between">
                      <Text 
                        className="text-foreground flex-1" 
                        numberOfLines={1}
                      >
                        {exercise.name}
                      </Text>
                      <Text className="text-muted-foreground text-sm ml-4">
                        {exercise.sets} sets
                      </Text>
                    </View>
                  ))}
                  {workout.exercises.length > 3 && (
                    <Text className="text-muted-foreground text-sm">
                      +{workout.exercises.length - 3} more exercises
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Load More Button */}
            {hasMoreWorkouts && (
              <TouchableOpacity
                onPress={loadMoreWorkouts}
                disabled={isLoading}
                className="bg-secondary border border-border rounded-xl py-3 flex-row items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color={colors.tokens.mutedForeground} />
                    <Text className="text-muted-foreground">Loading...</Text>
                  </>
                ) : (
                  <Text className="text-foreground font-medium">
                    Load More Sessions
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}