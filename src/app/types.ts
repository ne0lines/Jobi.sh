export enum JobStatus {
  SAVED = "saved",
  APPLIED = "applied",
  IN_PROCESS = "in process",
  INTERVIEW = "interview",
  OFFER = "offer",
  CLOSED = "closed",
}

export type JobTimelineItem = {
  date: string;
  event: string;
};

export type JobContactPerson = {
  name: string;
  role: string;
  email: string;
  phone: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  workload: string;
  jobUrl: string;
  contactPerson: JobContactPerson;
  timeline: JobTimelineItem[];
  notes?: string;
  status: JobStatus;
  followUpReminderSentAt?: string | null;
};

export type CreateJobInput = Omit<Job, "id">;

export type UpdateJobInput = Partial<CreateJobInput>;

export type JobFormState = {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  workload: string;
  jobUrl: string;
  status: JobStatus;
  applicationDate: string;
  deadline: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

export type AutofillPayload = {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  workload: string;
  applicationDate: string;
  deadline: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  status: JobStatus;
};

export type PushSubscriptionRecord = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    auth: string;
    p256dh: string;
  };
  createdAt: string;
  userAgent?: string;
};

export type PushNotificationPayload = {
  body: string;
  icon?: string;
  jobId?: string;
  tag?: string;
  title: string;
  url?: string;
};

export type Db = {
  applications: Job[];
  pushSubscriptions: PushSubscriptionRecord[];
};
