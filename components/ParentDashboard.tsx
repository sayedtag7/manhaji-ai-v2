
import React, { useEffect, useState } from 'react';
import { COURSES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart3, FileText, TrendingUp, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import Sparkline from './Sparkline';
import { UserProfile } from '../services/userProfileService';
import { getStudentStats, StudentStats } from '../services/progressService';
import { generateParentReport, generateParentAlert } from '../services/aiEngineService';

interface ParentDashboardProps {
    currentUserProfile?: UserProfile | null;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ currentUserProfile }) => {
    const { t, language } = useLanguage();
    const isAr = language === 'ar';
    const [stats, setStats] = useState<StudentStats | null>(null);
    
    // AI-driven state
    const [aiAlert, setAiAlert] = useState<string>('');
    const [aiAlertLoading, setAiAlertLoading] = useState(false);
    const [aiReport, setAiReport] = useState<string>('');
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        if (currentUserProfile?.uid) {
            getStudentStats(currentUserProfile.uid).then(setStats).catch(console.error);
        }
    }, [currentUserProfile?.uid]);

    // Load AI-driven parent alert
    useEffect(() => {
        if (!currentUserProfile?.uid || !stats) return;
        setAiAlertLoading(true);
        const studentData = {
            student_id: currentUserProfile.uid,
            name: currentUserProfile.name || '',
            lessons_completed: stats.totalLessonsCompleted || 0,
            streak: stats.streak || 0,
            total_points: stats.totalPoints || 0,
            progress_percent: stats.averageProgress || 0,
            time_spent_minutes: stats.totalTimeSpentMinutes || 0,
        };
        generateParentAlert(studentData)
            .then(result => {
                if (result) {
                    const alertText = result.alert_ar || result.alert_en || result.insight_ar || result.insight_en;
                    if (alertText) setAiAlert(isAr ? alertText : (result.alert_en || result.insight_en || alertText));
                }
            })
            .catch(console.error)
            .finally(() => setAiAlertLoading(false));
    }, [currentUserProfile?.uid, stats]);

    const handleGenerateReport = async () => {
        if (!currentUserProfile?.uid || !stats) return;
        setReportLoading(true);
        const studentData = {
            student_id: currentUserProfile.uid,
            name: currentUserProfile.name || '',
            lessons_completed: stats.totalLessonsCompleted || 0,
            streak: stats.streak || 0,
            total_points: stats.totalPoints || 0,
            progress_percent: stats.averageProgress || 0,
            time_spent_minutes: stats.totalTimeSpentMinutes || 0,
        };
        try {
            const result = await generateParentReport(studentData);
            if (result) {
                const reportText = result.report_ar || result.report_en || result.insight_ar || result.insight_en;
                if (reportText) setAiReport(isAr ? reportText : (result.report_en || result.insight_en || reportText));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setReportLoading(false);
        }
    };

    const learningHours = stats?.totalTimeSpentMinutes
        ? (stats.totalTimeSpentMinutes / 60).toFixed(1)
        : '0';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-accent-purple rounded-full"></span>
                {t('parentDashboard')}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">{isAr ? 'وقت التعلم هذا الأسبوع' : 'Learning Time This Week'}</p>
                    <p className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        {learningHours} <span className="text-sm font-normal text-gray-500">{isAr ? 'ساعة' : 'hours'}</span>
                    </p>
                    <div className="mt-2 text-xs text-brand-500 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {isAr ? 'من بيانات الطالب المباشرة' : 'Live student data'}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">{isAr ? 'الدروس المكتملة' : 'Completed Lessons'}</p>
                    <p className="text-3xl font-bold text-gray-800">{stats?.totalLessonsCompleted || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">{isAr ? 'المستوى الحالي' : 'Current Level'}</p>
                    <p className="text-3xl font-bold text-brand-600">{currentUserProfile?.grade || currentUserProfile?.stage || ''}</p>
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
                                    <span className="font-medium text-gray-700">{language === 'ar' ? course.titleAr : course.titleEn}</span>
                                    <span className="font-bold text-gray-900">{course.progress}%</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${i === 0 ? 'bg-brand-500' : i === 1 ? 'bg-accent-blue' : 'bg-accent-orange'}`}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-16 h-6 opacity-60">
                                        <Sparkline
                                            data={course.weeklyProgress}
                                            color={i === 0 ? '#00A896' : i === 1 ? '#3b82f6' : '#f97316'}
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
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{isAr ? 'التقرير الأسبوعي' : 'Weekly Report'}</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        {isAr
                            ? `احصل على تحليل ذكي مفصل لأداء ${currentUserProfile?.name || ''} ونقاط القوة والضعف.`
                            : `Get a detailed AI analysis of ${currentUserProfile?.name || ''}'s performance.`
                        }
                    </p>
                    <button
                        onClick={handleGenerateReport}
                        disabled={reportLoading}
                        className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isAr ? 'إنشاء تقرير ذكي' : 'Generate AI Report'}
                    </button>
                </div>
            </div>

            {/* AI-Generated Report */}
            {aiReport && (
                <div className="bg-white border border-brand-200 p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-500" />
                        {isAr ? 'تقرير الذكاء الاصطناعي' : 'AI Report'}
                    </h3>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap" dir={isAr ? 'rtl' : 'ltr'}>
                        {aiReport}
                    </div>
                </div>
            )}

            {/* AI-Driven Parent Alert */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                    <h4 className="font-bold text-yellow-800 text-sm flex items-center gap-2">
                        {isAr ? 'تنبيه ولي الأمر' : 'Parent Alert'}
                        {aiAlert && (
                            <span className="text-[10px] font-normal text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> AI
                            </span>
                        )}
                    </h4>
                    {aiAlertLoading ? (
                        <div className="flex items-center gap-2 mt-1 text-yellow-600 text-sm">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {isAr ? 'جاري التحليل...' : 'Analyzing...'}
                        </div>
                    ) : (
                        <p className="text-yellow-700 text-sm mt-1" dir={isAr ? 'rtl' : 'ltr'}>
                            {aiAlert || (isAr
                                ? 'لوحظ أن الطالب يواجه صعوبة في درس "الطاقة الحرارية". يوصى بمراجعة إضافية.'
                                : 'The student is having difficulty with the "Thermal Energy" lesson. Additional review is recommended.'
                            )}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
