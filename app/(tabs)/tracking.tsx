
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Button, SegmentedButtons, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { CompulsionQuickEntry } from '@/components/forms/CompulsionQuickEntry';
import { CompulsionHistory } from '@/components/compulsions/CompulsionHistory';
import CompulsionStats from '@/components/compulsions/CompulsionStats';
import { useTranslation } from '@/hooks/useTranslation';

export default function TrackingScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('entry');
  const [showQuickEntry, setShowQuickEntry] = useState(false);

  const handleEntrySubmit = () => {
    setShowQuickEntry(false);
    // Refresh data if needed
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'entry':
        return (
          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <View style={styles.entryHeader}>
                <MaterialCommunityIcons name="plus-circle" size={32} color="#10B981" />
                <View style={styles.entryTextContainer}>
                  <Title style={styles.entryTitle}>Yeni Kayıt Ekle</Title>
                  <Title style={styles.entrySubtitle}>
                    Kompülsiyonunuzu hızlıca kaydedin
                  </Title>
                </View>
              </View>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => setShowQuickEntry(true)}
                style={styles.addButton}
                contentStyle={styles.buttonContent}
              >
                Kayıt Başlat
              </Button>
            </Card.Content>
          </Card>
        );
      case 'history':
        return <CompulsionHistory />;
      case 'stats':
        return <CompulsionStats />;
      default:
        return null;
    }
  };

  return (
    <ScreenLayout scrollable={false} backgroundColor="#FAFAFA">
      <View style={styles.container}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
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
            style={styles.segmentedControl}
          />
        </View>

        {/* Content Area */}
        <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>

        {/* Quick Entry Modal */}
        {showQuickEntry && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Title style={styles.modalTitle}>Hızlı Kayıt</Title>
                <Button
                  mode="text"
                  onPress={() => setShowQuickEntry(false)}
                  icon="close"
                  style={styles.closeButton}
                >
                  Kapat
                </Button>
              </View>
              <CompulsionQuickEntry
                onSave={() => handleEntrySubmit()}
                onCancel={() => setShowQuickEntry(false)}
              />
            </View>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  segmentedControl: {
    backgroundColor: '#F3F4F6',
  },
  contentArea: {
    flex: 1,
    paddingTop: 16,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    paddingVertical: 24,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  entryTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  entryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  entrySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    margin: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#10B981',
  },
});
