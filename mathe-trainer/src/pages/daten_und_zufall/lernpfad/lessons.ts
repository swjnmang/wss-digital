// Reihenfolge des Lernpfads „Daten und Zufall“ (11. Klasse, Lernbereich 5).
// Die Bereichsseite (data/areas.ts) und die Vor/Zurück-Navigation der Lernschritte lesen diese Liste.

export interface Lesson {
  slug: string
  title: string
  desc: string
  icon: string
  part: 'daten' | 'zufall' | 'test'
}

export const LESSONS: Lesson[] = [
  { slug: 'daten-ordnen', part: 'daten', icon: 'list-ol', title: 'Daten ordnen: Urliste, Rangliste, Häufigkeitstabelle', desc: 'Sortiere Daten der Größe nach und zähle aus, wie oft jeder Wert vorkommt.' },
  { slug: 'haeufigkeiten', part: 'daten', icon: 'percent', title: 'Absolute und relative Häufigkeit', desc: 'H zählen, h = H : n berechnen – als Bruch, Dezimalzahl und Prozent.' },
  { slug: 'diagramme', part: 'daten', icon: 'chart-pie', title: 'Diagramme lesen, erstellen und hinterfragen', desc: 'Säulen- und Kreisdiagramme: Werte ablesen, Winkel berechnen, Täuschungen erkennen.' },
  { slug: 'kennwerte', part: 'daten', icon: 'chart-column', title: 'Statistische Kennwerte berechnen', desc: 'Spannweite, Modalwert, Median und arithmetisches Mittel Schritt für Schritt.' },
  { slug: 'kennwerte-bewerten', part: 'daten', icon: 'scale-balanced', title: 'Kennwerte vergleichen und bewerten', desc: 'Ausreißer erkennen, den passenden Kennwert wählen und fehlende Werte rückwärts berechnen.' },
  { slug: 'zufallsexperimente', part: 'zufall', icon: 'dice', title: 'Zufallsexperimente und Laplace-Wahrscheinlichkeit', desc: 'Ergebnismenge Ω, Ereignisse, Gegenereignis und P(E) bei Würfel, Glücksrad und Urne.' },
  { slug: 'baumdiagramme', part: 'zufall', icon: 'sitemap', title: 'Mehrstufige Baumdiagramme', desc: 'Baumdiagramme aufstellen: mit und ohne Zurücklegen und aus Prozentangaben.' },
  { slug: 'pfadregeln', part: 'zufall', icon: 'route', title: 'Pfadregeln anwenden', desc: 'Produktregel und Summenregel, „mindestens“ und „höchstens“ über das Gegenereignis.' },
  { slug: 'abschluss-check', part: 'test', icon: 'flag-checkered', title: 'Abschluss-Check', desc: 'Gemischte Aufgaben aus allen Schritten – bist du bereit für die Anwendungsaufgaben?' },
]

export const lessonPath = (slug: string) => `/daten-und-zufall/${slug}`
