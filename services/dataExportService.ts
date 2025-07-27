
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export interface ExportData {
  exportDate: string;
  version: string;
  user: {
    profile: any;
    ocdProfile: any;
    settings: any;
  };
  progress: {
    achievements: any[];
    userProgress: any;
    compulsions: any[];
    erpSessions: any[];
  };
  analytics: {
    dailyLogs: any[];
    weeklyReports: any[];
    monthlyStats: any[];
  };
}

export class DataExportService {
  private static instance: DataExportService;

  public static getInstance(): DataExportService {
    if (!DataExportService.instance) {
      DataExportService.instance = new DataExportService();
    }
    return DataExportService.instance;
  }

  async exportAllData(): Promise<string | null> {
    try {
      const exportData: ExportData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        user: await this.getUserData(),
        progress: await this.getProgressData(),
        analytics: await this.getAnalyticsData(),
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      
      if (Platform.OS === 'web') {
        return await this.exportForWeb(jsonData);
      } else {
        return await this.exportForMobile(jsonData);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Hata', 'Veri dışa aktarma sırasında hata oluştu');
      return null;
    }
  }

  private async exportForWeb(jsonData: string): Promise<string> {
    // Web için blob oluştur ve download et
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `obsessless-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return url;
  }

  private async exportForMobile(jsonData: string): Promise<string> {
    const fileName = `obsessless-data-${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, jsonData);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'ObsessLess Verilerini Paylaş',
      });
    }
    
    return fileUri;
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const importData: ExportData = JSON.parse(jsonData);
      
      // Veri doğrulama
      if (!this.validateImportData(importData)) {
        Alert.alert('Hata', 'Geçersiz veri formatı');
        return false;
      }

      // Mevcut verileri yedekle
      await this.createBackup();

      // Yeni verileri yükle
      await this.restoreUserData(importData.user);
      await this.restoreProgressData(importData.progress);
      await this.restoreAnalyticsData(importData.analytics);

      Alert.alert('Başarılı', 'Veriler başarıyla içe aktarıldı');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Hata', 'Veri içe aktarma sırasında hata oluştu');
      return false;
    }
  }

  private validateImportData(data: any): boolean {
    return (
      data &&
      data.exportDate &&
      data.version &&
      data.user &&
      data.progress &&
      data.analytics
    );
  }

  private async createBackup(): Promise<void> {
    const backupData = {
      backupDate: new Date().toISOString(),
      user: await this.getUserData(),
      progress: await this.getProgressData(),
      analytics: await this.getAnalyticsData(),
    };

    await AsyncStorage.setItem('dataBackup', JSON.stringify(backupData));
  }

  async restoreFromBackup(): Promise<boolean> {
    try {
      const backupData = await AsyncStorage.getItem('dataBackup');
      if (!backupData) {
        Alert.alert('Hata', 'Yedek veri bulunamadı');
        return false;
      }

      const backup = JSON.parse(backupData);
      await this.restoreUserData(backup.user);
      await this.restoreProgressData(backup.progress);
      await this.restoreAnalyticsData(backup.analytics);

      Alert.alert('Başarılı', 'Yedek veriler geri yüklendi');
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      Alert.alert('Hata', 'Yedek geri yükleme sırasında hata oluştu');
      return false;
    }
  }

  private async getUserData(): Promise<any> {
    const [profile, ocdProfile, settings] = await Promise.all([
      AsyncStorage.getItem('userProfile'),
      AsyncStorage.getItem('ocdProfile'),
      AsyncStorage.getItem('userSettings'),
    ]);

    return {
      profile: profile ? JSON.parse(profile) : null,
      ocdProfile: ocdProfile ? JSON.parse(ocdProfile) : null,
      settings: settings ? JSON.parse(settings) : null,
    };
  }

  private async getProgressData(): Promise<any> {
    const [achievements, userProgress, compulsions, erpSessions] = await Promise.all([
      AsyncStorage.getItem('achievements'),
      AsyncStorage.getItem('userProgress'),
      AsyncStorage.getItem('compulsions'),
      AsyncStorage.getItem('erpSessions'),
    ]);

    return {
      achievements: achievements ? JSON.parse(achievements) : [],
      userProgress: userProgress ? JSON.parse(userProgress) : null,
      compulsions: compulsions ? JSON.parse(compulsions) : [],
      erpSessions: erpSessions ? JSON.parse(erpSessions) : [],
    };
  }

  private async getAnalyticsData(): Promise<any> {
    const [dailyLogs, weeklyReports, monthlyStats] = await Promise.all([
      AsyncStorage.getItem('dailyLogs'),
      AsyncStorage.getItem('weeklyReports'),
      AsyncStorage.getItem('monthlyStats'),
    ]);

    return {
      dailyLogs: dailyLogs ? JSON.parse(dailyLogs) : [],
      weeklyReports: weeklyReports ? JSON.parse(weeklyReports) : [],
      monthlyStats: monthlyStats ? JSON.parse(monthlyStats) : [],
    };
  }

  private async restoreUserData(userData: any): Promise<void> {
    if (userData.profile) {
      await AsyncStorage.setItem('userProfile', JSON.stringify(userData.profile));
    }
    if (userData.ocdProfile) {
      await AsyncStorage.setItem('ocdProfile', JSON.stringify(userData.ocdProfile));
    }
    if (userData.settings) {
      await AsyncStorage.setItem('userSettings', JSON.stringify(userData.settings));
    }
  }

  private async restoreProgressData(progressData: any): Promise<void> {
    if (progressData.achievements) {
      await AsyncStorage.setItem('achievements', JSON.stringify(progressData.achievements));
    }
    if (progressData.userProgress) {
      await AsyncStorage.setItem('userProgress', JSON.stringify(progressData.userProgress));
    }
    if (progressData.compulsions) {
      await AsyncStorage.setItem('compulsions', JSON.stringify(progressData.compulsions));
    }
    if (progressData.erpSessions) {
      await AsyncStorage.setItem('erpSessions', JSON.stringify(progressData.erpSessions));
    }
  }

  private async restoreAnalyticsData(analyticsData: any): Promise<void> {
    if (analyticsData.dailyLogs) {
      await AsyncStorage.setItem('dailyLogs', JSON.stringify(analyticsData.dailyLogs));
    }
    if (analyticsData.weeklyReports) {
      await AsyncStorage.setItem('weeklyReports', JSON.stringify(analyticsData.weeklyReports));
    }
    if (analyticsData.monthlyStats) {
      await AsyncStorage.setItem('monthlyStats', JSON.stringify(analyticsData.monthlyStats));
    }
  }

  async exportCSVReport(): Promise<string | null> {
    try {
      const progressData = await this.getProgressData();
      const csvData = this.convertToCSV(progressData);
      
      if (Platform.OS === 'web') {
        return await this.exportCSVForWeb(csvData);
      } else {
        return await this.exportCSVForMobile(csvData);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      return null;
    }
  }

  private convertToCSV(data: any): string {
    const headers = ['Tarih', 'ERP Egzersizi', 'Kompulsiyon Direnci', 'Anksiyete Seviyesi', 'Notlar'];
    const rows = [headers.join(',')];

    // Sample data conversion - bu gerçek verilerle değiştirilmeli
    if (data.erpSessions) {
      data.erpSessions.forEach((session: any) => {
        const row = [
          session.date || '',
          session.completed ? 'Evet' : 'Hayır',
          session.compulsionResisted ? 'Evet' : 'Hayır',
          session.anxietyLevel || '',
          `"${session.notes || ''}"`,
        ];
        rows.push(row.join(','));
      });
    }

    return rows.join('\n');
  }

  private async exportCSVForWeb(csvData: string): Promise<string> {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `obsessless-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return url;
  }

  private async exportCSVForMobile(csvData: string): Promise<string> {
    const fileName = `obsessless-report-${new Date().toISOString().split('T')[0]}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, csvData);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'ObsessLess Raporunu Paylaş',
      });
    }
    
    return fileUri;
  }

  async clearAllData(): Promise<boolean> {
    try {
      // Create final backup before clearing
      await this.createBackup();
      
      const keys = [
        'userProfile', 'ocdProfile', 'userSettings',
        'achievements', 'userProgress', 'compulsions', 'erpSessions',
        'dailyLogs', 'weeklyReports', 'monthlyStats'
      ];
      
      await AsyncStorage.multiRemove(keys);
      
      Alert.alert('Başarılı', 'Tüm veriler temizlendi');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      Alert.alert('Hata', 'Veri temizleme sırasında hata oluştu');
      return false;
    }
  }
}

export const dataExportService = DataExportService.getInstance();
