
import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Alert,
  Share,
  Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Native Paper Components
import { Card, Button, Switch } from 'react-native-paper';

// Custom UI Components (if needed)

// Hooks & Utils
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// Settings data structure
interface SettingsData {
  notifications: boolean;
  biometric: boolean;
  darkMode: boolean;
  reminderTimes: boolean;
  weeklyReports: boolean;
  dataSharing: boolean;
}

const LANGUAGE_OPTIONS = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export default function SettingsScreen() {
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguage();
  const [settings, setSettings] = useState<SettingsData>({
    notifications: true,
    biometric: false,
    darkMode: false,
    reminderTimes: true,
    weeklyReports: true,
    dataSharing: false
  });

  const [userProfile, setUserProfile] = useState({
    name: 'Kullanıcı',
    memberSince: '2024',
    totalSessions: 15,
    currentStreak: 7
  });

  useEffect(() => {
    loadSettings();
    loadUserProfile();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('user_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('user_profile');
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const updateSetting = async (key: keyof SettingsData, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem('user_settings', JSON.stringify(newSettings));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage as any);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'ObsessLess uygulamasını keşfet! OKB yönetimi için güçlü bir araç.',
        url: 'https://obsessless.app'
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleDataExport = () => {
    Alert.alert(
      'Verilerini Dışa Aktar',
      'Tüm verilerini JSON formatında dışa aktarmak ister misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Dışa Aktar', 
          onPress: async () => {
            // TODO: Implement data export
            Alert.alert('Başarılı', 'Verilerin dışa aktarıldı!');
          }
        }
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      '⚠️ Dikkat',
      'Bu işlem tüm verilerini kalıcı olarak silecek. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Başarılı', 'Tüm veriler silindi.');
            } catch (error) {
              console.error('Error clearing data:', error);
            }
          }
        }
      ]
    );
  };

  const renderProfileSection = () => (
    <Card style={styles.profileCard}>
      <Card.Content style={styles.profileContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={56} color="#10B981" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileMember}>
              {userProfile.memberSince} yılından beri üye
            </Text>
          </View>
        </View>
        
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNumber}>{userProfile.totalSessions}</Text>
            <Text style={styles.profileStatLabel}>Toplam Oturum</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNumber}>{userProfile.currentStreak}</Text>
            <Text style={styles.profileStatLabel}>Güncel Seri</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderSettingsSection = (title: string, children: React.ReactNode) => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.settingsCard}>
        <Card.Content>
          {children}
        </Card.Content>
      </Card>
    </View>
  );

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: string,
    value: boolean,
    onToggle: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <MaterialCommunityIcons name={icon as any} size={24} color="#6B7280" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#10B981' }}
        thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
      />
    </View>
  );

  const renderActionItem = (
    title: string,
    subtitle: string,
    icon: string,
    onPress: () => void,
    danger = false
  ) => (
    <Pressable style={styles.actionItem} onPress={onPress}>
      <View style={[styles.settingIcon, danger && styles.dangerIcon]}>
        <MaterialCommunityIcons 
          name={icon as any} 
          size={24} 
          color={danger ? '#EF4444' : '#6B7280'} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerTitle]}>
          {title}
        </Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
    </Pressable>
  );

  const renderLanguageSection = () => (
    <View style={styles.languageContainer}>
      {LANGUAGE_OPTIONS.map((lang) => (
        <Pressable
          key={lang.code}
          style={[
            styles.languageOption,
            language === lang.code && styles.languageOptionActive
          ]}
          onPress={() => handleLanguageChange(lang.code)}
        >
          <Text style={styles.languageFlag}>{lang.flag}</Text>
          <Text style={[
            styles.languageName,
            language === lang.code && styles.languageNameActive
          ]}>
            {lang.name}
          </Text>
          {language === lang.code && (
            <MaterialCommunityIcons name="check" size={20} color="#10B981" />
          )}
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ayarlar</Text>
          <Text style={styles.headerSubtitle}>
            Uygulamayı kişiselleştir ve tercihlerini ayarla
          </Text>
        </View>

        {/* Profile Section */}
        {renderProfileSection()}

        {/* Notifications Settings */}
        {renderSettingsSection('Bildirimler', (
          <View>
            {renderSettingItem(
              'Bildirimler',
              'Günlük hatırlatmalar ve uyarılar',
              'bell-outline',
              settings.notifications,
              (value) => updateSetting('notifications', value)
            )}
            {renderSettingItem(
              'Hatırlatma Saatleri',
              'Belirlenen saatlerde hatırlatma',
              'clock-outline',
              settings.reminderTimes,
              (value) => updateSetting('reminderTimes', value)
            )}
            {renderSettingItem(
              'Haftalık Raporlar',
              'İlerleme raporu bildirimleri',
              'chart-line',
              settings.weeklyReports,
              (value) => updateSetting('weeklyReports', value)
            )}
          </View>
        ))}

        {/* Privacy & Security */}
        {renderSettingsSection('Gizlilik ve Güvenlik', (
          <View>
            {renderSettingItem(
              'Biyometrik Kilit',
              'Parmak izi veya yüz tanıma',
              'fingerprint',
              settings.biometric,
              (value) => updateSetting('biometric', value)
            )}
            {renderSettingItem(
              'Veri Paylaşımı',
              'Anonim kullanım verilerini paylaş',
              'database-outline',
              settings.dataSharing,
              (value) => updateSetting('dataSharing', value)
            )}
          </View>
        ))}

        {/* Language Settings */}
        {renderSettingsSection('Dil ve Bölge', renderLanguageSection())}

        {/* App Actions */}
        {renderSettingsSection('Uygulama', (
          <View>
            {renderActionItem(
              'Uygulamayı Paylaş',
              'Arkadaşlarınla ObsessLess\'i paylaş',
              'share-variant',
              handleShareApp
            )}
            {renderActionItem(
              'Verilerini Dışa Aktar',
              'Tüm verilerini yedekle',
              'download',
              handleDataExport
            )}
            {renderActionItem(
              'Gizlilik Politikası',
              'Veri kullanım politikalarını görüntüle',
              'shield-check',
              () => Linking.openURL('https://obsessless.app/privacy')
            )}
            {renderActionItem(
              'Destek',
              'Yardım ve geri bildirim',
              'help-circle',
              () => Linking.openURL('mailto:support@obsessless.app')
            )}
          </View>
        ))}

        {/* Danger Zone */}
        {renderSettingsSection('Tehlikeli Alan', (
          <View>
            {renderActionItem(
              'Tüm Verileri Sil',
              'Kalıcı olarak tüm verilerini sil',
              'delete-outline',
              handleResetData,
              true
            )}
          </View>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  profileCard: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  profileContent: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  profileMember: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter',
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  profileStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 16,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  settingsCard: {
    marginHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: '#FEF2F2',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter',
  },
  dangerTitle: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },
  languageContainer: {
    padding: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageOptionActive: {
    backgroundColor: '#F0FDF4',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Inter',
  },
  languageNameActive: {
    color: '#10B981',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 32,
  },
});
