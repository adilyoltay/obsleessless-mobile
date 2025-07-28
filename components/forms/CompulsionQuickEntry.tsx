
import React, { useState } from 'react';
import { View, StyleSheet, Vibration } from 'react-native';
import { Text, Card, Button, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Slider } from '@/components/ui/Slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Form validation schema
const compulsionSchema = z.object({
  type: z.string().min(1, 'Kompulsiyon türü gerekli'),
  resistanceLevel: z.number().min(1).max(10),
  duration: z.number().min(1).max(300)
});

type CompulsionFormData = z.infer<typeof compulsionSchema>;

interface Props {
  onSave?: () => void;
  onCancel?: () => void;
}

// Altın Standart: Master prompt'ta belirtilen kompulsiyon tipleri (ikonlu SegmentedButtons için)
const COMPULSION_TYPES = [
  { value: 'washing', label: 'Temizlik', icon: 'shower' },
  { value: 'checking', label: 'Kontrol', icon: 'check-circle' },
  { value: 'counting', label: 'Sayma', icon: 'counter' },
  { value: 'ordering', label: 'Düzen', icon: 'sort-variant' },
  { value: 'mental', label: 'Zihinsel', icon: 'brain' },
  { value: 'other', label: 'Diğer', icon: 'dots-horizontal' }
];

export function CompulsionQuickEntry({ onSave, onCancel }: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  // React Hook Form setup
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CompulsionFormData>({
    resolver: zodResolver(compulsionSchema),
    defaultValues: {
      type: 'washing',
      resistanceLevel: 5,
      duration: 5
    }
  });

  // Master prompt'ta belirtilen haptic geri bildirim fonksiyonları
  const triggerHapticFeedback = (type: 'light' | 'success' | 'warning' | 'heavy') => {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  };

  // Master prompt'ta belirtilen Toast gösterimi
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 60
    });
  };

  // Form submit işlemi - Master prompt: ≤ 15 saniyede, 2-3 dokunuşla kaydetme
  const onSubmit = async (data: CompulsionFormData) => {
    setLoading(true);
    
    try {
      const entry = {
        id: Date.now().toString(),
        ...data,
        timestamp: new Date().toISOString(),
        userId: user?.uid
      };

      // AsyncStorage'a kaydet
      const existingEntries = await AsyncStorage.getItem('compulsion_entries');
      const entries = existingEntries ? JSON.parse(existingEntries) : [];
      entries.push(entry);
      await AsyncStorage.setItem('compulsion_entries', JSON.stringify(entries));

      // Master prompt: Başarı haptic'i tetikle
      triggerHapticFeedback('success');
      
      // Master prompt: "Kaydedildi!" Toast'ı göster
      showToast('Kaydedildi! 🌱');

      // Form'u sıfırla
      reset();
      
      // Parent component'e başarı bildir
      onSave?.();

    } catch (error) {
      console.error('Kompulsiyon kaydedilemedi:', error);
      triggerHapticFeedback('warning');
      showToast('Kaydetme sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    triggerHapticFeedback('light');
    reset();
    onCancel?.();
  };

  return (
    <View style={styles.container}>
      {/* Master prompt: Sakinlik ve güven inşa eden header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="plus-circle" size={24} color="#10B981" />
        <Text style={styles.title}>Hızlı Kayıt</Text>
        <Text style={styles.subtitle}>Bu anı kaydet, kontrolü ele al</Text>
      </View>

      <Card style={styles.formCard} mode="elevated">
        <Card.Content style={styles.cardContent}>
          
          {/* Kompulsiyon Tipi - Master prompt: ikonlu SegmentedButtons */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Kompulsiyon Türü</Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <SegmentedButtons
                  value={value}
                  onValueChange={(newValue) => {
                    triggerHapticFeedback('light');
                    onChange(newValue);
                  }}
                  buttons={COMPULSION_TYPES.slice(0, 3).map(type => ({
                    value: type.value,
                    label: type.label,
                    icon: type.icon
                  }))}
                  style={styles.segmentedButtons}
                />
              )}
            />
            
            {/* İkinci satır segmented buttons */}
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <SegmentedButtons
                  value={value}
                  onValueChange={(newValue) => {
                    triggerHapticFeedback('light');
                    onChange(newValue);
                  }}
                  buttons={COMPULSION_TYPES.slice(3).map(type => ({
                    value: type.value,
                    label: type.label,
                    icon: type.icon
                  }))}
                  style={styles.segmentedButtons}
                />
              )}
            />
            
            {errors.type && (
              <Text style={styles.errorText}>{errors.type.message}</Text>
            )}
          </View>

          {/* Direnç Seviyesi - Master prompt: Slider */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Direnç Seviyesi</Text>
            <Text style={styles.fieldDescription}>
              Ne kadar direnç gösterebildin?
            </Text>
            
            <Controller
              control={control}
              name="resistanceLevel"
              render={({ field: { onChange, value } }) => (
                <View style={styles.sliderContainer}>
                  <Slider
                    value={value}
                    onValueChange={(newValue) => {
                      triggerHapticFeedback('light');
                      onChange(newValue);
                    }}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    thumbStyle={styles.sliderThumb}
                    trackStyle={styles.sliderTrack}
                    minimumTrackTintColor="#10B981"
                    maximumTrackTintColor="#E5E7EB"
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>1</Text>
                    <Text style={styles.sliderValueText}>{value}/10</Text>
                    <Text style={styles.sliderLabelText}>10</Text>
                  </View>
                  <Text style={styles.sliderHelperText}>
                    {value <= 3 ? 'Çok zor oldu' : 
                     value <= 6 ? 'Biraz direndim' : 
                     value <= 8 ? 'İyi dayandım' : 
                     'Harika kontrol!'}
                  </Text>
                </View>
              )}
            />
          </View>

          {/* Süre - Master prompt: Stepper (simplified as input with +/- buttons) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Süre (Dakika)</Text>
            
            <Controller
              control={control}
              name="duration"
              render={({ field: { onChange, value } }) => (
                <View style={styles.stepperContainer}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      triggerHapticFeedback('light');
                      onChange(Math.max(1, value - 1));
                    }}
                    style={styles.stepperButton}
                    icon="minus"
                    disabled={value <= 1}
                  />
                  
                  <View style={styles.stepperValue}>
                    <Text style={styles.stepperValueText}>{value}</Text>
                    <Text style={styles.stepperUnit}>dk</Text>
                  </View>
                  
                  <Button
                    mode="outlined"
                    onPress={() => {
                      triggerHapticFeedback('light');
                      onChange(Math.min(300, value + 1));
                    }}
                    style={styles.stepperButton}
                    icon="plus"
                    disabled={value >= 300}
                  />
                </View>
              )}
            />
            
            {errors.duration && (
              <Text style={styles.errorText}>{errors.duration.message}</Text>
            )}
          </View>

          {/* Action Buttons - Master prompt: Empatik dil kullanımı */}
          <View style={styles.actionContainer}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.cancelButton}
              textColor="#6B7280"
              disabled={loading}
            >
              İptal
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.saveButton}
              buttonColor="#10B981"
              loading={loading}
              disabled={loading}
              icon="check"
            >
              Kaydet
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

// Master prompt: Sakinlik ve güven inşa eden stil sistemi
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  formCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  fieldDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  sliderContainer: {
    paddingVertical: 8,
  },
  sliderThumb: {
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sliderValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  sliderHelperText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderColor: '#D1D5DB',
  },
  stepperValue: {
    alignItems: 'center',
    minWidth: 80,
  },
  stepperValueText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  stepperUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#D1D5DB',
  },
  saveButton: {
    flex: 2,
    borderRadius: 8,
  },
});
