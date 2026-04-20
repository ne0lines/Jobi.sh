import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  FileX,
  Globe,
  LayoutDashboard,
  Mail,
  MessageSquareWarning,
} from "lucide-react";

export default function CompanyPage() {
  return (
    <div className="min-h-svh w-full pb-0 md:mx-auto md:max-w-270 md:px-4">
      <div className="relative isolate overflow-hidden rounded-[2rem] flex flex-col gap-14 bg-[radial-gradient(circle_at_top_left,rgba(110,51,235,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(14,107,140,0.10),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,244,248,0.92))] shadow-[0_24px_80px_rgba(17,23,40,0.08)] ring-1 ring-black/5 dark:bg-[radial-gradient(circle_at_top_left,rgba(110,51,235,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(14,107,140,0.14),transparent_24%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,9,0.98))] dark:ring-white/10">

        {/* Header */}
        <header className="sticky top-3 z-20 px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_16px_40px_rgba(17,23,40,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/7 sm:px-6">
            <Link
              href="/"
              aria-label="Gå till startsidan"
              className="rounded-md font-display text-5xl font-bold leading-none tracking-[-0.05em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary"
            >
              Jobi<span className="text-app-primary">.sh</span>
            </Link>

            <nav className="hidden md:ml-auto md:block">
              <ul className="flex items-center gap-6">
                <li>
                  <Link href="#problemet" className="rounded-md text-sm font-medium text-app-muted transition hover:text-app-primary">
                    Utmaningen
                  </Link>
                </li>
                <li>
                  <Link href="#losningen" className="rounded-md text-sm font-medium text-app-muted transition hover:text-app-primary">
                    Lösningen
                  </Link>
                </li>
                <li>
                  <Link href="#boka-demo" className="rounded-md text-sm font-medium text-app-muted transition hover:text-app-primary">
                    Boka demo
                  </Link>
                </li>
              </ul>
            </nav>

            <a
              href="#boka-demo"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#6e33eb_0%,#8148ff_100%)] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(110,51,235,0.26)] transition hover:-translate-y-0.5"
            >
              Boka en demo
              <CalendarCheck aria-hidden="true" size={16} strokeWidth={2.2} />
            </a>
          </div>
        </header>

        <main className="flex flex-col gap-14 pb-0">

          {/* Hero */}
          <section className="px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-primary">
                  För Rusta och Matcha-aktörer
                </p>
                <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[0.95] tracking-[-0.05em] text-app-ink sm:text-6xl lg:text-7xl">
                  Minimera admin och säkra er compliance inför den{" "}
                  <span className="text-app-primary">14:e</span> varje månad.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-app-muted text-pretty sm:text-xl">
                  Jobi.sh hjälper Rusta och Matcha-aktörer att få 100% korrekta underlag från
                  kandidater. Spara timmar av administrativt arbete och få full kontroll över era
                  deltagares sökaktivitet.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#boka-demo"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#6e33eb_0%,#8148ff_100%)] px-6 text-base font-semibold text-white shadow-[0_10px_22px_rgba(110,51,235,0.26)] transition hover:-translate-y-0.5"
                  >
                    Boka en 10-minuters demo
                    <ArrowRight aria-hidden="true" size={18} strokeWidth={2.2} />
                  </a>
                  <a
                    href="#losningen"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-app-stroke bg-white/70 px-6 text-base font-semibold text-app-ink transition hover:-translate-y-0.5"
                  >
                    Se hur det funkar
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Problem */}
          <section id="problemet" className="scroll-mt-28 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-xl">
                <h2 className="font-display text-4xl leading-tight text-app-ink sm:text-5xl">
                  Känner ni igen er i det här?
                </h2>
                <p className="mt-4 text-lg leading-8 text-app-muted">
                  Det är inte kandidaternas fel — det är ett systemfel. Jobi.sh löser det.
                </p>
              </div>

              <ul className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  {
                    Icon: Mail,
                    text: "Handledare som måste jaga kandidater via mail och SMS för att få in underlag.",
                  },
                  {
                    Icon: FileX,
                    text: "Aktivitetsrapporter som saknar länkar, datum eller kritisk information.",
                  },
                  {
                    Icon: MessageSquareWarning,
                    text: "Oro för att brister i dokumentationen ska påverka er rating hos Arbetsförmedlingen.",
                  },
                ].map(({ Icon, text }) => (
                  <li
                    key={text}
                    className="flex flex-col gap-4 rounded-[1.8rem] border border-app-stroke bg-white/70 px-5 py-6 shadow-[0_12px_30px_rgba(17,23,40,0.05)] dark:bg-white/5"
                  >
                    <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-app-blush text-app-sand-strong">
                      <Icon aria-hidden="true" className="size-5" strokeWidth={2.1} />
                    </div>
                    <p className="text-base leading-7 text-app-muted text-pretty">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Solution */}
          <section id="losningen" className="scroll-mt-28 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto max-w-xl text-center">
                <h2 className="font-display text-4xl leading-tight text-app-ink sm:text-5xl">
                  Hur Jobi.sh löser det
                </h2>
                <p className="mt-4 text-lg leading-8 text-app-muted">
                  Tre funktioner som tar bort de vanligaste orsakerna till felaktiga underlag.
                </p>
              </div>

              <ul className="mt-10 grid gap-5 md:grid-cols-3 md:items-stretch">
                {[
                  {
                    Icon: CalendarCheck,
                    eyebrow: "Automatiserad Rapportering",
                    title: "Rätt underlag den 14:e — utan manuellt arbete.",
                    description:
                      "Kandidaten klistrar in en länk, vi hämtar datan. Den 14:e genereras en AF-kompatibel rapport med ett klick. Inga saknade fält, inga felaktiga datum.",
                    cardCn: "bg-app-sky text-app-ink",
                    iconCn: "bg-white/75 text-app-primary",
                    headingCn: "text-app-primary",
                    badge: "Sparar handledare timmar varje månad",
                  },
                  {
                    Icon: LayoutDashboard,
                    eyebrow: '"Riskzonen"-Dashboard',
                    title: "Se vem som är på väg att missa — innan det händer.",
                    description:
                      "Se exakt vilka kandidater som inte har loggat in eller sparat jobb den senaste veckan. Agera proaktivt istället för att åtgärda problem efter rapporten.",
                    cardCn: "bg-app-sand text-app-ink md:translate-y-8",
                    iconCn: "bg-white/75 text-app-sand-strong",
                    headingCn: "text-app-sand-strong",
                    badge: "Proaktiv compliance-kontroll",
                  },
                  {
                    Icon: Globe,
                    eyebrow: "Flerspråkigt & Tillgängligt",
                    title: "Inga språkbarriärer som skapar rapporteringsfel.",
                    description:
                      "Jobi.sh är helt översatt till arabiska, ukrainska och engelska — inklusive RTL-layout för arabiska. Kandidater förstår vad som förväntas av dem.",
                    cardCn: "bg-app-green text-app-ink",
                    iconCn: "bg-white/75 text-app-green-strong",
                    headingCn: "text-app-green-strong",
                    badge: "Tar bort språkbarriärer som orsakar fel",
                  },
                ].map(({ Icon, eyebrow, title, description, cardCn, iconCn, headingCn, badge }) => (
                  <li
                    key={title}
                    className={`${cardCn} flex min-h-72 flex-col justify-between rounded-[2rem] p-6 shadow-[0_18px_48px_rgba(17,23,40,0.08)] transition duration-200 hover:-translate-y-1`}
                  >
                    <div>
                      <div className={`inline-flex size-12 items-center justify-center rounded-2xl ${iconCn}`}>
                        <Icon aria-hidden="true" className="size-5" strokeWidth={2.2} />
                      </div>
                      <p className={`mt-4 text-xs font-semibold uppercase tracking-[0.14em] ${headingCn}`}>
                        {eyebrow}
                      </p>
                      <h3 className={`mt-2 font-display text-2xl leading-tight ${headingCn}`}>
                        {title}
                      </h3>
                      <p className="mt-3 text-base leading-7 text-app-muted text-pretty">
                        {description}
                      </p>
                    </div>
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-app-muted">
                        <BadgeCheck aria-hidden="true" className="size-3.5 text-app-primary" strokeWidth={2.3} />
                        {badge}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Benefits */}
          <section className="px-4 sm:px-6 lg:px-8">
            <ul className="grid gap-3 text-left sm:grid-cols-3">
              {[
                "Slipp jaga kandidater — plattformen påminner dem automatiskt om vad som krävs.",
                "Full kontroll över vilka deltagare som riskerar att dra ner er rating.",
                "Redo för granskning: alla underlag samlade, korrekta och AF-kompatibla.",
              ].map((benefit) => (
                <li key={benefit} className="rounded-[1.4rem] bg-app-card px-4 py-4">
                  <BadgeCheck aria-hidden="true" className="size-5 text-app-primary" strokeWidth={2.2} />
                  <p className="mt-3 text-sm leading-6 text-app-muted text-pretty">{benefit}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <section id="boka-demo" className="scroll-mt-28 px-4 pb-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#6e33eb_0%,#8148ff_100%)] px-6 py-12 text-center shadow-[0_26px_60px_rgba(110,51,235,0.28)] sm:px-10 lg:px-14 lg:py-16">
              <div className="mx-auto max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                  Nästa steg
                </p>
                <h2 className="mt-3 font-display text-4xl leading-[0.95] text-white sm:text-5xl">
                  Se hur det funkar för er verksamhet.
                </h2>
                <p className="mt-5 text-lg leading-8 text-white/80 text-pretty">
                  Boka en 10-minuters demo så visar vi hur Jobi.sh kan passa in i ert befintliga
                  flöde — ingen installation, inga bindningstider.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href="mailto:demo@jobi.sh"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-semibold text-app-ink shadow-[0_10px_22px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
                  >
                    Boka en 10-minuters demo
                    <CalendarCheck aria-hidden="true" size={18} strokeWidth={2.2} />
                  </a>
                </div>
                <p className="mt-4 text-sm text-white/50">
                  Eller maila oss direkt på{" "}
                  <a href="mailto:demo@jobi.sh" className="underline underline-offset-2 transition hover:text-white/80">
                    demo@jobi.sh
                  </a>
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mx-4 border-t border-black/6 py-8 dark:border-white/8 sm:mx-6 lg:mx-8">
          <div className="mx-auto max-w-7xl md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <Link href="/" className="rounded-md font-display text-[1.45rem] font-bold leading-none tracking-[-0.05em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary">
                Jobi<span className="text-app-primary">.sh</span>
              </Link>
              <p className="mt-3 text-sm text-app-muted">Lite mindre jobbigt. Mer Jobi.sh.</p>
            </div>
            <nav className="mt-6 md:mt-0">
              <ul className="flex flex-wrap gap-4 text-sm text-app-muted">
                <li><Link href="/privacy" className="rounded-md transition hover:text-app-primary">Integritet</Link></li>
                <li><Link href="/terms" className="rounded-md transition hover:text-app-primary">Villkor</Link></li>
                <li><Link href="/gdpr" className="rounded-md transition hover:text-app-primary">GDPR</Link></li>
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
