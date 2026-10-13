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
- Hver kørsel med nye fund åbner et issue med `scan/report.md`.
