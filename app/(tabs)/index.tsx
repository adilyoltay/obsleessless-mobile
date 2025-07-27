import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, Avatar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { useCompulsions, useCompulsionStats } from '@/hooks/useCompulsions';
import CompulsionStats from '@/components/compulsions/CompulsionStats';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { data: compulsions, isLoading } = useCompulsions();
  const { data: stats } = useCompulsionStats();
  const [refreshing, setRefreshing] = useState(false);

  const todayEntries = compulsions?.filter(c => {
    const today = new Date().toDateString();
    return new Date(c.timestamp).toDateString() === today;
  }) || [];

  const loadData = async () => {
    // Data is loaded via react-query hooks automatically
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Her küçük adım bir zaferdir! 💪",
      "Bugün kendine karşı nazik ol 🌟",
      "İlerleme mükemmellikten daha önemli ✨",
      "Sen güçlüsün, bunu başarabilirsin! 🌈"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <ScreenLayout scrollable backgroundColor="#FAFAFA">
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Motivational Header */}
        <Card style={styles.welcomeCard} mode="elevated">
          <Card.Content style={styles.welcomeContent}>
            <View style={styles.welcomeHeader}>
              <Avatar.Icon size={48} icon="heart" style={styles.avatar} />
              <View style={styles.welcomeText}>
                <Title style={styles.welcomeTitle}>Merhaba! 👋</Title>
                <Paragraph style={styles.motivationalText}>
                  {getMotivationalMessage()}
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Today's Summary */}
        <Card style={styles.summaryCard} mode="elevated">
          <Card.Content>
            <Title style={styles.cardTitle}>Bugünkü Özet</Title>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="chart-line" size={24} color="#10B981" />
                <Paragraph style={styles.statValue}>{todayEntries.length}</Paragraph>
                <Paragraph style={styles.statLabel}>Kayıt</Paragraph>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="trophy" size={24} color="#F59E0B" />
                <Paragraph style={styles.statValue}>
                  {stats?.averageResistance?.toFixed(1) || '0'}
                </Paragraph>
                <Paragraph style={styles.statLabel}>Direnç</Paragraph>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="trending-up" size={24} color="#3B82F6" />
                <Paragraph style={styles.statValue}>
                  {stats?.averageResistance?.toFixed(1) || '0'}
                </Paragraph>
                <Paragraph style={styles.statLabel}>Şiddet</Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard} mode="elevated">
          <Card.Content>
            <Title style={styles.cardTitle}>Hızlı İşlemler</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => router.push('/(tabs)/tracking')}
                style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                contentStyle={styles.buttonContent}
              >
                Kayıt Ekle
              </Button>
              <Button
                mode="contained"
                icon="dumbbell"
                onPress={() => router.push('/(tabs)/erp')}
                style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                contentStyle={styles.buttonContent}
              >
                ERP Başlat
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        {todayEntries.length > 0 && (
          <Card style={styles.activityCard} mode="elevated">
            <Card.Content>
              <Title style={styles.cardTitle}>Son Aktiviteler</Title>
              {todayEntries.slice(0, 3).map((entry, index) => (
                <View key={index} style={styles.activityItem}>
                  <Chip
                    icon="clock"
                    style={styles.activityChip}
                    textStyle={styles.chipText}
                  >
                    {new Date(entry.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Chip>
                  <Paragraph style={styles.activityText}>
                    {entry.type} - Şiddet: {entry.severity}/10
                  </Paragraph>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Daily Tip */}
        <Card style={styles.tipCard} mode="elevated">
          <Card.Content>
            <View style={styles.tipHeader}>
              <MaterialCommunityIcons name="lightbulb" size={20} color="#F59E0B" />
              <Title style={styles.tipTitle}>Günün İpucu</Title>
            </View>
            <Paragraph style={styles.tipText}>
              Kompülsiyonlarla başa çıkarken, nefes egzersizleri yaparak 
              anksiyetenizi azaltabilirsiniz. Derin nefes alın ve yavaşça verin.
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(tabs)/tracking')}
        label="Kayıt"
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  welcomeCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  welcomeContent: {
    paddingVertical: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#10B981',
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  motivationalText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  activityCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityChip: {
    marginRight: 12,
  },
  chipText: {
    fontSize: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  tipCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 100,
    backgroundColor: '#FEF3C7',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#10B981',
  },
});