# Jobi.sh

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-149eca" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-db-336791" alt="PostgreSQL" />
</p>

<p align="center">
  <strong>En mobile-first jobbtracker för ansökningar, uppföljning och aktivitetsrapportering.</strong>
</p>

<p align="center">
  Jobi.sh samlar jobbsökarflödet på ett ställe: spara jobb, följ upp ansökningar, bygg en tydlig pipeline och exportera underlag till Arbetsförmedlingens aktivitetsrapport. Appen är byggd för att kännas snabb i mobilen men fungera lika bra på större skärmar.
</p>

## Innehåll

- [Översikt](#översikt)
- [Highlights](#highlights)
- [Teknikstack](#teknikstack)
- [Kom igång](#kom-igång)
- [Miljövariabler](#miljövariabler)
- [Scripts](#scripts)
- [Rutter](#rutter)
- [API-endpoints](#api-endpoints)
- [Datamodell](#datamodell)
- [Projektstruktur](#projektstruktur)
- [Observabilitet och analytics](#observabilitet-och-analytics)
- [Designsystem och PWA](#designsystem-och-pwa)
- [Browser extension](#browser-extension)

## Översikt

Jobi.sh är byggd för att ge en snabb och tydlig överblick över aktiva jobbansökningar.

- Dashboard med pipeline, statistik och påminnelser
- Detaljvy per jobb med kontaktperson, tidslinje och uppgifter
- Manuell registrering och import av jobbdata från Arbetsförmedlingens öppna API
- Aktivitetsrapport med månadsfiltrering och exportflöde mot Arbetsförmedlingen
- Autentisering och profilflöde via Clerk
- Stöd för arkivering av avslutade jobb

## Highlights

- Mobile-first UI byggt för högt tempo i jobbsökandet
- Tydlig pipeline för jobbstatus: sparad, ansökt, pågår, intervju, erbjudande, avslutad
- Integrerad import från Arbetsförmedlingens annonsdata
- Browser extension-flöde för aktivitetsrapportering och Platsbanken-import
- PostgreSQL via Prisma med tydliga relationer mellan jobb, kontakter, tidslinje och tasks
- TanStack Query för klient-cache och uppdateringar
- Sentry för felspårning och prestanda
- PostHog för anonym produktanalys utan personprofiler

## Teknikstack

| Område | Val |
| --- | --- |
| Ramverk | Next.js 16 med App Router |
| UI | React 19 |
| Språk | TypeScript |
| Styling | Tailwind CSS 4 |
| Databas | PostgreSQL via Prisma 7 |
| Auth | Clerk |
| Datahantering | TanStack Query v5 |
| Observabilitet | Sentry |
| Analytics | PostHog |
| Diagram | ApexCharts |
| Mock-data | json-server |

## Kom igång

**1. Installera beroenden**

```bash
npm install
```

**2. Skapa lokal miljöfil**

```bash
cp .example.env .env.local
```

**3. Fyll i nödvändiga miljövariabler**

Minst databas och Clerk behöver vara satta för att appen ska fungera lokalt.

**4. Kör databasmigrationer**

```bash
npx prisma migrate dev
```

**5. Starta utvecklingsservern**

```bash
npm run dev
```

Appen körs sedan på `http://localhost:3000`.

**6. Valfritt: lägg in seed-data**

```bash
npx tsx prisma/seed.ts
```

Sätt då `SEED_USER_ID` och `SEED_USER_EMAIL` i `.env.local` först.

Om du vill köra med lokal mock-server parallellt finns även:

```bash
npm run dev:mock
```

## Miljövariabler

Utgå från `.example.env`.

| Variabel | Beskrivning |
| --- | --- |
| `DATABASE_URL` | PostgreSQL-anslutningssträng för Prisma |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Inloggningssida, normalt `/auth` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Redirect efter inloggning |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Redirect efter registrering |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN |
| `SENTRY_ORG` | Sentry organisation |
| `SENTRY_PROJECT` | Sentry projekt |
| `SENTRY_AUTH_TOKEN` | Auth token för source map-upload vid build |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host, normalt `https://eu.i.posthog.com` |
| `NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY` | Publik VAPID-nyckel för browser subscriptions |
| `WEB_PUSH_VAPID_PRIVATE_KEY` | Privat VAPID-nyckel som servern använder vid utskick |
| `WEB_PUSH_CONTACT_EMAIL` | Kontaktmail som skickas med VAPID-signaturen, t.ex. `you@example.com` |
| `TODO_NOTIFICATIONS_CRON_SECRET` | Delad hemlighet för den skyddade cron-routen som skickar todo-notiser |
| `SEED_USER_ID` | Valfri Clerk user ID för seed-script |
| `SEED_USER_EMAIL` | Valfri e-post för seed-script |

## Scripts

| Script | Beskrivning |
| --- | --- |
| `npm run dev` | Startar Next.js i utvecklingsläge |
| `npm run mock-server` | Startar `json-server` på port `3001` med `src/server/db.json` |
| `npm run dev:mock` | Startar både Next.js och mock-servern samtidigt |
| `npm run build` | Skapar produktionsbuild och kör Sentry-integrationen i Next-konfigurationen |
| `npm run start` | Startar produktionsservern |
| `npm run lint` | Kör ESLint |
| `npm run auth:reset-password` | Kör reset-script för auth-flödet |

## Rutter

Några centrala sidor i appen:

| Route | Typ | Beskrivning |
| --- | --- | --- |
| `/` | Server | Dashboard med jobböversikt |
| `/auth` | Server/Client | Clerk-baserat auth-flöde |
| `/jobb` | Server | Lista över jobb |
| `/jobb/new` | Client | Skapa nytt jobb eller importera från annonslänk |
| `/jobb/[jobId]` | Client | Detaljsida för ett jobb |
| `/jobb/[jobId]/edit` | Client | Redigera befintligt jobb |
| `/konto` | Client | Kontosida |
| `/konto/create-profile` | Client | Skapa eller komplettera användarprofil |
| `/aktivitetsrapport` | Server | Rapportvy för Arbetsförmedlingen |
| `/report` | Server | Delad report-datakälla i egen vy |
| `/extension` | Server | Info om browser extension och store-länkar |
| `/privacy` | Server | Integritetspolicy |
| `/terms` | Server | Användarvillkor |
| `/gdpr` | Server | GDPR-information och cookie-relaterad info |

Publika sidor är auth- och legalsidorna. Övriga sidor skyddas via Clerk-middleware och profilkontroll.

## API-endpoints

Alla endpoints ligger under `/api/`:

| Endpoint | Metoder | Beskrivning |
| --- | --- | --- |
| `/api/user` | `GET`, `POST` | Hämtar eller skapar användarprofil |
| `/api/jobs` | `GET`, `POST` | Hämtar jobb eller skapar nytt jobb |
| `/api/jobs/[jobId]` | `GET`, `PATCH`, `DELETE` | Hämtar, uppdaterar, arkiverar eller tar bort jobb |
| `/api/notifications/push-subscription` | `GET`, `POST`, `DELETE` | Läser och hanterar browser subscriptions för pushnotiser |
| `/api/cron/todo-notifications` | `POST` | Skyddad intern route som skickar pushnotiser när ett nytt todo blir aktivt |
| `/api/arbetsformedlingen` | `GET` | Hämtar jobbdata från Arbetsförmedlingens öppna API |
| `/api/sentry-example-api` | `GET` | Exempelroute för Sentry-testning |

Notera att auth-flödet ligger i app-routen `/auth` snarare än i en traditionell `/api/auth`-endpoint.

## Datamodell

Schemat finns i `prisma/schema.prisma` och Prisma-klienten genereras till `src/app/generated/prisma`.

### User

| Fält | Typ | Beskrivning |
| --- | --- | --- |
| `id` | `String` | Användar-ID |
| `email` | `String` | Unik e-postadress |
| `name` | `String` | Namn |
| `profession` | `String` | Yrke eller roll |
| `role` | `Enum` | `user` eller `admin` |
| `complete` | `Boolean` | Om profilen är komplett |
| `termsAcceptedAt` | `DateTime?` | När användaren godkände villkoren |
| `termsVersion` | `String?` | Version av godkända villkor |

### Job

| Fält | Typ | Beskrivning |
| --- | --- | --- |
| `id` | `String` | Jobb-ID |
| `userId` | `String` | Ägare till jobbet |
| `title` | `String` | Jobbtitel |
| `company` | `String` | Företagsnamn |
| `location` | `String` | Ort |
| `employmentType` | `String` | Anställningsform |
| `workload` | `String` | Omfattning |
| `jobUrl` | `String` | Ursprunglig annonslänk |
| `status` | `Enum` | `saved`, `applied`, `in_process`, `interview`, `offer`, `closed` |
| `notes` | `String` | Fritextanteckningar |
| `startDate` | `DateTime?` | Eventuell startdag |
| `closingDate` | `DateTime?` | Sista ansökningsdag |
| `archivedAt` | `DateTime?` | Sätter att jobbet är arkiverat |

### Relationer

- `Job` har en valfri `ContactPerson`
- `Job` har flera `TimelineItem`
- `Job` har flera `Task`
- `User` har flera jobb och tasks

App-typerna som används i frontend finns i `src/app/types.ts`.

## Pushnotiser

Appen har stöd för web push-notiser för nya `Att göra`-poster.

- Användaren aktiverar pushnotiser från kontosidan.
- Användaren kan slå av eller på kategorierna `Att göra` och `Tips` var för sig från kontosidan.
- Browser subscription sparas i databasen.
- En skyddad cron-route räknar fram aktuella todos och skickar bara notiser för poster som inte redan har levererats till användaren.
- Om användaren inte har något aktivt todo den dagen väljs ett dagligt jobbsökartips från `src/data/job-search-tips.json`.
- Todo-notiser har alltid högre prioritet än tips.
- Service workern visar notisen och öppnar rätt jobbsida vid klick.

Exempel på manuell körning av cron-routen:

```bash
curl -X POST http://localhost:3000/api/cron/todo-notifications \
  -H "Authorization: Bearer $TODO_NOTIFICATIONS_CRON_SECRET"
```

Om du vill testa utskicket manuellt utanför den schemalagda tiden 09:00 kan du forcera körningen:

```bash
curl -X POST "http://localhost:3000/api/cron/todo-notifications?force=1" \
  -H "Authorization: Bearer $TODO_NOTIFICATIONS_CRON_SECRET"
```

Produktionsschemat är tänkt att köras kl 09:00 svensk tid varje dag. Eftersom hostingplattformar ofta använder UTC triggas routen två gånger, `07:00` och `08:00` UTC, och routen själv avgör vilken körning som motsvarar 09:00 i `Europe/Stockholm`.

För att funktionen ska fungera i drift behöver du koppla den routen till en scheduler, till exempel via hostingplattformens cron-stöd eller en extern schemaläggare.

Om du kör på Vercel kan du använda `vercel.json` i repo:t och sätta `CRON_SECRET` till samma värde som `TODO_NOTIFICATIONS_CRON_SECRET`.

## Projektstruktur

```text
src/
  app/
    api/
      arbetsformedlingen/
      jobs/
        [jobId]/
      sentry-example-api/
      user/
    auth/[[...auth]]/
    aktivitetsrapport/
    extension/
    gdpr/
    generated/prisma/
    jobb/
      [jobId]/
        edit/
      new/
    konto/
      create-profile/
    loader/
    privacy/
    report/
    sentry-example-page/
    services/
    terms/
    error.tsx
    global-error.tsx
    layout.tsx
    manifest.ts
    page.tsx
    types.ts
  components/
    account/
    analytics/
    auth/
    dashboard/
    gdpr/
    jobs/
    navigation/
    providers/
    pwa/
    report/
    ui/
  lib/
    analytics.ts
    extension-install.ts
    legal.ts
    logger.ts
    posthog-server.ts
    prisma.ts
    theme.ts
    utils.ts
  instrumentation.ts
  instrumentation-client.ts
  proxy.ts
prisma/
  migrations/
  schema.prisma
  seed.ts
chrome-extension/
  manifest.json
  background.js
  content-af.js
  content-jobish.js
  content-platsbanken.js
```

## Observabilitet och analytics

Appen har två separata spår för produktionstelemetri:

- Sentry för felövervakning, traces och replay-stöd
- PostHog för anonyma produkt- och klickevent

Nuvarande implementation i koden innebär bland annat:

- Sentry initieras för klient, server och edge
- Next-konfigurationen tunnlar Sentry-trafik via `/monitoring`
- Session replay i Sentry maskerar text och blockerar media
- PostHog körs utan personprofiler, utan autocapture och utan beständig lagring
- Server-side event skickas även vid skapande av jobb för att inte tappas vid navigation

## Designsystem och PWA

- Tailwind CSS 4 används genom hela appen
- Typografi laddas via `next/font` med Geist, Inter och Bricolage Grotesque
- Temahantering och initialisering finns i `src/lib/theme.ts`
- Service worker registreras från klienten via `src/components/pwa/register-service-worker.tsx`
- Web app manifest exponeras via `src/app/manifest.ts`

## Browser extension

Repot innehåller en lokal browser extension i `chrome-extension/` som knyter ihop Jobi.sh med Arbetsförmedlingens aktivitetsrapport och Platsbanken.

Den används till två huvudsakliga flöden:

1. Skicka jobb från `/aktivitetsrapport` till Arbetsförmedlingens formulär.
2. Lägg till jobb från Platsbanken direkt till `/jobb/new`.

### Lokal installation i Chrome

1. Öppna `chrome://extensions`
2. Aktivera `Developer mode`
3. Välj `Load unpacked`
4. Peka på mappen `chrome-extension`

Chrome-mappen används även som bas för fortsatt paketering mot Chrome Web Store, Safari och Firefox. Store-länkarna exponeras i appen på `/extension` när publicering finns på plats.

Mer detaljer finns i [chrome-extension/README.md](chrome-extension/README.md).
