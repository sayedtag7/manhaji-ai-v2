import { Course, User, Language, TranslationKey, Badge } from './types';

export const BADGES: Badge[] = [
  {
    id: 'b1',
    nameAr: 'بداية قوية',
    nameEn: 'Strong start',
    icon: '🚀',
    descriptionAr: 'أتممت أول درس بنجاح',
    descriptionEn: 'You completed your first lesson successfully.',
    earnedDate: '2023-10-01'
  },
  {
    id: 'b2',
    nameAr: 'عبقري العلوم',
    nameEn: 'Science whiz',
    icon: '🧬',
    descriptionAr: 'أنهيت وحدة المادة وخواصها',
    descriptionEn: 'You mastered the matter and its properties unit.',
    earnedDate: '2023-10-15'
  },
  {
    id: 'b3',
    nameAr: 'المواظب',
    nameEn: 'Consistent learner',
    icon: '🔥',
    descriptionAr: 'سلسلة تعلم لمدة 7 أيام',
    descriptionEn: 'Seven days of continuous learning streak.',
    earnedDate: '2023-10-20'
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  name: 'أحمد محمد',
  level: 'المستوى 5',
  levelEn: 'Level 5',
  role: 'student',
  points: 1250,
  streak: 7,
  completedSessions: 34,
  badges: BADGES,
  activityData: [2, 5, 3, 8, 4, 6, 7, 0, 2, 4, 9, 5, 3, 2], // Last 14 days activity
  subscriptionTier: 'free'
};

export const COURSES: Course[] = [
  {
    id: 'c1',
    titleAr: 'العلوم - الصف الأول الإعدادي',
    titleEn: 'Science - Grade 7',
    subjectAr: 'العلوم',
    subjectEn: 'Science',
    progress: 85,
    weeklyProgress: [20, 35, 45, 60, 70, 78, 85],
    image: 'https://picsum.photos/seed/science/400/250',
    units: [
      {
        id: 'u1',
        titleAr: 'الوحدة الأولى: المادة وخواصها',
        titleEn: 'Unit 1: Matter and Its Properties',
        lessons: [
          {
            id: 'l1',
            titleAr: 'المادة وخواصها الفيزيائية',
            titleEn: 'Matter and its Physical Properties',
            durationAr: '25:30 دقيقة',
            durationEn: '25:30 min',
            isCompleted: true,
            isLocked: false,
            difficulty: 'easy',
            contentAr: `
              كل ما له كتلة وحجم يسمى مادة.
              الكتلة: مقدار ما يحتويه الجسم من مادة، وتقاس بالجرام (جم) أو الكيلوجرام (كجم).
              الحجم: الحيز الذي يشغله الجسم من الفراغ، ويقاس بالسنتيمتر المكعب (سم³).
              الكثافة: هي كتلة وحدة الحجوم من المادة، وتساوي الكتلة / الحجم.
              المواد الأقل كثافة من الماء تطفو (مثل الخشب والزيت)، والمواد الأكبر كثافة تغوص (مثل الحديد).
            `,
            contentEn: `Matter is any substance with mass and volume. Mass is the amount of matter an object contains and is measured in grams (g) or kilograms (kg). Volume is the space occupied by an object, measured in cubic centimeters (cm³). Density is mass per unit volume, so lighter objects float on water while heavier ones sink.`
          },
          {
            id: 'l2',
            titleAr: 'الخواص الكيميائية',
            titleEn: 'Chemical Properties',
            durationAr: '18:10 دقيقة',
            durationEn: '18:10 min',
            isCompleted: true,
            isLocked: false,
            difficulty: 'medium',
            contentAr: `
              تختلف الفلزات في نشاطها الكيميائي.
              فلزات نشطة جداً: مثل البوتاسيوم والصوديوم، تتفاعل مع الأكسجين بمجرد تعرضها للهواء الرطب.
              فلزات متوسطة النشاط: مثل الحديد والألومنيوم، تتفاعل مع الأكسجين بعد فترة وتكون طبقة من الصدأ.
              فلزات ضعيفة النشاط: مثل الفضة والذهب، يصعب تفاعلها مع الأكسجين مما يجعلها تستخدم في الحلي.
            `,
            contentEn: `Metals vary in chemical activity. Highly reactive metals like potassium and sodium oxidize instantly in moist air. Moderately active metals such as iron and aluminum rust slowly, while noble metals like silver and gold barely react, which is why they are used in jewelry.`
          }
        ]
      },
      {
        id: 'u2',
        titleAr: 'الوحدة الثانية: الطاقة',
        titleEn: 'Unit 2: Energy',
        lessons: [
          {
            id: 'l3',
            titleAr: 'مصادر الطاقة وصورها',
            titleEn: 'Energy Sources and Forms',
            durationAr: '30:15 دقيقة',
            durationEn: '30:15 min',
            isCompleted: true,
            isLocked: false,
            difficulty: 'easy',
            contentAr: `
              الطاقة هي القدرة على بذل شغل أو إحداث تغيير.
              مصادر الطاقة: الشمس (مصدر دائم)، الرياح، حركة المياه، التفاعلات النووية، الوقود.
              صور الطاقة: طاقة وضع، طاقة حركة، طاقة حرارية، طاقة كهربية، طاقة ضوئية.
              قانون بقاء الطاقة: الطاقة لا تفنى ولا تستحدث من العدم، ولكن تتحول من صورة لأخرى.
            `,
            contentEn: `Energy is the ability to do work or cause change. Renewable sources include the sun, wind, and water motion, while fossil fuels and nuclear reactions are non-renewable. Energy appears as potential, kinetic, thermal, electrical, and light. The law of conservation states that energy cannot be created or destroyed, only transformed.`
          },
          {
            id: 'l4',
            titleAr: 'تحولات الطاقة (الطاقة الحرارية)',
            titleEn: 'Energy Transformations (Thermal Energy)',
            durationAr: '22:00 دقيقة',
            durationEn: '22:00 min',
            isCompleted: false,
            isLocked: false,
            difficulty: 'hard',
            contentAr: `
              تنتقل الحرارة من الجسم الأعلى في درجة الحرارة إلى الجسم الأقل في درجة الحرارة.
              طرق انتقال الحرارة:
              1. التوصيل: انتقال الحرارة خلال الأجسام الصلبة (مثل المعادن).
              2. الحمل: انتقال الحرارة في الأوساط السائلة والغازية (صعود الهواء الساخن وهبوط البارد).
              3. الإشعاع: انتقال الحرارة في الأوساط المادية والفراغ (مثل حرارة الشمس).
              التطبيقات التكنولوجية: السخان الشمسي، المدفأة الكهربائية.
            `,
            contentEn: `Heat flows from hotter to colder objects through conduction (solids like metals), convection (liquids and gases moving warm air up and cold air down), and radiation (energy through space like sunlight). Technologies such as solar heaters and electric fireplaces harness these pathways.`
          },
          {
            id: 'l5',
            titleAr: 'الطاقة المتجددة',
            titleEn: 'Renewable Energy',
            durationAr: '15:00 دقيقة',
            durationEn: '15:00 min',
            isCompleted: false,
            isLocked: true,
            difficulty: 'medium',
            contentAr: 'محتوى الدرس غير متاح حالياً.',
            contentEn: 'Lesson content is locked for now.'
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    titleAr: 'الرياضيات - الجبر',
    titleEn: 'Mathematics - Algebra',
    subjectAr: 'الرياضيات',
    subjectEn: 'Math',
    progress: 40,
    weeklyProgress: [5, 10, 15, 20, 25, 30, 40],
    image: 'https://picsum.photos/seed/math/400/250',
    units: [
      {
        id: 'u_math_1',
        titleAr: 'الأعداد النسبية',
        titleEn: 'Rational Numbers',
        lessons: [
          {
            id: 'l_math_1',
            titleAr: 'مجموعة الأعداد النسبية',
            titleEn: 'The Set of Rational Numbers',
            durationAr: '20 دقيقة',
            durationEn: '20 min',
            isCompleted: true,
            isLocked: false,
            difficulty: 'medium',
            contentAr: 'العدد النسبي هو العدد الذي يمكن وضعه في صورة بسط ومقام أ/ب حيث ب لا تساوي صفر.',
            contentEn: 'A rational number can be expressed as a fraction a/b where b is not zero, including integers, terminating decimals, and repeating decimals.'
          }
        ]
      }
    ]
  },
  {
    id: 'c3',
    titleAr: 'اللغة العربية - النحو',
    titleEn: 'Arabic Language - Grammar',
    subjectAr: 'اللغة العربية',
    subjectEn: 'Arabic',
    progress: 10,
    weeklyProgress: [0, 2, 5, 5, 8, 8, 10],
    image: 'https://picsum.photos/seed/arabic/400/250',
    units: []
  }
];

export const SYSTEM_PROMPT_AR = `
أنت "منهجي"، مساعد تعليمي ذكي متخصص في دعم الطلاب المصريين.
شخصيتك:
- تستخدم لهجة مصرية مشجعة (يا بطل، عاش، بص بقى).
- تشرح المواضيع المعقدة ببساطة وتعتمد على أمثلة من الواقع.
- هدفك الأساسي هو مساعدة الطالب على الفهم وليس مجرد إعطاء الإجابة.

طريقة الشرح:
1. اشرح الخطوات واحدة تلو الأخرى.
2. اربط الفكرة بمواقف حياتية يعرفها الطالب في مصر.
3. إذا جاء طالب بصورة سؤال، ساعده على فهم كل خطوة ولا تعطه الحل النهائي مباشرة.
4. اجعل إجاباتك قصيرة، مقسمة، ومرفقة بتلميحات تعزز الفهم.
`;

export const SYSTEM_PROMPT_EN = `
You are "Manhaji", an empathetic AI tutor that helps learners from Egypt.
Your personality:
- speaks in an encouraging, friendly tone that builds confidence.
- explains complex ideas clearly with relevant examples.
- focuses on understanding rather than just giving answers.

How to respond:
1. Walk through each step before giving the conclusion.
2. Use relatable examples so the student can connect with the idea.
3. If a student shares a homework photo, guide them through the reasoning instead of giving a direct answer.
4. Keep replies short, structured, and filled with motivating tips.
`;

export const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = {
  ar: {
    appTitle: "منهجي",
    dashboard: "الرئيسية",
    courses: "دوراتي",
    progress: "تقدمي",
    aiTutor: "المعلم الذكي",
    logout: "تسجيل الخروج",
    statusNew: "جديد",
    statusInProgress: "قيد الدراسة",
    welcomeBack: "مرحباً بعودتك، {name}!",
    keepGoing: "أنت تحقق تقدماً رائعاً! استمر في رحلتك التعليمية.",
    streakDays: "أيام",
    streakLabel: "سلسلة التعلم",
    completedSessions: "الجلسات المكتملة",
    finishedSessions: "الجلسات المنتهية",
    totalCourses: "إجمالي الدورات",
    registeredCourses: "الدورات المسجلة",
    completionRate: "معدل الإكمال",
    completionMessage: "أحسنت! أكملت {completed} من أصل {total} جلسة",
    currentCourses: "دوراتي الحالية",
    viewAll: "عرض الكل",
    studying: "قيد الدراسة",
    completed: "مكتمل",
    continueLearning: "متابعة التعلم",
    recommendedLesson: "الدرس التالي الموصى به",
    recommended: "موصى به",
    startLearning: "ابدأ التعلم",
    upcomingQuiz: "اختبار قادم",
    reviewQuiz: "راجع قبل الاختبار",
    chatPlaceholder: "اكتب سؤالك أو صور واجبك...",
    chatWelcome: "أهلاً يا بطل! أنا \"منهجي\". صور لي أي سؤال واقف قدامك أو اسألني.",
    welcomeChatLesson: "أهلاً يا بطل! أنا \"منهجي\". شايف إنك بتذاكر درس \"{title}\". عندك أي سؤال فيه؟",
    typing: "جاري الكتابة...",
    downloadPdf: "تحميل المذكرة (PDF)",
    courseContent: "محتوى الدورة",
    units: "الوحدات",
    hours: "الساعات",
    totalLessons: "إجمالي الدروس",
    backToHome: "العودة للرئيسية",
    backToCourse: "العودة للدورة",
    apiKeyPrompt: "للبدء، يرجى إدخال مفتاح Google Gemini API",
    enterApiKey: "أدخل مفتاح API هنا...",
    startJourney: "ابدأ الرحلة التعليمية",
    questions: "سؤال",
    minutes: "دقيقة",
    explainSimply: "اشرح لي الدرس ببساطة",
    realExample: "مثال من الواقع",
    keyPoints: "تلخيص النقاط",
    askAboutLesson: "اسأل عن درس",
    lessonContent: "محتوى الدرس",
    less: "أقل",
    more: "أكثر",
    comingSoon: "قريباً",
    error: "عذراً، حدث خطأ.",
    chatTitle: "المحادثة",
    parentsArea: "أولياء الأمور",
    gamification: "إنجازاتي",
    badges: "الأوسمة",
    activityHeatmap: "نشاط التعلم",
    summarize: "تلخيص ذكي",
    homeworkHelper: "مساعد الواجب",
    uploadImage: "رفع صورة",
    recordVoice: "تسجيل صوتي",
    upgradeToPro: "ترقية للحساب الذهبي",
    subscriptionPlan: "خطة الاشتراك",
    parentDashboard: "لوحة ولي الأمر",
    studentProgress: "تقدم الطالب",
    generateReport: "إصدار تقرير الأداء",
    noteSaved: "تم حفظ الملاحظة",
    addNote: "أضف ملاحظة",
    saveNote: "حفظ الملاحظة",
    myNotes: "ملاحظاتي",
    audioOverview: "ملخص صوتي",
    generateAudio: "إنشاء ملخص صوتي",
    sources: "المصادر",
    addSource: "إضافة مصدر",
    generateQuiz: "إنشاء اختبار",
    sourcesSelected: "تم تحديد مصادر",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    accountSettings: "إعدادات الحساب",
    changePassword: "تغيير كلمة المرور",
    notifications: "الإشعارات",
    aiPreferences: "تفضيلات الذكاء الاصطناعي",
    saveChanges: "حفظ التغييرات",
    email: "البريد الإلكتروني",
    fullName: "الاسم الكامل",
    stage: "المرحلة الدراسية",
    classLevel: "الصف الدراسي",
    languageArabic: "العربية",
    languageEnglish: "الإنجليزية"
  },
  en: {
    appTitle: "Manhaji",
    dashboard: "Dashboard",
    courses: "Courses",
    progress: "Progress",
    aiTutor: "AI Tutor",
    logout: "Log out",
    statusNew: "New",
    statusInProgress: "In Progress",
    welcomeBack: "Welcome back, {name}!",
    keepGoing: "You're making amazing progress! Keep moving forward on your learning path.",
    streakDays: "Days",
    streakLabel: "Learning streak",
    completedSessions: "Completed sessions",
    finishedSessions: "Finished sessions",
    totalCourses: "Total courses",
    registeredCourses: "Registered courses",
    completionRate: "Completion rate",
    completionMessage: "Nice work! You completed {completed} out of {total} sessions.",
    currentCourses: "Current courses",
    viewAll: "View all",
    studying: "Studying",
    completed: "Completed",
    continueLearning: "Continue learning",
    recommendedLesson: "Next recommended lesson",
    recommended: "Recommended",
    startLearning: "Start learning",
    upcomingQuiz: "Upcoming quiz",
    reviewQuiz: "Review before the quiz",
    chatPlaceholder: "Type your question or upload your assignment photo...",
    chatWelcome: "Hey champion! I'm \"Manhaji.\" Send me a question or drop a homework photo.",
    welcomeChatLesson: "Hey champion! I'm \"Manhaji.\" I see you're studying \"{title}\". Got any questions?",
    downloadPdf: "Download notes (PDF)",
    courseContent: "Course content",
    units: "Units",
    hours: "Hours",
    totalLessons: "Total lessons",
    backToHome: "Back to home",
    backToCourse: "Back to the course",
    apiKeyPrompt: "To get started, please enter your Google Gemini API key",
    enterApiKey: "Enter the API key here...",
    startJourney: "Start the learning journey",
    questions: "Question",
    minutes: "Minutes",
    typing: "Typing...",
    explainSimply: "Explain this lesson simply",
    realExample: "Real-world example",
    keyPoints: "Key takeaways",
    askAboutLesson: "Ask about the lesson",
    lessonContent: "Lesson content",
    less: "Less",
    more: "More",
    comingSoon: "Coming soon",
    error: "Sorry, something went wrong.",
    chatTitle: "Chat",
    parentsArea: "Parents",
    gamification: "Achievements",
    badges: "Badges",
    activityHeatmap: "Learning activity",
    summarize: "Summarize",
    homeworkHelper: "Homework helper",
    uploadImage: "Upload image",
    recordVoice: "Record voice",
    upgradeToPro: "Upgrade to Pro",
    subscriptionPlan: "Subscription plan",
    parentDashboard: "Parent dashboard",
    studentProgress: "Student progress",
    generateReport: "Generate report",
    noteSaved: "Note saved",
    addNote: "Add note",
    saveNote: "Save note",
    myNotes: "My notes",
    audioOverview: "Audio overview",
    generateAudio: "Generate audio",
    sources: "Sources",
    addSource: "Add source",
    generateQuiz: "Generate quiz",
    sourcesSelected: "Sources selected",
    profile: "Profile",
    settings: "Settings",
    accountSettings: "Account settings",
    changePassword: "Change password",
    notifications: "Notifications",
    aiPreferences: "AI preferences",
    saveChanges: "Save changes",
    email: "Email",
    fullName: "Full name",
    stage: "Educational stage",
    classLevel: "Class level",
    languageArabic: "Arabic",
    languageEnglish: "English"
  }
};
