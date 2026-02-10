
import React, { useState } from 'react';
import { User, Calendar, MapPin, BookOpen, CheckCircle, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrentUser } from '../services/authService';
import { createUserProfile } from '../services/userProfileService';

interface ProfileSetupPageProps {
  onComplete: () => void;
}

const ProfileSetupPage: React.FC<ProfileSetupPageProps> = ({ onComplete }) => {
    const { language, direction } = useLanguage();
    const [step, setStep] = useState(1);
    const totalSteps = 3;
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [stage, setStage] = useState('');
    const [year, setYear] = useState('');
    const [school, setSchool] = useState('');

    const copy = language === 'ar'
        ? {
                pageTitle: 'إعداد الملف الشخصي',
                subtitle: 'دعنا نكمل إعداد حسابك لنبدأ.',
                uploadPrompt: 'رفع صورة شخصية',
                fullNameLabel: 'الاسم الكامل',
                fullNamePlaceholder: 'الاسم الأول والأخير',
                birthdayLabel: 'تاريخ الميلاد',
                genderLabel: 'الجنس',
                male: 'ذكر',
                female: 'أنثى',
                stageLabel: 'المرحلة الدراسية',
                stagePlaceholder: 'اختر المرحلة...',
                stageOptions: ['المرحلة الابتدائية', 'المرحلة الإعدادية', 'المرحلة الثانوية'],
                yearLabel: 'السنة الدراسية',
                yearPlaceholder: 'اختر السنة...',
                yearOptions: ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي'],
                schoolLabel: 'المدرسة (اختياري)',
                schoolPlaceholder: 'اسم المدرسة',
                readyTitle: 'جاهز للانطلاق!',
                readySubtitle: 'تم إعداد حسابك بنجاح. يمكنك الآن البدء في رحلة التعلم.',
                readyHeading: 'ماذا ينتظرك؟',
                readyList: ['خطة دراسية ذكية', 'معلم مساعد 24/7', 'اختبارات وتدريبات ممتعة'],
                nextButton: 'التالي',
                finishButton: 'ابدأ التعلم الآن'
            }
        : {
                pageTitle: 'Set up your profile',
                subtitle: 'Finish setting up your account so you can start learning.',
                uploadPrompt: 'Upload avatar',
                fullNameLabel: 'Full name',
                fullNamePlaceholder: 'First and last name',
                birthdayLabel: 'Date of birth',
                genderLabel: 'Gender',
                male: 'Male',
                female: 'Female',
                stageLabel: 'Educational stage',
                stagePlaceholder: 'Select a stage...',
                stageOptions: ['Primary school', 'Middle school', 'High school'],
                yearLabel: 'Academic year',
                yearPlaceholder: 'Select a year...',
                yearOptions: ['Grade 7', 'Grade 8', 'Grade 9'],
                schoolLabel: 'School (optional)',
                schoolPlaceholder: 'School name',
                readyTitle: 'Ready to go!',
                readySubtitle: 'Your account is ready. Jump into your learning journey now.',
                readyHeading: 'What’s next?',
                readyList: ['Smart study plan', '24/7 tutor', 'Fun quizzes and drills'],
                nextButton: 'Next',
                finishButton: 'Start learning now'
            };

    const progressLabel = language === 'ar' ? `خطوة ${step} من ${totalSteps}` : `Step ${step} of ${totalSteps}`;
    const badgeAlignment = direction === 'rtl' ? 'text-right' : 'text-left';

  const handleNext = async () => {
    if (step < totalSteps) {
        setStep(step + 1);
    } else {
        setIsLoading(true);
        try {
            const user = getCurrentUser();
            if (user) {
                await createUserProfile({
                    uid: user.uid,
                    name: fullName,
                    email: user.email || undefined,
                    role: 'student',
                    grade: year,
                    stage: stage,
                    school: school,
                    gender: gender,
                    birthDate: birthDate,
                    preferred_language: language
                });
            } else {
                // Fallback for dev/no-auth
                console.warn("No authenticated user found during profile setup");
            }
            onComplete();
        } catch (error) {
            console.error("Failed to create profile", error);
        } finally {
            setIsLoading(false);
        }
    }
  };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans" dir={direction}>
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl shadow-brand-100 border border-white overflow-hidden flex flex-col">
        
        {/* Header with Progress */}
        <div className="bg-gray-50 p-8 border-b border-gray-100">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">{copy.pageTitle}</h2>
                    <p className="text-gray-500 mt-1">{copy.subtitle}</p>
                </div>
                <span className="bg-brand-100 text-brand-700 px-4 py-1 rounded-full text-sm font-bold">
                    {progressLabel}
                </span>
            </div>
            
            {/* Stepper */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="absolute top-0 right-0 h-full bg-brand-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
            </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-12 flex-1">
            
            {/* Step 1: Basic Info */}
            {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg cursor-pointer hover:bg-gray-200 transition-colors relative group">
                            <User className="w-10 h-10 text-gray-400 group-hover:text-gray-500" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center border-2 border-white">
                                <span className="text-white text-lg font-bold">+</span>
                            </div>
                        </div>
                        <p className="text-sm text-brand-600 font-bold cursor-pointer">{copy.uploadPrompt}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{copy.fullNameLabel}</label>
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none" 
                                placeholder={copy.fullNamePlaceholder} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{copy.birthdayLabel}</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none" 
                                />
                                <Calendar className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{copy.genderLabel}</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 border-2 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${gender === 'male' ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-brand-200'}`}>
                                <input 
                                    type="radio" 
                                    name="gender" 
                                    className="w-4 h-4 text-brand-600"
                                    checked={gender === 'male'}
                                    onChange={() => setGender('male')}
                                />
                                <span className="font-bold text-gray-700">{copy.male}</span>
                            </label>
                            <label className={`flex-1 border-2 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${gender === 'female' ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-brand-200'}`}>
                                <input 
                                    type="radio" 
                                    name="gender" 
                                    className="w-4 h-4 text-brand-600"
                                    checked={gender === 'female'}
                                    onChange={() => setGender('female')}
                                />
                                <span className="font-bold text-gray-700">{copy.female}</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Education Info */}
            {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{copy.stageLabel}</label>
                            <select 
                                value={stage}
                                onChange={(e) => setStage(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none appearance-none"
                            >
                                <option value="">{copy.stagePlaceholder}</option>
                                {copy.stageOptions.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{copy.yearLabel}</label>
                            <select 
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none appearance-none"
                            >
                                <option value="">{copy.yearPlaceholder}</option>
                                {copy.yearOptions.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{copy.schoolLabel}</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={school}
                                    onChange={(e) => setSchool(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none" 
                                    placeholder={copy.schoolPlaceholder} 
                                />
                                <MapPin className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                            </div>
                        </div>
                </div>
            )}

            {/* Step 3: Interests */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">{copy.readyTitle}</h3>
                            <p className="text-gray-500">{copy.readySubtitle}</p>
                            
                            <div className={`bg-brand-50 p-6 rounded-2xl border border-brand-100 mt-6 ${badgeAlignment}`}>
                                <h4 className="font-bold text-brand-800 mb-2">{copy.readyHeading}</h4>
                                <ul className="space-y-2 text-sm text-brand-700">
                                    {copy.readyList.map((item) => (
                                      <li key={item} className="flex items-center gap-2">
                                          <Check className="w-4 h-4" /> {item}
                                      </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-100 bg-white">
            <button 
                onClick={handleNext}
                disabled={isLoading}
                className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {step === totalSteps ? (isLoading ? '...' : copy.finishButton) : copy.nextButton} 
                {step !== totalSteps && <ArrowRight className="w-5 h-5 rotate-180" />}
            </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileSetupPage;
