'use client';
// Dateringsguide: vælg lampe, besvar spørgsmål, perioden snævres ind
import { useState } from 'react';
import Link from 'next/link';
import { Q, WIZARD } from '../data/wizard.js';
import { Shade, citer } from './Bits';
import { L, href, tr } from '../lib/i18n';

const NOW = new Date().getFullYear(), A0 = 1920;
const PROFILE = { treskaerm: 'system', lysekrone: 'bombardement' };
const qsOf = m => m.qs.map(q => (typeof q === 'string' ? Q[q] : q));
const pct = y => ((y - A0) / (NOW - A0) * 100).toFixed(2) + '%';

function Bar({ lo, hi }) {
  const bad = lo > hi, a = bad ? hi : lo, b = bad ? lo : hi;
  return (
    <div className={'wbar' + (bad ? ' bad' : '')}>
      <div className="wfill" style={{ left: pct(a), width: `calc(${pct(b)} - ${pct(a)} + 6px)` }} />
      {[1920, 1940, 1960, 1980, 2000, 2020].map(y => <span key={y} style={{ left: pct(y) }}>{y}</span>)}
    </div>
  );
}

export default function Wizard({ lang, pics }) {
  const t = tr(lang), [m, setM] = useState(null), [ans, setAns] = useState([]);
  const range = (lo, hi) => (lo > hi ? t('Svarene passer ikke sammen', 'The answers don’t add up') : lo === hi ? `${lo}` : hi >= NOW ? `${lo} – ${t('i dag', 'today')}` : `${lo}–${hi}`);
  if (!m) return (
    <div id="wiz"><div className="wcard"><h2 className="wq">{t('Hvilken lampe har du?', 'Which lamp do you have?')}</h2>
      <div className="wmodels">
        {WIZARD.map(w => <button key={w.id} className="wm" onClick={() => (setM(w), setAns([]))}>{pics[w.img] ? <img src={pics[w.img]} alt="" /> : <span className="ph"><Shade /></span>}<b>{L(lang, w, 't')}</b>{w.sub ? <small>{L(lang, w, 'sub')}</small> : null}</button>)}
        <a className="wm" href="#perioder" onClick={() => { document.getElementById('grundlag').open = true; document.getElementById('perioder').open = true }}><span className="ph">?</span><b>{t('Ved ikke', 'Not sure')}</b><small>{t('Se alle produktionsperioder', 'See all production periods')}</small></a>
      </div></div></div>
  );
  const qs = qsOf(m), i = ans.length;
  let lo = m.from, hi = NOW;
  ans.forEach(a => { if (a.from) lo = Math.max(lo, a.from); if (a.to) hi = Math.min(hi, a.to) });
  const head = <>
    <div className="wtop"><button className="wback" onClick={() => (ans.length ? setAns(ans.slice(0, -1)) : setM(null))}>← {t('Tilbage', 'Back')}</button>
      <span className="wstep">{L(lang, m, 't')}, {i < qs.length ? t(`spørgsmål ${i + 1} af ${qs.length}`, `question ${i + 1} of ${qs.length}`) : t('resultat', 'result')}</span></div>
    <p className="wrange">{range(lo, hi)}</p><Bar lo={lo} hi={hi} />
  </>;
  if (i < qs.length) {
    const q = qs[i];
    return (
      <div id="wiz"><div className="wcard">{head}<h2 className="wq">{L(lang, q, 'q')}</h2>{q.help ? <p className="whelp">{L(lang, q, 'help')}</p> : null}
        <div className="wopts">{q.a.map((a, j) => <button key={j} className="wo" onClick={() => setAns([...ans, { qq: q, ...a }])}>{L(lang, a, 't')}</button>)}</div></div></div>
    );
  }
  const cite = citer(), pid = PROFILE[m.id] || m.id;
  return (
    <div id="wiz"><div className="wcard">{head}
      <h2 className="wq">{lo > hi ? t('Nogle dele kan være udskiftet, eller lampen er en kopi.', 'Some parts may have been replaced, or the lamp is a copy.') : t(`Din ${m.t} er sandsynligvis fra ${range(lo, hi)}.`, `Your ${L(lang, m, 't')} most likely dates from ${range(lo, hi)}.`)}</h2>
      <ul className="wev">{[{ ...m.base, from: m.from }, ...ans].map((a, k) =>
        <li key={k} className={a.warn ? 'warn' : a.weak ? 'weak' : 'hard'}><b>{a.warn ? t('Advarsel', 'Warning') : a.weak ? t('Indicium', 'Clue') : t('Grænse', 'Limit')}</b>
          <span>{a.qq ? <em>{L(lang, a.qq, 'q')} {L(lang, a, 't')}. </em> : null}{L(lang, a, 'say')}{a.url ? cite(a.url) : null}</span></li>)}</ul>
      <p className="whelp">{t('En grænse flytter perioden, et indicium gør ikke. Louis Poulsen har ingen officiel dateringsnøgle, så resultatet er et kvalificeret bud, og udskiftede skærme, fatninger og ledninger kan snyde.', 'A limit moves the period, a clue does not. Louis Poulsen has no official dating key, so the result is an informed estimate, and replaced shades, sockets and cables can mislead.')}</p>
      <div className="wopts"><button className="wo plain" onClick={() => (setM(null), setAns([]))}>{t('Start forfra med en anden lampe', 'Start again with another lamp')}</button>
        {pid in pics ? <Link className="wo plain" href={href(lang, 'lamps', pid)}>{t(`Læs om ${m.t} og se kilderne`, `Read about the ${L(lang, m, 't')} and see the sources`)}</Link> : null}</div>
    </div></div>
  );
}
