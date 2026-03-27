# ApplyTrack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-149eca" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-db-336791" alt="PostgreSQL" />
</p>

<p align="center">
  <strong>En mobile-first jobbtracker för ansökningar, uppföljning och pipeline-överblick.</strong>
</p>

<p align="center">
  ApplyTrack hjälper dig att hålla ihop hela jobbsökarflödet på ett ställe: från ny ansökan till intervju, uppföljning och nästa steg. Fokus ligger på tydlighet, tempo och ett gränssnitt som fungerar lika bra i mobilen som på större skärmar. ✨
</p>

![ApplyTrack Screens](public/ApplyTrack%20Screens-2.png)

## Innehåll

- [ApplyTrack](#applytrack)
  - [Innehåll](#innehåll)
  - [Vad appen gör](#vad-appen-gör)
  - [Highlights](#highlights)
  - [Teknikstack](#teknikstack)
  - [Kom igång](#kom-igång)
    - [Databas](#databas)
  - [Scripts](#scripts)
  - [Rutter](#rutter)
  - [Datamodell](#datamodell)
  - [Projektstruktur](#projektstruktur)
  - [Designsystem](#designsystem)
  - [Produktidé](#produktidé)
  - [Roadmap](#roadmap)
  - [Status](#status)

## Vad appen gör

ApplyTrack är byggd för att ge en snabb och tydlig överblick över aktiva jobbansökningar.

I nuvarande version kan du:

- se en dashboard med pipeline, statistik och påminnelser
- öppna en detaljvy för varje jobb via dynamisk route
- lägga till nya jobb via ett formulär
- använda lokal mock-data för att utveckla UI och flöden utan riktig backend

## Highlights

- 📱 Mobile-first från grunden
- 🧭 Tydlig pipeline för jobbstatus
- 📝 Detaljvy med kontaktperson, annonslänk och historik
- 🔐 Inloggning och sessionshantering med magic link
- 🗄️ PostgreSQL-databas via Prisma med fullt definierat schema
- 🤖 Auto-ifyllning av jobbinfo från Arbetsförmedlingens API
- 📊 Statistik och månatliga ansökningsgrafer med ApexCharts
- 🎯 Återanvändbara UI-komponenter med Tailwind
- 🔤 Inter som grundfont och Bricolage Grotesque för rubriker

## Teknikstack

| Område   | Val                                       |
| -------- | ----------------------------------------- |
| Ramverk  | Next.js 16                                |
| UI       | React 19                                  |
| Språk    | TypeScript                                |
| Styling  | Tailwind CSS 4                            |
| Databas  | PostgreSQL via Prisma 7                   |
| Auth     | Magic link – sessioner i httpOnly-cookies |
| Grafer   | ApexCharts                                |
| Mock-API | json-server                               |

## Kom igång

**1. Installera beroenden:**

```bash
npm install
```

**2. Konfigurera miljövariabler:**

Kopiera `.example.env` till `.env` och fyll i värdena:

```bash
cp .example.env .env
```

| Variabel | Beskrivning |
|---|---|
| `DATABASE_URL` | PostgreSQL-anslutningssträng |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key — hämtas från [dashboard.clerk.com](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Inloggningssida, t.ex. `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Redirect efter inloggning |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Redirect efter registrering |
| `SEED_USER_ID` | *(Valfritt)* Clerk user ID för att köra seed — hittas i Clerk-dashboarden |
| `SEED_USER_EMAIL` | *(Valfritt)* E-post kopplad till seed-användaren |

**3. Kör databasmigrationer:**

```bash
npx prisma migrate dev
```

**4. Starta appen:**

```bash
npm run dev
```

Appen körs på `http://localhost:3000`.

**5. (Valfritt) Importera exempeldata:**

Sätt `SEED_USER_ID` och `SEED_USER_EMAIL` i `.env`, kör sedan:

```bash
tsx prisma/seed.ts
```

## Scripts

| Script                | Beskrivning                                     |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Startar Next.js i utvecklingsläge               |
| `npm run mock-server` | Startar `json-server` med `src/server/db.json`  |
| `npm run dev:mock`    | Startar både Next.js och mock-servern samtidigt |
| `npm run build`       | Skapar produktionsbuild                         |
| `npm run start`       | Startar produktionsservern                      |
| `npm run lint`        | Kör ESLint                                      |

## Rutter

| Route           | Syfte                                          |
| --------------- | ---------------------------------------------- |
| `/`             | Dashboard med översikt, pipeline och statistik |
| `/jobb/new`     | Formulär för att lägga till ett nytt jobb      |
| `/jobb/[jobId]` | Dynamisk detaljsida för ett specifikt jobb     |

## Datamodell

Appen använder just nu en lokal datakälla i:

- `src/server/db.json`

Filen innehåller en `applications`-array där varje jobbpost består av bland annat:

- `id`
- `title`
- `company`
- `location`
- `employmentType`
- `workload`
- `jobUrl`
- `contactPerson`
- `timeline`

Tillhörande TypeScript-typer finns i:

- `src/app/types.ts`

Exempel på struktur:

```json
{
  "applications": [
    {
      "id": "1",
      "title": "UI Developer",
      "company": "PixelForge",
      "location": "Stockholm / Remote"
    }
  ]
}
```

## Projektstruktur

```text
src/
  app/
    jobb/
      [jobId]/page.tsx
      new/page.tsx
    globals.css
    layout.tsx
    page.tsx
    types.ts
  components/
    ui/
      btn.tsx
  server/
    db.json
```

## Designsystem

ApplyTrack är byggd med några tydliga designprinciper:

- mobile-first layout i hela appen
- Tailwind som enda stylingstrategi i komponenterna
- färger definieras i `globals.css` som variabler och exponeras som Tailwind-tokens
- Inter används som grundfont
- Bricolage Grotesque används för rubriker
- UI:t ska kännas enkelt, snabbt och tydligt snarare än tungt eller överdesignat

## Produktidé

Som användare vill jag kunna:

- lägga till jobb snabbt genom att klistra in eller fylla i information manuellt
- få en tydlig överblick över mina ansökningar
- följa historik, status och nästa steg för varje jobb
- undvika att missa uppföljningar eller deadlines

Nice to have framåt:

- se trender i min ansökningsprocess 📈
- filtrera jobb utifrån status
- skapa flera boards för olika karriärspår
- exportera data till PDF eller rapportformat
- få smarta påminnelser baserat på status och datum

## Roadmap

Nästa naturliga steg för projektet:

1. Rendera dashboarden dynamiskt från `db.json`
2. Koppla formuläret till mock-API eller riktig backend
3. Införa statusflöden som `Ansökt`, `Intervju`, `Erbjudande` och `Avslag`
4. Lägga till filtrering, sortering och sökning
5. Förbereda appen för riktig persistens med databas

## Status

Projektet är i ett tidigt produkt- och UI-skede, men har redan en tydlig struktur för vidareutveckling. README:n är skriven för att göra det snabbt att förstå appens riktning, köra den lokalt och bygga vidare utan att behöva läsa hela kodbasen först.

## Chrome Extension för aktivitetsrapport

Repot innehåller nu också en unpacked Chrome Extension i [chrome-extension](chrome-extension) som kan ta emot ett jobb från [src/components/report/report-page-client.tsx](src/components/report/report-page-client.tsx) och försöka fylla i aktivitetsrapporten hos Arbetsförmedlingen.

Snabbstart:

1. Öppna `chrome://extensions`.
2. Aktivera `Developer mode`.
3. Ladda in mappen `chrome-extension` via `Load unpacked`.
4. Gå till `/aktivitetsrapport` i appen och klicka på `Rapportera hos AF`.

Mer detaljer finns i [chrome-extension/README.md](chrome-extension/README.md).
