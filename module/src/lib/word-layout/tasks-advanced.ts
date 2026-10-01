import { NamedStyleType } from '@univerjs/core';
import { byText, cells, check, docCheck, H, isBulletList, isNumberedList, longParagraph, PALETTE_COLUMN, sectionOf } from './checks';
import {
  colorFamily,
  colorIs,
  columnBreakBefore,
  containsDate,
  containsNameAndClass,
  fontOf,
  highlightOf,
  isBold,
  isCentered,
  isDarkColor,
  isItalic,
  isJustified,
  isSuperscript,
  isUnderlined,
  lineSpacingIs,
  near,
  rgbOf,
  sizeOf,
  styleAt,
  type LayoutDocument,
  type LayoutParagraph,
} from './grading';
import { cmToPx } from './doc';
import type { LayoutCheck, LayoutMargins, LayoutTask } from './types';

// ---------- gemeinsame Bausteine ----------

/** Umrechnung für die Aufgabentexte: Der Editor arbeitet in Pixeln. */
const px = (cm: number) => `${(Math.round(cmToPx(cm) * 10) / 10).toLocaleString('de-DE')} px`;
const ptPx = (pt: number) => Math.round((pt * 4) / 3);

const HINT_MARGINS = `${H.page}. Haben einzelne Abschnitte eigene Ränder, dort unter „▥ Abschnitt & Spalten“ angleichen. 1 cm ≈ 37,8 px`;

function marginChecks(target: LayoutMargins): LayoutCheck[] {
  const ok = (d: LayoutDocument, side: keyof LayoutMargins) =>
    d.sections.length > 0 && d.sections.every((s) => near(s.margins[side], cmToPx(target[side])));
  return [
    docCheck(`Seitenrand oben ${String(target.top).replace('.', ',')} cm und unten ${String(target.bottom).replace('.', ',')} cm`, HINT_MARGINS, (d) => ok(d, 'top') && ok(d, 'bottom')),
    docCheck(`Seitenrand links ${String(target.left).replace('.', ',')} cm und rechts ${String(target.right).replace('.', ',')} cm`, HINT_MARGINS, (d) => ok(d, 'left') && ok(d, 'right')),
  ];
}

/** Text der Kopf- bzw. Fußzeile ohne eventuellen Fußnotentext. */
function nameLineChecks(where: 'header' | 'footer', strip?: RegExp): LayoutCheck[] {
  const label = where === 'header' ? 'Kopfzeile' : 'Fußzeile';
  const hint = where === 'header' ? H.header : H.footer;
  const text = (d: LayoutDocument) => {
    const raw = where === 'header' ? d.headerText : d.footerText;
    return strip ? raw.replace(strip, ' ') : raw;
  };
  return [
    docCheck(`${label}: Vorname, Nachname und Klasse`, hint, (d) => containsNameAndClass(text(d))),
    docCheck(`${label}: Datum im Format TT.MM.JJ`, `${hint} – z. B. 01.10.26`, (d) => containsDate(text(d))),
  ];
}

/** Alle Zeichen von `needle` im Absatz sind unterstrichen. */
const rangeUnderlined = (p: LayoutParagraph, needle: string) => {
  const i = p.text.indexOf(needle);
  if (i === -1) return false;
  return p.charStyles.slice(i, i + needle.length).every((s, k) => !needle[k].trim() || (s.ul?.s ?? 0) === 1);
};

/** Ein Zeichen hinter `needle` ist hochgestellt (z. B. die 2 in m2). */
const superscriptAfter = (p: LayoutParagraph, needle: string) => isSuperscript(styleAt(p, needle, needle.length));

// ---------- Aufgabe 6: Absatz und Seite ----------

const merkblatt: LayoutTask = {
  id: 'merkblatt-vorstellungsgespraech',
  title: 'Absatz & Seite: Merkblatt Vorstellungsgespräch',
  difficulty: 'mittel',
  intro: 'Seitenränder, Kopfzeile, Zeilenabstand, Einzüge und Absatzabstände – die Werkzeuge für professionelle Dokumente.',
  auftrag:
    'Die Berufsberatung möchte ein Merkblatt für das Vorstellungsgespräch verteilen. Text und Grundformatierung fehlen noch. In dieser Aufgabe arbeitest du zum ersten Mal mit Absatz- und Seiteneinstellungen.\n\nWichtig: Der Editor rechnet Abstände in Pixeln (px). Es gilt: 1 cm ≈ 37,8 px und 1 pt ≈ 1,33 px.',
  margins: { top: 3, bottom: 3, left: 3, right: 3 },
  paragraphs: [
    { text: 'Fit fürs Vorstellungsgespräch' },
    { text: 'Merkblatt der Berufsberatung für die 10. Klassen' },
    { text: 'Vor dem Gespräch', spaceBelow: 0 },
    {
      text: 'Ein Vorstellungsgespräch ist deine Chance, dich persönlich zu präsentieren. Wer gut vorbereitet ist, wirkt sicherer und kann auch schwierige Fragen souverän beantworten. Informiere dich deshalb vorher gründlich über das Unternehmen, seine Produkte und den Ausbildungsberuf. Lege deine Kleidung am Vorabend bereit und drucke die Einladung aus.',
      lineSpacing: 1,
    },
    { text: 'Im Gespräch', spaceBelow: 0 },
    {
      text: 'Achte auf eine aufrechte Körperhaltung, halte Blickkontakt und lass dein Gegenüber ausreden. Ehrliche Antworten kommen besser an als auswendig gelernte Floskeln. Am Ende darfst du ruhig eigene Fragen stellen – das zeigt Interesse.',
      lineSpacing: 1,
    },
    { text: 'Diese Fragen solltest du beantworten können:' },
    { text: 'Warum möchtest du genau diesen Beruf erlernen?' },
    { text: 'Was weißt du bereits über unser Unternehmen?' },
    { text: 'Wo liegen deine Stärken und wo deine Schwächen?' },
    { text: 'Tipp: Plane für die Anfahrt mindestens 15 Minuten Puffer ein!' },
  ],
  steps: [
    {
      title: 'Seitenränder einstellen',
      target: 'Ganzes Dokument',
      instruction: `Oben und unten 2 cm (${px(2)})\nLinks 2,5 cm (${px(2.5)})\nRechts 2 cm (${px(2)})`,
      tools: ['seite'],
      checks: marginChecks({ top: 2, bottom: 2, left: 2.5, right: 2 }),
    },
    {
      title: 'Kopfzeile ausfüllen',
      target: 'Kopfzeile (oberer Seitenrand)',
      instruction: 'Knopf „Kopfzeile bearbeiten“ drücken – der Cursor steht dann in der Kopfzeile\nVor- und Nachname, Klasse, heutiges Datum im Format TT.MM.JJ eintragen – z. B. Lena Huber 10b 01.10.26\nZum Schluss „↩ Zurück zum Text“ drücken',
      tools: ['kopfzeile'],
      checks: nameLineChecks('header'),
    },
    {
      title: 'Titel',
      target: '1. Zeile – „Fit fürs Vorstellungsgespräch“',
      instruction: 'Formatvorlage „Titel“\nZentriert',
      checks: [
        check('Formatvorlage „Titel“', H.style('Titel'), 'Fit fürs Vorstellungs', (p) => p.namedStyle === NamedStyleType.TITLE),
        check('Zentriert', H.align('Zentriert'), 'Fit fürs Vorstellungs', (p) => isCentered(p)),
      ],
    },
    {
      title: 'Untertitel',
      target: '2. Zeile – „Merkblatt der Berufsberatung …“',
      instruction: 'Formatvorlage „Untertitel“\nZentriert und kursiv',
      checks: [
        check('Formatvorlage „Untertitel“', H.style('Untertitel'), 'Merkblatt der Berufs', (p) => p.namedStyle === NamedStyleType.SUBTITLE),
        check('Zentriert und kursiv', `${H.align('Zentriert')}; ${H.italic}`, 'Merkblatt der Berufs', (p) => isCentered(p) && isItalic(p)),
      ],
    },
    {
      title: 'Zwischenüberschriften',
      target: '„Vor dem Gespräch“ (3. Zeile) und „Im Gespräch“ (5. Zeile)',
      instruction: `Formatvorlage „Überschrift 2“\nAbstand vor 12 pt (${ptPx(12)} px)\nAbstand nach 6 pt (${ptPx(6)} px)`,
      tools: ['absatz'],
      checks: [
        check('Formatvorlage „Überschrift 2“', H.style('Überschrift 2'), ['=Vor dem Gespräch', '=Im Gespräch'], (p) => p.namedStyle === NamedStyleType.HEADING_2),
        check(`Abstand vor ${ptPx(12)} px`, `${H.paragraph} → Abstand „Vor“`, ['=Vor dem Gespräch', '=Im Gespräch'], (p) => near(p.spaceAbove, ptPx(12))),
        check(`Abstand nach ${ptPx(6)} px`, `${H.paragraph} → Abstand „Nach“`, ['=Vor dem Gespräch', '=Im Gespräch'], (p) => near(p.spaceBelow, ptPx(6))),
      ],
    },
    {
      title: 'Fließtext: Blocksatz und Zeilenabstand',
      target: '4. und 6. Zeile – Absätze „Ein Vorstellungsgespräch …“ und „Achte auf eine …“',
      instruction: 'Blocksatz\nZeilenabstand 1,5 (Mehrfacher Abstand 1,5)',
      tools: ['absatz'],
      checks: [
        check('Blocksatz', H.align('Blocksatz'), ['Ein Vorstellungsgespräch', 'Achte auf eine'], (p) => isJustified(p)),
        check('Zeilenabstand 1,5', `${H.paragraph} → Zeilenabstand „Mehrfacher Abstand“ → 1.5`, ['Ein Vorstellungsgespräch', 'Achte auf eine'], (p) => lineSpacingIs(p, 1.5)),
      ],
    },
    {
      title: 'Fließtext: Einzug erste Zeile',
      target: '4. und 6. Zeile – Absätze „Ein Vorstellungsgespräch …“ und „Achte auf eine …“',
      instruction: `Einzug der ersten Zeile 0,5 cm (${px(0.5)})`,
      tools: ['absatz'],
      checks: [check('Einzug erste Zeile 0,5 cm', `${H.paragraph} → Einzug „Erste Zeile“ ${px(0.5)}`, ['Ein Vorstellungsgespräch', 'Achte auf eine'], (p) => near(p.indentFirstLine, cmToPx(0.5), 2))],
    },
    {
      title: 'Fragenliste',
      target: '7. Zeile „Diese Fragen solltest du …“ und die drei Fragen darunter (8.–10. Zeile)',
      instruction: `7. Zeile: fett\nDie drei Fragen: nummerierte Liste\nDie drei Fragen: hängender Einzug 0,75 cm (${px(0.75)})`,
      tools: ['absatz'],
      checks: [
        check('Einleitungssatz fett', `${H.selectLine}, dann ${H.bold}`, 'Diese Fragen solltest', (p) => isBold(p)),
        check('Nummerierte Liste', `${H.selectLines}, dann ${H.numbers}`, ['Warum möchtest', 'Was weißt du', 'Wo liegen deine'], (p) => isNumberedList(p)),
        check('Hängender Einzug 0,75 cm', `${H.paragraph} → „Hängender Einzug“ ${px(0.75)}`, ['Warum möchtest', 'Was weißt du', 'Wo liegen deine'], (p) => near(p.hanging, cmToPx(0.75), 2)),
      ],
    },
    {
      title: 'Tipp hervorheben',
      target: 'Letzte Zeile – „Tipp: Plane für die Anfahrt …“',
      instruction: `Zentriert und fett\nGelb hinterlegt (Texthintergrundfarbe, 5. Spalte)\nAbstand vor 18 pt (${ptPx(18)} px)`,
      tools: ['absatz'],
      checks: [
        check('Zentriert und fett', `${H.align('Zentriert')}; ${H.bold}`, 'Tipp: Plane', (p) => isCentered(p) && isBold(p)),
        check('Gelb hinterlegt', H.highlight('Gelb', PALETTE_COLUMN.gelb), 'Tipp: Plane', (p) => colorFamily(highlightOf(p)) === 'yellow'),
        check(`Abstand vor ${ptPx(18)} px`, `${H.paragraph} → Abstand „Vor“`, 'Tipp: Plane', (p) => near(p.spaceAbove, ptPx(18))),
      ],
    },
  ],
};

// ---------- Aufgabe 7: Projekt Dämmung (nach Unterrichtsauftrag) ----------

const D_BODY = ['Ein schlecht gedämmtes', 'Der U-Wert von einem'];
const D_SECOND = longParagraph('Der Wärmedurchgangskoeffizient');
const D_LIST = ['25 cm Betonwand', '24 cm Mauerziegel', '20 cm Massivholz'];
const D_HEADINGS = ['=Der Wärmedurchgangskoeffizient', '=U-Werte für Außenbauteile', '=Vergleich der Heizkosten vor und nach einer Sanierung'];

const daemmung: LayoutTask = {
  id: 'projekt-daemmung',
  title: 'Projekt: Infoflyer Dämmung',
  difficulty: 'schwer',
  kind: 'projekt',
  intro: 'Wie im Unterricht: Seitenränder, Spalten mit Trennlinie, Spaltenumbruch, hängender Einzug, Tabelle und Fußnote nach Vorgaben.',
  auftrag:
    'Sie absolvieren ein Praktikum bei der Verbraucherzentrale im Bereich Energieberatung. Sie sollen einen Informationsflyer zum Thema „Durch richtiges Dämmen Heizkosten reduzieren“ anpassen. Der Text ist bereits vorhanden – Sie passen lediglich das Layout nach den folgenden Angaben an.\n\nDer Editor rechnet in Pixeln: 1 cm ≈ 37,8 px, 1 pt ≈ 1,33 px.',
  margins: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 },
  baseFont: { family: 'Verdana', size: 11 },
  paragraphs: [
    { text: 'Durch richtiges Dämmen Heizkosten reduzieren' },
    {
      text: 'Ein schlecht gedämmtes Haus verbraucht viel Heizenergie. Dadurch entstehen hohe Heizkosten. Aber derjenige, der sein Haus richtig dämmt, kann Heizkosten reduzieren. Daher schreibt inzwischen der Gesetzgeber bei Neubauten eine energieeffiziente Bauweise vor. Aber auch Altbauten müssen unter Umständen gedämmt werden. Es ist keine Frage, dass Dämmen eine hohe Investition für Hausbesitzer bedeutet. Aber diese Investition lohnt sich, da die Hausbesitzer durch sie Geld sparen.',
      lineSpacing: 1,
    },
    { text: 'Der Wärmedurchgangskoeffizient', spaceBelow: 2 },
    {
      text: 'Der Wärmedurchgangskoeffizient ist eine der bedeutendsten Größen im Wärmeschutz. Der U-Wert gibt an, wie viel Energie durch ein Bauteil von innen des Hauses nach außen entweicht. Je kleiner der U-Wert ist, umso höher ist die Wärmedämmfähigkeit eines Bauteils. Die jeweilige Bauteildicke ist mit ausschlaggebend für den Wert. Bei nicht homogenen oder mehrschichtigen Bauteilen wie zum Beispiel Fenstern oder Türen wird aus den U-Werten der einzelnen Bauteile ein Durchschnittswert berechnet. Der U-Wert wird in der Einheit W/(m2K) angegeben.',
      lineSpacing: 1,
    },
    { text: 'U-Werte für Außenbauteile', spaceBelow: 2 },
    {
      text: 'Der U-Wert von einem Bauteil hängt von seinem Material und seiner Dicke ab. Dadurch ergeben sich unterschiedliche U-Werte von Bauteilen. So haben die folgenden gebräuchlichen Baustoffe folgende Werte:',
      lineSpacing: 1,
    },
    { text: '25 cm Betonwand: 3,3 W/(m²K)' },
    { text: '24 cm Mauerziegel: 1,5 W/(m²K)' },
    { text: '20 cm Massivholz: 0,5 W/(m²K)' },
    { text: 'Vergleich der Heizkosten vor und nach einer Sanierung', spaceBelow: 2 },
    {
      table: [
        ['', 'U-Wert', 'Heizölbedarf', 'Heizkosten pro Jahr bei 100 m2 Fläche'],
        ['Dachboden vor Sanierung – Dachbodenfläche 95 m2', '', '', ''],
        ['Einfamilienhaus mit Betondecke', '2,09 W/(m2K)', '20 l/m2', '3.569,00 Euro'],
        ['Dachboden nach Sanierung – Dachbodenfläche 95 m2', '', '', ''],
        ['Einfamilienhaus mit Betondecke', '0,23 W/(m2K)', '2,39 l/m2', '407,00 Euro'],
      ],
    },
    { text: '1 wird häufig auch als U-Wert bezeichnet' },
  ],
  steps: [
    {
      title: 'Kopfzeile',
      target: 'Kopfzeile (oberer Seitenrand)',
      instruction: 'Knopf „Kopfzeile bearbeiten“ drücken – der Cursor steht dann in der Kopfzeile\nNachname, Vorname, Klasse und Datum (TT.MM.JJ) eintragen – z. B. Huber, Lena 10b 01.10.26\nZum Schluss „↩ Zurück zum Text“ drücken',
      tools: ['kopfzeile'],
      checks: nameLineChecks('header'),
    },
    {
      title: 'Seitenränder',
      target: 'Ganzes Dokument – bitte vor den Abschnittsumbrüchen (Auftrag 9) erledigen',
      instruction: `Links und rechts 2 cm (${px(2)})\nOben 2,5 cm (${px(2.5)})\nUnten 2 cm (${px(2)})`,
      tools: ['seite'],
      checks: marginChecks({ top: 2.5, bottom: 2, left: 2, right: 2 }),
    },
    {
      title: 'Titel',
      target: '1. Zeile – „Durch richtiges Dämmen Heizkosten reduzieren“',
      instruction: 'Times New Roman, 18 pt\nFett, zentriert\nSchriftfarbe Orange (4. Spalte, statt WordArt in Gold)',
      checks: [
        check('Times New Roman, 18 pt', `${H.font('Times New Roman')}, ${H.size(18)}`, 'Durch richtiges Dämmen', (p) => fontOf(p) === 'Times New Roman' && sizeOf(p) === 18),
        check('Fett und zentriert', `${H.bold}; ${H.align('Zentriert')}`, 'Durch richtiges Dämmen', (p) => isBold(p) && isCentered(p)),
        check('Schriftfarbe Orange', H.color('Orange', PALETTE_COLUMN.orange), 'Durch richtiges Dämmen', (p) => colorIs(p, 'orange')),
      ],
    },
    {
      title: 'Fließtext: Schrift',
      target: 'Die drei Textabsätze („Ein schlecht gedämmtes …“, „Der Wärmedurchgangskoeffizient ist …“, „Der U-Wert von einem …“) und die drei U-Werte darunter',
      instruction: 'Schriftart Arial\nSchriftgröße 10',
      checks: [
        check('Arial, 10 pt', `Jeden Absatz markieren, dann ${H.font('Arial')}, ${H.size(10)}`, (d) => [...byText(...D_BODY, ...D_LIST)(d), ...D_SECOND(d)], (p) => fontOf(p) === 'Arial' && sizeOf(p) === 10),
      ],
    },
    {
      title: 'Fließtext: Absatz',
      target: 'Nur die drei Textabsätze („Ein schlecht gedämmtes …“, „Der Wärmedurchgangskoeffizient ist …“, „Der U-Wert von einem …“)',
      instruction: 'Blocksatz\nZeilenabstand 1,5 (Mehrfacher Abstand 1,5)',
      tools: ['absatz'],
      checks: [
        check('Blocksatz', H.align('Blocksatz'), (d) => [...byText(...D_BODY)(d), ...D_SECOND(d)], (p) => isJustified(p)),
        check('Zeilenabstand 1,5', `${H.paragraph} → Zeilenabstand „Mehrfacher Abstand“ → 1.5`, (d) => [...byText(...D_BODY)(d), ...D_SECOND(d)], (p) => lineSpacingIs(p, 1.5)),
      ],
    },
    {
      title: 'Unterüberschriften: Schrift',
      target: '„Der Wärmedurchgangskoeffizient“ (3. Zeile), „U-Werte für Außenbauteile“, „Vergleich der Heizkosten …“ (über der Tabelle)',
      instruction: 'Times New Roman, 11 pt\nFett und unterstrichen',
      checks: [
        check('Times New Roman, 11 pt', `${H.font('Times New Roman')}, ${H.size(11)}`, D_HEADINGS, (p) => fontOf(p) === 'Times New Roman' && sizeOf(p) === 11),
        check('Fett und unterstrichen', `${H.bold} und ${H.underline}`, D_HEADINGS, (p) => isBold(p) && isUnderlined(p)),
      ],
    },
    {
      title: 'Unterüberschriften: Abstand',
      target: 'Dieselben drei Unterüberschriften',
      instruction: `Abstand nach 6 pt (${ptPx(6)} px)`,
      tools: ['absatz'],
      checks: [check(`Abstand nach ${ptPx(6)} px`, `${H.paragraph} → Abstand „Nach“`, D_HEADINGS, (p) => near(p.spaceBelow, ptPx(6)))],
    },
    {
      title: 'Aufzählung',
      target: 'Die drei U-Werte – „25 cm Betonwand …“, „24 cm Mauerziegel …“, „20 cm Massivholz …“',
      instruction: `Aufzählung mit Punkten\nEinzug links 0 cm, hängender Einzug 0,75 cm (${px(0.75)})`,
      tools: ['absatz'],
      checks: [
        check('Aufzählung mit Punkten', `${H.selectLines}, dann ${H.bullets}`, D_LIST, (p) => isBulletList(p)),
        check('Hängender Einzug 0,75 cm, links 0', `${H.paragraph} → Links 0, „Hängender Einzug“ ${px(0.75)}`, D_LIST, (p) => near(p.hanging, cmToPx(0.75), 2) && near(p.indentStart ?? 0, 0)),
      ],
    },
    {
      title: 'Zweiter Absatz: eigener Abschnitt',
      target: 'Absatz „Der Wärmedurchgangskoeffizient ist eine der …“ (unter der gleichnamigen Unterüberschrift)',
      instruction: 'Cursor an den Anfang dieses Absatzes → Abschnittsumbruch (Fortlaufend)\nCursor an den Anfang von „U-Werte für Außenbauteile“ → Abschnittsumbruch (Fortlaufend)',
      checks: [
        check(
          'Absatz steht in einem eigenen Abschnitt',
          H.insertBreak('Abschnittsumbruch (Fortlaufend)'),
          D_SECOND,
          (p, d) => {
            const before = d.paragraphs.find((x) => x.text.startsWith('Ein schlecht gedämmtes'));
            const after = d.paragraphs.find((x) => x.text.startsWith('Der U-Wert von einem'));
            return !!before && !!after && before.section !== p.section && after.section !== p.section;
          },
        ),
      ],
    },
    {
      title: 'Zweiter Absatz: zwei Spalten',
      target: 'Der neue Abschnitt mit „Der Wärmedurchgangskoeffizient ist …“',
      instruction: 'Spaltenanzahl 2\nTrennlinie „Zwischen Spalten“\nDer übrige Text bleibt einspaltig',
      tools: ['abschnitt'],
      checks: [
        check('Zwei Spalten', `Cursor in den Absatz, dann ${H.section} → Spaltenanzahl 2`, D_SECOND, (p, d) => sectionOf(d, p)?.columns === 2),
        check('Trennlinie zwischen den Spalten', `${H.section} → Trennlinie „Zwischen Spalten“`, D_SECOND, (p, d) => !!sectionOf(d, p)?.separator),
        check('Übriger Text einspaltig', 'Nur der Abschnitt mit dem zweiten Absatz bekommt 2 Spalten – im Abschnitts-Panel oben den richtigen Abschnitt wählen', byText('Ein schlecht gedämmtes', 'Der U-Wert von einem'), (p, d) => sectionOf(d, p)?.columns === 1 && sectionOf(d, D_SECOND(d)[0])?.columns === 2),
      ],
    },
    {
      title: 'Spaltenumbruch',
      target: 'Im zweiten Absatz direkt vor „Die jeweilige Bauteildicke …“',
      instruction: 'Manueller Spaltenumbruch, damit der Text ab „Die jeweilige …“ in der rechten Spalte beginnt',
      checks: [docCheck('Spaltenumbruch vor „Die jeweilige Bauteildicke“', H.insertBreak('Spaltenumbruch'), (d) => columnBreakBefore(d, 'Die jeweilige Bauteildicke'))],
    },
    {
      title: 'Tabelle: Schrift',
      target: 'Gesamte Tabelle unter „Vergleich der Heizkosten …“',
      instruction: 'Arial, 10 pt\nErste Tabellenzeile (U-Wert, Heizölbedarf, Heizkosten …): fett und grau hinterlegt (Texthintergrundfarbe, 1. Spalte)',
      checks: [
        check('Tabellentext Arial, 10 pt', `Von der ersten bis zur letzten Zelle ziehen, dann ${H.font('Arial')}, ${H.size(10)}`, cells(() => true), (p) => fontOf(p) === 'Arial' && sizeOf(p) === 10),
        check('Erste Zeile fett und grau hinterlegt', `${H.bold}; ${H.highlight('Grau', PALETTE_COLUMN.grau)}`, cells((r) => r === 0), (p) => isBold(p) && colorFamily(highlightOf(p)) === 'gray'),
      ],
    },
    {
      title: 'Tabelle: Werte',
      target: 'Tabellenzeilen 2 bis 5',
      instruction: 'In „Dachboden vor Sanierung …“ und „Dachboden nach Sanierung …“ nur die Wörter „vor Sanierung“ bzw. „nach Sanierung“ unterstreichen\nDie Werte in Zeile 3 und 5 (Spalten 2–4) zentrieren\nIn „W/(m2K)“ (Zeile 3 und 5) die 2 hochstellen → W/(m²K)',
      checks: [
        check('„vor/nach Sanierung“ unterstrichen', `Nur die beiden Wörter markieren, dann ${H.underline}`, cells((r, c) => (r === 1 || r === 3) && c === 0), (p) => rangeUnderlined(p, 'vor Sanierung') || rangeUnderlined(p, 'nach Sanierung')),
        check('Werte zentriert', `Wertezellen markieren, dann ${H.align('Zentriert')}`, cells((r, c) => (r === 2 || r === 4) && c > 0), (p) => isCentered(p)),
        check('m² hochgestellt', H.superscript, cells((r, c) => (r === 2 || r === 4) && c === 1), (p) => superscriptAfter(p, 'W/(m')),
      ],
    },
    {
      title: 'Fußnote',
      target: 'Zweiter Absatz hinter „Wärmedurchgangskoeffizient“ und letzte Zeile „1 wird häufig …“',
      instruction: 'Direkt hinter „Der Wärmedurchgangskoeffizient“ (Absatzanfang) eine 1 eintippen und hochstellen\nLetzte Zeile: Schriftgröße 8, die 1 am Anfang hochstellen',
      checks: [
        check('Hochgestellte 1 im zweiten Absatz', `Cursor hinter „…koeffizient“, 1 tippen; ${H.superscript}`, D_SECOND, (p) => p.text.startsWith('Der Wärmedurchgangskoeffizient1') && superscriptAfter(p, 'Der Wärmedurchgangskoeffizient')),
        check('Fußnotentext 8 pt, 1 hochgestellt', `${H.selectLine}, ${H.size(8)}; dann ${H.superscript}`, (d) => [d.paragraphs.find((p) => /wird häufig auch als U-Wert/.test(p.text))], (p) => sizeOf(p) === 8 && isSuperscript(p.charStyles[0])),
      ],
    },
  ],
};

// ---------- Aufgabe 8: Projekt Sparkasse (nach Unterrichtsauftrag) ----------

const S_LIST = ['Kostenlose Kontoführung', 'Sparkassen-Card (Debitkarte)', 'Online-Banking und', 'Bargeld an allen', 'Persönliche Beratung'];
const S_HEADINGS = ['=Ihre Vorteile im Überblick', '=Mobiles Bezahlen', '=Preisvergleich'];
const S_MOBILE = longParagraph('Mit der App');
const FOOTNOTE_TEXT = /[¹1]?\s*mtl\.?\s*Mindestgeldeingang.*?(sonst\s*[\d.,]+\s*EUR|$)/i;

const sparkasse: LayoutTask = {
  id: 'projekt-sparkasse',
  title: 'Projekt: Werbeflyer Konto Young',
  difficulty: 'schwer',
  kind: 'projekt',
  intro: 'Wie im Unterricht: Fußzeile, schmale Ränder, Spalten mit Abstand, Aufzählung, Tabellenformatierung und Fußnote.',
  auftrag:
    'Sie erstellen für Ihren Arbeitgeber, die Sparkasse, einen Werbeflyer für das neue „PrivatKonto Young“ für junge Leute. Der Text ist vorgegeben. Nehmen Sie folgende Änderungen vor.\n\nDer Editor rechnet in Pixeln: 1 cm ≈ 37,8 px, 1 pt ≈ 1,33 px.',
  margins: { top: 2.5, bottom: 2, left: 2.5, right: 2.5 },
  baseFont: { family: 'Times New Roman', size: 12 },
  paragraphs: [
    { text: 'PrivatKonto Young' },
    { text: 'Ihr erstes eigenes Konto – einfach, digital und für alle bis 25 Jahre ohne Kontoführungsgebühr.' },
    { text: 'Ihre Vorteile im Überblick' },
    { text: 'Kostenlose Kontoführung bis zum 25. Geburtstag' },
    { text: 'Sparkassen-Card (Debitkarte) inklusive' },
    { text: 'Online-Banking und Sparkassen-App ohne Zusatzkosten' },
    { text: 'Bargeld an allen Geldautomaten der Sparkassen kostenlos' },
    { text: 'Persönliche Beratung in Ihrer Filiale vor Ort' },
    { text: 'Mobiles Bezahlen' },
    {
      text: 'Mit der App „Mobiles Bezahlen“ wird Ihr Smartphone zur Geldbörse. Hinterlegen Sie einfach Ihre Sparkassen-Card in der App, halten Sie das Handy an das Kassenterminal – fertig. Bei kleinen Beträgen ist meist nicht einmal eine PIN nötig. Zusätzlich können Sie mit der App Geld direkt an Freunde senden oder von ihnen anfordern. Und wer gern online einkauft, bezahlt mit der digitalen Kreditkarte sicher im Internet.',
    },
    { text: 'Preisvergleich' },
    {
      table: [
        ['', 'Konto Young', 'Konto Klassik', 'Konto Premium'],
        ['Kontoführung monatlich', '0,00 EUR', '4,90 EUR', '0,00 EUR'],
        ['Sparkassen-Card', 'inklusive', 'inklusive', 'inklusive'],
        ['Kreditkarte jährlich', '0,00 EUR', '30,00 EUR', 'inklusive'],
        ['Online-Banking', 'inklusive', 'inklusive', 'inklusive'],
        ['Überweisung beleglos', '0,00 EUR', '0,00 EUR', '0,00 EUR'],
      ],
    },
    { text: 'Ihre Sparkasse berät Sie gern – vereinbaren Sie noch heute einen Termin!' },
  ],
  steps: [
    {
      title: 'Fußzeile',
      target: 'Fußzeile (unterer Seitenrand)',
      instruction: 'Knopf „Fußzeile bearbeiten“ drücken – der Cursor steht dann in der Fußzeile\nName, Klasse und Datum (TT.MM.JJ) eintragen – z. B. Lena Huber 10b 01.10.26\nZum Schluss „↩ Zurück zum Text“ drücken',
      tools: ['fusszeile'],
      checks: nameLineChecks('footer', FOOTNOTE_TEXT),
    },
    {
      title: 'Seitenränder',
      target: 'Ganzes Dokument – bitte vor den Abschnittsumbrüchen (Auftrag 8) erledigen',
      instruction: `Alle vier Seitenränder 1 cm (${px(1)})`,
      tools: ['seite'],
      checks: marginChecks({ top: 1, bottom: 1, left: 1, right: 1 }),
    },
    {
      title: 'Fließtext: Schrift',
      target: 'Alle Absätze außer den Überschriften: 2. Zeile „Ihr erstes eigenes Konto …“, die fünf Vorteile, Absatz „Mit der App …“, letzte Zeile „Ihre Sparkasse berät …“',
      instruction: 'Schriftart Arial\nSchriftgröße 11',
      checks: [
        check('Arial, 11 pt', `Absätze markieren, dann ${H.font('Arial')}, ${H.size(11)}`, (d) => [...byText('Ihr erstes eigenes', ...S_LIST, 'Ihre Sparkasse berät')(d), ...S_MOBILE(d)], (p) => fontOf(p) === 'Arial' && sizeOf(p) === 11),
      ],
    },
    {
      title: 'Tabelle: Schrift',
      target: 'Gesamte Tabelle unter „Preisvergleich“',
      instruction: 'Schriftart Arial\nSchriftgröße 11',
      checks: [check('Tabellentext Arial, 11 pt', `Von der ersten bis zur letzten Zelle ziehen, dann ${H.font('Arial')}, ${H.size(11)}`, cells(() => true), (p) => fontOf(p) === 'Arial' && sizeOf(p) === 11)],
    },
    {
      title: 'Hauptüberschrift',
      target: '1. Zeile – „PrivatKonto Young“',
      instruction: 'Verdana, 26 pt\nFett, zentriert\nSchriftfarbe Rot (3. Spalte, statt WordArt)',
      checks: [
        check('Verdana, 26 pt', `${H.font('Verdana')}, ${H.size(26)}`, '=PrivatKonto Young', (p) => fontOf(p) === 'Verdana' && sizeOf(p) === 26),
        check('Fett und zentriert', `${H.bold}; ${H.align('Zentriert')}`, '=PrivatKonto Young', (p) => isBold(p) && isCentered(p)),
        check('Schriftfarbe Rot', H.color('Rot', PALETTE_COLUMN.rot), '=PrivatKonto Young', (p) => colorIs(p, 'red')),
      ],
    },
    {
      title: 'Unterüberschriften',
      target: '„Ihre Vorteile im Überblick“, „Mobiles Bezahlen“, „Preisvergleich“',
      instruction: 'Arial, 12 pt\nFett',
      checks: [check('Arial, 12 pt, fett', `${H.font('Arial')}, ${H.size(12)}, ${H.bold}`, S_HEADINGS, (p) => fontOf(p) === 'Arial' && sizeOf(p) === 12 && isBold(p))],
    },
    {
      title: 'Vorteile als Aufzählung',
      target: 'Die fünf Zeilen unter „Ihre Vorteile im Überblick“ (von „Kostenlose Kontoführung …“ bis „Persönliche Beratung …“)',
      instruction: `Aufzählung mit Punkten\nEinzug links 0 cm, hängender Einzug 0,75 cm (${px(0.75)})`,
      tools: ['absatz'],
      checks: [
        check('Aufzählung mit Punkten', `${H.selectLines}, dann ${H.bullets}`, S_LIST, (p) => isBulletList(p)),
        check('Hängender Einzug 0,75 cm, links 0', `${H.paragraph} → Links 0, „Hängender Einzug“ ${px(0.75)}`, S_LIST, (p) => near(p.hanging, cmToPx(0.75), 2) && near(p.indentStart ?? 0, 0)),
      ],
    },
    {
      title: 'Mobiles Bezahlen: eigener Abschnitt',
      target: 'Absatz „Mit der App „Mobiles Bezahlen“ …“',
      instruction: 'Cursor an den Anfang dieses Absatzes → Abschnittsumbruch (Fortlaufend)\nCursor an den Anfang von „Preisvergleich“ → Abschnittsumbruch (Fortlaufend)',
      checks: [
        check(
          'Absatz steht in einem eigenen Abschnitt',
          H.insertBreak('Abschnittsumbruch (Fortlaufend)'),
          S_MOBILE,
          (p, d) => {
            const before = d.paragraphs.find((x) => x.text.startsWith('Ihr erstes eigenes'));
            const after = d.paragraphs.find((x) => x.text.startsWith('Ihre Sparkasse berät'));
            return !!before && !!after && before.section !== p.section && after.section !== p.section;
          },
        ),
      ],
    },
    {
      title: 'Mobiles Bezahlen: zwei Spalten',
      target: 'Der neue Abschnitt mit „Mit der App …“',
      instruction: `Spaltenanzahl 2\nTrennlinie „Zwischen Spalten“\nSpaltenabstand 1 cm (${px(1)})\nDer übrige Text bleibt einspaltig`,
      tools: ['abschnitt'],
      checks: [
        check('Zwei Spalten', `Cursor in den Absatz, dann ${H.section} → Spaltenanzahl 2`, S_MOBILE, (p, d) => sectionOf(d, p)?.columns === 2),
        check('Trennlinie und Abstand 1 cm', `${H.section} → Trennlinie „Zwischen Spalten“, Spaltenabstand ${px(1)}`, S_MOBILE, (p, d) => !!sectionOf(d, p)?.separator && near(sectionOf(d, p)?.gap, cmToPx(1))),
        check('Übriger Text einspaltig', 'Nur der Abschnitt „Mobiles Bezahlen“ bekommt 2 Spalten – im Abschnitts-Panel oben den richtigen Abschnitt wählen', byText('Ihr erstes eigenes', 'Ihre Sparkasse berät'), (p, d) => sectionOf(d, p)?.columns === 1 && sectionOf(d, S_MOBILE(d)[0])?.columns === 2),
      ],
    },
    {
      title: 'Spaltenumbruch',
      target: 'Im Absatz „Mit der App …“ direkt vor dem Satz „Zusätzlich können Sie …“',
      instruction: 'Manueller Spaltenumbruch, damit „Zusätzlich …“ oben in der rechten Spalte beginnt',
      checks: [docCheck('Spaltenumbruch vor „Zusätzlich“', H.insertBreak('Spaltenumbruch'), (d) => columnBreakBefore(d, 'Zusätzlich können Sie'))],
    },
    {
      title: 'Tabelle formatieren',
      target: 'Tabelle unter „Preisvergleich“',
      instruction: 'Spaltenüberschriften (Zeile 1: Konto Young, Konto Klassik, Konto Premium): fett und zentriert\nZeile 1 und Spalte 1 (Kontoführung monatlich … Überweisung beleglos): dunkelrote Schrift (3. Spalte, eine der beiden untersten Farben)\nAlle Werte (Zeile 2–6, Spalte 2–4): zentriert',
      checks: [
        check('Spaltenüberschriften fett, zentriert', `${H.bold}; ${H.align('Zentriert')}`, cells((r, c) => r === 0 && c > 0), (p) => isBold(p) && isCentered(p)),
        check('Überschriften dunkelrot', H.color('Dunkelrot', PALETTE_COLUMN.rot), cells((r, c) => r === 0 || c === 0), (p) => colorIs(p, 'red') && isDarkColor(rgbOf(p))),
        check('Werte zentriert', `Wertezellen markieren, dann ${H.align('Zentriert')}`, cells((r, c) => r > 0 && c > 0), (p) => isCentered(p)),
      ],
    },
    {
      title: 'Fußnote',
      target: 'Tabelle Zeile 2, Spalte 4 („0,00 EUR“ beim Konto Premium) und die Fußzeile',
      instruction: 'Direkt hinter „0,00 EUR“ eine 1 eintippen und hochstellen\nIn der Fußzeile zusätzlich: „1 mtl. Mindestgeldeingang 5.000 EUR, sonst 12,90 EUR“',
      tools: ['fusszeile'],
      checks: [
        check('Hochgestellte 1 hinter 0,00 EUR', `In die Zelle hinter „EUR“ tippen, 1 eingeben; ${H.superscript}`, cells((r, c) => r === 1 && c === 3), (p) => p.text.trim() === '0,00 EUR1' && superscriptAfter(p, '0,00 EUR')),
        docCheck('Fußnotentext in der Fußzeile', H.footer, (d) => /Mindestgeldeingang\s*5\.000\s*EUR/i.test(d.footerText)),
      ],
    },
  ],
};

export const ADVANCED_TASKS: LayoutTask[] = [merkblatt, daemmung, sparkasse];
