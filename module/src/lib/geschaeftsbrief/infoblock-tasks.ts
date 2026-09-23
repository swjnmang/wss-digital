import type { InfoblockTask } from './infoblock-types';
import { BLEIBT_FREI } from './infoblock-types';

export const INFOBLOCK_TASKS: InfoblockTask[] = [
  {
    id: 'moebelfabrik-jordan',
    title: 'Möbelfabrik Jordan',
    difficulty: 'einfach',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die MÖBELFABRIK Peter Jordan GmbH, Meindlstraße 8a, 81373 München. Dein Vorgesetzter Werner Volk erwartet das fertige Schreiben und ist unter Tel. Durchwahl 142, Fax 100 oder vorname.nachname@jordanmoebel.de erreichbar. Der Brief geht an Merkur & Söhne GmbH, Frau Elke Schnell, Postfach 11609, 83425 Bad Reichenhall; übernimm diese Adresse zeilengenau.\n\nDie Kundin benötigt einen aktualisierten Spezialkatalog und eine kurze Übersicht über verfügbare Büromodule. Sichere zu, dass die Unterlagen versandfertig sind und dass die Reservierung nur bis Ende nächster Woche aufrechterhalten wird.',
    senderLine: 'MÖBELFABRIK Peter Jordan GmbH, Meindlstraße 8a, 81373 München',
    empfaengerLines: ['Merkur & Söhne GmbH', 'Frau Elke Schnell', 'Postfach 1 16 09', '83425 Bad Reichenhall'],
    lines: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        options: [
          { id: 'a', text: '11.03.2025', correct: false },
          { id: 'b', text: 'es-eb', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          '„Ihr Zeichen“ wird nur ausgefüllt, wenn im Auftrag auf ein Schreiben des Geschäftspartners Bezug genommen wird. Hier gibt es keinen solchen Bezug, das Feld bleibt leer.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        options: [
          { id: 'a', text: '04.03.2025', correct: false },
          { id: 'b', text: 'wv-vn', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'zeichen',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        bossInitials: 'wv',
        placeholder: 'z. B. wv-ab',
        explanation:
          'Das Kürzel „wv“ stammt von Werner Volk (Vorgesetzter, wird zuerst genannt). Danach folgt ein Bindestrich und deine eigenen Initialen (2 Kleinbuchstaben) – z. B. „wv-ab“.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        options: [
          { id: 'a', text: 'das heutige Datum', correct: false },
          { id: 'b', text: '10.03.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'name',
        id: 'name',
        caption: 'Name',
        placeholder: 'Vorname Nachname',
        explanation:
          'Trage hier deinen eigenen Vor- und Nachnamen ein – daraus leiten sich dein Kürzel bei „Unser Zeichen“ und deine E-Mail-Adresse weiter unten ab.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Telefon',
        options: [
          { id: 'a', text: 'Durchwahl 142', correct: false },
          { id: 'b', text: 'Tel. 142', correct: false },
          { id: 'c', text: '142', correct: true },
        ],
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Fax',
        options: [
          { id: 'a', text: 'Fax 100', correct: false },
          { id: 'b', text: 'Durchwahl 100', correct: false },
          { id: 'c', text: '100', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'email',
        id: 'email',
        caption: 'E-Mail',
        domain: 'jordanmoebel.de',
        placeholder: 'vorname.nachname@jordanmoebel.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter im Muster der Firma – hier setzt du deinen EIGENEN Vor- und Nachnamen (klein geschrieben, durch einen Punkt getrennt) ein, nicht den des Vorgesetzten.',
      },
      {
        type: 'freitext',
        id: 'datum',
        caption: 'Datum',
        placeholder: 'TT.MM.JJJJ',
        hint: 'Hier trägst du das heutige Datum ein (nicht bewertet).',
      },
    ],
  },
  {
    id: 'sportwelt-fischer',
    title: 'Sportwelt Fischer',
    difficulty: 'einfach',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die Sportwelt Fischer OHG, Bahnhofallee 12, 90402 Nürnberg. Deine Vorgesetzte Sabine Roth erwartet das fertige Schreiben und ist unter Tel. Durchwahl 15, Fax 20 oder vorname.nachname@sportwelt-fischer.de erreichbar. Der Brief geht an den Turnverein Blau-Weiß e. V., Herrn Klaus Peters, Vereinsheim 3, 91052 Erlangen; übernimm diese Adresse zeilengenau.\n\nDer Verein möchte ein Angebot für 30 Trainingsanzüge mit Vereinslogo erhalten. Kündige an, dass ein unverbindliches Angebot innerhalb einer Woche folgt.',
    senderLine: 'Sportwelt Fischer OHG, Bahnhofallee 12, 90402 Nürnberg',
    empfaengerLines: ['Turnverein Blau-Weiß e. V.', 'Herrn Klaus Peters', 'Vereinsheim 3', '91052 Erlangen'],
    lines: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        options: [
          { id: 'a', text: 'kp-tv', correct: false },
          { id: 'b', text: '02.04.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          '„Ihr Zeichen“ wird nur ausgefüllt, wenn im Auftrag auf ein Schreiben des Geschäftspartners Bezug genommen wird. Hier gibt es keinen solchen Bezug, das Feld bleibt leer.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        options: [
          { id: 'a', text: '28.03.2025', correct: false },
          { id: 'b', text: 'sr-vn', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'zeichen',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        bossInitials: 'sr',
        placeholder: 'z. B. sr-ab',
        explanation:
          'Das Kürzel „sr“ stammt von Sabine Roth (Vorgesetzte, wird zuerst genannt). Danach folgt ein Bindestrich und deine eigenen Initialen (2 Kleinbuchstaben) – z. B. „sr-ab“.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        options: [
          { id: 'a', text: 'das heutige Datum', correct: false },
          { id: 'b', text: '30.03.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'name',
        id: 'name',
        caption: 'Name',
        placeholder: 'Vorname Nachname',
        explanation:
          'Trage hier deinen eigenen Vor- und Nachnamen ein – daraus leiten sich dein Kürzel bei „Unser Zeichen“ und deine E-Mail-Adresse weiter unten ab.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Telefon',
        options: [
          { id: 'a', text: 'Durchwahl 15', correct: false },
          { id: 'b', text: 'Tel. 15', correct: false },
          { id: 'c', text: '15', correct: true },
        ],
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Fax',
        options: [
          { id: 'a', text: 'Fax 20', correct: false },
          { id: 'b', text: 'Durchwahl 20', correct: false },
          { id: 'c', text: '20', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'email',
        id: 'email',
        caption: 'E-Mail',
        domain: 'sportwelt-fischer.de',
        placeholder: 'vorname.nachname@sportwelt-fischer.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter im Muster der Firma – hier setzt du deinen EIGENEN Vor- und Nachnamen (klein geschrieben, durch einen Punkt getrennt) ein, nicht den der Vorgesetzten.',
      },
      {
        type: 'freitext',
        id: 'datum',
        caption: 'Datum',
        placeholder: 'TT.MM.JJJJ',
        hint: 'Hier trägst du das heutige Datum ein (nicht bewertet).',
      },
    ],
  },
  {
    id: 'buerotechnik-berg',
    title: 'Bürotechnik Berg: Antwort auf ein Schreiben',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die Bürotechnik Berg & Cie. KG, Industriestraße 4, 44149 Dortmund. Dein Vorgesetzter Thomas Berg antwortet auf das Schreiben der Rauch Maschinenbau GmbH vom 03.02.2025 mit dem Zeichen rm-ab. Er ist unter Tel. Durchwahl 77, Fax 78 oder vorname.nachname@berg-buerotechnik.de erreichbar. Der Brief geht an die Rauch Maschinenbau GmbH, Herrn Michael Rauch, Talstraße 9, 45141 Essen; übernimm diese Adresse zeilengenau.\n\nBestätige den Erhalt der Anfrage und kündige an, dass ein detailliertes Angebot in den nächsten Tagen folgt. Ein eigenes vorheriges Schreiben gab es in dieser Sache noch nicht.',
    senderLine: 'Bürotechnik Berg & Cie. KG, Industriestraße 4, 44149 Dortmund',
    empfaengerLines: ['Rauch Maschinenbau GmbH', 'Herrn Michael Rauch', 'Talstraße 9', '45141 Essen'],
    lines: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        options: [
          { id: 'a', text: BLEIBT_FREI, correct: false },
          { id: 'b', text: 'tb-mb', correct: false },
          { id: 'c', text: 'rm-ab', correct: true },
        ],
        explanation:
          '„Ihr Zeichen“ wird aus dem Schreiben des Geschäftspartners übernommen, auf das dieser Brief antwortet – hier also unverändert „rm-ab“.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        options: [
          { id: 'a', text: BLEIBT_FREI, correct: false },
          { id: 'b', text: 'heutiges Datum', correct: false },
          { id: 'c', text: '03.02.2025', correct: true },
        ],
        explanation: 'Hier steht das Datum des Schreibens des Geschäftspartners, auf das dieser Brief antwortet.',
      },
      {
        type: 'zeichen',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        bossInitials: 'tb',
        placeholder: 'z. B. tb-ab',
        explanation:
          'Das Kürzel „tb“ stammt von Thomas Berg (Vorgesetzter, wird zuerst genannt). Danach folgt ein Bindestrich und deine eigenen Initialen (2 Kleinbuchstaben) – z. B. „tb-ab“.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        options: [
          { id: 'a', text: '03.02.2025', correct: false },
          { id: 'b', text: 'das heutige Datum', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          'Es gab noch kein eigenes vorheriges Schreiben in dieser Sache, daher bleibt „Unsere Nachricht vom“ leer.',
      },
      {
        type: 'name',
        id: 'name',
        caption: 'Name',
        placeholder: 'Vorname Nachname',
        explanation:
          'Trage hier deinen eigenen Vor- und Nachnamen ein – daraus leiten sich dein Kürzel bei „Unser Zeichen“ und deine E-Mail-Adresse weiter unten ab.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Telefon',
        options: [
          { id: 'a', text: 'Durchwahl 77', correct: false },
          { id: 'b', text: 'Tel. 77', correct: false },
          { id: 'c', text: '77', correct: true },
        ],
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Fax',
        options: [
          { id: 'a', text: 'Fax 78', correct: false },
          { id: 'b', text: 'Durchwahl 78', correct: false },
          { id: 'c', text: '78', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'email',
        id: 'email',
        caption: 'E-Mail',
        domain: 'berg-buerotechnik.de',
        placeholder: 'vorname.nachname@berg-buerotechnik.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter im Muster der Firma – hier setzt du deinen EIGENEN Vor- und Nachnamen (klein geschrieben, durch einen Punkt getrennt) ein, nicht den des Vorgesetzten.',
      },
      {
        type: 'freitext',
        id: 'datum',
        caption: 'Datum',
        placeholder: 'TT.MM.JJJJ',
        hint: 'Hier trägst du das heutige Datum ein (nicht bewertet).',
      },
    ],
  },
  {
    id: 'gartenwelt-lang',
    title: 'Gartenwelt Lang: Erinnerung an eigenes Schreiben',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die Gartenwelt Lang GmbH, Rosenallee 5, 50667 Köln. Deine Vorgesetzte Petra Lang bezieht sich auf euer eigenes Schreiben vom 12.01.2025, auf das bisher keine Antwort einging. Sie ist unter Tel. Durchwahl 33, Fax 34 oder vorname.nachname@gartenwelt-lang.de erreichbar. Der Brief geht an GrünTraum Gartenbau, Frau Nina Vogt, Wiesenweg 8, 51103 Köln; übernimm diese Adresse zeilengenau.\n\nErkundige dich höflich, ob das Angebot vom Januar noch aktuell ist, und bitte um eine kurze Rückmeldung bis Ende des Monats. Ein Schreiben der Kundin, auf das du dich beziehen könntest, liegt nicht vor.',
    senderLine: 'Gartenwelt Lang GmbH, Rosenallee 5, 50667 Köln',
    empfaengerLines: ['GrünTraum Gartenbau', 'Frau Nina Vogt', 'Wiesenweg 8', '51103 Köln'],
    lines: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        options: [
          { id: 'a', text: 'pl-vn', correct: false },
          { id: 'b', text: '12.01.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          'Es liegt kein Schreiben der Kundin vor, auf das Bezug genommen werden könnte – „Ihr Zeichen“ bleibt leer.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        options: [
          { id: 'a', text: '12.01.2025', correct: false },
          { id: 'b', text: 'das heutige Datum', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          'Auch „Ihre Nachricht vom“ bleibt leer, da kein Schreiben der Kundin vorliegt, auf das Bezug genommen wird.',
      },
      {
        type: 'zeichen',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        bossInitials: 'pl',
        placeholder: 'z. B. pl-ab',
        explanation:
          'Das Kürzel „pl“ stammt von Petra Lang (Vorgesetzte, wird zuerst genannt). Danach folgt ein Bindestrich und deine eigenen Initialen (2 Kleinbuchstaben) – z. B. „pl-ab“.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        options: [
          { id: 'a', text: BLEIBT_FREI, correct: false },
          { id: 'b', text: 'das heutige Datum', correct: false },
          { id: 'c', text: '12.01.2025', correct: true },
        ],
        explanation:
          'Hier steht das Datum des eigenen vorherigen Schreibens, an das ihr erinnert – also der 12.01.2025.',
      },
      {
        type: 'name',
        id: 'name',
        caption: 'Name',
        placeholder: 'Vorname Nachname',
        explanation:
          'Trage hier deinen eigenen Vor- und Nachnamen ein – daraus leiten sich dein Kürzel bei „Unser Zeichen“ und deine E-Mail-Adresse weiter unten ab.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Telefon',
        options: [
          { id: 'a', text: 'Durchwahl 33', correct: false },
          { id: 'b', text: 'Tel. 33', correct: false },
          { id: 'c', text: '33', correct: true },
        ],
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Fax',
        options: [
          { id: 'a', text: 'Fax 34', correct: false },
          { id: 'b', text: 'Durchwahl 34', correct: false },
          { id: 'c', text: '34', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'email',
        id: 'email',
        caption: 'E-Mail',
        domain: 'gartenwelt-lang.de',
        placeholder: 'vorname.nachname@gartenwelt-lang.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter im Muster der Firma – hier setzt du deinen EIGENEN Vor- und Nachnamen (klein geschrieben, durch einen Punkt getrennt) ein, nicht den der Vorgesetzten.',
      },
      {
        type: 'freitext',
        id: 'datum',
        caption: 'Datum',
        placeholder: 'TT.MM.JJJJ',
        hint: 'Hier trägst du das heutige Datum ein (nicht bewertet).',
      },
    ],
  },
  {
    id: 'it-service-neumann',
    title: 'IT-Service Neumann: Titel im Kürzel',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die IT-Service Neumann GmbH, Technologiepark 3, 76131 Karlsruhe. Dein Vorgesetzter Dr. Michael Ostermann erwartet das fertige Schreiben und ist unter Tel. Durchwahl 55, Fax 56 oder vorname.nachname@it-neumann.de erreichbar. Der Brief geht an die Papier & Stift OHG, Herrn Jonas Weller, Hauptstraße 21, 76133 Karlsruhe; übernimm diese Adresse zeilengenau.\n\nInformiere über den anstehenden Wartungstermin der IT-Systeme und bitte um Terminbestätigung.',
    senderLine: 'IT-Service Neumann GmbH, Technologiepark 3, 76131 Karlsruhe',
    empfaengerLines: ['Papier & Stift OHG', 'Herrn Jonas Weller', 'Hauptstraße 21', '76133 Karlsruhe'],
    lines: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        options: [
          { id: 'a', text: 'jw-mo', correct: false },
          { id: 'b', text: '15.04.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          '„Ihr Zeichen“ wird nur ausgefüllt, wenn im Auftrag auf ein Schreiben des Geschäftspartners Bezug genommen wird. Hier gibt es keinen solchen Bezug, das Feld bleibt leer.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        options: [
          { id: 'a', text: '12.04.2025', correct: false },
          { id: 'b', text: 'mo-vn', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'zeichen',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        bossInitials: 'mo',
        placeholder: 'z. B. mo-ab',
        explanation:
          'Akademische Titel wie „Dr.“ zählen nicht zum Kürzel – entscheidend sind nur Vor- und Nachname: „Michael Ostermann“ ergibt „mo“. Danach folgt ein Bindestrich und deine eigenen Initialen, z. B. „mo-ab“.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        options: [
          { id: 'a', text: 'das heutige Datum', correct: false },
          { id: 'b', text: '10.04.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'name',
        id: 'name',
        caption: 'Name',
        placeholder: 'Vorname Nachname',
        explanation:
          'Trage hier deinen eigenen Vor- und Nachnamen ein (ohne Titel) – daraus leiten sich dein Kürzel bei „Unser Zeichen“ und deine E-Mail-Adresse weiter unten ab.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Telefon',
        options: [
          { id: 'a', text: 'Durchwahl 55', correct: false },
          { id: 'b', text: 'Tel. 55', correct: false },
          { id: 'c', text: '55', correct: true },
        ],
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Fax',
        options: [
          { id: 'a', text: 'Fax 56', correct: false },
          { id: 'b', text: 'Durchwahl 56', correct: false },
          { id: 'c', text: '56', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'email',
        id: 'email',
        caption: 'E-Mail',
        domain: 'it-neumann.de',
        placeholder: 'vorname.nachname@it-neumann.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter im Muster der Firma – hier setzt du deinen EIGENEN Vor- und Nachnamen (klein geschrieben, ohne Titel) ein, nicht den des Vorgesetzten.',
      },
      {
        type: 'freitext',
        id: 'datum',
        caption: 'Datum',
        placeholder: 'TT.MM.JJJJ',
        hint: 'Hier trägst du das heutige Datum ein (nicht bewertet).',
      },
    ],
  },
  {
    id: 'verlag-krause',
    title: 'Verlag Krause: kein Fax vorhanden',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für den Verlag Krause GmbH, Buchdruckerweg 6, 04103 Leipzig. Deine Vorgesetzte Anna Krause erwartet das fertige Schreiben und ist unter Tel. Durchwahl 21 oder vorname.nachname@verlag-krause.de erreichbar; ein Faxanschluss steht im Verlag nicht mehr zur Verfügung. Der Brief geht an die Buchhandlung Seitenzahl, Herrn Paul Nickel, Marktgasse 14, 04109 Leipzig; übernimm diese Adresse zeilengenau.\n\nKündige die Lieferung der bestellten Neuerscheinungen für die kommende Woche an.',
    senderLine: 'Verlag Krause GmbH, Buchdruckerweg 6, 04103 Leipzig',
    empfaengerLines: ['Buchhandlung Seitenzahl', 'Herrn Paul Nickel', 'Marktgasse 14', '04109 Leipzig'],
    lines: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        options: [
          { id: 'a', text: 'pn-ak', correct: false },
          { id: 'b', text: '01.05.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          '„Ihr Zeichen“ wird nur ausgefüllt, wenn im Auftrag auf ein Schreiben des Geschäftspartners Bezug genommen wird. Hier gibt es keinen solchen Bezug, das Feld bleibt leer.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        options: [
          { id: 'a', text: '28.04.2025', correct: false },
          { id: 'b', text: 'ak-vn', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'zeichen',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        bossInitials: 'ak',
        placeholder: 'z. B. ak-ab',
        explanation:
          'Das Kürzel „ak“ stammt von Anna Krause (Vorgesetzte, wird zuerst genannt). Danach folgt ein Bindestrich und deine eigenen Initialen (2 Kleinbuchstaben) – z. B. „ak-ab“.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        options: [
          { id: 'a', text: 'das heutige Datum', correct: false },
          { id: 'b', text: '30.04.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'name',
        id: 'name',
        caption: 'Name',
        placeholder: 'Vorname Nachname',
        explanation:
          'Trage hier deinen eigenen Vor- und Nachnamen ein – daraus leiten sich dein Kürzel bei „Unser Zeichen“ und deine E-Mail-Adresse weiter unten ab.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Telefon',
        options: [
          { id: 'a', text: 'Durchwahl 21', correct: false },
          { id: 'b', text: 'Tel. 21', correct: false },
          { id: 'c', text: '21', correct: true },
        ],
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Fax',
        options: [
          { id: 'a', text: 'Durchwahl 21', correct: false },
          { id: 'b', text: 'nicht vorhanden', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          'Wird im Arbeitsauftrag kein Faxanschluss genannt, gibt es auch keine Angabe zum Eintragen – das Feld bleibt leer.',
      },
      {
        type: 'email',
        id: 'email',
        caption: 'E-Mail',
        domain: 'verlag-krause.de',
        placeholder: 'vorname.nachname@verlag-krause.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter im Muster der Firma – hier setzt du deinen EIGENEN Vor- und Nachnamen (klein geschrieben, durch einen Punkt getrennt) ein, nicht den der Vorgesetzten.',
      },
      {
        type: 'freitext',
        id: 'datum',
        caption: 'Datum',
        placeholder: 'TT.MM.JJJJ',
        hint: 'Hier trägst du das heutige Datum ein (nicht bewertet).',
      },
    ],
  },
  {
    id: 'spedition-hartmann',
    title: 'Spedition Hartmann: alle Bezüge ausgefüllt',
    difficulty: 'schwer',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die Spedition Hartmann GmbH & Co. KG, Speditionsweg 9, 28195 Bremen. Dein Vorgesetzter Frank Hartmann antwortet auf das Schreiben der Firma Wagner Logistik AG vom 18.02.2025 mit dem Zeichen fw-mk und bezieht sich zusätzlich auf euer eigenes Schreiben vom 05.02.2025. Er ist unter Tel. Durchwahl 88, Fax 89 oder vorname.nachname@hartmann-spedition.de erreichbar. Der Brief geht an die Wagner Logistik AG, Frau Katrin Wolter, Hafenstraße 40, 27568 Bremerhaven; übernimm diese Adresse zeilengenau.\n\nBestätige den vereinbarten Liefertermin und weise auf die beigefügten Frachtpapiere hin.',
    senderLine: 'Spedition Hartmann GmbH & Co. KG, Speditionsweg 9, 28195 Bremen',
    empfaengerLines: ['Wagner Logistik AG', 'Frau Katrin Wolter', 'Hafenstraße 40', '27568 Bremerhaven'],
    lines: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        options: [
          { id: 'a', text: BLEIBT_FREI, correct: false },
          { id: 'b', text: 'fh-kw', correct: false },
          { id: 'c', text: 'fw-mk', correct: true },
        ],
        explanation:
          '„Ihr Zeichen“ wird aus dem Schreiben des Geschäftspartners übernommen, auf das dieser Brief antwortet – hier also unverändert „fw-mk“.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        options: [
          { id: 'a', text: '05.02.2025', correct: false },
          { id: 'b', text: 'das heutige Datum', correct: false },
          { id: 'c', text: '18.02.2025', correct: true },
        ],
        explanation: 'Hier steht das Datum des Schreibens des Geschäftspartners, auf das dieser Brief antwortet.',
      },
      {
        type: 'zeichen',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        bossInitials: 'fh',
        placeholder: 'z. B. fh-ab',
        explanation:
          'Das Kürzel „fh“ stammt von Frank Hartmann (Vorgesetzter, wird zuerst genannt). Danach folgt ein Bindestrich und deine eigenen Initialen (2 Kleinbuchstaben) – z. B. „fh-ab“.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        options: [
          { id: 'a', text: '18.02.2025', correct: false },
          { id: 'b', text: BLEIBT_FREI, correct: false },
          { id: 'c', text: '05.02.2025', correct: true },
        ],
        explanation:
          'Hier steht das Datum des eigenen vorherigen Schreibens, auf das zusätzlich Bezug genommen wird – also der 05.02.2025.',
      },
      {
        type: 'name',
        id: 'name',
        caption: 'Name',
        placeholder: 'Vorname Nachname',
        explanation:
          'Trage hier deinen eigenen Vor- und Nachnamen ein – daraus leiten sich dein Kürzel bei „Unser Zeichen“ und deine E-Mail-Adresse weiter unten ab.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Telefon',
        options: [
          { id: 'a', text: 'Durchwahl 88', correct: false },
          { id: 'b', text: 'Tel. 88', correct: false },
          { id: 'c', text: '88', correct: true },
        ],
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Fax',
        options: [
          { id: 'a', text: 'Fax 89', correct: false },
          { id: 'b', text: 'Durchwahl 89', correct: false },
          { id: 'c', text: '89', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'email',
        id: 'email',
        caption: 'E-Mail',
        domain: 'hartmann-spedition.de',
        placeholder: 'vorname.nachname@hartmann-spedition.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter im Muster der Firma – hier setzt du deinen EIGENEN Vor- und Nachnamen (klein geschrieben, durch einen Punkt getrennt) ein, nicht den des Vorgesetzten.',
      },
      {
        type: 'freitext',
        id: 'datum',
        caption: 'Datum',
        placeholder: 'TT.MM.JJJJ',
        hint: 'Hier trägst du das heutige Datum ein (nicht bewertet).',
      },
    ],
  },
  {
    id: 'modehaus-adler',
    title: 'Modehaus Adler: Telefonnummer ohne Durchwahl',
    difficulty: 'schwer',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für das Modehaus Adler e. K., Ludwigstraße 30, 86150 Augsburg. Deine Vorgesetzte Claudia Adler erwartet das fertige Schreiben und ist unter Tel. 0821 551234, Fax 0821 551200 oder vorname.nachname@modehaus-adler.de erreichbar. Der Brief geht an die Trachtenwelt Bergmann, Herrn Sepp Bergmann, Postfach 4521, 83022 Rosenheim; übernimm diese Adresse zeilengenau.\n\nInformiere über die neue Herbstkollektion und lade zu einer exklusiven Vorschau ein.',
    senderLine: 'Modehaus Adler e. K., Ludwigstraße 30, 86150 Augsburg',
    empfaengerLines: ['Trachtenwelt Bergmann', 'Herrn Sepp Bergmann', 'Postfach 45 21', '83022 Rosenheim'],
    lines: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        options: [
          { id: 'a', text: 'sb-ca', correct: false },
          { id: 'b', text: '20.08.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          '„Ihr Zeichen“ wird nur ausgefüllt, wenn im Auftrag auf ein Schreiben des Geschäftspartners Bezug genommen wird. Hier gibt es keinen solchen Bezug, das Feld bleibt leer.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        options: [
          { id: 'a', text: '18.08.2025', correct: false },
          { id: 'b', text: 'ca-vn', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'zeichen',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        bossInitials: 'ca',
        placeholder: 'z. B. ca-ab',
        explanation:
          'Das Kürzel „ca“ stammt von Claudia Adler (Vorgesetzte, wird zuerst genannt). Danach folgt ein Bindestrich und deine eigenen Initialen (2 Kleinbuchstaben) – z. B. „ca-ab“.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        options: [
          { id: 'a', text: 'das heutige Datum', correct: false },
          { id: 'b', text: '19.08.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'name',
        id: 'name',
        caption: 'Name',
        placeholder: 'Vorname Nachname',
        explanation:
          'Trage hier deinen eigenen Vor- und Nachnamen ein – daraus leiten sich dein Kürzel bei „Unser Zeichen“ und deine E-Mail-Adresse weiter unten ab.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Telefon',
        options: [
          { id: 'a', text: 'Durchwahl 0821 551234', correct: false },
          { id: 'b', text: 'Tel. 0821 551234', correct: false },
          { id: 'c', text: '0821 551234', correct: true },
        ],
        explanation:
          'Ist keine Durchwahl, sondern eine vollständige Telefonnummer angegeben, wird genau diese Nummer unverändert übernommen – ohne erfundenes „Durchwahl“ davor.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Fax',
        options: [
          { id: 'a', text: 'Fax 0821 551200', correct: false },
          { id: 'b', text: 'Durchwahl 0821 551200', correct: false },
          { id: 'c', text: '0821 551200', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'email',
        id: 'email',
        caption: 'E-Mail',
        domain: 'modehaus-adler.de',
        placeholder: 'vorname.nachname@modehaus-adler.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter im Muster der Firma – hier setzt du deinen EIGENEN Vor- und Nachnamen (klein geschrieben, durch einen Punkt getrennt) ein, nicht den der Vorgesetzten.',
      },
      {
        type: 'freitext',
        id: 'datum',
        caption: 'Datum',
        placeholder: 'TT.MM.JJJJ',
        hint: 'Hier trägst du das heutige Datum ein (nicht bewertet).',
      },
    ],
  },
  {
    id: 'glaserei-huber',
    title: 'Glaserei Huber: Antwort mit Postfach-Empfänger',
    difficulty: 'schwer',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für die Glaserei Huber GmbH, Werkstattgasse 2, 93047 Regensburg. Dein Vorgesetzter Stefan Huber antwortet auf das Schreiben der Firma Fensterbau Schreiner OHG vom 22.06.2025 mit dem Zeichen fs-lm. Er ist unter Tel. Durchwahl 61, Fax 62 oder vorname.nachname@glaserei-huber.de erreichbar. Der Brief geht an die Fensterbau Schreiner OHG, Frau Dr. Laura Meyer, Postfach 730, 93042 Regensburg; übernimm diese Adresse zeilengenau.\n\nBestätige den Auftrag für die Verglasung und nenne den voraussichtlichen Liefertermin.',
    senderLine: 'Glaserei Huber GmbH, Werkstattgasse 2, 93047 Regensburg',
    empfaengerLines: ['Fensterbau Schreiner OHG', 'Frau Dr. Laura Meyer', 'Postfach 7 30', '93042 Regensburg'],
    lines: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        options: [
          { id: 'a', text: BLEIBT_FREI, correct: false },
          { id: 'b', text: 'sh-lm', correct: false },
          { id: 'c', text: 'fs-lm', correct: true },
        ],
        explanation:
          '„Ihr Zeichen“ wird aus dem Schreiben des Geschäftspartners übernommen, auf das dieser Brief antwortet – hier also unverändert „fs-lm“.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        options: [
          { id: 'a', text: 'das heutige Datum', correct: false },
          { id: 'b', text: BLEIBT_FREI, correct: false },
          { id: 'c', text: '22.06.2025', correct: true },
        ],
        explanation: 'Hier steht das Datum des Schreibens des Geschäftspartners, auf das dieser Brief antwortet.',
      },
      {
        type: 'zeichen',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        bossInitials: 'sh',
        placeholder: 'z. B. sh-ab',
        explanation:
          'Das Kürzel „sh“ stammt von Stefan Huber (Vorgesetzter, wird zuerst genannt). Danach folgt ein Bindestrich und deine eigenen Initialen (2 Kleinbuchstaben) – z. B. „sh-ab“.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        options: [
          { id: 'a', text: '22.06.2025', correct: false },
          { id: 'b', text: 'das heutige Datum', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          'Ein eigenes vorheriges Schreiben in dieser Sache wird nicht erwähnt, daher bleibt „Unsere Nachricht vom“ leer.',
      },
      {
        type: 'name',
        id: 'name',
        caption: 'Name',
        placeholder: 'Vorname Nachname',
        explanation:
          'Trage hier deinen eigenen Vor- und Nachnamen ein – daraus leiten sich dein Kürzel bei „Unser Zeichen“ und deine E-Mail-Adresse weiter unten ab.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Telefon',
        options: [
          { id: 'a', text: 'Durchwahl 61', correct: false },
          { id: 'b', text: 'Tel. 61', correct: false },
          { id: 'c', text: '61', correct: true },
        ],
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Fax',
        options: [
          { id: 'a', text: 'Fax 62', correct: false },
          { id: 'b', text: 'Durchwahl 62', correct: false },
          { id: 'c', text: '62', correct: true },
        ],
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'email',
        id: 'email',
        caption: 'E-Mail',
        domain: 'glaserei-huber.de',
        placeholder: 'vorname.nachname@glaserei-huber.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter im Muster der Firma – hier setzt du deinen EIGENEN Vor- und Nachnamen (klein geschrieben, durch einen Punkt getrennt) ein, nicht den des Vorgesetzten.',
      },
      {
        type: 'freitext',
        id: 'datum',
        caption: 'Datum',
        placeholder: 'TT.MM.JJJJ',
        hint: 'Hier trägst du das heutige Datum ein (nicht bewertet).',
      },
    ],
  },
  {
    id: 'reisebuero-sonnenschein',
    title: 'Reisebüro Sonnenschein: Telefonnummer ohne Fax',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Arbeitsauftrag: Du schreibst für das Reisebüro Sonnenschein GmbH, Urlauberstraße 5, 82362 Weilheim. Deine Vorgesetzte Melanie Vogt erwartet das fertige Schreiben und ist unter Tel. 08151 4477 oder vorname.nachname@reisebuero-sonnenschein.de erreichbar; ein Faxgerät gibt es im Büro nicht mehr. Der Brief geht an Herrn Alfons Bauer, Seeweg 12, 82340 Feldafing; übernimm diese Adresse zeilengenau.\n\nBestätige die Buchung der Pauschalreise und weise auf die beigefügten Reiseunterlagen hin.',
    senderLine: 'Reisebüro Sonnenschein GmbH, Urlauberstraße 5, 82362 Weilheim',
    empfaengerLines: ['Herrn Alfons Bauer', 'Seeweg 12', '82340 Feldafing'],
    lines: [
      {
        type: 'choice',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        options: [
          { id: 'a', text: 'ab-mv', correct: false },
          { id: 'b', text: '02.09.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          '„Ihr Zeichen“ wird nur ausgefüllt, wenn im Auftrag auf ein Schreiben des Geschäftspartners Bezug genommen wird. Hier gibt es keinen solchen Bezug, das Feld bleibt leer.',
      },
      {
        type: 'choice',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        options: [
          { id: 'a', text: '30.08.2025', correct: false },
          { id: 'b', text: 'mv-vn', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'zeichen',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        bossInitials: 'mv',
        placeholder: 'z. B. mv-ab',
        explanation:
          'Das Kürzel „mv“ stammt von Melanie Vogt (Vorgesetzte, wird zuerst genannt). Danach folgt ein Bindestrich und deine eigenen Initialen (2 Kleinbuchstaben) – z. B. „mv-ab“.',
      },
      {
        type: 'choice',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        options: [
          { id: 'a', text: 'das heutige Datum', correct: false },
          { id: 'b', text: '01.09.2025', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'name',
        id: 'name',
        caption: 'Name',
        placeholder: 'Vorname Nachname',
        explanation:
          'Trage hier deinen eigenen Vor- und Nachnamen ein – daraus leiten sich dein Kürzel bei „Unser Zeichen“ und deine E-Mail-Adresse weiter unten ab.',
      },
      {
        type: 'choice',
        id: 'telefon',
        caption: 'Telefon',
        options: [
          { id: 'a', text: 'Durchwahl 08151 4477', correct: false },
          { id: 'b', text: 'Tel. 08151 4477', correct: false },
          { id: 'c', text: '08151 4477', correct: true },
        ],
        explanation:
          'Ist keine Durchwahl, sondern eine vollständige Telefonnummer angegeben, wird genau diese Nummer unverändert übernommen – ohne erfundenes „Durchwahl“ davor.',
      },
      {
        type: 'choice',
        id: 'fax',
        caption: 'Fax',
        options: [
          { id: 'a', text: 'nicht vorhanden', correct: false },
          { id: 'b', text: '08151 4477', correct: false },
          { id: 'c', text: BLEIBT_FREI, correct: true },
        ],
        explanation:
          'Wird im Arbeitsauftrag kein Faxanschluss genannt, gibt es auch keine Angabe zum Eintragen – das Feld bleibt leer.',
      },
      {
        type: 'email',
        id: 'email',
        caption: 'E-Mail',
        domain: 'reisebuero-sonnenschein.de',
        placeholder: 'vorname.nachname@reisebuero-sonnenschein.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter im Muster der Firma – hier setzt du deinen EIGENEN Vor- und Nachnamen (klein geschrieben, durch einen Punkt getrennt) ein, nicht den der Vorgesetzten.',
      },
      {
        type: 'freitext',
        id: 'datum',
        caption: 'Datum',
        placeholder: 'TT.MM.JJJJ',
        hint: 'Hier trägst du das heutige Datum ein (nicht bewertet).',
      },
    ],
  },
];

export function getInfoblockTaskById(id: string) {
  return INFOBLOCK_TASKS.find((task) => task.id === id);
}
