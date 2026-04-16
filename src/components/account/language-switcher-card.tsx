"use client";

import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "next-intl";

export function LanguageSwitcherCard() {
  const t = useTranslations("language");

  return (
    <article className="app-card">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-app-muted">
        {t("label")}
      </p>
      <LanguageSwitcher />
    </article>
  );
}
