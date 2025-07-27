
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Button, IconButton, Chip, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useCompulsionStats } from '@/hooks/useCompulsions';
import { CompulsionSummary } from '@/components/compulsions/CompulsionSummary';
import { CompulsionHistory } from '@/components/compulsions/CompulsionHistory';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DashboardStats {
  todayCompulsions: number;
  weeklyCompulsions: number;
  averageResistance: number;
  currentStreak: number;
  totalSessions: number;
  lastERPSession?: Date;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, loginWithGoogle, isLoading } = useAuth();
  const { data: compulsionStats } = useCompulsionStats();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayCompulsions: 0,
    weeklyCompulsions: 0,
    averageResistance: 0,
    currentStreak: 0,
    totalSessions: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setupGreeting();
    loadDashboardData();
  }, []);

  const setupGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Günaydın');
    else if (hour < 18) setGreeting('İyi öğleden sonra');
    else setGreeting('İyi akşamlar');
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      Toast.show({
        type: 'success',
        text1: '🎉 Giriş Başarılı',
        text2: 'Google hesabınızla giriş yapıldı'
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Giriş Hatası',
        text2: error.message || 'Google giriş başarısız'
      });
    }
  };

  const loadDashboardData = async () => {
    try {
      if (!user?.uid) return;

      // Load streak data
      const streakData = await AsyncStorage.getItem(`streak_${user.uid}`);
      const streak = streakData ? JSON.parse(streakData) : { current: 0, best: 0 };

      // Load ERP session data
      const erpData = await AsyncStorage.getItem(`erp_sessions_${user.uid}`);
      const erpSessions = erpData ? JSON.parse(erpData) : [];

      setDashboardStats(prev => ({
        ...prev,
        todayCompulsions: compulsionStats?.today || 0,
        weeklyCompulsions: compulsionStats?.thisWeek || 0,
        averageResistance: compulsionStats?.averageResistance || 0,
        currentStreak: streak.current,
        totalSessions: erpSessions.length,
        lastERPSession: erpSessions.length > 0 ? new Date(erpSessions[erpSessions.length - 1].timestamp) : undefined,
      }));
    } catch (error) {
      console.error('Dashboard data load error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    Toast.show({
      type: 'success',
      text1: 'Veriler Güncellendi',
      text2: 'Dashboard verileri yenilendi',
    });
  };

  const getStreakEmoji = (days: number) => {
    if (days >= 30) return '🏆';
    if (days >= 14) return '🥇';
    if (days >= 7) return '⚔️';
    if (days >= 3) return '🔥';
    return '🌱';
  };

  const getResistanceColor = (level: number) => {
    if (level >= 7) return '#10B981';
    if (level >= 5) return '#F59E0B';
    return '#EF4444';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    return `${diffDays} gün önce`;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Google Auth Section - Only show if not logged in */}
      {!user && (
        <Card style={styles.authCard}>
          <Card.Content style={styles.authContent}>
            <Text variant="titleLarge" style={styles.authTitle}>
              🚀 ObsessLess'e Hoş Geldin!
            </Text>
            <Text variant="bodyMedium" style={styles.authSubtitle}>
              OCD yolculuğunu başlatmak için Google ile giriş yap
            </Text>
            <Button
              mode="contained"
              onPress={handleGoogleLogin}
              style={styles.googleButton}
              icon="google"
              loading={isLoading}
              disabled={isLoading}
            >
              Google ile Giriş Yap
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Welcome Section - Only show if logged in */}
      {user && (
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View>
            <Text variant="headlineSmall" style={styles.welcomeText}>
                {greeting}, {user?.name || user?.email?.split('@')[0] || 'Kullanıcı'}!
            </Text>
            <Text variant="bodyMedium" style={styles.dateText}>
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
            <View style={styles.userActions}>
              <Button
                mode="outlined"
                onPress={handleGoogleLogin}
                style={styles.miniGoogleButton}
                icon="google"
                compact
              >
                Google
              </Button>
          <Avatar.Text 
            size={50} 
                label={user?.name?.[0] || user?.email?.[0] || 'U'} 
            style={styles.avatar}
          />
        </View>
      </View>
        </View>
      )}

      {/* Current Streak */}
      <Card style={styles.streakCard}>
        <Card.Content style={styles.streakContent}>
          <View style={styles.streakLeft}>
            <Text variant="displaySmall" style={styles.streakEmoji}>
              {getStreakEmoji(dashboardStats.currentStreak)}
            </Text>
            <View>
              <Text variant="headlineMedium" style={styles.streakNumber}>
                {dashboardStats.currentStreak}
              </Text>
              <Text variant="bodyMedium" style={styles.streakLabel}>
                Gün Seri
              </Text>
            </View>
          </View>
          <View style={styles.streakRight}>
            <Text variant="bodySmall" style={styles.streakMotivation}>
              {dashboardStats.currentStreak > 0 
                ? 'Harika gidiyorsun! Devam et!' 
                : 'Bugün yeni bir başlangıç yap!'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Bugünkü İstatistikler
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#EF4444' }]}>
                {dashboardStats.todayCompulsions}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Kompulsiyon
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: getResistanceColor(dashboardStats.averageResistance) }]}>
                {dashboardStats.averageResistance.toFixed(1)}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Ortalama Direnç
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#3B82F6' }]}>
                {dashboardStats.totalSessions}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                ERP Seansı
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Hızlı İşlemler
          </Text>
          
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => router.push('/tracking')}
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              icon="plus"
            >
              Kompulsiyon Kaydet
            </Button>
            
            <Button
              mode="contained"
              onPress={() => router.push('/erp')}
              style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
              icon="timer"
            >
              ERP Egzersizi
            </Button>
          </View>
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => router.push('/assessment')}
              style={styles.actionButton}
              icon="clipboard-text"
            >
              Değerlendirme
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => router.push('/explore')}
              style={styles.actionButton}
              icon="chart-line"
            >
              İlerleme
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Weekly Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Haftalık Özet
          </Text>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Toplam Kompulsiyon:</Text>
            <Chip icon="alert-circle" mode="outlined">
              {dashboardStats.weeklyCompulsions}
            </Chip>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Son ERP Seansı:</Text>
            <Chip icon="timer" mode="outlined">
              {dashboardStats.lastERPSession 
                ? formatTimeAgo(dashboardStats.lastERPSession)
                : 'Henüz yok'
              }
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Daily Tip */}
      <Card style={styles.tipCard}>
        <Card.Content>
          <View style={styles.tipHeader}>
            <Text variant="titleMedium" style={styles.tipTitle}>
              💡 Günün İpucu
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.tipText}>
            Kompulsiyonlara karşı direnç göstermek kas geliştirmek gibidir. 
            Her direniş sizi daha güçlü yapar. Bugün küçük de olsa bir adım atın!
          </Text>
          <Button
            mode="text"
            onPress={() => router.push('/explore')}
            style={styles.tipButton}
          >
            Daha Fazla İpucu
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#10B981',
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dateText: {
    color: '#D1FAE5',
    marginTop: 4,
  },
  avatar: {
    backgroundColor: '#059669',
  },
  streakCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    marginRight: 16,
  },
  streakNumber: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  streakLabel: {
    color: '#6B7280',
  },
  streakRight: {
    flex: 1,
    marginLeft: 16,
  },
  streakMotivation: {
    color: '#374151',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  tipHeader: {
    marginBottom: 12,
  },
  tipTitle: {
    color: '#92400E',
    fontWeight: '600',
  },
  tipText: {
    color: '#92400E',
    lineHeight: 22,
    marginBottom: 12,
  },
  tipButton: {
    alignSelf: 'flex-start',
  },
  // Google Auth Styles
  authCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  authContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  authTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  googleButton: {
    backgroundColor: '#EA4335',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniGoogleButton: {
    borderColor: '#EA4335',
  },
});
