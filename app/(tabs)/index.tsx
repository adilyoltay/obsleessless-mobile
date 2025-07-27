
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip, FAB } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { StreakCounter } from '../../components/gamification/StreakCounter';
import { CompulsionStats } from '../../components/compulsions/CompulsionStats';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface DashboardData {
  streak: {
    currentStreak: number;
    longestStreak: number;
    level: any;
    progress: number;
    nextLevelIn: number;
    todayCompleted: boolean;
    activities: {
      compulsionTracking: boolean;
      erpExercise: boolean;
      dailyGoal: boolean;
    };
  };
  todayStats: {
    compulsionCount: number;
    erpMinutes: number;
    resistanceAverage: number;
    anxietyReduction: number;
  };
  weeklyProgress: {
    improvement: number;
    trend: 'up' | 'down' | 'stable';
  };
  personalizedTips: Array<{
    id: string;
    title: string;
    description: string;
    type: 'erp' | 'mindfulness' | 'behavioral';
    action: string;
  }>;
  quickActions: Array<{
    id: string;
    title: string;
    icon: string;
    route: string;
    color: string;
  }>;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    streak: {
      currentStreak: 7,
      longestStreak: 14,
      level: {
        id: 'beginner',
        name: 'Başlangıç',
        emoji: '🌱',
        minDays: 1,
        maxDays: 7,
        color: ['#a8e6cf', '#88d8a3'],
        benefits: ['İlk adımları attınız', 'Farkındalık kazanıyorsunuz']
      },
      progress: 0.7,
      nextLevelIn: 1,
      todayCompleted: false,
      activities: {
        compulsionTracking: true,
        erpExercise: false,
        dailyGoal: false,
      }
    },
    todayStats: {
      compulsionCount: 3,
      erpMinutes: 15,
      resistanceAverage: 6.5,
      anxietyReduction: 40,
    },
    weeklyProgress: {
      improvement: 23,
      trend: 'up'
    },
    personalizedTips: [
      {
        id: '1',
        title: 'ERP Egzersizi Önerisi',
        description: 'Kapı kilidini tek seferde kontrol etme egzersizi deneyin',
        type: 'erp',
        action: 'ERP Başlat'
      },
      {
        id: '2',
        title: 'Nefes Tekniği',
        description: '4-7-8 nefes tekniği anksiyete yönetimi için',
        type: 'mindfulness',
        action: 'Dene'
      },
      {
        id: '3',
        title: 'Davranışsal İpucu',
        description: 'Kompulsiyonlara direnç gösterme sürenizi artırın',
        type: 'behavioral',
        action: 'Öğren'
      }
    ],
    quickActions: [
      {
        id: 'track_compulsion',
        title: 'Kompulsiyon Kaydet',
        icon: '📊',
        route: '/tracking',
        color: '#FF6B35'
      },
      {
        id: 'start_erp',
        title: 'ERP Egzersizi',
        icon: '🛡️',
        route: '/erp',
        color: '#4ECDC4'
      },
      {
        id: 'ybocs_assessment',
        title: 'Y-BOCS Değerlendirme',
        icon: '📋',
        route: '/assessment',
        color: '#45B7D1'
      },
      {
        id: 'view_progress',
        title: 'İlerleme Görüntüle',
        icon: '📈',
        route: '/tracking',
        color: '#96CEB4'
      },
    ]
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch fresh data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleActivityPress = (activity: string) => {
    switch (activity) {
      case 'compulsionTracking':
        router.push('/tracking');
        break;
      case 'erpExercise':
        router.push('/erp');
        break;
      case 'dailyGoal':
        router.push('/settings');
        break;
    }
  };

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getTipIcon = (type: string) => {
    switch (type) {
      case 'erp': return '🛡️';
      case 'mindfulness': return '🧘';
      case 'behavioral': return '🎯';
      default: return '💡';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.welcomeHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.welcomeText}>Hoş geldin!</Text>
          <Text style={styles.userName}>{user?.displayName || 'OKB Savaşçısı'}</Text>
          <Text style={styles.motivationText}>
            "Her küçük adım büyük bir zafere giden yoldur 🌟"
          </Text>
        </LinearGradient>

        {/* Streak Counter */}
        <View style={styles.section}>
          <StreakCounter 
            data={dashboardData.streak} 
            onActivityPress={handleActivityPress}
          />
        </View>

        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Bugün Özet</Text>
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{dashboardData.todayStats.compulsionCount}</Text>
                  <Text style={styles.statLabel}>Kompulsiyon</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{dashboardData.todayStats.erpMinutes}dk</Text>
                  <Text style={styles.statLabel}>ERP Egzersizi</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{dashboardData.todayStats.resistanceAverage}/10</Text>
                  <Text style={styles.statLabel}>Avg Direnç</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{dashboardData.todayStats.anxietyReduction}%</Text>
                  <Text style={styles.statLabel}>Anksiyete ↓</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Haftalık İlerleme</Text>
          <Card style={styles.progressCard}>
            <Card.Content>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>
                  {getTrendIcon(dashboardData.weeklyProgress.trend)} 
                  %{dashboardData.weeklyProgress.improvement} İyileşme
                </Text>
                <Chip 
                  icon="trending-up" 
                  style={[styles.trendChip, { backgroundColor: '#d4edda' }]}
                  textStyle={{ color: '#155724' }}
                >
                  Pozitif Trend
                </Chip>
              </View>
              <Text style={styles.progressDescription}>
                Geçen haftaya göre kompulsiyon sıklığında azalma ve direnç seviyesinde artış gözleniyor. Harika iş çıkarıyorsun! 👏
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Hızlı İşlemler</Text>
          <View style={styles.quickActionsGrid}>
            {dashboardData.quickActions.map((action) => (
              <Card 
                key={action.id} 
                style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                onPress={() => handleQuickAction(action.route)}
              >
                <Card.Content style={styles.quickActionContent}>
                  <Text style={styles.quickActionIcon}>{action.icon}</Text>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Personalized Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Kişisel Öneriler</Text>
          {dashboardData.personalizedTips.map((tip) => (
            <Card key={tip.id} style={styles.tipCard}>
              <Card.Content>
                <View style={styles.tipHeader}>
                  <Text style={styles.tipIcon}>{getTipIcon(tip.type)}</Text>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDescription}>{tip.description}</Text>
                  </View>
                  <Button 
                    mode="outlined" 
                    compact
                    style={styles.tipButton}
                  >
                    {tip.action}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/tracking')}
        label="Hızlı Kayıt"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeHeader: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  motivationText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#343a40',
  },
  statsCard: {
    backgroundColor: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: 'white',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  trendChip: {
    height: 32,
  },
  progressDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6c757d',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: 'white',
    borderLeftWidth: 4,
  },
  quickActionContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: '#495057',
  },
  tipCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  tipButton: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
});
