// Ugentlig scanning efter nye PH-kilder. Kører i GitHub Actions (se .github/workflows/scan.yml) eller lokalt: node scan/scan.js
// Kun faste, åbne kilder (museers API'er, Louis Poulsens sitemap, Internet Archive, Europeana, DigitaltMuseum).
// Nye fund skrives til found.js og vises på siden som "ikke gennemgået". Butikker bruges kun til at opdage modelnavne, aldrig som kilder.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const load = (f, name) => new Function(fs.readFileSync(path.join(ROOT, f), 'utf8') + `;return ${name}`)();
const SOURCES = load('sources.js', 'SOURCES'), MODELS = load('models.js', 'MODELS');
const FOUND = fs.existsSync(path.join(ROOT, 'found.js')) ? load('found.js', 'FOUND') : [];
const NAMES_F = path.join(__dirname, 'names.json');
const NAMES = fs.existsSync(NAMES_F) ? JSON.parse(fs.readFileSync(NAMES_F, 'utf8')) : {};
// Alle URL'er scanningen har tilføjet. Slettede fund kommer derfor ikke igen.
const SEEN_F = path.join(__dirname, 'seen.txt');
const SEEN = fs.existsSync(SEEN_F) ? fs.readFileSync(SEEN_F, 'utf8').split('\n').filter(Boolean) : [];
const TODAY = new Date().toISOString().slice(0, 10);
const UA = 'Mozilla/5.0 (compatible; ph-archive-scan/1.0; +https://lux1992.github.io/henningsen-archive/)';
const SHOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const get = async (url, ua = UA) => {
  const r = await fetch(url, { headers: { 'user-agent': ua, accept: '*/*' }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
};
const json = async url => JSON.parse(await get(url));
const q = encodeURIComponent('"Poul Henningsen"');
// Kræver både PH og noget med lys/lamper, så portrætter og bøger om andet falder fra
const ABOUT_PH = /henningsen|\bph[\s-]?\d|\bph[\s-]?lamp/i;
const ABOUT_LAMP = /lamp|lampe|lampa|leuchte|luminaire|pendel|pendant|chandelier|lysekrone|belysning|lighting|skærm|shade|artichoke|kogle|snowball|snebold|septima|louvre/i;
const relevant = s => ABOUT_PH.test(s.title + ' ' + s.description + ' ' + s.publisher) && ABOUT_LAMP.test(s.title + ' ' + s.description);
const norm = u => u.toLowerCase().replace(/^https?:\/\/web\.archive\.org\/web\/[^/]+\//, '').replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/+$/, '');

// Hver kilde returnerer {title,url,publisher,year,type,language,description}
const COLLECTORS = {
  async vam() {
    const d = await json(`https://api.vam.ac.uk/v2/objects/search?q=${q}&page_size=100`);
    return d.records.map(r => ({ title: r._primaryTitle || r.objectType, url: `https://collections.vam.ac.uk/item/${r.systemNumber}/`, publisher: 'Victoria and Albert Museum', year: r._primaryDate || '', type: 'museum', language: 'en', description: `${r.objectType}, ${r._primaryMaker?.name || ''}` }));
  },
  async met() {
    const d = await json(`https://collectionapi.metmuseum.org/public/collection/v1.1/search?q=${q}&limit=100`);
    const out = [];
    for (const id of d.objectIDs || []) {
      const o = await json(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
      if (/henningsen/i.test(o.artistDisplayName)) out.push({ title: o.title, url: o.objectURL, publisher: 'The Metropolitan Museum of Art', year: o.objectDate, type: 'museum', language: 'en', description: `${o.objectName}, ${o.artistDisplayName}. ${o.medium}` });
    }
    return out;
  },
  async aic() {
    const d = await json(`https://api.artic.edu/api/v1/artworks/search?q=${q}&limit=100&fields=id,title,date_display,artist_title,medium_display`);
    return d.data.filter(a => /henningsen/i.test(a.artist_title)).map(a => ({ title: a.title, url: `https://www.artic.edu/artworks/${a.id}`, publisher: 'Art Institute of Chicago', year: a.date_display || '', type: 'museum', language: 'en', description: `${a.artist_title}. ${a.medium_display || ''}` }));
  },
  async smk() {
    const d = await json(`https://api.smk.dk/api/v1/art/search/?keys=${q}&offset=0&rows=100&lang=da`);
    return (d.items || []).map(i => ({ title: i.titles?.[0]?.title || i.object_number, url: `https://open.smk.dk/artwork/image/${i.object_number}`, publisher: 'Statens Museum for Kunst', year: i.production_date?.[0]?.period || '', type: 'museum', language: 'da', description: [i.object_names?.[0]?.name, i.production?.map(p => p.creator).join(', '), i.content_description?.join(' ')].filter(Boolean).join('. ') }));
  },
  async dimu() {
    const d = await json(`https://api.dimu.org/api/solr/select?q=${q}&wt=json&rows=200&api.key=demo`);
    return d.response.docs.filter(o => !/^thingiverse-/.test(o.identifier)).map(o => ({ title: o['artifact.ingress.title'] || o['identifier.id'], url: `https://digitaltmuseum.org/${o['artifact.uniqueId']}`, publisher: `DigitaltMuseum (${o['identifier.owner']})`, year: String(o['artifact.ingress.production.fromYear'] || ''), type: 'museum', language: 'no', description: [o['artifact.ingress.producer'], o['artifact.ingress.classification']?.join?.(', '), o['artifact.ingress.description']].filter(Boolean).join('. ') }));
  },
  async europeana() {
    const d = await json(`https://api.europeana.eu/record/v2/search.json?wskey=api2demo&query=${q}&rows=100`);
    return (d.items || []).map(i => ({ title: i.title?.[0] || '', url: (i.guid || '').replace(/\?.*$/, ''), publisher: i.dataProvider?.[0] || 'Europeana', year: i.year?.[0] || '', type: 'arkiv', language: i.language?.[0] || '', description: i.dcDescription?.[0] || '' }));
  },
  async archive() {
    const d = await json(`https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier&fl[]=title&fl[]=year&fl[]=mediatype&fl[]=description&fl[]=creator&rows=300&output=json`);
    const T = { texts: 'bog', movies: 'video' };
    return d.response.docs.filter(o => !/^thingiverse-/.test(o.identifier)).map(o => ({ title: [].concat(o.title)[0] || o.identifier, url: `https://archive.org/details/${o.identifier}`, publisher: 'Internet Archive' + (o.creator ? ` (${[].concat(o.creator)[0]})` : ''), year: String(o.year || ''), type: T[o.mediatype] || 'arkiv', language: '', description: String([].concat(o.description || '')[0]).replace(/<[^>]+>/g, ' ').slice(0, 400) }));
  },
  async louispoulsen() {
    // Kun redaktionelle sider (presse, reflections, om PH). Produktsider bruges til modelnavne nedenfor.
    const xml = await get('https://www.louispoulsen.com/en/sitemap.xml');
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).filter(u => /\/(ph-|[^/]*henningsen)/i.test(u)).map(u => {
      const slug = u.split('/').pop().replace(/-+/g, ' ').replace(/\bph\b/gi, 'PH');
      return { title: slug[0].toUpperCase() + slug.slice(1), url: u, publisher: 'Louis Poulsen', year: '', type: /\/press\/|\/reflections\//.test(u) ? 'artikel' : 'hjemmeside', language: 'en', description: 'Side om PH-lamper hos Louis Poulsen (fundet via sitemap).' };
    });
  },
};

// Steder hvor modelnavne dukker op. Kun navnene bruges; siderne bliver ikke kilder.
const NAME_PAGES = [
  ['https://www.louispoulsen.com/en/commercesitemap.xml', UA],
  ['https://www.ambientedirect.com/en/search/?q=louis+poulsen+ph', SHOP_UA],
  ['https://www.pamono.eu/catalogsearch/result/?q=poul+henningsen', SHOP_UA],
  ['https://www.1stdibs.com/search/?q=poul%20henningsen', SHOP_UA],
  ['https://www.dba.dk/soeg/?soeg=ph+lampe', SHOP_UA],
];
const NAME_RE = /\bPH[\s-]?(\d[\d½,.]*(?:\s?[\/–-]\s?\d[\d½,.]*|\s(?:\d[.,]5|\d½?)(?![\d,.]))?|[A-ZÆØÅ][a-zæøå]{3,15})/g;
const GENERIC = /^PH (Lamp|Lampe|Lamper|Lampen|Lamps|Design|Furniture|Light|Lys|Collection|Table|Pendant|Pendel|Ceiling|Floor|Wall|Bord|Loft|Standard|Suspension)$/i;
const tidyName = s => s.replace(/^PH[\s-]?/i, 'PH ').replace(/(\d)\s?[\/–]\s?(\d)/g, '$1/$2').replace(/(\d)\s?-\s?(\d)/g, '$1/$2').replace(/(\d|½|5)\s(\d)/g, '$1/$2').replace(/[,.]+$/, '');
const knownModel = n => MODELS.some(m => m.re.test(n) || m.re.test(n.replace('/', '-')));

async function scanNames(report) {
  for (const [url, ua] of NAME_PAGES) {
    let txt;
    try { txt = (await get(url, ua)).replace(/<[^>]+>/g, ' ').replace(/-/g, ' ').replace(/\bph (\d)/gi, 'PH $1') } catch (e) { report.errors.push(`${url}: ${e.message}`); continue }
    // Louis Poulsens adresser dropper skråstregen: ph-55 er PH 5/5, ph-21 er PH 2/1
    if (url.endsWith('.xml')) txt = txt.replace(/\/ph /gi, ' PH ').replace(/\bPH ([1-6])([1-6])\b/g, 'PH $1/$2');
    for (const [raw] of txt.matchAll(NAME_RE)) {
      const n = tidyName(raw);
      if (GENERIC.test(n) || knownModel(n)) continue;
      const host = new URL(url).hostname;
      if (!NAMES[n]) { NAMES[n] = { first: TODAY, seen: [] }; report.names.push(n) }
      if (!NAMES[n].seen.includes(host)) NAMES[n].seen.push(host);
    }
  }
}

async function wayback(urls) {
  // Best effort: Wayback afviser ofte i perioder; det er ikke en fejl i scanningen.
  for (const u of urls.slice(0, 15)) {
    try { await fetch('https://web.archive.org/save/' + u, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(60000) }) } catch {}
    await new Promise(r => setTimeout(r, 5000));
  }
}

// Døde links: 404/410 eller ukendt domæne to kørsler i træk. 403/429/5xx/timeout er "usikker" (mange museer blokerer bots) og ignoreres.
// Bekræftet døde kilder peges om til nærmeste Wayback-kopi i sources.js, med den gamle adresse i "original".
const DEAD_F = path.join(__dirname, 'dead.json');
const DEAD = fs.existsSync(DEAD_F) ? JSON.parse(fs.readFileSync(DEAD_F, 'utf8')) : {};
// Ikke norm(): den fjerner ?v= og slår alle YouTube-film sammen
const linkKey = u => u.replace(/^https?:\/\/(www\.)?/i, '').replace(/#.*$/, '').replace(/\/+$/, '');
async function linkStatus(url) {
  try {
    let r;
    for (const method of ['HEAD', 'GET']) {
      r = await fetch(url, { method, headers: { 'user-agent': UA, accept: '*/*' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
      r.body?.cancel().catch(() => {});
      if (r.ok) return 'ok';
    }
    return [404, 410].includes(r.status) ? 'dead' : 'unsure';
  } catch (e) { return e.cause?.code === 'ENOTFOUND' ? 'dead' : 'unsure' }
}

async function checkLinks(report) {
  const todo = SOURCES.filter(s => !/^https?:\/\/web\.archive\.org\//.test(s.url)), res = {};
  const worker = async () => { for (let s; (s = todo.pop());) res[s.url] = await linkStatus(s.url) };
  await Promise.all(Array.from({ length: 8 }, worker));
  let src = fs.readFileSync(path.join(ROOT, 'sources.js'), 'utf8');
  for (const [url, st] of Object.entries(res)) {
    const k = linkKey(url);
    report.checked++; if (st === 'unsure') report.unsure++;
    if (st !== 'dead') { delete DEAD[k]; continue }
    if (!DEAD[k] || DEAD[k] >= TODAY) { DEAD[k] ||= TODAY; report.pending.push(url); continue }
    let snap;
    // Uden timestamp: med den svarer API'et ofte tomt. Nyeste kopi med status 200 er god nok.
    try { snap = (await json(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`)).archived_snapshots?.closest } catch {}
    const old = `"url": ${JSON.stringify(url)},`, i = src.indexOf(old);
    if (snap?.available && snap.status === '200' && i > -1) {
      const indent = src.slice(src.lastIndexOf('\n', i) + 1, i), to = snap.url.replace(/^http:/, 'https:');
      src = src.slice(0, i) + `"url": ${JSON.stringify(to)},\n${indent}"original": ${JSON.stringify(url)},` + src.slice(i + old.length);
      delete DEAD[k];
      report.dead.push(`- ${url} → [Wayback-kopi](${to}). Rettet i sources.js.`);
    } else report.dead.push(`- ${url} (død siden ${DEAD[k]}) – ingen Wayback-kopi${i > -1 ? '' : ' eller ikke fundet i sources.js'}. Ikke rettet.`);
  }
  fs.writeFileSync(path.join(ROOT, 'sources.js'), src);
  fs.writeFileSync(DEAD_F, JSON.stringify(Object.fromEntries(Object.entries(DEAD).sort()), null, 1) + '\n');
}

async function main() {
  const report = { added: [], names: [], errors: [], dead: [], pending: [], checked: 0, unsure: 0 };
  const have = new Set([...SOURCES, ...FOUND].map(s => norm(s.url)).concat(SEEN));
  for (const [name, fn] of Object.entries(COLLECTORS)) {
    let rows;
    try { rows = await fn() } catch (e) { report.errors.push(`${name}: ${e.message}`); continue }
    for (const s of rows) {
      if (!s.url || have.has(norm(s.url)) || (name !== 'louispoulsen' && !relevant(s))) continue;
      have.add(norm(s.url));
      const row = { ...s, title: String(s.title).trim(), description: String(s.description).trim(), found: TODAY, via: name };
      FOUND.push(row); report.added.push(row);
    }
  }
  await scanNames(report);
  if (process.env.LINKS !== '0') await checkLinks(report);
  FOUND.sort((a, b) => a.found.localeCompare(b.found) || a.url.localeCompare(b.url));
  fs.writeFileSync(path.join(ROOT, 'found.js'), '// Automatisk fundne kilder fra scan/scan.js. Ikke gennemgået. Flyt en kilde til sources.js, når den er tjekket, eller slet den her.\nconst FOUND = [\n' + FOUND.map(s => ' ' + JSON.stringify(s)).join(',\n') + '\n];\n');
  fs.writeFileSync(SEEN_F, [...new Set(SEEN.concat(FOUND.map(s => norm(s.url))))].sort().join('\n') + '\n');
  fs.writeFileSync(NAMES_F, JSON.stringify(Object.fromEntries(Object.entries(NAMES).sort()), null, 1) + '\n');
  const md = [];
  if (report.added.length) md.push(`## ${report.added.length} nye kilder\n`, ...report.added.map(s => `- [${s.title}](${s.url}) – ${s.publisher}, ${s.year || 'u.å.'} (${s.via})`));
  if (report.names.length) md.push(`\n## Ukendte modelnavne\nNavne, der ikke matcher en lampe i models.js. Kan være en ny model, en variant eller støj.\n`, ...report.names.map(n => `- ${n} (${NAMES[n].seen.join(', ')})`));
  if (report.dead.length || report.pending.length) md.push(`\n## Døde links\nSvarede 404/410 eller havde ukendt domæne to uger i træk.\n`, ...report.dead, ...report.pending.map(u => `- ${u} – død for første gang, tjekkes igen næste uge.`));
  if (report.errors.length) md.push(`\n## Fejl\n`, ...report.errors.map(e => `- ${e}`));
  fs.writeFileSync(path.join(__dirname, 'report.md'), md.join('\n') + '\n');
  console.log(`nye kilder: ${report.added.length}, nye navne: ${report.names.length}, links: ${report.checked} tjekket, ${report.dead.length} døde, ${report.pending.length} måske døde, ${report.unsure} usikre, fejl: ${report.errors.length}`);
  if (process.env.WAYBACK) await wayback(report.added.map(s => s.url));
  // Til workflowet: om der er noget at åbne et issue om
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `new=${report.added.length + report.names.length}\ndead=${report.dead.length}\n`);
}
main();
