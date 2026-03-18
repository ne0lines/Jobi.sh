export enum JobStatus {
  SAVED = "saved",
  APPLIED = "applied",
  IN_PROCESS = "in process",
  INTERVIEW = "interview",
  OFFER = "offer",
  CLOSED = "closed",
}

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  workload: string;
  jobUrl: string;
  contactPerson: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  timeline: Array<{
    date: string;
    event: string;
  }>;
  status: JobStatus;
};

export type Db = {
  applications: Job[];
};
