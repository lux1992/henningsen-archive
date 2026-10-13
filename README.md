# Henningsen-arkivet

Officielle digitale kilder om Poul Henningsens lamper: kataloger, produktark, patenter, museumsgenstande, tidsskrifter og film. Ingen salgsopslag.

- `sources.js` – kilderne. Tilføj nye objekter her.
- `models.js` – lampemodellerne med fakta og kildehenvisninger.
- `thumbs/` – miniaturer. Rettighederne tilhører de respektive udgivere; de vises kun som henvisning til kilden.

Statisk side uden byggetrin. Kør lokalt med `python3 -m http.server`.

## Automatisk scanning
`.github/workflows/scan.yml` kører `node scan/scan.js` hver mandag kl. 05 UTC. Du kan også starte den under Actions → scan → Run workflow, eller køre den lokalt.
- Nye kilder fra museers API'er, Louis Poulsens sitemap, Internet Archive, Europeana og DigitaltMuseum skrives til `found.js` og vises på siden som "ikke gennemgået". Når en kilde er tjekket, flyttes den til `sources.js`. Er den støj, slettes den fra `found.js`. URL'en ligger i `scan/seen.txt`, så den kommer ikke igen.
- Butikker bruges kun til at opdage modelnavne. Ukendte navne gemmes i `scan/names.json`.
- Alle kilder i `sources.js` tjekkes for døde links. Svarer en side 404/410 (eller findes domænet ikke) to uger i træk, peges kilden om til nærmeste kopi i Wayback Machine, og den gamle adresse gemmes i `"original"`. Uden kopi står den kun i rapporten. Afvisninger og timeouts ignoreres, da mange museer blokerer bots. Tilstanden ligger i `scan/dead.json`; `LINKS=0` springer tjekket over.
- Hver kørsel med nye fund eller døde links åbner et issue med `scan/report.md`.

## Udvikling

Sitet er bygget med Next.js som statiske sider. Data ligger i `data/` (kilder, lamper, åbne spørgsmål, datering, Commons-fotos).

- `npm run dev` starter en lokal server på http://127.0.0.1:8794
- `npm run build` bygger hele sitet til `out/`, som kan lægges på enhver statisk host (Cloudflare Pages: build-kommando `npm run build`, output `out`).
