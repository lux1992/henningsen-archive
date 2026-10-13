'use client';
// Kildelisten med søgning, typefilter og lampefilter. Filtrene står i adressen (?type=&lamp=&q=), så de kan deles.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SourceItem } from './Bits';
import { TYPE_NOTES, href, tr, typeLabel } from '../lib/i18n';

const yearOf = s => (String(s.year).match(/\d{4}/) || ['9999'])[0];

export default function Sources({ lang, sources, names }) {
  const t = tr(lang);
  const [f, setF] = useState({ q: '', type: '', lamp: '', sort: 'year' });
  useEffect(() => { const p = new URLSearchParams(location.search); setF(f => ({ ...f, q: p.get('q') || '', type: p.get('type') || '', lamp: p.get('lamp') || '' })) }, []);
  const set = patch => {
    const n = { ...f, ...patch }; setF(n);
    const p = new URLSearchParams(Object.entries({ q: n.q, type: n.type, lamp: n.lamp }).filter(([, v]) => v));
    history.replaceState(null, '', location.pathname + (p.size ? '?' + p : ''));
  };
  const counts = useMemo(() => sources.reduce((m, s) => (m[s.type] = (m[s.type] || 0) + 1, m), {}), [sources]);
  const q = f.q.trim().toLowerCase();
  const rows = sources
    .filter(s => (!f.type || s.type === f.type) && (!f.lamp || s.models.includes(f.lamp)) &&
      (!q || [s.title, s.publisher, s.description, s.description_en, s.year].join(' ').toLowerCase().includes(q)))
    .sort((a, b) => f.sort === 'year' ? yearOf(a).localeCompare(yearOf(b)) || a.title.localeCompare(b.title, 'da') : a.title.localeCompare(b.title, 'da'));
  const chip = (ty, lbl, n) => <button key={ty} className="chip" aria-pressed={ty === f.type} onClick={() => set({ type: ty })}>{lbl}<span>{n}</span></button>;
  const note = TYPE_NOTES[f.type];
  return (
    <>
      <div className="controls">
        <p id="count" aria-live="polite">{t(`${rows.length} af ${sources.length} kilder`, `${rows.length} of ${sources.length} sources`)}</p>
        <div className="row">
          <input id="q" type="search" value={f.q} onChange={e => set({ q: e.target.value })} placeholder={t('Søg i titel, udgiver eller beskrivelse', 'Search titles, publishers or descriptions')} aria-label={t('Søg', 'Search')} />
          <select value={f.lamp} onChange={e => set({ lamp: e.target.value })} aria-label={t('Lampe', 'Lamp')}>
            <option value="">{t('Alle lamper', 'All lamps')}</option>
            {Object.entries(names).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
          </select>
          <select value={f.sort} onChange={e => set({ sort: e.target.value })} aria-label={t('Sortering', 'Sorting')}>
            <option value="year">{t('Ældste først', 'Oldest first')}</option><option value="title">{t('Titel A–Å', 'Title A–Z')}</option>
          </select>
        </div>
        <div className="chips" role="group" aria-label="Type">
          {chip('', t('Alle', 'All'), sources.length)}
          {Object.keys(counts).sort((a, b) => typeLabel(lang, a).localeCompare(typeLabel(lang, b))).map(ty => chip(ty, typeLabel(lang, ty), counts[ty]))}
        </div>
        {note ? <p className="note"><b>{typeLabel(lang, f.type)}:</b> {t(...note)}</p> : null}
        {f.lamp ? <p className="note">{t('Viser kilder om', 'Showing sources about')} <Link href={href(lang, 'lamps', f.lamp)}>{names[f.lamp]}</Link>. <button className="tag" onClick={() => set({ lamp: '' })}>{t('Vis alle', 'Show all')}</button></p> : null}
      </div>
      <ol id="list">
        {rows.length ? rows.map(s => <SourceItem key={s.i} lang={lang} s={s} names={names} />)
          : <li><div /><div className="entry"><p>{t('Ingen kilder matcher. Prøv et andet ord, eller vælg "Alle".', 'No sources match. Try another word, or choose "All".')}</p></div></li>}
      </ol>
    </>
  );
}
