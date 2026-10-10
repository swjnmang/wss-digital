import { TOPICS } from '../pages/raum_und_form/registry'

// Zentrales Verzeichnis aller Bereiche und ihrer Übungen (Startseite, Bereichsseiten, Suche).
// Titel und Beschreibungen stammen aus den bisherigen Bereichsseiten; Reihenfolge unverändert.

export type AreaId = 'rechnen' | 'finanz' | 'linear' | 'quadrat' | 'daten' | 'raum' | 'trigo'

export interface Exercise {
  title: string
  desc: string
  path: string
  icon: string
}

export interface Section {
  name: string
  items: Exercise[]
}

export interface Area {
  id: AreaId
  title: string
  short: string
  glyph: string
  path: string
  /** Zähleinheit auf Kacheln (Wunsch des Nutzers: überall „Themen“) */
  unit: 'Themen' | 'Übungen'
  sections: Section[]
}

const fa = (n: string) => `fa-solid fa-${n}`

// Raum & Form: Themen kommen aus dem Register, damit neue Themen automatisch erscheinen
const RAUM_ICONS: Record<string, string> = {
  scale: 'ruler', ruler: 'ruler-combined', triangle: 'play', expand: 'up-right-and-down-left-from-center',
  circle: 'circle', box: 'cube', cone: 'ice-cream', pyramid: 'caret-up', cylinder: 'database', exam: 'graduation-cap',
}
const RAUM_KOERPER = ['kugel', 'prisma', 'kegel', 'pyramide', 'zylinder']

function raumSections(): Section[] {
  const toItem = (t: (typeof TOPICS)[number]): Exercise => ({
    title: t.title, desc: t.description, path: `/raum-und-form/${t.slug}`, icon: fa(RAUM_ICONS[t.icon] ?? 'shapes'),
  })
  const anwenden = TOPICS.filter((t) => t.slug === 'anwendungsaufgaben')
  const koerper = TOPICS.filter((t) => RAUM_KOERPER.includes(t.slug))
  const flaechen = TOPICS.filter((t) => !anwenden.includes(t) && !koerper.includes(t))
  return [
    { name: 'Grundlagen und Flächen', items: flaechen.map(toItem) },
    { name: 'Körper', items: koerper.map(toItem) },
    { name: 'Anwenden', items: anwenden.map(toItem) },
  ]
}

export const AREAS: Area[] = [
  {
    id: 'rechnen',
    title: 'Rechnen lernen',
    short: 'Brüche, Potenzen, Prozente, Terme und Gleichungen.',
    glyph: '¾',
    path: '/rechnen_lernen',
    unit: 'Themen',
    sections: [
      {
        name: 'Themen',
        items: [
          { title: 'Terme', desc: 'Lerne, Terme zu vereinfachen und zusammenzufassen.', path: '/rechnen_lernen/terme', icon: fa('calculator') },
          { title: 'Brüche', desc: 'Alles rund um das Rechnen mit Brüchen: Kürzen, Erweitern und mehr.', path: '/rechnen_lernen/brueche', icon: fa('divide') },
          { title: 'Potenzen', desc: 'Verstehe die Potenzgesetze und wende sie an.', path: '/rechnen_lernen/potenzen', icon: fa('superscript') },
          { title: 'Wurzeln', desc: 'Übungen zum Rechnen mit Wurzeln und zur Vereinfachung.', path: '/rechnen_lernen/wurzeln', icon: fa('square-root-variable') },
          { title: 'Prozentrechnung', desc: 'Grundlagen und fortgeschrittene Aufgaben zur Prozentrechnung.', path: '/rechnen_lernen/prozentrechnung', icon: fa('percent') },
          { title: 'Gleichungen', desc: 'Löse lineare und quadratische Gleichungen Schritt für Schritt.', path: '/rechnen_lernen/gleichungen', icon: fa('equals') },
        ],
      },
    ],
  },
  {
    id: 'finanz',
    title: 'Finanzmathematik',
    short: 'Zinsen, Zinseszins und Darlehensberechnungen verstehen.',
    glyph: '€',
    path: '/finanzmathe',
    unit: 'Themen',
    sections: [
      {
        name: 'Grundlagen',
        items: [
          { title: 'Zinsrechnung', desc: 'Grundlagen der Zinsrechnung üben.', path: '/finanzmathe/zinsrechnung', icon: fa('percent') },
          { title: 'Zinseszins', desc: 'Zinseszins und gemischte Aufgaben.', path: '/finanzmathe/zinseszins', icon: fa('chart-line') },
          { title: 'Kapitalmehrung und - minderung', desc: 'Kombinierte Zinseszins- und Rentenrechnung.', path: '/finanzmathe/mehrung_minderung', icon: fa('coins') },
          { title: 'Rentenrechnung: Endwert', desc: 'Berechnung von Endwert, Rate oder Laufzeit (ohne Startkapital).', path: '/finanzmathe/endwert', icon: fa('piggy-bank') },
          { title: 'Ratendarlehen', desc: 'Tilgungspläne für Ratendarlehen erstellen.', path: '/finanzmathe/ratendarlehen', icon: fa('file-invoice-dollar') },
          { title: 'Annuitätendarlehen', desc: 'Tilgungspläne für Annuitätendarlehen erstellen.', path: '/finanzmathe/annuitaetendarlehen', icon: fa('hand-holding-dollar') },
        ],
      },
      {
        name: 'Anwenden',
        items: [
          { title: 'Gemischte Übungsaufgaben', desc: 'Querschnitt mit Zinsen, Zinseszins, Sparplänen und Darlehen.', path: '/finanzmathe/gemischte-aufgaben', icon: fa('shuffle') },
          { title: 'Anwendungsaufgaben', desc: 'Praktische Anwendungsaufgaben zur Finanzmathematik.', path: '/finanzmathe/anwendungsaufgaben', icon: fa('briefcase') },
        ],
      },
      {
        name: 'Testen',
        items: [
          { title: 'Prüfungsmodus', desc: '10 gemischte Aufgaben unter Prüfungsbedingungen mit PDF-Zertifikat.', path: '/finanzmathe/pruefungsmodus', icon: fa('graduation-cap') },
        ],
      },
    ],
  },
  {
    id: 'linear',
    title: 'Lineare Funktionen',
    short: 'Geradengleichungen aufstellen, Nullstellen berechnen, Graphen zeichnen.',
    glyph: 'mx',
    path: '/lineare_funktionen',
    unit: 'Themen',
    sections: [
      {
        name: 'Einstieg',
        items: [
          { title: 'Proportionale Zusammenhänge (Einstieg)', desc: 'Fülle Wertetabellen zu Alltagsbeispielen aus und zeichne die passende Ursprungsgerade - der ideale Einstieg vor den linearen Funktionen.', path: '/lineare_funktionen/proportionale_zusammenhaenge', icon: 'fa-solid fa-compass' },
          { title: 'Was ist eine lineare Funktion?', desc: 'Verstehe, wie Wertetabelle, Graph und Gleichung zusammengehören, und ordne sie einander zu.', path: '/lineare_funktionen/was_ist_linear', icon: 'fa-solid fa-lightbulb' },
        ],
      },
      {
        name: 'Grundlagen',
        items: [
          { title: 'Wertetabelle erstellen und vervollständigen', desc: 'Erstelle Wertetabellen für lineare Funktionen und löse fehlende Werte.', path: '/lineare_funktionen/wertetabelle', icon: 'fa-solid fa-table' },
          { title: 'Graph zeichnen', desc: 'Übe das Zeichnen von linearen Funktionen im Koordinatensystem.', path: '/lineare_funktionen/zeichnen', icon: 'fa-solid fa-pencil' },
          { title: 'Die Steigung m', desc: 'Lies die Steigung einer Geraden mit dem Steigungsdreieck ab oder berechne sie aus zwei Punkten.', path: '/lineare_funktionen/steigung', icon: 'fa-solid fa-chart-line' },
          { title: 'y-Achsenabschnitt', desc: 'Lerne Funktionen der Form y = m·x + t kennen: Der y-Achsenabschnitt t verschiebt die Gerade entlang der y-Achse.', path: '/lineare_funktionen/y_achsenabschnitt', icon: 'fa-solid fa-arrows-up-down' },
          { title: 'Funktionsgleichung ablesen', desc: 'Lese die Funktionsgleichung direkt aus einem Graphen ab.', path: '/lineare_funktionen/ablesen', icon: 'fa-solid fa-eye' },
          { title: 'Funktionsgleichung aufstellen', desc: 'Stelle die Gleichung einer Geraden aus gegebenen Informationen auf.', path: '/lineare_funktionen/funktionsgleichung', icon: 'fa-solid fa-pen-ruler' },
          { title: 'Punkt auf Gerade prüfen', desc: 'Überprüfe rechnerisch, ob ein Punkt auf einer Geraden liegt.', path: '/lineare_funktionen/punkt_gerade', icon: 'fa-solid fa-magnifying-glass-chart' },
          { title: 'Parallele und senkrechte Geraden', desc: 'Erkenne parallele und senkrechte Geraden anhand ihrer Steigung.', path: '/lineare_funktionen/parallel_senkrecht', icon: 'fa-solid fa-lines-leaning' },
          { title: 'Nullstellen berechnen', desc: 'Finde den Schnittpunkt einer Geraden mit der x-Achse.', path: '/lineare_funktionen/nullstellen', icon: 'fa-solid fa-arrows-down-to-line' },
          { title: 'Schnittpunkt zweier Geraden', desc: 'Berechne den gemeinsamen Schnittpunkt von zwei Geraden.', path: '/lineare_funktionen/schnittpunkt', icon: 'fa-solid fa-arrows-turn-to-dots' },
          { title: 'Lineare Gleichungssysteme', desc: 'Löse Gleichungssysteme mit dem Einsetzungs-, Gleichsetzungs- und Additionsverfahren.', path: '/lineare_funktionen/gleichungssysteme', icon: 'fa-solid fa-equals' },
        ],
      },
      {
        name: 'Anwenden',
        items: [
          { title: 'Gemischte Übungsaufgaben', desc: 'Gemischte Aufgaben zu allen Themen der linearen Funktionen.', path: '/lineare_funktionen/gemischte-aufgaben', icon: 'fa-solid fa-shuffle' },
          { title: 'Spiel: Münzen sammeln', desc: 'Eine spielerische Anwendung zum Thema lineare Funktionen.', path: '/lineare_funktionen/spiel_muenzen', icon: 'fa-solid fa-gamepad' },
          { title: 'Anwendungsaufgaben', desc: 'Realistische Aufgaben mit linearen Funktionen aus dem Alltag.', path: '/lineare_funktionen/anwendungsaufgaben', icon: 'fa-solid fa-lightbulb' },
        ],
      },
      {
        name: 'Testen',
        items: [
          { title: 'Abschlusstest', desc: 'Teste dein Wissen über lineare Funktionen.', path: '/lineare_funktionen/test', icon: 'fa-solid fa-graduation-cap' },
          { title: 'Übungsblatt-Generator', desc: 'Stelle dir ein personalisiertes Übungsblatt zusammen und lade es als PDF herunter.', path: '/lineare_funktionen/ubungsblatt-generator', icon: 'fa-solid fa-file-pdf' },
          { title: 'Wer wird Millionär?', desc: 'Das Quiz zu allen Themen der linearen Funktionen - mit 50:50-, Publikums- und Telefonjoker.', path: '/lineare_funktionen/wer_wird_millionaer', icon: 'fa-solid fa-sack-dollar' },
        ],
      },
    ],
  },
  {
    id: 'quadrat',
    title: 'Quadratische Funktionen',
    short: 'Parabeln, Scheitelpunkte und Schnittpunkte meistern.',
    glyph: 'x²',
    path: '/quadratische_funktionen',
    unit: 'Themen',
    sections: [
      {
        name: 'Graphen verstehen',
        items: [
          { title: 'Wertetabellen erstellen', desc: 'Erstelle oder vervollständige Wertetabellen für quadratische Funktionen.', path: '/quadratische_funktionen/wertetabelle', icon: fa('table') },
          { title: 'Normalparabel', desc: 'Lerne die Grundlagen der Normalparabel und ihre Eigenschaften kennen.', path: '/quadratische_funktionen/normalparabel', icon: fa('bezier-curve') },
          { title: 'Verschiebung der Normalparabel', desc: 'Lerne, wie d und c die Normalparabel entlang der x- und y-Achse verschieben.', path: '/quadratische_funktionen/verschiebung_normalparabel', icon: fa('arrows-up-down-left-right') },
          { title: 'Scheitelpunkt ablesen', desc: 'Übe das Ablesen des Scheitelpunkts direkt aus dem Graphen.', path: '/quadratische_funktionen/scheitelpunkt_ablesen', icon: fa('map-pin') },
          { title: 'Scheitelform ablesen', desc: 'Lies die Scheitelform einer Parabel direkt aus dem Graphen ab.', path: '/quadratische_funktionen/scheitelform', icon: fa('square-root-variable') },
          { title: 'Graph zeichnen', desc: 'Zeichne Parabeln anhand ihrer Funktionsgleichung.', path: '/quadratische_funktionen/graph_zeichnen', icon: fa('pencil') },
        ],
      },
      {
        name: 'Rechnen',
        items: [
          { title: 'Umwandlung in Allg. Form', desc: 'Wandle die Scheitelpunktform in die allgemeine Form um.', path: '/quadratische_funktionen/scheitel_in_allg_form', icon: fa('left-right') },
          { title: 'Scheitelpunkt berechnen', desc: 'Berechne den Scheitelpunkt aus der allgemeinen Form.', path: '/quadratische_funktionen/scheitelpunkt', icon: fa('calculator') },
          { title: 'Umwandlung in Scheitelform', desc: 'Forme die allgemeine Form in die Scheitelpunktform um.', path: '/quadratische_funktionen/scheitelform_rechnerisch', icon: fa('right-left') },
          { title: 'Nullstellen berechnen', desc: 'Finde die Schnittpunkte einer Parabel mit der x-Achse.', path: '/quadratische_funktionen/nullstellen', icon: fa('arrows-down-to-line') },
          { title: 'Schnittpunkte (Parabel-Gerade)', desc: 'Berechne die Schnittpunkte zwischen einer Parabel und einer Geraden.', path: '/quadratische_funktionen/schnittpunkte_gerade', icon: fa('arrows-turn-to-dots') },
          { title: 'Schnittpunkte (Parabel-Parabel)', desc: 'Berechne die Schnittpunkte zwischen zwei Parabeln.', path: '/quadratische_funktionen/schnittpunkte_parabel', icon: fa('code-compare') },
          { title: 'Funktionsgleichung aufstellen', desc: 'Stelle eine Funktionsgleichung aus Punkten oder Eigenschaften auf.', path: '/quadratische_funktionen/funktionsgleichung_aufstellen', icon: fa('pen-ruler') },
        ],
      },
      {
        name: 'Spielen und Testen',
        items: [
          { title: 'Spiel: Nullstellen finden', desc: 'Eine spielerische Anwendung zum Thema Nullstellen.', path: '/quadratische_funktionen/spiel_nullstellen', icon: fa('gamepad') },
          { title: 'Abschlusstest', desc: 'Teste dein Wissen über quadratische Funktionen.', path: '/quadratische_funktionen/abschlusstest', icon: fa('graduation-cap') },
        ],
      },
    ],
  },
  {
    id: 'daten',
    title: 'Daten und Zufall',
    short: 'Grundlagen der Wahrscheinlichkeit und Baumdiagramme.',
    glyph: 'P',
    path: '/daten-und-zufall',
    unit: 'Themen',
    sections: [
      {
        name: 'Grundlagen',
        items: [
          { title: 'Statistische Kennwerte', desc: 'Berechne Mittelwert, Median, Modalwert, Spannweite, Minimum und Maximum.', path: '/daten-und-zufall/statistische-kennwerte', icon: fa('chart-column') },
          { title: 'Diagramme erstellen', desc: 'Erstelle Kreis-, Balken- und Säulendiagramme zu verschiedenen Themen.', path: '/daten-und-zufall/diagramme-erstellen', icon: fa('chart-pie') },
          { title: 'Interaktives Baumdiagramm', desc: 'Erstelle Baumdiagramme interaktiv und berechne Wahrscheinlichkeiten.', path: '/daten-und-zufall/baumdiagramme2', icon: fa('sitemap') },
          { title: 'Relative- und absolute Häufigkeit', desc: 'Lerne den Unterschied zwischen absoluter und relativer Häufigkeit mit praktischen Übungsaufgaben.', path: '/daten-und-zufall/relative-absolute-haeufigkeit', icon: fa('percent') },
          { title: 'Wahrscheinlichkeiten berechnen', desc: '20 Aufgaben zu ein- und mehrstufigen Zufallsexperimenten mit Musterlösungen.', path: '/daten-und-zufall/wahrscheinlichkeiten', icon: fa('dice') },
        ],
      },
      {
        name: 'Anwenden',
        items: [
          { title: 'Anwendungsaufgaben', desc: 'Prüfungsnahe Aufgaben mit Baumdiagrammen, Häufigkeiten und statistischen Kennwerten.', path: '/daten-und-zufall/anwendungsaufgaben', icon: fa('graduation-cap') },
        ],
      },
    ],
  },
  {
    id: 'raum',
    title: 'Raum & Form',
    short: 'Flächen- und Körperberechnungen mit Aufgaben-Generatoren.',
    glyph: 'V',
    path: '/raum-und-form',
    unit: 'Themen',
    sections: raumSections(),
  },
  {
    id: 'trigo',
    title: 'Trigonometrie',
    short: 'Berechnungen an Dreiecken mit Sinus, Kosinus und Tangens.',
    glyph: 'sin',
    path: '/trigonometrie',
    unit: 'Themen',
    sections: [
      {
        name: 'Rechtwinklige Dreiecke',
        items: [
          { title: 'Winkelbeziehungen', desc: 'Scheitel-, Neben-, Wechsel- und Stufenwinkel an sich schneidenden und parallelen Geraden erkennen.', path: '/trigonometrie/winkelbeziehungen', icon: fa('angles-up-down') },
          { title: 'Rechtwinklige Dreiecke beschriften', desc: 'Hypotenuse, Gegenkathete und Ankathete korrekt zuordnen.', path: '/trigonometrie/rechtwinklig-beschriften', icon: fa('shapes') },
          { title: 'Sinus, Kosinus und Tangens erkennen', desc: 'Verstehen, was die drei Winkelfunktionen als Seitenverhältnisse bedeuten.', path: '/trigonometrie/sinus-kosinus-tangens-erkennen', icon: fa('wave-square') },
          { title: 'Streckenlänge mit Sinus, Kosinus und Tangens berechnen', desc: 'Fehlende Seiten im rechtwinkligen Dreieck mithilfe der Winkelfunktionen bestimmen.', path: '/trigonometrie/rechtwinklig-strecken', icon: fa('ruler') },
          { title: 'Winkel berechnen mit Sinus, Kosinus und Tangens', desc: 'Fehlende Winkel im rechtwinkligen Dreieck aus den Seitenlängen bestimmen.', path: '/trigonometrie/rechtwinklig-winkel', icon: fa('angle-right') },
          { title: 'Steigungswinkel in Prozent und Grad', desc: 'Steigungsangaben zwischen Prozent und Winkelmaß umrechnen.', path: '/trigonometrie/steigungswinkel-prozent-grad', icon: fa('mountain') },
        ],
      },
      {
        name: 'Allgemeine Dreiecke',
        items: [
          { title: 'Sinussatz', desc: 'Seiten und Winkel mithilfe von gegenüberliegenden Paaren berechnen.', path: '/trigonometrie/sinussatz', icon: fa('draw-polygon') },
          { title: 'Kosinussatz', desc: 'Mit zwei Seiten und dem eingeschlossenen Winkel fehlende Größen bestimmen.', path: '/trigonometrie/kosinussatz', icon: fa('square-root-variable') },
          { title: 'Flächensatz', desc: 'Flächeninhalt und fehlende Größen im allgemeinen Dreieck berechnen.', path: '/trigonometrie/flaechensatz', icon: fa('vector-square') },
        ],
      },
      {
        name: 'Funktionen',
        items: [
          { title: 'Sinusfunktion', desc: 'Die Sinusfunktion am Einheitskreis verstehen und ihren Funktionsgraphen erkunden.', path: '/trigonometrie/sinusfunktion', icon: fa('wave-square') },
          { title: 'Kosinusfunktion', desc: 'Die Kosinusfunktion am Einheitskreis verstehen und ihren Funktionsgraphen erkunden.', path: '/trigonometrie/kosinusfunktion', icon: fa('wave-square') },
        ],
      },
      {
        name: 'Anwenden',
        items: [
          { title: 'Gemischte Übungsaufgaben', desc: 'Zufällig gemischte Aufgaben aus allen Themen (ohne Sinus-/Kosinusfunktion) üben.', path: '/trigonometrie/gemischte-uebungsaufgaben', icon: fa('shuffle') },
          { title: 'Anwendungsaufgaben', desc: 'Praxisnahe Aufgaben aus dem Alltag Schritt für Schritt lösen.', path: '/trigonometrie/anwendungsaufgaben', icon: fa('list-check') },
        ],
      },
      {
        name: 'Testen',
        items: [
          { title: 'Prüfungsmodus', desc: 'Zehn vermischte Aufgaben unter Prüfungsbedingungen lösen und eine Auswertung erhalten.', path: '/trigonometrie/pruefungsmodus', icon: fa('graduation-cap') },
        ],
      },
    ],
  },
]

export const areaById = (id: AreaId) => AREAS.find((a) => a.id === id) as Area

/** Bereich zu einem Pfad, z. B. für die Bereichsfarbe in Kopfzeilen von Übungsseiten. */
export const areaForPath = (pathname: string): Area | undefined =>
  AREAS.find((a) => pathname === a.path || pathname.startsWith(a.path + '/'))

export const exerciseCount = (a: Area) => a.sections.reduce((n, s) => n + s.items.length, 0)

/** Alle Übungen flach, mit fortlaufender Nummer innerhalb des Bereichs. */
export const allExercises = () =>
  AREAS.flatMap((a) => {
    let n = 0
    return a.sections.flatMap((s) => s.items.map((it) => ({ ...it, number: ++n, area: a, section: s.name })))
  })
