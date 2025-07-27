# Phase 8: Testing & Quality Assurance (Day 22-24)

## Overview
This phase establishes comprehensive testing strategies for the ObsessLess React Native application, including unit tests, integration tests, and platform-specific testing.

## Prerequisites
- All features implemented and polished
- Testing frameworks installed (Jest, React Native Testing Library)
- Device testing infrastructure ready
- CI/CD pipeline basics in place

## Tasks Overview

### Task 8.1: Unit Testing
**Duration**: 1 day
**Focus**: Component logic, hooks, utilities, services

### Task 8.2: Integration Testing
**Duration**: 1 day
**Focus**: User flows, API integration, navigation

### Task 8.3: Platform Testing
**Duration**: 1 day
**Focus**: iOS/Android specific features, device compatibility

## Task 8.1: Unit Testing Setup

### 1. Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-firebase|@react-native-community)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

```javascript
// jest.setup.js
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: () => ({
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  }),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
```

### 2. Component Testing

#### Button Component Test
```typescript
// src/components/ui/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Press Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <Button title="Loading" onPress={() => {}} loading={true} />
    );
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('is disabled when loading', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Loading" onPress={onPressMock} loading={true} />
    );
    
    fireEvent.press(getByText('Loading'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
```

#### Form Component Test
```typescript
// src/components/forms/__tests__/CompulsionForm.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CompulsionForm } from '../CompulsionForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('CompulsionForm', () => {
  it('validates required fields', async () => {
    const { getByText, getByPlaceholderText } = render(
      <CompulsionForm />, 
      { wrapper }
    );

    fireEvent.press(getByText('Kaydet'));

    await waitFor(() => {
      expect(getByText('Kompulsiyon tipi gerekli')).toBeTruthy();
    });
  });

  it('submits form with valid data', async () => {
    const mockSubmit = jest.fn();
    jest.mock('../../hooks/useCompulsions', () => ({
      useCreateCompulsion: () => ({
        mutate: mockSubmit,
        isPending: false,
      }),
    }));

    const { getByText, getByTestId } = render(
      <CompulsionForm />, 
      { wrapper }
    );

    // Fill form
    fireEvent.changeText(getByTestId('type-select'), 'washing');
    fireEvent(getByTestId('severity-slider'), 'onValueChange', 7);
    fireEvent(getByTestId('resistance-slider'), 'onValueChange', 5);

    fireEvent.press(getByText('Kaydet'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'washing',
          severity: 7,
          resistanceLevel: 5,
        })
      );
    });
  });
});
```

### 3. Hook Testing

#### useCompulsions Hook Test
```typescript
// src/hooks/__tests__/useCompulsions.test.tsx
import { renderHook, waitFor } from '@testing-library/react-native';
import { useCompulsions } from '../useCompulsions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as api from '../../services/compulsions.service';

jest.mock('../../services/compulsions.service');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCompulsions', () => {
  it('fetches compulsions successfully', async () => {
    const mockData = [
      { id: 1, type: 'washing', severity: 7 },
      { id: 2, type: 'checking', severity: 5 },
    ];

    (api.compulsionsService.getAll as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCompulsions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockData);
    });
  });

  it('handles errors', async () => {
    const error = new Error('Network error');
    (api.compulsionsService.getAll as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useCompulsions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });
  });
});
```

### 4. Utility Function Testing

```typescript
// src/utils/__tests__/validation.test.ts
import { validateEmail, validatePassword, formatDate } from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      expect(validatePassword('StrongP@ss123')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date)).toBe('15 Ocak 2024, 10:30');
    });

    it('handles invalid dates', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });
});
```

### 5. Service Testing

```typescript
// src/services/__tests__/auth.service.test.ts
import { authService } from '../auth.service';
import api from '../api';

jest.mock('../api');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in successfully', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        user: { id: 1, email: 'test@example.com' },
      },
    };

    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('handles login errors', async () => {
    const error = new Error('Invalid credentials');
    (api.post as jest.Mock).mockRejectedValue(error);

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrong',
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
```

## Task 8.2: Integration Testing

### 1. Navigation Flow Testing

```typescript
// src/navigation/__tests__/AppNavigation.test.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AppNavigator } from '../AppNavigator';
import { AuthContext } from '../../contexts/AuthContext';

const mockAuthContext = {
  user: { id: 1, email: 'test@example.com' },
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
};

describe('App Navigation', () => {
  it('navigates between tabs', async () => {
    const { getByText, getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthContext.Provider>
    );

    // Start at Dashboard
    expect(getByTestId('dashboard-screen')).toBeTruthy();

    // Navigate to Compulsions
    fireEvent.press(getByText('Takip'));
    await waitFor(() => {
      expect(getByTestId('compulsions-screen')).toBeTruthy();
    });

    // Navigate to ERP
    fireEvent.press(getByText('ERP'));
    await waitFor(() => {
      expect(getByTestId('erp-screen')).toBeTruthy();
    });
  });
});
```

### 2. Authentication Flow Testing

```typescript
// src/screens/auth/__tests__/AuthFlow.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { SignupScreen } from '../SignupScreen';
import * as authService from '../../../services/auth.service';

jest.mock('../../../services/auth.service');

describe('Authentication Flow', () => {
  it('completes login flow', async () => {
    const mockNavigate = jest.fn();
    const mockLogin = jest.fn().mockResolvedValue({
      token: 'test-token',
      user: { id: 1, email: 'test@example.com' },
    });

    (authService.authService.login as jest.Mock) = mockLogin;

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={{ navigate: mockNavigate }} />
    );

    // Fill form
    fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Şifre'), 'password123');

    // Submit
    fireEvent.press(getByText('Giriş Yap'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
    });
  });
});
```

### 3. Data Flow Testing

```typescript
// src/__tests__/CompulsionDataFlow.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CompulsionTrackingScreen } from '../screens/CompulsionTrackingScreen';
import { CompulsionHistoryScreen } from '../screens/CompulsionHistoryScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as api from '../services/compulsions.service';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('Compulsion Data Flow', () => {
  it('creates and displays new compulsion', async () => {
    const queryClient = createTestQueryClient();
    
    // Mock API
    const mockCompulsions = [];
    (api.compulsionsService.getAll as jest.Mock).mockResolvedValue(mockCompulsions);
    (api.compulsionsService.create as jest.Mock).mockImplementation(async (data) => {
      const newCompulsion = { id: 1, ...data };
      mockCompulsions.push(newCompulsion);
      return newCompulsion;
    });

    // Render tracking screen
    const { getByTestId, getByText } = render(
      <QueryClientProvider client={queryClient}>
        <CompulsionTrackingScreen />
      </QueryClientProvider>
    );

    // Fill and submit form
    fireEvent.changeText(getByTestId('type-select'), 'washing');
    fireEvent(getByTestId('severity-slider'), 'onValueChange', 8);
    fireEvent.press(getByText('Kaydet'));

    await waitFor(() => {
      expect(api.compulsionsService.create).toHaveBeenCalled();
    });

    // Switch to history screen
    const { getByText: getByTextHistory } = render(
      <QueryClientProvider client={queryClient}>
        <CompulsionHistoryScreen />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(getByTextHistory('washing')).toBeTruthy();
      expect(getByTextHistory('8/10')).toBeTruthy();
    });
  });
});
```

## Task 8.3: Platform Testing

### 1. iOS Specific Testing

```typescript
// src/__tests__/iOS.test.tsx
import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';
import { IOSSpecificComponent } from '../components/IOSSpecific';

describe('iOS Specific Features', () => {
  beforeEach(() => {
    Platform.OS = 'ios';
  });

  it('renders iOS specific UI', () => {
    const { getByTestId } = render(<IOSSpecificComponent />);
    expect(getByTestId('ios-safe-area')).toBeTruthy();
    expect(getByTestId('ios-blur-view')).toBeTruthy();
  });

  it('uses iOS haptic feedback', async () => {
    const mockHaptics = jest.fn();
    jest.mock('expo-haptics', () => ({
      impactAsync: mockHaptics,
    }));

    const { getByText } = render(<IOSSpecificComponent />);
    fireEvent.press(getByText('Tap Me'));

    expect(mockHaptics).toHaveBeenCalledWith('light');
  });
});
```

### 2. Android Specific Testing

```typescript
// src/__tests__/Android.test.tsx
import { Platform, BackHandler } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { AndroidSpecificComponent } from '../components/AndroidSpecific';

describe('Android Specific Features', () => {
  beforeEach(() => {
    Platform.OS = 'android';
  });

  it('handles back button', () => {
    const mockGoBack = jest.fn();
    const { unmount } = render(
      <AndroidSpecificComponent navigation={{ goBack: mockGoBack }} />
    );

    // Simulate back button press
    const backHandler = BackHandler.addEventListener.mock.calls[0][1];
    expect(backHandler()).toBe(true);
    expect(mockGoBack).toHaveBeenCalled();

    unmount();
    expect(BackHandler.removeEventListener).toHaveBeenCalled();
  });

  it('uses Android specific styling', () => {
    const { getByTestId } = render(<AndroidSpecificComponent />);
    const view = getByTestId('android-elevation');
    expect(view.props.style).toMatchObject({ elevation: 4 });
  });
});
```

### 3. Device Testing Matrix

```typescript
// src/__tests__/DeviceCompatibility.test.tsx
import { Dimensions } from 'react-native';
import { render } from '@testing-library/react-native';
import { ResponsiveComponent } from '../components/Responsive';

const devices = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14 Pro', width: 393, height: 852 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Pixel 5', width: 393, height: 851 },
  { name: 'Samsung S21', width: 360, height: 800 },
];

describe('Device Compatibility', () => {
  devices.forEach((device) => {
    it(`renders correctly on ${device.name}`, () => {
      // Mock device dimensions
      Dimensions.get = jest.fn().mockReturnValue({
        width: device.width,
        height: device.height,
      });

      const { getByTestId } = render(<ResponsiveComponent />);
      const container = getByTestId('responsive-container');

      // Check responsive behavior
      if (device.width < 400) {
        expect(container.props.style).toMatchObject({ flexDirection: 'column' });
      } else {
        expect(container.props.style).toMatchObject({ flexDirection: 'row' });
      }
    });
  });
});
```

### 4. Performance Testing

```typescript
// src/__tests__/Performance.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { LargeListComponent } from '../components/LargeList';

describe('Performance Tests', () => {
  it('renders large lists efficiently', async () => {
    const startTime = performance.now();
    
    const { getByTestId } = render(
      <LargeListComponent data={Array(1000).fill(null).map((_, i) => ({ id: i }))} />
    );

    await waitFor(() => {
      expect(getByTestId('list-container')).toBeTruthy();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);

    // Check virtualization
    const renderedItems = getByTestId('list-container').findAllByType('View');
    expect(renderedItems.length).toBeLessThan(50); // Only visible items rendered
  });

  it('handles rapid user interactions', async () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Tap Me" onPress={onPress} />);

    // Simulate rapid taps
    for (let i = 0; i < 10; i++) {
      fireEvent.press(getByText('Tap Me'));
    }

    // Should debounce to prevent multiple calls
    await waitFor(() => {
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Testing Best Practices

### 1. Test Organization
```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx
│   └── forms/
│       ├── CompulsionForm.tsx
│       └── __tests__/
│           └── CompulsionForm.test.tsx
├── hooks/
│   ├── useCompulsions.ts
│   └── __tests__/
│       └── useCompulsions.test.ts
└── utils/
    ├── validation.ts
    └── __tests__/
        └── validation.test.ts
```

### 2. Test Data Factories
```typescript
// src/test/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  language: 'tr',
  ...overrides,
});

export const createMockCompulsion = (overrides = {}) => ({
  id: 1,
  type: 'washing',
  severity: 5,
  resistanceLevel: 5,
  duration: 10,
  timestamp: new Date(),
  ...overrides,
});
```

### 3. Custom Test Utilities
```typescript
// src/test/test-utils.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';

export const renderWithProviders = (
  component: React.ReactElement,
  {
    authValue = mockAuthContext,
    languageValue = mockLanguageContext,
    ...renderOptions
  } = {}
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <LanguageContext.Provider value={languageValue}>
          {children}
        </LanguageContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );

  return render(component, { wrapper: Wrapper, ...renderOptions });
};
```

## CI/CD Integration

### GitHub Actions Test Workflow
```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          
      - name: Build check
        run: |
          npm run build:ios
          npm run build:android
```

## Testing Checklist

### Unit Tests
- [ ] All components have tests
- [ ] All hooks have tests
- [ ] All utilities have tests
- [ ] All services have tests
- [ ] 80%+ code coverage achieved

### Integration Tests
- [ ] Navigation flows tested
- [ ] Authentication flow tested
- [ ] Data creation/update flows tested
- [ ] Error scenarios tested
- [ ] Offline scenarios tested

### Platform Tests
- [ ] iOS specific features tested
- [ ] Android specific features tested
- [ ] Multiple device sizes tested
- [ ] Performance benchmarks met
- [ ] Accessibility features tested

## Common Issues & Solutions

### Issue 1: Flaky async tests
**Solution**: Use waitFor and proper async handling

### Issue 2: Navigation tests failing
**Solution**: Properly mock navigation prop and context

### Issue 3: Firebase mock issues
**Solution**: Create comprehensive Firebase mocks

## Next Steps
After completing Phase 8:
1. Fix any failing tests
2. Achieve coverage targets
3. Set up CI/CD pipeline
4. Proceed to Phase 9 (Build & Deployment)