import jobSearchTipsData from "@/data/job-search-tips.json";

export type JobSearchTip = {
  body: string;
  id: string;
  title: string;
  url?: string;
};

const jobSearchTips = jobSearchTipsData as JobSearchTip[];

function getDatePart(
  date: Date,
  timeZone: string,
  partType: "day" | "month" | "year",
): string {
  const part = new Intl.DateTimeFormat("sv-SE", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  })
    .formatToParts(date)
    .find((value) => value.type === partType)?.value;

  if (!part) {
    throw new Error(`Kunde inte läsa ut datumdelen ${partType} för jobbsökartips.`);
  }

  return part;
}

function hashString(value: string): number {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 2_147_483_647;
  }

  return hash;
}

export function getJobSearchTipDayKey(date: Date, timeZone: string): string {
  const year = getDatePart(date, timeZone, "year");
  const month = getDatePart(date, timeZone, "month");
  const day = getDatePart(date, timeZone, "day");

  return `${year}-${month}-${day}`;
}

export function getDailyJobSearchTip(
  date: Date,
  timeZone: string,
): { dayKey: string; notificationKey: string; tip: JobSearchTip } {
  if (jobSearchTips.length === 0) {
    throw new Error("Det finns inga jobbsökartips att skicka.");
  }

  const dayKey = getJobSearchTipDayKey(date, timeZone);
  const tip = jobSearchTips[hashString(dayKey) % jobSearchTips.length];

  return {
    dayKey,
    notificationKey: `daily-tip:${dayKey}:${tip.id}`,
    tip,
  };
}