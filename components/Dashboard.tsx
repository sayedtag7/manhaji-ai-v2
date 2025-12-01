
import React from 'react';
import { MOCK_USER, COURSES } from '../constants';
import { Book, CheckCircle, Flame, ArrowLeft, PlayCircle, ArrowRight } from 'lucide-react';
import { Course } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Gamification from './Gamification';
import Sparkline from './Sparkline';

interface DashboardProps {
  onSelectCourse: (course: Course) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectCourse }) => {
    const { t, direction, language } = useLanguage();
  
  // Icon that points forward based on direction
  const ForwardIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-brand-400 to-brand-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-200 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        <div className="z-10">
          <h1 className="text-3xl font-extrabold mb-2">{t('welcomeBack', { name: MOCK_USER.name.split(' ')[0] })} 👋</h1>
          <p className="text-brand-100 text-lg opacity-90">{t('keepGoing')}</p>
        </div>
        
        <div className="mt-6 md:mt-0 z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-white/20">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Flame className="w-7 h-7 text-white fill-current" />
          </div>
          <div>
            <p className="text-2xl font-bold">{MOCK_USER.streak} {t('streakDays')}</p>
            <p className="text-xs text-white/80">{t('streakLabel')}</p>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute right-20 -bottom-20 w-60 h-60 bg-brand-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Courses & Stats) */}
        <div className="lg:col-span-2 space-y-8">
             {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{t('completedSessions')}</p>
                    <p className="text-3xl font-bold text-gray-800">{MOCK_USER.completedSessions}</p>
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

            {/* Recommended Learning Path / Active Courses */}
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
                    const levelText = language === 'ar' ? MOCK_USER.level : MOCK_USER.levelEn || MOCK_USER.level;
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
                                
                                {/* Sparkline for Trend */}
                                {course.weeklyProgress && (
                                   <div className="w-24 h-8 mb-3 opacity-60">
                                      <Sparkline data={course.weeklyProgress} color="#20c997" height={25} />
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
            
            {/* Recommended Lesson Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
                {t('recommendedLesson')}
                </h3>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 bg-gray-50 rounded-xl p-5 border border-gray-100 w-full">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md mb-2 inline-block">{t('recommended')}</span>
                                <h4 className="font-bold text-gray-800 text-lg">تحولات الطاقة (الطاقة الحرارية)</h4>
                                <p className="text-sm text-gray-500 mt-1">العلوم - الصف الأول الإعدادي</p>
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
                        className="w-full mt-4 bg-brand-500 text-white font-bold py-2.5 rounded-lg hover:bg-brand-600 transition-colors"
                        >
                            {t('startLearning')}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar Widgets (Gamification) */}
        <div className="lg:col-span-1">
            <Gamification />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
