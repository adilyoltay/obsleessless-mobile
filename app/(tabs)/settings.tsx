
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, List, Switch, Button, Avatar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useTranslation();
  const [settings, setSettings] = useState({
    notifications: true,
    biometric: false,
    darkMode: false,
    reminderTimes: true,
    weeklyReports: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('app_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'tr' ? 'en' : 'tr';
    setLanguage(newLanguage);
  };

  const handleExportData = () => {
    Alert.alert(
      'Veri Dışa Aktarma',
      'Verilerinizi dışa aktarmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Aktar', onPress: () => console.log('Export data') }
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Verileri Sıfırla',
      'Tüm verileriniz silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sıfırla', 
          style: 'destructive',
          onPress: () => console.log('Reset data') 
        }
      ]
    );
  };

  return (
    <ScreenLayout scrollable backgroundColor="#FAFAFA">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Card style={styles.profileCard} mode="elevated">
          <Card.Content>
            <View style={styles.profileContainer}>
              <Avatar.Icon 
                size={64} 
                icon="account" 
                style={styles.profileAvatar}
              />
              <View style={styles.profileInfo}>
                <Title style={styles.profileName}>Kullanıcı</Title>
                <List.Item
                  title="Profili Düzenle"
                  titleStyle={styles.profileEditText}
                  left={(props) => <List.Icon {...props} icon="pencil" color="#3B82F6" />}
                  onPress={() => router.push('/(auth)/onboarding')}
                  style={styles.profileEditItem}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={styles.settingsCard} mode="elevated">
          <Card.Content>
            <Title style={styles.sectionTitle}>Uygulama Ayarları</Title>
            
            <List.Item
              title="Dil"
              description={language === 'tr' ? 'Türkçe' : 'English'}
              left={(props) => <List.Icon {...props} icon="translate" />}
              right={() => (
                <Switch
                  value={language === 'en'}
                  onValueChange={handleLanguageToggle}
                />
              )}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Bildirimler"
              description="Push bildirimleri ve hatırlatmalar"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => handleSettingChange('notifications', value)}
                />
              )}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Biyometrik Giriş"
              description="Face ID / Touch ID ile giriş"
              left={(props) => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Switch
                  value={settings.biometric}
                  onValueChange={(value) => handleSettingChange('biometric', value)}
                />
              )}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.settingsCard} mode="elevated">
          <Card.Content>
            <Title style={styles.sectionTitle}>Bildirim Tercihleri</Title>
            
            <List.Item
              title="Günlük Hatırlatmalar"
              description="Kompülsiyon takibi için hatırlatma"
              left={(props) => <List.Icon {...props} icon="clock-alert" />}
              right={() => (
                <Switch
                  value={settings.reminderTimes}
                  onValueChange={(value) => handleSettingChange('reminderTimes', value)}
                />
              )}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Haftalık Raporlar"
              description="İlerleme özet raporları"
              left={(props) => <List.Icon {...props} icon="chart-line" />}
              right={() => (
                <Switch
                  value={settings.weeklyReports}
                  onValueChange={(value) => handleSettingChange('weeklyReports', value)}
                />
              )}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Data Management */}
        <Card style={styles.settingsCard} mode="elevated">
          <Card.Content>
            <Title style={styles.sectionTitle}>Veri Yönetimi</Title>
            
            <List.Item
              title="Verileri Dışa Aktar"
              description="Tüm verilerinizi JSON formatında indirin"
              left={(props) => <List.Icon {...props} icon="download" />}
              onPress={handleExportData}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Verileri Sıfırla"
              description="Tüm uygulama verilerini temizle"
              left={(props) => <List.Icon {...props} icon="delete" color="#EF4444" />}
              titleStyle={{ color: '#EF4444' }}
              onPress={handleResetData}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* About Section */}
        <Card style={styles.aboutCard} mode="elevated">
          <Card.Content>
            <Title style={styles.sectionTitle}>Uygulama Hakkında</Title>
            
            <View style={styles.aboutInfo}>
              <View style={styles.aboutItem}>
                <MaterialCommunityIcons name="information" size={20} color="#6B7280" />
                <View style={styles.aboutText}>
                  <Title style={styles.aboutTitle}>ObsessLess</Title>
                  <List.Item
                    title="Versiyon 1.0.0"
                    titleStyle={styles.aboutVersion}
                  />
                </View>
              </View>
              
              <List.Item
                title="Gizlilik Politikası"
                left={(props) => <List.Icon {...props} icon="shield-check" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => console.log('Privacy policy')}
                style={styles.listItem}
              />
              
              <Divider style={styles.divider} />
              
              <List.Item
                title="Kullanım Koşulları"
                left={(props) => <List.Icon {...props} icon="file-document" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => console.log('Terms of service')}
                style={styles.listItem}
              />
              
              <Divider style={styles.divider} />
              
              <List.Item
                title="Destek"
                left={(props) => <List.Icon {...props} icon="help-circle" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => console.log('Support')}
                style={styles.listItem}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            icon="logout"
            onPress={() => {
              Alert.alert(
                'Çıkış Yap',
                'Uygulamadan çıkmak istediğinizden emin misiniz?',
                [
                  { text: 'İptal', style: 'cancel' },
                  { text: 'Çıkış Yap', onPress: () => router.replace('/(auth)/login') }
                ]
              );
            }}
            style={styles.logoutButton}
            textColor="#EF4444"
          >
            Çıkış Yap
          </Button>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    backgroundColor: '#3B82F6',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEditItem: {
    paddingLeft: 0,
    paddingVertical: 4,
  },
  profileEditText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  settingsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#E5E7EB',
  },
  aboutCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  aboutInfo: {
    marginTop: 8,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutText: {
    marginLeft: 12,
    flex: 1,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutContainer: {
    margin: 16,
    marginBottom: 32,
  },
  logoutButton: {
    borderColor: '#EF4444',
    borderRadius: 12,
  },
});
