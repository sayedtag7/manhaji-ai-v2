import React from 'react';
import { CheckCircle, Circle, Clock, TrendingUp, Award, Target, Flame, Star, Calendar, BookOpen, Trophy, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Milestone {
  id: string;
  title: string;
  titleEn: string;
  date: string;
  completed: boolean;
  xp: number;
  category: string;
}

interface WeeklyGoal {
  id: string;
  title: string;
  titleEn: string;
  current: number;
  target: number;
  unit: string;
}

const StatusPage: React.FC = () => {
  const { t, language } = useLanguage();

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'إكمال 10 دروس في الرياضيات',
      titleEn: 'Complete 10 Math Lessons',
      date: '2026-02-10',
      completed: true,
      xp: 500,
      category: 'math'
    },
    {
      id: '2',
      title: 'الحصول على 100% في 5 اختبارات',
      titleEn: 'Score 100% in 5 Quizzes',
      date: '2026-02-09',
      completed: true,
      xp: 750,
      category: 'quiz'
    },
    {
      id: '3',
      title: 'سلسلة 7 أيام متواصلة',
      titleEn: '7-Day Streak',
      date: '2026-02-11',
      completed: false,
      xp: 300,
      category: 'streak'
    },
    {
      id: '4',
      title: 'إنهاء وحدة العلوم الكاملةخ',
      titleEn: 'Complete Full Science Unit',
      date: '2026-02-15',
      completed: false,
      xp: 1000,
      category: 'science'
    },
  ];

  const weeklyGoals: WeeklyGoal[] = [
    {
      id: '1',
      title: 'دروس مكتملة',
      titleEn: 'Lessons Completed',
      current: 8,
      target: 15,
      unit: 'lessons'
    },
    {
      id: '2',
      title: 'اختبارات ناجحة',
      titleEn: 'Successful Quizzes',
      current: 12,
      target: 20,
      unit: 'quizzes'
    },
    {
      id: '3',
      title: 'ساعات دراسة',
      titleEn: 'Study Hours',
      current: 5.5,
      target: 10,
      unit: 'hours'
    },
    {
      id: '4',
      title: 'نقاط XP',
      titleEn: 'XP Points',
      current: 2450,
      target: 5000,
      unit: 'XP'
    },
  ];

  const recentAchievements = [
    {
      id: '1',
      icon: Trophy,
      title: 'نجم الرياضيات',
      titleEn: 'Math Star',
      description: 'حل 50 مسألة رياضية بنجاح',
      descriptionEn: 'Solved 50 math problems successfully',
      color: 'from-amber-400 to-amber-600',
      date: '2026-02-10'
    },
    {
      id: '2',
      icon: Flame,
      title: 'النار المشتعلة',
      titleEn: 'On Fire',
      description: 'سلسلة 5 أيام متواصلة',
      descriptionEn: '5-day streak',
      color: 'from-red-400 to-red-600',
      date: '2026-02-09'
    },
    {
      id: '3',
      icon: Star,
      title: 'المتفوق',
      titleEn: 'Top Performer',
      description: 'حصلت على 95%+ في 10 اختبارات',
      descriptionEn: 'Scored 95%+ in 10 quizzes',
      color: 'from-purple-400 to-purple-600',
      date: '2026-02-08'
    },
  ];

  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {language === 'ar' ? 'حالة التقدم' : 'Progress Status'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {language === 'ar' ? 'تتبع إنجازاتك وأهدافك التعليمية' : 'Track your achievements and learning goals'}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
                    className="text-brand-500 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-gray-800">{progressPercentage}%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {language === 'ar' ? 'معدل الإتمام' : 'Completion Rate'}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'ar' ? 'أيام نشطة' : 'Active Days'}</p>
                <p className="text-2xl font-bold text-gray-800">24</p>
              </div>
            </div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12% {language === 'ar' ? 'هذا الأسبوع' : 'this week'}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'ar' ? 'إجمالي الدروس' : 'Total Lessons'}</p>
                <p className="text-2xl font-bold text-gray-800">45</p>
              </div>
            </div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+8 {language === 'ar' ? 'هذا الأسبوع' : 'this week'}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'ar' ? 'إجمالي XP' : 'Total XP'}</p>
                <p className="text-2xl font-bold text-gray-800">4,850</p>
              </div>
            </div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+450 {language === 'ar' ? 'هذا الأسبوع' : 'this week'}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'ar' ? 'الإنجازات' : 'Achievements'}</p>
                <p className="text-2xl font-bold text-gray-800">12</p>
              </div>
            </div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+3 {language === 'ar' ? 'هذا الأسبوع' : 'this week'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Goals */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-brand-500" />
              <h2 className="text-xl font-bold text-gray-800">
                {language === 'ar' ? 'أهداف الأسبوع' : 'Weekly Goals'}
              </h2>
            </div>

            <div className="space-y-5">
              {weeklyGoals.map((goal) => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {language === 'ar' ? goal.title : goal.titleEn}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {goal.current} / {goal.target}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-800">
                {language === 'ar' ? 'آخر الإنجازات' : 'Recent Achievements'}
              </h2>
            </div>

            <div className="space-y-4">
              {recentAchievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-14 h-14 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">
                        {language === 'ar' ? achievement.title : achievement.titleEn}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? achievement.description : achievement.descriptionEn}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">
              {language === 'ar' ? 'المعالم التعليمية' : 'Learning Milestones'}
            </h2>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-start gap-4">
                <div className="relative">
                  {milestone.completed ? (
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Circle className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  
                  {index < milestones.length - 1 && (
                    <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-12 ${
                      milestone.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>

                <div className={`flex-1 pb-8 ${milestone.completed ? '' : 'opacity-60'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-800">
                      {language === 'ar' ? milestone.title : milestone.titleEn}
                    </h3>
                    <span className="text-sm font-medium text-amber-600 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      {milestone.xp} XP
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{milestone.date}</p>
                  {milestone.completed && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      {language === 'ar' ? 'مكتمل' : 'Completed'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
