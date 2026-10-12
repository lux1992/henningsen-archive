// Dateringsguide som spørgsmål. Hvert svar kan sætte en tidligste (from) og seneste (to) årstal.
// weak: true betyder et indicium, ikke en grænse. Alle kilder er officielle (Louis Poulsen, museer, patenter).
const LP = 'https://www.louispoulsen.com/en/', WB = 'https://web.archive.org/web/2025/https://www.louispoulsen.com/da-dk/catalog/privat/';
const Q = {
  id: { q: 'Har lampen et Louis Poulsen-ID?', help: 'To ens mærkater med et sekscifret nummer (det ene sidder på lampen), eller et indgraveret 14-cifret nummer.', a: [
    { t: 'Ja', from: 2009, say: 'Louis Poulsen har sat ID-mærkater på alle lamper pakket efter december 2009.', url: LP + 'reflections/how-to-spot-an-original' },
    { t: 'Nej eller ved ikke', say: 'Det udelukker ikke noget. Tidlige originaler kan være helt umærkede: V&A’s bordlampe fra 1928 har ingen mærker.', url: 'https://collections.vam.ac.uk/item/O73130/table-lamp-hennigsen-poul/', weak: true } ] },
  pat: { q: 'Står der “PAT. APPL.” på fatningen?', help: 'Kig på metalhuset omkring pæren, evt. på indersiden. Det betyder “patent anmeldt”.', a: [
    { t: 'Ja', to: 1928, say: '“PAT. APPL.” tyder på, at lampen er lavet før patentet blev meddelt i 1928.', url: 'https://www.cooperhewitt.org/2019/05/24/a-new-form-for-a-new-technology/' },
    { t: 'Nej eller ved ikke', say: 'Ingen konklusion. Officielle kilder dokumenterer ikke senere stempler.', weak: true } ] },
  cert: { q: 'Fulgte der et ægthedscertifikat med?', a: [
    { t: 'Ja', from: 2008, say: 'Certifikater følger med Louis Poulsens limited editions. Den første nummererede jubilæumsudgave er fra 2008, den årlige PH Limited-serie fra 2014.', url: LP + 'customer-service/faq' },
    { t: 'Nej eller ved ikke', say: 'Ingen konklusion: de fleste PH-lamper er ikke limited editions.', weak: true } ] },
};
const WIZARD = [
  { id: 'ph5', t: 'PH 5', img: 'ph5', from: 1958, base: { say: 'PH 5 blev lanceret i 1958.', url: LP + 'press/ph-5' }, qs: [
    { q: 'Hvor stor er skærmen?', a: [
      { t: 'Ca. 50 cm', say: 'Standardstørrelsen siden 1958.', weak: true, url: LP + 'press/ph-5' },
      { t: 'Ca. 30 cm (PH 5 Mini)', from: 2017, say: 'PH 5 Mini kom i 2017.', url: LP + 'press/ph-5-mini' } ] },
    { q: 'Hvilken farve eller hvilket materiale?', a: [
      { t: 'Hvid, blå eller grafitgrå', say: 'Klassiske udførelser, fx i Louis Poulsens brochure fra 2002. De kan ikke dateres præcist.', weak: true, url: 'https://web.archive.org/web/20021227044248/http://www.louis-poulsen.dk:80/belysning/brochurer/pdf/KONSUMENTBROCHUR%20DK.PDF' },
      { t: 'Rose/Green, White/Rose, Dark grey/Turquoise eller Army green', from: 2013, say: 'De kombinationer kom i marts 2013.', url: 'https://web.archive.org/web/20131009102938/http://erez.louispoulsen.com:80/erez4/erez?cmd=get&src=lplbilleder/PDF%20for%20Web/DA/Brochure/PH%205%20nye%20farver_INT.pdf&width=2000&height=2000&tmp=None&quality=85&redirect=0&format=pdf' },
      { t: 'Kobber og hvid', from: 2018, say: 'Kobber kom i september 2018 til 60-året.', url: LP + 'press/ph-60th-anniversary' },
      { t: 'Messing og hvid', from: 2019, say: 'Messing kom i februar 2019, første gang PH 5 blev lavet i messing.', url: LP + 'press/ph-125' },
      { t: 'Pale Rose, Oyster Grey eller pastel', from: 2022, say: 'De farver kom i september 2022.', url: LP + 'press/ph-52' },
      { t: 'Mat hvid med lys rosa inderside', from: 2024, to: 2024, say: 'PH 5 Anniversary Edition blev kun solgt i 2024.', url: LP + 'reflections/150-years' } ] },
    { q: 'Er der røde og blå skærme inderst?', a: [
      { t: 'Ja', say: 'Et originalt træk, som senere er taget ud. Hvornår er ikke dokumenteret, og museumseksemplarer fra ca. 1990 og ca. 2010 har dem stadig.', weak: true, url: 'https://digitaltmuseum.se/021028370559' },
      { t: 'Nej', say: 'Tyder på en nyere udgave eller udskiftede dele, men giver intet årstal.', weak: true, url: 'https://www.louispoulsen.com/en-us/catalog/private/pendants/ph-5' } ] },
    'id', 'cert'] },
  { id: 'kogle', t: 'PH Kogle', img: 'kogle', from: 1958, base: { say: 'PH Kogle blev skabt i 1958 til Langeliniepavillonen.', url: LP + 'press/ph-60th-anniversary' }, qs: [
    { q: 'Hvor mange blade har den?', help: 'Tæl en krans og gang med antallet af kranse.', a: [
      { t: '72', say: 'Alle originale PH Kogler har 72 blade.', weak: true, url: LP + 'reflections/how-to-spot-an-original' },
      { t: 'Et andet antal', say: 'Advarsel: Louis Poulsen skriver, at en original altid har 72 blade. Det kan være en kopi.', warn: true, url: LP + 'reflections/how-to-spot-an-original' } ] },
    { q: 'Hvilket materiale er bladene?', a: [
      { t: 'Kobber, uden gravering', say: 'Den oprindelige udførelse, som stadig laves. Kan ikke dateres ud fra materialet.', weak: true, url: 'https://web.archive.org/web/20070610185531/http://louis-poulsen.dk/products/attachments/catalogue/da/da33_90145.pdf' },
      { t: 'Hvid eller rustfrit stål', say: 'Findes i Louis Poulsens produktark fra 2005 og 2007 og senere.', weak: true, url: 'https://web.archive.org/web/20070610185531/http://louis-poulsen.dk/products/attachments/catalogue/da/da33_90145.pdf' },
      { t: 'Glas', from: 2008, say: 'PH Kogle i glas kom i 2008.', url: WB + 'pendler-loftlamper/ph-artichoke-glass' },
      { t: 'Forgyldt (24 karat guld)', from: 2008, to: 2008, say: '50 eksemplarer til 50-året i 2008.', url: 'https://web.archive.org/web/20081021031456/http://www.louispoulsen.com:80/en/News-Press/ph%20artichoke%20gold.aspx' },
      { t: 'Børstet messing, graveret “1958–2018”', from: 2018, to: 2018, say: 'Jubilæumsudgave fra 2018.', url: LP + 'press/ph-60th-anniversary' },
      { t: 'Kobber med rosa inderside og gravering ved signaturen', from: 2019, to: 2019, say: 'Udgave til PH’s 125-års dag, kun i 2019.', url: LP + 'press/ph-125' },
      { t: 'Mat sort', from: 2020, say: 'Den sorte PH Kogle kom i februar 2020.', url: LP + 'press/ph-artichoke-black' } ] },
    'id', 'cert'] },
  { id: 'treskaerm', t: 'Treskærmslampe', sub: 'PH 3/2, 4/3, 3½-2½, 2/1 m.fl., bord eller pendel', img: 'bord', from: 1925, base: { say: 'Treskærmssystemet blev vist i Paris i 1925 og kom i produktion i 1926.', url: 'https://www.louispoulsen.com/en-us/guides-inspiration/ph-number-history' }, qs: [
    'pat',
    { q: 'Hvilken type er det?', a: [
      { t: 'Pendel i hvidlakeret metal (PH 4/3)', from: 1966, say: 'PH 4/3 i metal kom i 1966.', url: WB + 'pendler-loftlamper/ph-43-pendant' },
      { t: 'PH 3/3 eller PH 5/5', say: 'De “hele” størrelser var de første lamper i 1920’erne og blev genudsendt i 2022. Lampen er enten meget gammel eller meget ny.', weak: true, url: LP + 'press/ph-55--ph-33' },
      { t: 'PH 3½-2½ gulvlampe', from: 2002, say: 'Gulvlampen fik sin nuværende form i 2002.', url: 'https://web.archive.org/web/2026/https://www.louispoulsen.com/da-dk/catalog/privat/gulvlamper/ph-3-2-floor' },
      { t: 'Kobber eller ravfarvet glas', from: 2014, say: 'Ligner en af de årlige PH Limited Editions, der kom fra 2014.', url: LP + 'reflections/ph-limited-edition' },
      { t: 'Bruneret messing med ravfarvet overskærm', from: 2025, say: 'Centenary Collection fra 2025–26.', url: 'https://www.louispoulsen.com/en/ph-centenary-poster' },
      { t: 'Opalglas, messing eller andet', say: 'Klassiske udførelser, der kan ikke dateres ud fra udseendet alene.', weak: true } ] },
    'id', 'cert'] },
  { id: 'septima', t: 'PH Septima', img: 'septima', from: 1927, base: { say: 'Septima blev udviklet 1927–31.', url: WB + 'pendler-loftlamper/ph-septima' }, qs: [
    'pat',
    { q: 'Hvordan er ophæng og fatning?', a: [
      { t: 'Messingophæng og E27-fatning, glas med klare og frostede felter', from: 2020, say: 'Genudsendelsen fra 2020 har borosilikatglas, messingophæng og E27.', url: LP + 'press/ph-septima' },
      { t: 'Ældre udførelse', to: 1940, say: 'Den oprindelige Septima udgik omkring 1940 på grund af materialemangel. Meget få er bevaret.', url: WB + 'pendler-loftlamper/ph-septima' } ] }] },
  { id: 'qm', t: 'PH 2/2 Spørgsmålstegnet', img: 'qm', from: 1931, base: { say: 'Designet i 1931.', url: WB + 'bordlamper/ph-22-the-question-mark' }, qs: [
    'pat',
    { q: 'Hvordan ser den ud?', a: [
      { t: 'Messing med farvede glasskærme, fx rav', from: 1931, to: 1955, say: 'Den oprindelige udgave blev lavet til midten af 1950’erne.', url: WB + 'bordlamper/ph-22-the-question-mark' },
      { t: 'Børstet messing med hvide opalskærme', from: 2021, to: 2021, say: 'Limited edition, solgt 1.10.–31.12.2021.', url: 'https://www.louispoulsen.com/en-us/press/ph-22-question-mark-limited-edition' },
      { t: 'Pale Rose', say: 'En nyere udgave fra Louis Poulsens nuværende sortiment.', weak: true, url: 'https://www.louispoulsen.com/en/c/indoor-lighting/table-lamps/ph-22-question-mark-pale-rose-table-lamp' } ] },
    'id'] },
  { id: 'snebold', t: 'PH Snebold (Snowball)', img: 'snebold', from: 1983, base: { say: 'Vist i 1958, men først sat i produktion i 1983.', url: 'https://web.archive.org/web/20091016144816/http://erez.louispoulsen.com:80/erez4/erez?cmd=get&src=lplbilleder/PDF%20for%20Web/DA/NYT/Nyt%20586%20DK.pdf&width=2000&height=2000&tmp=None&quality=85&redirect=0&format=pdf' }, qs: [
    { q: 'Har den et indgraveret nummer (1–300)?', a: [
      { t: 'Ja', from: 2024, to: 2024, say: 'Anniversary Edition fra 2024, 300 nummererede eksemplarer.', url: LP + 'reflections/150-years' },
      { t: 'Nej', say: 'Almindelig produktion fra 1983 og frem.', weak: true } ] },
    'id'] },
  { id: 'lysekrone', t: 'PH 1/1 Lysekrone', sub: '“Bombardementskronen”', img: 'bombardement', from: 1933, base: { say: 'I kataloget fra 1933.', url: WB + 'pendler-loftlamper/ph-11-chandelier-centenary-edition' }, qs: [
    'pat',
    { q: 'Er den nummereret?', a: [
      { t: 'Ja', from: 2025, say: 'Centenary Edition med 3, 6 eller 9 arme, nummereret, fra 2025.', url: WB + 'pendler-loftlamper/ph-11-chandelier-centenary-edition' },
      { t: 'Nej', to: 1965, say: 'Den oprindelige lysekrone var i kataloget til midten af 1960’erne.', url: WB + 'pendler-loftlamper/ph-11-chandelier-centenary-edition' } ] }] },
  { id: 'louvre', t: 'PH Louvre', img: 'louvre', from: 1957, base: { say: 'Designet i 1957 til Skodsborg.', url: 'https://web.archive.org/web/20250211050956/https://www.louispoulsen.com/da-dk/catalog/privat/pendler-loftlamper/ph-louvre' }, qs: ['id'] },
  { id: 'phhat', t: 'PH Hat', img: 'phhat', from: 1961, base: { say: 'Designet i 1961.', url: 'https://web.archive.org/web/20250209110532/https://www.louispoulsen.com/da-dk/catalog/privat/vaeglamper/ph-hat' }, qs: ['id'] },
  { id: 'ph80', t: 'PH 80', img: 'ph80', from: 1974, base: { say: 'Lanceret i 1974, efter PH’s død.', url: WB + 'gulvlamper/ph-80' }, qs: ['id'] },
];
