# ObsessLess Expo Mobil Uygulaması Geliştirme - Replit AI Master Prompt

## Genel Bakış
Bu doküman, ObsessLess web uygulamasının Replit üzerinde Expo ile mobil uygulamaya dönüştürülmesi için tek parça, kapsamlı bir AI promptu içerir. Bu prompt, tüm geliştirme sürecini adım adım kapsar.

## TEK PARÇA MASTER PROMPT - ObsessLess Expo Mobil Geliştirme

```
ObsessLess web uygulamasını Replit üzerinde Expo SDK kullanarak mobil uygulamaya dönüştüreceksin. ObsessLess, OKB (Obsesif Kompulsif Bozukluk) yönetimi için kapsamlı özelliklere sahip bir mental sağlık platformudur.

PROJE BAĞLAMI:
- Uygulama: ObsessLess - OKB terapi ve yönetim platformu
- Mevcut Stack: React 18, TypeScript, Tailwind CSS, Express.js, PostgreSQL
- Hedef Platform: Replit üzerinde Expo SDK 50 + TypeScript
- Geliştirme Ortamı: %100 bulut tabanlı Replit (local kurulum yok)
- Özellikler: Kimlik doğrulama, Kompulsiyon takibi, ERP egzersizleri, Y-BOCS değerlendirmeleri, Oyunlaştırma, Çoklu dil (TR/EN)
- Navigasyon: Expo Router (dosya tabanlı routing)
- UI Kütüphanesi: React Native Paper + Expo bileşenleri

GENEL TALİMATLAR:
- Tüm geliştirme Replit'te yapılacak, local kurulum gerektirmeyecek
- Expo managed workflow kullanılacak (native kod erişimi yok)
- Expo Go uygulaması ile test edilecek
- EAS Build ile production build'leri alınacak
- Mevcut Express.js API'si değiştirilmeyecek, sadece mobil uyumlu hale getirilecek

Aşağıdaki fazları sistematik olarak tamamlayacaksın:

## FAZ 1: REPLIT'TE PROJE KURULUMU (1-2. Gün)

### Görev 1.1 - Expo Projesi Oluşturma:
Replit'te yeni proje oluştur:
1. https://replit.com adresine git
2. "Create Repl" butonuna tıkla
3. "Expo" template'ini seç
4. Proje adı: "ObsessLessMobile"
5. "Create Repl" ile oluştur

Teslimatlar:
- Replit'te çalışan Expo projesi
- TypeScript önceden yapılandırılmış
- Development server erişilebilir
- QR kod ile mobil test hazır

### Görev 1.2 - Temel Bağımlılıkları Kurma:
```bash
# Replit Shell'de çalıştır:

# UI Bileşenleri (Expo uyumlu)
npm install react-native-paper @expo/vector-icons
npm install expo-linear-gradient react-native-svg
npm install react-native-reanimated react-native-gesture-handler

# State Yönetimi
npm install @tanstack/react-query zustand
npm install @react-native-async-storage/async-storage

# Firebase (Expo için web SDK)
npm install firebase

# Expo Modülleri
npm install expo-secure-store expo-notifications expo-device
npm install expo-local-authentication expo-haptics expo-blur
npm install expo-font expo-splash-screen expo-status-bar

# Form ve Validasyon
npm install react-hook-form zod @hookform/resolvers

# Yardımcı Kütüphaneler
npm install axios date-fns @formatjs/intl-datetimeformat
npm install react-native-safe-area-context react-native-screens
```

### Görev 1.3 - Proje Yapısını Oluşturma:
```
app/                          # Expo Router dizini
├── (auth)/                   # Auth grubu
│   ├── _layout.tsx          # Auth layout
│   ├── login.tsx            # Giriş ekranı
│   ├── signup.tsx           # Kayıt ekranı
│   └── onboarding.tsx       # Profil kurulumu
├── (tabs)/                   # Tab navigasyon grubu
│   ├── _layout.tsx          # Tab layout
│   ├── index.tsx            # Ana sayfa (Dashboard)
│   ├── compulsions.tsx      # Kompulsiyon takibi
│   ├── erp.tsx             # ERP egzersizleri
│   └── settings.tsx         # Ayarlar
├── _layout.tsx              # Root layout
└── +not-found.tsx           # 404 sayfası

components/                   # Yeniden kullanılabilir bileşenler
├── ui/                      # Temel UI bileşenleri
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── ...
├── features/                # Özellik bileşenleri
│   ├── StreakCounter.tsx
│   ├── CompulsionForm.tsx
│   ├── ERPTimer.tsx
│   └── ...
└── layout/                  # Layout bileşenleri
    ├── Header.tsx
    └── TabBar.tsx

services/                    # API servisleri
├── api.ts                  # Axios yapılandırması
├── auth.service.ts         # Kimlik doğrulama
├── compulsions.service.ts  # Kompulsiyon API
├── erp.service.ts         # ERP API
└── user.service.ts        # Kullanıcı API

utils/                      # Yardımcı fonksiyonlar
constants/                  # Sabitler
types/                      # TypeScript tipleri
hooks/                      # Custom hook'lar
contexts/                   # React Context'ler
assets/                     # Görseller, fontlar
```

### Görev 1.4 - Ortam Yapılandırması:
1. Expo environment variables yapılandırması:
```typescript
// app.config.ts
export default {
  expo: {
    name: "ObsessLess",
    slug: "obsessless",
    version: "1.0.0",
    extra: {
      apiUrl: process.env.API_URL || "https://your-repl.repl.co/api",
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
      }
    }
  }
}
```

2. Firebase yapılandırması:
```typescript
// services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const firebaseConfig = Constants.expoConfig?.extra?.firebaseConfig;
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

## FAZ 2: EXPO ROUTER İLE NAVİGASYON (3-4. Gün)

### Görev 2.1 - Root Layout Oluşturma:
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

const queryClient = new QueryClient();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#10b981',
    secondary: '#86efac',
  },
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
```

### Görev 2.2 - Auth Layout ve Ekranları:
```typescript
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Giriş Yap' }} />
      <Stack.Screen name="signup" options={{ title: 'Kayıt Ol' }} />
      <Stack.Screen name="onboarding" options={{ title: 'Profil Oluştur' }} />
    </Stack>
  );
}
```

Auth ekranları oluştur:
- login.tsx: Email/şifre girişi, Firebase Auth entegrasyonu
- signup.tsx: Kayıt formu, validation, Firebase kullanıcı oluşturma
- onboarding.tsx: 4 adımlı OKB profil kurulumu, Y-BOCS entegrasyonu

### Görev 2.3 - Tab Navigation Layout:
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bugün',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="compulsions"
        options={{
          title: 'OKB Takibi',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="brain" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="erp"
        options={{
          title: 'ERP',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="shield" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Görev 2.4 - Temel Ekranları Oluşturma:
Her ekran için temel yapı:
- index.tsx: Dashboard (StreakCounter, PersonalizedRecommendations, SmartActionButton, DailyMicroRewards)
- compulsions.tsx: Kompulsiyon formu, günlük istatistikler, geçmiş
- erp.tsx: ERP egzersiz listesi, aktif oturum, tamamlananlar
- settings.tsx: Profil, bildirimler, dil değiştirme

## FAZ 3: UI BİLEŞENLERİ GÖÇ (5-8. Gün)

### Görev 3.1 - Temel UI Bileşenleri:
Web'den mobil'e dönüştürülecek bileşenler:

```typescript
// components/ui/Button.tsx
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { haptics } from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled }: ButtonProps) {
  const handlePress = () => {
    haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </Pressable>
  );
}
```

Benzer şekilde oluşturulacak diğer bileşenler:
- Card: Gölge efektli, platform-specific
- Input: React Native Paper TextInput wrapper
- Modal: Portal kullanımı, backdrop blur
- Badge: Rarity sistemine uygun renkler
- ProgressBar: Animated API ile smooth animasyonlar

### Görev 3.2 - Form Bileşenleri:
React Hook Form + Zod ile form bileşenleri:

```typescript
// components/forms/CompulsionForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, SegmentedButtons, Slider } from 'react-native-paper';

const compulsionSchema = z.object({
  type: z.string(),
  frequency: z.number().min(1).max(100),
  duration: z.number().min(1).max(300),
  resistanceLevel: z.number().min(1).max(10),
  trigger: z.string().optional(),
  notes: z.string().optional(),
});

type CompulsionFormData = z.infer<typeof compulsionSchema>;

export function CompulsionForm({ onSubmit }: { onSubmit: (data: CompulsionFormData) => void }) {
  const { control, handleSubmit, formState: { errors } } = useForm<CompulsionFormData>({
    resolver: zodResolver(compulsionSchema),
    defaultValues: {
      type: 'checking',
      frequency: 1,
      duration: 5,
      resistanceLevel: 5,
    },
  });

  // Form implementation...
}
```

### Görev 3.3 - Özellik Bileşenleri:
Web'deki tüm özellik bileşenlerini mobil'e taşı:

1. **StreakCounter**: 
   - SVG yerine react-native-svg kullan
   - Circular progress için reanimated
   - Motivasyon seviyeleri ve emoji'ler

2. **DailyMicroRewards**:
   - FlatList ile performanslı liste
   - Collapsible history için LayoutAnimation
   - Rarity sistemine uygun gradientler

3. **PersonalizedRecommendations**:
   - Y-BOCS skoruna göre öneriler
   - Swipeable cards için PanGestureHandler
   - Hatırlatıcı oluşturma modali

4. **CompulsionStats & ERPProgressTracker**:
   - Victory Native yerine react-native-svg-charts
   - Real-time güncelleme için React Query

## FAZ 4: STATE YÖNETİMİ VE API (9-11. Gün)

### Görev 4.1 - Context Provider'lar:
```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Auth methods implementation...
}
```

Diğer context'ler:
- LanguageContext: TR/EN dil desteği, AsyncStorage ile persistence
- NotificationContext: Expo Notifications entegrasyonu
- ThemeContext: Light/dark tema (opsiyonel)

### Görev 4.2 - API Service Layer:
```typescript
// services/api.ts
import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
    }
    return Promise.reject(error);
  }
);

export default api;
```

Service dosyaları:
- auth.service.ts: Login, signup, token yönetimi
- compulsions.service.ts: CRUD operations, daily stats
- erp.service.ts: Exercise CRUD, session management
- user.service.ts: Profile, settings, achievements
- notifications.service.ts: Push notifications, reminders

### Görev 4.3 - React Query Hooks:
```typescript
// hooks/useCompulsions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { compulsionsService } from '../services/compulsions.service';

export function useCompulsions(date?: string) {
  return useQuery({
    queryKey: ['compulsions', date],
    queryFn: () => compulsionsService.getByDate(date || new Date().toISOString()),
  });
}

export function useCreateCompulsion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: compulsionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compulsions'] });
    },
  });
}
```

## FAZ 5: NATIVE ÖZELLİKLER VE PUSH BİLDİRİMLER (12-14. Gün)

### Görev 5.1 - Push Notification Kurulumu:
```typescript
// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications work only on physical devices');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Push notification izni verilemedi!');
    return;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  return token.data;
}
```

### Görev 5.2 - Biometric Authentication:
```typescript
// utils/biometric.ts
import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticateWithBiometric() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    throw new Error('Cihazınız biyometrik doğrulamayı desteklemiyor');
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    throw new Error('Biyometrik veri kayıtlı değil');
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'ObsessLess\'e giriş için kimliğinizi doğrulayın',
    cancelLabel: 'İptal',
    fallbackLabel: 'Şifre kullan',
  });

  return result.success;
}
```

### Görev 5.3 - Offline Support:
```typescript
// utils/offline.ts
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const offlineManager = {
  async saveForOffline(key: string, data: any) {
    await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(data));
  },

  async getOfflineData(key: string) {
    const data = await AsyncStorage.getItem(`offline_${key}`);
    return data ? JSON.parse(data) : null;
  },

  async syncWhenOnline() {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        // Sync offline data with server
        this.syncOfflineData();
      }
    });

    return unsubscribe;
  },
};
```

### Görev 5.4 - Haptic Feedback:
Tüm interaktif elementlere haptic feedback ekle:
- Button press: Light impact
- Success actions: Success feedback
- Error states: Warning feedback
- Long press: Heavy impact

## FAZ 6: PERFORMANS OPTİMİZASYONU (15-17. Gün)

### Görev 6.1 - Image Optimization:
```typescript
// components/OptimizedImage.tsx
import { Image } from 'expo-image';

export function OptimizedImage({ source, ...props }) {
  return (
    <Image
      source={source}
      cachePolicy="memory-disk"
      contentFit="cover"
      transition={200}
      {...props}
    />
  );
}
```

### Görev 6.2 - List Optimization:
- FlatList için getItemLayout kullan
- windowSize ve initialNumToRender optimize et
- React.memo ile gereksiz re-render'ları önle
- Virtualization için FlashList kullan

### Görev 6.3 - Bundle Size Optimization:
- Tree shaking için import optimization
- Lazy loading için React.lazy kullan
- Asset optimization (webp formatı)
- Font subsetting

## FAZ 7: TEST VE QA (18-20. Gün)

### Görev 7.1 - Unit Tests:
```typescript
// __tests__/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../components/ui/Button';

describe('Button', () => {
  it('should render correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} />
    );
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Görev 7.2 - Integration Tests:
- API call testing
- Navigation flow testing
- Form submission testing
- Error handling testing

### Görev 7.3 - E2E Tests:
Detox ile E2E testler:
- Authentication flow
- Compulsion tracking flow
- ERP session completion
- Settings changes

## FAZ 8: BUILD VE DEPLOYMENT (21-23. Gün)

### Görev 8.1 - EAS Build Yapılandırması:
```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

### Görev 8.2 - App Store/Play Store Hazırlık:
1. App icons ve splash screens
2. Store listings (açıklama, screenshot'lar)
3. Privacy policy ve terms
4. App review hazırlığı

### Görev 8.3 - CI/CD Pipeline:
GitHub Actions ile otomatik build:
```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: expo/expo-github-action@v8
      - run: npm install
      - run: eas build --platform all --non-interactive
```

## FAZ 9: POST-LAUNCH VE OPTİMİZASYON (24-28. Gün)

### Görev 9.1 - Analytics Entegrasyonu:
- Firebase Analytics
- Crashlytics
- Performance monitoring
- User behavior tracking

### Görev 9.2 - A/B Testing:
- Firebase Remote Config
- Feature flags
- Gradual rollout

### Görev 9.3 - Sürekli İyileştirme:
- User feedback collection
- Performance metrics monitoring
- Crash report analysis
- Regular updates

## ÖZEL TALİMATLAR:

1. **Kod Kalitesi:**
   - TypeScript strict mode kullan
   - ESLint ve Prettier konfigürasyonu
   - Consistent naming conventions
   - Comprehensive error handling

2. **Performans:**
   - 60 FPS hedefle
   - Bundle size < 40MB
   - Cold start < 3 saniye
   - Memory usage optimize et

3. **Accessibility:**
   - Screen reader support
   - Accessible labels
   - Proper contrast ratios
   - Keyboard navigation

4. **Security:**
   - Secure storage kullan
   - API key'leri environment variable'da sakla
   - Certificate pinning
   - Biometric authentication

5. **Localization:**
   - TR/EN dil desteği
   - RTL support hazırlığı
   - Date/time formatting
   - Number formatting

Bu prompt'u kullanarak ObsessLess mobil uygulamasını Replit üzerinde Expo ile baştan sona geliştirebilirsin. Her fazı sırayla tamamla ve her adımda test etmeyi unutma.
```

## Hızlı Başvuru Komutları

### Proje Başlatma (Replit'te):
```bash
# Yeni Expo projesi oluştur
npx create-expo-app obsessless-mobile --template blank-typescript

# Bağımlılıkları kur
npm install

# Development server'ı başlat
npx expo start
```

### Sık Kullanılan Komutlar:
```bash
# iOS Simulator'da çalıştır
npx expo run:ios

# Android Emulator'da çalıştır
npx expo run:android

# EAS Build (cloud)
eas build --platform all

# TypeScript kontrol
npx tsc --noEmit

# Lint kontrol
npm run lint

# Test çalıştır
npm test
```

## Kullanım Talimatları

1. **Tam Geçiş İçin**: Yukarıdaki TEK PARÇA MASTER PROMPT'u kopyalayın ve Replit AI asistanına verin.

2. **Spesifik Sorunlar İçin**: Hızlı Başvuru Komutları bölümünü kullanın.

3. **Önemli Notlar**:
   - Tüm geliştirme Replit'te yapılacak
   - Local kurulum gerekmez
   - Expo Go ile test edilecek
   - Web versiyonu ile özellik paritesi korunacak

## Replit İpuçları

- Proje başlangıcında master prompt'u kullanın
- Her fazı tamamladıktan sonra commit atın
- Expo Go ile düzenli test yapın
- EAS Build ile production build'leri alın
- Replit'in cloud ortamından maksimum faydalanın