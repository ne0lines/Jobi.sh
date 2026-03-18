import { JobStatus } from "@/app/types";

type StatisticsProps = {
  applications: Array<{
    id: string;
    status: JobStatus;
    timeline: Array<{
      date: string;
      event: string;
    }>;
  }>;
};

export function Statistics({ applications }: StatisticsProps) {
  const totalApplications = applications.length;
  const interviews = applications.filter(
    (job) => job.status === JobStatus.INTERVIEW,
  ).length;
  const offers = applications.filter(
    (job) => job.status === JobStatus.OFFER,
  ).length;
  const successRate =
    totalApplications > 0 ? Math.round((offers / totalApplications) * 100) : 0;

  return (
    <section className="w-full">
      <h2 className="mt-6 mb-3 font-display text-4xl">Statistik</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article className="rounded-2xl bg-slate-200 p-5">
            <strong className="block font-display text-4xl leading-none">
              {totalApplications}
            </strong>
            <span className="text-base text-app-muted">Ansökningar</span>
          </article>
          <article className="rounded-2xl bg-app-cyan p-5 text-app-cyan-strong">
            <strong className="block font-display text-4xl leading-none">
              {interviews}
            </strong>
            <span className="text-base text-app-muted">Intervjuer</span>
          </article>
          <article className="rounded-2xl bg-app-green p-5 text-app-green-strong">
            <strong className="block font-display text-4xl leading-none">
              {offers}
            </strong>
            <span className="text-base text-app-muted">Jobberbjudanden</span>
          </article>
          <article className="rounded-2xl bg-app-sand p-5 text-app-sand-strong">
            <strong className="block font-display text-4xl leading-none">
              {successRate}%
            </strong>
            <span className="text-base text-app-muted">Framgång</span>
          </article>
        </div>

        <article className="rounded-2xl border border-app-stroke bg-app-card p-4">
          <h3 className="mb-3 text-xl font-display">
            Ansökningar per dag (senaste 30 dagar)
          </h3>
          <svg
            viewBox="0 0 336 190"
            role="img"
            aria-label="Ansökningstrend de senaste 30 dagarna"
            className="block h-auto w-full"
          >
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7f43ff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7f43ff" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <path
              d="M0 132 C20 112, 45 100, 70 104 C95 108, 118 130, 140 150 C155 164, 174 156, 190 128 C210 92, 228 38, 248 52 C270 66, 292 124, 336 110 L336 190 L0 190 Z"
              fill="url(#area)"
            />
            <path
              d="M0 132 C20 112, 45 100, 70 104 C95 108, 118 130, 140 150 C155 164, 174 156, 190 128 C210 92, 228 38, 248 52 C270 66, 292 124, 336 110"
              fill="none"
              stroke="#6c37e8"
              strokeWidth="2.5"
            />
          </svg>
          <div className="mt-2 flex justify-between text-sm text-app-muted">
            <span>1 apr</span>
            <span>6 apr</span>
            <span>11 apr</span>
            <span>16 apr</span>
            <span>21 apr</span>
            <span>26 apr</span>
            <span>30 apr</span>
          </div>
        </article>
      </div>
    </section>
  );
}
