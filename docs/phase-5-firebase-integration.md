# Phase 5: Firebase Integration (Day 12-13)

## Overview
This phase implements Firebase services including Authentication, Cloud Messaging, and biometric authentication for enhanced security.

## Prerequisites
- Firebase project created and configured
- iOS and Android Firebase configuration files added
- Firebase SDK packages installed
- Apple Developer account for APNs setup

## Tasks Overview

### Task 5.1: Firebase Authentication
**Duration**: 0.5 day
**Dependencies**: Auth context from Phase 4

### Task 5.2: Firebase Cloud Messaging
**Duration**: 1 day
**Dependencies**: Notification context, platform configurations

### Task 5.3: Biometric Authentication
**Duration**: 0.5 day
**Dependencies**: Firebase Auth, secure storage

## Detailed Implementation

### Task 5.1: Firebase Authentication

#### 1. iOS Configuration
```bash
# ios/ObsessLessMobile/Info.plist
# Add URL schemes for Firebase Auth
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.obsessless.app</string>
        </array>
    </dict>
</array>
```

#### 2. Android Configuration
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<activity android:name="com.facebook.react.devsupport.DevSettingsActivity" />
<meta-data android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@drawable/ic_notification" />
<meta-data android:name="com.google.firebase.messaging.default_notification_color"
    android:resource="@color/colorAccent" />
```

#### 3. Firebase Auth Service Implementation
```typescript
// src/services/firebase-auth.ts
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User, UserProfile } from '../types/user';

export class FirebaseAuthService {
  private auth: FirebaseAuthTypes.Module;
  private db = firestore();

  constructor() {
    this.auth = auth();
  }

  // Email/Password Authentication
  async signUpWithEmail(email: string, password: string, name: string): Promise<UserProfile> {
    try {
      // Create Firebase user
      const credential = await this.auth.createUserWithEmailAndPassword(email, password);
      
      // Update display name
      await credential.user.updateProfile({ displayName: name });
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        id: credential.user.uid,
        email: email,
        name: name,
        createdAt: new Date(),
        language: 'tr',
        dailyGoal: 3,
        notificationsEnabled: true,
      };
      
      await this.db.collection('users').doc(credential.user.uid).set(userProfile);
      
      // Sync with backend API
      await this.syncUserWithBackend(userProfile);
      
      return userProfile;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    try {
      const credential = await this.auth.signInWithEmailAndPassword(email, password);
      const userProfile = await this.getUserProfile(credential.user.uid);
      return userProfile;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
  }

  // Password Reset
  async sendPasswordResetEmail(email: string): Promise<void> {
    await this.auth.sendPasswordResetEmail(email);
  }

  // User Profile Management
  async getUserProfile(uid: string): Promise<UserProfile> {
    const doc = await this.db.collection('users').doc(uid).get();
    if (!doc.exists) {
      throw new Error('User profile not found');
    }
    return doc.data() as UserProfile;
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    await this.db.collection('users').doc(uid).update(updates);
    await this.syncUserWithBackend({ id: uid, ...updates });
  }

  // Token Management
  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }

  // Auth State Observer
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return this.auth.onAuthStateChanged(callback);
  }

  // Error Handling
  private handleAuthError(error: any): void {
    let message = 'Bir hata oluştu';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Bu e-posta adresi zaten kullanımda';
        break;
      case 'auth/invalid-email':
        message = 'Geçersiz e-posta adresi';
        break;
      case 'auth/operation-not-allowed':
        message = 'İşlem izni yok';
        break;
      case 'auth/weak-password':
        message = 'Şifre çok zayıf';
        break;
      case 'auth/user-not-found':
        message = 'Kullanıcı bulunamadı';
        break;
      case 'auth/wrong-password':
        message = 'Yanlış şifre';
        break;
    }
    
    throw new Error(message);
  }

  // Backend Sync
  private async syncUserWithBackend(userProfile: Partial<UserProfile>): Promise<void> {
    // Call your backend API to sync user data
    await api.post('/users/sync', userProfile);
  }
}

export const firebaseAuth = new FirebaseAuthService();
```

#### 4. Auth Hook Implementation
```typescript
// src/hooks/useFirebaseAuth.ts
import { useState, useEffect } from 'react';
import { firebaseAuth } from '../services/firebase-auth';
import { UserProfile } from '../types/user';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await firebaseAuth.getUserProfile(firebaseUser.uid);
          setUser(profile);
        } catch (err) {
          setError('Profil yüklenemedi');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      const profile = await firebaseAuth.signInWithEmail(email, password);
      setUser(profile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const profile = await firebaseAuth.signUpWithEmail(email, password, name);
      setUser(profile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    await firebaseAuth.signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
};
```

### Task 5.2: Firebase Cloud Messaging

#### 1. iOS APNs Setup
```objective-c
// ios/ObsessLessMobile/AppDelegate.m
#import <Firebase.h>
#import <UserNotifications/UserNotifications.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  
  // Register for remote notifications
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
    if (granted) {
      dispatch_async(dispatch_get_main_queue(), ^{
        [application registerForRemoteNotifications];
      });
    }
  }];
  
  return YES;
}
```

#### 2. Push Notification Service
```typescript
// src/services/push-notifications.ts
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidColor } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export class PushNotificationService {
  async initialize() {
    // Request permissions
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await this.getFCMToken();
      this.setupHandlers();
      await this.createNotificationChannels();
    }

    return enabled;
  }

  async getFCMToken(): Promise<string> {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    
    if (!fcmToken) {
      fcmToken = await messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
        await this.sendTokenToServer(fcmToken);
      }
    }
    
    return fcmToken;
  }

  private async sendTokenToServer(token: string) {
    // Send token to your backend
    await api.post('/users/fcm-token', { token });
  }

  private setupHandlers() {
    // Foreground message handler
    messaging().onMessage(async (remoteMessage) => {
      await this.displayNotification(remoteMessage);
    });

    // Background/Quit message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      await this.handleBackgroundMessage(remoteMessage);
    });

    // Notification interaction handler
    messaging().onNotificationOpenedApp((remoteMessage) => {
      this.handleNotificationClick(remoteMessage);
    });

    // Check if app was opened from notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          this.handleNotificationClick(remoteMessage);
        }
      });
  }

  private async createNotificationChannels() {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default',
        name: 'Genel Bildirimler',
        importance: AndroidImportance.HIGH,
      });

      await notifee.createChannel({
        id: 'reminders',
        name: 'Hatırlatıcılar',
        importance: AndroidImportance.HIGH,
        sound: 'reminder',
      });

      await notifee.createChannel({
        id: 'achievements',
        name: 'Başarılar',
        importance: AndroidImportance.DEFAULT,
        sound: 'achievement',
      });
    }
  }

  async displayNotification(remoteMessage: any) {
    const { title, body, data } = remoteMessage.notification || {};
    
    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId: data?.channelId || 'default',
        smallIcon: 'ic_notification',
        color: AndroidColor.GREEN,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: data?.sound || 'default',
      },
    });
  }

  private async handleBackgroundMessage(remoteMessage: any) {
    // Handle background tasks
    const { data } = remoteMessage;
    
    if (data?.type === 'sync') {
      // Perform background sync
      await this.performBackgroundSync();
    }
  }

  private handleNotificationClick(remoteMessage: any) {
    const { data } = remoteMessage;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'compulsion_reminder':
        // Navigate to compulsion tracking
        break;
      case 'erp_reminder':
        // Navigate to ERP exercises
        break;
      case 'achievement':
        // Navigate to achievements
        break;
    }
  }

  // Schedule local notifications
  async scheduleReminder(reminder: ReminderData) {
    const trigger = {
      type: notifee.TriggerType.TIMESTAMP,
      timestamp: reminder.time.getTime(),
      repeatFrequency: reminder.repeatFrequency,
    };

    await notifee.createTriggerNotification(
      {
        title: reminder.title,
        body: reminder.body,
        data: reminder.data,
        android: {
          channelId: 'reminders',
        },
      },
      trigger
    );
  }

  async cancelAllReminders() {
    await notifee.cancelAllNotifications();
  }
}

export const pushNotifications = new PushNotificationService();
```

#### 3. Notification Hooks
```typescript
// src/hooks/usePushNotifications.ts
import { useState, useEffect } from 'react';
import { pushNotifications } from '../services/push-notifications';
import { useAuth } from '../contexts/AuthContext';

export const usePushNotifications = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeNotifications();
    }
  }, [user]);

  const initializeNotifications = async () => {
    try {
      const isEnabled = await pushNotifications.initialize();
      setEnabled(isEnabled);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleCompulsionReminder = async (time: Date) => {
    await pushNotifications.scheduleReminder({
      title: 'Kompulsiyon Takibi',
      body: 'Bugünkü kompulsiyonlarınızı kaydetmeyi unutmayın',
      time,
      repeatFrequency: 'daily',
      data: { type: 'compulsion_reminder' },
    });
  };

  const scheduleERPReminder = async (exerciseName: string, time: Date) => {
    await pushNotifications.scheduleReminder({
      title: 'ERP Egzersizi',
      body: `${exerciseName} egzersizini yapma zamanı`,
      time,
      data: { type: 'erp_reminder' },
    });
  };

  return {
    enabled,
    loading,
    scheduleCompulsionReminder,
    scheduleERPReminder,
    cancelAllReminders: pushNotifications.cancelAllReminders,
  };
};
```

### Task 5.3: Biometric Authentication

#### 1. Biometric Service Implementation
```typescript
// src/services/biometric-auth.ts
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

export class BiometricAuthService {
  private rnBiometrics = new ReactNativeBiometrics();

  async isBiometricSupported(): Promise<{
    available: boolean;
    biometryType?: BiometryTypes;
  }> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      return { available, biometryType };
    } catch (error) {
      return { available: false };
    }
  }

  async enrollBiometric(userId: string, password: string): Promise<boolean> {
    try {
      const { available } = await this.isBiometricSupported();
      if (!available) {
        throw new Error('Biyometrik doğrulama desteklenmiyor');
      }

      // Store credentials securely
      await Keychain.setInternetCredentials(
        'com.obsessless.app',
        userId,
        password,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );

      await AsyncStorage.setItem('biometricEnabled', 'true');
      return true;
    } catch (error) {
      console.error('Biometric enrollment failed:', error);
      return false;
    }
  }

  async authenticateWithBiometric(): Promise<{
    success: boolean;
    credentials?: { username: string; password: string };
  }> {
    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: 'Giriş için biyometrik doğrulama',
        cancelButtonText: 'İptal',
      });

      if (success) {
        // Retrieve stored credentials
        const credentials = await Keychain.getInternetCredentials('com.obsessless.app');
        if (credentials) {
          return {
            success: true,
            credentials: {
              username: credentials.username,
              password: credentials.password,
            },
          };
        }
      }

      return { success: false };
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return { success: false };
    }
  }

  async disableBiometric(): Promise<void> {
    await Keychain.resetInternetCredentials('com.obsessless.app');
    await AsyncStorage.removeItem('biometricEnabled');
  }

  async isBiometricEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem('biometricEnabled');
    return enabled === 'true';
  }

  getBiometricTypeLabel(biometryType?: BiometryTypes): string {
    switch (biometryType) {
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.Biometrics:
        return 'Parmak İzi';
      default:
        return 'Biyometrik';
    }
  }
}

export const biometricAuth = new BiometricAuthService();
```

#### 2. Biometric Hook
```typescript
// src/hooks/useBiometricAuth.ts
import { useState, useEffect } from 'react';
import { biometricAuth } from '../services/biometric-auth';
import { useAuth } from '../contexts/AuthContext';
import { BiometryTypes } from 'react-native-biometrics';

export const useBiometricAuth = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryTypes>();
  const [loading, setLoading] = useState(true);
  const { signIn } = useAuth();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const { available, biometryType } = await biometricAuth.isBiometricSupported();
      setIsSupported(available);
      setBiometryType(biometryType);
      
      if (available) {
        const enabled = await biometricAuth.isBiometricEnabled();
        setIsEnabled(enabled);
      }
    } finally {
      setLoading(false);
    }
  };

  const enableBiometric = async (email: string, password: string): Promise<boolean> => {
    try {
      const success = await biometricAuth.enrollBiometric(email, password);
      if (success) {
        setIsEnabled(true);
      }
      return success;
    } catch (error) {
      console.error('Failed to enable biometric:', error);
      return false;
    }
  };

  const disableBiometric = async () => {
    await biometricAuth.disableBiometric();
    setIsEnabled(false);
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      const { success, credentials } = await biometricAuth.authenticateWithBiometric();
      
      if (success && credentials) {
        await signIn(credentials.username, credentials.password);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const getBiometricLabel = () => {
    return biometricAuth.getBiometricTypeLabel(biometryType);
  };

  return {
    isSupported,
    isEnabled,
    biometryType,
    loading,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    getBiometricLabel,
  };
};
```

## Platform-Specific Configurations

### iOS Specific
1. **Info.plist permissions**
```xml
<key>NSFaceIDUsageDescription</key>
<string>ObsessLess uygulamasına hızlı giriş için Face ID kullanın</string>
```

2. **Keychain sharing**
   - Enable Keychain Sharing in Xcode capabilities
   - Add keychain group: `$(AppIdentifierPrefix)com.obsessless.app`

### Android Specific
1. **AndroidManifest.xml permissions**
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

2. **Gradle dependencies**
```gradle
dependencies {
    implementation 'androidx.biometric:biometric:1.1.0'
}
```

## Testing Guidelines

### Authentication Testing
- Test email/password signup and login
- Test password reset flow
- Test token refresh mechanism
- Test offline authentication

### Push Notification Testing
- Test permission requests on both platforms
- Test foreground notifications
- Test background notifications
- Test notification click handling
- Test scheduled notifications

### Biometric Testing
- Test on devices with different biometric types
- Test enrollment flow
- Test authentication flow
- Test fallback to password
- Test biometric removal

## Security Considerations

1. **Token Storage**
   - Use Keychain (iOS) / Keystore (Android)
   - Implement token rotation
   - Clear tokens on logout

2. **Biometric Security**
   - Store only encrypted credentials
   - Use hardware-backed security
   - Implement rate limiting

3. **Data Encryption**
   - Encrypt sensitive user data
   - Use HTTPS for all API calls
   - Implement certificate pinning

## Common Issues & Solutions

### Issue 1: Firebase initialization error
**Solution**: Ensure GoogleService-Info.plist (iOS) and google-services.json (Android) are correctly placed

### Issue 2: Push notifications not received
**Solution**: Check APNs configuration, FCM server key, and device permissions

### Issue 3: Biometric authentication fails
**Solution**: Verify keychain/keystore configuration and permissions

## Checklist

- [ ] Firebase Auth configured for both platforms
- [ ] Email/password authentication working
- [ ] Token management implemented
- [ ] Push notifications configured
- [ ] APNs certificates uploaded
- [ ] FCM working on both platforms
- [ ] Notification channels created
- [ ] Biometric authentication implemented
- [ ] Secure credential storage
- [ ] All permissions configured
- [ ] Error handling complete
- [ ] Security measures in place

## Next Steps
After completing Phase 5:
1. Test authentication flows end-to-end
2. Verify push notifications on real devices
3. Test biometric on various devices
4. Proceed to Phase 6 (Feature Implementation)