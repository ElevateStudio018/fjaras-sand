# Fjärås Sand & Makadam – hemsida och adminpanel

Hemsidan för AB Fjärås Sand & Makadam (grus, makadam, sand, jord, bark och sten med egna transporter, i Fjärås,
Kungsbacka) med adminpanel. Byggd på samma grund som Cabinord-hemsidan.

- Innehållet (texter, produkter, sidor, bilder, färger, typsnitt, företagsuppgifter) ligger i `content/baseline.json`;
  formatet beskrivs i `lib/site/schema.ts`. Kör `node scripts/sync-shared.mjs` efter ändringar i den eller i `lib/site`.
- Uppgifterna hämtas från fjarassand.se med `scripts/scrape-site.mjs` (arbetsflödet "Fetch the company's current
  website"). Rådata hamnar i `scrape/`, bilderna i `public/photos/site`.
- `SETUP.md` beskriver hur adminpanelen kopplas till Supabase.
