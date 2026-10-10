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
  /** Zähleinheit auf Kacheln: Themen (führen zu Unterseiten) oder Übungen */
  unit: 'Themen' | 'Übungen'
  sections: Section[]
}

const fa = (n: string) => `fa-solid fa-${n}`

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
    unit: 'Übungen',
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
    unit: 'Übungen',
    sections: [
      {
        name: 'Grundlagen',
        items: [
          { title: 'Wertetabelle erstellen und vervollständigen', desc: 'Erstelle Wertetabellen für lineare Funktionen und löse fehlende Werte.', path: '/lineare_funktionen/wertetabelle', icon: fa('table') },
          { title: 'Graph zeichnen', desc: 'Übe das Zeichnen von linearen Funktionen im Koordinatensystem.', path: '/lineare_funktionen/zeichnen', icon: fa('pencil') },
          { title: 'Funktionsgleichung ablesen', desc: 'Lese die Funktionsgleichung direkt aus einem Graphen ab.', path: '/lineare_funktionen/ablesen', icon: fa('eye') },
          { title: 'Steigung berechnen', desc: 'Lerne, die Steigung einer Geraden aus zwei Punkten zu ermitteln.', path: '/lineare_funktionen/steigung_berechnen', icon: fa('chart-line') },
          { title: 'Funktionsgleichung aufstellen', desc: 'Stelle die Gleichung einer Geraden aus gegebenen Informationen auf.', path: '/lineare_funktionen/funktionsgleichung', icon: fa('pen-ruler') },
          { title: 'Punkt auf Gerade prüfen', desc: 'Überprüfe rechnerisch, ob ein Punkt auf einer Geraden liegt.', path: '/lineare_funktionen/punkt_gerade', icon: fa('magnifying-glass-chart') },
          { title: 'Parallele und senkrechte Geraden', desc: 'Erkenne parallele und senkrechte Geraden anhand ihrer Steigung.', path: '/lineare_funktionen/parallel_senkrecht', icon: fa('lines-leaning') },
          { title: 'Nullstellen berechnen', desc: 'Finde den Schnittpunkt einer Geraden mit der x-Achse.', path: '/lineare_funktionen/nullstellen', icon: fa('arrows-down-to-line') },
          { title: 'Schnittpunkt zweier Geraden', desc: 'Berechne den gemeinsamen Schnittpunkt von zwei Geraden.', path: '/lineare_funktionen/schnittpunkt', icon: fa('arrows-turn-to-dots') },
          { title: 'Lineare Gleichungssysteme', desc: 'Löse Gleichungssysteme mit dem Einsetzungs-, Gleichsetzungs- und Additionsverfahren.', path: '/lineare_funktionen/gleichungssysteme', icon: fa('equals') },
        ],
      },
      {
        name: 'Anwenden',
        items: [
          { title: 'Gemischte Übungsaufgaben', desc: 'Gemischte Aufgaben zu allen Themen der linearen Funktionen.', path: '/lineare_funktionen/gemischte-aufgaben', icon: fa('shuffle') },
          { title: 'Spiel: Münzen sammeln', desc: 'Eine spielerische Anwendung zum Thema lineare Funktionen.', path: '/lineare_funktionen/spiel_muenzen', icon: fa('gamepad') },
          { title: 'Anwendungsaufgaben', desc: 'Realistische Aufgaben mit linearen Funktionen aus dem Alltag.', path: '/lineare_funktionen/anwendungsaufgaben', icon: fa('lightbulb') },
        ],
      },
      {
        name: 'Testen',
        items: [
          { title: 'Abschlusstest', desc: 'Teste dein Wissen über lineare Funktionen.', path: '/lineare_funktionen/test', icon: fa('graduation-cap') },
          { title: 'Übungsblatt-Generator', desc: 'Stelle dir ein personalisiertes Übungsblatt zusammen und lade es als PDF herunter.', path: '/lineare_funktionen/ubungsblatt-generator', icon: fa('file-pdf') },
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
    unit: 'Übungen',
    sections: [
      {
        name: 'Themen',
        items: [
          { title: 'Funktionsgleichung aufstellen', desc: 'Stelle die Gleichung einer Parabel aus gegebenen Informationen auf.', path: '/quadratische_funktionen/funktionsgleichung_aufstellen', icon: fa('pen-ruler') },
          { title: 'Graph zeichnen', desc: 'Übe das Zeichnen von quadratischen Funktionen im Koordinatensystem.', path: '/quadratische_funktionen/graph_zeichnen', icon: fa('pencil') },
          { title: 'Normalparabel', desc: 'Lerne die Eigenschaften der Normalparabel kennen.', path: '/quadratische_funktionen/normalparabel', icon: fa('chart-line') },
          { title: 'Nullstellen', desc: 'Finde die Schnittpunkte einer Parabel mit der x-Achse.', path: '/quadratische_funktionen/nullstellen', icon: fa('arrows-down-to-line') },
          { title: 'Scheitelform', desc: 'Wandle Funktionsgleichungen in die Scheitelform um.', path: '/quadratische_funktionen/scheitelform', icon: fa('square-root-variable') },
          { title: 'Scheitelpunkt', desc: 'Bestimme den Scheitelpunkt einer Parabel.', path: '/quadratische_funktionen/scheitelpunkt', icon: fa('bullseye') },
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
    unit: 'Übungen',
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
    sections: [
      {
        name: 'Flächen',
        items: [
          { title: 'Flächengeometrie', desc: 'Dreiecke, Vierecke und Kreis berechnen', path: '/raum-und-form/flaechengeometrie', icon: fa('ruler-combined') },
          { title: 'Satz des Pythagoras', desc: 'Katheten und Hypotenuse verstehen', path: '/raum-und-form/satz-des-pythagoras', icon: fa('play') },
          { title: 'Strahlensätze', desc: 'Streckenverhältnisse berechnen', path: '/raum-und-form/strahlensaetze', icon: fa('up-right-and-down-left-from-center') },
        ],
      },
      {
        name: 'Körper',
        items: [
          { title: 'Kugel', desc: 'Oberfläche und Volumen berechnen', path: '/raum-und-form/kugel', icon: fa('circle') },
          { title: 'Prisma', desc: 'Oberfläche und Volumen berechnen', path: '/raum-und-form/prisma', icon: fa('cube') },
          { title: 'Kegel', desc: 'Oberfläche und Volumen berechnen', path: '/raum-und-form/kegel', icon: fa('ice-cream') },
          { title: 'Pyramide', desc: 'Oberfläche und Volumen berechnen', path: '/raum-und-form/pyramide', icon: fa('caret-up') },
          { title: 'Zylinder', desc: 'Oberfläche und Volumen berechnen', path: '/raum-und-form/zylinder', icon: fa('database') },
        ],
      },
      {
        name: 'Anwenden',
        items: [
          { title: 'Anwendungsaufgaben', desc: 'Übungsaufgaben aus dem Alltag', path: '/raum-und-form/anwendungsaufgaben', icon: fa('book-open') },
        ],
      },
    ],
  },
  {
    id: 'trigo',
    title: 'Trigonometrie',
    short: 'Berechnungen an Dreiecken mit Sinus, Kosinus und Tangens.',
    glyph: 'sin',
    path: '/trigonometrie',
    unit: 'Übungen',
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
