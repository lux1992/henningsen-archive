import '../globals.css';
import Top from '../../components/Top';
import { LANGS, tr } from '../../lib/i18n';
import { BASE, SITE } from '../../lib/data';

export const dynamicParams = false;
export const generateStaticParams = () => LANGS.map(lang => ({ lang }));

export async function generateMetadata({ params }) {
  const t = tr((await params).lang);
  return {
    metadataBase: new URL(SITE.replace(/\/?$/, '/')),
    title: { default: t('PH-arkivet', 'PH Archive'), template: `%s · ${t('PH-arkivet', 'PH Archive')}` },
    description: t('Kataloger, produktark, patenter, museumsgenstande, tidsskrifter og film om Poul Henningsens lamper.', 'Catalogues, product sheets, patents, museum objects, periodicals and films about Poul Henningsen’s lamps.'),
    openGraph: { siteName: t('PH-arkivet', 'PH Archive'), locale: t('da_DK', 'en_GB'), type: 'website', images: [`${SITE}/fig1.png`] },
    icons: { icon: `${BASE}/fig1-small.png` },
  };
}

export default async function Layout({ children, params }) {
  const { lang } = await params, t = tr(lang);
  return (
    <html lang={lang} style={{ '--fig1': `url(${BASE}/fig1.png)`, '--fig1s': `url(${BASE}/fig1-small.png)` }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap" />
      </head>
      <body>
        <Top lang={lang} />
        <main>
          {children}
          <footer>{t('Kilderne er fundet hos Louis Poulsen, Det Kgl. Bibliotek, Mediestream, Rigsarkivet, arkiv.dk, danske og udenlandske museer, Google Patents, Wayback Machine, Danmark på Film og lex.dk, og nye kilder findes automatisk hver uge. Kilder der ikke kunne åbnes, er udeladt. Billederne er små gengivelser fra kildernes egne sider; rettighederne ligger hos de respektive udgivere. Fotos fra Wikimedia Commons er vist med fotograf og licens.', 'The sources were collected from Louis Poulsen, the Royal Danish Library, Mediestream, the Danish National Archives, arkiv.dk, Danish and international museums, Google Patents, the Wayback Machine, Danmark på Film and lex.dk, and new sources are found automatically every week. Sources that could not be opened were left out. Titles are given in the original language. The images are small reproductions from the sources’ own pages, and the rights belong to their publishers. Photos from Wikimedia Commons are shown with photographer and licence.')}</footer>
        </main>
      </body>
    </html>
  );
}
