
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Dimensions 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Native Paper Components
import { Card, Button, FAB } from 'react-native-paper';

// Custom UI Components
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SegmentedButtons } from '@/components/ui/SegmentedButtons';

// Feature Components
import { CompulsionQuickEntry } from '@/components/forms/CompulsionQuickEntry';
import { CompulsionHistory } from '@/components/compulsions/CompulsionHistory';
import CompulsionStats from '@/components/compulsions/CompulsionStats';

// Hooks & Utils
import { useTranslation } from '@/hooks/useTranslation';

const { width } = Dimensions.get('window');

export default function TrackingScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('entry');
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load today's compulsion count and weekly average
      const today = new Date().toDateString();
      const entries = await AsyncStorage.getItem(`compulsions_${today}`);
      setTodayCount(entries ? JSON.parse(entries).length : 0);
      
      // Calculate weekly average (mock for now)
      setWeeklyAverage(3.2);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleQuickEntryComplete = () => {
    setShowQuickEntry(false);
    loadStats(); // Refresh stats
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderQuickEntry = () => (
    <Card style={styles.quickEntryCard}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.entryHeader}>
          <MaterialCommunityIcons 
            name="plus-circle" 
            size={32} 
            color="#10B981" 
          />
          <View style={styles.entryTextContainer}>
            <Text style={styles.entryTitle}>Hızlı Kayıt</Text>
            <Text style={styles.entrySubtitle}>
              Kompulsiyonunu anında kaydet
            </Text>
          </View>
        </View>
        
        <Button
          onPress={() => setShowQuickEntry(true)}
          style={styles.addButton}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons 
              name="plus" 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.buttonText}>Yeni Kayıt</Text>
          </View>
        </Button>
      </Card.Content>
    </Card>
  );

  const renderStatsOverview = () => (
    <Card style={styles.statsCard}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.statsTitle}>Bugünkü Durum</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{todayCount}</Text>
            <Text style={styles.statLabel}>Bugün</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{weeklyAverage}</Text>
            <Text style={styles.statLabel}>Haftalık Ort.</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'entry':
        return (
          <View style={styles.tabContent}>
            {renderQuickEntry()}
            {renderStatsOverview()}
          </View>
        );
      
      case 'history':
        return (
          <View style={styles.tabContent}>
            <CompulsionHistory />
          </View>
        );
      
      case 'stats':
        return (
          <View style={styles.tabContent}>
            <CompulsionStats />
          </View>
        );
      
      default:
        return renderQuickEntry();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>OKB Takibi</Text>
          <Text style={styles.headerSubtitle}>
            Kompulsiyonlarını kaydet ve takip et
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, styles.segmentedButtons]}>
          <SegmentedButtons
            selectedValue={activeTab}
            onSelectionChange={handleTabChange}
            options={[
              {
                value: 'entry',
                label: 'Kayıt',
                icon: 'plus-circle-outline',
              },
              {
                value: 'history',
                label: 'Geçmiş',
                icon: 'history',
              },
              {
                value: 'stats',
                label: 'İstatistik',
                icon: 'chart-line',
              },
            ]}
          />
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Floating Action Button - Master Prompt Quick Entry */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowQuickEntry(true);
        }}
        label="Hızlı Kayıt"
        variant="primary"
      />

      {/* Bottom Sheet for Quick Entry */}
      <BottomSheet
        isVisible={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
      >
        <CompulsionQuickEntry
          onSave={handleQuickEntryComplete}
          onCancel={() => setShowQuickEntry(false)}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  segmentedButtons: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  quickEntryCard: {
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  cardContent: {
    padding: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  entryTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  entrySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 100, // Above bottom sheet area
    backgroundColor: '#10B981', // Master Prompt primary color
  },
});
