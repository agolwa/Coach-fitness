/**
 * Figma-specific styles for React Native components
 * These match the exact typography specifications from the Figma design
 */

import { useTheme } from '@/hooks/use-theme';
import { TextStyle } from 'react-native';

export const useFigmaStyles = () => {
  const { isDark } = useTheme();

  const styles = {
    // Exercise Name - Inter SemiBold, 16px
    textExerciseName: {
      fontFamily: 'Inter',
      fontWeight: '600' as TextStyle['fontWeight'],
      fontSize: 16,
      lineHeight: 24,
      color: isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(32, 32, 32, 0.87)',
    },

    // Section Headers - Inter Regular, 16px
    textSectionHeader: {
      fontFamily: 'Inter',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 16,
      lineHeight: 24,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(32, 32, 32, 0.6)',
    },

    // Table Headers - Open Sans Regular, 10px
    textTableHeader: {
      fontFamily: 'Open Sans',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 10,
      lineHeight: 16,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as TextStyle['textTransform'],
      color: isDark ? 'rgba(255, 255, 255, 0.47)' : 'rgba(32, 32, 32, 0.47)',
    },

    // Table Data - Open Sans Regular, 12px
    textTableData: {
      fontFamily: 'Open Sans',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(32, 32, 32, 0.87)',
    },

    // Empty State Text - Inter Regular, 14px
    textEmptyState: {
      fontFamily: 'Inter',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 14,
      lineHeight: 21,
      color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(32, 32, 32, 0.4)',
    },

    // Secondary Info Text - Inter Regular, 12px
    textSecondaryInfo: {
      fontFamily: 'Inter',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(32, 32, 32, 0.6)',
    },

    // Exercise Icon Emoji - Roboto Medium, 22.67px
    textExerciseIcon: {
      fontFamily: 'Roboto',
      fontWeight: '500' as TextStyle['fontWeight'],
      fontSize: 22.67,
      lineHeight: 34,
      letterSpacing: 0.2125,
    },
  };

  return styles;
};

// Static version for when you don't need dynamic dark mode
export const figmaStyles = {
  light: {
    textExerciseName: {
      fontFamily: 'Inter',
      fontWeight: '600' as TextStyle['fontWeight'],
      fontSize: 16,
      lineHeight: 24,
      color: 'rgba(32, 32, 32, 0.87)',
    },
    textSectionHeader: {
      fontFamily: 'Inter',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 16,
      lineHeight: 24,
      color: 'rgba(32, 32, 32, 0.6)',
    },
    textTableHeader: {
      fontFamily: 'Open Sans',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 10,
      lineHeight: 16,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as TextStyle['textTransform'],
      color: 'rgba(32, 32, 32, 0.47)',
    },
    textTableData: {
      fontFamily: 'Open Sans',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 12,
      lineHeight: 16,
      color: 'rgba(32, 32, 32, 0.87)',
    },
    textEmptyState: {
      fontFamily: 'Inter',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 14,
      lineHeight: 21,
      color: 'rgba(32, 32, 32, 0.4)',
    },
    textSecondaryInfo: {
      fontFamily: 'Inter',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 12,
      lineHeight: 18,
      color: 'rgba(32, 32, 32, 0.6)',
    },
    textExerciseIcon: {
      fontFamily: 'Roboto',
      fontWeight: '500' as TextStyle['fontWeight'],
      fontSize: 22.67,
      lineHeight: 34,
      letterSpacing: 0.2125,
    },
  },
  dark: {
    textExerciseName: {
      fontFamily: 'Inter',
      fontWeight: '600' as TextStyle['fontWeight'],
      fontSize: 16,
      lineHeight: 24,
      color: 'rgba(255, 255, 255, 0.87)',
    },
    textSectionHeader: {
      fontFamily: 'Inter',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 16,
      lineHeight: 24,
      color: 'rgba(255, 255, 255, 0.6)',
    },
    textTableHeader: {
      fontFamily: 'Open Sans',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 10,
      lineHeight: 16,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as TextStyle['textTransform'],
      color: 'rgba(255, 255, 255, 0.47)',
    },
    textTableData: {
      fontFamily: 'Open Sans',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 12,
      lineHeight: 16,
      color: 'rgba(255, 255, 255, 0.87)',
    },
    textEmptyState: {
      fontFamily: 'Inter',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 14,
      lineHeight: 21,
      color: 'rgba(255, 255, 255, 0.4)',
    },
    textSecondaryInfo: {
      fontFamily: 'Inter',
      fontWeight: '400' as TextStyle['fontWeight'],
      fontSize: 12,
      lineHeight: 18,
      color: 'rgba(255, 255, 255, 0.6)',
    },
    textExerciseIcon: {
      fontFamily: 'Roboto',
      fontWeight: '500' as TextStyle['fontWeight'],
      fontSize: 22.67,
      lineHeight: 34,
      letterSpacing: 0.2125,
    },
  },
};