import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { OCDProfileForm } from '@/components/forms/OCDProfileForm';

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  const steps = [
    {
      title: 'ObsessLess\'e Hoş Geldiniz',
      description: 'OKB yönetimi yolculuğunuz burada başlıyor.',
      type: 'intro',
    },
    {
      title: 'İlerlemenizi Takip Edin',
      description: 'Kompulsiyonlarınızı izleyin ve zamanla iyileşmenizi görün.',
      type: 'feature',
    },
    {
      title: 'ERP Egzersizleri',
      description: 'Maruz kalma ve tepki önleme tekniklerini pratik yapın.',
      type: 'feature',
    },
    {
      title: 'OKB Profilinizi Oluşturun',
      description: 'Size daha iyi destek sağlayabilmemiz için OKB profilinizi oluşturalım.',
      type: 'profile',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Son step'ten sonra profile completion kontrolü
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    // Skip ile direkt ana sayfaya gidebilir, profile sonra doldurulabilir
    router.replace('/(tabs)');
  };

  const handleProfileComplete = async () => {
    // Profile tamamlandığında ana sayfaya yönlendir
    try {
      await AsyncStorage.setItem('profileCompleted', 'true');
      console.log('✅ Profile completed, navigating to main app');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Profile completion save error:', error);
    }
  };

  // Profile step için özel render
  if (steps[currentStep].type === 'profile') {
    return (
      <SafeAreaView style={styles.container}>
        <OCDProfileForm />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.description}>{steps[currentStep].description}</Text>

          <View style={styles.indicators}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentStep && styles.activeIndicator,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttons}>
            <Button
              variant="secondary"
              onPress={handleSkip}
              style={styles.skipButton}
            >
              Atla
            </Button>

            <Button
              onPress={handleNext}
              style={styles.nextButton}
            >
              {currentStep === steps.length - 2
                ? 'Profil Oluştur'
                : currentStep === steps.length - 1 
                ? 'Başla'
                : 'İleri'
              }
            </Button>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
  },
  indicators: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#10B981',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
});