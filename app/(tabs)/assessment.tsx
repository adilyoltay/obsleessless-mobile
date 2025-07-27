
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { YBOCSAssessment } from '@/components/assessment/YBOCSAssessment';
import { useTranslation } from '@/hooks/useTranslation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AssessmentScreen() {
  const { t } = useTranslation();
  const [showAssessment, setShowAssessment] = useState(false);
  const [lastScore, setLastScore] = useState<any>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);

  useEffect(() => {
    loadAssessmentData();
  }, []);

  const loadAssessmentData = async () => {
    try {
      const lastScoreData = await AsyncStorage.getItem('lastYBOCSScore');
      const historyData = await AsyncStorage.getItem('ybocs_history');
      
      if (lastScoreData) {
        setLastScore(JSON.parse(lastScoreData));
      }
      if (historyData) {
        setAssessmentHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.error('Error loading assessment data:', error);
    }
  };

  const handleAssessmentComplete = (score: any) => {
    setShowAssessment(false);
    setLastScore(score);
    loadAssessmentData();
  };

  const getSeverityInfo = (score: number) => {
    if (score < 8) return { level: 'Subklinik', color: '#10B981', icon: 'check-circle' };
    if (score < 16) return { level: 'Hafif', color: '#F59E0B', icon: 'alert-circle' };
    if (score < 24) return { level: 'Orta', color: '#EF4444', icon: 'minus-circle' };
    if (score < 32) return { level: 'Şiddetli', color: '#DC2626', icon: 'alert-triangle' };
    return { level: 'Aşırı Şiddetli', color: '#7C2D12', icon: 'alert-octagon' };
  };

  if (showAssessment) {
    return (
      <ScreenLayout scrollable={false} backgroundColor="#FAFAFA">
        <YBOCSAssessment onComplete={handleAssessmentComplete} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable backgroundColor="#FAFAFA">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Assessment Overview */}
        <Card style={styles.overviewCard} mode="elevated">
          <Card.Content>
            <View style={styles.headerContainer}>
              <Avatar.Icon 
                size={48} 
                icon="clipboard-text" 
                style={styles.avatar}
              />
              <View style={styles.headerText}>
                <Title style={styles.headerTitle}>Y-BOCS Değerlendirmesi</Title>
                <Paragraph style={styles.headerSubtitle}>
                  OKB semptomlarınızın şiddetini ölçün
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Current Score */}
        {lastScore && (
          <Card style={styles.scoreCard} mode="elevated">
            <Card.Content>
              <View style={styles.scoreHeader}>
                <Title style={styles.scoreTitle}>Son Değerlendirme</Title>
                <Chip 
                  icon="calendar"
                  style={styles.dateChip}
                  textStyle={styles.chipText}
                >
                  {new Date(lastScore.timestamp).toLocaleDateString('tr-TR')}
                </Chip>
              </View>
              
              <View style={styles.scoreContent}>
                <View style={styles.scoreDisplay}>
                  <View style={[styles.scoreCircle, { backgroundColor: getSeverityInfo(lastScore.totalScore).color }]}>
                    <Paragraph style={styles.scoreNumber}>{lastScore.totalScore}</Paragraph>
                    <Paragraph style={styles.scoreMax}>/ 40</Paragraph>
                  </View>
                  <View style={styles.scoreDetails}>
                    <Paragraph style={styles.severityLevel}>
                      {getSeverityInfo(lastScore.totalScore).level}
                    </Paragraph>
                    <View style={styles.subscores}>
                      <View style={styles.subscore}>
                        <Paragraph style={styles.subscoreLabel}>Obsesyon</Paragraph>
                        <Paragraph style={styles.subscoreValue}>{lastScore.obsessionScore}</Paragraph>
                      </View>
                      <View style={styles.subscore}>
                        <Paragraph style={styles.subscoreLabel}>Kompülsiyon</Paragraph>
                        <Paragraph style={styles.subscoreValue}>{lastScore.compulsionScore}</Paragraph>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Assessment Actions */}
        <Card style={styles.actionsCard} mode="elevated">
          <Card.Content>
            <Title style={styles.cardTitle}>Değerlendirme İşlemleri</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="play"
                onPress={() => setShowAssessment(true)}
                style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                contentStyle={styles.buttonContent}
              >
                {lastScore ? 'Yeniden Değerlendir' : 'Değerlendirme Başlat'}
              </Button>
            </View>
            
            <View style={styles.infoText}>
              <MaterialCommunityIcons name="information" size={16} color="#6B7280" />
              <Paragraph style={styles.infoDescription}>
                Y-BOCS değerlendirmesi yaklaşık 5 dakika sürer ve 10 sorudan oluşur.
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Progress History */}
        {assessmentHistory.length > 0 && (
          <Card style={styles.historyCard} mode="elevated">
            <Card.Content>
              <Title style={styles.cardTitle}>İlerleme Geçmişi</Title>
              <View style={styles.historyList}>
                {assessmentHistory.slice(0, 5).map((assessment, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyDate}>
                      <MaterialCommunityIcons name="calendar" size={16} color="#6B7280" />
                      <Paragraph style={styles.historyDateText}>
                        {new Date(assessment.timestamp).toLocaleDateString('tr-TR')}
                      </Paragraph>
                    </View>
                    <View style={styles.historyScore}>
                      <Paragraph style={styles.historyScoreValue}>
                        {assessment.totalScore}/40
                      </Paragraph>
                      <Chip 
                        style={[
                          styles.historySeverityChip,
                          { backgroundColor: getSeverityInfo(assessment.totalScore).color + '20' }
                        ]}
                        textStyle={[
                          styles.historySeverityText,
                          { color: getSeverityInfo(assessment.totalScore).color }
                        ]}
                      >
                        {getSeverityInfo(assessment.totalScore).level}
                      </Chip>
                    </View>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Information Card */}
        <Card style={styles.infoCard} mode="elevated">
          <Card.Content>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="lightbulb" size={20} color="#F59E0B" />
              <Title style={styles.infoTitle}>Y-BOCS Hakkında</Title>
            </View>
            <View style={styles.infoPoints}>
              <Paragraph style={styles.infoPoint}>
                • Yale-Brown Obsesif Kompulsif Ölçeği (Y-BOCS) altın standart değerlendirme aracıdır
              </Paragraph>
              <Paragraph style={styles.infoPoint}>
                • 0-40 puan arasında değer alır
              </Paragraph>
              <Paragraph style={styles.infoPoint}>
                • Düzenli değerlendirme ilerlemenizi takip etmenize yardımcı olur
              </Paragraph>
              <Paragraph style={styles.infoPoint}>
                • Profesyonel tedaviyi destekleyici bir araçtır
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  overviewCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#3B82F6',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scoreCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateChip: {
    backgroundColor: '#F3F4F6',
  },
  chipText: {
    fontSize: 12,
  },
  scoreContent: {
    alignItems: 'center',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreMax: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  scoreDetails: {
    alignItems: 'center',
  },
  severityLevel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  subscores: {
    flexDirection: 'row',
    gap: 20,
  },
  subscore: {
    alignItems: 'center',
  },
  subscoreLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  subscoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButtons: {
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  infoText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  historyCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyDateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyScoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  historySeverityChip: {
    borderRadius: 12,
  },
  historySeverityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 24,
    backgroundColor: '#FEF3C7',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  infoPoints: {
    gap: 8,
  },
  infoPoint: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});
