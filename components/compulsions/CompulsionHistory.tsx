import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Button, IconButton, Modal, Portal, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompulsionCard } from './CompulsionCard';
import { CompulsionEntry, CompulsionFilter, CompulsionType } from '@/types/compulsion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { COMPULSION_CATEGORIES } from '@/constants/compulsions';

interface Props {
  maxItems?: number;
  showFilters?: boolean;
  compact?: boolean;
  onEntryPress?: (entry: CompulsionEntry) => void;
  onEntryEdit?: (entry: CompulsionEntry) => void;
  onEntryDelete?: (entryId: string) => void;
}

export function CompulsionHistory({ 
  maxItems, 
  showFilters = true, 
  compact = false,
  onEntryPress,
  onEntryEdit,
  onEntryDelete 
}: Props) {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [entries, setEntries] = useState<CompulsionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter & Sort states
  const [filter, setFilter] = useState<CompulsionFilter>({});
  const [sortBy, setSortBy] = useState<'timestamp' | 'intensity' | 'resistance'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load entries from AsyncStorage
  const loadEntries = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const compulsionListStr = await AsyncStorage.getItem(`compulsions_${user.uid}`);
      if (!compulsionListStr) {
        setEntries([]);
        return;
      }

      const compulsionIds: string[] = JSON.parse(compulsionListStr);
      const loadedEntries: CompulsionEntry[] = [];

      for (const id of compulsionIds) {
        try {
          const entryStr = await AsyncStorage.getItem(id);
          if (entryStr) {
            const entry = JSON.parse(entryStr);
            // Convert string dates back to Date objects
            entry.timestamp = new Date(entry.timestamp);
            entry.createdAt = new Date(entry.createdAt);
            entry.updatedAt = new Date(entry.updatedAt);
            loadedEntries.push(entry);
          }
        } catch (error) {
          console.error(`Error loading entry ${id}:`, error);
        }
      }

      setEntries(loadedEntries);
    } catch (error) {
      console.error('Error loading compulsion history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, [user?.uid]);

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...entries];

    // Apply filters
    if (filter.type) {
      filtered = filtered.filter(entry => entry.type === filter.type);
    }

    if (filter.dateFrom) {
      filtered = filtered.filter(entry => entry.timestamp >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      filtered = filtered.filter(entry => entry.timestamp <= filter.dateTo!);
    }

    if (filter.intensityMin !== undefined) {
      filtered = filtered.filter(entry => entry.intensity >= filter.intensityMin!);
    }

    if (filter.intensityMax !== undefined) {
      filtered = filtered.filter(entry => entry.intensity <= filter.intensityMax!);
    }

    if (filter.resistanceMin !== undefined) {
      filtered = filtered.filter(entry => entry.resistanceLevel >= filter.resistanceMin!);
    }

    if (filter.resistanceMax !== undefined) {
      filtered = filtered.filter(entry => entry.resistanceLevel <= filter.resistanceMax!);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'intensity':
          aValue = a.intensity;
          bValue = b.intensity;
          break;
        case 'resistance':
          aValue = a.resistanceLevel;
          bValue = b.resistanceLevel;
          break;
        case 'timestamp':
        default:
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    // Apply max items limit
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [entries, filter, sortBy, sortOrder, maxItems]);

  // Handle entry deletion
  const handleDeleteEntry = async (entryId: string) => {
    if (!user?.uid) return;

    try {
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(entryId);
      
      // Update user's compulsion list
      const compulsionListStr = await AsyncStorage.getItem(`compulsions_${user.uid}`);
      if (compulsionListStr) {
        const compulsionList: string[] = JSON.parse(compulsionListStr);
        const updatedList = compulsionList.filter(id => id !== entryId);
        await AsyncStorage.setItem(`compulsions_${user.uid}`, JSON.stringify(updatedList));
      }

      // Update local state
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      
      // Call parent callback
      onEntryDelete?.(entryId);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // Filter helpers
  const clearFilters = () => {
    setFilter({});
  };

  const toggleTypeFilter = (type: CompulsionType) => {
    setFilter(prev => ({
      ...prev,
      type: prev.type === type ? undefined : type
    }));
  };

  const hasActiveFilters = () => {
    return Object.keys(filter).some(key => filter[key as keyof CompulsionFilter] !== undefined);
  };

  // Render filter modal
  const renderFilterModal = () => (
    <Portal>
      <Modal 
        visible={showFilterModal} 
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={styles.modalTitle}>
              Filtreler ve Sıralama
            </Text>

            {/* Compulsion Type Filter */}
            <View style={styles.filterSection}>
              <Text variant="titleSmall" style={styles.filterTitle}>
                Kompülsiyon Türü
              </Text>
              <View style={styles.typeChips}>
                {COMPULSION_CATEGORIES.map(category => (
                  <Chip
                    key={category.id}
                    mode={filter.type === category.id ? 'flat' : 'outlined'}
                    onPress={() => toggleTypeFilter(category.id)}
                    style={styles.typeChip}
                  >
                    {category.icon} {language === 'tr' ? category.name : category.nameEn}
                  </Chip>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text variant="titleSmall" style={styles.filterTitle}>
                Sıralama
              </Text>
              <View style={styles.sortOptions}>
                <Chip
                  mode={sortBy === 'timestamp' ? 'flat' : 'outlined'}
                  onPress={() => setSortBy('timestamp')}
                  style={styles.sortChip}
                >
                  📅 Tarihe Göre
                </Chip>
                <Chip
                  mode={sortBy === 'intensity' ? 'flat' : 'outlined'}
                  onPress={() => setSortBy('intensity')}
                  style={styles.sortChip}
                >
                  📊 Şiddete Göre
                </Chip>
                <Chip
                  mode={sortBy === 'resistance' ? 'flat' : 'outlined'}
                  onPress={() => setSortBy('resistance')}
                  style={styles.sortChip}
                >
                  🛡 Dirençe Göre
                </Chip>
              </View>

              <View style={styles.sortOrder}>
                <Chip
                  mode={sortOrder === 'desc' ? 'flat' : 'outlined'}
                  onPress={() => setSortOrder('desc')}
                  style={styles.sortChip}
                >
                  ⬇️ Azalan
                </Chip>
                <Chip
                  mode={sortOrder === 'asc' ? 'flat' : 'outlined'}
                  onPress={() => setSortOrder('asc')}
                  style={styles.sortChip}
                >
                  ⬆️ Artan
                </Chip>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={clearFilters}
                disabled={!hasActiveFilters()}
                style={styles.modalButton}
              >
                Filtreleri Temizle
              </Button>
              <Button 
                mode="contained" 
                onPress={() => setShowFilterModal(false)}
                style={styles.modalButton}
              >
                Uygula
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  // Render list item
  const renderEntry = ({ item }: { item: CompulsionEntry }) => (
    <CompulsionCard
      entry={item}
      compact={compact}
      onPress={() => onEntryPress?.(item)}
      onEdit={() => onEntryEdit?.(item)}
      onDelete={() => handleDeleteEntry(item.id)}
    />
  );

  // Render list header
  const renderHeader = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text variant="titleMedium" style={styles.headerTitle}>
            Kompülsiyon Geçmişi
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            {filteredAndSortedEntries.length} kayıt
            {hasActiveFilters() && ' (filtrelenmiş)'}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <IconButton
            icon="filter"
            mode={hasActiveFilters() ? 'contained' : 'outlined'}
            onPress={() => setShowFilterModal(true)}
            size={20}
          />
          <IconButton
            icon="refresh"
            mode="outlined"
            onPress={handleRefresh}
            size={20}
          />
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        📋 Henüz kayıt yok
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        İlk kompülsiyonunuzu kaydetmek için Takip sekmesini kullanın
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <Text variant="bodyMedium">Kayıtlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredAndSortedEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredAndSortedEntries.length === 0 && styles.emptyListContent
        ]}
      />
      
      {renderFilterModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#374151',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 20,
  },
  modalContent: {
    margin: 20,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#374151',
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sortOrder: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
}); 