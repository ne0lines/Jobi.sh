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

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  RM = "rm",
}

export enum ColorScheme {
  DARK = "dark",
  LIGHT = "light",
}

export type User = UserOnboardingFlags & {
  id: string;
  email: string;
  name: string;
  profession: string;
  role: UserRole;
  rmOrganizationId: string | null;
  complete: boolean;
  termsAcceptedAt: string | null;
  termsVersion: string | null;
  colorScheme: ColorScheme;
};

export type RmConnectionIntentResponse = {
  message: string;
  mode: "invitation_sent" | "request_sent";
};

export type RmConnectionIntentLookupResponse = {
  exists: boolean;
};

export type RmCandidateSummary = {
  advisorNames: string[];
  appliedJobs: number;
  candidateUserId: string;
  candidateEmail: string;
  candidateName: string;
  closedJobs: number;
  interviewJobs: number;
  lastJobUpdateAt: string | null;
  organizationLinkedAt: string;
  offerJobs: number;
  recentJobs: Array<{
    company: string;
    id: string;
    status: JobStatus;
    title: string;
    updatedAt: string;
  }>;
  totalJobs: number;
  viewerCanReadProfile: boolean;
  viewerConnectionId: string | null;
};

export type RmPendingRequest = {
  advisorName: string;
  candidateEmail: string;
  candidateName: string | null;
  createdAt: string;
  invitationSource: boolean;
  invitationId: string | null;
  requestId: string;
  token: string;
};

export type RmInvitationSummary = {
  canManage: boolean;
  createdAt: string;
  hasActiveConnection: boolean;
  invitationId: string;
  invitedUserId: string | null;
  invitedUserName: string | null;
  recipientEmail: string;
  registeredAt: string | null;
};

export type RmAdvisorSummary = {
  advisorName: string;
  advisorUserId: string;
  linkedUsers: number;
  pendingRequests: number;
};

export type RmPanelData = {
  advisorSummary: RmAdvisorSummary[];
  linkedCandidates: RmCandidateSummary[];
  organizationName: string | null;
  pendingInvitations: RmInvitationSummary[];
  pendingRequests: RmPendingRequest[];
  readyInvitations: RmInvitationSummary[];
  summary: {
    appliedJobs: number;
    interviewJobs: number;
    linkedUsers: number;
    offers: number;
    pendingInvitations: number;
    pendingRequests: number;
    totalJobs: number;
  };
  viewerRole: UserRole.ADMIN | UserRole.RM;
};

export type RmRequestDecision = "accept" | "decline";

export type RmRequestDecisionPageData = {
  advisorName: string;
  candidateEmail: string;
  candidateName: string | null;
  canRespond: boolean;
  organizationName: string;
  status: "accepted" | "cancelled" | "declined" | "pending";
  token: string;
  viewerState: "anonymous" | "needs-profile" | "ready" | "wrong-account";
};

export type AdminRmOrganizationSummary = {
  archivedAt: string | null;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingCountry: string;
  billingEmail: string;
  billingName: string;
  billingOrganizationNumber: string;
  billingPostalCode: string;
  billingReference: string;
  billingVatNumber: string;
  connectionRequestCount: number;
  createdAt: string;
  id: string;
  invitationCount: number;
  linkedUserCount: number;
  memberCount: number;
  name: string;
  slug: string;
  updatedAt: string;
};

export type AdminRmUserSummary = {
  complete: boolean;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  rmOrganizationId: string | null;
  rmOrganizationName: string | null;
  role: UserRole;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  profession: string;
};
