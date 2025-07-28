import React from 'react';
import { StyleSheet } from 'react-native';
import { Picker as RNPicker } from '@react-native-picker/picker';

interface PickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: any;
  children: React.ReactNode;
}

interface PickerItemProps {
  label: string;
  value: string;
}

export function Picker({ selectedValue, onValueChange, style, children }: PickerProps) {
  return (
    <RNPicker
      selectedValue={selectedValue}
      onValueChange={onValueChange}
      style={[styles.picker, style]}
    >
      {children}
    </RNPicker>
  );
}

Picker.Item = function PickerItem({ label, value }: PickerItemProps) {
  return <RNPicker.Item label={label} value={value} />;
};

const styles = StyleSheet.create({
  picker: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});