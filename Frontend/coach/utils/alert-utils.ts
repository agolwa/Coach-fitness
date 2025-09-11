/**
 * Alert Utility Functions
 * Provides easy-to-use alert functions that match React Native's Alert.alert API
 * Can be used anywhere in the app after AlertProvider is set up
 */

import { AlertType, AlertButton } from '@/components/ui/CustomAlert';

// Global alert instance - will be set by AlertProvider
let globalAlertInstance: {
  showAlert: (config: {
    type: AlertType;
    title: string;
    message?: string;
    buttons: AlertButton[];
  }) => void;
} | null = null;

// Set the global alert instance (called by AlertProvider)
export function setGlobalAlertInstance(instance: typeof globalAlertInstance) {
  globalAlertInstance = instance;
}

// Utility function to show success alerts
export function showSuccess(
  title: string,
  message?: string,
  onOk?: () => void
) {
  if (!globalAlertInstance) {
    console.warn('Alert system not initialized. Make sure AlertProvider is set up.');
    return;
  }

  globalAlertInstance.showAlert({
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
}

// Utility function to show error alerts
export function showError(
  title: string,
  message?: string,
  onOk?: () => void
) {
  if (!globalAlertInstance) {
    console.warn('Alert system not initialized. Make sure AlertProvider is set up.');
    return;
  }

  globalAlertInstance.showAlert({
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
}

// Utility function to show warning alerts
export function showWarning(
  title: string,
  message?: string,
  onOk?: () => void
) {
  if (!globalAlertInstance) {
    console.warn('Alert system not initialized. Make sure AlertProvider is set up.');
    return;
  }

  globalAlertInstance.showAlert({
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
}

// Utility function to show info alerts
export function showInfo(
  title: string,
  message?: string,
  onOk?: () => void
) {
  if (!globalAlertInstance) {
    console.warn('Alert system not initialized. Make sure AlertProvider is set up.');
    return;
  }

  globalAlertInstance.showAlert({
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
}

// Utility function to show confirmation dialogs
export function showConfirm(
  title: string,
  message?: string,
  onConfirm?: () => void,
  onCancel?: () => void,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel'
) {
  if (!globalAlertInstance) {
    console.warn('Alert system not initialized. Make sure AlertProvider is set up.');
    return;
  }

  globalAlertInstance.showAlert({
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
}

// Utility function to show destructive dialogs
export function showDestructive(
  title: string,
  message?: string,
  onDestroy?: () => void,
  onCancel?: () => void,
  destructiveText: string = 'Delete',
  cancelText: string = 'Cancel'
) {
  if (!globalAlertInstance) {
    console.warn('Alert system not initialized. Make sure AlertProvider is set up.');
    return;
  }

  globalAlertInstance.showAlert({
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
}

// Generic alert function that matches React Native's Alert.alert API
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  type: AlertType = 'info'
) {
  if (!globalAlertInstance) {
    console.warn('Alert system not initialized. Make sure AlertProvider is set up.');
    return;
  }

  // Default to a single OK button if no buttons provided
  const defaultButtons: AlertButton[] = [
    {
      text: 'OK',
      style: 'default',
    },
  ];

  globalAlertInstance.showAlert({
    type,
    title,
    message,
    buttons: buttons || defaultButtons,
  });
}

// Replacement for React Native's Alert.alert - drop-in replacement
export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[]
  ) => {
    showAlert(title, message, buttons, 'info');
  },
};

// Note: All utility functions are already individually exported above