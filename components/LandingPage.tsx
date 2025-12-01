
import React from 'react';
import {
  Bot, 
  BookOpen, 
  Target, 
  BarChart3, 
  Video, 
  PenTool, 
  Award, 
  Cloud, 
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { language, direction, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const logoSrc = language === 'ar' ? '/logo_ar.png' : '/logo_en.png';
  const heroAlign = direction === 'rtl' ? 'lg:text-right text-right' : 'lg:text-left text-left';

  const landingCopy = {
    ar: {
      heroBadge: 'مدعوم بتقنيات Huawei Cloud & Pangu AI',
      heroTitleLine1: 'رحلة التعلم الذكي',
      heroTitleLine2: 'تبدأ من هنا',
      heroSubtitle: 'منصة تعليمية شاملة تستخدم الذكاء الاصطناعي لتوفير تجربة مخصصة لكل طالب \n وتغطي المناهج المصرية بالكامل مع معلم ذكي متاح 24/7.',
      heroPrimaryCta: 'ابدأ رحلتك التعليمية',
      heroSecondaryCta: 'اكتشف المميزات',
      headerCta: 'ابدأ مجاناً',
      floatingBadgeTitle: 'إجابات دقيقة',
      floatingBadgeSubtitle: 'ذكاء اصطناعي متطور',
      stats: [
        { value: '50k+', label: 'طالب نشط' },
        { value: '500+', label: 'دورة تعليمية' },
        { value: '95%', label: 'معدل الرضا' }
      ],
      navFeatures: 'المميزات',
      navHow: 'كيف يعمل',
      navBenefits: 'لمن المنصة',
      featuresTitle: 'لماذا تختار منهجي؟',
      featuresSubtitle: 'مميزات فريدة صممت خصيصاً لجعل التعلم أكثر متعة وفاعلية للطلاب المصريين',
      features: [
        { title: 'معلم ذكي (AI)', description: 'مساعد تعليمي ذكي مدعوم بنموذج Huawei Pangu يجيب على أسئلتك 24/7 بدقة عالية.' },
        { title: 'مناهج شاملة', description: 'تغطية كاملة للمناهج المصرية من الابتدائية للثانوية مع شروحات مبسطة.' },
        { title: 'مسار مخصص', description: 'نظام ذكي يحدد مستواك ويضع لك خطة دراسية تناسب نقاط قوتك وضعفك.' },
        { title: 'تحليل الأداء', description: 'تقارير تفصيلية ورسوم بيانية تتابع تطورك الدراسي لحظة بلحظة.' },
        { title: 'فيديو تفاعلي', description: 'مكتبة ضخمة من الفيديوهات التعليمية عالية الجودة مع ملاحظات ذكية.' },
        { title: 'اختبارات ذكية', description: 'بنك أسئلة ضخم وتدريبات تتكيف مع مستواك الدراسي.' },
        { title: 'جوائز وإنجازات', description: 'نظام تحفيزي يمنحك نقاط وأوسمة مع كل درس تنهيه بنجاح.' },
        { title: 'سحابة آمنة', description: 'بنية تحتية سحابية من Huawei تضمن سرعة وأمان بياناتك.' }
      ],
      stepsTitle: 'كيف تعمل المنصة؟',
      stepsSubtitle: 'ثلاث خطوات بسيطة تفصلك عن التفوق',
      steps: [
        { number: '1', title: 'أنشئ حسابك', description: 'سجل بياناتك واختر مرحلتك الدراسية والمواد في دقيقة واحدة.' },
        { number: '2', title: 'ابدأ التعلم', description: 'شاهد الدروس، حل التمارين، واسأل المعلم الذكي في أي وقت.' },
        { number: '3', title: 'تفوق واحتفل', description: 'تابع تقدمك، احصل على الشهادات، وحقق أعلى الدرجات.' }
      ],
      benefits: {
        students: ['تعلم بالسرعة التي تناسبك', 'إجابات فورية لأي سؤال صعب', 'تدريب على نمط الامتحانات', 'مراجعات نهائية ذكية'],
        teachers: ['متابعة دقيقة لمستوى الطلاب', 'توفير الوقت في الشرح المكرر', 'بنك أسئلة جاهز للاختبارات', 'أدوات تحليل نقاط الضعف'],
        parents: ['تقارير دورية عن مستوى الأبناء', 'توفير تكاليف الدروس الخصوصية', 'ضمان بيئة تعليمية آمنة', 'متابعة الحضور والنشاط']
      },
      footerQuickLinks: 'روابط سريعة',
      footerSupport: 'الدعم',
      footerContact: 'تواصل معنا',
      footerDescription: 'المنصة التعليمية الأولى المدعومة بالذكاء الاصطناعي في مصر.',
      footerPoweredBy: 'مدعوم بـ',
      footerLinks: ['عن المنصة', 'الدورات', 'الأسعار'],
      footerSupportLinks: ['مركز المساعدة', 'تواصل معنا', 'الشروط والأحكام'],
      footerCopy: '© 2025 منهجي - جميع الحقوق محفوظة'
    },
    en: {
      heroBadge: 'Powered by Huawei Cloud & Pangu AI',
      heroTitleLine1: 'The smart learning journey',
      heroTitleLine2: 'starts here',
      heroSubtitle: 'A comprehensive AI-driven platform that personalizes learning for every student \n and covers Egyptian curricula with a smart tutor available 24/7.',
      heroPrimaryCta: 'Start your learning journey',
      heroSecondaryCta: 'Explore the features',
      headerCta: 'Start for free',
      floatingBadgeTitle: 'Precision answers',
      floatingBadgeSubtitle: 'Advanced AI insights',
      stats: [
        { value: '50k+', label: 'Active learners' },
        { value: '500+', label: 'Courses' },
        { value: '95%', label: 'Satisfaction rate' }
      ],
      navFeatures: 'Features',
      navHow: 'How it works',
      navBenefits: 'Who it’s for',
      featuresTitle: 'Why choose Manhaji?',
      featuresSubtitle: 'Human-centred advantages that make learning more enjoyable and effective for Egyptian students',
      features: [
        { title: 'AI Tutor', description: 'Intelligent assistant powered by Huawei Pangu that answers your questions 24/7 with precision.' },
        { title: 'Comprehensive Curriculum', description: 'Full coverage of the Egyptian curriculum from primary to secondary with simplified explanations.' },
        { title: 'Personalized Path', description: 'An adaptive system that spots your strengths and designs a study plan tailored to you.' },
        { title: 'Performance Analytics', description: 'Detailed reports and charts that track your academic progress in real time.' },
        { title: 'Interactive Videos', description: 'A vast library of high-quality lessons paired with smart notes.' },
        { title: 'Smart Quizzes', description: 'A huge question bank and drills that adapt to your level.' },
        { title: 'Rewards & Achievements', description: 'A gamified system that grants points and badges for every completed lesson.' },
        { title: 'Secure Cloud', description: 'Huawei-powered infrastructure that keeps your data fast and safe.' }
      ],
      stepsTitle: 'How does it work?',
      stepsSubtitle: 'Three simple steps that lead you to excellence',
      steps: [
        { number: '1', title: 'Create your profile', description: 'Register, pick your stage and subjects in under a minute.' },
        { number: '2', title: 'Start learning', description: 'Watch lessons, solve exercises, and ask the smart teacher anytime.' },
        { number: '3', title: 'Excel and celebrate', description: 'Track your progress, earn certificates, and hit top grades.' }
      ],
      benefits: {
        students: ['Learn at your own pace', 'Instant answers to tough questions', 'Exam-style practice', 'Smart revision rounds'],
        teachers: ['Monitor student levels with precision', 'Save time on redundant explanations', 'Ready-made question banks', 'Tools to diagnose weaknesses'],
        parents: ['Periodic progress reports', 'Cut down on tuition costs', 'Secure learning environment', 'Track attendance and engagement']
      },
      footerQuickLinks: 'Quick links',
      footerSupport: 'Support',
      footerContact: 'Connect with us',
      footerDescription: 'The first AI-powered learning platform in Egypt.',
      footerPoweredBy: 'Powered by',
      footerLinks: ['About', 'Courses', 'Pricing'],
      footerSupportLinks: ['Help center', 'Talk to us', 'Terms & Conditions'],
      footerCopy: '© 2025 Manhaji – All rights reserved'
    }
  };

  const copy = landingCopy[language];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800" dir={direction}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <div>
                <img src={logoSrc} alt="Manhaji logo" className="w-[144px] h-[144px] object-contain" />
              </div>
              <nav className="hidden md:flex items-center gap-8">
                <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-brand-600 font-medium transition-colors">{copy.navFeatures}</button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-brand-600 font-medium transition-colors">{copy.navHow}</button>
                <button onClick={() => scrollToSection('benefits')} className="text-gray-600 hover:text-brand-600 font-medium transition-colors">{copy.navBenefits}</button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {language === 'ar' ? t('languageEnglish') : t('languageArabic')}
                </span>
              </button>
              <div className="hidden md:flex items-center gap-4">
                <button onClick={onStart} className="text-gray-600 hover:text-brand-600 font-bold px-4 py-2">
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
                </button>
                <button onClick={onStart} className="bg-brand-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-brand-600 transition-all hover:scale-105 shadow-lg shadow-brand-200">
                  {copy.headerCta}
                </button>
              </div>
            </div>

            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 shadow-lg absolute w-full">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('features')} className="text-right py-2 font-medium text-gray-700">{copy.navFeatures}</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-right py-2 font-medium text-gray-700">{copy.navHow}</button>
              <button onClick={onStart} className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold">{copy.heroPrimaryCta}</button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <div className={`lg:w-1/2 z-10 ${heroAlign}`}>
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-brand-100">
                <Cloud className="w-4 h-4" />
                {copy.heroBadge}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                {copy.heroTitleLine1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-brand-600 to-brand-400">{copy.heroTitleLine2}</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 whitespace-pre-line">
                {copy.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button onClick={onStart} className="w-full sm:w-auto px-8 py-4 bg-brand-500 text-white rounded-xl font-bold text-lg hover:bg-brand-600 transition-transform hover:scale-105 shadow-xl shadow-brand-200 flex items-center justify-center gap-2">
                  {copy.heroPrimaryCta} <ArrowRight className={`w-5 h-5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={() => scrollToSection('features')} className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-xl font-bold text-lg hover:border-brand-200 hover:bg-brand-50 transition-colors">
                  {copy.heroSecondaryCta}
                </button>
              </div>
              
              <div className={`mt-10 flex items-center justify-center lg:justify-start gap-8 border-t border-gray-100 pt-8 ${direction === 'rtl' ? 'lg:text-right text-right' : 'lg:text-left text-left'}`}>
                <div>
                  <p className="text-3xl font-black text-gray-900">{copy.stats[0].value}</p>
                  <p className="text-sm text-gray-500">{copy.stats[0].label}</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div>
                  <p className="text-3xl font-black text-gray-900">{copy.stats[1].value}</p>
                  <p className="text-sm text-gray-500">{copy.stats[1].label}</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div>
                  <p className="text-3xl font-black text-gray-900">{copy.stats[2].value}</p>
                  <p className="text-sm text-gray-500">{copy.stats[2].label}</p>
                </div>
              </div>
            </div>

            {/* Hero Image / Visual */}
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-brand-500/10 blur-3xl rounded-full transform rotate-12"></div>
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                 <img 
                    src="https://images.pexels.com/photos/3862379/pexels-photo-3862379.jpeg?auto=compress&cs=tinysrgb&w=800" 
                    alt="Students Learning" 
                    className="rounded-2xl w-full h-auto object-cover"
                 />
                 {/* Floating Badges */}
                 <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">{copy.floatingBadgeTitle}</p>
                        <p className="text-xs text-gray-500">{copy.floatingBadgeSubtitle}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{copy.featuresTitle}</h2>
            <p className="text-lg text-gray-600">{copy.featuresSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Bot className="w-8 h-8 text-white" />, color: 'bg-brand-500' },
              { icon: <BookOpen className="w-8 h-8 text-white" />, color: 'bg-blue-500' },
              { icon: <Target className="w-8 h-8 text-white" />, color: 'bg-purple-500' },
              { icon: <BarChart3 className="w-8 h-8 text-white" />, color: 'bg-orange-500' },
              { icon: <Video className="w-8 h-8 text-white" />, color: 'bg-red-500' },
              { icon: <PenTool className="w-8 h-8 text-white" />, color: 'bg-indigo-500' },
              { icon: <Award className="w-8 h-8 text-white" />, color: 'bg-yellow-500' },
              { icon: <Cloud className="w-8 h-8 text-white" />, color: 'bg-cyan-500' }
            ].map((meta, idx) => (
              <FeatureCard
                key={copy.features[idx].title}
                icon={meta.icon}
                color={meta.color}
                title={copy.features[idx].title}
                description={copy.features[idx].description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">{copy.stepsTitle}</h2>
            <p className="text-lg text-gray-600">{copy.stepsSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {copy.steps.map((step) => (
              <StepCard key={step.number} number={step.number} title={step.title} description={step.description} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-brand-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { emoji: '🎓', heading: language === 'ar' ? 'للطلاب' : 'Students', items: copy.benefits.students },
              { emoji: '👨‍🏫', heading: language === 'ar' ? 'للمعلمين' : 'Teachers', items: copy.benefits.teachers },
              { emoji: '👪', heading: language === 'ar' ? 'لأولياء الأمور' : 'Parents', items: copy.benefits.parents }
            ].map(({ emoji, heading, items }) => (
              <div key={heading}>
                <h3 className="text-2xl font-bold mb-6 text-brand-300">{emoji} {heading}</h3>
                <ul className="space-y-4">
                  {items.map((item) => <ListItem key={item} text={item} />)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={logoSrc} alt="Manhaji logo" className="w-[48px] h-[48px] object-contain" />
                <span className="text-xl font-bold text-white">{language === 'ar' ? 'منهجي' : 'Manhaji'}</span>
              </div>
              <p className="text-sm mb-4">{copy.footerDescription}</p>
              <div className="inline-flex items-center gap-2 bg-gray-800 px-3 py-1 rounded text-xs text-gray-300">
                <span>{copy.footerPoweredBy}</span>
                <strong className="text-white">Huawei Cloud</strong>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">{copy.footerQuickLinks}</h4>
              <ul className="space-y-2 text-sm">
                {copy.footerLinks.map((label) => (
                  <li key={label}>
                    <a href="#" className="hover:text-brand-400">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">{copy.footerSupport}</h4>
              <ul className="space-y-2 text-sm">
                {copy.footerSupportLinks.map((label) => (
                  <li key={label}>
                    <a href="#" className="hover:text-brand-400">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">{copy.footerContact}</h4>
              <div className="flex gap-4">
                {/* Social Icons Placeholder */}
                <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-brand-600 cursor-pointer transition-colors"></div>
                <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-brand-600 cursor-pointer transition-colors"></div>
                <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-brand-600 cursor-pointer transition-colors"></div>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-800 text-sm">
            {copy.footerCopy}
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-components for cleaner code
const FeatureCard = ({ icon, title, description, color }: { icon: any, title: string, description: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="relative p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center hover:bg-white hover:shadow-lg transition-all">
    <div className="w-12 h-12 bg-white border-2 border-brand-500 text-brand-600 rounded-full flex items-center justify-center font-black text-xl mx-auto mb-6 shadow-sm">
      {number}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const ListItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3">
    <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
      <CheckCircle className="w-3 h-3 text-white" />
    </div>
    <span className="text-gray-100 font-medium">{text}</span>
  </li>
);

export default LandingPage;
