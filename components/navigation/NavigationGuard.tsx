
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

  useEffect(() => {
    if (authLoading) return;
    
    const checkNavigation = async () => {
      try {
        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';
        
        console.log('Navigation decision:', {
          isAuthenticated: !!user,
          isLoading: authLoading,
          segments,
          inAuthGroup,
          inTabsGroup
        });

        if (!user) {
          // User not authenticated, redirect to login
          if (!inAuthGroup) {
            router.replace('/(auth)/login');
          }
        } else {
          // User is authenticated, check profile completion
          const profileCompleted = await AsyncStorage.getItem('profileCompleted');
          const userProfile = await AsyncStorage.getItem(`ocd_profile_${user.uid}`);
          
          if (!profileCompleted || profileCompleted !== 'true' || !userProfile) {
            // Profile not completed, redirect to onboarding
            if (!segments.includes('onboarding')) {
              console.log('👤 Redirecting to onboarding - profile incomplete');
              router.replace('/(auth)/onboarding');
            }
          } else {
            // Profile completed, redirect to main app
            if (inAuthGroup) {
              console.log('✅ Profile completed, redirecting to main app');
              router.replace('/(tabs)');
            }
          }
        }
      } catch (error) {
        console.error('Navigation check error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkNavigation();
  }, [user, authLoading, segments]);

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
