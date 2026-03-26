import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { JobStatus } from "@/app/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { resolve } from "path";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const statusMap: Record<string, JobStatus> = {
  saved: JobStatus.saved,
  applied: JobStatus.applied,
  "in process": JobStatus.in_process,
  interview: JobStatus.interview,
  offer: JobStatus.offer,
  closed: JobStatus.closed,
};

async function main() {
  const userId = process.env.SEED_USER_ID;
  const email = process.env.SEED_USER_EMAIL;

  if (!userId || !email) {
    throw new Error("SEED_USER_ID and SEED_USER_EMAIL must be set");
  }

  const dbPath = resolve(process.cwd(), "src/server/db.json");
  const { applications } = JSON.parse(readFileSync(dbPath, "utf-8")) as {
    applications: {
      id: string;
      title: string;
      company: string;
      location: string;
      employmentType: string;
      workload: string;
      jobUrl: string;
      status: string;
      notes: string;
      contactPerson?: { name: string; role: string; email: string; phone: string };
      timeline?: { date: string; event: string }[];
    }[];
  };

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email, complete: false },
    update: {},
  });

  for (const app of applications) {
    await prisma.job.create({
      data: {
        userId,
        title: app.title,
        company: app.company,
        location: app.location ?? "",
        employmentType: app.employmentType ?? "",
        workload: app.workload ?? "",
        jobUrl: app.jobUrl ?? "",
        status: statusMap[app.status] ?? JobStatus.saved,
        notes: app.notes ?? "",
        contactPerson: app.contactPerson
          ? {
              create: {
                name: app.contactPerson.name ?? "",
                role: app.contactPerson.role ?? "",
                email: app.contactPerson.email ?? "",
                phone: app.contactPerson.phone ?? "",
              },
            }
          : undefined,
        timeline: {
          create: (app.timeline ?? []).map((t) => ({
            date: t.date,
            event: t.event,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${applications.length} applications for ${email} (${userId})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
