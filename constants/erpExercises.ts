import { ERPExercise, ERPCategoryInfo, ERPCategory, ERPDifficulty } from '@/types/erp';

// ERP Categories
export const ERP_CATEGORIES: ERPCategoryInfo[] = [
  {
    id: 'exposure',
    name: 'Maruz Kalma',
    nameEn: 'Exposure',
    description: 'Kaygı yaratan durumlara kasıtlı olarak maruz kalma',
    descriptionEn: 'Deliberately exposing yourself to anxiety-provoking situations',
    icon: '👁️',
    color: '#3B82F6',
    difficulty: 'beginner',
    recommendedOrder: 1,
  },
  {
    id: 'response_prevention',
    name: 'Tepki Önleme',
    nameEn: 'Response Prevention',
    description: 'Kompulsif davranışları yapmama pratiği',
    descriptionEn: 'Practice of not performing compulsive behaviors',
    icon: '🛑',
    color: '#EF4444',
    difficulty: 'intermediate',
    recommendedOrder: 2,
  },
  {
    id: 'in_vivo',
    name: 'Gerçek Yaşam',
    nameEn: 'In Vivo',
    description: 'Gerçek yaşam durumlarında uygulanan egzersizler',
    descriptionEn: 'Exercises applied in real-life situations',
    icon: '🌍',
    color: '#10B981',
    difficulty: 'intermediate',
    recommendedOrder: 3,
  },
  {
    id: 'imaginal',
    name: 'Hayali Maruz Kalma',
    nameEn: 'Imaginal Exposure',
    description: 'Zihinsel imajlarla yapılan maruz kalma egzersizleri',
    descriptionEn: 'Exposure exercises using mental imagery',
    icon: '🧠',
    color: '#8B5CF6',
    difficulty: 'advanced',
    recommendedOrder: 4,
  },
  {
    id: 'interoceptive',
    name: 'İçsel Duyum',
    nameEn: 'Interoceptive',
    description: 'Vücut sensasyonlarına maruz kalma',
    descriptionEn: 'Exposure to bodily sensations',
    icon: '💓',
    color: '#F59E0B',
    difficulty: 'advanced',
    recommendedOrder: 5,
  },
  {
    id: 'cognitive',
    name: 'Bilişsel',
    nameEn: 'Cognitive',
    description: 'Düşünce ve inançlarla çalışma',
    descriptionEn: 'Working with thoughts and beliefs',
    icon: '🤔',
    color: '#6366F1',
    difficulty: 'expert',
    recommendedOrder: 6,
  },
  {
    id: 'behavioral',
    name: 'Davranışsal',
    nameEn: 'Behavioral',
    description: 'Davranış değişikliği egzersizleri',
    descriptionEn: 'Behavior modification exercises',
    icon: '🎯',
    color: '#EC4899',
    difficulty: 'intermediate',
    recommendedOrder: 7,
  },
];

// Pre-defined ERP Exercises
export const ERP_EXERCISES: ERPExercise[] = [
  // BEGINNER LEVEL EXERCISES
  {
    id: 'washing-hands-delay',
    title: 'El Yıkama Gecikmesi',
    titleEn: 'Hand Washing Delay',
    description: 'El yıkama isteğini hissettiğinizde 5 dakika bekleme pratiği',
    descriptionEn: 'Practice waiting 5 minutes when you feel the urge to wash hands',
    category: 'response_prevention',
    difficulty: 'beginner',
    duration: 10,
    targetAnxiety: 4,
    instructions: [
      '1. El yıkama isteği hissettiğinizde durdurun',
      '2. Derin nefes alın ve kaygı seviyenizi 1-10 arası değerlendirin',
      '3. 5 dakika boyunca el yıkamadan bekleyin',
      '4. Bu süre boyunca kaygınızı gözlemleyin',
      '5. 5 dakika sonra hala istiyorsanız ellerinizi yıkayabilirsiniz'
    ],
    instructionsEn: [
      '1. Stop when you feel the urge to wash hands',
      '2. Take a deep breath and rate your anxiety 1-10',
      '3. Wait 5 minutes without washing',
      '4. Observe your anxiety during this time',
      '5. After 5 minutes, you may wash if you still want to'
    ],
    preparations: [
      'Rahat bir ortam seçin',
      'Saatinizi yanınıza alın',
      'Su kaynağından uzaklaşın'
    ],
    preparationsEn: [
      'Choose a comfortable environment',
      'Keep a timer with you',
      'Move away from water sources'
    ],
    tips: [
      'Kaygının zamanla azaldığını fark edeceksiniz',
      'Mükemmel olmak zorunda değilsiniz',
      'Her deneme bir başarıdır'
    ],
    tipsEn: [
      'You will notice anxiety decreasing over time',
      'You don\'t have to be perfect',
      'Every attempt is a success'
    ],
    relatedCompulsions: ['washing'],
    tags: ['beginner', 'washing', 'delay', 'response_prevention'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'touching-doorknob',
    title: 'Kapı Kolu Dokunma',
    titleEn: 'Doorknob Touching',
    description: 'Kapı koluna dokunup ardından el yıkamama pratiği',
    descriptionEn: 'Practice touching doorknobs without washing hands afterward',
    category: 'exposure',
    difficulty: 'beginner',
    duration: 15,
    targetAnxiety: 5,
    instructions: [
      '1. Temiz bir kapı kolu seçin',
      '2. Başlangıç kaygı seviyenizi kaydedin',
      '3. Kapı koluna normal şekilde dokunun',
      '4. 15 dakika boyunca el yıkamadan bekleyin',
      '5. Kaygınızın değişimini gözlemleyin'
    ],
    instructionsEn: [
      '1. Choose a clean doorknob',
      '2. Record your initial anxiety level',
      '3. Touch the doorknob normally',
      '4. Wait 15 minutes without washing hands',
      '5. Observe how your anxiety changes'
    ],
    preparations: [
      'Uygun bir kapı kolu belirleyin',
      'Çevrede kimse yokken yapın',
      'Rahatlatıcı aktivite planlayın'
    ],
    preparationsEn: [
      'Identify an appropriate doorknob',
      'Do it when no one is around',
      'Plan a relaxing activity'
    ],
    relatedCompulsions: ['washing', 'avoidance'],
    tags: ['beginner', 'exposure', 'contamination', 'doorknob'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // INTERMEDIATE LEVEL EXERCISES
  {
    id: 'checking-reduction',
    title: 'Kontrol Azaltma',
    titleEn: 'Checking Reduction',
    description: 'Kapı/ocak kontrolünü tek sefer yapmaya sınırlama',
    descriptionEn: 'Limiting door/stove checking to once only',
    category: 'response_prevention',
    difficulty: 'intermediate',
    duration: 30,
    targetAnxiety: 6,
    instructions: [
      '1. Kontrol etmek istediğiniz şeyi belirleyin (kapı, ocak, vs.)',
      '2. Tek bir kontrol yapacağınıza karar verin',
      '3. Dikkatli bir şekilde bir kez kontrol edin',
      '4. Tekrar kontrol etme isteğine direnenin',
      '5. 30 dakika boyunca kontrol etmeden kalın'
    ],
    instructionsEn: [
      '1. Identify what you want to check (door, stove, etc.)',
      '2. Decide to check only once',
      '3. Check carefully one time',
      '4. Resist the urge to check again',
      '5. Stay without checking for 30 minutes'
    ],
    preparations: [
      'Kontrol edeceğiniz şeyi önceden planlayın',
      'Dikkat dağıtıcı aktiviteler hazırlayın',
      'Destek kişisini bilgilendirin'
    ],
    preparationsEn: [
      'Plan in advance what you will check',
      'Prepare distracting activities',
      'Inform your support person'
    ],
    tips: [
      'İlk kontrol sonrası güvendiğinizi hatırlayın',
      'Şüphe normal bir duygu',
      'Zamanla güven artacak'
    ],
    tipsEn: [
      'Remember you trusted the first check',
      'Doubt is a normal feeling',
      'Confidence will increase over time'
    ],
    relatedCompulsions: ['checking'],
    tags: ['intermediate', 'checking', 'response_prevention', 'control'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ADVANCED LEVEL EXERCISES
  {
    id: 'contamination-exposure',
    title: 'Kirlenme Maruz Kalma',
    titleEn: 'Contamination Exposure',
    description: 'Kasıtlı olarak "kirli" yüzeylere dokunma ve el yıkamama',
    descriptionEn: 'Deliberately touching "dirty" surfaces without washing hands',
    category: 'exposure',
    difficulty: 'advanced',
    duration: 60,
    targetAnxiety: 8,
    instructions: [
      '1. Orta derecede kirli bir yüzey seçin (masa, sandalye)',
      '2. Başlangıç kaygısını kaydedin',
      '3. Yüzeye bilinçli olarak dokunun',
      '4. 1 saat boyunca el yıkamayın',
      '5. Bu sürede normal aktivitelerinizi yapın'
    ],
    instructionsEn: [
      '1. Choose a moderately dirty surface (table, chair)',
      '2. Record initial anxiety',
      '3. Deliberately touch the surface',
      '4. Don\'t wash hands for 1 hour',
      '5. Continue normal activities during this time'
    ],
    preparations: [
      'Güvenli ama "kirli" yüzey seçin',
      'Yakınında kimse olmasın',
      'Acil durum planı hazırlayın'
    ],
    preparationsEn: [
      'Choose safe but "dirty" surface',
      'Ensure no one is nearby',
      'Prepare emergency plan'
    ],
    warnings: [
      'Gerçekten kirli/tehlikeli yüzeylerden kaçının',
      'Aşırı kaygı hissederseniz durdurun',
      'Terapi sırasında yapmayı düşünün'
    ],
    warningsEn: [
      'Avoid truly dirty/dangerous surfaces',
      'Stop if you feel extreme anxiety',
      'Consider doing during therapy sessions'
    ],
    relatedCompulsions: ['washing', 'avoidance'],
    tags: ['advanced', 'contamination', 'exposure', 'challenging'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // EXPERT LEVEL EXERCISES
  {
    id: 'uncertainty-tolerance',
    title: 'Belirsizliğe Tahammül',
    titleEn: 'Uncertainty Tolerance',
    description: 'Kesin olmama durumlarında kontrol etmeme pratiği',
    descriptionEn: 'Practice not checking in uncertain situations',
    category: 'cognitive',
    difficulty: 'expert',
    duration: 120,
    targetAnxiety: 9,
    instructions: [
      '1. Belirsiz bir durum yaratın (ışık açık mı kapalı mı?)',
      '2. Kontrol etmeme kararı alın',
      '3. Belirsizlik hissini kabul edin',
      '4. 2 saat boyunca kontrol etmeyin',
      '5. Belirsizlikle yaşamayı öğrenin'
    ],
    instructionsEn: [
      '1. Create an uncertain situation (is light on or off?)',
      '2. Decide not to check',
      '3. Accept the feeling of uncertainty',
      '4. Don\'t check for 2 hours',
      '5. Learn to live with uncertainty'
    ],
    preparations: [
      'Çok güçlü destek sistemi olsun',
      'Terapi sırasında yapın',
      'Acil çıkış planı hazırlayın'
    ],
    preparationsEn: [
      'Have very strong support system',
      'Do during therapy',
      'Prepare emergency exit plan'
    ],
    warnings: [
      'Sadece deneyimli kişiler yapmalı',
      'Terapi süpervizyonu öneriliş',
      'Panik hissetseniz durdurun'
    ],
    warningsEn: [
      'Only experienced individuals should do this',
      'Therapy supervision recommended',
      'Stop if you feel panic'
    ],
    relatedCompulsions: ['checking', 'mental', 'reassurance'],
    tags: ['expert', 'uncertainty', 'cognitive', 'advanced'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Exercise Templates by Compulsion Type
export const ERP_EXERCISE_TEMPLATES = {
  washing: [
    'washing-hands-delay',
    'touching-doorknob',
    'contamination-exposure',
  ],
  checking: [
    'checking-reduction',
    'uncertainty-tolerance',
  ],
  ordering: [
    // Will be added
  ],
  mental: [
    'uncertainty-tolerance',
  ],
};

// Helper functions
export const getERPCategory = (id: ERPCategory): ERPCategoryInfo => {
  return ERP_CATEGORIES.find(cat => cat.id === id) || ERP_CATEGORIES[0];
};

export const getERPExercise = (id: string): ERPExercise | undefined => {
  return ERP_EXERCISES.find(exercise => exercise.id === id);
};

export const getERPExercisesByCategory = (category: ERPCategory): ERPExercise[] => {
  return ERP_EXERCISES.filter(exercise => exercise.category === category);
};

export const getERPExercisesByDifficulty = (difficulty: ERPDifficulty): ERPExercise[] => {
  return ERP_EXERCISES.filter(exercise => exercise.difficulty === difficulty);
};

export const getERPExercisesByCompulsion = (compulsionType: string): ERPExercise[] => {
  return ERP_EXERCISES.filter(exercise => 
    exercise.relatedCompulsions.includes(compulsionType)
  );
};

export const getDifficultyColor = (difficulty: ERPDifficulty): string => {
  const colors = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444',
    expert: '#8B5CF6',
  };
  return colors[difficulty];
};

export const getDifficultyLabel = (difficulty: ERPDifficulty, isEnglish: boolean = false): string => {
  const labels = {
    beginner: isEnglish ? 'Beginner' : 'Başlangıç',
    intermediate: isEnglish ? 'Intermediate' : 'Orta',
    advanced: isEnglish ? 'Advanced' : 'İleri',
    expert: isEnglish ? 'Expert' : 'Uzman',
  };
  return labels[difficulty];
}; 