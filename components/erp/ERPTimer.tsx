
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Text, Button, ProgressBar, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '@/hooks/useTranslation';
import { Slider } from '@/components/ui/Slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ERPSession {
  id: string;
  exerciseId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  initialAnxiety: number;
  peakAnxiety: number;
  finalAnxiety: number;
  resistanceCount: number;
  targetDuration: number;
  notes?: string;
}

interface ERPTimerProps {
  exerciseId: string;
  exerciseName: string;
  exerciseDescription: string;
  onSessionComplete: (session: ERPSession) => void;
  onCancel: () => void;
}

export function ERPTimer({
  exerciseId,
  exerciseName,
  exerciseDescription,
  onSessionComplete,
  onCancel
}: ERPTimerProps) {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [targetDuration, setTargetDuration] = useState(10); // minutes
  const [initialAnxiety, setInitialAnxiety] = useState(5);
  const [currentAnxiety, setCurrentAnxiety] = useState(5);
  const [peakAnxiety, setPeakAnxiety] = useState(5);
  const [resistanceCount, setResistanceCount] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'running' | 'completed'>('setup');
  const [lastAnxietyCheck, setLastAnxietyCheck] = useState(Date.now());
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const anxietyHistoryRef = useRef<Array<{time: number, level: number}>>([]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Anxiety check reminders every 5 minutes
  useEffect(() => {
    if (isRunning && duration > 0 && duration % 300 === 0) {
      Alert.alert(
        t('erp.anxietyCheck'),
        t('erp.rateCurrentAnxiety'),
        [{ text: 'OK' }]
      );
    }
  }, [duration, isRunning, t]);

  // Motivational messages every 10 minutes
  useEffect(() => {
    if (isRunning && duration > 0 && duration % 600 === 0) {
      const messages = [
        t('erp.motivationMessage1'),
        t('erp.motivationMessage2'),
        t('erp.motivationMessage3'),
        t('erp.motivationMessage4')
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      Alert.alert(t('erp.keepGoing'), randomMessage, [{ text: 'OK' }]);
    }
  }, [duration, isRunning, t]);

  const startSession = () => {
    setPhase('running');
    setIsRunning(true);
    anxietyHistoryRef.current = [{time: 0, level: initialAnxiety}];
    setCurrentAnxiety(initialAnxiety);
    setPeakAnxiety(initialAnxiety);
  };

  const handleAnxietyUpdate = (level: number) => {
    setCurrentAnxiety(level);
    setPeakAnxiety(Math.max(peakAnxiety, level));
    anxietyHistoryRef.current.push({time: duration, level});
  };

  const recordResistance = () => {
    setResistanceCount(prev => prev + 1);
    Alert.alert(
      t('erp.resistanceRecorded'),
      t('erp.stayStrong'),
      [{ text: 'OK' }]
    );
  };

  const completeSession = async () => {
    setIsRunning(false);
    setPhase('completed');
    
    const session: ERPSession = {
      id: Date.now().toString(),
      exerciseId,
      startTime: new Date(Date.now() - duration * 1000),
      endTime: new Date(),
      duration,
      initialAnxiety,
      peakAnxiety,
      finalAnxiety: currentAnxiety,
      resistanceCount,
      targetDuration: targetDuration * 60,
      notes: ''
    };

    // Save to AsyncStorage
    try {
      const existingSessions = await AsyncStorage.getItem('erpSessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(session);
      await AsyncStorage.setItem('erpSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving ERP session:', error);
    }

    onSessionComplete(session);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = targetDuration > 0 ? Math.min(duration / (targetDuration * 60), 1) : 0;

  if (phase === 'setup') {
    return (
      <Card style={styles.container}>
        <Card.Content>
          <Text style={styles.title}>{exerciseName}</Text>
          <Text style={styles.description}>{exerciseDescription}</Text>
          
          <View style={styles.setupSection}>
            <Text style={styles.sectionTitle}>{t('erp.targetDuration')}</Text>
            <Slider
              value={targetDuration}
              onValueChange={setTargetDuration}
              minimumValue={5}
              maximumValue={60}
              step={5}
              formatLabel={(value) => `${value} ${t('common.minutes')}`}
            />
          </View>

          <View style={styles.setupSection}>
            <Text style={styles.sectionTitle}>{t('erp.initialAnxiety')}</Text>
            <Slider
              value={initialAnxiety}
              onValueChange={setInitialAnxiety}
              minimumValue={1}
              maximumValue={10}
              step={1}
              formatLabel={(value) => `${value}/10`}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button mode="outlined" onPress={onCancel} style={styles.button}>
              {t('common.cancel')}
            </Button>
            <Button mode="contained" onPress={startSession} style={styles.button}>
              {t('erp.startSession')}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  if (phase === 'running') {
    return (
      <Card style={styles.container}>
        <LinearGradient
          colors={['#E3F2FD', '#BBDEFB']}
          style={styles.headerGradient}
        >
          <Text style={styles.title}>{exerciseName}</Text>
          <Text style={styles.timer}>{formatTime(duration)}</Text>
          <ProgressBar 
            progress={progress} 
            style={styles.progressBar}
            color="#2196F3"
          />
          <Text style={styles.progressText}>
            {t('erp.target')}: {targetDuration} {t('common.minutes')}
          </Text>
        </LinearGradient>

        <Card.Content style={styles.content}>
          <View style={styles.anxietySection}>
            <Text style={styles.sectionTitle}>{t('erp.currentAnxiety')}</Text>
            <View style={styles.anxietyRow}>
              <Chip 
                icon="trending-up" 
                style={[styles.anxietyChip, { backgroundColor: getAnxietyColor(peakAnxiety) }]}
              >
                {t('erp.peak')}: {peakAnxiety}/10
              </Chip>
              <Chip 
                icon="pulse" 
                style={[styles.anxietyChip, { backgroundColor: getAnxietyColor(currentAnxiety) }]}
              >
                {t('erp.current')}: {currentAnxiety}/10
              </Chip>
            </View>
            
            <Slider
              value={currentAnxiety}
              onValueChange={handleAnxietyUpdate}
              minimumValue={1}
              maximumValue={10}
              step={1}
              formatLabel={(value) => `${value}/10`}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{resistanceCount}</Text>
              <Text style={styles.statLabel}>{t('erp.resistances')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor(duration / 60)}</Text>
              <Text style={styles.statLabel}>{t('common.minutes')}</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Button 
              mode="outlined" 
              onPress={recordResistance}
              style={styles.button}
              icon="alert"
            >
              {t('erp.recordResistance')}
            </Button>
            <Button 
              mode="contained" 
              onPress={completeSession}
              style={styles.button}
              buttonColor="#4CAF50"
            >
              {t('erp.complete')}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return null;
}

const getAnxietyColor = (level: number): string => {
  if (level <= 3) return '#4CAF50';
  if (level <= 6) return '#FF9800';
  return '#F44336';
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  headerGradient: {
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1976D2',
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
    width: '100%',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  setupSection: {
    marginVertical: 16,
  },
  anxietySection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  anxietyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  anxietyChip: {
    paddingHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
