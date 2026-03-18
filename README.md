# ApplyTrack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-149eca" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/json--server-mock_api-fc427b" alt="json-server" />
</p>

<p align="center">
  <strong>En mobile-first jobbtracker för ansökningar, uppföljning och pipeline-överblick.</strong>
</p>

<p align="center">
  ApplyTrack hjälper dig att hålla ihop hela jobbsökarflödet på ett ställe: från ny ansökan till intervju, uppföljning och nästa steg. Fokus ligger på tydlighet, tempo och ett gränssnitt som fungerar lika bra i mobilen som på större skärmar. ✨
</p>

![ApplyTrack Screens](public/ApplyTrack%20Screens.png)

## Innehåll

- [Vad appen gör](#vad-appen-gör)
- [Highlights](#highlights)
- [Teknikstack](#teknikstack)
- [Kom igång](#kom-igång)
- [Scripts](#scripts)
- [Rutter](#rutter)
- [Datamodell](#datamodell)
- [Projektstruktur](#projektstruktur)
- [Designsystem](#designsystem)
- [Produktidé](#produktidé)
- [Roadmap](#roadmap)

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
- 🎯 Återanvändbara UI-komponenter med Tailwind
- 🗃️ Mock-backend via `json-server`
- 🔤 Inter som grundfont och Bricolage Grotesque för rubriker

## Teknikstack

| Område | Val |
| --- | --- |
| Ramverk | Next.js 16 |
| UI | React 19 |
| Språk | TypeScript |
| Styling | Tailwind CSS 4 |
| Mock-API | json-server |
| Datakälla | `src/server/db.json` |

## Kom igång

Installera beroenden:

```bash
npm install
```

Starta frontend:

```bash
npm run dev
```

Starta frontend och mock-server samtidigt:

```bash
npm run dev:mock
```

Mock-servern kör på `http://localhost:3001` och använder data från `src/server/db.json`.

Bygg för produktion:

```bash
npm run build
```

Starta produktionsserver:

```bash
npm run start
```

Kör lint:

```bash
npm run lint
```

## Scripts

| Script | Beskrivning |
| --- | --- |
| `npm run dev` | Startar Next.js i utvecklingsläge |
| `npm run mock-server` | Startar `json-server` med `src/server/db.json` |
| `npm run dev:mock` | Startar både Next.js och mock-servern samtidigt |
| `npm run build` | Skapar produktionsbuild |
| `npm run start` | Startar produktionsservern |
| `npm run lint` | Kör ESLint |

## Rutter

| Route | Syfte |
| --- | --- |
| `/` | Dashboard med översikt, pipeline och statistik |
| `/jobb/new` | Formulär för att lägga till ett nytt jobb |
| `/jobb/[jobId]` | Dynamisk detaljsida för ett specifikt jobb |

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
