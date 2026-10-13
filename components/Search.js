'use client';
// Søgning i lamper og kilder, i browseren. Alle ord skal findes (uden hensyn til store bogstaver og accenter).
import { useEffect, useState } from 'react';
import { LampCard, SourceItem } from './Bits';
import { tr } from '../lib/i18n';

const fold = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const MAX = 100;

export default function Search({ lang, lamps, sources, names }) {
  const t = tr(lang), [q, setQ] = useState('');
  useEffect(() => setQ(new URLSearchParams(location.search).get('q') || ''), []);
  const update = v => { setQ(v); history.replaceState(null, '', location.pathname + (v ? '?q=' + encodeURIComponent(v) : '')) };
  const words = fold(q).split(/\s+/).filter(Boolean);
  const hit = (...f) => { const h = fold(f.join(' ')); return words.every(w => h.includes(w)) };
  const L = words.length ? lamps.filter(m => hit(m.id, m.name, m.name_en, m.year, m.text, m.text_en)) : [];
  const S = words.length ? sources.filter(s => hit(s.title, s.publisher, s.year, s.description, s.description_en, s.type, ...s.models.map(id => names[id]))) : [];
  return (
    <>
      <div className="row"><input id="q" type="search" value={q} onChange={e => update(e.target.value)} autoFocus placeholder={t('Fx PH 5, kobber, 1958 eller Kritisk Revy', 'E.g. PH 5, copper, 1958 or Kritisk Revy')} aria-label={t('Søg', 'Search')} /></div>
      {words.length ? <p id="count" aria-live="polite">{t(`${L.length} lamper og ${S.length} kilder`, `${L.length} lamps and ${S.length} sources`)}</p> : null}
      {L.length ? <><h2 className="sec" style={{ fontSize: '1.3rem', margin: '24px 0 14px' }}>{t('Lamper', 'Lamps')}</h2>
        <div className="models">{L.map(m => <LampCard key={m.id} lang={lang} m={m} pic={m.pic} n={m.n} ev={m.ev} />)}</div></> : null}
      {S.length ? <><h2 className="sec" style={{ fontSize: '1.3rem', margin: '32px 0 6px' }}>{t('Kilder', 'Sources')}</h2>
        <ol id="list">{S.slice(0, MAX).map(s => <SourceItem key={s.i} lang={lang} s={s} names={names} />)}</ol>
        {S.length > MAX ? <p className="hint">{t(`Viser de første ${MAX}. Skriv flere ord for at indsnævre.`, `Showing the first ${MAX}. Add more words to narrow it down.`)}</p> : null}</> : null}
    </>
  );
}
