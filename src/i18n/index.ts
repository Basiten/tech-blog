export {
  supportedLanguages,
  defaultLanguage,
  languageNames,
  languageFlags,
  getLanguageFromPath,
  localizePath,
  removeLanguagePrefix,
  getBasePath,
  type SupportedLanguage
} from './config';

export {
  getTranslations,
  t,
  type TranslationKey
} from './utils';

export {
  useTranslations
} from './integration';
