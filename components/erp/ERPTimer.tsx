import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Vibration, Platform } from 'react-native';
import { Text, Card, Button, IconButton, ProgressBar } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

interface ERPTimerProps {
  targetDuration?: number;
  onComplete?: (sessionData: any) => void;
}

export function ERPTimer({ targetDuration = 300, onComplete }: ERPTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [anxietyHistory, setAnxietyHistory] = useState<Array<{time: number, level: number}>>([]);
  const [sessionStarted, setSessionStarted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout>();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(time => time + 1);
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
  }, [isActive, isPaused]);

  useEffect(() => {
    const progress = Math.min(time / targetDuration, 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    if (time > 0 && time >= targetDuration) {
      completeSession();
    }
  }, [time]);

  useEffect(() => {
    if (isActive) {
      startPulseAnimation();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setIsActive(true);
    setSessionStarted(true);
    setTime(0);
    setAnxietyHistory([{time: 0, level: anxietyLevel}]);
          // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Geçici olarak devre dışı
    Toast.show({
      type: 'info',
      text1: 'ERP Seansı Başladı',
      text2: 'Anksiyete seviyenizi düzenli olarak güncelleyin',
    });
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stopSession = () => {
    setIsActive(false);
    setIsPaused(false);
    completeSession();
  };

  const completeSession = () => {
    setIsActive(false);
    setIsPaused(false);

    const sessionData = {
      duration: time,
      targetDuration,
      anxietyHistory,
      completed: time >= targetDuration,
      averageAnxiety: anxietyHistory.reduce((sum, entry) => sum + entry.level, 0) / anxietyHistory.length,
      timestamp: new Date(),
    };

    // Vibration for completion
    Vibration.vibrate([200, 100, 200]);

    Toast.show({
      type: 'success',
      text1: 'Seans Tamamlandı!',
      text2: `${formatTime(time)} süre ile başarıyla tamamlandı`,
    });

    onComplete?.(sessionData);
  };

  const updateAnxietyLevel = (newLevel: number) => {
    setAnxietyLevel(newLevel);
    if (isActive) {
      setAnxietyHistory(prev => [...prev, {time, level: newLevel}]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getAnxietyColor = (level: number) => {
    if (level <= 3) return '#10B981';
    if (level <= 6) return '#F59E0B';
    return '#EF4444';
  };

  const progress = Math.min(time / targetDuration, 1);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            ERP Egzersiz Zamanlayıcısı
          </Text>

          {/* Timer Display */}
          <Animated.View 
            style={[
              styles.timerContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Text variant="displayMedium" style={styles.timerText}>
              {formatTime(time)}
            </Text>
            <Text variant="bodyMedium" style={styles.targetText}>
              Hedef: {formatTime(targetDuration)}
            </Text>
          </Animated.View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progress} 
              color="#10B981"
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              %{Math.round(progress * 100)} tamamlandı
            </Text>
          </View>

          {/* Anxiety Level Slider */}
          <View style={styles.anxietySection}>
            <Text variant="labelLarge" style={styles.anxietyLabel}>
              Anksiyete Seviyesi: {anxietyLevel}/10
            </Text>
            <Slider
              style={styles.anxietySlider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={anxietyLevel}
              onValueChange={updateAnxietyLevel}
              minimumTrackTintColor={getAnxietyColor(anxietyLevel)}
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor={getAnxietyColor(anxietyLevel)}
            />
            <View style={styles.sliderLabels}>
              <Text variant="bodySmall">Rahat (0)</Text>
              <Text variant="bodySmall">Panik (10)</Text>
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controls}>
            {!sessionStarted ? (
              <Button
                mode="contained"
                onPress={startSession}
                style={styles.startButton}
                buttonColor="#10B981"
                icon="play"
              >
                Seansı Başlat
              </Button>
            ) : (
              <View style={styles.activeControls}>
                <IconButton
                  icon={isPaused ? "play" : "pause"}
                  size={30}
                  onPress={pauseSession}
                  style={styles.controlButton}
                  iconColor="#3B82F6"
                />
                <IconButton
                  icon="stop"
                  size={30}
                  onPress={stopSession}
                  style={styles.controlButton}
                  iconColor="#EF4444"
                />
              </View>
            )}
          </View>

          {/* Session Info */}
          {anxietyHistory.length > 1 && (
            <View style={styles.sessionInfo}>
              <Text variant="bodySmall" style={styles.infoText}>
                Anksiyete değişimi: {anxietyHistory.length} kayıt
              </Text>
              <Text variant="bodySmall" style={styles.infoText}>
                Ortalama seviye: {(anxietyHistory.reduce((sum, entry) => sum + entry.level, 0) / anxietyHistory.length).toFixed(1)}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  card: {
    elevation: 4,
    borderRadius: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
  },
  timerText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  targetText: {
    color: '#6B7280',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#6B7280',
  },
  anxietySection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  anxietyLabel: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  anxietySlider: {
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  controls: {
    alignItems: 'center',
    marginBottom: 16,
  },
  startButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    backgroundColor: '#F3F4F6',
  },
  sessionInfo: {
    padding: 12,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    color: '#1E40AF',
    marginVertical: 2,
  },
});