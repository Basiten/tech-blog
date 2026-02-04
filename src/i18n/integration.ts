import { getTranslations, t, type SupportedLanguage } from './utils';
import type { TranslationKey } from './utils';

export function useTranslations(lang: SupportedLanguage) {
  const translations = getTranslations(lang);

  return {
    t: (key: string) => t(translations, key),
    translations
  };
}

export type { TranslationKey };

