import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
  category: 'milestone' | 'streak' | 'challenge' | 'progress';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  size = 'medium', 
  onPress 
}) => {
  const badgeSize = size === 'small' ? 40 : size === 'large' ? 80 : 60;
  const fontSize = size === 'small' ? 20 : size === 'large' ? 32 : 24;

  const getBadgeColor = () => {
    switch (achievement.rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9C27B0';
      case 'rare': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component 
      style={[
        styles.container,
        { 
          width: badgeSize, 
          height: badgeSize,
          backgroundColor: achievement.earned ? getBadgeColor() : '#E0E0E0'
        }
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[
        styles.icon, 
        { 
          fontSize, 
          opacity: achievement.earned ? 1 : 0.3 
        }
      ]}>
        {achievement.icon}
      </Text>
      {size !== 'small' && (
        <Text style={[
          styles.title,
          { opacity: achievement.earned ? 1 : 0.5 }
        ]}>
          {achievement.title}
        </Text>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    textAlign: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 8,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
});

export default AchievementBadge;