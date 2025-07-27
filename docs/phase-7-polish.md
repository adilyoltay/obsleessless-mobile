# Phase 7: Polish & Optimization (Day 19-21)

## Overview
This phase focuses on polishing the user experience, optimizing performance, and ensuring accessibility across the ObsessLess React Native application.

## Prerequisites
- All core features implemented (Phase 6)
- Basic testing completed
- Performance profiling tools set up (Flipper, React DevTools)
- Accessibility testing tools ready

## Tasks Overview

### Task 7.1: Performance Optimization
**Duration**: 1 day
**Focus**: Bundle size, render performance, memory usage

### Task 7.2: UI/UX Polish
**Duration**: 1 day
**Focus**: Animations, loading states, error handling

### Task 7.3: Accessibility
**Duration**: 1 day
**Focus**: Screen reader support, color contrast, keyboard navigation

## Task 7.1: Performance Optimization

### 1. Bundle Size Optimization

#### Analyze Bundle Size
```bash
# iOS
npx react-native-bundle-visualizer

# Android
cd android && ./gradlew app:bundleReleaseJsAndAssets
npx react-native-bundle-visualizer --platform android
```

#### Optimization Strategies
```typescript
// 1. Code Splitting with lazy loading
const CompulsionHistory = lazy(() => import('./screens/Compulsions/History'));
const ERPStatistics = lazy(() => import('./screens/ERP/Statistics'));

// 2. Remove unused imports
// Before
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
// After
import { View, Text, FlatList } from 'react-native';

// 3. Use ProGuard for Android
// android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 2. Render Performance Optimization

#### Implement React.memo
```typescript
// src/components/CompulsionCard.tsx
export const CompulsionCard = React.memo(({ compulsion }: Props) => {
  return (
    <View style={styles.card}>
      <Text>{compulsion.type}</Text>
      <Text>{compulsion.severity}/10</Text>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.compulsion.id === nextProps.compulsion.id &&
         prevProps.compulsion.severity === nextProps.compulsion.severity;
});
```

#### Optimize FlatList
```typescript
// src/screens/CompulsionHistoryScreen.tsx
const renderItem = useCallback(({ item }) => (
  <CompulsionCard compulsion={item} />
), []);

const keyExtractor = useCallback((item) => item.id.toString(), []);

const getItemLayout = useCallback((data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
}), []);

return (
  <FlatList
    data={compulsions}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
    getItemLayout={getItemLayout}
    windowSize={10}
    maxToRenderPerBatch={10}
    initialNumToRender={10}
    removeClippedSubviews={true}
  />
);
```

### 3. Image Optimization

#### Implement Image Caching
```typescript
// src/components/CachedImage.tsx
import FastImage from 'react-native-fast-image';

export const CachedImage: React.FC<Props> = ({ source, ...props }) => {
  return (
    <FastImage
      {...props}
      source={{
        uri: source.uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={FastImage.resizeMode.contain}
    />
  );
};
```

#### Optimize Image Assets
```bash
# Install image optimization tools
npm install -g sharp-cli

# Optimize images
sharp input.png --resize 1x:100,2x:200,3x:300 --output output
```

### 4. Memory Leak Prevention

#### Clean up useEffect
```typescript
// src/hooks/useTimer.ts
export const useTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return seconds;
};
```

## Task 7.2: UI/UX Polish

### 1. Loading States Implementation

#### Global Loading Indicator
```typescript
// src/components/LoadingOverlay.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';

export const LoadingOverlay: React.FC = () => {
  const { isFetching } = useQuery();

  if (!isFetching) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#86EFAC" />
        <Text style={styles.text}>Yükleniyor...</Text>
      </View>
    </View>
  );
};
```

#### Skeleton Loading
```typescript
// src/components/CompulsionCardSkeleton.tsx
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export const CompulsionCardSkeleton: React.FC = () => {
  return (
    <SkeletonPlaceholder>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.title} />
          <View style={styles.time} />
        </View>
        <View style={styles.content} />
      </View>
    </SkeletonPlaceholder>
  );
};
```

### 2. Error Boundaries

#### Global Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo } from 'react';
import { View, Text, Button } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bir şeyler yanlış gitti</Text>
          <Text style={styles.message}>
            Uygulama beklenmeyen bir hatayla karşılaştı.
          </Text>
          <Button title="Yeniden Dene" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}
```

### 3. Empty States

#### Empty State Component
```typescript
// src/components/EmptyState.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { Button } from './ui';

interface Props {
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  image?: any;
}

export const EmptyState: React.FC<Props> = ({ title, message, action, image }) => {
  return (
    <View style={styles.container}>
      {image && <Image source={image} style={styles.image} />}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          style={styles.button}
        />
      )}
    </View>
  );
};
```

### 4. Pull to Refresh

```typescript
// src/screens/CompulsionHistoryScreen.tsx
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await queryClient.invalidateQueries(['compulsions']);
  setRefreshing(false);
}, []);

return (
  <FlatList
    data={compulsions}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor="#86EFAC"
        colors={['#86EFAC']}
      />
    }
  />
);
```

### 5. Haptic Feedback

```typescript
// src/utils/haptics.ts
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const haptic = {
  light: () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
  medium: () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },
  success: () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },
  error: () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
};

// Usage
<Button
  onPress={() => {
    haptic.light();
    handleSubmit();
  }}
/>
```

### 6. Micro-animations

```typescript
// src/components/AnimatedCheckbox.tsx
import { Animated, Easing } from 'react-native';

export const AnimatedCheckbox: React.FC<Props> = ({ checked, onChange }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: checked ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [checked]);

  return (
    <TouchableOpacity onPress={onChange}>
      <View style={styles.checkbox}>
        <Animated.View
          style={[
            styles.checkmark,
            {
              transform: [{ scale: scaleValue }],
              opacity: scaleValue,
            },
          ]}
        >
          <Icon name="check" color="white" size={16} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};
```

## Task 7.3: Accessibility Implementation

### 1. Screen Reader Support

#### Accessibility Labels
```typescript
// src/components/CompulsionCard.tsx
export const CompulsionCard: React.FC<Props> = ({ compulsion }) => {
  const accessibilityLabel = `${compulsion.type} kompulsiyonu, 
    şiddet ${compulsion.severity} üzerinden 10, 
    direnç ${compulsion.resistanceLevel} üzerinden 10,
    ${formatDate(compulsion.timestamp)} tarihinde`;

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Detayları görmek için dokunun"
    >
      <View style={styles.card}>
        {/* Card content */}
      </View>
    </TouchableOpacity>
  );
};
```

#### Accessibility Actions
```typescript
// src/components/SwipeableCompulsionCard.tsx
const accessibilityActions = [
  { name: 'edit', label: 'Düzenle' },
  { name: 'delete', label: 'Sil' },
];

const onAccessibilityAction = (event: { actionName: string }) => {
  switch (event.actionName) {
    case 'edit':
      handleEdit();
      break;
    case 'delete':
      handleDelete();
      break;
  }
};

return (
  <View
    accessible={true}
    accessibilityActions={accessibilityActions}
    onAccessibilityAction={onAccessibilityAction}
  >
    {/* Component content */}
  </View>
);
```

### 2. Color Contrast

#### WCAG Compliant Colors
```typescript
// src/theme/colors.ts
export const accessibleColors = {
  // AA compliant contrast ratios
  primary: '#047857', // 4.5:1 with white
  primaryText: '#FFFFFF',
  
  secondary: '#1F2937', // 12.6:1 with white
  secondaryText: '#FFFFFF',
  
  background: '#FFFFFF',
  text: '#1F2937', // 12.6:1 with white
  
  error: '#DC2626', // 4.5:1 with white
  errorText: '#FFFFFF',
  
  disabled: '#9CA3AF', // 2.8:1 with white (for disabled state)
  disabledText: '#E5E7EB',
};
```

### 3. Font Scaling

```typescript
// src/utils/responsive.ts
import { PixelRatio, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const scale = screenWidth / 375; // iPhone SE width

export const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Usage
const styles = StyleSheet.create({
  title: {
    fontSize: normalize(24),
    allowFontScaling: true, // Respect system font size
  },
});
```

### 4. High Contrast Mode

```typescript
// src/hooks/useHighContrast.ts
import { useColorScheme } from 'react-native';
import { useAccessibilityInfo } from '@react-native-community/hooks';

export const useHighContrast = () => {
  const { reduceTransparency, boldTextEnabled } = useAccessibilityInfo();
  const colorScheme = useColorScheme();

  const getContrastColors = () => {
    if (reduceTransparency) {
      return {
        background: '#000000',
        text: '#FFFFFF',
        border: '#FFFFFF',
      };
    }
    return defaultColors;
  };

  return {
    colors: getContrastColors(),
    fontWeight: boldTextEnabled ? '700' : '400',
  };
};
```

### 5. Keyboard Navigation

```typescript
// src/components/Form.tsx
export const AccessibleForm: React.FC = () => {
  const refs = {
    email: useRef<TextInput>(null),
    password: useRef<TextInput>(null),
    submit: useRef<TouchableOpacity>(null),
  };

  return (
    <View>
      <TextInput
        ref={refs.email}
        placeholder="E-posta"
        returnKeyType="next"
        onSubmitEditing={() => refs.password.current?.focus()}
        blurOnSubmit={false}
      />
      
      <TextInput
        ref={refs.password}
        placeholder="Şifre"
        returnKeyType="done"
        onSubmitEditing={() => refs.submit.current?.props.onPress()}
        secureTextEntry
      />
      
      <TouchableOpacity
        ref={refs.submit}
        onPress={handleSubmit}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Giriş yap"
      >
        <Text>Giriş</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 6. VoiceOver/TalkBack Announcements

```typescript
// src/utils/announcements.ts
import { AccessibilityInfo } from 'react-native';

export const announce = (message: string, delay = 100) => {
  setTimeout(() => {
    AccessibilityInfo.announceForAccessibility(message);
  }, delay);
};

// Usage after action
const handleCompulsionSaved = () => {
  saveCompulsion(data);
  announce('Kompulsiyon kaydedildi');
};
```

## Performance Metrics

### Target Metrics
- App launch time: < 2 seconds
- Screen transition: < 300ms
- List scroll: 60 FPS
- Memory usage: < 200MB
- Bundle size: < 40MB (iOS), < 20MB (Android)

### Measurement Tools
```typescript
// src/utils/performance.ts
export const measurePerformance = {
  start: (tag: string) => {
    if (__DEV__) {
      console.time(tag);
      performance.mark(`${tag}-start`);
    }
  },
  
  end: (tag: string) => {
    if (__DEV__) {
      console.timeEnd(tag);
      performance.mark(`${tag}-end`);
      performance.measure(tag, `${tag}-start`, `${tag}-end`);
      
      const measure = performance.getEntriesByName(tag)[0];
      console.log(`${tag}: ${measure.duration}ms`);
    }
  },
};
```

## Testing Checklist

### Performance Testing
- [ ] Bundle size under target
- [ ] No memory leaks detected
- [ ] 60 FPS scroll performance
- [ ] Fast app launch time
- [ ] Efficient network usage

### UI/UX Testing
- [ ] All loading states implemented
- [ ] Error boundaries working
- [ ] Empty states displayed correctly
- [ ] Pull to refresh functional
- [ ] Haptic feedback appropriate
- [ ] Animations smooth

### Accessibility Testing
- [ ] Screen reader navigation works
- [ ] Color contrast passes WCAG AA
- [ ] Font scaling respected
- [ ] Keyboard navigation complete
- [ ] Accessibility labels comprehensive

## Common Issues & Solutions

### Issue 1: Janky animations
**Solution**: Use native driver, optimize component updates

### Issue 2: Large bundle size
**Solution**: Enable Hermes, remove unused dependencies

### Issue 3: Memory leaks in development
**Solution**: Disable React DevTools in production builds

## Next Steps
After completing Phase 7:
1. Run performance profiling
2. Test with accessibility tools
3. Get user feedback on polish
4. Proceed to Phase 8 (Testing & Quality)