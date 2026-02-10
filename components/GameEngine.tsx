import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { GameType, GameQuestion, GameSession } from '../types';
import {
  ArrowLeft, Trophy, Star, Clock, CheckCircle2, XCircle, Zap, Sparkles,
  ArrowUpDown, Shuffle, AlertTriangle, Timer, RotateCcw, ChevronRight, Loader2
} from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

// ═══════════════════════════════════════════════════════════════════════════
// Game Data
// ═══════════════════════════════════════════════════════════════════════════

const MATCHING_QUESTIONS: GameQuestion[] = [
  {
    id: 'mq1',
    questionAr: 'طابق المفهوم بتعريفه الصحيح',
    questionEn: 'Match the concept with its correct definition',
    pairs: [
      { left: 'المعادلة الخطية', leftEn: 'Linear Equation', right: 'معادلة من الدرجة الأولى', rightEn: 'Degree-one equation' },
      { left: 'المتغير', leftEn: 'Variable', right: 'رمز يمثل قيمة مجهولة', rightEn: 'Symbol for unknown value' },
      { left: 'الميل', leftEn: 'Slope', right: 'معدل التغير', rightEn: 'Rate of change' },
      { left: 'المقطع', leftEn: 'Intercept', right: 'نقطة تقاطع المحور', rightEn: 'Axis crossing point' },
    ]
  },
  {
    id: 'mq2',
    questionAr: 'طابق حالة المادة بخاصيتها',
    questionEn: 'Match the state of matter with its property',
    pairs: [
      { left: 'صلبة', leftEn: 'Solid', right: 'شكل وحجم ثابت', rightEn: 'Fixed shape & volume' },
      { left: 'سائلة', leftEn: 'Liquid', right: 'حجم ثابت شكل متغير', rightEn: 'Fixed volume, variable shape' },
      { left: 'غازية', leftEn: 'Gas', right: 'شكل وحجم متغير', rightEn: 'Variable shape & volume' },
      { left: 'بلازما', leftEn: 'Plasma', right: 'غاز متأين', rightEn: 'Ionized gas' },
    ]
  }
];

const SEQUENCE_QUESTIONS: GameQuestion[] = [
  {
    id: 'sq1',
    questionAr: 'رتب خطوات حل المعادلة الخطية',
    questionEn: 'Order the steps to solve a linear equation',
    items: [
      { id: 's1', text: 'تبسيط الطرفين', textEn: 'Simplify both sides', correctOrder: 1 },
      { id: 's2', text: 'جمع الحدود المتشابهة', textEn: 'Combine like terms', correctOrder: 2 },
      { id: 's3', text: 'عزل المتغير', textEn: 'Isolate the variable', correctOrder: 3 },
      { id: 's4', text: 'التحقق من الحل', textEn: 'Verify the solution', correctOrder: 4 },
    ]
  },
  {
    id: 'sq2',
    questionAr: 'رتب مراحل المنهج العلمي',
    questionEn: 'Order the steps of the scientific method',
    items: [
      { id: 's1', text: 'الملاحظة', textEn: 'Observation', correctOrder: 1 },
      { id: 's2', text: 'تكوين الفرضية', textEn: 'Form hypothesis', correctOrder: 2 },
      { id: 's3', text: 'إجراء التجربة', textEn: 'Conduct experiment', correctOrder: 3 },
      { id: 's4', text: 'تحليل النتائج', textEn: 'Analyze results', correctOrder: 4 },
      { id: 's5', text: 'الاستنتاج', textEn: 'Conclusion', correctOrder: 5 },
    ]
  }
];

const FIX_MISTAKE_QUESTIONS: GameQuestion[] = [
  {
    id: 'fq1',
    questionAr: 'أصلح الخطأ في هذه الحل',
    questionEn: 'Fix the mistake in this solution',
    wrongStatement: '2x + 5 = 15 → 2x = 15 + 5 → 2x = 20 → x = 10',
    wrongStatementEn: '2x + 5 = 15 → 2x = 15 + 5 → 2x = 20 → x = 10',
    correctStatement: '2x + 5 = 15 → 2x = 15 - 5 → 2x = 10 → x = 5',
    correctStatementEn: '2x + 5 = 15 → 2x = 15 - 5 → 2x = 10 → x = 5',
    explanation: 'عند نقل +5 للطرف الآخر تتغير الإشارة إلى -5',
    explanationEn: 'When moving +5 to the other side, the sign changes to -5',
  },
  {
    id: 'fq2',
    questionAr: 'هل هذا التفاعل كيميائي أم فيزيائي؟',
    questionEn: 'Is this a chemical or physical change?',
    wrongStatement: 'ذوبان الثلج تغير كيميائي لأن شكل المادة يتغير',
    wrongStatementEn: 'Melting ice is a chemical change because the shape changes',
    correctStatement: 'ذوبان الثلج تغير فيزيائي لأن التركيب الكيميائي لا يتغير',
    correctStatementEn: 'Melting ice is a physical change because chemical composition stays the same',
    explanation: 'التغير الفيزيائي يغير الشكل فقط، لكن التركيب الكيميائي يبقى كما هو (H₂O)',
    explanationEn: 'Physical change only alters form; chemical composition stays the same (H₂O)',
  }
];

const SPEED_QUESTIONS: GameQuestion[] = [
  { id: 'spq1', questionAr: 'ما قيمة x في: 3x = 12؟', questionEn: 'What is x in: 3x = 12?', options: ['2', '4', '6', '3'], optionsEn: ['2', '4', '6', '3'], correctAnswer: '4', correctAnswerEn: '4' },
  { id: 'spq2', questionAr: 'ما وحدة قياس القوة؟', questionEn: 'What is the unit of force?', options: ['الجول', 'النيوتن', 'الواط', 'المتر'], optionsEn: ['Joule', 'Newton', 'Watt', 'Meter'], correctAnswer: 'النيوتن', correctAnswerEn: 'Newton' },
  { id: 'spq3', questionAr: 'ما ناتج -5 + 8؟', questionEn: 'What is -5 + 8?', options: ['-3', '3', '13', '-13'], optionsEn: ['-3', '3', '13', '-13'], correctAnswer: '3', correctAnswerEn: '3' },
  { id: 'spq4', questionAr: 'ما هو الرقم الذري للأكسجين؟', questionEn: 'What is the atomic number of Oxygen?', options: ['6', '8', '16', '12'], optionsEn: ['6', '8', '16', '12'], correctAnswer: '8', correctAnswerEn: '8' },
  { id: 'spq5', questionAr: 'ما المعادلة الخطية؟: y = x²', questionEn: 'Is y = x² linear?', options: ['نعم', 'لا'], optionsEn: ['Yes', 'No'], correctAnswer: 'لا', correctAnswerEn: 'No' },
];

// ═══════════════════════════════════════════════════════════════════════════
// Matching Game Component
// ═══════════════════════════════════════════════════════════════════════════

const MatchingGame: React.FC<{ question: GameQuestion; language: string; onComplete: (correct: number, total: number) => void }> = ({ question, language, onComplete }) => {
  const pairs = question.pairs || [];
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null);
  const [shuffledRight, setShuffledRight] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    const indices = pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledRight(indices);
  }, [question.id]);

  const handleRightClick = (originalIndex: number) => {
    if (selectedLeft === null || matched.has(selectedLeft)) return;
    
    if (selectedLeft === originalIndex) {
      setMatched(prev => new Set([...prev, selectedLeft]));
      setSelectedLeft(null);
      if (matched.size + 1 === pairs.length) {
        setTimeout(() => onComplete(pairs.length - errors, pairs.length), 500);
      }
    } else {
      setWrongPair({ left: selectedLeft, right: originalIndex });
      setErrors(e => e + 1);
      setTimeout(() => { setWrongPair(null); setSelectedLeft(null); }, 800);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">
        {language === 'ar' ? question.questionAr : question.questionEn}
      </h3>
      <div className="grid grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-3">
          {pairs.map((pair, i) => (
            <button
              key={`l${i}`}
              onClick={() => !matched.has(i) && setSelectedLeft(i)}
              disabled={matched.has(i)}
              className={`w-full p-4 rounded-xl border-2 text-start transition-all ${
                matched.has(i) ? 'bg-green-50 border-green-300 text-green-700 opacity-60' :
                selectedLeft === i ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-md' :
                wrongPair?.left === i ? 'bg-red-50 border-red-400 animate-shake' :
                'bg-white border-gray-200 hover:border-brand-300 hover:bg-gray-50'
              }`}
            >
              {matched.has(i) && <CheckCircle2 className="w-4 h-4 inline me-2 text-green-500" />}
              {language === 'ar' ? pair.left : pair.leftEn}
            </button>
          ))}
        </div>
        
        {/* Right column */}
        <div className="space-y-3">
          {shuffledRight.map((originalIdx) => (
            <button
              key={`r${originalIdx}`}
              onClick={() => handleRightClick(originalIdx)}
              disabled={matched.has(originalIdx)}
              className={`w-full p-4 rounded-xl border-2 text-start transition-all ${
                matched.has(originalIdx) ? 'bg-green-50 border-green-300 text-green-700 opacity-60' :
                wrongPair?.right === originalIdx ? 'bg-red-50 border-red-400 animate-shake' :
                'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {matched.has(originalIdx) && <CheckCircle2 className="w-4 h-4 inline me-2 text-green-500" />}
              {language === 'ar' ? pairs[originalIdx].right : pairs[originalIdx].rightEn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Sequence Game Component
// ═══════════════════════════════════════════════════════════════════════════

const SequenceGame: React.FC<{ question: GameQuestion; language: string; onComplete: (correct: number, total: number) => void }> = ({ question, language, onComplete }) => {
  const items = question.items || [];
  const [userOrder, setUserOrder] = useState<typeof items>([]);
  const [remaining, setRemaining] = useState<typeof items>([]);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setRemaining(shuffled);
    setUserOrder([]);
    setChecked(false);
  }, [question.id]);

  const addToOrder = (item: typeof items[0]) => {
    setUserOrder(prev => [...prev, item]);
    setRemaining(prev => prev.filter(r => r.id !== item.id));
  };

  const removeFromOrder = (item: typeof items[0]) => {
    if (checked) return;
    setUserOrder(prev => prev.filter(u => u.id !== item.id));
    setRemaining(prev => [...prev, item]);
  };

  const checkAnswer = () => {
    let correct = 0;
    userOrder.forEach((item, index) => {
      if (item.correctOrder === index + 1) correct++;
    });
    setCorrectCount(correct);
    setChecked(true);
    setTimeout(() => onComplete(correct, items.length), 2000);
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
        {language === 'ar' ? question.questionAr : question.questionEn}
      </h3>
      <p className="text-sm text-gray-500 mb-6 text-center">
        {language === 'ar' ? 'اضغط على العناصر بالترتيب الصحيح' : 'Click items in the correct order'}
      </p>

      {/* User's sequence */}
      <div className="min-h-[60px] bg-brand-50 rounded-xl p-3 mb-4 border-2 border-dashed border-brand-300">
        {userOrder.length === 0 ? (
          <p className="text-center text-brand-400 py-2">{language === 'ar' ? 'اضغط على العناصر لترتيبها' : 'Click items to order them'}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userOrder.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => removeFromOrder(item)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  checked
                    ? item.correctOrder === idx + 1
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-100'
                }`}
              >
                <span className="w-6 h-6 bg-brand-500 text-white rounded-full text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                {language === 'ar' ? item.text : item.textEn}
                {checked && item.correctOrder === idx + 1 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {checked && item.correctOrder !== idx + 1 && <XCircle className="w-4 h-4 text-red-500" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Remaining items */}
      <div className="flex flex-wrap gap-2 mb-6">
        {remaining.map(item => (
          <button
            key={item.id}
            onClick={() => addToOrder(item)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-brand-300 transition-all"
          >
            {language === 'ar' ? item.text : item.textEn}
          </button>
        ))}
      </div>

      {userOrder.length === items.length && !checked && (
        <button
          onClick={checkAnswer}
          className="w-full py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
        >
          {language === 'ar' ? 'تحقق من الإجابة' : 'Check Answer'}
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Fix the Mistake Game Component
// ═══════════════════════════════════════════════════════════════════════════

const FixMistakeGame: React.FC<{ question: GameQuestion; language: string; onComplete: (correct: number, total: number) => void }> = ({ question, language, onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<'wrong' | 'correct' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const wrongText = language === 'ar' ? question.wrongStatement : question.wrongStatementEn;
  const correctText = language === 'ar' ? question.correctStatement : question.correctStatementEn;

  // Randomize which one is displayed first
  const [options] = useState(() => {
    const opts = [
      { key: 'wrong' as const, text: wrongText },
      { key: 'correct' as const, text: correctText },
    ];
    return Math.random() > 0.5 ? opts : opts.reverse();
  });

  const handleSelect = (key: 'wrong' | 'correct') => {
    setSelectedOption(key);
    setShowExplanation(true);
    setTimeout(() => onComplete(key === 'correct' ? 1 : 0, 1), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-gray-800">
          {language === 'ar' ? question.questionAr : question.questionEn}
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-6 text-center">
        {language === 'ar' ? 'اختر الإجابة الصحيحة' : 'Choose the correct statement'}
      </p>

      <div className="space-y-4">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => !selectedOption && handleSelect(opt.key)}
            disabled={!!selectedOption}
            className={`w-full p-5 rounded-xl border-2 text-start transition-all ${
              selectedOption === null
                ? 'bg-white border-gray-200 hover:border-brand-300 hover:shadow-md'
                : selectedOption === opt.key
                  ? opt.key === 'correct'
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                  : opt.key === 'correct'
                    ? 'bg-green-50 border-green-400'
                    : 'bg-gray-50 border-gray-200 opacity-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {selectedOption && opt.key === 'correct' && <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />}
              {selectedOption && opt.key === 'wrong' && <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
              <p className="font-medium" dir="auto">{opt.text}</p>
            </div>
          </button>
        ))}
      </div>

      {showExplanation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 animate-in slide-in-from-bottom-2">
          <p className="text-sm font-bold text-blue-800 mb-1">
            {language === 'ar' ? 'التوضيح:' : 'Explanation:'}
          </p>
          <p className="text-sm text-blue-700">
            {language === 'ar' ? question.explanation : question.explanationEn}
          </p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Speed Challenge Game Component
// ═══════════════════════════════════════════════════════════════════════════

const SpeedChallengeGame: React.FC<{ questions: GameQuestion[]; language: string; onComplete: (correct: number, total: number, time: number) => void }> = ({ questions, language, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (gameOver) {
      onComplete(score, questions.length, 60 - timeLeft);
    }
  }, [gameOver]);

  const handleAnswer = (answer: string) => {
    const q = questions[currentIdx];
    const correct = answer === (language === 'ar' ? q.correctAnswer : q.correctAnswerEn);
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
      } else {
        setGameOver(true);
        clearInterval(timerRef.current);
      }
    }, 600);
  };

  if (gameOver) return null; // parent handles results

  const q = questions[currentIdx];
  const options = language === 'ar' ? q.options : q.optionsEn;

  return (
    <div>
      {/* Timer bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="flex items-center gap-1 text-sm font-medium text-gray-600">
            <Timer className="w-4 h-4" /> {timeLeft}s
          </span>
          <span className="text-sm font-bold text-brand-600">{score} / {questions.length}</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${timeLeft > 20 ? 'bg-brand-500' : timeLeft > 10 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <span className="text-xs text-gray-400 mb-2 block">{currentIdx + 1} / {questions.length}</span>
        <h3 className="text-xl font-bold text-gray-800">
          {language === 'ar' ? q.questionAr : q.questionEn}
        </h3>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4">
        {options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => !selectedAnswer && handleAnswer(opt)}
            disabled={!!selectedAnswer}
            className={`p-4 rounded-xl border-2 font-medium text-lg transition-all ${
              selectedAnswer === opt
                ? isCorrect ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'
                : 'bg-white border-gray-200 hover:border-brand-400 hover:bg-brand-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Main Game Engine Component
// ═══════════════════════════════════════════════════════════════════════════

interface GameEngineProps {
  gameType: GameType;
  onBack: () => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ gameType, onBack }) => {
  const { language } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [results, setResults] = useState<GameSession | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const gameTitle: Record<GameType, { ar: string; en: string }> = {
    matching: { ar: 'لعبة المطابقة', en: 'Matching Game' },
    sequence: { ar: 'لعبة الترتيب', en: 'Sequence Game' },
    fix_mistake: { ar: 'أصلح الخطأ', en: 'Fix the Mistake' },
    speed_challenge: { ar: 'تحدي السرعة', en: 'Speed Challenge' },
  };

  const getQuestions = () => {
    switch (gameType) {
      case 'matching': return MATCHING_QUESTIONS;
      case 'sequence': return SEQUENCE_QUESTIONS;
      case 'fix_mistake': return FIX_MISTAKE_QUESTIONS;
      case 'speed_challenge': return SPEED_QUESTIONS;
    }
  };

  const questions = getQuestions();

  const handleQuestionComplete = (correct: number, total: number, time?: number) => {
    const newCorrect = totalCorrect + correct;
    const newTotal = totalQuestions + total;
    setTotalCorrect(newCorrect);
    setTotalQuestions(newTotal);

    if (gameType === 'speed_challenge' || currentQ >= questions.length - 1) {
      // Game over
      setResults({
        gameType,
        score: Math.round((newCorrect / newTotal) * 100),
        totalQuestions: newTotal,
        timeElapsed: time || 0,
        correctAnswers: newCorrect,
        xpEarned: newCorrect * 25,
      });
    } else {
      setCurrentQ(q => q + 1);
    }
  };

  // Results screen
  if (results) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            results.score >= 80 ? 'bg-gradient-to-br from-green-400 to-green-600' :
            results.score >= 50 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
            'bg-gradient-to-br from-red-400 to-red-600'
          }`}>
            <Trophy className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {results.score >= 80 
              ? (language === 'ar' ? 'ممتاز!' : 'Excellent!') 
              : results.score >= 50 
                ? (language === 'ar' ? 'جيد!' : 'Good!') 
                : (language === 'ar' ? 'حاول مرة أخرى' : 'Try Again')}
          </h2>

          <div className="grid grid-cols-3 gap-4 my-8">
            <div className="bg-brand-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-brand-600">{results.score}%</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'النتيجة' : 'Score'}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-600">{results.correctAnswers}/{results.totalQuestions}</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'صحيح' : 'Correct'}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-amber-600">+{results.xpEarned}</p>
              <p className="text-xs text-gray-500">XP</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 inline me-2" />
              {language === 'ar' ? 'رجوع' : 'Back'}
            </button>
            <button
              onClick={() => { setResults(null); setCurrentQ(0); setTotalCorrect(0); setTotalQuestions(0); }}
              className="flex-1 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline me-2" />
              {language === 'ar' ? 'إعادة' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">
          {language === 'ar' ? gameTitle[gameType].ar : gameTitle[gameType].en}
        </h2>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-bold">{totalCorrect * 25} XP</span>
        </div>
      </div>

      {/* Game content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {gameType === 'matching' && (
          <MatchingGame question={questions[currentQ]} language={language} onComplete={handleQuestionComplete} />
        )}
        {gameType === 'sequence' && (
          <SequenceGame question={questions[currentQ]} language={language} onComplete={handleQuestionComplete} />
        )}
        {gameType === 'fix_mistake' && (
          <FixMistakeGame question={questions[currentQ]} language={language} onComplete={handleQuestionComplete} />
        )}
        {gameType === 'speed_challenge' && (
          <SpeedChallengeGame questions={questions} language={language} onComplete={handleQuestionComplete} />
        )}
      </div>
    </div>
  );
};

export default GameEngine;
