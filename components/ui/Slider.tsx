import React from 'react';
import { View, StyleSheet, PanGestureHandler, Animated } from 'react-native';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  thumbStyle?: any;
  trackStyle?: any;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  style?: any;
}

export function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 10,
  step = 1,
  thumbStyle,
  trackStyle,
  minimumTrackTintColor = '#10B981',
  maximumTrackTintColor = '#E5E7EB',
  style,
}: SliderProps) {
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const position = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (sliderWidth > 0) {
      const percentage = (value - minimumValue) / (maximumValue - minimumValue);
      const newPosition = percentage * (sliderWidth - 24);
      position.setValue(newPosition);
    }
  }, [value, sliderWidth, minimumValue, maximumValue]);

  const handleSliderLayout = (event: any) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  const handlePanGestureEvent = (event: any) => {
    const { x } = event.nativeEvent;
    const percentage = Math.max(0, Math.min(1, x / (sliderWidth - 24)));
    const newValue = minimumValue + percentage * (maximumValue - minimumValue);
    const steppedValue = Math.round(newValue / step) * step;
    onValueChange(steppedValue);
  };

  const percentage = sliderWidth > 0 ? (value - minimumValue) / (maximumValue - minimumValue) : 0;

  return (
    <View style={[styles.container, style]}>
      <View 
        style={[styles.track, trackStyle, { backgroundColor: maximumTrackTintColor }]}
        onLayout={handleSliderLayout}
      >
        <View 
          style={[
            styles.activeTrack, 
            { 
              width: `${percentage * 100}%`,
              backgroundColor: minimumTrackTintColor 
            }
          ]} 
        />
        <Animated.View
          style={[
            styles.thumb,
            thumbStyle,
            {
              left: percentage * (sliderWidth - 24),
              backgroundColor: minimumTrackTintColor,
            }
          ]}
          onTouchEnd={handlePanGestureEvent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
  },
  activeTrack: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: -9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});