import { Btn } from "@/components/ui/btn";

const timeline = [
  { date: "5 mar 2026", event: "Ansokan skickad" },
  { date: "12 mar 2026", event: "Foljde upp via e-post" },
  { date: "15 mar 2026", event: "Intervju bokad" },
  { date: "30 apr 2026", event: "Sista ansokningsdag - 14 dagar kvar" },
];

export default function JobDetailPage() {
  return (
    <main className="grid min-h-screen place-items-center p-4 sm:p-5">
      <section className="w-full max-w-3xl rounded-3xl border border-app-stroke bg-app-surface p-5 shadow-sm sm:p-8">
        <h1 className="font-display text-5xl sm:text-6xl">
          Jobbdetaljer
        </h1>
        <p className="mt-2 text-lg text-app-muted">Följ status, historik och nästa steg</p>

        <article className="mt-4 rounded-2xl border border-app-stroke bg-app-card p-4">
          <h2 className="font-display text-xl">UI Developer</h2>
          <p className="mt-1 text-base text-app-muted">PixelForge · Stockholm · Remote</p>
          <span className="mt-2 inline-flex rounded-full bg-app-badge-bg px-3 py-1 font-bold text-app-badge-ink">
            Intervju
          </span>
        </article>

        <article className="mt-3 rounded-2xl border border-app-stroke bg-app-card p-4">
          <h3 className="mb-2 text-xl font-display">Ansökningsinfo</h3>
          <p className="text-base text-app-muted">Ansökt: 5 mars 2026</p>
          <p className="mt-1 text-base text-app-muted">Kontakt: Anna Berg (rekryterare)</p>
          <Btn
            className="mt-3"
            fullWidth
            href="https://jobs.acmelabs.com/roles/412"
            rel="noreferrer"
            target="_blank"
          >
            Besök annons
          </Btn>
        </article>

        <article className="mt-3 rounded-2xl border border-app-stroke bg-app-card p-4">
          <h3 className="mb-2 text-xl font-display">Historik</h3>
          <ul className="mt-2">
            {timeline.map((item, index) => (
              <li key={item.date} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex w-4 flex-col items-center">
                  <span className="mt-1 h-3 w-3 rounded-full bg-app-timeline" />
                  {index < timeline.length - 1 ? <span className="mt-1 w-px flex-1 bg-app-stroke" /> : null}
                </div>
                <div>
                  <strong className="block text-sm text-app-muted">{item.date}</strong>
                  <span className="text-lg">{item.event}</span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Btn type="button">Markera som uppföljt</Btn>
          <Btn href="/" variant="muted">
            Flytta till erbjudande
          </Btn>
        </div>
      </section>
    </main>
  );
}
