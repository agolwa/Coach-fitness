/**
 * Feedback & Feature Requests Modal Screen - React Native Version
 * Allows users to submit feedback and feature requests with text validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from 'expo-haptics';

// Hooks
import { useUnifiedColors } from '@/hooks/use-unified-theme';

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const colors = useUnifiedColors();
  
  // State
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const maxCharacters = 250;
  const remainingCharacters = maxCharacters - suggestion.length;

  // Validate input to only allow text and numbers (NO LINE BREAKS)
  const validateInput = (text: string): string => {
    // Remove any non-text characters except basic punctuation and numbers
    let cleanText = text.replace(/[^\w\s.,!?;:'"()[\]{}/@#$%^&*\-+=~`|\\]/g, '');
    
    // COMPLETELY REMOVE ALL LINE BREAKS
    cleanText = cleanText.replace(/\n+/g, ' ');
    cleanText = cleanText.replace(/\r+/g, ' ');
    
    // Clean up multiple spaces
    cleanText = cleanText.replace(/\s+/g, ' ');
    
    return cleanText;
  };

  // Check if text has meaningful content (not just whitespace)
  const hasMeaningfulContent = (text: string): boolean => {
    const trimmed = text.trim();
    return trimmed.length > 0;
  };

  const handleTextChange = (text: string) => {
    // Validate and clean the input
    const cleanText = validateInput(text);
    
    if (cleanText.length <= maxCharacters) {
      setSuggestion(cleanText);
    }
  };

  const handleSubmit = async () => {
    if (suggestion.trim().length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }

    if (!hasMeaningfulContent(suggestion)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter meaningful feedback text');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the feedback to your backend
      console.log('Feedback submitted:', suggestion);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully. We appreciate your input and will review it carefully.',
        [
          {
            text: 'Great!',
            onPress: () => {
              setSuggestion('');
              router.back();
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Submission Failed',
        'We couldn\'t submit your feedback right now. Please try again later or contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="px-6 py-4 flex-shrink-0 border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -m-2 rounded-lg mr-3"
            activeOpacity={0.7}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={colors.tokens.foreground} 
            />
          </TouchableOpacity>
          <Text className="text-foreground text-xl font-medium">Feedback & Requests</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-6 flex-1">
          {/* Introduction */}
          <View className="mb-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                <Ionicons 
                  name="lightbulb-outline" 
                  size={24} 
                  color={colors.primary.DEFAULT} 
                />
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-lg font-medium">Share Your Ideas</Text>
                <Text className="text-muted-foreground text-sm">Help us improve FitLogger</Text>
              </View>
            </View>
            <Text className="text-muted-foreground">
              Have feedback or ideas to improve the app? We'd love to hear from you! 
              Share your thoughts, feature requests, or suggestions below.
            </Text>
          </View>

          {/* Form Section */}
          <View className="mb-8">
            <Text className="text-foreground text-base font-medium mb-3">Your Feedback</Text>
            
            {/* Text Input */}
            <View className="bg-card border border-border rounded-xl p-4 mb-2">
              <TextInput
                value={suggestion}
                onChangeText={handleTextChange}
                placeholder="Share your feedback or feature idea..."
                placeholderTextColor={colors.muted.foreground}
                multiline={true}
                numberOfLines={6}
                maxLength={maxCharacters}
                style={{
                  color: colors.tokens.foreground,
                  fontSize: 16,
                  lineHeight: 22,
                  textAlignVertical: 'top',
                  minHeight: 120,
                  maxHeight: 200,
                }}
                returnKeyType="default"
                blurOnSubmit={false}
              />
            </View>

            {/* Character Counter */}
            <View className="flex-row justify-between items-center">
              <Text className="text-muted-foreground text-sm">
                No line breaks allowed - keep it in one paragraph
              </Text>
              <Text 
                className={`text-sm ${
                  remainingCharacters < 10 
                    ? 'text-destructive' 
                    : 'text-muted-foreground'
                }`}
              >
                {remainingCharacters} characters left
              </Text>
            </View>
          </View>

          {/* Tips Section */}
          <View className="bg-muted/50 rounded-xl p-4 mb-8">
            <Text className="text-foreground font-medium mb-3">💡 Tips for Great Feedback</Text>
            <View className="space-y-2">
              <Text className="text-muted-foreground text-sm">
                • Be specific about what you'd like to see improved
              </Text>
              <Text className="text-muted-foreground text-sm">
                • Describe how a feature would help your workout routine
              </Text>
              <Text className="text-muted-foreground text-sm">
                • Include any relevant context about your fitness goals
              </Text>
              <Text className="text-muted-foreground text-sm">
                • Keep it concise but detailed enough for us to understand
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={suggestion.trim().length === 0 || !hasMeaningfulContent(suggestion) || isSubmitting}
            className={`rounded-xl py-4 flex-row items-center justify-center gap-2 ${
              suggestion.trim().length === 0 || !hasMeaningfulContent(suggestion) || isSubmitting
                ? 'bg-muted opacity-50' 
                : 'bg-primary'
            }`}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <>
                <Ionicons 
                  name="hourglass-outline" 
                  size={20} 
                  color={colors.primary.foreground} 
                />
                <Text className="text-primary-foreground font-semibold">
                  Submitting...
                </Text>
              </>
            ) : (
              <>
                <Ionicons 
                  name="send-outline" 
                  size={20} 
                  color={colors.primary.foreground} 
                />
                <Text className="text-primary-foreground font-semibold">
                  Submit Feedback
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Alternative Contact */}
          <View className="mt-6 pt-6 border-t border-border">
            <Text className="text-muted-foreground text-sm text-center mb-3">
              Prefer email? You can also send feedback to:
            </Text>
            <TouchableOpacity
              onPress={() => {
                // You could implement email functionality here
                Alert.alert('Email', 'feedback@fitlogger.com');
              }}
              className="flex-row items-center justify-center gap-2"
              activeOpacity={0.7}
            >
              <Ionicons 
                name="mail-outline" 
                size={16} 
                color={colors.primary.DEFAULT} 
              />
              <Text className="text-primary font-medium">
                feedback@fitlogger.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}