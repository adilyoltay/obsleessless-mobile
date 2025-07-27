import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface PickerProps {
  selectedValue?: string;
  onValueChange: (value: string) => void;
  style?: any;
  children: React.ReactNode;
}

interface PickerItemProps {
  label: string;
  value: string;
}

const PickerItem = ({ label, value }: PickerItemProps) => null;

export function Picker({ selectedValue, onValueChange, style, children }: PickerProps) {
  // Web için basit select element kullanıyoruz
  return (
    <View style={[styles.container, style]}>
      <select
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        style={styles.select}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.props) {
            return (
              <option key={child.props.value} value={child.props.value}>
                {child.props.label}
              </option>
            );
          }
          return null;
        })}
      </select>
    </View>
  );
}

Picker.Item = PickerItem;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  select: {
    width: '100%',
    height: 50,
    padding: 12,
    fontSize: 16,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
  },
});