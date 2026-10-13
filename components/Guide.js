import { DATING } from '../data/dating.js';
import { citer } from './Bits';
import { L, tr } from '../lib/i18n';

// Hele grundlaget for dateringsguiden, foldet sammen
export default function Guide({ lang }) {
  const t = tr(lang), cite = citer();
  return (
    <div id="dguide">
      <details id="grundlag"><summary>{t('Hele grundlaget for guiden', 'Everything the guide is based on')}</summary><p>{L(lang, DATING, 'intro')}</p>
        <details id="perioder"><summary>{t('Produktionsperioder pr. model', 'Production periods by model')}</summary><div className="tablewrap"><table className="periods"><tbody>
          <tr><th>Model</th><th>{t('Periode', 'Period')}</th><th>Note</th></tr>
          {DATING.periods.map((r, i) => <tr key={i}><td>{L(lang, r, 'model')}</td><td>{r.from}{r.to === r.from ? '' : '–' + r.to}</td><td>{L(lang, r, 'note')}{cite(r.url)}</td></tr>)}
        </tbody></table></div></details>
        {DATING.steps.map((s, i) => <details key={i}><summary>{L(lang, s, 'title')}</summary><p>{L(lang, s, 'text')}</p>
          <ul>{s.checks.map((c, j) => <li key={j}>{L(lang, c, 'text')}{cite(c.url)}</li>)}</ul></details>)}
        <details><summary>{t('Forbehold', 'Caveats')}</summary><ul>{((lang === 'en' && DATING.caveats_en) || DATING.caveats).map((c, i) => <li key={i}>{c}</li>)}</ul></details>
      </details>
    </div>
  );
}
