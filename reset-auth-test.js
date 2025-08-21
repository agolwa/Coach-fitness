/**
 * Reset Authentication State for Testing
 * Run this script to clear stored auth state and test fresh user experience
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function resetAuthState() {
  try {
    // Clear all stored authentication data
    await AsyncStorage.multiRemove([
      '@user_preferences',
      '@workout_state', 
      '@app_state'
    ]);
    
    console.log('✅ Authentication state cleared successfully');
    console.log('📱 App will now show signup screen for fresh user experience');
    console.log('🔄 Restart the app to test');
    
  } catch (error) {
    console.error('❌ Failed to clear auth state:', error);
  }
}

resetAuthState();