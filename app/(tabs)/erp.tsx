
import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Dimensions,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Native Paper Components
import { Card, Button } from 'react-native-paper';

// Custom UI Components
import { Slider } from '@/components/ui/Slider';

// Feature Components
import { ERPTimer } from '@/components/erp/ERPTimer';
import { ERPExerciseLibrary } from '@/components/erp/ERPExerciseLibrary';

// Hooks & Utils
import { useTranslation } from '@/hooks/useTranslation';

const { width } = Dimensions.get('window');

// ERP Exercise Categories - Master Prompt aligned
const ERP_CATEGORIES = [
  {
    id: 'contamination',
    title: 'Bulaşma/Temizlik',
    icon: 'hand-wash',
    color: '#3B82F6',
    exercises: [
      'Kapı kollarına dokunma',
      'Ortak kullanım alanları',
      'Para ve metal eşyalar'
    ]
  },
  {
    id: 'checking',
    title: 'Kontrol Etme',
    icon: 'lock-check',
    color: '#10B981',
    exercises: [
      'Kapı kilidi kontrolü',
      'Elektrikli aletler',
      'Önemli belgeler'
    ]
  },
  {
    id: 'symmetry',
    title: 'Simetri/Düzen',
    icon: 'vector-arrange-below',
    color: '#8B5CF6',
    exercises: [
      'Eşya dizilimi',
      'Çift sayılar',
      'Dengeli hareket'
    ]
  },
  {
    id: 'thoughts',
    title: 'Düşünce Maruziyeti',
    icon: 'brain',
    color: '#F59E0B',
    exercises: [
      'Endişe senaryoları',
      'Olumsuz düşünceler',
      'Belirsizlik kabulü'
    ]
  }
];

export default function ERPScreen() {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<'library' | 'session'>('library');
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState({
    startTime: null as Date | null,
    duration: 0,
    initialAnxiety: 5,
    currentAnxiety: 5,
    anxietyHistory: [] as Array<{time: number, level: number}>
  });

  const [todayStats, setTodayStats] = useState({
    completed: 0,
    totalTime: 0,
    averageAnxiety: 0
  });

  useEffect(() => {
    loadTodayStats();
  }, []);

  const loadTodayStats = async () => {
    try {
      const today = new Date().toDateString();
      const data = await AsyncStorage.getItem(`erp_stats_${today}`);
      if (data) {
        setTodayStats(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading ERP stats:', error);
    }
  };

  const startERPSession = (exercise: any) => {
    setSelectedExercise(exercise);
    setSessionActive(true);
    setActiveView('session');
    setSessionData({
      startTime: new Date(),
      duration: 0,
      initialAnxiety: 5,
      currentAnxiety: 5,
      anxietyHistory: [{ time: 0, level: 5 }]
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const updateAnxiety = (level: number) => {
    setSessionData(prev => ({
      ...prev,
      currentAnxiety: level,
      anxietyHistory: [
        ...prev.anxietyHistory,
        { time: prev.duration, level }
      ]
    }));
  };

  const pauseSession = () => {
    setSessionActive(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const completeSession = async () => {
    try {
      // Save session data
      const today = new Date().toDateString();
      const sessions = await AsyncStorage.getItem(`erp_sessions_${today}`);
      const currentSessions = sessions ? JSON.parse(sessions) : [];
      
      const newSession = {
        id: Date.now().toString(),
        exercise: selectedExercise,
        duration: sessionData.duration,
        startTime: sessionData.startTime,
        endTime: new Date(),
        initialAnxiety: sessionData.initialAnxiety,
        finalAnxiety: sessionData.currentAnxiety,
        anxietyHistory: sessionData.anxietyHistory
      };

      currentSessions.push(newSession);
      await AsyncStorage.setItem(`erp_sessions_${today}`, JSON.stringify(currentSessions));

      // Update stats
      const newStats = {
        completed: todayStats.completed + 1,
        totalTime: todayStats.totalTime + sessionData.duration,
        averageAnxiety: (todayStats.averageAnxiety + sessionData.currentAnxiety) / 2
      };
      setTodayStats(newStats);
      await AsyncStorage.setItem(`erp_stats_${today}`, JSON.stringify(newStats));

      // Reset session
      setSessionActive(false);
      setSelectedExercise(null);
      setActiveView('library');
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        'Tebrikler! 🎉',
        'ERP oturumunuzu başarıyla tamamladınız. Bu büyük bir adım!',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('Error saving ERP session:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>ERP Egzersizleri</Text>
      <Text style={styles.headerSubtitle}>
        Maruz kalma ve tepki önleme egzersizleri
      </Text>
      
      {/* Today's Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{todayStats.completed}</Text>
          <Text style={styles.statLabel}>Tamamlanan</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{Math.round(todayStats.totalTime / 60)}dk</Text>
          <Text style={styles.statLabel}>Toplam Süre</Text>
        </View>
      </View>
    </View>
  );

  const renderERPLibrary = () => (
    <ScrollView style={styles.libraryContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Egzersiz Kategorileri</Text>
      
      {ERP_CATEGORIES.map((category) => (
        <Card key={category.id} style={styles.categoryCard}>
          <Card.Content style={styles.categoryContent}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                <MaterialCommunityIcons 
                  name={category.icon as any} 
                  size={28} 
                  color={category.color} 
                />
              </View>
              <View style={styles.categoryText}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>
                  {category.exercises.length} egzersiz mevcut
                </Text>
              </View>
            </View>
            
            <View style={styles.exerciseList}>
              {category.exercises.map((exercise, index) => (
                <Pressable
                  key={index}
                  style={styles.exerciseItem}
                  onPress={() => startERPSession({ category: category.title, name: exercise, color: category.color })}
                >
                  <Text style={styles.exerciseItemName}>{exercise}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
                </Pressable>
              ))}
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  const renderERPSession = () => (
    <View style={styles.sessionContainer}>
      {/* Master Prompt: Minimalist design with only 3 main elements */}
      
      {/* 1. Exercise Info & Safe Exit */}
      <View style={styles.sessionHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseCategory}>{selectedExercise?.category}</Text>
          <Text style={styles.exerciseName}>{selectedExercise?.name}</Text>
        </View>
        
        <Pressable style={styles.pauseButton} onPress={pauseSession}>
          <MaterialCommunityIcons name="pause" size={24} color="#6B7280" />
        </Pressable>
      </View>

      {/* 2. Circular Timer (Kronometre) */}
      <View style={styles.timerContainer}>
        <ERPTimer
          exerciseId={selectedExercise?.name}
          onComplete={completeSession}
        />
      </View>

      {/* 3. Vertical Anxiety Slider */}
      <View style={styles.anxietyContainer}>
        <Text style={styles.anxietyLabel}>Anksiyete Seviyesi</Text>
        <View style={styles.anxietySliderContainer}>
          <Text style={styles.anxietyValue}>{sessionData.currentAnxiety}/10</Text>
          <Slider
            value={sessionData.currentAnxiety}
            onValueChange={(value) => updateAnxiety(value)}
            minimumValue={1}
            maximumValue={10}
            step={1}
            thumbStyle={styles.sliderThumb}
            trackStyle={styles.sliderTrack}
          />
        </View>
        
        {/* Master Prompt: Single-line supportive microcopy */}
        <Text style={styles.supportText}>
          {sessionData.currentAnxiety <= 3 
            ? "Harika! Anksiyeten azalıyor. 🌱"
            : sessionData.currentAnxiety <= 6
            ? "Bu normal. Nefes almaya devam et. 💚"
            : "Bu zorluğun üstesinden geliyorsun. 💪"
          }
        </Text>
      </View>

      {/* Complete Session Button */}
      <View style={styles.sessionActions}>
        <Button
          onPress={completeSession}
          style={[styles.completeButton, { backgroundColor: selectedExercise?.color || '#10B981' }] as any}
        >
          <Text style={styles.completeButtonText}>Oturumu Tamamla</Text>
        </Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {activeView === 'library' ? (
        <>
          {renderHeader()}
          {renderERPLibrary()}
        </>
      ) : (
        renderERPSession()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  libraryContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginVertical: 16,
    fontFamily: 'Inter',
  },
  categoryCard: {
    marginBottom: 16,
  },
  categoryContent: {
    padding: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },
  exerciseList: {
    gap: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  exerciseItemName: {
    fontSize: 15,
    color: '#374151',
    fontFamily: 'Inter',
  },
  sessionContainer: {
    flex: 1,
    padding: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  anxietyContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  anxietyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  anxietySliderContainer: {
    alignItems: 'center',
    width: '100%',
  },
  anxietyValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  sliderThumb: {
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
  },
  sliderTrack: {
    backgroundColor: '#E5E7EB',
    height: 4,
  },
  supportText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
    fontFamily: 'Inter',
    fontStyle: 'italic',
  },
  sessionActions: {
    marginTop: 'auto',
  },
  completeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});
