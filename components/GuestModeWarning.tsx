/**
 * Guest Mode Warning Component
 * Shows limitations and prompts for guest users to sign up
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/components/ui/utils';

export interface GuestModeWarningProps {
  visible: boolean;
  onClose: () => void;
  onSignUp: () => void;
  title?: string;
  message?: string;
  showSignUpButton?: boolean;
}

export function GuestModeWarning({
  visible,
  onClose,
  onSignUp,
  title = "Sign Up to Save Your Progress",
  message = "You're using guest mode. Sign up to save your workouts, access history, and sync across devices.",
  showSignUpButton = true,
}: GuestModeWarningProps) {
  const { theme } = useTheme();

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleSignUp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSignUp();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View 
          className="bg-card rounded-xl p-6 w-full max-w-sm"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-3">
              <Ionicons 
                name="warning-outline" 
                size={32} 
                color="#f59e0b" 
              />
            </View>
          </View>

          {/* Title */}
          <Text className="text-foreground text-xl font-semibold text-center mb-3">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-muted-foreground text-base text-center leading-6 mb-6">
            {message}
          </Text>

          {/* Limitations List */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons 
                name="close-circle-outline" 
                size={16} 
                color={theme.colors['destructive']}
                style={{ marginRight: 8 }}
              />
              <Text className="text-muted-foreground text-sm flex-1">
                Can't save workout history
              </Text>
            </View>
            
            <View className="flex-row items-center mb-2">
              <Ionicons 
                name="close-circle-outline" 
                size={16} 
                color={theme.colors['destructive']}
                style={{ marginRight: 8 }}
              />
              <Text className="text-muted-foreground text-sm flex-1">
                No data sync across devices
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons 
                name="close-circle-outline" 
                size={16} 
                color={theme.colors['destructive']}
                style={{ marginRight: 8 }}
              />
              <Text className="text-muted-foreground text-sm flex-1">
                Limited backup and recovery
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View>
            {showSignUpButton && (
              <Button
                onPress={handleSignUp}
                variant="default"
                className="w-full"
              >
                Sign Up Now
              </Button>
            )}
            
            <View style={{ marginTop: 12 }}>
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.8}
              className="w-full bg-transparent border border-border rounded-lg px-6 py-3 items-center"
            >
              <Text className="text-muted-foreground font-medium">
                Continue as Guest
              </Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Simplified Guest Warning Banner
 * Shows a compact warning at the top of screens
 */
export interface GuestWarningBannerProps {
  onSignUp: () => void;
  onDismiss?: () => void;
  message?: string;
}

export function GuestWarningBanner({
  onSignUp,
  onDismiss,
  message = "Sign up to save your workouts",
}: GuestWarningBannerProps) {
  const handleSignUp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSignUp();
  };

  const handleDismiss = async () => {
    if (onDismiss) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDismiss();
    }
  };

  return (
    <View className="bg-amber-50 border border-amber-200 rounded-lg mx-4 mb-4 p-3">
      <View className="flex-row items-center">
        <Ionicons 
          name="information-circle-outline" 
          size={20} 
          color="#f59e0b"
          style={{ marginRight: 8 }}
        />
        
        <Text className="text-amber-800 text-sm flex-1" style={{ marginRight: 8 }}>
          {message}
        </Text>
        
        <TouchableOpacity
          onPress={handleSignUp}
          activeOpacity={0.8}
          className="bg-amber-500 rounded-md px-3 py-1.5"
        >
          <Text className="text-white text-sm font-medium">
            Sign Up
          </Text>
        </TouchableOpacity>
        
        {onDismiss && (
          <TouchableOpacity
            onPress={handleDismiss}
            activeOpacity={0.8}
            className="p-1"
            style={{ marginLeft: 8 }}
          >
            <Ionicons 
              name="close" 
              size={16} 
              color="#f59e0b"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default GuestModeWarning;