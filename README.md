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
  ApplyTrack hjälper dig att hålla ihop hela jobbsökarflödet på ett ställe: från ny ansökan till intervju, uppföljning och nästa steg. Fokus ligger på tydlighet, tempo och ett gränssnitt som fungerar lika bra i mobilen som på större skärmar.
</p>

![ApplyTrack Screens](public/ApplyTrack%20Screens-2.png)

## Innehåll

- [Vad appen gör](#vad-appen-gör)
- [Highlights](#highlights)
- [Teknikstack](#teknikstack)
- [Kom igång](#kom-igång)
- [Scripts](#scripts)
- [Rutter](#rutter)
- [API-endpoints](#api-endpoints)
- [Datamodell](#datamodell)
- [Projektstruktur](#projektstruktur)
- [Designsystem](#designsystem)
- [Chrome Extension](#chrome-extension-för-aktivitetsrapport)

## Vad appen gör

ApplyTrack är byggd för att ge en snabb och tydlig överblick över aktiva jobbansökningar.

- Dashboard med pipeline, statistik och påminnelser
- Detaljvy per jobb med kontaktperson, tidslinje och uppgifter
- Auto-ifyllning av jobbdata från Arbetsförmedlingens API
- Aktivitetsrapport för Arbetsförmedlingen med exportfunktion
- Fullt autentiseringsflöde med profilskapande

## Highlights

- 📱 Mobile-first från grunden
- 🧭 Tydlig pipeline för jobbstatus (Sparad → Ansökt → Pågår → Intervju → Erbjudande → Avslutad)
- 🤖 Auto-ifyllning av jobbinfo från Arbetsförmedlingens öppna API
- 🔐 Autentisering via Clerk med profilflöde
- 🗄️ PostgreSQL-databas via Prisma med fullt definierat schema
- ⚡ TanStack Query för optimistisk datahantering och cache
- 📊 Aktivitetsgrafer med ApexCharts
- 🛡️ Felövervakning, prestanda och sessionsinspelning via Sentry
- 🎨 Tailwind CSS 4 med designtokens

## Teknikstack

| Område              | Val                          |
| ------------------- | ---------------------------- |
| Ramverk             | Next.js 16 (App Router)      |
| UI                  | React 19                     |
| Språk               | TypeScript                   |
| Styling             | Tailwind CSS 4               |
| Databas             | PostgreSQL via Prisma 7       |
| Auth                | Clerk                        |
| Datahantering       | TanStack Query v5            |
| Felövervakning      | Sentry                       |
| Notifikationer      | Sonner                       |
| Grafer              | ApexCharts                   |
| Mock-API            | json-server                  |

## Kom igång

**1. Installera beroenden:**

```bash
npm install
```

**2. Konfigurera miljövariabler:**

Kopiera `.example.env` till `.env.local` och fyll i värdena:

```bash
cp .example.env .env.local
```

| Variabel | Beskrivning |
|---|---|
| `DATABASE_URL` | PostgreSQL-anslutningssträng |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key — hämtas från [dashboard.clerk.com](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Inloggningssida, t.ex. `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Redirect efter inloggning |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Redirect efter registrering |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN — hämtas från [sentry.io](https://sentry.io) |
| `SENTRY_ORG` | Sentry organisation-slug |
| `SENTRY_PROJECT` | Sentry projektnamn |
| `SENTRY_AUTH_TOKEN` | Sentry auth token för source map-uppladdning (enbart vid bygge) |
| `SEED_USER_ID` | *(Valfritt)* Clerk user ID för att köra seed |
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

Sätt `SEED_USER_ID` och `SEED_USER_EMAIL` i `.env.local`, kör sedan:

```bash
tsx prisma/seed.ts
```

## Scripts

| Script                | Beskrivning                                      |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Startar Next.js i utvecklingsläge (Turbopack)    |
| `npm run mock-server` | Startar `json-server` med `src/server/db.json`   |
| `npm run dev:mock`    | Startar både Next.js och mock-servern samtidigt  |
| `npm run build`       | Skapar produktionsbuild (inkl. source map-upload till Sentry) |
| `npm run start`       | Startar produktionsservern                       |
| `npm run lint`        | Kör ESLint                                       |

## Rutter

| Route                     | Typ    | Beskrivning                                        |
| ------------------------- | ------ | -------------------------------------------------- |
| `/`                       | Server | Dashboard med pipeline, statistik och påminnelser  |
| `/jobb/new`               | Client | Formulär för att lägga till ett nytt jobb          |
| `/jobb/[jobId]`           | Client | Detaljsida för ett specifikt jobb                  |
| `/konto`                  | Client | Kontosida                                          |
| `/konto/create-profile`   | Client | Profilskapande efter registrering via Clerk        |
| `/aktivitetsrapport`      | Server | Aktivitetsrapport för Arbetsförmedlingen           |
| `/report`                 | Client | Legacy-rapportsida                                 |

## API-endpoints

Alla endpoints under `/api/`:

| Endpoint                     | Metoder          | Beskrivning                          |
| ---------------------------- | ---------------- | ------------------------------------ |
| `/api/[[...auth]]`           | —                | Clerks catch-all auth-hanterare      |
| `/api/user`                  | GET, POST        | Hämta eller skapa användarprofil     |
| `/api/jobs`                  | GET, POST        | Lista eller skapa jobbansökningar    |
| `/api/jobs/[jobId]`          | GET, PATCH, DELETE | Hämta, uppdatera eller ta bort jobb |
| `/api/arbetsformedlingen`    | GET              | Hämta jobbdata från AF:s öppna API  |

## Datamodell

Appen använder PostgreSQL via Prisma. Schemat finns i `prisma/schema.prisma`.

**Job**

| Fält             | Typ      | Beskrivning                                    |
| ---------------- | -------- | ---------------------------------------------- |
| `id`             | String   | Unikt ID                                       |
| `userId`         | String   | Clerk user ID                                  |
| `title`          | String   | Jobbtitel                                      |
| `company`        | String   | Företagsnamn                                   |
| `location`       | String   | Ort                                            |
| `employmentType` | String   | Anställningsform (Tillsvidare, Visstid m.m.)   |
| `workload`       | String   | Omfattning (Heltid, Deltid)                    |
| `jobUrl`         | String   | Länk till jobbannons                           |
| `status`         | Enum     | saved · applied · in_process · interview · offer · closed |
| `notes`          | String   | Anteckningar                                   |
| `contactPerson`  | Relation | Kontaktperson (namn, roll, e-post, telefon)    |
| `timeline`       | Relation | Tidslinje med statusändringar och händelser    |
| `tasks`          | Relation | Uppgifter kopplade till jobbet                 |

**User**

| Fält              | Typ     | Beskrivning                   |
| ----------------- | ------- | ----------------------------- |
| `id`              | String  | Clerk user ID                 |
| `email`           | String  | E-postadress                  |
| `name`            | String  | Namn                          |
| `profession`      | String  | Yrke                          |
| `role`            | Enum    | user · admin                  |
| `complete`        | Boolean | Profil fullständig            |
| `termsAcceptedAt` | DateTime | Tidpunkt för godkännande av villkor |
| `termsVersion`    | String  | Version av villkor som godkänts |

TypeScript-typer finns i `src/app/types.ts`.

## Projektstruktur

```text
src/
  app/
    api/
      [[...auth]]/     Clerk auth-hanterare
      arbetsformedlingen/
      jobs/
        [jobId]/
      user/
    aktivitetsrapport/
    jobb/
      [jobId]/
      new/
    konto/
      create-profile/
    report/
    generated/prisma/  Genererad Prisma-klient
    globals.css
    layout.tsx
    page.tsx
    types.ts
    error.tsx          Route-nivå felgräns (Sentry)
    global-error.tsx   Global felgräns (Sentry)
  components/
    auth/
    dashboard/
    navigation/
    providers/
      query-provider.tsx
      sentry-user-provider.tsx
    pwa/
    report/
    ui/
  lib/
    hooks/             TanStack Query hooks och query-client
    logger.ts          Strukturerad server-loggning
    prisma.ts
    utils.ts
  server/
    db.json            Mock-data för json-server
    queries.ts         Server-side Prisma-queries
prisma/
  schema.prisma
  seed.ts
sentry.client.config.ts
sentry.server.config.ts
sentry.edge.config.ts
```

## Observabilitet

Appen använder Sentry för felövervakning, prestandamätning och Real User Monitoring:

- **Felövervakning** — Okantade undantag fångas automatiskt på klient och server
- **Prestanda** — Distribuerade traces och Core Web Vitals
- **Sessionsinspelning** — All text maskeras i inspelningar (GDPR)
- **Strukturerad loggning** — `src/lib/logger.ts` skriver JSON i produktion och läsbar text i utvecklingsläge
- **Felgränser** — `error.tsx` och `global-error.tsx` fångar React-fel och rapporterar till Sentry

## Designsystem

- Mobile-first layout i hela appen (basstorlek 14px ≤430px, 16px på desktop)
- Tailwind CSS 4 som enda stylingstrategi
- Designtokens definierade i `globals.css` (`--app-bg`, `--app-ink`, `--app-primary`, `--app-surface` m.fl.)
- Inter som grundfont, Bricolage Grotesque för rubriker och display-text
- UI:t ska kännas enkelt, snabbt och tydligt

## Chrome Extension för aktivitetsrapport

Repot innehåller en unpacked Chrome Extension i [chrome-extension](chrome-extension) som kan ta emot jobbdata från `/aktivitetsrapport` och försöka fylla i aktivitetsrapporten hos Arbetsförmedlingen.

Snabbstart:

1. Öppna `chrome://extensions`
2. Aktivera `Developer mode`
3. Ladda in mappen `chrome-extension` via `Load unpacked`
4. Gå till `/aktivitetsrapport` i appen och klicka på `Rapportera hos AF`

Mer detaljer finns i [chrome-extension/README.md](chrome-extension/README.md).
