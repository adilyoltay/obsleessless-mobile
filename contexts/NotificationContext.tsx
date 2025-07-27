import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert, Platform } from 'react-native';
import { messagingService } from '@/services/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationContextType {
  isEnabled: boolean;
  fcmToken: string | null;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
  scheduleERPReminder: () => Promise<void>;
  scheduleDailyReminder: (hour?: number, minute?: number) => Promise<void>;
  sendProgressMilestone: (milestone: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // Web ortamında notification API'leri çalışmaz
    if (Platform.OS !== 'web') {
      initializeNotifications();
    }
  }, []);

  const initializeNotifications = async () => {
    try {
      // Check if notifications were previously enabled
      const savedPreference = await AsyncStorage.getItem('notificationsEnabled');
      if (savedPreference === 'true') {
        await enableNotifications();
      }

      // Initialize messaging service
      await messagingService.initializeMessaging();

      // Add notification listeners
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        handleNotificationResponse(response);
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;

    // Handle navigation based on notification data
    if (data?.screen) {
      // This would be handled by navigation service
      console.log('Navigate to:', data.screen);
    }
  };

  const enableNotifications = async (): Promise<boolean> => {
    try {
      const hasPermission = await messagingService.requestPermissions();

      if (hasPermission) {
        const token = await messagingService.getFCMToken();
        setFcmToken(token);
        setIsEnabled(true);
        await AsyncStorage.setItem('notificationsEnabled', 'true');

        // Schedule default daily reminder
        await scheduleDailyReminder();

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      return false;
    }
  };

  const disableNotifications = async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setIsEnabled(false);
      setFcmToken(null);
      await AsyncStorage.setItem('notificationsEnabled', 'false');
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    }
  };

  const scheduleERPReminder = async (): Promise<void> => {
    if (!isEnabled) return;
    await messagingService.sendERPReminder();
  };

  const scheduleDailyReminder = async (hour: number = 20, minute: number = 0): Promise<void> => {
    if (!isEnabled) return;
    await messagingService.scheduleDailyReminder(hour, minute);
  };

  const sendProgressMilestone = async (milestone: string): Promise<void> => {
    if (!isEnabled) return;
    await messagingService.sendProgressMilestone(milestone);
  };

  const value: NotificationContextType = {
    isEnabled,
    fcmToken,
    enableNotifications,
    disableNotifications,
    scheduleERPReminder,
    scheduleDailyReminder,
    sendProgressMilestone,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};