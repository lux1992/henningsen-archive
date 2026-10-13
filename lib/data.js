// Data til siderne, beregnet ved build. Kilder tagges med lampemodeller via models.js-mønstrene plus et evt. eksplicit "models"-felt.
import { SOURCES as RAW } from '../data/sources.js';
import { FOUND } from '../data/found.js';
import { MODELS as RAW_MODELS } from '../data/models.js';
import { OPEN } from '../data/open.js';
import { PHOTOS } from '../data/photos.js';

export const BASE = process.env.BASE_PATH || '';
export const SITE = process.env.SITE_URL + BASE;
export const asset = p => (/^https?:/.test(p) ? p : `${BASE}/${p}`);

export const MODELS = RAW_MODELS.map(({ re, ...m }) => ({ ...m, re }));
export const SOURCES = [...RAW, ...FOUND.map(s => ({ ...s, auto: true }))].map((s, i) => ({
  ...s, i, img: s.img && asset(s.img),
  models: [...new Set([...(s.models || []), ...MODELS.filter(m => m.re.test(s.title + ' ' + s.description)).map(m => m.id)])],
}));
export const LAMPS = MODELS.filter(m => m.id !== 'tekst');
export const OQ = OPEN;

export const yearOf = s => (String(s.year).match(/\d{4}/) || ['9999'])[0];
export const isArchived = u => /web\.archive\.org|wayback/.test(u);
export const sourcesOf = id => SOURCES.filter(s => s.models.includes(id)).sort((a, b) => yearOf(a).localeCompare(yearOf(b)));
// Billede: Commons-foto, ellers museumsfoto, ellers første kilde med billede
export function picOf(id) {
  if (PHOTOS[id]) return { img: asset(PHOTOS[id].img), photo: PHOTOS[id] };
  const hits = sourcesOf(id);
  const s = hits.find(s => s.img && s.type === 'museum') || hits.find(s => s.img);
  return s ? { img: s.img } : null;
}

// Evidens: angivet i models.js (m.evidence), ellers talt fra fakta med andre kilder end Wikipedia og butikker
const WEAK_URL = /wikipedia|1stdibs|pamono|lauritz|dba\.dk|catawiki|bruun-rasmussen/;
export const evidence = m => m.evidence || (n => (n >= 2 ? 'good' : n ? 'limited' : 'weak'))((m.facts || []).filter(f => !WEAK_URL.test(f.url)).length);
export const evLabel = (t, m) => (m.id === 'tekst' ? '' : { limited: t('Sparsomt dokumenteret', 'Sparsely documented'), weak: t('Dårligt dokumenteret', 'Poorly documented') }[evidence(m)] || '');

// Det, klientkomponenterne skal bruge (regulære udtryk kan ikke sendes til browseren)
export const clientModels = () => MODELS.map(({ re, facts, ...m }) => m);
export const PUBLISHERS = new Set(SOURCES.map(s => s.publisher)).size;
