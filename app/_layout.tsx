import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { queryClient } from '@/lib/queryClient';
import ErrorBoundary from '@/components/ErrorBoundary';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Master Prompt Theme - ObsessLess Colors
const ObsessLessTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#10B981', // Master Prompt Ana Eylem (Primary): Sakin Yeşil
    primaryContainer: '#D1FAE5', // Lighter shade of primary
    secondary: '#6B7280', // Master Prompt Yardımcı Metin
    secondaryContainer: '#F3F4F6', // Master Prompt Çok Açık Gri
    tertiary: '#F97316', // Master Prompt Vurgu (Accent/HOT): Enerjik Turuncu
    surface: '#FFFFFF', // Master Prompt Saf Beyaz
    surfaceVariant: '#F3F4F6', // Master Prompt Yüzeyler
    onSurface: '#111827', // Master Prompt Ana Metin
    onSurfaceVariant: '#6B7280', // Master Prompt Yardımcı Metin
  },
};

// Global error handlers - disabled for React Native
// Platform-specific error handling can be added here if needed

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <PaperProvider theme={ObsessLessTheme}>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                <NavigationGuard>
                  <RootLayoutNav />
                </NavigationGuard>
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
          <Toast />
        </QueryClientProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}