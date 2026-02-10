import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, FileText, ChevronLeft, ChevronRight, Zap, History, FileCheck, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { sendMessageToGemini } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
}

interface SourceFile {
  name: string;
  size: string;
  checked: boolean;
}

const AITutor: React.FC = () => {
  const { t, language } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSourcePanel, setShowSourcePanel] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatHistory] = useState<ChatSession[]>([
    { id: '1', title: 'محادثة عميقة (طويلة جداً)', date: '2025-11-08' },
    { id: '2', title: 'تقرير عامة صوتية', date: '' },
    { id: '3', title: 'الخريطة الإعدادي المصري', date: 'الصفة 7' },
    { id: '4', title: 'المادة عادي', date: '' },
  ]);

  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([
    { name: 'Semester_2_Science.txt', size: 'MB 0.12', checked: true },
    { name: 'Semester_1_Science.txt', size: 'MB 0.23', checked: true },
    { name: 'Semester_1_Arabic.txt', size: 'MB 0.26', checked: true },
  ]);

  const actionCards = [
    { id: 1, text: 'حل لي الأسئلة على الدرس' },
    { id: 2, text: 'اعتمد املاءه على التعليمات الى' },
    { id: 3, text: 'صحح لي في "المطابقة المتردية"' },
    { id: 4, text: 'ما الفرق بين الفعل والاسم في التراث؟' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context from checked source files
      const sourceContext = sourceFiles
        .filter(f => f.checked)
        .map(f => f.name)
        .join(', ');

      const contextPrefix = sourceContext
        ? `[User has these sources loaded: ${sourceContext}]\n\n`
        : '';

      const response = await sendMessageToGemini(
        contextPrefix + input,
        undefined,
        language
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'ar'
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSourceFile = (index: number) => {
    setSourceFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, checked: !file.checked } : file
    ));
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Left Sidebar - Chat History */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-e border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" />
            مساحة العمل
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {chatHistory.map((session) => (
              <button
                key={session.id}
                className="w-full text-start p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{session.title}</p>
                    {session.date && (
                      <p className="text-xs text-gray-400 mt-0.5">{session.date}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full bg-brand-500 text-white py-2.5 rounded-lg hover:bg-brand-600 transition-colors font-medium text-sm">
            + {language === 'ar' ? 'محادثة جديدة' : 'New Chat'}
          </button>
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute top-4 start-64 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-all"
        style={{ transform: showSidebar ? 'translateX(0)' : 'translateX(-256px)' }}
      >
        {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className="max-w-3xl w-full space-y-8">
              {/* AI Avatar and Title */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full shadow-xl relative">
                  <Bot className="w-12 h-12 text-white" />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-4 border-white rounded-full"></span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800">
                  منهجي AI - معلمك الذكي
                </h1>
                
                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                  معلومات الذكي المدعوم بتقنية <span className="font-bold text-brand-600">RAG</span> و
                  <span className="font-bold text-brand-600"> Gemini AI</span> ، المتطبطة بين{' '}
                  <span className="font-bold underline decoration-brand-500">
                    Hugging AI
                  </span>{' '}
                  إسأل أي سؤال
                  <br />
                  عن المناهج المصرية واحصل على إجابات دقيقة ومصممة فوراً! 📚
                </p>
              </div>

              {/* Feature Buttons */}
              <div className="flex justify-center gap-4 flex-wrap">
                <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-brand-200 rounded-full hover:bg-brand-50 hover:border-brand-400 transition-all shadow-sm">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                  <span className="font-medium text-gray-700">إجابات دقيقة</span>
                </button>
                
                <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-accent-orange/30 rounded-full hover:bg-accent-orange/10 hover:border-accent-orange/50 transition-all shadow-sm">
                  <Zap className="w-5 h-5 text-accent-orange" />
                  <span className="font-medium text-gray-700">تاريخ وتحفيزي</span>
                </button>
                
                <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-200 rounded-full hover:bg-green-50 hover:border-green-400 transition-all shadow-sm">
                  <FileCheck className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">إضافة وإصلحة</span>
                </button>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800">إجابات دقيقة</h3>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800">تاريخ وتحفيزي</h3>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800">حل المناهج</h3>
                </div>
              </div>

              {/* Action Cards */}
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                {actionCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setInput(card.text)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-full hover:bg-brand-50 hover:border-brand-300 transition-all text-sm text-gray-700 shadow-sm hover:shadow-md"
                  >
                    {card.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-brand-500' : 'bg-gradient-to-br from-brand-400 to-brand-600'
                  }`}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-brand-400 to-brand-600">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-200 rounded-tl-none shadow-sm">
                    <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-2 border border-gray-200 focus-within:border-brand-300 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
                className="flex-1 bg-transparent px-4 py-2 text-gray-800 placeholder:text-gray-400 focus:outline-none"
                disabled={isLoading}
              />
              
              <button className="p-2 text-gray-400 hover:text-brand-500 transition-colors">
                <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center">
                  <span className="text-xs font-bold">V</span>
                </div>
              </button>
              
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-2">
              7 محتار توكل
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Source Files */}
      <div className={`${showSourcePanel ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-s border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">المصادر</h3>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 rounded">
              <FileText className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Sparkles className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <History className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <button className="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium mb-4">
            + إضافة محصدر
          </button>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <FileText className="w-4 h-4" />
              <span>سجل المحادثات</span>
            </div>
            
            {sourceFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={file.checked}
                  onChange={() => toggleSourceFile(index)}
                  className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
                />
                <FileText className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{file.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">ملاحظات:</p>
        </div>
      </div>

      {/* Toggle Source Panel Button */}
      <button
        onClick={() => setShowSourcePanel(!showSourcePanel)}
        className="absolute top-4 end-72 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-all"
        style={{ transform: showSourcePanel ? 'translateX(0)' : 'translateX(288px)' }}
      >
        {showSourcePanel ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default AITutor;
