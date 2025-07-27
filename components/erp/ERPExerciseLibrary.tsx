import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Button, Searchbar, IconButton } from 'react-native-paper';
import { useLanguage } from '@/contexts/LanguageContext';
import { ERPExercise, ERPCategory, ERPDifficulty } from '@/types/erp';
import {
  ERP_EXERCISES,
  ERP_CATEGORIES,
  getERPCategory,
  getDifficultyColor,
  getDifficultyLabel,
  getERPExercisesByCategory,
  getERPExercisesByDifficulty,
} from '@/constants/erpExercises';

interface Props {
  onExerciseSelect?: (exercise: ERPExercise) => void;
  showHeader?: boolean;
  maxItems?: number;
  filterByCompulsion?: string;
}

export function ERPExerciseLibrary({ 
  onExerciseSelect, 
  showHeader = true, 
  maxItems,
  filterByCompulsion 
}: Props) {
  const { language } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ERPCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ERPDifficulty | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let exercises = [...ERP_EXERCISES];

    // Filter by compulsion type if provided
    if (filterByCompulsion) {
      exercises = exercises.filter(exercise => 
        exercise.relatedCompulsions.includes(filterByCompulsion)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      exercises = exercises.filter(exercise => exercise.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      exercises = exercises.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      exercises = exercises.filter(exercise => {
        const title = (language === 'tr' ? exercise.title : exercise.titleEn).toLowerCase();
        const description = (language === 'tr' ? exercise.description : exercise.descriptionEn).toLowerCase();
        const tags = exercise.tags.join(' ').toLowerCase();
        
        return title.includes(query) || 
               description.includes(query) || 
               tags.includes(query);
      });
    }

    // Apply max items limit
    if (maxItems) {
      exercises = exercises.slice(0, maxItems);
    }

    return exercises;
  }, [searchQuery, selectedCategory, selectedDifficulty, filterByCompulsion, maxItems, language]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  // Render exercise card
  const renderExerciseCard = (exercise: ERPExercise) => {
    const category = getERPCategory(exercise.category);
    const difficultyColor = getDifficultyColor(exercise.difficulty);
    const difficultyLabel = getDifficultyLabel(exercise.difficulty, language === 'en');

    return (
      <TouchableOpacity
        key={exercise.id}
        onPress={() => onExerciseSelect?.(exercise)}
        style={styles.exerciseCardContainer}
      >
        <Card style={styles.exerciseCard}>
          <Card.Content>
            {/* Header */}
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseInfo}>
                <Text variant="titleMedium" style={styles.exerciseTitle}>
                  {language === 'tr' ? exercise.title : exercise.titleEn}
                </Text>
                <Text variant="bodySmall" style={styles.exerciseDescription}>
                  {language === 'tr' ? exercise.description : exercise.descriptionEn}
                </Text>
              </View>
              <View style={styles.exerciseMetadata}>
                <Chip 
                  mode="outlined" 
                  compact 
                  style={[styles.categoryChip, { borderColor: category.color }]}
                  textStyle={{ color: category.color, fontSize: 10 }}
                >
                  {category.icon} {language === 'tr' ? category.name : category.nameEn}
                </Chip>
              </View>
            </View>

            {/* Details */}
            <View style={styles.exerciseDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text variant="bodySmall" style={styles.detailLabel}>Zorluk</Text>
                  <Chip 
                    mode="flat" 
                    compact 
                    style={[styles.difficultyChip, { backgroundColor: difficultyColor + '20' }]}
                    textStyle={{ color: difficultyColor, fontSize: 10 }}
                  >
                    {difficultyLabel}
                  </Chip>
                </View>
                
                <View style={styles.detailItem}>
                  <Text variant="bodySmall" style={styles.detailLabel}>Süre</Text>
                  <Text variant="bodySmall" style={styles.detailValue}>
                    {exercise.duration} dk
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text variant="bodySmall" style={styles.detailLabel}>Hedef Kaygı</Text>
                  <Text variant="bodySmall" style={styles.detailValue}>
                    {exercise.targetAnxiety}/10
                  </Text>
                </View>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {exercise.tags.slice(0, 3).map((tag, index) => (
                <Chip 
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.tagChip}
                  textStyle={{ fontSize: 9 }}
                >
                  {tag}
                </Chip>
              ))}
              {exercise.tags.length > 3 && (
                <Text variant="bodySmall" style={styles.moreTagsText}>
                  +{exercise.tags.length - 3}
                </Text>
              )}
            </View>

            {/* Warnings if any */}
            {exercise.warnings && exercise.warnings.length > 0 && (
              <View style={styles.warningSection}>
                <Text variant="bodySmall" style={styles.warningText}>
                  ⚠️ Uyarı: Bu egzersiz ileri seviye bilgi gerektirir
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text variant="titleLarge" style={styles.headerTitle}>
              ERP Egzersiz Kütüphanesi
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              {filteredExercises.length} egzersiz bulundu
            </Text>
          </View>
          <IconButton
            icon={showFilters ? 'filter' : 'filter-outline'}
            mode={showFilters ? 'contained' : 'outlined'}
            onPress={() => setShowFilters(!showFilters)}
            size={20}
          />
        </View>
      )}

      {/* Search */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Egzersiz ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersSection}>
          {/* Category Filter */}
          <View style={styles.filterGroup}>
            <Text variant="titleSmall" style={styles.filterTitle}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                <Chip
                  mode={selectedCategory === 'all' ? 'flat' : 'outlined'}
                  onPress={() => setSelectedCategory('all')}
                  style={styles.filterChip}
                >
                  Tümü
                </Chip>
                {ERP_CATEGORIES.map(category => (
                  <Chip
                    key={category.id}
                    mode={selectedCategory === category.id ? 'flat' : 'outlined'}
                    onPress={() => setSelectedCategory(category.id)}
                    style={styles.filterChip}
                  >
                    {category.icon} {language === 'tr' ? category.name : category.nameEn}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Difficulty Filter */}
          <View style={styles.filterGroup}>
            <Text variant="titleSmall" style={styles.filterTitle}>Zorluk</Text>
            <View style={styles.filterChips}>
              <Chip
                mode={selectedDifficulty === 'all' ? 'flat' : 'outlined'}
                onPress={() => setSelectedDifficulty('all')}
                style={styles.filterChip}
              >
                Tümü
              </Chip>
              {(['beginner', 'intermediate', 'advanced', 'expert'] as ERPDifficulty[]).map(difficulty => (
                <Chip
                  key={difficulty}
                  mode={selectedDifficulty === difficulty ? 'flat' : 'outlined'}
                  onPress={() => setSelectedDifficulty(difficulty)}
                  style={[styles.filterChip, { borderColor: getDifficultyColor(difficulty) }]}
                >
                  {getDifficultyLabel(difficulty, language === 'en')}
                </Chip>
              ))}
            </View>
          </View>

          {/* Clear Filters */}
          <Button mode="outlined" onPress={clearFilters} style={styles.clearButton}>
            Filtreleri Temizle
          </Button>
        </View>
      )}

      {/* Exercise List */}
      <ScrollView 
        style={styles.exerciseList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.exerciseListContent}
      >
        {filteredExercises.length > 0 ? (
          filteredExercises.map(renderExerciseCard)
        ) : (
          <View style={styles.emptyState}>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              📋 Egzersiz Bulunamadı
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Arama kriterlerinizi değiştirip tekrar deneyin
            </Text>
            <Button mode="outlined" onPress={clearFilters} style={styles.emptyButton}>
              Filtreleri Temizle
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#6B7280',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F3F4F6',
  },
  filtersSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterTitle: {
    marginBottom: 8,
    color: '#374151',
    fontWeight: '600',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  clearButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    padding: 16,
  },
  exerciseCardContainer: {
    marginBottom: 16,
  },
  exerciseCard: {
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  exerciseDescription: {
    color: '#6B7280',
    lineHeight: 18,
  },
  exerciseMetadata: {
    alignItems: 'flex-end',
  },
  categoryChip: {
    height: 24,
  },
  exerciseDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    color: '#6B7280',
    marginBottom: 4,
    fontSize: 11,
  },
  detailValue: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 12,
  },
  difficultyChip: {
    height: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    height: 20,
    backgroundColor: '#F9FAFB',
  },
  moreTagsText: {
    color: '#6B7280',
    fontSize: 10,
    fontStyle: 'italic',
  },
  warningSection: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    color: '#92400E',
    fontSize: 11,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    textAlign: 'center',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    minWidth: 160,
  },
}); 