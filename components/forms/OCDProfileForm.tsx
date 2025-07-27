
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import { Text, Card, Button, Checkbox, RadioButton, TextInput, Divider, ProgressBar } from 'react-native-paper';
import { Picker, PickerItem } from '@/components/ui/Picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

interface OCDProfileFormProps {
  onComplete?: () => void;
}

const OBSESSION_TYPES = [
  { id: 'contamination', label: 'Kirlenme/Bulaşma Korkusu', icon: '🧼' },
  { id: 'harm', label: 'Zarar Verme Düşünceleri', icon: '⚠️' },
  { id: 'symmetry', label: 'Simetri/Düzen Obsesyonları', icon: '⚖️' },
  { id: 'forbidden', label: 'Yasak/Uygunsuz Düşünceler', icon: '🚫' },
  { id: 'religious', label: 'Dini/Ahlaki Obsesyonlar', icon: '🙏' },
  { id: 'somatic', label: 'Bedensel/Sağlık Obsesyonları', icon: '🩺' },
  { id: 'hoarding', label: 'Biriktirme Dürtüleri', icon: '📦' },
  { id: 'sexual', label: 'Cinsel Obsesyonlar', icon: '💭' },
];

const COMPULSION_TYPES = [
  { id: 'washing', label: 'Yıkama/Temizlik Ritüelleri', icon: '🚿' },
  { id: 'checking', label: 'Kontrol Etme Davranışları', icon: '🔍' },
  { id: 'counting', label: 'Sayma/Tekrarlama', icon: '🔢' },
  { id: 'ordering', label: 'Düzenleme/Sıralama', icon: '📊' },
  { id: 'mental', label: 'Zihinsel Ritüeller', icon: '🧠' },
  { id: 'reassurance', label: 'Güvence Arama', icon: '🤝' },
  { id: 'avoidance', label: 'Kaçınma Davranışları', icon: '🚪' },
  { id: 'touching', label: 'Dokunma Ritüelleri', icon: '👆' },
];

const SEVERITY_LEVELS = [
  { 
    value: 'mild', 
    label: 'Hafif', 
    description: 'Günlük yaşamı az etkiliyor (0-7 puan)',
    color: '#10B981',
    icon: '🟢'
  },
  { 
    value: 'moderate', 
    label: 'Orta', 
    description: 'Günlük yaşamı orta derecede etkiliyor (8-15 puan)',
    color: '#F59E0B',
    icon: '🟡'
  },
  { 
    value: 'severe', 
    label: 'Şiddetli', 
    description: 'Günlük yaşamı ciddi şekilde etkiliyor (16-23 puan)',
    color: '#EF4444',
    icon: '🔴'
  },
  { 
    value: 'extreme', 
    label: 'Aşırı Şiddetli',
    description: 'Günlük yaşamı çok ciddi şekilde etkiliyor (24+ puan)',
    color: '#7C2D12',
    icon: '🔴'
  },
];

export function OCDProfileForm({ onComplete }: OCDProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

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

  const sections = [
    { title: 'Obsesyon Tipleri', icon: '🧠', required: true },
    { title: 'Kompulsiyon Tipleri', icon: '🔄', required: true },
    { title: 'Şiddet Seviyesi', icon: '📊', required: true },
    { title: 'Ek Bilgiler', icon: '📝', required: false },
    { title: 'Hedefleriniz', icon: '🎯', required: false },
  ];

  const TREATMENT_OPTIONS = [
    { id: 'none', label: 'Şu anda tedavi almıyorum' },
    { id: 'therapy', label: 'Psikoterapi (CBT, ERP vb.)' },
    { id: 'medication', label: 'İlaç tedavisi' },
    { id: 'both', label: 'Hem terapi hem ilaç' },
    { id: 'alternative', label: 'Alternatif tedaviler' },
  ];

  const GOAL_OPTIONS = [
    { id: 'reduce_time', label: 'Kompulsiyonlara harcanan zamanı azaltmak', icon: '⏰' },
    { id: 'reduce_anxiety', label: 'Anksiyete seviyesini düşürmek', icon: '😌' },
    { id: 'improve_function', label: 'Günlük işlevselliği artırmak', icon: '💪' },
    { id: 'relationships', label: 'İlişkileri iyileştirmek', icon: '❤️' },
    { id: 'work_school', label: 'İş/okul performansını artırmak', icon: '📚' },
    { id: 'self_confidence', label: 'Özgüveni geliştirmek', icon: '✨' },
  ];

  const handleItemToggle = (
    items: string[], 
    setItems: React.Dispatch<React.SetStateAction<string[]>>, 
    itemId: string
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getCompletionProgress = () => {
    let completed = 0;
    let total = 5;

    if (selectedObsessions.length > 0) completed++;
    if (selectedCompulsions.length > 0) completed++;
    if (severity) completed++;
    if (onsetAge || dailyTimeSpent || currentTreatment || medications) completed++;
    if (mainGoals.length > 0) completed++;

    return completed / total;
  };

  const validateCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return selectedObsessions.length > 0;
      case 1:
        return selectedCompulsions.length > 0;
      case 2:
        return severity !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      if (sections[currentSection].required && !validateCurrentSection()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: 'error',
          text1: 'Eksik Bilgi',
          text2: `${sections[currentSection].title} bölümünü doldurunuz`,
        });
        return;
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentSection(currentSection + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
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

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: '🎉 Profil Oluşturuldu',
        text2: 'Başarıyla kayıt oldunuz!'
      });

      if (onComplete) {
        onComplete();
      } else {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      }

    } catch (error) {
      console.error('Profile save error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Profil kaydedilemedi',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 0: // Obsessions
        return (
          <View style={styles.sectionContent}>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Yaşadığınız obsesyon tiplerini seçiniz. Birden fazla seçim yapabilirsiniz.
            </Text>
            
            <View style={styles.grid}>
              {OBSESSION_TYPES.map((obsession) => (
                <View key={obsession.id} style={styles.gridItem}>
                  <View style={[
                    styles.selectableCard,
                    selectedObsessions.includes(obsession.id) && styles.selectedCard
                  ]}>
                    <Checkbox
                      status={selectedObsessions.includes(obsession.id) ? 'checked' : 'unchecked'}
                      onPress={() => handleItemToggle(selectedObsessions, setSelectedObsessions, obsession.id)}
                    />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardIcon}>{obsession.icon}</Text>
                      <Text style={styles.cardLabel}>{obsession.label}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 1: // Compulsions
        return (
          <View style={styles.sectionContent}>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Yaşadığınız kompulsiyon tiplerini seçiniz. Birden fazla seçim yapabilirsiniz.
            </Text>
            
            <View style={styles.grid}>
              {COMPULSION_TYPES.map((compulsion) => (
                <View key={compulsion.id} style={styles.gridItem}>
                  <View style={[
                    styles.selectableCard,
                    selectedCompulsions.includes(compulsion.id) && styles.selectedCard
                  ]}>
                    <Checkbox
                      status={selectedCompulsions.includes(compulsion.id) ? 'checked' : 'unchecked'}
                      onPress={() => handleItemToggle(selectedCompulsions, setSelectedCompulsions, compulsion.id)}
                    />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardIcon}>{compulsion.icon}</Text>
                      <Text style={styles.cardLabel}>{compulsion.label}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 2: // Severity
        return (
          <View style={styles.sectionContent}>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              OKB belirtilerinizin genel şiddet seviyesini seçiniz.
            </Text>

            <RadioButton.Group onValueChange={setSeverity} value={severity}>
              {SEVERITY_LEVELS.map((level) => (
                <View key={level.value} style={[
                  styles.severityCard,
                  severity === level.value && { borderColor: level.color, backgroundColor: `${level.color}10` }
                ]}>
                  <RadioButton value={level.value} color={level.color} />
                  <View style={styles.severityContent}>
                    <View style={styles.severityHeader}>
                      <Text style={styles.severityIcon}>{level.icon}</Text>
                      <Text style={[styles.severityLabel, { color: level.color }]}>
                        {level.label}
                      </Text>
                    </View>
                    <Text style={styles.severityDescription}>
                      {level.description}
                    </Text>
                  </View>
                </View>
              ))}
            </RadioButton.Group>
          </View>
        );

      case 3: // Additional Info
        return (
          <View style={styles.sectionContent}>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Ek bilgileri paylaşarak size daha iyi destek sağlayabiliriz.
            </Text>

            <View style={styles.inputGroup}>
              <TextInput
                label="Başlangıç Yaşı"
                value={onsetAge}
                onChangeText={setOnsetAge}
                keyboardType="numeric"
                style={styles.input}
                placeholder="OKB belirtileri kaç yaşında başladı?"
                left={<TextInput.Icon icon="calendar" />}
              />

              <TextInput
                label="Günlük Harcanan Zaman (saat)"
                value={dailyTimeSpent}
                onChangeText={setDailyTimeSpent}
                keyboardType="numeric"
                style={styles.input}
                placeholder="OKB ile ilgili davranışlara günde kaç saat?"
                left={<TextInput.Icon icon="clock" />}
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
                  <PickerItem label="Seçiniz..." value="" />
                  {TREATMENT_OPTIONS.map((treatment) => (
                    <PickerItem 
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
                left={<TextInput.Icon icon="pill" />}
              />
            </View>
          </View>
        );

      case 4: // Goals
        return (
          <View style={styles.sectionContent}>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Bu uygulama ile ulaşmak istediğiniz hedefleri seçiniz.
            </Text>

            <View style={styles.grid}>
              {GOAL_OPTIONS.map((goal) => (
                <View key={goal.id} style={styles.gridItem}>
                  <View style={[
                    styles.selectableCard,
                    mainGoals.includes(goal.id) && styles.selectedCard
                  ]}>
                    <Checkbox
                      status={mainGoals.includes(goal.id) ? 'checked' : 'unchecked'}
                      onPress={() => handleItemToggle(mainGoals, setMainGoals, goal.id)}
                    />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardIcon}>{goal.icon}</Text>
                      <Text style={styles.cardLabel}>{goal.label}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TextInput
              label="Ek Notlar"
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Eklemek istediğiniz başka bilgiler..."
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Card.Content>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              {sections[currentSection].icon} {sections[currentSection].title}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {currentSection + 1} / {sections.length}
            </Text>
            <ProgressBar 
              progress={getCompletionProgress()} 
              color="#10B981" 
              style={styles.progressBar}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Section Content */}
          {renderSectionContent()}

          <Divider style={styles.divider} />

          {/* Navigation */}
          <View style={styles.navigation}>
            <View style={styles.buttonRow}>
              {currentSection > 0 && (
                <Button
                  mode="outlined"
                  onPress={handlePrevious}
                  style={styles.prevButton}
                  icon="arrow-left"
                >
                  Geri
                </Button>
              )}

              <View style={{ flex: 1 }} />

              <Button
                mode="contained"
                onPress={handleNext}
                loading={loading}
                style={styles.nextButton}
                buttonColor="#10B981"
                icon={currentSection === sections.length - 1 ? "check" : "arrow-right"}
                contentStyle={{ flexDirection: 'row-reverse' }}
              >
                {currentSection === sections.length - 1 ? 'Profili Kaydet' : 'İleri'}
              </Button>
            </View>
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
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
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
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  divider: {
    marginVertical: 20,
  },
  sectionContent: {
    marginBottom: 16,
  },
  sectionDescription: {
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  selectableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  selectedCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  cardLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  severityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  severityContent: {
    flex: 1,
    marginLeft: 12,
  },
  severityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  severityIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  severityDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputGroup: {
    gap: 16,
  },
  input: {
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
  navigation: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prevButton: {
    borderColor: '#D1D5DB',
  },
  nextButton: {
    paddingVertical: 4,
  },
});
