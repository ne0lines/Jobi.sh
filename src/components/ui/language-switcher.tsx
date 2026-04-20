"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const buttonClassName =
    "rounded-xl px-2 py-1.5 text-center text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950";

  function switchLocale(nextLocale: string) {
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <fieldset className="flex w-full items-center justify-evenly rounded-2xl border border-app-stroke bg-app-surface p-1">
      <legend className="sr-only">{t("label")}</legend>
      <button
        type="button"
        onClick={() => switchLocale("sv")}
        aria-pressed={locale === "sv"}
        className={`${buttonClassName} ${
          locale === "sv"
            ? "bg-white text-app-ink shadow-sm dark:bg-white/10 dark:text-white"
            : "text-app-muted hover:text-app-ink dark:hover:text-white"
        }`}
      >
        {t("sv")}
      </button>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        aria-pressed={locale === "en"}
        className={`${buttonClassName} ${
          locale === "en"
            ? "bg-white text-app-ink shadow-sm dark:bg-white/10 dark:text-white"
            : "text-app-muted hover:text-app-ink dark:hover:text-white"
        }`}
      >
        {t("en")}
      </button>
      <button
        type="button"
        onClick={() => switchLocale("uk")}
        aria-pressed={locale === "uk"}
        className={`${buttonClassName} ${
          locale === "uk"
            ? "bg-white text-app-ink shadow-sm dark:bg-white/10 dark:text-white"
            : "text-app-muted hover:text-app-ink dark:hover:text-white"
        }`}
      >
        {t("uk")}
      </button>
      <button
        type="button"
        onClick={() => switchLocale("ar")}
        aria-pressed={locale === "ar"}
        className={`${buttonClassName} ${
          locale === "ar"
            ? "bg-white text-app-ink shadow-sm dark:bg-white/10 dark:text-white"
            : "text-app-muted hover:text-app-ink dark:hover:text-white"
        }`}
      >
        {t("ar")}
      </button>
    </fieldset>
  );
}
