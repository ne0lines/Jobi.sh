export const appLocales = ["sv", "en", "uk", "ar"] as const;

export type AppLocale = (typeof appLocales)[number];

export const defaultLocale: AppLocale = "sv";

export function isAppLocale(locale: string): locale is AppLocale {
  return appLocales.includes(locale as AppLocale);
}