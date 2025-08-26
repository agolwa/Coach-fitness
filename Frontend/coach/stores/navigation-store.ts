/**
 * Zustand Navigation Store for React Native
 * Manages tab navigation state and persistence
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';

// Constants
const NAVIGATION_STORAGE_KEY = 'navigation_preferences';
const PERSISTENCE_DEBOUNCE = 100; // ms

// Types
export type TabName = 'index' | 'activity' | 'profile';

export interface NavigationState {
  activeTab: TabName;
  lastActiveTab: TabName;
  isLoading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

export interface NavigationStore extends NavigationState {
  // Actions
  setActiveTab: (tab: TabName) => void;
  goToHome: () => void;
  goToActivity: () => void;
  goToProfile: () => void;
  
  // Persistence
  initializeNavigation: () => Promise<void>;
  persistNavigation: () => Promise<void>;
  handleAppStateChange: (nextAppState: AppStateStatus) => void;
  
  // Deep linking support
  restoreFromDeepLink: (tab: TabName) => void;
  
  // Utilities
  isTabActive: (tab: TabName) => boolean;
  getTabDisplayName: (tab: TabName) => string;
  clearError: () => void;
}

// Default state
const DEFAULT_NAVIGATION_STATE: NavigationState = {
  activeTab: 'index',
  lastActiveTab: 'index',
  isLoading: false,
  error: null,
};

// Debounced persistence utility
let persistenceTimeout: any = null;
let isInitializing = false;

const debouncedPersist = (state: Pick<NavigationState, 'activeTab' | 'lastActiveTab'>) => {
  if (persistenceTimeout) {
    clearTimeout(persistenceTimeout);
  }
  
  persistenceTimeout = setTimeout(async () => {
    try {
      await AsyncStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to persist navigation state:', error);
    }
  }, PERSISTENCE_DEBOUNCE);
};

// Validation utilities
const validateTabName = (tab: any): tab is TabName => {
  return tab === 'index' || tab === 'activity' || tab === 'profile';
};

const validateNavigationState = (state: any): state is Pick<NavigationState, 'activeTab' | 'lastActiveTab'> => {
  if (!state || typeof state !== 'object') return false;
  
  return (
    validateTabName(state.activeTab) &&
    validateTabName(state.lastActiveTab)
  );
};

// Create the Zustand store
export const useNavigationStore = create<NavigationStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...DEFAULT_NAVIGATION_STATE,

    // Navigation actions
    setActiveTab: (tab: TabName) => {
      if (!validateTabName(tab)) {
        set({ error: 'Invalid tab name' });
        return;
      }

      const currentState = get();
      
      const newState = {
        activeTab: tab,
        lastActiveTab: currentState.activeTab, // Store previous as last
        lastUpdated: new Date(),
        error: null, // Clear any existing errors
      };

      set(newState);
      
      // Persist to AsyncStorage
      debouncedPersist({
        activeTab: tab,
        lastActiveTab: currentState.activeTab,
      });
    },

    goToHome: () => {
      get().setActiveTab('index');
    },

    goToActivity: () => {
      get().setActiveTab('activity');
    },

    goToProfile: () => {
      get().setActiveTab('profile');
    },

    // Persistence
    initializeNavigation: async () => {
      // Prevent multiple concurrent initializations
      if (isInitializing) {
        console.log('Navigation store already initializing, skipping...');
        return;
      }
      
      try {
        isInitializing = true;
        set({ isLoading: true, error: null });

        const storedNavigation = await AsyncStorage.getItem(NAVIGATION_STORAGE_KEY);
        
        if (storedNavigation) {
          const navData = JSON.parse(storedNavigation);
          
          if (validateNavigationState(navData)) {
            set({
              activeTab: navData.activeTab,
              lastActiveTab: navData.lastActiveTab,
              isLoading: false,
            });
          } else {
            console.warn('Invalid stored navigation state, using defaults');
            set({
              ...DEFAULT_NAVIGATION_STATE,
              isLoading: false,
            });
          }
        } else {
          // No stored state, use defaults
          set({
            ...DEFAULT_NAVIGATION_STATE,
            isLoading: false,
          });
        }
      } catch (error) {
        console.warn('Failed to initialize navigation state from storage:', error);
        set({
          ...DEFAULT_NAVIGATION_STATE,
          error: 'Failed to load navigation preferences',
          isLoading: false,
        });
      } finally {
        isInitializing = false;
      }
    },

    persistNavigation: async () => {
      const state = get();
      
      try {
        const navigationData = {
          activeTab: state.activeTab,
          lastActiveTab: state.lastActiveTab,
        };
        
        await AsyncStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(navigationData));
        set({ lastUpdated: new Date() });
      } catch (error) {
        console.error('Failed to persist navigation state:', error);
        set({ error: 'Failed to save navigation preferences' });
      }
    },

    // Utilities
    isTabActive: (tab: TabName) => {
      const { activeTab } = get();
      return activeTab === tab;
    },

    getTabDisplayName: (tab: TabName) => {
      switch (tab) {
        case 'index':
          return 'Home';
        case 'activity':
          return 'Activity';
        case 'profile':
          return 'Profile';
        default:
          return 'Unknown';
      }
    },

    // App state handling for persistence
    handleAppStateChange: (nextAppState: AppStateStatus) => {
      const state = get();
      
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is going to background, persist current state immediately
        console.log('App going to background, persisting navigation state');
        get().persistNavigation();
      } else if (nextAppState === 'active') {
        // App is coming to foreground, ensure we have the latest state
        console.log('App coming to foreground, navigation state:', state.activeTab);
        // Could trigger a state refresh here if needed
      }
    },

    // Deep linking support
    restoreFromDeepLink: (tab: TabName) => {
      if (!validateTabName(tab)) {
        set({ error: 'Invalid tab name from deep link' });
        return;
      }

      const currentState = get();
      
      console.log('Restoring navigation from deep link:', tab);
      
      const newState = {
        activeTab: tab,
        lastActiveTab: currentState.activeTab,
        lastUpdated: new Date(),
        error: null,
      };

      set(newState);
      
      // Persist immediately for deep links
      debouncedPersist({
        activeTab: tab,
        lastActiveTab: currentState.activeTab,
      });
    },

    clearError: () => set({ error: null }),
  }))
);

// Set up app state listener for automatic persistence
let appStateListener: any = null;

// Initialize app state handling
const setupAppStateHandling = () => {
  if (appStateListener) {
    appStateListener.remove?.();
  }
  
  appStateListener = AppState.addEventListener('change', (nextAppState) => {
    const store = useNavigationStore.getState();
    store.handleAppStateChange(nextAppState);
  });
};

// Clean up app state listener
const cleanupAppStateHandling = () => {
  if (appStateListener) {
    appStateListener.remove?.();
    appStateListener = null;
  }
};

// Auto-setup when store is created
setupAppStateHandling();

// Export utilities
export { setupAppStateHandling, cleanupAppStateHandling };

// Export default for consistency
export default useNavigationStore;