import { Job, JobStatus } from "@/app/types";

export type TodoItemKind = "apply" | "deadline" | "followUp" | "checkIn" | "decision";

export type TodoItemState = "overdue" | "today" | "soon" | "upcoming";

export type TodoItem = {
  dueAt: number;
  dueLabel: string;
  id: string;
  jobId: string;
  kind: TodoItemKind;
  openedAt: number;
  state: TodoItemState;
  status: JobStatus;
  text: string;
  title: string;
};

export type HeroHighlight = {
  value: string;
  label: string;
};

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

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const FOLLOW_UP_LOOKAHEAD_DAYS = 4;
const OFFER_LOOKAHEAD_DAYS = 3;
const TODO_STATE_ORDER: Record<TodoItemState, number> = {
  overdue: 0,
  today: 1,
  soon: 2,
  upcoming: 3,
};

function parseSwedishDate(value: string): Date | null {
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

function formatDueDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
  }).format(date);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysUntil(dueDate: Date, now: Date): number {
  return Math.round((startOfDay(dueDate).getTime() - startOfDay(now).getTime()) / DAY_IN_MS);
}

function getTodoState(dueDate: Date, now: Date): TodoItemState {
  const daysUntil = getDaysUntil(dueDate, now);

  if (daysUntil < 0) {
    return "overdue";
  }

  if (daysUntil === 0) {
    return "today";
  }

  if (daysUntil <= 3) {
    return "soon";
  }

  return "upcoming";
}

function formatTodoDueLabel(dueDate: Date, now: Date): string {
  const daysUntil = getDaysUntil(dueDate, now);

  if (daysUntil < 0) {
    return `Skulle ha gjorts senast ${formatDueDate(dueDate)}`;
  }

  if (daysUntil === 0) {
    return "Idag";
  }

  if (daysUntil === 1) {
    return "Imorgon";
  }

  return `Senast ${formatDueDate(dueDate)}`;
}

function findTimelineDate(job: Job, matcher: (event: string) => boolean): Date | null {
  const match = [...job.timeline]
    .reverse()
    .find((item) => matcher(item.event.toLowerCase()));

  return match ? parseSwedishDate(match.date) : null;
}

function getSavedDate(job: Job): Date | null {
  return findTimelineDate(job, (event) => event.includes("sparat"));
}

function getLatestTimelineDate(job: Job): Date | null {
  for (const item of [...job.timeline].reverse()) {
    const parsedDate = parseSwedishDate(item.date);

    if (parsedDate) {
      return parsedDate;
    }
  }

  return null;
}

function getAppliedDate(job: Job): Date | null {
  return findTimelineDate(job, (event) => event.includes("ansökan skickad"));
}

function getDeadlineDate(job: Job): Date | null {
  return findTimelineDate(job, (event) => event.includes("sista ansökningsdag"));
}

function getInProcessDate(job: Job): Date | null {
  return findTimelineDate(job, (event) => event.includes("pågår"));
}

function getInterviewDate(job: Job): Date | null {
  const interviewDate = findTimelineDate(job, (event) => event.includes("intervju"));

  if (interviewDate) {
    return interviewDate;
  }

  return getAppliedDate(job);
}

function getOfferDate(job: Job): Date | null {
  return findTimelineDate(job, (event) => event.includes("erbjudande"));
}

function getJobReference(job: Job): string {
  return job.company ? `${job.title} hos ${job.company}` : job.title;
}

function getSoonestDate(firstDate: Date | null, secondDate: Date | null): Date | null {
  if (firstDate && secondDate) {
    return new Date(Math.min(firstDate.getTime(), secondDate.getTime()));
  }

  return firstDate ?? secondDate;
}

function createTodoItem({
  dueDate,
  idSuffix,
  job,
  kind,
  now,
  openedDate,
  text,
  title,
}: {
  dueDate: Date;
  idSuffix: string;
  job: Job;
  kind: TodoItemKind;
  now: Date;
  openedDate?: Date;
  text: string;
  title: string;
}): TodoItem {
  return {
    dueAt: dueDate.getTime(),
    dueLabel: formatTodoDueLabel(dueDate, now),
    id: `${job.id}-${idSuffix}`,
    jobId: job.id,
    kind,
    openedAt: startOfDay(openedDate ?? dueDate).getTime(),
    state: getTodoState(dueDate, now),
    status: job.status,
    text,
    title,
  };
}

function buildSavedTodoItem(job: Job, now: Date): TodoItem | null {
  const jobReference = getJobReference(job);
  const savedDate = getSavedDate(job) ?? getLatestTimelineDate(job);
  const deadlineDate = getDeadlineDate(job);

  if (!savedDate && !deadlineDate) {
    return null;
  }

  const savedFollowUpDate = savedDate ? addDays(savedDate, 3) : null;
  const dueDate = getSoonestDate(deadlineDate, savedFollowUpDate);

  if (!dueDate) {
    return null;
  }

  const deadlinePassed = deadlineDate ? getDaysUntil(deadlineDate, now) < 0 : false;
  const usesDeadline = deadlineDate?.getTime() === dueDate.getTime();

  let title = "Bestäm om du ska ansöka";
  let text = `Du sparade ${jobReference}. Ta nästa steg och bestäm om du ska ansöka senast ${formatDueDate(dueDate)}.`;

  if (deadlinePassed) {
    title = "Ansökningsdag passerad";
    text = `Sista ansökningsdag för ${jobReference} var ${formatDueDate(dueDate)}. Ansök direkt om annonsen fortfarande är öppen eller avsluta jobbet.`;
  } else if (usesDeadline) {
    title = "Sista ansökningsdag närmar sig";
    text = `Du har sparat ${jobReference}. Skicka ansökan senast ${formatDueDate(dueDate)} om jobbet fortfarande är relevant.`;
  }

  return createTodoItem({
    dueDate,
    idSuffix: usesDeadline ? "saved-deadline" : "saved-apply",
    job,
    kind: usesDeadline ? "deadline" : "apply",
    now,
    openedDate: savedDate ?? getLatestTimelineDate(job) ?? deadlineDate ?? dueDate,
    text,
    title,
  });
}

function buildAppliedTodoItem(job: Job, now: Date): TodoItem | null {
  const appliedDate = getAppliedDate(job);

  if (!appliedDate) {
    return null;
  }

  const jobReference = getJobReference(job);
  const followUpDate = addDays(appliedDate, 14);
  const daysUntilFollowUp = getDaysUntil(followUpDate, now);

  if (daysUntilFollowUp > FOLLOW_UP_LOOKAHEAD_DAYS) {
    return null;
  }

  const title = daysUntilFollowUp < 0 ? "Följ upp ansökan" : "Planera uppföljning";
  const text =
    daysUntilFollowUp < 0
      ? `Det har gått 14 dagar sedan du skickade ansökan för ${jobReference}. Skicka en uppföljning och be om status.`
      : `Om du inte fått svar om ${jobReference}, planera en uppföljning senast ${formatDueDate(followUpDate)}.`;

  return createTodoItem({
    dueDate: followUpDate,
    idSuffix: "applied-follow-up",
    job,
    kind: "followUp",
    now,
    openedDate: addDays(followUpDate, -FOLLOW_UP_LOOKAHEAD_DAYS),
    text,
    title,
  });
}

function buildInProcessTodoItem(job: Job, now: Date): TodoItem | null {
  const inProcessDate = getInProcessDate(job) ?? getAppliedDate(job);

  if (!inProcessDate) {
    return null;
  }

  const jobReference = getJobReference(job);
  const checkInDate = addDays(inProcessDate, 7);
  const daysUntilCheckIn = getDaysUntil(checkInDate, now);

  if (daysUntilCheckIn > FOLLOW_UP_LOOKAHEAD_DAYS) {
    return null;
  }

  const title = daysUntilCheckIn < 0 ? "Skicka en check-in" : "Planera nästa check-in";
  const text =
    daysUntilCheckIn < 0
      ? `Processen för ${jobReference} pågår fortfarande. Hör av dig och fråga om nästa steg.`
      : `Om du inte har hört något om ${jobReference}, följ upp processen senast ${formatDueDate(checkInDate)}.`;

  return createTodoItem({
    dueDate: checkInDate,
    idSuffix: "in-process-check-in",
    job,
    kind: "checkIn",
    now,
    openedDate: addDays(checkInDate, -FOLLOW_UP_LOOKAHEAD_DAYS),
    text,
    title,
  });
}

function buildInterviewTodoItem(job: Job, now: Date): TodoItem | null {
  const interviewDate = getInterviewDate(job);

  if (!interviewDate) {
    return null;
  }

  const jobReference = getJobReference(job);
  const contactDate = addDays(interviewDate, 7);
  const daysUntilContact = getDaysUntil(contactDate, now);

  if (daysUntilContact > FOLLOW_UP_LOOKAHEAD_DAYS) {
    return null;
  }

  const title = daysUntilContact < 0 ? "Återkoppla efter intervjun" : "Planera återkoppling";
  const text =
    daysUntilContact < 0
      ? `Det har gått en vecka sedan intervjun för ${jobReference}. Hör av dig och be om en statusuppdatering.`
      : `Om du inte hört något efter intervjun för ${jobReference}, följ upp senast ${formatDueDate(contactDate)}.`;

  return createTodoItem({
    dueDate: contactDate,
    idSuffix: "interview-follow-up",
    job,
    kind: "followUp",
    now,
    openedDate: addDays(contactDate, -FOLLOW_UP_LOOKAHEAD_DAYS),
    text,
    title,
  });
}

function buildOfferTodoItem(job: Job, now: Date): TodoItem | null {
  const offerDate = getOfferDate(job);

  if (!offerDate) {
    return null;
  }

  const jobReference = getJobReference(job);
  const decisionDate = addDays(offerDate, 3);
  const daysUntilDecision = getDaysUntil(decisionDate, now);

  if (daysUntilDecision > OFFER_LOOKAHEAD_DAYS) {
    return null;
  }

  const title = daysUntilDecision < 0 ? "Ta ställning till erbjudandet" : "Planera ditt svar";
  const text =
    daysUntilDecision < 0
      ? `Du markerade ${jobReference} som ett erbjudande. Bekräfta ditt svar eller boka in nästa steg med arbetsgivaren.`
      : `Sätt ett tydligt nästa steg för erbjudandet om ${jobReference} och återkoppla senast ${formatDueDate(decisionDate)}.`;

  return createTodoItem({
    dueDate: decisionDate,
    idSuffix: "offer-decision",
    job,
    kind: "decision",
    now,
    openedDate: addDays(decisionDate, -OFFER_LOOKAHEAD_DAYS),
    text,
    title,
  });
}

function buildTodoItemForJob(job: Job, now: Date): TodoItem | null {
  switch (job.status) {
    case JobStatus.SAVED:
      return buildSavedTodoItem(job, now);
    case JobStatus.APPLIED:
      return buildAppliedTodoItem(job, now);
    case JobStatus.IN_PROCESS:
      return buildInProcessTodoItem(job, now);
    case JobStatus.INTERVIEW:
      return buildInterviewTodoItem(job, now);
    case JobStatus.OFFER:
      return buildOfferTodoItem(job, now);
    default:
      return null;
  }
}

function sortTodoItems(firstItem: TodoItem, secondItem: TodoItem): number {
  const stateDifference = TODO_STATE_ORDER[firstItem.state] - TODO_STATE_ORDER[secondItem.state];

  if (stateDifference !== 0) {
    return stateDifference;
  }

  return firstItem.dueAt - secondItem.dueAt;
}

export function getTodoItems(jobs: readonly Job[]): TodoItem[] {
  const now = new Date();

  return jobs
    .map((job) => buildTodoItemForJob(job, now))
    .filter((item): item is TodoItem => item !== null)
    .sort(sortTodoItems);
}

export function getHeroHighlights(jobs: readonly Job[]): HeroHighlight[] {
  const savedJobs = jobs.filter((job) => job.status === JobStatus.SAVED).length;
  const applications = jobs.length;
  const inProcess = jobs.filter((job) => job.status === JobStatus.IN_PROCESS).length;
  const interviews = jobs.filter((job) => job.status === JobStatus.INTERVIEW).length;

  return [
    { value: String(savedJobs), label: "sparade" },
    { value: String(applications), label: "ansökningar" },
    { value: String(inProcess), label: "pågår" },
    { value: String(interviews), label: "intervjuer" },
  ];
}