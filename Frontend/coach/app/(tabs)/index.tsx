/**
 * Home Screen - VoiceLog Workout App - MIGRATED ✅
 * 
 * MIGRATION NOTES:
 * - Replaced useTheme with useUnifiedColors for all color access
 * - All inline theme.colors references updated to unified system
 * - Hardcoded color (#000000) replaced with exact Figma token
 * - Perfect integration with design token architecture
 * - All functionality preserved including server sync and offline handling
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Animated,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { TodaysLog } from '@/components/TodaysLog';
import { useWorkoutStore } from '@/stores/workout-store';
import { useUserStore } from '@/stores/user-store';
import { useUnifiedColors } from '@/hooks/use-unified-theme';
import { useNetwork } from '@/hooks/use-network';
import { router } from 'expo-router';
import { WORKOUT_CONSTANTS } from '@/types/workout';
import { 
  useActiveWorkout,
  useCreateWorkout,
  useUpdateWorkout,
  type CreateWorkoutRequest,
  type UpdateWorkoutRequest
} from '@/hooks/use-workouts';
import type { APIError } from '@/services/api-client';
import { showError, showConfirm, showInfo } from '@/utils/alert-utils';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useUnifiedColors();
  const { authState, isSignedIn } = useUserStore();
  const { isOnline, isOffline, connectionType, hasStrongConnection } = useNetwork();
  
  // Local Zustand store for offline functionality
  const {
    exercises,
    title,
    isActive,
    updateWorkoutTitle,
    clearWorkout,
    endWorkout,
    saveWorkout,
    canEndWorkout,
  } = useWorkoutStore();

  // React Query hooks for server integration
  const { data: activeWorkout, error: activeWorkoutError } = useActiveWorkout();
  const createWorkoutMutation = useCreateWorkout();
  const updateWorkoutMutation = useUpdateWorkout();

  // Local state for workout title input
  const [workoutTitle, setWorkoutTitle] = useState(title || '');
  const [showCharacterCounter, setShowCharacterCounter] = useState(false);
  const [showEndWorkoutDialog, setShowEndWorkoutDialog] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [isEndingWorkout, setIsEndingWorkout] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constants
  const MAX_TITLE_LENGTH = 30;
  const COUNTER_THRESHOLD = Math.ceil(MAX_TITLE_LENGTH * 0.8); // 24 characters

  // Sync workout title with server data when available
  useEffect(() => {
    if (isSignedIn && activeWorkout) {
      const serverTitle = activeWorkout.title || '';
      if (serverTitle !== title) {
        // Server has different title, sync it locally
        updateWorkoutTitle(serverTitle);
        setWorkoutTitle(serverTitle);
      }
    } else if (title !== workoutTitle) {
      // Fallback to local store title
      setWorkoutTitle(title || '');
    }
  }, [title, activeWorkout, isSignedIn]);

  // Handle workout title changes with server sync
  const handleWorkoutTitleChange = (text: string) => {
    // Enforce character limit
    if (text.length <= MAX_TITLE_LENGTH) {
      setWorkoutTitle(text);
      updateWorkoutTitle(text); // Update local store immediately

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

      // Debounced server update for signed-in users
      if (isSignedIn && activeWorkout?.id) {
        // Clear existing timeout
        if (titleUpdateTimeoutRef.current) {
          clearTimeout(titleUpdateTimeoutRef.current);
        }

        // Debounce server update by 1 second
        titleUpdateTimeoutRef.current = setTimeout(() => {
          updateWorkoutMutation.mutate({
            workoutId: activeWorkout.id,
            updates: { title: text } as UpdateWorkoutRequest
          }, {
            onError: (error: APIError) => {
              console.error('Failed to update workout title on server:', error);
              // Title stays updated locally, will sync later
            }
          });
        }, 1000) as any;
      }
    }
  };


  // Handle add exercises navigation with workout creation
  const handleAddExercises = async () => {
    console.log('Add exercises button pressed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // For signed-in users, create server workout if none exists
    if (isSignedIn && !activeWorkout && !isActive) {
      setIsCreatingWorkout(true);
      
      try {
        const workoutData: CreateWorkoutRequest = {
          title: workoutTitle || 'New Workout',
          started_at: new Date().toISOString()
        };
        
        await createWorkoutMutation.mutateAsync(workoutData);
        console.log('Server workout created successfully');
        
      } catch (error) {
        console.error('Failed to create server workout:', error);
        
        // Check if this is a network error - if so, continue gracefully
        const isNetworkError = error instanceof Error && (
          error.message.includes('fetch') ||
          error.message.includes('network') ||
          (error as any).errorCode === 'NETWORK_ERROR'
        );
        
        if (isNetworkError && isOffline) {
          // Don't show error for network issues when offline - just continue
          console.log('Network error while offline - continuing with local workout');
        } else if (isNetworkError) {
          // Show gentle network error message
          showInfo(
            'Connection Issue',
            'Unable to sync with server. Your workout will be saved locally.'
          );
        } else {
          // Show error for non-network issues
          showError(
            'Error Creating Workout',
            'There was an issue creating your workout. Please try again.'
          );
        }
      } finally {
        setIsCreatingWorkout(false);
      }
    }
    
    console.log('Navigation to add-exercises triggered');
    router.push('/(modal)/add-exercises');
  };

  // Handle clear exercises with confirmation
  const handleClearExercises = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    showConfirm(
      'Clear All Exercises',
      'Are you sure you want to clear all exercises? This action cannot be undone.',
      () => {
        clearWorkout();
        setWorkoutTitle('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      undefined, // onCancel
      'Clear',
      'Cancel'
    );
  };

  // Handle end workout
  const handleEndWorkout = () => {
    if (!canEndWorkout()) {
      showError(
        'No Data to Save',
        'Add some sets with reps and weights before ending your workout.'
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowEndWorkoutDialog(true);
  };

  // Confirm end workout with server sync
  const handleConfirmEndWorkout = async () => {
    setShowEndWorkoutDialog(false);
    setIsEndingWorkout(true);
    
    if (authState === 'guest') {
      showConfirm(
        'Sign up to save workout',
        'Your workout data will be lost unless you sign up. Would you like to sign up now?',
        () => {
          setIsEndingWorkout(false);
          router.push('/(auth)/signup');
        },
        () => {
          endWorkout(); // Just clear workout for guests
          setWorkoutTitle('');
          setIsEndingWorkout(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        'Sign Up',
        'Continue as Guest'
      );
    } else {
      // Save workout for signed-in users
      try {
        // If we have a server workout, complete it
        if (activeWorkout?.id) {
          await updateWorkoutMutation.mutateAsync({
            workoutId: activeWorkout.id,
            updates: {
              is_active: false,
              completed_at: new Date().toISOString()
            } as UpdateWorkoutRequest
          });
          console.log('Server workout completed successfully');
        }
        
        // Always save to local history
        await saveWorkout();
        setWorkoutTitle('');
        
        // Show celebration after successful save
        setShowCelebration(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Auto-hide celebration after 3 seconds
        celebrationTimeoutRef.current = setTimeout(() => {
          setShowCelebration(false);
          // Additional success haptic after celebration
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, WORKOUT_CONSTANTS.CELEBRATION_DURATION) as any;
        
      } catch (error) {
        // Handle save error - still save locally
        console.error('Failed to save workout to server:', error);
        
        try {
          await saveWorkout(); // Save locally as backup
          setWorkoutTitle('');
          
          showInfo(
            'Saved Locally',
            'Workout saved offline. It will sync when connection is restored.'
          );
          
          // Show celebration for local save
          setShowCelebration(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          celebrationTimeoutRef.current = setTimeout(() => {
            setShowCelebration(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, WORKOUT_CONSTANTS.CELEBRATION_DURATION) as any;
          
        } catch (localError) {
          showError(
            'Error Saving Workout',
            'There was an issue saving your workout. Please try again.'
          );
          console.error('Failed to save workout locally:', localError);
        }
      } finally {
        setIsEndingWorkout(false);
      }
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      if (titleUpdateTimeoutRef.current) {
        clearTimeout(titleUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Handle server errors gracefully
  useEffect(() => {
    if (activeWorkoutError) {
      console.warn('Active workout fetch error:', activeWorkoutError);
      // Continue with local state, no user notification needed
    }
  }, [activeWorkoutError]);

  const hasExercises = exercises && exercises.length > 0;
  const hasValidSets = canEndWorkout();
  
  // Determine loading states
  const isLoadingWorkout = isCreatingWorkout || createWorkoutMutation.isPending;
  const isCompletingWorkout = isEndingWorkout || updateWorkoutMutation.isPending;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      
      {/* Offline Banner */}
      {isOffline && (
        <View className="bg-orange-500 px-4 py-2">
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="wifi-outline" size={16} color="white" />
            <Text className="text-white text-sm font-medium">
              Working offline - changes will sync when connection is restored
            </Text>
          </View>
        </View>
      )}

      {/* Poor Connection Banner */}
      {isOnline && !hasStrongConnection && (
        <View className="bg-yellow-500 px-4 py-2">
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="cellular-outline" size={16} color="white" />
            <Text className="text-white text-sm font-medium">
              Slow connection - some features may be limited
            </Text>
          </View>
        </View>
      )}
      
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
                color={hasExercises ? colors.tokens.foreground : colors.tokens.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {/* Workout Title Input */}
          <View className="mb-4">
            <TextInput
              value={workoutTitle}
              onChangeText={handleWorkoutTitleChange}
              placeholder="Enter workout name..."
              placeholderTextColor={colors.tokens.mutedForeground}
              className="text-lg font-medium border-b pb-2"
              style={{
                color: colors.tokens.foreground, // Uses exact Figma foreground token
                borderBottomColor: colors.tokens.mutedForeground,
                fontSize: 18,
                fontWeight: '500',
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
              className={`flex-1 bg-primary flex-row items-center justify-center py-3 px-4 rounded-lg ${
                isLoadingWorkout ? 'opacity-70' : ''
              }`}
              disabled={isLoadingWorkout}
              testID="add-exercises-button"
            >
              {isLoadingWorkout ? (
                <>
                  <View className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  <Text className="text-primary-foreground font-medium">
                    Creating...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="add" size={20} color={colors.tokens.primaryForeground} />
                  <Text className="text-primary-foreground font-medium ml-2">
                    Add Exercise
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {hasValidSets && (
              <TouchableOpacity
                onPress={handleEndWorkout}
                className={`bg-secondary flex-row items-center justify-center py-3 px-4 rounded-lg ${
                  isCompletingWorkout ? 'opacity-70' : ''
                }`}
                disabled={isCompletingWorkout}
              >
                {isCompletingWorkout ? (
                  <>
                    <View className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin mr-2" />
                    <Text className="text-secondary-foreground font-medium">
                      Saving...
                    </Text>
                  </>
                ) : (
                  <Text className="text-secondary-foreground font-medium">
                    End Workout
                  </Text>
                )}
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

      {/* Celebration Modal */}
      <Modal
        visible={showCelebration}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View className="absolute inset-0 bg-primary/10 flex-1 justify-center items-center">
          <CelebrationCard />
        </View>
      </Modal>
    </View>
  );
}

// Celebration Card Component
const CelebrationCard = () => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(1)).current;
  const emojiRotate = useRef(new Animated.Value(0)).current;

  // Animation effects
  useEffect(() => {
    // Card entrance animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Emoji bounce animation
    const emojiAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(emojiScale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(emojiRotate, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(emojiScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(emojiRotate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );
    
    emojiAnimation.start();

    return () => {
      emojiAnimation.stop();
    };
  }, []);

  const cardTransform = {
    transform: [
      { scale: scaleValue },
      {
        rotate: rotateValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  const emojiTransform = {
    transform: [
      { scale: emojiScale },
      {
        rotate: emojiRotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '20deg'],
        }),
      },
    ],
  };

  return (
    <Animated.View 
      style={cardTransform}
      className="bg-background rounded-2xl p-8 mx-6 shadow-2xl border border-primary/20"
    >
      <View className="items-center">
        <Animated.Text style={emojiTransform} className="text-6xl mb-4">
          🎉
        </Animated.Text>
        
        <Text className="text-2xl text-primary mb-2 font-bold text-center">
          Great Job!
        </Text>
        
        <Text className="text-muted-foreground text-center">
          Workout completed successfully
        </Text>
      </View>
    </Animated.View>
  );
};
