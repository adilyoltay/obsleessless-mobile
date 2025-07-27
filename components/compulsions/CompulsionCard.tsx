import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Icon } from 'react-native-paper';
import { CompulsionEntry } from '@/types/compulsion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getCompulsionCategory,
  getIntensityLevel,
  getResistanceLevel,
  getMoodLevel
} from '@/constants/compulsions';

interface Props {
  entry: CompulsionEntry;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export function CompulsionCard({ entry, onPress, onEdit, onDelete, compact = false }: Props) {
  const { language } = useLanguage();
  
  const category = getCompulsionCategory(entry.type);
  const intensityLevel = getIntensityLevel(entry.intensity);
  const resistanceLevel = getResistanceLevel(entry.resistanceLevel);
  const mood = getMoodLevel(entry.mood || 'neutral');
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getDurationText = () => {
    if (!entry.duration) return '';
    const minutes = entry.duration;
    if (minutes < 60) return `${minutes}dk`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}s ${remainingMinutes}dk` : `${hours}s`;
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={!onPress}
      style={styles.container}
    >
      <Card style={[styles.card, compact && styles.compactCard]}>
        <Card.Content style={styles.content}>
          {/* Header Row */}
          <View style={styles.header}>
            <View style={styles.categorySection}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Text style={styles.categoryIconText}>{category.icon}</Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text variant="titleSmall" style={styles.categoryName}>
                  {language === 'tr' ? category.name : category.nameEn}
                </Text>
                <Text variant="bodySmall" style={styles.timestamp}>
                  {formatDate(entry.timestamp)} • {formatTime(entry.timestamp)}
                </Text>
              </View>
            </View>
            
            {/* Action Buttons */}
            {(onEdit || onDelete) && (
              <View style={styles.actions}>
                {onEdit && (
                  <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                    <Icon source="pencil" size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                    <Icon source="delete" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text variant="bodySmall" style={styles.metricLabel}>Şiddet</Text>
              <View style={styles.metricValue}>
                <View style={[styles.levelBar, { backgroundColor: intensityLevel.color }]}>
                  <View 
                    style={[styles.levelFill, { 
                      width: `${(entry.intensity / 10) * 100}%`,
                      backgroundColor: intensityLevel.color 
                    }]} 
                  />
                </View>
                <Text variant="bodySmall" style={[styles.levelText, { color: intensityLevel.color }]}>
                  {entry.intensity}/10
                </Text>
              </View>
            </View>

            <View style={styles.metric}>
              <Text variant="bodySmall" style={styles.metricLabel}>Direnç</Text>
              <View style={styles.metricValue}>
                <View style={[styles.levelBar, { backgroundColor: resistanceLevel.color }]}>
                  <View 
                    style={[styles.levelFill, { 
                      width: `${(entry.resistanceLevel / 10) * 100}%`,
                      backgroundColor: resistanceLevel.color 
                    }]} 
                  />
                </View>
                <Text variant="bodySmall" style={[styles.levelText, { color: resistanceLevel.color }]}>
                  {entry.resistanceLevel}/10
                </Text>
              </View>
            </View>

            {entry.duration && (
              <View style={styles.metric}>
                <Text variant="bodySmall" style={styles.metricLabel}>Süre</Text>
                <Text variant="bodySmall" style={styles.durationText}>
                  {getDurationText()}
                </Text>
              </View>
            )}
          </View>

          {/* Details Row */}
          {!compact && (
            <View style={styles.detailsRow}>
              {/* Mood */}
              <Chip 
                mode="outlined" 
                compact 
                style={[styles.chip, { borderColor: mood.color }]}
                textStyle={{ color: mood.color, fontSize: 11 }}
              >
                {mood.emoji} {language === 'tr' ? mood.label : mood.labelEn}
              </Chip>

              {/* Completion Status */}
              <Chip 
                mode="outlined" 
                compact 
                style={[styles.chip, { 
                  borderColor: entry.completed ? '#10B981' : '#F59E0B',
                  backgroundColor: entry.completed ? '#ECFDF5' : '#FEF3C7'
                }]}
                textStyle={{ 
                  color: entry.completed ? '#065F46' : '#92400E', 
                  fontSize: 11 
                }}
              >
                {entry.completed ? '✓ Tamamlandı' : '⏸ Durduruldu'}
              </Chip>

              {/* Help Used */}
              {entry.helpUsed && (
                <Chip 
                  mode="outlined" 
                  compact 
                  style={[styles.chip, { 
                    borderColor: '#8B5CF6',
                    backgroundColor: '#F3E8FF'
                  }]}
                  textStyle={{ color: '#5B21B6', fontSize: 11 }}
                >
                  🛡 Yardım
                </Chip>
              )}
            </View>
          )}

          {/* Triggers */}
          {!compact && entry.triggers && entry.triggers.length > 0 && (
            <View style={styles.triggersRow}>
              <Text variant="bodySmall" style={styles.triggersLabel}>
                Tetikleyiciler:
              </Text>
              <View style={styles.triggersContainer}>
                {entry.triggers.slice(0, 3).map((trigger, index) => (
                  <Chip 
                    key={index}
                    mode="outlined" 
                    compact 
                    style={styles.triggerChip}
                    textStyle={{ fontSize: 10 }}
                  >
                    {trigger}
                  </Chip>
                ))}
                {entry.triggers.length > 3 && (
                  <Text variant="bodySmall" style={styles.moreText}>
                    +{entry.triggers.length - 3} daha
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Notes */}
          {!compact && entry.notes && (
            <View style={styles.notesRow}>
              <Text variant="bodySmall" style={styles.notesText} numberOfLines={2}>
                💭 {entry.notes}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
      );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  compactCard: {
    elevation: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 18,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  timestamp: {
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    color: '#6B7280',
    marginBottom: 4,
    fontSize: 11,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  levelFill: {
    height: '100%',
    borderRadius: 2,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 30,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    height: 24,
  },
  triggersRow: {
    marginBottom: 8,
  },
  triggersLabel: {
    color: '#6B7280',
    marginBottom: 4,
    fontSize: 11,
  },
  triggersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  triggerChip: {
    height: 20,
    backgroundColor: '#F9FAFB',
  },
  moreText: {
    color: '#6B7280',
    fontSize: 10,
    fontStyle: 'italic',
  },
  notesRow: {
    marginTop: 4,
  },
  notesText: {
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});