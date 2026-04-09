"use client";

import type { Job, JobFormState, JobTimelineItem, UpdateJobInput } from "@/app/types";
import { JobStatus } from "@/app/types";
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
import { useJob, useUpdateJob } from "@/lib/hooks/jobs";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
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

const swedishMonths: Record<string, string> = {
  jan: "01",
  januari: "01",
  feb: "02",
  februari: "02",
  mar: "03",
  mars: "03",
  apr: "04",
  april: "04",
  maj: "05",
  jun: "06",
  juni: "06",
  jul: "07",
  juli: "07",
  aug: "08",
  augusti: "08",
  sep: "09",
  sept: "09",
  september: "09",
  okt: "10",
  oktober: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

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

function parseSwedishDateToInput(value: string): string {
  const trimmedValue = value.trim().toLowerCase();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);

  if (isoMatch) {
    return trimmedValue;
  }

  const match = /^(\d{1,2})\s+([a-zåäö.]+)\s+(\d{4})$/.exec(trimmedValue);

  if (!match) {
    return "";
  }

  const [, day, rawMonth, year] = match;
  const monthKey = rawMonth.replace(".", "");
  const month = swedishMonths[monthKey];

  if (!month) {
    return "";
  }

  return `${year}-${month}-${day.padStart(2, "0")}`;
}

function isApplicationTimelineEvent(event: string): boolean {
  return event.trim().toLowerCase() === "ansökan skickad";
}

function isDeadlineTimelineEvent(event: string): boolean {
  return event.trim().toLowerCase().includes("sista ansökningsdag");
}

function extractTimelineDate(timeline: JobTimelineItem[], matcher: (event: string) => boolean): string {
  const item = timeline.find((entry) => matcher(entry.event));

  if (!item) {
    return "";
  }

  return parseSwedishDateToInput(item.date);
}

function buildFormState(job: Job): JobFormState {
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    employmentType: job.employmentType,
    workload: job.workload,
    jobUrl: job.jobUrl,
    status: job.status,
    applicationDate: extractTimelineDate(job.timeline, isApplicationTimelineEvent),
    deadline: extractTimelineDate(job.timeline, isDeadlineTimelineEvent),
    contactName: job.contactPerson.name,
    contactRole: job.contactPerson.role,
    contactEmail: job.contactPerson.email,
    contactPhone: job.contactPerson.phone,
    notes: job.notes ?? "",
  };
}

function buildUpdatedTimeline(existingTimeline: JobTimelineItem[], form: JobFormState): JobTimelineItem[] {
  const preservedTimeline = existingTimeline.filter(
    (item) => !isApplicationTimelineEvent(item.event) && !isDeadlineTimelineEvent(item.event),
  );

  const nextTimeline = [...preservedTimeline];

  if (form.applicationDate) {
    nextTimeline.push({
      date: formatTimelineDate(form.applicationDate),
      event: "Ansökan skickad",
    });
  }

  if (form.deadline) {
    nextTimeline.push({
      date: formatTimelineDate(form.deadline),
      event: "Sista ansökningsdag",
    });
  }

  return nextTimeline;
}

export default function EditJobPage({
  params,
}: Readonly<{
  params: Promise<{ jobId: string }>;
}>) {
  const { jobId } = use(params);
  const router = useRouter();
  const [formEdits, setFormEdits] = useState<Record<string, Partial<JobFormState>>>({});

  const { data: job, isLoading, isError } = useJob(jobId);
  const updateJobMutation = useUpdateJob();

  const form = {
    ...(job ? buildFormState(job) : initialState),
    ...formEdits[jobId],
  } satisfies JobFormState;

  function updateField<K extends keyof JobFormState>(field: K, value: JobFormState[K]) {
    setFormEdits((prev) => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        [field]: value,
      },
    }));
  }

  function handleSubmit() {
    if (!job) return;

    const payload: UpdateJobInput = {
      title: form.title,
      company: form.company,
      location: form.location,
      employmentType: form.employmentType,
      workload: form.workload,
      jobUrl: form.jobUrl,
      status: form.status,
      notes: form.notes,
      contactPerson: {
        name: form.contactName,
        role: form.contactRole,
        email: form.contactEmail,
        phone: form.contactPhone,
      },
      timeline: buildUpdatedTimeline(job.timeline, form),
    };

    updateJobMutation.mutate(
      { id: jobId, updates: payload },
      {
        onSuccess: () => {
          toast.success("Jobbet uppdaterades.");
          router.push(`/jobb/${jobId}`);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Kunde inte uppdatera jobbet just nu.",
          );
        },
      },
    );
  }

  const onSubmit: React.ComponentProps<"form">["onSubmit"] = (event) => {
    event.preventDefault();
    handleSubmit();
  };

  if (isLoading) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-3">
        <Loader size={40} />
        <p className="text-sm text-app-muted">Laddar jobb för redigering...</p>
      </main>
    );
  }

  if (isError || !job) {
    return (
      <main className="app-page">
        <section className="mx-auto app-page-content w-full max-w-3xl md:max-w-none">
          <h1 className="font-display text-4xl md:text-[2.4rem]">Redigera jobb</h1>
          <p className="text-base text-app-muted sm:text-lg">Jobbet kunde inte laddas för redigering.</p>
          <Btn href={`/jobb/${jobId}`} variant="secondary">
            Tillbaka
          </Btn>
        </section>
      </main>
    );
  }

  return (
    <main className="app-page">
      <section className="mx-auto app-page-content-compact w-full max-w-3xl md:max-w-none">
        <div className="app-heading-stack-tight">
          <h1 className="font-display text-4xl md:text-[2.4rem]">Redigera jobb</h1>
          <p className="text-base text-app-muted sm:text-lg">Uppdatera informationen för det sparade jobbet.</p>
        </div>

        <form autoComplete="off" className="pt-2" onSubmit={onSubmit}>
          <div className="app-page-content-compact app-form-stack">
            <label className="app-form-field font-semibold text-app-muted">
              <span className="block">Annonslänk</span>
              <Input
                autoComplete="off"
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
                <Select value={form.employmentType} onValueChange={(value) => updateField("employmentType", value ?? "")}>
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
                <Select value={form.workload} onValueChange={(value) => updateField("workload", value ?? "")}>
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
              <Select value={form.status} onValueChange={(value) => updateField("status", value as JobStatus)}>
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
                <DatePicker value={form.applicationDate} onChange={(value) => updateField("applicationDate", value)} />
              </label>

              <label className="app-form-field font-semibold text-app-muted">
                <span className="block">Sista ansökningsdag</span>
                <DatePicker value={form.deadline} onChange={(value) => updateField("deadline", value)} />
              </label>
            </div>

            <fieldset className="app-card-dense app-form-stack">
              <legend className="px-2 font-semibold text-app-muted">Kontaktperson (valfritt)</legend>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="app-form-field text-sm font-semibold text-app-muted">
                  <span className="block">Namn</span>
                  <Input
                    autoComplete="off"
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
                name="notes"
                rows={4}
                placeholder="Rollfokus, intervjusignaler, referensväg och nästa steg."
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Btn href={`/jobb/${jobId}`} variant="secondary" className="w-full sm:w-1/2" track="edit_job_cancel_click">
                Avbryt
              </Btn>
              <Btn disabled={updateJobMutation.isPending} type="submit" className="w-full" icon={Save} track="save_job_click">
                {updateJobMutation.isPending ? "Sparar..." : "Spara ändringar"}
              </Btn>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}