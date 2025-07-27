
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Chip, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';

export interface Achievement {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  category: 'tracking' | 'erp' | 'streak' | 'milestone';
  requirement: number;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  unlockedAchievements: string[];
  streakDays: number;
  totalCompulsions: number;
  totalERPSessions: number;
  totalERPMinutes: number;
}

const ACHIEVEMENTS: Achievement[] = [
  // Tracking Achievements
  {
    id: 'first_track',
    titleKey: 'achievements.firstTrack.title',
    descriptionKey: 'achievements.firstTrack.desc',
    icon: '🎯',
    category: 'tracking',
    requirement: 1,
    points: 10,
    isUnlocked: false,
    progress: 0,
    rarity: 'common'
  },
  {
    id: 'track_7_days',
    titleKey: 'achievements.track7Days.title', 
    descriptionKey: 'achievements.track7Days.desc',
    icon: '📅',
    category: 'tracking',
    requirement: 7,
    points: 50,
    isUnlocked: false,
    progress: 0,
    rarity: 'rare'
  },
  {
    id: 'track_30_days',
    titleKey: 'achievements.track30Days.title',
    descriptionKey: 'achievements.track30Days.desc', 
    icon: '🗓️',
    category: 'tracking',
    requirement: 30,
    points: 200,
    isUnlocked: false,
    progress: 0,
    rarity: 'epic'
  },

  // ERP Achievements
  {
    id: 'first_erp',
    titleKey: 'achievements.firstERP.title',
    descriptionKey: 'achievements.firstERP.desc',
    icon: '🛡️',
    category: 'erp',
    requirement: 1,
    points: 25,
    isUnlocked: false,
    progress: 0,
    rarity: 'common'
  },
  {
    id: 'erp_10_sessions',
    titleKey: 'achievements.erp10Sessions.title',
    descriptionKey: 'achievements.erp10Sessions.desc',
    icon: '💪',
    category: 'erp',
    requirement: 10,
    points: 100,
    isUnlocked: false,
    progress: 0,
    rarity: 'rare'
  },
  {
    id: 'erp_100_minutes',
    titleKey: 'achievements.erp100Minutes.title',
    descriptionKey: 'achievements.erp100Minutes.desc',
    icon: '⏱️',
    category: 'erp',
    requirement: 100,
    points: 150,
    isUnlocked: false,
    progress: 0,
    rarity: 'epic'
  },

  // Streak Achievements
  {
    id: 'streak_3',
    titleKey: 'achievements.streak3.title',
    descriptionKey: 'achievements.streak3.desc',
    icon: '🔥',
    category: 'streak',
    requirement: 3,
    points: 30,
    isUnlocked: false,
    progress: 0,
    rarity: 'common'
  },
  {
    id: 'streak_7',
    titleKey: 'achievements.streak7.title',
    descriptionKey: 'achievements.streak7.desc',
    icon: '🌟',
    category: 'streak',
    requirement: 7,
    points: 75,
    isUnlocked: false,
    progress: 0,
    rarity: 'rare'
  },
  {
    id: 'streak_30',
    titleKey: 'achievements.streak30.title',
    descriptionKey: 'achievements.streak30.desc',
    icon: '👑',
    category: 'streak',
    requirement: 30,
    points: 300,
    isUnlocked: false,
    progress: 0,
    rarity: 'legendary'
  }
];

export function AchievementSystem() {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    level: 1,
    unlockedAchievements: [],
    streakDays: 0,
    totalCompulsions: 0,
    totalERPSessions: 0,
    totalERPMinutes: 0
  });
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem('userProgress');
      if (stored) {
        const progress = JSON.parse(stored);
        setUserProgress(progress);
        updateAchievementProgress(progress);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const updateAchievementProgress = (progress: UserProgress) => {
    const updatedAchievements = achievements.map(achievement => {
      let currentProgress = 0;
      
      switch (achievement.category) {
        case 'tracking':
          currentProgress = progress.totalCompulsions;
          break;
        case 'erp':
          if (achievement.id === 'erp_100_minutes') {
            currentProgress = progress.totalERPMinutes;
          } else {
            currentProgress = progress.totalERPSessions;
          }
          break;
        case 'streak':
          currentProgress = progress.streakDays;
          break;
      }

      const isUnlocked = currentProgress >= achievement.requirement || 
                        progress.unlockedAchievements.includes(achievement.id);

      return {
        ...achievement,
        progress: Math.min(currentProgress, achievement.requirement),
        isUnlocked,
        unlockedAt: isUnlocked && !achievement.unlockedAt ? new Date() : achievement.unlockedAt
      };
    });

    setAchievements(updatedAchievements);
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FF9800';
      default: return '#666';
    }
  };

  const getRarityGradient = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return ['#4CAF50', '#66BB6A'];
      case 'rare': return ['#2196F3', '#42A5F5'];
      case 'epic': return ['#9C27B0', '#BA68C8'];
      case 'legendary': return ['#FF9800', '#FFB74D'];
      default: return ['#666', '#888'];
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.isUnlocked;
    if (filter === 'locked') return !achievement.isUnlocked;
    return true;
  });

  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };

  const progressToNextLevel = (points: number) => {
    const currentLevelPoints = (calculateLevel(points) - 1) * 100;
    const nextLevelPoints = calculateLevel(points) * 100;
    return (points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints);
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Progress Header */}
      <Card style={styles.progressCard}>
        <LinearGradient
          colors={['#1976D2', '#42A5F5']}
          style={styles.progressHeader}
        >
          <View style={styles.levelInfo}>
            <Avatar.Text 
              size={60} 
              label={`${calculateLevel(userProgress.totalPoints)}`}
              style={styles.levelAvatar}
            />
            <View style={styles.levelText}>
              <Text style={styles.levelTitle}>
                {t('achievements.level')} {calculateLevel(userProgress.totalPoints)}
              </Text>
              <Text style={styles.pointsText}>
                {userProgress.totalPoints} {t('achievements.points')}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Card>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.filterChip}
        >
          {t('achievements.all')}
        </Chip>
        <Chip
          selected={filter === 'unlocked'}
          onPress={() => setFilter('unlocked')}
          style={styles.filterChip}
        >
          {t('achievements.unlocked')} ({achievements.filter(a => a.isUnlocked).length})
        </Chip>
        <Chip
          selected={filter === 'locked'}
          onPress={() => setFilter('locked')}
          style={styles.filterChip}
        >
          {t('achievements.locked')} ({achievements.filter(a => !a.isUnlocked).length})
        </Chip>
      </View>

      {/* Achievements List */}
      {filteredAchievements.map(achievement => (
        <Card 
          key={achievement.id} 
          style={[
            styles.achievementCard,
            !achievement.isUnlocked && styles.lockedCard
          ]}
        >
          <LinearGradient
            colors={achievement.isUnlocked ? 
              getRarityGradient(achievement.rarity) : 
              ['#F5F5F5', '#E0E0E0']
            }
            style={styles.achievementHeader}
          >
            <View style={styles.achievementIcon}>
              <Text style={styles.iconText}>{achievement.icon}</Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementTitle,
                !achievement.isUnlocked && styles.lockedText
              ]}>
                {t(achievement.titleKey)}
              </Text>
              <Text style={[
                styles.achievementDescription,
                !achievement.isUnlocked && styles.lockedText
              ]}>
                {t(achievement.descriptionKey)}
              </Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsValue}>+{achievement.points}</Text>
            </View>
          </LinearGradient>
          
          <Card.Content style={styles.achievementContent}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {achievement.progress}/{achievement.requirement}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${(achievement.progress / achievement.requirement) * 100}%`,
                      backgroundColor: getRarityColor(achievement.rarity)
                    }
                  ]} 
                />
              </View>
            </View>
            
            <Chip
              compact
              style={[
                styles.rarityChip,
                { backgroundColor: getRarityColor(achievement.rarity) }
              ]}
              textStyle={styles.rarityText}
            >
              {t(`achievements.rarity.${achievement.rarity}`)}
            </Chip>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  progressCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 4,
  },
  progressHeader: {
    padding: 20,
    borderRadius: 12,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  levelText: {
    marginLeft: 16,
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  pointsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  achievementCard: {
    margin: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementHeader: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  achievementDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  lockedText: {
    color: '#666',
  },
  pointsBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  achievementContent: {
    padding: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  rarityChip: {
    alignSelf: 'flex-start',
  },
  rarityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
