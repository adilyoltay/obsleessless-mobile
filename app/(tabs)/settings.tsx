
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const SettingItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    rightComponent,
    color = Colors.light.tint,
    showChevron = true
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    color?: string;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (showChevron && (
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color={Colors.light.icon} 
        />
      ))}
    </TouchableOpacity>
  );

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const handleLogout = () => {
    Alert.alert(
      t('settings.confirmLogout'),
      t('settings.logoutMessage'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        { 
          text: t('settings.logout'), 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  const ProfileCard = () => (
    <View style={styles.profileCard}>
      <LinearGradient
        colors={Colors.light.gradient}
        style={styles.profileGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.profileAvatar}>
        <MaterialCommunityIcons name="account" size={32} color="white" />
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>Kullanıcı Adı</Text>
        <Text style={styles.profileEmail}>user@example.com</Text>
        <Text style={styles.profileJoinDate}>2024'ten beri üye</Text>
      </View>
      <TouchableOpacity style={styles.profileEditButton}>
        <MaterialCommunityIcons name="pencil" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenLayout scrollable={true} backgroundColor={Colors.light.backgroundSecondary}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('settings.subtitle')}</Text>
      </View>

      {/* Profile Card */}
      <ProfileCard />

      {/* Settings Sections */}
      <SettingSection title={t('settings.preferences')}>
        <SettingItem
          title={t('settings.notifications')}
          subtitle={t('settings.notificationsDesc')}
          icon="bell"
          color={Colors.light.warning}
          rightComponent={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.light.border, true: Colors.light.warning }}
              thumbColor={notifications ? 'white' : Colors.light.icon}
            />
          }
          showChevron={false}
        />
        <SettingItem
          title={t('settings.darkMode')}
          subtitle={t('settings.darkModeDesc')}
          icon="theme-light-dark"
          color={Colors.light.info}
          rightComponent={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.light.border, true: Colors.light.info }}
              thumbColor={darkMode ? 'white' : Colors.light.icon}
            />
          }
          showChevron={false}
        />
        <SettingItem
          title={t('settings.language')}
          subtitle="Türkçe"
          icon="translate"
          color={Colors.light.success}
          onPress={() => {}}
        />
      </SettingSection>

      <SettingSection title={t('settings.privacy')}>
        <SettingItem
          title={t('settings.analytics')}
          subtitle={t('settings.analyticsDesc')}
          icon="chart-box"
          color={Colors.light.tint}
          rightComponent={
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
              thumbColor={analytics ? 'white' : Colors.light.icon}
            />
          }
          showChevron={false}
        />
        <SettingItem
          title={t('settings.dataExport')}
          subtitle={t('settings.dataExportDesc')}
          icon="download"
          color={Colors.light.info}
          onPress={() => {}}
        />
        <SettingItem
          title={t('settings.deleteAccount')}
          subtitle={t('settings.deleteAccountDesc')}
          icon="delete-forever"
          color={Colors.light.error}
          onPress={() => {}}
        />
      </SettingSection>

      <SettingSection title={t('settings.support')}>
        <SettingItem
          title={t('settings.help')}
          subtitle={t('settings.helpDesc')}
          icon="help-circle"
          color={Colors.light.success}
          onPress={() => {}}
        />
        <SettingItem
          title={t('settings.feedback')}
          subtitle={t('settings.feedbackDesc')}
          icon="message-text"
          color={Colors.light.warning}
          onPress={() => {}}
        />
        <SettingItem
          title={t('settings.about')}
          subtitle="v1.0.0"
          icon="information"
          color={Colors.light.info}
          onPress={() => {}}
        />
      </SettingSection>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color={Colors.light.error} />
        <Text style={styles.logoutText}>{t('settings.logout')}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ObsessLess v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for mental wellness</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.icon,
    marginTop: Spacing.xs,
  },
  profileCard: {
    backgroundColor: Colors.light.card,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: 'white',
  },
  profileEmail: {
    fontSize: Typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: Spacing.xs,
  },
  profileJoinDate: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: Spacing.xs,
  },
  profileEditButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  sectionContent: {
    backgroundColor: Colors.light.card,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
  },
  settingSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.icon,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.card,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.error + '30',
  },
  logoutText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.error,
    marginLeft: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.icon,
    fontWeight: Typography.fontWeight.medium,
  },
  footerSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.icon,
    marginTop: Spacing.xs,
  },
});
