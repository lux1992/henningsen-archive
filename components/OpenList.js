import Link from 'next/link';
import { Question, citer } from './Bits';
import { MODELS, OQ, evLabel } from '../lib/data';
import { L, href, tr } from '../lib/i18n';

export default function OpenList({ lang }) {
  const t = tr(lang), cite = citer();
  return (
    <div id="openlist">
      {OQ.general.map((q, i) => <Question key={i} lang={lang} q={q} ask={'general:' + i} cite={cite} />)}
      {MODELS.filter(m => (OQ.models[m.id] || []).length).map(m => (
        <details key={m.id}>
          <summary>{L(lang, m, 'name')}<small>{OQ.models[m.id].length} {t('spørgsmål', OQ.models[m.id].length > 1 ? 'questions' : 'question')}{evLabel(t, m) ? ' · ' + evLabel(t, m) : ''}</small></summary>
          <p style={{ margin: '0 0 6px', fontSize: 15 }}><Link href={href(lang, 'lamps', m.id)}>{t('Se lampens side', 'See the lamp’s page')}</Link></p>
          {OQ.models[m.id].map((q, i) => <Question key={i} lang={lang} q={q} ask={`${m.id}:${i}`} cite={cite} />)}
        </details>
      ))}
    </div>
  );
}
