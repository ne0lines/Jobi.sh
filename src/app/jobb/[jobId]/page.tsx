"use client";

import { deleteJob, getJob } from "@/app/services/services";
import type { Job } from "@/app/types";
import { Btn } from "@/components/ui/btn";
import { StatusSelect } from "@/components/ui/status-select";
import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function JobDetailPage({
  params,
}: Readonly<{
  params: Promise<{ jobId: string }>;
}>) {
  const { jobId } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadJob() {
      try {
        const nextJob = await getJob(jobId);

        if (isMounted) {
          setJob(nextJob);
          setError("");
        }
      } catch {
        if (isMounted) {
          setJob(null);
          setError("Jobbet kunde inte hittas.");
        }
      }
    }

    void loadJob();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  async function handleDelete() {
    const isConfirmed = globalThis.confirm("Är du säker på att du vill ta bort annonsen?");

    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteJob(jobId);
      router.push("/");
      router.refresh();
    } catch (deleteError) {
      globalThis.alert(
        deleteError instanceof Error ? deleteError.message : "Kunde inte ta bort annonsen.",
      );
      setIsDeleting(false);
    }
  }

  if (!job && !error) {
    return (
      <main className="min-h-svh px-4 pt-4">
        <section className="flex w-full max-w-3xl flex-col gap-4 p-5 sm:p-8 md:max-w-none">
          <h1 className="font-display text-4xl md:text-[2.4rem]">Jobbdetaljer</h1>
          <p className="text-base text-app-muted sm:text-lg">Laddar jobb...</p>
        </section>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-svh px-4 pt-4">
        <section className="flex w-full max-w-3xl flex-col gap-4 p-5 sm:p-8 md:max-w-none">
          <h1 className="font-display text-4xl md:text-[2.4rem]">Jobbdetaljer</h1>
          <p className="text-base text-app-muted sm:text-lg">{error}</p>
          <Btn href="/" variant="secondary">
            Tillbaka
          </Btn>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-svh px-4 pt-4">
      <section className="flex flex-col gap-4 w-full">
        <h1 className="font-display text-4xl md:text-[2.4rem]">Jobbdetaljer</h1>
        <p className="text-base text-app-muted sm:text-lg">Följ status, historik och nästa steg</p>
        <div className="flex flex-col gap-4">
          <article className="rounded-2xl border border-app-stroke bg-app-card p-4">
            <h2 className="font-display text-xl">{job.title}</h2>
            <div className="flex mt-2 gap-4">
              <p className="w-full text-base text-app-muted"><strong>Företag</strong><br />{job.company}</p>
              <p className="w-full text-base text-app-muted"><strong>Plats</strong><br />{job.location}</p>
            </div>
            <div className="flex mt-2 gap-4">
              <p className="w-full text-base text-app-muted"><strong>Anställningsform</strong><br />{job.employmentType}</p>
              <p className="w-full text-base text-app-muted"><strong>Omfattning</strong><br />{job.workload}</p>
            </div>
            <h3 className="mt-3 font-display text-xl">Kontaktperson</h3>
            <p className="text-base text-app-muted"><strong>{job.contactPerson.name}</strong> ({job.contactPerson.role})</p>
            <p className="text-base text-app-muted"><strong>E-post:</strong> <Link href={`mailto:${job.contactPerson.email}`} className="font-medium text-app-cyan-strong">{job.contactPerson.email}</Link></p>
            <p className="text-base text-app-muted"><strong>Telefon:</strong> <Link href={`tel:${job.contactPerson.phone}`} className="font-medium text-app-cyan-strong">{job.contactPerson.phone}</Link></p>
          </article>
          <Btn href={job.jobUrl} icon={ExternalLink} rel="noreferrer" target="_blank">Besök annons</Btn>
          <article className="rounded-2xl border border-app-stroke bg-app-card p-4">
            <h3 className="mb-2 text-xl font-display">Historik</h3>
            <div className="relative mt-2">
              <div aria-hidden="true" className="absolute top-1 bottom-2 left-1.25 w-px bg-app-stroke" />
              <ul className="space-y-4">
                {job.timeline.map((item) => (
                  <li key={item.date} className="relative flex gap-3 items-center">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-app-primary-strong ring-3 ring-app-card" />
                    <div>
                    <strong className="block text-md text-app-muted">{item.date}</strong>
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
          <Btn variant="secondary" className="w-1/2" href="/">Tillbaka</Btn>
          <Btn disabled={isDeleting} type="button" variant="red" className="w-full" icon={Trash2} onClick={() => void handleDelete()}>
            {isDeleting ? "Tar bort..." : "Ta bort jobb"}
          </Btn>
        </div>
      </section>
    </main>
  );
}
