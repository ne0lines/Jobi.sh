"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();

  function switchLocale(nextLocale: string) {
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex w-full items-center gap-1 rounded-2xl border border-app-stroke bg-app-surface p-1">
      <button
        type="button"
        onClick={() => switchLocale("sv")}
        className={`rounded-xl flex-1 py-1.5 text-xs font-medium text-center transition ${
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
        className={`rounded-xl flex-1 py-1.5 text-xs font-medium text-center transition ${
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
        className={`rounded-xl flex-1 py-1.5 text-xs font-medium text-center transition ${
          locale === "uk"
            ? "bg-white text-app-ink shadow-sm dark:bg-white/10 dark:text-white"
            : "text-app-muted hover:text-app-ink dark:hover:text-white"
        }`}
      >
        {t("uk")}
      </button>
    </div>
  );
}
