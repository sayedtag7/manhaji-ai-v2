
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Award, Sparkles, TrendingUp, AlertCircle, Brain, Zap, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { signInWithGoogle, signInWithEmail, getAuthErrorMessage } from '../services/authService';

interface LoginPageProps {
  onLogin: () => void;
  onGoToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoToSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithEmail(email, password);
      onLogin();
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

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
                سجّل الدخول لمتابعة رحلتك التعليمية الذكية
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">البريد الإلكتروني</label>
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#16a34a] transition-colors" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="name@example.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-gray-700">كلمة المرور</label>
                  <a href="#" className="text-sm font-bold text-[#35c0a2] hover:text-[#16a34a] transition-colors">
                    نسيت كلمة المرور؟
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#16a34a] transition-colors" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#16a34a]/30 hover:shadow-xl hover:shadow-[#16a34a]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>تسجيل الدخول</span>}
                {!isLoading && <ArrowRight className="w-5 h-5 rotate-180" />}
              </button>

            </form>

            <div className="my-8 relative text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <span className="relative bg-white px-4 text-sm text-gray-400 font-medium">أو تابع باستخدام</span>
            </div>

            <button
               onClick={handleGoogleSignIn}
               type="button"
               disabled={isLoading}
               className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 py-3.5 rounded-xl font-bold text-gray-700 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Google
            </button>

            <p className="border-t border-gray-100 mt-8 pt-6 text-center text-sm font-medium text-gray-500">
              ليس لديك حساب؟ <button onClick={onGoToSignup} className="text-[#35c0a2] font-bold hover:text-[#16a34a] hover:underline transition-colors">إنشاء حساب جديد</button>
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
