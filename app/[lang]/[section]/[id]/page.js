// Én side pr. lampe: kuraterede fakta (m.facts), det kilderne viser, og åbne spørgsmål
import Link from 'next/link';
import { Ext, Pic, Question, citer } from '../../../../components/Bits';
import { LAMPS, OQ, SITE, evLabel, picOf, sourcesOf, yearOf } from '../../../../lib/data';
import { L, href, slug, tr, typeLabel } from '../../../../lib/i18n';

export const dynamicParams = false;
export const generateStaticParams = ({ params: { lang } }) => LAMPS.map(m => ({ section: slug(lang, 'lamps'), id: m.id }));

export async function generateMetadata({ params }) {
  const { lang, id } = await params, m = LAMPS.find(x => x.id === id), pic = picOf(id), other = lang === 'en' ? 'da' : 'en';
  const text = L(lang, m, 'text');
  return {
    title: L(lang, m, 'name'),
    description: text.length > 200 ? text.slice(0, 197).replace(/\s\S*$/, '') + ' …' : text,
    alternates: { canonical: href(lang, 'lamps', id), languages: { [other]: href(other, 'lamps', id) } },
    openGraph: { title: L(lang, m, 'name'), description: text, images: [pic ? SITE.replace(/^(https?:\/\/[^/]+).*/, '$1') + pic.img : `${SITE}/fig1.png`] },
  };
}

export default async function Lamp({ params }) {
  const { lang, id } = await params, t = tr(lang), m = LAMPS.find(x => x.id === id);
  const hits = sourcesOf(id), dated = hits.filter(s => yearOf(s) !== '9999'), pic = picOf(id), ev = evLabel(t, m), cite = citer();
  const link = s => <Ext href={s.url}>{s.title}</Ext>;
  const box = (title, arr, row) => arr.length ? <div className="pbox"><h4>{title}</h4><ul>{arr.map((x, i) => <li key={i}>{row(x)}</li>)}</ul></div> : null;
  const dateRow = s => <><i>{s.year || t('u.å.', 'n.d.')}</i>{link(s)}</>;
  const of = (...ty) => hits.filter(s => ty.includes(s.type));
  const types = Object.entries(hits.reduce((a, s) => (a[s.type] = (a[s.type] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]);
  const src = (q = {}) => `${href(lang, 'sources')}?${new URLSearchParams({ lamp: id, ...q })}`;
  const qs = OQ.models[id] || [];
  return (
    <>
      <p className="crumb"><Link href={href(lang, 'lamps')}>← {t('Alle lamper', 'All lamps')}</Link></p>
      <article id="profile">
        <div className="phead">
          <div>
            <Pic img={pic?.img} />
            {pic?.photo ? <p className="credit"><Ext href={pic.photo.url}>{t('Foto', 'Photo')}</Ext>: {pic.photo.author}, <Ext href={pic.photo.license_url}>{pic.photo.license}</Ext>, Wikimedia Commons</p> : null}
          </div>
          <div>
            <h1>{L(lang, m, 'name')}</h1>
            <p className="yr">{L(lang, m, 'year')}</p>
            {ev ? <p className="ev">{ev}{m.evidence_note ? ': ' + L(lang, m, 'evidence_note') : ''} <Link className="askbtn" href={`${href(lang, 'contribute')}?ask=${id}:x`}>{t('Ved du mere?', 'Know more?')}</Link></p> : null}
            <p>{L(lang, m, 'text')}</p>
            {m.how ? <p className="how">{L(lang, m, 'how')}</p> : null}
            {m.variants ? <p className="how"><b>{t('Udgaver', 'Versions')}:</b> {L(lang, m, 'variants')}</p> : null}
            {m.dating && m.dating !== m.year ? <p className="how"><b>{t('Datering', 'Dating')}:</b> {L(lang, m, 'dating')}</p> : null}
          </div>
        </div>
        {hits.some(s => s.img) ? <div className="pbox"><h4>{t('Billeder fra kilderne', 'Images from the sources')}</h4><div className="gallery">
          {hits.filter(s => s.img).map(s => <Ext key={s.i} href={s.url} title={s.title}><img src={s.img} alt={s.title} loading="lazy" />{s.year || t('u.å.', 'n.d.')} · {typeLabel(lang, s.type)}</Ext>)}
        </div></div> : null}
        <div className="pgrid">
          {box(t('Fakta', 'Facts'), m.facts || [], f => <>{L(lang, f, 'text')}{cite(f.url)}</>)}
          <div className="pbox"><h4>{t('Kilderne i tal', 'Sources in numbers')}</h4>
            <p className="stat">{hits.length}<small>{t('kilder', 'sources')}{dated.length ? `, ${yearOf(dated[0])}–${yearOf(dated[dated.length - 1])}` : ''}</small></p>
            <div className="tags">{types.map(([ty, n]) => <Link key={ty} className="tag" href={src({ type: ty })}>{typeLabel(lang, ty)} {n}</Link>)}</div>
            {dated[0] ? <p style={{ margin: '10px 0 0', fontSize: 14 }}>{t('Ældste kilde', 'Oldest source')}: {link(dated[0])} ({dated[0].year})</p> : null}
            {hits.length ? <p style={{ margin: '10px 0 0', fontSize: 14 }}><Link href={src()}>{t('Se alle kilder om lampen', 'See all sources on this lamp')}</Link></p> : null}
          </div>
          {box(t('Fra katalog til katalog', 'Catalogue by catalogue'), of('katalog', 'produktark'), dateRow)}
          {box(t('Her kan du se den', 'Where to see it'), of('museum'), s => <><i>{s.publisher}</i>{link(s)}</>)}
          {box(t('Patenter', 'Patents'), of('patent'), dateRow)}
          {box(t('PH og samtiden', 'PH and his time'), of('tidsskrift', 'video', 'arkiv'), dateRow)}
        </div>
        {qs.length ? <div className="pbox"><h4>{t('Åbne spørgsmål', 'Open questions')}</h4>{qs.map((q, i) => <Question key={i} lang={lang} q={q} ask={`${id}:${i}`} cite={cite} />)}</div> : null}
      </article>
    </>
  );
}
