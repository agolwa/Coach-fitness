/**
 * Tab Bar Gesture Handler Component
 * Provides swipe gestures on the tab bar area with haptic feedback
 * This component is designed to overlay the tab bar without interfering with tab content
 */

import React, { useCallback } from 'react';
import { View, PanResponder, Dimensions, Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useNavigationStore, TabName } from '@/stores/navigation-store';

interface TabBarGestureHandlerProps {
  children: React.ReactNode;
}

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.2; // 20% of screen width
const VELOCITY_THRESHOLD = 0.3;

// Tab order for navigation
const TAB_ORDER: TabName[] = ['index', 'activity', 'profile'];

export function TabBarGestureHandler({ children }: TabBarGestureHandlerProps) {
  const router = useRouter();
  const { activeTab, setActiveTab } = useNavigationStore();

  // Handle swipe navigation
  const handleSwipeNavigation = useCallback((direction: 'left' | 'right') => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    let nextIndex: number;

    if (direction === 'left') {
      // Swipe left -> go to next tab (right)
      nextIndex = Math.min(currentIndex + 1, TAB_ORDER.length - 1);
    } else {
      // Swipe right -> go to previous tab (left)  
      nextIndex = Math.max(currentIndex - 1, 0);
    }

    if (nextIndex !== currentIndex) {
      const nextTab = TAB_ORDER[nextIndex];
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Navigate to the new tab
      console.log(`Gesture navigation: ${activeTab} -> ${nextTab}`);
      router.push(`/(tabs)/${nextTab}`);
      setActiveTab(nextTab);
    } else {
      // Provide light feedback when at boundary
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [activeTab, router, setActiveTab]);

  // Create pan responder for gesture handling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false, // Don't interfere with initial touch
    
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes with sufficient movement
      const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
      const hasEnoughMovement = Math.abs(gestureState.dx) > 30;
      
      return isHorizontalSwipe && hasEnoughMovement;
    },
    
    onPanResponderGrant: () => {
      // Provide subtle haptic feedback when gesture starts
      if (Platform.OS === 'ios') {
        Haptics.selectionAsync();
      }
    },

    onPanResponderMove: (evt, gestureState) => {
      // Could add visual feedback here in the future
      // For now, keep it simple to avoid conflicts
    },

    onPanResponderRelease: (evt, gestureState) => {
      const { dx, vx } = gestureState;
      
      // Determine if it's a valid swipe based on distance or velocity
      const isValidDistance = Math.abs(dx) > SWIPE_THRESHOLD;
      const isValidVelocity = Math.abs(vx) > VELOCITY_THRESHOLD;
      const isValidSwipe = isValidDistance || isValidVelocity;
      
      if (isValidSwipe) {
        if (dx > 0) {
          // Swipe right -> go to previous tab
          handleSwipeNavigation('right');
        } else {
          // Swipe left -> go to next tab
          handleSwipeNavigation('left');
        }
      }
    },

    onPanResponderTerminate: () => {
      // Handle termination gracefully
    },
  });

  return (
    <View style={styles.container}>
      {children}
      {/* Gesture overlay - positioned over the tab bar area */}
      <View 
        style={styles.gestureOverlay}
        {...panResponder.panHandlers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gestureOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.select({
      ios: 84, // Match tab bar height
      android: 60,
      default: 60,
    }),
    backgroundColor: 'transparent',
    zIndex: 1, // Ensure it's above the tab bar but below any modals
  },
});

export default TabBarGestureHandler;