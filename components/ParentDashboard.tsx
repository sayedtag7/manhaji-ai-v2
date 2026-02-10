
import React from 'react';
import { MOCK_USER, COURSES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart3, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import Sparkline from './Sparkline';

const ParentDashboard: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-accent-purple rounded-full"></span>
                {t('parentDashboard')}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">وقت التعلم هذا الأسبوع</p>
                    <p className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        5.2 <span className="text-sm font-normal text-gray-500">ساعة</span>
                    </p>
                    <div className="mt-2 text-xs text-green-500 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12% عن الأسبوع الماضي
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">الدروس المكتملة</p>
                    <p className="text-3xl font-bold text-gray-800">{MOCK_USER.completedSessions}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">المستوى الحالي</p>
                    <p className="text-3xl font-bold text-brand-600">{MOCK_USER.level}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                        {t('studentProgress')}
                    </h3>
                    <div className="space-y-6">
                        {COURSES.map((course, i) => (
                            <div key={course.id}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{course.title}</span>
                                    <span className="font-bold text-gray-900">{course.progress}%</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${i === 0 ? 'bg-brand-500' : i === 1 ? 'bg-accent-blue' : 'bg-accent-orange'}`}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                    {/* Trend Chart */}
                                    <div className="w-16 h-6 opacity-60">
                                        <Sparkline
                                            data={course.weeklyProgress}
                                            color={i === 0 ? '#20c997' : i === 1 ? '#3b82f6' : '#f97316'}
                                            height={20}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">التقرير الأسبوعي</h3>
                    <p className="text-gray-500 text-sm mb-6">احصل على تحليل مفصل لأداء {MOCK_USER.name} ونقاط القوة والضعف.</p>
                    <button className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t('generateReport')} (PDF)
                    </button>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                    <h4 className="font-bold text-yellow-800 text-sm">تنبيه ولي الأمر</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                        لوحظ أن الطالب يواجه صعوبة في درس "الطاقة الحرارية". يوصى بمراجعة إضافية.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
