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
const BERUFE: readonly (readonly [string, string])[] = [
  ['Rechtsanwalt', 'Rechtsanwältin'], ['Steuerberater', 'Steuerberaterin'], ['Architekt', 'Architektin'],
  ['Notar', 'Notarin'], ['Bürgermeister', 'Bürgermeisterin'], ['Direktor', 'Direktorin'], ['Apotheker', 'Apothekerin'],
];
const BEHOERDEN: readonly (readonly [string, readonly string[]])[] = [
  ['Stadtverwaltung', ['Bürgeramt', 'Ordnungsamt', 'Bauamt', 'Gewerbeamt', 'Standesamt', 'Umweltamt']],
  ['Kreisverwaltung', ['Zulassungsstelle', 'Jugendamt', 'Gesundheitsamt', 'Bauamt']],
  ['Gemeindeverwaltung', ['Einwohnermeldeamt', 'Bauamt', 'Ordnungsamt']],
];

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

const anredeOf = (p: Person) => (p.female ? 'Frau' : 'Herrn');
const nameOf = (p: Person) => [p.title, p.first, p.last].filter(Boolean).join(' ');
const boss = () => pick(['Dein Chef', 'Deine Chefin']);

function hausnummer(): string {
  const n = randInt(1, 120);
  return rand() < 0.18 ? `${n} ${pick(['a', 'b', 'c'])}` : String(n);
}

function deutscheAdresse() {
  const [ort, plz] = pick(CITIES);
  return { strasse: `${pick(STREETS)} ${hausnummer()}`, plz, ort };
}

function firmenname(): string {
  return `${pick(BRANCHEN)} ${pick(LAST)} ${pick(RECHTSFORMEN)}`;
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
  const a = deutscheAdresse();
  const anlass = pick([
    'einen Brief mit den versprochenen Unterlagen',
    'eine Einladung zum Sommerfest',
    'ein Dankeschreiben für die gute Zusammenarbeit',
    'die Antwort auf eine private Anfrage',
    'ein persönliches Glückwunschschreiben',
    'die Rückmeldung zu einem Gebrauchtwagenkauf',
  ]);
  return {
    id: nextId('privat'),
    title: withTitle ? 'Privatperson mit Titel' : 'Privatperson ohne Titel',
    difficulty: withTitle ? 'mittel' : 'einfach',
    arbeitsauftrag: `${boss()} bittet dich, ${anlass} zu adressieren. Empfänger ist ${anredeOf(p)} ${nameOf(p)}, ${a.strasse}, ${a.plz} ${a.ort}. Erstelle das vollständige Anschriftenfeld.`,
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
  const [m, f] = pick(BERUFE);
  const beruf = p.female ? f : m;
  const a = deutscheAdresse();
  return {
    id: nextId('beruf'),
    title: 'Berufsbezeichnung in der Anschrift',
    difficulty: 'mittel',
    arbeitsauftrag: `${boss()} benötigt fachlichen Rat und schreibt deshalb ${anredeOf(p)} ${beruf} ${nameOf(p)} an, ${p.female ? 'deren' : 'dessen'} Büro sich in der ${a.strasse} in ${a.plz} ${a.ort} befindet. Erstelle die vollständige Anschrift. Die Berufsbezeichnung gehört mit in die Anschrift.`,
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
  const firma = firmenname();
  const a = deutscheAdresse();
  const anlass = pick([
    'eine Anfrage',
    'ein allgemeines Angebot',
    'eine Reklamation',
    'eine Bestellung',
    'eine Bewerbung auf eine ausgeschriebene Stelle',
  ]);
  const chef = boss();
  return {
    id: nextId('firma'),
    title: 'Unternehmen ohne Ansprechpartner',
    difficulty: 'einfach',
    arbeitsauftrag: `${chef} möchte ${anlass} an das Unternehmen ${firma} schicken. Die Adresse lautet ${a.strasse}, ${a.plz} ${a.ort}. Einen persönlichen Ansprechpartner kennt ${chef === 'Dein Chef' ? 'er' : 'sie'} nicht. Erstelle das Anschriftenfeld.`,
    senderLine: SENDER,
    lines: [
      line('firma', 'Zeile 6 – Firma', firma, EXPL.firmaOhne),
      line('strasse', 'Zeile 7 – Straße Hausnummer', a.strasse, strasseExplanation(a.strasse)),
      line('ort', 'Zeile 8 – PLZ Ort', `${a.plz} ${a.ort}`, EXPL.ort),
    ],
  };
}

function firmaMitAnsprechpartner(withTitle: boolean): AnschriftenfeldTask {
  const firma = firmenname();
  const p = person(withTitle);
  const a = deutscheAdresse();
  const chef = boss();
  return {
    id: nextId('firma-person'),
    title: withTitle ? 'Unternehmen mit Ansprechpartner und Titel' : 'Unternehmen mit Ansprechpartner',
    difficulty: withTitle ? 'schwer' : 'mittel',
    arbeitsauftrag: `${chef} hat mit dem Unternehmen ${firma} (${a.strasse}, ${a.plz} ${a.ort}) telefoniert und dabei direkt mit ${anredeOf(p)} ${nameOf(p)} gesprochen, und ${p.female ? 'sie' : 'er'} wird die Angelegenheit bearbeiten. Der Brief soll gezielt an diese Person gehen. Erstelle das vollständige Anschriftenfeld.`,
    senderLine: SENDER,
    lines: [
      line('firma', 'Zeile 6 – Firma', firma, EXPL.firmaMit),
      line('name', 'Zeile 7 – Anrede Titel Vorname Nachname', `${anredeOf(p)} ${nameOf(p)}`, EXPL.firmaPerson),
      line('strasse', 'Zeile 8 – Straße Hausnummer', a.strasse, strasseExplanation(a.strasse)),
      line('ort', 'Zeile 9 – PLZ Ort', `${a.plz} ${a.ort}`, EXPL.ort),
    ],
  };
}

function postfach(): AnschriftenfeldTask {
  const p = person(rand() < 0.5);
  const [ort, plz] = pick(CITIES);
  const stellen = randInt(4, 6);
  const nummer = String(randInt(10 ** (stellen - 1), 10 ** stellen - 1));
  const ungerade = stellen % 2 === 1;
  return {
    id: nextId('postfach'),
    title: ungerade ? 'Postfach mit ungerader Ziffernzahl' : 'Postfach',
    difficulty: ungerade ? 'schwer' : 'mittel',
    arbeitsauftrag: `${boss()} schickt vertrauliche Unterlagen an ${anredeOf(p)} ${nameOf(p)}. Die Post wird dort ausschließlich über ein Postfach entgegengenommen: Postfach ${nummer}, ${plz} ${ort}. Erstelle die vollständige Anschrift.`,
    senderLine: SENDER,
    lines: [
      ...personLines(p, 6),
      line('postfach', 'Zeile 8 – Postfach', `Postfach ${postfachGegliedert(nummer)}`, EXPL.postfach),
      line('ort', 'Zeile 9 – PLZ Ort', `${plz} ${ort}`, EXPL.ort),
    ],
  };
}

function vermerke(): AnschriftenfeldTask {
  const variante = pick(['privat', 'einschreiben-privat', 'einschreiben-rueckschein'] as const);
  const p = person(rand() < 0.4);
  const a = deutscheAdresse();
  const zusatz: AnschriftLine[] = [];
  let anlass: string;
  let titel: string;
  let difficulty: AnschriftenfeldTask['difficulty'];

  if (variante === 'privat') {
    titel = 'Vermerk „Privat“';
    difficulty = 'mittel';
    anlass = `${boss()} schreibt ${anredeOf(p)} ${nameOf(p)} einen persönlichen Brief zu einem sensiblen familiären Thema. Niemand anderes im Haushalt soll den Brief öffnen, bevor ${p.female ? 'die Empfängerin' : 'der Empfänger'} ihn selbst gelesen hat.`;
    zusatz.push(
      line('vermerk', 'Zusatz- und Vermerkzone – Zeile direkt über der Anschrift', 'Privat',
        'Der Vermerk „Privat“ weist zusätzlich auf das Briefgeheimnis hin: In Deutschland darf niemand einen an eine andere Person adressierten Brief öffnen.',
        'zusatz'),
    );
  } else if (variante === 'einschreiben-privat') {
    titel = 'Einschreiben und „Privat“ kombiniert';
    difficulty = 'schwer';
    anlass = `${boss()} möchte ${anredeOf(p)} ${nameOf(p)} ein wichtiges persönliches Dokument zukommen lassen. Der Empfang soll nachweisbar sein, gleichzeitig soll aber niemand außer ${p.female ? 'der Empfängerin' : 'dem Empfänger'} selbst den Umschlag öffnen. Ergänze beide Vermerke in der richtigen Reihenfolge.`;
    zusatz.push(
      line('vermerk1', 'Zusatz- und Vermerkzone – obere Zeile', 'Einschreiben', EXPL.vermerkReihenfolge, 'zusatz'),
      line('vermerk2', 'Zusatz- und Vermerkzone – untere Zeile (direkt über der Anschrift)', 'Privat', EXPL.vermerkReihenfolge, 'zusatz'),
    );
  } else {
    titel = 'Einschreiben mit Rückschein';
    difficulty = 'schwer';
    anlass = `${boss()} verschickt wichtige Unterlagen an ${anredeOf(p)} ${nameOf(p)}. Weil der Empfang zweifelsfrei nachgewiesen werden muss, soll der Brief als Einschreiben mit Rückschein verschickt werden. Ergänze zuerst die passenden postalischen Vermerke.`;
    zusatz.push(
      line('vermerk1', 'Zusatz- und Vermerkzone – obere Zeile', 'Einschreiben', EXPL.vermerkReihenfolge, 'zusatz'),
      line('vermerk2', 'Zusatz- und Vermerkzone – untere Zeile (direkt über der Anschrift)', 'mit Rückschein', EXPL.vermerkReihenfolge, 'zusatz'),
    );
  }

  return {
    id: nextId('vermerk'),
    title: titel,
    difficulty,
    arbeitsauftrag: `${anlass} Die Anschrift lautet: ${a.strasse}, ${a.plz} ${a.ort}.`,
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
  const name = `${art} ${ort}`;
  return {
    id: nextId('behoerde'),
    title: 'Behörde mit Fachabteilung',
    difficulty: 'einfach',
    arbeitsauftrag: `${boss()} schickt Unterlagen an die ${name}, ${strasse}, ${plz} ${ort}. Zuständig ist dort die Stelle „${abteilung}“. Ein persönlicher Ansprechpartner ist nicht bekannt. Erstelle die Anschrift so, dass sowohl die Behörde als auch die zuständige Stelle erkennbar sind.`,
    senderLine: SENDER,
    lines: [
      line('firma', 'Zeile 6 – Behörde', name,
        'Bei Behörden steht der Name der Institution wie eine Firmenbezeichnung in der ersten Zeile der Anschrift.'),
      line('abteilung', 'Zeile 7 – Abteilung', abteilung,
        'Ist eine bestimmte Abteilung zuständig, aber kein persönlicher Ansprechpartner bekannt, wird die Abteilung in einer eigenen Zeile unter dem Namen der Institution genannt.'),
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
  difficulty: AnschriftenfeldTask['difficulty'];
  strasseErklaerung: string;
  adresse: () => { strasse: string; ortZeile: string; ortOriginal: string };
}

const BUCHSTABEN = 'ABCDEFGHJKLMNPRSTVWXZ';
const zufallsBuchstaben = (n: number) => Array.from({ length: n }, () => BUCHSTABEN[randInt(0, BUCHSTABEN.length - 1)]).join('');

const LAENDER: readonly Land[] = [
  {
    key: 'oesterreich',
    landOriginal: 'Österreich',
    landGross: 'ÖSTERREICH',
    difficulty: 'mittel',
    strasseErklaerung:
      'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. Österreich behält die deutsche Reihenfolge Straße vor Hausnummer bei.',
    adresse: () => {
      const [plz, ort] = pick([['1010', 'Wien'], ['5020', 'Salzburg'], ['6020', 'Innsbruck'], ['8010', 'Graz'], ['4020', 'Linz']]);
      return {
        strasse: `${pick(['Mariahilfer Straße', 'Kärntner Straße', 'Landstraße', 'Bahnhofstraße', 'Schlossgasse', 'Ringstraße'])} ${randInt(1, 90)}`,
        ortZeile: `${plz} ${ort.toUpperCase()}`,
        ortOriginal: `${plz} ${ort}`,
      };
    },
  },
  {
    key: 'schweiz',
    landOriginal: 'Schweiz',
    landGross: 'SCHWEIZ',
    difficulty: 'mittel',
    strasseErklaerung:
      'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In der Schweiz steht die Hausnummer wie in Deutschland hinter der Straße.',
    adresse: () => {
      const [plz, ort] = pick([['8001', 'Zürich'], ['3011', 'Bern'], ['4001', 'Basel'], ['6003', 'Luzern'], ['9000', 'St. Gallen']]);
      return {
        strasse: `${pick(['Bahnhofstrasse', 'Seestrasse', 'Hauptstrasse', 'Dorfstrasse', 'Kirchgasse'])} ${randInt(1, 70)}`,
        ortZeile: `${plz} ${ort.toUpperCase()}`,
        ortOriginal: `${plz} ${ort}`,
      };
    },
  },
  {
    key: 'niederlande',
    landOriginal: 'Niederlande',
    landGross: 'NIEDERLANDE',
    difficulty: 'mittel',
    strasseErklaerung: 'Die Niederlande behalten wie Deutschland die Reihenfolge Straße vor Hausnummer bei.',
    adresse: () => {
      const [plz, ort] = pick([['1012', 'Amsterdam'], ['3011', 'Rotterdam'], ['3511', 'Utrecht'], ['2511', 'Den Haag'], ['5611', 'Eindhoven']]);
      const vollePlz = `${plz} ${zufallsBuchstaben(2)}`;
      return {
        strasse: `${pick(['Kalverstraat', 'Herengracht', 'Oudegracht', 'Stationsweg', 'Keizersgracht'])} ${randInt(1, 120)}`,
        ortZeile: `${vollePlz} ${ort.toUpperCase()}`,
        ortOriginal: `${vollePlz} ${ort}`,
      };
    },
  },
  {
    key: 'frankreich',
    landOriginal: 'Frankreich',
    landGross: 'FRANKREICH',
    difficulty: 'schwer',
    strasseErklaerung:
      'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In Frankreich steht die Hausnummer vor der Straße.',
    adresse: () => {
      const [plz, ort] = pick([['75001', 'Paris'], ['69001', 'Lyon'], ['13001', 'Marseille'], ['67000', 'Strasbourg'], ['57000', 'Metz'], ['59000', 'Lille'], ['31000', 'Toulouse']]);
      return {
        strasse: `${randInt(1, 99)}, ${pick(['Rue de la Paix', 'Rue Victor Hugo', 'Rue Pasteur', 'Boulevard Voltaire', 'Rue de la République', 'Avenue Jean Jaurès', 'Rue St. Antoine'])}`,
        ortZeile: `${plz} ${ort.toUpperCase()}`,
        ortOriginal: `${plz} ${ort}`,
      };
    },
  },
  {
    key: 'grossbritannien',
    landOriginal: 'United Kingdom',
    landGross: 'GROSSBRITANNIEN',
    difficulty: 'schwer',
    strasseErklaerung:
      'In Großbritannien steht die Hausnummer wie in Frankreich vor dem Straßennamen, nicht dahinter wie in Deutschland.',
    adresse: () => {
      const [ort, plz] = pick([['London', 'NW1 6XE'], ['Manchester', 'M1 1AE'], ['Birmingham', 'B2 4QA'], ['Edinburgh', 'EH1 1YZ'], ['Bristol', 'BS1 4DJ'], ['Leeds', 'LS1 4AP']]);
      return {
        strasse: `${randInt(1, 99)} ${pick(['Baker Street', 'High Street', 'Station Road', 'Church Lane', 'Victoria Road', 'Queen Street'])}`,
        ortZeile: `${ort.toUpperCase()} ${plz}`,
        ortOriginal: `${ort} ${plz}`,
      };
    },
  },
  {
    key: 'italien',
    landOriginal: 'Italien',
    landGross: 'ITALIEN',
    difficulty: 'mittel',
    strasseErklaerung:
      'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In Italien steht die Hausnummer wie in Deutschland hinter dem Straßennamen.',
    adresse: () => {
      const [plz, ort] = pick([['00184', 'Roma'], ['20121', 'Milano'], ['10121', 'Torino'], ['50122', 'Firenze'], ['40121', 'Bologna']]);
      return {
        strasse: `${pick(['Via Roma', 'Via Garibaldi', 'Corso Italia', 'Via Dante', 'Via Mazzini'])} ${randInt(1, 90)}`,
        ortZeile: `${plz} ${ort.toUpperCase()}`,
        ortOriginal: `${plz} ${ort}`,
      };
    },
  },
  {
    key: 'spanien',
    landOriginal: 'Spanien',
    landGross: 'SPANIEN',
    difficulty: 'mittel',
    strasseErklaerung:
      'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In Spanien steht die Hausnummer wie in Deutschland hinter dem Straßennamen.',
    adresse: () => {
      const [plz, ort] = pick([['28013', 'Madrid'], ['08002', 'Barcelona'], ['46001', 'Valencia'], ['41001', 'Sevilla'], ['29015', 'Málaga']]);
      return {
        strasse: `${pick(['Calle Mayor', 'Calle de Alcalá', 'Avenida de la Constitución', 'Calle Real'])} ${randInt(1, 80)}`,
        ortZeile: `${plz} ${ort.toUpperCase()}`,
        ortOriginal: `${plz} ${ort}`,
      };
    },
  },
];

function ausland(land: Land, alsFirma: boolean): AnschriftenfeldTask {
  const a = land.adresse();
  const originalAdresse = `${a.strasse}, ${a.ortOriginal}, ${land.landOriginal}`;
  const landLine = line('land', 'Bestimmungsland', land.landGross, EXPL.grossLand);
  const ortLine = line('ort', 'PLZ Bestimmungsort', a.ortZeile, EXPL.grossOrt);
  const strasseLine = line('strasse', 'Straße Hausnummer', a.strasse, land.strasseErklaerung);
  const quelle = pick(['Auf der Visitenkarte', 'In der E-Mail-Signatur', 'Auf dem Briefkopf des letzten Schreibens']);

  if (alsFirma) {
    const firma = firmenname();
    return {
      id: nextId(`ausland-${land.key}`),
      title: `Auslandsanschrift: ${land.landOriginal === 'United Kingdom' ? 'Großbritannien' : land.landOriginal} (Unternehmen)`,
      difficulty: land.difficulty,
      arbeitsauftrag: `${boss()} möchte dem Unternehmen ${firma} ein Angebot zusenden. Im letzten Schreiben des Unternehmens steht die Adresse „${originalAdresse}“. Ein persönlicher Ansprechpartner ist nicht bekannt. Übertrage die Auslandsanschrift korrekt in das Anschriftenfeld.`,
      senderLine: SENDER,
      lines: [line('firma', 'Zeile 6 – Firma', firma, EXPL.firmaOhne), strasseLine, ortLine, landLine],
    };
  }

  const p = person(false);
  return {
    id: nextId(`ausland-${land.key}`),
    title: `Auslandsanschrift: ${land.landOriginal === 'United Kingdom' ? 'Großbritannien' : land.landOriginal}`,
    difficulty: land.difficulty,
    arbeitsauftrag: `${boss()} hat ${anredeOf(p)} ${nameOf(p)} kennengelernt und möchte eine Broschüre zusenden. ${quelle} steht die Adresse „${originalAdresse}“. Übertrage diese Auslandsanschrift korrekt in das Anschriftenfeld.`,
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
