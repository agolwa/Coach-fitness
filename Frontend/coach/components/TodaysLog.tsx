/**
 * TodaysLog Component - React Native Version
 * Displays the current workout exercises and sets
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ExerciseLogCard } from './ExerciseLogCard';
import { useWorkoutStore } from '@/stores/workout-store';
import type { WorkoutExercise } from '@/types/workout';

interface TodaysLogProps {
  exercises?: WorkoutExercise[];
}

export function TodaysLog({ exercises: propExercises }: TodaysLogProps) {
  const { exercises: storeExercises } = useWorkoutStore();
  
  // Use prop exercises if provided, otherwise get from store
  const exercises = propExercises || storeExercises || [];

  return (
    <View className="flex-1 px-6 py-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-base font-normal text-muted.foreground leading-6">
          today's log
        </Text>
      </View>

      {/* Content */}
      {exercises.length === 0 ? (
        <View className="mb-4">
          <Text className="text-sm font-normal text-muted.foreground opacity-70 leading-5">
            No exercises added yet. Click "Add exercise" to get started.
          </Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 16 }}
        >
          {exercises.map((exercise) => (
            <ExerciseLogCard key={exercise.id} exercise={exercise} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}