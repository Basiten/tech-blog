export const supportedLanguages = ['en', 'zh', 'fr'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const defaultLanguage: SupportedLanguage = 'en';

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  zh: '中文',
  fr: 'Français'
};

export const languageFlags: Record<SupportedLanguage, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
  fr: '🇫🇷'
};

export function getLanguageFromPath(pathname: string): SupportedLanguage {
  const segments = pathname.split('/').filter(Boolean);
  const potentialLang = segments[0];

  if (supportedLanguages.includes(potentialLang as SupportedLanguage)) {
    return potentialLang as SupportedLanguage;
  }

  return defaultLanguage;
}

export function localizePath(pathname: string, lang: SupportedLanguage): string {
  // Remove base path if present (e.g., /tech-blog)
  const basePath = getBasePath();
  let pathWithoutBase = pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathWithoutBase = pathname.slice(basePath.length) || '/';
  }

  const segments = pathWithoutBase.split('/').filter(Boolean);

  // Remove existing language prefix if present
  if (segments.length > 0 && supportedLanguages.includes(segments[0] as SupportedLanguage)) {
    segments.shift();
  }

  // Build the localized path with base path
  if (segments.length === 0) {
    return lang === defaultLanguage ? '/' : `/${lang}/`;
  }

  const localizedPath = `/${lang}/${segments.join('/')}/`;

  // Prepend base path if needed
  if (basePath) {
    return `${basePath}${localizedPath}`;
  }

  return localizedPath;
}

export function removeLanguagePrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && supportedLanguages.includes(segments[0] as SupportedLanguage)) {
    return '/' + segments.slice(1).join('/');
  }

  return pathname;
}

export function getBasePath(): string {
  return import.meta.env.BASE_URL || '';
}
