import { Btn } from "@/components/ui/btn";
import type { Db, Job } from "@/app/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import dbData from "../../../server/db.json";

const db = dbData as Db;

export default async function JobDetailPage({
  params,
}: Readonly<{
  params: Promise<{ jobId: string }>;
}>) {
  const { jobId } = await params;
  const job = db.applications.find((application: Job) => application.id === jobId);

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen p-4 sm:p-5 pt-20">
      <section className="flex flex-col gap-4 w-full max-w-3xl p-5 sm:p-8">
        <h1 className="font-display text-5xl sm:text-6xl">Jobbdetaljer</h1>
        <p className="text-lg text-app-muted">Följ status, historik och nästa steg</p>
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
            <Btn className="mt-3" fullWidth href={job.jobUrl} rel="noreferrer" target="_blank">Besök annons</Btn>
          </article>

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
        </div>
        <div className="bottom-0 flex w-full gap-4">
          <Btn type="button" className="w-full">Markera som uppföljt</Btn>
          <Btn href="/" variant="tertiary" className="w-full">Flytta till erbjudande</Btn>
        </div>
        <Btn variant="secondary" href="/">Tillbaka</Btn>
      </section>
    </main>
  );
}
