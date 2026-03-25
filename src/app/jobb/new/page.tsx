"use client";

import { createJob, getJobs } from "@/app/services/services";
import { LogoutBtn } from "@/components/auth/logout-btn";
import { Btn } from "@/components/ui/btn";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type AutofillPayload, type CreateJobInput, type JobFormState, JobStatus } from "@/app/types";
import { Plus, TextCursorInput } from "lucide-react";
import { cn } from "@/lib/utils";
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

const employmentTypeOptions = ["Tillsvidare", "Visstid", "Provanställning", "Konsult"];
const workloadOptions = ["Heltid", "Deltid"];
const statusOptions: Array<{ value: JobStatus; label: string }> = [
  { value: JobStatus.SAVED, label: "Sparad" },
  { value: JobStatus.APPLIED, label: "Ansökt" },
  { value: JobStatus.IN_PROCESS, label: "Pågående" },
  { value: JobStatus.INTERVIEW, label: "Intervju" },
  { value: JobStatus.OFFER, label: "Erbjudande" },
  { value: JobStatus.CLOSED, label: "Avslutad" },
];

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

  useEffect(() => {
    const rootElement = document.documentElement;
    const bodyElement = document.body;

    if (!showManualFields) {
      rootElement.classList.add("page-scroll-locked");
      bodyElement.classList.add("page-scroll-locked");

      return () => {
        rootElement.classList.remove("page-scroll-locked");
        bodyElement.classList.remove("page-scroll-locked");
      };
    }

    rootElement.classList.remove("page-scroll-locked");
    bodyElement.classList.remove("page-scroll-locked");

    return () => {
      rootElement.classList.remove("page-scroll-locked");
      bodyElement.classList.remove("page-scroll-locked");
    };
  }, [showManualFields]);

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
    <main className={cn("flex px-4", showManualFields ? "min-h-svh pt-4" : "h-svh overflow-hidden pb-0 pt-4")}>
      <section className="mx-auto flex w-full flex-1 flex-col gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-[2.4rem]">Lägg till jobb</h1>
          {feedback ? (
            <p className="mt-4 rounded-2xl border border-app-stroke bg-app-card px-4 py-3 text-sm text-app-muted">
              {isAutofilling ? "⏳ " : ""}
              {feedback}
            </p>
          ) : null}
        </div>

        <form autoComplete="off" className={cn("flex flex-1 flex-col", showManualFields ? "" : "justify-between")} onSubmit={handleSubmit}>
          {showManualFields ? (
            <div className="mt-4">
              <label className="mb-3 block font-semibold text-app-muted">
                <span className="block">Annonslänk</span>
                <Input
                  autoComplete="off"
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
                <Input
                  autoComplete="off"
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
                <Input
                  autoComplete="off"
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
                <Input
                  autoComplete="off"
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
                  <Select
                    value={form.employmentType}
                    onValueChange={(value) => updateField("employmentType", value ?? "")}
                  >
                    <SelectTrigger className="mt-2 h-14 w-full rounded-2xl border-app-stroke bg-white px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20 data-placeholder:text-app-muted">
                      <SelectValue placeholder="Välj" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>

                <label className="block font-semibold text-app-muted">
                  <span className="block">Omfattning</span>
                  <Select
                    value={form.workload}
                    onValueChange={(value) => updateField("workload", value ?? "")}
                  >
                    <SelectTrigger className="mt-2 h-14 w-full rounded-2xl border-app-stroke bg-white px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20 data-placeholder:text-app-muted">
                      <SelectValue placeholder="Välj" />
                    </SelectTrigger>
                    <SelectContent>
                      {workloadOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>

              <label className="mb-3 block font-semibold text-app-muted">
                <span className="block">Status</span>
                <Select
                  value={form.status}
                  onValueChange={(value) => updateField("status", value as JobStatus)}
                >
                  <SelectTrigger className="mt-2 h-14 w-full rounded-2xl border-app-stroke bg-white px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block font-semibold text-app-muted">
                  <span className="block">Datum för ansökan</span>
                  <DatePicker
                    value={form.applicationDate}
                    onChange={(value) => updateField("applicationDate", value)}
                  />
                </label>

                <label className="block font-semibold text-app-muted">
                  <span className="block">Sista ansökningsdag</span>
                  <DatePicker
                    value={form.deadline}
                    onChange={(value) => updateField("deadline", value)}
                  />
                </label>
              </div>

              <fieldset className="mb-3 rounded-2xl border border-app-stroke bg-white p-4">
                <legend className="px-2 font-semibold text-app-muted">Kontaktperson (valfritt)</legend>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-app-muted">
                    <span className="block">Namn</span>
                    <Input
                      autoComplete="off"
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
                    <Input
                      autoComplete="off"
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
                    <Input
                      autoComplete="off"
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
                    <Input
                      autoComplete="off"
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
                <Textarea
                  autoComplete="off"
                  className="mt-2 w-full resize-y rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="notes"
                  rows={4}
                  placeholder="Rollfokus, intervjusignaler, referensväg och nästa steg."
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                />
              </label>

              <div className="flex gap-4">
                <Btn href="/" variant="secondary" className="w-1/2">
                  Avbryt
                </Btn>
                <Btn disabled={isSubmitting} type="submit" className="w-full" icon={Plus}>
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
                    <Input
                      autoComplete="off"
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

              <div className="shrink-0 space-y-4 pb-24">
                <div className="flex justify-end w-full pb-4">
                  <Btn
                    type="button"
                    variant="secondary"
                    icon={TextCursorInput}
                    onClick={() => setShowManualFields(true)}
                  >
                    Lägg till manuellt
                  </Btn>
                </div>
              </div>
            </>
          )}
        </form>
      </section>
    </main>
  );
}
