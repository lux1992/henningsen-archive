// Sprog og adresser. Dansk er grundteksten; engelsk ligger som *_en ved siden af. Kildernes titler oversættes ikke.
export const LANGS = ['da', 'en'];
export const tr = lang => (da, en) => (lang === 'en' ? en : da);
export const L = (lang, o, k) => (lang === 'en' && o && o[k + '_en']) || (o && o[k]);

// Sektionernes adresser pr. sprog
export const SEC = {
  lamps: ['lamper', 'lamps', 'Lamperne', 'The lamps'],
  dating: ['datering', 'dating', 'Datering', 'Dating'],
  timeline: ['tidslinje', 'timeline', 'Tidslinje', 'Timeline'],
  sources: ['kilder', 'sources', 'Kilderne', 'Sources'],
  open: ['spoergsmaal', 'questions', 'Åbne spørgsmål', 'Open questions'],
  contribute: ['bidrag', 'contribute', 'Bidrag', 'Contribute'],
  search: ['soeg', 'search', 'Søg', 'Search'],
};
const i = lang => (lang === 'en' ? 1 : 0);
export const slug = (lang, sec) => SEC[sec][i(lang)];
export const label = (lang, sec) => SEC[sec][2 + i(lang)];
export const secOf = (lang, s) => Object.keys(SEC).find(k => slug(lang, k) === s);
export const href = (lang, sec, id) => `/${lang}/${sec ? slug(lang, sec) + '/' : ''}${id ? id + '/' : ''}`;

// Samme side på det andet sprog
export function otherPath(path) {
  const [, lang, s, ...rest] = path.split('/');
  const to = lang === 'en' ? 'da' : 'en', sec = s && secOf(lang, s);
  return `/${to}/${sec ? slug(to, sec) + '/' : ''}${rest.filter(Boolean).map(x => x + '/').join('')}`;
}

export const TYPE_EN = { patent: 'patent', katalog: 'catalogue', produktark: 'product sheet', tidsskrift: 'periodical', arkiv: 'archive', museum: 'museum', video: 'film', artikel: 'article', bog: 'book', leksikon: 'encyclopedia', hjemmeside: 'website' };
export const typeLabel = (lang, t) => (lang === 'en' ? TYPE_EN[t] || t : t);

export const TYPE_NOTES = {
  patent: ['Patenterne viser, hvordan PH og Louis Poulsen beskyttede skærmsystemet i Europa, USA og Australien fra 1925. Tegningerne viser skærmenes geometri, som produktfotos ikke viser.', 'The patents show how PH and Louis Poulsen protected the shade system in Europe, the USA and Australia from 1925. The drawings show the geometry of the shades, which product photos do not.'],
  museum: ['Genstande i museumssamlinger med registreringsnummer, datering og ofte fotos. De er brugbare til at datere og sammenligne tidlige udgaver.', 'Objects in museum collections with accession numbers, dates and often photos. Useful for dating and comparing early versions.'],
  arkiv: ['Originaltegninger, fotos og arkiverede udgaver af Louis Poulsens hjemmeside. Det Kgl. Biblioteks PH-tegninger er de vigtigste primærkilder.', 'Original drawings, photos and archived versions of Louis Poulsen’s website. The Royal Danish Library’s PH drawings are the most important primary sources.'],
  katalog: ['Louis Poulsens egne kataloger og brochurer fra 1930’erne til i dag. Her ses udvalg, størrelser og priser i samtiden.', 'Louis Poulsen’s own catalogues and brochures from the 1930s to today. They show the range, sizes and prices of their time.'],
  produktark: ['Tekniske data: mål, materialer, pærer og montering. Ældre ark findes kun som arkivkopier.', 'Technical data: dimensions, materials, bulbs and mounting. Older sheets survive only as archived copies.'],
  tidsskrift: ['Kritisk Revy (PH’s eget tidsskrift 1926–28) og Louis Poulsens blade NYT og Reflections.', 'Kritisk Revy (PH’s own magazine, 1926–28) and Louis Poulsen’s magazines NYT and Reflections.'],
  artikel: ['Pressemeddelelser fra Louis Poulsen samt artikler fra museer og forskere.', 'Press releases from Louis Poulsen and articles by museums and researchers.'],
  video: ['Film med og om PH, bl.a. "PH lys" fra 1964, hvor han selv forklarer sine principper.', 'Films with and about PH, including "PH lys" from 1964, in which he explains his principles himself.'],
  leksikon: ['Opslagsværker som Den Store Danske, Dansk Biografisk Leksikon og Weilbach. God til fakta og datoer.', 'Reference works such as Den Store Danske, Dansk Biografisk Leksikon and Weilbach. Good for facts and dates.'],
  hjemmeside: ['Louis Poulsens nuværende sider om PH og virksomhedens historie.', 'Louis Poulsen’s current pages about PH and the company’s history.'],
  bog: ['Bøger og publikationer med fokus på PH og lamperne.', 'Books and publications focused on PH and the lamps.'],
};
