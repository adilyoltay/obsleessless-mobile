# Phase 3: UI Component Migration

## Overview
This phase covers the systematic migration of UI components from React web to React Native, including styling conversions, component architecture, and native UI features.

## Component Migration Strategy

### 1. Component Analysis
Before migrating, analyze each component for:
- CSS/Tailwind styles that need conversion
- DOM-specific elements (div, span, etc.)
- Event handlers (onClick → onPress)
- Responsive design requirements
- Animation requirements
- Platform-specific behavior needs

### 2. Native UI Libraries
- **react-native-vector-icons**: Comprehensive icon library
- **react-native-linear-gradient**: Native gradient support
- **react-native-blur**: iOS-style blur effects
- **react-native-haptic-feedback**: Tactile feedback
- **Custom font loading**: Platform-specific font setup

## Step-by-Step Component Migration

### Step 1: Basic Component Structure

#### Web Component (React):
```tsx
// Button.tsx (Web)
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', onClick, className, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-green-500 text-white hover:bg-green-600',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        className
      )}
    >
      {children}
    </button>
  );
}
```

#### React Native Component:
```tsx
// Button.tsx (React Native)
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', onPress, style, children }: ButtonProps) {
  const handlePress = () => {
    // Native haptic feedback
    ReactNativeHapticFeedback.trigger('impactLight');
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        style
      ]}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.buttonText,
        variant === 'primary' ? styles.primaryText : styles.secondaryText
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#10B981', // green-500
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB', // gray-200
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#1F2937', // gray-800
  },
});
```

### Step 2: Form Components

#### Text Input Migration:
```tsx
// TextInput.tsx (React Native)
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput as RNTextInput, 
  StyleSheet,
  TouchableOpacity 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
}

export function TextInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <RNTextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Icon 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={20} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
});
```

### Step 3: Card Component with Shadow

```tsx
// Card.tsx (React Native)
import React from 'react';
import { View, ViewStyle, Platform, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
}

export function Card({ children, style, gradient }: CardProps) {
  const content = (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={['#F0FDF4', '#DCFCE7']} // green gradient
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

### Step 4: Modal Component with Blur

```tsx
// Modal.tsx (React Native)
import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={10} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidOverlay]} />
        )}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalContent}>
            {children}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
```

### Step 5: Animation with Expo

```tsx
// AnimatedCard.tsx with expo-reanimated
import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export function AnimatedCard({ children, onPress }: AnimatedCardProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

## Expo-Specific UI Features

### 1. Custom Font Loading
```tsx
// App.tsx
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <RootNavigator onLayout={onLayoutRootView} />;
}
```

### 2. Status Bar with Expo
```tsx
// Screen wrapper component
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar style="dark" backgroundColor="#E8F5E9" />
      {children}
    </SafeAreaView>
  );
}
```

### 3. Image Optimization with Expo
```tsx
// OptimizedImage.tsx
import { Image } from 'expo-image';

export function OptimizedImage({ source, style }: any) {
  return (
    <Image
      source={source}
      placeholder={require('./assets/placeholder.png')}
      contentFit="cover"
      transition={200}
      style={style}
    />
  );
}
```

## Style Conversion Guide

### Tailwind to React Native Style Mapping
```
// Spacing
p-4 → padding: 16
px-4 → paddingHorizontal: 16
py-2 → paddingVertical: 8
m-4 → margin: 16

// Flexbox
flex → flex: 1
flex-row → flexDirection: 'row'
justify-center → justifyContent: 'center'
items-center → alignItems: 'center'

// Colors
bg-green-500 → backgroundColor: '#10B981'
text-white → color: '#FFFFFF'
border-gray-300 → borderColor: '#D1D5DB'

// Border Radius
rounded-lg → borderRadius: 8
rounded-full → borderRadius: 9999

// Typography
text-lg → fontSize: 18
font-medium → fontFamily: 'Poppins-Medium'
font-bold → fontFamily: 'Poppins-Bold'
```

## Component Library Integration

### React Native Elements with Expo
```tsx
// Configure React Native Elements theme
import { ThemeProvider, createTheme } from 'react-native-elements';

const theme = createTheme({
  colors: {
    primary: '#10B981',
    secondary: '#4ADE80',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  Button: {
    titleStyle: {
      fontFamily: 'Poppins-Medium',
    },
    buttonStyle: {
      borderRadius: 8,
      paddingVertical: 12,
    },
  },
  Input: {
    inputStyle: {
      fontFamily: 'Poppins-Regular',
    },
    labelStyle: {
      fontFamily: 'Poppins-Medium',
      color: '#374151',
    },
  },
});

// Wrap your app
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

## Testing Components with Expo

### Expo Go Testing
1. Run `npx expo start`
2. Scan QR code with Expo Go app
3. Test on multiple devices simultaneously
4. Use shake gesture for developer menu

### Component Testing Tips
- Test on both iOS and Android
- Check different screen sizes
- Verify touch areas are large enough (44pt minimum)
- Test with different font scales (accessibility)
- Verify keyboard behavior

## Performance Optimization

### 1. Memo and Optimization
```tsx
import React, { memo } from 'react';

export const OptimizedComponent = memo(({ data }: Props) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});
```

### 2. FlatList for Long Lists
```tsx
import { FlatList } from 'react-native';

<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

## Common Pitfalls and Solutions

### 1. Text must be in Text component
```tsx
// ❌ Wrong
<View>Hello World</View>

// ✅ Correct
<View><Text>Hello World</Text></View>
```

### 2. No CSS cascade
```tsx
// ❌ Wrong - styles don't cascade
<View style={styles.parent}>
  <Text>This won't inherit parent styles</Text>
</View>

// ✅ Correct - explicit styling
<View style={styles.parent}>
  <Text style={styles.text}>Styled text</Text>
</View>
```

### 3. Platform-specific code
```tsx
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
      android: {
        paddingTop: 25,
      },
    }),
  },
});
```

## Next Steps
After completing UI component migration:
1. Set up navigation system (Phase 2)
2. Integrate state management (Phase 4)
3. Connect to backend API (Phase 5)
4. Add native features with Expo SDK (Phase 6)