import { LAMPS, SITE } from '../lib/data';
import { LANGS, SEC, href } from '../lib/i18n';

export const dynamic = 'force-static';
export default function sitemap() {
  const pages = LANGS.flatMap(l => [href(l), ...Object.keys(SEC).filter(s => s !== 'search').map(s => href(l, s)), ...LAMPS.map(m => href(l, 'lamps', m.id))]);
  return pages.map(p => ({ url: SITE + p }));
}
