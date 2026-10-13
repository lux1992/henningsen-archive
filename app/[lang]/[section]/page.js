import LampGrid from '../../../components/LampGrid';
import Guide from '../../../components/Guide';
import Wizard from '../../../components/Wizard';
import Timeline from '../../../components/Timeline';
import Sources from '../../../components/Sources';
import OpenList from '../../../components/OpenList';
import Contribute from '../../../components/Contribute';
import Search from '../../../components/Search';
import { Head } from '../../../components/Bits';
import { SEC, label, secOf, slug, tr } from '../../../lib/i18n';
import { LAMPS, OQ, SOURCES, evLabel, picOf, sourcesOf } from '../../../lib/data';

export const dynamicParams = false;
export const generateStaticParams = ({ params: { lang } }) => Object.keys(SEC).map(s => ({ section: slug(lang, s) }));

const INTRO = {
  lamps: ['Vælg en lampe for at se dens historie, fakta og kilder.', 'Choose a lamp to see its history, facts and sources.'],
  dating: ['Svar på nogle få spørgsmål. Perioden bliver smallere for hvert svar, og du kan se kilden bag hver konklusion.', 'Answer a few questions. The period narrows with each answer, and you can see the source behind every conclusion.'],
  timeline: ['Træk for at flytte. Knib, eller hold ⌘/Ctrl og scroll, for at zoome.', 'Drag to move. Pinch, or hold ⌘/Ctrl and scroll, to zoom.'],
  sources: ['Alle kilder med link til originalen og arkivkopier. Filtrér efter type eller lampe.', 'All sources with links to the original and archived copies. Filter by type or lamp.'],
  open: ['Det ved vi ikke endnu. Kender du svaret, eller har du et katalog, et foto eller et link, så skriv.', 'What we don’t know yet. If you know the answer, or have a catalogue, a photo or a link, please get in touch.'],
  contribute: ['Links til kilder på nettet, egne fotos af mærker og stempler, scanninger af kataloger, eller hvad du ved om en lampe.', 'Links to sources online, your own photos of labels and stamps, catalogue scans, or what you know about a lamp.'],
  search: ['Søg i lamper og kilder.', 'Search lamps and sources.'],
};
const TITLE = { dating: ['Hvor gammel er min PH-lampe?', 'How old is my PH lamp?'] };

export async function generateMetadata({ params }) {
  const { lang, section } = await params, sec = secOf(lang, section), t = tr(lang);
  const other = lang === 'en' ? 'da' : 'en';
  return {
    title: TITLE[sec] ? t(...TITLE[sec]) : label(lang, sec), description: t(...INTRO[sec]),
    alternates: { canonical: `/${lang}/${section}/`, languages: { [other]: `/${other}/${slug(other, sec)}/` } },
  };
}

export default async function Section({ params }) {
  const { lang, section } = await params, sec = secOf(lang, section), t = tr(lang);
  const names = Object.fromEntries(LAMPS.map(m => [m.id, (lang === 'en' && m.name_en) || m.name]));
  const body = {
    lamps: () => <LampGrid lang={lang} />,
    dating: () => <><Wizard lang={lang} pics={Object.fromEntries(LAMPS.map(m => [m.id, picOf(m.id)?.img || '']))} /><Guide lang={lang} /></>,
    timeline: () => <Timeline lang={lang} sources={SOURCES} names={names} />,
    sources: () => <Sources lang={lang} sources={SOURCES} names={names} />,
    open: () => <OpenList lang={lang} />,
    contribute: () => <Contribute lang={lang} lamps={LAMPS.map(m => [m.id, (lang === 'en' && m.name_en) || m.name])}
      questions={Object.fromEntries([...OQ.general.map((q, i) => ['general:' + i, q.q]), ...Object.entries(OQ.models).flatMap(([id, qs]) => qs.map((q, i) => [`${id}:${i}`, q.q]))])} />,
    search: () => <Search lang={lang} sources={SOURCES} names={names}
      lamps={LAMPS.map(m => ({ id: m.id, name: m.name, name_en: m.name_en, year: m.year, year_en: m.year_en, text: m.text, text_en: m.text_en, pic: picOf(m.id)?.img, n: sourcesOf(m.id).length, ev: evLabel(t, m) }))} />,
  }[sec];
  return <section id={sec}><Head title={TITLE[sec] ? t(...TITLE[sec]) : label(lang, sec)}>{t(...INTRO[sec])}</Head>{body()}</section>;
}
