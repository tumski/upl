export const locales = ['en', 'de', 'nl', 'da', 'pl'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = 'en' as const;

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Map of locale codes to their full names
export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  nl: 'Nederlands',
  da: 'Dansk',
  pl: 'Polski',
} as const;
