
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Checkbox, RadioButton, TextInput, Divider } from 'react-native-paper';
import { Picker } from '@/components/ui/Picker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const OBSESSION_TYPES = [
  { id: 'contamination', label: 'Kirlenme/Bulaşma Korkusu' },
  { id: 'harm', label: 'Zarar Verme Düşünceleri' },
  { id: 'symmetry', label: 'Simetri/Düzen Obsesyonları' },
  { id: 'forbidden', label: 'Yasak/Uygunsuz Düşünceler' },
  { id: 'religious', label: 'Dini/Ahlaki Obsesyonlar' },
  { id: 'somatic', label: 'Bedensel/Sağlık Obsesyonları' },
  { id: 'hoarding', label: 'Biriktirme Dürtüleri' },
  { id: 'sexual', label: 'Cinsel Obsesyonlar' },
];

const COMPULSION_TYPES = [
  { id: 'washing', label: 'Yıkama/Temizlik Ritüelleri' },
  { id: 'checking', label: 'Kontrol Etme Davranışları' },
  { id: 'counting', label: 'Sayma/Tekrarlama' },
  { id: 'ordering', label: 'Düzenleme/Sıralama' },
  { id: 'mental', label: 'Zihinsel Ritüeller' },
  { id: 'reassurance', label: 'Güvence Arama' },
  { id: 'avoidance', label: 'Kaçınma Davranışları' },
  { id: 'touching', label: 'Dokunma Ritüelleri' },
];

const SEVERITY_LEVELS = [
  { value: 'mild', label: 'Hafif (0-7 puan)', description: 'Günlük yaşamı az etkiliyor' },
  { value: 'moderate', label: 'Orta (8-15 puan)', description: 'Günlük yaşamı orta derecede etkiliyor' },
  { value: 'severe', label: 'Şiddetli (16-23 puan)', description: 'Günlük yaşamı ciddi şekilde etkiliyor' },
  { value: 'extreme', label: 'Aşırı Şiddetli (24+ puan)', description: 'Günlük yaşamı çok ciddi şekilde etkiliyor' },
];

export function OCDProfileForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedObsessions, setSelectedObsessions] = useState<string[]>([]);
  const [selectedCompulsions, setSelectedCompulsions] = useState<string[]>([]);
  const [severity, setSeverity] = useState('');
  const [onsetAge, setOnsetAge] = useState('');
  const [dailyTimeSpent, setDailyTimeSpent] = useState('');
  const [currentTreatment, setCurrentTreatment] = useState('');
  const [previousTreatments, setPreviousTreatments] = useState<string[]>([]);
  const [medications, setMedications] = useState('');
  const [mainGoals, setMainGoals] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const TREATMENT_OPTIONS = [
    { id: 'none', label: 'Şu anda tedavi almıyorum' },
    { id: 'therapy', label: 'Psikoterapi (CBT, ERP vb.)' },
    { id: 'medication', label: 'İlaç tedavisi' },
    { id: 'both', label: 'Hem terapi hem ilaç' },
    { id: 'alternative', label: 'Alternatif tedaviler' },
  ];

  const GOAL_OPTIONS = [
    { id: 'reduce_time', label: 'Kompulsiyonlara harcanan zamanı azaltmak' },
    { id: 'reduce_anxiety', label: 'Anksiyete seviyesini düşürmek' },
    { id: 'improve_function', label: 'Günlük işlevselliği artırmak' },
    { id: 'relationships', label: 'İlişkileri iyileştirmek' },
    { id: 'work_school', label: 'İş/okul performansını artırmak' },
    { id: 'self_confidence', label: 'Özgüveni geliştirmek' },
  ];

  const handleObsessionToggle = (obsessionId: string) => {
    setSelectedObsessions(prev => 
      prev.includes(obsessionId)
        ? prev.filter(id => id !== obsessionId)
        : [...prev, obsessionId]
    );
  };

  const handleCompulsionToggle = (compulsionId: string) => {
    setSelectedCompulsions(prev => 
      prev.includes(compulsionId)
        ? prev.filter(id => id !== compulsionId)
        : [...prev, compulsionId]
    );
  };

  const handleTreatmentToggle = (treatmentId: string) => {
    setPreviousTreatments(prev => 
      prev.includes(treatmentId)
        ? prev.filter(id => id !== treatmentId)
        : [...prev, treatmentId]
    );
  };

  const handleGoalToggle = (goalId: string) => {
    setMainGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const validateForm = () => {
    if (selectedObsessions.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Eksik Bilgi',
        text2: 'En az bir obsesyon tipi seçiniz',
      });
      return false;
    }

    if (selectedCompulsions.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Eksik Bilgi',
        text2: 'En az bir kompulsiyon tipi seçiniz',
      });
      return false;
    }

    if (!severity) {
      Toast.show({
        type: 'error',
        text1: 'Eksik Bilgi',
        text2: 'Şiddet seviyesi seçiniz',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const profileData = {
        userId: user?.uid,
        obsessionTypes: selectedObsessions,
        compulsionTypes: selectedCompulsions,
        severity,
        onsetAge: onsetAge ? Number(onsetAge) : null,
        dailyTimeSpent: dailyTimeSpent ? Number(dailyTimeSpent) : null,
        currentTreatment,
        previousTreatments,
        medications,
        mainGoals,
        additionalInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(`ocd_profile_${user?.uid}`, JSON.stringify(profileData));
      await AsyncStorage.setItem('profileCompleted', 'true');

      Toast.show({
        type: 'success',
        text1: 'Profil Kaydedildi',
        text2: 'OKB profiliniz başarıyla oluşturuldu',
      });

      // Navigate to main app after successful save
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);

    } catch (error) {
      console.error('Profile save error:', error);
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Profil kaydedilemedi',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            OKB Profil Bilgileri
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Bu bilgiler size daha iyi destek sağlamamıza yardımcı olacak.
          </Text>

          <Divider style={styles.divider} />

          {/* Obsesyon Tipleri */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Yaşadığınız Obsesyon Tipleri *
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              Size uyan obsesyon tiplerini seçiniz:
            </Text>
            
            {OBSESSION_TYPES.map((obsession) => (
              <View key={obsession.id} style={styles.checkboxRow}>
                <Checkbox
                  status={selectedObsessions.includes(obsession.id) ? 'checked' : 'unchecked'}
                  onPress={() => handleObsessionToggle(obsession.id)}
                />
                <Text variant="bodyMedium" style={styles.checkboxLabel}>
                  {obsession.label}
                </Text>
              </View>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Kompulsiyon Tipleri */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Yaşadığınız Kompulsiyon Tipleri *
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              Size uyan kompulsiyon tiplerini seçiniz:
            </Text>
            
            {COMPULSION_TYPES.map((compulsion) => (
              <View key={compulsion.id} style={styles.checkboxRow}>
                <Checkbox
                  status={selectedCompulsions.includes(compulsion.id) ? 'checked' : 'unchecked'}
                  onPress={() => handleCompulsionToggle(compulsion.id)}
                />
                <Text variant="bodyMedium" style={styles.checkboxLabel}>
                  {compulsion.label}
                </Text>
              </View>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Şiddet Seviyesi */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Şiddet Seviyesi *
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              OKB belirtilerinizin genel şiddet seviyesi:
            </Text>
            
            <RadioButton.Group onValueChange={setSeverity} value={severity}>
              {SEVERITY_LEVELS.map((level) => (
                <View key={level.value} style={styles.radioRow}>
                  <RadioButton value={level.value} />
                  <View style={styles.radioContent}>
                    <Text variant="bodyMedium" style={styles.radioLabel}>
                      {level.label}
                    </Text>
                    <Text variant="bodySmall" style={styles.radioDescription}>
                      {level.description}
                    </Text>
                  </View>
                </View>
              ))}
            </RadioButton.Group>
          </View>

          <Divider style={styles.divider} />

          {/* Ek Bilgiler */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ek Bilgiler
            </Text>
            
            <TextInput
              label="Başlangıç Yaşı"
              value={onsetAge}
              onChangeText={setOnsetAge}
              keyboardType="numeric"
              style={styles.input}
              placeholder="OKB belirtileri kaç yaşında başladı?"
            />

            <TextInput
              label="Günlük Harcanan Zaman (saat)"
              value={dailyTimeSpent}
              onChangeText={setDailyTimeSpent}
              keyboardType="numeric"
              style={styles.input}
              placeholder="OKB ile ilgili davranışlara günde kaç saat?"
            />

            <View style={styles.pickerContainer}>
              <Text variant="labelLarge" style={styles.pickerLabel}>
                Mevcut Tedavi Durumu
              </Text>
              <Picker
                selectedValue={currentTreatment}
                onValueChange={setCurrentTreatment}
                style={styles.picker}
              >
                <Picker.Item label="Seçiniz..." value="" />
                {TREATMENT_OPTIONS.map((treatment) => (
                  <Picker.Item 
                    key={treatment.id} 
                    label={treatment.label} 
                    value={treatment.id} 
                  />
                ))}
              </Picker>
            </View>

            <TextInput
              label="Kullandığınız İlaçlar"
              value={medications}
              onChangeText={setMedications}
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="Şu anda kullandığınız ilaçları yazınız (varsa)"
            />
          </View>

          <Divider style={styles.divider} />

          {/* Hedefler */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ana Hedefleriniz
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              Bu uygulama ile ulaşmak istediğiniz hedefleri seçiniz:
            </Text>
            
            {GOAL_OPTIONS.map((goal) => (
              <View key={goal.id} style={styles.checkboxRow}>
                <Checkbox
                  status={mainGoals.includes(goal.id) ? 'checked' : 'unchecked'}
                  onPress={() => handleGoalToggle(goal.id)}
                />
                <Text variant="bodyMedium" style={styles.checkboxLabel}>
                  {goal.label}
                </Text>
              </View>
            ))}
          </View>

          <TextInput
            label="Ek Notlar"
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Eklemek istediğiniz başka bilgiler..."
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
            buttonColor="#10B981"
          >
            Profili Kaydet
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
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#1F2937',
    fontWeight: '600',
  },
  sectionDescription: {
    marginBottom: 12,
    color: '#6B7280',
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
    color: '#374151',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioContent: {
    flex: 1,
    marginLeft: 8,
  },
  radioLabel: {
    color: '#374151',
    fontWeight: '500',
  },
  radioDescription: {
    color: '#6B7280',
    marginTop: 2,
  },
  input: {
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  pickerContainer: {
    marginVertical: 8,
  },
  pickerLabel: {
    marginBottom: 8,
    color: '#374151',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    height: 50,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});
