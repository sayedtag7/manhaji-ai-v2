
import React, { useState } from 'react';
import { Course, Lesson } from '../types';
import { ChevronDown, PlayCircle, CheckCircle, Lock, ArrowRight, ArrowLeft, FileText, Sparkles, Wand2 } from 'lucide-react';
import AIChat from './AIChat';
import { useLanguage } from '../contexts/LanguageContext';
import { summarizeLesson } from '../services/geminiService';
import { getCourseTitle, getLessonContent, getLessonDuration, getLessonTitle, getUnitTitle } from '../utils/localization';

interface CourseViewProps {
  course: Course;
  onBack: () => void;
}

const CourseView: React.FC<CourseViewProps> = ({ course, onBack }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { t, direction, language } = useLanguage();

  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const handleSummarize = async () => {
      if(!activeLesson) return;
      setIsSummarizing(true);
      try {
          const lessonContent = getLessonContent(activeLesson, language);
          const result = await summarizeLesson(lessonContent, language);
          setSummary(result);
      } catch (e) {
          console.error(e);
      } finally {
          setIsSummarizing(false);
      }
  };

  // If a lesson is active, show the lesson view
  if (activeLesson) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <button 
          onClick={() => { setActiveLesson(null); setSummary(null); }}
          className="flex items-center text-gray-500 hover:text-brand-600 mb-4 transition-colors font-medium w-fit"
        >
          <BackIcon className="w-5 h-5 ms-1 rtl:ml-1 ltr:mr-1" />
          {t('backToCourse')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Content Area */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto pb-10">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                 <h1 className="text-2xl font-bold text-gray-800">{getLessonTitle(activeLesson, language)}</h1>
                 {activeLesson.difficulty && (
                     <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                         activeLesson.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                         activeLesson.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                         'bg-red-100 text-red-700'
                     }`}>
                         {activeLesson.difficulty.toUpperCase()}
                     </span>
                 )}
              </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                  <span>{getCourseTitle(course, language)}</span>
                  <span>•</span>
                  <span>{getLessonDuration(activeLesson, language)}</span>
                </div>
              
              <div className="aspect-video bg-gray-900 rounded-xl mb-6 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                <img src={course.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity" alt="lesson" />
                <PlayCircle className="w-16 h-16 text-white absolute group-hover:scale-110 transition-transform" />
              </div>

              <div className="prose prose-lg max-w-none text-gray-700 leading-loose relative">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-brand-600 text-lg">{t('lessonContent')}:</h3>
                    <button 
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className="flex items-center gap-2 text-xs font-bold bg-accent-purple/10 text-accent-purple px-3 py-1.5 rounded-full hover:bg-accent-purple/20 transition-colors"
                    >
                        {isSummarizing ? <span className="animate-spin">⏳</span> : <Wand2 className="w-3 h-3" />}
                        {t('summarize')}
                    </button>
                </div>

                {summary && (
                    <div className="mb-6 bg-gradient-to-r from-accent-purple/5 to-blue-50 p-5 rounded-xl border border-accent-purple/10">
                        <h4 className="font-bold text-accent-purple mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> AI Summary
                        </h4>
                        <div className="text-sm text-gray-700 whitespace-pre-line">{summary}</div>
                    </div>
                )}

                <div className="whitespace-pre-line bg-gray-50 p-6 rounded-xl border border-gray-100 text-lg">
                  {getLessonContent(activeLesson, language)}
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100">
                  <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                    {language === 'ar' ? 'السابق' : 'Previous'}
                </button>
                <button className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-bold transition-colors shadow-lg shadow-brand-100">
                  {t('completed')}
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                   <h4 className="font-bold text-gray-800">{t('downloadPdf')}</h4>
                   <p className="text-sm text-gray-500 mt-1">PDF Version</p>
                </div>
                <button className="bg-gray-50 text-brand-600 border border-brand-100 px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-50 transition-colors flex items-center gap-2">
                    <FileText className="w-4 h-4"/>
                    Download
                </button>
            </div>
          </div>

          {/* Sidebar Chat */}
          <div className="lg:col-span-1 h-[600px] lg:h-auto sticky top-0">
            <AIChat activeLesson={activeLesson} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-brand-600 mb-6 transition-colors font-medium"
      >
        <BackIcon className="w-5 h-5 ms-1 rtl:ml-1 ltr:mr-1" />
        {t('backToHome')}
      </button>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Course Info Sidebar */}
        <div className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
           <div className="h-40 bg-gray-200 relative">
             <img src={course.image} className="w-full h-full object-cover" alt={getCourseTitle(course, language)} />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          <div className="p-6">
          <h2 className="font-bold text-xl text-gray-800 mb-2">{getCourseTitle(course, language)}</h2>
            <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
              <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
            </div>
            <p className="text-sm text-gray-500 mb-6">{course.progress}% {t('completed')}</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('units')}</span>
                <span className="font-bold">{course.units.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('totalLessons')}</span>
                <span className="font-bold">{course.units.reduce((acc, u) => acc + u.lessons.length, 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('hours')}</span>
                <span className="font-bold">6</span>
              </div>
            </div>
          </div>
        </div>

        {/* Units List */}
        <div className="flex-1 space-y-6 w-full">
          <h3 className="font-bold text-2xl text-gray-800">{t('courseContent')}</h3>
          
                {course.units.map((unit) => (
            <div key={unit.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                       <h4 className="font-bold text-gray-700">{getUnitTitle(unit, language)}</h4>
                <ChevronDown className="text-gray-400 w-5 h-5" />
              </div>
              <div>
                {unit.lessons.map((lesson, idx) => (
                  <div 
                    key={lesson.id} 
                    onClick={() => !lesson.isLocked && setActiveLesson(lesson)}
                    className={`p-4 flex items-center justify-between border-b last:border-0 border-gray-50 transition-colors ${
                      lesson.isLocked ? 'bg-gray-50 opacity-60 cursor-not-allowed' : 'hover:bg-brand-50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                        lesson.isCompleted 
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : lesson.isLocked 
                            ? 'bg-gray-100 border-gray-300 text-gray-400'
                            : 'bg-white border-brand-500 text-brand-500'
                      }`}>
                         {lesson.isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${lesson.isCompleted ? 'text-brand-900' : 'text-gray-700'}`}>
                          {getLessonTitle(lesson, language)}
                        </p>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" /> {getLessonDuration(lesson, language)}
                        </span>
                      </div>
                    </div>
                    
                    {lesson.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                    {lesson.isCompleted && <span className="text-brand-500 font-bold text-xs">{t('completed')}</span>}
                    {!lesson.isLocked && !lesson.isCompleted && (
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 text-brand-600" />
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseView;
