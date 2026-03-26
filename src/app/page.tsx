import { Btn } from "@/components/ui/btn";
import { Pipeline, Statistics } from "@/components/dashboard";
import type { Job } from "@/app/types";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

async function getJobs(cookieHeader: string): Promise<Job[]> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${protocol}://${host}/api/jobs`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { applications: Job[] };
  return data.applications;
}

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const headersList = await headers();
  const jobs = await getJobs(headersList.get("cookie") ?? "");

  return (
    <main className="min-h-svh">
      <div className="w-full">
        <section className="w-full">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-4xl leading-none md:hidden">
              Jobi<span className="text-app-primary">.sh</span>
            </h1>
            <Btn className="md:hidden" href="/jobb/new" icon={Plus}>
              Lägg till jobb
            </Btn>
          </div>
        </section>
        <Pipeline jobs={jobs} />
        <Statistics applications={jobs} />
      </div>
    </main>
  );
}
