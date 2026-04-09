import { type AutofillPayload, JobStatus } from "@/app/types";
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

type AfContact = {
  name?: string | null;
  surname?: string | null;
  position?: string | null;
  email?: string | null;
  mobileNumber?: string | null;
  phoneNumber?: string | null;
};

type AfJob = {
  title?: string | null;
  occupation?: string | null;
  company?: { name?: string | null } | null;
  workplace?: {
    city?: string | null;
    region?: string | null;
    municipality?: string | null;
    name?: string | null;
  } | null;
  employmentType?: string | null;
  workTimeExtent?: string | null;
  publishedDate?: string | null;
  lastApplicationDate?: string | null;
  description?: string | null;
  contacts?: AfContact[] | null;
};

function extractJobId(input: string): string | null {
  const match = /(\d{6,})/.exec(input);
  return match?.[1] ?? null;
}

function toDateInputValue(value?: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function normalizeEmploymentType(value?: string | null): string {
  const lower = (value ?? "").toLowerCase();

  if (lower.includes("tillsvidare") && lower.includes("tidsbegränsad")) {
    return "Tillsvidare";
  }

  if (lower.includes("tillsvidare")) {
    return "Tillsvidare";
  }

  if (lower.includes("provanställ")) {
    return "Provanställning";
  }

  if (lower.includes("visstid")) {
    return "Visstid";
  }

  if (lower.includes("konsult")) {
    return "Konsult";
  }

  return "";
}

function normalizeWorkload(value?: string | null): string {
  const lower = (value ?? "").toLowerCase();

  if (lower.includes("heltid")) {
    return "Heltid";
  }

  if (lower.includes("deltid")) {
    return "Deltid";
  }

  return "";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl.searchParams.get("url") ?? "";
  const jobId = extractJobId(url);

  if (!jobId) {
    return NextResponse.json({ error: "Ogiltig annonslänk." }, { status: 400 });
  }

  let upstream;
  try {
    upstream = await fetch(
      `https://platsbanken-api.arbetsformedlingen.se/jobs/v1/job/${jobId}`,
      {
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      },
    );
  } catch (err) {
    logger.error("Arbetsformedlingen API unreachable", { jobId });
    Sentry.captureException(err, {
      tags: { route: "GET /api/arbetsformedlingen", external: true },
    });
    return NextResponse.json(
      { error: "Kunde inte nå Arbetsförmedlingens API." },
      { status: 503 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Kunde inte hämta annonsdata." },
      { status: upstream.status },
    );
  }

  const data = (await upstream.json()) as AfJob;
  const contact = data.contacts?.[0];
  const contactName = [contact?.name, contact?.surname].filter(Boolean).join(" ");

  const normalizeText = (value?: string | null) =>
    value?.trim().replaceAll(/\s+/g, " ") ?? "";

  const payload: AutofillPayload = {
    title: normalizeText(data.occupation) || normalizeText(data.title),
    company: normalizeText(data.company?.name) || normalizeText(data.workplace?.name),
    location: normalizeText(data.workplace?.city),
    employmentType: normalizeEmploymentType(data.employmentType),
    workload: normalizeWorkload(data.workTimeExtent),
    applicationDate: toDateInputValue(data.publishedDate),
    deadline: toDateInputValue(data.lastApplicationDate),
    contactName: normalizeText(contactName),
    contactRole: normalizeText(contact?.position),
    contactEmail: normalizeText(contact?.email),
    contactPhone: normalizeText(contact?.mobileNumber) || normalizeText(contact?.phoneNumber),
    notes: "",
    status: JobStatus.SAVED,
  };

  return NextResponse.json(payload);
}
