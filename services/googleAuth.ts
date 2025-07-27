import { Platform } from 'react-native';
import { GoogleAuthProvider, signInWithCredential, User } from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getAuth } from './firebase';
import { GOOGLE_OAUTH_WEB_CLIENT_ID } from './firebase';

// WebBrowser yapılandırması
WebBrowser.maybeCompleteAuthSession();

// Google Sign-In için optimize edilmiş fonksiyon
export const signInWithGoogle = async (): Promise<User | null> => {
  const isDevelopment = __DEV__ || process.env.EXPO_PUBLIC_ENV === 'development';

  try {
    if (isDevelopment) {
      console.log('🚀 Starting Google Sign-In...');
    }

    // Validate Client ID
    if (!GOOGLE_OAUTH_WEB_CLIENT_ID || !GOOGLE_OAUTH_WEB_CLIENT_ID.includes('googleusercontent.com')) {
      throw new Error('Google OAuth Client ID yapılandırılmamış');
    }

    const redirectUri = 'https://auth.expo.io/@adilyoltay/obsessless-mobile';

    // Create OAuth request
    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_OAUTH_WEB_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      extraParams: {}
    });

    if (isDevelopment) {
      console.log('🔑 Using Client ID:', GOOGLE_OAUTH_WEB_CLIENT_ID.substring(0, 20) + '...');
      console.log('📍 Redirect URI:', redirectUri);
    }

    // Open Google OAuth
    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
    });

    if (isDevelopment) {
      console.log('📝 OAuth Result:', result.type);
    }

    if (result.type === 'dismiss') {
      console.log('🚫 Google Sign-In cancelled by user');
      throw new Error('Kullanıcı tarafından iptal edildi');
    }

    if (result.type === 'success') {
      const successResult = result as AuthSession.AuthSessionResult & {
        params: { id_token?: string };
      };

      if (successResult.params?.id_token) {
        if (isDevelopment) {
          console.log('✅ Google ID token received, signing in to Firebase...');
        }

        const googleCredential = GoogleAuthProvider.credential(successResult.params.id_token);
        const userCredential = await signInWithCredential(getAuth(), googleCredential);

        if (isDevelopment) {
          console.log('🎉 Firebase sign-in successful for:', userCredential.user.email);
        }

        return userCredential.user;
      } else {
        throw new Error('Google Sign-In başarılı ama ID token alınamadı');
      }
    } else if (result.type === 'cancel') {
      throw new Error('Google Sign-In iptal edildi');
    } else {
      throw new Error('Google Sign-In başarısız: ' + result.type);
    }
  } catch (error: any) {
    console.error('💥 Google Sign-In Error:', error?.message || error);

    // User cancelled - don't throw error
    if (error?.message === 'Kullanıcı tarafından iptal edildi') {
      return null;
    }

    throw new Error(`Google Sign-In başarısız: ${error?.message || 'Bilinmeyen hata'}`);
  }
};

// Google Sign-In durumunu kontrol et
export const checkGoogleAuthAvailability = (): boolean => {
  return !!GOOGLE_OAUTH_WEB_CLIENT_ID && GOOGLE_OAUTH_WEB_CLIENT_ID.includes('googleusercontent.com');
};