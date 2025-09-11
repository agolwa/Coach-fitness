/**
 * Custom Alert Component
 * Replaces React Native's Alert.alert with theme-aware custom modal
 * Follows UI Implementation Guide patterns
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUnifiedColors } from '@/hooks/use-unified-theme';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'destructive';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
  type: AlertType;
  title: string;
  message?: string;
  buttons: AlertButton[];
  visible: boolean;
  onClose?: () => void;
}

interface CustomAlertProps extends AlertConfig {}

const { width: screenWidth } = Dimensions.get('window');

export default function CustomAlert({
  type,
  title,
  message,
  buttons,
  visible,
  onClose,
}: CustomAlertProps) {
  const insets = useSafeAreaInsets();
  const colors = useUnifiedColors();

  // Get alert type styling
  const getAlertTypeConfig = (alertType: AlertType) => {
    switch (alertType) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          iconColor: colors.tokens.primary,
          primaryButtonClass: 'bg-primary',
          primaryButtonTextClass: 'text-primary-foreground',
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          iconColor: colors.tokens.destructive,
          primaryButtonClass: 'bg-destructive',
          primaryButtonTextClass: 'text-destructive-foreground',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          iconColor: colors.tokens.warning,
          primaryButtonClass: 'bg-primary',
          primaryButtonTextClass: 'text-primary-foreground',
        };
      case 'info':
        return {
          icon: 'information-circle' as const,
          iconColor: colors.tokens.link,
          primaryButtonClass: 'bg-secondary',
          primaryButtonTextClass: 'text-foreground',
        };
      case 'confirm':
        return {
          icon: 'help-circle' as const,
          iconColor: colors.tokens.primary,
          primaryButtonClass: 'bg-primary',
          primaryButtonTextClass: 'text-primary-foreground',
        };
      case 'destructive':
        return {
          icon: 'warning' as const,
          iconColor: colors.tokens.destructive,
          primaryButtonClass: 'bg-destructive',
          primaryButtonTextClass: 'text-destructive-foreground',
        };
      default:
        return {
          icon: 'information-circle' as const,
          iconColor: colors.tokens.foreground,
          primaryButtonClass: 'bg-primary',
          primaryButtonTextClass: 'text-primary-foreground',
        };
    }
  };

  // Get button styling classes
  const getButtonClasses = (buttonStyle: string = 'default', isDestructive: boolean = false, isSingleButton: boolean = false) => {
    const flexClass = isSingleButton ? '' : 'flex-1';
    
    if (isDestructive || buttonStyle === 'destructive') {
      return {
        container: `bg-destructive rounded-xl py-3 px-6 ${flexClass}`,
        text: 'text-destructive-foreground font-semibold text-center',
      };
    }
    
    if (buttonStyle === 'cancel') {
      return {
        container: `bg-secondary border border-border rounded-xl py-3 px-6 ${flexClass}`,
        text: 'text-foreground font-medium text-center',
      };
    }
    
    // Default/primary button
    const typeConfig = getAlertTypeConfig(type);
    return {
      container: `${typeConfig.primaryButtonClass} rounded-xl py-3 px-6 ${flexClass}`,
      text: `${typeConfig.primaryButtonTextClass} font-semibold text-center`,
    };
  };

  const handleBackdropPress = () => {
    // Only close on backdrop press if there's a cancel button or single OK button
    const hasCancelButton = buttons.some(btn => btn.style === 'cancel');
    const hasSingleButton = buttons.length === 1;
    
    if (hasCancelButton) {
      const cancelButton = buttons.find(btn => btn.style === 'cancel');
      cancelButton?.onPress?.();
    } else if (hasSingleButton) {
      buttons[0].onPress?.();
    }
    
    onClose?.();
  };

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onClose?.();
  };

  const typeConfig = getAlertTypeConfig(type);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleBackdropPress}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleBackdropPress}
        className="flex-1 bg-black/50 justify-center items-center px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Alert Container */}
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View 
            className="bg-card border border-border rounded-xl p-6 w-full shadow-lg"
            style={{ 
              maxWidth: Math.min(screenWidth - 48, 400),
              minWidth: Math.min(screenWidth - 48, 300),
            }}
          >
            {/* Icon Section */}
            <View className="items-center mb-4">
              <Ionicons
                name={typeConfig.icon}
                size={48}
                color={typeConfig.iconColor}
              />
            </View>

            {/* Title */}
            <Text className="text-foreground text-lg font-semibold text-center mb-2">
              {title}
            </Text>

            {/* Message */}
            {message && (
              <Text className="text-muted-foreground text-center mb-6 leading-5">
                {message}
              </Text>
            )}

            {/* Buttons */}
            <View className={`${buttons.length > 1 ? 'flex-row gap-3' : ''}`}>
              {buttons.map((button, index) => {
                const isSingleButton = buttons.length === 1;
                const buttonClasses = getButtonClasses(button.style, button.style === 'destructive', isSingleButton);
                
                return (
                  <TouchableOpacity
                    key={`${button.text}-${index}`}
                    onPress={() => handleButtonPress(button)}
                    className={buttonClasses.container}
                    activeOpacity={0.8}
                  >
                    <Text className={buttonClasses.text}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}