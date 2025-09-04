const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Optimize for development
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Enable CORS for development
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return middleware(req, res, next);
    };
  },
};

// Enable hot reload optimizations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: false,
    keep_fnames: true,
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
