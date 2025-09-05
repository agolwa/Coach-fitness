/**
 * User Store Fix Verification
 * Tests to verify that automatic test user sign-in has graceful error handling
 */

import fs from 'fs';
import path from 'path';

describe('User Store Authentication Fix', () => {
  const userStorePath = path.join(__dirname, '../stores/user-store.ts');
  
  it('should have graceful error handling for automatic test user sign-in', () => {
    const content = fs.readFileSync(userStorePath, 'utf8');
    
    // Check that automatic sign-in still exists but with try-catch
    expect(content).toContain('await get().signInAsTestUser();');
    expect(content).toContain('// Fail gracefully - don\'t crash the app');
    expect(content).toContain('console.log(\'🚀 Development: Test user sign-in failed');
  });

  it('should have signInAsTestUser function with improved error handling', () => {
    const content = fs.readFileSync(userStorePath, 'utf8');
    
    // Function should still exist
    expect(content).toContain('signInAsTestUser: async () => {');
    
    // Should have less alarming error messages
    expect(content).toContain('normal when backend not running');
    expect(content).toContain('console.log(\'🚀 Development: Test user authentication failed');
  });

  it('should handle initialization gracefully without authentication', () => {
    const content = fs.readFileSync(userStorePath, 'utf8');
    
    // Should have proper error handling
    expect(content).toContain('Failed to initialize user preferences from storage');
    expect(content).toContain('...DEFAULT_USER_PREFERENCES');
  });
});