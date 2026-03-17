import { Btn } from "@/components/ui/btn";

export default function NewJobPage() {
  return (
    <main className="grid min-h-screen place-items-center p-4 sm:p-5">
      <section className="w-full max-w-3xl rounded-3xl border border-app-stroke bg-app-surface p-5 shadow-sm sm:p-8">
        <h1 className="font-display text-5xl sm:text-6xl">
          Lägg till jobb
        </h1>
        <p className="mt-2 text-lg text-app-muted">
          Fyll i uppgifterna kort och tydligt för smidigare uppföljning.
        </p>

        <form className="mt-4" action="#">
          <label className="mb-3 block font-semibold text-app-muted">
            Jobbtitel
            <input
              className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              defaultValue="Senior produktdesigner"
              type="text"
            />
          </label>

          <label className="mb-3 block font-semibold text-app-muted">
            Företag
            <input
              className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              defaultValue="Acme Labs"
              type="text"
            />
          </label>

          <label className="mb-3 block font-semibold text-app-muted">
            Annonslänk
            <input
              className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              defaultValue="https://jobs.acmelabs.com/roles/412"
              type="url"
            />
          </label>

          <label className="mb-3 block font-semibold text-app-muted">
            Datum for ansökan
            <input
              className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              defaultValue="2026-03-05"
              type="date"
            />
          </label>

          <label className="mb-3 block font-semibold text-app-muted">
            Sista ansökningsdag
            <input
              className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              defaultValue="2026-04-30"
              type="date"
            />
          </label>

          <label className="mb-3 block font-semibold text-app-muted">
            Kontaktperson (valfritt)
            <input
              className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              placeholder="Namn pa rekryterare eller anstallande chef"
              type="text"
            />
          </label>

          <label className="mb-3 block font-semibold text-app-muted">
            Noteringar (valfritt)
            <textarea
              className="mt-2 w-full resize-y rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              rows={4}
              placeholder="Rollfokus, intervjusignaler, referensvag och nasta steg."
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Btn href="/" variant="secondary">
              Avbryt
            </Btn>
            <Btn type="submit">Lägg till jobb</Btn>
          </div>
        </form>
      </section>
    </main>
  );
}
