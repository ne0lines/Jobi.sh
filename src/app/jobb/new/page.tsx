"use client";

import { createJob, getJobs } from "@/app/services/services";
import { LogoutBtn } from "@/components/auth/logout-btn";
import { Btn } from "@/components/ui/btn";
import { type AutofillPayload, type CreateJobInput, type JobFormState, JobStatus } from "@/app/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const initialState: JobFormState = {
  title: "",
  company: "",
  location: "",
  employmentType: "",
  workload: "",
  jobUrl: "",
  status: JobStatus.SAVED,
  applicationDate: "",
  deadline: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

function extractAfJobId(value: string): string | null {
  const match = /(\d{6,})/.exec(value);
  return match?.[1] ?? null;
}

function mergeAutofill(prev: JobFormState, data: AutofillPayload): JobFormState {
  return {
    ...prev,
    title: data.title || prev.title,
    company: data.company || prev.company,
    location: data.location || prev.location,
    employmentType: data.employmentType || prev.employmentType,
    workload: data.workload || prev.workload,
    applicationDate: data.applicationDate || prev.applicationDate,
    deadline: data.deadline || prev.deadline,
    contactName: data.contactName || prev.contactName,
    contactRole: data.contactRole || prev.contactRole,
    contactEmail: data.contactEmail || prev.contactEmail,
    contactPhone: data.contactPhone || prev.contactPhone,
    notes: data.notes || prev.notes,
    status: data.status,
  };
}

function formatTimelineDate(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function buildTimeline(form: JobFormState) {
  const timeline = [] as Array<{ date: string; event: string }>;

  if (form.status === JobStatus.SAVED) {
    timeline.push({
      date: formatTimelineDate(new Date().toISOString()),
      event: "Jobbet sparat",
    });
  }

  if (form.applicationDate) {
    timeline.push({
      date: formatTimelineDate(form.applicationDate),
      event: "Ansökan skickad",
    });
  }

  if (form.deadline) {
    timeline.push({
      date: formatTimelineDate(form.deadline),
      event: "Sista ansökningsdag",
    });
  }

  if (timeline.length === 0) {
    timeline.push({
      date: formatTimelineDate(new Date().toISOString()),
      event: "Jobbet skapat",
    });
  }

  return timeline;
}

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState<JobFormState>(initialState);
  const [hasExistingJobs, setHasExistingJobs] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showManualFields, setShowManualFields] = useState(false);
  const lastFetchedJobId = useRef<string | null>(null);

  const jobId = useMemo(() => extractAfJobId(form.jobUrl), [form.jobUrl]);

  useEffect(() => {
    let isMounted = true;

    async function loadJobs() {
      try {
        const jobs = await getJobs();

        if (isMounted) {
          setHasExistingJobs(jobs.length > 0);
        }
      } catch {
        if (isMounted) {
          setHasExistingJobs(false);
        }
      }
    }

    void loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!jobId || lastFetchedJobId.current === jobId) {
      return;
    }

    const controller = new AbortController();

    const timeout = globalThis.setTimeout(async () => {
      setIsAutofilling(true);
      setFeedback("Kontrollerar om annonsen redan finns sparad...");

      try {
        const existingJobResponse = await fetch(`/api/jobs/${jobId}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (existingJobResponse.ok) {
          lastFetchedJobId.current = jobId;
          setShowManualFields(false);
          setFeedback("");
          globalThis.alert("Den här annonsen finns redan sparad.");
          return;
        }

        if (existingJobResponse.status !== 404) {
          throw new Error("Kunde inte kontrollera om annonsen redan finns sparad.");
        }

        setFeedback("Hämtar data från Arbetsförmedlingen...");

        const res = await fetch(
          `/api/arbetsformedlingen?url=${encodeURIComponent(form.jobUrl)}`,
          {
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error("Kunde inte hämta annonsdata.");
        }

        const data = (await res.json()) as AutofillPayload;

        setForm((prev) => mergeAutofill(prev, data));
        lastFetchedJobId.current = jobId;
        setShowManualFields(true);
        setFeedback("");
      } catch {
        setFeedback("Kunde inte hämta data automatiskt just nu.");
      } finally {
        setIsAutofilling(false);
      }
    }, 650);

    return () => {
      controller.abort();
      globalThis.clearTimeout(timeout);
    };
  }, [form.jobUrl, jobId]);

  function updateField<K extends keyof JobFormState>(field: K, value: JobFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitJob() {
    setIsSubmitting(true);
    setFeedback("");

    try {
      const payload: CreateJobInput = {
        title: form.title,
        company: form.company,
        location: form.location,
        employmentType: form.employmentType,
        workload: form.workload,
        jobUrl: form.jobUrl,
        contactPerson: {
          name: form.contactName,
          role: form.contactRole,
          email: form.contactEmail,
          phone: form.contactPhone,
        },
        timeline: buildTimeline(form),
        notes: form.notes,
        status: form.status,
      };

      const createdJob = await createJob(payload);

      router.push(`/jobb/${createdJob.id}`);
      router.refresh();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Kunde inte spara jobbet just nu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (event) => {
    event.preventDefault();
    void submitJob();
  };

  return (
    <main className="min-h-dvh px-4 pb-4 pt-0">
      <section className="mx-auto flex min-h-dvh w-full flex-col gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-6xl">Lägg till jobb</h1>
          {feedback ? (
            <p className="mt-4 rounded-2xl border border-app-stroke bg-app-card px-4 py-3 text-sm text-app-muted">
              {isAutofilling ? "⏳ " : ""}
              {feedback}
            </p>
          ) : null}
        </div>

        <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
          {showManualFields ? (
            <div className="mt-4">
              <label className="mb-3 block font-semibold text-app-muted">
                <span className="block">Annonslänk</span>
                <input
                  className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="jobUrl"
                  placeholder="https://arbetsformedlingen.se/platsbanken/annonser/30763601"
                  type="url"
                  value={form.jobUrl}
                  onChange={(event) => updateField("jobUrl", event.target.value)}
                />
              </label>

              <label className="mb-3 block font-semibold text-app-muted">
                <span className="block">Jobbtitel</span>
                <input
                  className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="title"
                  placeholder="t.ex. UI Developer"
                  type="text"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </label>

              <label className="mb-3 block font-semibold text-app-muted">
                <span className="block">Företag</span>
                <input
                  className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="company"
                  placeholder="t.ex. PixelForge"
                  type="text"
                  value={form.company}
                  onChange={(event) => updateField("company", event.target.value)}
                />
              </label>

              <label className="mb-3 block font-semibold text-app-muted">
                <span className="block">Plats</span>
                <input
                  className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="location"
                  placeholder="t.ex. Stockholm / Remote"
                  type="text"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                />
              </label>

              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block font-semibold text-app-muted">
                  <span className="block">Anställningstyp</span>
                  <select
                    className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                    name="employmentType"
                    value={form.employmentType}
                    onChange={(event) => updateField("employmentType", event.target.value)}
                  >
                    <option value="">Välj</option>
                    <option value="Tillsvidare">Tillsvidare</option>
                    <option value="Visstid">Visstid</option>
                    <option value="Provanställning">Provanställning</option>
                    <option value="Konsult">Konsult</option>
                  </select>
                </label>

                <label className="block font-semibold text-app-muted">
                  <span className="block">Omfattning</span>
                  <select
                    className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                    name="workload"
                    value={form.workload}
                    onChange={(event) => updateField("workload", event.target.value)}
                  >
                    <option value="">Välj</option>
                    <option value="Heltid">Heltid</option>
                    <option value="Deltid">Deltid</option>
                  </select>
                </label>
              </div>

              <label className="mb-3 block font-semibold text-app-muted">
                <span className="block">Status</span>
                <select
                  className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="status"
                  required
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value as JobStatus)}
                >
                  <option value={JobStatus.SAVED}>Sparad</option>
                  <option value={JobStatus.APPLIED}>Ansökt</option>
                  <option value={JobStatus.IN_PROCESS}>Pågående</option>
                  <option value={JobStatus.INTERVIEW}>Intervju</option>
                  <option value={JobStatus.OFFER}>Erbjudande</option>
                  <option value={JobStatus.CLOSED}>Avslutad</option>
                </select>
              </label>

              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block font-semibold text-app-muted">
                  <span className="block">Datum för ansökan</span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                    name="applicationDate"
                    type="date"
                    value={form.applicationDate}
                    onChange={(event) => updateField("applicationDate", event.target.value)}
                  />
                </label>

                <label className="block font-semibold text-app-muted">
                  <span className="block">Sista ansökningsdag</span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                    name="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(event) => updateField("deadline", event.target.value)}
                  />
                </label>
              </div>

              <fieldset className="mb-3 rounded-2xl border border-app-stroke bg-white p-4">
                <legend className="px-2 font-semibold text-app-muted">Kontaktperson (valfritt)</legend>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-app-muted">
                    <span className="block">Namn</span>
                    <input
                      className="mt-1 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                      name="contactName"
                      placeholder="t.ex. Anna Berg"
                      type="text"
                      value={form.contactName}
                      onChange={(event) => updateField("contactName", event.target.value)}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-app-muted">
                    <span className="block">Roll</span>
                    <input
                      className="mt-1 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                      name="contactRole"
                      placeholder="t.ex. Rekryterare"
                      type="text"
                      value={form.contactRole}
                      onChange={(event) => updateField("contactRole", event.target.value)}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-app-muted">
                    <span className="block">E-post</span>
                    <input
                      className="mt-1 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                      name="contactEmail"
                      placeholder="namn@företag.se"
                      type="email"
                      value={form.contactEmail}
                      onChange={(event) => updateField("contactEmail", event.target.value)}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-app-muted">
                    <span className="block">Telefon</span>
                    <input
                      className="mt-1 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                      name="contactPhone"
                      placeholder="070-123 45 67"
                      type="tel"
                      value={form.contactPhone}
                      onChange={(event) => updateField("contactPhone", event.target.value)}
                    />
                  </label>
                </div>
              </fieldset>

              <label className="mb-3 block font-semibold text-app-muted">
                <span className="block">Noteringar (valfritt)</span>
                <textarea
                  className="mt-2 w-full resize-y rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="notes"
                  rows={4}
                  placeholder="Rollfokus, intervjusignaler, referensväg och nästa steg."
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Btn href="/" variant="secondary">
                  Avbryt
                </Btn>
                <Btn disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Sparar..." : "Lägg till jobb"}
                </Btn>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-xl">
                  <label className="block font-semibold text-app-muted">
                    <span className="block">Annonslänk</span>
                    <input
                      className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                      name="jobUrl"
                      placeholder="https://arbetsformedlingen.se/platsbanken/annonser/xxxxx"
                      type="url"
                      value={form.jobUrl}
                      onChange={(event) => updateField("jobUrl", event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="flex w-full gap-4">
                {hasExistingJobs ? <Btn variant="secondary" className="w-1/2" href="/">Tillbaka</Btn> : null}
                <Btn
                  type="button"
                  className="w-full"
                  icon="/LucideTextCursorInput.svg"
                  iconHex="#FFFFFF"
                  onClick={() => setShowManualFields(true)}
                >
                  Lägg till manuellt
                </Btn>
              </div>

              {hasExistingJobs ? null : (
                <div className="mt-3 grid w-full grid-cols-2 gap-3">
                  <Btn href="/konto" variant="secondary" className="w-full">
                    Konto
                  </Btn>
                  <LogoutBtn className="w-full" />
                </div>
              )}
            </>
          )}
        </form>
      </section>
    </main>
  );
}
