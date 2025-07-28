import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Dimensions,
  Pressable,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Native Paper Components
import { Card, Button } from 'react-native-paper';

// Custom UI Components
import { BottomSheet } from '@/components/ui/BottomSheet';

// Feature Components  
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { AchievementSystem } from '@/components/gamification/AchievementSystem';
import { CompulsionQuickEntry } from '@/components/forms/CompulsionQuickEntry';

// Hooks & Utils
import { useTranslation } from '@/hooks/useTranslation';

const { width } = Dimensions.get('window');

// Recommendation card data
const RECOMMENDATIONS = [
  {
    id: 'erp_exercise',
    title: 'ERP Egzersizi Dene',
    subtitle: 'Bugünkü anksiyeteni azalt',
    icon: 'shield-check',
    color: '#10B981',
    action: 'erp'
  },
  {
    id: 'log_mood',
    title: 'Ruh Halini Kaydet', 
    subtitle: 'Duygularını takip et',
    icon: 'heart-outline',
    color: '#F59E0B',
    action: 'mood'
  },
  {
    id: 'breathing',
    title: 'Nefes Egzersizi',
    subtitle: '5 dakikalık sakinlik',
    icon: 'lungs',
    color: '#3B82F6',
    action: 'breathing'
  }
];

export default function TodayScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Dashboard metrics
  const [todayStats, setTodayStats] = useState({
    compulsions: 0,
    erpSessions: 0,
    moodEntries: 0,
    currentStreak: 7
  });
  
  const [dailyGoal, setDailyGoal] = useState(3);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toDateString();
      
      // Load today's compulsions
      const compulsionData = await AsyncStorage.getItem(`compulsions_${today}`);
      const compulsions = compulsionData ? JSON.parse(compulsionData) : [];
      
      // Load ERP sessions
      const erpData = await AsyncStorage.getItem(`erp_sessions_${today}`);
      const erpSessions = erpData ? JSON.parse(erpData) : [];
      
      // Load mood entries  
      const moodData = await AsyncStorage.getItem(`mood_${today}`);
      const moodEntries = moodData ? JSON.parse(moodData) : [];
      
      // Load streak
      const streakData = await AsyncStorage.getItem('current_streak');
      const currentStreak = streakData ? parseInt(streakData) : 7;

      setTodayStats({
        compulsions: compulsions.length,
        erpSessions: erpSessions.length,
        moodEntries: moodEntries.length,
        currentStreak
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(false);
  };

  const handleQuickEntryComplete = () => {
    setShowQuickEntry(false);
    loadDashboardData();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleRecommendationPress = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (action) {
      case 'erp':
        // Navigate to ERP screen
        break;
      case 'mood':
        setShowQuickEntry(true);
        break;
      case 'breathing':
        // Start breathing exercise
        break;
    }
  };

  const toggleAchievements = () => {
    setShowAchievements(!showAchievements);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const calculateProgress = () => {
    return Math.min((todayStats.erpSessions / dailyGoal) * 100, 100);
  };

  const renderWelcomeHeader = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeText}>Merhaba! 👋</Text>
      <Text style={styles.dateText}>
        {new Date().toLocaleDateString('tr-TR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })}
      </Text>
    </View>
  );

  const renderStreakCard = () => {
    const streakData = {
      currentStreak: todayStats.currentStreak,
      longestStreak: 14, // Mock data
      level: {
        id: 'beginner',
        name: 'Başlangıç',
        emoji: '🌱',
        minDays: 0,
        maxDays: 7,
        color: ['#10B981', '#059669'],
        benefits: ['Temel takip']
      },
      progress: calculateProgress(),
      nextLevelIn: 3,
      todayCompleted: todayStats.erpSessions > 0,
      activities: {
        compulsionTracking: todayStats.compulsions > 0,
        erpExercise: todayStats.erpSessions > 0,
        dailyGoal: todayStats.erpSessions >= dailyGoal
      }
    };

    return (
      <Card style={styles.streakCard}>
        <Card.Content style={styles.streakContent}>
          <StreakCounter 
            data={streakData}
            onActivityPress={(activity) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (activity === 'compulsionTracking') {
                setShowQuickEntry(true);
              }
            }}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderDailySummary = () => (
    <Card style={styles.summaryCard}>
      <Card.Content style={styles.summaryContent}>
        <Text style={styles.summaryTitle}>Bugünkü Özet</Text>
        
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="brain" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.metricNumber}>{todayStats.compulsions}</Text>
            <Text style={styles.metricLabel}>Kompulsiyon</Text>
          </View>
          
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: '#D1FAE5' }]}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#10B981" />
            </View>
            <Text style={styles.metricNumber}>{todayStats.erpSessions}</Text>
            <Text style={styles.metricLabel}>ERP Oturumu</Text>
          </View>
          
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: '#DBEAFE' }]}>
              <MaterialCommunityIcons name="heart" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.metricNumber}>{todayStats.moodEntries}</Text>
            <Text style={styles.metricLabel}>Ruh Hali</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecommendations = () => (
    <View style={styles.recommendationsContainer}>
      <Text style={styles.sectionTitle}>Bugün İçin Öneriler</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendationsScroll}
      >
        {RECOMMENDATIONS.map((rec) => (
          <Pressable
            key={rec.id}
            style={styles.recommendationCard}
            onPress={() => handleRecommendationPress(rec.action)}
          >
            <View style={[styles.recIcon, { backgroundColor: `${rec.color}20` }]}>
              <MaterialCommunityIcons 
                name={rec.icon as any} 
                size={28} 
                color={rec.color} 
              />
            </View>
            <Text style={styles.recTitle}>{rec.title}</Text>
            <Text style={styles.recSubtitle}>{rec.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderAchievementsPanel = () => (
    <Card style={styles.achievementsCard}>
      <Card.Content>
        <Pressable 
          style={styles.achievementsHeader}
          onPress={toggleAchievements}
        >
        <View style={styles.achievementsHeaderContent}>
          <MaterialCommunityIcons 
            name="trophy" 
            size={24} 
            color="#F97316" 
          />
          <Text style={styles.achievementsTitle}>Mikro Ödüller & Başarımlar</Text>
        </View>
        <MaterialCommunityIcons 
          name={showAchievements ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#6B7280" 
        />
      </Pressable>
      
      {showAchievements && (
        <View style={styles.achievementsContent}>
          <AchievementSystem />
        </View>
      )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeHeader()}
        {renderStreakCard()}
        {renderDailySummary()}
        {renderRecommendations()}
        {renderAchievementsPanel()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button - Master Prompt requirement */}
      <Pressable
        style={styles.fab}
        onPress={() => setShowQuickEntry(true)}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </Pressable>

      {/* Quick Entry Bottom Sheet */}
      <BottomSheet
        isVisible={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
      >
        <CompulsionQuickEntry
          onSave={handleQuickEntryComplete}
          onCancel={() => setShowQuickEntry(false)}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  welcomeContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter',
  },
  dateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  streakCard: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  streakContent: {
    padding: 24,
    alignItems: 'center',
  },
  streakText: {
    alignItems: 'center',
    marginTop: 16,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter',
  },
  streakLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryContent: {
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 16,
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  recommendationsScroll: {
    paddingHorizontal: 16,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  recSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  achievementsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  achievementsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  achievementsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90, // Above tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSpacing: {
    height: 100, // Space for FAB
  },
});