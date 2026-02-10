
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, Loader2, Sparkles, User as UserIcon, Image as ImageIcon, Mic, X, BookOpen } from 'lucide-react';
import { ChatMessage, Lesson } from '../types';
import { sendMessageToGemini, startChatSession } from '../services/geminiService';
import { streamRAGMessage, detectConfusion, updateStudentContext, StudentAction } from '../services/aiEngineService';
import { logAnalyticsEvent } from '../services/progressService';
import { useLanguage } from '../contexts/LanguageContext';
import { SYSTEM_PROMPT_AR, SYSTEM_PROMPT_EN } from '../constants';

interface AIChatProps {
  activeLesson?: Lesson | null;
}

const AIChat: React.FC<AIChatProps> = ({ activeLesson }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [confusionAction, setConfusionAction] = useState<StudentAction | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Re-initialize chat session when lesson changes or language changes
  useEffect(() => {
     const initChat = async () => {
       const systemPrompt = language === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_AR;
       await startChatSession(activeLesson?.content, systemPrompt);
       
       if (activeLesson) {
         setMessages([{
            id: `welcome-${activeLesson.id}`,
            role: 'model',
            text: t('welcomeChatLesson', { title: activeLesson.title }),
            timestamp: new Date()
         }]);
       } else {
         setMessages([{
            id: 'welcome',
            role: 'model',
            text: t('chatWelcome'),
            timestamp: new Date()
         }]);
       }
    };
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLesson?.id, language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extract base64 part
        const base64String = (reader.result as string).split(',')[1];
        setAttachedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !attachedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      image: attachedImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imageToSend = attachedImage;
    setAttachedImage(null); // Clear attachment immediately
    setIsLoading(true);

    try {
      // Log chat event to analytics
      logAnalyticsEvent('current_user', 'chat', { hasImage: !!imageToSend });

      // For image messages, use direct Gemini (RAG doesn't handle images)
      if (imageToSend) {
        const responseText = await sendMessageToGemini(
          userMsg.text || (language === 'ar' ? 'اشرح هذه الصورة' : 'Explain this image'),
          imageToSend,
          language
        );
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: new Date(),
        }]);
      } else {
        // Use streaming RAG for text messages (Socratic + citations)
        const botMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, {
          id: botMsgId,
          role: 'model',
          text: '',
          timestamp: new Date(),
        }]);

        const controller = streamRAGMessage(
          userMsg.text,
          (chunk) => {
            setMessages(prev => prev.map(m =>
              m.id === botMsgId ? { ...m, text: m.text + chunk } : m
            ));
          },
          (sources) => {
            // Check for confusion every 5 messages
            const recentMsgs = [...messages, userMsg].slice(-5).map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.text,
            }));
            detectConfusion('current_user', recentMsgs).then(result => {
              if (result.confused && result.action) {
                setConfusionAction(result.action);
              }
            }).catch(() => {});
          },
          { subject: activeLesson?.subject },
        );
      }
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [input, attachedImage, isLoading, language, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
      // Simulation of voice recording
      if (!isRecording) {
          setIsRecording(true);
          setTimeout(() => {
              setIsRecording(false);
              setInput(language === 'ar' ? 'اشرح لي قانون بقاء الطاقة' : 'Explain the law of conservation of energy');
          }, 2000);
      } else {
          setIsRecording(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-brand-50 p-4 border-b border-brand-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center shadow-md relative">
          <Bot className="text-white w-6 h-6" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            {t('chatTitle')}
            <span className="bg-gradient-to-r from-brand-500 to-accent-purple text-transparent bg-clip-text text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 border border-brand-200 px-1.5 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3 text-brand-500" /> AI
            </span>
          </h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-brand-100' : 'bg-white border border-gray-200'}`}>
                {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-brand-600" /> : <Bot className="w-4 h-4 text-brand-500" />}
              </div>
              
              <div
                className={`flex flex-col gap-2 p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tl-none shadow-md shadow-brand-200'
                    : 'bg-white text-gray-700 border border-gray-100 rounded-tr-none shadow-sm'
                }`}
              >
                {msg.image && (
                    <img src={`data:image/jpeg;base64,${msg.image}`} alt="uploaded" className="max-w-full rounded-lg mb-2 border border-white/20" />
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-tr-none shadow-sm border border-gray-100 flex items-center gap-2">
               <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
               <span className="text-xs text-gray-400">{t('typing')}</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Confusion Detection Banner */}
      {confusionAction && (
        <div className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                {language === 'ar' ? confusionAction.title_ar : confusionAction.title_en}
              </p>
              <p className="text-xs text-amber-600">
                {language === 'ar' ? confusionAction.reason_ar : confusionAction.reason_en}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfusionAction(null)}
              className="text-xs text-amber-500 hover:text-amber-700"
            >✕</button>
            <button
              onClick={() => {
                // TODO: Navigate to the suggested action
                setConfusionAction(null);
              }}
              className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-amber-600"
            >
              {language === 'ar' ? confusionAction.button_label_ar : confusionAction.button_label_en}
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        {attachedImage && (
            <div className="mb-2 flex items-center gap-2 bg-gray-50 p-2 rounded-lg w-fit border border-gray-200">
                <span className="text-xs text-gray-500">Image attached</span>
                <button onClick={() => setAttachedImage(null)} className="text-red-500 hover:bg-red-50 rounded-full p-1"><X className="w-3 h-3"/></button>
            </div>
        )}
        <div className="relative flex items-center gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-full transition-colors ${attachedImage ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                title={t('uploadImage')}
            >
                <ImageIcon className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={activeLesson ? `${t('askAboutLesson', { title: activeLesson.title })}` : t('chatPlaceholder')}
                    className="w-full bg-gray-50 text-gray-800 border-2 border-gray-100 rounded-xl py-3 px-4 pe-10 focus:outline-none focus:border-brand-300 focus:bg-white transition-all placeholder:text-gray-400"
                    disabled={isLoading}
                />
                 <button 
                    onClick={toggleRecording}
                    className={`absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-brand-500'}`}
                 >
                    <Mic className="w-4 h-4" />
                </button>
            </div>

            <button
                onClick={handleSend}
                disabled={(!input.trim() && !attachedImage) || isLoading}
                className="p-3 bg-brand-500 text-white rounded-full hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 transition-colors shadow-sm"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:rotate-180 ltr:rotate-0" />}
            </button>
        </div>
        
        {activeLesson && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
             <button 
                onClick={() => setInput(t('explainSimply'))}
                className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors"
             >
               {t('explainSimply')}
             </button>
             <button 
                onClick={() => setInput(t('realExample'))}
                className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors"
             >
               {t('realExample')}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;
