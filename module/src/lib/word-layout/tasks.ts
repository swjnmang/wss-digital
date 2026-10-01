import { NamedStyleType } from '@univerjs/core';
import {
  colorIs,
  fontOf,
  highlightOf,
  colorFamily,
  isBold,
  isCentered,
  isItalic,
  isJustified,
  isRight,
  isUnderlined,
  sizeOf,
  type LayoutDocument,
} from './grading';
import type { LayoutTask } from './types';
import { check, H, isBulletList, isNumberedList, PALETTE_COLUMN } from './checks';
import { ADVANCED_TASKS } from './tasks-advanced';

// ---------- Aufgabe 1: Einladung ----------

const einladung: LayoutTask = {
  id: 'einladung',
  title: 'Einladung zum Sommerfest',
  difficulty: 'einfach',
  intro: 'Schriftgröße, Farbe, Ausrichtung und Aufzählung – die Grundlagen der Textformatierung.',
  auftrag:
    'Die Schülervertretung hat eine Einladung zum Sommerfest geschrieben. Der Text steht schon im Dokument, sieht aber noch unfertig aus. Gestalte ihn Auftrag für Auftrag. Markiere immer zuerst den Text und wähle dann das Werkzeug.',
  paragraphs: [
    { text: 'Einladung zum Sommerfest' },
    { text: 'Samstag, 12. Juli 2026, ab 15 Uhr · Schulhof der WSS' },
    { text: 'Liebe Schülerinnen und Schüler, liebe Eltern, die Schülervertretung lädt euch herzlich zum diesjährigen Sommerfest ein. Wir feiern den Abschluss des Schuljahres gemeinsam mit allen Klassen und freuen uns auf viele Gäste.' },
    { text: 'Für das leibliche Wohl ist bestens gesorgt. Jede Klasse gestaltet einen eigenen Stand und präsentiert ein kleines Programm. Der Erlös des Festes kommt der Klassenkasse zugute.' },
    { text: 'Kuchenbuffet der Elternvertretung' },
    { text: 'Spiele und Wettbewerbe auf dem Sportplatz' },
    { text: 'Live-Musik der Schulband' },
    { text: 'Anmeldung bis zum 1. Juli im Sekretariat!' },
  ],
  steps: [
    {
      title: 'Überschrift: Größe und Fettdruck',
      target: '1. Zeile – „Einladung zum Sommerfest“',
      instruction: 'Schriftgröße 24\nFett',
      checks: [
        check('Schriftgröße 24', `${H.selectLine}, dann ${H.size(24)}`, 'Einladung zum', (p) => sizeOf(p) === 24),
        check('Fett', `${H.selectLine}, dann ${H.bold}`, 'Einladung zum', (p) => isBold(p)),
      ],
    },
    {
      title: 'Überschrift: Ausrichtung und Farbe',
      target: '1. Zeile – „Einladung zum Sommerfest“',
      instruction: 'Zentriert\nSchriftfarbe Blau (Farbpalette: 2. Spalte, beliebiger Farbton)',
      checks: [
        check('Zentriert', H.align('Zentriert'), 'Einladung zum', (p) => isCentered(p)),
        check('Schriftfarbe Blau', `${H.selectLine}, dann ${H.color('Blau', PALETTE_COLUMN.blau)}`, 'Einladung zum', (p) => colorIs(p, 'blue')),
      ],
    },
    {
      title: 'Datumszeile',
      target: '2. Zeile – „Samstag, 12. Juli 2026, ab 15 Uhr …“',
      instruction: 'Rechtsbündig\nKursiv',
      checks: [
        check('Rechtsbündig', H.align('Rechtsbündig'), 'Samstag, 12. Juli', (p) => isRight(p)),
        check('Kursiv', `${H.selectLine}, dann ${H.italic}`, 'Samstag, 12. Juli', (p) => isItalic(p)),
      ],
    },
    {
      title: 'Fließtext',
      target: '3. und 4. Absatz – „Liebe Schülerinnen …“ bis „… Klassenkasse zugute.“',
      instruction: 'Schriftart Verdana\nSchriftgröße 10\nBlocksatz',
      checks: [
        check('Schriftart Verdana', `${H.selectLines}, dann ${H.font('Verdana')}`, ['Liebe Schülerinnen', 'Für das leibliche'], (p) => fontOf(p) === 'Verdana'),
        check('Schriftgröße 10', `${H.selectLines}, dann ${H.size(10)}`, ['Liebe Schülerinnen', 'Für das leibliche'], (p) => sizeOf(p) === 10),
        check('Blocksatz', H.align('Blocksatz'), ['Liebe Schülerinnen', 'Für das leibliche'], (p) => isJustified(p)),
      ],
    },
    {
      title: 'Aufzählung',
      target: '5. bis 7. Zeile – „Kuchenbuffet …“, „Spiele und Wettbewerbe …“, „Live-Musik …“',
      instruction: 'Alle drei Zeilen als Aufzählung mit Punkten',
      checks: [check('Aufzählung mit Punkten', `${H.selectLines}, dann ${H.bullets}`, ['Kuchenbuffet', 'Spiele und', 'Live-Musik'], (p) => isBulletList(p))],
    },
    {
      title: 'Hinweis hervorheben',
      target: 'Letzte Zeile – „Anmeldung bis zum 1. Juli im Sekretariat!“',
      instruction: 'Fett\nSchriftfarbe Rot (Farbpalette: 3. Spalte)\nGelb hinterlegt (Texthintergrundfarbe, 5. Spalte)',
      checks: [
        check('Fett', `${H.selectLine}, dann ${H.bold}`, 'Anmeldung bis', (p) => isBold(p)),
        check('Schriftfarbe Rot', H.color('Rot', PALETTE_COLUMN.rot), 'Anmeldung bis', (p) => colorIs(p, 'red')),
        check('Gelb hinterlegt', H.highlight('Gelb', PALETTE_COLUMN.gelb), 'Anmeldung bis', (p) => colorFamily(highlightOf(p)) === 'yellow'),
      ],
    },
  ],
};

// ---------- Aufgabe 2: Formatvorlagen ----------

const formatvorlagen: LayoutTask = {
  id: 'formatvorlagen',
  title: 'Formatvorlagen: Praktikumsleitfaden',
  difficulty: 'einfach',
  intro: 'Titel, Überschriften und Nummerierung mit Formatvorlagen statt von Hand gestalten.',
  auftrag:
    'Du gestaltest einen Leitfaden für Praktikantinnen und Praktikanten. In Word nutzt man für Titel und Überschriften Formatvorlagen – so sieht das Dokument einheitlich aus und hat eine klare Gliederung. Die Formatvorlagen findest du in der Start-Leiste im Feld „Normal“.',
  paragraphs: [
    { text: 'Praktikum in der Verbraucherzentrale' },
    { text: 'Ein Leitfaden für Schülerinnen und Schüler' },
    { text: 'Vor dem Praktikum' },
    { text: 'Ein Praktikum gibt dir einen ersten Einblick in die Arbeitswelt. Informiere dich deshalb rechtzeitig über den Betrieb und die Aufgaben, die dich erwarten.' },
    { text: 'Bewerbung' },
    { text: 'Schreibe eine kurze Bewerbung und füge deinen Lebenslauf bei.' },
    { text: 'Vorbereitung' },
    { text: 'Kläre vorab, wann du am ersten Tag erscheinen sollst und wen du ansprechen kannst.' },
    { text: 'Während des Praktikums' },
    { text: 'Zeige Interesse und Zuverlässigkeit. Diese drei Schritte helfen dir dabei:' },
    { text: 'Pünktlich ankommen' },
    { text: 'Aufgaben notieren' },
    { text: 'Fragen stellen' },
  ],
  steps: [
    {
      title: 'Titel',
      target: '1. Zeile – „Praktikum in der Verbraucherzentrale“',
      instruction: 'Formatvorlage „Titel“\nZentriert',
      checks: [
        check('Formatvorlage „Titel“', `Cursor in die Zeile setzen, dann ${H.style('Titel')}`, 'Praktikum in der', (p) => p.namedStyle === NamedStyleType.TITLE),
        check('Zentriert', H.align('Zentriert'), 'Praktikum in der', (p) => isCentered(p)),
      ],
    },
    {
      title: 'Untertitel',
      target: '2. Zeile – „Ein Leitfaden für Schülerinnen und Schüler“',
      instruction: 'Formatvorlage „Untertitel“\nZentriert',
      checks: [
        check('Formatvorlage „Untertitel“', H.style('Untertitel'), 'Ein Leitfaden', (p) => p.namedStyle === NamedStyleType.SUBTITLE),
        check('Zentriert', H.align('Zentriert'), 'Ein Leitfaden', (p) => isCentered(p)),
      ],
    },
    {
      title: 'Hauptüberschriften',
      target: '„Vor dem Praktikum“ (3. Zeile) und „Während des Praktikums“ (9. Zeile)',
      instruction: 'Beide Zeilen: Formatvorlage „Überschrift 1“',
      checks: [check('Formatvorlage „Überschrift 1“', H.style('Überschrift 1'), ['=Vor dem Praktikum', '=Während des Praktikums'], (p) => p.namedStyle === NamedStyleType.HEADING_1)],
    },
    {
      title: 'Unterüberschriften',
      target: '„Bewerbung“ (5. Zeile) und „Vorbereitung“ (7. Zeile)',
      instruction: 'Beide Zeilen: Formatvorlage „Überschrift 2“',
      checks: [check('Formatvorlage „Überschrift 2“', H.style('Überschrift 2'), ['=Bewerbung', '=Vorbereitung'], (p) => p.namedStyle === NamedStyleType.HEADING_2)],
    },
    {
      title: 'Nummerierte Liste',
      target: 'Die letzten drei Zeilen – „Pünktlich ankommen“, „Aufgaben notieren“, „Fragen stellen“',
      instruction: 'Als nummerierte Liste 1., 2., 3.',
      checks: [check('Nummerierte Liste', `${H.selectLines}, dann ${H.numbers}`, ['Pünktlich ankommen', 'Aufgaben notieren', 'Fragen stellen'], (p) => isNumberedList(p))],
    },
    {
      title: 'Fließtext',
      target: 'Die drei Textabsätze – „Ein Praktikum gibt …“, „Schreibe eine kurze …“, „Kläre vorab …“',
      instruction: 'Blocksatz (Schriftgröße bleibt 11)',
      checks: [check('Blocksatz', `Jeden Absatz markieren, dann ${H.align('Blocksatz')}`, ['Ein Praktikum gibt', 'Schreibe eine kurze', 'Kläre vorab'], (p) => isJustified(p))],
    },
  ],
};

// ---------- Aufgabe 3: Flyer ----------

const flyer: LayoutTask = {
  id: 'flyer-fahrrad',
  title: 'Flyer: Fahrradwerkstatt',
  difficulty: 'mittel',
  intro: 'Schriftarten, Farben, Hervorhebungen und Aufzählung kombinieren.',
  auftrag: 'Die Technik-AG betreibt eine Fahrradwerkstatt und braucht einen Flyer. Der Text steht schon im Dokument. Gestalte daraus einen ansprechenden Flyer.',
  paragraphs: [
    { text: 'Die Schul-Fahrradwerkstatt' },
    { text: 'Reparieren statt wegwerfen!' },
    { text: 'Ein Fahrrad ist nur so gut wie seine Wartung. Deshalb gibt es an unserer Schule eine eigene Fahrradwerkstatt, die von Schülerinnen und Schülern der Technik-AG betreut wird.' },
    { text: 'Unser Angebot' },
    { text: 'Wir prüfen Bremsen, Licht und Reifendruck, tauschen Schläuche und Mäntel und stellen die Gangschaltung neu ein. Kleine Reparaturen sind kostenlos, für Ersatzteile zahlst du nur den Einkaufspreis.' },
    { text: 'Öffnungszeiten' },
    { text: 'Dienstag: 12:30 – 13:15 Uhr' },
    { text: 'Mittwoch: 12:30 – 13:15 Uhr' },
    { text: 'Donnerstag: 12:30 – 14:00 Uhr' },
    { text: 'Fragen? Sprich uns einfach an!' },
  ],
  steps: [
    {
      title: 'Titel: Schrift',
      target: '1. Zeile – „Die Schul-Fahrradwerkstatt“',
      instruction: 'Schriftart Times New Roman\nSchriftgröße 28\nFett',
      checks: [
        check('Times New Roman', `${H.selectLine}, dann ${H.font('Times New Roman')}`, 'Die Schul-Fahrrad', (p) => fontOf(p) === 'Times New Roman'),
        check('Schriftgröße 28', H.size(28), 'Die Schul-Fahrrad', (p) => sizeOf(p) === 28),
        check('Fett', H.bold, 'Die Schul-Fahrrad', (p) => isBold(p)),
      ],
    },
    {
      title: 'Titel: Ausrichtung und Farbe',
      target: '1. Zeile – „Die Schul-Fahrradwerkstatt“',
      instruction: 'Zentriert\nSchriftfarbe Orange (Farbpalette: 4. Spalte)',
      checks: [
        check('Zentriert', H.align('Zentriert'), 'Die Schul-Fahrrad', (p) => isCentered(p)),
        check('Schriftfarbe Orange', H.color('Orange', PALETTE_COLUMN.orange), 'Die Schul-Fahrrad', (p) => colorIs(p, 'orange')),
      ],
    },
    {
      title: 'Slogan',
      target: '2. Zeile – „Reparieren statt wegwerfen!“',
      instruction: 'Zentriert\nKursiv\nSchriftfarbe Grau (Farbpalette: 1. Spalte, ein Grauton)',
      checks: [
        check('Zentriert', H.align('Zentriert'), 'Reparieren statt', (p) => isCentered(p)),
        check('Kursiv', H.italic, 'Reparieren statt', (p) => isItalic(p)),
        check('Schriftfarbe Grau', H.color('Grau', PALETTE_COLUMN.grau), 'Reparieren statt', (p) => colorIs(p, 'gray')),
      ],
    },
    {
      title: 'Zwischenüberschriften',
      target: '„Unser Angebot“ (4. Zeile) und „Öffnungszeiten“ (6. Zeile)',
      instruction: 'Schriftart Verdana, Schriftgröße 14\nFett und unterstrichen',
      checks: [
        check('Verdana, 14 pt', `${H.font('Verdana')}, ${H.size(14)}`, ['=Unser Angebot', '=Öffnungszeiten'], (p) => fontOf(p) === 'Verdana' && sizeOf(p) === 14),
        check('Fett und unterstrichen', `${H.bold} und ${H.underline}`, ['=Unser Angebot', '=Öffnungszeiten'], (p) => isBold(p) && isUnderlined(p)),
      ],
    },
    {
      title: 'Fließtext',
      target: '3. und 5. Zeile – Absätze „Ein Fahrrad ist …“ und „Wir prüfen Bremsen …“',
      instruction: 'Schriftart Verdana, Schriftgröße 10\nBlocksatz',
      checks: [
        check('Verdana, 10 pt', `${H.font('Verdana')}, ${H.size(10)}`, ['Ein Fahrrad ist', 'Wir prüfen Bremsen'], (p) => fontOf(p) === 'Verdana' && sizeOf(p) === 10),
        check('Blocksatz', H.align('Blocksatz'), ['Ein Fahrrad ist', 'Wir prüfen Bremsen'], (p) => isJustified(p)),
      ],
    },
    {
      title: 'Öffnungszeiten als Aufzählung',
      target: '7. bis 9. Zeile – Dienstag, Mittwoch, Donnerstag',
      instruction: 'Alle drei Zeilen als Aufzählung mit Punkten',
      checks: [check('Aufzählung mit Punkten', `${H.selectLines}, dann ${H.bullets}`, ['Dienstag:', 'Mittwoch:', 'Donnerstag:'], (p) => isBulletList(p))],
    },
    {
      title: 'Kontaktzeile',
      target: 'Letzte Zeile – „Fragen? Sprich uns einfach an!“',
      instruction: 'Zentriert und fett\nGelb hinterlegt (Texthintergrundfarbe, 5. Spalte)',
      checks: [
        check('Zentriert und fett', `${H.align('Zentriert')}; ${H.bold}`, 'Fragen? Sprich', (p) => isCentered(p) && isBold(p)),
        check('Gelb hinterlegt', H.highlight('Gelb', PALETTE_COLUMN.gelb), 'Fragen? Sprich', (p) => colorFamily(highlightOf(p)) === 'yellow'),
      ],
    },
  ],
};

// ---------- Aufgabe 4: Tabelle ----------

const tabelle: LayoutTask = {
  id: 'preisliste-tabelle',
  title: 'Tabelle: Preisliste',
  difficulty: 'mittel',
  intro: 'Eine Tabelle einfügen, befüllen und formatieren.',
  auftrag: 'Für die Fahrradwerkstatt soll eine Preisliste als Tabelle entstehen. Die Überschrift steht schon im Dokument, die Tabelle fügst du selbst ein.',
  paragraphs: [
    { text: 'Preisliste der Fahrradwerkstatt' },
    { text: 'Alle Preise gelten für Schülerinnen und Schüler der WSS.' },
    { text: '' },
  ],
  steps: [
    {
      title: 'Überschrift',
      target: '1. Zeile – „Preisliste der Fahrradwerkstatt“',
      instruction: 'Formatvorlage „Überschrift 1“\nZentriert',
      checks: [
        check('Formatvorlage „Überschrift 1“', H.style('Überschrift 1'), 'Preisliste der', (p) => p.namedStyle === NamedStyleType.HEADING_1),
        check('Zentriert', H.align('Zentriert'), 'Preisliste der', (p) => isCentered(p)),
      ],
    },
    {
      title: 'Tabelle einfügen',
      target: 'Leere 3. Zeile – unter „Alle Preise gelten …“',
      instruction: 'Tabelle mit 3 Spalten und 4 Zeilen einfügen',
      checks: [
        {
          label: 'Tabelle mit 3 Spalten und 4 Zeilen',
          hint: 'Cursor in die leere Zeile setzen → Einfügen → Tabelle (Raster-Symbol) → Tabelle einfügen → Zeilenanzahl 4, Spaltenanzahl 3 → OK',
          test: (d) => d.tables.some((t) => t.cols === 3 && t.rows === 4),
        },
      ],
    },
    {
      title: 'Tabelle ausfüllen',
      target: 'In die neue Tabelle, Zeile für Zeile',
      instruction: 'Zuerst in die erste Zelle (oben links) klicken bzw. tippen\nZeile 1: Leistung | Dauer | Preis\nZeile 2: Schlauch wechseln | 15 Min. | 5,00 €\nZeile 3: Bremsen einstellen | 20 Min. | 8,00 €\nZeile 4: Licht prüfen | 10 Min. | kostenlos',
      checks: [
        check('Zeile 1 ausgefüllt', 'In die erste Zelle klicken und tippen; mit Tab springst du zur nächsten Zelle (Tablet: in die Zelle tippen)', ['=Leistung', '=Dauer', '=Preis'], () => true),
        check('Zeilen 2–4 ausgefüllt', 'Schreibweise genau wie vorgegeben', ['=Schlauch wechseln', '=Bremsen einstellen', '=Licht prüfen', '=15 Min.', '=20 Min.', '=10 Min.', '=5,00 €', '=8,00 €', '=kostenlos'], () => true),
      ],
    },
    {
      title: 'Tabelle formatieren',
      target: 'Kopfzeile (Leistung, Dauer, Preis) und Spalte „Preis“',
      instruction: 'Kopfzeile fett\nAlle drei Preise (5,00 €, 8,00 €, kostenlos) rechtsbündig',
      checks: [
        check('Kopfzeile fett', `Die drei Zellen der ersten Zeile markieren, dann ${H.bold}`, ['=Leistung', '=Dauer', '=Preis'], (p) => isBold(p)),
        check('Preise rechtsbündig', `Die drei Preiszellen markieren, dann ${H.align('Rechtsbündig')}`, ['=5,00 €', '=8,00 €', '=kostenlos'], (p) => isRight(p)),
      ],
    },
  ],
};

// ---------- Aufgabe 5: Abschluss ----------

const bibliothek: LayoutTask = {
  id: 'flyer-bibliothek',
  title: 'Abschluss: Flyer Stadtbibliothek',
  difficulty: 'schwer',
  intro: 'Alles zusammen: Formatvorlagen, Schrift, Ausrichtung, Liste und Hervorhebung.',
  auftrag: 'Die Stadtbibliothek braucht einen Flyer für ihre neue Kinder- und Jugendabteilung. Gestalte den vorgegebenen Text selbstständig. Die Aufträge sind knapp – überlege, welche Werkzeuge du brauchst.',
  paragraphs: [
    { text: 'Lesen macht schlau' },
    { text: 'Die neue Kinder- und Jugendabteilung' },
    { text: 'Neu im Angebot' },
    { text: 'Ab sofort finden junge Leserinnen und Leser in der Stadtbibliothek eine eigene Abteilung mit Romanen, Comics, Hörbüchern und Spielen. Bequeme Sitzecken laden zum Schmökern ein.' },
    { text: 'Unsere Aktionen' },
    { text: 'Jeden Monat gibt es Lesungen, Workshops und einen Spieleabend. Die Teilnahme ist kostenlos, und niemand muss sich vorher anmelden.' },
    { text: 'Lesung für Grundschulkinder' },
    { text: 'Comic-Workshop für Jugendliche' },
    { text: 'Spieleabend für alle' },
    { text: 'Tipp: Mit dem Bibliotheksausweis ist die digitale Leihe kostenlos!' },
    { text: 'Stadtbibliothek · Musterstraße 1 · www.stadtbibliothek.example' },
  ],
  steps: [
    {
      title: 'Titel',
      target: '1. Zeile – „Lesen macht schlau“',
      instruction: 'Comic Sans MS, 26 pt\nFett, zentriert\nSchriftfarbe Grün (Farbpalette: 6. Spalte)',
      checks: [
        check('Comic Sans MS, 26 pt', `${H.font('Comic Sans MS')}, ${H.size(26)}`, 'Lesen macht schlau', (p) => fontOf(p) === 'Comic Sans MS' && sizeOf(p) === 26),
        check('Fett und zentriert', `${H.bold}; ${H.align('Zentriert')}`, 'Lesen macht schlau', (p) => isBold(p) && isCentered(p)),
        check('Schriftfarbe Grün', H.color('Grün', PALETTE_COLUMN.gruen), 'Lesen macht schlau', (p) => colorIs(p, 'green')),
      ],
    },
    {
      title: 'Untertitel',
      target: '2. Zeile – „Die neue Kinder- und Jugendabteilung“',
      instruction: 'Formatvorlage „Untertitel“\nKursiv und zentriert',
      checks: [
        check('Formatvorlage „Untertitel“', H.style('Untertitel'), 'Die neue Kinder', (p) => p.namedStyle === NamedStyleType.SUBTITLE),
        check('Kursiv und zentriert', `${H.italic}; ${H.align('Zentriert')}`, 'Die neue Kinder', (p) => isItalic(p) && isCentered(p)),
      ],
    },
    {
      title: 'Zwischenüberschriften',
      target: '„Neu im Angebot“ (3. Zeile) und „Unsere Aktionen“ (5. Zeile)',
      instruction: 'Formatvorlage „Überschrift 2“\nSchriftfarbe Blau (Farbpalette: 2. Spalte)',
      checks: [
        check('Formatvorlage „Überschrift 2“', H.style('Überschrift 2'), ['=Neu im Angebot', '=Unsere Aktionen'], (p) => p.namedStyle === NamedStyleType.HEADING_2),
        check('Schriftfarbe Blau', H.color('Blau', PALETTE_COLUMN.blau), ['=Neu im Angebot', '=Unsere Aktionen'], (p) => colorIs(p, 'blue')),
      ],
    },
    {
      title: 'Fließtext',
      target: '4. und 6. Zeile – Absätze „Ab sofort finden …“ und „Jeden Monat gibt …“',
      instruction: 'Times New Roman, 12 pt\nBlocksatz',
      checks: [
        check('Times New Roman, 12 pt', `${H.font('Times New Roman')}, ${H.size(12)}`, ['Ab sofort finden', 'Jeden Monat gibt'], (p) => fontOf(p) === 'Times New Roman' && sizeOf(p) === 12),
        check('Blocksatz', H.align('Blocksatz'), ['Ab sofort finden', 'Jeden Monat gibt'], (p) => isJustified(p)),
      ],
    },
    {
      title: 'Aktionen als Aufzählung',
      target: '7. bis 9. Zeile – Lesung, Comic-Workshop, Spieleabend',
      instruction: 'Aufzählung mit Punkten',
      checks: [check('Aufzählung mit Punkten', `${H.selectLines}, dann ${H.bullets}`, ['Lesung für', 'Comic-Workshop', 'Spieleabend für'], (p) => isBulletList(p))],
    },
    {
      title: 'Tipp hervorheben',
      target: '10. Zeile – „Tipp: Mit dem Bibliotheksausweis …“',
      instruction: 'Zentriert und fett\nGelb hinterlegt (Texthintergrundfarbe, 5. Spalte)',
      checks: [
        check('Zentriert und fett', `${H.align('Zentriert')}; ${H.bold}`, 'Tipp: Mit dem', (p) => isCentered(p) && isBold(p)),
        check('Gelb hinterlegt', H.highlight('Gelb', PALETTE_COLUMN.gelb), 'Tipp: Mit dem', (p) => colorFamily(highlightOf(p)) === 'yellow'),
      ],
    },
    {
      title: 'Adresszeile',
      target: 'Letzte Zeile – „Stadtbibliothek · Musterstraße 1 …“',
      instruction: 'Rechtsbündig\nSchriftgröße 9\nSchriftfarbe Grau (Farbpalette: 1. Spalte)',
      checks: [
        check('Rechtsbündig, 9 pt', `${H.align('Rechtsbündig')}; ${H.size(9)}`, 'Stadtbibliothek ·', (p) => isRight(p) && sizeOf(p) === 9),
        check('Schriftfarbe Grau', H.color('Grau', PALETTE_COLUMN.grau), 'Stadtbibliothek ·', (p) => colorIs(p, 'gray')),
      ],
    },
  ],
};

export const LAYOUT_TASKS: LayoutTask[] = [einladung, formatvorlagen, flyer, tabelle, bibliothek, ...ADVANCED_TASKS];

export function getLayoutTask(id: string): LayoutTask | undefined {
  return LAYOUT_TASKS.find((t) => t.id === id);
}

// Hilfsfunktion, damit Prüfungen auch extern ausgewertet werden können.
export function runLayoutChecks(task: LayoutTask, doc: LayoutDocument) {
  return task.steps.map((step) => ({
    step,
    results: step.checks.map((c) => ({ check: c, success: c.test(doc) })),
  }));
}
