"use client";

import { Btn } from "@/components/ui/btn";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader } from "@/components/ui/loader";
import { StatusSelect } from "@/components/ui/status-select";
import { ExternalLink, PencilLine, Trash2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useDeleteJob, useJob } from "@/lib/hooks/jobs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

export default function JobDetailPage({
  params,
}: Readonly<{
  params: Promise<{ jobId: string }>;
}>) {
  const { jobId } = use(params);
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: job, isLoading, isError } = useJob(jobId);
  const deleteJobMutation = useDeleteJob();

  function handleDelete() {
    deleteJobMutation.mutate(jobId, {
      onSuccess: () => {
        toast.success("Jobbet togs bort.");
        setConfirmOpen(false);
        router.push("/");
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Kunde inte ta bort annonsen.",
        );
      },
    });
  }

  if (isLoading) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-3">
        <Loader size={40} />
        <p className="text-sm text-app-muted">Laddar jobbdetaljer...</p>
      </main>
    );
  }

  if (isError || !job) {
    return (
      <main className="min-h-svh pt-4">
        <section className="flex w-full max-w-3xl flex-col gap-4 p-5 sm:p-8 md:max-w-none">
          <h1 className="font-display text-4xl md:text-[2.4rem]">
            Jobbdetaljer
          </h1>
          <p className="text-base text-app-muted sm:text-lg">
            Jobbet kunde inte hittas.
          </p>
          <Btn href="/" variant="secondary">
            Tillbaka
          </Btn>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-svh pt-4">
      <section className="flex flex-col gap-4 w-full">
        <h1 className="font-display text-4xl md:text-[2.4rem]">Jobbdetaljer</h1>
        <p className="text-base text-app-muted sm:text-lg">
          Följ status, historik och nästa steg
        </p>
        <div className="flex flex-col gap-4">
          <article className="rounded-2xl border border-app-stroke bg-app-card p-4">
            <h2 className="font-display text-xl">{job.title}</h2>
            <div className="flex mt-2 gap-4">
              <p className="w-full text-base text-app-muted">
                <strong>Företag</strong>
                <br />
                {job.company}
              </p>
              <p className="w-full text-base text-app-muted">
                <strong>Plats</strong>
                <br />
                {job.location}
              </p>
            </div>
            <div className="flex mt-2 gap-4">
              <p className="w-full text-base text-app-muted">
                <strong>Anställningsform</strong>
                <br />
                {job.employmentType}
              </p>
              <p className="w-full text-base text-app-muted">
                <strong>Omfattning</strong>
                <br />
                {job.workload}
              </p>
            </div>
            {(job.contactPerson.name ||
              job.contactPerson.role ||
              job.contactPerson.email ||
              job.contactPerson.phone) && (
                <>
                  <h3 className="mt-3 font-display text-xl">Kontaktperson</h3>
                  {(job.contactPerson.name || job.contactPerson.role) && (
                    <p className="text-base text-app-muted">
                      {job.contactPerson.name && (
                        <strong>{job.contactPerson.name}</strong>
                      )}
                      {job.contactPerson.name && job.contactPerson.role && " "}
                      {job.contactPerson.role}
                    </p>
                  )}
                  {job.contactPerson.email && (
                    <p className="text-base text-app-muted">
                      <strong>E-post:</strong>{" "}
                      <Link
                        href={`mailto:${job.contactPerson.email}`}
                        className="font-medium text-app-primary"
                      >
                        {job.contactPerson.email}
                      </Link>
                    </p>
                  )}
                  {job.contactPerson.phone && (
                    <p className="text-base text-app-muted">
                      <strong>Telefon:</strong>{" "}
                      <Link
                        href={`tel:${job.contactPerson.phone}`}
                        className="font-medium text-app-primary"
                      >
                        {job.contactPerson.phone}
                      </Link>
                    </p>
                  )}
                </>
              )}
          </article>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Btn
              href={job.jobUrl}
              className="w-full"
              icon={ExternalLink}
              rel="noreferrer"
              target="_blank"
              onClick={() => trackEvent("visit_posting_click")}
            >
              Besök annons
            </Btn>
            <Btn
              href={`/jobb/${job.id}/edit`}
              className="w-full"
              icon={PencilLine}
              variant="secondary"
              onClick={() => trackEvent("edit_job_click")}
            >
              Redigera
            </Btn>
          </div>
          <article className="rounded-2xl border border-app-stroke bg-app-card p-4">
            <h3 className="mb-2 text-xl font-display">Historik</h3>
            <div className="relative mt-2">
              <div
                aria-hidden="true"
                className="absolute top-1 bottom-2 left-1.25 w-px bg-app-stroke"
              />
              <ul className="space-y-4">
                {job.timeline.map((item, index) => (
                  <li
                    key={`${job.title}-${item.date}-${index}`}
                    className="relative flex gap-3 items-center"
                  >
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-app-primary-strong ring-3 ring-app-card" />
                    <div>
                      <strong className="block text-md text-app-muted">
                        {item.date}
                      </strong>
                      <span className="text-lg">{item.event}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>
          <StatusSelect jobId={job.id} initialStatus={job.status} />
        </div>
        <div className="flex w-full gap-4">
          <Btn variant="secondary" className="w-1/2" href="/">
            Tillbaka
          </Btn>
          <Btn
            type="button"
            variant="red"
            className="w-full"
            icon={Trash2}
            onClick={() => { trackEvent("delete_job_click"); setConfirmOpen(true); }}
          >
            Ta bort jobb
          </Btn>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Ta bort jobb?"
          description="Det här går inte att ångra. Jobbet och all tillhörande information tas bort permanent."
          confirmLabel="Ta bort"
          onConfirm={() => handleDelete()}
          isLoading={deleteJobMutation.isPending}
        />
      </section>
    </main>
  );
}
