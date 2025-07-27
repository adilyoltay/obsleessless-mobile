import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface PickerProps {
  selectedValue?: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  placeholder?: string;
}

export function Picker({ selectedValue, onValueChange, items, placeholder }: PickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{placeholder}</Text>
      {items.map((item) => (
        <View key={item.value} style={styles.option}>
          <Text 
            style={[styles.optionText, selectedValue === item.value && styles.selectedOption]}
            onPress={() => onValueChange?.(item.value)}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOption: {
    color: '#10b981',
    fontWeight: 'bold',
  },
});