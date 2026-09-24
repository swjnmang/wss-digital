import type { VollstaendigerBriefTask } from './vollstaendiger-brief-types';

export const VOLLSTAENDIGER_BRIEF_TASKS: VollstaendigerBriefTask[] = [
  {
    id: 'moebelfabrik-jordan-komplett',
    title: 'Möbelfabrik Jordan: der komplette Brief',
    difficulty: 'einfach',
    arbeitsauftrag:
      'Du arbeitest bei der MÖBELFABRIK Peter Jordan GmbH, Meindlstraße 8a, 81373 München. Dein Vorgesetzter Werner Volk erwartet das fertige Schreiben und ist unter Tel. Durchwahl 142, Fax 100 oder vorname.nachname@jordanmoebel.de erreichbar. Der Brief geht an Merkur & Söhne GmbH, Frau Elke Schnell, Postfach 11609, 83425 Bad Reichenhall; übernimm diese Adresse zeilengenau.\n\nDie Kundin benötigt einen aktualisierten Spezialkatalog und eine kurze Übersicht über verfügbare Büromodule. Du verfasst den Brief im Auftrag von Werner Volk und heißt Hans Schuster; „i. A.“ soll direkt vor deinem gedruckten Namen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'MÖBELFABRIK Peter Jordan GmbH, Meindlstraße 8a, 81373 München',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        expected: 'Merkur & Söhne GmbH',
        explanation: 'Die Firmenbezeichnung steht über dem Empfängernamen.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Anrede Name',
        zone: 'anschrift',
        expected: 'Frau Elke Schnell',
        explanation: 'Bei einem Unternehmen mit Ansprechpartner stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer (oder Postfach)',
        zone: 'anschrift',
        expected: 'Postfach 1 16 09',
        explanation: 'Postfachnummern werden von rechts nach links in Zweiergruppen gegliedert.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '83425 Bad Reichenhall',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: '',
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt „Ihr Zeichen“ leer.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '',
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'wv-hs',
        explanation:
          'Der Auftraggeber (Werner Volk → „wv“) wird zuerst genannt, danach die Initialen des Verfassers Hans Schuster („hs“) – klein geschrieben und mit Bindestrich getrennt.',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '142',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '100',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'werner.volk@jordanmoebel.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen des Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Ihr Spezialkatalog und aktuelle Büromodule',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrte Frau Schnell,',
        explanation:
          'Ist eine konkrete Ansprechpartnerin bekannt, wird sie persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'vielen Dank für Ihre Anfrage nach unserem aktuellen Spezialkatalog. Wir freuen uns, dass Sie sich für unsere Büromodule interessieren, und senden Ihnen die gewünschten Unterlagen in den kommenden Tagen postalisch zu.',
      'Zusätzlich zum Katalog legen wir eine kurze Übersicht über die derzeit verfügbaren Büromodule bei, damit Sie sich bereits vorab einen Eindruck von den Ausstattungsmöglichkeiten verschaffen können. Bei Rückfragen zu einzelnen Modellen stehen wir Ihnen jederzeit telefonisch zur Verfügung.',
      'Bitte beachten Sie, dass wir die für Sie reservierten Modelle nur bis zum Ende der kommenden Woche zurückhalten können. Danach geben wir die Reservierung wieder frei.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Möbelherstellung',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'MÖBELFABRIK Peter Jordan GmbH',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'i. A. Hans Schuster',
        explanation: '„i. A.“ steht in diesem Brief direkt vor dem gedruckten Namen: „i. A. Hans Schuster“.',
      },
    ],
  },
  {
    id: 'buerotechnik-berg-komplett',
    title: 'Bürotechnik Berg: der komplette Brief',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Du arbeitest bei der Bürotechnik Berg & Cie. KG, Industriestraße 4, 44149 Dortmund. Dein Vorgesetzter Thomas Berg antwortet auf das Schreiben der Rauch Maschinenbau GmbH vom 03.02.2025 mit dem Zeichen rm-ab. Er ist unter Tel. Durchwahl 77, Fax 78 oder vorname.nachname@berg-buerotechnik.de erreichbar. Der Brief geht an die Rauch Maschinenbau GmbH, Herrn Michael Rauch, Talstraße 9, 45141 Essen; übernimm diese Adresse zeilengenau.\n\nBestätige den Erhalt der Anfrage und kündige ein detailliertes Angebot an. Du heißt Laura Fink und schreibst im Auftrag von Thomas Berg; „i. A.“ soll diesmal in der mittleren der drei Leerzeilen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Bürotechnik Berg & Cie. KG, Industriestraße 4, 44149 Dortmund',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        expected: 'Rauch Maschinenbau GmbH',
        explanation: 'Die Firmenbezeichnung steht über dem Empfängernamen.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Anrede Name',
        zone: 'anschrift',
        expected: 'Herrn Michael Rauch',
        explanation: 'Bei einem Unternehmen mit Ansprechpartner stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Talstraße 9',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '45141 Essen',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: 'rm-ab',
        explanation:
          '„Ihr Zeichen“ wird aus dem Schreiben des Geschäftspartners übernommen, auf das dieser Brief antwortet.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '03.02.2025',
        explanation: 'Hier steht das Datum des Schreibens des Geschäftspartners, auf das dieser Brief antwortet.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'tb-lf',
        explanation:
          'Der Auftraggeber (Thomas Berg → „tb“) wird zuerst genannt, danach die Initialen der Verfasserin Laura Fink („lf“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation:
          'Es gab noch kein eigenes vorheriges Schreiben in dieser Sache, daher bleibt „Unsere Nachricht vom“ leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '77',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '78',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'thomas.berg@berg-buerotechnik.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen des Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Ihre Anfrage vom 03.02.2025',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrter Herr Rauch,',
        explanation:
          'Ist ein konkreter Ansprechpartner bekannt, wird er persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'vielen Dank für Ihre Anfrage vom 03.02.2025, in der Sie sich nach unseren aktuellen Wartungslösungen für Bürotechnik erkundigen. Wir haben Ihre Angaben sorgfältig geprüft und Ihren Bedarf mit unserem technischen Team besprochen.',
      'In den nächsten Tagen erhalten Sie von uns ein detailliertes Angebot, das genau auf die von Ihnen beschriebenen Anforderungen zugeschnitten ist. Sollten sich bis dahin noch Fragen ergeben, erreichen Sie uns jederzeit unter der oben genannten Telefonnummer.',
      'Wir bedanken uns für Ihr Interesse an unserem Unternehmen und freuen uns auf die weitere Zusammenarbeit.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Bürotechnik',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Bürotechnik Berg & Cie. KG',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'mittlere-leerzeile',
        caption: 'Mittlere der drei Leerzeilen',
        expected: 'i. A.',
        explanation:
          '„i. A.“ kann allein in die mittlere der drei Leerzeilen geschrieben werden – dann bleibt der Name ohne Zusatz.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'Laura Fink',
        explanation: 'Steht „i. A.“ bereits in der mittleren Leerzeile, wird der Name ohne weiteren Zusatz gedruckt.',
      },
    ],
  },
  {
    id: 'kern-verpackungstechnik-komplett',
    title: 'Kern Verpackungstechnik: der komplette Brief',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Du arbeitest bei der Kern Verpackungstechnik e. K., Fabrikweg 2, 70565 Stuttgart. Deine Vorgesetzte Julia Kern bezieht sich auf euer eigenes Schreiben vom 20.01.2025. Sie ist unter Tel. Durchwahl 44, Fax 45 oder vorname.nachname@kern-verpackung.de erreichbar. Der Brief geht an die Grafendorfer Kunststoffe GmbH, Herrn Peter Grafendorfer, Fabrikstraße 12, 71638 Ludwigsburg; übernimm diese Adresse zeilengenau.\n\nErinnere höflich an die Bestellung Nr. 4521 und bitte um eine kurze Rückmeldung. Du heißt Anna Berg und schreibst im Auftrag von Julia Kern; „i. A.“ soll in der mittleren der drei Leerzeilen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Kern Verpackungstechnik e. K., Fabrikweg 2, 70565 Stuttgart',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        expected: 'Grafendorfer Kunststoffe GmbH',
        explanation: 'Die Firmenbezeichnung steht über dem Empfängernamen.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Anrede Name',
        zone: 'anschrift',
        expected: 'Herrn Peter Grafendorfer',
        explanation: 'Bei einem Unternehmen mit Ansprechpartner stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Fabrikstraße 12',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '71638 Ludwigsburg',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: '',
        explanation:
          'Es liegt kein Schreiben des Kunden vor, auf das Bezug genommen werden könnte – „Ihr Zeichen“ bleibt leer.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '',
        explanation: 'Ohne ein Schreiben des Kunden bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'jk-ab',
        explanation:
          'Der Auftraggeber (Julia Kern → „jk“) wird zuerst genannt, danach die Initialen der Verfasserin Anna Berg („ab“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '20.01.2025',
        explanation: 'Hier steht das Datum des eigenen vorherigen Schreibens, an das erinnert wird.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '44',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '45',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'julia.kern@kern-verpackung.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen der Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Ihre Bestellung Nr. 4521',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrter Herr Grafendorfer,',
        explanation:
          'Ist ein konkreter Ansprechpartner bekannt, wird er persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'am 20.01.2025 haben wir Ihnen unser Angebot zur Bestellung Nr. 4521 zugesandt. Bisher haben wir von Ihnen leider noch keine Rückmeldung erhalten und möchten daher freundlich nachfragen, ob das Angebot noch aktuell ist.',
      'Sollten sich in der Zwischenzeit Änderungen an Ihrem Bedarf ergeben haben, passen wir das Angebot selbstverständlich gerne an. Wir bitten Sie um eine kurze Rückmeldung, damit wir die Bestellung zeitnah bearbeiten können.',
      'Für Rückfragen stehen wir Ihnen gerne zur Verfügung und würden uns über eine baldige Antwort freuen.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Verpackungstechnik',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Kern Verpackungstechnik e. K.',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'mittlere-leerzeile',
        caption: 'Mittlere der drei Leerzeilen',
        expected: 'i. A.',
        explanation:
          '„i. A.“ kann allein in die mittlere der drei Leerzeilen geschrieben werden – dann bleibt der Name ohne Zusatz.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'Anna Berg',
        explanation: 'Steht „i. A.“ bereits in der mittleren Leerzeile, wird der Name ohne weiteren Zusatz gedruckt.',
      },
    ],
  },
  {
    id: 'it-service-neumann-ausland-komplett',
    title: 'IT-Service Neumann: kompletter Brief ins Ausland',
    difficulty: 'schwer',
    arbeitsauftrag:
      'Du arbeitest bei der IT-Service Neumann GmbH, Technologiepark 3, 76131 Karlsruhe. Dein Vorgesetzter Dr. Michael Ostermann erwartet das fertige Schreiben und ist unter Tel. Durchwahl 55, Fax 56 oder vorname.nachname@it-neumann.de erreichbar. Der Brief geht an die TechPartner SA, Herrn Marc Dubois, 15, Avenue de la République, 75011 Paris, FRANKREICH; übernimm diese Adresse zeilengenau.\n\nBestätige den Wartungsvertrag Nr. 2025-118 und nenne den nächsten Wartungstermin (15. Mai). Du heißt Dr. Lisa Kern und schreibst im Auftrag von Dr. Michael Ostermann; „i. A.“ soll direkt vor deinem gedruckten Namen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'IT-Service Neumann GmbH, Technologiepark 3, 76131 Karlsruhe',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        expected: 'TechPartner SA',
        explanation: 'Die Firmenbezeichnung steht über dem Empfängernamen.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Anrede Name',
        zone: 'anschrift',
        expected: 'Herrn Marc Dubois',
        explanation: 'Bei einem Unternehmen mit Ansprechpartner stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: '15, Avenue de la République',
        explanation:
          'Die Struktur der Adresse richtet sich nach dem Bestimmungsland. In Frankreich steht die Hausnummer vor der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Bestimmungsort',
        zone: 'anschrift',
        expected: '75011 PARIS',
        explanation: 'Der Bestimmungsort wird bei Auslandssendungen in GROSSBUCHSTABEN geschrieben.',
      },
      {
        type: 'text',
        id: 'af-land',
        caption: 'Zeile 10 – Bestimmungsland',
        zone: 'anschrift',
        expected: 'FRANKREICH',
        explanation: 'Das Bestimmungsland wird bei Auslandssendungen ebenfalls in GROSSBUCHSTABEN geschrieben.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: '',
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt „Ihr Zeichen“ leer.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '',
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'mo-lk',
        explanation:
          'Der Auftraggeber (Dr. Michael Ostermann → „mo“, der Titel zählt nicht mit) wird zuerst genannt, danach die Initialen von Dr. Lisa Kern („lk“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '55',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '56',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'michael.ostermann@it-neumann.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – eingesetzt werden die tatsächlichen Vor- und Nachnamen (klein geschrieben), der Titel gehört nicht in die E-Mail-Adresse.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Ihr Wartungsvertrag Nr. 2025-118',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrter Herr Dubois,',
        explanation:
          'Ist ein konkreter Ansprechpartner bekannt, wird er persönlich angesprochen. Die Anrede endet mit einem Komma – auch bei Auslandsbriefen.',
      },
    ],
    brieftextReferenz: [
      'hiermit bestätigen wir den Abschluss des Wartungsvertrags Nr. 2025-118 für Ihre IT-Systeme. Der Vertrag umfasst die regelmäßige Prüfung und Wartung der bei Ihnen installierten Hard- und Software gemäß den vereinbarten Konditionen.',
      'Der nächste Wartungstermin ist für den 15. Mai vorgesehen. Unser Techniker wird sich rechtzeitig vorher bei Ihnen melden, um den genauen Ablauf und die benötigten Zugänge abzustimmen.',
      'Bei Fragen zu Ihrem Wartungsvertrag stehen wir Ihnen selbstverständlich jederzeit zur Verfügung.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'IT-Dienstleistungen',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'IT-Service Neumann GmbH',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'i. A. Dr. Lisa Kern',
        explanation:
          '„i. A.“ steht direkt vor dem vollständigen gedruckten Namen (inklusive Titel): „i. A. Dr. Lisa Kern“.',
      },
    ],
  },
  {
    id: 'gaertnerei-hummel-bestellbestaetigung',
    title: 'Gärtnerei Hummel: Bestellbestätigung',
    difficulty: 'einfach',
    arbeitsauftrag:
      'Du arbeitest bei der Gärtnerei Hummel GmbH, Rosenallee 14, 33098 Paderborn. Deine Chefin Sabine Hummel bittet dich, eine Bestellbestätigung zu schreiben. Sie ist unter Tel. Durchwahl 23, Fax 24 oder vorname.nachname@gaertnerei-hummel.de erreichbar. Der Brief geht an Herrn Klaus Reimann, Amselweg 6, 33104 Paderborn, der vorgestern telefonisch 30 Rosenstöcke und zwei Hochbeete für seinen Garten bestellt hat; übernimm diese Adresse zeilengenau.\n\nBestätige die Bestellung und nenne den voraussichtlichen Liefertermin in zwei Wochen. Du heißt Jonas Vogt und schreibst im Auftrag von Sabine Hummel; „i. A.“ soll direkt vor deinem gedruckten Namen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Gärtnerei Hummel GmbH, Rosenallee 14, 33098 Paderborn',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        expected: 'Herrn',
        explanation: 'Die Anrede an männliche Empfänger lautet „Herrn“, nicht „Herr“.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        expected: 'Klaus Reimann',
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Amselweg 6',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '33104 Paderborn',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: '',
        explanation: 'Die Bestellung erfolgte telefonisch, daher liegt kein Schreiben mit Zeichen vor – „Ihr Zeichen“ bleibt leer.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '',
        explanation: 'Auch „Ihre Nachricht vom“ bleibt leer, da es sich um ein Telefonat und kein Schreiben handelte.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'sh-jv',
        explanation:
          'Der Auftraggeber (Sabine Hummel → „sh“) wird zuerst genannt, danach die Initialen des Verfassers Jonas Vogt („jv“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '23',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '24',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'sabine.hummel@gaertnerei-hummel.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen der Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Ihre Bestellung von Rosenstöcken und Hochbeeten',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrter Herr Reimann,',
        explanation:
          'Ist ein konkreter Ansprechpartner bekannt, wird er persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'vielen Dank für Ihren Anruf und Ihre Bestellung von 30 Rosenstöcken sowie zwei Hochbeeten. Wir freuen uns, dass Sie sich für unsere Pflanzen entschieden haben, und bestätigen Ihnen die Bestellung hiermit schriftlich.',
      'Die Rosenstöcke werden derzeit für Sie vorbereitet, die Hochbeete bestellen wir direkt bei unserem Zulieferer nach. Wir gehen davon aus, dass wir Ihnen alle Artikel innerhalb der nächsten zwei Wochen liefern können.',
      'Sobald der genaue Liefertermin feststeht, melden wir uns rechtzeitig telefonisch bei Ihnen, um die Anlieferung mit Ihnen abzustimmen.',
      'Für Rückfragen zu Pflege und Standort der Rosenstöcke stehen wir Ihnen selbstverständlich gerne zur Verfügung.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Gärtnerei',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Gärtnerei Hummel GmbH',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'i. A. Jonas Vogt',
        explanation: '„i. A.“ steht in diesem Brief direkt vor dem gedruckten Namen: „i. A. Jonas Vogt“.',
      },
    ],
  },
  {
    id: 'autohaus-sander-terminerinnerung',
    title: 'Autohaus Sander: Terminerinnerung',
    difficulty: 'einfach',
    arbeitsauftrag:
      'Du arbeitest beim Autohaus Sander GmbH, Werkstraße 9, 24118 Kiel. Dein Chef Heiko Sander möchte Kundinnen und Kunden an fällige Inspektionstermine erinnern. Er ist unter Tel. Durchwahl 61, Fax 62 oder vorname.nachname@autohaus-sander.de erreichbar. Der Brief geht an Frau Britta Lorenz, Kastanienweg 3, 24148 Kiel, deren Fahrzeug laut Werkstattkarte im nächsten Monat zur Inspektion fällig ist; übernimm diese Adresse zeilengenau.\n\nErinnere Frau Lorenz freundlich an den fälligen Inspektionstermin und bitte sie, sich zur Terminvereinbarung telefonisch zu melden. Du heißt Melanie Thiel und schreibst im Auftrag von Heiko Sander; „i. A.“ soll in der mittleren der drei Leerzeilen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Autohaus Sander GmbH, Werkstraße 9, 24118 Kiel',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        expected: 'Frau',
        explanation: 'Die Anrede an weibliche Empfänger lautet „Frau“, unabhängig vom Familienstand.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        expected: 'Britta Lorenz',
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Kastanienweg 3',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '24148 Kiel',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: '',
        explanation: 'Es liegt kein Schreiben der Kundin vor, auf das Bezug genommen werden könnte – „Ihr Zeichen“ bleibt leer.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '',
        explanation: 'Ohne ein Schreiben der Kundin bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'hs-mt',
        explanation:
          'Der Auftraggeber (Heiko Sander → „hs“) wird zuerst genannt, danach die Initialen der Verfasserin Melanie Thiel („mt“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Es gab noch kein eigenes vorheriges Schreiben in dieser Sache, daher bleibt das Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '61',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '62',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'heiko.sander@autohaus-sander.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen des Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Ihre fällige Inspektion',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrte Frau Lorenz,',
        explanation:
          'Ist eine konkrete Ansprechpartnerin bekannt, wird sie persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'laut unseren Unterlagen ist die nächste Inspektion für Ihr Fahrzeug im kommenden Monat fällig. Damit Sie weiterhin sicher und zuverlässig unterwegs sind, möchten wir Sie freundlich an diesen Termin erinnern.',
      'Wir bitten Sie, sich in den nächsten Tagen telefonisch bei uns zu melden, damit wir gemeinsam einen passenden Werkstatttermin vereinbaren können. Selbstverständlich richten wir uns dabei nach Ihren zeitlichen Möglichkeiten.',
      'Während der Inspektion prüfen unsere Mechaniker alle sicherheitsrelevanten Bauteile Ihres Fahrzeugs und informieren Sie über eventuell notwendige weitere Arbeiten, bevor diese durchgeführt werden.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Kraftfahrzeughandel und -werkstatt',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Autohaus Sander GmbH',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'mittlere-leerzeile',
        caption: 'Mittlere der drei Leerzeilen',
        expected: 'i. A.',
        explanation:
          '„i. A.“ kann allein in die mittlere der drei Leerzeilen geschrieben werden – dann bleibt der Name ohne Zusatz.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'Melanie Thiel',
        explanation: 'Steht „i. A.“ bereits in der mittleren Leerzeile, wird der Name ohne weiteren Zusatz gedruckt.',
      },
    ],
  },
  {
    id: 'weinkellerei-vogt-einladung',
    title: 'Weinkellerei Vogt: Einladung zur Weinprobe',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Du arbeitest bei der Weinkellerei Vogt e. K., Winzergasse 5, 55276 Oppenheim. Deine Chefin Renate Vogt möchte anlässlich des 25-jährigen Bestehens des Betriebs zu einer Weinprobe einladen. Sie ist unter Tel. Durchwahl 18, Fax 19 oder vorname.nachname@weinkellerei-vogt.de erreichbar. Eingeladen werden soll Herr Apotheker Dr. Wolfgang Riemer, Hauptstraße 22, 55411 Bingen am Rhein, ein langjähriger Stammkunde des Betriebs; übernimm diese Adresse zeilengenau.\n\nLade Herrn Dr. Riemer herzlich zur Jubiläumsweinprobe am 14. November um 18 Uhr ein und bitte um eine kurze Rückmeldung, ob er teilnehmen kann. Du heißt Tobias Krämer und schreibst im Auftrag von Renate Vogt; „i. A.“ soll direkt vor deinem gedruckten Namen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Weinkellerei Vogt e. K., Winzergasse 5, 55276 Oppenheim',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-anrede',
        caption: 'Zeile 6 – Anrede Berufsbezeichnung',
        zone: 'anschrift',
        expected: 'Herrn Apotheker',
        explanation: 'Berufs- bzw. Amtsbezeichnungen stehen in derselben Zeile hinter der Anrede.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Titel Vorname Nachname',
        zone: 'anschrift',
        expected: 'Dr. Wolfgang Riemer',
        explanation: 'Titel stehen mit Leerzeichen vor dem Vornamen, die Anrede aus Zeile 6 wird nicht wiederholt.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Hauptstraße 22',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '55411 Bingen am Rhein',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: '',
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt „Ihr Zeichen“ leer.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '',
        explanation: 'Ohne Bezug auf ein Schreiben des Geschäftspartners bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'rv-tk',
        explanation:
          'Die Auftraggeberin (Renate Vogt → „rv“) wird zuerst genannt, danach die Initialen des Verfassers Tobias Krämer („tk“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '18',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '19',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'renate.vogt@weinkellerei-vogt.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen der Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Einladung zur Jubiläumsweinprobe',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrter Herr Dr. Riemer,',
        explanation:
          'Bei einem akademischen Titel wird dieser in der Anrede zwischen der Anredeform und dem Nachnamen genannt. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'in diesem Jahr feiert unsere Weinkellerei ihr 25-jähriges Bestehen, und das möchten wir gerne gemeinsam mit unseren langjährigen Kundinnen und Kunden begehen. Da Sie unserem Haus seit vielen Jahren die Treue halten, möchten wir Sie herzlich zu unserer Jubiläumsweinprobe einladen.',
      'Die Weinprobe findet am 14. November um 18 Uhr in unseren historischen Gewölbekellern statt. Neben ausgewählten Weinen aus 25 Jahrgängen erwartet Sie ein kleines kulinarisches Rahmenprogramm sowie ein Rückblick auf die Geschichte unseres Betriebs.',
      'Wir würden uns sehr freuen, Sie an diesem besonderen Abend begrüßen zu dürfen. Bitte teilen Sie uns bis zum 1. November kurz mit, ob wir mit Ihrer Teilnahme rechnen dürfen.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Weinbau',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Weinkellerei Vogt e. K.',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'i. A. Tobias Krämer',
        explanation: '„i. A.“ steht in diesem Brief direkt vor dem gedruckten Namen: „i. A. Tobias Krämer“.',
      },
    ],
  },
  {
    id: 'baumarkt-fenner-reklamation',
    title: 'Baumarkt Fenner: Antwort auf Reklamation',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Du arbeitest beim Baumarkt Fenner GmbH, Gewerbering 12, 90475 Nürnberg. Dein Chef Rüdiger Fenner beantwortet eine Reklamation, die die Kundin am 09.03.2025 unter dem Zeichen sb-privat eingereicht hat. Er ist unter Tel. Durchwahl 33, Fax 34 oder vorname.nachname@baumarkt-fenner.de erreichbar. Der Brief geht an Frau Sonja Bruckner, Talstraße 41, 90427 Nürnberg, die sich über eine beschädigt gelieferte Gartenhütte beschwert hat; übernimm diese Adresse zeilengenau.\n\nEntschuldige dich für die Unannehmlichkeiten und kündige den kostenlosen Austausch der beschädigten Bauteile innerhalb der nächsten zehn Tage an. Du heißt Katrin Ohlsen und schreibst im Auftrag von Rüdiger Fenner; „i. A.“ soll in der mittleren der drei Leerzeilen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Baumarkt Fenner GmbH, Gewerbering 12, 90475 Nürnberg',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        expected: 'Frau',
        explanation: 'Die Anrede an weibliche Empfänger lautet „Frau“.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        expected: 'Sonja Bruckner',
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Talstraße 41',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '90427 Nürnberg',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: 'sb-privat',
        explanation: '„Ihr Zeichen“ wird aus dem Schreiben der Kundin übernommen, auf das dieser Brief antwortet.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '09.03.2025',
        explanation: 'Hier steht das Datum des Schreibens der Kundin, auf das dieser Brief antwortet.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'rf-ko',
        explanation:
          'Der Auftraggeber (Rüdiger Fenner → „rf“) wird zuerst genannt, danach die Initialen der Verfasserin Katrin Ohlsen („ko“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Es gab noch kein eigenes vorheriges Schreiben in dieser Sache, daher bleibt das Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '33',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '34',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'ruediger.fenner@baumarkt-fenner.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen des Vorgesetzten (klein geschrieben) eingesetzt werden, „ü“ wird dabei nicht zu „ue“ umgeschrieben.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Ihre Reklamation vom 09.03.2025',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrte Frau Bruckner,',
        explanation:
          'Ist eine konkrete Ansprechpartnerin bekannt, wird sie persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'vielen Dank für Ihre Rückmeldung vom 09.03.2025, in der Sie uns über die beschädigt bei Ihnen angekommene Gartenhütte informiert haben. Es tut uns sehr leid, dass Sie diese Unannehmlichkeiten hatten, und wir bedanken uns für Ihre Geduld.',
      'Wir haben den Sachverhalt umgehend mit unserem Lager und dem zuständigen Spediteur geklärt. Die beschädigten Bauteile werden Ihnen selbstverständlich kostenlos innerhalb der nächsten zehn Tage ersetzt.',
      'Ein Mitarbeiter unseres Kundendienstes wird sich in den kommenden Tagen telefonisch bei Ihnen melden, um einen passenden Liefertermin für die Ersatzteile zu vereinbaren.',
      'Für die entstandenen Umstände möchten wir uns nochmals ausdrücklich entschuldigen und hoffen, dass wir Sie auch künftig als zufriedene Kundin begrüßen dürfen.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Baumarkt',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Baumarkt Fenner GmbH',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'mittlere-leerzeile',
        caption: 'Mittlere der drei Leerzeilen',
        expected: 'i. A.',
        explanation:
          '„i. A.“ kann allein in die mittlere der drei Leerzeilen geschrieben werden – dann bleibt der Name ohne Zusatz.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'Katrin Ohlsen',
        explanation: 'Steht „i. A.“ bereits in der mittleren Leerzeile, wird der Name ohne weiteren Zusatz gedruckt.',
      },
    ],
  },
  {
    id: 'sprachschule-lingua-anfrage-distraktor',
    title: 'Sprachschule Lingua: Anfrage mit Verweis',
    difficulty: 'schwer',
    arbeitsauftrag:
      'Du arbeitest bei der Sprachschule Lingua GmbH, Kolpingstraße 6, 50667 Köln. Deine Chefin Yvonne Matthes möchte eine Anfrage zu Firmenkursen verschicken. Sie ist unter Tel. Durchwahl 91, Fax 92 oder vorname.nachname@lingua-koeln.de erreichbar. Vor einigen Tagen rief Frau Petra Ostermann von der Firma Baumgart Consulting an und berichtete, dass ihre Kollegin Frau Susanne Vetter bei der Klinghammer Maschinenbau GmbH, Industriestraße 18, 51063 Köln, für die Personalentwicklung zuständig sei und sich für Englischkurse für die Belegschaft interessiere; Frau Ostermann selbst arbeitet nicht bei der Klinghammer Maschinenbau GmbH und ist nicht Adressatin des Briefes. Frau Matthes bittet dich, direkt an Frau Vetter zu schreiben; übernimm die genannte Adresse zeilengenau.\n\nStelle das Kursangebot für Firmenkunden kurz vor und biete ein unverbindliches Beratungsgespräch an. Du heißt Fabian Roth und schreibst im Auftrag von Yvonne Matthes; „i. A.“ soll direkt vor deinem gedruckten Namen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Sprachschule Lingua GmbH, Kolpingstraße 6, 50667 Köln',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        expected: 'Klinghammer Maschinenbau GmbH',
        explanation:
          'Adressatin ist Frau Vetter bei der Klinghammer Maschinenbau GmbH – Frau Ostermann von der Baumgart Consulting hat den Kontakt lediglich vermittelt und gehört nicht in die Anschrift.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Anrede Name',
        zone: 'anschrift',
        expected: 'Frau Susanne Vetter',
        explanation: 'Bei einem Unternehmen mit Ansprechpartnerin stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Industriestraße 18',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '51063 Köln',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: '',
        explanation: 'Der Kontakt kam telefonisch über eine Vermittlerin zustande, ein eigenes Schreiben von Frau Vetter liegt nicht vor – „Ihr Zeichen“ bleibt leer.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '',
        explanation: 'Ohne ein Schreiben von Frau Vetter bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'ym-fr',
        explanation:
          'Die Auftraggeberin (Yvonne Matthes → „ym“) wird zuerst genannt, danach die Initialen des Verfassers Fabian Roth („fr“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '91',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '92',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'yvonne.matthes@lingua-koeln.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen der Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Englischkurse für Ihr Unternehmen',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrte Frau Vetter,',
        explanation:
          'Ist eine konkrete Ansprechpartnerin bekannt, wird sie persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'über Frau Ostermann von der Baumgart Consulting haben wir erfahren, dass Sie bei der Klinghammer Maschinenbau GmbH für die Personalentwicklung zuständig sind und sich für Englischkurse für Ihre Belegschaft interessieren. Gerne stellen wir Ihnen unser Angebot für Firmenkunden vor.',
      'Unsere Sprachschule bietet praxisnahe Englischkurse für unterschiedliche Sprachniveaus an, die wir flexibel an Ihre betrieblichen Abläufe anpassen können. Die Kurse finden entweder bei uns vor Ort oder direkt in Ihrem Unternehmen statt.',
      'Um herauszufinden, welches Format am besten zu Ihrem Team passt, laden wir Sie herzlich zu einem unverbindlichen Beratungsgespräch ein. Darin besprechen wir gemeinsam den Bedarf und einen möglichen Zeitplan.',
      'Wir freuen uns, wenn Sie sich für einen Termin bei uns melden, und stehen Ihnen für Rückfragen jederzeit zur Verfügung.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Sprachschule',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Sprachschule Lingua GmbH',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'i. A. Fabian Roth',
        explanation: '„i. A.“ steht in diesem Brief direkt vor dem gedruckten Namen: „i. A. Fabian Roth“.',
      },
    ],
  },
  {
    id: 'druckerei-lambert-angebot',
    title: 'Druckerei Lambert: Angebotsschreiben',
    difficulty: 'mittel',
    arbeitsauftrag:
      'Du arbeitest bei der Druckerei Lambert GmbH, Papiergasse 3, 04109 Leipzig. Dein Chef Bernd Lambert bezieht sich auf eine Anfrage der Kundin vom 12.02.2025 mit dem Zeichen ck-anfrage. Er ist unter Tel. Durchwahl 27, Fax 28 oder vorname.nachname@druckerei-lambert.de erreichbar. Der Brief geht an Frau Claudia König, Inhaberin der Boutique König, Marktstraße 9, 04155 Leipzig, die 2.000 Flyer für eine Modenschau drucken lassen möchte; übernimm diese Adresse zeilengenau.\n\nUnterbreite ein konkretes Angebot mit Preis und Liefertermin (spätestens eine Woche vor der Modenschau) und weise auf einen Mengenrabatt bei größeren Auflagen hin. Du heißt Nadine Ferber und schreibst im Auftrag von Bernd Lambert; „i. A.“ soll in der mittleren der drei Leerzeilen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Druckerei Lambert GmbH, Papiergasse 3, 04109 Leipzig',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        expected: 'Boutique König',
        explanation: 'Die Firmenbezeichnung steht über dem Empfängernamen.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Anrede Name',
        zone: 'anschrift',
        expected: 'Frau Claudia König',
        explanation: 'Bei einem Unternehmen mit Ansprechpartnerin stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Marktstraße 9',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '04155 Leipzig',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: 'ck-anfrage',
        explanation: '„Ihr Zeichen“ wird aus der Anfrage der Kundin übernommen, auf die dieser Brief antwortet.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '12.02.2025',
        explanation: 'Hier steht das Datum der Anfrage der Kundin, auf die dieser Brief antwortet.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'bl-nf',
        explanation:
          'Der Auftraggeber (Bernd Lambert → „bl“) wird zuerst genannt, danach die Initialen der Verfasserin Nadine Ferber („nf“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Es gab noch kein eigenes vorheriges Schreiben in dieser Sache, daher bleibt das Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '27',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '28',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'bernd.lambert@druckerei-lambert.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen des Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Ihre Anfrage vom 12.02.2025',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrte Frau König,',
        explanation:
          'Ist eine konkrete Ansprechpartnerin bekannt, wird sie persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'vielen Dank für Ihre Anfrage vom 12.02.2025, in der Sie sich für den Druck von 2.000 Flyern für Ihre bevorstehende Modenschau interessieren. Gerne unterbreiten wir Ihnen hierzu unser Angebot.',
      'Für die gewünschte Auflage von 2.000 Flyern im Format DIN A5, beidseitig farbig bedruckt, berechnen wir einen Preis von 340 Euro netto. Bei einer größeren Auflage ab 3.000 Stück gewähren wir Ihnen einen Mengenrabatt von zehn Prozent.',
      'Da Sie die Flyer für Ihre Modenschau benötigen, liefern wir spätestens eine Woche vor dem Termin an Ihre Boutique. Bitte teilen Sie uns bis zum Ende dieser Woche mit, ob wir mit dem Druckauftrag beginnen dürfen.',
      'Für Fragen zu Papierqualität oder Gestaltung stehen wir Ihnen jederzeit gerne zur Verfügung.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Druckerei',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Druckerei Lambert GmbH',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'mittlere-leerzeile',
        caption: 'Mittlere der drei Leerzeilen',
        expected: 'i. A.',
        explanation:
          '„i. A.“ kann allein in die mittlere der drei Leerzeilen geschrieben werden – dann bleibt der Name ohne Zusatz.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'Nadine Ferber',
        explanation: 'Steht „i. A.“ bereits in der mittleren Leerzeile, wird der Name ohne weiteren Zusatz gedruckt.',
      },
    ],
  },
  {
    id: 'fahrradwerk-hoppe-ausland-oesterreich',
    title: 'Fahrradwerk Hoppe: Brief nach Österreich',
    difficulty: 'schwer',
    arbeitsauftrag:
      'Du arbeitest beim Fahrradwerk Hoppe GmbH, Speichenweg 7, 48155 Münster. Deine Chefin Dr. Andrea Hoppe bestätigt den Eingang einer Bestellung, die der Händler am 04.03.2025 unter dem Zeichen bs-order aufgegeben hat. Sie ist unter Tel. Durchwahl 71, Fax 72 oder vorname.nachname@fahrradwerk-hoppe.de erreichbar. Der Brief geht an die Zweirad Steinbach GmbH, Herrn Bernhard Steinbach, Mariahilfer Straße 88, 1070 Wien, ÖSTERREICH, der 40 Fahrräder aus der neuen Trekking-Serie bestellt hat; übernimm diese Adresse zeilengenau.\n\nBestätige die Bestellung, nenne den Liefertermin (Ende April) und weise auf eine kostenlose Ersatzteil-Erstausstattung hin. Du heißt Dr. Philipp Sander und schreibst im Auftrag von Dr. Andrea Hoppe; „i. A.“ soll direkt vor deinem gedruckten Namen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Fahrradwerk Hoppe GmbH, Speichenweg 7, 48155 Münster',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-firma',
        caption: 'Zeile 6 – Firma',
        zone: 'anschrift',
        expected: 'Zweirad Steinbach GmbH',
        explanation: 'Die Firmenbezeichnung steht über dem Empfängernamen.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Anrede Name',
        zone: 'anschrift',
        expected: 'Herrn Bernhard Steinbach',
        explanation: 'Bei einem Unternehmen mit Ansprechpartner stehen Anrede und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Mariahilfer Straße 88',
        explanation:
          'Österreich behält wie Deutschland die Reihenfolge Straße vor Hausnummer bei; das unterscheidet sich von Ländern wie Frankreich.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Bestimmungsort',
        zone: 'anschrift',
        expected: '1070 WIEN',
        explanation: 'Der Bestimmungsort wird bei Auslandssendungen in GROSSBUCHSTABEN geschrieben.',
      },
      {
        type: 'text',
        id: 'af-land',
        caption: 'Zeile 10 – Bestimmungsland',
        zone: 'anschrift',
        expected: 'ÖSTERREICH',
        explanation: 'Das Bestimmungsland wird bei Auslandssendungen ebenfalls in GROSSBUCHSTABEN geschrieben.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: 'bs-order',
        explanation: '„Ihr Zeichen“ wird aus der Bestellung des Händlers übernommen, auf die dieser Brief antwortet.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '04.03.2025',
        explanation: 'Hier steht das Datum der Bestellung des Händlers, auf die dieser Brief antwortet.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'ah-ps',
        explanation:
          'Die Auftraggeberin (Dr. Andrea Hoppe → „ah“, der Titel zählt nicht mit) wird zuerst genannt, danach die Initialen von Dr. Philipp Sander („ps“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Es gab noch kein eigenes vorheriges Schreiben in dieser Sache, daher bleibt das Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '71',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '72',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'andrea.hoppe@fahrradwerk-hoppe.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – eingesetzt werden die tatsächlichen Vor- und Nachnamen (klein geschrieben), der Titel gehört nicht in die E-Mail-Adresse.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Ihre Bestellung vom 04.03.2025',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrter Herr Steinbach,',
        explanation:
          'Ist ein konkreter Ansprechpartner bekannt, wird er persönlich angesprochen. Die Anrede endet mit einem Komma – auch bei Auslandsbriefen.',
      },
    ],
    brieftextReferenz: [
      'vielen Dank für Ihre Bestellung vom 04.03.2025 über 40 Fahrräder aus unserer neuen Trekking-Serie. Wir freuen uns, dass Sie sich für dieses Modell entschieden haben, und bestätigen Ihnen die Bestellung hiermit gerne.',
      'Die Fahrräder befinden sich derzeit in der Endmontage. Wir gehen davon aus, dass wir Ihnen die komplette Lieferung Ende April zusenden können. Sobald der genaue Versandtermin feststeht, informieren wir Sie rechtzeitig.',
      'Zu jeder Lieferung dieser Serie gehört bei uns eine kostenlose Ersatzteil-Erstausstattung, die wir der Sendung ohne Aufpreis beilegen. Damit können Sie Ihren Kundinnen und Kunden von Beginn an einen zuverlässigen Service bieten.',
      'Für Rückfragen zur Lieferung oder zu weiteren Modellen unseres Sortiments stehen wir Ihnen selbstverständlich jederzeit zur Verfügung.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Fahrradherstellung',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Fahrradwerk Hoppe GmbH',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'i. A. Dr. Philipp Sander',
        explanation:
          '„i. A.“ steht direkt vor dem vollständigen gedruckten Namen (inklusive Titel): „i. A. Dr. Philipp Sander“.',
      },
    ],
  },
  {
    id: 'feinkost-berger-schweiz-anfrage',
    title: 'Feinkost Berger: Anfrage aus der Schweiz beantworten',
    difficulty: 'schwer',
    arbeitsauftrag:
      'Du arbeitest bei Feinkost Berger GmbH, Marktgasse 14, 79098 Freiburg. Dein Chef Alexander Berger antwortet auf eine Anfrage der Kundin vom 21.02.2025 mit dem Zeichen ns-zh. Er ist unter Tel. Durchwahl 15, Fax 16 oder vorname.nachname@feinkost-berger.de erreichbar. Der Brief geht an Frau Nicole Steiner, Bahnhofstrasse 22, 8001 Zürich, SCHWEIZ, die sich für ein Sortiment badischer Spezialitäten für ihr Feinkostgeschäft interessiert; übernimm diese Adresse zeilengenau.\n\nStelle das passende Probesortiment vor, nenne die Lieferzeit (ca. eine Woche) und weise darauf hin, dass Zollformalitäten von eurem Haus übernommen werden. Du heißt Verena Brandt und schreibst im Auftrag von Alexander Berger; „i. A.“ soll in der mittleren der drei Leerzeilen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Feinkost Berger GmbH, Marktgasse 14, 79098 Freiburg',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        expected: 'Frau',
        explanation: 'Die Anrede an weibliche Empfänger lautet „Frau“ – auch bei Auslandsbriefen.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        expected: 'Nicole Steiner',
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Bahnhofstrasse 22',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Bestimmungsort',
        zone: 'anschrift',
        expected: '8001 ZÜRICH',
        explanation: 'Der Bestimmungsort wird bei Auslandssendungen in GROSSBUCHSTABEN geschrieben.',
      },
      {
        type: 'text',
        id: 'af-land',
        caption: 'Zeile 10 – Bestimmungsland',
        zone: 'anschrift',
        expected: 'SCHWEIZ',
        explanation: 'Das Bestimmungsland wird bei Auslandssendungen ebenfalls in GROSSBUCHSTABEN geschrieben.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: 'ns-zh',
        explanation: '„Ihr Zeichen“ wird aus der Anfrage der Kundin übernommen, auf die dieser Brief antwortet.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '21.02.2025',
        explanation: 'Hier steht das Datum der Anfrage der Kundin, auf die dieser Brief antwortet.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'ab-vb',
        explanation:
          'Der Auftraggeber (Alexander Berger → „ab“) wird zuerst genannt, danach die Initialen der Verfasserin Verena Brandt („vb“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Es gab noch kein eigenes vorheriges Schreiben in dieser Sache, daher bleibt das Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '15',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '16',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'alexander.berger@feinkost-berger.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen des Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Ihre Anfrage vom 21.02.2025',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrte Frau Steiner,',
        explanation:
          'Ist eine konkrete Ansprechpartnerin bekannt, wird sie persönlich angesprochen. Die Anrede endet mit einem Komma – auch bei Auslandsbriefen.',
      },
    ],
    brieftextReferenz: [
      'vielen Dank für Ihre Anfrage vom 21.02.2025, in der Sie sich für ein Sortiment badischer Spezialitäten für Ihr Feinkostgeschäft interessieren. Wir freuen uns über Ihr Interesse an unseren Produkten.',
      'Für den Einstieg empfehlen wir Ihnen unser Probesortiment mit ausgewählten Marmeladen, Senfsorten und Schwarzwälder Spezialitäten, das bei unseren Kundinnen und Kunden in der Schweiz besonders beliebt ist.',
      'Die Lieferung erfolgt in der Regel innerhalb einer Woche nach Bestelleingang. Sämtliche Zollformalitäten für den Versand in die Schweiz übernehmen wir für Sie, sodass für Sie keine zusätzlichen Umstände entstehen.',
      'Gerne senden wir Ihnen auf Wunsch weitere Informationen zu unserem gesamten Sortiment zu. Bei Fragen stehen wir Ihnen selbstverständlich jederzeit zur Verfügung.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Feinkosthandel',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Feinkost Berger GmbH',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'mittlere-leerzeile',
        caption: 'Mittlere der drei Leerzeilen',
        expected: 'i. A.',
        explanation:
          '„i. A.“ kann allein in die mittlere der drei Leerzeilen geschrieben werden – dann bleibt der Name ohne Zusatz.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'Verena Brandt',
        explanation: 'Steht „i. A.“ bereits in der mittleren Leerzeile, wird der Name ohne weiteren Zusatz gedruckt.',
      },
    ],
  },
  {
    id: 'immobilien-wester-terminvereinbarung',
    title: 'Immobilien Wester: Terminvereinbarung',
    difficulty: 'einfach',
    arbeitsauftrag:
      'Du arbeitest bei der Immobilien Wester GmbH, Schlossallee 2, 30159 Hannover. Deine Chefin Beate Wester möchte einen Besichtigungstermin für eine Eigentumswohnung vereinbaren. Sie ist unter Tel. Durchwahl 40, Fax 41 oder vorname.nachname@immobilien-wester.de erreichbar. Der Brief geht an Herrn Uwe Falkner, Bergstraße 17, 30161 Hannover, der sich vor drei Tagen für die Wohnung in der Gartenstraße 5 interessiert gezeigt hat; übernimm diese Adresse zeilengenau.\n\nSchlage Herrn Falkner einen Besichtigungstermin am kommenden Samstag um 11 Uhr vor und bitte um kurze Bestätigung oder einen Alternativvorschlag. Du heißt Sven Krüger und schreibst im Auftrag von Beate Wester; „i. A.“ soll direkt vor deinem gedruckten Namen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Immobilien Wester GmbH, Schlossallee 2, 30159 Hannover',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-anrede',
        caption: 'Zeile 6 – Anrede',
        zone: 'anschrift',
        expected: 'Herrn',
        explanation: 'Die Anrede an männliche Empfänger lautet „Herrn“, nicht „Herr“.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Vorname Nachname',
        zone: 'anschrift',
        expected: 'Uwe Falkner',
        explanation: 'Vor- und Nachname stehen in einer eigenen Zeile, ohne Wiederholung der Anrede.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Bergstraße 17',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '30161 Hannover',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: '',
        explanation: 'Das Interesse wurde persönlich geäußert, es liegt kein Schreiben vor – „Ihr Zeichen“ bleibt leer.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '',
        explanation: 'Ohne ein Schreiben von Herrn Falkner bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'bw-sk',
        explanation:
          'Die Auftraggeberin (Beate Wester → „bw“) wird zuerst genannt, danach die Initialen des Verfassers Sven Krüger („sk“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Es gab noch kein eigenes vorheriges Schreiben in dieser Sache, daher bleibt das Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '40',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '41',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'beate.wester@immobilien-wester.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen der Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Besichtigungstermin Gartenstraße 5',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrter Herr Falkner,',
        explanation:
          'Ist ein konkreter Ansprechpartner bekannt, wird er persönlich angesprochen. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'vielen Dank für Ihr Interesse an der Eigentumswohnung in der Gartenstraße 5, das Sie uns vor einigen Tagen mitgeteilt haben. Gerne möchten wir Ihnen die Wohnung im Rahmen einer Besichtigung persönlich vorstellen.',
      'Wir schlagen Ihnen dafür den kommenden Samstag um 11 Uhr vor. Bei diesem Termin können Sie sich in Ruhe einen Eindruck von der Wohnung, dem Zuschnitt der Räume sowie der Lage verschaffen.',
      'Sollte Ihnen dieser Termin nicht passen, teilen Sie uns bitte gerne einen alternativen Wunschtermin mit, und wir bemühen uns, diesen kurzfristig einzurichten.',
      'Wir freuen uns auf Ihre Rückmeldung und stehen für weitere Fragen zur Wohnung selbstverständlich jederzeit zur Verfügung.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Immobilienvermittlung',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Immobilien Wester GmbH',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'i. A. Sven Krüger',
        explanation: '„i. A.“ steht in diesem Brief direkt vor dem gedruckten Namen: „i. A. Sven Krüger“.',
      },
    ],
  },
  {
    id: 'musikhaus-cordes-jubilaeum-distraktor',
    title: 'Musikhaus Cordes: Einladung mit Hinweisgeber',
    difficulty: 'schwer',
    arbeitsauftrag:
      'Du arbeitest im Musikhaus Cordes e. K., Notenweg 3, 28195 Bremen. Dein Chef Matthias Cordes plant eine Einladung zum 40-jährigen Firmenjubiläum. Er ist unter Tel. Durchwahl 66, Fax 67 oder vorname.nachname@musikhaus-cordes.de erreichbar. Beim letzten Musiklehrertreffen erzählte Herr Jan Petersen, ein befreundeter Instrumentenbauer, dass Frau Prof. Dr. Helene Ahrens von der Musikhochschule Bremen, Dechanatstraße 13, 28195 Bremen, das Musikhaus seit Jahrzehnten für ihre Unterrichtsinstrumente nutzt; Herr Petersen selbst gehört nicht zur Musikhochschule und ist nicht Adressat des Briefes. Dein Chef bittet dich, direkt an Frau Prof. Dr. Ahrens zu schreiben; übernimm die genannte Adresse zeilengenau.\n\nLade Frau Prof. Dr. Ahrens herzlich zur Jubiläumsfeier am 6. Juni um 17 Uhr ein und kündige eine kleine Instrumentenausstellung an. Du heißt Lea Bertram und schreibst im Auftrag von Matthias Cordes; „i. A.“ soll direkt vor deinem gedruckten Namen stehen. Tippe außerdem den vorgegebenen Brieftext vollständig selbst ab.',
    senderLine: 'Musikhaus Cordes e. K., Notenweg 3, 28195 Bremen',
    anschriftenfeld: [
      {
        type: 'text',
        id: 'af-firma',
        caption: 'Zeile 6 – Institution',
        zone: 'anschrift',
        expected: 'Musikhochschule Bremen',
        explanation:
          'Adressatin ist Frau Prof. Dr. Ahrens an der Musikhochschule Bremen – Herr Petersen hat den Hinweis lediglich beim Musiklehrertreffen gegeben und gehört nicht in die Anschrift.',
      },
      {
        type: 'text',
        id: 'af-name',
        caption: 'Zeile 7 – Anrede Titel Vorname Nachname',
        zone: 'anschrift',
        expected: 'Frau Prof. Dr. Helene Ahrens',
        explanation:
          'Bei einer Institution mit Ansprechpartnerin stehen Anrede, alle Titel (in ihrer Reihenfolge) und Name in einer gemeinsamen Zeile.',
      },
      {
        type: 'text',
        id: 'af-strasse',
        caption: 'Zeile 8 – Straße Hausnummer',
        zone: 'anschrift',
        expected: 'Dechanatstraße 13',
        explanation: 'Straße und Hausnummer stehen ohne Komma, die Hausnummer folgt der Straße.',
      },
      {
        type: 'text',
        id: 'af-ort',
        caption: 'Zeile 9 – PLZ Ort',
        zone: 'anschrift',
        expected: '28195 Bremen',
        explanation: 'Die Postleitzahl steht immer vor dem Ort, ohne Komma dazwischen.',
      },
    ],
    infoblock: [
      {
        type: 'text',
        id: 'ihr-zeichen',
        caption: 'Ihr Zeichen',
        expected: '',
        explanation: 'Der Hinweis kam über einen Bekannten beim Musiklehrertreffen, ein Schreiben von Frau Prof. Dr. Ahrens liegt nicht vor – „Ihr Zeichen“ bleibt leer.',
      },
      {
        type: 'text',
        id: 'ihre-nachricht-vom',
        caption: 'Ihre Nachricht vom',
        expected: '',
        explanation: 'Ohne ein Schreiben von Frau Prof. Dr. Ahrens bleibt auch „Ihre Nachricht vom“ leer.',
      },
      {
        type: 'text',
        id: 'unser-zeichen',
        caption: 'Unser Zeichen',
        expected: 'mc-lb',
        explanation:
          'Der Auftraggeber (Matthias Cordes → „mc“) wird zuerst genannt, danach die Initialen der Verfasserin Lea Bertram („lb“).',
      },
      {
        type: 'text',
        id: 'unsere-nachricht-vom',
        caption: 'Unsere Nachricht vom',
        expected: '',
        explanation: 'Ohne ein eigenes vorheriges Schreiben, auf das Bezug genommen wird, bleibt dieses Feld leer.',
      },
      {
        type: 'text',
        id: 'telefon',
        caption: 'Telefon',
        expected: '66',
        explanation: 'Beim Telefon wird nur die Durchwahlnummer selbst eingetragen, ohne das Wort „Durchwahl“ davor.',
      },
      {
        type: 'text',
        id: 'fax',
        caption: 'Fax',
        expected: '67',
        explanation: 'Vorgegebene Kontaktdaten werden unverändert aus dem Arbeitsauftrag übernommen.',
      },
      {
        type: 'text',
        id: 'email',
        caption: 'E-Mail',
        expected: 'matthias.cordes@musikhaus-cordes.de',
        explanation:
          '„vorname.nachname“ ist nur ein Platzhalter – hier müssen die tatsächlichen Vor- und Nachnamen des Vorgesetzten (klein geschrieben) eingesetzt werden.',
      },
    ],
    betreff: [
      {
        type: 'text',
        id: 'betreff',
        caption: 'Betreff',
        expected: 'Einladung zu unserem 40-jährigen Firmenjubiläum',
        explanation:
          'Der Betreff fasst das Thema kurz zusammen und steht ohne das Wort „Betreff:“ davor sowie ohne durchgehende Großschreibung.',
      },
    ],
    anrede: [
      {
        type: 'text',
        id: 'anrede',
        caption: 'Anrede',
        expected: 'Sehr geehrte Frau Professorin Ahrens,',
        explanation:
          'Bei einer Professorin wird die akademische Amtsbezeichnung in der Anrede ausgeschrieben genannt. Die Anrede endet mit einem Komma.',
      },
    ],
    brieftextReferenz: [
      'in diesem Jahr feiert unser Musikhaus sein 40-jähriges Bestehen. Über Herrn Petersen haben wir erfahren, dass Sie mit der Musikhochschule Bremen seit vielen Jahren zu unseren geschätzten Partnern zählen, und möchten Sie daher herzlich zu unserer Jubiläumsfeier einladen.',
      'Die Feier findet am 6. Juni um 17 Uhr in unseren Geschäftsräumen statt. Neben einem kleinen Rückblick auf die Geschichte unseres Hauses erwartet Sie eine Ausstellung besonderer Instrumente aus unserer Werkstatt.',
      'Wir würden uns sehr freuen, Sie und gegebenenfalls weitere Kolleginnen und Kollegen der Musikhochschule an diesem Abend begrüßen zu dürfen.',
      'Bitte teilen Sie uns bis Ende Mai mit, ob wir mit Ihrer Teilnahme rechnen dürfen.',
    ],
    grussformel: [
      {
        type: 'text',
        id: 'gruss',
        caption: 'Grußformel',
        expected: 'Freundliche Grüße',
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'text',
        id: 'branche',
        caption: 'Branche (nach einer Leerzeile)',
        expected: 'Musikalienhandel',
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'text',
        id: 'firma',
        caption: 'Firmenname',
        expected: 'Musikhaus Cordes e. K.',
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'text',
        id: 'name-gruss',
        caption: 'Gedruckter Name (nach drei Leerzeilen)',
        expected: 'i. A. Lea Bertram',
        explanation: '„i. A.“ steht in diesem Brief direkt vor dem gedruckten Namen: „i. A. Lea Bertram“.',
      },
    ],
  },
];

export function getVollstaendigerBriefTaskById(id: string) {
  return VOLLSTAENDIGER_BRIEF_TASKS.find((task) => task.id === id);
}
