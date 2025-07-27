import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationGuardProps {
  children: React.ReactNode;
}

export function NavigationGuard({ children }: NavigationGuardProps) {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const hasNavigatedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset navigation flag when auth state changes
    if (lastUserIdRef.current !== (user?.uid || null)) {
      hasNavigatedRef.current = false;
      lastUserIdRef.current = user?.uid || null;
    }
  }, [user?.uid]);

  useEffect(() => {
    if (authLoading) return;
    if (hasNavigatedRef.current) return;

    const checkNavigation = async () => {
      try {
        const currentPath = segments.join('/');
        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';

        console.log('🧭 Navigation Guard Check:', {
          isAuthenticated: !!user,
          currentPath,
          inAuthGroup,
          inTabsGroup
        });

        if (!user) {
          // User not authenticated
          if (!inAuthGroup && currentPath !== '(auth)/login') {
            console.log('🔐 Redirecting to login - not authenticated');
            hasNavigatedRef.current = true;
            router.replace('/(auth)/login');
            return;
          }
        } else {
          // User is authenticated, check profile completion
          const profileCompleted = await AsyncStorage.getItem('profileCompleted');
          const userProfile = await AsyncStorage.getItem(`ocd_profile_${user.uid}`);

          const isProfileComplete = profileCompleted === 'true' && userProfile;

          if (!isProfileComplete) {
            // Profile not completed
            if (currentPath !== '(auth)/onboarding') {
              console.log('👤 Redirecting to onboarding - profile incomplete');
              hasNavigatedRef.current = true;
              router.replace('/(auth)/onboarding');
              return;
            }
          } else {
            // Profile completed
            if (inAuthGroup) {
              console.log('✅ Redirecting to main app - profile complete');
              hasNavigatedRef.current = true;
              router.replace('/(tabs)');
              return;
            }
          }
        }
      } catch (error) {
        console.error('❌ Navigation check error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Only run once per auth state change
    const timer = setTimeout(checkNavigation, 150);
    return () => clearTimeout(timer);
  }, [user, authLoading, segments.join('/')]);

  if (authLoading || isChecking) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#F9FAFB'
      }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return <>{children}</>;
}