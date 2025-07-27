
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { ERPExerciseLibrary } from '@/components/erp/ERPExerciseLibrary';
import { ERPTimer } from '@/components/erp/ERPTimer';
import { useTranslation } from '@/hooks/useTranslation';
import { useERPExercises, useERPSessionHistory } from '@/hooks/useERP';

export default function ERPScreen() {
  const { t } = useTranslation();
  const { data: exercises } = useERPExercises();
  const [activeExercise, setActiveExercise] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [todaySessions, setTodaySessions] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      // TODO: Implement proper ERP progress loading with React Query
      setProgress({ completed: 2, total: 5 });
      setTodaySessions(1);
    } catch (error) {
      console.error('Error loading ERP progress:', error);
    }
  };

  const handleExerciseSelect = (exercise: any) => {
    setActiveExercise(exercise);
  };

  const handleExerciseComplete = () => {
    setActiveExercise(null);
    loadProgress();
  };

  if (activeExercise) {
    return (
      <ScreenLayout scrollable={false} backgroundColor="#FAFAFA">
        <ERPTimer
          exercise={activeExercise}
          onComplete={handleExerciseComplete}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable backgroundColor="#FAFAFA">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Overview */}
        <Card style={styles.progressCard} mode="elevated">
          <Card.Content>
            <View style={styles.progressHeader}>
              <MaterialCommunityIcons name="target" size={32} color="#3B82F6" />
              <View style={styles.progressText}>
                <Title style={styles.progressTitle}>ERP İlerlemen</Title>
                <Paragraph style={styles.progressSubtitle}>
                  Bugün {todaySessions} egzersiz tamamladın
                </Paragraph>
              </View>
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Paragraph style={styles.statValue}>{progress.completed}</Paragraph>
                <Paragraph style={styles.statLabel}>Tamamlanan</Paragraph>
              </View>
              <View style={styles.progressBarContainer}>
                <ProgressBar 
                  progress={progress.total > 0 ? progress.completed / progress.total : 0} 
                  color="#3B82F6"
                  style={styles.progressBar}
                />
                <Paragraph style={styles.progressPercent}>
                  {progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%
                </Paragraph>
              </View>
              <View style={styles.statItem}>
                <Paragraph style={styles.statValue}>{progress.total}</Paragraph>
                <Paragraph style={styles.statLabel}>Toplam</Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Start */}
        <Card style={styles.quickStartCard} mode="elevated">
          <Card.Content>
            <Title style={styles.cardTitle}>Hızlı Başlangıç</Title>
            <Paragraph style={styles.cardDescription}>
              Öncelikli egzersizlerinize hızla başlayın
            </Paragraph>
            
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="play"
                onPress={() => handleExerciseSelect({
                  id: 'quick-basic',
                  title: 'Temel ERP',
                  description: '5 dakikalık temel egzersiz',
                  duration: 300,
                  difficulty: 'easy'
                })}
                style={[styles.quickButton, { backgroundColor: '#10B981' }]}
                contentStyle={styles.buttonContent}
              >
                Temel ERP
              </Button>
              
              <Button
                mode="contained"
                icon="lightning-bolt"
                onPress={() => handleExerciseSelect({
                  id: 'quick-intensive',
                  title: 'Yoğun ERP',
                  description: '10 dakikalık yoğun egzersiz',
                  duration: 600,
                  difficulty: 'hard'
                })}
                style={[styles.quickButton, { backgroundColor: '#F59E0B' }]}
                contentStyle={styles.buttonContent}
              >
                Yoğun ERP
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Difficulty Levels */}
        <Card style={styles.levelsCard} mode="elevated">
          <Card.Content>
            <Title style={styles.cardTitle}>Zorluk Seviyeleri</Title>
            <View style={styles.levelChips}>
              <Chip 
                icon="leaf" 
                style={[styles.levelChip, { backgroundColor: '#D1FAE5' }]}
                textStyle={{ color: '#047857' }}
              >
                Kolay
              </Chip>
              <Chip 
                icon="trending-up" 
                style={[styles.levelChip, { backgroundColor: '#FEF3C7' }]}
                textStyle={{ color: '#92400E' }}
              >
                Orta
              </Chip>
              <Chip 
                icon="fire" 
                style={[styles.levelChip, { backgroundColor: '#FEE2E2' }]}
                textStyle={{ color: '#DC2626' }}
              >
                Zor
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Exercise Library */}
        <View style={styles.libraryContainer}>
          <ERPExerciseLibrary onExerciseSelect={handleExerciseSelect} />
        </View>

        {/* Tips Card */}
        <Card style={styles.tipsCard} mode="elevated">
          <Card.Content>
            <View style={styles.tipHeader}>
              <MaterialCommunityIcons name="lightbulb" size={20} color="#F59E0B" />
              <Title style={styles.tipTitle}>ERP İpuçları</Title>
            </View>
            <View style={styles.tipsList}>
              <Paragraph style={styles.tipText}>
                • ERP egzersizlerini düzenli olarak yapın
              </Paragraph>
              <Paragraph style={styles.tipText}>
                • Anksiyetenizin doğal olarak azalmasını bekleyin
              </Paragraph>
              <Paragraph style={styles.tipText}>
                • Kompülsiyonlarınıza direnin ve sabırlı olun
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    marginLeft: 16,
    flex: 1,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  quickStartCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  levelsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  levelChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  levelChip: {
    borderRadius: 20,
  },
  libraryContainer: {
    marginTop: 8,
  },
  tipsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 24,
    backgroundColor: '#FEF3C7',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});
