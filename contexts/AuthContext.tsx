import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  type User as FirebaseUser
} from 'firebase/auth';
import { initializeFirebase, getAuth } from '@/services/firebase';
import { biometricService, BiometricCapability } from '@/services/biometric';
import { signInWithGoogle } from '@/services/googleAuth';

interface User {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  // Biometric methods
  biometricCapability: BiometricCapability | null;
  isBiometricEnabled: boolean;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  loginWithBiometric: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biometricCapability, setBiometricCapability] = useState<BiometricCapability | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    initializeAuth();
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      const capability = await biometricService.checkBiometricCapability();
      setBiometricCapability(capability);

      const enabled = await biometricService.isBiometricLoginEnabled();
      setIsBiometricEnabled(enabled);
    } catch (error) {
      console.error('Biometric initialization failed:', error);
    }
  };

  const initializeAuth = async () => {
    try {
          await initializeFirebase();
    const auth = getAuth();

      // Listen to authentication state changes
      const unsubscribe = onAuthStateChanged(auth, onAuthStateChangedHandler);

      return unsubscribe;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setLoading(false);
    }
  };

  const onAuthStateChangedHandler = async (firebaseUser: FirebaseUser | null) => {
    console.log('🔄 Auth State Changed:', firebaseUser ? 'User logged in' : 'User logged out');
    if (firebaseUser) {
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'User',
        emailVerified: firebaseUser.emailVerified,
      };
      setUser(userData);
      
      // Check if user has completed profile
      try {
        const profileCompleted = await AsyncStorage.getItem('profileCompleted');
        const userProfile = await AsyncStorage.getItem(`ocd_profile_${firebaseUser.uid}`);
        
        if (!profileCompleted || !userProfile) {
          console.log('👤 Profile not completed, redirecting to onboarding');
          // Profile will be checked in NavigationGuard
        }
      } catch (error) {
        console.error('Profile check error:', error);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(getAuthErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      // Sign in with Google using new simplified method
      const user = await signInWithGoogle();

      if (user) {
        console.log('🎉 Google login successful:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      }
    } catch (error: any) {
      console.error('❌ Google login error:', error);

      // If user cancelled, don't throw error
      if (error?.message?.includes('iptal edildi')) {
        return null;
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const auth = getAuth();

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(getAuthErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      const auth = getAuth();
      await signOut(auth);
      await AsyncStorage.removeItem('authToken');
    } catch (error: any) {
      console.error('Logout error:', error);
      setError('Çıkış yapılırken bir hata oluştu');
      throw error;
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const enableBiometric = async (): Promise<boolean> => {
    try {
      if (!user?.email) {
        setError('Biometric authentication için giriş yapmanız gerekli');
        return false;
      }

      // For demo purposes, we'll use a placeholder for encrypted credentials
      // In production, you would properly encrypt the user's credentials
      const success = await biometricService.enableBiometricLogin(user.email, 'encrypted_credentials_placeholder');

      if (success) {
        setIsBiometricEnabled(true);
      } else {
        setError('Biometric authentication etkinleştirilemedi');
      }

      return success;
    } catch (error: any) {
      console.error('Enable biometric error:', error);
      setError('Biometric authentication etkinleştirme hatası');
      return false;
    }
  };

  const disableBiometric = async (): Promise<void> => {
    try {
      await biometricService.disableBiometricLogin();
      setIsBiometricEnabled(false);
    } catch (error: any) {
      console.error('Disable biometric error:', error);
      setError('Biometric authentication devre dışı bırakma hatası');
    }
  };

  const loginWithBiometric = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const authResult = await biometricService.authenticateWithBiometrics();

      if (!authResult.success) {
        setError(authResult.error || 'Biometric doğrulama başarısız');
        return;
      }

      const credentials = await biometricService.getBiometricCredentials();

      if (!credentials) {
        setError('Biometric kimlik bilgileri bulunamadı');
        return;
      }

      // In production, you would decrypt the credentials and use them to sign in
      // For demo purposes, we'll just simulate a successful login
      console.log('Biometric login successful for:', credentials.email);

      // You would call your actual login method here with the decrypted credentials
      // await login(credentials.email, decryptedPassword);

    } catch (error: any) {
      console.error('Biometric login error:', error);
      setError('Biometric giriş hatası');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    error,
    clearError,
    biometricCapability,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
    loginWithBiometric,
  }), [
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    error,
    clearError,
    biometricCapability,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
    loginWithBiometric,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
    case 'auth/wrong-password':
      return 'Yanlış şifre';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanımda';
    case 'auth/weak-password':
      return 'Şifre çok zayıf. En az 6 karakter olmalı';
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin';
    case 'auth/network-request-failed':
      return 'Ağ bağlantısı hatası';
    default:
      return 'Bir hata oluştu. Lütfen tekrar deneyin';
  }
};