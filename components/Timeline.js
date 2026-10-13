'use client';
// Tidslinje: én bane pr. kildetype, verden flyttes med translateX, zoom genberegner positioner.
// Tegnes imperativt (hundredvis af elementer, der flyttes pr. frame), klik vises med React.
import { useEffect, useRef, useState } from 'react';
import { SourceItem } from './Bits';
import { tr, typeLabel } from '../lib/i18n';

const Y0 = 1920, Y1 = 2027, MAXPPY = 600, CARD_PPY = 70;
const MILESTONES = [
  [1924, 'Vinder Paris-konkurrencen', 'Wins the Paris competition'], [1925, 'Guldmedalje i Paris', 'Gold medal in Paris'], [1926, 'Forum-lampen og Kritisk Revy', 'The Forum lamp and Kritisk Revy'],
  [1927, 'Die Wohnung, Stuttgart', 'Die Wohnung, Stuttgart'], [1931, 'Katalog B', 'Catalogue B'],
  [1941, 'NYT starter, PH redaktør', 'NYT launched, PH as editor'], [1958, 'PH 5, Koglen, Snebolden', 'PH 5, Artichoke, Snowball'], [1964, 'Filmen “PH lys”', 'The film “PH lys”'],
  [1967, 'PH dør', 'PH dies'], [2026, '100 år med System PH', '100 years of System PH'],
];
const LANE_ORDER = ['patent', 'katalog', 'produktark', 'tidsskrift', 'arkiv', 'museum', 'video', 'artikel', 'bog', 'leksikon', 'hjemmeside'];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const yr = s => { const m = String(s.year).match(/\d{4}/); return m ? +m[0] : null };
const SHADE = '<span class="figph" aria-hidden="true"></span>';

export default function Timeline({ lang, sources, names }) {
  const t = tr(lang), tlRef = useRef(), worldRef = useRef(), api = useRef({});
  const [sel, setSel] = useState(null);

  useEffect(() => {
    const tl = tlRef.current, world = worldRef.current, rows = sources.filter(yr);
    let ppy = 0, off = 0, raf = 0, selI = null;
    const W = () => tl.clientWidth, fitPpy = () => W() / (Y1 - Y0), xOf = y => (y - Y0) * ppy;
    const clampOff = () => { off = Math.min(40, Math.max(W() - (Y1 - Y0) * ppy - 40, off)) };
    const pan = () => { clampOff(); world.style.transform = `translateX(${off}px)`; if (!raf) raf = requestAnimationFrame(() => { raf = 0; layout() }) };
    function layout() {
      const cards = ppy >= CARD_PPY, w = cards ? 176 : 16, rh = cards ? 54 : 16;
      const step = ppy >= 120 ? 1 : ppy >= 40 ? 2 : ppy >= 18 ? 5 : 10;
      let html = '', top = 96;
      for (let y = Math.ceil(Y0 / step) * step; y <= Y1; y += step)
        html += `<div class="tick${y % 10 ? '' : ' major'}" style="left:${xOf(y)}px"><span>${y}</span></div>`;
      MILESTONES.forEach(([y, da, en], i) => html += `<div class="mile" style="left:${xOf(y + .5)}px"><span style="top:${22 + (i % 4) * 16}px">${y} · ${t(da, en)}</span></div>`);
      const labels = [];
      for (const lane of LANE_ORDER) {
        // ponytail: kun synlige kilder pakkes, så banehøjden følger udsnittet; genberegnes pr. frame under træk
        const lo = -off - w, hi = -off + W() + w;
        const items = rows.filter(s => s.type === lane && xOf(yr(s) + .5) > lo && xOf(yr(s) + .5) < hi).sort((a, b) => yr(a) - yr(b) || a.title.localeCompare(b.title, 'da'));
        if (!items.length) continue;
        // Grådig pakning: hver kilde i første række, hvor den ikke overlapper naboen
        const ends = [];
        const placed = items.map(s => {
          const x = xOf(yr(s) + .5);
          let r = ends.findIndex(e => e <= x - w / 2 - 4);
          if (r < 0) { r = ends.length; ends.push(0) }
          ends[r] = x + w / 2;
          return { s, x, y: top + 26 + r * rh };
        });
        html += `<div class="lane" style="top:${top}px"></div>`;
        labels.push(`<div class="lanelabel" style="top:${top + 6}px">${typeLabel(lang, lane)} · ${items.length}</div>`);
        for (const { s, x, y } of placed) {
          const on = s.i === selI ? ' sel' : '', ti = esc(s.title);
          html += cards
            ? `<button class="card${on}" data-i="${s.i}" style="left:${x}px;top:${y}px" title="${esc(s.year)} · ${ti}">${s.img ? `<img src="${esc(s.img)}" alt="" loading="lazy">` : `<div class="ph" style="display:grid;place-items:center">${SHADE}</div>`}<b>${ti}</b></button>`
            : `<button class="dot${on}" data-i="${s.i}" style="left:${x}px;top:${y}px" aria-label="${esc(s.year)} · ${ti}" title="${esc(s.year)} · ${ti}"></button>`;
        }
        top += 26 + ends.length * rh + 10;
      }
      world.style.height = top + 'px';
      world.innerHTML = html;
      tl.querySelectorAll('.lanelabel').forEach(n => n.remove());
      tl.insertAdjacentHTML('beforeend', labels.join(''));
      world.style.transform = `translateX(${off}px)`;
    }
    function zoomAt(px, factor) {
      const year = (px - off) / ppy + Y0;
      ppy = Math.min(MAXPPY, Math.max(fitPpy(), ppy * factor));
      off = px - (year - Y0) * ppy; clampOff(); layout();
    }
    function showSpan(a, b) {
      ppy = Math.min(MAXPPY, Math.max(fitPpy(), W() / (b - a)));
      off = -(a - Y0) * ppy; clampOff(); world.classList.add('anim'); layout();
      setTimeout(() => world.classList.remove('anim'), 300);
    }
    api.current = { zoomAt, showSpan, W };
    const ac = new AbortController(), on = (el, ev, fn, o) => el.addEventListener(ev, fn, { signal: ac.signal, ...o });
    on(tl, 'wheel', e => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoomAt(e.clientX - tl.getBoundingClientRect().left, Math.exp(-e.deltaY / 200)) }
      else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); off -= e.deltaX; pan() }
    }, { passive: false });
    // Træk og knib med pointer events
    const pts = new Map(); let moved = 0, pinch0 = 0;
    on(tl, 'pointerdown', e => { pts.set(e.pointerId, e.clientX); moved = 0; if (pts.size === 2) pinch0 = Math.abs([...pts.values()].reduce((a, b) => a - b)) });
    on(tl, 'pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      const last = pts.get(e.pointerId); pts.set(e.pointerId, e.clientX);
      if (pts.size === 2) {
        const d = Math.abs([...pts.values()].reduce((a, b) => a - b)), mid = [...pts.values()].reduce((a, b) => a + b) / 2;
        if (pinch0) zoomAt(mid - tl.getBoundingClientRect().left, d / pinch0);
        pinch0 = d; moved = 99; return;
      }
      moved += Math.abs(e.clientX - last);
      if (moved > 4) { tl.classList.add('drag'); if (!tl.hasPointerCapture(e.pointerId)) tl.setPointerCapture(e.pointerId); off += e.clientX - last; pan() }
    });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; tl.classList.remove('drag') };
    on(tl, 'pointerup', up); on(tl, 'pointercancel', up);
    on(tl, 'click', e => {
      const b = e.target.closest('[data-i]'); if (!b || moved > 4) return;
      selI = +b.dataset.i; setSel(selI);
      tl.querySelectorAll('.sel').forEach(n => n.classList.remove('sel')); b.classList.add('sel');
    });
    on(tl, 'dblclick', e => zoomAt(e.clientX - tl.getBoundingClientRect().left, 2));
    on(tl, 'keydown', e => {
      const k = { ArrowLeft: () => (off += 80, pan()), ArrowRight: () => (off -= 80, pan()), '+': () => zoomAt(W() / 2, 1.6), '=': () => zoomAt(W() / 2, 1.6), '-': () => zoomAt(W() / 2, 1 / 1.6) }[e.key];
      if (k) { e.preventDefault(); k() }
    });
    let rw; on(window, 'resize', () => { clearTimeout(rw); rw = setTimeout(() => { ppy = Math.max(ppy, fitPpy()); layout() }, 150) });
    ppy = fitPpy(); clampOff(); layout();
    return () => ac.abort();
  }, [sources, lang]);

  const a = api.current, s = sel != null && sources.find(x => x.i === sel);
  return (
    <>
      <div className="tlbar">
        <button aria-label={t('Zoom ind', 'Zoom in')} onClick={() => a.zoomAt(a.W() / 2, 1.6)}>+</button>
        <button aria-label={t('Zoom ud', 'Zoom out')} onClick={() => a.zoomAt(a.W() / 2, 1 / 1.6)}>−</button>
        <button onClick={() => a.showSpan(Y0, Y1)}>{t('Hele perioden', 'Whole period')}</button>
        <button onClick={() => a.showSpan(1920, 1970)}>{t('PH’s tid 1920–70', 'PH’s lifetime 1920–70')}</button>
        <button onClick={() => a.showSpan(1955, 1962)}>1958</button>
        <button onClick={() => a.showSpan(2000, 2027)}>{t('2000’erne', '2000s')}</button>
      </div>
      <div id="tl" ref={tlRef} tabIndex={0} aria-label={t('Tidslinje over kilderne. Brug piletaster til at flytte og plus/minus til at zoome.', 'Timeline of the sources. Use the arrow keys to move and plus/minus to zoom.')}><div id="world" ref={worldRef} /></div>
      {s ? <div id="detail"><ol><SourceItem lang={lang} s={s} names={names} /></ol></div> : null}
    </>
  );
}
