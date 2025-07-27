
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Badge, Avatar, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Achievement } from '@/services/achievementService';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onPress?: () => void;
}

export function AchievementBadge({ 
  achievement, 
  size = 'medium', 
  showProgress = true,
  onPress 
}: AchievementBadgeProps) {
  const sizeConfig = {
    small: { 
      iconSize: 32, 
      fontSize: 12, 
      padding: 8,
      titleSize: 14,
      descSize: 10
    },
    medium: { 
      iconSize: 48, 
      fontSize: 14, 
      padding: 12,
      titleSize: 16,
      descSize: 12
    },
    large: { 
      iconSize: 64, 
      fontSize: 16, 
      padding: 16,
      titleSize: 18,
      descSize: 14
    },
  };

  const config = sizeConfig[size];
  const progressPercentage = achievement.target > 0 ? achievement.currentProgress / achievement.target : 0;

  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'common': return '#10B981';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getRarityIcon = () => {
    switch (achievement.rarity) {
      case 'common': return 'star';
      case 'rare': return 'star-four-points';
      case 'epic': return 'crown';
      case 'legendary': return 'diamond';
      default: return 'star';
    }
  };

  const component = (
    <Card 
      style={[
        styles.container, 
        { opacity: achievement.isUnlocked ? 1 : 0.6 },
        achievement.isUnlocked && { borderColor: getRarityColor(), borderWidth: 2 }
      ]} 
      mode={achievement.isUnlocked ? 'elevated' : 'outlined'}
    >
      <Card.Content style={[styles.content, { padding: config.padding }]}>
        {/* Header with Icon and Rarity */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={[styles.achievementIcon, { fontSize: config.iconSize }]}>
              {achievement.icon}
            </Text>
            {achievement.isUnlocked && (
              <View style={[styles.unlockedBadge, { backgroundColor: getRarityColor() }]}>
                <MaterialCommunityIcons 
                  name="check" 
                  size={12} 
                  color="white" 
                />
              </View>
            )}
          </View>
          
          <View style={styles.rarityContainer}>
            <Badge 
              style={[styles.rarityBadge, { backgroundColor: getRarityColor() }]}
              size={16}
            >
              <MaterialCommunityIcons 
                name={getRarityIcon()} 
                size={12} 
                color="white" 
              />
            </Badge>
            <Text style={[styles.pointsText, { fontSize: config.fontSize - 2 }]}>
              {achievement.points} pts
            </Text>
          </View>
        </View>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text 
            style={[
              styles.title, 
              { 
                fontSize: config.titleSize,
                color: achievement.isUnlocked ? '#1F2937' : '#6B7280'
              }
            ]}
            numberOfLines={2}
          >
            {achievement.title}
          </Text>
          
          <Text 
            style={[
              styles.description, 
              { 
                fontSize: config.descSize,
                color: achievement.isUnlocked ? '#4B5563' : '#9CA3AF'
              }
            ]}
            numberOfLines={3}
          >
            {achievement.description}
          </Text>
        </View>

        {/* Progress Bar */}
        {showProgress && !achievement.isUnlocked && achievement.type !== 'special' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {achievement.currentProgress} / {achievement.target}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage * 100)}%
              </Text>
            </View>
            <ProgressBar 
              progress={progressPercentage} 
              color={achievement.color}
              style={styles.progressBar}
            />
          </View>
        )}

        {/* Unlock Date */}
        {achievement.isUnlocked && achievement.unlockedAt && (
          <View style={styles.unlockedContainer}>
            <MaterialCommunityIcons name="calendar" size={12} color="#6B7280" />
            <Text style={styles.unlockedDate}>
              {new Date(achievement.unlockedAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        )}

        {/* Category Badge */}
        <View style={styles.categoryContainer}>
          <Badge 
            style={[styles.categoryBadge, { backgroundColor: achievement.color }]}
          >
            {achievement.category.toUpperCase()}
          </Badge>
        </View>
      </Card.Content>
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        {component}
      </TouchableOpacity>
    );
  }

  return component;
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
  },
  container: {
    marginBottom: 12,
    minHeight: 120,
  },
  content: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    position: 'relative',
  },
  achievementIcon: {
    textAlign: 'center',
  },
  unlockedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  rarityContainer: {
    alignItems: 'flex-end',
  },
  rarityBadge: {
    marginBottom: 4,
  },
  pointsText: {
    fontWeight: '600',
    color: '#6B7280',
  },
  textContainer: {
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    lineHeight: 16,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  unlockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  unlockedDate: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  categoryContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  categoryBadge: {
    opacity: 0.8,
  },
});
