
import React, { useEffect, useState } from 'react';
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
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (authLoading || hasNavigated) return;
    
    const checkNavigation = async () => {
      try {
        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';
        
        console.log('🧭 Navigation Guard Check:', {
          isAuthenticated: !!user,
          segments: segments.join('/'),
          inAuthGroup,
          inTabsGroup
        });

        if (!user) {
          // User not authenticated
          if (!inAuthGroup) {
            console.log('🔐 Redirecting to login - not authenticated');
            setHasNavigated(true);
            router.replace('/(auth)/login');
          }
        } else {
          // User is authenticated, check profile completion
          const profileCompleted = await AsyncStorage.getItem('profileCompleted');
          const userProfile = await AsyncStorage.getItem(`ocd_profile_${user.uid}`);
          
          const isProfileComplete = profileCompleted === 'true' && userProfile;
          
          if (!isProfileComplete) {
            // Profile not completed
            if (!segments.includes('onboarding')) {
              console.log('👤 Redirecting to onboarding - profile incomplete');
              setHasNavigated(true);
              router.replace('/(auth)/onboarding');
            }
          } else {
            // Profile completed
            if (inAuthGroup) {
              console.log('✅ Redirecting to main app - profile complete');
              setHasNavigated(true);
              router.replace('/(tabs)');
            }
          }
        }
      } catch (error) {
        console.error('❌ Navigation check error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Delay to prevent immediate re-renders
    const timer = setTimeout(checkNavigation, 100);
    return () => clearTimeout(timer);
  }, [user, segments, authLoading, hasNavigated]);

  // Reset navigation flag when auth state changes
  useEffect(() => {
    setHasNavigated(false);
  }, [user?.uid]);

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
