import { getAuth } from './firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class MagicLinkAuthService {
  
  // Email ile magic link gönder (Google'dan bağımsız)
  static async sendMagicLink(email: string): Promise<void> {
    const actionCodeSettings = {
      url: 'https://obslessless-mobile.web.app/finishSignUp', // Firebase hosting URL
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.obslessless.mobile'
      },
      android: {
        packageName: 'com.obslessless.mobile',
        installApp: true,
        minimumVersion: '12'
      }
    };

    try {
      await sendSignInLinkToEmail(getAuth(), email, actionCodeSettings);
      await AsyncStorage.setItem('emailForSignIn', email);
      console.log('Magic link sent to:', email);
    } catch (error) {
      console.error('Magic link error:', error);
      throw new Error('Magic link gönderilemedi');
    }
  }

  // Magic link ile login ol
  static async signInWithMagicLink(emailLink: string): Promise<any> {
    try {
      if (isSignInWithEmailLink(getAuth(), emailLink)) {
        let email = await AsyncStorage.getItem('emailForSignIn');
        
        if (!email) {
          // Kullanıcıdan email iste
          email = prompt('Lütfen email adresinizi girin:');
        }

        if (email) {
          const result = await signInWithEmailLink(getAuth(), email, emailLink);
          await AsyncStorage.removeItem('emailForSignIn');
          return result.user;
        }
      }
      throw new Error('Geçersiz magic link');
    } catch (error) {
      console.error('Magic link login error:', error);
      throw error;
    }
  }

  // Link kontrolü (uygulama açıldığında)
  static checkForMagicLink(url: string) {
    return isSignInWithEmailLink(getAuth(), url);
  }
} 