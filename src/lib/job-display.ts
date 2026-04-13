/**
 * Translates stored Swedish workload/employment-type values for display.
 * The database always stores these in Swedish (matching Arbetsförmedlingen).
 * When locale is "en" we map them to English equivalents; unknown values fall
 * back to the stored string unchanged.
 */

const swedishMonthMap: Record<string, number> = {
  jan: 0, januari: 0, feb: 1, februari: 1, mar: 2, mars: 2,
  apr: 3, april: 3, maj: 4, jun: 5, juni: 5, jul: 6, juli: 6,
  aug: 7, augusti: 7, sep: 8, sept: 8, september: 8,
  okt: 9, oktober: 9, nov: 10, november: 10, dec: 11, december: 11,
};

function parseSwedishDate(value: string): Date | null {
  const match = /^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/.exec(value.trim().toLowerCase());
  if (!match) return null;
  const month = swedishMonthMap[match[2].replace(".", "")];
  if (month === undefined) return null;
  return new Date(Number(match[3]), month, Number(match[1]));
}

const localeTagMap: Record<string, string> = { en: "en-US", uk: "uk-UA", sv: "sv-SE" };

export function formatStoredDate(value: string, locale: string): string {
  const parsed = parseSwedishDate(value);
  if (!parsed) return value;
  return new Intl.DateTimeFormat(localeTagMap[locale] ?? "sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

const timelineEventTranslations: Record<string, Record<string, string>> = {
  en: {
    "jobbet sparat": "Job saved",
    "jobbet skapat": "Job created",
    "ansökan skickad": "Application sent",
    "sista ansökningsdag": "Application deadline",
  },
  uk: {
    "jobbet sparat": "Роботу збережено",
    "jobbet skapat": "Роботу створено",
    "ansökan skickad": "Заявку надіслано",
    "sista ansökningsdag": "Кінцевий термін подачі",
  },
};

export function displayTimelineEvent(event: string, locale: string): string {
  const map = timelineEventTranslations[locale];
  if (!map) return event;
  return map[event.toLowerCase()] ?? event;
}

const workloadTranslations: Record<string, Record<string, string>> = {
  en: { Heltid: "Full-time", Deltid: "Part-time" },
  uk: { Heltid: "Повна зайнятість", Deltid: "Часткова зайнятість" },
};

const employmentTypeTranslations: Record<string, Record<string, string>> = {
  en: { Tillsvidare: "Permanent", Visstid: "Temporary", Provanställning: "Probationary", Konsult: "Consultant" },
  uk: { Tillsvidare: "Безстрокова", Visstid: "Строкова", Provanställning: "Випробувальна", Konsult: "Консультант" },
};

export function displayWorkload(value: string, locale: string): string {
  return workloadTranslations[locale]?.[value] ?? value;
}

export function displayEmploymentType(value: string, locale: string): string {
  return employmentTypeTranslations[locale]?.[value] ?? value;
}
