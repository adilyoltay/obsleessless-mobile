import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { useCompulsions } from '@/hooks/useCompulsions';
import { useTranslation } from '@/hooks/useTranslation';
import StreakCounter from '@/components/gamification/StreakCounter';
import { ScreenLayout } from '@/components/layout/ScreenLayout';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { compulsions, todayStats, weeklyProgress } = useCompulsions();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('dashboard.goodMorning'));
    else if (hour < 18) setGreeting(t('dashboard.goodAfternoon'));
    else setGreeting(t('dashboard.goodEvening'));
  }, [t]);

  const QuickActionCard = ({ 
    title, 
    subtitle, 
    icon, 
    color, 
    onPress,
    badge 
  }: {
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    onPress: () => void;
    badge?: number;
  }) => (
    <TouchableOpacity 
      style={[styles.quickActionCard, { borderLeftColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.quickActionContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon as any} size={24} color={color} />
          {badge && badge > 0 && (
            <View style={[styles.badge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.quickActionText}>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color={Colors.light.icon} 
        />
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ 
    value, 
    label, 
    icon, 
    color,
    trend 
  }: {
    value: string | number;
    label: string;
    icon: string;
    color: string;
    trend?: 'up' | 'down' | 'stable';
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && (
        <View style={styles.trendContainer}>
          <MaterialCommunityIcons 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-neutral'} 
            size={12} 
            color={trend === 'up' ? Colors.light.success : trend === 'down' ? Colors.light.error : Colors.light.icon} 
          />
        </View>
      )}
    </View>
  );

  return (
    <ScreenLayout scrollable={true} backgroundColor={Colors.light.backgroundSecondary}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={Colors.light.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{t('dashboard.welcome')}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialCommunityIcons name="account-circle" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Streak Counter */}
      <View style={styles.streakContainer}>
        <StreakCounter />
      </View>

      {/* Today's Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.todayOverview')}</Text>
        <View style={styles.statsGrid}>
          <StatCard
            value={todayStats?.compulsionCount || 0}
            label={t('dashboard.compulsions')}
            icon="brain"
            color={Colors.light.error}
            trend="down"
          />
          <StatCard
            value={todayStats?.erpMinutes || 0}
            label={t('dashboard.erpMinutes')}
            icon="shield-check"
            color={Colors.light.success}
            trend="up"
          />
          <StatCard
            value={todayStats?.resistanceAvg || 0}
            label={t('dashboard.resistance')}
            icon="chart-line"
            color={Colors.light.info}
            trend="stable"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.quickActionsContainer}>
          <QuickActionCard
            title={t('dashboard.trackCompulsion')}
            subtitle={t('dashboard.logNewEntry')}
            icon="plus-circle"
            color={Colors.light.tint}
            onPress={() => router.push('/tracking')}
          />
          <QuickActionCard
            title={t('dashboard.startERP')}
            subtitle={t('dashboard.beginExercise')}
            icon="play-circle"
            color={Colors.light.success}
            onPress={() => router.push('/erp')}
          />
          <QuickActionCard
            title={t('dashboard.viewProgress')}
            subtitle={t('dashboard.seeAnalytics')}
            icon="chart-arc"
            color={Colors.light.info}
            onPress={() => router.push('/assessment')}
          />
        </View>
      </View>

      {/* Motivational Quote */}
      <View style={styles.motivationCard}>
        <MaterialCommunityIcons 
          name="lightbulb-on" 
          size={24} 
          color={Colors.light.warning} 
        />
        <Text style={styles.motivationText}>
          {t('dashboard.motivationalQuote')}
        </Text>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  greeting: {
    fontSize: Typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.fontWeight.normal,
  },
  userName: {
    fontSize: Typography.fontSize.xxl,
    color: 'white',
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  streakContainer: {
    marginVertical: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.icon,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  trendContainer: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  quickActionsContainer: {
    gap: Spacing.sm,
  },
  quickActionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
  },
  quickActionText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  quickActionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  quickActionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.icon,
    marginTop: Spacing.xs,
  },
  motivationCard: {
    backgroundColor: Colors.light.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.warning + '30',
  },
  motivationText: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});