
import React, { useEffect, useState, useCallback } from 'react';
import { COURSES } from '../constants';
import { Book, CheckCircle, Flame, ArrowLeft, PlayCircle, ArrowRight, Sparkles, Zap, Brain, Target } from 'lucide-react';
import { Course } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Gamification from './Gamification';
import StudyPlan from './StudyPlan';
import Sparkline from './Sparkline';
import { UserProfile } from '../services/userProfileService';
import { getStudentStats, StudentStats } from '../services/progressService';
import {
  getNextAction, getMultipleActions, getDynamicButton,
  generateInsight, streamInsight,
  StudentAction, DynamicButton, AIInsight
} from '../services/aiEngineService';

interface DashboardProps {
  onSelectCourse: (course: Course) => void;
  currentUserProfile?: UserProfile | null;
}

const ACTION_TYPE_ICONS: Record<string, React.ReactNode> = {
  lesson: <Book className="w-5 h-5" />,
  quiz: <Target className="w-5 h-5" />,
  teach_ai: <Brain className="w-5 h-5" />,
  review: <Book className="w-5 h-5" />,
  challenge: <Zap className="w-5 h-5" />,
  misconception_fix: <Sparkles className="w-5 h-5" />,
  flashcard: <Book className="w-5 h-5" />,
  game: <Zap className="w-5 h-5" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-brand-500',
  low: 'bg-gray-400',
};

const Dashboard: React.FC<DashboardProps> = ({ onSelectCourse, currentUserProfile }) => {
        const { t, direction, language } = useLanguage();
        const isAr = language === 'ar';
        const displayName = currentUserProfile?.name || '';
        const [stats, setStats] = useState<StudentStats | null>(null);

        // AI-driven state
        const [aiInsight, setAiInsight] = useState<string>('');
        const [isInsightStreaming, setIsInsightStreaming] = useState(false);
        const [aiActions, setAiActions] = useState<StudentAction[]>([]);
        const [dynamicBtn, setDynamicBtn] = useState<DynamicButton | null>(null);
        const [actionsLoading, setActionsLoading] = useState(false);

  // Load stats
  useEffect(() => {
    if (currentUserProfile?.uid) {
      getStudentStats(currentUserProfile.uid).then(setStats).catch(console.error);
    }
  }, [currentUserProfile?.uid]);

  // Load AI-driven content
  useEffect(() => {
    if (!currentUserProfile?.uid) return;

    const behavior = {
      student_id: currentUserProfile.uid,
      streak_days: stats?.streak || 0,
      total_xp: stats?.totalPoints || 0,
      lessons_completed: stats?.totalLessonsCompleted || 0,
      grade: 7,
    };

    // 1. Stream AI Insight for the dashboard
    setIsInsightStreaming(true);
    setAiInsight('');

    const studentData = {
      student_id: currentUserProfile.uid,
      name: currentUserProfile.name || '',
      lessons_completed: stats?.totalLessonsCompleted || 0,
      streak: stats?.streak || 0,
      total_points: stats?.totalPoints || 0,
      progress_percent: stats?.averageProgress || 0,
      time_spent_minutes: stats?.totalTimeSpentMinutes || 0,
    };

    // Try streaming insight
    const abortCtrl = streamInsight(
      studentData,
      'dashboard',
      (chunk) => setAiInsight(prev => prev + chunk),
      () => setIsInsightStreaming(false),
    );

    // Fallback: if no SSE response within 3s, use static call
    const fallbackTimeout = setTimeout(async () => {
      if (!aiInsight) {
        const insight = await generateInsight(studentData, 'dashboard');
        if (insight) {
          setAiInsight(insight.insight_ar || insight.insight_en);
        } else {
          setAiInsight(isAr
            ? 'استمر يا بطل! أنت بتتحسن كل يوم 💪'
            : "Keep going, champ! You're improving every day 💪"
          );
        }
        setIsInsightStreaming(false);
      }
    }, 3000);

    // 2. Load AI-recommended actions
    setActionsLoading(true);
    getMultipleActions(behavior)
      .then(actions => {
        if (actions.length) setAiActions(actions);
      })
      .catch(console.error)
      .finally(() => setActionsLoading(false));

    // 3. Load dynamic button
    getDynamicButton(behavior)
      .then(btn => { if (btn) setDynamicBtn(btn); })
      .catch(console.error);

    return () => {
      abortCtrl.abort();
      clearTimeout(fallbackTimeout);
    };
  }, [currentUserProfile?.uid, stats]);

  const ForwardIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner with AI Insight */}
      <div className="bg-gradient-to-l from-brand-400 to-brand-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-200 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        <div className="z-10 flex-1">
          <h1 className="text-3xl font-extrabold mb-2">{t('welcomeBack', { name: displayName.split(' ')[0] })} 👋</h1>
          {/* AI-driven insight replaces static "keepGoing" text */}
          <div className="text-brand-100 text-lg opacity-90 min-h-[28px]">
            {aiInsight || t('keepGoing')}
            {isInsightStreaming && <span className="inline-block w-2 h-4 bg-white/60 animate-pulse ml-1 rounded-sm" />}
          </div>
          {/* AI Insight badge */}
          {aiInsight && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
              <Sparkles className="w-3 h-3" />
              <span>{isAr ? 'تحليل ذكي مباشر' : 'Live AI Insight'}</span>
            </div>
          )}
        </div>
        
        <div className="mt-6 md:mt-0 z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-white/20">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Flame className="w-7 h-7 text-white fill-current" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.streak || 0} {t('streakDays')}</p>
            <p className="text-xs text-white/80">{t('streakLabel')}</p>
          </div>
        </div>

        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute right-20 -bottom-20 w-60 h-60 bg-brand-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

            {/* AI-Recommended Actions — replaces static buttons */}
            {aiActions.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-brand-500" />
                  {isAr ? 'الذكاء الاصطناعي يقترح لك' : 'AI Recommends For You'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (action.content_id) {
                          const course = COURSES.find(c =>
                            c.units?.some(u => u.lessons?.some(l => l.id === action.content_id))
                          );
                          if (course) onSelectCourse(course);
                        }
                      }}
                      className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all text-start group relative overflow-hidden ${
                        i === 0 ? 'ring-2 ring-brand-200' : ''
                      }`}
                    >
                      {/* Priority indicator */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${PRIORITY_COLORS[action.priority] || 'bg-gray-300'}`} />
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                          {ACTION_TYPE_ICONS[action.action_type] || <Zap className="w-5 h-5" />}
                        </div>
                        <span className="text-xs font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-md">
                          +{action.xp_reward} XP
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-gray-800 text-sm mb-1">
                        {isAr ? action.title_ar : action.title_en}
                      </h4>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {isAr ? action.description_ar : action.description_en}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{action.estimated_minutes} {isAr ? 'دقيقة' : 'min'}</span>
                        <span className="font-bold text-brand-600 group-hover:text-brand-700">
                          {isAr ? action.button_label_ar : action.button_label_en} →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

             {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{t('completedSessions')}</p>
                    <p className="text-3xl font-bold text-gray-800">{stats?.totalLessonsCompleted || 0}</p>
                    <p className="text-xs text-brand-500 mt-2 font-medium">{t('finishedSessions')}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{t('totalCourses')}</p>
                    <p className="text-3xl font-bold text-gray-800">{COURSES.length}</p>
                    <p className="text-xs text-blue-500 mt-2 font-medium">{t('registeredCourses')}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Book className="w-6 h-6" />
                </div>
                </div>
            </div>

            {/* Active Courses */}
            <div>
                <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">{t('currentCourses')}</h3>
                <button onClick={() => onSelectCourse(COURSES[0])} className="text-sm font-semibold text-brand-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    {t('viewAll')}
                </button>
                </div>

                <div className="space-y-4">
                {COURSES.map(course => {
                    const localizedTitle = direction === 'rtl' ? course.titleAr : course.titleEn;
                    const localizedSubject = direction === 'rtl' ? course.subjectAr : course.subjectEn;
                    const levelText = currentUserProfile?.grade || currentUserProfile?.stage || '';
                    return (
                        <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col md:flex-row">
                            <div className="h-40 md:h-auto md:w-48 overflow-hidden relative shrink-0">
                                <img src={course.image} alt={localizedTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-800 text-lg">{localizedTitle}</h4>
                                    <span className="text-xs font-bold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-md">4.9 ★</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">{localizedSubject} - {levelText}</p>
                                
                                {course.weeklyProgress && (
                                   <div className="w-24 h-8 mb-3 opacity-60">
                                      <Sparkline data={course.weeklyProgress} color="#00A896" height={25} />
                                   </div>
                                )}

                                <div className="flex items-center gap-3 mt-auto">
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${course.progress}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 w-10">{course.progress}%</span>
                                    <button 
                                        onClick={() => onSelectCourse(course)}
                                        className="bg-brand-50 text-brand-600 p-2 rounded-lg hover:bg-brand-500 hover:text-white transition-colors"
                                    >
                                        <ForwardIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>
            
            {/* Interactive Study Plan */}
            <StudyPlan studentId={currentUserProfile?.uid} />
            
            {/* Dynamic Recommended Lesson — AI picks the next content */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
                {t('recommendedLesson')}
                {dynamicBtn && (
                  <span className="text-xs font-normal text-brand-500 bg-brand-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                )}
                </h3>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 bg-gray-50 rounded-xl p-5 border border-gray-100 w-full">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md mb-2 inline-block">{t('recommended')}</span>
                                <h4 className="font-bold text-gray-800 text-lg">
                                  {dynamicBtn
                                    ? (isAr ? dynamicBtn.tooltip_ar : dynamicBtn.tooltip_en)
                                    : 'تحولات الطاقة (الطاقة الحرارية)'
                                  }
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {dynamicBtn
                                    ? `+${dynamicBtn.xp_reward} XP`
                                    : 'العلوم - الصف الأول الإعدادي'
                                  }
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-500">
                                <PlayCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <button 
                        onClick={() => {
                            const scienceCourse = COURSES.find(c => c.subjectEn === 'Science');
                            if(scienceCourse) onSelectCourse(scienceCourse);
                        }}
                        className="w-full mt-4 bg-brand-500 text-white font-bold py-2.5 rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
                        >
                            {dynamicBtn
                              ? (isAr ? dynamicBtn.label_ar : dynamicBtn.label_en)
                              : t('startLearning')
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
            <Gamification studentId={currentUserProfile?.uid} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
