import Link from "next/link";

export default function Pipeline() {
  return (
    <section>
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
    </section>
  );
}
