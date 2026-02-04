import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh.json';
import frTranslations from './locales/fr.json';
import type { SupportedLanguage } from './config';

const translations = {
  en: enTranslations,
  zh: zhTranslations,
  fr: frTranslations
} as const;

export type TranslationKey = typeof translations.en;

export type { SupportedLanguage };

export function getTranslations(lang: SupportedLanguage): TranslationKey {
  return translations[lang] || translations.en;
}

export function t(translations: TranslationKey, key: string): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}
