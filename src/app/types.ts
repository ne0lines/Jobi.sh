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
};

export type CreateJobInput = Omit<Job, "id" | "userId">;

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

export type Db = {
  applications: Job[];
};

