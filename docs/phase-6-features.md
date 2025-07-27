# Phase 6: Feature Implementation (Day 14-18)

## Overview
This phase focuses on implementing the core features of ObsessLess in React Native, including compulsion tracking, ERP exercises, gamification system, and user settings.

## Prerequisites
- Completed Phase 1-5 (Project setup, Navigation, UI Components, State Management, Firebase)
- All API services and hooks configured
- Authentication flow working
- Firebase services integrated

## Tasks Overview

### Task 6.1: Compulsion Tracking
**Duration**: 1.5 days
**Dependencies**: API services, UI components, state management

### Task 6.2: ERP Exercises
**Duration**: 1.5 days
**Dependencies**: Timer functionality, API services, UI components

### Task 6.3: Gamification System
**Duration**: 1 day
**Dependencies**: User data, achievement logic, notification system

### Task 6.4: Settings & Profile
**Duration**: 1 day
**Dependencies**: Auth context, language context, storage services

## Detailed Implementation

### Task 6.1: Compulsion Tracking Implementation

#### 1. Compulsion Form Component
```typescript
// src/components/forms/CompulsionForm.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Slider } from '../ui';
import { useCreateCompulsion } from '../../hooks/useCompulsions';
import { useLanguage } from '../../contexts/LanguageContext';

const compulsionSchema = z.object({
  type: z.string().min(1, 'Kompulsiyon tipi gerekli'),
  severity: z.number().min(1).max(10),
  resistanceLevel: z.number().min(1).max(10),
  duration: z.number().min(1),
  trigger: z.string().optional(),
  notes: z.string().optional(),
});

type CompulsionFormData = z.infer<typeof compulsionSchema>;

const COMPULSION_TYPES = [
  { value: 'washing', label: 'Yıkama/Temizlik' },
  { value: 'checking', label: 'Kontrol Etme' },
  { value: 'counting', label: 'Sayma' },
  { value: 'ordering', label: 'Düzenleme/Sıralama' },
  { value: 'hoarding', label: 'Biriktirme' },
  { value: 'mental', label: 'Zihinsel Ritüeller' },
  { value: 'reassurance', label: 'Güvence Arama' },
  { value: 'avoidance', label: 'Kaçınma' },
  { value: 'other', label: 'Diğer' },
];

export const CompulsionForm: React.FC = () => {
  const { t } = useLanguage();
  const { mutate: createCompulsion, isPending } = useCreateCompulsion();

  const { control, handleSubmit, reset } = useForm<CompulsionFormData>({
    resolver: zodResolver(compulsionSchema),
    defaultValues: {
      severity: 5,
      resistanceLevel: 5,
      duration: 5,
    },
  });

  const onSubmit = (data: CompulsionFormData) => {
    createCompulsion(
      { ...data, timestamp: new Date() },
      {
        onSuccess: () => {
          reset();
          // Show success toast
        },
      }
    );
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Select
              label={t('compulsion.type')}
              value={value}
              onChange={onChange}
              options={COMPULSION_TYPES}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="severity"
          render={({ field: { onChange, value } }) => (
            <View style={styles.sliderContainer}>
              <Text style={styles.label}>{t('compulsion.severity')}</Text>
              <Slider
                value={value}
                onValueChange={onChange}
                minimumValue={1}
                maximumValue={10}
                step={1}
              />
              <Text style={styles.sliderValue}>{value}/10</Text>
            </View>
          )}
        />

        <Controller
          control={control}
          name="resistanceLevel"
          render={({ field: { onChange, value } }) => (
            <View style={styles.sliderContainer}>
              <Text style={styles.label}>{t('compulsion.resistance')}</Text>
              <Slider
                value={value}
                onValueChange={onChange}
                minimumValue={1}
                maximumValue={10}
                step={1}
              />
              <Text style={styles.sliderValue}>{value}/10</Text>
            </View>
          )}
        />

        <Controller
          control={control}
          name="duration"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input
              label={t('compulsion.duration')}
              value={value.toString()}
              onChangeText={(text) => onChange(parseInt(text) || 0)}
              keyboardType="numeric"
              error={error?.message}
              placeholder={t('compulsion.durationPlaceholder')}
            />
          )}
        />

        <Controller
          control={control}
          name="trigger"
          render={({ field: { onChange, value } }) => (
            <Input
              label={t('compulsion.trigger')}
              value={value}
              onChangeText={onChange}
              placeholder={t('compulsion.triggerPlaceholder')}
              multiline
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <Input
              label={t('compulsion.notes')}
              value={value}
              onChangeText={onChange}
              placeholder={t('compulsion.notesPlaceholder')}
              multiline
              numberOfLines={3}
            />
          )}
        />

        <Button
          title={t('common.save')}
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};
```

#### 2. Compulsion History Screen
```typescript
// src/screens/compulsions/CompulsionHistoryScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useCompulsions } from '../../hooks/useCompulsions';
import { CompulsionCard } from '../../components/compulsions/CompulsionCard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { FilterChips } from '../../components/ui/FilterChips';
import { ExportButton } from '../../components/common/ExportButton';

export const CompulsionHistoryScreen: React.FC = () => {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  const { data: compulsions, isLoading } = useCompulsions({
    dateRange,
    types: selectedTypes,
  });

  const handleExport = async () => {
    // Generate CSV and share
    const csv = generateCSV(compulsions);
    await shareCSV(csv);
  };

  return (
    <View style={styles.container}>
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
      />
      
      <FilterChips
        options={COMPULSION_TYPES}
        selected={selectedTypes}
        onChange={setSelectedTypes}
      />

      <View style={styles.header}>
        <Text style={styles.count}>
          {compulsions?.length || 0} kayıt
        </Text>
        <ExportButton onPress={handleExport} />
      </View>

      <FlatList
        data={compulsions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CompulsionCard compulsion={item} />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};
```

### Task 6.2: ERP Exercises Implementation

#### 1. ERP Session Timer Component
```typescript
// src/components/erp/ERPSessionTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Button } from '../ui';
import { useKeepAwake } from 'react-native-keep-awake';

interface Props {
  onComplete: (duration: number) => void;
  targetDuration: number;
}

export const ERPSessionTimer: React.FC<Props> = ({ onComplete, targetDuration }) => {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useKeepAwake(); // Keep screen awake during session

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min(seconds / targetDuration, 1);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.timerCircle,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      </Animated.View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%` },
          ]}
        />
      </View>

      <View style={styles.controls}>
        <Button
          title={isPaused ? 'Devam Et' : 'Duraklat'}
          onPress={() => setIsPaused(!isPaused)}
          variant="secondary"
        />
        <Button
          title="Bitir"
          onPress={() => onComplete(seconds)}
          variant="primary"
        />
      </View>
    </View>
  );
};
```

#### 2. Anxiety Tracking Component
```typescript
// src/components/erp/AnxietyTracker.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

interface Props {
  onValueChange: (value: number) => void;
  label: string;
}

export const AnxietyTracker: React.FC<Props> = ({ onValueChange, label }) => {
  const [value, setValue] = useState(5);

  const handleChange = (newValue: number) => {
    setValue(newValue);
    onValueChange(newValue);
    
    // Haptic feedback
    if (newValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getColor = (value: number) => {
    if (value <= 3) return '#10B981'; // Green
    if (value <= 6) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.value}>0</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={value}
          onValueChange={handleChange}
          minimumTrackTintColor={getColor(value)}
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor={getColor(value)}
        />
        <Text style={styles.value}>10</Text>
      </View>
      <Text style={[styles.currentValue, { color: getColor(value) }]}>
        Anksiyete Seviyesi: {value}
      </Text>
    </View>
  );
};
```

### Task 6.3: Gamification System

#### 1. Streak Counter Implementation
```typescript
// src/components/gamification/StreakCounter.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useStreak } from '../../hooks/useStreak';
import LottieView from 'lottie-react-native';

export const StreakCounter: React.FC = () => {
  const { currentStreak, bestStreak, isNewRecord } = useStreak();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef<LottieView>(null);

  useEffect(() => {
    if (isNewRecord) {
      // Celebration animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      confettiRef.current?.play();
    }
  }, [isNewRecord]);

  const getStreakLevel = (days: number) => {
    if (days >= 100) return { emoji: '👑', label: 'Efsanevi' };
    if (days >= 50) return { emoji: '🏆', label: 'Usta' };
    if (days >= 30) return { emoji: '🥇', label: 'Şampiyon' };
    if (days >= 7) return { emoji: '⚔️', label: 'Savaşçı' };
    return { emoji: '🌱', label: 'Başlangıç' };
  };

  const level = getStreakLevel(currentStreak);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.streakCircle,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.emoji}>{level.emoji}</Text>
        <Text style={styles.streakNumber}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>Gün</Text>
      </Animated.View>

      <Text style={styles.levelLabel}>{level.label}</Text>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>En İyi</Text>
          <Text style={styles.statValue}>{bestStreak} gün</Text>
        </View>
      </View>

      {isNewRecord && (
        <LottieView
          ref={confettiRef}
          source={require('../../assets/animations/confetti.json')}
          style={styles.confetti}
          loop={false}
        />
      )}
    </View>
  );
};
```

#### 2. Achievement Badges System
```typescript
// src/components/gamification/AchievementBadges.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useAchievements } from '../../hooks/useAchievements';
import { Badge } from '../ui';
import * as Haptics from 'expo-haptics';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

export const AchievementBadges: React.FC = () => {
  const { achievements, unlockAchievement } = useAchievements();

  const handleBadgePress = (achievement: Achievement) => {
    if (!achievement.unlocked) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Show achievement details
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#6B7280',
      uncommon: '#10B981',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B',
      mythic: '#EF4444',
    };
    return colors[rarity] || '#6B7280';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Başarılar</Text>
      
      <FlatList
        data={achievements}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleBadgePress(item)}
            disabled={!item.unlocked}
            style={styles.badgeContainer}
          >
            <Badge
              icon={item.icon}
              unlocked={item.unlocked}
              color={getRarityColor(item.rarity)}
            />
            <Text
              style={[
                styles.badgeTitle,
                !item.unlocked && styles.lockedTitle,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
```

### Task 6.4: Settings & Profile Management

#### 1. OCD Profile Form
```typescript
// src/components/profile/OCDProfileForm.tsx
import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { CheckBox, Button, Select } from '../ui';
import { useUpdateProfile } from '../../hooks/useProfile';

interface OCDProfileData {
  obsessionTypes: string[];
  compulsionTypes: string[];
  severity: 'mild' | 'moderate' | 'severe';
  onsetAge: number;
  treatmentHistory: string[];
  medications: string[];
  triggers: string[];
  goals: string[];
}

const OBSESSION_TYPES = [
  { id: 'contamination', label: 'Kirlenme/Bulaşma' },
  { id: 'harm', label: 'Zarar Verme' },
  { id: 'symmetry', label: 'Simetri/Düzen' },
  { id: 'forbidden', label: 'Yasak Düşünceler' },
  { id: 'religious', label: 'Dini Obsesyonlar' },
  { id: 'somatic', label: 'Bedensel Obsesyonlar' },
];

export const OCDProfileForm: React.FC = () => {
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { control, handleSubmit } = useForm<OCDProfileData>();

  const onSubmit = (data: OCDProfileData) => {
    updateProfile(data);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Obsesyon Tipleri</Text>
      <Controller
        control={control}
        name="obsessionTypes"
        render={({ field: { onChange, value = [] } }) => (
          <View>
            {OBSESSION_TYPES.map((type) => (
              <CheckBox
                key={type.id}
                label={type.label}
                checked={value.includes(type.id)}
                onPress={() => {
                  const newValue = value.includes(type.id)
                    ? value.filter((v) => v !== type.id)
                    : [...value, type.id];
                  onChange(newValue);
                }}
              />
            ))}
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Şiddet Seviyesi</Text>
      <Controller
        control={control}
        name="severity"
        render={({ field: { onChange, value } }) => (
          <Select
            value={value}
            onChange={onChange}
            options={[
              { value: 'mild', label: 'Hafif' },
              { value: 'moderate', label: 'Orta' },
              { value: 'severe', label: 'Şiddetli' },
            ]}
          />
        )}
      />

      <Button
        title="Profili Güncelle"
        onPress={handleSubmit(onSubmit)}
        loading={isPending}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};
```

#### 2. Settings Screen Implementation
```typescript
// src/screens/settings/SettingsScreen.tsx
import React from 'react';
import { ScrollView, View, Text, Switch } from 'react-native';
import { List } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { useNotifications } from '../../hooks/useNotifications';

export const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { isEnabled: biometricEnabled, toggle: toggleBiometric } = useBiometricAuth();
  const { enabled: notificationsEnabled, toggle: toggleNotifications } = useNotifications();

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Hesap</List.Subheader>
        <List.Item
          title="Profil"
          description={user?.email}
          left={(props) => <List.Icon {...props} icon="account" />}
          onPress={() => navigation.navigate('Profile')}
        />
        <List.Item
          title="OKB Profili"
          description="Obsesyon ve kompulsiyon bilgileri"
          left={(props) => <List.Icon {...props} icon="brain" />}
          onPress={() => navigation.navigate('OCDProfile')}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Tercihler</List.Subheader>
        <List.Item
          title="Dil"
          description={language === 'tr' ? 'Türkçe' : 'English'}
          left={(props) => <List.Icon {...props} icon="translate" />}
          right={() => (
            <Switch
              value={language === 'en'}
              onValueChange={(value) => setLanguage(value ? 'en' : 'tr')}
            />
          )}
        />
        <List.Item
          title="Bildirimler"
          description="Hatırlatıcılar ve bildirimler"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
            />
          )}
        />
        <List.Item
          title="Biyometrik Giriş"
          description="Face ID / Touch ID ile giriş"
          left={(props) => <List.Icon {...props} icon="fingerprint" />}
          right={() => (
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
            />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Veri Yönetimi</List.Subheader>
        <List.Item
          title="Verileri Dışa Aktar"
          description="Tüm verilerinizi CSV olarak indirin"
          left={(props) => <List.Icon {...props} icon="download" />}
          onPress={handleExportData}
        />
        <List.Item
          title="Verileri Yedekle"
          description="Buluta yedekleme"
          left={(props) => <List.Icon {...props} icon="cloud-upload" />}
          onPress={handleBackupData}
        />
      </List.Section>

      <List.Section>
        <List.Item
          title="Çıkış Yap"
          left={(props) => <List.Icon {...props} icon="logout" color="#EF4444" />}
          onPress={signOut}
          titleStyle={{ color: '#EF4444' }}
        />
      </List.Section>
    </ScrollView>
  );
};
```

## Testing Guidelines

### Unit Tests
- Test form validations
- Test data transformations
- Test gamification logic
- Test export functionality

### Integration Tests
- Test feature flows end-to-end
- Test data persistence
- Test API integrations
- Test navigation between features

### User Testing
- Test with real OCD patients
- Gather feedback on usability
- Test accessibility features
- Measure feature engagement

## Performance Considerations

1. **List Performance**
   - Use FlatList for long lists
   - Implement getItemLayout when possible
   - Use keyExtractor properly
   - Avoid inline functions in renderItem

2. **Animation Performance**
   - Use native driver when possible
   - Avoid complex animations on low-end devices
   - Test on various devices
   - Profile with Flipper

3. **Data Management**
   - Implement pagination
   - Cache frequently accessed data
   - Optimize image sizes
   - Minimize re-renders

## Common Issues & Solutions

### Issue 1: Slider performance on Android
**Solution**: Use react-native-gesture-handler version

### Issue 2: Timer accuracy in background
**Solution**: Use background tasks or notifications

### Issue 3: Large data export crashes
**Solution**: Implement chunked processing

## Checklist

- [ ] Compulsion tracking fully functional
- [ ] ERP exercises with timer working
- [ ] Anxiety tracking smooth
- [ ] Gamification features engaging
- [ ] Achievements unlocking correctly
- [ ] Settings persisting properly
- [ ] Profile management complete
- [ ] Language switching working
- [ ] Data export functional
- [ ] All features tested
- [ ] Performance optimized
- [ ] Accessibility implemented

## Next Steps
After completing Phase 6:
1. Test all features thoroughly
2. Gather user feedback
3. Fix any critical bugs
4. Proceed to Phase 7 (Polish & Optimization)