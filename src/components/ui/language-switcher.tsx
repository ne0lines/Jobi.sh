"use client";

import { appLocales, type AppLocale } from "@/i18n/locales";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const buttonClassName =
    "rounded-xl px-2 py-1.5 text-center text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950";

  function switchLocale(nextLocale: AppLocale) {
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <fieldset className="flex w-full items-center justify-evenly rounded-2xl border border-app-stroke bg-app-surface p-1">
      <legend className="sr-only">{t("label")}</legend>
      {appLocales.map((supportedLocale) => (
        <button
          key={supportedLocale}
          type="button"
          onClick={() => switchLocale(supportedLocale)}
          aria-pressed={locale === supportedLocale}
          className={`${buttonClassName} ${
            locale === supportedLocale
              ? "bg-white text-app-ink shadow-sm dark:bg-white/10 dark:text-white"
              : "text-app-muted hover:text-app-ink dark:hover:text-white"
          }`}
        >
          {t(supportedLocale)}
        </button>
      ))}
    </fieldset>
  );
}
