# Phase 2: Navigation Implementation with Expo Router

## Overview
This phase covers the complete navigation setup for ObsessLess using Expo Router, which provides file-based routing similar to Next.js.

## Navigation Architecture

```
┌─────────────────────────────────────┐
│         Expo Router                 │
├─────────────────────────────────────┤
│                                     │
│  app/                               │
│  ├── (auth)/      # Auth group     │
│  │   ├── login.tsx                 │
│  │   ├── signup.tsx                │
│  │   └── profile-setup.tsx         │
│  ├── (tabs)/      # Tab layout     │
│  │   ├── _layout.tsx               │
│  │   ├── index.tsx  # Today        │
│  │   ├── tracking.tsx              │
│  │   ├── erp.tsx                   │
│  │   └── settings.tsx              │
│  └── _layout.tsx  # Root           │
└─────────────────────────────────────┘
```

## Step 1: Expo Router Setup

```bash
# Expo Router is included in the Replit template
# No additional installation needed

# The template includes:
- expo-router
- expo-linking
- expo-constants
- react-native-safe-area-context
- react-native-screens
```

## Step 2: Setup Navigation Types

Create `src/types/navigation.ts`:
```typescript
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ProfileSetup: { userId: string };
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Today: undefined;
  Tracking: NavigatorScreenParams<TrackingStackParamList>;
  ERP: NavigatorScreenParams<ERPStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// Sub-stack navigators
export type TrackingStackParamList = {
  CompulsionList: undefined;
  CompulsionDetail: { id: string };
  AddCompulsion: undefined;
};

export type ERPStackParamList = {
  ERPList: undefined;
  ERPDetail: { id: string };
  ERPTimer: { exerciseId: string };
  CreateERP: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  Profile: undefined;
  Notifications: undefined;
  Language: undefined;
  About: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  YBOCSAssessment: undefined;
  Achievements: undefined;
};

// Screen Props Types
export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  StackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    StackScreenProps<RootStackParamList>
  >;

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;

// Navigation Prop Types for hooks
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

## Step 3: Create Navigation Structure

### Root Navigator
Create `src/navigation/RootNavigator.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import YBOCSAssessmentScreen from '@/screens/YBOCSAssessment';
import AchievementsScreen from '@/screens/Achievements';
import LoadingScreen from '@/screens/LoadingScreen';
import { RootStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initializing, setInitializing] = useState(true);
  const { user, setUser } = useAuthStore();

  // Handle auth state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  if (initializing) return <LoadingScreen />;

  return (
    <NavigationContainer
      linking={{
        prefixes: ['obsessless://'],
        config: {
          screens: {
            Main: {
              screens: {
                Today: 'dashboard',
                Tracking: 'tracking',
                ERP: 'erp',
                Settings: 'settings',
              },
            },
            YBOCSAssessment: 'assessment',
            Achievements: 'achievements',
          },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen 
              name="YBOCSAssessment" 
              component={YBOCSAssessmentScreen}
              options={{ 
                headerShown: true,
                headerTitle: 'Y-BOCS Assessment',
                presentation: 'modal'
              }}
            />
            <Stack.Screen 
              name="Achievements" 
              component={AchievementsScreen}
              options={{ 
                headerShown: true,
                headerTitle: 'Achievements',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Auth Navigator
Create `src/navigation/AuthNavigator.tsx`:
```typescript
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignupScreen from '@/screens/auth/SignupScreen';
import ProfileSetupScreen from '@/screens/auth/ProfileSetupScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import { AuthStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen 
        name="ProfileSetup" 
        component={ProfileSetupScreen}
        options={{ gestureEnabled: false }} // Prevent going back
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
```

### Main Tab Navigator
Create `src/navigation/MainNavigator.tsx`:
```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TodayScreen from '@/screens/dashboard/TodayScreen';
import TrackingNavigator from './TrackingNavigator';
import ERPNavigator from './ERPNavigator';
import SettingsNavigator from './SettingsNavigator';
import { MainTabParamList } from '@/types/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Today':
              iconName = 'today';
              break;
            case 'Tracking':
              iconName = 'track-changes';
              break;
            case 'ERP':
              iconName = 'psychology';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Poppins-Medium',
        },
        headerStyle: {
          backgroundColor: '#4CAF50',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontFamily: 'Poppins-SemiBold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Today" 
        component={TodayScreen}
        options={{ 
          tabBarLabel: t('nav.today'),
          headerTitle: t('nav.today_title'),
        }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={TrackingNavigator}
        options={{ 
          tabBarLabel: t('nav.tracking'),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="ERP" 
        component={ERPNavigator}
        options={{ 
          tabBarLabel: t('nav.erp'),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsNavigator}
        options={{ 
          tabBarLabel: t('nav.settings'),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
```

### Sub-Stack Navigators
Create `src/navigation/TrackingNavigator.tsx`:
```typescript
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CompulsionListScreen from '@/screens/tracking/CompulsionListScreen';
import CompulsionDetailScreen from '@/screens/tracking/CompulsionDetailScreen';
import AddCompulsionScreen from '@/screens/tracking/AddCompulsionScreen';
import { TrackingStackParamList } from '@/types/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const Stack = createStackNavigator<TrackingStackParamList>();

export default function TrackingNavigator() {
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontFamily: 'Poppins-SemiBold',
        },
      }}
    >
      <Stack.Screen 
        name="CompulsionList" 
        component={CompulsionListScreen}
        options={{ 
          headerTitle: t('tracking.title'),
        }}
      />
      <Stack.Screen 
        name="CompulsionDetail" 
        component={CompulsionDetailScreen}
        options={{ 
          headerTitle: t('tracking.detail'),
        }}
      />
      <Stack.Screen 
        name="AddCompulsion" 
        component={AddCompulsionScreen}
        options={{ 
          headerTitle: t('tracking.add'),
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
```

## Step 4: Navigation Hooks

Create `src/hooks/useNavigation.ts`:
```typescript
import { useNavigation as useRNNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

export function useNavigation<T extends keyof RootStackParamList>() {
  return useRNNavigation<StackNavigationProp<RootStackParamList, T>>();
}

export { useRoute };
```

## Step 5: Navigation Guards

Create `src/components/navigation/ProfileGuard.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface ProfileGuardProps {
  children: React.ReactNode;
}

export default function ProfileGuard({ children }: ProfileGuardProps) {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [checking, setChecking] = useState(true);

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile === undefined) return;

    if (!profile?.profileCompleted) {
      navigation.navigate('Auth', {
        screen: 'ProfileSetup',
        params: { userId: user!.uid },
      });
    } else {
      setChecking(false);
    }
  }, [profile, navigation, user]);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return <>{children}</>;
}
```

## Step 6: Deep Linking Configuration

### iOS Configuration
Update `ios/ObsessLessMobile/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>obsessless</string>
    </array>
  </dict>
</array>
```

### Android Configuration
Update `android/app/src/main/AndroidManifest.xml`:
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="obsessless" />
</intent-filter>
```

## Step 7: Navigation Utilities

Create `src/utils/navigation.ts`:
```typescript
import { NavigationContainerRef } from '@react-navigation/native';
import { createRef } from 'react';
import { RootStackParamList } from '@/types/navigation';

export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.navigate(name as never, params as never);
  }
}

export function goBack() {
  if (navigationRef.current?.isReady() && navigationRef.current.canGoBack()) {
    navigationRef.current.goBack();
  }
}

export function resetRoot(name: keyof RootStackParamList) {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name: name as never }],
    });
  }
}
```

## Step 8: Screen Transitions

Create `src/utils/transitions.ts`:
```typescript
import { StackNavigationOptions } from '@react-navigation/stack';

export const modalTransition: StackNavigationOptions = {
  presentation: 'modal',
  cardStyleInterpolator: ({ current: { progress } }) => ({
    cardStyle: {
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [600, 0],
          }),
        },
      ],
    },
  }),
};

export const fadeTransition: StackNavigationOptions = {
  cardStyleInterpolator: ({ current: { progress } }) => ({
    cardStyle: {
      opacity: progress,
    },
  }),
};

export const slideFromRightTransition: StackNavigationOptions = {
  cardStyleInterpolator: ({ current, layouts }) => ({
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        },
      ],
    },
  }),
};
```

## AI Assistant Prompts for Phase 2

### Navigation Setup Prompt
```
Set up React Navigation for ObsessLess React Native app with:
1. Root navigator with auth check
2. Auth stack (Login, Signup, ProfileSetup)
3. Main tab navigator with 4 tabs (Today, Tracking, ERP, Settings)
4. Each tab having its own stack navigator
5. TypeScript types for all navigation
6. Custom navigation hooks
7. Profile completion guard that redirects to setup if needed
8. Deep linking support
```

### Screen Implementation Prompt
```
Create the Login screen for ObsessLess with:
1. Email and password inputs with validation
2. Remember me checkbox using secure storage
3. Login button with loading state
4. Signup and forgot password links
5. Firebase authentication integration
6. Error handling with user-friendly messages
7. Keyboard avoiding view
8. Proper TypeScript types for navigation
```

## Common Navigation Patterns

### Conditional Navigation
```typescript
const handleCompulsionSave = async () => {
  try {
    await saveCompulsion(data);
    navigation.goBack();
    // or navigate to specific screen
    navigation.navigate('Main', {
      screen: 'Tracking',
      params: {
        screen: 'CompulsionList',
      },
    });
  } catch (error) {
    // Handle error
  }
};
```

### Modal Presentation
```typescript
// Open modal
navigation.navigate('AddCompulsion');

// Close modal
navigation.goBack();
```

### Tab Navigation with Params
```typescript
// Navigate to specific tab with params
navigation.navigate('Main', {
  screen: 'ERP',
  params: {
    screen: 'ERPDetail',
    params: {
      id: exerciseId,
    },
  },
});
```

## Testing Navigation

Create `__tests__/navigation/Navigation.test.tsx`:
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent } from '@testing-library/react-native';
import RootNavigator from '@/navigation/RootNavigator';

describe('Navigation', () => {
  it('shows auth screen when not logged in', () => {
    const { getByText } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    );
    
    expect(getByText('Login')).toBeTruthy();
  });

  // Add more navigation tests
});
```

## Troubleshooting

### Issue: Navigation not working
```typescript
// Ensure navigation container is ready
const onReady = () => {
  console.log('Navigation is ready');
};

<NavigationContainer onReady={onReady}>
  {/* ... */}
</NavigationContainer>
```

### Issue: TypeScript errors
```typescript
// Use proper typing for navigation prop
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'ScreenName'>;

function MyScreen({ navigation, route }: Props) {
  // ...
}
```

## Verification Checklist

- [ ] All navigation dependencies installed
- [ ] Navigation types properly defined
- [ ] Auth flow working correctly
- [ ] Tab navigation functioning
- [ ] Deep linking configured
- [ ] Navigation guards implemented
- [ ] Screen transitions smooth
- [ ] Back button handling proper
- [ ] TypeScript types correct

## Next Steps

Once Phase 2 is complete, proceed to:
- [Phase 3: UI Component Migration](./phase-3-ui-components.md)

---

Last Updated: January 2025