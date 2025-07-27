import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, Switch, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Slider } from '@/components/ui/Slider';
import { Badge } from '@/components/ui/Badge';

import { 
  CompulsionEntry, 
  CompulsionType, 
  MoodLevel, 
  QuickEntryFormData,
  COMMON_TRIGGERS,
  COMMON_LOCATIONS
} from '@/types/compulsion';

import {
  COMPULSION_CATEGORIES,
  INTENSITY_LEVELS, 
  RESISTANCE_LEVELS,
  MOOD_LEVELS,
  getCompulsionCategory,
  getIntensityLevel,
  getResistanceLevel,
  getMoodLevel
} from '@/constants/compulsions';

interface Props {
  onSave?: (entry: CompulsionEntry) => void;
  onCancel?: () => void;
  initialData?: Partial<QuickEntryFormData>;
}

export function CompulsionQuickEntry({ onSave, onCancel, initialData }: Props) {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  // Form state
  const [formData, setFormData] = useState<QuickEntryFormData>({
    type: initialData?.type || 'washing',
    intensity: initialData?.intensity || 5,
    resistanceLevel: initialData?.resistanceLevel || 5,
    duration: initialData?.duration || undefined,
    triggers: initialData?.triggers || [],
    notes: initialData?.notes || '',
    completed: initialData?.completed || true,
    helpUsed: initialData?.helpUsed || false,
    mood: initialData?.mood || 'neutral'
  });

  const [loading, setLoading] = useState(false);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(initialData?.triggers || []);

  const updateFormData = (key: keyof QuickEntryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleTrigger = (trigger: string) => {
    const newTriggers = selectedTriggers.includes(trigger)
      ? selectedTriggers.filter(t => t !== trigger)
      : [...selectedTriggers, trigger];
    
    setSelectedTriggers(newTriggers);
    updateFormData('triggers', newTriggers);
  };

  const validateForm = (): boolean => {
    if (!formData.type) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Kompülsiyon türü seçiniz'
      });
      return false;
    }

    if (formData.intensity < 1 || formData.intensity > 10) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Şiddet seviyesi 1-10 arasında olmalıdır'
      });
      return false;
    }

    if (formData.resistanceLevel < 1 || formData.resistanceLevel > 10) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Direnç seviyesi 1-10 arasında olmalıdır'
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user?.uid) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Kullanıcı girişi gerekli'
      });
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const entryId = `compulsion_${user.uid}_${now.getTime()}`;
      
      const compulsionEntry: CompulsionEntry = {
        id: entryId,
        userId: user.uid,
        type: formData.type,
        intensity: formData.intensity,
        resistanceLevel: formData.resistanceLevel,
        duration: formData.duration,
        triggers: formData.triggers,
        notes: formData.notes,
        timestamp: now,
        completed: formData.completed,
        helpUsed: formData.helpUsed,
        mood: formData.mood,
        createdAt: now,
        updatedAt: now
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(entryId, JSON.stringify(compulsionEntry));
      
      // Update user's compulsion list
      const existingCompulsions = await AsyncStorage.getItem(`compulsions_${user.uid}`);
      const compulsionList = existingCompulsions ? JSON.parse(existingCompulsions) : [];
      compulsionList.push(entryId);
      await AsyncStorage.setItem(`compulsions_${user.uid}`, JSON.stringify(compulsionList));

      Toast.show({
        type: 'success',
        text1: 'Başarılı',
        text2: 'Kompülsiyon kaydedildi'
      });

      onSave?.(compulsionEntry);
      
      // Reset form
      setFormData({
        type: 'washing',
        intensity: 5,
        resistanceLevel: 5,
        duration: undefined,
        triggers: [],
        notes: '',
        completed: true,
        helpUsed: false,
        mood: 'neutral'
      });
      setSelectedTriggers([]);

    } catch (error) {
      console.error('Compulsion save error:', error);
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Kompülsiyon kaydedilemedi'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = getCompulsionCategory(formData.type);
  const intensityLevel = getIntensityLevel(formData.intensity);
  const resistanceLevel = getResistanceLevel(formData.resistanceLevel);
  const currentMood = getMoodLevel(formData.mood!);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Kompülsiyon Kaydı
          </Text>

          {/* Kompülsiyon Türü */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Kompülsiyon Türü *
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => updateFormData('type', value)}
                style={styles.picker}
              >
                {COMPULSION_CATEGORIES.map(category => (
                  <Picker.Item
                    key={category.id}
                    label={`${category.icon} ${language === 'tr' ? category.name : category.nameEn}`}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>
            
            <View style={[styles.categoryInfo, { borderLeftColor: selectedCategory.color }]}>
              <Text variant="bodyMedium" style={styles.categoryDescription}>
                {language === 'tr' ? selectedCategory.description : selectedCategory.descriptionEn}
              </Text>
            </View>
          </View>

          {/* Şiddet Seviyesi */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Şiddet Seviyesi: {formData.intensity}/10
            </Text>
            <Text variant="bodySmall" style={[styles.levelLabel, { color: intensityLevel.color }]}>
              {language === 'tr' ? intensityLevel.label : intensityLevel.labelEn}
            </Text>
            <Slider
              value={formData.intensity}
              onValueChange={(value) => updateFormData('intensity', value)}
              minimumValue={1}
              maximumValue={10}
              step={1}
              style={styles.slider}
              minimumTrackTintColor={intensityLevel.color}
              maximumTrackTintColor="#E5E7EB"
              thumbStyle={[styles.sliderThumb, { backgroundColor: intensityLevel.color }]}
            />
          </View>

          {/* Direnç Seviyesi */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Direnç Seviyesi: {formData.resistanceLevel}/10
            </Text>
            <Text variant="bodySmall" style={[styles.levelLabel, { color: resistanceLevel.color }]}>
              {language === 'tr' ? resistanceLevel.label : resistanceLevel.labelEn}
            </Text>
            <Slider
              value={formData.resistanceLevel}
              onValueChange={(value) => updateFormData('resistanceLevel', value)}
              minimumValue={1}
              maximumValue={10}
              step={1}
              style={styles.slider}
              minimumTrackTintColor={resistanceLevel.color}
              maximumTrackTintColor="#E5E7EB"
              thumbStyle={[styles.sliderThumb, { backgroundColor: resistanceLevel.color }]}
            />
          </View>

          {/* Süre */}
          <View style={styles.section}>
            <TextInput
              label="Süre (dakika)"
              value={formData.duration?.toString() || ''}
              onChangeText={(text) => updateFormData('duration', text ? parseInt(text) : undefined)}
              keyboardType="numeric"
              style={styles.input}
              placeholder="Kompülsiyona harcanan süre"
            />
          </View>

          {/* Ruh Hali */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ruh Haliniz
            </Text>
            <View style={styles.moodContainer}>
              {MOOD_LEVELS.map(mood => (
                <Badge
                  key={mood.value}
                  variant={formData.mood === mood.value ? 'solid' : 'outline'}
                  onPress={() => updateFormData('mood', mood.value)}
                  style={[
                    styles.moodBadge,
                    formData.mood === mood.value && { backgroundColor: mood.color }
                  ]}
                >
                  {mood.emoji} {language === 'tr' ? mood.label : mood.labelEn}
                </Badge>
              ))}
            </View>
          </View>

          {/* Tetikleyiciler */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tetikleyiciler
            </Text>
            <View style={styles.triggersContainer}>
              {COMMON_TRIGGERS.map(trigger => (
                <Badge
                  key={trigger}
                  variant={selectedTriggers.includes(trigger) ? 'solid' : 'outline'}
                  onPress={() => toggleTrigger(trigger)}
                  style={styles.triggerBadge}
                >
                  {trigger}
                </Badge>
              ))}
            </View>
          </View>

          {/* Switches */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <Text variant="bodyMedium">Kompülsiyonu tamamladım</Text>
              <Switch
                value={formData.completed}
                onValueChange={(value) => updateFormData('completed', value)}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text variant="bodyMedium">Baş etme stratejisi kullandım</Text>
              <Switch
                value={formData.helpUsed}
                onValueChange={(value) => updateFormData('helpUsed', value)}
              />
            </View>
          </View>

          {/* Notlar */}
          <View style={styles.section}>
            <TextInput
              label="Notlar"
              value={formData.notes}
              onChangeText={(text) => updateFormData('notes', text)}
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Eklemek istediğiniz notlar..."
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {onCancel && (
              <Button
                mode="outlined"
                onPress={onCancel}
                style={styles.button}
              >
                İptal
              </Button>
            )}
            
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              style={styles.button}
              buttonColor="#10B981"
            >
              Kaydet
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 8,
  },
  picker: {
    height: 50,
  },
  categoryInfo: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  categoryDescription: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
  levelLabel: {
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  slider: {
    height: 40,
    marginVertical: 8,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  triggersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
}); 