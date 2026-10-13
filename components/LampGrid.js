import Link from 'next/link';
import { LampCard } from './Bits';
import { LAMPS, evLabel, picOf, sourcesOf } from '../lib/data';
import { href, tr } from '../lib/i18n';

// Lamper uden billede samles i en boks for sig, med patenttegningen som pladsholder
export default function LampGrid({ lang }) {
  const t = tr(lang);
  const card = m => <LampCard key={m.id} lang={lang} m={m} pic={picOf(m.id)?.img} n={sourcesOf(m.id).length} ev={evLabel(t, m)} />;
  const withPic = LAMPS.filter(m => picOf(m.id)), noPic = LAMPS.filter(m => !picOf(m.id));
  return (
    <>
      <div className="models">{withPic.map(card)}</div>
      {noPic.length ? (
        <div className="nopic">
          <h3>{t('Uden billede endnu', 'No picture yet')} ({noPic.length})</h3>
          <p>{t('Vi har ingen billeder af disse lamper fra en kilde. Har du et foto eller en scanning, så ', 'We have no pictures of these lamps from a source. If you have a photo or a scan, please ')}<Link href={href(lang, 'contribute')}>{t('send det', 'send it')}</Link>.</p>
          <div className="models">{noPic.map(card)}</div>
        </div>
      ) : null}
    </>
  );
}
