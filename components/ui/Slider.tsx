import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
}

export function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  minimumTrackTintColor = '#10B981',
  maximumTrackTintColor = '#E5E7EB',
  thumbTintColor = '#10B981',
  style,
}: SliderProps) {
  // Expo Go için basit slider implementasyonu
  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <View 
          style={[
            styles.minimumTrack, 
            { 
              width: `${percentage}%`,
              backgroundColor: minimumTrackTintColor 
            }
          ]} 
        />
        <View 
          style={[
            styles.maximumTrack,
            { backgroundColor: maximumTrackTintColor }
          ]} 
        />
        <View 
          style={[
            styles.thumb, 
            { 
              left: `${percentage}%`,
              backgroundColor: thumbTintColor 
            }
          ]} 
        />
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{Math.round(value)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  track: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    position: 'relative',
    width: '100%',
  },
  minimumTrack: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  maximumTrack: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    right: 0,
    top: 0,
    left: 0,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  valueContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});