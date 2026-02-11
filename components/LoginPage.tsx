
import React, { useState } from 'react';
import { ArrowRight, Loader2, Award, AlertCircle, Brain, Zap, Sparkles, Rocket } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { signInWithGoogle, getAuthErrorMessage } from '../services/authService';

interface LoginPageProps {
  onLogin: () => void;
  onGoToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoToSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { t } = useLanguage();

  // Quick UI-only login (no authentication required)
  const handleQuickLogin = () => {
    setIsLoading(true);
    setError('');
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 500);
  };

  // Google authentication login
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      onLogin();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getAuthErrorMessage(err.code));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#dcfce7] flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      
      {/* Background Ambience / Glassmorphism Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#35c0a2] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#35c0a2] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-[#16a34a] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      {/* Floating Card Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-white/50 animate-in zoom-in-95 duration-500">
        
        {/* Right Side - Login Form (RTL Layout) */}
        <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center bg-white z-10">
          
          <div className="max-w-md mx-auto w-full">
            {/* Header */}
            <div className="text-right mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#dcfce7] text-[#16a34a] mb-6 lg:hidden">
                <Brain className="w-8 h-8" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 tracking-tight">
                مرحباً بعودتك 👋
              </h1>
              <p className="text-gray-500 text-base font-medium">
                اختر طريقة الدخول المناسبة لك
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            {/* Login Options */}
            <div className="space-y-4">
              
              {/* Quick Login - UI Only */}
              <button
                onClick={handleQuickLogin}
                disabled={isLoading}
                className="w-full group relative overflow-hidden bg-gradient-to-br from-[#16a34a] to-[#35c0a2] hover:from-[#15803d] hover:to-[#16a34a] text-white py-6 px-6 rounded-2xl shadow-lg shadow-[#16a34a]/30 hover:shadow-xl hover:shadow-[#16a34a]/40 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Rocket className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-xl font-black mb-1">دخول سريع</h3>
                      <p className="text-sm text-white/80 font-medium">ابدأ التعلم مباشرة بدون تسجيل</p>
                    </div>
                  </div>
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <ArrowRight className="w-6 h-6 rotate-180 group-hover:translate-x-[-4px] transition-transform" />
                  )}
                </div>
              </button>

              {/* Divider */}
              <div className="relative text-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <span className="relative bg-white px-4 text-sm text-gray-400 font-medium">أو</span>
              </div>

              {/* Google Sign-In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full group relative bg-white border-2 border-gray-200 hover:border-[#35c0a2] hover:bg-gray-50 py-6 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-7 h-7" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                      </svg>
                    </div>
                    <div className="text-right">
                      <h3 className="text-xl font-black text-gray-900 mb-1">تسجيل بحساب Google</h3>
                      <p className="text-sm text-gray-500 font-medium">سجّل الدخول بحسابك في جوجل</p>
                    </div>
                  </div>
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                  ) : (
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#35c0a2] rotate-180 group-hover:translate-x-[-4px] transition-all" />
                  )}
                </div>
              </button>

            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="bg-gradient-to-r from-[#dcfce7] to-[#d1fae5] rounded-xl p-4 text-center">
                <p className="text-sm text-gray-700 font-medium">
                  💡 <span className="font-bold">نصيحة:</span> الدخول السريع يتيح لك تجربة المنصة بدون تسجيل
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm font-medium text-gray-500">
              تريد إنشاء حساب جديد؟ <button onClick={onGoToSignup} className="text-[#35c0a2] font-bold hover:text-[#16a34a] hover:underline transition-colors">سجل الآن</button>
            </p>
          </div>
        </div>

        {/* Left Side - Hero / Visuals (RTL Layout means this is visually on Left) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#16a34a] to-[#35c0a2] items-center justify-center p-12 overflow-hidden">
             
             {/* Pattern Overlay */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
             
             {/* Floating Shapes */}
             <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
             <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

             {/* Content Card */}
             <div className="relative z-10 w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center text-white shadow-xl">
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-6 shadow-inner border border-white/10">
                   <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black mb-4 drop-shadow-md">منهجي AI</h2>
                <p className="text-white/90 text-lg font-medium leading-relaxed mb-8">
                  اكتشف طريقة جديدة كلياً في التعلم مع مساعدك الذكي الشخصي.
                </p>
                
                {/* Stats Row */}
                <div className="flex justify-center gap-4 text-xs font-bold">
                   <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/10">
                      ⚡️ ذكاء اصطناعي
                   </div>
                   <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/10">
                      🚀 تطور سريع
                   </div>
                </div>

                {/* Decorative Floating Elements */}
                <div className="absolute -right-6 top-20 bg-white/90 backdrop-blur text-[#16a34a] p-3 rounded-2xl shadow-lg animate-bounce duration-[3000ms]">
                   <Award className="w-6 h-6" />
                </div>
                <div className="absolute -left-6 bottom-20 bg-white/90 backdrop-blur text-[#35c0a2] p-3 rounded-2xl shadow-lg animate-bounce duration-[4000ms]">
                   <Zap className="w-6 h-6" />
                </div>
             </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
