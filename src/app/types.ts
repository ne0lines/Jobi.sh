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
};

export type Db = {
  applications: Job[];
};