import type { AnschriftenfeldTask, AnschriftLine } from './types';

const SENDER = 'Markus Mustermann, Musterstraße 1, 11111 Musterstadt';

/* ---------- Zufall mit festem Startwert: gleiche IDs bei jedem Laden der Seite ---------- */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240607);
const randInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)];
}

/* ---------- Datenpools ---------- */

const MALE = [
  'Stephan', 'Markus', 'Thomas', 'Alexander', 'Michael', 'Felix', 'Jan', 'Lukas', 'Daniel', 'Andreas', 'Florian',
  'Christian', 'Matthias', 'Sebastian', 'Tobias', 'Oliver', 'Jürgen', 'Klaus', 'Peter', 'Martin', 'Stefan',
  'Benedikt', 'Patrick', 'Dominik',
];
const FEMALE = [
  'Anna', 'Julia', 'Sabine', 'Nicole', 'Stephanie', 'Claudia', 'Katharina', 'Lisa', 'Laura', 'Petra', 'Sandra',
  'Monika', 'Christina', 'Melanie', 'Andrea', 'Birgit', 'Verena', 'Eva', 'Miriam', 'Heike',
];
const LAST = [
  'Breitner', 'Keller', 'Vogel', 'Hoffmann', 'Wolf', 'Lindner', 'Krause', 'Berger', 'Steiner', 'Bergmann', 'Schneider',
  'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Richter', 'Klein', 'Neumann', 'Schwarz', 'Zimmermann',
  'Braun', 'Hofmann', 'Lang', 'Hartmann', 'Kaiser', 'Fuchs', 'Peters', 'Jung', 'Scholz', 'Lorenz', 'Brandt', 'Ziegler',
  'Engel', 'Weidert', 'Sonnenschein', 'Kramer', 'Albrecht', 'Vollmer',
];
const STREETS = [
  'Birkenweg', 'Lindenstraße', 'Ahornweg', 'Feldweg', 'Gartenweg', 'Rosenweg', 'Bahnhofstraße', 'Hauptstraße',
  'Schillerstraße', 'Goethestraße', 'Mühlenweg', 'Waldstraße', 'Bergstraße', 'Schulstraße', 'Gartenstraße',
  'Kastanienallee', 'Eichenweg', 'Wiesenweg', 'Dorfstraße', 'Sonnenstraße', 'Mozartstraße', 'Friedrichstraße',
  'Kaiserstraße', 'Ringstraße', 'Parkstraße', 'Tulpenweg', 'Uferstraße', 'Lessingstraße', 'Marktplatz', 'Kirchplatz',
];
const CITIES: readonly (readonly [string, string])[] = [
  ['Berlin', '10115'], ['Hamburg', '20095'], ['München', '80331'], ['Köln', '50667'], ['Frankfurt', '60311'],
  ['Stuttgart', '70173'], ['Düsseldorf', '40213'], ['Leipzig', '04109'], ['Dortmund', '44135'], ['Essen', '45127'],
  ['Bremen', '28195'], ['Dresden', '01067'], ['Hannover', '30159'], ['Nürnberg', '90402'], ['Duisburg', '47051'],
  ['Bochum', '44787'], ['Wuppertal', '42103'], ['Bielefeld', '33602'], ['Bonn', '53111'], ['Münster', '48143'],
  ['Karlsruhe', '76133'], ['Mannheim', '68159'], ['Augsburg', '86150'], ['Wiesbaden', '65183'], ['Mainz', '55116'],
  ['Trier', '54290'], ['Koblenz', '56068'], ['Saarbrücken', '66111'], ['Freiburg', '79098'], ['Ulm', '89073'],
  ['Regensburg', '93047'], ['Würzburg', '97070'], ['Kassel', '34117'], ['Erfurt', '99084'], ['Rostock', '18055'],
  ['Kiel', '24103'], ['Lübeck', '23552'], ['Paderborn', '33098'], ['Osnabrück', '49074'], ['Heidelberg', '69117'],
];
const TITLES = ['Dr.', 'Dr.', 'Prof. Dr.', 'Prof.'] as const;
const BRANCHEN = [
  'Bäckerei', 'Stahlbau', 'Elektro', 'Autohaus', 'Schreinerei', 'Druckerei', 'Gärtnerei', 'Metallbau', 'Malerbetrieb',
  'Sanitär', 'Spedition', 'Fahrradhaus', 'Reisebüro', 'Buchhandlung', 'Getränkehandel', 'Fliesenleger',
];
const RECHTSFORMEN = ['GmbH', 'GmbH', 'KG', 'OHG', 'AG', 'GmbH & Co. KG'];
/** [männlich, weiblich, Anliegen, für das man sich an diese Person wendet] */
const BERUFE: readonly (readonly [string, string, string])[] = [
  ['Rechtsanwalt', 'Rechtsanwältin', 'einem Streit mit einem Lieferanten'],
  ['Steuerberater', 'Steuerberaterin', 'der Umsatzsteuererklärung des Betriebs'],
  ['Architekt', 'Architektin', 'dem geplanten Umbau der Werkstatt'],
  ['Notar', 'Notarin', 'dem Kauf eines Grundstücks für eine neue Lagerhalle'],
  ['Bürgermeister', 'Bürgermeisterin', 'einem Firmenjubiläum, das auf dem Marktplatz gefeiert werden soll'],
  ['Direktor', 'Direktorin', 'einer geplanten Kooperation zur Ausbildung von Praktikanten'],
  ['Apotheker', 'Apothekerin', 'der Ausstattung der betrieblichen Erste-Hilfe-Kästen'],
];
/** Ämter mit Zuständigkeit (wie auf der Internetseite) und einem konkreten Anliegen des Betriebs. */
const AEMTER: Record<string, readonly [string, string]> = {
  Bürgeramt: ['Personalausweise, Reisepässe, Meldebescheinigungen', 'für den Firmeninhaber eine Meldebescheinigung anfordern'],
  Ordnungsamt: ['Veranstaltungen und Verkaufsstände im öffentlichen Raum', 'einen Verkaufsstand beim Stadtfest anmelden'],
  Bauamt: ['Bauanträge, Baugenehmigungen, Bebauungspläne', 'den Antrag für eine neue Lagerhalle einreichen'],
  Gewerbeamt: ['An-, Um- und Abmeldung von Gewerbebetrieben', 'eine zweite Betriebsstätte anmelden'],
  Standesamt: ['Geburten, Eheschließungen, Sterbefälle, Urkunden', 'eine Heiratsurkunde für die Personalakte anfordern'],
  Umweltamt: ['Baumschutz, Gewässerschutz, Abfallrecht', 'eine Genehmigung zum Fällen einer alten Eiche auf dem Firmengelände beantragen'],
  Zulassungsstelle: ['An-, Um- und Abmeldung von Kraftfahrzeugen', 'zwei neue Lieferwagen anmelden'],
  Jugendamt: ['Kinder- und Jugendhilfe, Kindertagesbetreuung', 'sich über Zuschüsse für eine betriebliche Kinderbetreuung informieren'],
  Gesundheitsamt: ['Infektionsschutz, Hygienebelehrungen, Trinkwasser', 'einen Termin für die Hygienebelehrung neuer Küchenkräfte vereinbaren'],
  Einwohnermeldeamt: ['An- und Ummeldung des Wohnsitzes, Meldebescheinigungen', 'eine Meldebescheinigung für einen neuen Mitarbeiter anfordern'],
};
const BEHOERDEN: readonly (readonly [string, readonly string[]])[] = [
  ['Stadtverwaltung', ['Bürgeramt', 'Ordnungsamt', 'Bauamt', 'Gewerbeamt', 'Standesamt', 'Umweltamt']],
  ['Kreisverwaltung', ['Zulassungsstelle', 'Jugendamt', 'Gesundheitsamt', 'Bauamt']],
  ['Gemeindeverwaltung', ['Einwohnermeldeamt', 'Bauamt', 'Ordnungsamt']],
];
const ABTEILUNGEN = ['Vertrieb', 'Einkauf', 'Kundenservice', 'Auftragsabwicklung', 'Projektleitung', 'Technischer Support'];
const WOCHENTAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

/* ---------- Bausteine ---------- */

interface Person {
  female: boolean;
  first: string;
  last: string;
  title?: string;
}

function person(withTitle: boolean): Person {
  const female = rand() < 0.5;
  return {
    female,
    first: pick(female ? FEMALE : MALE),
    last: pick(LAST),
    title: withTitle ? pick(TITLES) : undefined,
  };
}

/** Eine weitere Person als Ablenker, die nicht mit dem Empfänger verwechselt werden darf. */
function anderePerson(p: Person): Person {
  let q = person(rand() < 0.3);
  while (q.first === p.first || q.last === p.last) q = person(rand() < 0.3);
  return q;
}

const anredeOf = (p: Person) => (p.female ? 'Frau' : 'Herrn');
const nameOf = (p: Person) => [p.title, p.first, p.last].filter(Boolean).join(' ');
/** Bewusst im Nominativ („Herr“), damit die Anrede „Herrn“ selbst gebildet werden muss. */
const kurzname = (p: Person) => [p.female ? 'Frau' : 'Herr', p.title, p.last].filter(Boolean).join(' ');

/** Pronomen für eine Person, damit das Geschlecht nur aus dem Zusammenhang hervorgeht. */
function pr(p: Person) {
  return p.female
    ? { er: 'sie', Er: 'Sie', ihn: 'sie', ihm: 'ihr', sein: 'ihr', seine: 'ihre', Seine: 'Ihre', seines: 'ihres', seiner: 'ihrer' }
    : { er: 'er', Er: 'Er', ihn: 'ihn', ihm: 'ihm', sein: 'sein', seine: 'seine', Seine: 'Seine', seines: 'seines', seiner: 'seiner' };
}

interface Chef {
  Nom: string;
  nom: string;
  er: string;
  Er: string;
  ihm: string;
}

function chef(): Chef {
  return rand() < 0.5
    ? { Nom: 'Dein Chef', nom: 'dein Chef', er: 'er', Er: 'Er', ihm: 'ihm' }
    : { Nom: 'Deine Chefin', nom: 'deine Chefin', er: 'sie', Er: 'Sie', ihm: 'ihr' };
}

function hausnummer(): string {
  const n = randInt(1, 120);
  return rand() < 0.18 ? `${n} ${pick(['a', 'b', 'c'])}` : String(n);
}

interface Adresse {
  strasseName: string;
  nr: string;
  strasse: string;
  plz: string;
  ort: string;
}

function deutscheAdresse(): Adresse {
  const [ort, plz] = pick(CITIES);
  const strasseName = pick(STREETS);
  const nr = hausnummer();
  return { strasseName, nr, strasse: `${strasseName} ${nr}`, plz, ort };
}

/** Andere Adresse in einem anderen Ort (z. B. alte Wohnung, Zweigstelle). */
function andereAdresse(a: Adresse): Adresse {
  let b = deutscheAdresse();
  while (b.ort === a.ort) b = deutscheAdresse();
  return b;
}

/** Andere Postleitzahl im selben Ort: Großstädte haben viele Postleitzahlen. */
function nachbarPlz(plz: string): string {
  return String(Number(plz) + randInt(2, 9)).padStart(5, '0');
}

/** Andere Adresse im selben Ort (z. B. Lager, Lieferadresse, Hausanschrift neben dem Postfach). */
function nachbarAdresse(a: Adresse): Adresse {
  let strasseName = pick(STREETS);
  while (strasseName === a.strasseName) strasseName = pick(STREETS);
  const nr = hausnummer();
  return { strasseName, nr, strasse: `${strasseName} ${nr}`, plz: nachbarPlz(a.plz), ort: a.ort };
}

/** „in der Lindenstraße“, „im Birkenweg“, „am Marktplatz“ */
function lage(strasseName: string): string {
  if (/platz$/.test(strasseName)) return `am ${strasseName}`;
  if (/weg$/.test(strasseName)) return `im ${strasseName}`;
  return `in der ${strasseName}`;
}

/** Adresse als Fließtext in wechselnder, nicht sortierter Reihenfolge. */
function adresseImText(a: Adresse): string {
  return pick([
    `${lage(a.strasseName)} ${a.nr} in ${a.ort} (Postleitzahl ${a.plz})`,
    `in ${a.ort}, und zwar ${lage(a.strasseName)}, Hausnummer ${a.nr} – die Postleitzahl ist die ${a.plz}`,
    `in ${a.plz} ${a.ort}, genauer gesagt ${lage(a.strasseName)} ${a.nr}`,
    `${lage(a.strasseName)}, Hausnummer ${a.nr}, in ${a.ort}; die Postleitzahl lautet ${a.plz}`,
  ]);
}

const telefon = () => `0${randInt(201, 999)} ${randInt(10000, 999999)}`;

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface Firma {
  voll: string;
  branche: string;
  inhaber: string;
  domain: string;
}

function firma(): Firma {
  const branche = pick(BRANCHEN);
  const inhaber = pick(LAST);
  return { voll: `${branche} ${inhaber} ${pick(RECHTSFORMEN)}`, branche, inhaber, domain: `${slug(`${branche}-${inhaber}`)}.de` };
}

const mailOf = (p: Person, domain: string) => `${slug(p.first)}.${slug(p.last)}@${domain}`;

/** Zwei Einträge in zufälliger Reihenfolge, damit die richtige Zeile nicht immer an derselben Stelle steht. */
function gemischt<T>(a: T, b: T): [T, T] {
  return rand() < 0.5 ? [a, b] : [b, a];
}

/** Postfachnummer von rechts in Zweiergruppen gliedern: 12345 -> "1 23 45". */
function postfachGegliedert(nummer: string): string {
  const gruppen: string[] = [];
  let rest = nummer;
  while (rest.length > 2) {
    gruppen.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) gruppen.unshift(rest);
  return gruppen.join(' ');
}

function line(
  id: string,
  caption: string,
  expected: string,
  explanation: string,
  zone: AnschriftLine['zone'] = 'anschrift',
): AnschriftLine {
  return { type: 'text', id, caption, zone, expected, explanation };
}

const EXPL = {
  herrn: 'Die Anrede an männliche Empfänger lautet aus grammatikalischen Gründen „Herrn“ und nicht „Herr“.',
  frau: 'Die Anrede an weibliche Empfänger lautet „Frau“ (anders als bei „Herrn“).',
  nameOhneTitel: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
  nameMitTitel:
    'Titel stehen mit einem Leerzeichen vor dem Vornamen. Die Anrede aus der Zeile darüber wird hier nicht wiederholt.',
  strasse: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
  hausnummerBuchstabe: 'Ein Buchstabe in der Hausnummer wird durch ein Leerzeichen von der Zahl getrennt.',
  ort: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
  firmaOhne:
    'Ist kein Ansprechpartner vorhanden, steht das Unternehmen direkt in der ersten Zeile – ohne Anrede und ohne den Zusatz „Firma“.',
  firmaMit: 'Die Firmenbezeichnung steht immer über dem Empfängernamen.',
  firmaPerson:
    'Bei einem Unternehmen mit Ansprechpartner stehen Anrede, Titel und Name in EINER gemeinsamen Zeile – anders als bei einer Privatperson, wo die Anrede eine eigene Zeile bekommt.',
  beruf: 'Berufs- bzw. Amtsbezeichnungen stehen in derselben Zeile hinter der Anrede.',
  postfach:
    'Postfachnummern werden von rechts nach links in Zweiergruppen gegliedert. Bleibt eine einzelne Ziffer übrig, steht sie allein ganz vorne.',
  postfachPlz:
    'Für ein Postfach gilt eine eigene Postleitzahl, die sich von der Postleitzahl der Hausanschrift unterscheiden kann. Im Anschriftenfeld steht die Postleitzahl des Postfachs.',
  grossOrt: 'Der Bestimmungsort wird bei Auslandssendungen in GROSSBUCHSTABEN geschrieben.',
  grossLand: 'Das Bestimmungsland wird bei Auslandssendungen ebenfalls in GROSSBUCHSTABEN geschrieben.',
  vermerkReihenfolge:
    'Mehrere postalische Vermerke werden untereinander aufgeführt; der zuletzt genannte steht direkt über der eigentlichen Anschrift.',
};

/** Anrede- und Namenszeilen einer Privatperson (ohne Berufsbezeichnung). */
function personLines(p: Person, nummer: number): AnschriftLine[] {
  return [
    line('anrede', `Zeile ${nummer} – Anrede`, anredeOf(p), p.female ? EXPL.frau : EXPL.herrn),
    line(
      'name',
      `Zeile ${nummer + 1} – Titel Vorname Nachname`,
      nameOf(p),
      p.title ? EXPL.nameMitTitel : EXPL.nameOhneTitel,
    ),
  ];
}

function strasseExplanation(strasse: string) {
  return /\d [a-c]$/.test(strasse) ? EXPL.hausnummerBuchstabe : EXPL.strasse;
}

/* ---------- Aufgabentypen ---------- */

let zaehler = 0;
const nextId = (kind: string) => `${kind}-${++zaehler}`;

function privatperson(withTitle: boolean): AnschriftenfeldTask {
  const p = person(withTitle);
  const g = pr(p);
  const a = deutscheAdresse();
  const alt = andereAdresse(a);
  const c = chef();
  const anlass = pick([
    'die versprochenen Unterlagen',
    'eine Einladung zu unserem Sommerfest',
    'ein Dankeschreiben für die gute Zusammenarbeit',
    'die Antwort auf die Anfrage von letzter Woche',
    'ein Glückwunschschreiben zum Geburtstag',
    'die Unterlagen zum Gebrauchtwagenkauf',
  ]);
  const variante = randInt(0, 2);
  let arbeitsauftrag: string;

  if (variante === 0) {
    arbeitsauftrag =
      `Auf deinem Schreibtisch liegt eine Telefonnotiz, die ${c.nom} für dich hinterlassen hat:\n\n` +
      `„${pick(WOCHENTAGE)}, ${randInt(8, 16)}:${pick(['05', '15', '30', '45'])} Uhr – Anruf von ${kurzname(p)} (Vorname: ${p.first}), Tel. ${telefon()}.\n` +
      `${g.Er} wartet noch auf ${anlass} – bitte per Post schicken! Achtung: ${g.Er} ist umgezogen. ` +
      `Die alte Adresse ${lage(alt.strasseName)} ${alt.nr}, ${alt.plz} ${alt.ort} gilt nicht mehr. ` +
      `Neu wohnt ${g.er} ${adresseImText(a)}.“\n\n` +
      'Erstelle das vollständige Anschriftenfeld für den Brief.';
  } else if (variante === 1) {
    arbeitsauftrag =
      `${c.Nom} leitet dir eine E-Mail weiter und schreibt dazu: „Bitte schick ${g.ihm} ${anlass} per Post – an die Privatadresse, nicht ins Büro!“\n\n` +
      '„Guten Tag,\n' +
      `vielen Dank für das nette Gespräch. Tagsüber erreichen Sie mich im Büro ${lage(alt.strasseName)} ${alt.nr} in ${alt.ort}. ` +
      `Briefe schicken Sie aber bitte zu mir nach Hause: Ich wohne ${adresseImText(a)}.\n\n` +
      `Viele Grüße\n${nameOf(p)}\nTel. ${telefon()}“\n\n` +
      'Erstelle das vollständige Anschriftenfeld.';
  } else {
    const partner = anderePerson(p);
    partner.female = !p.female;
    partner.first = pick(partner.female ? FEMALE : MALE);
    partner.title = undefined;
    arbeitsauftrag =
      `${c.Nom} erzählt dir: „Heute Morgen war ${kurzname(p)} bei uns – mit Vornamen heißt ${g.er} übrigens ${p.first}. ` +
      `Bitte schick ${g.ihm} ${anlass}. ${g.Er} wohnt ${adresseImText(a)}. ` +
      `${p.female ? 'Ihr Mann' : 'Seine Frau'}, ${partner.first} ${p.last}, war auch dabei, aber der Brief ist nur für ${g.ihn} persönlich.“\n\n` +
      'Erstelle aus diesen Angaben das vollständige Anschriftenfeld.';
  }

  return {
    id: nextId('privat'),
    title: withTitle ? 'Privatperson mit Titel' : 'Privatperson ohne Titel',
    difficulty: withTitle ? 'mittel' : 'einfach',
    arbeitsauftrag,
    senderLine: SENDER,
    lines: [
      ...personLines(p, 6),
      line('strasse', 'Zeile 8 – Straße Hausnummer', a.strasse, strasseExplanation(a.strasse)),
      line('ort', 'Zeile 9 – PLZ Ort', `${a.plz} ${a.ort}`, EXPL.ort),
    ],
  };
}

function berufsbezeichnung(): AnschriftenfeldTask {
  const p = person(rand() < 0.5);
  const g = pr(p);
  const [m, f, thema] = pick(BERUFE);
  const beruf = p.female ? f : m;
  const beiThema = `bei ${thema}`.replace(/^bei dem /, 'beim ');
  const a = deutscheAdresse();
  const alt = andereAdresse(a);
  const c = chef();
  let arbeitsauftrag: string;

  if (rand() < 0.5) {
    const [buero1, buero2] = gemischt(
      `Büro ${a.ort}: ${a.strasse} · ${a.plz} ${a.ort}`,
      `Büro ${alt.ort}: ${alt.strasse} · ${alt.plz} ${alt.ort}`,
    );
    arbeitsauftrag =
      `${c.Nom} braucht Unterstützung ${beiThema} und legt dir eine Visitenkarte auf den Tisch: ` +
      `„Schreib bitte an ${g.ihn} persönlich – aber an das Büro in ${a.ort}, das in ${alt.ort} ist nur ${pick(WOCHENTAGE).toLowerCase()}s besetzt. ` +
      'Die Berufsbezeichnung soll mit in die Anschrift.“\n\n' +
      `${nameOf(p)}\n${beruf}\n${buero1}\n${buero2}\nTel. ${telefon()} · ${mailOf(p, `buero-${slug(p.last)}.de`)}\n\n` +
      'Erstelle das vollständige Anschriftenfeld.';
  } else {
    const q = anderePerson(p);
    arbeitsauftrag =
      `${c.Nom} braucht Unterstützung ${beiThema}. Ein Geschäftspartner hat ${c.ihm} dafür ${p.female ? 'eine' : 'einen'} ${beruf} empfohlen: ${nameOf(p)}. ` +
      `Laut Internetseite befindet sich das Büro ${adresseImText(a)}. ` +
      `Am Telefon hat ${q.female ? 'die Sekretärin' : 'der Sekretär'}, ${kurzname(q)}, bestätigt, dass ${kurzname(p)} die Angelegenheit selbst übernimmt.\n\n` +
      'Erstelle das vollständige Anschriftenfeld für den Brief an die zuständige Person. Die Berufsbezeichnung gehört mit in die Anschrift.';
  }

  return {
    id: nextId('beruf'),
    title: 'Berufsbezeichnung in der Anschrift',
    difficulty: 'mittel',
    arbeitsauftrag,
    senderLine: SENDER,
    lines: [
      line('anrede', 'Zeile 6 – Anrede Berufsbezeichnung', `${anredeOf(p)} ${beruf}`, EXPL.beruf),
      line('name', 'Zeile 7 – Titel Vorname Nachname', nameOf(p), p.title ? EXPL.nameMitTitel : EXPL.nameOhneTitel),
      line('strasse', 'Zeile 8 – Straße Hausnummer', a.strasse, strasseExplanation(a.strasse)),
      line('ort', 'Zeile 9 – PLZ Ort', `${a.plz} ${a.ort}`, EXPL.ort),
    ],
  };
}

function firmaOhneAnsprechpartner(): AnschriftenfeldTask {
  const fa = firma();
  const a = deutscheAdresse();
  const lager = nachbarAdresse(a);
  const gf = person(rand() < 0.3);
  const c = chef();
  const anlass = pick(['die Anfrage', 'das Angebot', 'die Reklamation', 'die Bestellung', 'die Bewerbung']);
  let arbeitsauftrag: string;

  if (rand() < 0.5) {
    const [zeile1, zeile2] = gemischt(
      `Postanschrift: ${a.strasse}, ${a.plz} ${a.ort}`,
      `Lager und Warenannahme: ${lager.strasse}, ${lager.plz} ${lager.ort}`,
    );
    arbeitsauftrag =
      `${c.Nom} möchte ${anlass} per Brief verschicken: „Wir kennen dort niemanden persönlich – schick es einfach an die Firma.“ ` +
      'Die Angaben hast du aus dem Impressum der Internetseite kopiert:\n\n' +
      `Impressum\n${fa.voll}\nGeschäftsführung: ${nameOf(gf)}\n${zeile1}\n${zeile2}\n` +
      `Telefon: ${telefon()} · E-Mail: info@${fa.domain}\nRegistergericht: Amtsgericht ${a.ort}, HRB ${randInt(1000, 99999)}\n\n` +
      'Erstelle das Anschriftenfeld.';
  } else {
    arbeitsauftrag =
      `${c.Nom} erzählt dir: „In der Zeitung war eine Anzeige der ${fa.branche} ${fa.inhaber}. ` +
      `Im Handelsregister ist das Unternehmen als ${fa.voll} eingetragen. Die sitzen ${adresseImText(a)}. ` +
      `Als Inhaber wird ${kurzname(gf)} genannt, aber ${gf.female ? 'die' : 'den'} kenne ich nicht – ${anlass} soll ganz allgemein an das Unternehmen gehen.“\n\n` +
      'Erstelle das Anschriftenfeld.';
  }

  return {
    id: nextId('firma'),
    title: 'Unternehmen ohne Ansprechpartner',
    difficulty: 'einfach',
    arbeitsauftrag,
    senderLine: SENDER,
    lines: [
      line('firma', 'Zeile 6 – Firma', fa.voll, EXPL.firmaOhne),
      line('strasse', 'Zeile 7 – Straße Hausnummer', a.strasse, strasseExplanation(a.strasse)),
      line('ort', 'Zeile 8 – PLZ Ort', `${a.plz} ${a.ort}`, EXPL.ort),
    ],
  };
}

function firmaMitAnsprechpartner(withTitle: boolean): AnschriftenfeldTask {
  const fa = firma();
  const p = person(withTitle);
  const g = pr(p);
  const q = anderePerson(p);
  const a = deutscheAdresse();
  const lieferung = nachbarAdresse(a);
  const c = chef();
  let arbeitsauftrag: string;

  if (rand() < 0.5) {
    const [zeile1, zeile2] = gemischt(
      `Postanschrift: ${a.strasse}, ${a.plz} ${a.ort}`,
      `Lieferadresse (nur Warenanlieferung): ${lieferung.strasse}, ${lieferung.plz} ${lieferung.ort}`,
    );
    arbeitsauftrag =
      `${c.Nom} zeigt dir eine E-Mail, die heute eingegangen ist: „Antworte bitte per Brief – und zwar direkt an ${p.female ? 'die Verfasserin' : 'den Verfasser'} der Mail.“\n\n` +
      '„Guten Tag,\n' +
      `wie telefonisch besprochen, übernehme ich ab sofort die Bearbeitung Ihres Auftrags. ` +
      `${q.female ? 'Meine Kollegin' : 'Mein Kollege'} ${nameOf(q)}, mit ${q.female ? 'der' : 'dem'} Sie bisher Kontakt hatten, ist in eine andere Abteilung gewechselt.\n\n` +
      `Mit freundlichen Grüßen\n${nameOf(p)}\n${pick(ABTEILUNGEN)}\n\n` +
      `${fa.voll}\n${zeile1}\n${zeile2}\nTel. ${telefon()} · ${mailOf(p, fa.domain)}“\n\n` +
      'Erstelle das vollständige Anschriftenfeld.';
  } else {
    arbeitsauftrag =
      `${c.Nom} kommt aus einem Telefonat und erzählt: „Ich hatte gerade die ${fa.voll} am Apparat. ` +
      `Zuerst war ${kurzname(q)} aus der Zentrale dran, aber zuständig für unseren Auftrag ist ${kurzname(p)} – mit Vornamen ${p.first}. ` +
      `Schreib bitte direkt an ${g.ihn}. Die Firma sitzt ${adresseImText(a)}. ` +
      `Nicht verwechseln: ${lage(lieferung.strasseName)} ${lieferung.nr} (${lieferung.plz}) ist nur das Lager.“\n\n` +
      'Erstelle das vollständige Anschriftenfeld.';
  }

  return {
    id: nextId('firma-person'),
    title: withTitle ? 'Unternehmen mit Ansprechpartner und Titel' : 'Unternehmen mit Ansprechpartner',
    difficulty: withTitle ? 'schwer' : 'mittel',
    arbeitsauftrag,
    senderLine: SENDER,
    lines: [
      line('firma', 'Zeile 6 – Firma', fa.voll, EXPL.firmaMit),
      line('name', 'Zeile 7 – Anrede Titel Vorname Nachname', `${anredeOf(p)} ${nameOf(p)}`, EXPL.firmaPerson),
      line('strasse', 'Zeile 8 – Straße Hausnummer', a.strasse, strasseExplanation(a.strasse)),
      line('ort', 'Zeile 9 – PLZ Ort', `${a.plz} ${a.ort}`, EXPL.ort),
    ],
  };
}

function postfach(): AnschriftenfeldTask {
  const p = person(rand() < 0.5);
  const g = pr(p);
  const [ort, plz] = pick(CITIES);
  const haus = nachbarAdresse({ strasseName: '', nr: '', strasse: '', plz, ort });
  const stellen = randInt(4, 6);
  const nummer = String(randInt(10 ** (stellen - 1), 10 ** stellen - 1));
  const ungerade = stellen % 2 === 1;
  const c = chef();
  let arbeitsauftrag: string;

  if (rand() < 0.5) {
    const [zeile1, zeile2] = gemischt(
      `Hausanschrift: ${haus.strasse}, ${haus.plz} ${ort}`,
      `Postanschrift: Postfach ${nummer}, ${plz} ${ort}`,
    );
    arbeitsauftrag =
      `${c.Nom} muss vertrauliche Unterlagen an ${p.female ? 'eine Gutachterin' : 'einen Gutachter'} schicken: „Die Post wird dort ausschließlich über das Postfach angenommen.“ ` +
      `Im Briefkopf ${g.seines} letzten Schreibens steht:\n\n` +
      `${nameOf(p)}\nSachverständigenbüro\n${zeile1}\n${zeile2}\nTel. ${telefon()}\n\n` +
      'Erstelle die vollständige Anschrift.';
  } else {
    arbeitsauftrag =
      `${c.Nom} erzählt dir: „Ich habe ein Schreiben von ${nameOf(p)} bekommen und muss vertrauliche Unterlagen zurückschicken. ` +
      `${g.Er} nimmt Post nur über ${g.sein} Postfach an, die Nummer ist die ${nummer}. ` +
      `Die Hausanschrift ${lage(haus.strasseName)} ${haus.nr} hat die Postleitzahl ${haus.plz}, für das Postfach gilt aber die ${plz}. ` +
      `Beides liegt natürlich in ${ort}.“\n\n` +
      'Erstelle die vollständige Anschrift.';
  }

  return {
    id: nextId('postfach'),
    title: ungerade ? 'Postfach mit ungerader Ziffernzahl' : 'Postfach',
    difficulty: ungerade ? 'schwer' : 'mittel',
    arbeitsauftrag,
    senderLine: SENDER,
    lines: [
      ...personLines(p, 6),
      line('postfach', 'Zeile 8 – Postfach', `Postfach ${postfachGegliedert(nummer)}`, EXPL.postfach),
      line('ort', 'Zeile 9 – PLZ Ort', `${plz} ${ort}`, `${EXPL.ort} ${EXPL.postfachPlz}`),
    ],
  };
}

function vermerke(): AnschriftenfeldTask {
  const variante = pick(['privat', 'einschreiben-privat', 'einschreiben'] as const);
  const p = person(rand() < 0.4);
  const g = pr(p);
  const a = deutscheAdresse();
  const firmaAlt = andereAdresse(a);
  const c = chef();
  const bekannt = `${p.female ? 'einer langjährigen Bekannten' : 'einem langjährigen Bekannten'}, ${nameOf(p)},`;
  const zusatz: AnschriftLine[] = [];
  let anlass: string;
  let titel: string;
  let difficulty: AnschriftenfeldTask['difficulty'];

  if (variante === 'privat') {
    titel = 'Vermerk „Privat“';
    difficulty = 'mittel';
    anlass = `${c.Nom} schreibt ${bekannt} einen persönlichen Brief zu einem sensiblen familiären Thema. Niemand anderes im Haushalt soll den Brief öffnen, bevor ${kurzname(p)} ihn selbst gelesen hat.`;
    zusatz.push(
      line('vermerk', 'Zusatz- und Vermerkzone – Zeile direkt über der Anschrift', 'Privat',
        'Der Vermerk „Privat“ weist zusätzlich auf das Briefgeheimnis hin: In Deutschland darf niemand einen an eine andere Person adressierten Brief öffnen.',
        'zusatz'),
    );
  } else if (variante === 'einschreiben-privat') {
    titel = 'Einschreiben und „Privat“ kombiniert';
    difficulty = 'schwer';
    anlass = `${c.Nom} möchte ${bekannt} ein wichtiges persönliches Dokument zukommen lassen. Der Empfang soll nachweisbar sein, gleichzeitig soll aber niemand außer ${g.ihm} selbst den Umschlag öffnen.`;
    zusatz.push(
      line('vermerk1', 'Zusatz- und Vermerkzone – obere Zeile', 'Einschreiben', EXPL.vermerkReihenfolge, 'zusatz'),
      line('vermerk2', 'Zusatz- und Vermerkzone – untere Zeile (direkt über der Anschrift)', 'Privat', EXPL.vermerkReihenfolge, 'zusatz'),
    );
  } else {
    titel = 'Vermerk „Einschreiben“';
    difficulty = 'mittel';
    anlass = `${c.Nom} verschickt wichtige Unterlagen an ${p.female ? 'eine Vertragspartnerin' : 'einen Vertragspartner'}, ${nameOf(p)}. Die Post soll die Übergabe gegen Unterschrift bestätigen, damit später nachgewiesen werden kann, dass der Brief angekommen ist.`;
    zusatz.push(
      line('vermerk', 'Zusatz- und Vermerkzone – Zeile direkt über der Anschrift', 'Einschreiben',
        'Mit dem Vermerk „Einschreiben“ wird der Brief nur gegen Unterschrift übergeben, der Empfang ist damit nachweisbar. Der Vermerk steht direkt über der Anschrift.',
        'zusatz'),
    );
  }

  return {
    id: nextId('vermerk'),
    title: titel,
    difficulty,
    arbeitsauftrag:
      `${anlass} ${g.Er} arbeitet ${lage(firmaAlt.strasseName)} ${firmaAlt.nr} in ${firmaAlt.ort}, der Brief soll aber an die Privatadresse gehen: ` +
      `${g.Er} wohnt ${adresseImText(a)}.\n\n` +
      'Erstelle das vollständige Anschriftenfeld und ergänze die passenden postalischen Vermerke.',
    senderLine: SENDER,
    lines: [
      ...zusatz,
      ...personLines(p, 6),
      line('strasse', 'Zeile 8 – Straße Hausnummer', a.strasse, strasseExplanation(a.strasse)),
      line('ort', 'Zeile 9 – PLZ Ort', `${a.plz} ${a.ort}`, EXPL.ort),
    ],
  };
}

function behoerde(): AnschriftenfeldTask {
  const [art, stellen] = pick(BEHOERDEN);
  const abteilung = pick(stellen);
  const [ort, plz] = pick(CITIES);
  const strasse = `${pick(['Rathausplatz', 'Marktplatz', 'Am Markt', 'Schlossstraße', 'Hauptstraße'])} ${randInt(1, 30)}`;
  const besucher = `${pick(['Bürgerzentrum, Kirchgasse', 'Verwaltungsgebäude, Bahnhofstraße', 'Servicecenter, Lindenallee'])} ${randInt(2, 40)}`;
  const name = `${art} ${ort}`;
  const c = chef();
  const liste = [...stellen]
    .sort(() => rand() - 0.5)
    .map((amt) => `• ${amt}: ${AEMTER[amt][0]}`)
    .join('\n');
  const [zeile1, zeile2] = gemischt(`Besucheradresse: ${besucher}`, `Postanschrift für Schreiben: ${strasse}, ${plz} ${ort}`);
  return {
    id: nextId('behoerde'),
    title: 'Behörde mit Fachabteilung',
    difficulty: 'einfach',
    arbeitsauftrag:
      `${c.Nom} möchte ${AEMTER[abteilung][1]} und bittet dich, das Schreiben an die richtige Stelle zu adressieren. ` +
      `Einen persönlichen Ansprechpartner kennt ${c.er} nicht. Auf der Internetseite der ${name} findest du:\n\n` +
      `${liste}\n\n${zeile1}\n${zeile2}\nÖffnungszeiten: Mo–Fr 8:00–12:00 Uhr\n\n` +
      'Finde heraus, welche Stelle zuständig ist, und erstelle die Anschrift so, dass Behörde und zuständige Stelle erkennbar sind.',
    senderLine: SENDER,
    lines: [
      line('firma', 'Zeile 6 – Behörde', name,
        'Bei Behörden steht der Name der Institution wie eine Firmenbezeichnung in der ersten Zeile der Anschrift.'),
      line('abteilung', 'Zeile 7 – Abteilung', abteilung,
        `Ist eine bestimmte Abteilung zuständig, aber kein persönlicher Ansprechpartner bekannt, wird die Abteilung in einer eigenen Zeile unter dem Namen der Institution genannt. Zuständig ist hier die Stelle „${abteilung}“ (${AEMTER[abteilung][0]}).`),
      line('strasse', 'Zeile 8 – Straße Hausnummer', strasse, EXPL.strasse),
      line('ort', 'Zeile 9 – PLZ Ort', `${plz} ${ort}`, EXPL.ort),
    ],
  };
}

/* ---------- Auslandsanschriften ---------- */

interface Land {
  key: string;
  landOriginal: string;
  landGross: string;
  vorwahl: string;
  domain: string;
  difficulty: AnschriftenfeldTask['difficulty'];
  strasseErklaerung: string;
  adresse: () => { strasse: string; ortZeile: string; ortOriginal: string; ort: string; plz: string };
}

const BUCHSTABEN = 'ABCDEFGHJKLMNPRSTVWXZ';
const zufallsBuchstaben = (n: number) => Array.from({ length: n }, () => BUCHSTABEN[randInt(0, BUCHSTABEN.length - 1)]).join('');

/** Ort und PLZ in der im Land üblichen Reihenfolge (PLZ vor dem Ort). */
function ortAngaben(plz: string, ort: string) {
  return { ortZeile: `${plz} ${ort.toUpperCase()}`, ortOriginal: `${plz} ${ort}`, ort, plz };
}

const LAENDER: readonly Land[] = [
  {
    key: 'oesterreich',
    landOriginal: 'Österreich',
    landGross: 'ÖSTERREICH',
    vorwahl: '+43',
    domain: 'at',
    difficulty: 'mittel',
    strasseErklaerung:
      'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. Österreich behält die deutsche Reihenfolge Straße vor Hausnummer bei.',
    adresse: () => {
      const [plz, ort] = pick([['1010', 'Wien'], ['5020', 'Salzburg'], ['6020', 'Innsbruck'], ['8010', 'Graz'], ['4020', 'Linz']]);
      return {
        strasse: `${pick(['Mariahilfer Straße', 'Kärntner Straße', 'Landstraße', 'Bahnhofstraße', 'Schlossgasse', 'Ringstraße'])} ${randInt(1, 90)}`,
        ...ortAngaben(plz, ort),
      };
    },
  },
  {
    key: 'schweiz',
    landOriginal: 'Schweiz',
    landGross: 'SCHWEIZ',
    vorwahl: '+41',
    domain: 'ch',
    difficulty: 'mittel',
    strasseErklaerung:
      'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In der Schweiz steht die Hausnummer wie in Deutschland hinter der Straße.',
    adresse: () => {
      const [plz, ort] = pick([['8001', 'Zürich'], ['3011', 'Bern'], ['4001', 'Basel'], ['6003', 'Luzern'], ['9000', 'St. Gallen']]);
      return {
        strasse: `${pick(['Bahnhofstrasse', 'Seestrasse', 'Hauptstrasse', 'Dorfstrasse', 'Kirchgasse'])} ${randInt(1, 70)}`,
        ...ortAngaben(plz, ort),
      };
    },
  },
  {
    key: 'niederlande',
    landOriginal: 'Niederlande',
    landGross: 'NIEDERLANDE',
    vorwahl: '+31',
    domain: 'nl',
    difficulty: 'mittel',
    strasseErklaerung: 'Die Niederlande behalten wie Deutschland die Reihenfolge Straße vor Hausnummer bei.',
    adresse: () => {
      const [plz, ort] = pick([['1012', 'Amsterdam'], ['3011', 'Rotterdam'], ['3511', 'Utrecht'], ['2511', 'Den Haag'], ['5611', 'Eindhoven']]);
      return {
        strasse: `${pick(['Kalverstraat', 'Herengracht', 'Oudegracht', 'Stationsweg', 'Keizersgracht'])} ${randInt(1, 120)}`,
        ...ortAngaben(`${plz} ${zufallsBuchstaben(2)}`, ort),
      };
    },
  },
  {
    key: 'frankreich',
    landOriginal: 'Frankreich',
    landGross: 'FRANKREICH',
    vorwahl: '+33',
    domain: 'fr',
    difficulty: 'schwer',
    strasseErklaerung:
      'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In Frankreich steht die Hausnummer vor der Straße.',
    adresse: () => {
      const [plz, ort] = pick([['75001', 'Paris'], ['69001', 'Lyon'], ['13001', 'Marseille'], ['67000', 'Strasbourg'], ['57000', 'Metz'], ['59000', 'Lille'], ['31000', 'Toulouse']]);
      return {
        strasse: `${randInt(1, 99)}, ${pick(['Rue de la Paix', 'Rue Victor Hugo', 'Rue Pasteur', 'Boulevard Voltaire', 'Rue de la République', 'Avenue Jean Jaurès', 'Rue St. Antoine'])}`,
        ...ortAngaben(plz, ort),
      };
    },
  },
  {
    key: 'grossbritannien',
    landOriginal: 'United Kingdom',
    landGross: 'GROSSBRITANNIEN',
    vorwahl: '+44',
    domain: 'co.uk',
    difficulty: 'schwer',
    strasseErklaerung:
      'In Großbritannien steht die Hausnummer wie in Frankreich vor dem Straßennamen, nicht dahinter wie in Deutschland.',
    adresse: () => {
      const [ort, plz] = pick([['London', 'NW1 6XE'], ['Manchester', 'M1 1AE'], ['Birmingham', 'B2 4QA'], ['Edinburgh', 'EH1 1YZ'], ['Bristol', 'BS1 4DJ'], ['Leeds', 'LS1 4AP']]);
      return {
        strasse: `${randInt(1, 99)} ${pick(['Baker Street', 'High Street', 'Station Road', 'Church Lane', 'Victoria Road', 'Queen Street'])}`,
        ortZeile: `${ort.toUpperCase()} ${plz}`,
        ortOriginal: `${ort} ${plz}`,
        ort,
        plz,
      };
    },
  },
  {
    key: 'italien',
    landOriginal: 'Italien',
    landGross: 'ITALIEN',
    vorwahl: '+39',
    domain: 'it',
    difficulty: 'mittel',
    strasseErklaerung:
      'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In Italien steht die Hausnummer wie in Deutschland hinter dem Straßennamen.',
    adresse: () => {
      const [plz, ort] = pick([['00184', 'Roma'], ['20121', 'Milano'], ['10121', 'Torino'], ['50122', 'Firenze'], ['40121', 'Bologna']]);
      return {
        strasse: `${pick(['Via Roma', 'Via Garibaldi', 'Corso Italia', 'Via Dante', 'Via Mazzini'])} ${randInt(1, 90)}`,
        ...ortAngaben(plz, ort),
      };
    },
  },
  {
    key: 'spanien',
    landOriginal: 'Spanien',
    landGross: 'SPANIEN',
    vorwahl: '+34',
    domain: 'es',
    difficulty: 'mittel',
    strasseErklaerung:
      'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In Spanien steht die Hausnummer wie in Deutschland hinter dem Straßennamen.',
    adresse: () => {
      const [plz, ort] = pick([['28013', 'Madrid'], ['08002', 'Barcelona'], ['46001', 'Valencia'], ['41001', 'Sevilla'], ['29015', 'Málaga']]);
      return {
        strasse: `${pick(['Calle Mayor', 'Calle de Alcalá', 'Avenida de la Constitución', 'Calle Real'])} ${randInt(1, 80)}`,
        ...ortAngaben(plz, ort),
      };
    },
  },
];

function ausland(land: Land, alsFirma: boolean): AnschriftenfeldTask {
  const a = land.adresse();
  const landLine = line('land', 'Bestimmungsland', land.landGross, EXPL.grossLand);
  const ortLine = line('ort', 'PLZ Bestimmungsort', a.ortZeile, EXPL.grossOrt);
  const strasseLine = line('strasse', 'Straße Hausnummer', a.strasse, land.strasseErklaerung);
  const tel = `${land.vorwahl} ${randInt(10, 99)} ${randInt(100000, 9999999)}`;
  const landName = land.landOriginal === 'United Kingdom' ? 'Großbritannien' : land.landOriginal;
  const c = chef();

  if (alsFirma) {
    const fa = firma();
    const gf = person(rand() < 0.3);
    return {
      id: nextId(`ausland-${land.key}`),
      title: `Auslandsanschrift: ${landName} (Unternehmen)`,
      difficulty: land.difficulty,
      arbeitsauftrag:
        `${c.Nom} möchte einem Unternehmen ein Angebot zusenden. Einen persönlichen Ansprechpartner kennt ${c.er} nicht. ` +
        'In der Fußzeile des letzten Schreibens dieses Unternehmens steht:\n\n' +
        `${fa.voll} · Geschäftsführung: ${nameOf(gf)} · ${a.strasse} · ${a.ortOriginal} · ${land.landOriginal} · Tel. ${tel} · www.${slug(`${fa.branche}-${fa.inhaber}`)}.${land.domain}\n\n` +
        'Übertrage die Auslandsanschrift korrekt in das Anschriftenfeld.',
      senderLine: SENDER,
      lines: [line('firma', 'Zeile 6 – Firma', fa.voll, EXPL.firmaOhne), strasseLine, ortLine, landLine],
    };
  }

  const p = person(false);
  const g = pr(p);
  const kundennummer = `K-${randInt(10000, 99999)}`;
  const arbeitsauftrag =
    rand() < 0.5
      ? `${c.Nom} möchte ${p.female ? 'einer Kundin' : 'einem Kunden'} eine Broschüre schicken. Im Kundenverwaltungsprogramm findest du diesen Datensatz:\n\n` +
        `Kundennummer: ${kundennummer}\nNachname: ${p.last}\nOrt: ${a.ort}\nAnrede: ${p.female ? 'Frau' : 'Herr'}\nLand: ${land.landOriginal}\n` +
        `Straße/Hausnummer: ${a.strasse}\nVorname: ${p.first}\nPostleitzahl: ${a.plz}\nTelefon: ${tel}\n\n` +
        'Übertrage diese Auslandsanschrift korrekt in das Anschriftenfeld.'
      : `${c.Nom} hat auf einer Messe ${p.female ? 'eine Geschäftsfrau' : 'einen Geschäftsmann'} aus ${landName === 'Schweiz' ? 'der Schweiz' : landName === 'Niederlande' ? 'den Niederlanden' : landName} kennengelernt und möchte ${g.ihm} eine Broschüre an die Privatadresse schicken. ` +
        `${g.Er} hat ${c.ihm} ${g.seine} Adresse auf einen Zettel geschrieben:\n\n` +
        `„${p.first} ${p.last} – ${a.strasse}, ${a.ortOriginal}, ${land.landOriginal}. Handy: ${tel}“\n\n` +
        `Auf ${g.seiner} Visitenkarte steht dagegen die Adresse ${g.seiner} Firma – die ist hier nicht gemeint. ` +
        'Übertrage die Auslandsanschrift korrekt in das Anschriftenfeld.';

  return {
    id: nextId(`ausland-${land.key}`),
    title: `Auslandsanschrift: ${landName}`,
    difficulty: land.difficulty,
    arbeitsauftrag,
    senderLine: SENDER,
    lines: [...personLines(p, 6), strasseLine, ortLine, landLine],
  };
}

/* ---------- Gesamtliste ---------- */

export function generateAnschriftenfeldTasks(): AnschriftenfeldTask[] {
  const tasks: AnschriftenfeldTask[] = [];
  const repeat = (n: number, make: () => AnschriftenfeldTask) => {
    for (let i = 0; i < n; i++) tasks.push(make());
  };

  repeat(14, () => privatperson(false));
  repeat(12, () => privatperson(true));
  repeat(12, berufsbezeichnung);
  repeat(12, firmaOhneAnsprechpartner);
  repeat(10, () => firmaMitAnsprechpartner(false));
  repeat(8, () => firmaMitAnsprechpartner(true));
  repeat(10, postfach);
  repeat(12, vermerke);
  repeat(10, behoerde);
  for (const land of LAENDER) {
    repeat(3, () => ausland(land, false));
    repeat(1, () => ausland(land, true));
  }
  return tasks;
}
