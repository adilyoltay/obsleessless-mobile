import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, RadioButton, ProgressBar } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface YBOCSQuestion {
  id: string;
  category: 'obsessions' | 'compulsions';
  text: string;
  textEn: string;
}

const YBOCS_QUESTIONS: YBOCSQuestion[] = [
  // Obsesyon Soruları (1-5)
  {
    id: 'obs_time',
    category: 'obsessions',
    text: 'Obsesif düşüncelerinize günde ne kadar zaman harcıyorsunuz?',
    textEn: 'How much time do you spend on obsessive thoughts per day?'
  },
  {
    id: 'obs_interference',
    category: 'obsessions',
    text: 'Obsesif düşünceler günlük aktivitelerinizi ne kadar engelliyor?',
    textEn: 'How much do obsessive thoughts interfere with your daily activities?'
  },
  {
    id: 'obs_distress',
    category: 'obsessions',
    text: 'Obsesif düşünceler ne kadar sıkıntı yaratıyor?',
    textEn: 'How much distress do obsessive thoughts cause?'
  },
  {
    id: 'obs_resistance',
    category: 'obsessions',
    text: 'Obsesif düşüncelere ne kadar direniyorsunuz?',
    textEn: 'How much do you resist obsessive thoughts?'
  },
  {
    id: 'obs_control',
    category: 'obsessions',
    text: 'Obsesif düşüncelerinizi ne kadar kontrol edebiliyorsunuz?',
    textEn: 'How much control do you have over obsessive thoughts?'
  },
  // Kompulsiyon Soruları (6-10)
  {
    id: 'comp_time',
    category: 'compulsions',
    text: 'Kompulsif davranışlarınıza günde ne kadar zaman harcıyorsunuz?',
    textEn: 'How much time do you spend on compulsive behaviors per day?'
  },
  {
    id: 'comp_interference',
    category: 'compulsions',
    text: 'Kompulsif davranışlar günlük aktivitelerinizi ne kadar engelliyor?',
    textEn: 'How much do compulsive behaviors interfere with your daily activities?'
  },
  {
    id: 'comp_distress',
    category: 'compulsions',
    text: 'Kompulsif davranışları yapmadığınızda ne kadar sıkıntı hissediyorsunuz?',
    textEn: 'How much distress do you feel when you don\'t perform compulsive behaviors?'
  },
  {
    id: 'comp_resistance',
    category: 'compulsions',
    text: 'Kompulsif davranışlara ne kadar direniyorsunuz?',
    textEn: 'How much do you resist compulsive behaviors?'
  },
  {
    id: 'comp_control',
    category: 'compulsions',
    text: 'Kompulsif davranışlarınızı ne kadar kontrol edebiliyorsunuz?',
    textEn: 'How much control do you have over compulsive behaviors?'
  }
];

const RESPONSE_OPTIONS = [
  { value: 0, label: 'Hiç (0 puan)', labelEn: 'None (0 points)' },
  { value: 1, label: 'Hafif (1 puan)', labelEn: 'Mild (1 point)' },
  { value: 2, label: 'Orta (2 puan)', labelEn: 'Moderate (2 points)' },
  { value: 3, label: 'Şiddetli (3 puan)', labelEn: 'Severe (3 points)' },
  { value: 4, label: 'Aşırı Şiddetli (4 puan)', labelEn: 'Extreme (4 points)' }
];

const SEVERITY_LEVELS = [
  { min: 0, max: 7, level: 'Subclinical', levelTr: 'Subklinik', color: '#10B981' },
  { min: 8, max: 15, level: 'Mild', levelTr: 'Hafif', color: '#F59E0B' },
  { min: 16, max: 23, level: 'Moderate', levelTr: 'Orta', color: '#EF4444' },
  { min: 24, max: 31, level: 'Severe', levelTr: 'Şiddetli', color: '#7C2D12' },
  { min: 32, max: 40, level: 'Extreme', levelTr: 'Aşırı Şiddetli', color: '#450A0A' }
];

interface YBOCSAssessmentProps {
  onComplete?: () => void;
}

export function YBOCSAssessment({ onComplete }: YBOCSAssessmentProps) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<{[key: string]: number}>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResponse = (value: number) => {
    const questionId = YBOCS_QUESTIONS[currentQuestion].id;
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const questionId = YBOCS_QUESTIONS[currentQuestion].id;
    if (responses[questionId] === undefined) {
      Toast.show({
        type: 'error',
        text1: 'Cevap Gerekli',
        text2: 'Lütfen bir seçenek işaretleyiniz',
      });
      return;
    }

    if (currentQuestion < YBOCS_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    const obsessionScore = YBOCS_QUESTIONS
      .filter(q => q.category === 'obsessions')
      .reduce((sum, q) => sum + (responses[q.id] || 0), 0);

    const compulsionScore = YBOCS_QUESTIONS
      .filter(q => q.category === 'compulsions')
      .reduce((sum, q) => sum + (responses[q.id] || 0), 0);

    const totalScore = obsessionScore + compulsionScore;

    return { obsessionScore, compulsionScore, totalScore };
  };

  const getSeverityLevel = (score: number) => {
    return SEVERITY_LEVELS.find(level => score >= level.min && score <= level.max);
  };

  const completeAssessment = async () => {
    setLoading(true);
    try {
      const scores = calculateScore();
      const severity = getSeverityLevel(scores.totalScore);

      const assessmentResult = {
        userId: user?.uid,
        responses,
        scores,
        severity,
        completedAt: new Date().toISOString(),
        type: 'ybocs'
      };

      await AsyncStorage.setItem(
        `ybocs_assessment_${user?.uid}_${Date.now()}`, 
        JSON.stringify(assessmentResult)
      );

      await AsyncStorage.setItem(
        `latest_ybocs_${user?.uid}`,
        JSON.stringify(assessmentResult)
      );

      setIsCompleted(true);

      Toast.show({
        type: 'success',
        text1: '✅ Değerlendirme Tamamlandı',
        text2: `Toplam puanınız: ${scores.totalScore}/40`
      });

      // Call onComplete callback if provided
      if (onComplete) {
        setTimeout(onComplete, 1500);
      }

    } catch (error) {
      console.error('Assessment save error:', error);
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Değerlendirme kaydedilemedi',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    const scores = calculateScore();
    const severity = getSeverityLevel(scores.totalScore);

    return (
      <Card style={styles.resultsCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.resultsTitle}>
            Y-BOCS Değerlendirme Sonuçları
          </Text>

          <View style={styles.scoreSection}>
            <Text variant="titleMedium" style={styles.scoreTitle}>
              Toplam Puan: {scores.totalScore}/40
            </Text>

            <View style={[styles.severityBadge, { backgroundColor: severity?.color }]}>
              <Text style={styles.severityText}>
                {language === 'tr' ? severity?.levelTr : severity?.level}
              </Text>
            </View>
          </View>

          <View style={styles.subscores}>
            <View style={styles.subscore}>
              <Text variant="bodyMedium">Obsesyonlar:</Text>
              <Text variant="titleMedium">{scores.obsessionScore}/20</Text>
            </View>
            <View style={styles.subscore}>
              <Text variant="bodyMedium">Kompulsiyonlar:</Text>
              <Text variant="titleMedium">{scores.compulsionScore}/20</Text>
            </View>
          </View>

          <Text variant="bodyMedium" style={styles.disclaimer}>
            Bu test sadece bilgilendirme amaçlıdır. Profesyonel tanı için uzman hekim görüşü alınız.
          </Text>

          <Button
            mode="contained"
            onPress={() => setIsCompleted(false)}
            style={styles.retakeButton}
          >
            Tekrar Değerlendir
          </Button>
        </Card.Content>
      </Card>
    );
  };

  if (isCompleted) {
    return (
      <ScrollView style={styles.container}>
        {renderResults()}
      </ScrollView>
    );
  }

  const progress = (currentQuestion + 1) / YBOCS_QUESTIONS.length;
  const question = YBOCS_QUESTIONS[currentQuestion];
  const questionText = language === 'tr' ? question.text : question.textEn;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Y-BOCS Değerlendirmesi
          </Text>

          <Text variant="bodyMedium" style={styles.subtitle}>
            Soru {currentQuestion + 1} / {YBOCS_QUESTIONS.length}
          </Text>

          <ProgressBar 
            progress={progress} 
            style={styles.progressBar}
            color="#10B981"
          />

          <View style={styles.questionSection}>
            <Text variant="titleMedium" style={styles.questionText}>
              {questionText}
            </Text>

            <View style={styles.optionsSection}>
              {RESPONSE_OPTIONS.map((option) => (
                <View key={option.value} style={styles.optionRow}>
                  <RadioButton
                    value={option.value.toString()}
                    status={responses[question.id] === option.value ? 'checked' : 'unchecked'}
                    onPress={() => handleResponse(option.value)}
                  />
                  <Text 
                    variant="bodyMedium" 
                    style={styles.optionText}
                    onPress={() => handleResponse(option.value)}
                  >
                    {language === 'tr' ? option.label : option.labelEn}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handlePrevious}
              disabled={currentQuestion === 0}
              style={styles.button}
            >
              Önceki
            </Button>

            <Button
              mode="contained"
              onPress={handleNext}
              loading={loading}
              style={styles.button}
              buttonColor="#10B981"
            >
              {currentQuestion === YBOCS_QUESTIONS.length - 1 ? 'Tamamla' : 'İleri'}
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
    height: 8,
    borderRadius: 4,
    marginBottom: 24,
  },
  questionSection: {
    marginBottom: 24,
  },
  questionText: {
    marginBottom: 20,
    color: '#1F2937',
    lineHeight: 24,
  },
  optionsSection: {
    paddingHorizontal: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  resultsCard: {
    elevation: 2,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultsTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreTitle: {
    marginBottom: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  severityText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subscores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  subscore: {
    alignItems: 'center',
  },
  disclaimer: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 20,
    lineHeight: 20,
  },
  retakeButton: {
    marginTop: 8,
  },
});