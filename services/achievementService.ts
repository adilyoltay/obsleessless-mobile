
import AsyncStorage from '@react-native-async-storage/async-storage';
import { messagingService } from './messaging';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'progress' | 'milestone' | 'special';
  requirement: number;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
}

export interface UserProgress {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalERPSessions: number;
  totalCompulsionsResisted: number;
  daysActive: number;
  lastActiveDate: Date;
}

export class AchievementService {
  private static instance: AchievementService;
  private achievements: Achievement[] = [];
  private userProgress: UserProgress = {
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalERPSessions: 0,
    totalCompulsionsResisted: 0,
    daysActive: 0,
    lastActiveDate: new Date(),
  };

  public static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  constructor() {
    this.initializeAchievements();
    this.loadUserProgress();
  }

  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'first_step',
        title: 'İlk Adım',
        description: 'İlk ERP egzersizini tamamla',
        icon: '🎯',
        type: 'milestone',
        requirement: 1,
        points: 10,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'week_warrior',
        title: 'Hafta Savaşçısı',
        description: '7 gün üst üste aktif ol',
        icon: '🗡️',
        type: 'streak',
        requirement: 7,
        points: 50,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'resistance_fighter',
        title: 'Direnç Savaşçısı',
        description: '10 kompulsiyona direnç göster',
        icon: '🛡️',
        type: 'progress',
        requirement: 10,
        points: 30,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'erp_master',
        title: 'ERP Ustası',
        description: '25 ERP egzersizi tamamla',
        icon: '🥋',
        type: 'progress',
        requirement: 25,
        points: 100,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'month_champion',
        title: 'Ay Şampiyonu',
        description: '30 gün üst üste aktif ol',
        icon: '👑',
        type: 'streak',
        requirement: 30,
        points: 200,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'progress_tracker',
        title: 'İlerleme Takipçisi',
        description: '100 günlük veri girişi yap',
        icon: '📊',
        type: 'progress',
        requirement: 100,
        points: 150,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'consistency_king',
        title: 'Tutarlılık Kralı',
        description: '60 gün boyunca günlük hedefleri tamamla',
        icon: '🏆',
        type: 'special',
        requirement: 60,
        points: 300,
        unlocked: false,
        progress: 0,
      },
    ];
  }

  async loadUserProgress(): Promise<void> {
    try {
      const savedProgress = await AsyncStorage.getItem('userProgress');
      const savedAchievements = await AsyncStorage.getItem('achievements');

      if (savedProgress) {
        this.userProgress = { ...this.userProgress, ...JSON.parse(savedProgress) };
        this.userProgress.lastActiveDate = new Date(this.userProgress.lastActiveDate);
      }

      if (savedAchievements) {
        const achievements = JSON.parse(savedAchievements);
        this.achievements = this.achievements.map(achievement => {
          const saved = achievements.find((a: Achievement) => a.id === achievement.id);
          return saved ? { ...achievement, ...saved, unlockedAt: saved.unlockedAt ? new Date(saved.unlockedAt) : undefined } : achievement;
        });
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  }

  async saveUserProgress(): Promise<void> {
    try {
      await AsyncStorage.setItem('userProgress', JSON.stringify(this.userProgress));
      await AsyncStorage.setItem('achievements', JSON.stringify(this.achievements));
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }

  async recordERPSession(): Promise<Achievement[]> {
    this.userProgress.totalERPSessions++;
    this.updateDailyActivity();
    
    const newlyUnlocked = await this.checkAchievements();
    await this.saveUserProgress();
    
    return newlyUnlocked;
  }

  async recordCompulsionResistance(): Promise<Achievement[]> {
    this.userProgress.totalCompulsionsResisted++;
    this.updateDailyActivity();
    
    const newlyUnlocked = await this.checkAchievements();
    await this.saveUserProgress();
    
    return newlyUnlocked;
  }

  async recordDailyActivity(): Promise<Achievement[]> {
    this.updateDailyActivity();
    
    const newlyUnlocked = await this.checkAchievements();
    await this.saveUserProgress();
    
    return newlyUnlocked;
  }

  private updateDailyActivity(): void {
    const today = new Date();
    const lastActive = new Date(this.userProgress.lastActiveDate);
    
    // Check if it's a new day
    if (today.toDateString() !== lastActive.toDateString()) {
      // Check if streak continues
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive.toDateString() === yesterday.toDateString()) {
        this.userProgress.currentStreak++;
      } else {
        this.userProgress.currentStreak = 1;
      }
      
      this.userProgress.daysActive++;
      this.userProgress.lastActiveDate = today;
      
      // Update longest streak
      if (this.userProgress.currentStreak > this.userProgress.longestStreak) {
        this.userProgress.longestStreak = this.userProgress.currentStreak;
      }
    }
  }

  private async checkAchievements(): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (achievement.unlocked) continue;

      let progress = 0;
      
      switch (achievement.type) {
        case 'streak':
          progress = this.userProgress.currentStreak;
          break;
        case 'progress':
          if (achievement.id === 'resistance_fighter') {
            progress = this.userProgress.totalCompulsionsResisted;
          } else if (achievement.id === 'erp_master') {
            progress = this.userProgress.totalERPSessions;
          } else if (achievement.id === 'progress_tracker') {
            progress = this.userProgress.daysActive;
          }
          break;
        case 'milestone':
          if (achievement.id === 'first_step') {
            progress = this.userProgress.totalERPSessions;
          }
          break;
        case 'special':
          if (achievement.id === 'consistency_king') {
            progress = this.userProgress.currentStreak;
          }
          break;
      }

      achievement.progress = Math.min(progress, achievement.requirement);

      // Check if achievement is unlocked
      if (progress >= achievement.requirement) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        this.userProgress.totalPoints += achievement.points;
        newlyUnlocked.push(achievement);

        // Send notification
        await messagingService.sendProgressMilestone(achievement.title);
      }
    }

    return newlyUnlocked;
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  getLockedAchievements(): Achievement[] {
    return this.achievements.filter(a => !a.unlocked);
  }

  getUserProgress(): UserProgress {
    return this.userProgress;
  }

  getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(a => a.id === id);
  }

  getProgressPercentage(achievementId: string): number {
    const achievement = this.getAchievementById(achievementId);
    if (!achievement) return 0;
    
    return Math.min((achievement.progress / achievement.requirement) * 100, 100);
  }

  async resetProgress(): Promise<void> {
    this.userProgress = {
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalERPSessions: 0,
      totalCompulsionsResisted: 0,
      daysActive: 0,
      lastActiveDate: new Date(),
    };

    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.progress = 0;
      achievement.unlockedAt = undefined;
    });

    await this.saveUserProgress();
  }
}

export const achievementService = AchievementService.getInstance();
