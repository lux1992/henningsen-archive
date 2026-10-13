'use client';
// Bidrag via e-mail: mailprogrammet åbner med teksten udfyldt, så bidragydere ikke skal have en konto nogen steder.
// ?ask=<lampe>:<nr> udfylder lampe og spørgsmål (fra "Jeg ved noget om det").
import { useEffect, useState } from 'react';
import { tr } from '../lib/i18n';

const CONTACT_EMAIL = ['lukasbarbagallo', 'gmail.com'].join('@'); // samlet i JS, så adressen ikke står som tekst i kildekoden

export default function Contribute({ lang, lamps, questions }) {
  const t = tr(lang), [lamp, setLamp] = useState(''), [q, setQ] = useState(''), [mail, setMail] = useState('');
  useEffect(() => {
    const key = new URLSearchParams(location.search).get('ask') || '', id = key.split(':')[0];
    if (lamps.some(([i]) => i === id)) setLamp(id);
    setQ(questions[key] || '');
    setMail(CONTACT_EMAIL);
  }, []);
  function submit(e) {
    e.preventDefault();
    const v = n => e.target.elements[n].value, name = (lamps.find(([i]) => i === lamp) || [])[1] || '';
    const body = [['Lampe', name], ['Spørgsmål', q], ['Links', v('link')], ['Hvad jeg ved', v('text')], ['Navn til kreditering', v('name')]]
      .filter(([, x]) => x.trim()).map(([k, x]) => `${k}:\n${x.trim()}`).join('\n\n') + '\n\n(Vedhæft gerne billeder eller filer.)';
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('PH-arkivet: ' + (name || 'bidrag'))}&body=${encodeURIComponent(body)}`;
  }
  return (
    <form id="cform" onSubmit={submit}>
      <label><span>{t('Lampe', 'Lamp')}</span><select value={lamp} onChange={e => setLamp(e.target.value)}>
        <option value="">{t('Ingen bestemt / ved ikke', 'None in particular / not sure')}</option>
        {lamps.map(([id, n]) => <option key={id} value={id}>{n}</option>)}
      </select></label>
      {q ? <label><span>{t('Spørgsmål', 'Question')}</span><input value={q} readOnly /></label> : null}
      <label><span>{t('Links til kilder (én pr. linje)', 'Links to sources (one per line)')}</span><textarea name="link" style={{ minHeight: 70 }} placeholder="https://" /></label>
      <label><span>{t('Hvad ved du?', 'What do you know?')}</span><textarea name="text" autoFocus={!!q} /></label>
      <label><span>{t('Navn til kreditering (valgfrit)', 'Name for credit (optional)')}</span><input name="name" autoComplete="name" /></label>
      <p className="hint">{t('Dit mailprogram åbner med teksten udfyldt. Vedhæft billeder, scanninger eller PDF’er i mailen, før du sender.', 'Your email app opens with the text filled in. Attach any photos, scans or PDFs to the email before sending.')}</p>
      <button type="submit">{t('Skriv e-mail', 'Write email')}</button>
      {mail ? <p className="hint">{t('Åbner der ikke noget? Skriv direkte til ', 'Nothing opens? Write directly to ')}<a href={`mailto:${mail}`}>{mail}</a>.</p> : null}
    </form>
  );
}
