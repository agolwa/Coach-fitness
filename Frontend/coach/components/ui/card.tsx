/**
 * Card Components for React Native
 * Migrated from web version with proper shadows and mobile-optimized layouts
 */

import React from 'react';
import {
  View,
  ViewProps,
  Text,
  TextProps,
  Platform,
} from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';
import { useTheme } from '../../hooks/use-theme';

const cardVariants = cva(
  "bg-card flex flex-col rounded-xl border border-border",
  {
    variants: {
      variant: {
        default: "",
        elevated: "",
        outline: "border-2",
        ghost: "border-0 bg-transparent",
      },
      size: {
        sm: "p-3",
        default: "p-4", 
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const cardHeaderVariants = cva(
  "flex-row items-start justify-between",
  {
    variants: {
      size: {
        sm: "px-3 pt-3",
        default: "px-4 pt-4",
        lg: "px-6 pt-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const cardContentVariants = cva(
  "flex-1",
  {
    variants: {
      size: {
        sm: "px-3",
        default: "px-4",
        lg: "px-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const cardFooterVariants = cva(
  "flex-row items-center justify-between",
  {
    variants: {
      size: {
        sm: "px-3 pb-3",
        default: "px-4 pb-4",
        lg: "px-6 pb-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface CardProps extends ViewProps {
  variant?: VariantProps<typeof cardVariants>['variant'];
  size?: VariantProps<typeof cardVariants>['size'];
  className?: string;
}

/**
 * Main Card component with shadow support
 */
export const Card = React.forwardRef<View, CardProps>(
  ({ variant = 'default', size = 'default', className, style, children, ...props }, ref) => {
    const { theme } = useTheme();

    // Create shadow style based on variant
    const getShadowStyle = () => {
      if (variant === 'ghost' || variant === 'outline') {
        return {};
      }

      const shadowIntensity = variant === 'elevated' ? 'md' : 'sm';
      
      // Platform-specific shadows
      if (Platform.OS === 'ios') {
        const shadows = {
          sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          },
        };
        return shadows[shadowIntensity];
      } else {
        // Android elevation
        const elevations = {
          sm: 2,
          md: 4,
        };
        return { elevation: elevations[shadowIntensity] };
      }
    };

    return (
      <View
        ref={ref}
        className={cn(cardVariants({ variant, size }), className)}
        style={[
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
          getShadowStyle(),
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends ViewProps {
  size?: VariantProps<typeof cardHeaderVariants>['size'];
  className?: string;
}

/**
 * Card Header component with consistent spacing
 */
export const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ size = 'default', className, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(cardHeaderVariants({ size }), className)}
        {...props}
      >
        {children}
      </View>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends TextProps {
  className?: string;
}

/**
 * Card Title component with proper typography
 */
export const CardTitle = React.forwardRef<Text, CardTitleProps>(
  ({ className, style, children, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <Text
        ref={ref}
        className={cn(
          'text-lg font-semibold leading-tight text-card-foreground',
          className
        )}
        style={[
          {
            color: theme.colors.card.foreground,
            fontWeight: theme.typography.fontWeights.semibold,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends TextProps {
  className?: string;
}

/**
 * Card Description component with muted styling
 */
export const CardDescription = React.forwardRef<Text, CardDescriptionProps>(
  ({ className, style, children, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <Text
        ref={ref}
        className={cn(
          'text-sm text-muted-foreground leading-relaxed',
          className
        )}
        style={[
          {
            color: theme.colors.muted.foreground,
            lineHeight: theme.typography.lineHeights.relaxed,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

CardDescription.displayName = 'CardDescription';

export interface CardActionProps extends ViewProps {
  className?: string;
}

/**
 * Card Action component for buttons and interactive elements
 */
export const CardAction = React.forwardRef<View, CardActionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('flex-shrink-0', className)}
        {...props}
      >
        {children}
      </View>
    );
  }
);

CardAction.displayName = 'CardAction';

export interface CardContentProps extends ViewProps {
  size?: VariantProps<typeof cardContentVariants>['size'];
  className?: string;
}

/**
 * Card Content component with flexible layout
 */
export const CardContent = React.forwardRef<View, CardContentProps>(
  ({ size = 'default', className, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(cardContentVariants({ size }), className)}
        {...props}
      >
        {children}
      </View>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends ViewProps {
  size?: VariantProps<typeof cardFooterVariants>['size'];
  className?: string;
}

/**
 * Card Footer component for actions and metadata
 */
export const CardFooter = React.forwardRef<View, CardFooterProps>(
  ({ size = 'default', className, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(cardFooterVariants({ size }), className)}
        {...props}
      >
        {children}
      </View>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Export variant utilities
export { cardVariants, cardHeaderVariants, cardContentVariants, cardFooterVariants };

/**
 * Pressable Card - card that can be pressed/touched
 */
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface PressableCardProps extends TouchableOpacityProps {
  variant?: VariantProps<typeof cardVariants>['variant'];
  size?: VariantProps<typeof cardVariants>['size'];
  hapticFeedback?: boolean;
  className?: string;
}

export const PressableCard = React.forwardRef<TouchableOpacity, PressableCardProps>(
  ({ 
    variant = 'default', 
    size = 'default', 
    hapticFeedback = true,
    className, 
    style, 
    children,
    onPress,
    ...props 
  }, ref) => {
    const { theme } = useTheme();

    const handlePress = (event: any) => {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(event);
    };

    // Create shadow style based on variant
    const getShadowStyle = () => {
      if (variant === 'ghost' || variant === 'outline') {
        return {};
      }

      const shadowIntensity = variant === 'elevated' ? 'md' : 'sm';
      
      if (Platform.OS === 'ios') {
        const shadows = {
          sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          },
        };
        return shadows[shadowIntensity];
      } else {
        const elevations = {
          sm: 2,
          md: 4,
        };
        return { elevation: elevations[shadowIntensity] };
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handlePress}
        activeOpacity={0.95}
        className={cn(cardVariants({ variant, size }), className)}
        style={[
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
          getShadowStyle(),
          style,
        ]}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }
);

PressableCard.displayName = 'PressableCard';

/**
 * Simple Card presets for common use cases
 */
export const SimpleCard: React.FC<{
  title?: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  variant?: CardProps['variant'];
  size?: CardProps['size'];
  className?: string;
}> = ({ title, description, children, action, variant, size, className }) => {
  return (
    <Card variant={variant} size={size} className={className}>
      {(title || description || action) && (
        <CardHeader size={size}>
          <View className="flex-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </View>
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      
      {children && (
        <CardContent size={size}>
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default Card;