import { auth } from "@clerk/nextjs/server";

import { LandingPage } from "@/components/landing/landing-page";
import { getHeroHighlights } from "@/lib/job-insights";
import { getLandingJobsServer } from "@/server/queries";

export default async function Home() {
  const { userId } = await auth();
  const jobs = await getLandingJobsServer();
  const heroHighlights = getHeroHighlights(jobs);

  return (
    <LandingPage
      heroHighlights={heroHighlights}
      signedIn={Boolean(userId)}
    />
  );
}
