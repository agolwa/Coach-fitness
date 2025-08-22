/**
 * Home Screen - VoiceLog Workout App
 * Main workout screen with exercise logging, workout creation, and management
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import { TodaysLog } from '@/components/TodaysLog';
import { useWorkoutStore } from '@/stores/workout-store';
import { useUserStore } from '@/stores/user-store';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { authState } = useUserStore();
  const {
    exercises,
    title,
    isActive,
    updateWorkoutTitle,
    clearWorkout,
    endWorkout,
    canEndWorkout,
  } = useWorkoutStore();

  // Local state for workout title input
  const [workoutTitle, setWorkoutTitle] = useState(title || '');
  const [showCharacterCounter, setShowCharacterCounter] = useState(false);
  const [showEndWorkoutDialog, setShowEndWorkoutDialog] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constants
  const MAX_TITLE_LENGTH = 30;
  const COUNTER_THRESHOLD = Math.ceil(MAX_TITLE_LENGTH * 0.8); // 24 characters

  // Update local title when store title changes
  useEffect(() => {
    if (title !== workoutTitle) {
      setWorkoutTitle(title || '');
    }
  }, [title]);

  // Handle workout title changes
  const handleWorkoutTitleChange = (text: string) => {
    // Enforce character limit
    if (text.length <= MAX_TITLE_LENGTH) {
      setWorkoutTitle(text);
      updateWorkoutTitle(text);

      // Show character counter if at 80% of limit (24 chars)
      if (text.length >= COUNTER_THRESHOLD) {
        setShowCharacterCounter(true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to hide counter after user stops typing
        typingTimeoutRef.current = setTimeout(() => {
          setShowCharacterCounter(false);
        }, 2500);
      } else {
        // Hide counter if below 80% threshold
        setShowCharacterCounter(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  // Handle add exercises navigation
  const handleAddExercises = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(modal)/add-exercises');
  };

  // Handle clear exercises with confirmation
  const handleClearExercises = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Clear All Exercises',
      'Are you sure you want to clear all exercises? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearWorkout();
            setWorkoutTitle('');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  // Handle end workout
  const handleEndWorkout = () => {
    if (!canEndWorkout()) {
      Alert.alert(
        'No Data to Save',
        'Add some sets with reps and weights before ending your workout.',
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowEndWorkoutDialog(true);
  };

  // Confirm end workout
  const handleConfirmEndWorkout = () => {
    setShowEndWorkoutDialog(false);
    
    if (authState === 'guest') {
      Alert.alert(
        'Sign up to save workout',
        'Your workout data will be lost unless you sign up. Would you like to sign up now?',
        [
          {
            text: 'Continue as Guest',
            style: 'destructive',
            onPress: () => {
              endWorkout(false); // Don't save for guests
              setWorkoutTitle('');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
          {
            text: 'Sign Up',
            onPress: () => {
              router.push('/(auth)/signup');
            },
          },
        ]
      );
    } else {
      // Save workout for signed-in users
      endWorkout(true);
      setWorkoutTitle('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const hasExercises = exercises && exercises.length > 0;
  const hasValidSets = canEndWorkout();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />
      
      <ScrollView 
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="px-6 py-4 border-b border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-foreground">
              VoiceLog
            </Text>
            
            <TouchableOpacity 
              onPress={handleClearExercises}
              className="p-2"
              disabled={!hasExercises}
            >
              <Ionicons 
                name="ellipsis-vertical" 
                size={24} 
                color={hasExercises ? theme.colors.foreground : theme.colors.muted.foreground}
              />
            </TouchableOpacity>
          </View>

          {/* Workout Title Input */}
          <View className="mb-4">
            <TextInput
              value={workoutTitle}
              onChangeText={handleWorkoutTitleChange}
              placeholder="Enter workout name..."
              placeholderTextColor={theme.colors.muted.foreground}
              className="text-lg font-medium text-foreground border-b border-muted.foreground pb-2"
              style={{
                color: theme.colors.foreground,
                borderBottomColor: theme.colors.muted.foreground,
              }}
              maxLength={MAX_TITLE_LENGTH}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            
            {/* Character Counter */}
            {showCharacterCounter && (
              <View className="absolute right-0 top-0">
                <Text className="text-xs text-muted.foreground mt-1">
                  {workoutTitle.length}/{MAX_TITLE_LENGTH}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleAddExercises}
              className="flex-1 bg-primary flex-row items-center justify-center py-3 px-4 rounded-lg"
            >
              <Ionicons name="add" size={20} color={theme.colors.primary.foreground} />
              <Text className="text-primary-foreground font-medium ml-2">
                Add Exercise
              </Text>
            </TouchableOpacity>

            {hasValidSets && (
              <TouchableOpacity
                onPress={handleEndWorkout}
                className="bg-secondary flex-row items-center justify-center py-3 px-4 rounded-lg"
              >
                <Text className="text-secondary-foreground font-medium">
                  End Workout
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Today's Log Section */}
        <TodaysLog />
      </ScrollView>

      {/* End Workout Confirmation Dialog */}
      {showEndWorkoutDialog && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-background m-6 rounded-lg p-6 max-w-sm w-full">
            <Text className="text-lg font-bold text-foreground mb-2">
              End Workout
            </Text>
            <Text className="text-muted.foreground mb-6">
              Are you sure you want to end your workout? This will save your progress.
            </Text>
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowEndWorkoutDialog(false)}
                className="flex-1 bg-secondary py-3 rounded-lg"
              >
                <Text className="text-secondary-foreground text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleConfirmEndWorkout}
                className="flex-1 bg-primary py-3 rounded-lg"
              >
                <Text className="text-primary-foreground text-center font-medium">
                  End Workout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
