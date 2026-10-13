'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { href, label, otherPath, slug, tr } from '../lib/i18n';

const NAV = ['lamps', 'dating', 'timeline', 'sources', 'open', 'contribute'];

export default function Top({ lang }) {
  const path = usePathname() || '', t = tr(lang), cur = path.split('/')[2];
  return (
    <header className="top">
      <Link className="brand" href={href(lang)}>{t('PH-arkivet', 'PH Archive')}</Link>
      <nav aria-label={t('Hovedmenu', 'Main menu')}>
        {NAV.map(s => <Link key={s} href={href(lang, s)} aria-current={cur === slug(lang, s) ? 'page' : undefined}>{label(lang, s)}</Link>)}
      </nav>
      <form action={`${process.env.BASE_PATH}${href(lang, 'search')}`} role="search">
        <input type="search" name="q" placeholder={t('Søg', 'Search')} aria-label={t('Søg i lamper og kilder', 'Search lamps and sources')} />
      </form>
      <Link className="lang" href={otherPath(path)} hrefLang={lang === 'en' ? 'da' : 'en'}>{lang === 'en' ? 'Dansk' : 'English'}</Link>
    </header>
  );
}
