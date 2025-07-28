
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  Alert,
  Share,
  Linking 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Picker } from '@/components/ui/Picker';
import { Slider } from '@/components/ui/Slider';

interface SettingsData {
  dailyGoal: number;
  reminderEnabled: boolean;
  reminderTime: string;
  hapticFeedback: boolean;
  dataExport: boolean;
  language: 'tr' | 'en';
  themeMode: 'light' | 'dark' | 'system';
}

const defaultSettings: SettingsData = {
  dailyGoal: 3,
  reminderEnabled: true,
  reminderTime: '20:00',
  hapticFeedback: true,
  dataExport: true,
  language: 'tr',
  themeMode: 'light',
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: SettingsData) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Hata', 'Ayarlar kaydedilemedi');
    }
  };

  const updateSetting = <K extends keyof SettingsData>(
    key: K, 
    value: SettingsData[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const exportData = async () => {
    setLoading(true);
    try {
      // Collect all user data
      const compulsions = await AsyncStorage.getItem('compulsionEntries');
      const erpSessions = await AsyncStorage.getItem('erpSessions');
      const ybocs = await AsyncStorage.getItem('ybocs_assessment');
      const profile = await AsyncStorage.getItem('ocd_profile');

      const exportData = {
        exportDate: new Date().toISOString(),
        compulsions: compulsions ? JSON.parse(compulsions) : [],
        erpSessions: erpSessions ? JSON.parse(erpSessions) : [],
        ybocs: ybocs ? JSON.parse(ybocs) : null,
        profile: profile ? JSON.parse(profile) : null,
        settings: settings,
      };

      const dataString = JSON.stringify(exportData, null, 2);
      
      await Share.share({
        message: dataString,
        title: 'ObsessLess Veri Dışa Aktarımı',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Hata', 'Veriler dışa aktarılamadı');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Bu işlem tüm verilerinizi kalıcı olarak silecektir. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'compulsionEntries',
                'erpSessions',
                'ybocs_assessment',
                'ocd_profile',
                'achievements',
                'streaks',
              ]);
              Alert.alert('Başarılı', 'Tüm veriler silindi');
            } catch (error) {
              Alert.alert('Hata', 'Veriler silinemedi');
            }
          }
        }
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://obsessless.app/privacy');
  };

  const openTerms = () => {
    Linking.openURL('https://obsessless.app/terms');
  };

  const sendFeedback = () => {
    Linking.openURL('mailto:feedback@obsessless.app?subject=ObsessLess Geri Bildirim');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Ayarlar</ThemedText>

        {/* Daily Goals */}
        <Card style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Günlük Hedefler
          </ThemedText>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Günlük Kayıt Hedefi</Text>
              <Text style={styles.settingDescription}>
                Günde kaç kompulsiyon kaydı yapmayı hedefliyorsunuz
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                value={settings.dailyGoal}
                onValueChange={(value) => updateSetting('dailyGoal', Math.round(value))}
                minimumValue={1}
                maximumValue={10}
                step={1}
                style={styles.slider}
              />
              <Text style={styles.sliderValue}>{settings.dailyGoal}</Text>
            </View>
          </View>
        </Card>

        {/* Notifications */}
        <Card style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Bildirimler
          </ThemedText>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Günlük Hatırlatıcı</Text>
              <Text style={styles.settingDescription}>
                Günlük kayıt yapmayı hatırlatacak bildirim
              </Text>
            </View>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={(value) => updateSetting('reminderEnabled', value)}
            />
          </View>

          {settings.reminderEnabled && (
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Hatırlatıcı Saati</Text>
              </View>
              <Picker
                selectedValue={settings.reminderTime}
                onValueChange={(value) => updateSetting('reminderTime', value)}
                style={styles.timePicker}
              >
                <Picker.Item label="08:00" value="08:00" />
                <Picker.Item label="12:00" value="12:00" />
                <Picker.Item label="16:00" value="16:00" />
                <Picker.Item label="20:00" value="20:00" />
                <Picker.Item label="22:00" value="22:00" />
              </Picker>
            </View>
          )}
        </Card>

        {/* User Experience */}
        <Card style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Kullanıcı Deneyimi
          </ThemedText>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic Geri Bildirim</Text>
              <Text style={styles.settingDescription}>
                Dokunmatik titreşim geri bildirimi
              </Text>
            </View>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={(value) => updateSetting('hapticFeedback', value)}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dil</Text>
              <Text style={styles.settingDescription}>
                Uygulama dili
              </Text>
            </View>
            <Picker
              selectedValue={settings.language}
              onValueChange={(value) => updateSetting('language', value)}
              style={styles.languagePicker}
            >
              <Picker.Item label="Türkçe" value="tr" />
              <Picker.Item label="English" value="en" />
            </Picker>
          </View>
        </Card>

        {/* Data Management */}
        <Card style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Veri Yönetimi
          </ThemedText>
          
          <Button
            title="Verilerimi Dışa Aktar"
            onPress={exportData}
            loading={loading}
            style={styles.actionButton}
          />
          
          <Button
            title="Tüm Verileri Sil"
            onPress={clearAllData}
            style={[styles.actionButton, styles.dangerButton]}
          />
        </Card>

        {/* Support & Legal */}
        <Card style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Destek & Yasal
          </ThemedText>
          
          <Button
            title="Geri Bildirim Gönder"
            onPress={sendFeedback}
            style={styles.actionButton}
          />
          
          <Button
            title="Gizlilik Politikası"
            onPress={openPrivacyPolicy}
            style={styles.actionButton}
          />
          
          <Button
            title="Kullanım Koşulları"
            onPress={openTerms}
            style={styles.actionButton}
          />
        </Card>

        {/* App Info */}
        <Card style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Uygulama Bilgileri
          </ThemedText>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versiyon</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>100</Text>
          </View>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    paddingTop: 40,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  sliderContainer: {
    width: 120,
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  timePicker: {
    width: 100,
  },
  languagePicker: {
    width: 120,
  },
  actionButton: {
    marginVertical: 8,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
});
