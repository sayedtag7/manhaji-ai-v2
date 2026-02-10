import React, { useState } from 'react';
import { Trophy, Star, Target, Zap, Flame, Lock, Play, ChevronRight, Award, TrendingUp, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import GameEngine from './GameEngine';
import { GameType } from '../types';

interface Game {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: any;
  xp: number;
  difficulty: 'easy' | 'medium' | 'hard';
  locked: boolean;
  progress?: number;
  category: string;
  gameType?: GameType; // link to actual game engine
}

const GamesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  
  const games: Game[] = [
    {
      id: '1',
      title: 'تحدي الرياضيات السريع',
      titleEn: 'Quick Math Challenge',
      description: 'حل أكبر عدد من المسائل في 60 ثانية',
      descriptionEn: 'Solve as many problems as you can in 60 seconds',
      icon: Zap,
      xp: 100,
      difficulty: 'easy',
      locked: false,
      progress: 75,
      category: 'math',
      gameType: 'speed_challenge'
    },
    {
      id: '2',
      title: 'لعبة المطابقة',
      titleEn: 'Concept Matching',
      description: 'طابق المفاهيم بتعريفاتها الصحيحة',
      descriptionEn: 'Match concepts with their correct definitions',
      icon: Target,
      xp: 150,
      difficulty: 'medium',
      locked: false,
      progress: 40,
      category: 'science',
      gameType: 'matching'
    },
    {
      id: '3',
      title: 'رتب الخطوات',
      titleEn: 'Sequence Ordering',
      description: 'رتب الخطوات بالترتيب الصحيح لحل المسائل',
      descriptionEn: 'Order the steps correctly to solve problems',
      icon: Star,
      xp: 200,
      difficulty: 'medium',
      locked: false,
      progress: 20,
      category: 'science',
      gameType: 'sequence'
    },
    {
      id: '4',
      title: 'أصلح الخطأ',
      titleEn: 'Fix the Mistake',
      description: 'اكتشف الخطأ في الحل وأصلحه',
      descriptionEn: 'Find and fix the error in the solution',
      icon: Trophy,
      xp: 180,
      difficulty: 'hard',
      locked: false,
      category: 'math',
      gameType: 'fix_mistake'
    },
    {
      id: '5',
      title: 'ماستر الكيمياء',
      titleEn: 'Chemistry Master',
      description: 'اكتشف التفاعلات الكيميائية',
      descriptionEn: 'Discover chemical reactions',
      icon: Flame,
      xp: 250,
      difficulty: 'hard',
      locked: true,
      category: 'science'
    },
    {
      id: '6',
      title: 'بطولة الضرب والقسمة',
      titleEn: 'Multiplication & Division Championship',
      description: 'تحدى أصدقاءك في عمليات الضرب والقسمة',
      descriptionEn: 'Challenge your friends in multiplication and division',
      icon: Award,
      xp: 120,
      difficulty: 'easy',
      locked: true,
      category: 'math'
    },
  ];

  const categories = [
    { id: 'all', label: 'الكل', labelEn: 'All' },
    { id: 'math', label: 'رياضيات', labelEn: 'Math' },
    { id: 'arabic', label: 'عربي', labelEn: 'Arabic' },
    { id: 'science', label: 'علوم', labelEn: 'Science' },
    { id: 'history', label: 'تاريخ', labelEn: 'History' },
  ];

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      easy: { ar: 'سهل', en: 'Easy' },
      medium: { ar: 'متوسط', en: 'Medium' },
      hard: { ar: 'صعب', en: 'Hard' },
    };
    return language === 'ar' ? labels[difficulty]?.ar : labels[difficulty]?.en;
  };

  // If a game is active, show the game engine
  if (activeGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <GameEngine gameType={activeGame} onBack={() => setActiveGame(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {language === 'ar' ? 'مركز الألعاب التعليمية' : 'Educational Games Center'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'ar' ? 'تعلم وامرح في نفس الوقت! 🎮' : 'Learn and have fun at the same time! 🎮'}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">12</p>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'ألعاب مكتملة' : 'Games Completed'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">2,450</p>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'نقاط XP' : 'XP Points'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">8</p>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'جوائز' : 'Achievements'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">85%</p>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'معدل النجاح' : 'Success Rate'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {language === 'ar' ? category.label : category.labelEn}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all ${
                  game.locked ? 'opacity-60' : 'hover:-translate-y-1'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-md">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {game.locked ? (
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold">{game.xp} XP</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {language === 'ar' ? game.title : game.titleEn}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {language === 'ar' ? game.description : game.descriptionEn}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(game.difficulty)}`}>
                    {getDifficultyLabel(game.difficulty)}
                  </span>
                </div>

                {game.progress !== undefined && !game.locked && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{language === 'ar' ? 'التقدم' : 'Progress'}</span>
                      <span>{game.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                        style={{ width: `${game.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  disabled={game.locked}
                  onClick={() => game.gameType && !game.locked && setActiveGame(game.gameType)}
                  className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    game.locked
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-md'
                  }`}
                >
                  {game.locked ? (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>{language === 'ar' ? 'مقفل' : 'Locked'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>{language === 'ar' ? 'العب الآن' : 'Play Now'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white shadow-xl">
          <Sparkles className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {language === 'ar' ? 'المزيد من الألعاب قريباً!' : 'More Games Coming Soon!'}
          </h2>
          <p className="text-purple-100 mb-6">
            {language === 'ar' 
              ? 'نعمل على إضافة ألعاب تعليمية جديدة ومثيرة كل أسبوع' 
              : 'We\'re adding new exciting educational games every week'}
          </p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg">
            {language === 'ar' ? 'اقترح لعبة' : 'Suggest a Game'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
