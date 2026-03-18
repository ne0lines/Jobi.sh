import { Job } from '../types';

// Base URL points to the server only
const API_BASE = 'http://localhost:3001';

/** GET all jobs */
export async function getJobs(): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/applications`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json() as Promise<Job[]>;
}

/** GET single job by ID */
export async function getJob(id: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/applications/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch job ${id}`);
  return res.json() as Promise<Job>;
}

/** CREATE a new job */
export async function createJob(job: Omit<Job, 'id'>): Promise<Job> {
  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json() as Promise<Job>;
}

/** UPDATE an existing job */
export async function updateJob(id: string, job: Partial<Job>): Promise<Job> {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  });
  if (!res.ok) throw new Error(`Failed to update job ${id}`);
  return res.json() as Promise<Job>;
}

/** DELETE a job */
export async function deleteJob(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete job ${id}`);
}
