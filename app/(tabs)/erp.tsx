
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import ERPTimer from '@/components/erp/ERPTimer';
import ERPExerciseLibrary from '@/components/erp/ERPExerciseLibrary';

const { width } = Dimensions.get('window');

export default function ERPScreen() {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<'exercises' | 'timer'>('exercises');
  const [selectedExercise, setSelectedExercise] = useState(null);

  const ViewButton = ({ 
    view, 
    label, 
    icon, 
    isActive 
  }: {
    view: 'exercises' | 'timer';
    label: string;
    icon: string;
    isActive: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.viewButton, isActive && styles.viewButtonActive]}
      onPress={() => setActiveView(view)}
      activeOpacity={0.7}
    >
      {isActive && (
        <LinearGradient
          colors={[Colors.light.success, '#059669']}
          style={styles.viewButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <MaterialCommunityIcons
        name={icon as any}
        size={24}
        color={isActive ? 'white' : Colors.light.icon}
      />
      <Text style={[styles.viewButtonText, isActive && styles.viewButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: string;
    color: string;
  }) => (
    <View style={styles.statsCard}>
      <View style={[styles.statsIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
      <Text style={styles.statsSubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <ScreenLayout scrollable={false} backgroundColor={Colors.light.backgroundSecondary}>
      {/* Header with Progress */}
      <LinearGradient
        colors={[Colors.light.success, '#059669']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{t('erp.title')}</Text>
            <Text style={styles.headerSubtitle}>{t('erp.subtitle')}</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>15</Text>
              <Text style={styles.headerStatLabel}>{t('erp.sessions')}</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>240</Text>
              <Text style={styles.headerStatLabel}>{t('erp.minutes')}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Weekly Progress Cards */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>{t('erp.weeklyProgress')}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.progressScrollContainer}
        >
          <StatsCard
            title={t('erp.totalTime')}
            value="45m"
            subtitle={t('erp.thisWeek')}
            icon="clock-outline"
            color={Colors.light.info}
          />
          <StatsCard
            title={t('erp.avgAnxiety')}
            value="6.2"
            subtitle={t('erp.decreased')}
            icon="trending-down"
            color={Colors.light.success}
          />
          <StatsCard
            title={t('erp.resistance')}
            value="8.1"
            subtitle={t('erp.improved')}
            icon="shield-check"
            color={Colors.light.warning}
          />
        </ScrollView>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <ViewButton
          view="exercises"
          label={t('erp.exercises')}
          icon="format-list-bulleted"
          isActive={activeView === 'exercises'}
        />
        <ViewButton
          view="timer"
          label={t('erp.session')}
          icon="play-circle"
          isActive={activeView === 'timer'}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeView === 'exercises' ? (
          <ERPExerciseLibrary 
            onExerciseSelect={(exercise) => {
              setSelectedExercise(exercise);
              setActiveView('timer');
            }}
          />
        ) : (
          <ERPTimer selectedExercise={selectedExercise} />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginHorizontal: -Spacing.md,
    marginTop: -Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: Spacing.xs,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerStatItem: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: 'white',
  },
  headerStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: Spacing.md,
  },
  progressSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  progressScrollContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  statsCard: {
    backgroundColor: Colors.light.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    minWidth: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statsValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  statsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  statsSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.icon,
    textAlign: 'center',
    marginTop: 2,
  },
  viewToggle: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.accent,
    position: 'relative',
    overflow: 'hidden',
  },
  viewButtonActive: {
    backgroundColor: 'transparent',
  },
  viewButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  viewButtonText: {
    marginLeft: Spacing.xs,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.icon,
  },
  viewButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
});
