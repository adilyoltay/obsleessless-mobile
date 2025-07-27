# Component Mapping Guide: Web to Expo

## Overview
This guide provides detailed mapping of ObsessLess web components to their Expo/React Native equivalents, including code examples and migration strategies for development on Replit.

## Base HTML to Expo/React Native Mappings

| Web (HTML/React) | Expo/React Native | Notes |
|------------------|-------------------|-------|
| `<div>` | `<View>` | Default container component |
| `<span>`, `<p>` | `<Text>` | All text must be in Text component |
| `<img>` | `<Image>` or `<Expo.Image>` | Expo Image has better performance |
| `<button>` | `<Pressable>` or Paper `<Button>` | Use React Native Paper components |
| `<input>` | `<TextInput>` or Paper `<TextInput>` | Paper version has Material Design |
| `<select>` | Paper `<Menu>` or `<SegmentedButtons>` | Better UX on mobile |
| `<a>` | `<Link>` from Expo Router | File-based routing |
| `<form>` | `<View>` | No form element needed |
| `<ul>`, `<li>` | `<FlatList>` or `<ScrollView>` | Use FlatList for performance |

## Styling Migration

### Web (Tailwind CSS)
```css
className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg shadow-md"
```

### React Native (StyleSheet)
```typescript
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 4,
  }
});
```

## Component-by-Component Migration

### 1. Button Component

#### Web Version (Shadcn/ui)
```typescript
import { Button } from "@/components/ui/button"

<Button 
  variant="default"
  size="lg"
  className="bg-green-600 hover:bg-green-700"
  onClick={handleClick}
>
  Click Me
</Button>
```

#### React Native Version
```typescript
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        (disabled || loading) && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#4CAF50',
  },
  secondary: {
    backgroundColor: '#757575',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  // ... size and text styles
});
```

### 2. Card Component

#### Web Version
```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card className="border-gray-200 shadow-sm">
  <CardHeader>
    <CardTitle>Dashboard Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content here</p>
  </CardContent>
</Card>
```

#### React Native Version
```typescript
import { View, Text, StyleSheet } from 'react-native';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: any;
}

export const Card: React.FC<CardProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    // Content styles
  },
});
```

### 3. Input Component

#### Web Version
```typescript
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

#### React Native Version
```typescript
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#F44336',
  },
  error: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
});
```

### 4. Modal Component

#### Web Version
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    <div>Modal content</div>
  </DialogContent>
</Dialog>
```

#### React Native Version
```typescript
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const CustomModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.body}>
            {children}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  // ... other styles
});
```

### 5. Toast/Alert Component

#### Web Version
```typescript
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()
toast({
  title: "Success",
  description: "Operation completed successfully",
})
```

#### React Native Version
```typescript
import Toast from 'react-native-toast-message';

// Setup in App.tsx
<>
  <App />
  <Toast />
</>

// Usage in components
Toast.show({
  type: 'success',
  text1: 'Success',
  text2: 'Operation completed successfully',
  position: 'top',
  visibilityTime: 3000,
});
```

## ObsessLess Specific Components

### 1. StreakCounter

#### Key Changes
- Replace CSS animations with React Native Animated API
- Use `react-native-svg` for circular progress
- Implement native animations for smooth performance

```typescript
import { Animated, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// Animated circular progress implementation
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
```

### 2. CompulsionTracker List

#### Web Version (with Tailwind)
```typescript
<div className="space-y-2">
  {compulsions.map(item => (
    <div key={item.id} className="p-4 border rounded-lg">
      {/* Item content */}
    </div>
  ))}
</div>
```

#### React Native Version
```typescript
import { FlatList, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

<FlatList
  data={compulsions}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <Swipeable
      renderRightActions={() => <DeleteAction />}
    >
      <View style={styles.listItem}>
        {/* Item content */}
      </View>
    </Swipeable>
  )}
  ItemSeparatorComponent={() => <View style={styles.separator} />}
/>
```

### 3. Progress Charts

#### Migration Strategy
- Replace Recharts with `react-native-chart-kit` or `react-native-svg-charts`
- Adapt data format for mobile chart libraries
- Implement touch interactions for data points

```typescript
import { LineChart } from 'react-native-chart-kit';

<LineChart
  data={{
    labels: weekDays,
    datasets: [{
      data: progressData
    }]
  }}
  width={screenWidth - 32}
  height={220}
  chartConfig={{
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  }}
  bezier
  style={styles.chart}
/>
```

## Navigation Components

### Web Router (Wouter)
```typescript
import { Route, Switch } from "wouter";

<Switch>
  <Route path="/" component={Dashboard} />
  <Route path="/compulsions" component={CompulsionTracking} />
</Switch>
```

### React Navigation
```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

<NavigationContainer>
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen name="Tracking" component={CompulsionTracking} />
  </Tab.Navigator>
</NavigationContainer>
```

## Form Handling

### Web (React Hook Form)
```typescript
const { register, handleSubmit, formState: { errors } } = useForm();

<input {...register("email", { required: true })} />
```

### React Native (React Hook Form)
```typescript
const { control, handleSubmit, formState: { errors } } = useForm();

<Controller
  control={control}
  name="email"
  rules={{ required: true }}
  render={({ field: { onChange, onBlur, value } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
    />
  )}
/>
```

## Animation Mappings

### Web (CSS/Framer Motion)
```css
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### React Native (Animated API)
```typescript
import { Animated } from 'react-native';

const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
}, []);

<Animated.View style={{ opacity: fadeAnim }}>
  {/* Content */}
</Animated.View>
```

## State Management

### TanStack Query (Same for both)
```typescript
// Web and React Native are almost identical
const { data, isLoading, error } = useQuery({
  queryKey: ['compulsions'],
  queryFn: fetchCompulsions,
});

// Only difference: React Native might need different cache persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});
```

## Platform-Specific Considerations

### iOS vs Android Styling
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

### Safe Area Handling
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// Wrap your screens
<SafeAreaView style={styles.container}>
  {/* Screen content */}
</SafeAreaView>
```

## Performance Optimization Tips

1. **Lists**: Always use `FlatList` for long lists instead of `map`
2. **Images**: Use `FastImage` for better caching and performance
3. **Animations**: Use `useNativeDriver: true` when possible
4. **Memoization**: Use `React.memo` and `useMemo` for expensive computations
5. **Lazy Loading**: Implement lazy loading for screens and heavy components

## Common Pitfalls to Avoid

1. **Text outside Text component**: All text must be wrapped in `<Text>`
2. **Percentage heights**: Use `flex` instead of percentage heights
3. **Click handlers**: Use `onPress` instead of `onClick`
4. **Hover states**: No hover on mobile, use press states instead
5. **Fixed positioning**: Use absolute positioning with proper constraints

---

Last Updated: January 2025