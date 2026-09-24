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
];

export function getVollstaendigerBriefTaskById(id: string) {
  return VOLLSTAENDIGER_BRIEF_TASKS.find((task) => task.id === id);
}
