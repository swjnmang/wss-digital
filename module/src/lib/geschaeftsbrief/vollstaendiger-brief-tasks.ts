import type { VollstaendigerBriefTask } from './vollstaendiger-brief-types';
import { BLEIBT_FREI } from './line-types';

export const VOLLSTAENDIGER_BRIEF_TASKS: VollstaendigerBriefTask[] = [
  {
    id: 'moebelfabrik-jordan-komplett',
    title: 'Möbelfabrik Jordan: der komplette Brief',
    difficulty: 'einfach',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die MÖBELFABRIK Peter Jordan GmbH, Meindlstraße 8a, 81373 München. Dein Vorgesetzter Werner Volk erwartet das fertige Schreiben und ist unter Tel. Durchwahl 142, Fax 100 oder vorname.nachname@jordanmoebel.de erreichbar. Der Brief geht an Merkur & Söhne GmbH, Frau Elke Schnell, Postfach 11609, 83425 Bad Reichenhall; übernimm diese Adresse zeilengenau.\n\nDie Kundin benötigt einen aktualisierten Spezialkatalog und eine kurze Übersicht über verfügbare Büromodule. Du verfasst den Brief im Auftrag von Werner Volk und heißt Hans Schuster; „i. A.“ soll direkt vor deinem gedruckten Namen stehen.',
    senderLine: 'MÖBELFABRIK Peter Jordan GmbH, Meindlstraße 8a, 81373 München',
    anschriftenfeld: [
      {
        type: 'choice',
        id: 'af-firma',
        caption: 'Anschriftenfeld – Zeile 6: Firma',
        options: [
          { id: 'a', text: 'Firma Merkur & Söhne GmbH', correct: false },
          { id: 'b', text: 'Frau Elke Schnell', correct: false },
          { id: 'c', text: 'Merkur & Söhne GmbH', correct: true },
        ],
        explanation: 'Die Firmenbezeichnung steht über dem Empfängernamen.',
      },
      {
        type: 'choice',
        id: 'af-name',
        caption: 'Anschriftenfeld – Zeile 7: Anrede Name',
        options: [
          { id: 'a', text: 'Elke Schnell', correct: false },
          { id: 'b', text: 'Herrn Elke Schnell', correct: false },
          { id: 'c', text: 'Frau Elke Schnell', correct: true },
        ],
        explanation: 'Bei einem Unternehmen mit Ansprechpartner stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'choice',
        id: 'af-strasse',
        caption: 'Anschriftenfeld – Zeile 8: Straße Hausnummer (oder Postfach)',
        options: [
          { id: 'a', text: 'Postfach 11609', correct: false },
          { id: 'b', text: 'Postfach 116 09', correct: false },
          { id: 'c', text: 'Postfach 1 16 09', correct: true },
        ],
        explanation: 'Postfachnummern werden von rechts nach links in Zweiergruppen gegliedert.',
      },
      {
        type: 'choice',
        id: 'af-ort',
        caption: 'Anschriftenfeld – Zeile 9: PLZ Ort',
        options: [
          { id: 'a', text: 'Bad Reichenhall 83425', correct: false },
          { id: 'b', text: '83425, Bad Reichenhall', correct: false },
          { id: 'c', text: '83425 Bad Reichenhall', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Infoblock – Ihr Zeichen',
        options: [
          { id: 'a', text: '11.03.2025', correct: false },
          { id: 'b', text: 'es-eb', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt „Ihr Zeichen“ leer.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Infoblock – Ihre Nachricht vom',
        options: [
          { id: 'a', text: '04.03.2025', correct: false },
          { id: 'b', text: 'wv-hs', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'choice',
        id: 'unser-zeichen',
        caption: 'Infoblock – Unser Zeichen',
        options: [
          { id: 'a', text: 'hs-wv', correct: false },
          { id: 'b', text: 'WV-HS', correct: false },
          { id: 'c', text: 'wv-hs', correct: true },
        ],
        explanation:
          'Der Auftraggeber (Werner Volk → „wv“) wird zuerst genannt, danach die Initialen des Verfassers Hans Schuster („hs“) – klein geschrieben und mit Bindestrich getrennt.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Infoblock – Unsere Nachricht vom',
        options: [
          { id: 'a', text: 'das heutige Datum', correct: false },
          { id: 'b', text: '10.03.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Infoblock – Telefon',
        options: [
          { id: 'a', text: '142', correct: false },
          { id: 'b', text: 'Fax 142', correct: false },
          { id: 'c', text: 'Durchwahl 142', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Infoblock – Fax',
        options: [
          { id: 'a', text: 'Fax 100', correct: false },
          { id: 'b', text: 'Durchwahl 100', correct: false },
          { id: 'c', text: '100', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'choice',
        id: 'email',
        caption: 'Infoblock – E-Mail',
        options: [
          { id: 'a', text: 'vorname.nachname@jordanmoebel.de', correct: false },
          { id: 'b', text: 'Werner.Volk@jordanmoebel.de', correct: false },
          { id: 'c', text: 'werner.volk@jordanmoebel.de', correct: true },
        ],
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen des Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'choice',
        id: 'betreff',
        caption: 'Betreff',
        options: [
          { id: 'a', text: 'Betreff: Spezialkatalog', correct: false },
          { id: 'b', text: 'IHR SPEZIALKATALOG UND AKTUELLE BÜROMODULE', correct: false },
          { id: 'c', text: 'Ihr Spezialkatalog und aktuelle Büromodule', correct: true },
        ],
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'choice',
        id: 'anrede',
        caption: 'Anrede',
        options: [
          { id: 'a', text: 'Sehr geehrte Frau Schnell', correct: false },
          { id: 'b', text: 'Sehr geehrte Damen und Herren,', correct: false },
          { id: 'c', text: 'Sehr geehrte Frau Schnell,', correct: true },
        ],
        explanation:
          'Ist eine konkrete Ansprechpartnerin bekannt, wird sie persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    grussformel: [
      {
        type: 'choice',
        id: 'gruss',
        caption: 'Grußformel',
        options: [
          { id: 'a', text: 'Mit freundlichen Grüßen', correct: false },
          { id: 'b', text: 'Freundliche Grüße', correct: true },
          { id: 'c', text: 'Viele Grüße', correct: false },
        ],
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'choice',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        options: [
          { id: 'a', text: 'MÖBELFABRIK Peter Jordan GmbH', correct: false },
          { id: 'b', text: 'Möbelherstellung', correct: true },
          { id: 'c', text: 'Werner Volk', correct: false },
        ],
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'choice',
        id: 'firma',
        caption: 'Firmenname',
        options: [
          { id: 'a', text: 'Peter Jordan', correct: false },
          { id: 'b', text: 'Möbelfabrik', correct: false },
          { id: 'c', text: 'MÖBELFABRIK Peter Jordan GmbH', correct: true },
        ],
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'choice',
        id: 'name-gruss',
        caption: 'Gedruckter Name nach den drei Leerzeilen',
        options: [
          { id: 'a', text: 'Hans Schuster i. A.', correct: false },
          { id: 'b', text: 'Hans Schuster', correct: false },
          { id: 'c', text: 'i. A. Hans Schuster', correct: true },
        ],
        explanation: '„i. A.“ steht in diesem Brief direkt vor dem gedruckten Namen: „i. A. Hans Schuster“.',
      },
    ],
  },
  {
    id: 'buerotechnik-berg-komplett',
    title: 'Bürotechnik Berg: der komplette Brief',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die Bürotechnik Berg & Cie. KG, Industriestraße 4, 44149 Dortmund. Dein Vorgesetzter Thomas Berg antwortet auf das Schreiben der Rauch Maschinenbau GmbH vom 03.02.2025 mit dem Zeichen rm-ab. Er ist unter Tel. Durchwahl 77, Fax 78 oder vorname.nachname@berg-buerotechnik.de erreichbar. Der Brief geht an die Rauch Maschinenbau GmbH, Herrn Michael Rauch, Talstraße 9, 45141 Essen; übernimm diese Adresse zeilengenau.\n\nBestätige den Erhalt der Anfrage und kündige ein detailliertes Angebot an. Du heißt Laura Fink und schreibst im Auftrag von Thomas Berg; „i. A.“ soll diesmal in der mittleren der drei Leerzeilen stehen.',
    senderLine: 'Bürotechnik Berg & Cie. KG, Industriestraße 4, 44149 Dortmund',
    anschriftenfeld: [
      {
        type: 'choice',
        id: 'af-firma',
        caption: 'Anschriftenfeld – Zeile 6: Firma',
        options: [
          { id: 'a', text: 'Herrn Michael Rauch', correct: false },
          { id: 'b', text: 'z. Hd. Michael Rauch', correct: false },
          { id: 'c', text: 'Rauch Maschinenbau GmbH', correct: true },
        ],
        explanation: 'Die Firmenbezeichnung steht über dem Empfängernamen.',
      },
      {
        type: 'choice',
        id: 'af-name',
        caption: 'Anschriftenfeld – Zeile 7: Anrede Name',
        options: [
          { id: 'a', text: 'Michael Rauch', correct: false },
          { id: 'b', text: 'Herr Michael Rauch', correct: false },
          { id: 'c', text: 'Herrn Michael Rauch', correct: true },
        ],
        explanation: 'Bei einem Unternehmen mit Ansprechpartner stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'choice',
        id: 'af-strasse',
        caption: 'Anschriftenfeld – Zeile 8: Straße Hausnummer',
        options: [
          { id: 'a', text: '9 Talstraße', correct: false },
          { id: 'b', text: 'Talstraße, 9', correct: false },
          { id: 'c', text: 'Talstraße 9', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'choice',
        id: 'af-ort',
        caption: 'Anschriftenfeld – Zeile 9: PLZ Ort',
        options: [
          { id: 'a', text: 'Essen 45141', correct: false },
          { id: 'b', text: '45141, Essen', correct: false },
          { id: 'c', text: '45141 Essen', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Infoblock – Ihr Zeichen',
        options: [
          { id: 'a', text: BLEIBT_FREI, correct: false },
          { id: 'b', text: 'tb-lf', correct: false },
          { id: 'c', text: 'rm-ab', correct: true },
        ],
        explanation:
          '„Ihr Zeichen“ wird aus dem Schreiben des Geschäftspartners übernommen, auf das dieser Brief antwortet.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Infoblock – Ihre Nachricht vom',
        options: [
          { id: 'a', text: BLEIBT_FREI, correct: false },
          { id: 'b', text: 'das heutige Datum', correct: false },
          { id: 'c', text: '03.02.2025', correct: true },
        ],
        explanation: 'Hier steht das Datum des Schreibens des Geschäftspartners, auf das dieser Brief antwortet.',
      },
      {
        type: 'choice',
        id: 'unser-zeichen',
        caption: 'Infoblock – Unser Zeichen',
        options: [
          { id: 'a', text: 'lf-tb', correct: false },
          { id: 'b', text: 'tb-lf', correct: true },
          { id: 'c', text: 'TB-LF', correct: false },
        ],
        explanation:
          'Der Auftraggeber (Thomas Berg → „tb“) wird zuerst genannt, danach die Initialen der Verfasserin Laura Fink („lf“).',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Infoblock – Unsere Nachricht vom',
        options: [
          { id: 'a', text: '03.02.2025', correct: false },
          { id: 'b', text: 'das heutige Datum', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          'Es gab noch kein eigenes vorheriges Schreiben in dieser Sache, daher bleibt „Unsere Nachricht vom“ leer.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Infoblock – Telefon',
        options: [
          { id: 'a', text: '77', correct: false },
          { id: 'b', text: 'Fax 77', correct: false },
          { id: 'c', text: 'Durchwahl 77', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Infoblock – Fax',
        options: [
          { id: 'a', text: 'Fax 78', correct: false },
          { id: 'b', text: 'Durchwahl 78', correct: false },
          { id: 'c', text: '78', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'choice',
        id: 'email',
        caption: 'Infoblock – E-Mail',
        options: [
          { id: 'a', text: 'vorname.nachname@berg-buerotechnik.de', correct: false },
          { id: 'b', text: 'Thomas.Berg@berg-buerotechnik.de', correct: false },
          { id: 'c', text: 'thomas.berg@berg-buerotechnik.de', correct: true },
        ],
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen des Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'choice',
        id: 'betreff',
        caption: 'Betreff',
        options: [
          { id: 'a', text: 'Betreff: Ihre Anfrage vom 03.02.2025', correct: false },
          { id: 'b', text: 'IHRE ANFRAGE VOM 03.02.2025', correct: false },
          { id: 'c', text: 'Ihre Anfrage vom 03.02.2025', correct: true },
        ],
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'choice',
        id: 'anrede',
        caption: 'Anrede',
        options: [
          { id: 'a', text: 'Sehr geehrter Herr Rauch', correct: false },
          { id: 'b', text: 'Sehr geehrte Damen und Herren,', correct: false },
          { id: 'c', text: 'Sehr geehrter Herr Rauch,', correct: true },
        ],
        explanation:
          'Ist ein konkreter Ansprechpartner bekannt, wird er persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    grussformel: [
      {
        type: 'choice',
        id: 'gruss',
        caption: 'Grußformel',
        options: [
          { id: 'a', text: 'Freundliche Grüße', correct: true },
          { id: 'b', text: 'Mit freundlichen Grüßen', correct: false },
          { id: 'c', text: 'Beste Grüße', correct: false },
        ],
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'choice',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        options: [
          { id: 'a', text: 'Bürotechnik Berg & Cie. KG', correct: false },
          { id: 'b', text: 'Thomas Berg', correct: false },
          { id: 'c', text: 'Bürotechnik', correct: true },
        ],
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'choice',
        id: 'firma',
        caption: 'Firmenname',
        options: [
          { id: 'a', text: 'Berg & Cie.', correct: false },
          { id: 'b', text: 'Bürotechnik Berg & Cie. KG', correct: true },
          { id: 'c', text: 'Bürotechnik Berg', correct: false },
        ],
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'choice',
        id: 'mittlere-leerzeile',
        caption: 'Was steht in der mittleren der drei Leerzeilen?',
        options: [
          { id: 'a', text: 'nichts, sie bleibt leer', correct: false },
          { id: 'b', text: 'der Firmenname noch einmal', correct: false },
          { id: 'c', text: 'i. A.', correct: true },
        ],
        explanation:
          '„i. A.“ kann allein in die mittlere der drei Leerzeilen geschrieben werden – dann bleibt der Name ohne Zusatz.',
      },
      {
        type: 'choice',
        id: 'name-gruss',
        caption: 'Gedruckter Name nach den drei Leerzeilen',
        options: [
          { id: 'a', text: 'i. A. Laura Fink', correct: false },
          { id: 'b', text: 'Laura Fink i. A.', correct: false },
          { id: 'c', text: 'Laura Fink', correct: true },
        ],
        explanation: 'Steht „i. A.“ bereits in der mittleren Leerzeile, wird der Name ohne weiteren Zusatz gedruckt.',
      },
    ],
  },
  {
    id: 'kern-verpackungstechnik-komplett',
    title: 'Kern Verpackungstechnik: der komplette Brief',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die Kern Verpackungstechnik e. K., Fabrikweg 2, 70565 Stuttgart. Deine Vorgesetzte Julia Kern bezieht sich auf euer eigenes Schreiben vom 20.01.2025. Sie ist unter Tel. Durchwahl 44, Fax 45 oder vorname.nachname@kern-verpackung.de erreichbar. Der Brief geht an die Grafendorfer Kunststoffe GmbH, Herrn Peter Grafendorfer, Fabrikstraße 12, 71638 Ludwigsburg; übernimm diese Adresse zeilengenau.\n\nErinnere höflich an die Bestellung Nr. 4521 und bitte um eine kurze Rückmeldung. Du heißt Anna Berg und schreibst im Auftrag von Julia Kern; „i. A.“ soll in der mittleren der drei Leerzeilen stehen.',
    senderLine: 'Kern Verpackungstechnik e. K., Fabrikweg 2, 70565 Stuttgart',
    anschriftenfeld: [
      {
        type: 'choice',
        id: 'af-firma',
        caption: 'Anschriftenfeld – Zeile 6: Firma',
        options: [
          { id: 'a', text: 'Herrn Peter Grafendorfer', correct: false },
          { id: 'b', text: 'z. Hd. Peter Grafendorfer', correct: false },
          { id: 'c', text: 'Grafendorfer Kunststoffe GmbH', correct: true },
        ],
        explanation: 'Die Firmenbezeichnung steht über dem Empfängernamen.',
      },
      {
        type: 'choice',
        id: 'af-name',
        caption: 'Anschriftenfeld – Zeile 7: Anrede Name',
        options: [
          { id: 'a', text: 'Peter Grafendorfer', correct: false },
          { id: 'b', text: 'Herr Peter Grafendorfer', correct: false },
          { id: 'c', text: 'Herrn Peter Grafendorfer', correct: true },
        ],
        explanation: 'Bei einem Unternehmen mit Ansprechpartner stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'choice',
        id: 'af-strasse',
        caption: 'Anschriftenfeld – Zeile 8: Straße Hausnummer',
        options: [
          { id: 'a', text: '12 Fabrikstraße', correct: false },
          { id: 'b', text: 'Fabrikstraße, 12', correct: false },
          { id: 'c', text: 'Fabrikstraße 12', correct: true },
        ],
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'choice',
        id: 'af-ort',
        caption: 'Anschriftenfeld – Zeile 9: PLZ Ort',
        options: [
          { id: 'a', text: 'Ludwigsburg 71638', correct: false },
          { id: 'b', text: '71638, Ludwigsburg', correct: false },
          { id: 'c', text: '71638 Ludwigsburg', correct: true },
        ],
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Infoblock – Ihr Zeichen',
        options: [
          { id: 'a', text: 'jk-ab', correct: false },
          { id: 'b', text: '20.01.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          'Es liegt kein Schreiben des Kunden vor, auf das Bezug genommen werden könnte – „Ihr Zeichen“ bleibt leer.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Infoblock – Ihre Nachricht vom',
        options: [
          { id: 'a', text: '20.01.2025', correct: false },
          { id: 'b', text: 'das heutige Datum', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne ein Schreiben des Kunden bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'choice',
        id: 'unser-zeichen',
        caption: 'Infoblock – Unser Zeichen',
        options: [
          { id: 'a', text: 'ab-jk', correct: false },
          { id: 'b', text: 'JK-AB', correct: false },
          { id: 'c', text: 'jk-ab', correct: true },
        ],
        explanation:
          'Der Auftraggeber (Julia Kern → „jk“) wird zuerst genannt, danach die Initialen der Verfasserin Anna Berg („ab“).',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Infoblock – Unsere Nachricht vom',
        options: [
          { id: 'a', text: BLEIBT_FREI, correct: false },
          { id: 'b', text: 'das heutige Datum', correct: false },
          { id: 'c', text: '20.01.2025', correct: true },
        ],
        explanation: 'Hier steht das Datum des eigenen vorherigen Schreibens, an das erinnert wird.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Infoblock – Telefon',
        options: [
          { id: 'a', text: '44', correct: false },
          { id: 'b', text: 'Fax 44', correct: false },
          { id: 'c', text: 'Durchwahl 44', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Infoblock – Fax',
        options: [
          { id: 'a', text: 'Fax 45', correct: false },
          { id: 'b', text: 'Durchwahl 45', correct: false },
          { id: 'c', text: '45', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'choice',
        id: 'email',
        caption: 'Infoblock – E-Mail',
        options: [
          { id: 'a', text: 'vorname.nachname@kern-verpackung.de', correct: false },
          { id: 'b', text: 'Julia.Kern@kern-verpackung.de', correct: false },
          { id: 'c', text: 'julia.kern@kern-verpackung.de', correct: true },
        ],
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen der Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'choice',
        id: 'betreff',
        caption: 'Betreff',
        options: [
          { id: 'a', text: 'Betreff: Ihre Bestellung Nr. 4521', correct: false },
          { id: 'b', text: 'IHRE BESTELLUNG NR. 4521', correct: false },
          { id: 'c', text: 'Ihre Bestellung Nr. 4521', correct: true },
        ],
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'choice',
        id: 'anrede',
        caption: 'Anrede',
        options: [
          { id: 'a', text: 'Sehr geehrter Herr Grafendorfer', correct: false },
          { id: 'b', text: 'Sehr geehrte Damen und Herren,', correct: false },
          { id: 'c', text: 'Sehr geehrter Herr Grafendorfer,', correct: true },
        ],
        explanation:
          'Ist ein konkreter Ansprechpartner bekannt, wird er persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    grussformel: [
      {
        type: 'choice',
        id: 'gruss',
        caption: 'Grußformel',
        options: [
          { id: 'a', text: 'Viele Grüße', correct: false },
          { id: 'b', text: 'Freundliche Grüße', correct: true },
          { id: 'c', text: 'Mit freundlichen Grüßen', correct: false },
        ],
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'choice',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        options: [
          { id: 'a', text: 'Kern Verpackungstechnik e. K.', correct: false },
          { id: 'b', text: 'Julia Kern', correct: false },
          { id: 'c', text: 'Verpackungstechnik', correct: true },
        ],
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'choice',
        id: 'firma',
        caption: 'Firmenname',
        options: [
          { id: 'a', text: 'Kern Verpackungstechnik e. K.', correct: true },
          { id: 'b', text: 'Verpackungstechnik Kern', correct: false },
          { id: 'c', text: 'Kern GmbH', correct: false },
        ],
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'choice',
        id: 'mittlere-leerzeile',
        caption: 'Was steht in der mittleren der drei Leerzeilen?',
        options: [
          { id: 'a', text: 'der Firmenname noch einmal', correct: false },
          { id: 'b', text: 'nichts, sie bleibt leer', correct: false },
          { id: 'c', text: 'i. A.', correct: true },
        ],
        explanation:
          '„i. A.“ kann allein in die mittlere der drei Leerzeilen geschrieben werden – dann bleibt der Name ohne Zusatz.',
      },
      {
        type: 'choice',
        id: 'name-gruss',
        caption: 'Gedruckter Name nach den drei Leerzeilen',
        options: [
          { id: 'a', text: 'i. A. Anna Berg', correct: false },
          { id: 'b', text: 'Anna Berg i. A.', correct: false },
          { id: 'c', text: 'Anna Berg', correct: true },
        ],
        explanation: 'Steht „i. A.“ bereits in der mittleren Leerzeile, wird der Name ohne weiteren Zusatz gedruckt.',
      },
    ],
  },
  {
    id: 'it-service-neumann-ausland-komplett',
    title: 'IT-Service Neumann: kompletter Brief ins Ausland',
    difficulty: 'schwer',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die IT-Service Neumann GmbH, Technologiepark 3, 76131 Karlsruhe. Dein Vorgesetzter Dr. Michael Ostermann erwartet das fertige Schreiben und ist unter Tel. Durchwahl 55, Fax 56 oder vorname.nachname@it-neumann.de erreichbar. Der Brief geht an die TechPartner SA, Herrn Marc Dubois, 15, Avenue de la République, 75011 Paris, FRANKREICH; übernimm diese Adresse zeilengenau.\n\nBestätige den Wartungsvertrag Nr. 2025-118 und nenne den nächsten Wartungstermin. Du heißt Dr. Lisa Kern und schreibst im Auftrag von Dr. Michael Ostermann; „i. A.“ soll direkt vor deinem gedruckten Namen stehen.',
    senderLine: 'IT-Service Neumann GmbH, Technologiepark 3, 76131 Karlsruhe',
    anschriftenfeld: [
      {
        type: 'choice',
        id: 'af-firma',
        caption: 'Anschriftenfeld – Zeile 6: Firma',
        options: [
          { id: 'a', text: 'Herrn Marc Dubois', correct: false },
          { id: 'b', text: 'z. Hd. Marc Dubois', correct: false },
          { id: 'c', text: 'TechPartner SA', correct: true },
        ],
        explanation: 'Die Firmenbezeichnung steht über dem Empfängernamen.',
      },
      {
        type: 'choice',
        id: 'af-name',
        caption: 'Anschriftenfeld – Zeile 7: Anrede Name',
        options: [
          { id: 'a', text: 'Marc Dubois', correct: false },
          { id: 'b', text: 'Herr Marc Dubois', correct: false },
          { id: 'c', text: 'Herrn Marc Dubois', correct: true },
        ],
        explanation: 'Bei einem Unternehmen mit Ansprechpartner stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'choice',
        id: 'af-strasse',
        caption: 'Anschriftenfeld – Zeile 8: Straße Hausnummer',
        options: [
          { id: 'a', text: 'Avenue de la République 15', correct: false },
          { id: 'b', text: 'Avenue de la République, 15', correct: false },
          { id: 'c', text: '15, Avenue de la République', correct: true },
        ],
        explanation:
          'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In Frankreich steht die Hausnummer vor der Straße.',
      },
      {
        type: 'choice',
        id: 'af-ort',
        caption: 'Anschriftenfeld – Zeile 9: PLZ Bestimmungsort',
        options: [
          { id: 'a', text: '75011 Paris', correct: false },
          { id: 'b', text: 'Paris 75011', correct: false },
          { id: 'c', text: '75011 PARIS', correct: true },
        ],
        explanation: 'Der Bestimmungsort wird bei Auslandssendungen in GROSSBUCHSTABEN geschrieben.',
      },
      {
        type: 'choice',
        id: 'af-land',
        caption: 'Anschriftenfeld – Zeile 10: Bestimmungsland',
        options: [
          { id: 'a', text: 'Frankreich', correct: false },
          { id: 'b', text: 'frankreich', correct: false },
          { id: 'c', text: 'FRANKREICH', correct: true },
        ],
        explanation: 'Das Bestimmungsland wird bei Auslandssendungen ebenfalls in GROSSBUCHSTABEN geschrieben.',
      },
    ],
    infoblock: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Infoblock – Ihr Zeichen',
        options: [
          { id: 'a', text: 'md-lk', correct: false },
          { id: 'b', text: '15.04.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt „Ihr Zeichen“ leer.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Infoblock – Ihre Nachricht vom',
        options: [
          { id: 'a', text: '12.04.2025', correct: false },
          { id: 'b', text: 'mo-lk', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'choice',
        id: 'unser-zeichen',
        caption: 'Infoblock – Unser Zeichen',
        options: [
          { id: 'a', text: 'lk-mo', correct: false },
          { id: 'b', text: 'MO-LK', correct: false },
          { id: 'c', text: 'mo-lk', correct: true },
        ],
        explanation:
          'Der Auftraggeber (Dr. Michael Ostermann → „mo“, der Titel zählt nicht mit) wird zuerst genannt, danach die Initialen von Dr. Lisa Kern („lk“).',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Infoblock – Unsere Nachricht vom',
        options: [
          { id: 'a', text: 'das heutige Datum', correct: false },
          { id: 'b', text: '10.04.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Infoblock – Telefon',
        options: [
          { id: 'a', text: '55', correct: false },
          { id: 'b', text: 'Fax 55', correct: false },
          { id: 'c', text: 'Durchwahl 55', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Infoblock – Fax',
        options: [
          { id: 'a', text: 'Fax 56', correct: false },
          { id: 'b', text: 'Durchwahl 56', correct: false },
          { id: 'c', text: '56', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'choice',
        id: 'email',
        caption: 'Infoblock – E-Mail',
        options: [
          { id: 'a', text: 'Dr.Michael.Ostermann@it-neumann.de', correct: false },
          { id: 'b', text: 'vorname.nachname@it-neumann.de', correct: false },
          { id: 'c', text: 'michael.ostermann@it-neumann.de', correct: true },
        ],
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – eingesetzt werden die tatsächlichen Vor- und Nachnamen (klein geschrieben), der Titel gehört nicht in die E-Mail-Adresse.',
      },
    ],
    betreff: [
      {
        type: 'choice',
        id: 'betreff',
        caption: 'Betreff',
        options: [
          { id: 'a', text: 'Betreff: Ihr Wartungsvertrag Nr. 2025-118', correct: false },
          { id: 'b', text: 'IHR WARTUNGSVERTRAG NR. 2025-118', correct: false },
          { id: 'c', text: 'Ihr Wartungsvertrag Nr. 2025-118', correct: true },
        ],
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'choice',
        id: 'anrede',
        caption: 'Anrede',
        options: [
          { id: 'a', text: 'Sehr geehrter Herr Dubois', correct: false },
          { id: 'b', text: 'Sehr geehrte Damen und Herren,', correct: false },
          { id: 'c', text: 'Sehr geehrter Herr Dubois,', correct: true },
        ],
        explanation:
          'Ist ein konkreter Ansprechpartner bekannt, wird er persönlich angesprochen. Die Anrede endet mit einem Komma – auch bei Auslandsbriefen.',
      },
    ],
    grussformel: [
      {
        type: 'choice',
        id: 'gruss',
        caption: 'Grußformel',
        options: [
          { id: 'a', text: 'Mit freundlichen Grüßen', correct: false },
          { id: 'b', text: 'Beste Grüße', correct: false },
          { id: 'c', text: 'Freundliche Grüße', correct: true },
        ],
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'choice',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        options: [
          { id: 'a', text: 'IT-Service Neumann GmbH', correct: false },
          { id: 'b', text: 'IT-Dienstleistungen', correct: true },
          { id: 'c', text: 'Dr. Michael Ostermann', correct: false },
        ],
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'choice',
        id: 'firma',
        caption: 'Firmenname',
        options: [
          { id: 'a', text: 'IT-Service Neumann', correct: false },
          { id: 'b', text: 'Neumann GmbH', correct: false },
          { id: 'c', text: 'IT-Service Neumann GmbH', correct: true },
        ],
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'choice',
        id: 'name-gruss',
        caption: 'Gedruckter Name nach den drei Leerzeilen',
        options: [
          { id: 'a', text: 'Dr. i. A. Lisa Kern', correct: false },
          { id: 'b', text: 'Lisa Kern i. A.', correct: false },
          { id: 'c', text: 'i. A. Dr. Lisa Kern', correct: true },
        ],
        explanation:
          '„i. A.“ steht direkt vor dem vollständigen gedruckten Namen (inklusive Titel): „i. A. Dr. Lisa Kern“.',
      },
    ],
  },
];

export function getVollstaendigerBriefTaskById(id: string) {
  return VOLLSTAENDIGER_BRIEF_TASKS.find((task) => task.id === id);
}
