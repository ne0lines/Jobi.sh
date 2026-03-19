import { promises as fs } from "node:fs";
import path from "node:path";

import type { Db, Job } from "@/app/types";

type DbFile = Db & {
  $schema?: string;
};

const dbFilePath = path.join(process.cwd(), "src/server/db.json");

export async function readDb(): Promise<DbFile> {
  const raw = await fs.readFile(dbFilePath, "utf8");
  return JSON.parse(raw) as DbFile;
}

export async function writeDb(data: DbFile): Promise<void> {
  await fs.writeFile(dbFilePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readDbForUser(userId: string): Promise<DbFile> {
  const db = await readDb();
  let hasChanges = false;

  const nextApplications = db.applications.map((application) => {
    if (application.userId) {
      return application;
    }

    hasChanges = true;

    return {
      ...application,
      userId,
    };
  });

  if (!hasChanges) {
    return db;
  }

  const nextDb = {
    ...db,
    applications: nextApplications,
  };

  await writeDb(nextDb);

  return nextDb;
}

export function getApplicationsForUser(applications: Job[], userId: string): Job[] {
  return applications.filter((application) => application.userId === userId);
}

export function getNextJobId(applications: Job[]): string {
  const maxId = applications.reduce((currentMax, application) => {
    const parsedId = Number(application.id);

    if (!Number.isFinite(parsedId)) {
      return currentMax;
    }

    return Math.max(currentMax, parsedId);
  }, 0);

  return String(maxId + 1);
}