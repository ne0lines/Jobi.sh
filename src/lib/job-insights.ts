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

type TodoTranslationValues = Record<string, number | string>;
type TodoTranslator = (key: string, values?: TodoTranslationValues) => string;

type TodoTranslationKey =
  | "todoJobReferenceWithCompany"
  | "todoDueOverdue"
  | "todoDueToday"
  | "todoDueTomorrow"
  | "todoDueBy"
  | "todoSavedTitle"
  | "todoSavedText"
  | "todoSavedDeadlinePassedTitle"
  | "todoSavedDeadlinePassedText"
  | "todoSavedDeadlineSoonTitle"
  | "todoSavedDeadlineSoonText"
  | "todoAppliedOverdueTitle"
  | "todoAppliedOverdueText"
  | "todoAppliedUpcomingTitle"
  | "todoAppliedUpcomingText"
  | "todoInProcessOverdueTitle"
  | "todoInProcessOverdueText"
  | "todoInProcessUpcomingTitle"
  | "todoInProcessUpcomingText"
  | "todoInterviewOverdueTitle"
  | "todoInterviewOverdueText"
  | "todoInterviewUpcomingTitle"
  | "todoInterviewUpcomingText"
  | "todoOfferOverdueTitle"
  | "todoOfferOverdueText"
  | "todoOfferUpcomingTitle"
  | "todoOfferUpcomingText";

type TodoCopyOptions = {
  locale?: string;
  t?: TodoTranslator;
};

const DEFAULT_TODO_TRANSLATIONS: Record<TodoTranslationKey, string> = {
  todoJobReferenceWithCompany: "{title} hos {company}",
  todoDueOverdue: "Skulle ha gjorts senast {date}",
  todoDueToday: "Idag",
  todoDueTomorrow: "Imorgon",
  todoDueBy: "Senast {date}",
  todoSavedTitle: "Bestäm om du ska ansöka",
  todoSavedText: "Du sparade {jobReference}. Ta nästa steg och bestäm om du ska ansöka senast {date}.",
  todoSavedDeadlinePassedTitle: "Ansökningsdag passerad",
  todoSavedDeadlinePassedText: "Sista ansökningsdag för {jobReference} var {date}. Ansök direkt om annonsen fortfarande är öppen eller avsluta jobbet.",
  todoSavedDeadlineSoonTitle: "Sista ansökningsdag närmar sig",
  todoSavedDeadlineSoonText: "Du har sparat {jobReference}. Skicka ansökan senast {date} om jobbet fortfarande är relevant.",
  todoAppliedOverdueTitle: "Följ upp ansökan",
  todoAppliedOverdueText: "Det har gått 14 dagar sedan du skickade ansökan för {jobReference}. Skicka en uppföljning och be om status.",
  todoAppliedUpcomingTitle: "Planera uppföljning",
  todoAppliedUpcomingText: "Om du inte fått svar om {jobReference}, planera en uppföljning senast {date}.",
  todoInProcessOverdueTitle: "Skicka en check-in",
  todoInProcessOverdueText: "Processen för {jobReference} pågår fortfarande. Hör av dig och fråga om nästa steg.",
  todoInProcessUpcomingTitle: "Planera nästa check-in",
  todoInProcessUpcomingText: "Om du inte har hört något om {jobReference}, följ upp processen senast {date}.",
  todoInterviewOverdueTitle: "Återkoppla efter intervjun",
  todoInterviewOverdueText: "Det har gått en vecka sedan intervjun för {jobReference}. Hör av dig och be om en statusuppdatering.",
  todoInterviewUpcomingTitle: "Planera återkoppling",
  todoInterviewUpcomingText: "Om du inte hört något efter intervjun för {jobReference}, följ upp senast {date}.",
  todoOfferOverdueTitle: "Ta ställning till erbjudandet",
  todoOfferOverdueText: "Du markerade {jobReference} som ett erbjudande. Bekräfta ditt svar eller boka in nästa steg med arbetsgivaren.",
  todoOfferUpcomingTitle: "Planera ditt svar",
  todoOfferUpcomingText: "Sätt ett tydligt nästa steg för erbjudandet om {jobReference} och återkoppla senast {date}.",
};

function formatTodoTemplate(template: string, values?: TodoTranslationValues): string {
  if (!values) {
    return template;
  }

  return template.replaceAll(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];

    return value === undefined ? `{${key}}` : String(value);
  });
}

function translateTodo(
  key: TodoTranslationKey,
  options: TodoCopyOptions,
  values?: TodoTranslationValues,
): string {
  if (options.t) {
    return options.t(key, values);
  }

  return formatTodoTemplate(DEFAULT_TODO_TRANSLATIONS[key], values);
}

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

function formatDueDate(date: Date, locale = "sv-SE"): string {
  return new Intl.DateTimeFormat(locale, {
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

function formatTodoDueLabel(dueDate: Date, now: Date, options: TodoCopyOptions): string {
  const daysUntil = getDaysUntil(dueDate, now);
  const dateLabel = formatDueDate(dueDate, options.locale ?? "sv-SE");

  if (daysUntil < 0) {
    return translateTodo("todoDueOverdue", options, { date: dateLabel });
  }

  if (daysUntil === 0) {
    return translateTodo("todoDueToday", options);
  }

  if (daysUntil === 1) {
    return translateTodo("todoDueTomorrow", options);
  }

  return translateTodo("todoDueBy", options, { date: dateLabel });
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

function getJobReference(job: Job, options: TodoCopyOptions): string {
  return job.company
    ? translateTodo("todoJobReferenceWithCompany", options, {
        company: job.company,
        title: job.title,
      })
    : job.title;
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
  options,
  openedDate,
  text,
  title,
}: {
  dueDate: Date;
  idSuffix: string;
  job: Job;
  kind: TodoItemKind;
  now: Date;
  options: TodoCopyOptions;
  openedDate?: Date;
  text: string;
  title: string;
}): TodoItem {
  return {
    dueAt: dueDate.getTime(),
    dueLabel: formatTodoDueLabel(dueDate, now, options),
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

function buildSavedTodoItem(job: Job, now: Date, options: TodoCopyOptions): TodoItem | null {
  const jobReference = getJobReference(job, options);
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
  const dateLabel = formatDueDate(dueDate, options.locale ?? "sv-SE");

  let title = translateTodo("todoSavedTitle", options);
  let text = translateTodo("todoSavedText", options, {
    date: dateLabel,
    jobReference,
  });

  if (deadlinePassed) {
    title = translateTodo("todoSavedDeadlinePassedTitle", options);
    text = translateTodo("todoSavedDeadlinePassedText", options, {
      date: dateLabel,
      jobReference,
    });
  } else if (usesDeadline) {
    title = translateTodo("todoSavedDeadlineSoonTitle", options);
    text = translateTodo("todoSavedDeadlineSoonText", options, {
      date: dateLabel,
      jobReference,
    });
  }

  return createTodoItem({
    dueDate,
    idSuffix: usesDeadline ? "saved-deadline" : "saved-apply",
    job,
    kind: usesDeadline ? "deadline" : "apply",
    now,
    options,
    openedDate: savedDate ?? getLatestTimelineDate(job) ?? deadlineDate ?? dueDate,
    text,
    title,
  });
}

function buildAppliedTodoItem(job: Job, now: Date, options: TodoCopyOptions): TodoItem | null {
  const appliedDate = getAppliedDate(job);

  if (!appliedDate) {
    return null;
  }

  const jobReference = getJobReference(job, options);
  const followUpDate = addDays(appliedDate, 14);
  const daysUntilFollowUp = getDaysUntil(followUpDate, now);
  const dateLabel = formatDueDate(followUpDate, options.locale ?? "sv-SE");

  if (daysUntilFollowUp > FOLLOW_UP_LOOKAHEAD_DAYS) {
    return null;
  }

  const title =
    daysUntilFollowUp < 0
      ? translateTodo("todoAppliedOverdueTitle", options)
      : translateTodo("todoAppliedUpcomingTitle", options);
  const text =
    daysUntilFollowUp < 0
      ? translateTodo("todoAppliedOverdueText", options, { jobReference })
      : translateTodo("todoAppliedUpcomingText", options, {
          date: dateLabel,
          jobReference,
        });

  return createTodoItem({
    dueDate: followUpDate,
    idSuffix: "applied-follow-up",
    job,
    kind: "followUp",
    now,
    options,
    openedDate: addDays(followUpDate, -FOLLOW_UP_LOOKAHEAD_DAYS),
    text,
    title,
  });
}

function buildInProcessTodoItem(job: Job, now: Date, options: TodoCopyOptions): TodoItem | null {
  const inProcessDate = getInProcessDate(job) ?? getAppliedDate(job);

  if (!inProcessDate) {
    return null;
  }

  const jobReference = getJobReference(job, options);
  const checkInDate = addDays(inProcessDate, 7);
  const daysUntilCheckIn = getDaysUntil(checkInDate, now);
  const dateLabel = formatDueDate(checkInDate, options.locale ?? "sv-SE");

  if (daysUntilCheckIn > FOLLOW_UP_LOOKAHEAD_DAYS) {
    return null;
  }

  const title =
    daysUntilCheckIn < 0
      ? translateTodo("todoInProcessOverdueTitle", options)
      : translateTodo("todoInProcessUpcomingTitle", options);
  const text =
    daysUntilCheckIn < 0
      ? translateTodo("todoInProcessOverdueText", options, { jobReference })
      : translateTodo("todoInProcessUpcomingText", options, {
          date: dateLabel,
          jobReference,
        });

  return createTodoItem({
    dueDate: checkInDate,
    idSuffix: "in-process-check-in",
    job,
    kind: "checkIn",
    now,
    options,
    openedDate: addDays(checkInDate, -FOLLOW_UP_LOOKAHEAD_DAYS),
    text,
    title,
  });
}

function buildInterviewTodoItem(job: Job, now: Date, options: TodoCopyOptions): TodoItem | null {
  const interviewDate = getInterviewDate(job);

  if (!interviewDate) {
    return null;
  }

  const jobReference = getJobReference(job, options);
  const contactDate = addDays(interviewDate, 7);
  const daysUntilContact = getDaysUntil(contactDate, now);
  const dateLabel = formatDueDate(contactDate, options.locale ?? "sv-SE");

  if (daysUntilContact > FOLLOW_UP_LOOKAHEAD_DAYS) {
    return null;
  }

  const title =
    daysUntilContact < 0
      ? translateTodo("todoInterviewOverdueTitle", options)
      : translateTodo("todoInterviewUpcomingTitle", options);
  const text =
    daysUntilContact < 0
      ? translateTodo("todoInterviewOverdueText", options, { jobReference })
      : translateTodo("todoInterviewUpcomingText", options, {
          date: dateLabel,
          jobReference,
        });

  return createTodoItem({
    dueDate: contactDate,
    idSuffix: "interview-follow-up",
    job,
    kind: "followUp",
    now,
    options,
    openedDate: addDays(contactDate, -FOLLOW_UP_LOOKAHEAD_DAYS),
    text,
    title,
  });
}

function buildOfferTodoItem(job: Job, now: Date, options: TodoCopyOptions): TodoItem | null {
  const offerDate = getOfferDate(job);

  if (!offerDate) {
    return null;
  }

  const jobReference = getJobReference(job, options);
  const decisionDate = addDays(offerDate, 3);
  const daysUntilDecision = getDaysUntil(decisionDate, now);
  const dateLabel = formatDueDate(decisionDate, options.locale ?? "sv-SE");

  if (daysUntilDecision > OFFER_LOOKAHEAD_DAYS) {
    return null;
  }

  const title =
    daysUntilDecision < 0
      ? translateTodo("todoOfferOverdueTitle", options)
      : translateTodo("todoOfferUpcomingTitle", options);
  const text =
    daysUntilDecision < 0
      ? translateTodo("todoOfferOverdueText", options, { jobReference })
      : translateTodo("todoOfferUpcomingText", options, {
          date: dateLabel,
          jobReference,
        });

  return createTodoItem({
    dueDate: decisionDate,
    idSuffix: "offer-decision",
    job,
    kind: "decision",
    now,
    options,
    openedDate: addDays(decisionDate, -OFFER_LOOKAHEAD_DAYS),
    text,
    title,
  });
}

function buildTodoItemForJob(job: Job, now: Date, options: TodoCopyOptions): TodoItem | null {
  switch (job.status) {
    case JobStatus.SAVED:
      return buildSavedTodoItem(job, now, options);
    case JobStatus.APPLIED:
      return buildAppliedTodoItem(job, now, options);
    case JobStatus.IN_PROCESS:
      return buildInProcessTodoItem(job, now, options);
    case JobStatus.INTERVIEW:
      return buildInterviewTodoItem(job, now, options);
    case JobStatus.OFFER:
      return buildOfferTodoItem(job, now, options);
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

export function getTodoItems(
  jobs: readonly Job[],
  options: TodoCopyOptions = {},
): TodoItem[] {
  const now = new Date();

  return jobs
    .map((job) => buildTodoItemForJob(job, now, options))
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