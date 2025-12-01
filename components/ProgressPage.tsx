
import React from 'react';
import { MOCK_USER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { TrendingUp, Clock, Book, CheckCircle, Award, Download, ArrowUpRight } from 'lucide-react';
import Gamification from './Gamification';
import Sparkline from './Sparkline';

const ProgressPage: React.FC = () => {
  const { t } = useLanguage();

  const certificates = [
    { id: 1, title: "العلوم - الصف الأول الإعدادي", date: "2023-11-15" },
    { id: 2, title: "أساسيات الرياضيات", date: "2023-10-01" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Stats Column */}
        <div className="flex-1 space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">{t('progress')}</h1>
                <p className="text-gray-600">تابع إحصائياتك ونموك التعليمي.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-500 font-bold text-sm">{t('completionRate')}</span>
                            <Clock className="w-5 h-5 text-brand-500" />
                        </div>
                        <h3 className="text-4xl font-black text-gray-800 mb-1">85%</h3>
                        <p className="text-xs text-green-500 flex items-center gap-1 font-bold">
                            <TrendingUp className="w-3 h-3" /> +5% هذا الأسبوع
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                     <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-500 font-bold text-sm">{t('totalCourses')}</span>
                            <Book className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="text-4xl font-black text-gray-800 mb-1">6</h3>
                        <p className="text-xs text-blue-500 font-bold">{t('registeredCourses')}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                     <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-500 font-bold text-sm">الشهادات</span>
                            <Award className="w-5 h-5 text-yellow-500" />
                        </div>
                        <h3 className="text-4xl font-black text-gray-800 mb-1">{certificates.length}</h3>
                        <p className="text-xs text-yellow-600 font-bold">شهادات موثقة</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                     <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-500 font-bold text-sm">{t('completedSessions')}</span>
                            <CheckCircle className="w-5 h-5 text-purple-500" />
                        </div>
                        <h3 className="text-4xl font-black text-gray-800 mb-1">{MOCK_USER.completedSessions}</h3>
                        <p className="text-xs text-purple-500 font-bold">جلسة تعليمية</p>
                    </div>
                </div>
            </div>

            {/* Weekly Activity Chart (CSS Bar Chart) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">النشاط الأسبوعي</h3>
                        <p className="text-gray-500 text-sm">عدد ساعات التعلم في آخر 7 أيام</p>
                    </div>
                    <div className="text-right">
                         <p className="text-3xl font-black text-brand-600">12.5</p>
                         <p className="text-xs text-gray-400 font-bold uppercase">ساعة</p>
                    </div>
                </div>
                
                <div className="flex items-end justify-between h-40 gap-2">
                    {[40, 70, 30, 85, 50, 90, 60].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                             <div className="w-full bg-gray-100 rounded-t-xl relative overflow-hidden h-full flex items-end">
                                <div 
                                    className="w-full bg-brand-500 opacity-80 group-hover:opacity-100 transition-all duration-500 rounded-t-xl" 
                                    style={{ height: `${h}%` }}
                                ></div>
                             </div>
                             <span className="text-xs font-bold text-gray-400 group-hover:text-brand-600">
                                {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'][i]}
                             </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* AI Insight Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold uppercase tracking-wider text-xs bg-white/20 px-2 py-1 rounded text-white/90">AI Insight</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">أداؤك في "العلوم" ممتاز! 🚀</h3>
                    <p className="text-indigo-100 mb-6 max-w-lg leading-relaxed">
                        لاحظت أنك تقضي وقتاً أطول في المواد العلمية وتحقق درجات عالية. أنصحك بالتركيز قليلاً على "اللغة العربية" للحفاظ على توازنك الدراسي.
                    </p>
                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2">
                        عرض الخطة المقترحة <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

        </div>

        {/* Sidebar Column */}
        <div className="w-full md:w-80 space-y-6">
             <Gamification />

             {/* Certificates List */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    الشهادات المكتسبة
                </h3>
                <div className="space-y-3">
                    {certificates.map(cert => (
                        <div key={cert.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-yellow-50 hover:border-yellow-200 transition-colors group cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-yellow-500">
                                    <Award className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">{cert.date}</span>
                            </div>
                            <h4 className="font-bold text-gray-800 text-sm mb-3">{cert.title}</h4>
                            <button className="w-full py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg group-hover:text-yellow-700 group-hover:border-yellow-300 flex items-center justify-center gap-2">
                                <Download className="w-3 h-3" /> تحميل PDF
                            </button>
                        </div>
                    ))}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
