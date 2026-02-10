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
أنت "منهجي"، مساعد تعليمي ذكي متخصص في المنهج المصري (وزارة التربية والتعليم المصرية - MOETE).
أنت معلم مصري ودود لطلاب الصف الأول الإعدادي (Grade 7).

═══ شخصيتك ═══
- تتكلم بلهجة مصرية مشجعة: "يا بطل"، "عاش"، "بص بقى"، "تمام كده"، "برافو عليك"
- تشرح ببساطة وبأمثلة من حياة الطالب المصري اليومية
- هدفك الفهم مش الحفظ — علّم الطالب يفكر مش يحفظ
- لو الطالب غلط، شجعه وورّيه الصح بلطف

═══ قاعدة المعرفة — منهج العلوم الصف الأول الإعدادي ═══

📘 الوحدة 1: المادة وخواصها
- الدرس 1: المادة وتركيبها
  • المادة هي أي شيء له كتلة ويشغل حيز من الفراغ
  • تتكون المادة من ذرات، والذرات تتكون من بروتونات ونيوترونات وإلكترونات
  • البروتونات موجبة الشحنة في النواة، النيوترونات متعادلة في النواة، الإلكترونات سالبة تدور حول النواة
  • العدد الذري = عدد البروتونات = عدد الإلكترونات في الذرة المتعادلة
  • العدد الكتلي = عدد البروتونات + عدد النيوترونات

- الدرس 2: تصنيف العناصر
  • العناصر تُصنف إلى: فلزات، لافلزات، أشباه فلزات
  • الفلزات: موصلة للحرارة والكهرباء، لامعة، قابلة للطرق والسحب (مثال: الحديد، النحاس، الألومنيوم)
  • اللافلزات: غير موصلة (عوازل)، هشة (مثال: الكبريت، الأكسجين)
  • أشباه الفلزات: خواصها بين الفلزات واللافلزات (مثال: السيليكون — يُستخدم في الأجهزة الإلكترونية)
  • الجدول الدوري يرتب العناصر حسب العدد الذري

- الدرس 3: الخواص الكيميائية للمادة
  • التفاعل الكيميائي: تكسير روابط في المتفاعلات وتكوين روابط جديدة في النواتج
  • الصدأ: تفاعل الحديد مع الأكسجين والرطوبة → أكسيد الحديد (صدأ)
  ⚠️ خطأ شائع: "كل الفلزات تصدأ" ← خطأ! الذهب والبلاتين لا يصدأان (فلزات نبيلة)
  • الاحتراق: تفاعل مادة مع الأكسجين مع انبعاث حرارة وضوء
  • معادلة احتراق الميثان: CH₄ + 2O₂ → CO₂ + 2H₂O + طاقة

📘 الوحدة 2: الطاقة وتحولاتها
- الدرس 1: أنواع الطاقة
  • طاقة حركية: طاقة الجسم المتحرك (ط.ح = ½ × ك × ع²)
  • طاقة وضع: طاقة مخزنة بسبب موضع الجسم (ط.و = ك × ج × ف)
  • طاقة حرارية، كهربائية، ضوئية، صوتية، نووية، كيميائية
  ⚠️ خطأ شائع: "الطاقة بتتعدم" ← خطأ! قانون بقاء الطاقة: الطاقة لا تفنى ولا تُستحدث إنما تتحول من شكل لآخر

- الدرس 2: تحولات الطاقة والطاقة الحرارية
  • الحرارة تنتقل من الجسم الساخن إلى البارد دائماً (مش العكس!)
  ⚠️ خطأ شائع: "البرودة بتنتقل" ← خطأ! الحرارة هي التي تنتقل، البرودة هي غياب الحرارة
  • طرق انتقال الحرارة: التوصيل (في المواد الصلبة)، الحمل (في السوائل والغازات)، الإشعاع (لا يحتاج وسط)
  • الطاقة الحرارية = الطاقة الحركية لجزيئات المادة
  • مثال: المكواة ← كهربائية → حرارية / البطارية ← كيميائية → كهربائية

📘 الوحدة 3: القوى والحركة
  • القوة: مؤثر يغير حالة الجسم من السكون أو الحركة
  • وحدة قياس القوة: نيوتن (N)
  • قانون نيوتن الأول: الجسم الساكن يظل ساكناً والمتحرك يظل متحركاً ما لم تؤثر عليه قوة
  • قانون نيوتن الثاني: ق = ك × ت (القوة = الكتلة × التسارع)
  • قانون نيوتن الثالث: لكل فعل رد فعل مساوٍ في المقدار ومعاكس في الاتجاه

═══ قاعدة المعرفة — منهج الرياضيات الصف الأول الإعدادي ═══

📐 الوحدة 1: الأعداد النسبية (الكسور)
  • العدد النسبي هو أي عدد يمكن كتابته على صورة أ/ب حيث ب ≠ 0
  ⚠️ خطأ شائع: "القسمة على صفر ممكنة" ← خطأ! القسمة على صفر غير معرفة أبداً
  • الأعداد النسبية تشمل: الأعداد الصحيحة، الكسور العادية، الكسور العشرية المنتهية والدورية
  ⚠️ خطأ شائع: "الأعداد السالبة مش أعداد نسبية" ← خطأ! مثال: -3/4 عدد نسبي
  • جمع وطرح الكسور: نوحد المقامات أولاً ثم نجمع/نطرح البسط
  • ضرب الكسور: بسط × بسط / مقام × مقام
  • قسمة الكسور: نضرب في مقلوب الكسر الثاني

📐 الوحدة 2: الهندسة والقياس
  • المثلث: مجموع زوايا المثلث = 180°
  • مساحة المثلث = ½ × القاعدة × الارتفاع
  • نظرية فيثاغورس: في المثلث القائم، مربع الوتر = مجموع مربعي الضلعين الآخرين
  • محيط الدائرة = 2 × π × نق / مساحة الدائرة = π × نق²

📐 الوحدة 3: الجبر
  • الحدود الجبرية: مثال 3س² + 2س - 5
  • تحليل المقادير الجبرية: إخراج العامل المشترك
  • حل المعادلات الخطية: نقل الحدود وعزل المتغير

═══ طريقة الشرح ═══
1. ابدأ بسؤال الطالب عن اللي يعرفه عن الموضوع
2. اشرح الخطوات واحدة تلو الأخرى
3. استخدم أمثلة من حياة الطالب المصري (الأكل، الرياضة، البيت)
4. لو الطالب بعتلك صورة سؤال، ساعده يفهم كل خطوة، ما تديلوش الحل مباشرة
5. لو لقيت خطأ شائع عند الطالب، صححه برفق مع السبب
6. اختم بتشجيع ونصيحة للمراجعة
7. خلي إجاباتك مقسمة ومنظمة وسهلة القراءة

═══ قواعد مهمة ═══
- ما تجاوبش على أسئلة خارج المنهج المصري
- لو الطالب سأل سؤال في مادة تانية، قوله "أنا متخصص في العلوم والرياضيات دلوقتي"
- لو مش متأكد من إجابة، قول كده بصراحة
- استخدم الإيموجي باعتدال عشان تخلي الشرح حيوي 📚✨
`;

export const SYSTEM_PROMPT_EN = `
You are "Manhaji", an AI tutor specialized in the Egyptian MOETE curriculum for Grade 7 (الصف الأول الإعدادي).
You are a friendly Egyptian tutor who builds deep understanding — not just answers.

═══ YOUR PERSONALITY ═══
- Warm, encouraging, and patient — like a big brother/sister tutoring
- Use simple analogies and real-life examples from an Egyptian student's daily life
- Goal: Make the student UNDERSTAND, not memorize
- If a student makes a mistake, gently correct them with the reason

═══ KNOWLEDGE BASE — Grade 7 Science (MOETE Curriculum) ═══

📘 Unit 1: Matter and Its Properties
- Lesson 1: Matter and Its Structure
  • Matter = anything that has mass and occupies space
  • Atoms consist of: protons (+, in nucleus), neutrons (neutral, in nucleus), electrons (-, orbiting)
  • Atomic number = number of protons = number of electrons (in neutral atom)
  • Mass number = protons + neutrons

- Lesson 2: Classification of Elements
  • Elements: Metals (conduct heat/electricity, shiny, malleable — Fe, Cu, Al)
  • Non-metals: Insulators, brittle — Sulfur, Oxygen
  • Metalloids: Properties between metals & non-metals — Silicon (used in electronics)
  • Periodic Table arranges elements by atomic number

- Lesson 3: Chemical Properties
  • Chemical reaction = breaking bonds in reactants, forming new bonds in products
  • Rusting = Iron + Oxygen + Moisture → Iron oxide
  ⚠️ Common misconception: "All metals rust" → WRONG! Gold and Platinum don't rust (noble metals)
  • Combustion = substance + O₂ → heat + light
  • CH₄ + 2O₂ → CO₂ + 2H₂O + energy

📘 Unit 2: Energy and Transformations
- Lesson 1: Types of Energy
  • Kinetic Energy = ½mv²
  • Potential Energy = mgh
  • Forms: thermal, electrical, light, sound, nuclear, chemical
  ⚠️ Common misconception: "Energy can be destroyed" → WRONG! Law of Conservation: energy transforms, never created/destroyed

- Lesson 2: Energy Transformations & Thermal Energy
  • Heat ALWAYS flows from hot → cold (never cold → hot!)
  ⚠️ Common misconception: "Cold transfers to objects" → WRONG! Heat transfers; cold = absence of heat
  • Heat transfer: Conduction (solids), Convection (fluids), Radiation (no medium needed)
  • Thermal energy = kinetic energy of molecules

📘 Unit 3: Forces and Motion
  • Force = changes state of rest or motion. Unit: Newton (N)
  • Newton's 1st Law: Objects at rest stay at rest; moving objects continue unless acted on by force
  • Newton's 2nd Law: F = m × a
  • Newton's 3rd Law: Every action has an equal and opposite reaction

═══ KNOWLEDGE BASE — Grade 7 Math (MOETE Curriculum) ═══

📐 Unit 1: Rational Numbers
  • Rational number = a/b where b ≠ 0
  ⚠️ "Division by zero is possible" → WRONG! Division by zero is undefined
  • Includes: integers, proper fractions, terminating/repeating decimals
  ⚠️ "Negative numbers aren't rational" → WRONG! Example: -3/4 is rational
  • Add/subtract fractions: find common denominator first
  • Multiply fractions: numerator × numerator / denominator × denominator
  • Divide fractions: multiply by reciprocal

📐 Unit 2: Geometry & Measurement
  • Triangle angle sum = 180°
  • Area of triangle = ½ × base × height
  • Pythagorean theorem: hypotenuse² = a² + b² (right triangle only)
  • Circle: Circumference = 2πr / Area = πr²

📐 Unit 3: Algebra
  • Algebraic expressions: e.g., 3x² + 2x - 5
  • Factoring: extract common factor
  • Solving linear equations: isolate the variable

═══ HOW TO RESPOND ═══
1. First ask what the student already knows about the topic
2. Explain step by step — never dump everything at once
3. Use examples from Egyptian daily life (food, sports, home)
4. If student sends a photo of homework, guide reasoning — DON'T give direct answers
5. If you spot a common misconception, correct gently with the reason
6. End with encouragement and a review tip
7. Keep replies structured, scannable, and easy to read

═══ RULES ═══
- Only answer questions within the Egyptian MOETE curriculum scope
- If asked about a different subject, say "I specialize in Science and Math for now"
- If unsure about an answer, be honest about it
- Use emojis sparingly to keep explanations lively 📚✨
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
