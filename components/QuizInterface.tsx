import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, Trophy, RotateCcw, Brain, Clock, Target, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getQuizQuestions, submitQuizAttempt, QuizQuestion } from '../services/quizService';
import { getSocraticQuestion, evaluateTeachAI, SocraticQuestion } from '../services/aiEngineService';

interface QuizInterfaceProps {
  lessonId: string;
  studentId: string;
  lessonTopic?: string;
  subject?: string;
  onComplete?: (score: number, total: number) => void;
}

type QuizState = 'loading' | 'ready' | 'in-progress' | 'reviewing' | 'results';
type QuizMode = 'classic' | 'socratic' | 'teach-ai';

interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ lessonId, studentId, lessonTopic, subject, onComplete }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [mode, setMode] = useState<QuizMode>('classic');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [state, setState] = useState<QuizState>('loading');
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Socratic mode state
  const [socraticQ, setSocraticQ] = useState<SocraticQuestion | null>(null);
  const [socraticAnswer, setSocraticAnswer] = useState('');
  const [socraticHistory, setSocraticHistory] = useState<Array<{ question: string; answer: string; feedback: string }>>([]);
  const [socraticLoading, setSocraticLoading] = useState(false);
  const [socraticRound, setSocraticRound] = useState(0);

  // Teach-AI mode state
  const [teachAnswer, setTeachAnswer] = useState('');
  const [teachResult, setTeachResult] = useState<any>(null);
  const [teachLoading, setTeachLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [lessonId]);

  useEffect(() => {
    let interval: number;
    if (state === 'in-progress') {
      interval = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state, startTime]);

  const loadQuestions = async () => {
    setState('loading');
    const qs = await getQuizQuestions(lessonId);
    if (qs.length > 0) {
      setQuestions(qs);
      setState('ready');
    } else {
      setState('ready');
    }
  };

  const startQuiz = () => {
    setState('in-progress');
    setStartTime(Date.now());
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleSelectOption = (optionId: string) => {
    if (showFeedback) return;
    setSelectedOption(optionId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption) return;
    const question = questions[currentIndex];
    const selectedIndex = parseInt(selectedOption.replace('opt-', ''));
    const selectedOptionObj = (question.options || [])[selectedIndex];
    const isCorrect = selectedOptionObj?.is_correct === true;

    const answer: QuizAnswer = {
      questionId: question.question_id,
      selectedOptionId: selectedOption,
      isCorrect,
    };

    setAnswers(prev => [...prev, answer]);
    setShowFeedback(true);

    // Submit to backend
    await submitQuizAttempt(studentId, question.question_id, selectedOption, '', 0);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      const score = answers.filter(a => a.isCorrect).length;
      setState('results');
      onComplete?.(score, questions.length);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const score = answers.filter(a => a.isCorrect).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // --- Socratic Quiz Helpers ---
  const startSocratic = async () => {
    setMode('socratic');
    setSocraticLoading(true);
    setSocraticHistory([]);
    setSocraticRound(0);
    setStartTime(Date.now());
    setState('in-progress');
    try {
      const q = await getSocraticQuestion(
        lessonTopic || lessonId,
        undefined, undefined,
        subject || 'science',
        7
      );
      if (q) setSocraticQ(q);
    } catch (err) { console.error(err); }
    setSocraticLoading(false);
  };

  const submitSocraticAnswer = async () => {
    if (!socraticAnswer.trim() || !socraticQ) return;
    setSocraticLoading(true);
    const round = { question: isAr ? socraticQ.question_ar : socraticQ.question_en, answer: socraticAnswer, feedback: '' };

    try {
      // Get next question with the student's answer as context
      const nextQ = await getSocraticQuestion(
        lessonTopic || lessonId,
        socraticAnswer,
        socraticAnswer,
        subject || 'science',
        7
      );
      if (nextQ) {
        round.feedback = isAr ? (nextQ.hint_ar || '') : (nextQ.hint_en || '');
        setSocraticQ(nextQ);
      }
    } catch (err) { console.error(err); }

    setSocraticHistory(prev => [...prev, round]);
    setSocraticAnswer('');
    setSocraticRound(prev => prev + 1);
    setSocraticLoading(false);

    if (socraticRound >= 4) {
      setState('results');
      onComplete?.(socraticRound, 5);
    }
  };

  const startTeachAI = () => {
    setMode('teach-ai');
    setTeachResult(null);
    setTeachAnswer('');
    setState('in-progress');
    setStartTime(Date.now());
  };

  const submitTeachAI = async () => {
    if (!teachAnswer.trim()) return;
    setTeachLoading(true);
    try {
      const result = await evaluateTeachAI(
        lessonTopic || lessonId,
        teachAnswer,
        subject || 'science',
        7
      );
      if (result) setTeachResult(result);
    } catch (err) { console.error(err); }
    setTeachLoading(false);
  };

  // Loading
  if (state === 'loading') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8 text-center">
        <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-gray-500">{isAr ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}</p>
      </div>
    );
  }

  // No questions
  if (state === 'ready' && questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8 text-center">
        <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 font-medium">{isAr ? 'لا توجد أسئلة متاحة لهذا الدرس' : 'No quiz questions available for this lesson'}</p>
        <p className="text-sm text-gray-400 mt-1">{isAr ? 'سيتم إضافة أسئلة قريباً' : 'Questions will be added soon'}</p>
      </div>
    );
  }

  // Ready to start
  if (state === 'ready') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-500 to-secondary-500 p-8 text-center text-white">
          <Brain className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-2">{isAr ? 'اختبار ذكي' : 'Smart Quiz'}</h2>
          <p className="text-brand-100">{isAr ? `${questions.length} أسئلة` : `${questions.length} questions`}</p>
        </div>
        <div className="p-6 text-center">
          <div className="flex justify-center gap-6 mb-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-500" />
              <span>{isAr ? 'اختيار متعدد' : 'Multiple Choice'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-gold" />
              <span>{isAr ? 'غير محدد بوقت' : 'No time limit'}</span>
            </div>
          </div>

          {/* Mode Selector — AI-Driven Quiz Modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 max-w-lg mx-auto text-start">
            <button
              onClick={startQuiz}
              className="p-4 bg-brand-50 border-2 border-brand-200 rounded-xl hover:border-brand-500 transition-colors group"
            >
              <Target className="w-6 h-6 text-brand-500 mb-2" />
              <p className="font-bold text-sm text-gray-800">{isAr ? 'كلاسيكي' : 'Classic'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{isAr ? 'اختيار من متعدد' : 'Multiple choice'}</p>
            </button>
            <button
              onClick={startSocratic}
              className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl hover:border-purple-500 transition-colors group"
            >
              <MessageSquare className="w-6 h-6 text-purple-500 mb-2" />
              <p className="font-bold text-sm text-gray-800 flex items-center gap-1">
                {isAr ? 'سقراطي' : 'Socratic'}
                <Sparkles className="w-3 h-3 text-purple-400" />
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{isAr ? 'حوار ذكي' : 'AI dialogue'}</p>
            </button>
            <button
              onClick={startTeachAI}
              className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl hover:border-amber-500 transition-colors group"
            >
              <Brain className="w-6 h-6 text-amber-500 mb-2" />
              <p className="font-bold text-sm text-gray-800 flex items-center gap-1">
                {isAr ? 'عَلِّم الذكاء' : 'Teach AI'}
                <Sparkles className="w-3 h-3 text-amber-400" />
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{isAr ? 'اشرح للروبوت' : 'Explain to bot'}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (state === 'results') {
    const getResultMessage = () => {
      if (percentage >= 90) return isAr ? 'ممتاز! 🌟' : 'Excellent! 🌟';
      if (percentage >= 70) return isAr ? 'جيد جداً! 👏' : 'Great job! 👏';
      if (percentage >= 50) return isAr ? 'جيد، استمر! 💪' : 'Good, keep going! 💪';
      return isAr ? 'حاول مرة أخرى 📚' : 'Try again 📚';
    };

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className={`p-8 text-center text-white ${percentage >= 70 ? 'bg-gradient-to-br from-brand-500 to-green-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}>
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-1">{getResultMessage()}</h2>
          <p className="text-lg opacity-90">{score}/{questions.length} {isAr ? 'إجابات صحيحة' : 'correct answers'}</p>
        </div>

        <div className="p-6">
          {/* Score Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span className="text-gray-600">{isAr ? 'النتيجة' : 'Score'}</span>
              <span className={percentage >= 70 ? 'text-brand-500' : 'text-amber-500'}>{percentage}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${percentage >= 70 ? 'bg-brand-500' : 'bg-amber-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-700">{score}</div>
              <div className="text-xs text-green-600">{isAr ? 'صحيح' : 'Correct'}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-red-700">{questions.length - score}</div>
              <div className="text-xs text-red-600">{isAr ? 'خطأ' : 'Wrong'}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-700">{formatTime(elapsedTime)}</div>
              <div className="text-xs text-blue-600">{isAr ? 'الوقت' : 'Time'}</div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            {isAr ? 'أعد الاختبار' : 'Retry Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // In-progress — Socratic mode
  if (mode === 'socratic' && state === 'in-progress') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <span className="font-semibold text-gray-700">
              {isAr ? `الجولة ${socraticRound + 1} من 5` : `Round ${socraticRound + 1} of 5`}
            </span>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {isAr ? 'حوار سقراطي' : 'Socratic Mode'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{formatTime(Math.floor((Date.now() - startTime) / 1000))}</span>
          </div>
        </div>

        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${((socraticRound + 1) / 5) * 100}%` }}
          />
        </div>

        <div className="p-6 space-y-4">
          {/* History */}
          {socraticHistory.map((h, i) => (
            <div key={i} className="space-y-2">
              <div className="p-3 bg-purple-50 rounded-xl text-sm font-medium text-purple-800" dir={isAr ? 'rtl' : 'ltr'}>
                <MessageSquare className="w-4 h-4 inline mr-1 text-purple-400" /> {h.question}
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 ml-4" dir={isAr ? 'rtl' : 'ltr'}>
                {h.answer}
              </div>
              {h.feedback && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700 ml-4" dir={isAr ? 'rtl' : 'ltr'}>
                  <Sparkles className="w-3 h-3 inline mr-1" /> {h.feedback}
                </div>
              )}
            </div>
          ))}

          {/* Current question */}
          {socraticQ && (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200" dir={isAr ? 'rtl' : 'ltr'}>
              <p className="font-bold text-gray-900 text-lg leading-relaxed">
                {isAr ? socraticQ.question_ar : socraticQ.question_en}
              </p>
              {(socraticQ.hint_ar || socraticQ.hint_en) && (
                <p className="text-sm text-purple-600 mt-2">
                  💡 {isAr ? socraticQ.hint_ar : socraticQ.hint_en}
                </p>
              )}
            </div>
          )}

          {/* Answer input */}
          <div className="flex gap-2">
            <textarea
              value={socraticAnswer}
              onChange={(e) => setSocraticAnswer(e.target.value)}
              placeholder={isAr ? 'اكتب إجابتك هنا...' : 'Write your answer here...'}
              className="flex-1 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
              rows={3}
              dir={isAr ? 'rtl' : 'ltr'}
              disabled={socraticLoading}
            />
            <button
              onClick={submitSocraticAnswer}
              disabled={!socraticAnswer.trim() || socraticLoading}
              className="self-end px-5 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {socraticLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // In-progress — Teach-AI mode
  if (mode === 'teach-ai' && state === 'in-progress') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-gray-700">
              {isAr ? 'علّم الذكاء الاصطناعي' : 'Teach the AI'}
            </span>
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center" dir={isAr ? 'rtl' : 'ltr'}>
            <Brain className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-gray-800 mb-1">
              {isAr ? `اشرح لي: ${lessonTopic || lessonId}` : `Explain to me: ${lessonTopic || lessonId}`}
            </h3>
            <p className="text-sm text-gray-500">
              {isAr
                ? 'تخيل إنك المعلم وأنا تلميذ مش فاهم. اشرح الموضوع بطريقتك!'
                : "Imagine you're the teacher and I'm a confused student. Explain in your own words!"
              }
            </p>
          </div>

          <textarea
            value={teachAnswer}
            onChange={(e) => setTeachAnswer(e.target.value)}
            placeholder={isAr ? 'اكتب شرحك هنا...' : 'Write your explanation here...'}
            className="w-full p-4 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
            rows={6}
            dir={isAr ? 'rtl' : 'ltr'}
            disabled={teachLoading}
          />

          <button
            onClick={submitTeachAI}
            disabled={!teachAnswer.trim() || teachLoading}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {teachLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            {isAr ? 'قيّم شرحي' : 'Evaluate My Explanation'}
          </button>

          {/* AI Evaluation Result */}
          {teachResult && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border ${
                teachResult.score >= 70 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800">
                    {isAr ? 'نتيجة التقييم' : 'Evaluation Score'}
                  </span>
                  <span className={`text-2xl font-bold ${teachResult.score >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                    {teachResult.score}%
                  </span>
                </div>
                <p className="text-sm text-gray-700" dir={isAr ? 'rtl' : 'ltr'}>
                  {isAr ? teachResult.feedback_ar : teachResult.feedback_en}
                </p>
              </div>

              {teachResult.missing_concepts && teachResult.missing_concepts.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-bold text-sm text-red-700 mb-1">
                    {isAr ? '❌ مفاهيم ناقصة:' : '❌ Missing concepts:'}
                  </p>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {teachResult.missing_concepts.map((c: string, i: number) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              <button
                onClick={() => { setTeachAnswer(''); setTeachResult(null); }}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> {isAr ? 'حاول مرة أخرى' : 'Try Again'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // In-progress — Classic mode
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
      {/* Progress Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-brand-500" />
          <span className="font-semibold text-gray-700">
            {isAr ? `السؤال ${currentIndex + 1} من ${questions.length}` : `Question ${currentIndex + 1} of ${questions.length}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-100">
        <div
          className="h-full bg-brand-500 transition-all duration-500"
          style={{ width: `${((currentIndex + (showFeedback ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 leading-relaxed" dir={isAr ? 'rtl' : 'ltr'}>
          {isAr ? currentQuestion.question_text_ar : (currentQuestion.question_text_en || currentQuestion.question_text_ar)}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {(currentQuestion.options || []).map((option: any, index: number) => {
            const optionKey = `opt-${index}`;
            const optionText = isAr ? (option.text_ar || option.text) : (option.text_en || option.text_ar || option.text);
            const isSelected = selectedOption === optionKey;
            const isCorrectOption = option.is_correct;
            const showCorrect = showFeedback && isCorrectOption;
            const showWrong = showFeedback && isSelected && !isCorrectOption;

            let optionClass = 'border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/30';
            if (isSelected && !showFeedback) optionClass = 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20';
            if (showCorrect) optionClass = 'border-green-500 bg-green-50';
            if (showWrong) optionClass = 'border-red-500 bg-red-50';

            const labels = ['أ', 'ب', 'ج', 'د'];
            const labelsEn = ['A', 'B', 'C', 'D'];

            return (
              <button
                key={optionKey}
                onClick={() => handleSelectOption(optionKey)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl border-2 text-right transition-all flex items-center gap-3 ${optionClass} disabled:cursor-default`}
                dir={isAr ? 'rtl' : 'ltr'}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                  showCorrect ? 'bg-green-500 text-white' :
                  showWrong ? 'bg-red-500 text-white' :
                  isSelected ? 'bg-brand-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isAr ? labels[index] : labelsEn[index]}
                </span>
                <span className={`flex-1 font-medium ${showCorrect ? 'text-green-700' : showWrong ? 'text-red-700' : 'text-gray-700'}`}>
                  {optionText}
                </span>
                {showCorrect && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                {showWrong && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showFeedback && (currentQuestion.explanation_ar || currentQuestion.explanation_en) && (
          <div className={`p-4 rounded-xl mb-4 ${answers[answers.length - 1]?.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <p className="text-sm font-semibold mb-1 text-gray-700">
              {isAr ? '💡 التوضيح:' : '💡 Explanation:'}
            </p>
            <p className="text-sm text-gray-600">{isAr ? currentQuestion.explanation_ar : (currentQuestion.explanation_en || currentQuestion.explanation_ar)}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {!showFeedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption}
              className="px-6 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isAr ? 'تأكيد' : 'Submit'}
              <CheckCircle className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors flex items-center gap-2"
            >
              {currentIndex < questions.length - 1
                ? (isAr ? 'التالي' : 'Next')
                : (isAr ? 'النتائج' : 'Results')
              }
              {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
