import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Dimensions,
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CompulsionSummary } from '@/components/compulsions/CompulsionSummary';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { AchievementSystem } from '@/components/gamification/AchievementSystem';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { CompulsionQuickEntry } from '@/components/forms/CompulsionQuickEntry';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CompulsionEntry } from '@/types/compulsion';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [compulsions, setCompulsions] = useState<CompulsionEntry[]>([]);
  const [dailyGoal, setDailyGoal] = useState(3);
  const [todayEntries, setTodayEntries] = useState(0);

  const loadData = async () => {
    try {
      // Load compulsions
      const compulsionData = await AsyncStorage.getItem('compulsionEntries');
      const allCompulsions: CompulsionEntry[] = compulsionData ? JSON.parse(compulsionData) : [];
      setCompulsions(allCompulsions);

      // Calculate today's entries
      const today = new Date().toDateString();
      const todayCompulsions = allCompulsions.filter(
        c => new Date(c.timestamp).toDateString() === today
      );
      setTodayEntries(todayCompulsions.length);

      // Load daily goal
      const goalData = await AsyncStorage.getItem('dailyGoal');
      if (goalData) {
        setDailyGoal(parseInt(goalData));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleQuickEntryComplete = () => {
    setShowQuickEntry(false);
    loadData(); // Refresh data
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const progressPercentage = Math.min((todayEntries / dailyGoal) * 100, 100);

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.appTitle}>ObsessLess</ThemedText>
          <ThemedText style={styles.greeting}>{getGreeting()}! 👋</ThemedText>
        </ThemedView>

        {/* Today's Progress */}
        <Card style={styles.progressCard}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Bugünkü İlerleme
          </ThemedText>
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progressPercentage} 
              height={12} 
              backgroundColor="#E5E7EB"
              progressColor="#10B981"
            />
            <ThemedText style={styles.progressText}>
              {todayEntries} / {dailyGoal} hedef
            </ThemedText>
          </View>
          {todayEntries >= dailyGoal && (
            <ThemedText style={styles.congratsText}>
              🎉 Bugünkü hedefinizi tamamladınız!
            </ThemedText>
          )}
        </Card>

        {/* Streak Counter */}
        <StreakCounter />

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <ThemedText style={styles.statNumber}>
              {compulsions.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Toplam Kayıt</ThemedText>
          </Card>

          <Card style={styles.statCard}>
            <ThemedText style={styles.statNumber}>
              {compulsions.filter(c => 
                new Date(c.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
              ).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Bu Hafta</ThemedText>
          </Card>
        </View>

        {/* Recent Activity Summary */}
        <CompulsionSummary limit={5} showTitle={true} />

        {/* Achievement System */}
        <AchievementSystem />

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Hızlı İşlemler
          </ThemedText>
          <View style={styles.actionsRow}>
            <Button
              title="ERP Egzersizi"
              onPress={() => {
                // Navigate to ERP
                Alert.alert('Info', 'ERP sekmesine yönlendiriliyor...');
              }}
              style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
            />
            <Button
              title="Değerlendirme"
              onPress={() => {
                // Navigate to Assessment
                Alert.alert('Info', 'Değerlendirme sekmesine yönlendiriliyor...');
              }}
              style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
            />
          </View>
        </Card>

        {/* Bottom padding for FAB */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => setShowQuickEntry(true)}
        icon="plus"
        style={styles.fab}
      />

      {/* Quick Entry Bottom Sheet */}
      <BottomSheet
        isVisible={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
        title="Hızlı Kompulsiyon Kaydı"
      >
        <CompulsionQuickEntry onClose={handleQuickEntryComplete} />
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 18,
    color: '#6B7280',
  },
  progressCard: {
    margin: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  progressContainer: {
    gap: 12,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },
  congratsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsCard: {
    margin: 16,
    padding: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  bottomPadding: {
    height: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});