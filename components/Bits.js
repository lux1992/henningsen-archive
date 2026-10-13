// Små byggeklodser, der bruges både ved build og i browseren. Ingen data-import her.
import Link from 'next/link';
import { L, href, tr, typeLabel } from '../lib/i18n';

// Pladsholder uden eget billede: PH's patenttegning, farvet via CSS-maske
export const Shade = () => <span className="figph" aria-hidden="true" />;
export const Pic = ({ img, className = 'pic' }) => (
  <div className={className} style={img ? { backgroundImage: `url('${img}')` } : undefined}>{img ? null : <Shade />}</div>
);
const ext = { target: '_blank', rel: 'noopener' };
export const Ext = ({ href: u, children, ...p }) => <a href={u} {...ext} {...p}>{children}</a>;

// Kildehenvisninger som fodnotetal; én tæller pr. blok
export function citer() {
  let n = 0;
  return u => <sup key={u + n}><a href={u} {...ext} title={`Kilde: ${u}`}>{++n}</a></sup>;
}

export function LampCard({ lang, m, pic, n, ev }) {
  const t = tr(lang);
  return (
    <Link className="model" href={href(lang, 'lamps', m.id)}>
      <Pic img={pic} />
      <div className="txt"><b>{L(lang, m, 'name')}</b><small><i>{L(lang, m, 'year')}</i> · {n} {t('kilder', 'sources')}</small>{ev ? <span className="ev">{ev}</span> : null}</div>
    </Link>
  );
}

export function SourceItem({ lang, s, names }) {
  const t = tr(lang), archived = /web\.archive\.org|wayback/.test(s.url);
  return (
    <li>
      {s.img ? <img className="thumb" src={s.img} alt="" loading="lazy" /> : <div className="thumb ph"><Shade /></div>}
      <div className="entry">
        <div className="kicker"><b>{typeLabel(lang, s.type)}</b>, <i>{s.year || t('u.å.', 'n.d.')}</i>. {s.publisher}</div>
        <h2><Ext href={s.url} lang={s.language}>{s.title}</Ext></h2>
        {s.auto ? <div className="auto">{t('Fundet automatisk', 'Found automatically')} {s.found}, {t('ikke gennemgået', 'not reviewed yet')}</div> : null}
        <p>{L(lang, s, 'description')}</p>
        {s.models.length ? <div className="tags">{s.models.map(id => <Link key={id} className="tag" href={href(lang, 'lamps', id)}>{names[id]}</Link>)}</div> : null}
        <div className="links">{archived
          ? <><Ext href={s.url}>{t('Arkivkopi', 'Archived copy')}</Ext>{s.original ? <Ext href={s.original}>{t('Tidligere adresse', 'Former address')}</Ext> : null}<em>{t('Originalen er offline', 'The original is offline')}</em></>
          : <><Ext href={s.url}>Original</Ext><Ext href={`https://web.archive.org/web/*/${s.url}`}>{t('Arkivkopier i Wayback', 'Archived copies in the Wayback Machine')}</Ext></>}
        </div>
      </div>
    </li>
  );
}

export function Question({ lang, q, ask, cite }) {
  const t = tr(lang);
  return (
    <div className="oq">
      <b>{L(lang, q, 'q')}</b>
      {q.why ? <p>{L(lang, q, 'why')}{(q.urls || []).map(cite)}</p> : null}
      <Link href={`${href(lang, 'contribute')}?ask=${ask}`}>{t('Jeg ved noget om det', 'I know something about this')}</Link>
    </div>
  );
}

export const Head = ({ id, title, children }) => (
  <div className="sechead"><h1 className="sec" id={id}>{title}</h1>{children ? <p>{children}</p> : null}</div>
);
