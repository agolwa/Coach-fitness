/**
 * Alert Context Provider
 * Manages global alert state following UI Implementation Guide patterns
 * Provides centralized alert management without module-level side effects
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import CustomAlert, { AlertType, AlertButton, AlertConfig } from '@/components/ui/CustomAlert';
import { setGlobalAlertInstance } from '@/utils/alert-utils';

interface AlertContextType {
  showAlert: (config: Omit<AlertConfig, 'visible' | 'onClose'>) => void;
  hideAlert: () => void;
  isVisible: boolean;
}

const AlertContext = createContext<AlertContextType | null>(null);

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((config: Omit<AlertConfig, 'visible' | 'onClose'>) => {
    setAlertConfig({
      ...config,
      visible: true,
      onClose: () => setAlertConfig(null),
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

  // Register global alert instance for utility functions
  useEffect(() => {
    setGlobalAlertInstance({ showAlert });
    
    // Cleanup on unmount
    return () => {
      setGlobalAlertInstance(null);
    };
  }, [showAlert]);

  const contextValue: AlertContextType = {
    showAlert,
    hideAlert,
    isVisible: alertConfig?.visible ?? false,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alertConfig && (
        <CustomAlert
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          visible={alertConfig.visible}
          onClose={alertConfig.onClose}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  
  return context;
}

// Utility hook for common alert patterns
export function useAlertActions() {
  const { showAlert } = useAlert();

  const showSuccess = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      type: 'success',
      title,
      message,
      buttons: [
        {
          text: 'OK',
          onPress: onOk,
          style: 'default',
        },
      ],
    });
  }, [showAlert]);

  const showError = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      type: 'error',
      title,
      message,
      buttons: [
        {
          text: 'OK',
          onPress: onOk,
          style: 'default',
        },
      ],
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      type: 'warning',
      title,
      message,
      buttons: [
        {
          text: 'OK',
          onPress: onOk,
          style: 'default',
        },
      ],
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      type: 'info',
      title,
      message,
      buttons: [
        {
          text: 'OK',
          onPress: onOk,
          style: 'default',
        },
      ],
    });
  }, [showAlert]);

  const showConfirm = useCallback((
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    showAlert({
      type: 'confirm',
      title,
      message,
      buttons: [
        {
          text: cancelText,
          onPress: onCancel,
          style: 'cancel',
        },
        {
          text: confirmText,
          onPress: onConfirm,
          style: 'default',
        },
      ],
    });
  }, [showAlert]);

  const showDestructive = useCallback((
    title: string,
    message?: string,
    onDestroy?: () => void,
    onCancel?: () => void,
    destructiveText: string = 'Delete',
    cancelText: string = 'Cancel'
  ) => {
    showAlert({
      type: 'destructive',
      title,
      message,
      buttons: [
        {
          text: cancelText,
          onPress: onCancel,
          style: 'cancel',
        },
        {
          text: destructiveText,
          onPress: onDestroy,
          style: 'destructive',
        },
      ],
    });
  }, [showAlert]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDestructive,
  };
}