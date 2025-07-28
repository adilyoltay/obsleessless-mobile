
<old_str>import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ERPTimerProps {
  // Props will be defined here
}

export const ERPTimer: React.FC<ERPTimerProps> = () => {
  return (
    <View style={styles.container}>
      <Text>ERP Timer Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});</old_str>
<new_str>import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  Dimensions,
  Vibration,
  AppState,
  AppStateStatus 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface ERPSession {
  id: string;
  exerciseId: string;
  exerciseName: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  completed: boolean;
  anxietyLevels: AnxietyReading[];
  notes?: string;
}

interface AnxietyReading {
  timestamp: string;
  level: number; // 0-10
  timeInSession: number; // seconds from start
}

interface ERPTimerProps {
  exerciseId: string;
  exerciseName: string;
  recommendedDuration?: number; // in seconds
  onComplete?: (session: ERPSession) => void;
  onCancel?: () => void;
}

const { width } = Dimensions.get('window');

export const ERPTimer: React.FC<ERPTimerProps> = ({
  exerciseId,
  exerciseName,
  recommendedDuration = 900, // 15 minutes default
  onComplete,
  onCancel,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [anxietyReadings, setAnxietyReadings] = useState<AnxietyReading[]>([]);
  const [sessionId] = useState(() => `erp_${Date.now()}`);
  const [startTime, setStartTime] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const backgroundTimeRef = useRef<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  // Anxiety reminder effect
  useEffect(() => {
    if (isRunning && timeElapsed > 0 && timeElapsed % 300 === 0) { // Every 5 minutes
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [timeElapsed, isRunning]);

  // App state handling for background timer
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground
        if (backgroundTimeRef.current && isRunning && !isPaused) {
          const timeDiff = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
          setTimeElapsed(prev => prev + timeDiff);
        }
        backgroundTimeRef.current = null;
      } else if (nextAppState.match(/inactive|background/) && isRunning && !isPaused) {
        // App going to background
        backgroundTimeRef.current = Date.now();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isRunning, isPaused]);

  const startTimer = () => {
    const now = new Date().toISOString();
    setStartTime(now);
    setIsRunning(true);
    setIsPaused(false);
    setTimeElapsed(0);
    setAnxietyReadings([]);
    
    // Record initial anxiety level
    recordAnxietyLevel();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resumeTimer = () => {
    setIsPaused(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    Alert.alert(
      'Oturum Sonlandır',
      'Bu ERP oturumunu tamamlamak istiyor musunuz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
          onPress: () => {
            setIsRunning(true);
          }
        },
        {
          text: 'Tamamla',
          onPress: completeSession
        }
      ]
    );
  };

  const recordAnxietyLevel = () => {
    const reading: AnxietyReading = {
      timestamp: new Date().toISOString(),
      level: anxietyLevel,
      timeInSession: timeElapsed,
    };
    
    setAnxietyReadings(prev => [...prev, reading]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const completeSession = async () => {
    if (!startTime) return;

    const session: ERPSession = {
      id: sessionId,
      exerciseId,
      exerciseName,
      startTime,
      endTime: new Date().toISOString(),
      duration: timeElapsed,
      completed: true,
      anxietyLevels: anxietyReadings,
    };

    try {
      // Save session to AsyncStorage
      const existingSessions = await AsyncStorage.getItem('erpSessions');
      const sessions: ERPSession[] = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(session);
      await AsyncStorage.setItem('erpSessions', JSON.stringify(sessions));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete?.(session);
    } catch (error) {
      console.error('Error saving ERP session:', error);
      Alert.alert('Hata', 'Oturum kaydedilemedi');
    }
  };

  const cancelSession = () => {
    Alert.alert(
      'Oturumu İptal Et',
      'Bu ERP oturumunu iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet',
          style: 'destructive',
          onPress: () => {
            setIsRunning(false);
            setIsPaused(false);
            setTimeElapsed(0);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            onCancel?.();
          }
        }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnxietyColor = (level: number) => {
    if (level <= 3) return '#10B981'; // Green
    if (level <= 6) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const progressPercentage = (timeElapsed / recommendedDuration) * 100;

  return (
    <View style={styles.container}>
      <Card style={styles.timerCard}>
        <Text style={styles.exerciseName}>{exerciseName}</Text>
        
        {/* Timer Display */}
        <View style={styles.timerDisplay}>
          <Text style={styles.timeText}>{formatTime(timeElapsed)}</Text>
          {isPaused && <Text style={styles.pausedText}>DURAKLATILDI</Text>}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={Math.min(progressPercentage, 100)}
            height={8}
            backgroundColor="#E5E7EB"
            progressColor="#10B981"
          />
          <Text style={styles.progressText}>
            Hedef: {formatTime(recommendedDuration)}
          </Text>
        </View>

        {/* Anxiety Level Tracker */}
        <Card style={styles.anxietyCard}>
          <Text style={styles.anxietyTitle}>Anksiyete Seviyesi</Text>
          <View style={styles.anxietyLevel}>
            <Text style={[styles.anxietyNumber, { color: getAnxietyColor(anxietyLevel) }]}>
              {anxietyLevel}
            </Text>
            <Text style={styles.anxietyScale}>/10</Text>
          </View>
          
          <Slider
            value={anxietyLevel}
            onValueChange={setAnxietyLevel}
            minimumValue={0}
            maximumValue={10}
            step={1}
            style={styles.anxietySlider}
            minimumTrackTintColor={getAnxietyColor(anxietyLevel)}
            maximumTrackTintColor="#E5E7EB"
          />
          
          <View style={styles.anxietyLabels}>
            <Text style={styles.anxietyLabel}>Çok Düşük</Text>
            <Text style={styles.anxietyLabel}>Çok Yüksek</Text>
          </View>

          {isRunning && (
            <Button
              title="Anksiyete Seviyesini Kaydet"
              onPress={recordAnxietyLevel}
              style={styles.recordButton}
            />
          )}
        </Card>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {!isRunning ? (
            <Button
              title="Oturumu Başlat"
              onPress={startTimer}
              style={[styles.controlButton, styles.startButton]}
            />
          ) : (
            <View style={styles.runningControls}>
              {!isPaused ? (
                <Button
                  title="Duraklat"
                  onPress={pauseTimer}
                  style={[styles.controlButton, styles.pauseButton]}
                />
              ) : (
                <Button
                  title="Devam Et"
                  onPress={resumeTimer}
                  style={[styles.controlButton, styles.resumeButton]}
                />
              )}
              <Button
                title="Bitir"
                onPress={stopTimer}
                style={[styles.controlButton, styles.stopButton]}
              />
            </View>
          )}
          
          <Button
            title="İptal"
            onPress={cancelSession}
            style={[styles.controlButton, styles.cancelButton]}
          />
        </View>
      </Card>

      {/* Anxiety Readings Summary */}
      {anxietyReadings.length > 0 && (
        <Card style={styles.readingsCard}>
          <Text style={styles.readingsTitle}>Anksiyete Takibi</Text>
          <Text style={styles.readingsCount}>
            {anxietyReadings.length} kayıt alındı
          </Text>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  timerCard: {
    padding: 24,
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  pausedText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  anxietyCard: {
    width: '100%',
    padding: 20,
    marginBottom: 24,
  },
  anxietyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  anxietyLevel: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  anxietyNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  anxietyScale: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  anxietySlider: {
    width: '100%',
    height: 40,
    marginBottom: 8,
  },
  anxietyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  anxietyLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  recordButton: {
    backgroundColor: '#3B82F6',
  },
  controls: {
    width: '100%',
    gap: 12,
  },
  runningControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  resumeButton: {
    backgroundColor: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  readingsCard: {
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  readingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  readingsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
});</new_str>
