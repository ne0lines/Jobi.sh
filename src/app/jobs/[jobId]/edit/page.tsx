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
import { useTranslations } from "next-intl";
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

// Employment type and workload options are stored as Swedish strings in the DB
// (matching values returned by Arbetsförmedlingen) — kept in Swedish intentionally.
const employmentTypeOptions = ["Tillsvidare", "Visstid", "Provanställning", "Konsult"];
const workloadOptions = ["Heltid", "Deltid"];

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
  const t = useTranslations("editJob");
  const tNew = useTranslations("newJob");
  const tStatus = useTranslations("status");
  const [draftForms, setDraftForms] = useState<Record<string, JobFormState>>({});

  const { data: job, isLoading, isError } = useJob(jobId);
  const updateJobMutation = useUpdateJob();
  const form = draftForms[jobId] ?? (job ? buildFormState(job) : initialState);

  const statusOptions = [
    { value: JobStatus.SAVED, label: tStatus("saved") },
    { value: JobStatus.APPLIED, label: tStatus("applied") },
    { value: JobStatus.IN_PROCESS, label: tStatus("inProcess") },
    { value: JobStatus.INTERVIEW, label: tStatus("interview") },
    { value: JobStatus.OFFER, label: tStatus("offer") },
    { value: JobStatus.CLOSED, label: tStatus("closed") },
  ];

  function updateField<K extends keyof JobFormState>(field: K, value: JobFormState[K]) {
    setDraftForms((prev) => ({
      ...prev,
      [jobId]: {
        ...form,
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
          toast.success(t("saveSuccess"));
          router.push(`/jobs/${jobId}`);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : t("saveError"),
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
        <p className="text-sm text-app-muted">{t("loading")}</p>
      </main>
    );
  }

  if (isError || !job) {
    return (
      <main className="min-h-svh pt-4">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-5 sm:p-8 md:max-w-none">
          <h1 className="font-display text-4xl md:text-[2.4rem]">{t("title")}</h1>
          <p className="text-base text-app-muted sm:text-lg">{t("notFound")}</p>
          <Btn href={`/jobs/${jobId}`} variant="secondary">
            {t("back")}
          </Btn>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-svh pt-4">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 md:max-w-none">
        <div>
          <h1 className="font-display text-4xl md:text-[2.4rem]">{t("title")}</h1>
          <p className="text-base text-app-muted sm:text-lg">{t("subtitle")}</p>
        </div>

        <form autoComplete="off" className="mt-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-3 block font-semibold text-app-muted">
              <span className="block">{tNew("jobUrl")}</span>
              <Input
                autoComplete="off"
                className="mt-2"
                name="jobUrl"
                placeholder="https://arbetsformedlingen.se/platsbanken/annonser/30763601"
                type="url"
                value={form.jobUrl}
                onChange={(event) => updateField("jobUrl", event.target.value)}
              />
            </label>

            <label className="mb-3 block font-semibold text-app-muted">
              <span className="block">{tNew("jobTitle")}</span>
              <Input
                autoComplete="off"
                className="mt-2"
                name="title"
                placeholder={tNew("titlePlaceholder")}
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </label>

            <label className="mb-3 block font-semibold text-app-muted">
              <span className="block">{tNew("company")}</span>
              <Input
                autoComplete="off"
                className="mt-2"
                name="company"
                placeholder={tNew("companyPlaceholder")}
                type="text"
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
              />
            </label>

            <label className="mb-3 block font-semibold text-app-muted">
              <span className="block">{tNew("location")}</span>
              <Input
                autoComplete="off"
                className="mt-2"
                name="location"
                placeholder={tNew("locationPlaceholder")}
                type="text"
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
              />
            </label>

            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block font-semibold text-app-muted">
                <span className="block">{tNew("employmentType")}</span>
                <Select value={form.employmentType} onValueChange={(value) => updateField("employmentType", value ?? "")}>
                  <SelectTrigger className="mt-2 h-14 w-full rounded-2xl border-app-stroke bg-white px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20 data-placeholder:text-app-muted">
                    <SelectValue placeholder={tNew("selectPlaceholder")} />
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
                <span className="block">{tNew("workload")}</span>
                <Select value={form.workload} onValueChange={(value) => updateField("workload", value ?? "")}>
                  <SelectTrigger className="mt-2 h-14 w-full rounded-2xl border-app-stroke bg-white px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20 data-placeholder:text-app-muted">
                    <SelectValue placeholder={tNew("selectPlaceholder")} />
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
              <span className="block">{tNew("statusField")}</span>
              <Select value={form.status} onValueChange={(value) => updateField("status", value as JobStatus)}>
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
                <span className="block">{tNew("applicationDate")}</span>
                <DatePicker value={form.applicationDate} onChange={(value) => updateField("applicationDate", value)} />
              </label>

              <label className="block font-semibold text-app-muted">
                <span className="block">{tNew("deadline")}</span>
                <DatePicker value={form.deadline} onChange={(value) => updateField("deadline", value)} />
              </label>
            </div>

            <fieldset className="mb-3 rounded-2xl border border-app-stroke bg-white p-4">
              <legend className="px-2 font-semibold text-app-muted">{tNew("contact")}</legend>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-app-muted">
                  <span className="block">{tNew("contactName")}</span>
                  <Input
                    autoComplete="off"
                    className="mt-1"
                    name="contactName"
                    placeholder={tNew("contactNamePlaceholder")}
                    type="text"
                    value={form.contactName}
                    onChange={(event) => updateField("contactName", event.target.value)}
                  />
                </label>

                <label className="block text-sm font-semibold text-app-muted">
                  <span className="block">{tNew("contactRole")}</span>
                  <Input
                    autoComplete="off"
                    className="mt-1"
                    name="contactRole"
                    placeholder={tNew("contactRolePlaceholder")}
                    type="text"
                    value={form.contactRole}
                    onChange={(event) => updateField("contactRole", event.target.value)}
                  />
                </label>

                <label className="block text-sm font-semibold text-app-muted">
                  <span className="block">{tNew("contactEmail")}</span>
                  <Input
                    autoComplete="off"
                    className="mt-1"
                    name="contactEmail"
                    placeholder="namn@företag.se"
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) => updateField("contactEmail", event.target.value)}
                  />
                </label>

                <label className="block text-sm font-semibold text-app-muted">
                  <span className="block">{tNew("contactPhone")}</span>
                  <Input
                    autoComplete="off"
                    className="mt-1"
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
              <span className="block">{tNew("notes")}</span>
              <Textarea
                autoComplete="off"
                className="mt-2"
                name="notes"
                rows={4}
                placeholder={tNew("notesPlaceholder")}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </label>

            <div className="flex gap-4">
              <Btn href={`/jobs/${jobId}`} variant="secondary" className="w-1/2">
                {t("cancelBtn")}
              </Btn>
              <Btn disabled={updateJobMutation.isPending} type="submit" className="w-full" icon={Save}>
                {updateJobMutation.isPending ? t("saving") : t("saveBtn")}
              </Btn>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
