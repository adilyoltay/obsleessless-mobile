# Phase 9: Build & Deployment (Day 25-26)

## Overview
This phase covers the complete build and deployment process for the ObsessLess React Native application, including app store preparation, CI/CD setup, and release management.

## Prerequisites
- All features tested and polished
- App icons and splash screens created
- Developer accounts for Apple and Google
- Code signing certificates ready
- Privacy policy and terms of service prepared

## Tasks Overview

### Task 9.1: Build Configuration
**Duration**: 0.5 day
**Focus**: Production builds, environment configuration, optimization

### Task 9.2: App Store Preparation
**Duration**: 0.5 day
**Focus**: Store listings, screenshots, metadata

### Task 9.3: CI/CD Setup
**Duration**: 0.5 day
**Focus**: Automated builds, testing, deployment

### Task 9.4: Release Process
**Duration**: 0.5 day
**Focus**: Beta testing, phased rollout, monitoring

## Task 9.1: Build Configuration

### 1. Environment Configuration

```typescript
// src/config/environments.ts
interface Environment {
  API_URL: string;
  SENTRY_DSN: string;
  FIREBASE_CONFIG: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  FEATURES: {
    ANALYTICS_ENABLED: boolean;
    CRASH_REPORTING_ENABLED: boolean;
    REMOTE_CONFIG_ENABLED: boolean;
  };
}

const environments: Record<string, Environment> = {
  development: {
    API_URL: 'http://localhost:3000',
    SENTRY_DSN: '',
    FIREBASE_CONFIG: {
      // Development Firebase project
    },
    FEATURES: {
      ANALYTICS_ENABLED: false,
      CRASH_REPORTING_ENABLED: false,
      REMOTE_CONFIG_ENABLED: false,
    },
  },
  staging: {
    API_URL: 'https://staging-api.obsessless.com',
    SENTRY_DSN: 'https://staging.sentry.io/...',
    FIREBASE_CONFIG: {
      // Staging Firebase project
    },
    FEATURES: {
      ANALYTICS_ENABLED: true,
      CRASH_REPORTING_ENABLED: true,
      REMOTE_CONFIG_ENABLED: false,
    },
  },
  production: {
    API_URL: 'https://api.obsessless.com',
    SENTRY_DSN: 'https://prod.sentry.io/...',
    FIREBASE_CONFIG: {
      // Production Firebase project
    },
    FEATURES: {
      ANALYTICS_ENABLED: true,
      CRASH_REPORTING_ENABLED: true,
      REMOTE_CONFIG_ENABLED: true,
    },
  },
};

export const getEnvironment = (): Environment => {
  const env = process.env.NODE_ENV || 'development';
  return environments[env];
};
```

### 2. iOS Build Configuration

#### Info.plist Updates
```xml
<!-- ios/ObsessLess/Info.plist -->
<key>CFBundleDisplayName</key>
<string>ObsessLess</string>
<key>CFBundleVersion</key>
<string>$(CURRENT_PROJECT_VERSION)</string>
<key>CFBundleShortVersionString</key>
<string>$(MARKETING_VERSION)</string>

<!-- Permissions -->
<key>NSCameraUsageDescription</key>
<string>ObsessLess profil fotoğrafı çekmek için kameranıza erişmek istiyor</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>ObsessLess profil fotoğrafı seçmek için fotoğraf galerinize erişmek istiyor</string>
<key>NSUserTrackingUsageDescription</key>
<string>ObsessLess size daha iyi hizmet verebilmek için anonim kullanım verilerini toplar</string>

<!-- App Transport Security for API -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSExceptionDomains</key>
  <dict>
    <key>obsessless.com</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <false/>
      <key>NSIncludesSubdomains</key>
      <true/>
    </dict>
  </dict>
</dict>
```

#### Build Schemes
```bash
# Create production scheme
cd ios
xcodebuild -workspace ObsessLess.xcworkspace \
  -scheme "ObsessLess-Production" \
  -configuration Release \
  -archivePath build/ObsessLess.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/ObsessLess.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist
```

### 3. Android Build Configuration

#### build.gradle Updates
```gradle
// android/app/build.gradle
android {
    defaultConfig {
        applicationId "com.obsessless.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode System.getenv("BUILD_NUMBER")?.toInteger() ?: 1
        versionName "1.0.0"
        
        resValue "string", "build_config_package", "com.obsessless.app"
    }
    
    signingConfigs {
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "release.keystore")
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
    
    flavorDimensions "environment"
    productFlavors {
        development {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
        }
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
        }
        production {
            dimension "environment"
        }
    }
}
```

#### ProGuard Rules
```pro
# android/app/proguard-rules.pro
-keep class com.obsessless.** { *; }
-keep class com.facebook.react.** { *; }
-keep class com.swmansion.** { *; }
-keep class com.horcrux.svg.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip
```

### 4. Code Optimization

#### Bundle Size Optimization
```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
};
```

#### Hermes Configuration
```gradle
// android/app/build.gradle
project.ext.react = [
    enableHermes: true,
    hermesCommand: "../../node_modules/hermes-engine/%OS-BIN%/hermesc",
    deleteDebugFilesForVariant: { variant ->
        variant.name.toLowerCase().contains("release")
    }
]
```

## Task 9.2: App Store Preparation

### 1. App Store Assets

#### App Icons
```bash
# Generate app icons for all sizes
npx react-native-icon-generator \
  --input ./assets/icon-1024.png \
  --output ./ios/ObsessLess/Images.xcassets/AppIcon.appiconset/
```

#### Launch Screens
```xml
<!-- ios/ObsessLess/LaunchScreen.storyboard -->
<imageView contentMode="scaleAspectFit" image="LaunchIcon">
  <rect key="frame" x="0.0" y="0.0" width="375" height="667"/>
</imageView>
```

### 2. App Store Connect Setup

#### App Information
```yaml
App Name: ObsessLess
Subtitle: OKB Yönetimi ve Takibi
Category: Health & Fitness
Secondary Category: Medical

Keywords:
  - OKB
  - obsesif kompulsif
  - anksiyete
  - mental sağlık
  - terapi
  - ERP
  - kompulsiyon takibi
  - düşünce günlüğü
  - maruz bırakma
  - CBT

Description: |
  ObsessLess, OKB (Obsesif Kompulsif Bozukluk) ile yaşayan bireyler için 
  tasarlanmış kapsamlı bir mental sağlık uygulamasıdır.
  
  Özellikler:
  • Kompulsiyon takibi ve analizi
  • ERP (Maruz Bırakma ve Yanıt Engelleme) egzersizleri
  • Y-BOCS değerlendirmeleri
  • Kişiselleştirilmiş öneriler
  • İlerleme raporları
  
Support URL: https://obsessless.com/support
Privacy Policy URL: https://obsessless.com/privacy
```

#### Screenshots
```typescript
// scripts/generate-screenshots.ts
const devices = [
  { name: 'iPhone 14 Pro Max', width: 1290, height: 2796 },
  { name: 'iPhone 8 Plus', width: 1242, height: 2208 },
  { name: 'iPad Pro 12.9', width: 2048, height: 2732 },
];

const screens = [
  'Dashboard',
  'CompulsionTracking',
  'ERPExercises',
  'Achievements',
  'Reports',
];
```

### 3. Google Play Console Setup

#### Store Listing
```yaml
Title: ObsessLess - OKB Takip ve Yönetim
Short Description: OKB yönetimi için kişiselleştirilmiş terapi asistanı
Full Description: |
  ObsessLess, OKB tedavisinde kanıta dayalı yöntemleri kullanan 
  yenilikçi bir mental sağlık uygulamasıdır.
  
  Ana Özellikler:
  ✓ Kompulsiyon takibi ve analizi
  ✓ ERP egzersizleri ve zamanlayıcı
  ✓ Y-BOCS klinik değerlendirmeleri
  ✓ Gamifikasyon ve motivasyon sistemi
  ✓ Detaylı ilerleme raporları
  
Category: Health & Fitness
Content Rating: Everyone
```

#### Content Rating Questionnaire
- No violence
- No sexual content
- No profanity
- Health/Medical content: Yes
- Data collection: Yes (with user consent)

### 4. Beta Testing Setup

#### TestFlight Configuration
```javascript
// ios/fastlane/Fastfile
lane :beta do
  increment_build_number
  build_app(
    scheme: "ObsessLess",
    export_method: "app-store",
    export_options: {
      provisioningProfiles: {
        "com.obsessless.app" => "ObsessLess Distribution"
      }
    }
  )
  upload_to_testflight(
    skip_waiting_for_build_processing: true,
    distribute_external: true,
    groups: ["Beta Testers"],
    changelog: "Bug fixes and performance improvements"
  )
end
```

#### Google Play Beta
```gradle
// android/app/build.gradle
play {
    track = "beta"
    releaseStatus = "completed"
    defaultToAppBundles = true
    artifactDir = file("build/outputs/bundle/release")
}
```

## Task 9.3: CI/CD Setup

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    tags:
      - 'v*'

env:
  FASTLANE_SKIP_UPDATE_CHECK: true
  FASTLANE_HIDE_GITHUB_ISSUES: true

jobs:
  deploy-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd ios && pod install
      
      - name: Setup certificates
        uses: apple-actions/import-codesign-certs@v2
        with:
          p12-file-base64: ${{ secrets.IOS_CERTIFICATES }}
          p12-password: ${{ secrets.IOS_CERTIFICATES_PASSWORD }}
      
      - name: Build and deploy
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          FASTLANE_APPLE_ID: ${{ secrets.APPLE_ID }}
          FASTLANE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
        run: |
          cd ios
          fastlane beta

  deploy-android:
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
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '11'
          distribution: 'adopt'
      
      - name: Decode keystore
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 -d > android/app/release.keystore
      
      - name: Build and deploy
        env:
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
        run: |
          cd android
          ./gradlew bundleRelease
          fastlane deploy
```

### 2. Fastlane Configuration

#### iOS Fastfile
```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build and upload to App Store Connect"
  lane :release do
    ensure_git_status_clean
    increment_version_number
    increment_build_number
    
    match(
      type: "appstore",
      readonly: true
    )
    
    build_app(
      workspace: "ObsessLess.xcworkspace",
      scheme: "ObsessLess",
      export_method: "app-store"
    )
    
    upload_to_app_store(
      skip_metadata: false,
      skip_screenshots: false,
      submit_for_review: true,
      automatic_release: false
    )
    
    slack(
      message: "iOS app successfully uploaded to App Store Connect! 🎉",
      success: true
    )
  end
end
```

#### Android Fastfile
```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Build and upload to Google Play"
  lane :release do
    ensure_git_status_clean
    
    gradle(
      task: "bundle",
      build_type: "Release",
      flavor: "production"
    )
    
    upload_to_play_store(
      track: "production",
      release_status: "draft",
      skip_upload_apk: true,
      skip_upload_metadata: false,
      skip_upload_images: false,
      skip_upload_screenshots: false
    )
    
    slack(
      message: "Android app successfully uploaded to Google Play! 🎉",
      success: true
    )
  end
end
```

### 3. Code Signing Automation

#### Match Configuration (iOS)
```ruby
# ios/fastlane/Matchfile
git_url("https://github.com/obsessless/certificates")
storage_mode("git")
type("appstore")
app_identifier(["com.obsessless.app"])
username("deploy@obsessless.com")
```

#### Gradle Signing (Android)
```gradle
// android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=release.keystore
MYAPP_UPLOAD_KEY_ALIAS=obsessless
MYAPP_UPLOAD_STORE_PASSWORD=***
MYAPP_UPLOAD_KEY_PASSWORD=***
```

## Task 9.4: Release Process

### 1. Version Management

```javascript
// scripts/version-bump.js
const fs = require('fs');
const path = require('path');

function bumpVersion(type = 'patch') {
  // Update package.json
  const packagePath = path.join(__dirname, '../package.json');
  const package = JSON.parse(fs.readFileSync(packagePath));
  const [major, minor, patch] = package.version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      package.version = `${major + 1}.0.0`;
      break;
    case 'minor':
      package.version = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      package.version = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  fs.writeFileSync(packagePath, JSON.stringify(package, null, 2));
  
  // Update iOS
  exec(`cd ios && agvtool new-marketing-version ${package.version}`);
  exec(`cd ios && agvtool next-version -all`);
  
  // Update Android
  const gradlePath = path.join(__dirname, '../android/app/build.gradle');
  let gradle = fs.readFileSync(gradlePath, 'utf8');
  gradle = gradle.replace(/versionName ".*"/, `versionName "${package.version}"`);
  fs.writeFileSync(gradlePath, gradle);
}
```

### 2. Release Checklist

```markdown
## Pre-Release Checklist

### Code Quality
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] ESLint warnings resolved
- [ ] Code coverage > 80%

### Features
- [ ] All planned features implemented
- [ ] Feature flags configured correctly
- [ ] A/B tests configured

### Performance
- [ ] Bundle size optimized
- [ ] Memory leaks fixed
- [ ] 60 FPS on all screens

### Security
- [ ] API keys removed from code
- [ ] ProGuard/R8 configured
- [ ] Certificate pinning enabled

### Store Requirements
- [ ] App icons updated
- [ ] Screenshots captured
- [ ] Store descriptions written
- [ ] Privacy policy updated

### Testing
- [ ] Manual QA completed
- [ ] Beta feedback addressed
- [ ] Crash-free rate > 99.5%
```

### 3. Phased Rollout Strategy

```yaml
Week 1: 10% rollout
  - Monitor crash rate
  - Check performance metrics
  - Gather initial feedback

Week 2: 25% rollout
  - Address critical issues
  - Monitor server load
  - Check retention metrics

Week 3: 50% rollout
  - Fine-tune based on feedback
  - Monitor store reviews
  - Check conversion rates

Week 4: 100% rollout
  - Full release if metrics are good
  - Prepare hotfix process
  - Plan next iteration
```

### 4. Post-Release Monitoring

```typescript
// src/services/monitoring.ts
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import performance from '@react-native-firebase/perf';

export const monitoring = {
  logEvent: (name: string, params?: any) => {
    analytics().logEvent(name, params);
  },
  
  logError: (error: Error, context?: any) => {
    crashlytics().recordError(error, context);
  },
  
  startTrace: async (name: string) => {
    const trace = await performance().startTrace(name);
    return trace;
  },
  
  setUserProperties: (properties: any) => {
    Object.entries(properties).forEach(([key, value]) => {
      analytics().setUserProperty(key, String(value));
    });
  },
};
```

## Deployment Commands

### iOS Deployment
```bash
# TestFlight Beta
cd ios && fastlane beta

# Production Release
cd ios && fastlane release

# Manual Archive & Upload
xcodebuild -workspace ObsessLess.xcworkspace \
  -scheme ObsessLess \
  -configuration Release \
  -archivePath build/ObsessLess.xcarchive \
  archive

xcrun altool --upload-app \
  -f build/ObsessLess.ipa \
  -u $APPLE_ID \
  -p $APPLE_APP_PASSWORD
```

### Android Deployment
```bash
# Beta Release
cd android && ./gradlew bundleRelease
cd android && fastlane beta

# Production Release
cd android && fastlane release

# Manual Build & Upload
cd android && ./gradlew bundleRelease
cd android && ./gradlew publishBundle
```

## Rollback Plan

### iOS Rollback
1. Reject binary in App Store Connect
2. Upload previous version with incremented build number
3. Expedite review if critical

### Android Rollback
1. Halt rollout in Play Console
2. Upload previous APK/AAB with incremented version code
3. Resume rollout with previous version

## Success Metrics

- **Crash-free rate**: > 99.5%
- **App startup time**: < 2 seconds
- **Store rating**: > 4.5 stars
- **1-day retention**: > 40%
- **7-day retention**: > 20%
- **Monthly active users**: Growing 10% MoM

## Checklist

- [ ] Build configurations set up
- [ ] Environment variables configured
- [ ] Code signing automated
- [ ] Store listings prepared
- [ ] Screenshots generated
- [ ] Beta testing configured
- [ ] CI/CD pipeline working
- [ ] Release process documented
- [ ] Monitoring configured
- [ ] Rollback plan ready

## Next Steps
After completing Phase 9:
1. Submit for store review
2. Monitor beta feedback
3. Prepare launch materials
4. Proceed to Phase 10 (Launch & Post-Launch)