/**
 * Button Component for React Native
 * Migrated from web version with NativeWind styling and touch interactions
 */

import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import * as Haptics from 'expo-haptics';
import { cn } from './utils';
import { useTheme } from '../../hooks/use-theme';

const buttonVariants = cva(
  // Base styles - converted for React Native/NativeWind
  "flex-row items-center justify-center rounded-md transition-all disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border border-border bg-background",
        secondary: "bg-secondary",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "h-11 px-4 py-3",
        sm: "h-9 px-3 py-2",
        lg: "h-12 px-6 py-3",
        xl: "h-14 px-8 py-4",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva(
  // Base text styles
  "text-center font-medium",
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        outline: "text-foreground",
        secondary: "text-secondary-foreground",
        ghost: "text-foreground",
        link: "text-primary underline",
      },
      size: {
        default: "text-base",
        sm: "text-sm",
        lg: "text-lg",
        xl: "text-xl",
        icon: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends TouchableOpacityProps {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  children?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hapticFeedback?: boolean;
  className?: string;
  textClassName?: string;
}

/**
 * Button component with touch interactions, haptic feedback, and loading states
 * Supports all variants from the original web component
 */
export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'default',
      children,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      hapticFeedback = true,
      className,
      textClassName,
      disabled,
      onPress,
      style,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    const handlePress = (event: any) => {
      if (loading || disabled) return;

      // Haptic feedback for button press
      if (hapticFeedback) {
        if (variant === 'destructive') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      onPress?.(event);
    };

    const isDisabled = disabled || loading;
    
    // Render loading indicator
    const renderLoadingIndicator = () => {
      const spinnerColor = 
        variant === 'outline' || variant === 'ghost' || variant === 'link'
          ? theme.colors.foreground
          : theme.colors['primary-foreground'];

      return (
        <ActivityIndicator 
          size="small" 
          color={spinnerColor}
          className="mr-2"
        />
      );
    };

    // Render button content
    const renderContent = () => {
      if (loading && loadingText) {
        return (
          <>
            {renderLoadingIndicator()}
            <Text className={cn(buttonTextVariants({ variant, size }), textClassName)}>
              {loadingText}
            </Text>
          </>
        );
      }

      if (loading) {
        return renderLoadingIndicator();
      }

      // Regular content
      return (
        <>
          {leftIcon && (
            <View className={cn(
              'mr-2',
              size === 'sm' && 'mr-1.5',
              size === 'lg' && 'mr-2.5',
              size === 'xl' && 'mr-3'
            )}>
              {leftIcon}
            </View>
          )}
          
          {typeof children === 'string' ? (
            <Text className={cn(buttonTextVariants({ variant, size }), textClassName)}>
              {children}
            </Text>
          ) : (
            children
          )}
          
          {rightIcon && (
            <View className={cn(
              'ml-2',
              size === 'sm' && 'ml-1.5',
              size === 'lg' && 'ml-2.5',
              size === 'xl' && 'ml-3'
            )}>
              {rightIcon}
            </View>
          )}
        </>
      );
    };

    return (
      <TouchableOpacity
        ref={ref}
        disabled={isDisabled}
        onPress={handlePress}
        activeOpacity={0.8}
        className={cn(
          buttonVariants({ variant, size }),
          isDisabled && 'opacity-50',
          className
        )}
        style={style}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

// Export variant utilities for external use
export { buttonVariants, buttonTextVariants };

/**
 * Icon Button - specialized button for icon-only use cases
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  accessibilityLabel: string;
}

export const IconButton = React.forwardRef<TouchableOpacity, IconButtonProps>(
  ({ icon, accessibilityLabel, size = 'icon', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * Loading Button - button with built-in loading state
 */
export interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
}

export const LoadingButton = React.forwardRef<TouchableOpacity, LoadingButtonProps>(
  ({ isLoading, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        loading={isLoading}
        disabled={isLoading}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export default Button;