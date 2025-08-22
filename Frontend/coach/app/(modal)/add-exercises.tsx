/**
 * Add Exercises Screen - Modal for selecting exercises
 * Placeholder implementation - to be fully implemented in later phases
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useWorkoutStore } from '@/stores/workout-store';
import { useUserStore } from '@/stores/user-store';
import { useTheme } from '@/hooks/use-theme';

export default function AddExercisesScreen() {
  const { theme } = useTheme();
  const { addExercise } = useWorkoutStore();
  const { weightUnit } = useUserStore();

  // Sample exercises for demo
  const sampleExercises = [
    { id: 1, name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell' },
    { id: 2, name: 'Squats', muscle: 'Legs', equipment: 'Barbell' },
    { id: 3, name: 'Deadlifts', muscle: 'Back', equipment: 'Barbell' },
    { id: 4, name: 'Pull-ups', muscle: 'Back', equipment: 'Bodyweight' },
    { id: 5, name: 'Push-ups', muscle: 'Chest', equipment: 'Bodyweight' },
  ];

  const handleAddExercise = (exercise: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Add exercise to workout with empty sets structure
    addExercise({
      id: Date.now() + exercise.id,
      name: exercise.name,
      muscle: exercise.muscle,
      equipment: exercise.equipment,
      sets: [],
      weightUnit,
    });
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-foreground">
            Add Exercises
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons 
              name="close" 
              size={24} 
              color={theme.colors.foreground} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6">
        <View className="py-4">
          <Text className="text-sm text-muted.foreground mb-4">
            Select exercises to add to your workout:
          </Text>

          {sampleExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              onPress={() => handleAddExercise(exercise)}
              className="bg-card border border-border rounded-lg p-4 mb-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {exercise.name}
                  </Text>
                  <Text className="text-sm text-muted.foreground">
                    {exercise.muscle} • {exercise.equipment}
                  </Text>
                </View>
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-6 py-4 border-t border-border">
        <TouchableOpacity
          onPress={handleClose}
          className="bg-primary py-3 rounded-lg"
        >
          <Text className="text-primary-foreground text-center font-medium">
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}