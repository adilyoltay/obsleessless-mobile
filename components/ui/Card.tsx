import React from 'react';
import {
  View,
  ViewStyle,
  Platform,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  gradientColors?: [string, string, ...string[]];
  padding?: number;
  borderRadius?: number;
}

const Card = ({
  children,
  style,
  variant = 'default',
  gradientColors = ['#F0FDF4', '#DCFCE7'],
  padding = 16,
  borderRadius = 12,
}: CardProps) => {
  const cardStyle = [
    styles.card,
    styles[variant],
    {
      padding,
      borderRadius,
    },
    style,
  ];

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={gradientColors}
        style={cardStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

  return <View style={cardStyle} pointerEvents="auto">{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  default: {
    backgroundColor: '#FFFFFF',
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gradient: {
    // LinearGradient will handle the styling
  },
});

export default Card;