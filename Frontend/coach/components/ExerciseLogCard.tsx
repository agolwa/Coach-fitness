/**
 * ExerciseLogCard Component - React Native Version
 * Displays exercise details with sets, weight, reps, and notes in a data table format
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { WorkoutExercise, Set } from '@/types/workout';
import * as Haptics from 'expo-haptics';
import { useUnifiedColors } from '@/hooks/use-unified-theme';

interface ExerciseLogCardProps {
  exercise: WorkoutExercise;
}

// Exercise Icon Component
function ExerciseIcon() {
  return (
    <View className="w-12 h-12 bg-primary/10 rounded-full justify-center items-center">
      <Text className="text-2xl">💪</Text>
    </View>
  );
}

// Edit Icon Component  
function EditIcon() {
  const colors = useUnifiedColors();
  
  return (
    <View className="p-1 rounded-md">
      <Ionicons 
        name="ellipsis-vertical" 
        size={20} 
        color={colors.tokens.mutedForeground}
      />
    </View>
  );
}

// Top Bar with Exercise Name and Edit Button
function TopBar({ 
  exerciseName, 
  setsCount,
  onEdit 
}: { 
  exerciseName: string;
  setsCount: number;
  onEdit?: () => void;
}) {
  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit?.();
  };

  return (
    <View className="flex-row items-center gap-4 w-full">
      <View className="flex-row items-center gap-4 flex-1">
        <ExerciseIcon />
        <View className="flex-1">
          <Text 
            className="text-lg font-medium text-foreground"
            numberOfLines={2}
          >
            {exerciseName}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        onPress={handleEditPress}
        activeOpacity={0.7}
        className="p-1 rounded-md"
      >
        <EditIcon />
      </TouchableOpacity>
    </View>
  );
}

// Divider Line
function Divider() {
  return (
    <View className="w-full h-px bg-border opacity-60 my-4" />
  );
}

// Data Table Component
function DataTable({ sets }: { sets: Set[] }) {
  if (sets.length === 0) {
    return (
      <View className="items-center py-4">
        <Text className="text-muted-foreground">
          Tap to add sets
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full">
      {/* Header Row */}
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

      {/* Data Rows */}
      <View className="gap-2">
        {sets.map((set, index) => (
          <View key={index} className="flex-row items-center px-1 py-2">
            <View className="w-8">
              <Text className="text-muted-foreground text-sm text-center">
                {index + 1}
              </Text>
            </View>
            <View className="w-16">
              <Text className="text-foreground text-sm text-center font-medium">
                {set.weight || '-'}
              </Text>
            </View>
            <View className="w-16">
              <Text className="text-foreground text-sm text-center font-medium">
                {set.reps || '-'}
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
    </View>
  );
}


// Main ExerciseLogCard Component
export function ExerciseLogCard({ exercise }: ExerciseLogCardProps) {
  const router = useRouter();
  const sets = exercise.sets || [];

  const handleEdit = () => {
    // Navigate to exercise detail screen for editing
    console.log('Edit exercise:', exercise.name);
    router.push({
      pathname: '/(modal)/exercise-detail',
      params: {
        exerciseId: exercise.id.toString(),
        exerciseName: exercise.name,
      },
    });
  };

  return (
    <TouchableOpacity 
      onPress={handleEdit}
      activeOpacity={0.95}
    >
      <View className="bg-card border border-border rounded-xl p-6">
        <TopBar 
          exerciseName={exercise.name}
          setsCount={sets.length}
          onEdit={handleEdit}
        />
        
        <Divider />
        
        <View>
          <DataTable sets={sets} />
        </View>
      </View>
    </TouchableOpacity>
  );
}