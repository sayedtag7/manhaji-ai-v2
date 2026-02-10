import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FlashCard, FlashCardRating } from '../types';
import { 
  RotateCcw, ChevronLeft, ChevronRight, Brain, Sparkles, 
  Clock, CheckCircle2, XCircle, Loader2, Layers, Star,
  Filter, BookOpen, Trophy, Zap, ArrowRight
} from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

// ═══════════════════════════════════════════════════════════════════════════
// SM-2 Spaced Repetition Algorithm
// ═══════════════════════════════════════════════════════════════════════════

function calculateNextReview(card: FlashCard, rating: FlashCardRating): Partial<FlashCard> {
  let { interval, easeFactor, repetitions } = card;
  
  const qualityMap: Record<FlashCardRating, number> = {
    'again': 0,
    'hard': 2,
    'good': 3,
    'easy': 5,
  };
  const quality = qualityMap[rating];

  if (quality < 3) {
    // Failed: reset
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Update ease factor (SM-2)
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const now = new Date();
  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();

  return { interval, easeFactor, repetitions, nextReview, lastReview: now.toISOString() };
}

// ═══════════════════════════════════════════════════════════════════════════
// Sample Flash Cards
// ═══════════════════════════════════════════════════════════════════════════

const INITIAL_CARDS: FlashCard[] = [
  {
    id: 'fc1', front: 'ما هي المعادلة الخطية؟', frontEn: 'What is a linear equation?',
    back: 'معادلة من الدرجة الأولى بمتغير أو أكثر، أعلى قوة للمتغير هي 1', backEn: 'An equation of degree one with one or more variables; highest power of the variable is 1',
    lessonId: 'l1', subject: 'math', difficulty: 'easy', source: 'auto',
    interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: new Date().toISOString()
  },
  {
    id: 'fc2', front: 'ما الفرق بين التغير الفيزيائي والكيميائي؟', frontEn: 'What is the difference between physical and chemical change?',
    back: 'التغير الفيزيائي لا يغير تركيب المادة (مثل الانصهار). التغير الكيميائي يغير التركيب وينتج مواد جديدة (مثل الاحتراق)', backEn: 'Physical change does not alter composition (e.g., melting). Chemical change alters composition and produces new substances (e.g., combustion)',
    lessonId: 'l2', subject: 'science', difficulty: 'medium', source: 'auto',
    interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: new Date().toISOString()
  },
  {
    id: 'fc3', front: 'ما هي صيغة الميل والمقطع؟', frontEn: 'What is the slope-intercept form?',
    back: 'y = mx + b\nحيث m هو الميل و b هو المقطع الصادي', backEn: 'y = mx + b\nwhere m is the slope and b is the y-intercept',
    lessonId: 'l1', subject: 'math', difficulty: 'easy', source: 'auto',
    interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: new Date().toISOString()
  },
  {
    id: 'fc4', front: 'ما هي حالات المادة الثلاث؟', frontEn: 'What are the three states of matter?',
    back: 'صلبة (شكل وحجم ثابت)\nسائلة (حجم ثابت، شكل متغير)\nغازية (شكل وحجم متغير)', backEn: 'Solid (fixed shape & volume)\nLiquid (fixed volume, variable shape)\nGas (variable shape & volume)',
    lessonId: 'l2', subject: 'science', difficulty: 'easy', source: 'auto',
    interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: new Date().toISOString()
  },
  {
    id: 'fc5', front: 'كيف تحل معادلتين آنيتين بالتعويض؟', frontEn: 'How do you solve simultaneous equations by substitution?',
    back: '1. عزل أحد المتغيرين في إحدى المعادلتين\n2. تعويض القيمة في المعادلة الأخرى\n3. حل المعادلة الناتجة\n4. إيجاد قيمة المتغير الآخر', backEn: '1. Isolate one variable in one equation\n2. Substitute into the other equation\n3. Solve the resulting equation\n4. Find the other variable',
    lessonId: 'l1', subject: 'math', difficulty: 'hard', source: 'auto',
    interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: new Date().toISOString()
  },
  {
    id: 'fc6', front: 'ما هو قانون نيوتن الثاني؟', frontEn: "What is Newton's Second Law?",
    back: 'القوة = الكتلة × التسارع\nF = ma\nوحدة القوة: نيوتن (N)', backEn: 'Force = Mass × Acceleration\nF = ma\nUnit of force: Newton (N)',
    lessonId: 'l3', subject: 'science', difficulty: 'medium', source: 'auto',
    interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: new Date().toISOString()
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Flash Cards Page Component
// ═══════════════════════════════════════════════════════════════════════════

const FlashCardsPage: React.FC = () => {
  const { language } = useLanguage();
  const [cards, setCards] = useState<FlashCard[]>(INITIAL_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, incorrect: 0 });
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateTopic, setGenerateTopic] = useState('');
  const [sessionComplete, setSessionComplete] = useState(false);

  // Get cards due for review (sorted by priority)
  const dueCards = useMemo(() => {
    const now = new Date().toISOString();
    let filtered = cards.filter(c => c.nextReview <= now);
    if (filterSubject !== 'all') {
      filtered = filtered.filter(c => c.subject === filterSubject);
    }
    return filtered.sort((a, b) => a.easeFactor - b.easeFactor); // harder cards first
  }, [cards, filterSubject]);

  const currentCard = dueCards[currentIndex];
  const totalDue = dueCards.length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) setShowResult(true);
  };

  const handleRate = (rating: FlashCardRating) => {
    if (!currentCard) return;
    
    const updates = calculateNextReview(currentCard, rating);
    setCards(prev => prev.map(c => c.id === currentCard.id ? { ...c, ...updates } : c));
    
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: rating === 'good' || rating === 'easy' ? prev.correct + 1 : prev.correct,
      incorrect: rating === 'again' || rating === 'hard' ? prev.incorrect + 1 : prev.incorrect,
    }));

    // Move to next card
    setIsFlipped(false);
    setShowResult(false);
    if (currentIndex < totalDue - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResult(false);
    setSessionStats({ reviewed: 0, correct: 0, incorrect: 0 });
    setSessionComplete(false);
  };

  // AI-powered card generation
  const generateCards = async () => {
    if (!generateTopic.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = language === 'ar'
        ? `أنشئ 5 بطاقات تعليمية للموضوع: "${generateTopic}". أرجع JSON فقط بدون نص إضافي:
[{"front":"السؤال بالعربي","frontEn":"Question in English","back":"الإجابة بالعربي","backEn":"Answer in English","difficulty":"easy|medium|hard","subject":"math|science"}]`
        : `Create 5 flashcards for the topic: "${generateTopic}". Return ONLY JSON:
[{"front":"Question in Arabic","frontEn":"Question in English","back":"Answer in Arabic","backEn":"Answer in English","difficulty":"easy|medium|hard","subject":"math|science"}]`;

      const response = await sendMessageToGemini(prompt, undefined, language);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const newCards: Partial<FlashCard>[] = JSON.parse(jsonMatch[0]);
        const fullCards: FlashCard[] = newCards.map((c, i) => ({
          id: `ai_${Date.now()}_${i}`,
          front: c.front || '',
          frontEn: c.frontEn,
          back: c.back || '',
          backEn: c.backEn,
          difficulty: c.difficulty || 'medium',
          subject: c.subject,
          source: 'auto' as const,
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
          nextReview: new Date().toISOString(),
        }));
        setCards(prev => [...prev, ...fullCards]);
        setGenerateTopic('');
      }
    } catch (error) {
      console.error('Failed to generate cards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyStyle = (d: string) => {
    return d === 'easy' ? 'bg-green-100 text-green-700' : d === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  };

  // Session complete screen
  if (sessionComplete) {
    const accuracy = sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0;
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {language === 'ar' ? 'أحسنت! أنهيت المراجعة' : 'Great job! Session complete'}
          </h2>
          <p className="text-gray-500 mb-8">
            {language === 'ar' ? `راجعت ${sessionStats.reviewed} بطاقة` : `Reviewed ${sessionStats.reviewed} cards`}
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-brand-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-brand-600">{accuracy}%</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'الدقة' : 'Accuracy'}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-600">{sessionStats.correct}</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'صحيح' : 'Correct'}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'للمراجعة' : 'To Review'}</p>
            </div>
          </div>

          <button
            onClick={resetSession}
            className="px-8 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
          >
            {language === 'ar' ? 'مراجعة مرة أخرى' : 'Review Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {language === 'ar' ? 'البطاقات التعليمية' : 'Flash Cards'}
              </h1>
              <p className="text-sm text-gray-500">
                {language === 'ar' ? `${totalDue} بطاقة للمراجعة اليوم` : `${totalDue} cards due for review`}
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterSubject}
              onChange={(e) => { setFilterSubject(e.target.value); setCurrentIndex(0); resetSession(); }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="math">{language === 'ar' ? 'رياضيات' : 'Math'}</option>
              <option value="science">{language === 'ar' ? 'علوم' : 'Science'}</option>
            </select>
          </div>
        </div>

        {/* AI Generation */}
        <div className="mt-4 flex items-center gap-3">
          <input
            type="text"
            value={generateTopic}
            onChange={(e) => setGenerateTopic(e.target.value)}
            placeholder={language === 'ar' ? 'أدخل موضوعاً لتوليد بطاقات...' : 'Enter a topic to generate cards...'}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            onKeyDown={(e) => { if (e.key === 'Enter') generateCards(); }}
          />
          <button
            onClick={generateCards}
            disabled={isGenerating || !generateTopic.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {language === 'ar' ? 'توليد' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-lg font-bold text-gray-800">{cards.length}</p>
          <p className="text-xs text-gray-500">{language === 'ar' ? 'إجمالي' : 'Total'}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-lg font-bold text-brand-600">{totalDue}</p>
          <p className="text-xs text-gray-500">{language === 'ar' ? 'للمراجعة' : 'Due'}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-lg font-bold text-green-600">{sessionStats.correct}</p>
          <p className="text-xs text-gray-500">{language === 'ar' ? 'صحيح' : 'Correct'}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-lg font-bold text-red-600">{sessionStats.incorrect}</p>
          <p className="text-xs text-gray-500">{language === 'ar' ? 'خطأ' : 'Wrong'}</p>
        </div>
      </div>

      {/* Card Area */}
      {totalDue === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {language === 'ar' ? 'أحسنت! لا توجد بطاقات للمراجعة' : 'All caught up! No cards due'}
          </h2>
          <p className="text-gray-500 mb-6">
            {language === 'ar' ? 'عد لاحقاً أو أنشئ بطاقات جديدة' : 'Come back later or generate new cards'}
          </p>
        </div>
      ) : currentCard ? (
        <>
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{currentIndex + 1} / {totalDue}</span>
              <span>{Math.round(((currentIndex) / totalDue) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${((currentIndex) / totalDue) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div
            className="perspective-1000 cursor-pointer mb-6"
            onClick={handleFlip}
          >
            <div
              className={`relative min-h-[300px] transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
              style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.5s' }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 bg-white rounded-3xl shadow-lg border-2 border-gray-100 p-8 flex flex-col items-center justify-center backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyStyle(currentCard.difficulty)}`}>
                    {currentCard.difficulty === 'easy' ? (language === 'ar' ? 'سهل' : 'Easy') :
                     currentCard.difficulty === 'medium' ? (language === 'ar' ? 'متوسط' : 'Medium') :
                     (language === 'ar' ? 'صعب' : 'Hard')}
                  </span>
                  {currentCard.source === 'mistake' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {language === 'ar' ? 'من أخطائك' : 'From mistakes'}
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-800 text-center leading-relaxed">
                  {language === 'ar' ? currentCard.front : (currentCard.frontEn || currentCard.front)}
                </p>
                <p className="mt-6 text-sm text-gray-400 flex items-center gap-1">
                  <RotateCcw className="w-4 h-4" />
                  {language === 'ar' ? 'اضغط لقلب البطاقة' : 'Tap to flip'}
                </p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-brand-50 to-blue-50 rounded-3xl shadow-lg border-2 border-brand-200 p-8 flex flex-col items-center justify-center"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <p className="text-lg text-gray-800 text-center leading-relaxed whitespace-pre-line">
                  {language === 'ar' ? currentCard.back : (currentCard.backEn || currentCard.back)}
                </p>
              </div>
            </div>
          </div>

          {/* Rating buttons */}
          {showResult && (
            <div className="grid grid-cols-4 gap-3 animate-in slide-in-from-bottom-4">
              <button
                onClick={() => handleRate('again')}
                className="py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex flex-col items-center gap-1"
              >
                <XCircle className="w-5 h-5" />
                <span className="text-sm">{language === 'ar' ? 'أعد' : 'Again'}</span>
                <span className="text-[10px] opacity-75">{'< 1' + (language === 'ar' ? ' يوم' : ' day')}</span>
              </button>
              <button
                onClick={() => handleRate('hard')}
                className="py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors flex flex-col items-center gap-1"
              >
                <Clock className="w-5 h-5" />
                <span className="text-sm">{language === 'ar' ? 'صعب' : 'Hard'}</span>
                <span className="text-[10px] opacity-75">{language === 'ar' ? '1 يوم' : '1 day'}</span>
              </button>
              <button
                onClick={() => handleRate('good')}
                className="py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors flex flex-col items-center gap-1"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">{language === 'ar' ? 'جيد' : 'Good'}</span>
                <span className="text-[10px] opacity-75">
                  {currentCard.repetitions > 0 
                    ? `${Math.round(currentCard.interval * currentCard.easeFactor)} ${language === 'ar' ? 'يوم' : 'days'}`
                    : language === 'ar' ? '6 أيام' : '6 days'}
                </span>
              </button>
              <button
                onClick={() => handleRate('easy')}
                className="py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex flex-col items-center gap-1"
              >
                <Zap className="w-5 h-5" />
                <span className="text-sm">{language === 'ar' ? 'سهل' : 'Easy'}</span>
                <span className="text-[10px] opacity-75">
                  {currentCard.repetitions > 0 
                    ? `${Math.round(currentCard.interval * currentCard.easeFactor * 1.3)} ${language === 'ar' ? 'يوم' : 'days'}`
                    : language === 'ar' ? '10 أيام' : '10 days'}
                </span>
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default FlashCardsPage;
