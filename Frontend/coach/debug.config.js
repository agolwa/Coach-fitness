/**
 * Development and Debugging Configuration
 * P1.2: Enhanced debugging and hot reload setup
 */

const debugConfig = {
  // Hot Reload Configuration
  fastRefresh: {
    enabled: true,
    preserveComponentState: true,
    errorOverlay: true,
    logLevel: 'info'
  },

  // Development Tools
  devTools: {
    reactDevTools: true,
    flipper: false, // Disabled for Expo projects
    networkInspector: true,
    performanceMonitor: true,
    logBox: true
  },

  // Network Configuration  
  network: {
    enableCORS: true,
    allowedOrigins: ['http://localhost:*', 'exp://*', 'https://*.exp.direct'],
    timeout: 10000
  },

  // Cache Settings
  cache: {
    clearOnStart: false,
    watchNodeModules: true,
    transformCache: true
  },

  // Source Maps
  sourceMaps: {
    enabled: true,
    includeNodeModules: false,
    sourceMapPath: '.expo/web/cache/production/static/js'
  }
};

// Apply debug configuration based on environment
if (__DEV__) {
  // Enable additional debugging in development
  console.log('[DEBUG] Development configuration loaded:', debugConfig);
  
  // Enable global error handling
  if (typeof ErrorUtils !== 'undefined') {
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('[DEBUG] Global Error:', error);
      if (isFatal) {
        console.error('[DEBUG] Fatal error occurred:', error.message);
      }
    });
  }
}

module.exports = debugConfig;