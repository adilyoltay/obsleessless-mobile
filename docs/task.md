# ObsessLess Expo Migration - Cursor Development Tasks on Replit

## Overview
This document provides step-by-step tasks for developing ObsessLess Expo application using Cursor IDE with Replit. Each task is designed to be completed in the cloud without local setup.

## Prerequisites Checklist
- [ ] Create Replit account (free or paid)
- [ ] Install Expo Go app on your mobile device
- [ ] Have a modern web browser
- [ ] No local development environment needed!
- [ ] Optional: Install Cursor IDE for enhanced development

## Phase 1: Project Initialization on Replit (Day 1-2)

### Task 1.1: Create Expo Project on Replit
```bash
# On Replit:
1. Go to https://replit.com
2. Click "Create Repl"
3. Search for "Expo" template
4. Name your project: "ObsessLessMobile"
5. Click "Create Repl"
```
**Deliverables:**
- [ ] Expo project running on Replit
- [ ] TypeScript pre-configured
- [ ] Development server accessible

### Task 1.2: Install Core Dependencies
```bash
# In Replit Shell:

# UI Components
npm install react-native-paper @expo/vector-icons
npm install expo-linear-gradient react-native-svg

# State Management
npm install @tanstack/react-query zustand
npm install @react-native-async-storage/async-storage

# Firebase (web SDK)
npm install firebase

# Utilities
npm install axios date-fns react-hook-form
npm install expo-secure-store expo-notifications
```
**Deliverables:**
- [ ] All dependencies installed
- [ ] iOS pods configured
- [ ] No dependency conflicts

### Task 1.3: Configure Project Structure
Create folder structure:
```
src/
├── components/
│   ├── ui/
│   ├── common/
│   └── forms/
├── screens/
│   ├── auth/
│   ├── dashboard/
│   ├── compulsions/
│   ├── erp/
│   └── settings/
├── navigation/
├── services/
├── hooks/
├── contexts/
├── utils/
├── constants/
├── types/
└── assets/
    ├── fonts/
    └── images/
```
**Deliverables:**
- [ ] Complete folder structure
- [ ] Path aliases configured in tsconfig.json
- [ ] Babel module resolver configured

### Task 1.4: Environment Configuration
**Files to create:**
- `.env.development`
- `.env.production`
- `src/config/env.ts`
- `src/config/firebase.ts`

**Deliverables:**
- [ ] Environment variables configured
- [ ] Firebase configuration
- [ ] API endpoints defined

## Phase 2: Navigation Setup (Day 3-4)

### Task 2.1: Create Navigation Structure
**Files to create:**
- `src/navigation/RootNavigator.tsx`
- `src/navigation/AuthNavigator.tsx`
- `src/navigation/AppNavigator.tsx`
- `src/navigation/TabNavigator.tsx`
- `src/navigation/types.ts`

**Implementation:**
- [ ] Authentication flow (Login/Signup)
- [ ] Bottom tab navigation (Dashboard, Compulsions, ERP)
- [ ] Stack navigation for each tab
- [ ] Deep linking configuration

### Task 2.2: Create Navigation Screens
**Screens to implement:**
```
Auth:
- LoginScreen.tsx
- SignupScreen.tsx
- OnboardingScreen.tsx

Dashboard:
- DashboardScreen.tsx
- AchievementsScreen.tsx

Compulsions:
- CompulsionTrackingScreen.tsx
- CompulsionHistoryScreen.tsx

ERP:
- ERPExercisesScreen.tsx
- ERPSessionScreen.tsx
- ERPHistoryScreen.tsx

Settings:
- SettingsScreen.tsx
- ProfileScreen.tsx
- NotificationsScreen.tsx
```

**Deliverables:**
- [ ] All screen components created
- [ ] Navigation flow working
- [ ] Screen transitions smooth

## Phase 3: UI Components Migration (Day 5-8)

### Task 3.1: Create Base UI Components
**Components to migrate:**
```
ui/
├── Button.tsx
├── Card.tsx
├── Input.tsx
├── Modal.tsx
├── Badge.tsx
├── ProgressBar.tsx
├── Tabs.tsx
├── DatePicker.tsx
└── Select.tsx
```

**Deliverables:**
- [ ] All base components functional
- [ ] Platform-specific styling
- [ ] Consistent theme system

### Task 3.2: Create Form Components
**Components to create:**
```
forms/
├── CompulsionForm.tsx
├── ERPSessionForm.tsx
├── ProfileForm.tsx
├── LoginForm.tsx
└── SignupForm.tsx
```

**Features:**
- [ ] React Hook Form integration
- [ ] Validation with Zod
- [ ] Error handling
- [ ] Loading states

### Task 3.3: Create Feature Components
**Components to migrate:**
```
common/
├── StreakCounter.tsx
├── DailyMicroRewards.tsx
├── PersonalizedRecommendations.tsx
├── AchievementBadges.tsx
├── ProgressChart.tsx
├── CompulsionStats.tsx
├── ERPProgressTracker.tsx
└── NotificationCard.tsx
```

**Deliverables:**
- [ ] All features working
- [ ] Charts/graphs functional
- [ ] Animations smooth

## Phase 4: State Management & API (Day 9-11)

### Task 4.1: Set Up Context Providers
**Contexts to create:**
```
contexts/
├── AuthContext.tsx
├── LanguageContext.tsx
├── ThemeContext.tsx
└── NotificationContext.tsx
```

**Features:**
- [ ] User authentication state
- [ ] Language switching (TR/EN)
- [ ] Theme management
- [ ] Notification preferences

### Task 4.2: API Service Layer
**Services to implement:**
```
services/
├── api.ts
├── auth.service.ts
├── compulsions.service.ts
├── erp.service.ts
├── user.service.ts
├── notifications.service.ts
└── achievements.service.ts
```

**Features:**
- [ ] Axios instance configuration
- [ ] Request/response interceptors
- [ ] Error handling
- [ ] Token management

### Task 4.3: React Query Integration
**Hooks to create:**
```
hooks/
├── useAuth.ts
├── useCompulsions.ts
├── useERPExercises.ts
├── useAchievements.ts
├── useNotifications.ts
└── useUserProfile.ts
```

**Features:**
- [ ] Query hooks for data fetching
- [ ] Mutation hooks for updates
- [ ] Optimistic updates
- [ ] Cache invalidation

## Phase 5: Firebase Integration (Day 12-13)

### Task 5.1: Firebase Authentication
**Implementation:**
- [ ] Email/password authentication
- [ ] Token refresh logic
- [ ] Session persistence
- [ ] Logout functionality

### Task 5.2: Firebase Messaging
**Features:**
- [ ] Push notification setup
- [ ] iOS APNs configuration
- [ ] Android FCM configuration
- [ ] Notification handlers

### Task 5.3: Biometric Authentication
**Implementation:**
- [ ] Face ID/Touch ID (iOS)
- [ ] Fingerprint (Android)
- [ ] Fallback to password
- [ ] Secure storage integration

## Phase 6: Feature Implementation (Day 14-18)

### Task 6.1: Compulsion Tracking
**Features:**
- [ ] Add compulsion form
- [ ] Daily statistics
- [ ] History view with filters
- [ ] Resistance tracking
- [ ] Export functionality

### Task 6.2: ERP Exercises
**Features:**
- [ ] Exercise creation
- [ ] Timer functionality
- [ ] Anxiety level tracking
- [ ] Progress visualization
- [ ] Achievement unlocking

### Task 6.3: Gamification System
**Implementation:**
- [ ] Streak counter
- [ ] Daily rewards
- [ ] Achievement badges
- [ ] Progress milestones
- [ ] Personalized challenges

### Task 6.4: Settings & Profile
**Features:**
- [ ] Profile management
- [ ] OCD profile setup
- [ ] Notification preferences
- [ ] Language switching
- [ ] Data export/import

## Phase 7: Polish & Optimization (Day 19-21)

### Task 7.1: Performance Optimization
**Tasks:**
- [ ] Implement lazy loading
- [ ] Optimize image assets
- [ ] Reduce bundle size
- [ ] Implement code splitting
- [ ] Memory leak fixes

### Task 7.2: UI/UX Polish
**Tasks:**
- [ ] Loading states
- [ ] Error boundaries
- [ ] Empty states
- [ ] Pull-to-refresh
- [ ] Haptic feedback

### Task 7.3: Accessibility
**Implementation:**
- [ ] Screen reader support
- [ ] Font scaling
- [ ] High contrast mode
- [ ] Keyboard navigation
- [ ] Focus management

## Phase 8: Testing & Quality (Day 22-24)

### Task 8.1: Unit Testing
**Setup:**
- [ ] Jest configuration
- [ ] React Native Testing Library
- [ ] Component tests
- [ ] Hook tests
- [ ] Service tests

### Task 8.2: Integration Testing
**Tests:**
- [ ] Navigation flows
- [ ] API integration
- [ ] Authentication flow
- [ ] Data persistence
- [ ] Error scenarios

### Task 8.3: Platform Testing
**Platforms:**
- [ ] iOS Simulator testing
- [ ] Android Emulator testing
- [ ] Physical device testing
- [ ] Different screen sizes
- [ ] OS version compatibility

## Phase 9: Build & Deployment (Day 25-26)

### Task 9.1: iOS Build Setup
**Configuration:**
- [ ] Bundle identifier
- [ ] Provisioning profiles
- [ ] Code signing
- [ ] App icons
- [ ] Launch screen

### Task 9.2: Android Build Setup
**Configuration:**
- [ ] Package name
- [ ] Keystore generation
- [ ] ProGuard rules
- [ ] App icons
- [ ] Splash screen

### Task 9.3: CI/CD Pipeline
**Setup:**
- [ ] GitHub Actions workflow
- [ ] Automated testing
- [ ] Build automation
- [ ] Beta distribution
- [ ] Release automation

## Phase 10: Launch Preparation (Day 27-28)

### Task 10.1: App Store Preparation
**iOS App Store:**
- [ ] App description
- [ ] Screenshots
- [ ] Privacy policy
- [ ] App preview video
- [ ] TestFlight setup

### Task 10.2: Google Play Preparation
**Google Play Store:**
- [ ] Store listing
- [ ] Screenshots
- [ ] Feature graphic
- [ ] Privacy policy
- [ ] Beta testing track

### Task 10.3: Documentation
**Documents:**
- [ ] User guide
- [ ] API documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Release notes

## Debugging Checklist

### Common Issues:
- [ ] Metro bundler issues → Clear cache: `npx react-native start --reset-cache`
- [ ] iOS build failures → Clean build: `cd ios && pod install && xcodebuild clean`
- [ ] Android build failures → Clean gradle: `cd android && ./gradlew clean`
- [ ] Navigation issues → Check navigation container setup
- [ ] API connection → Verify environment variables and network config

## Code Quality Checklist

### Before Each Commit:
- [ ] TypeScript errors resolved
- [ ] ESLint warnings fixed
- [ ] Console.logs removed
- [ ] Unused imports cleaned
- [ ] Comments added for complex logic
- [ ] File naming consistent
- [ ] No hardcoded values

## Performance Checklist

### Optimization Points:
- [ ] Images optimized and lazy loaded
- [ ] Lists virtualized (FlatList)
- [ ] Memoization applied (useMemo, useCallback)
- [ ] Re-renders minimized
- [ ] Bundle size under 50MB
- [ ] Cold start time < 3 seconds
- [ ] Memory usage monitored

## Security Checklist

### Security Measures:
- [ ] API keys in environment variables
- [ ] Sensitive data encrypted
- [ ] Certificate pinning implemented
- [ ] Biometric authentication secure
- [ ] Network requests over HTTPS
- [ ] Input validation on all forms
- [ ] SQL injection prevention