# Phase 1: Expo Project Setup on Replit

## Overview
This phase covers the initial setup of the Expo project on Replit, including remixing the template, configuring the project structure, and installing core dependencies.

## Prerequisites
- **Replit Account**: Free or paid account
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
- **Expo Go App**: Install on your mobile device for testing
- **No Local Setup Required**: Everything runs in the cloud on Replit

## Step-by-Step Implementation Guide

### Step 1: Create Expo Project on Replit

```bash
# On Replit:
1. Go to https://replit.com
2. Click "Create Repl"
3. Search for "Expo" template
4. Name your project: "ObsessLessMobile"
5. Click "Create Repl"

# The template automatically includes:
- Expo SDK 50
- TypeScript configuration
- Basic project structure
- Development server setup
```

### Step 2: Project Structure Setup on Replit

```bash
# In Replit, create folders using the file tree
# Right-click and "Create Folder" for each directory:

ObsessLessMobile/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication group
│   ├── (tabs)/            # Tab navigation group
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable UI components
│   ├── common/           # Common components
│   ├── ui/              # Base UI components
│   └── features/        # Feature-specific components
├── services/             # API and external services
├── store/               # State management
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── constants/           # App constants
└── assets/              # Images, fonts, etc.
```

### Step 3: Install Core Dependencies on Replit

```bash
# In Replit Shell, install Expo-compatible packages:

# UI Components
npm install react-native-paper @expo/vector-icons
npm install expo-linear-gradient react-native-svg

# State Management
npm install @tanstack/react-query zustand
npm install @react-native-async-storage/async-storage

# Firebase (web SDK for Expo)
npm install firebase

# Security & Storage
npm install expo-secure-store
npm install expo-local-authentication

# Native Features
npm install expo-notifications expo-device
npm install expo-haptics expo-blur

# Utilities
npm install axios date-fns react-hook-form

# Development
npm install --save-dev @types/react
```

### Step 4: iOS Configuration (macOS only)

Update `ios/ObsessLessMobile/Info.plist`:
```xml
<!-- Add custom fonts -->
<key>UIAppFonts</key>
<array>
    <string>Poppins-Regular.ttf</string>
    <string>Poppins-Medium.ttf</string>
    <string>Poppins-SemiBold.ttf</string>
    <string>Poppins-Bold.ttf</string>
</array>

<!-- Add camera/photo permissions -->
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera for profile photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library for profile photos</string>

<!-- Add biometric permissions -->
<key>NSFaceIDUsageDescription</key>
<string>This app uses Face ID for secure authentication</string>
```

### Step 5: Android Configuration

Update `android/app/build.gradle`:
```gradle
android {
    ...
    defaultConfig {
        ...
        multiDexEnabled true
        // Vector icons configuration
        project.ext.vectoricons = [
            iconFontNames: [ 'MaterialIcons.ttf', 'Ionicons.ttf' ]
        ]
    }
}

dependencies {
    implementation 'androidx.multidex:multidex:2.0.1'
}

// Apply vector icons gradle plugin
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

Update `android/app/src/main/AndroidManifest.xml`:
```xml
<!-- Add permissions -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

### Step 6: Configure TypeScript

Create/update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es6", "es2017", "es2018", "esnext"],
    "allowJs": true,
    "jsx": "react-native",
    "noEmit": true,
    "isolatedModules": true,
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@hooks/*": ["src/hooks/*"],
      "@types/*": ["src/types/*"],
      "@constants/*": ["src/constants/*"],
      "@assets/*": ["src/assets/*"]
    }
  },
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
}
```

### Step 7: Configure Babel

Update `babel.config.js`:
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@types': './src/types',
          '@constants': './src/constants',
          '@assets': './src/assets'
        }
      }
    ],
    'react-native-reanimated/plugin'
  ]
};
```

### Step 8: Environment Configuration

Install react-native-config:
```bash
npm install react-native-config
```

Create `.env` file:
```env
API_URL=http://localhost:5000/api
APP_NAME=ObsessLess
ENVIRONMENT=development
```

Create `.env.production`:
```env
API_URL=https://api.obsessless.com/api
APP_NAME=ObsessLess
ENVIRONMENT=production
```

### Step 9: Create Base App Component

Create `src/App.tsx`:
```typescript
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import RootNavigator from './navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
```

### Step 10: Configure Entry Point

Update `index.js`:
```javascript
import { AppRegistry, LogBox } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// Ignore specific warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'ViewPropTypes will be removed',
    'ColorPropType will be removed',
  ]);
}

AppRegistry.registerComponent(appName, () => App);
```

## AI Assistant Prompts for Phase 1

### Prompt 1: Project Initialization
```
I need to set up a new React Native project called ObsessLessMobile with TypeScript support. Please help me:
1. Initialize the project using React Native CLI with TypeScript template
2. Set up the project directory structure with folders for components, screens, services, navigation, store, utils, hooks, types, constants, and assets
3. Configure path aliases in tsconfig.json and babel.config.js for easier imports
4. Ensure the project runs successfully on both iOS and Android
```

### Prompt 2: Dependency Installation
```
I need to install and configure the following dependencies for my React Native project:
- Navigation: React Navigation with stack, bottom tabs, and drawer navigators
- UI: React Native Elements, Vector Icons, Linear Gradient, SVG
- State Management: TanStack Query and Zustand
- Storage: React Native MMKV for persistent storage
- Utilities: React Native Config, Axios, date-fns, react-hook-form

Please provide the installation commands and any necessary configuration steps for both iOS and Android.
```

### Prompt 3: Platform Configuration
```
Please help me configure platform-specific settings:

For iOS:
- Add Poppins font family support
- Configure Info.plist for camera and photo library permissions
- Set up CocoaPods properly

For Android:
- Enable multidex support
- Add necessary permissions to AndroidManifest.xml
- Configure gradle files for React Native dependencies

Include any additional platform-specific configurations needed for the dependencies we installed.
```

### Prompt 4: Development Environment
```
Set up the development environment configuration:
1. Create environment variable files (.env and .env.production) with API_URL configuration
2. Configure react-native-config to work with TypeScript
3. Set up a proper logging system for development
4. Configure React Native Debugger/Flipper integration
5. Add development-specific settings to improve developer experience
```

## Verification Checklist

Before moving to Phase 2, ensure:

- [ ] Project initializes without errors
- [ ] iOS app runs successfully (if on macOS)
- [ ] Android app runs successfully
- [ ] All dependencies are installed correctly
- [ ] TypeScript is configured properly
- [ ] Path aliases work in imports
- [ ] Environment variables are accessible
- [ ] Project structure is created as specified
- [ ] Git repository is initialized with .gitignore

## Common Issues and Solutions

### Issue 1: iOS Build Fails
```bash
# Clean and rebuild
cd ios
pod deintegrate
pod install
cd ..
npx react-native run-ios
```

### Issue 2: Android Build Fails
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Issue 3: Metro Bundler Issues
```bash
# Clear cache
npx react-native start --reset-cache
```

### Issue 4: TypeScript Path Aliases Not Working
- Ensure both tsconfig.json and babel.config.js have matching path configurations
- Restart Metro bundler after changes

## Next Steps

Once Phase 1 is complete, proceed to:
- [Phase 2: Navigation Implementation](./phase-2-navigation.md)

---

Last Updated: January 2025