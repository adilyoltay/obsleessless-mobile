
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { OCDProfileForm } from '@/components/forms/OCDProfileForm';
import { YBOCSAssessment } from '@/components/assessment/YBOCSAssessment';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'intro' | 'feature' | 'profile' | 'assessment';
}

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '🌟 ObsessLess\'e Hoş Geldiniz',
      description: 'OKB yönetimi yolculuğunuz burada başlıyor. Birlikte daha güçlü olacağız.',
      icon: '🏠',
      type: 'intro',
    },
    {
      id: 'tracking',
      title: '📊 İlerlemenizi Takip Edin',
      description: 'Kompulsiyonlarınızı kaydedin, desenlerinizi keşfedin ve zamanla iyileşmenizi görün.',
      icon: '📈',
      type: 'feature',
    },
    {
      id: 'erp',
      title: '💪 ERP Egzersizleri',
      description: 'Maruz kalma ve tepki önleme tekniklerini güvenli bir ortamda pratik yapın.',
      icon: '🧠',
      type: 'feature',
    },
    {
      id: 'community',
      title: '🤝 Destek Topluluğu',
      description: 'Başarılarınızı kutlayın, zorluklarınızı paylaşın ve motivasyonunuzu yüksek tutun.',
      icon: '🎯',
      type: 'feature',
    },
    {
      id: 'assessment',
      title: '📋 Y-BOCS Değerlendirmesi',
      description: 'OKB belirti şiddetinizi değerlendirmek için standart Y-BOCS testini tamamlayın.',
      icon: '📊',
      type: 'assessment',
    },
    {
      id: 'profile',
      title: '👤 OKB Profilinizi Oluşturun',
      description: 'Size özel deneyim sunabilmemiz için OKB profilinizi oluşturalım.',
      icon: '✨',
      type: 'profile',
    },
  ];

  const animateTransition = (direction: 'next' | 'prev') => {
    const toValue = direction === 'next' ? -width : width;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      slideAnim.setValue(direction === 'next' ? width : -width);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      animateTransition('next');
      setCurrentStep(currentStep + 1);
    } else {
      // Son step'ten sonra profile completion kontrolü
      router.replace('/(tabs)');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      animateTransition('prev');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Skip onboarding error:', error);
    }
  };

  const handleProfileComplete = async () => {
    try {
      await AsyncStorage.setItem('profileCompleted', 'true');
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('✅ Profile completed, navigating to main app');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Profile completion save error:', error);
    }
  };

  // Assessment step için özel render
  if (steps[currentStep].type === 'assessment') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Y-BOCS Değerlendirmesi</Text>
          <Text style={styles.headerSubtitle}>
            OKB belirti şiddetinizi değerlendirelim
          </Text>
        </LinearGradient>
        <View style={styles.profileContainer}>
          <YBOCSAssessment 
            onComplete={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              handleNext();
            }} 
          />
        </View>
      </SafeAreaView>
    );
  }

  // Profile step için özel render
  if (steps[currentStep].type === 'profile') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Son Adım!</Text>
          <Text style={styles.headerSubtitle}>
            Size özel deneyim için profilinizi oluşturalım
          </Text>
        </LinearGradient>
        <View style={styles.profileContainer}>
          <OCDProfileForm onComplete={handleProfileComplete} />
        </View>
      </SafeAreaView>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#059669', '#047857']}
        style={styles.background}
      >
        <View style={styles.content}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / steps.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} / {steps.length}
            </Text>
          </View>

          {/* Main Content */}
          <Animated.View 
            style={[
              styles.slideContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              }
            ]}
          >
            <Card style={styles.card}>
              <View style={styles.iconContainer}>
                <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
              </View>
              
              <Text style={styles.title}>{currentStepData.title}</Text>
              <Text style={styles.description}>{currentStepData.description}</Text>

              {/* Feature highlights for feature steps */}
              {currentStepData.type === 'feature' && (
                <View style={styles.featureHighlights}>
                  {currentStepData.id === 'tracking' && (
                    <>
                      <View style={styles.highlight}>
                        <Text style={styles.highlightIcon}>📝</Text>
                        <Text style={styles.highlightText}>Hızlı kompulsiyon kaydı</Text>
                      </View>
                      <View style={styles.highlight}>
                        <Text style={styles.highlightIcon}>📊</Text>
                        <Text style={styles.highlightText}>Detaylı analiz raporları</Text>
                      </View>
                    </>
                  )}
                  {currentStepData.id === 'erp' && (
                    <>
                      <View style={styles.highlight}>
                        <Text style={styles.highlightIcon}>⏱️</Text>
                        <Text style={styles.highlightText}>Zamanlı egzersizler</Text>
                      </View>
                      <View style={styles.highlight}>
                        <Text style={styles.highlightIcon}>📈</Text>
                        <Text style={styles.highlightText}>Anksiyete takibi</Text>
                      </View>
                    </>
                  )}
                  {currentStepData.id === 'community' && (
                    <>
                      <View style={styles.highlight}>
                        <Text style={styles.highlightIcon}>🏆</Text>
                        <Text style={styles.highlightText}>Başarı rozetleri</Text>
                      </View>
                      <View style={styles.highlight}>
                        <Text style={styles.highlightIcon}>🔥</Text>
                        <Text style={styles.highlightText}>Günlük seriler</Text>
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* Step Indicators */}
              <View style={styles.indicators}>
                {steps.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentStep && styles.activeIndicator,
                      index < currentStep && styles.completedIndicator,
                    ]}
                  />
                ))}
              </View>
            </Card>
          </Animated.View>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <View style={styles.buttonRow}>
              {currentStep > 0 && (
                <Button
                  variant="secondary"
                  onPress={handlePrevious}
                  style={styles.prevButton}
                >
                  ← Geri
                </Button>
              )}

              <Button
                variant="ghost"
                onPress={handleSkip}
                style={styles.skipButton}
              >
                Atla
              </Button>

              <Button
                onPress={handleNext}
                style={styles.nextButton}
              >
                {currentStep === steps.length - 1 ? 'Başla' : 'İleri →'}
              </Button>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepIcon: {
    fontSize: 40,
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
    marginBottom: 24,
    lineHeight: 24,
  },
  featureHighlights: {
    width: '100%',
    marginBottom: 24,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  highlightIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  highlightText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  indicators: {
    flexDirection: 'row',
    marginBottom: 8,
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
    width: 24,
  },
  completedIndicator: {
    backgroundColor: '#059669',
  },
  navigationContainer: {
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevButton: {
    flex: 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButton: {
    flex: 0.3,
  },
  nextButton: {
    flex: 0.3,
    backgroundColor: '#FFFFFF',
    color: '#10B981',
  },
  
  // Profile step styles
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
