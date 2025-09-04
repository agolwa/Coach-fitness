/**
 * Network State Hook for React Native
 * 
 * Provides real-time network connectivity status and utilities for handling
 * online/offline states in the FM-SetLogger app.
 * 
 * Features:
 * - Real-time network state monitoring
 * - Integration with React Query for offline handling
 * - Network error detection
 * - Offline queue management
 */

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { isNetworkError, shouldWorkOffline } from '@/services/api-client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface NetworkState {
  isConnected: boolean;
  isOnline: boolean;
  isOffline: boolean;
  connectionType: NetInfoStateType;
  isInternetReachable: boolean | null;
  hasStrongConnection: boolean;
  lastChecked: Date;
}

export interface NetworkHookReturn extends NetworkState {
  checkConnectivity: () => Promise<boolean>;
  isNetworkError: (error: any) => boolean;
  shouldWorkOffline: (timeout?: number) => Promise<boolean>;
}

// ============================================================================
// Network State Hook
// ============================================================================

/**
 * Hook to monitor network connectivity and provide network utilities
 * @returns NetworkHookReturn object with network state and utilities
 */
export function useNetwork(): NetworkHookReturn {
  const queryClient = useQueryClient();
  
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true, // Optimistic default
    isOnline: true,
    isOffline: false,
    connectionType: NetInfoStateType.unknown,
    isInternetReachable: null,
    hasStrongConnection: true,
    lastChecked: new Date(),
  });

  // ============================================================================
  // Network State Management
  // ============================================================================

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable;
      const connectionType = state.type;
      
      // Determine if we have a strong connection
      const hasStrongConnection = 
        isConnected && 
        isInternetReachable !== false &&
        (connectionType === NetInfoStateType.wifi || 
         connectionType === NetInfoStateType.ethernet ||
         (connectionType === NetInfoStateType.cellular && 
          state.details && 
          'cellularGeneration' in state.details && 
          (state.details.cellularGeneration === '4g' || state.details.cellularGeneration === '5g')));

      const newNetworkState: NetworkState = {
        isConnected,
        isOnline: isConnected && isInternetReachable !== false,
        isOffline: !isConnected || isInternetReachable === false,
        connectionType,
        isInternetReachable,
        hasStrongConnection,
        lastChecked: new Date(),
      };

      setNetworkState(newNetworkState);

      // Handle React Query cache invalidation on reconnect
      if (newNetworkState.isOnline && !networkState.isOnline) {
        // We're back online, invalidate and refetch critical queries
        console.log('🌐 Network restored - invalidating queries');
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            // Only invalidate queries that are likely to have stale data
            return query.state.isInvalidated || 
                   (query.state.dataUpdatedAt && 
                    Date.now() - query.state.dataUpdatedAt > 30000); // 30 seconds old
          }
        });
      }

      // Log network state changes for debugging
      if (newNetworkState.isOnline !== networkState.isOnline) {
        console.log(`🌐 Network state changed: ${newNetworkState.isOnline ? 'ONLINE' : 'OFFLINE'}`);
      }
    });

    // Get initial network state
    NetInfo.fetch().then((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable;
      const connectionType = state.type;
      
      const hasStrongConnection = 
        isConnected && 
        isInternetReachable !== false &&
        (connectionType === NetInfoStateType.wifi || 
         connectionType === NetInfoStateType.ethernet ||
         (connectionType === NetInfoStateType.cellular && 
          state.details && 
          'cellularGeneration' in state.details && 
          (state.details.cellularGeneration === '4g' || state.details.cellularGeneration === '5g')));

      setNetworkState({
        isConnected,
        isOnline: isConnected && isInternetReachable !== false,
        isOffline: !isConnected || isInternetReachable === false,
        connectionType,
        isInternetReachable,
        hasStrongConnection,
        lastChecked: new Date(),
      });
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [queryClient, networkState.isOnline]);

  // ============================================================================
  // Network Utilities
  // ============================================================================

  /**
   * Manually check connectivity by pinging the server
   */
  const checkConnectivity = async (): Promise<boolean> => {
    try {
      const isOffline = await shouldWorkOffline(2000); // 2 second timeout
      const isOnline = !isOffline;
      
      // Update state if different from current
      if (isOnline !== networkState.isOnline) {
        setNetworkState(prev => ({
          ...prev,
          isOnline,
          isOffline,
          lastChecked: new Date(),
        }));
      }
      
      return isOnline;
    } catch (error) {
      console.warn('Connectivity check failed:', error);
      return false;
    }
  };

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    ...networkState,
    checkConnectivity,
    isNetworkError,
    shouldWorkOffline,
  };
}

// ============================================================================
// Network Status Provider (Optional Context-based approach)
// ============================================================================

/**
 * Utility function to get a one-time network status check
 * Useful for components that don't need real-time monitoring
 */
export async function getNetworkStatus(): Promise<NetworkState> {
  try {
    const state = await NetInfo.fetch();
    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable;
    const connectionType = state.type;
    
    const hasStrongConnection = 
      isConnected && 
      isInternetReachable !== false &&
      (connectionType === NetInfoStateType.wifi || 
       connectionType === NetInfoStateType.ethernet);

    return {
      isConnected,
      isOnline: isConnected && isInternetReachable !== false,
      isOffline: !isConnected || isInternetReachable === false,
      connectionType,
      isInternetReachable,
      hasStrongConnection,
      lastChecked: new Date(),
    };
  } catch (error) {
    console.warn('Failed to get network status:', error);
    // Return pessimistic defaults on error
    return {
      isConnected: false,
      isOnline: false,
      isOffline: true,
      connectionType: NetInfoStateType.unknown,
      isInternetReachable: false,
      hasStrongConnection: false,
      lastChecked: new Date(),
    };
  }
}

// Export types for use in other files
export type { NetInfoState, NetInfoStateType };