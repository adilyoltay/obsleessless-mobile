export interface CompulsionEntry {
  id: string;
  userId: string;
  type: CompulsionType;
  subtype?: string; // Specific compulsion within type
  intensity: number; // 1-10 scale
  resistanceLevel: number; // 1-10 scale (how much user resisted)
  duration?: number; // Duration in minutes
  triggers?: string[]; // What triggered this compulsion
  location?: string; // Where it happened
  notes?: string; // User notes
  timestamp: Date;
  completed: boolean; // Whether user completed the compulsion
  helpUsed?: boolean; // Whether user used any coping strategies
  mood?: MoodLevel; // User's mood during the episode
  createdAt: Date;
  updatedAt: Date;
}

export type CompulsionType = 
  | 'washing' 
  | 'checking' 
  | 'counting' 
  | 'ordering' 
  | 'mental' 
  | 'reassurance' 
  | 'avoidance' 
  | 'touching';

export interface CompulsionCategory {
  id: CompulsionType;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
  commonSubtypes: string[];
}

export type MoodLevel = 
  | 'very_anxious'
  | 'anxious' 
  | 'neutral' 
  | 'calm' 
  | 'very_calm';

export interface CompulsionStats {
  totalEntries: number;
  todayEntries: number;
  weeklyEntries: number;
  monthlyEntries: number;
  averageIntensity: number;
  averageResistance: number;
  mostCommonType: CompulsionType;
  longestDuration: number;
  improvementPercentage: number; // vs previous period
  streakDays: number; // Days with reduced compulsions
}

export interface DailyCompulsionSummary {
  date: Date;
  totalCompulsions: number;
  averageIntensity: number;
  averageResistance: number;
  totalDuration: number;
  mood: MoodLevel;
  notes?: string;
  compulsionsByType: Record<CompulsionType, number>;
}

export interface CompulsionFilter {
  type?: CompulsionType;
  dateFrom?: Date;
  dateTo?: Date;
  intensityMin?: number;
  intensityMax?: number;
  resistanceMin?: number;
  resistanceMax?: number;
}

export interface QuickEntryFormData {
  type: CompulsionType;
  intensity: number;
  resistanceLevel: number;
  duration?: number;
  triggers?: string[];
  notes?: string;
  completed: boolean;
  helpUsed?: boolean;
  mood?: MoodLevel;
}

// Predefined common triggers
export const COMMON_TRIGGERS = [
  'Stress',
  'Kaygı',
  'Yorgunluk', 
  'Sosyal Durum',
  'İş/Okul',
  'Aile',
  'Temizlik',
  'Hastalık Korkusu',
  'Belirsizlik',
  'Mükemmeliyetçilik'
] as const;

// Predefined common locations
export const COMMON_LOCATIONS = [
  'Ev',
  'İş/Okul', 
  'Banyo',
  'Mutfak',
  'Yatak Odası',
  'Dışarı',
  'Araç',
  'Market',
  'Hastane/Klinik',
  'Sosyal Ortam'
] as const; 