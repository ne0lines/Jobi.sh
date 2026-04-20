import type {
  CreateJobInput,
  Job,
  UpdateJobInput,
  User,
  UserOnboardingFlags,
} from "../types";
import type { ThemePreference } from "@/lib/theme";

const API_BASE = "/api/jobs";

type GetJobsOptions = {
  includeArchived?: boolean;
};

async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function buildJobsUrl(options: GetJobsOptions = {}): string {
  const searchParams = new URLSearchParams();

  if (options.includeArchived) {
    searchParams.set("includeArchived", "true");
  }

  const query = searchParams.toString();

  return query ? `${API_BASE}?${query}` : API_BASE;
}

/** GET current user profile */
export async function getUser(): Promise<User> {
  const res = await fetch("/api/user", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json() as Promise<User>;
}

/** GET all jobs */
export async function getJobs(options: GetJobsOptions = {}): Promise<Job[]> {
  const res = await fetch(buildJobsUrl(options), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch jobs");
  const data = (await res.json()) as { applications: Job[] };
  return data.applications;
}

/** GET single job by ID */
export async function getJob(id: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch job ${id}`);
  return res.json() as Promise<Job>;
}

/** CREATE a new job */
export async function createJob(job: CreateJobInput): Promise<Job> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to create job"));
  }
  return res.json() as Promise<Job>;
}

/** UPDATE an existing job */
export async function updateJob(id: string, job: UpdateJobInput): Promise<Job> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, `Failed to update job ${id}`));
  }
  return res.json() as Promise<Job>;
}

/** DELETE a job */
export async function deleteJob(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, `Failed to delete job ${id}`));
  }
}

type PatchUserInput = Partial<UserOnboardingFlags> & { colorScheme?: ThemePreference };

/** PATCH onboarding flags on the current user */
export async function patchUser(input: PatchUserInput): Promise<void> {
  const res = await fetch("/api/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to update user"));
  }
}
