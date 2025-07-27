
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
import YBOCSAssessment from '@/components/assessment/YBOCSAssessment';

const { width } = Dimensions.get('window');

export default function AssessmentScreen() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<'overview' | 'ybocs' | 'progress'>('overview');

  const SectionCard = ({ 
    title, 
    description, 
    icon, 
    color, 
    onPress,
    isActive = false
  }: {
    title: string;
    description: string;
    icon: string;
    color: string;
    onPress: () => void;
    isActive?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.sectionCard, isActive && { borderColor: color, borderWidth: 2 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[color + '10', color + '05']}
        style={styles.sectionCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.sectionIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={28} color={color} />
      </View>
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionDescription}>{description}</Text>
      </View>
      <MaterialCommunityIcons 
        name="chevron-right" 
        size={20} 
        color={isActive ? color : Colors.light.icon} 
      />
    </TouchableOpacity>
  );

  const ScoreCard = ({ 
    label, 
    score, 
    maxScore, 
    color,
    trend 
  }: {
    label: string;
    score: number;
    maxScore: number;
    color: string;
    trend?: 'up' | 'down' | 'stable';
  }) => {
    const percentage = (score / maxScore) * 100;
    
    return (
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreLabel}>{label}</Text>
          {trend && (
            <MaterialCommunityIcons 
              name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-neutral'} 
              size={16} 
              color={trend === 'up' ? Colors.light.error : trend === 'down' ? Colors.light.success : Colors.light.icon} 
            />
          )}
        </View>
        
        <View style={styles.scoreContent}>
          <Text style={[styles.scoreValue, { color }]}>{score}</Text>
          <Text style={styles.scoreMaxValue}>/{maxScore}</Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
        
        <Text style={styles.scorePercentage}>{percentage.toFixed(0)}%</Text>
      </View>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <View style={styles.overviewContent}>
            <Text style={styles.contentTitle}>{t('assessment.currentScores')}</Text>
            <Text style={styles.contentSubtitle}>
              {t('assessment.lastUpdated')}: 2 gün önce
            </Text>
            
            <View style={styles.scoresGrid}>
              <ScoreCard
                label={t('assessment.obsessions')}
                score={12}
                maxScore={20}
                color={Colors.light.error}
                trend="down"
              />
              <ScoreCard
                label={t('assessment.compulsions')}
                score={14}
                maxScore={20}
                color={Colors.light.warning}
                trend="down"
              />
              <ScoreCard
                label={t('assessment.totalScore')}
                score={26}
                maxScore={40}
                color={Colors.light.info}
                trend="stable"
              />
            </View>

            <View style={styles.insightCard}>
              <MaterialCommunityIcons 
                name="lightbulb-on" 
                size={24} 
                color={Colors.light.success} 
              />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{t('assessment.insight')}</Text>
                <Text style={styles.insightText}>
                  {t('assessment.improvementNotice')}
                </Text>
              </View>
            </View>
          </View>
        );
      
      case 'ybocs':
        return (
          <View style={styles.assessmentContent}>
            <YBOCSAssessment />
          </View>
        );
      
      case 'progress':
        return (
          <View style={styles.progressContent}>
            <Text style={styles.contentTitle}>{t('assessment.progressOverTime')}</Text>
            <Text style={styles.contentSubtitle}>
              {t('assessment.trackingProgress')}
            </Text>
            
            {/* Placeholder for progress charts */}
            <View style={styles.chartPlaceholder}>
              <MaterialCommunityIcons 
                name="chart-line" 
                size={48} 
                color={Colors.light.icon} 
              />
              <Text style={styles.chartPlaceholderText}>
                {t('assessment.chartComingSoon')}
              </Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <ScreenLayout scrollable={false} backgroundColor={Colors.light.backgroundSecondary}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.light.info, '#2563eb']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{t('assessment.title')}</Text>
            <Text style={styles.headerSubtitle}>{t('assessment.subtitle')}</Text>
          </View>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="clipboard-text" size={32} color="white" />
          </View>
        </View>
      </LinearGradient>

      {/* Section Navigation */}
      <View style={styles.navigationSection}>
        <SectionCard
          title={t('assessment.overview')}
          description={t('assessment.viewCurrentScores')}
          icon="chart-donut"
          color={Colors.light.info}
          onPress={() => setActiveSection('overview')}
          isActive={activeSection === 'overview'}
        />
        <SectionCard
          title={t('assessment.ybocs')}
          description={t('assessment.takeAssessment')}
          icon="clipboard-check"
          color={Colors.light.tint}
          onPress={() => setActiveSection('ybocs')}
          isActive={activeSection === 'ybocs'}
        />
        <SectionCard
          title={t('assessment.progress')}
          description={t('assessment.viewTrends')}
          icon="trending-up"
          color={Colors.light.success}
          onPress={() => setActiveSection('progress')}
          isActive={activeSection === 'progress'}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
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
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
    padding: Spacing.md,
  },
  navigationSection: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  sectionCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.icon,
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  overviewContent: {
    padding: Spacing.md,
  },
  assessmentContent: {
    padding: Spacing.md,
  },
  progressContent: {
    padding: Spacing.md,
  },
  contentTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  contentSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.icon,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  scoresGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  scoreCard: {
    backgroundColor: Colors.light.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  scoreLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  scoreValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
  },
  scoreMaxValue: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.icon,
    marginLeft: Spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.accent,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  scorePercentage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.icon,
    textAlign: 'right',
  },
  insightCard: {
    backgroundColor: Colors.light.success + '10',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.success,
  },
  insightContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  insightTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  insightText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.icon,
    lineHeight: 20,
  },
  chartPlaceholder: {
    backgroundColor: Colors.light.card,
    padding: Spacing.xxl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  chartPlaceholderText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.icon,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
