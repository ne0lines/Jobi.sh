import Link from "next/link";
import { Btn } from "@/components/ui/btn";

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center p-4 sm:p-5">
      <section className="w-full max-w-3xl rounded-3xl border border-app-stroke bg-app-surface p-5 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="grid">
            <span className="font-display text-5xl leading-none sm:text-6xl">
              ApplyTrack{" "}
            </span>
            <span className="mt-2 text-lg text-app-muted font-normal">
              Översikt över sökta jobb
            </span>
          </h1>
          <Btn href="/jobb/new">Lägg till ansökan</Btn>
        </div>

        <h2 className="mt-6 mb-3 font-display text-4xl">Pipeline</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-app-stroke bg-app-card p-4">
            <h3 className="mb-2 text-xl font-display">Ansökt</h3>
            <Link
              className="block rounded-2xl border border-app-stroke bg-white p-4"
              href="/jobb/1"
            >
              <strong className="text-lg">UI Developer</strong>
              <span className="mt-1 block text-base text-app-muted">
                PixelForge
              </span>
            </Link>
          </article>

          <article className="rounded-2xl border border-app-cyan bg-app-cyan p-4">
            <h3 className="mb-2 text-xl font-display">Intervju</h3>
            <div className="rounded-2xl border border-app-stroke bg-white p-4">
              <strong className="text-lg">Product Designer</strong>
              <span className="mt-1 block text-base text-app-muted">
                Craft Studio
              </span>
            </div>
          </article>
        </div>

        <article className="mt-3 rounded-2xl border border-app-stroke bg-app-card p-4">
          <h3 className="mb-2 text-xl font-display">Påminnelse</h3>
          <p className="text-base text-app-muted">
            Ingen återkoppling från PixelForge efter 7 dagar. Följ upp idag.
          </p>
        </article>

        <h2 className="mt-6 mb-3 font-display text-4xl">Statistik</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article className="rounded-2xl bg-slate-200 p-5">
            <strong className="block font-display text-4xl leading-none">
              23
            </strong>
            <span className="text-base text-app-muted">Ansökningar</span>
          </article>
          <article className="rounded-2xl bg-app-cyan p-5 text-app-cyan-strong">
            <strong className="block font-display text-4xl leading-none">
              4
            </strong>
            <span className="text-base text-app-muted">Intervjuer</span>
          </article>
          <article className="rounded-2xl bg-app-green p-5 text-app-green-strong">
            <strong className="block font-display text-4xl leading-none">
              1
            </strong>
            <span className="text-base text-app-muted">Jobberbjudanden</span>
          </article>
          <article className="rounded-2xl bg-app-sand p-5 text-app-sand-strong">
            <strong className="block font-display text-4xl leading-none">
              17%
            </strong>
            <span className="text-base text-app-muted">Framgång</span>
          </article>
        </div>

        <article className="mt-3 rounded-2xl border border-app-stroke bg-app-card p-4">
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
      </section>
    </main>
  );
}
