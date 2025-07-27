
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, Chip } from 'react-native-paper';
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

interface StreakLevel {
  id: string;
  name: string;
  emoji: string;
  minDays: number;
  maxDays: number;
  color: string[];
  benefits: string[];
}

const STREAK_LEVELS: StreakLevel[] = [
  {
    id: 'beginner',
    name: 'Başlangıç',
    emoji: '🌱',
    minDays: 1,
    maxDays: 7,
    color: ['#a8e6cf', '#88d8a3'],
    benefits: ['İlk adımları attınız', 'Farkındalık kazanıyorsunuz']
  },
  {
    id: 'warrior',
    name: 'Savaşçı',
    emoji: '⚔️',
    minDays: 8,
    maxDays: 21,
    color: ['#ffd3a5', '#fd9853'],
    benefits: ['Alışkanlık oluşturuyor', 'Direnç kazanıyorsunuz']
  },
  {
    id: 'champion',
    name: 'Şampiyon',
    emoji: '🥇',
    minDays: 22,
    maxDays: 49,
    color: ['#a8edea', '#fed6e3'],
    benefits: ['Güçlü rutinler', 'Belirgin ilerleme']
  },
  {
    id: 'master',
    name: 'Usta',
    emoji: '🏆',
    minDays: 50,
    maxDays: 89,
    color: ['#ffecd2', '#fcb69f'],
    benefits: ['Yaşam tarzı değişimi', 'Uzun süreli başarı']
  },
  {
    id: 'legendary',
    name: 'Efsanevi',
    emoji: '👑',
    minDays: 90,
    maxDays: 999,
    color: ['#667eea', '#764ba2'],
    benefits: ['Tam yaşam dönüşümü', 'İlham verici başarı']
  }
];

interface StreakCounterProps {
  data: StreakData;
  onActivityPress?: (activity: string) => void;
}

export function StreakCounter({ data, onActivityPress }: StreakCounterProps) {
  const { currentStreak, level, progress, nextLevelIn, activities, todayCompleted } = data;

  const getActivityIcon = (activity: string, completed: boolean) => {
    const icons = {
      compulsionTracking: completed ? '✅' : '⏱️',
      erpExercise: completed ? '✅' : '🛡️',
      dailyGoal: completed ? '✅' : '🎯'
    };
    return icons[activity as keyof typeof icons] || '❓';
  };

  const getActivityName = (activity: string) => {
    const names = {
      compulsionTracking: 'Kompulsiyon Takibi',
      erpExercise: 'ERP Egzersizi',
      dailyGoal: 'Günlük Hedef'
    };
    return names[activity as keyof typeof names] || activity;
  };

  return (
    <Card style={styles.container}>
      <LinearGradient
        colors={level.color}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>{level.emoji}</Text>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>Günlük Seri</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelName}>{level.name}</Text>
            <Text style={styles.nextLevel}>
              {nextLevelIn > 0 ? `${nextLevelIn} gün kaldı` : 'Maksimum seviye!'}
            </Text>
          </View>
        </View>

        {nextLevelIn > 0 && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Sonraki Seviyeye İlerleme</Text>
            <ProgressBar 
              progress={progress} 
              style={styles.progressBar}
              color="rgba(255,255,255,0.9)"
            />
          </View>
        )}
      </LinearGradient>

      <Card.Content style={styles.content}>
        <Text style={styles.todayTitle}>
          {todayCompleted ? '🎉 Bugünün Görevleri Tamamlandı!' : '📋 Bugünün Görevleri'}
        </Text>
        
        <View style={styles.activitiesContainer}>
          {Object.entries(activities).map(([activity, completed]) => (
            <Chip
              key={activity}
              icon={() => <Text>{getActivityIcon(activity, completed)}</Text>}
              style={[
                styles.activityChip,
                completed ? styles.completedActivity : styles.pendingActivity
              ]}
              textStyle={completed ? styles.completedText : styles.pendingText}
              onPress={() => onActivityPress?.(activity)}
            >
              {getActivityName(activity)}
            </Chip>
          ))}
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>🌟 Seviye Faydaları</Text>
          {level.benefits.map((benefit, index) => (
            <Text key={index} style={styles.benefit}>
              • {benefit}
            </Text>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  streakLabel: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    opacity: 0.9,
  },
  levelInfo: {
    alignItems: 'flex-end',
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  nextLevel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: 'white',
    marginBottom: 4,
    opacity: 0.9,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    paddingTop: 16,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  activitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  activityChip: {
    marginVertical: 4,
    marginHorizontal: 2,
  },
  completedActivity: {
    backgroundColor: '#d4edda',
  },
  pendingActivity: {
    backgroundColor: '#f8f9fa',
  },
  completedText: {
    color: '#155724',
  },
  pendingText: {
    color: '#6c757d',
  },
  benefitsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  benefit: {
    fontSize: 13,
    lineHeight: 18,
    color: '#495057',
    marginBottom: 2,
  },
});
