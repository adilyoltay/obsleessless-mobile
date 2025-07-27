import { CompulsionCategory, CompulsionType } from '@/types/compulsion';

export const COMPULSION_CATEGORIES: CompulsionCategory[] = [
  {
    id: 'washing',
    name: 'Yıkama/Temizlik',
    nameEn: 'Washing/Cleaning',
    description: 'El yıkama, duş alma, temizlik ritüelleri',
    descriptionEn: 'Hand washing, showering, cleaning rituals',
    icon: '🧼',
    color: '#3B82F6',
    commonSubtypes: [
      'El yıkama',
      'Duş alma',
      'Diş fırçalama',
      'Ev temizliği',
      'Dezenfektan kullanma',
      'Çamaşır yıkama'
    ]
  },
  {
    id: 'checking',
    name: 'Kontrol Etme',
    nameEn: 'Checking',
    description: 'Kapı, elektrik, güvenlik kontrolleri',
    descriptionEn: 'Door, electrical, security checks',
    icon: '🔍',
    color: '#EF4444',
    commonSubtypes: [
      'Kapı kontrolü',
      'Elektrik kontrolü',
      'Gaz kontrolü',
      'Alarm kontrolü',
      'Araç kontrolü',
      'Çanta/eşya kontrolü'
    ]
  },
  {
    id: 'counting',
    name: 'Sayma/Tekrarlama',
    nameEn: 'Counting/Repeating',
    description: 'Sayma, tekrar etme, belirli sayılar',
    descriptionEn: 'Counting, repeating, specific numbers',
    icon: '🔢',
    color: '#10B981',
    commonSubtypes: [
      'Adım sayma',
      'Harf/kelime sayma',
      'Nefes sayma',
      'Hareket tekrarı',
      'Sayı ritüelleri',
      'Simetrik tekrarlar'
    ]
  },
  {
    id: 'ordering',
    name: 'Düzenleme/Sıralama',
    nameEn: 'Ordering/Arranging',
    description: 'Eşyaları düzenleme, simetri arayışı',
    descriptionEn: 'Arranging objects, seeking symmetry',
    icon: '📐',
    color: '#8B5CF6',
    commonSubtypes: [
      'Eşya dizimi',
      'Simetri arayışı',
      'Renk sıralaması',
      'Boyut sıralaması',
      'Kitap/CD dizimi',
      'Dolap düzeni'
    ]
  },
  {
    id: 'mental',
    name: 'Zihinsel Ritüeller',
    nameEn: 'Mental Rituals',
    description: 'Zihinsel tekrarlar, dua, sayma',
    descriptionEn: 'Mental repetitions, prayers, counting',
    icon: '🧠',
    color: '#F59E0B',
    commonSubtypes: [
      'Zihinsel sayma',
      'Dua tekrarı',
      'Kelime tekrarı',
      'Zihinsel görüntüler',
      'Nötralize edici düşünceler',
      'Telafi düşünceleri'
    ]
  },
  {
    id: 'reassurance',
    name: 'Güvence Arama',
    nameEn: 'Reassurance Seeking',
    description: 'Başkalarından onay, güvence isteme',
    descriptionEn: 'Seeking approval, reassurance from others',
    icon: '🤝',
    color: '#06B6D4',
    commonSubtypes: [
      'Aile onayı',
      'Arkadaş onayı',
      'Doktor onayı',
      'İnternet araştırması',
      'Sürekli soru sorma',
      'Karar onaylatma'
    ]
  },
  {
    id: 'avoidance',
    name: 'Kaçınma',
    nameEn: 'Avoidance',
    description: 'Belirli yerler, kişilerden kaçınma',
    descriptionEn: 'Avoiding certain places, people',
    icon: '🚫',
    color: '#84CC16',
    commonSubtypes: [
      'Yer kaçınması',
      'Kişi kaçınması',
      'Nesne kaçınması',
      'Aktivite kaçınması',
      'Durum kaçınması',
      'Sorumluluklardan kaçınma'
    ]
  },
  {
    id: 'touching',
    name: 'Dokunma Ritüelleri',
    nameEn: 'Touching Rituals',
    description: 'Belirli dokunma, vuruş patterns',
    descriptionEn: 'Specific touching, tapping patterns',
    icon: '✋',
    color: '#EC4899',
    commonSubtypes: [
      'Simetrik dokunma',
      'Vuruş ritüelleri',
      'Yüzey dokunma',
      'Nesnelere dokunma',
      'Kendine dokunma',
      'Belirli pattern dokunuş'
    ]
  }
];

export const INTENSITY_LEVELS = [
  { value: 1, label: 'Çok Hafif', labelEn: 'Very Mild', color: '#10B981' },
  { value: 2, label: 'Hafif', labelEn: 'Mild', color: '#34D399' },
  { value: 3, label: 'Orta-Hafif', labelEn: 'Mild-Moderate', color: '#6EE7B7' },
  { value: 4, label: 'Orta', labelEn: 'Moderate', color: '#FCD34D' },
  { value: 5, label: 'Orta-Şiddetli', labelEn: 'Moderate-Severe', color: '#FBBF24' },
  { value: 6, label: 'Şiddetli', labelEn: 'Severe', color: '#F59E0B' },
  { value: 7, label: 'Çok Şiddetli', labelEn: 'Very Severe', color: '#F97316' },
  { value: 8, label: 'Aşırı Şiddetli', labelEn: 'Extremely Severe', color: '#EA580C' },
  { value: 9, label: 'Kontrol Edilemez', labelEn: 'Uncontrollable', color: '#DC2626' },
  { value: 10, label: 'Maksimum', labelEn: 'Maximum', color: '#B91C1C' }
];

export const RESISTANCE_LEVELS = [
  { value: 1, label: 'Hiç Direnmedim', labelEn: 'No Resistance', color: '#B91C1C' },
  { value: 2, label: 'Çok Az', labelEn: 'Very Little', color: '#DC2626' },
  { value: 3, label: 'Az', labelEn: 'Little', color: '#EA580C' },
  { value: 4, label: 'Biraz', labelEn: 'Some', color: '#F97316' },
  { value: 5, label: 'Orta', labelEn: 'Moderate', color: '#F59E0B' },
  { value: 6, label: 'İyi', labelEn: 'Good', color: '#FBBF24' },
  { value: 7, label: 'Çok İyi', labelEn: 'Very Good', color: '#FCD34D' },
  { value: 8, label: 'Güçlü', labelEn: 'Strong', color: '#6EE7B7' },
  { value: 9, label: 'Çok Güçlü', labelEn: 'Very Strong', color: '#34D399' },
  { value: 10, label: 'Tam Direnç', labelEn: 'Complete Resistance', color: '#10B981' }
];

export const MOOD_LEVELS = [
  { value: 'very_anxious', label: 'Çok Kaygılı', labelEn: 'Very Anxious', color: '#DC2626', emoji: '😰' },
  { value: 'anxious', label: 'Kaygılı', labelEn: 'Anxious', color: '#F59E0B', emoji: '😟' },
  { value: 'neutral', label: 'Normal', labelEn: 'Neutral', color: '#6B7280', emoji: '😐' },
  { value: 'calm', label: 'Sakin', labelEn: 'Calm', color: '#059669', emoji: '😌' },
  { value: 'very_calm', label: 'Çok Sakin', labelEn: 'Very Calm', color: '#10B981', emoji: '😎' }
];

// Helper functions
export const getCompulsionCategory = (type: CompulsionType): CompulsionCategory => {
  return COMPULSION_CATEGORIES.find(cat => cat.id === type) || COMPULSION_CATEGORIES[0];
};

export const getIntensityLevel = (value: number) => {
  return INTENSITY_LEVELS.find(level => level.value === value) || INTENSITY_LEVELS[0];
};

export const getResistanceLevel = (value: number) => {
  return RESISTANCE_LEVELS.find(level => level.value === value) || RESISTANCE_LEVELS[0];
};

export const getMoodLevel = (value: string) => {
  return MOOD_LEVELS.find(mood => mood.value === value) || MOOD_LEVELS[2];
}; 