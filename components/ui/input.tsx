/**
 * Input Components for React Native
 * Migrated from web version with TextInput and proper mobile UX
 */

import React, { useState, useCallback } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';
import { useTheme } from '../../hooks/use-theme';

const inputVariants = cva(
  // Base styles for React Native TextInput
  "min-h-11 w-full rounded-md border px-3 py-2 text-base bg-input-background transition-all",
  {
    variants: {
      variant: {
        default: "border-border",
        error: "border-destructive",
        success: "border-primary",
      },
      size: {
        sm: "min-h-9 px-2.5 py-1.5 text-sm",
        default: "min-h-11 px-3 py-2 text-base",
        lg: "min-h-12 px-4 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const labelVariants = cva(
  "text-sm font-medium mb-2",
  {
    variants: {
      variant: {
        default: "text-foreground",
        error: "text-destructive",
        success: "text-primary",
      },
      required: {
        true: "after:content-['*'] after:text-destructive after:ml-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      required: false,
    },
  },
);

export interface InputProps extends TextInputProps {
  variant?: VariantProps<typeof inputVariants>['variant'];
  size?: VariantProps<typeof inputVariants>['size'];
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  showPasswordToggle?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
}

/**
 * Input component with label, validation states, and icons
 */
export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      variant = 'default',
      size = 'default',
      label,
      error,
      success,
      helperText,
      required = false,
      leftIcon,
      rightIcon,
      clearable = false,
      showPasswordToggle = false,
      className,
      inputClassName,
      labelClassName,
      containerClassName,
      secureTextEntry,
      value,
      onChangeText,
      style,
      placeholderTextColor,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
    const [isFocused, setIsFocused] = useState(false);

    // Determine variant based on validation state
    const currentVariant = error ? 'error' : success ? 'success' : variant;
    
    // Get placeholder color from theme
    const defaultPlaceholderColor = theme.colors['muted-foreground'];

    const handleClear = useCallback(() => {
      onChangeText?.('');
    }, [onChangeText]);

    const togglePasswordVisibility = useCallback(() => {
      setIsPasswordVisible(!isPasswordVisible);
    }, [isPasswordVisible]);

    const handleFocus = useCallback((e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    }, [props.onFocus]);

    const handleBlur = useCallback((e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    }, [props.onBlur]);

    // Render clear button
    const renderClearButton = () => {
      if (!clearable || !value) return null;

      return (
        <TouchableOpacity 
          onPress={handleClear}
          className="p-1 ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-muted-foreground text-lg">×</Text>
        </TouchableOpacity>
      );
    };

    // Render password toggle
    const renderPasswordToggle = () => {
      if (!showPasswordToggle) return null;

      return (
        <TouchableOpacity 
          onPress={togglePasswordVisibility}
          className="p-1 ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-muted-foreground text-sm">
            {isPasswordVisible ? '👁️' : '🙈'}
          </Text>
        </TouchableOpacity>
      );
    };

    // Render helper text
    const renderHelperText = () => {
      const text = error || success || helperText;
      if (!text) return null;

      const textColor = error ? 'text-destructive' : success ? 'text-primary' : 'text-muted-foreground';

      return (
        <Text className={cn('text-xs mt-1', textColor)}>
          {text}
        </Text>
      );
    };

    return (
      <View className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <Text 
            className={cn(
              labelVariants({ variant: currentVariant, required }),
              labelClassName
            )}
          >
            {label}
          </Text>
        )}

        {/* Input Container */}
        <View className={cn(
          'flex-row items-center',
          inputVariants({ variant: currentVariant, size }),
          isFocused && 'border-ring',
          className
        )}>
          {/* Left Icon */}
          {leftIcon && (
            <View className="mr-2">
              {leftIcon}
            </View>
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
            placeholderTextColor={placeholderTextColor || defaultPlaceholderColor}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'flex-1 text-foreground',
              size === 'sm' && 'text-sm',
              size === 'lg' && 'text-lg',
              inputClassName
            )}
            style={[
              {
                // Ensure proper text color inheritance
                color: theme.colors.foreground,
              },
              style,
            ]}
            {...props}
          />

          {/* Right Icons */}
          <View className="flex-row items-center">
            {renderClearButton()}
            {renderPasswordToggle()}
            {rightIcon && (
              <View className="ml-2">
                {rightIcon}
              </View>
            )}
          </View>
        </View>

        {/* Helper Text */}
        {renderHelperText()}
      </View>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea component for multi-line text input
 */
export interface TextareaProps extends TextInputProps {
  variant?: VariantProps<typeof inputVariants>['variant'];
  size?: VariantProps<typeof inputVariants>['size'];
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  required?: boolean;
  minHeight?: number;
  maxHeight?: number;
  autoResize?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  (
    {
      variant = 'default',
      size = 'default',
      label,
      error,
      success,
      helperText,
      required = false,
      minHeight = 80,
      maxHeight = 200,
      autoResize = true,
      className,
      inputClassName,
      labelClassName,
      containerClassName,
      style,
      placeholderTextColor,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [height, setHeight] = useState(minHeight);
    const [isFocused, setIsFocused] = useState(false);

    // Determine variant based on validation state
    const currentVariant = error ? 'error' : success ? 'success' : variant;
    
    // Get placeholder color from theme
    const defaultPlaceholderColor = theme.colors['muted-foreground'];

    const handleContentSizeChange = useCallback((e: any) => {
      if (!autoResize) return;

      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, e.nativeEvent.contentSize.height)
      );
      setHeight(newHeight);
    }, [autoResize, minHeight, maxHeight]);

    const handleFocus = useCallback((e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    }, [props.onFocus]);

    const handleBlur = useCallback((e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    }, [props.onBlur]);

    // Render helper text
    const renderHelperText = () => {
      const text = error || success || helperText;
      if (!text) return null;

      const textColor = error ? 'text-destructive' : success ? 'text-primary' : 'text-muted-foreground';

      return (
        <Text className={cn('text-xs mt-1', textColor)}>
          {text}
        </Text>
      );
    };

    return (
      <View className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <Text 
            className={cn(
              labelVariants({ variant: currentVariant, required }),
              labelClassName
            )}
          >
            {label}
          </Text>
        )}

        {/* Textarea */}
        <TextInput
          ref={ref}
          multiline
          textAlignVertical="top"
          onContentSizeChange={handleContentSizeChange}
          placeholderTextColor={placeholderTextColor || defaultPlaceholderColor}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            inputVariants({ variant: currentVariant, size }),
            'py-3', // Better padding for multiline
            isFocused && 'border-ring',
            className,
            inputClassName
          )}
          style={[
            {
              height: autoResize ? height : minHeight,
              color: theme.colors.foreground,
            },
            style,
          ]}
          {...props}
        />

        {/* Helper Text */}
        {renderHelperText()}
      </View>
    );
  }
);

Textarea.displayName = 'Textarea';

// Export variant utilities
export { inputVariants, labelVariants };

/**
 * Search Input - specialized input for search functionality
 */
export interface SearchInputProps extends InputProps {
  onSearch?: (query: string) => void;
  searchDelay?: number;
}

export const SearchInput = React.forwardRef<TextInput, SearchInputProps>(
  ({ onSearch, searchDelay = 300, ...props }, ref) => {
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleSearchChange = useCallback((text: string) => {
      props.onChangeText?.(text);

      if (onSearch) {
        // Clear previous timeout
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced search
        const timeout = setTimeout(() => {
          onSearch(text);
        }, searchDelay);

        setSearchTimeout(timeout);
      }
    }, [onSearch, searchDelay, searchTimeout, props.onChangeText]);

    return (
      <Input
        ref={ref}
        {...props}
        onChangeText={handleSearchChange}
        leftIcon={<Text className="text-muted-foreground">🔍</Text>}
        clearable
        placeholder="Search..."
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default Input;