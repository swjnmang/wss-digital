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
  {
    id: 'privatperson-frau-einfach',
    title: 'Privatperson: Frau ohne Titel',
    difficulty: 'einfach',
    scenario: 'Diesmal ist die Empfängerin eine private Kundin ohne Titel. Vergleiche die Anrede mit „Herrn“.',
    facts: ['Empfängerin: Anna Keller (weiblich)', 'Straße: Lindenstraße 4', 'Ort: 60313 Frankfurt'],
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
        explanation: 'Die Anrede an weibliche Empfänger lautet „Frau“, unabhängig vom Familienstand.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Keller, Anna', correct: false },
          { id: 'b', text: 'Frau Anna Keller', correct: false },
          { id: 'c', text: 'Anna Keller', correct: true },
        ],
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '4 Lindenstraße', correct: false },
          { id: 'b', text: 'Lindenstraße, 4', correct: false },
          { id: 'c', text: 'Lindenstraße 4', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Frankfurt 60313', correct: false },
          { id: 'b', text: '60313, Frankfurt', correct: false },
          { id: 'c', text: '60313 Frankfurt', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'unternehmen-gmbh-ohne-ansprechpartner',
    title: 'Unternehmen (GmbH) ohne Ansprechpartner',
    difficulty: 'einfach',
    scenario: 'Der Brief geht an ein Unternehmen mit Rechtsform GmbH, du kennst keinen persönlichen Ansprechpartner.',
    facts: ['Unternehmen: Bäckerei Sonnenschein GmbH', 'Straße: Marktplatz 5', 'Ort: 79098 Freiburg'],
    senderLine: SENDER,
    lines: [
      {
        id: 'firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Firma Bäckerei Sonnenschein GmbH', correct: false },
          { id: 'b', text: 'Herrn Bäckerei Sonnenschein GmbH', correct: false },
          { id: 'c', text: 'Bäckerei Sonnenschein GmbH', correct: true },
        ],
        explanation:
          'Ist kein Ansprechpartner vorhanden, steht das Unternehmen direkt in der ersten Zeile – ohne Anrede und ohne den Zusatz „Firma“.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 7 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '5 Marktplatz', correct: false },
          { id: 'b', text: 'Marktplatz, 5', correct: false },
          { id: 'c', text: 'Marktplatz 5', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 8 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Freiburg 79098', correct: false },
          { id: 'b', text: '79098, Freiburg', correct: false },
          { id: 'c', text: '79098 Freiburg', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'privatperson-doppeltitel',
    title: 'Privatperson mit mehreren Titeln',
    difficulty: 'mittel',
    scenario: 'Der Empfänger führt gleich zwei akademische Titel. Achte auf ihre Reihenfolge und Position.',
    facts: ['Empfänger: Prof. Dr. Michael Vogel', 'Straße: Ahornweg 9', 'Ort: 70173 Stuttgart'],
    senderLine: SENDER,
    lines: [
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herr', correct: false },
          { id: 'b', text: 'Hr.', correct: false },
          { id: 'c', text: 'Herrn', correct: true },
        ],
        explanation: 'Die Anrede an männliche Empfänger lautet „Herrn“, nicht „Herr“.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Titel Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Michael Prof. Dr. Vogel', correct: false },
          { id: 'b', text: 'Vogel, Prof. Dr. Michael', correct: false },
          { id: 'c', text: 'Prof. Dr. Michael Vogel', correct: true },
        ],
        explanation:
          'Mehrere Titel stehen gemeinsam mit Leerzeichen vor dem Vornamen – in der Reihenfolge, in der sie geführt werden.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Ahornweg, 9', correct: false },
          { id: 'b', text: '9 Ahornweg', correct: false },
          { id: 'c', text: 'Ahornweg 9', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '70173 Stuttgart', correct: true },
          { id: 'b', text: 'Stuttgart 70173', correct: false },
          { id: 'c', text: '70173, Stuttgart', correct: false },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'berufsbezeichnung-frau',
    title: 'Berufsbezeichnung bei einer Empfängerin',
    difficulty: 'mittel',
    scenario: 'Auch bei weiblichen Empfängern steht die Berufsbezeichnung hinter der Anrede in derselben Zeile.',
    facts: ['Empfängerin: Frau Steuerberaterin Julia Hoffmann', 'Straße: Rosenweg 2', 'Ort: 04109 Leipzig'],
    senderLine: SENDER,
    lines: [
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede Berufsbezeichnung',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Frau', correct: false },
          { id: 'b', text: 'Steuerberaterin', correct: false },
          { id: 'c', text: 'Frau Steuerberaterin', correct: true },
        ],
        explanation: 'Berufs- bzw. Amtsbezeichnungen stehen in derselben Zeile hinter der Anrede.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Hoffmann, Julia', correct: false },
          { id: 'b', text: 'Frau Julia Hoffmann', correct: false },
          { id: 'c', text: 'Julia Hoffmann', correct: true },
        ],
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, die Anrede wird nicht wiederholt.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '2 Rosenweg', correct: false },
          { id: 'b', text: 'Rosenweg, 2', correct: false },
          { id: 'c', text: 'Rosenweg 2', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Leipzig 04109', correct: false },
          { id: 'b', text: '04109, Leipzig', correct: false },
          { id: 'c', text: '04109 Leipzig', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'zusatzzone-privat',
    title: 'Vermerk „Privat“',
    difficulty: 'mittel',
    scenario: 'Der Brief soll ausdrücklich nur vom Empfänger persönlich geöffnet werden.',
    facts: [
      'Vermerk: Privat',
      'Empfänger: Herrn Thomas Krause',
      'Straße: Feldweg 7',
      'Ort: 33098 Paderborn',
    ],
    senderLine: SENDER,
    lines: [
      {
        id: 'vermerk',
        caption: 'Zusatz- und Vermerkzone – Zeile direkt über der Anschrift',
        zone: 'zusatz',
        options: [
          { id: 'a', text: 'Einschreiben', correct: false },
          { id: 'b', text: 'Vertraulich', correct: false },
          { id: 'c', text: 'Privat', correct: true },
        ],
        explanation:
          'Der Vermerk „Privat“ weist zusätzlich auf das Briefgeheimnis hin: In Deutschland darf niemand einen an eine andere Person adressierten Brief öffnen.',
      },
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herr', correct: false },
          { id: 'b', text: 'Hr.', correct: false },
          { id: 'c', text: 'Herrn', correct: true },
        ],
        explanation: 'Die Anrede an männliche Empfänger lautet „Herrn“, nicht „Herr“.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Krause, Thomas', correct: false },
          { id: 'b', text: 'Herrn Thomas Krause', correct: false },
          { id: 'c', text: 'Thomas Krause', correct: true },
        ],
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '7 Feldweg', correct: false },
          { id: 'b', text: 'Feldweg, 7', correct: false },
          { id: 'c', text: 'Feldweg 7', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Paderborn 33098', correct: false },
          { id: 'b', text: '33098, Paderborn', correct: false },
          { id: 'c', text: '33098 Paderborn', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'auslandsanschrift-oesterreich',
    title: 'Auslandsanschrift: Österreich',
    difficulty: 'mittel',
    scenario:
      'Der Brief geht nach Österreich. Anders als bei Frankreich ändert sich hier die Reihenfolge von Straße und Hausnummer nicht.',
    facts: ['Empfänger: Herr Alexander Berger', 'Straße: Ringstraße 12', 'Ort: 1010 Wien', 'Land: Österreich'],
    senderLine: SENDER,
    lines: [
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herr', correct: false },
          { id: 'b', text: 'Hr.', correct: false },
          { id: 'c', text: 'Herrn', correct: true },
        ],
        explanation: 'Die Anrede an männliche Empfänger lautet „Herrn“, nicht „Herr“ – auch bei Auslandsbriefen.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Berger, Alexander', correct: false },
          { id: 'b', text: 'Herrn Alexander Berger', correct: false },
          { id: 'c', text: 'Alexander Berger', correct: true },
        ],
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '12 Ringstraße', correct: false },
          { id: 'b', text: 'Ringstraße, 12', correct: false },
          { id: 'c', text: 'Ringstraße 12', correct: true },
        ],
        explanation:
          'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. Anders als in Frankreich behält Österreich die deutsche Reihenfolge Straße vor Hausnummer bei.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Bestimmungsort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '1010 Wien', correct: false },
          { id: 'b', text: 'Wien 1010', correct: false },
          { id: 'c', text: '1010 WIEN', correct: true },
        ],
        explanation: 'Der Bestimmungsort wird bei Auslandssendungen in GROSSBUCHSTABEN geschrieben.',
      },
      {
        id: 'land',
        caption: 'Zeile 10 – Bestimmungsland',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Österreich', correct: false },
          { id: 'b', text: 'österreich', correct: false },
          { id: 'c', text: 'ÖSTERREICH', correct: true },
        ],
        explanation: 'Das Bestimmungsland wird bei Auslandssendungen ebenfalls in GROSSBUCHSTABEN geschrieben.',
      },
    ],
  },
  {
    id: 'auslandsanschrift-schweiz',
    title: 'Auslandsanschrift: Schweiz',
    difficulty: 'mittel',
    scenario: 'Der Brief geht in die Schweiz. Auch hier gilt: Reihenfolge wie gewohnt, aber Ort und Land in Großbuchstaben.',
    facts: ['Empfängerin: Frau Nicole Steiner', 'Straße: Bahnhofstrasse 22', 'Ort: 8001 Zürich', 'Land: Schweiz'],
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
        explanation: 'Die Anrede an weibliche Empfänger lautet „Frau“ – auch bei Auslandsbriefen.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Steiner, Nicole', correct: false },
          { id: 'b', text: 'Frau Nicole Steiner', correct: false },
          { id: 'c', text: 'Nicole Steiner', correct: true },
        ],
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '22 Bahnhofstrasse', correct: false },
          { id: 'b', text: 'Bahnhofstrasse, 22', correct: false },
          { id: 'c', text: 'Bahnhofstrasse 22', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Bestimmungsort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '8001 Zürich', correct: false },
          { id: 'b', text: 'Zürich 8001', correct: false },
          { id: 'c', text: '8001 ZÜRICH', correct: true },
        ],
        explanation: 'Der Bestimmungsort wird bei Auslandssendungen in GROSSBUCHSTABEN geschrieben.',
      },
      {
        id: 'land',
        caption: 'Zeile 10 – Bestimmungsland',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Schweiz', correct: false },
          { id: 'b', text: 'schweiz', correct: false },
          { id: 'c', text: 'SCHWEIZ', correct: true },
        ],
        explanation: 'Das Bestimmungsland wird bei Auslandssendungen ebenfalls in GROSSBUCHSTABEN geschrieben.',
      },
    ],
  },
  {
    id: 'postfach-ungerade',
    title: 'Postfach mit ungerader Ziffernzahl',
    difficulty: 'schwer',
    scenario: 'Diesmal hat die Postfachnummer eine ungerade Anzahl an Ziffern. Wie wird sie gegliedert?',
    facts: ['Empfänger: Herrn Dr. Markus Lindner', 'Postfach: 12345', 'Ort: 50667 Köln'],
    senderLine: SENDER,
    lines: [
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herr', correct: false },
          { id: 'b', text: 'Hr.', correct: false },
          { id: 'c', text: 'Herrn', correct: true },
        ],
        explanation: 'Die Anrede an männliche Empfänger lautet „Herrn“, nicht „Herr“.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Titel Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Markus Dr. Lindner', correct: false },
          { id: 'b', text: 'Lindner, Dr. Markus', correct: false },
          { id: 'c', text: 'Dr. Markus Lindner', correct: true },
        ],
        explanation: 'Titel stehen mit Leerzeichen vor dem Vornamen.',
      },
      {
        id: 'postfach',
        caption: 'Zeile 8 – Straße Hausnummer (oder Postfach)',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Postfach 123 45', correct: false },
          { id: 'b', text: 'Postfach 12 345', correct: false },
          { id: 'c', text: 'Postfach 1 23 45', correct: true },
        ],
        explanation:
          'Postfachnummern werden von rechts nach links in Zweiergruppen gegliedert. Bleibt eine einzelne Ziffer übrig, steht sie allein ganz vorne.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Köln 50667', correct: false },
          { id: 'b', text: '50667, Köln', correct: false },
          { id: 'c', text: '50667 Köln', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'unternehmen-mit-titel-ansprechpartner',
    title: 'Unternehmen mit Ansprechpartner und Titel',
    difficulty: 'schwer',
    scenario: 'Der Ansprechpartner im Unternehmen führt zusätzlich einen akademischen Titel.',
    facts: [
      'Unternehmen: Kanzlei Berger & Partner',
      'Ansprechpartner: Herr Dr. Felix Berger',
      'Straße: Kaiserstraße 15',
      'Ort: 60311 Frankfurt',
    ],
    senderLine: SENDER,
    lines: [
      {
        id: 'firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herrn Dr. Felix Berger', correct: false },
          { id: 'b', text: 'z. Hd. Dr. Felix Berger', correct: false },
          { id: 'c', text: 'Kanzlei Berger & Partner', correct: true },
        ],
        explanation: 'Die Firmenbezeichnung steht immer über dem Empfängernamen.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Anrede Titel Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Herrn Felix Dr. Berger', correct: false },
          { id: 'b', text: 'Dr. Felix Berger', correct: false },
          { id: 'c', text: 'Herrn Dr. Felix Berger', correct: true },
        ],
        explanation:
          'Bei einem Unternehmen mit Ansprechpartner stehen Anrede, Titel und Name in einer gemeinsamen Zeile; der Titel steht dabei mit Leerzeichen vor dem Vornamen.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '15 Kaiserstraße', correct: false },
          { id: 'b', text: 'Kaiserstraße, 15', correct: false },
          { id: 'c', text: 'Kaiserstraße 15', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Frankfurt 60311', correct: false },
          { id: 'b', text: '60311, Frankfurt', correct: false },
          { id: 'c', text: '60311 Frankfurt', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
  {
    id: 'zusatzzone-einschreiben-privat',
    title: 'Einschreiben und „Privat“ kombiniert',
    difficulty: 'schwer',
    scenario: 'Der Brief ist ein Einschreiben und soll zusätzlich ausschließlich von der Empfängerin geöffnet werden.',
    facts: [
      'Sendungsart: Einschreiben, zusätzlich vertraulicher Privatbrief',
      'Empfängerin: Frau Dr. Sabine Wolf',
      'Straße: Gartenweg 3',
      'Ort: 22303 Hamburg',
    ],
    senderLine: SENDER,
    lines: [
      {
        id: 'vermerk1',
        caption: 'Zusatz- und Vermerkzone – obere Zeile',
        zone: 'zusatz',
        options: [
          { id: 'a', text: 'Privat', correct: false },
          { id: 'b', text: 'mit Rückschein', correct: false },
          { id: 'c', text: 'Einschreiben', correct: true },
        ],
        explanation: 'Mehrere postalische Vermerke werden untereinander aufgeführt. „Einschreiben“ steht hier über „Privat“.',
      },
      {
        id: 'vermerk2',
        caption: 'Zusatz- und Vermerkzone – untere Zeile (direkt über der Anschrift)',
        zone: 'zusatz',
        options: [
          { id: 'a', text: 'Einschreiben', correct: false },
          { id: 'b', text: 'mit Rückschein', correct: false },
          { id: 'c', text: 'Privat', correct: true },
        ],
        explanation:
          'Auch bei mehreren Vermerken beginnt man auf der untersten Zeile der Zusatz- und Vermerkzone, also direkt über der eigentlichen Anschrift.',
      },
      {
        id: 'anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Frauen', correct: false },
          { id: 'b', text: 'Fr.', correct: false },
          { id: 'c', text: 'Frau', correct: true },
        ],
        explanation: 'Die Anrede an weibliche Empfänger lautet „Frau“, nicht „Frauen“.',
      },
      {
        id: 'name',
        caption: 'Zeile 7 – Titel Vorname Nachname',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Wolf, Dr. Sabine', correct: false },
          { id: 'b', text: 'Sabine Dr. Wolf', correct: false },
          { id: 'c', text: 'Dr. Sabine Wolf', correct: true },
        ],
        explanation: 'Titel stehen mit Leerzeichen vor dem Vornamen, die Anrede wird nicht wiederholt.',
      },
      {
        id: 'strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        options: [
          { id: 'a', text: '3 Gartenweg', correct: false },
          { id: 'b', text: 'Gartenweg, 3', correct: false },
          { id: 'c', text: 'Gartenweg 3', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        id: 'ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        options: [
          { id: 'a', text: 'Hamburg 22303', correct: false },
          { id: 'b', text: '22303, Hamburg', correct: false },
          { id: 'c', text: '22303 Hamburg', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
  },
];

export function getAnschriftenfeldTaskById(id: string) {
  return ANSCHRIFTENFELD_TASKS.find((task) => task.id === id);
}
