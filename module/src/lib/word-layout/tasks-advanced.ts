import { NamedStyleType } from '@univerjs/core';
import { byText, cells, check, docCheck, isBulletList, isNumberedList, longParagraph, sectionOf } from './checks';
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
  isItalic,
  isJustified,
  isSuperscript,
  isUnderlined,
  lineSpacingIs,
  near,
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

const HINT_MARGINS = 'Rechtsklick ins Dokument → Abschnittseinstellungen → Oben/Unten/Links/Rechts (px). 1 cm ≈ 37,8 px';
const HINT_PARAGRAPH = 'Absatz markieren → Rechtsklick → Absatzeinstellungen';
const HINT_SECTION = 'Rechtsklick in den Abschnitt → Abschnittseinstellungen';

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
  const hint = `Start → Symbol „Kopf- und Fußzeile“ (oder Doppelklick in den ${where === 'header' ? 'oberen' : 'unteren'} Seitenrand) → Text eintippen`;
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
      title: 'Seite einrichten',
      instruction: `Seitenränder: oben und unten 2 cm (${px(2)}), links 2,5 cm (${px(2.5)}), rechts 2 cm (${px(2)}).`,
      checks: marginChecks({ top: 2, bottom: 2, left: 2.5, right: 2 }),
    },
    {
      title: 'Kopfzeile',
      instruction: 'Trage in die Kopfzeile deinen Vor- und Nachnamen, deine Klasse und das heutige Datum (TT.MM.JJ) ein.',
      checks: nameLineChecks('header'),
    },
    {
      title: 'Titel',
      instruction: 'Erste Zeile: Formatvorlage „Titel“, zentriert.\nZweite Zeile: Formatvorlage „Untertitel“, zentriert und kursiv.',
      checks: [
        check('Titel: Formatvorlage und zentriert', 'Start → Formatvorlage („Normal“) → Titel, dann Zentriert', 'Fit fürs Vorstellungs', (p) => p.namedStyle === NamedStyleType.TITLE && isCentered(p)),
        check('Untertitel: Formatvorlage, zentriert, kursiv', 'Start → Formatvorlage → Untertitel, Zentriert, „I“', 'Merkblatt der Berufs', (p) => p.namedStyle === NamedStyleType.SUBTITLE && isCentered(p) && isItalic(p)),
      ],
    },
    {
      title: 'Zwischenüberschriften',
      instruction: `„Vor dem Gespräch“ und „Im Gespräch“: Formatvorlage „Überschrift 2“, Abstand vor 12 pt (${ptPx(12)} px) und nach 6 pt (${ptPx(6)} px).`,
      checks: [
        check('Formatvorlage „Überschrift 2“', 'Start → Formatvorlage → Überschrift 2', ['=Vor dem Gespräch', '=Im Gespräch'], (p) => p.namedStyle === NamedStyleType.HEADING_2),
        check(`Abstand vor ${ptPx(12)} px, nach ${ptPx(6)} px`, `${HINT_PARAGRAPH} → Abstand Vor/Nach`, ['=Vor dem Gespräch', '=Im Gespräch'], (p) => near(p.spaceAbove, ptPx(12)) && near(p.spaceBelow, ptPx(6))),
      ],
    },
    {
      title: 'Fließtext',
      instruction: `Die beiden Textabsätze („Ein Vorstellungsgespräch …“ und „Achte auf …“):\nBlocksatz\nZeilenabstand 1,5 Zeilen (Mehrfacher Abstand 1,5)\nEinzug der ersten Zeile 0,5 cm (${px(0.5)})`,
      checks: [
        check('Blocksatz', 'Start → Ausrichtung → Blocksatz', ['Ein Vorstellungsgespräch', 'Achte auf eine'], (p) => isJustified(p)),
        check('Zeilenabstand 1,5', `${HINT_PARAGRAPH} → Zeilenabstand „Mehrfacher Abstand“ 1,5`, ['Ein Vorstellungsgespräch', 'Achte auf eine'], (p) => lineSpacingIs(p, 1.5)),
        check('Einzug erste Zeile 0,5 cm', `${HINT_PARAGRAPH} → Einzug „Erste Zeile“ ${px(0.5)}`, ['Ein Vorstellungsgespräch', 'Achte auf eine'], (p) => near(p.indentFirstLine, cmToPx(0.5), 2)),
      ],
    },
    {
      title: 'Fragenliste',
      instruction: `„Diese Fragen solltest du …“ wird fett.\nDie drei Fragen werden eine nummerierte Liste mit hängendem Einzug 0,75 cm (${px(0.75)}).`,
      checks: [
        check('Einleitungssatz fett', 'Start → „B“', 'Diese Fragen solltest', (p) => isBold(p)),
        check('Nummerierte Liste', 'Start → Liste mit Zahlen', ['Warum möchtest', 'Was weißt du', 'Wo liegen deine'], (p) => isNumberedList(p)),
        check('Hängender Einzug 0,75 cm', `${HINT_PARAGRAPH} → Hängender Einzug ${px(0.75)}`, ['Warum möchtest', 'Was weißt du', 'Wo liegen deine'], (p) => near(p.hanging, cmToPx(0.75), 2)),
      ],
    },
    {
      title: 'Tipp',
      instruction: `Der Tipp am Ende: zentriert, fett, gelb hinterlegt und mit einem Abstand vor von 18 pt (${ptPx(18)} px).`,
      checks: [
        check('Zentriert und fett', 'Start → Zentriert, „B“', 'Tipp: Plane', (p) => isCentered(p) && isBold(p)),
        check('Gelb hinterlegt', 'Start → Texthervorhebung → Gelb', 'Tipp: Plane', (p) => colorFamily(highlightOf(p)) === 'yellow'),
        check(`Abstand vor ${ptPx(18)} px`, `${HINT_PARAGRAPH} → Abstand Vor`, 'Tipp: Plane', (p) => near(p.spaceAbove, ptPx(18))),
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
    'Sie absolvieren ein Praktikum bei der Verbraucherzentrale im Bereich Energieberatung. Sie sollen einen Informationsflyer zum Thema „Durch richtiges Dämmen Heizkosten reduzieren“ anpassen. Der Text ist bereits vorhanden – Sie passen lediglich das Layout nach den folgenden Angaben an.\n\nDer Editor rechnet in Pixeln: 1 cm ≈ 37,8 px, 1 pt ≈ 1,33 px. Bei „Prüfen“ siehst du, welche Vorgaben schon stimmen; Tipps erscheinen erst bei Fehlern.',
  margins: { top: 2.5, bottom: 2, left: 2.5, right: 2.5 },
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
      title: '1 · Kopfzeile',
      instruction: 'Nachname, Vorname und Klasse oben in die Kopfzeile eintragen, dazu das Datum im Format TT.MM.JJ.',
      checks: nameLineChecks('header'),
    },
    {
      title: '2 · Seitenränder',
      instruction: `Links und rechts 2 cm (${px(2)}), oben 2,5 cm (${px(2.5)}), unten 2 cm (${px(2)}).`,
      checks: marginChecks({ top: 2.5, bottom: 2, left: 2, right: 2 }),
    },
    {
      title: '3 · Fließtext',
      instruction:
        'Gilt für alle Absätze mit Fließtext und die Aufzählung (nicht für Titel, Unterüberschriften und Tabelle):\nSchriftart Arial, Schriftgröße 10 pt\nBlocksatz (nur die drei Textabsätze)\nZeilenabstand 1,5 Zeilen (nur die drei Textabsätze)',
      checks: [
        check('Arial, 10 pt', 'Text markieren → Start → Schriftart und Schriftgröße', (d) => [...byText(...D_BODY, ...D_LIST)(d), ...D_SECOND(d)], (p) => fontOf(p) === 'Arial' && sizeOf(p) === 10),
        check('Blocksatz', 'Start → Ausrichtung → Blocksatz', (d) => [...byText(...D_BODY)(d), ...D_SECOND(d)], (p) => isJustified(p)),
        check('Zeilenabstand 1,5', `${HINT_PARAGRAPH} → Zeilenabstand „Mehrfacher Abstand“ 1,5`, (d) => [...byText(...D_BODY)(d), ...D_SECOND(d)], (p) => lineSpacingIs(p, 1.5)),
      ],
    },
    {
      title: '4 · Titel',
      instruction: '„Durch richtiges Dämmen Heizkosten reduzieren“: Times New Roman, 18 pt, fett, zentriert, orange Schriftfarbe (statt WordArt in Gold).',
      checks: [
        check('Times New Roman, 18 pt', 'Start → Schriftart und Schriftgröße', 'Durch richtiges Dämmen', (p) => fontOf(p) === 'Times New Roman' && sizeOf(p) === 18),
        check('Fett, zentriert, orange', 'Start → „B“, Zentriert, Schriftfarbe → Orange', 'Durch richtiges Dämmen', (p) => isBold(p) && isCentered(p) && colorIs(p, 'orange')),
      ],
    },
    {
      title: '5 · Unterüberschriften',
      instruction: `„Der Wärmedurchgangskoeffizient“, „U-Werte für Außenbauteile“ und „Vergleich der Heizkosten …“:\nTimes New Roman, 11 pt, fett\nunterstrichen\nAbstand nach 6 pt (${ptPx(6)} px)`,
      checks: [
        check('Times New Roman, 11 pt, fett', 'Start → Schriftart, Schriftgröße, „B“', D_HEADINGS, (p) => fontOf(p) === 'Times New Roman' && sizeOf(p) === 11 && isBold(p)),
        check('Unterstrichen', 'Start → „U“', D_HEADINGS, (p) => isUnderlined(p)),
        check(`Abstand nach ${ptPx(6)} px`, `${HINT_PARAGRAPH} → Abstand Nach`, D_HEADINGS, (p) => near(p.spaceBelow, ptPx(6))),
      ],
    },
    {
      title: '6 · Zweiter Absatz in zwei Spalten',
      instruction:
        'Nur der Absatz „Der Wärmedurchgangskoeffizient ist …“ steht in zwei gleich breiten Spalten:\nVor und nach dem Absatz je einen Abschnittsumbruch (Fortlaufend) einfügen (Einfügen → Umbrüche)\nFür diesen Abschnitt 2 Spalten mit Trennlinie einstellen (Rechtsklick → Abschnittseinstellungen, oben den richtigen Abschnitt wählen)\nManueller Spaltenumbruch vor „Die jeweilige Bauteildicke …“',
      checks: [
        check('Absatz zweispaltig', `Abschnittsumbrüche setzen, dann ${HINT_SECTION} → Spaltenanzahl 2`, D_SECOND, (p, d) => sectionOf(d, p)?.columns === 2),
        check('Trennlinie zwischen den Spalten', `${HINT_SECTION} → Trennlinie „Zwischen Spalten“`, D_SECOND, (p, d) => !!sectionOf(d, p)?.separator),
        check('Übriger Text bleibt einspaltig', 'Nur der Abschnitt mit dem zweiten Absatz bekommt 2 Spalten – prüfe die Abschnittsumbrüche', (d) => [...byText('Ein schlecht gedämmtes', 'Der U-Wert von einem')(d)], (p, d) => sectionOf(d, p)?.columns === 1 && sectionOf(d, D_SECOND(d)[0])?.columns === 2),
        docCheck('Spaltenumbruch vor „Die jeweilige Bauteildicke“', 'Cursor vor „Die jeweilige …“ setzen → Einfügen → Umbrüche → Spaltenumbruch', (d) => columnBreakBefore(d, 'Die jeweilige Bauteildicke')),
      ],
    },
    {
      title: '7 · Aufzählung',
      instruction: `Die drei U-Werte werden eine Aufzählung (Aufzählungszeichen •) mit Einzug links 0 cm und hängendem Einzug 0,75 cm (${px(0.75)}).`,
      checks: [
        check('Aufzählungszeichen', 'Start → Liste mit Punkten', D_LIST, (p) => isBulletList(p)),
        check('Hängender Einzug 0,75 cm, links 0 cm', `${HINT_PARAGRAPH} → Links 0, Hängender Einzug ${px(0.75)}`, D_LIST, (p) => near(p.hanging, cmToPx(0.75), 2) && near(p.indentStart ?? 0, 0)),
      ],
    },
    {
      title: '8 · Tabelle',
      instruction:
        'Text in der Tabelle: Arial, 10 pt\nErste Zeile fett und grau hinterlegt (Texthervorhebung)\n„vor Sanierung“ und „nach Sanierung“ unterstreichen\nZeile 3 und 5, Spalten 2–4: zentriert\nIn „W/(m2K)“ (Zeile 3 und 5) die 2 hochstellen (m²)',
      checks: [
        check('Tabellentext Arial, 10 pt', 'Tabelle markieren → Schriftart und Schriftgröße', cells(() => true), (p) => fontOf(p) === 'Arial' && sizeOf(p) === 10),
        check('Erste Zeile fett und grau hinterlegt', 'Zellen der ersten Zeile markieren → „B“, Texthervorhebung → Grau', cells((r) => r === 0), (p) => isBold(p) && colorFamily(highlightOf(p)) === 'gray'),
        check('„vor/nach Sanierung“ unterstrichen', 'Nur die beiden Wörter markieren → „U“', cells((r, c) => (r === 1 || r === 3) && c === 0), (p) => rangeUnderlined(p, 'vor Sanierung') || rangeUnderlined(p, 'nach Sanierung')),
        check('Werte zentriert', 'Zellen markieren → Ausrichtung → Zentriert', cells((r, c) => (r === 2 || r === 4) && c > 0), (p) => isCentered(p)),
        check('m² hochgestellt', '„2“ in W/(m2K) markieren → Hochgestellt (X²)', cells((r, c) => (r === 2 || r === 4) && c === 1), (p) => superscriptAfter(p, 'W/(m')),
      ],
    },
    {
      title: '9 · Fußnote',
      instruction:
        'Word setzt Fußnoten automatisch – hier baust du sie selbst:\nHinter „Wärmedurchgangskoeffizient“ im zweiten Absatz eine hochgestellte 1 eintippen\nLetzte Zeile („1 wird häufig …“): Schriftgröße 8, die 1 am Anfang hochstellen',
      checks: [
        check('Hochgestellte 1 im zweiten Absatz', 'Cursor hinter „…koeffizient“ → 1 tippen, markieren → Hochgestellt (X²)', D_SECOND, (p) => p.text.startsWith('Der Wärmedurchgangskoeffizient1') && superscriptAfter(p, 'Der Wärmedurchgangskoeffizient')),
        check('Fußnotentext 8 pt, 1 hochgestellt', 'Zeile markieren → Schriftgröße 8; dann nur die 1 → Hochgestellt', (d) => [d.paragraphs.find((p) => /wird häufig auch als U-Wert/.test(p.text))], (p) => sizeOf(p) === 8 && isSuperscript(p.charStyles[0])),
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
      title: '1 · Fußzeile',
      instruction: 'Name, Klasse und Datum (TT.MM.JJ) in die Fußzeile eintragen.',
      checks: nameLineChecks('footer', FOOTNOTE_TEXT),
    },
    {
      title: '2 · Seitenränder',
      instruction: `Alle Seitenränder 1 cm (${px(1)}).`,
      checks: marginChecks({ top: 1, bottom: 1, left: 1, right: 1 }),
    },
    {
      title: '3 · Fließtext und Tabelle',
      instruction: 'Alle Absätze außer den Überschriften sowie der Tabellentext: Arial, 11 pt.',
      checks: [
        check(
          'Fließtext Arial, 11 pt',
          'Text markieren → Start → Schriftart und Schriftgröße',
          (d) => [...byText('Ihr erstes eigenes', ...S_LIST, 'Ihre Sparkasse berät')(d), ...S_MOBILE(d)],
          (p) => fontOf(p) === 'Arial' && sizeOf(p) === 11,
        ),
        check('Tabellentext Arial, 11 pt', 'Tabelle markieren → Schriftart und Schriftgröße', cells(() => true), (p) => fontOf(p) === 'Arial' && sizeOf(p) === 11),
      ],
    },
    {
      title: '4 · Hauptüberschrift',
      instruction: '„PrivatKonto Young“: Verdana, 26 pt, fett, rote Schriftfarbe, zentriert (statt WordArt).',
      checks: [
        check('Verdana, 26 pt', 'Start → Schriftart und Schriftgröße', '=PrivatKonto Young', (p) => fontOf(p) === 'Verdana' && sizeOf(p) === 26),
        check('Fett, rot, zentriert', 'Start → „B“, Schriftfarbe → Rot, Zentriert', '=PrivatKonto Young', (p) => isBold(p) && colorIs(p, 'red') && isCentered(p)),
      ],
    },
    {
      title: '5 · Unterüberschriften',
      instruction: '„Ihre Vorteile im Überblick“, „Mobiles Bezahlen“, „Preisvergleich“: Arial, fett, 12 pt.',
      checks: [check('Arial, 12 pt, fett', 'Start → Schriftart, Schriftgröße, „B“', S_HEADINGS, (p) => fontOf(p) === 'Arial' && sizeOf(p) === 12 && isBold(p))],
    },
    {
      title: '6 · Vorteile als Aufzählung',
      instruction: `Die fünf Vorteile: Aufzählung mit Punkt, Einzug links 0 cm, hängender Einzug 0,75 cm (${px(0.75)}).`,
      checks: [
        check('Aufzählungszeichen', 'Start → Liste mit Punkten', S_LIST, (p) => isBulletList(p)),
        check('Hängender Einzug 0,75 cm, links 0 cm', `${HINT_PARAGRAPH} → Links 0, Hängender Einzug ${px(0.75)}`, S_LIST, (p) => near(p.hanging, cmToPx(0.75), 2) && near(p.indentStart ?? 0, 0)),
      ],
    },
    {
      title: '7 · Mobiles Bezahlen in zwei Spalten',
      instruction: `Absatz nach „Mobiles Bezahlen“:\nzwei Spalten (vorher und nachher Abschnittsumbruch „Fortlaufend“ einfügen)\nTrennlinie zwischen den Spalten\nSpaltenabstand 1 cm (${px(1)})\nSpaltenumbruch vor „Zusätzlich …“`,
      checks: [
        check('Absatz zweispaltig', `Abschnittsumbrüche setzen, dann ${HINT_SECTION} → Spaltenanzahl 2`, S_MOBILE, (p, d) => sectionOf(d, p)?.columns === 2),
        check('Trennlinie und Abstand 1 cm', `${HINT_SECTION} → Trennlinie „Zwischen Spalten“, Spaltenabstand ${px(1)}`, S_MOBILE, (p, d) => !!sectionOf(d, p)?.separator && near(sectionOf(d, p)?.gap, cmToPx(1))),
        check('Übriger Text bleibt einspaltig', 'Nur der Abschnitt „Mobiles Bezahlen“ bekommt 2 Spalten – prüfe die Abschnittsumbrüche', byText('Ihr erstes eigenes', 'Ihre Sparkasse berät'), (p, d) => sectionOf(d, p)?.columns === 1 && sectionOf(d, S_MOBILE(d)[0])?.columns === 2),
        docCheck('Spaltenumbruch vor „Zusätzlich“', 'Cursor vor „Zusätzlich“ setzen → Einfügen → Umbrüche → Spaltenumbruch', (d) => columnBreakBefore(d, 'Zusätzlich können Sie')),
      ],
    },
    {
      title: '8 · Tabelle',
      instruction: 'Spaltenüberschriften (Zeile 1): fett und zentriert\nSpalten- und Zeilenüberschriften (Zeile 1 und Spalte 1): dunkelrote Schriftfarbe\nAlle Werte (Zeile 2–6, Spalte 2–4): zentriert',
      checks: [
        check('Spaltenüberschriften fett, zentriert', 'Zellen der ersten Zeile markieren → „B“, Zentriert', cells((r, c) => r === 0 && c > 0), (p) => isBold(p) && isCentered(p)),
        check('Überschriften dunkelrot', 'Zellen markieren → Schriftfarbe → Dunkelrot', cells((r, c) => r === 0 || c === 0), (p) => colorIs(p, 'red')),
        check('Werte zentriert', 'Wertezellen markieren → Zentriert', cells((r, c) => r > 0 && c > 0), (p) => isCentered(p)),
      ],
    },
    {
      title: '9 · Fußnote',
      instruction: 'Hinter „0,00 EUR“ bei der Kontoführung des Premium-Kontos (Zeile 2, Spalte 4) eine hochgestellte 1 einfügen.\nIn die Fußzeile zusätzlich: „1 mtl. Mindestgeldeingang 5.000 EUR, sonst 12,90 EUR“.',
      checks: [
        check('Hochgestellte 1 hinter 0,00 EUR', 'In die Zelle klicken, 1 tippen, markieren → Hochgestellt (X²)', cells((r, c) => r === 1 && c === 3), (p) => p.text.trim() === '0,00 EUR1' && superscriptAfter(p, '0,00 EUR')),
        docCheck('Fußnotentext in der Fußzeile', 'Fußzeile öffnen → Text eintippen', (d) => /Mindestgeldeingang\s*5\.000\s*EUR/i.test(d.footerText)),
      ],
    },
  ],
};

export const ADVANCED_TASKS: LayoutTask[] = [merkblatt, daemmung, sparkasse];
