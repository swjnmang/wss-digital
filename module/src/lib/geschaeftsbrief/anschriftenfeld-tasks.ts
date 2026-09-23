import type { AnschriftenfeldTask } from './types';

const SENDER = 'Markus Mustermann, Musterstraße 1, 11111 Musterstadt';

export const ANSCHRIFTENFELD_TASKS: AnschriftenfeldTask[] = [
  {
    id: 'privatperson-einfach',
    title: 'Privatperson ohne Titel',
    difficulty: 'einfach',
    scenario:
      'Du schreibst im Auftrag deines Chefs einen Brief an einen privaten Kunden. Erstelle die Anschrift aus den Notizzetteln.',
    facts: ['Empfänger: Stephan Breitner (männlich)', 'Straße: Birkenweg 11', 'Ort: 54344 Kenn'],
    senderLine: SENDER,
    lines: [
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herr', correct: false },
          { id: 'b', text: 'Herrn', correct: true },
          { id: 'c', text: 'Hr.', correct: false },
        ],
        explanation:
          'Die Anrede an männliche Empfänger lautet aus grammatikalischen Gründen „Herrn“ und nicht „Herr“.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Titel Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herrn Stephan Breitner', correct: false },
          { id: 'b', text: 'Breitner, Stephan', correct: false },
          { id: 'c', text: 'Stephan Breitner', correct: true },
        ],
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '11 Birkenweg', correct: false },
          { id: 'b', text: 'Birkenweg, 11', correct: false },
          { id: 'c', text: 'Birkenweg 11', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Kenn 54344', correct: false },
          { id: 'b', text: '54344, Kenn', correct: false },
          { id: 'c', text: '54344 Kenn', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'privatperson-titel',
    title: 'Privatperson mit Titel',
    difficulty: 'einfach',
    scenario: 'Diesmal hat die Empfängerin einen akademischen Titel. Achte auf die Anrede und die Reihenfolge.',
    facts: ['Empfängerin: Dr. Stephanie Breitner', 'Straße: Birkenweg 11', 'Ort: 54344 Kenn'],
    senderLine: SENDER,
    lines: [
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Frauen', correct: false },
          { id: 'b', text: 'Fr.', correct: false },
          { id: 'c', text: 'Frau', correct: true },
        ],
        explanation: 'Die Anrede an weibliche Empfänger bleibt unverändert „Frau“ (anders als bei „Herrn“).',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Titel Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Frau Dr. Stephanie Breitner', correct: false },
          { id: 'b', text: 'Stephanie Dr. Breitner', correct: false },
          { id: 'c', text: 'Dr. Stephanie Breitner', correct: true },
        ],
        explanation:
          'Titel stehen mit einem Leerzeichen vor dem Vornamen. Die Anrede aus Zeile 6 wird hier nicht wiederholt.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Birkenweg, 11', correct: false },
          { id: 'b', text: 'Birkenweg 11', correct: true },
          { id: 'c', text: '11 Birkenweg', correct: false },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '54344 Kenn', correct: true },
          { id: 'b', text: 'Kenn 54344', correct: false },
          { id: 'c', text: '54344, Kenn', correct: false },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'berufsbezeichnung-postfach',
    title: 'Berufsbezeichnung und Postfach',
    difficulty: 'mittel',
    scenario:
      'Der Empfänger hat einen Beruf, der in der Anschrift genannt werden soll, und ein Postfach statt einer Straße.',
    facts: [
      'Empfänger: Herr Rechtsanwalt Dr. Stephan Breitner',
      'Postfach: 3 10 20',
      'Ort: 54345 Kenn',
    ],
    senderLine: SENDER,
    lines: [
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede Berufsbezeichnung',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Rechtsanwalt', correct: false },
          { id: 'b', text: 'Herrn', correct: false },
          { id: 'c', text: 'Herrn Rechtsanwalt', correct: true },
        ],
        explanation: 'Berufs- bzw. Amtsbezeichnungen stehen in derselben Zeile hinter der Anrede.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Titel Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Stephan Dr. Breitner', correct: false },
          { id: 'b', text: 'Dr. Stephan Breitner', correct: true },
          { id: 'c', text: 'Breitner, Dr. Stephan', correct: false },
        ],
        explanation: 'Titel stehen mit Leerzeichen vor dem Vornamen.',
      },
      {
        id: 'postfach',
        caption: 'Zeile 8 – Straße Hausnummer (oder Postfach)',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Postfach 31020', correct: false },
          { id: 'b', text: 'Postfach 310 20', correct: false },
          { id: 'c', text: 'Postfach 3 10 20', correct: true },
        ],
        explanation:
          'Postfachnummern werden von rechts nach links in Zweiergruppen gegliedert – so wie eine Telefonnummer.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '54345 Kenn', correct: true },
          { id: 'b', text: 'Kenn 54345', correct: false },
          { id: 'c', text: '54345, Kenn', correct: false },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'unternehmen-ohne-ansprechpartner',
    title: 'Unternehmen ohne Ansprechpartner',
    difficulty: 'mittel',
    scenario:
      'Der Brief geht an ein Unternehmen, du kennst aber keinen persönlichen Ansprechpartner dort.',
    facts: ['Unternehmen: Stahlbau Weidert KG', 'Straße: Maienweg 11 a', 'Ort: 89081 Ulm'],
    senderLine: SENDER,
    lines: [
      {
        id: 'firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Firma Stahlbau Weidert KG', correct: false },
          { id: 'b', text: 'Herrn Stahlbau Weidert KG', correct: false },
          { id: 'c', text: 'Stahlbau Weidert KG', correct: true },
        ],
        explanation:
          'Ist kein Ansprechpartner vorhanden, steht das Unternehmen direkt in der ersten Zeile – ohne Anrede und ohne den Zusatz „Firma“.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 7 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Maienweg 11a', correct: false },
          { id: 'b', text: 'Maienweg, 11 a', correct: false },
          { id: 'c', text: 'Maienweg 11 a', correct: true },
        ],
        explanation: 'Ein Buchstabe in der Hausnummer wird durch ein Leerzeichen von der Zahl getrennt.',
      },
      {
        id: 'ort',
        caption: 'Zeile 8 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Ulm 89081', correct: false },
          { id: 'b', text: '89081 Ulm', correct: true },
          { id: 'c', text: '89081, Ulm', correct: false },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'unternehmen-mit-ansprechpartner',
    title: 'Unternehmen mit Ansprechpartner',
    difficulty: 'mittel',
    scenario:
      'Diesmal soll der Brief eine bestimmte Person im Unternehmen erreichen. Vergleiche genau mit der vorherigen Aufgabe.',
    facts: [
      'Unternehmen: Stahlbau Weidert KG',
      'Ansprechpartner: Herr Stephan Breitner',
      'Straße: Maienweg 11 a',
      'Ort: 89081 Ulm',
    ],
    senderLine: SENDER,
    lines: [
      {
        id: 'firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herrn Stephan Breitner', correct: false },
          { id: 'b', text: 'z. Hd. Stephan Breitner', correct: false },
          { id: 'c', text: 'Stahlbau Weidert KG', correct: true },
        ],
        explanation: 'Die Firmenbezeichnung steht immer über dem Empfängernamen.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Anrede Titel Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herr Stephan Breitner', correct: false },
          { id: 'b', text: 'Stephan Breitner', correct: false },
          { id: 'c', text: 'Herrn Stephan Breitner', correct: true },
        ],
        explanation:
          'Bei einem Unternehmen mit Ansprechpartner stehen Anrede und Name in EINER gemeinsamen Zeile – anders als bei einer Privatperson, wo die Anrede eine eigene Zeile bekommt.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Maienweg 11 a', correct: true },
          { id: 'b', text: 'Maienweg 11a', correct: false },
          { id: 'c', text: 'Maienweg, 11 a', correct: false },
        ],
        explanation: 'Ein Buchstabe in der Hausnummer wird durch ein Leerzeichen von der Zahl getrennt.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '89081, Ulm', correct: false },
          { id: 'b', text: 'Ulm 89081', correct: false },
          { id: 'c', text: '89081 Ulm', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'zusatz-und-vermerkzone',
    title: 'Zusatz- und Vermerkzone',
    difficulty: 'schwer',
    scenario:
      'Der Brief ist ein Einschreiben mit Rückschein an eine Privatperson. Ergänze zuerst die postalischen Vermerke, dann die Anschrift.',
    facts: [
      'Sendungsart: Einschreiben mit Rückschein',
      'Empfänger: Herrn Dr. Stephan Breitner (privat)',
      'Straße: Birkenweg 11',
      'Ort: 54344 Kenn',
    ],
    senderLine: SENDER,
    lines: [
      {
        id: 'vermerk1',
        caption: 'Zusatz- und Vermerkzone – obere Zeile',
        zone: 'zusatz',
        options: [
          { id: 'a', text: 'mit Rückschein', correct: false },
          { id: 'b', text: 'Privat', correct: false },
          { id: 'c', text: 'Einschreiben', correct: true },
        ],
        explanation:
          'Mehrere postalische Vermerke werden untereinander aufgeführt. „Einschreiben“ steht hier über „mit Rückschein“.',
      },
      {
        id: 'vermerk2',
        caption: 'Zusatz- und Vermerkzone – untere Zeile (direkt über der Anschrift)',
        zone: 'zusatz',
        options: [
          { id: 'a', text: 'Einschreiben', correct: false },
          { id: 'b', text: 'mit Rückschein', correct: true },
          { id: 'c', text: 'per Express', correct: false },
        ],
        explanation:
          'Auch bei mehreren Vermerken beginnt man auf der untersten Zeile der Zusatz- und Vermerkzone, also direkt über der eigentlichen Anschrift.',
      },
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herr', correct: false },
          { id: 'b', text: 'Herrn', correct: true },
          { id: 'c', text: 'Hr.', correct: false },
        ],
        explanation: 'Die Anrede an männliche Empfänger lautet „Herrn“, nicht „Herr“.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Titel Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Stephan Dr. Breitner', correct: false },
          { id: 'b', text: 'Dr. Stephan Breitner', correct: true },
          { id: 'c', text: 'Herrn Dr. Stephan Breitner', correct: false },
        ],
        explanation: 'Titel stehen mit Leerzeichen vor dem Vornamen, die Anrede wird nicht wiederholt.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Birkenweg 11', correct: true },
          { id: 'b', text: '11 Birkenweg', correct: false },
          { id: 'c', text: 'Birkenweg, 11', correct: false },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Kenn 54344', correct: false },
          { id: 'b', text: '54344, Kenn', correct: false },
          { id: 'c', text: '54344 Kenn', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'auslandsanschrift',
    title: 'Auslandsanschrift',
    difficulty: 'schwer',
    scenario:
      'Der Brief geht diesmal ins Ausland. Beachte die besonderen Regeln für Bestimmungsort und -land.',
    facts: [
      'Empfänger: Herr Stephan Breitner',
      'Adresse laut Notizzettel: Rue St. Antoine, Hausnummer 11',
      'Ort: 57600 Oeting',
      'Land: Frankreich',
    ],
    senderLine: SENDER,
    lines: [
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herr', correct: false },
          { id: 'b', text: 'Herrn', correct: true },
          { id: 'c', text: 'Hr.', correct: false },
        ],
        explanation: 'Die Anrede an männliche Empfänger lautet „Herrn“, nicht „Herr“ – auch bei Auslandsbriefen.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Breitner Stephan', correct: false },
          { id: 'b', text: 'Herrn Stephan Breitner', correct: false },
          { id: 'c', text: 'Stephan Breitner', correct: true },
        ],
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Rue St. Antoine 11', correct: false },
          { id: 'b', text: '11, Rue St. Antoine', correct: true },
          { id: 'c', text: 'Rue St. Antoine, 11', correct: false },
        ],
        explanation:
          'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In Frankreich steht die Hausnummer vor der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Bestimmungsort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '57600 Oeting', correct: false },
          { id: 'b', text: 'OETING 57600', correct: false },
          { id: 'c', text: '57600 OETING', correct: true },
        ],
        explanation: 'Der Bestimmungsort wird bei Auslandssendungen in GROSSBUCHSTABEN geschrieben.',
      },
      {
        id: 'land',
        caption: 'Zeile 10 – Bestimmungsland',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Frankreich', correct: false },
          { id: 'b', text: 'frankreich', correct: false },
          { id: 'c', text: 'FRANKREICH', correct: true },
        ],
        explanation: 'Das Bestimmungsland wird bei Auslandssendungen ebenfalls in GROSSBUCHSTABEN geschrieben.',
      },
    ],
  },
];

export function getAnschriftenfeldTaskById(id: string) {
  return ANSCHRIFTENFELD_TASKS.find((task) => task.id === id);
}
