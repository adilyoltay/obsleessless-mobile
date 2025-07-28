
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  level: StreakLevel;
  progress: number;
  nextLevelIn: number;
  todayCompleted: boolean;
  activities: {
    compulsionTracking: boolean;
    erpExercise: boolean;
    dailyGoal: boolean;
  };
}

type StreakLevel = 'beginner' | 'motivated' | 'dedicated' | 'champion' | 'master';

interface StreakCounterProps {
  data: StreakData;
  onActivityPress?: (activity: string) => void;
}

const LEVEL_COLORS = {
  beginner: '#F59E0B',
  motivated: '#10B981', 
  dedicated: '#3B82F6',
  champion: '#8B5CF6',
  master: '#EF4444'
};

const LEVEL_NAMES = {
  beginner: 'Başlangıç',
  motivated: 'Motivasyonlu',
  dedicated: 'Kararlı',
  champion: 'Şampiyon', 
  master: 'Usta'
};

export function StreakCounter({ data, onActivityPress }: StreakCounterProps) {
  const levelColor = LEVEL_COLORS[data.level];
  const levelName = LEVEL_NAMES[data.level];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0FDF4', '#DCFCE7']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🔥 Günlük Seri</Text>
          <View style={[styles.levelBadge, { backgroundColor: levelColor + '20' }]}>
            <Text style={[styles.levelText, { color: levelColor }]}>{levelName}</Text>
          </View>
        </View>

        {/* Streak Numbers */}
        <View style={styles.streakContainer}>
          <View style={styles.streakItem}>
            <Text style={styles.streakNumber}>{data.currentStreak}</Text>
            <Text style={styles.streakLabel}>Günlük Seri</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakNumber}>{data.longestStreak}</Text>
            <Text style={styles.streakLabel}>En Uzun Seri</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            Sonraki seviyeye {data.nextLevelIn} gün
          </Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${data.progress}%`,
                  backgroundColor: levelColor 
                }
              ]} 
            />
          </View>
        </View>

        {/* Today's Activities */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.activitiesTitle}>Bugünkü Hedefler</Text>
          <View style={styles.activitiesGrid}>
            <View style={[
              styles.activityItem,
              data.activities.compulsionTracking && styles.activityCompleted
            ]}>
              <Text style={styles.activityIcon}>📊</Text>
              <Text style={styles.activityText}>Takip</Text>
            </View>
            <View style={[
              styles.activityItem,
              data.activities.erpExercise && styles.activityCompleted
            ]}>
              <Text style={styles.activityIcon}>🛡️</Text>
              <Text style={styles.activityText}>ERP</Text>
            </View>
            <View style={[
              styles.activityItem,
              data.activities.dailyGoal && styles.activityCompleted
            ]}>
              <Text style={styles.activityIcon}>🎯</Text>
              <Text style={styles.activityText}>Hedef</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'Inter',
  },
  streakLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  activitiesContainer: {
    marginTop: 4,
  },
  activitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  activitiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityCompleted: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  activityIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter',
  },
});
