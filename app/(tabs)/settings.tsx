
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isEnabled: notificationsEnabled, enableNotifications, disableNotifications } = useNotifications();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('tr');

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const success = await enableNotifications();
      if (!success) {
        Alert.alert('Hata', 'Bildirimler etkinleştirilemedi');
      }
    } else {
      await disableNotifications();
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          }
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Veri Dışa Aktarma', 'Verileriniz hazırlanıyor...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.email?.split('@')[0] || 'Kullanıcı'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <Button
            variant="secondary"
            style={styles.profileButton}
          >
            OCD Profilini Düzenle
          </Button>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Bildirimleri</Text>
              <Text style={styles.settingDescription}>
                Günlük hatırlatıcılar ve motivasyon mesajları
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f3f4f6'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>ERP Hatırlatıcıları</Text>
              <Text style={styles.settingDescription}>
                Günlük 20:00'da egzersiz hatırlatması
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </View>
        </Card>

        {/* Security Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Güvenlik</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Biometrik Giriş</Text>
              <Text style={styles.settingDescription}>
                Face ID / Touch ID ile hızlı giriş
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              thumbColor={biometricEnabled ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </Card>

        {/* App Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Karanlık Mod</Text>
              <Text style={styles.settingDescription}>
                Koyu tema kullan
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              thumbColor={darkMode ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dil</Text>
              <Text style={styles.settingDescription}>
                {language === 'tr' ? 'Türkçe' : 'English'}
              </Text>
            </View>
            <Button
              variant="secondary"
              onPress={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
              style={styles.smallButton}
            >
              Değiştir
            </Button>
          </View>
        </Card>

        {/* Data Management */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
          <Button
            variant="secondary"
            onPress={handleExportData}
            style={styles.dataButton}
          >
            Verileri Dışa Aktar
          </Button>
          <Button
            variant="secondary"
            onPress={() => Alert.alert('Uyarı', 'Bu özellik yakında eklenecek')}
            style={styles.dataButton}
          >
            Hesabı Sil
          </Button>
        </Card>

        {/* Logout */}
        <Button
          variant="secondary"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Çıkış Yap
        </Button>

        <View style={styles.footer}>
          <Text style={styles.versionText}>ObsessLess v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  profileInfo: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  profileButton: {
    borderColor: '#10b981',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dataButton: {
    marginBottom: 8,
    borderColor: '#6b7280',
  },
  logoutButton: {
    marginVertical: 16,
    borderColor: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
