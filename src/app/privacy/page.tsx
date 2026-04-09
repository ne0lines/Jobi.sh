import type { Metadata } from "next";
import Link from "next/link";
import { Btn } from "@/components/ui/btn";
import { PRIVACY_POLICY_UPDATED_AT } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Integritetspolicy | Jobi.sh",
  description: "Integritetspolicy för Jobi.sh",
};

type Section = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const sections: Section[] = [
  {
    title: "1. Vem policyn gäller för",
    paragraphs: [
      "Den här integritetspolicyn gäller när du använder Jobi.sh:s webbapp, konto, relaterade tjänster och vår browser extension för aktivitetsrapportering och annonsimport.",
      "Policyn beskriver vilka personuppgifter vi behandlar, varför vi behandlar dem och vilka rättigheter du har.",
    ],
  },
  {
    title: "2. Personuppgifter vi behandlar",
    paragraphs: [
      "Vi behandlar kontouppgifter som e-postadress, användar-ID från inloggningstjänsten, namn, yrke och information om att du har godkänt gällande användarvillkor.",
      "Vi behandlar också innehåll som du själv sparar i tjänsten, till exempel jobb du följer, statusar, anteckningar, datum, uppgifter, tidslinjehändelser och kontaktpersoner med namn, roll, e-postadress och telefonnummer.",
      "När du använder tjänsten kan vi dessutom behandla teknisk information som sidvisningar, knapptryckningar, felrapporter, prestandadata, webbläsartyp och ungefärlig region, i den utsträckning det behövs för drift, analys och felsökning.",
    ],
  },
  {
    title: "3. Hur uppgifterna samlas in",
    paragraphs: [
      "Vi får uppgifter direkt från dig när du skapar konto, fyller i din profil, lägger till jobb manuellt, importerar annonser eller kompletterar jobb med anteckningar och kontaktuppgifter.",
      "Viss information skapas automatiskt när du använder produkten, till exempel tekniska loggar, felhändelser och anonym användningsstatistik.",
      "Jobbannonser kan även hämtas från externa källor som Arbetsförmedlingens öppna API eller via importflöden som du själv initierar.",
    ],
  },
  {
    title: "4. Varför vi behandlar uppgifterna",
    paragraphs: [
      "Vi behandlar personuppgifter för att skapa och administrera ditt konto, leverera kärnfunktionerna i tjänsten, spara din jobbpipeline och göra det möjligt för dig att exportera eller återanvända uppgifter i aktivitetsrapporteringen.",
      "Vi behandlar uppgifter också för att förebygga missbruk, skydda tjänsten, felsöka problem, mäta stabilitet och förstå hur produkten används så att vi kan förbättra funktioner och användarupplevelse.",
    ],
    bullets: [
      "Avtal: för att tillhandahålla ditt konto och de funktioner du använder i Jobi.sh.",
      "Berättigat intresse: för drift, säkerhet, produktförbättring, support och incidenthantering.",
      "Rättslig förpliktelse: när vi måste spara eller lämna ut uppgifter enligt lag.",
    ],
  },
  {
    title: "5. Analys, felövervakning och cookies",
    paragraphs: [
      "Vi använder PostHog för produktanalys. Implementationen är konfigurerad utan personprofiler, utan spårningscookies och utan varaktig identifiering mellan sessioner. Vi använder främst sidvisningar och produktinteraktioner för att förstå hur tjänsten används.",
      "Vi använder Sentry för felövervakning, prestandadata och begränsad sessionsåterspelning vid felsökning. Sentry är konfigurerat för att inte skicka standard-PII, och textinnehåll samt media maskeras i replay-data.",
      "Appen använder nödvändiga cookies eller motsvarande tekniker för inloggning och sessionshantering. Vi använder inte separata spårningscookies för marknadsföring.",
    ],
  },
  {
    title: "6. Browser extension",
    paragraphs: [
      "Vår browser extension använder behörigheterna storage och tabs för att kunna öppna rätt sidor, växla till Jobi.sh eller Arbetsförmedlingen och tillfälligt lagra det jobb som ska föras över till aktivitetsrapporteringen.",
      "Den information som lagras lokalt i extensionen används för att genomföra det flöde du själv startar, till exempel att öppna import av en annons eller fylla i ett utkast till aktivitetsrapport. Uppgifterna säljs inte och används inte för annonsering.",
    ],
  },
  {
    title: "7. Delning av uppgifter",
    paragraphs: [
      "Vi säljer inte dina personuppgifter. Vi delar bara uppgifter med leverantörer och personuppgiftsbiträden som behöver dem för att leverera tjänsten, till exempel för autentisering, applikationsdrift, analys och felövervakning.",
      "Exempel på sådana mottagare är vår inloggningsleverantör Clerk, analystjänsten PostHog och felövervakningstjänsten Sentry. Mottagare får bara behandla uppgifter enligt våra instruktioner och i den utsträckning det behövs för sina uppdrag.",
      "Om personuppgifter behandlas utanför EU/EES ska sådan behandling omfattas av lämpliga skyddsåtgärder enligt tillämplig dataskyddslagstiftning.",
    ],
  },
  {
    title: "8. Hur länge uppgifter sparas",
    paragraphs: [
      "Vi sparar kontouppgifter och det innehåll du har sparat så länge du har ett aktivt konto eller så länge uppgifterna behövs för att leverera tjänsten till dig.",
      "Tekniska loggar, analysdata och felsökningsdata sparas normalt under en kortare period och gallras eller anonymiseras när de inte längre behövs för sina syften.",
      "När konto eller innehåll raderas tar vi bort uppgifterna, om vi inte måste behålla vissa uppgifter längre för att uppfylla lagkrav, hantera tvister eller skydda rättsliga anspråk.",
    ],
  },
  {
    title: "9. Säkerhet",
    paragraphs: [
      "Vi använder tekniska och organisatoriska säkerhetsåtgärder för att skydda personuppgifter mot obehörig åtkomst, förlust och missbruk. Ingen tjänst kan dock garanteras vara helt fri från säkerhetsrisker.",
    ],
  },
  {
    title: "10. Dina rättigheter",
    paragraphs: [
      "Du kan enligt gällande dataskyddsregler ha rätt att begära tillgång till dina uppgifter, rättelse, radering, begränsning av behandling, invändning mot viss behandling och dataportabilitet.",
      "Du har också rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY) om du anser att vår behandling strider mot tillämplig rätt.",
      "Om du vill utöva dina rättigheter eller har frågor om policyn kan du kontakta oss på jobbi.sh@proton.me.",
    ],
  },
  {
    title: "11. Ändringar i policyn",
    paragraphs: [
      "Vi kan uppdatera den här integritetspolicyn när tjänsten eller lagkraven förändras. Den senaste versionen publiceras alltid på den här sidan.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh px-4 py-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="space-y-6 rounded-[2rem] border border-app-stroke bg-white p-6 shadow-[0_10px_24px_rgba(17,23,40,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-primary">
            Jobi.sh
          </p>
          <h1 className="mt-3 text-4xl leading-none">
            Integritetspolicy (Privacy Policy)
          </h1>
          <p className="mt-4 max-w-2xl text-base text-app-muted">
            Senast uppdaterad: <strong>{PRIVACY_POLICY_UPDATED_AT}</strong>
          </p>
          <p className="mt-4 text-base leading-7 text-app-muted">
            Den här sidan är den fullständiga integritetspolicyn för Jobi.sh.
            Om du söker en kortare sammanfattning enligt GDPR kan du även läsa
            vår {" "}
            <Link
              className="font-semibold text-app-primary underline underline-offset-2"
              href="/gdpr"
            >
              GDPR-information
            </Link>
            .
          </p>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-app-stroke bg-white p-6 shadow-[0_10px_24px_rgba(17,23,40,0.08)]">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-2xl leading-tight">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-7 text-app-muted">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-app-muted">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
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
