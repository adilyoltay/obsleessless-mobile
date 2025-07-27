# Phase 4: State Management & API Integration (Day 9-11)

## Overview
This phase focuses on implementing state management solutions and API integration layer for the ObsessLess React Native application.

## Prerequisites
- Completed Phase 3 (UI Components)
- React Query and Zustand installed
- API endpoints documented from web application

## Tasks Overview

### Task 4.1: Context Providers Setup
**Duration**: 0.5 day
**Dependencies**: Navigation structure from Phase 2

### Task 4.2: API Service Layer
**Duration**: 1 day
**Dependencies**: Environment configuration from Phase 1

### Task 4.3: React Query Integration
**Duration**: 1.5 days
**Dependencies**: API service layer, TypeScript types

## Detailed Implementation

### Task 4.1: Context Providers Setup

#### 1. Create AuthContext
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from API
        const userProfile = await fetchUserProfile(firebaseUser.uid);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Implementation details...
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### 2. Create LanguageContext
```typescript
// src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('tr');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    const savedLang = await AsyncStorage.getItem('language');
    if (savedLang) {
      setLanguage(savedLang as Language);
    }
  };

  const changeLanguage = async (lang: Language) => {
    setLanguage(lang);
    await AsyncStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
```

#### 3. Create ThemeContext
```typescript
// src/contexts/ThemeContext.tsx
import React, { createContext, useContext } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  error: string;
  success: string;
  warning: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  spacing: typeof spacing;
  fontSize: typeof fontSize;
}

const colors: ThemeColors = {
  primary: '#86EFAC', // Pastel green
  secondary: '#10B981',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#1F2937',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors, spacing, fontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### 4. Create NotificationContext
```typescript
// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

interface NotificationContextType {
  fcmToken: string | null;
  notificationEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleDailyReminder: (time: Date) => void;
  cancelAllReminders: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    checkPermission();
    getFCMToken();
  }, []);

  const checkPermission = async () => {
    const authStatus = await messaging().hasPermission();
    setNotificationEnabled(authStatus === messaging.AuthorizationStatus.AUTHORIZED);
  };

  const getFCMToken = async () => {
    const token = await messaging().getToken();
    setFcmToken(token);
  };

  // Implementation details...
};
```

### Task 4.2: API Service Layer

#### 1. Create Base API Configuration
```typescript
// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const api = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      await refreshToken();
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 2. Create Service Files

##### Auth Service
```typescript
// src/services/auth.service.ts
import api from './api';
import { LoginRequest, SignupRequest, AuthResponse, User } from '../types/auth';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/user');
    return response.data;
  },
};
```

##### Compulsions Service
```typescript
// src/services/compulsions.service.ts
import api from './api';
import { Compulsion, CreateCompulsionRequest, CompulsionStats } from '../types/compulsion';

export const compulsionsService = {
  getAll: async (userId: number): Promise<Compulsion[]> => {
    const response = await api.get<Compulsion[]>(`/compulsions/${userId}`);
    return response.data;
  },

  create: async (data: CreateCompulsionRequest): Promise<Compulsion> => {
    const response = await api.post<Compulsion>('/compulsions', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Compulsion>): Promise<Compulsion> => {
    const response = await api.put<Compulsion>(`/compulsions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/compulsions/${id}`);
  },

  getStats: async (userId: number): Promise<CompulsionStats> => {
    const response = await api.get<CompulsionStats>(`/compulsions/${userId}/stats`);
    return response.data;
  },
};
```

##### ERP Service
```typescript
// src/services/erp.service.ts
import api from './api';
import { ERPExercise, CreateERPRequest, ERPSession } from '../types/erp';

export const erpService = {
  getExercises: async (userId: number): Promise<ERPExercise[]> => {
    const response = await api.get<ERPExercise[]>(`/erp-exercises/${userId}`);
    return response.data;
  },

  createExercise: async (data: CreateERPRequest): Promise<ERPExercise> => {
    const response = await api.post<ERPExercise>('/erp-exercises', data);
    return response.data;
  },

  startSession: async (exerciseId: number): Promise<ERPSession> => {
    const response = await api.post<ERPSession>(`/erp-exercises/${exerciseId}/start`);
    return response.data;
  },

  updateSession: async (sessionId: number, data: Partial<ERPSession>): Promise<ERPSession> => {
    const response = await api.put<ERPSession>(`/erp-sessions/${sessionId}`, data);
    return response.data;
  },

  completeSession: async (sessionId: number, data: any): Promise<ERPSession> => {
    const response = await api.post<ERPSession>(`/erp-sessions/${sessionId}/complete`, data);
    return response.data;
  },
};
```

### Task 4.3: React Query Integration

#### 1. Query Client Setup
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { MMKV } from 'react-native-mmkv';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const storage = new MMKV();

const clientStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const persister = createSyncStoragePersister({
  storage: clientStorage,
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});
```

#### 2. Create Custom Hooks

##### useAuth Hook
```typescript
// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      await AsyncStorage.setItem('authToken', data.token);
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: async (data) => {
      await AsyncStorage.setItem('authToken', data.token);
      queryClient.setQueryData(['user'], data.user);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authService.getCurrentUser,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
```

##### useCompulsions Hook
```typescript
// src/hooks/useCompulsions.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { compulsionsService } from '../services/compulsions.service';
import { useAuth } from '../contexts/AuthContext';

export const useCompulsions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['compulsions', user?.id],
    queryFn: () => compulsionsService.getAll(user!.id),
    enabled: !!user?.id,
  });
};

export const useCreateCompulsion = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: compulsionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compulsions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['compulsion-stats', user?.id] });
    },
  });
};

export const useUpdateCompulsion = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      compulsionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compulsions', user?.id] });
    },
  });
};

export const useCompulsionStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['compulsion-stats', user?.id],
    queryFn: () => compulsionsService.getStats(user!.id),
    enabled: !!user?.id,
  });
};
```

##### useERPExercises Hook
```typescript
// src/hooks/useERPExercises.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { erpService } from '../services/erp.service';
import { useAuth } from '../contexts/AuthContext';

export const useERPExercises = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['erp-exercises', user?.id],
    queryFn: () => erpService.getExercises(user!.id),
    enabled: !!user?.id,
  });
};

export const useCreateERPExercise = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: erpService.createExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-exercises', user?.id] });
    },
  });
};

export const useStartERPSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: erpService.startSession,
    onSuccess: (data) => {
      queryClient.setQueryData(['active-erp-session'], data);
    },
  });
};

export const useCompleteERPSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: any }) =>
      erpService.completeSession(sessionId, data),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['active-erp-session'] });
      queryClient.invalidateQueries({ queryKey: ['erp-exercises', user?.id] });
    },
  });
};
```

## Testing Guidelines

### Unit Tests
- Test each context provider independently
- Mock Firebase and API calls
- Test error handling scenarios
- Verify state updates correctly

### Integration Tests
- Test authentication flow end-to-end
- Verify data synchronization
- Test offline capabilities
- Validate cache persistence

## Performance Considerations

1. **Query Optimization**
   - Use proper query keys for efficient caching
   - Implement pagination for large datasets
   - Use optimistic updates for better UX

2. **Memory Management**
   - Clear unused cache data
   - Implement proper cleanup in useEffect
   - Monitor memory usage with Flipper

3. **Network Optimization**
   - Implement request batching
   - Use compression for API responses
   - Handle network state changes

## Common Issues & Solutions

### Issue 1: Token Expiration
**Solution**: Implement automatic token refresh in axios interceptor

### Issue 2: Cache Persistence
**Solution**: Use MMKV for faster storage operations

### Issue 3: State Synchronization
**Solution**: Use React Query's invalidation patterns

## Checklist

- [ ] All context providers created and tested
- [ ] API service layer fully implemented
- [ ] React Query hooks cover all endpoints
- [ ] Error handling implemented
- [ ] Offline support configured
- [ ] TypeScript types complete
- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] Performance optimized
- [ ] Documentation updated

## Next Steps
After completing Phase 4:
1. Review all API integrations
2. Test offline functionality
3. Verify state persistence
4. Proceed to Phase 5 (Firebase Integration)