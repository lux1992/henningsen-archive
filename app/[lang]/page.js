import Link from 'next/link';
import LampGrid from '../../components/LampGrid';
import { LAMPS, PUBLISHERS, SOURCES } from '../../lib/data';
import { href, tr } from '../../lib/i18n';

export const metadata = { alternates: { languages: { da: '/da/', en: '/en/' } } };

export default async function Home({ params }) {
  const { lang } = await params, t = tr(lang);
  return (
    <>
      <header className="mast">
        <div>
          <p className="over">{t('Kilder til Poul Henningsens lamper, 1924 til i dag', 'Sources on Poul Henningsen’s lamps, 1924 to the present')}</p>
          <h1>{t('PH-arkivet', 'PH Archive')}</h1>
          <p className="lead">{t('Kataloger, produktark, patenter, museumsgenstande, tidsskrifter og film om PH-lamperne. Kun officielt materiale, ingen salgsopslag.', 'Catalogues, product sheets, patents, museum objects, periodicals and films about the PH lamps. Official material only, no sales listings.')}</p>
          <p className="figures num">
            <span><b>{SOURCES.length}</b>{t('kilder', 'sources')}</span>
            <span><b>{LAMPS.length}</b>{t('lampemodeller', 'lamp models')}</span>
            <span><b>{PUBLISHERS}</b>{t('udgivere og samlinger', 'publishers and collections')}</span>
          </p>
          <p className="lead">{t('Hver kilde linker til originalen og til arkivkopier i Wayback Machine. Har du en lampe, kan ', 'Every source links to the original and to archived copies in the Wayback Machine. If you own a lamp, the ')}<Link href={href(lang, 'dating')}>{t('dateringsguiden', 'dating guide')}</Link>{t(' hjælpe med at bestemme dens alder.', ' can help you work out how old it is.')}</p>
        </div>
        <figure>
          <div className="fig1" role="img" aria-label={t('Patenttegning: lampens tre skærme med lysstråler, der kastes nedad', 'Patent drawing: the lamp’s three shades with light rays cast downwards')} />
          <figcaption>{t('Fig. 1 fra PH’s amerikanske patent nr. 1.757.527 (1930). Stråle 8, 10 og 12 viser, hvordan lyset rammer skærmene og kastes ned uden at blænde.', 'Fig. 1 from PH’s US patent no. 1,757,527 (1930). Rays 8, 10 and 12 show how the light strikes the shades and is cast downwards without glare.')}</figcaption>
        </figure>
      </header>
      <section aria-labelledby="mh">
        <div className="sechead"><h2 className="sec" id="mh">{t('Lamperne', 'The lamps')}</h2><p>{t('Vælg en lampe for at se dens historie, fakta og kilder.', 'Choose a lamp to see its history, facts and sources.')}</p></div>
        <LampGrid lang={lang} />
      </section>
    </>
  );
}
