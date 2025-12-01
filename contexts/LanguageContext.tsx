import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Direction, TranslationKey } from '../types';
import { TRANSLATIONS } from '../constants';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'manhaji-language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return 'ar';
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'ar';
  };

  const initialLanguage = getInitialLanguage();
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [direction, setDirection] = useState<Direction>(initialLanguage === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    const dir: Direction = language === 'ar' ? 'rtl' : 'ltr';
    setDirection(dir);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = TRANSLATIONS[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};