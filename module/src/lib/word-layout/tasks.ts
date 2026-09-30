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
  type LayoutParagraph,
} from './grading';
import type { LayoutCheck, LayoutTask } from './types';

/** Prüfung für einen oder mehrere Absätze (Anfang des Textes identifiziert sie); alle müssen passen. */
function check(label: string, hint: string, prefixes: string | string[], test: (p: LayoutParagraph, d: LayoutDocument) => boolean): LayoutCheck {
  const list = Array.isArray(prefixes) ? prefixes : [prefixes];
  return {
    label,
    hint,
    test: (d) => list.every((prefix) => { const p = d.find(prefix); return !!p && test(p, d); }),
  };
}

const isNumberedList = (p: LayoutParagraph) => p.isList && p.listType !== 'BULLET_LIST' && !/CHECK|TASK/i.test(p.listType);
const isBulletList = (p: LayoutParagraph) => p.isList && p.listType === 'BULLET_LIST';

// ---------- Aufgabe 1: Einladung ----------

const einladung: LayoutTask = {
  id: 'einladung',
  title: 'Einladung zum Sommerfest',
  difficulty: 'einfach',
  intro: 'Schriftgröße, Farbe, Ausrichtung und Aufzählung – die Grundlagen der Textformatierung.',
  auftrag: 'Die Schülervertretung hat eine Einladung zum Sommerfest geschrieben. Der Text steht bereits im Dokument, er sieht aber noch unfertig aus. Gestalte die Einladung nach den Arbeitsaufträgen. Markiere dazu jeweils den Absatz (Dreifachklick) und nutze die Werkzeuge der Start-Leiste. Mehrere Zeilen markierst du, indem du mit gedrückter Maustaste von vor der ersten bis hinter die letzte Zeile ziehst.',
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
      title: 'Überschrift',
      instruction: 'Die Überschrift „Einladung zum Sommerfest“ soll zentriert, fett, in Schriftgröße 24 und in blauer Schriftfarbe erscheinen.',
      checks: [
        check('Überschrift zentriert', 'Start → Ausrichtung (Symbol mit Linien) → Zentriert', 'Einladung zum', (p) => isCentered(p)),
        check('Überschrift fett', 'Start → „B“', 'Einladung zum', (p) => isBold(p)),
        check('Schriftgröße 24', 'Start → Schriftgröße', 'Einladung zum', (p) => sizeOf(p) === 24),
        check('Schriftfarbe blau', 'Start → Schriftfarbe („A“ mit Farbbalken) → Blau', 'Einladung zum', (p) => colorIs(p, 'blue')),
      ],
    },
    {
      title: 'Datumszeile',
      instruction: 'Die Zeile mit Datum und Ort soll rechtsbündig und kursiv sein.',
      checks: [
        check('Datumszeile rechtsbündig', 'Start → Ausrichtung → Rechtsbündig', 'Samstag, 12. Juli', (p) => isRight(p)),
        check('Datumszeile kursiv', 'Start → „I“', 'Samstag, 12. Juli', (p) => isItalic(p)),
      ],
    },
    {
      title: 'Fließtext',
      instruction: 'Beide Absätze des Fließtexts („Liebe Schülerinnen …“ und „Für das leibliche Wohl …“) erhalten die Schriftart Verdana, Schriftgröße 10 und Blocksatz.',
      checks: [
        check('Schriftart Verdana', 'Start → Schriftart-Liste', ['Liebe Schülerinnen', 'Für das leibliche'], (p) => fontOf(p) === 'Verdana'),
        check('Schriftgröße 10', 'Start → Schriftgröße', ['Liebe Schülerinnen', 'Für das leibliche'], (p) => sizeOf(p) === 10),
        check('Blocksatz', 'Start → Ausrichtung → Blocksatz', ['Liebe Schülerinnen', 'Für das leibliche'], (p) => isJustified(p)),
      ],
    },
    {
      title: 'Aufzählung',
      instruction: 'Die drei Stichpunkte (Kuchenbuffet, Spiele, Live-Musik) sollen als Aufzählung mit Aufzählungszeichen dargestellt werden. Markiere alle drei Zeilen gemeinsam (mit gedrückter Maustaste ziehen).',
      checks: [
        check('Aufzählungszeichen aktiv', 'Start → Liste mit Punkten (Aufzählung)', ['Kuchenbuffet', 'Spiele und', 'Live-Musik'], (p) => isBulletList(p)),
      ],
    },
    {
      title: 'Hervorhebung',
      instruction: 'Der letzte Satz („Anmeldung bis …“) soll auffallen: rote Schriftfarbe, fett und gelb hinterlegt (Texthervorhebung).',
      checks: [
        check('Schriftfarbe rot', 'Start → Schriftfarbe → Rot', 'Anmeldung bis', (p) => colorIs(p, 'red')),
        check('Letzter Satz fett', 'Start → „B“', 'Anmeldung bis', (p) => isBold(p)),
        check('Gelb hinterlegt', 'Start → Texthervorhebung (Farbeimer) → Gelb', 'Anmeldung bis', (p) => colorFamily(highlightOf(p)) === 'yellow'),
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
  auftrag: 'Du gestaltest einen Leitfaden für Praktikantinnen und Praktikanten. In Word nutzt man für Titel und Überschriften Formatvorlagen – so sieht das Dokument einheitlich aus und hat eine klare Gliederung. Die Formatvorlagen findest du links neben der Schriftgröße (dort steht „Normal“).',
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
      title: 'Titel und Untertitel',
      instruction: 'Weise der ersten Zeile die Formatvorlage „Titel“ und der zweiten Zeile die Formatvorlage „Untertitel“ zu. Beide Zeilen sollen zentriert sein.',
      checks: [
        check('Formatvorlage „Titel“', 'Start → Formatvorlage („Normal“) → Titel', 'Praktikum in der', (p) => p.namedStyle === NamedStyleType.TITLE),
        check('Formatvorlage „Untertitel“', 'Start → Formatvorlage → Untertitel', 'Ein Leitfaden', (p) => p.namedStyle === NamedStyleType.SUBTITLE),
        check('Titel und Untertitel zentriert', 'Start → Ausrichtung → Zentriert', ['Praktikum in der', 'Ein Leitfaden'], (p) => isCentered(p)),
      ],
    },
    {
      title: 'Überschriften',
      instruction: 'Die Zeilen „Vor dem Praktikum“ und „Während des Praktikums“ sind Hauptüberschriften (Formatvorlage „Überschrift 1“). „Bewerbung“ und „Vorbereitung“ sind Unterpunkte (Formatvorlage „Überschrift 2“).',
      checks: [
        check('Hauptüberschriften = Überschrift 1', 'Start → Formatvorlage → Überschrift 1', ['Vor dem Praktikum', 'Während des Praktikums'], (p) => p.namedStyle === NamedStyleType.HEADING_1),
        check('Unterpunkte = Überschrift 2', 'Start → Formatvorlage → Überschrift 2', ['Bewerbung', 'Vorbereitung'], (p) => p.namedStyle === NamedStyleType.HEADING_2),
      ],
    },
    {
      title: 'Nummerierung',
      instruction: 'Die drei Schritte am Ende („Pünktlich ankommen“, „Aufgaben notieren“, „Fragen stellen“) sollen als nummerierte Liste (1., 2., 3.) erscheinen.',
      checks: [
        check('Nummerierte Liste', 'Start → Liste mit Zahlen (Nummerierung)', ['Pünktlich ankommen', 'Aufgaben notieren', 'Fragen stellen'], (p) => isNumberedList(p)),
      ],
    },
    {
      title: 'Fließtext',
      instruction: 'Die drei normalen Textabsätze („Ein Praktikum …“, „Schreibe eine …“, „Kläre vorab …“) sollen im Blocksatz stehen, die Schriftgröße bleibt 11.',
      checks: [
        check('Fließtext im Blocksatz', 'Start → Ausrichtung → Blocksatz', ['Ein Praktikum gibt', 'Schreibe eine kurze', 'Kläre vorab'], (p) => isJustified(p)),
      ],
    },
  ],
};

// ---------- Aufgabe 3: Flyer ----------

const flyer: LayoutTask = {
  id: 'flyer-fahrrad',
  title: 'Flyer: Fahrradwerkstatt',
  difficulty: 'mittel',
  intro: 'Schriftarten, Farben, Hervorhebungen und Aufzählung kombinieren.',
  auftrag: 'Die Technik-AG betreibt eine Fahrradwerkstatt und braucht einen Flyer. Der Text steht schon im Dokument. Gestalte daraus einen ansprechenden Flyer. Mehrere Zeilen markierst du, indem du mit gedrückter Maustaste von vor der ersten bis hinter die letzte Zeile ziehst.',
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
      title: 'Titel',
      instruction: 'Der Titel soll in Times New Roman, Schriftgröße 28, fett, zentriert und in oranger Schriftfarbe erscheinen.',
      checks: [
        check('Schriftart Times New Roman', 'Start → Schriftart-Liste', 'Die Schul-Fahrrad', (p) => fontOf(p) === 'Times New Roman'),
        check('Schriftgröße 28', 'Start → Schriftgröße', 'Die Schul-Fahrrad', (p) => sizeOf(p) === 28),
        check('Fett und zentriert', 'Start → „B“ und Ausrichtung → Zentriert', 'Die Schul-Fahrrad', (p) => isBold(p) && isCentered(p)),
        check('Schriftfarbe orange', 'Start → Schriftfarbe → Orange', 'Die Schul-Fahrrad', (p) => colorIs(p, 'orange')),
      ],
    },
    {
      title: 'Slogan',
      instruction: 'Der Slogan „Reparieren statt wegwerfen!“ wird zentriert, kursiv und in grauer Schrift gesetzt.',
      checks: [
        check('Slogan zentriert und kursiv', 'Start → Ausrichtung → Zentriert, „I“', 'Reparieren statt', (p) => isCentered(p) && isItalic(p)),
        check('Schriftfarbe grau', 'Start → Schriftfarbe → Grau', 'Reparieren statt', (p) => colorIs(p, 'gray')),
      ],
    },
    {
      title: 'Unterüberschriften',
      instruction: 'Die Zeilen „Unser Angebot“ und „Öffnungszeiten“ sind Unterüberschriften: Verdana, Schriftgröße 14, fett und unterstrichen.',
      checks: [
        check('Schriftart Verdana, 14 pt', 'Start → Schriftart und Schriftgröße', ['Unser Angebot', 'Öffnungszeiten'], (p) => fontOf(p) === 'Verdana' && sizeOf(p) === 14),
        check('Fett und unterstrichen', 'Start → „B“ und „U“', ['Unser Angebot', 'Öffnungszeiten'], (p) => isBold(p) && isUnderlined(p)),
      ],
    },
    {
      title: 'Fließtext',
      instruction: 'Die beiden Textabsätze („Ein Fahrrad …“ und „Wir prüfen …“) stehen in Verdana, Schriftgröße 10 und im Blocksatz.',
      checks: [
        check('Verdana, 10 pt', 'Start → Schriftart und Schriftgröße', ['Ein Fahrrad ist', 'Wir prüfen Bremsen'], (p) => fontOf(p) === 'Verdana' && sizeOf(p) === 10),
        check('Blocksatz', 'Start → Ausrichtung → Blocksatz', ['Ein Fahrrad ist', 'Wir prüfen Bremsen'], (p) => isJustified(p)),
      ],
    },
    {
      title: 'Öffnungszeiten und Kontakt',
      instruction: 'Die drei Öffnungszeiten werden eine Aufzählung. Der letzte Satz („Fragen? …“) wird zentriert, fett und gelb hinterlegt.',
      checks: [
        check('Öffnungszeiten als Aufzählung', 'Start → Liste mit Punkten', ['Dienstag:', 'Mittwoch:', 'Donnerstag:'], (p) => isBulletList(p)),
        check('Kontaktzeile zentriert und fett', 'Start → Zentriert, „B“', 'Fragen? Sprich', (p) => isCentered(p) && isBold(p)),
        check('Kontaktzeile gelb hinterlegt', 'Start → Texthervorhebung → Gelb', 'Fragen? Sprich', (p) => colorFamily(highlightOf(p)) === 'yellow'),
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
  auftrag: 'Für die Fahrradwerkstatt soll eine Preisliste als Tabelle entstehen. Füge unter dem Text eine Tabelle mit 3 Spalten und 4 Zeilen ein (Einfügen → Tabelle) und trage folgende Werte ein:\n\nLeistung | Dauer | Preis\nSchlauch wechseln | 15 Min. | 5,00 €\nBremsen einstellen | 20 Min. | 8,00 €\nLicht prüfen | 10 Min. | kostenlos',
  paragraphs: [
    { text: 'Preisliste der Fahrradwerkstatt' },
    { text: 'Alle Preise gelten für Schülerinnen und Schüler der WSS.' },
    { text: '' },
  ],
  steps: [
    {
      title: 'Überschrift',
      instruction: 'Die erste Zeile erhält die Formatvorlage „Überschrift 1“ und wird zentriert.',
      checks: [
        check('Formatvorlage „Überschrift 1“', 'Start → Formatvorlage → Überschrift 1', 'Preisliste der', (p) => p.namedStyle === NamedStyleType.HEADING_1),
        check('Überschrift zentriert', 'Start → Ausrichtung → Zentriert', 'Preisliste der', (p) => isCentered(p)),
      ],
    },
    {
      title: 'Tabelle einfügen',
      instruction: 'Füge eine Tabelle mit 3 Spalten und 4 Zeilen ein und trage alle Werte ein.',
      checks: [
        { label: 'Tabelle mit 3 Spalten und 4 Zeilen', hint: 'Einfügen → Tabelle → Raster auswählen', test: (d) => d.tables.some((t) => t.cols === 3 && t.rows === 4) },
        check('Kopfzeile ausgefüllt', 'Text in die Zellen der ersten Zeile tippen', ['=Leistung', '=Dauer', '=Preis'], () => true),
        check('Zeilen ausgefüllt', 'Text in die Zellen tippen', ['=Schlauch wechseln', '=Bremsen einstellen', '=Licht prüfen', '=15 Min.', '=20 Min.', '=10 Min.', '=5,00 €', '=8,00 €', '=kostenlos'], () => true),
      ],
    },
    {
      title: 'Formatierung',
      instruction: 'Die Kopfzeile (Leistung, Dauer, Preis) wird fett. Die Werte der Spalte „Preis“ (5,00 €, 8,00 €, kostenlos) werden rechtsbündig ausgerichtet.',
      checks: [
        check('Kopfzeile fett', 'Zellen der ersten Zeile markieren → „B“', ['=Leistung', '=Dauer', '=Preis'], (p) => isBold(p)),
        check('Preise rechtsbündig', 'Zellen der Preisspalte markieren → Ausrichtung → Rechtsbündig', ['=5,00 €', '=8,00 €', '=kostenlos'], (p) => isRight(p)),
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
  auftrag: 'Die Stadtbibliothek braucht einen Flyer für ihre neue Kinder- und Jugendabteilung. Gestalte den vorgegebenen Text selbstständig nach den Vorgaben. Die Aufträge sind bewusst knapp formuliert – überlege, welche Werkzeuge du brauchst.',
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
      title: 'Kopfbereich',
      instruction: 'Titel „Lesen macht schlau“: Comic Sans MS, Schriftgröße 26, fett, zentriert, grüne Schriftfarbe. Die Zeile darunter ist der Untertitel (Formatvorlage „Untertitel“), kursiv und zentriert.',
      checks: [
        check('Titel: Comic Sans MS, 26 pt', 'Start → Schriftart und Schriftgröße', 'Lesen macht schlau', (p) => fontOf(p) === 'Comic Sans MS' && sizeOf(p) === 26),
        check('Titel: fett, zentriert, grün', 'Start → „B“, Zentriert, Schriftfarbe → Grün', 'Lesen macht schlau', (p) => isBold(p) && isCentered(p) && colorIs(p, 'green')),
        check('Untertitel: Formatvorlage', 'Start → Formatvorlage → Untertitel', 'Die neue Kinder', (p) => p.namedStyle === NamedStyleType.SUBTITLE),
        check('Untertitel: kursiv und zentriert', 'Start → „I“ und Zentriert', 'Die neue Kinder', (p) => isItalic(p) && isCentered(p)),
      ],
    },
    {
      title: 'Überschriften',
      instruction: '„Neu im Angebot“ und „Unsere Aktionen“ erhalten die Formatvorlage „Überschrift 2“ und eine blaue Schriftfarbe.',
      checks: [
        check('Formatvorlage „Überschrift 2“', 'Start → Formatvorlage → Überschrift 2', ['Neu im Angebot', 'Unsere Aktionen'], (p) => p.namedStyle === NamedStyleType.HEADING_2),
        check('Schriftfarbe blau', 'Start → Schriftfarbe → Blau', ['Neu im Angebot', 'Unsere Aktionen'], (p) => colorIs(p, 'blue')),
      ],
    },
    {
      title: 'Fließtext und Liste',
      instruction: 'Die beiden Textabsätze („Ab sofort …“ und „Jeden Monat …“): Times New Roman, Schriftgröße 12, Blocksatz. Die drei Aktionen (Lesung, Workshop, Spieleabend) werden eine Aufzählung.',
      checks: [
        check('Times New Roman, 12 pt', 'Start → Schriftart und Schriftgröße', ['Ab sofort finden', 'Jeden Monat gibt'], (p) => fontOf(p) === 'Times New Roman' && sizeOf(p) === 12),
        check('Blocksatz', 'Start → Ausrichtung → Blocksatz', ['Ab sofort finden', 'Jeden Monat gibt'], (p) => isJustified(p)),
        check('Aufzählung der Aktionen', 'Start → Liste mit Punkten', ['Lesung für', 'Comic-Workshop', 'Spieleabend für'], (p) => isBulletList(p)),
      ],
    },
    {
      title: 'Tipp und Fußzeile',
      instruction: 'Der Tipp-Absatz wird zentriert, fett und gelb hinterlegt. Die letzte Zeile (Adresse) wird rechtsbündig, Schriftgröße 9 und in grauer Schrift gesetzt.',
      checks: [
        check('Tipp zentriert, fett, gelb hinterlegt', 'Start → Zentriert, „B“, Texthervorhebung → Gelb', 'Tipp: Mit dem', (p) => isCentered(p) && isBold(p) && colorFamily(highlightOf(p)) === 'yellow'),
        check('Adresse rechtsbündig, 9 pt', 'Start → Rechtsbündig, Schriftgröße 9', 'Stadtbibliothek ·', (p) => isRight(p) && sizeOf(p) === 9),
        check('Adresse grau', 'Start → Schriftfarbe → Grau', 'Stadtbibliothek ·', (p) => colorIs(p, 'gray')),
      ],
    },
  ],
};

export const LAYOUT_TASKS: LayoutTask[] = [einladung, formatvorlagen, flyer, tabelle, bibliothek];

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
