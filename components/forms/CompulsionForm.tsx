
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, TextInput, HelperText } from 'react-native-paper';
import { Picker } from '@/components/ui/Picker';
import Slider from '@react-native-community/slider';
import { useCreateCompulsion } from '@/hooks/useCompulsions';
import Toast from 'react-native-toast-message';

const COMPULSION_TYPES = [
  { value: 'washing', label: 'Yıkama/Temizlik' },
  { value: 'checking', label: 'Kontrol Etme' },
  { value: 'counting', label: 'Sayma' },
  { value: 'ordering', label: 'Düzenleme/Sıralama' },
  { value: 'hoarding', label: 'Biriktirme' },
  { value: 'mental', label: 'Zihinsel Ritüeller' },
  { value: 'reassurance', label: 'Güvence Arama' },
  { value: 'avoidance', label: 'Kaçınma' },
  { value: 'other', label: 'Diğer' },
];

export function CompulsionForm() {
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState(5);
  const [resistanceLevel, setResistanceLevel] = useState(5);
  const [duration, setDuration] = useState('');
  const [trigger, setTrigger] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { mutate: createCompulsion, isPending } = useCreateCompulsion();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!type) newErrors.type = 'Kompulsiyon tipi seçiniz';
    if (!duration || isNaN(Number(duration))) newErrors.duration = 'Geçerli süre giriniz (dakika)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const compulsionData = {
      type,
      severity,
      resistanceLevel,
      duration: Number(duration),
      trigger: trigger || undefined,
      notes: notes || undefined,
    };

    createCompulsion(compulsionData, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: 'Kompulsiyon kaydı oluşturuldu',
        });
        // Reset form
        setType('');
        setSeverity(5);
        setResistanceLevel(5);
        setDuration('');
        setTrigger('');
        setNotes('');
        setErrors({});
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Hata',
          text2: 'Kayıt oluşturulamadı',
        });
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Kompulsiyon Kaydı
          </Text>

          {/* Kompulsiyon Tipi */}
          <View style={styles.field}>
            <Text variant="labelLarge" style={styles.label}>
              Kompulsiyon Tipi *
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={type}
                onValueChange={setType}
                style={styles.picker}
              >
                <Picker.Item label="Seçiniz..." value="" />
                {COMPULSION_TYPES.map((item) => (
                  <Picker.Item 
                    key={item.value} 
                    label={item.label} 
                    value={item.value} 
                  />
                ))}
              </Picker>
            </View>
            {errors.type && (
              <HelperText type="error">{errors.type}</HelperText>
            )}
          </View>

          {/* Şiddet Seviyesi */}
          <View style={styles.field}>
            <Text variant="labelLarge" style={styles.label}>
              Şiddet Seviyesi: {severity}/10
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={severity}
              onValueChange={setSeverity}
              minimumTrackTintColor="#10B981"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#10B981"
            />
            <View style={styles.sliderLabels}>
              <Text variant="bodySmall">Hafif</Text>
              <Text variant="bodySmall">Şiddetli</Text>
            </View>
          </View>

          {/* Direnç Seviyesi */}
          <View style={styles.field}>
            <Text variant="labelLarge" style={styles.label}>
              Direnç Gösterme: {resistanceLevel}/10
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={resistanceLevel}
              onValueChange={setResistanceLevel}
              minimumTrackTintColor="#3B82F6"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#3B82F6"
            />
            <View style={styles.sliderLabels}>
              <Text variant="bodySmall">Hiç</Text>
              <Text variant="bodySmall">Çok</Text>
            </View>
          </View>

          {/* Süre */}
          <View style={styles.field}>
            <TextInput
              label="Süre (dakika) *"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              error={!!errors.duration}
              style={styles.input}
            />
            {errors.duration && (
              <HelperText type="error">{errors.duration}</HelperText>
            )}
          </View>

          {/* Tetikleyici */}
          <View style={styles.field}>
            <TextInput
              label="Tetikleyici"
              value={trigger}
              onChangeText={setTrigger}
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="Bu kompulsiyonu tetikleyen durumu açıklayın..."
            />
          </View>

          {/* Notlar */}
          <View style={styles.field}>
            <TextInput
              label="Notlar"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Ek notlarınız..."
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isPending}
            style={styles.submitButton}
            buttonColor="#10B981"
          >
            Kaydet
          </Button>
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
    marginBottom: 24,
    textAlign: 'center',
    color: '#1F2937',
    fontWeight: 'bold',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: '#374151',
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  slider: {
    height: 40,
    marginVertical: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
