import { Job, JobStatus, JobTimelineItem } from "@/app/types";

const FOLLOW_UP_DELAY_DAYS = 7;

const monthMap: Record<string, number> = {
  jan: 0,
  januari: 0,
  feb: 1,
  februari: 1,
  mar: 2,
  mars: 2,
  apr: 3,
  april: 3,
  maj: 4,
  jun: 5,
  juni: 5,
  jul: 6,
  juli: 6,
  aug: 7,
  augusti: 7,
  sep: 8,
  sept: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseSwedishDate(value: string): Date | null {
  const trimmedValue = value.trim().toLowerCase();
  const match = /^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/.exec(trimmedValue);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const monthToken = match[2].replace(".", "");
  const year = Number(match[3]);
  const month = monthMap[monthToken];

  if (month === undefined) {
    return null;
  }

  return new Date(year, month, day);
}

export function getApplicationTimelineItem(job: Job): JobTimelineItem | undefined {
  return job.timeline.find((item) => item.event.toLowerCase().includes("ansökan skickad"));
}

export function getApplicationSentDate(job: Job): Date | null {
  const timelineItem = getApplicationTimelineItem(job);

  if (!timelineItem) {
    return null;
  }

  return parseSwedishDate(timelineItem.date);
}

export function getFollowUpAgeInDays(job: Job, now: Date = new Date()): number | null {
  const applicationDate = getApplicationSentDate(job);

  if (!applicationDate) {
    return null;
  }

  const diffMs = normalizeDate(now).getTime() - normalizeDate(applicationDate).getTime();
  return Math.floor(diffMs / 86400000);
}

function isReminderEligibleStatus(status: JobStatus): boolean {
  return status === JobStatus.APPLIED || status === JobStatus.IN_PROCESS;
}

export function shouldSendFollowUpReminder(job: Job, now: Date = new Date()): boolean {
  const ageInDays = getFollowUpAgeInDays(job, now);

  if (ageInDays === null) {
    return false;
  }

  return (
    isReminderEligibleStatus(job.status) &&
    ageInDays >= FOLLOW_UP_DELAY_DAYS &&
    !job.followUpReminderSentAt
  );
}

export function getDueFollowUpJobs(jobs: Job[], now: Date = new Date()): Job[] {
  return jobs.filter((job) => shouldSendFollowUpReminder(job, now));
}

export function buildFollowUpCopy(job: Job): { body: string; title: string } {
  return {
    title: `${job.company} väntar på uppföljning`,
    body: `Det har gått 7 dagar sedan du sökte ${job.title}. Följ upp idag.`,
  };
}