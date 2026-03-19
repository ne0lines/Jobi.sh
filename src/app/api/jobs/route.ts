import { NextRequest, NextResponse } from "next/server";

import type { CreateJobInput, Db, Job } from "@/app/types";
import { getNextJobId, readDb, writeDb } from "@/server/db";

function extractExternalJobId(value: string): string | null {
  const match = /(\d{6,})/.exec(value);
  return match?.[1] ?? null;
}

export async function GET(req: NextRequest): Promise<NextResponse<Db>> {
  const res = await readDb();

  return NextResponse.json({ applications: res.applications });
}

export async function POST(req: NextRequest): Promise<NextResponse<Job | { error: string }>> {
  try {
    const payload = (await req.json()) as CreateJobInput;

    if (!payload.title || !payload.company) {
      return NextResponse.json(
        { error: "Jobbtitel och företag måste anges." },
        { status: 400 },
      );
    }

    const db = await readDb();
    const externalJobId = extractExternalJobId(payload.jobUrl);
    const nextId = externalJobId ?? getNextJobId(db.applications);

    if (db.applications.some((application) => application.id === nextId)) {
      return NextResponse.json(
        { error: "Den här annonsen finns redan sparad." },
        { status: 409 },
      );
    }

    const newJob: Job = {
      ...payload,
      id: nextId,
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
