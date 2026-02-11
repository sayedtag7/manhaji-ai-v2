
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Bell, Shield, Bot, Moon, Globe, Check } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'preferences' | 'notifications' | 'security'>('preferences');

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
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">الأمان</h2>
                    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl text-yellow-800 text-sm">
                        يرجى العلم أن تغيير كلمة المرور سيؤدي إلى تسجيل الخروج من جميع الأجهزة الأخرى.
                    </div>
                    <button className="text-brand-600 font-bold hover:underline">تغيير كلمة المرور</button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
