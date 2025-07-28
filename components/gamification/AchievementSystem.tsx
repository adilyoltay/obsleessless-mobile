
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'tracking' | 'erp' | 'streak' | 'milestone';
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementSystemProps {
  onAchievementPress?: (achievement: Achievement) => void;
  maxVisible?: number;
}

const RARITY_COLORS = {
  common: '#10B981',
  rare: '#3B82F6', 
  epic: '#8B5CF6',
  legendary: '#F59E0B'
};

const RARITY_NAMES = {
  common: 'Yaygın',
  rare: 'Nadir',
  epic: 'Destansı', 
  legendary: 'Efsanevi'
};

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_track',
    title: 'İlk Adım',
    description: 'İlk kompulsiyon kaydınızı yapın',
    icon: '🎯',
    category: 'tracking',
    unlocked: true,
    unlockedAt: new Date(),
    progress: 1,
    maxProgress: 1,
    rarity: 'common'
  },
  {
    id: 'week_warrior',
    title: 'Hafta Savaşçısı',
    description: '7 gün üst üste takip yapın',
    icon: '⚔️',
    category: 'streak',
    unlocked: false,
    progress: 3,
    maxProgress: 7,
    rarity: 'rare'
  },
  {
    id: 'erp_master',
    title: 'ERP Ustası',
    description: '10 ERP egzersizi tamamlayın',
    icon: '🛡️',
    category: 'erp',
    unlocked: false,
    progress: 2,
    maxProgress: 10,
    rarity: 'epic'
  }
];

export function AchievementSystem({ onAchievementPress, maxVisible = 3 }: AchievementSystemProps) {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const stored = await AsyncStorage.getItem('achievements');
      if (stored) {
        setAchievements(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const saveAchievements = async (newAchievements: Achievement[]) => {
    try {
      await AsyncStorage.setItem('achievements', JSON.stringify(newAchievements));
      setAchievements(newAchievements);
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  };

  const renderAchievement = (achievement: Achievement) => {
    const rarityColor = RARITY_COLORS[achievement.rarity];
    const rarityName = RARITY_NAMES[achievement.rarity];
    const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

    return (
      <Pressable
        key={achievement.id}
        style={[
          styles.achievementCard,
          achievement.unlocked && styles.unlockedCard,
          { borderLeftColor: rarityColor }
        ]}
        onPress={() => onAchievementPress?.(achievement)}
      >
        <View style={styles.achievementHeader}>
          <Text style={[
            styles.achievementIcon, 
            !achievement.unlocked && styles.lockedIcon
          ]}>
            {achievement.unlocked ? achievement.icon : '🔒'}
          </Text>
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementTitle,
              !achievement.unlocked && styles.lockedText
            ]}>
              {achievement.title}
            </Text>
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
              <Text style={[styles.rarityText, { color: rarityColor }]}>
                {rarityName}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[
          styles.achievementDescription,
          !achievement.unlocked && styles.lockedText
        ]}>
          {achievement.description}
        </Text>

        {!achievement.unlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: rarityColor 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress}/{achievement.maxProgress}
            </Text>
          </View>
        )}

        {achievement.unlocked && achievement.unlockedAt && (
          <Text style={styles.unlockedDate}>
            🎉 {new Date(achievement.unlockedAt).toLocaleDateString('tr-TR')} tarihinde kazanıldı
          </Text>
        )}
      </Pressable>
    );
  };

  const visibleAchievements = achievements.slice(0, maxVisible);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Başarımlar</Text>
        <Text style={styles.counter}>
          {unlockedCount}/{achievements.length}
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {visibleAchievements.map(renderAchievement)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  counter: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontFamily: 'Inter',
  },
  scrollContainer: {
    paddingHorizontal: 4,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unlockedCard: {
    backgroundColor: '#F0FDF4',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  lockedText: {
    opacity: 0.6,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    fontFamily: 'Inter',
  },
  unlockedDate: {
    fontSize: 12,
    color: '#10B981',
    fontStyle: 'italic',
    marginTop: 4,
    fontFamily: 'Inter',
  },
});
