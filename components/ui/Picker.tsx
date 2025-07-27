import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface PickerProps {
  selectedValue?: string;
  onValueChange: (value: string) => void;
  style?: any;
  children?: React.ReactNode;
}

export function Picker({ children, selectedValue, onValueChange, style, ...props }: PickerProps) {
  const items = React.Children.toArray(children).map((child: any) => ({
    label: child.props.label,
    value: child.props.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <select
        value={selectedValue}
        onChange={(e) => onValueChange?.(e.target.value)}
        style={styles.select}
        {...props}
      >
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </View>
  );
}

Picker.Item = ({ label, value }: { label: string; value: string }) => null;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  select: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    border: 'none',
    outline: 'none',
    width: '100%',
    borderRadius: 8,
  },
});