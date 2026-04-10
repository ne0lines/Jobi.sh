import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Btn } from "@/components/ui/btn";
import { TERMS_VERSION } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Användarvillkor | Jobi.sh",
  description: "Användarvillkor för Jobi.sh",
};

const sections: { title: string; body: ReactNode[] }[] = [
  {
    title: "1. Tjänstens Syfte och Funktion",
    body: [
      "[Jobi.sh] är ett oberoende digitalt verktyg skapat för att hjälpa arbetssökande att spåra, hantera och organisera sina jobbansökningar.",
      "Tjänsten samlar in platsannonser via Arbetsförmedlingens öppna API (JobTech Dev) och ger även användaren möjlighet att manuellt lägga till jobb från externa källor.",
    ],
  },
  {
    title: "2. Oberoende från Arbetsförmedlingen och A-kassa",
    body: [
      "Jobi.sh är en fristående tredjepartstjänst. Vi är inte anslutna till, sponsrade av eller officiella partners med Arbetsförmedlingen, någon A-kassa eller något fackförbund.",
      "Appen tillhandahåller en exportfunktion för att underlätta din aktivitetsrapportering, men du som användare bär det fulla juridiska och ekonomiska ansvaret för att din aktivitetsrapport lämnas in korrekt och i tid till Arbetsförmedlingen.",
      "Jobi.sh tar inget ansvar för eventuella förlorade ersättningar, avstängningar från A-kassa eller andra konsekvenser som uppstår på grund av tekniska fel i appen eller felaktigt inmatad data.",
    ],
  },
  {
    title: "3. Användarens Ansvar och Manuella Inmatningar",
    body: [
      "Tjänsten låter dig hämta jobb automatiskt och lägga in jobb manuellt.",
      "Du ansvarar för att den information du lägger in manuellt (t.ex. länkar från externa jobbsajter) är laglig och fri från skadlig kod.",
      "Det är strängt förbjudet att använda plattformen för att lagra olagligt, kränkande eller orelaterat material. Vi förbehåller oss rätten att stänga av konton som missbrukar plattformen.",
    ],
  },
  {
    title: "4. Analys, felövervakning och förbättring av tjänsten",
    body: [
      "För att förstå hur tjänsten används och för att förbättra stabilitet och användarupplevelse använder vi PostHog för anonymiserad produktanalys och Sentry för felövervakning och prestandadata.",
      "PostHog är konfigurerat utan personprofiler och utan spårningscookies. Sentry är konfigurerat för att inte skicka standard-PII, och text samt media maskeras i replay-data.",
      <>
        Vi säljer aldrig din personliga ansökningshistorik till tredje part. För
        fullständig information om hur vi hanterar personuppgifter, läs vår{" "}
        <Link
          className="font-semibold text-app-primary underline underline-offset-2"
          href="/privacy"
        >
          integritetspolicy
        </Link>
        .
      </>,
    ],
  },
  {
    title: '5. Tillgänglighet och Ansvarsbegränsning ("I befintligt skick")',
    body: [
      'Jobi.sh befinner sig i en tidig utvecklingsfas (MVP). Tjänsten tillhandahålls "i befintligt skick" (As-Is).',
      "Vi garanterar inte att tjänsten alltid kommer att vara oavbruten, snabb eller felfri.",
      "Vi ansvarar inte för förlorad data i din jobbpipeline. Vi rekommenderar att du regelbundet exporterar din data.",
      "Vi ansvarar inte för om externa API:er (t.ex. Arbetsförmedlingen) ligger nere eller ändrar sin struktur, vilket tillfälligt kan påverka appens funktionalitet.",
    ],
  },
  {
    title: "6. Ändringar av Villkoren",
    body: [
      "Vi förbehåller oss rätten att när som helst uppdatera dessa användarvillkor. Vid väsentliga förändringar kommer vi att meddela dig via appen eller e-post innan de nya villkoren träder i kraft.",
    ],
  },
  {
    title: "7. Åldersgräns",
    body: [
      "För att skapa ett konto och använda [Jobi.sh] måste du vara minst 18 år gammal. Genom att acceptera dessa villkor intygar du att du uppfyller denna åldersgräns.",
    ],
  },
  {
    title: "8. Immateriella Rättigheter",
    body: [
      "All design, källkod, grafik och struktur i Jobi.sh är vår exklusiva egendom. Användandet av tjänsten ger dig ingen licens eller rättighet att kopiera, sälja, modifiera eller distribuera vår mjukvara eller vår design utan vårt skriftliga medgivande.",
    ],
  },
  {
    title: "9. Priser och Framtida Avgifter",
    body: [
      "Jobi.sh (MVP-versionen) tillhandahålls för närvarande kostnadsfritt för privatanvändare. Vi förbehåller oss dock rätten att i framtiden introducera prenumerationsavgifter, premiumfunktioner eller ändra vår affärsmodell.",
      "Användare kommer alltid att meddelas i god tid innan eventuella avgifter införs, och du kommer alltid ha valet att avsluta ditt konto innan du debiteras.",
    ],
  },
  {
    title: "10. Tillämplig Lag och Tvist",
    body: [
      "Dessa användarvillkor ska tolkas och tillämpas i enlighet med svensk lag.",
      "Eventuella tvister som uppstår i samband med dessa villkor eller användningen av appen ska i första hand sökas lösas i godo. Om detta inte är möjligt ska tvisten avgöras av allmän domstol i Sverige.",
    ],
  },
  {
    title: "11. Uppsägning och Avstängning av Konto",
    body: [
      "Du kan när som helst välja att avsluta ditt konto och sluta använda tjänsten.",
      "Vi förbehåller oss rätten att när som helst, och utan föregående varning, stänga av eller permanent radera ditt konto om vi misstänker brott mot dessa användarvillkor, missbruk av tjänsten eller om tjänsten används för olagliga ändamål.",
    ],
  },
  {
    title: "12. Support och Drift",
    body: [
      "Eftersom Jobi.sh för närvarande erbjuds som en MVP (Minimum Viable Product), garanterar vi ingen specifik svarstid för supportärenden (SLA). Vi strävar efter att åtgärda buggar och problem så snabbt som möjligt, men vi garanterar inte att fel åtgärdas inom en viss tidsram.",
      "Systemunderhåll kan ske utan förvarning och kan medföra tillfälliga avbrott i tjänsten.",
    ],
  },
  {
    title: "13. Force Majeure",
    body: [
      "Vi är befriade från påföljd för underlåtenhet att fullgöra viss förpliktelse enligt dessa villkor, om underlåtenheten har sin grund i omständigheter utanför vår kontroll (Force Majeure).",
      "Hit räknas till exempel serveravbrott hos våra driftleverantörer, nedstängning eller ändringar i tredjeparts-API:er (såsom Arbetsförmedlingens JobTech), cyberattacker, naturkatastrofer eller lagbud.",
    ],
  },
  {
    title: "14. Kontaktuppgifter",
    body: [
      "Om du har frågor om dessa användarvillkor, tjänsten i övrigt, eller vill komma i kontakt med oss gällande företagsavtal, vänligen kontakta oss på:",
      "E-post: jobbi.sh@proton.me",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="app-page-legal">
      <section className="mx-auto app-page-content w-full max-w-3xl">
        <div className="app-card-elevated space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-primary">
            Jobi.sh
          </p>
          <h1 className="text-4xl leading-none">
            Användarvillkor (Terms of Service) för Jobi.sh
          </h1>
          <p className="max-w-2xl text-base text-app-muted">
            Senast uppdaterad: <strong>{TERMS_VERSION}</strong>
          </p>
          <p className="text-base leading-7 text-app-muted">
            Välkommen till Jobi.sh! Dessa användarvillkor reglerar din
            användning av vår mobilapplikation och tjänst. Genom att skapa ett
            konto och använda tjänsten godkänner du dessa villkor i sin helhet.
          </p>
        </div>

        <div className="app-card-elevated space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-2xl leading-tight">{section.title}</h2>
              {section.body.map((paragraph, index) => (
                <p key={`${section.title}-${index}`} className="text-base leading-7 text-app-muted">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="flex justify-start">
          <Btn href="/auth" variant="secondary">
            Tillbaka till inloggning
          </Btn>
        </div>
      </section>
    </main>
  );
}
