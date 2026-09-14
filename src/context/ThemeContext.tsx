import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, Language } from '../types';
import { translations, Translations } from '../lib/i18n';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRtl: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('dzprint_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Language state (default Arabic as requested)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dzprint_lang');
    if (saved === 'ar' || saved === 'fr' || saved === 'en') return saved;
    return 'ar';
  });

  const isRtl = language === 'ar';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('dzprint_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    localStorage.setItem('dzprint_lang', language);

    // Font styling according to language
    if (language === 'ar') {
      root.style.fontFamily = "'Cairo', sans-serif";
    } else {
      root.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
    }
  }, [language, isRtl]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = translations[language];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, language, setLanguage, t, isRtl }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
