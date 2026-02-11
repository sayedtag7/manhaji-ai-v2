import React, { useState } from 'react';
import { Key, AlertCircle, CheckCircle, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim()) {
      setError('الرجاء إدخال مفتاح API');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      setError('مفتاح API غير صحيح. يجب أن يبدأ بـ AIza');
      return;
    }

    // Save to localStorage and notify parent
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    onApiKeySet(apiKey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dcfce7] via-[#d1fae5] to-[#a7f3d0] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#35c0a2] text-white mb-6 shadow-lg">
              <Key className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-3">
              إعداد مفتاح API
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              للبدء، يرجى إدخال مفتاح Gemini API الخاص بك
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="text-right">
                <h3 className="font-bold text-blue-900 mb-2 text-lg">كيفية الحصول على مفتاح API:</h3>
                <ol className="space-y-2 text-blue-800 font-medium text-sm">
                  <li>1. انتقل إلى Google AI Studio</li>
                  <li>2. قم بتسجيل الدخول بحساب Google الخاص بك</li>
                  <li>3. انقر على "Get API Key" أو "الحصول على مفتاح API"</li>
                  <li>4. انسخ المفتاح والصقه أدناه</li>
                </ol>
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  افتح Google AI Studio
                </a>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                مفتاح Gemini API
              </label>
              <div className="relative group">
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#16a34a] transition-colors" />
                <input 
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-14 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 transition-all font-mono text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-sans"
                  placeholder="AIzaSyD...example..."
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                💡 سيتم حفظ المفتاح بشكل آمن في متصفحك فقط
              </p>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-gradient-to-br from-[#16a34a] to-[#35c0a2] hover:from-[#15803d] hover:to-[#16a34a] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#16a34a]/30 hover:shadow-xl hover:shadow-[#16a34a]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              حفظ والمتابعة
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-green-800 font-medium">
                🔒 <span className="font-bold">خصوصيتك مهمة:</span> يتم تخزين المفتاح محلياً في متصفحك ولن يتم إرساله لأي خادم
              </p>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 font-medium">
            هل تواجه مشكلة؟{' '}
            <a 
              href="https://github.com/sayedtag7/manhaji-ai-v2/issues" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#16a34a] font-bold hover:underline"
            >
              تواصل معنا
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;
