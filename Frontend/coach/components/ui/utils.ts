/**
 * Utility functions for React Native components
 * Based on the original utils.ts but adapted for NativeWind
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines className strings with proper Tailwind CSS merging
 * Same as original web implementation but compatible with NativeWind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility for conditional class names in React Native
 * Handles both string and object-based conditions
 */
export function conditional(
  baseClasses: string,
  condition: boolean,
  conditionalClasses: string
): string {
  return cn(baseClasses, condition && conditionalClasses);
}

/**
 * Platform-specific class name helper
 * Useful for platform-specific styling in React Native
 */
export function platformClasses(
  base: string,
  ios?: string,
  android?: string
): string {
  const { Platform } = require('react-native');
  
  let platformSpecific = '';
  if (Platform.OS === 'ios' && ios) {
    platformSpecific = ios;
  } else if (Platform.OS === 'android' && android) {
    platformSpecific = android;
  }
  
  return cn(base, platformSpecific);
}

/**
 * Color opacity utility for dynamic alpha values
 * Helpful for hover states and theme variations
 */
export function withOpacity(color: string, opacity: number): string {
  // For HSL colors, we modify the alpha channel
  if (color.startsWith('hsl(')) {
    // Convert hsl(h, s%, l%) to hsla(h, s%, l%, opacity)
    return color.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`);
  }
  
  // For hex colors, convert to rgba
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // For other color formats, return as-is
  return color;
}

/**
 * Theme-aware class name utility
 * Automatically applies dark mode classes when needed
 */
export function themeClasses(
  lightClasses: string,
  darkClasses: string,
  isDark: boolean
): string {
  return cn(lightClasses, isDark && darkClasses);
}

export default cn;