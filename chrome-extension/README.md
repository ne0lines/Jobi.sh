# Jobi.sh aktivitetsrapport extension

Den här Chrome Extensionen tar emot ett jobb från `/aktivitetsrapport` i Jobi.sh och försöker fylla i formuläret på Arbetsförmedlingens sida för att lägga till en aktivitet.

Den lägger också till en knapp på platsannonser i Platsbanken så att du kan öppna Jobi.sh direkt på importflödet för annonsen.

## Vad den gör

1. Du klickar på `Rapportera hos AF` på ett jobb i Jobi.sh.
2. Extensionen sparar jobbet lokalt i Chrome.
3. Extensionen öppnar:

   `https://arbetsformedlingen.se/for-arbetssokande/mina-sidor/aktivitetsrapportera/lagg-till-aktivitet`

4. Ett content script försöker fylla i formulärfälten baserat på etiketter som `Arbetsgivare`, `Yrke`, `Datum`, `Ort` och aktivitetstyp.

## Publicering

Extensionen är tänkt att publiceras separat i Chrome Web Store, App Store för Safari och Firefox Add-ons.
Den här mappen används fortfarande för lokal utveckling, test och paketering inför respektive store-publicering.

## Installera lokalt

### Chrome <a id="install-chrome"></a>

1. Öppna `chrome://extensions` i Chrome.
2. Aktivera `Developer mode`.
3. Klicka på `Load unpacked`.
4. Välj mappen `chrome-extension` i projektroten.

### Safari <a id="install-safari"></a>

Safari-versionen är inte distribuerad här ännu. Den här guiden är platsen där Safari-stödet kan dokumenteras när en separat Safari Extension är paketerad.

### Firefox <a id="install-firefox"></a>

Firefox-versionen är inte distribuerad här ännu. Den här guiden är platsen där Firefox-stödet kan dokumenteras när en separat Firefox Extension är paketerad.

## Användning

1. Starta Jobi.sh.
2. Gå till `/aktivitetsrapport`.
3. Klicka på `Rapportera hos AF` på ett jobb.
4. Logga in hos Arbetsförmedlingen om det behövs.
5. Kontrollera att uppgifterna blev rätt ifyllda innan du sparar.

## Import från platsannons

1. Öppna en annons i Platsbanken, till exempel `https://arbetsformedlingen.se/platsbanken/annonser/...`.
2. Klicka på knappen `Lägg till i Jobi.sh` som extensionen visar nere till höger, eller högerklicka på en annonslänk och välj `Spara jobbannons i Jobi.sh`.
3. Extensionen öppnar Jobi.sh på `/jobb/new?url=<annonslänk>`.
4. Jobi.sh hämtar annonsdata via den befintliga importen från Arbetsförmedlingen.

## Viktigt

- Extensionen använder heuristik baserat på formulärets labels och attribut. Om Arbetsförmedlingen ändrar markup eller texter kan en eller flera selektorer behöva justeras.
- Importknappen på Platsbanken använder den senast kända Jobi.sh-origin som extensionen sett, eller faller tillbaka till `https://jobi.sh` om ingen Jobi.sh-flik har öppnats ännu.
- Högerklicksmenyn visas bara för länkar som pekar på `https://arbetsformedlingen.se/platsbanken/annonser/*`.
- Matchning finns för `localhost:3000`, `127.0.0.1:3000`, `jobi.sh` och subdomäner till `jobi.sh`. Lägg till fler URL:er i `manifest.json` om du kör appen på en annan domän.