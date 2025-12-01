
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginPageProps {
  onLogin: () => void;
  onGoToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoToSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      
      {/* Dynamic Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-brand-100/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">
        
        {/* Left Side: Visuals & Brand (Notebook LM Style) */}
        <div className="hidden lg:flex flex-col justify-center relative p-10">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-white/50 backdrop-blur-sm shadow-sm text-brand-600 text-xs font-bold mb-6">
                    <Sparkles className="w-3 h-3" />
                    <span>الذكاء الاصطناعي التعليمي</span>
                </div>
                <h1 className="text-6xl font-black text-gray-900 leading-tight mb-6 tracking-tight">
                    رحلة تعلم <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-brand-600 to-brand-400">بلا حدود.</span>
                </h1>
                <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                    اكتشف تجربة تعليمية فريدة مدعومة بأحدث تقنيات الذكاء الاصطناعي. منصة منهجي تفهمك، تساعدك، وتضمن تفوقك.
                </p>
            </div>

            {/* Floating Glass Cards */}
            <div className="relative h-64 w-full">
                <div className="absolute top-0 right-0 bg-white/70 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-64 transform rotate-3 transition-transform hover:rotate-0 duration-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                            <BotIcon />
                        </div>
                        <div className="h-2 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                        <div className="h-2 w-3/4 bg-gray-100 rounded-full"></div>
                    </div>
                </div>

                <div className="absolute bottom-4 left-10 bg-white/80 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-800 font-bold text-sm">إجابة صحيحة!</p>
                        <p className="text-gray-400 text-xs">+50 نقطة خبرة</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
                
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-4 shadow-sm">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">مرحباً بعودتك</h2>
                    <p className="text-gray-500 mt-2 text-sm">أدخل بياناتك للمتابعة في رحلتك التعليمية</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 px-1">البريد الإلكتروني</label>
                        <div className="relative group">
                            <input 
                                type="email" 
                                required
                                className="w-full px-4 py-3.5 ps-11 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-300 text-gray-800 placeholder:text-gray-400 shadow-sm"
                                placeholder="name@example.com"
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5 group-focus-within:text-brand-500 transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 px-1">كلمة المرور</label>
                        <div className="relative group">
                            <input 
                                type="password" 
                                required
                                className="w-full px-4 py-3.5 ps-11 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-300 text-gray-800 placeholder:text-gray-400 shadow-sm"
                                placeholder="••••••••"
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5 group-focus-within:text-brand-500 transition-colors" />
                        </div>
                        <div className="flex justify-end pt-1">
                            <a href="#" className="text-xs font-bold text-gray-400 hover:text-brand-600 transition-colors">نسيت كلمة المرور؟</a>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>
                            تسجيل الدخول 
                            <ArrowRight className="w-5 h-5 rotate-180" />
                        </>}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-400 text-xs font-medium">خيارات أخرى</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        type="button" 
                        className="py-2.5 px-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 text-gray-700 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" /></svg>
                        Google
                    </button>
                    <button 
                        type="button" 
                        className="py-2.5 px-4 bg-[#C7000B]/5 hover:bg-[#C7000B]/10 border border-[#C7000B]/10 text-[#C7000B] font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        Huawei
                    </button>
                </div>

                <p className="text-center mt-8 text-gray-500 text-sm">
                    ليس لديك حساب؟ <button onClick={onGoToSignup} className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors">إنشاء حساب جديد</button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

// Internal SVG Component
const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 10H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default LoginPage;
