// Fix: Added full content for localization.ts
import type { Language } from './types';

type TranslationKeys = {
  [key: string]: string;
};

type Translations = {
  [lang in Language]: TranslationKeys;
};

export const translations: Translations = {
  en: {
    dashboard: 'Dashboard',
    learning_zone: 'Learning Zone',
    exam_mode: 'Exam Mode',
    logout: 'Logout',
    points: 'Points',
    level: 'Level',
    student: 'Student',
    teacher: 'Teacher',
    parent: 'Parent',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    learning_zone: 'सीखने का क्षेत्र',
    exam_mode: 'परीक्षा मोड',
    logout: 'लॉग आउट',
    points: 'अंक',
    level: 'स्तर',
    student: 'छात्र',
    teacher: 'शिक्षक',
    parent: 'अभिभावक',
  },
};
