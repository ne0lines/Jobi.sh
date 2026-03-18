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
              name="title"
              placeholder="t.ex. UI Developer"
              type="text"
              required
            />
          </label>

          <label className="mb-3 block font-semibold text-app-muted">
            Företag
            <input
              className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              name="company"
              placeholder="t.ex. PixelForge"
              type="text"
              required
            />
          </label>

          <label className="mb-3 block font-semibold text-app-muted">
            Plats
            <input
              className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              name="location"
              placeholder="t.ex. Stockholm / Remote"
              type="text"
            />
          </label>

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block font-semibold text-app-muted">
              Anställningstyp
              <select
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
                name="employmentType"
              >
                <option value="">Välj</option>
                <option value="Tillsvidare">Tillsvidare</option>
                <option value="Visstid">Visstid</option>
                <option value="Provanställning">Provanställning</option>
                <option value="Konsult">Konsult</option>
              </select>
            </label>

            <label className="block font-semibold text-app-muted">
              Omfattning
              <select
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
                name="workload"
              >
                <option value="">Välj</option>
                <option value="Heltid">Heltid</option>
                <option value="Deltid">Deltid</option>
              </select>
            </label>
          </div>

          <label className="mb-3 block font-semibold text-app-muted">
            Annonslänk
            <input
              className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              name="jobUrl"
              placeholder="https://..."
              type="url"
            />
          </label>

          <label className="mb-3 block font-semibold text-app-muted">
            Status
            <select
              className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              name="status"
              required
            >
              <option value="">Välj status</option>
              <option value="Sparad">Sparad</option>
              <option value="Ansökt">Ansökt</option>
              <option value="Intervju">Intervju</option>
              <option value="Erbjudande">Erbjudande</option>
              <option value="Avslag">Avslag</option>
            </select>
          </label>

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block font-semibold text-app-muted">
              Datum för ansökan
              <input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
                name="applicationDate"
                type="date"
              />
            </label>

            <label className="block font-semibold text-app-muted">
              Sista ansökningsdag
              <input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
                name="deadline"
                type="date"
              />
            </label>
          </div>

          <fieldset className="mb-3 rounded-2xl border border-app-stroke bg-white p-4">
            <legend className="px-2 font-semibold text-app-muted">
              Kontaktperson (valfritt)
            </legend>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-app-muted">
                Namn
                <input
                  className="mt-1 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink"
                  name="contactName"
                  placeholder="t.ex. Anna Berg"
                  type="text"
                />
              </label>

              <label className="block text-sm font-semibold text-app-muted">
                Roll
                <input
                  className="mt-1 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink"
                  name="contactRole"
                  placeholder="t.ex. Rekryterare"
                  type="text"
                />
              </label>

              <label className="block text-sm font-semibold text-app-muted">
                E-post
                <input
                  className="mt-1 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink"
                  name="contactEmail"
                  placeholder="namn@företag.se"
                  type="email"
                />
              </label>

              <label className="block text-sm font-semibold text-app-muted">
                Telefon
                <input
                  className="mt-1 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink"
                  name="contactPhone"
                  placeholder="070-123 45 67"
                  type="tel"
                />
              </label>
            </div>
          </fieldset>

          <label className="mb-3 block font-semibold text-app-muted">
            Noteringar (valfritt)
            <textarea
              className="mt-2 w-full resize-y rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink"
              name="notes"
              rows={4}
              placeholder="Rollfokus, intervjusignaler, referensväg och nästa steg."
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
