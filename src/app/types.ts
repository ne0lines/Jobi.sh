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
  userId: string;
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
  archivedAt: string | null;
};

export type CreateJobInput = Omit<Job, "id" | "userId" | "archivedAt">;

export type UpdateJobInput = Partial<CreateJobInput> & {
  archivedAt?: string | null;
};

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

export type PushSubscriptionInput = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    auth: string;
    p256dh: string;
  };
};

export type PushNotificationSettings = {
  subscriptionCount: number;
  tipNotificationsEnabled: boolean;
  todoNotificationsEnabled: boolean;
};

export type UpdatePushNotificationSettingsInput = {
  tipNotificationsEnabled: boolean;
  todoNotificationsEnabled: boolean;
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

export type Db = {
  applications: Job[];
};

export type UserOnboardingFlags = {
  onboardingDismissed: boolean;
  onboardingPipelineExplored: boolean;
  onboardingReportViewed: boolean;
};

