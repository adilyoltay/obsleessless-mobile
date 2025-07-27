import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompulsionQuickEntry } from '@/components/forms/CompulsionQuickEntry';
import { CompulsionEntry } from '@/types/compulsion';

export default function TrackingScreen() {
  const [lastEntry, setLastEntry] = useState<CompulsionEntry | null>(null);

  const handleCompulsionSaved = (entry: CompulsionEntry) => {
    setLastEntry(entry);
    // TODO: Refresh compulsion list, update stats
  };

  return (
    <SafeAreaView style={styles.container}>
      <CompulsionQuickEntry onSave={handleCompulsionSaved} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});