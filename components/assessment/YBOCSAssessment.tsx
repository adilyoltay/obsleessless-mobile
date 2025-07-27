import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, ProgressBar, RadioButton } from 'react-native-paper';
import { useTranslation } from '../../hooks/useTranslation';

interface YBOCSQuestion {
  id: string;
  category: 'obsession' | 'compulsion';
  question: string;
  options: { value: number; label: string; description: string }[];
}

const YBOCS_QUESTIONS: YBOCSQuestion[] = [
  // Obsession Questions (1-5)
  {
    id: 'obs_time',
    category: 'obsession',
    question: 'Obsesyonlar ne kadar vaktinizi alıyor?',
    options: [
      { value: 0, label: 'Hiç', description: 'Obsesyonum yok' },
      { value: 1, label: 'Hafif', description: 'Günde 1 saatten az' },
      { value: 2, label: 'Orta', description: 'Günde 1-3 saat arası' },
      { value: 3, label: 'Şiddetli', description: 'Günde 3-8 saat arası' },
      { value: 4, label: 'Aşırı', description: 'Günde 8 saatten fazla' },
    ],
  },
  {
    id: 'obs_interference',
    category: 'obsession',
    question: 'Obsesyonlar sosyal ve iş hayatınızı ne kadar etkiliyor?',
    options: [
      { value: 0, label: 'Hiç', description: 'Etkilemiyor' },
      { value: 1, label: 'Hafif', description: 'Biraz gecikme' },
      { value: 2, label: 'Orta', description: 'Belirgin gecikme' },
      { value: 3, label: 'Şiddetli', description: 'Önemli bozulma' },
      { value: 4, label: 'Aşırı', description: 'İşlev görememe' },
    ],
  },
  {
    id: 'obs_distress',
    category: 'obsession',
    question: 'Obsesyonlar ne kadar sıkıntı veriyor?',
    options: [
      { value: 0, label: 'Hiç', description: 'Sıkıntı vermiyor' },
      { value: 1, label: 'Hafif', description: 'Biraz rahatsız edici' },
      { value: 2, label: 'Orta', description: 'Oldukça rahatsız edici' },
      { value: 3, label: 'Şiddetli', description: 'Çok rahatsız edici' },
      { value: 4, label: 'Aşırı', description: 'Dayanılmaz' },
    ],
  },
  {
    id: 'obs_resistance',
    category: 'obsession',
    question: 'Obsesyonlara ne kadar direnebiliyorsunuz?',
    options: [
      { value: 0, label: 'Her zaman', description: 'Tam direnç' },
      { value: 1, label: 'Çok', description: 'Çok direnç' },
      { value: 2, label: 'Orta', description: 'Orta direnç' },
      { value: 3, label: 'Az', description: 'Az direnç' },
      { value: 4, label: 'Hiç', description: 'Direnç yok' },
    ],
  },
  {
    id: 'obs_control',
    category: 'obsession',
    question: 'Obsesyonlarınız üzerinde ne kadar kontrolünüz var?',
    options: [
      { value: 0, label: 'Tam', description: 'Tam kontrol' },
      { value: 1, label: 'Çok', description: 'Çok kontrol' },
      { value: 2, label: 'Orta', description: 'Orta kontrol' },
      { value: 3, label: 'Az', description: 'Az kontrol' },
      { value: 4, label: 'Hiç', description: 'Kontrol yok' },
    ],
  },
  // Compulsion Questions (6-10)
  {
    id: 'comp_time',
    category: 'compulsion',
    question: 'Kompulsiyonlar ne kadar vaktinizi alıyor?',
    options: [
      { value: 0, label: 'Hiç', description: 'Kompulsiyonum yok' },
      { value: 1, label: 'Hafif', description: 'Günde 1 saatten az' },
      { value: 2, label: 'Orta', description: 'Günde 1-3 saat arası' },
      { value: 3, label: 'Şiddetli', description: 'Günde 3-8 saat arası' },
      { value: 4, label: 'Aşırı', description: 'Günde 8 saatten fazla' },
    ],
  },
  {
    id: 'comp_interference',
    category: 'compulsion',
    question: 'Kompulsiyonlar sosyal ve iş hayatınızı ne kadar etkiliyor?',
    options: [
      { value: 0, label: 'Hiç', description: 'Etkilemiyor' },
      { value: 1, label: 'Hafif', description: 'Biraz gecikme' },
      { value: 2, label: 'Orta', description: 'Belirgin gecikme' },
      { value: 3, label: 'Şiddetli', description: 'Önemli bozulma' },
      { value: 4, label: 'Aşırı', description: 'İşlev görememe' },
    ],
  },
  {
    id: 'comp_distress',
    category: 'compulsion',
    question: 'Kompulsiyonları yapmamak ne kadar sıkıntı veriyor?',
    options: [
      { value: 0, label: 'Hiç', description: 'Sıkıntı vermiyor' },
      { value: 1, label: 'Hafif', description: 'Biraz rahatsız edici' },
      { value: 2, label: 'Orta', description: 'Oldukça rahatsız edici' },
      { value: 3, label: 'Şiddetli', description: 'Çok rahatsız edici' },
      { value: 4, label: 'Aşırı', description: 'Dayanılmaz' },
    ],
  },
  {
    id: 'comp_resistance',
    category: 'compulsion',
    question: 'Kompulsiyonlara ne kadar direnebiliyorsunuz?',
    options: [
      { value: 0, label: 'Her zaman', description: 'Tam direnç' },
      { value: 1, label: 'Çok', description: 'Çok direnç' },
      { value: 2, label: 'Orta', description: 'Orta direnç' },
      { value: 3, label: 'Az', description: 'Az direnç' },
      { value: 4, label: 'Hiç', description: 'Direnç yok' },
    ],
  },
  {
    id: 'comp_control',
    category: 'compulsion',
    question: 'Kompulsiyonlarınız üzerinde ne kadar kontrolünüz var?',
    options: [
      { value: 0, label: 'Tam', description: 'Tam kontrol' },
      { value: 1, label: 'Çok', description: 'Çok kontrol' },
      { value: 2, label: 'Orta', description: 'Orta kontrol' },
      { value: 3, label: 'Az', description: 'Az kontrol' },
      { value: 4, label: 'Hiç', description: 'Kontrol yok' },
    ],
  },
];

interface YBOCSAssessmentProps {
  onComplete: (result: YBOCSResult) => void;
  onSkip?: () => void;
}

interface YBOCSResult {
  answers: Record<string, number>;
  obsessionScore: number;
  compulsionScore: number;
  totalScore: number;
  severity: string;
}

export function YBOCSAssessment({ onComplete, onSkip }: YBOCSAssessmentProps) {
  const { t } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const calculateResults = (): YBOCSResult => {
    const obsessionScore = YBOCS_QUESTIONS
      .filter(q => q.category === 'obsession')
      .reduce((sum, q) => sum + (answers[q.id] || 0), 0);

    const compulsionScore = YBOCS_QUESTIONS
      .filter(q => q.category === 'compulsion')
      .reduce((sum, q) => sum + (answers[q.id] || 0), 0);

    const totalScore = obsessionScore + compulsionScore;

    let severity = 'Subklinik';
    if (totalScore >= 32) severity = 'Çok Şiddetli';
    else if (totalScore >= 24) severity = 'Şiddetli';
    else if (totalScore >= 16) severity = 'Orta';
    else if (totalScore >= 8) severity = 'Hafif';

    return {
      answers,
      obsessionScore,
      compulsionScore,
      totalScore,
      severity,
    };
  };

  const handleAnswer = (value: number) => {
    const questionId = YBOCS_QUESTIONS[currentQuestion].id;
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < YBOCS_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Assessment completed
      const result = calculateResults();
      onComplete(result);
    }
  };

  const question = YBOCS_QUESTIONS[currentQuestion];
  const progress = (currentQuestion + 1) / YBOCS_QUESTIONS.length;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Y-BOCS Değerlendirmesi</Text>
          <Text style={styles.subtitle}>
            {currentQuestion + 1} / {YBOCS_QUESTIONS.length}
          </Text>

          <ProgressBar progress={progress} style={styles.progress} />

          <Text style={styles.question}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <Card key={index} style={styles.optionCard}>
                <Card.Content style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <RadioButton
                      value={option.value.toString()}
                      status={answers[question.id] === option.value ? 'checked' : 'unchecked'}
                      onPress={() => handleAnswer(option.value)}
                    />
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </View>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>

          {currentQuestion > 0 && (
            <Button
              mode="outlined"
              onPress={() => setCurrentQuestion(currentQuestion - 1)}
              style={styles.backButton}
            >
              Önceki Soru
            </Button>
          )}

          {onSkip && (
            <Button
              mode="text"
              onPress={onSkip}
              style={styles.skipButton}
            >
              Şimdilik Atla
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  progress: {
    marginBottom: 24,
    height: 8,
    borderRadius: 4,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  optionContent: {
    paddingVertical: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  optionDescription: {
    fontSize: 14,
    marginLeft: 40,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  backButton: {
    marginBottom: 12,
  },
  skipButton: {
    marginTop: 8,
  },
});