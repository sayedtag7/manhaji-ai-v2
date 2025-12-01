
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, BookOpen, GraduationCap, Users, Check, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Role } from '../types';

interface SignupPageProps {
  onSignupSuccess: () => void;
  onGoToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onGoToLogin }) => {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleNextStep = () => {
    if (selectedRole) setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSignupSuccess();
    }, 1500);
  };

  const RoleCard = ({ role, icon: Icon, title, desc }: { role: Role, icon: any, title: string, desc: string }) => (
    <div 
        onClick={() => handleRoleSelect(role)}
        className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-3 group ${
            selectedRole === role 
            ? 'bg-brand-50 border-2 border-brand-500 shadow-lg shadow-brand-100 scale-105' 
            : 'bg-white border-2 border-transparent hover:border-gray-200 hover:shadow-md hover:-translate-y-1'
        }`}
    >
        {selectedRole === role && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-sm animate-in zoom-in duration-200">
                <Check className="w-3.5 h-3.5" />
            </div>
        )}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
            selectedRole === role ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600'
        }`}>
            <Icon className="w-7 h-7" />
        </div>
        <div>
            <h3 className={`text-base font-bold mb-1 ${selectedRole === role ? 'text-brand-800' : 'text-gray-800'}`}>{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed px-2">{desc}</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      
      {/* Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] left-[10%] w-[700px] h-[700px] bg-blue-50/50 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-brand-50/50 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      <div className="w-full max-w-5xl z-10 flex flex-col lg:flex-row bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-xl shadow-gray-100/50 overflow-hidden min-h-[600px]">
        
        {/* Left Side: Brand Info (Sticky) */}
        <div className="hidden lg:flex w-1/3 bg-gray-900 text-white p-10 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
            <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-brand-500/20 blur-[100px] rounded-full z-0"></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl font-black mb-4">انضم إلينا</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                    مجتمع تعليمي متكامل ينتظرك. سواء كنت طالباً تبحث عن التفوق، معلماً يسعى للتميز، أو ولي أمر يتابع النجاح.
                </p>
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm"><Check className="w-4 h-4 text-brand-400"/></div>
                    <span>أدوات ذكية للجميع</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm"><Check className="w-4 h-4 text-brand-400"/></div>
                    <span>تحليلات أداء فورية</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm"><Check className="w-4 h-4 text-brand-400"/></div>
                    <span>مجتمع آمن ومتطور</span>
                </div>
            </div>
        </div>

        {/* Right Side: Dynamic Content */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative">
            <div className="max-w-md mx-auto w-full">
                
                <div className="text-center mb-8">
                    {step === 'role' ? (
                        <>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">من أنت؟</h1>
                            <p className="text-gray-500">اختر نوع حسابك لنبدأ في تخصيص تجربتك.</p>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setStep('role')} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-bold">
                                <ChevronLeft className="w-4 h-4" /> تغيير الدور
                            </button>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">إكمال التسجيل</h1>
                            <p className="text-gray-500">أدخل بياناتك لإنشاء حساب {selectedRole === 'student' ? 'طالب' : selectedRole === 'teacher' ? 'معلم' : 'ولي أمر'}.</p>
                        </>
                    )}
                </div>

                {step === 'role' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <RoleCard 
                                role="student" 
                                icon={GraduationCap} 
                                title="طالب" 
                                desc="للمذاكرة وحل الاختبارات" 
                            />
                            <RoleCard 
                                role="teacher" 
                                icon={BookOpen} 
                                title="معلم" 
                                desc="لإدارة الفصول والطلاب" 
                            />
                            <RoleCard 
                                role="parent" 
                                icon={Users} 
                                title="ولي أمر" 
                                desc="لمتابعة أداء الأبناء" 
                            />
                        </div>
                        <button 
                            onClick={handleNextStep}
                            disabled={!selectedRole}
                            className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            متابعة <ArrowRight className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                )}

                {step === 'form' && (
                    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-in">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 px-1">البريد الإلكتروني</label>
                            <div className="relative group">
                                <input 
                                    type="email" 
                                    required
                                    className="w-full px-4 py-3.5 ps-11 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-gray-800 placeholder:text-gray-400 shadow-sm"
                                    placeholder="name@example.com"
                                />
                                <Mail className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5 group-focus-within:text-brand-500 transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 px-1">كلمة المرور</label>
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        required
                                        className="w-full px-4 py-3.5 ps-11 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-gray-800 placeholder:text-gray-400 shadow-sm"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5 group-focus-within:text-brand-500 transition-colors" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 px-1">تأكيد الكلمة</label>
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        required
                                        className="w-full px-4 py-3.5 ps-11 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-gray-800 placeholder:text-gray-400 shadow-sm"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5 group-focus-within:text-brand-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'إنشاء الحساب'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-400 text-xs font-medium">أو سجل عبر</span>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center">
                             <button type="button" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 text-gray-600">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" /></svg>
                             </button>
                             <button type="button" className="p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100 text-[#C7000B]">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                             </button>
                        </div>
                    </form>
                )}

                <p className="text-center mt-8 text-gray-500 text-sm">
                    لديك حساب بالفعل؟ <button onClick={onGoToLogin} className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors">تسجيل الدخول</button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
