import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  Auth, 
  getAuth as firebaseGetAuth,
  initializeAuth,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  User 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyD6z_u6Y9JS5nRAa1QDuceRaqgCOOnjAGA",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "obseess-mobile.firebaseapp.com", 
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "obseess-mobile",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "obseess-mobile.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "552237582808",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:552237582808:web:abcdef123456",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEF123456"
};

// Google OAuth Web Client ID from environment variable (TEK SOURCE!)
export const GOOGLE_OAUTH_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || "383417949858-1o6r8tav8vtg3pf9rjar8e1k8dspueq2.apps.googleusercontent.com";

// Firebase Web Push VAPID Key (for future web push support)
export const FIREBASE_VAPID_KEY = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY || "PlixvXwEJl4qmQwVQV7siqj3OLZckOHUNJhZQYhb-7M";

console.log('🔥 Firebase Config Updated:', {
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
  authDomain: firebaseConfig.authDomain,
  googleClientId: GOOGLE_OAUTH_WEB_CLIENT_ID ? '✓ Set' : '✗ Missing',
  vapidKey: FIREBASE_VAPID_KEY ? '✓ Set' : '✗ Missing',
  envSource: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID ? 'ENV' : 'HARDCODED'
});

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth;

export const initializeFirebase = async (): Promise<void> => {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('🔥 Firebase initialized successfully');
    } else {
      app = getApps()[0];
      console.log('🔥 Firebase already initialized');
    }
    
    // Initialize Auth
    // Note: AsyncStorage persistence warning in React Native can be safely ignored
    // Firebase automatically uses AsyncStorage in React Native environment
    auth = firebaseGetAuth(app);
    console.log('🔥 Firebase Auth initialized with automatic persistence');
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error('Firebase initialization failed');
  }
};

// Helper function to get auth instance
export const getAuth = (): Auth => {
  if (!auth) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return auth;
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  profileCompleted: boolean;
}

class FirebaseAuthService {
  async signUp(email: string, password: string, displayName?: string): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const user = userCredential.user;

      const profile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName || user.displayName || undefined,
        createdAt: new Date(),
        profileCompleted: false,
      };

      await AsyncStorage.setItem(`user_${user.uid}`, JSON.stringify(profile));
      return profile;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
      const user = userCredential.user;

      const stored = await AsyncStorage.getItem(`user_${user.uid}`);
      if (stored) {
        return JSON.parse(stored);
      }

      const profile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
        createdAt: new Date(),
        profileCompleted: true,
      };

      await AsyncStorage.setItem(`user_${user.uid}`, JSON.stringify(profile));
      return profile;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(getAuth());
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    const user = getAuth().currentUser;
    if (!user) throw new Error('No authenticated user');

    const stored = await AsyncStorage.getItem(`user_${user.uid}`);
    if (stored) {
      const profile = JSON.parse(stored);
      const updated = { ...profile, ...updates };
      await AsyncStorage.setItem(`user_${user.uid}`, JSON.stringify(updated));
    }
  }

  private handleAuthError(error: any): Error {
    let message = 'Bir hata oluştu';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Bu e-posta adresi zaten kullanımda';
        break;
      case 'auth/invalid-email':
        message = 'Geçersiz e-posta adresi';
        break;
      case 'auth/weak-password':
        message = 'Şifre çok zayıf (en az 6 karakter)';
        break;
      case 'auth/user-not-found':
        message = 'Kullanıcı bulunamadı';
        break;
      case 'auth/wrong-password':
        message = 'Yanlış şifre';
        break;
      case 'auth/invalid-credential':
        message = 'Geçersiz e-posta veya şifre';
        break;
      default:
        message = error.message || 'Giriş yapılamadı';
    }

    return new Error(message);
  }
}

export const firebaseAuthService = new FirebaseAuthService();
export default app || null;