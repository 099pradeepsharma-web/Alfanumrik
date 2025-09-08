
import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../localization';
import type { Language } from '../types';

export const useLocalization = () => {
  const { language } = useAppContext();

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  const getLocalized = useCallback((obj: { [lang in Language]: string }): string => {
    return obj[language];
  }, [language]);

  return { t, getLocalized, currentLang: language };
};
