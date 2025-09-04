/**
 * Dynamic Expo Configuration
 * Task 4.1: Frontend Environment Configuration Enhancement
 * 
 * This configuration dynamically loads environment variables based on the current environment
 * and supports Android emulator localhost transformation for development workflow.
 */

import 'dotenv/config';

// Helper function to load environment-specific configuration
const getEnvironmentConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  const isDev = environment === 'development' || process.env.EXPO_DEV === 'true';

  // Base configuration from environment variables with fallbacks
  const config = {
    // API Configuration
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
    
    // Development Server Configuration
    EXPO_PUBLIC_DEV_SERVER_PORT: process.env.EXPO_PUBLIC_DEV_SERVER_PORT || '8081',
    EXPO_PUBLIC_DEV_SERVER_HOST: process.env.EXPO_PUBLIC_DEV_SERVER_HOST || 'localhost',
    
    // Debug Configuration
    EXPO_PUBLIC_DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE || (isDev ? 'true' : 'false'),
    EXPO_PUBLIC_ENABLE_FLIPPER: process.env.EXPO_PUBLIC_ENABLE_FLIPPER || 'false',
    
    // Performance Settings
    EXPO_PUBLIC_ENABLE_FAST_REFRESH: process.env.EXPO_PUBLIC_ENABLE_FAST_REFRESH || (isDev ? 'true' : 'false'),
    EXPO_PUBLIC_ENABLE_RELOADING: process.env.EXPO_PUBLIC_ENABLE_RELOADING || (isDev ? 'true' : 'false'),
    
    // Network Configuration
    EXPO_PUBLIC_ENABLE_LAN_ACCESS: process.env.EXPO_PUBLIC_ENABLE_LAN_ACCESS || (isDev ? 'true' : 'false'),
    EXPO_PUBLIC_ENABLE_TUNNEL: process.env.EXPO_PUBLIC_ENABLE_TUNNEL || 'false',
    
    // Supabase Integration
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    
    // OAuth Configuration
    EXPO_PUBLIC_GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    
    // Environment metadata
    EXPO_PUBLIC_ENVIRONMENT: environment,
    EXPO_PUBLIC_BUILD_TIME: new Date().toISOString(),
  };

  // Environment-specific overrides
  if (environment === 'staging') {
    config.EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api-staging.fm-setlogger.com';
  } else if (environment === 'production') {
    config.EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.fm-setlogger.com';
    config.EXPO_PUBLIC_DEBUG_MODE = 'false';
    config.EXPO_PUBLIC_ENABLE_FAST_REFRESH = 'false';
    config.EXPO_PUBLIC_ENABLE_LAN_ACCESS = 'false';
  }

  return config;
};

const environmentConfig = getEnvironmentConfig();

export default {
  expo: {
    name: "coach",
    slug: "coach",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "coach",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.coach"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.coach"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    // Dynamic environment configuration
    extra: {
      ...environmentConfig,
      // Environment information for debugging
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || ''
      }
    },
    // Development server configuration
    ...(environmentConfig.EXPO_PUBLIC_DEBUG_MODE === 'true' && {
      packagerOpts: {
        config: 'metro.config.js',
      },
      developerTool: environmentConfig.EXPO_PUBLIC_ENABLE_FLIPPER === 'true' ? 'flipper' : undefined
    })
  }
};