import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, CheckCircle, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { generateStudyPlan, getSampleStudyPlan, StudyPlanAI } from '../services/aiEngineService';

interface StudyPlanProps {
  studentId?: string;
}

const StudyPlan: React.FC<StudyPlanProps> = ({ studentId }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [plan, setPlan] = useState<StudyPlanAI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadPlan();
  }, [studentId]);

  const loadPlan = async () => {
    setIsLoading(true);
    try {
      let result: StudyPlanAI | null = null;
      if (studentId) {
        result = await generateStudyPlan(studentId, {
          student_id: studentId,
          name: '',
          lessons_completed: 0,
          streak: 0,
          total_points: 0,
          progress_percent: 0,
          time_spent_minutes: 0,
        });
      }
      if (!result) {
        result = await getSampleStudyPlan();
      }
      if (result) setPlan(result);
    } catch (err) {
      console.error('Failed to load study plan:', err);
    }
    setIsLoading(false);
  };

  const toggleComplete = (index: number) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{isAr ? 'جاري إنشاء خطة الدراسة...' : 'Generating study plan...'}</p>
      </div>
    );
  }

  if (!plan) return null;

  const tasks = plan.tasks || [];
  const progress = tasks.length > 0 ? Math.round((completedTasks.size / tasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              {isAr ? 'خطة الدراسة اليومية' : 'Daily Study Plan'}
              <span className="text-[10px] font-normal text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            </h3>
            <p className="text-xs text-gray-500">{plan.date || new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</p>
          </div>
        </div>
        <button
          onClick={loadPlan}
          className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
          title={isAr ? 'تحديث' : 'Refresh'}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* AI Coach Message */}
      {(plan.greeting_ar || plan.greeting_en) && (
        <div className="px-5 pt-4">
          <div className="p-3 bg-brand-50 rounded-xl text-sm text-brand-700" dir={isAr ? 'rtl' : 'ltr'}>
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-brand-400" />
            {isAr ? plan.greeting_ar : plan.greeting_en}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="px-5 pt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">{isAr ? 'التقدم اليومي' : 'Daily Progress'}</span>
          <span className="font-bold text-brand-600">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Tasks */}
      <div className="p-5 space-y-3">
        {tasks.map((task, i) => {
          const isDone = completedTasks.has(i);
          return (
            <button
              key={i}
              onClick={() => toggleComplete(i)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-start ${
                isDone
                  ? 'bg-green-50 border-green-200 opacity-70'
                  : 'bg-gray-50 border-gray-100 hover:border-brand-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                isDone ? 'border-green-500 bg-green-500' : 'border-gray-300'
              }`}>
                {isDone && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isDone ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                  {isAr ? task.title_ar : task.title_en}
                </p>
                {task.description_ar && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{isAr ? task.description_ar : task.description_ar}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                <Clock className="w-3 h-3" />
                {task.duration_minutes || 15} {isAr ? 'د' : 'min'}
              </div>
            </button>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{isAr ? 'لا توجد مهام بعد' : 'No tasks yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlan;
