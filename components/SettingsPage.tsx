
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Bell, Shield, Bot, Moon, Globe, Check, Key, Eye, EyeOff, ExternalLink, RefreshCw } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'preferences' | 'notifications' | 'security'>('preferences');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [editingApiKey, setEditingApiKey] = useState(false);

  const handleUpdateApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKeyInput);
      setApiKey(apiKeyInput);
      setEditingApiKey(false);
      // Reload page to reinitialize with new key
      window.location.reload();
    }
  };

  const handleResetApiKey = () => {
    if (confirm('هل أنت متأكد من حذف مفتاح API؟ سيتطلب إعادة إدخاله لاحقاً.')) {
      localStorage.removeItem('GEMINI_API_KEY');
      setApiKey('');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">{t('settings')}</h1>
        <p className="text-gray-600">تخصيص تجربة المنصة حسب احتياجاتك.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-e border-gray-100 p-4">
            <div className="space-y-1">
                <button 
                    onClick={() => setActiveTab('preferences')}
                    className={`w-full text-start px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'preferences' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                    <Bot className="w-5 h-5" />
                    التفضيلات & AI
                </button>
                <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full text-start px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'notifications' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                    <Bell className="w-5 h-5" />
                    الإشعارات
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`w-full text-start px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                    <Shield className="w-5 h-5" />
                    الأمان والخصوصية
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
            
            {activeTab === 'preferences' && (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">إعدادات المعلم الذكي (AI)</h2>
                        <div className="space-y-4">
                            <div className="bg-white border-2 border-brand-500/20 p-4 rounded-xl relative group cursor-pointer hover:border-brand-500 transition-colors">
                                <div className="absolute top-4 left-4 text-brand-500">
                                    <Check className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">الشخصية الودودة (منهجي)</h3>
                                <p className="text-sm text-gray-500">يتحدث بلهجة مصرية، يشجعك باستمرار، ويبسط المعلومات بأمثلة واقعية.</p>
                            </div>
                             <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl cursor-pointer hover:bg-white hover:border-gray-300 transition-colors">
                                <h3 className="font-bold text-gray-900 mb-1">الشخصية الأكاديمية</h3>
                                <p className="text-sm text-gray-500">أسلوب رسمي، دقيق، ومباشر. مناسب للمراجعة السريعة قبل الامتحانات.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">المظهر واللغة</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 block">لغة الواجهة</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setLanguage('ar')}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 ${language === 'ar' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        <Globe className="w-4 h-4" /> {t('languageArabic')}
                                    </button>
                                    <button 
                                        onClick={() => setLanguage('en')}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 ${language === 'en' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        <Globe className="w-4 h-4" /> {t('languageEnglish')}
                                    </button>
                                </div>
                            </div>
                             <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 block">الوضع الليلي</label>
                                <button className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <Moon className="w-4 h-4" />
                                        <span>فاتح (افتراضي)</span>
                                    </div>
                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-500">قريباً</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">تفضيلات الإشعارات</h2>
                    
                    {['تذكير بمواعيد المذاكرة', 'إشعارات الردود من المعلم الذكي', 'ملخص التقدم الأسبوعي', 'تنبيهات الاختبارات الجديدة'].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="font-bold text-gray-700">{item}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" defaultChecked={i < 2} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                            </label>
                        </div>
                    ))}
                </div>
            )}

             {activeTab === 'security' && (
                <div className="space-y-8 animate-fade-in">
                    
                    {/* API Key Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Key className="w-5 h-5 text-brand-600" />
                            مفتاح Gemini API
                        </h2>
                        
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-4">
                            <div className="flex items-start gap-3 mb-4">
                                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-green-900 mb-1">حالة API Key</h3>
                                    <p className="text-sm text-green-700">
                                        {apiKey ? '✓ مفتاح API محفوظ ونشط' : '✗ لم يتم تكوين مفتاح API'}
                                    </p>
                                </div>
                            </div>
                            
                            {apiKey && !editingApiKey && (
                                <div className="space-y-4">
                                    <div className="bg-white/50 rounded-xl p-4 border border-green-200">
                                        <label className="text-xs font-bold text-gray-600 mb-2 block">المفتاح الحالي</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm font-mono text-gray-800 bg-white px-3 py-2 rounded-lg border border-gray-200">
                                                {showApiKey ? apiKey : '•'.repeat(40)}
                                            </code>
                                            <button
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                className="p-2 hover:bg-white rounded-lg transition-colors"
                                            >
                                                {showApiKey ? <EyeOff className="w-5 h-5 text-gray-600" /> : <Eye className="w-5 h-5 text-gray-600" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setEditingApiKey(true)}
                                            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            تحديث المفتاح
                                        </button>
                                        <button
                                            onClick={handleResetApiKey}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {(!apiKey || editingApiKey) && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 mb-2 block">
                                            {editingApiKey ? 'المفتاح الجديد' : 'أدخل مفتاح API'}
                                        </label>
                                        <input
                                            type="text"
                                            value={apiKeyInput}
                                            onChange={(e) => setApiKeyInput(e.target.value)}
                                            placeholder="AIzaSy..."
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all font-mono text-sm"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleUpdateApiKey}
                                            disabled={!apiKeyInput.trim()}
                                            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                                        >
                                            حفظ المفتاح
                                        </button>
                                        {editingApiKey && (
                                            <button
                                                onClick={() => setEditingApiKey(false)}
                                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                            >
                                                إلغاء
                                            </button>
                                        )}
                                    </div>
                                    <a 
                                        href="https://makersuite.google.com/app/apikey" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-bold"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        احصل على مفتاح API من Google AI Studio
                                    </a>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                            💡 <span className="font-bold">نصيحة:</span> يتم تخزين المفتاح محلياً في متصفحك فقط ولن يتم إرساله لأي خادم.
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="border-t border-gray-100 pt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">كلمة المرور</h2>
                        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl text-yellow-800 text-sm mb-4">
                            يرجى العلم أن تغيير كلمة المرور سيؤدي إلى تسجيل الخروج من جميع الأجهزة الأخرى.
                        </div>
                        <button className="text-brand-600 font-bold hover:underline">تغيير كلمة المرور</button>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
