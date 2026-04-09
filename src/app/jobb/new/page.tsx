"use client";

import { useCreateJob } from "@/lib/hooks/jobs";
import { trackEvent } from "@/lib/analytics";
import { Btn } from "@/components/ui/btn";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
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
import { toast } from "sonner";

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

function isArbetsformedlingenUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.hostname.includes("arbetsformedlingen.se");
  } catch {
    return false;
  }
}

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
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
  const createJob = useCreateJob();
  const [form, setForm] = useState<JobFormState>(initialState);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showManualFields, setShowManualFields] = useState(false);
  const [isDirectImportFlow, setIsDirectImportFlow] = useState(false);
  const lastFetchedJobId = useRef<string | null>(null);
  const appliedPrefillUrl = useRef<string | null>(null);

  const trimmedJobUrl = form.jobUrl.trim();
  const isAmsUrl = isArbetsformedlingenUrl(trimmedJobUrl);
  const jobId = useMemo(() => extractAfJobId(form.jobUrl), [form.jobUrl]);
  const isAmsImportLoading = isDirectImportFlow || (isAutofilling && !showManualFields);
  const shouldRenderForm = !isAmsImportLoading;

  useEffect(() => {
    const requestedJobUrl = new URLSearchParams(globalThis.location.search).get("url")?.trim() ?? "";

    if (!requestedJobUrl || appliedPrefillUrl.current === requestedJobUrl) {
      return;
    }

    appliedPrefillUrl.current = requestedJobUrl;
    setForm((prev) => ({ ...prev, jobUrl: requestedJobUrl }));

    if (isArbetsformedlingenUrl(requestedJobUrl)) {
      setIsDirectImportFlow(true);
      setShowManualFields(false);
      setFeedback("Hämtar data från Arbetsförmedlingen...");
      return;
    }

    setIsDirectImportFlow(false);
    setShowManualFields(true);
    setFeedback("");
  }, []);

  useEffect(() => {
    if (showManualFields || !trimmedJobUrl || isAmsUrl || !isAbsoluteUrl(trimmedJobUrl)) {
      return;
    }

    setIsDirectImportFlow(false);
    setFeedback("");
    setShowManualFields(true);
  }, [isAmsUrl, showManualFields, trimmedJobUrl]);

  useEffect(() => {
    if (!isAmsUrl || !jobId || lastFetchedJobId.current === jobId) {
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
          setIsDirectImportFlow(false);
          setShowManualFields(false);
          setFeedback("");
          toast.warning("Den här annonsen finns redan sparad.");
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
        setIsDirectImportFlow(false);
        setShowManualFields(true);
        setFeedback("");
      } catch {
        setIsDirectImportFlow(false);
        setShowManualFields(false);
        toast.error("Kunde inte hämta data automatiskt just nu.");
        setFeedback("Kunde inte hämta data automatiskt just nu.");
      } finally {
        setIsAutofilling(false);
      }
    }, 650);

    return () => {
      controller.abort();
      globalThis.clearTimeout(timeout);
    };
  }, [form.jobUrl, isAmsUrl, jobId]);

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

  function submitJob() {
    setFeedback("");

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

    createJob.mutate(payload, {
      onSuccess: (createdJob) => {
        toast.success("Jobbet lades till.");
        router.push(`/jobb/${createdJob.id}`);
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Kunde inte spara jobbet just nu.";
        toast.error(message);
        setFeedback(message);
      },
    });
  }

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (event) => {
    event.preventDefault();
    submitJob();
  };

  return (
    <main className={cn("flex", showManualFields ? "app-page" : "h-svh overflow-hidden pb-0 pt-4")}>
      <section className="mx-auto app-page-content-compact w-full flex-1">
        <div className="app-heading-stack-tight">
          <h1 className="font-display text-4xl md:text-[2.4rem]">Lägg till jobb</h1>
          {feedback && !isAmsImportLoading ? (
            <div className="app-feedback-card flex items-start gap-4 text-sm text-app-muted">
              {isAutofilling ? <Loader className="mt-0.5" size={24} /> : null}
              <p className="min-w-0 leading-6">{feedback}</p>
            </div>
          ) : null}
        </div>

        {isAmsImportLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="app-heading-stack-tight flex w-full max-w-md flex-col items-center px-6 py-10 text-center">
              <Loader size={40} />
              <p className="pt-6 text-base font-medium text-app-ink">
                {feedback || "Hämtar data från Arbetsförmedlingen..."}
              </p>
              <p className="text-sm text-app-muted">
                Formuläret visas automatiskt så fort annonsdatan är klar.
              </p>
            </div>
          </div>
        ) : null}

        {shouldRenderForm ? (
          <form autoComplete="off" className={cn("flex flex-1 flex-col", showManualFields ? "" : "justify-between")} onSubmit={handleSubmit}>
            {showManualFields ? (
              <div className="app-page-content-compact app-form-stack pt-2">
                <label className="app-form-field font-semibold text-app-muted">
                  <span className="block">Annonslänk</span>
                  <Input
                    autoComplete="off"
                    className="w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                    name="jobUrl"
                    placeholder="https://arbetsformedlingen.se/platsbanken/annonser/30763601"
                    type="url"
                    value={form.jobUrl}
                    onChange={(event) => updateField("jobUrl", event.target.value)}
                  />
                </label>

              <label className="app-form-field font-semibold text-app-muted">
                <span className="block">Jobbtitel</span>
                <Input
                  autoComplete="off"
                  className="w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="title"
                  placeholder="t.ex. UI Developer"
                  type="text"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </label>

              <label className="app-form-field font-semibold text-app-muted">
                <span className="block">Företag</span>
                <Input
                  autoComplete="off"
                  className="w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="company"
                  placeholder="t.ex. PixelForge"
                  type="text"
                  value={form.company}
                  onChange={(event) => updateField("company", event.target.value)}
                />
              </label>

              <label className="app-form-field font-semibold text-app-muted">
                <span className="block">Plats</span>
                <Input
                  autoComplete="off"
                  className="w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="location"
                  placeholder="t.ex. Stockholm / Remote"
                  type="text"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="app-form-field font-semibold text-app-muted">
                  <span className="block">Anställningstyp</span>
                  <Select
                    value={form.employmentType}
                    onValueChange={(value) => updateField("employmentType", value ?? "")}
                  >
                    <SelectTrigger className="h-14 w-full rounded-2xl border-app-stroke bg-white px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20 data-placeholder:text-app-muted">
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

                <label className="app-form-field font-semibold text-app-muted">
                  <span className="block">Omfattning</span>
                  <Select
                    value={form.workload}
                    onValueChange={(value) => updateField("workload", value ?? "")}
                  >
                    <SelectTrigger className="h-14 w-full rounded-2xl border-app-stroke bg-white px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20 data-placeholder:text-app-muted">
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

              <label className="app-form-field font-semibold text-app-muted">
                <span className="block">Status</span>
                <Select
                  value={form.status}
                  onValueChange={(value) => updateField("status", value as JobStatus)}
                >
                  <SelectTrigger className="h-14 w-full rounded-2xl border-app-stroke bg-white px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20">
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="app-form-field font-semibold text-app-muted">
                  <span className="block">Datum för ansökan</span>
                  <DatePicker
                    value={form.applicationDate}
                    onChange={(value) => updateField("applicationDate", value)}
                  />
                </label>

                <label className="app-form-field font-semibold text-app-muted">
                  <span className="block">Sista ansökningsdag</span>
                  <DatePicker
                    value={form.deadline}
                    onChange={(value) => updateField("deadline", value)}
                  />
                </label>
              </div>

              <fieldset className="app-card-dense app-form-stack">
                <legend className="px-2 font-semibold text-app-muted">Kontaktperson (valfritt)</legend>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="app-form-field text-sm font-semibold text-app-muted">
                    <span className="block">Namn</span>
                    <Input
                      autoComplete="off"
                      className="w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                      name="contactName"
                      placeholder="t.ex. Anna Berg"
                      type="text"
                      value={form.contactName}
                      onChange={(event) => updateField("contactName", event.target.value)}
                    />
                  </label>

                  <label className="app-form-field text-sm font-semibold text-app-muted">
                    <span className="block">Roll</span>
                    <Input
                      autoComplete="off"
                      className="w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                      name="contactRole"
                      placeholder="t.ex. Rekryterare"
                      type="text"
                      value={form.contactRole}
                      onChange={(event) => updateField("contactRole", event.target.value)}
                    />
                  </label>

                  <label className="app-form-field text-sm font-semibold text-app-muted">
                    <span className="block">E-post</span>
                    <Input
                      autoComplete="off"
                      className="w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                      name="contactEmail"
                      placeholder="namn@företag.se"
                      type="email"
                      value={form.contactEmail}
                      onChange={(event) => updateField("contactEmail", event.target.value)}
                    />
                  </label>

                  <label className="app-form-field text-sm font-semibold text-app-muted">
                    <span className="block">Telefon</span>
                    <Input
                      autoComplete="off"
                      className="w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                      name="contactPhone"
                      placeholder="070-123 45 67"
                      type="tel"
                      value={form.contactPhone}
                      onChange={(event) => updateField("contactPhone", event.target.value)}
                    />
                  </label>
                </div>
              </fieldset>

              <label className="app-form-field font-semibold text-app-muted">
                <span className="block">Noteringar (valfritt)</span>
                <Textarea
                  autoComplete="off"
                  className="w-full resize-y rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  name="notes"
                  rows={4}
                  placeholder="Rollfokus, intervjusignaler, referensväg och nästa steg."
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                />
              </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Btn href="/" variant="secondary" className="w-full sm:w-1/2">
                    Avbryt
                  </Btn>
                  <Btn disabled={createJob.isPending} type="submit" className="w-full" icon={Plus}>
                    {createJob.isPending ? "Sparar..." : "Lägg till jobb"}
                  </Btn>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-1 items-center justify-center">
                  <div className="w-full max-w-xl">
                    <label className="app-form-field font-semibold text-app-muted">
                      <span className="block">Annonslänk</span>
                      <Input
                        autoComplete="off"
                        className="w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
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
                      onClick={() => { trackEvent("manual_entry_click"); setShowManualFields(true); }}
                    >
                      Lägg till manuellt
                    </Btn>
                  </div>
                </div>
              </>
            )}
          </form>
        ) : null}
      </section>
    </main>
  );
}
