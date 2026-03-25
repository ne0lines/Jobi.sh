import { NextRequest, NextResponse } from "next/server";

import type { CreateJobInput, Job } from "@/app/types";
import { getApplicationsForUser, getNextJobId, readDbForUser, writeDb } from "@/server/db";
import { getUserIdFromRequest } from "@/server/auth-session";

type JobsResponse = {
  applications: Job[];
};

function extractExternalJobId(value: string): string | null {
  const match = /(\d{6,})/.exec(value);
  return match?.[1] ?? null;
}

export async function GET(req: NextRequest): Promise<NextResponse<JobsResponse | { error: string }>> {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 400 });
  }

  const res = await readDbForUser(userId);

  return NextResponse.json({ applications: getApplicationsForUser(res.applications, userId) });
}

export async function POST(req: NextRequest): Promise<NextResponse<Job | { error: string }>> {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 400 });
    }

    const payload = (await req.json()) as CreateJobInput;

    if (!payload.title || !payload.company) {
      return NextResponse.json(
        { error: "Jobbtitel och företag måste anges." },
        { status: 400 },
      );
    }

    const db = await readDbForUser(userId);
    const userApplications = getApplicationsForUser(db.applications, userId);
    const externalJobId = extractExternalJobId(payload.jobUrl);
    const nextId = externalJobId ?? getNextJobId(userApplications);

    if (userApplications.some((application) => application.id === nextId)) {
      return NextResponse.json(
        { error: "Den här annonsen finns redan sparad." },
        { status: 409 },
      );
    }

    const newJob: Job = {
      ...payload,
      id: nextId,
      userId,
    };

    await writeDb({
      ...db,
      applications: [...db.applications, newJob],
    });

    return NextResponse.json(newJob, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kunde inte spara jobbet." }, { status: 500 });
  }
}
