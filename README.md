# ApplyTrack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-149eca" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4" alt="Tailwind CSS 4" />
</p>

<p align="center">
  <strong>En mobile-first jobbtracker för att spara annonser, följa status och hålla koll på uppföljning.</strong>
</p>

<p align="center">
  ApplyTrack samlar hela jobbsökarflödet i en och samma app: från sparad annons till ansökan, intervju, rapportering och nästa steg.
</p>

![ApplyTrack Screens](public/ApplyTrack%20Screens.png)

## Innehåll

- [Översikt](#översikt)
- [Nuvarande funktionalitet](#nuvarande-funktionalitet)
- [Teknikstack](#teknikstack)
- [Kom igång](#kom-igång)
- [Scripts](#scripts)
- [Rutter](#rutter)
- [API-rutter](#api-rutter)
- [Datalagring](#datalagring)
- [Projektstruktur](#projektstruktur)
- [Kända begränsningar](#kända-begränsningar)

## Översikt

ApplyTrack är byggd för att ge en snabb och tydlig överblick över jobb du har sparat, sökt eller är i dialog om.

Appen fokuserar på tre saker:

- snabb registrering av nya jobb
- tydlig pipeline för status och historik
- praktisk uppföljning med rapportering och att-göra-punkter

## Nuvarande funktionalitet

I nuvarande version kan du:

- se en dashboard med att göra, pipeline, statistik och ApexChart
- lägga till jobb manuellt eller autofylla från Arbetsförmedlingen/Platsbanken via annonslänk
- förhindra dubbletter när samma annons redan finns sparad
- öppna en detaljvy för varje jobb
- uppdatera jobbstatus från detaljsidan
- ta bort jobb
- se aktivitetsrapport per månad på en separat rapportsida
- kopiera titel, företag och plats från rapporten till urklipp
- använda appen i ett mobile-first-gränssnitt med iOS-anpassade formulärfält

## Teknikstack

| Område | Val |
| --- | --- |
| Ramverk | Next.js 16 App Router |
| UI | React 19 |
| Språk | TypeScript |
| Styling | Tailwind CSS 4 |
| Diagram | ApexCharts + react-apexcharts |
| Datalagring | Lokala JSON-filer |
| Serverlogik | Next.js Route Handlers |

## Kom igång
| Script | Beskrivning |
| --- | --- |
| `npm run dev` | Startar Next.js i utvecklingsläge |
| `npm run build` | Skapar produktionsbuild |
| `npm run start` | Startar produktionsservern |
| `npm run lint` | Kör ESLint |

## Rutter

| Route | Syfte |
| --- | --- |
| `/` | Dashboard med att göra, pipeline och statistik |
| `/jobb/new` | Skapa nytt jobb via länk eller manuell inmatning |
| `/jobb/[jobId]` | Detaljsida för ett specifikt jobb |
| `/report` | Aktivitetsrapport med månadsfilter |

## API-rutter

| Route | Metoder | Syfte |
| --- | --- | --- |
| `/api/jobs` | `GET`, `POST` | Lista jobb och skapa nytt jobb |
| `/api/jobs/[jobId]` | `GET`, `PATCH`, `DELETE` | Hämta, uppdatera eller ta bort ett jobb |
| `/api/arbetsformedlingen` | `GET` | Hämta och normalisera annonsdata från Platsbanken |

## Datalagring

Appen använder i nuläget lokal filbaserad lagring.

Primär datafil:

- `src/server/db.json`

Tillhörande serverhjälpare:

- `src/server/db.ts`

Varje jobb innehåller bland annat:

- `id`
- `title`
- `company`
- `location`
- `employmentType`
- `workload`
- `jobUrl`
- `contactPerson`
- `timeline`
- `notes`
- `status`

Tillhörande TypeScript-typer finns i:

- `src/app/types.ts`

Exempel:

```json
{
  "applications": [
    {
      "id": "30752613",
      "title": "Webbansvarig/Webbstrateg",
      "company": "High Chaparral Sweden AB",
      "status": "in process"
    }
  ]
}
```

## Projektstruktur

```text
src/
  app/
    api/
      arbetsformedlingen/
      jobs/
    jobb/
      [jobId]/page.tsx
      new/page.tsx
    report/page.tsx
    globals.css
    layout.tsx
    page.tsx
    types.ts
  components/
    dashboard/
    report/
    ui/
  server/
    db.json
    db.ts
```

## Kända begränsningar

- Data sparas i lokala JSON-filer och är därför inte en robust produktionslösning.
- Om appen ska deployas för verklig användning bör `db.json` ersättas med en riktig databas.

## Status

Projektet är nu mer än en ren UI-prototyp. Det finns fungerande CRUD-flöden, rapportering, autofill från Platsbanken, statushantering, statistik och uppföljningslogik direkt i dashboarden.
