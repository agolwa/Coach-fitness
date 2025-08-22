/**
 * ExerciseLogCard Component - React Native Version
 * Displays exercise details with sets, weight, reps, and notes in a data table format
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, CardContent } from './ui/card';
import { useWorkoutStore } from '@/stores/workout-store';
import type { WorkoutExercise, Set } from '@/types/workout';
import * as Haptics from 'expo-haptics';

interface ExerciseLogCardProps {
  exercise: WorkoutExercise;
}

// Exercise Icon Component
function ExerciseIcon() {
  return (
    <View className="w-12 h-12 justify-center items-center">
      <Text className="text-2xl">🏋🏼‍♂️</Text>
    </View>
  );
}

// Edit Icon Component  
function EditIcon() {
  return (
    <View className="w-8 h-8 justify-center items-center">
      <View className="w-4 h-4 justify-center items-center">
        <Text className="text-muted.foreground text-xs">✏️</Text>
      </View>
    </View>
  );
}

// Top Bar with Exercise Name and Edit Button
function TopBar({ 
  exerciseName, 
  onEdit 
}: { 
  exerciseName: string;
  onEdit?: () => void;
}) {
  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit?.();
  };

  return (
    <View className="flex-row items-center gap-2 w-full">
      <View className="flex-row items-center gap-2 flex-1">
        <ExerciseIcon />
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground leading-6">
            {exerciseName}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        onPress={handleEditPress}
        activeOpacity={0.7}
        className="w-8 h-8 justify-center items-center"
      >
        <EditIcon />
      </TouchableOpacity>
    </View>
  );
}

// Divider Line
function Divider() {
  return (
    <View className="w-full h-px bg-border opacity-60" />
  );
}

// Data Table Component
function DataTable({ sets }: { sets: Set[] }) {
  const maxRows = Math.max(sets.length, 4);
  const paddedSets: Set[] = [...sets];
  
  // Pad with empty sets to ensure minimum 4 rows
  while (paddedSets.length < maxRows) {
    paddedSets.push({ set: "", weight: "", reps: "", notes: "" });
  }

  return (
    <View className="w-full">
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="w-[18px] items-center">
          <Text className="text-xs text-muted.foreground font-normal tracking-wider">
            SET
          </Text>
        </View>
        <View className="w-[30px] items-center">
          <Text className="text-xs text-muted.foreground font-normal tracking-wider">
            WGT
          </Text>
        </View>
        <View className="w-[35px] items-center">
          <Text className="text-xs text-muted.foreground font-normal tracking-wider">
            REPS
          </Text>
        </View>
        <View className="w-[195px] items-start">
          <Text className="text-xs text-muted.foreground font-normal tracking-wider">
            Notes
          </Text>
        </View>
      </View>

      {/* Data Rows */}
      <View className="gap-2">
        {paddedSets.map((set, index) => (
          <View key={index} className="flex-row justify-between items-center">
            <View className="w-[18px] items-center">
              <Text className="text-xs text-foreground">
                {set.set}
              </Text>
            </View>
            <View className="w-[30px] items-center">
              <Text className="text-xs text-foreground">
                {set.weight}
              </Text>
            </View>
            <View className="w-[35px] items-center">
              <Text className="text-xs text-foreground">
                {set.reps}
              </Text>
            </View>
            <View className="w-[195px] items-start">
              <Text className="text-xs text-foreground" numberOfLines={1}>
                {set.notes}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Main ExerciseLogCard Component
export function ExerciseLogCard({ exercise }: ExerciseLogCardProps) {
  const { navigateToExerciseDetail } = useWorkoutStore();

  const handleEdit = () => {
    // Navigate to exercise detail screen for editing
    // This will be implemented when we add navigation
    console.log('Edit exercise:', exercise.name);
    navigateToExerciseDetail?.(exercise.id);
  };

  return (
    <Card className="w-full bg-background" variant="default">
      <CardContent className="p-4">
        <View className="gap-4">
          <TopBar 
            exerciseName={exercise.name} 
            onEdit={handleEdit}
          />
          
          <Divider />
          
          <DataTable sets={exercise.sets || []} />
        </View>
      </CardContent>
    </Card>
  );
}