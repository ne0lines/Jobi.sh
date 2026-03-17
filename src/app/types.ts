export type Job = {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  workload: string;
  jobUrl: string;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  timeline: Array<{
    date: string;
    event: string;
  }>;
};