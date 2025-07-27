import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Vibration, Platform, ScrollView } from 'react-native';
import { Text, Card, Button, IconButton, ProgressBar } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

interface ERPTimerProps {
  targetDuration?: number;
  onComplete?: (sessionData: any) => void;
}

export function ERPTimer({ 
  exercise, 
  onComplete 
}: { 
  exercise: any;
  onComplete: (data: any) => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [anxietyHistory, setAnxietyHistory] = useState<Array<{time: number, level: number}>>([]);
  const [targetDuration, setTargetDuration] = useState(300); // 5 minutes default

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    recordAnxiety();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    recordAnxiety();

    const sessionData = {
      exerciseId: exercise?.id,
      duration: seconds,
      targetDuration,
      anxietyHistory,
      peakAnxiety: Math.max(...anxietyHistory.map(h => h.level)),
      finalAnxiety: anxietyLevel,
      timestamp: new Date().toISOString()
    };

    onComplete(sessionData);
  };

  const recordAnxiety = () => {
    setAnxietyHistory(prev => [...prev, { time: seconds, level: anxietyLevel }]);
  };

  const progress = Math.min(seconds / targetDuration, 1);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {exercise?.title || 'ERP Egzersizi'}
          </Text>

          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <Text variant="displayMedium" style={styles.timerText}>
              {formatTime(seconds)}
            </Text>
            <Text variant="bodyMedium" style={styles.targetText}>
              Hedef: {formatTime(targetDuration)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progress * 100}%` }]} 
              />
            </View>
            <Text variant="bodySmall">
              {Math.round(progress * 100)}% tamamlandı
            </Text>
          </View>

          {/* Anxiety Level */}
          <View style={styles.anxietyContainer}>
            <Text variant="titleMedium" style={styles.anxietyLabel}>
              Mevcut Kaygı Seviyesi: {anxietyLevel}/10
            </Text>
            <Slider
              style={styles.anxietySlider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={anxietyLevel}
              onValueChange={setAnxietyLevel}
              onSlidingComplete={recordAnxiety}
              minimumTrackTintColor="#EF4444"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#EF4444"
            />
            <View style={styles.anxietyLabels}>
              <Text variant="bodySmall">Düşük</Text>
              <Text variant="bodySmall">Yüksek</Text>
            </View>
          </View>

          {/* Exercise Description */}
          {exercise?.description && (
            <View style={styles.descriptionContainer}>
              <Text variant="titleSmall">Egzersiz Açıklaması:</Text>
              <Text variant="bodyMedium" style={styles.description}>
                {exercise.description}
              </Text>
            </View>
          )}

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            {!isRunning ? (
              <Button
                mode="contained"
                onPress={handleStart}
                style={styles.startButton}
                icon="play"
              >
                Başla
              </Button>
            ) : (
              <>
                <Button
                  mode="outlined"
                  onPress={handlePause}
                  style={styles.controlButton}
                  icon={isPaused ? "play" : "pause"}
                >
                  {isPaused ? 'Devam' : 'Duraklat'}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleStop}
                  style={styles.controlButton}
                  buttonColor="#EF4444"
                  icon="stop"
                >
                  Bitir
                </Button>
              </>
            )}
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
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#6B7280',
  },
  anxietyContainer: {
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
  anxietyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  descriptionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
  },
  description: {
    color: '#374151',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  startButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginHorizontal: 8,
  },
});