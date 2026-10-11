import type { Aufgabe } from './typen'

// Aufgaben aus früheren Abschlussprüfungen (Teil A, ohne Taschenrechner).
// Aufgaben, die nur mit Foto oder Karte funktionieren, sind bewusst nicht enthalten.
// Skizzen sind nachgezeichnet (figuren.tsx).

export const AUFGABEN_AP: Aufgabe[] = [
  // ── 2017 ──────────────────────────────────────────────────────────────
  {
    id: 'ap17-1', quelle: 'AP 2017', thema: 'prozent', points: 1, type: 'mc',
    text: ['Susanne und Jan kaufen sich gemeinsam eine Pizza. Susanne hat bereits drei Viertel gegessen. Den Rest teilt sie mit Jan und gibt ihm davon die Hälfte.', 'Wie hoch ist Jans Anteil an der gekauften Pizza?'],
    options: ['20 %', '25 %', '12,5 %', '10 %'], correct: 2,
    loesung: ['Rest der Pizza: $1 - \\frac{3}{4} = \\frac{1}{4}$', 'Jan bekommt die Hälfte davon: $\\frac{1}{2} \\cdot \\frac{1}{4} = \\frac{1}{8} = 12{,}5\\,\\%$'],
  },
  {
    id: 'ap17-2', quelle: 'AP 2017', thema: 'zahlen', points: 1, type: 'mc',
    text: ['Die kleinste der folgenden Zahlen ist …'],
    options: ['$2^3$', '$5\\frac{1}{2}$', '$\\sqrt{17}$', '$5{,}65$'], correct: 2,
    loesung: ['$2^3 = 8$', '$5\\frac{1}{2} = 5{,}5$', '$\\sqrt{16} < \\sqrt{17} < \\sqrt{25}$, also $4 < \\sqrt{17} < 5$', 'Die kleinste Zahl ist $\\sqrt{17}$.'],
  },
  {
    id: 'ap17-3', quelle: 'AP 2017', thema: 'raum', points: 1, type: 'mc',
    text: ['Das Hinterrad eines Fahrrads hat einen Durchmesser von 30 cm. Bei 10 Radumdrehungen fährt man …'],
    options: ['ca. 15 m.', 'ca. 30 m.', 'ca. 3 m.', 'ca. 9 m.'], correct: 3,
    loesung: ['$u = 2 \\cdot r \\cdot \\pi = d \\cdot \\pi \\approx 0{,}3\\,\\text{m} \\cdot 3 = 0{,}9\\,\\text{m}$', '10 Umdrehungen: $10 \\cdot 0{,}9\\,\\text{m} = 9\\,\\text{m}$'],
  },
  {
    id: 'ap17-4', quelle: 'AP 2017', thema: 'daten', points: 1, type: 'mc',
    text: ['In einer Urne befinden sich 4 Plättchen mit den Buchstaben B, E, G und R. Es wird ohne Zurücklegen gezogen.', 'Wie groß ist die Wahrscheinlichkeit, dass in der gezogenen Reihenfolge das Wort „BERG“ gebildet wird?'],
    options: ['$\\frac{1}{6}$', '$\\frac{1}{12}$', '$\\frac{1}{24}$', '$\\frac{1}{32}$'], correct: 2,
    loesung: ['1. Pfadregel (Produktregel), ohne Zurücklegen:', '$$P(\\text{BERG}) = \\frac{1}{4} \\cdot \\frac{1}{3} \\cdot \\frac{1}{2} \\cdot \\frac{1}{1} = \\frac{1}{24}'],
  },
  {
    id: 'ap17-5', quelle: 'AP 2017', thema: 'terme', points: 2, type: 'num',
    text: ['Eine Waage befindet sich im Gleichgewicht. Auf der linken Waagschale liegen Gewichte von 200 g und 5 g, auf der rechten Waagschale eine Kugel und ein Gewicht von 50 g.', 'Stellen Sie eine Gleichung auf und berechnen Sie das Gewicht der Kugel.'],
    fields: [{ label: 'Gewicht der Kugel:', answer: 155, unit: 'g' }],
    loesung: ['$$\\begin{aligned} 200 + 5 &= x + 50 \\quad &&| -50 \\\\ 155 &= x \\end{aligned}', 'Die Kugel wiegt 155 g.'],
  },
  {
    id: 'ap17-6', quelle: 'AP 2017', thema: 'trigo', points: 2, type: 'self', figur: { k: 'bild', name: 'dreieck60' },
    text: ['Begründen Sie, warum man mit diesen Maßen kein Dreieck bilden kann. (Die Skizze ist nicht maßstabsgetreu.)'],
    loesung: ['Das Dreieck hätte zwei gleich lange Seiten (20 cm) und dazwischen einen Winkel von 60°.', 'Dann sind auch die beiden Basiswinkel gleich groß: $(180° - 60°) : 2 = 60°$.', 'Alle Winkel sind 60°, das Dreieck müsste also gleichseitig sein. Die dritte Seite müsste dann ebenfalls 20 cm lang sein, nicht 14 cm.'],
  },
  {
    id: 'ap17-8', quelle: 'AP 2017', thema: 'prozent', points: 3, type: 'self',
    text: ['Eine Klasse wandert von Bad Wiessee aus den 21 km langen Seerundweg. Sie bricht um 13:00 Uhr auf und legt in den ersten 20 Minuten 1,4 km zurück. Nach einem Drittel des Weges dauert die erste Rast 16 Minuten, die zweite ist doppelt so lang.', 'Berechnen Sie, ob die Klasse pünktlich zum Abendessen um 18:30 Uhr in Bad Wiessee ist, wenn sie mit gleichbleibender Geschwindigkeit wandert.'],
    loesung: ['Geschwindigkeit: 1,4 km in 20 min $\\Rightarrow$ $3 \\cdot 1{,}4\\,\\text{km} = 4{,}2\\,\\text{km}$ pro Stunde', 'Reine Wanderzeit: $21\\,\\text{km} : 4{,}2\\,\\tfrac{\\text{km}}{\\text{h}} = 5\\,\\text{h}$', 'Pausen: $16\\,\\text{min} + 32\\,\\text{min} = 48\\,\\text{min}$', 'Ankunft: 13:00 Uhr + 5 h 48 min = 18:48 Uhr. Die Klasse kommt **nicht** pünktlich.'],
  },
  {
    id: 'ap17-9', quelle: 'AP 2017', thema: 'trigo', points: 2, type: 'num', figur: { k: 'bild', name: 'drachen' },
    text: ['Peter bastelt einen Drachen mit den Diagonalen $\\overline{AC} = e = 120\\,\\text{cm}$ und $\\overline{BD} = f = 60\\,\\text{cm}$. Er teilt $e$ durch $f$ so, dass das obere Teilstück $\\overline{EC}$ 40 cm lang ist.', 'Er verstärkt die Seiten $b$ und $c$ mit einem Metallstreifen. Berechnen Sie die Länge des Metallstreifens für beide Seiten zusammen.'],
    fields: [{ label: 'Länge des Metallstreifens:', answer: 100, unit: 'cm' }],
    loesung: ['$\\overline{EB} = f : 2 = 30\\,\\text{cm}$', 'Satz des Pythagoras im Dreieck EBC:', '$$b^2 = 40^2 + 30^2 = 1600 + 900 = 2500 \\;\\Rightarrow\\; b = 50\\,\\text{cm}', '$b = c$, also Metallstreifen: $2 \\cdot 50\\,\\text{cm} = 100\\,\\text{cm}$'],
  },
  {
    id: 'ap17w-1', quelle: 'AP 2017', thema: 'trigo', points: 2, type: 'self',
    text: ['Wahr oder falsch? Begründen Sie Ihre Entscheidung bzw. geben Sie ein Gegenbeispiel an.', '„In einem rechtwinkligen Dreieck ist die Hypotenuse immer die längste Seite.“'],
    loesung: ['**Wahr:** Der rechte Winkel ist der größte Winkel im Dreieck (die beiden anderen Winkel sind zusammen nur 90°).', 'Dem größten Winkel liegt die längste Seite gegenüber – das ist die Hypotenuse.'],
  },
  {
    id: 'ap17w-2', quelle: 'AP 2017', thema: 'trigo', points: 2, type: 'self',
    text: ['Wahr oder falsch? Begründen Sie Ihre Entscheidung bzw. geben Sie ein Gegenbeispiel an.', '„Ein rechtwinkliges Dreieck besitzt immer drei verschieden lange Seiten.“'],
    loesung: ['**Falsch:** Die beiden Katheten können gleich lang sein.', 'Gegenbeispiel: ein gleichschenklig-rechtwinkliges Dreieck mit den Winkeln 90°, 45°, 45° (z. B. die halbe Fläche eines Quadrats).'],
  },
  {
    id: 'ap17w-3', quelle: 'AP 2017', thema: 'prozent', points: 1, type: 'mc',
    text: ['Eine Jeanshose kostet 80,00 €. Ein Verkäufer reduziert den Preis um 20 %. Am nächsten Tag erhöht er den reduzierten Preis um 20 %.', 'Welchen Preis muss der Verkäufer nun an der Hose anbringen?'],
    options: ['64,80 €', '82,00 €', '76,80 €', '80,00 €'], correct: 2,
    loesung: ['Reduziert: $80{,}00\\,€ \\cdot 0{,}8 = 64{,}00\\,€$', 'Erhöht: $64{,}00\\,€ \\cdot 1{,}2 = 76{,}80\\,€$', 'Achtung: Die 20 % beziehen sich beim zweiten Mal auf einen kleineren Grundwert.'],
  },
  {
    id: 'ap17w-4', quelle: 'AP 2017', thema: 'raum', points: 1, type: 'mc',
    text: ['$\\frac{2}{5}$ von 10 Litern – das sind …'],
    options: ['0,04 Liter', '400 cm³', '4.000 cm³', '2 Liter'], correct: 2,
    loesung: ['$\\frac{2}{5} \\cdot 10\\,\\ell = 4\\,\\ell$', '$1\\,\\ell = 1\\,\\text{dm}^3 = 1000\\,\\text{cm}^3$, also $4\\,\\ell = 4000\\,\\text{cm}^3$'],
  },
  {
    id: 'ap17w-5', quelle: 'AP 2017', thema: 'raum', points: 1, type: 'mc', figur: { k: 'bild', name: 'wuerfelnetz' },
    text: ['Gegeben ist das Netz eines Würfels mit der Grundfläche G.', 'Welches Feld ist die gegenüberliegende Deckfläche D?'],
    options: ['Feld 1', 'Feld 2', 'Feld 4', 'Feld 5'], correct: 0,
    loesung: ['Faltet man das Netz, liegen Feld 2, Feld 3, Feld 4 und Feld 5 an G an.', 'Übrig bleibt **Feld 1** – es liegt G gegenüber.'],
  },
  {
    id: 'ap17w-6', quelle: 'AP 2017', thema: 'raum', points: 1, type: 'mc', figur: { k: 'bild', name: 'strahlen' },
    text: ['Welcher Ansatz ist richtig, um die Länge der Strecke $x = \\overline{AA\'}$ zu berechnen?'],
    options: ['$\\frac{x}{4} = \\frac{12}{8}$', '$\\frac{x}{12} = \\frac{8}{4}$', '$\\frac{4}{x + 4} = \\frac{12}{8}$', '$\\frac{4 + x}{4} = \\frac{12}{8}$'], correct: 3,
    loesung: ['2. Strahlensatz: $\\frac{|\\overline{ZA\'}|}{|\\overline{ZA}|} = \\frac{|\\overline{A\'B\'}|}{|\\overline{AB}|}$', 'Mit $|\\overline{ZA\'}| = 4 + x$: $\\;\\frac{4 + x}{4} = \\frac{12}{8}$'],
  },
  {
    id: 'ap17w-7', quelle: 'AP 2017', thema: 'terme', points: 2, type: 'num',
    text: ['Max hat versucht, die folgende Gleichung zu lösen. Dabei sind ihm zwei Rechenfehler unterlaufen:', '$$\\begin{aligned} (x+2)^2 &= x\\,(x-4) + 3x \\\\ x^2 + 2x + 4 &= x^2 - 4x + 3x \\\\ 2x + 4 &= -x \\\\ 3x &= -4 \\\\ x &= -\\tfrac{3}{4} \\end{aligned}', 'Finden Sie die Fehler und lösen Sie die Gleichung richtig.'],
    fields: [{ label: '$x =$', answer: -0.8 }],
    loesung: ['Fehler 1: $(x+2)^2 = x^2 + 4x + 4$ (1. binomische Formel), nicht $+2x$.', 'Fehler 2: Aus $3x = -4$ folgt $x = -\\frac{4}{3}$, nicht $-\\frac{3}{4}$.', 'Richtig:', '$$\\begin{aligned} x^2 + 4x + 4 &= x^2 - 4x + 3x \\quad &&| -x^2 \\\\ 4x + 4 &= -x &&| +x \\; -4 \\\\ 5x &= -4 &&| :5 \\\\ x &= -\\tfrac{4}{5} = -0{,}8 \\end{aligned}'],
  },

  // ── 2018 HT ───────────────────────────────────────────────────────────
  {
    id: 'ap18-1', quelle: 'AP 2018 HT', thema: 'daten', points: 1, type: 'num',
    text: ['Max packt vier Oberteile, zwei Hosen und drei Paar Schuhe in seine Reisetasche.', 'Geben Sie die Anzahl der Kombinationsmöglichkeiten an.'],
    fields: [{ label: 'Möglichkeiten:', answer: 24 }],
    loesung: ['$4 \\cdot 2 \\cdot 3 = 24$ Möglichkeiten'],
  },
  {
    id: 'ap18-2', quelle: 'AP 2018 HT', thema: 'prozent', points: 1, type: 'num',
    text: ['Im Schlussverkauf gilt: **5 % Rabatt ab 50,00 €, 20 % Rabatt ab 150,00 €.**', 'In Nadines Einkaufskorb liegen Kleidungsstücke im Wert von 140,00 €. Berechnen Sie den Preis nach Abzug des Rabatts.'],
    fields: [{ label: 'Preis:', answer: 133, unit: '€' }],
    loesung: ['140,00 € liegt unter 150,00 €, es gibt also 5 % Rabatt.', '$PW = \\frac{GW \\cdot p}{100} = \\frac{140{,}00\\,€ \\cdot 5}{100} = 7{,}00\\,€$', '$140{,}00\\,€ - 7{,}00\\,€ = 133{,}00\\,€$'],
  },
  {
    id: 'ap18-3', quelle: 'AP 2018 HT', thema: 'prozent', points: 2, type: 'num',
    text: ['Im Schlussverkauf gilt: **5 % Rabatt ab 50,00 €, 20 % Rabatt ab 150,00 €.** Nadine hat Ware für 140,00 € im Korb.', 'Sie überlegt, ein weiteres T-Shirt für 20,00 € zu kaufen. Berechnen Sie den neuen Preis. Was raten Sie ihr?'],
    fields: [{ label: 'Preis mit T-Shirt:', answer: 128, unit: '€' }],
    loesung: ['Neuer Warenwert: $140{,}00\\,€ + 20{,}00\\,€ = 160{,}00\\,€$ – jetzt gibt es 20 % Rabatt.', '$PW = \\frac{160{,}00\\,€ \\cdot 20}{100} = 32{,}00\\,€$', '$160{,}00\\,€ - 32{,}00\\,€ = 128{,}00\\,€$', 'Mit T-Shirt zahlt sie weniger als ohne (133,00 €) – sie sollte es kaufen.'],
  },
  {
    id: 'ap18-4', quelle: 'AP 2018 HT', thema: 'zins', points: 2, type: 'num',
    text: ['In einer Zeitung steht: „Günstiger Kredit: 12.000,00 € für nur 120,00 € Zinsen im Monat.“', 'Bestimmen Sie durch Rechnung die Höhe des Jahreszinssatzes.'],
    fields: [{ label: '$p =$', answer: 12, unit: '%' }],
    loesung: ['Aus $Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360}$ folgt:', '$$p = \\frac{Z \\cdot 100 \\cdot 360}{K \\cdot t} = \\frac{120 \\cdot 100 \\cdot 360}{12\\,000 \\cdot 30} = 12', 'Der Jahreszinssatz beträgt 12 %.'],
  },
  {
    id: 'ap18-5', quelle: 'AP 2018 HT', thema: 'daten', points: 1, type: 'num',
    text: ['Die Buchstaben des Wortes M A T H E M A T I K stehen auf zehn Karten. Es wird verdeckt eine Karte gezogen.', 'Geben Sie die Wahrscheinlichkeit an, dass ein „T“ gezogen wird.'],
    fields: [{ label: '$P(\\text{„T“}) =$', answer: 20, unit: '%' }],
    loesung: ['10 Karten, davon 2-mal „T“ (Laplace):', '$$P(\\text{„T“}) = \\frac{2}{10} = 0{,}2 = 20\\,\\%'],
  },
  {
    id: 'ap18-6', quelle: 'AP 2018 HT', thema: 'zahlen', points: 1, type: 'mc',
    text: ['Die kleinste der folgenden Zahlen ist …'],
    options: ['$2^0$', '$4^{\\frac{1}{2}}$', '$\\sqrt[3]{27}$', '$10^{-2}$'], correct: 3,
    loesung: ['$2^0 = 1$', '$4^{\\frac{1}{2}} = \\sqrt{4} = 2$', '$\\sqrt[3]{27} = 3$', '$10^{-2} = \\frac{1}{100} = 0{,}01$ – die kleinste Zahl.'],
  },
  {
    id: 'ap18-7', quelle: 'AP 2018 HT', thema: 'funktionen', points: 1, type: 'mc',
    figur: { k: 'tabelle', zeilen: [['$x$', '$-3$', '$0$', '$1$', '$2$'], ['$y$', '$12$', '$3$', '$4$', '$7$']] },
    text: ['Welche Funktionsgleichung wird durch die Wertetabelle abgebildet?'],
    options: ['$y = 2x + 3$', '$y = x^2 + 3$', '$y = 4x^2$', '$y = x + 5$'], correct: 1,
    loesung: ['Einsetzen der Werte in $y = x^2 + 3$:', '$(-3)^2 + 3 = 12$, $\\;0^2 + 3 = 3$, $\\;1^2 + 3 = 4$, $\\;2^2 + 3 = 7$ ✓', 'Die anderen Gleichungen passen schon beim ersten Wertepaar nicht.'],
  },
  {
    id: 'ap18-8', quelle: 'AP 2018 HT', thema: 'trigo', points: 1, type: 'num', figur: { k: 'bild', name: 'parallelogramm' },
    text: ['Gegeben sind das Parallelogramm ABCD und das gleichschenklige Dreieck EDA mit $\\delta = 120°$.', 'Bestimmen Sie rechnerisch die Größe des Winkels $\\beta$.'],
    fields: [{ label: '$\\beta =$', answer: 150, unit: '°' }],
    loesung: ['Basiswinkel im gleichschenkligen Dreieck EDA: $(180° - 120°) : 2 = 30°$', '$\\beta$ ist Nebenwinkel dazu: $180° - 30° = 150°$'],
  },
  {
    id: 'ap18-9', quelle: 'AP 2018 HT', thema: 'trigo', points: 1, type: 'self', figur: { k: 'rtri', links: '300 cm', unten: '400 cm', hyp: '500 cm' },
    text: ['Maurer kontrollieren den rechten Winkel zwischen zwei Wänden mit einer Schnur: Sie messen 400 cm an der einen Wand, 300 cm an der anderen und prüfen, ob die Verbindung 500 cm lang ist.', 'Begründen Sie rechnerisch, warum so der rechte Winkel sichergestellt ist.'],
    loesung: ['Satz des Pythagoras (Umkehrung): Gilt $c^2 = a^2 + b^2$, ist das Dreieck rechtwinklig.', '$$3^2 + 4^2 = 9 + 16 = 25 = 5^2', 'Also stehen die Wände im rechten Winkel zueinander.'],
  },
  {
    id: 'ap18-10', quelle: 'AP 2018 HT', thema: 'raum', points: 2, type: 'num', figur: { k: 'bild', name: 'giebel' },
    text: ['Ein Landwirt will den dreieckigen Holzgiebel DCE seines Geräteschuppens streichen. Er misst $|\\overline{AB}| = 8{,}00\\,\\text{m}$, $|\\overline{EF}| = 7{,}00\\,\\text{m}$ und $|\\overline{BC}| = 4{,}00\\,\\text{m}$.', 'Berechnen Sie die zu streichende Fläche.'],
    fields: [{ label: '$A =$', answer: 12, unit: 'm²' }],
    loesung: ['Höhe des Giebels: $|\\overline{EG}| = |\\overline{EF}| - |\\overline{FG}| = 7\\,\\text{m} - 4\\,\\text{m} = 3\\,\\text{m}$', '$$A = \\frac{g \\cdot h}{2} = \\frac{8\\,\\text{m} \\cdot 3\\,\\text{m}}{2} = 12\\,\\text{m}^2'],
  },

  // ── 2018 NT ───────────────────────────────────────────────────────────
  {
    id: 'ap18n-1', quelle: 'AP 2018 NT', thema: 'prozent', points: 1, type: 'num',
    text: ['Herr Schönfelder zahlt für den Museumsbesuch seiner 24 Schüler 96,00 € Eintritt.', 'Wie viel bezahlt Frau Kersten für ihre 20 Schüler?'],
    fields: [{ label: 'Eintritt:', answer: 80, unit: '€' }],
    loesung: ['Dreisatz: $96{,}00\\,€ : 24 = 4{,}00\\,€$ pro Schüler', '$20 \\cdot 4{,}00\\,€ = 80{,}00\\,€$'],
  },
  {
    id: 'ap18n-2', quelle: 'AP 2018 NT', thema: 'prozent', points: 1, type: 'num',
    text: ['Beim Radrennen über 180 km ruft der Trainer: „40 % der Strecke bist du schon gefahren!“', 'Wie viele km hat Armin noch vor sich?'],
    fields: [{ label: 'Reststrecke:', answer: 108, unit: 'km' }],
    loesung: ['Noch zu fahren: $100\\,\\% - 40\\,\\% = 60\\,\\%$', '$$PW = \\frac{GW \\cdot p}{100} = \\frac{180\\,\\text{km} \\cdot 60}{100} = 108\\,\\text{km}'],
  },
  {
    id: 'ap18n-3', quelle: 'AP 2018 NT', thema: 'zins', points: 2, type: 'num',
    text: ['Herr Ott musste sein Girokonto 36 Tage überziehen. Die Bank berechnet 100,00 € Überziehungszinsen bei 10 % p. a.', 'Um welchen Betrag hat Herr Ott sein Konto überzogen?'],
    fields: [{ label: '$K =$', answer: 10000, unit: '€' }],
    loesung: ['Aus $Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360}$ folgt:', '$$K = \\frac{Z \\cdot 100 \\cdot 360}{p \\cdot t} = \\frac{100 \\cdot 100 \\cdot 360}{10 \\cdot 36} = 10\\,000\\,€'],
  },
  {
    id: 'ap18n-4', quelle: 'AP 2018 NT', thema: 'zahlen', points: 1, type: 'mc',
    text: ['Die größte der folgenden Zahlen ist …'],
    options: ['$2\\pi$', '$49^{\\frac{1}{2}}$', '$\\sqrt[4]{16}$', '$\\frac{1}{8^{-1}}$'], correct: 3,
    loesung: ['$2\\pi \\approx 6{,}28$', '$49^{\\frac{1}{2}} = \\sqrt{49} = 7$', '$\\sqrt[4]{16} = 2$', '$\\frac{1}{8^{-1}} = 8^1 = 8$ – die größte Zahl.'],
  },
  {
    id: 'ap18n-5', quelle: 'AP 2018 NT', thema: 'terme', points: 1, type: 'mc',
    text: ['Niklas möchte einen Fernseher für 750,00 € kaufen. Von seinen Eltern bekommt er einmalig 150,00 €, mit Nachhilfe verdient er monatlich 50,00 €.', 'Mit welcher Gleichung kann er berechnen, wie viele Monate $x$ er noch sparen muss?'],
    options: ['$x + 150 = 750$', '$750 - 150 = 50 \\cdot x$', '$150 \\cdot x + 50 = 750$', '$50 \\cdot x - 150 = 750$'], correct: 1,
    loesung: ['Es fehlen noch $750 - 150 = 600$ €, die er mit $50 \\cdot x$ € anspart: $750 - 150 = 50 \\cdot x$', '(Lösung: $x = 12$ Monate)'],
  },
  {
    id: 'ap18n-6', quelle: 'AP 2018 NT', thema: 'funktionen', points: 2, type: 'self',
    text: ['Carla hat versucht, das folgende Gleichungssystem zu lösen. Dabei ist ihr ein Fehler unterlaufen.', '$$\\begin{aligned} \\text{I}\\quad & y = 2x + 4 \\\\ \\text{II}\\quad & 3y = 9x - 3 \\;\\Rightarrow\\; y = 3x - 1 \\\\ & 2x + 4 = 3x - 1 \\\\ & 5 = 5x \\\\ & 1 = x \\end{aligned}', 'Benennen Sie das gewählte Lösungsverfahren und kennzeichnen Sie den Fehler.'],
    loesung: ['Verfahren: **Gleichsetzungsverfahren**', 'Fehler: Aus $2x + 4 = 3x - 1$ folgt $5 = x$ (es wird $-2x$ und $+1$ gerechnet), nicht $5 = 5x$.', 'Richtig: $x = 5$, $\\;y = 2 \\cdot 5 + 4 = 14$'],
  },
  {
    id: 'ap18n-7', quelle: 'AP 2018 NT', thema: 'trigo', points: 2, type: 'self',
    text: ['Überprüfen Sie rechnerisch, ob das Dreieck BDF mit den Seiten $b = 0{,}50\\,\\text{m}$, $d = 40{,}00\\,\\text{cm}$ und $f = 3{,}00\\,\\text{dm}$ rechtwinklig ist.'],
    loesung: ['Gleiche Einheit: $b = 5\\,\\text{dm}$, $d = 4\\,\\text{dm}$, $f = 3\\,\\text{dm}$', '$$5^2 = 3^2 + 4^2 \\quad\\Leftrightarrow\\quad 25 = 25', 'Der Satz des Pythagoras ist erfüllt – das Dreieck ist rechtwinklig.'],
  },
  {
    id: 'ap18n-8', quelle: 'AP 2018 NT', thema: 'raum', points: 1, type: 'mc',
    text: ['Die Oberfläche eines Würfels beträgt $54\\,\\text{cm}^2$. Sein Volumen beträgt dann:'],
    options: ['$27\\,\\text{cm}^3$', '$36\\,\\text{cm}^3$', '$54\\,\\text{cm}^3$', '$108\\,\\text{cm}^3$'], correct: 0,
    loesung: ['$O = 6 \\cdot a^2 = 54\\,\\text{cm}^2 \\;\\Rightarrow\\; a^2 = 9\\,\\text{cm}^2 \\;\\Rightarrow\\; a = 3\\,\\text{cm}$', '$V = a^3 = 27\\,\\text{cm}^3$'],
  },
  {
    id: 'ap18n-9', quelle: 'AP 2018 NT', thema: 'trigo', points: 2, type: 'self', figur: { k: 'bild', name: 'parallelen' },
    text: ['Begründen Sie, warum die Geraden $a$ und $b$ parallel zueinander sein müssen. (Skizze nicht maßstabsgetreu)'],
    loesung: ['Der Nebenwinkel zu 120° beträgt $180° - 120° = 60°$.', 'Dritter Winkel im Dreieck: $180° - 60° - 85° = 35°$', 'Dieser Winkel und der Winkel 35° an der Geraden $a$ sind Stufenwinkel. Gleich große Stufenwinkel $\\Rightarrow a \\parallel b$.'],
  },
  {
    id: 'ap18n-10', quelle: 'AP 2018 NT', thema: 'raum', points: 2, type: 'num',
    text: ['Max joggt um einen kreisrunden See mit 80 m Durchmesser. Die Strecke verläuft ca. 10 m vom Ufer entfernt um den See.', 'Wie viele Meter läuft Max bei einer Umrundung? Rechnen Sie mit $\\pi = 3$.'],
    fields: [{ label: '$u \\approx$', answer: 300, unit: 'm' }],
    loesung: ['Radius der Laufstrecke: $r = 40\\,\\text{m} + 10\\,\\text{m} = 50\\,\\text{m}$', '$$u = 2 \\cdot r \\cdot \\pi = 2 \\cdot 50\\,\\text{m} \\cdot 3 = 300\\,\\text{m}'],
  },

  // ── 2019 HT ───────────────────────────────────────────────────────────
  {
    id: 'ap19-1', quelle: 'AP 2019 HT', thema: 'raum', points: 2, type: 'num',
    text: ['Aus einem Holzwürfel mit der Kantenlänge 3 dm wurden acht Würfel mit der Kantenlänge 1 dm herausgeschnitten.', 'Welches Volumen hat der Restkörper?'],
    fields: [{ label: '$V =$', answer: 19, unit: 'dm³' }],
    loesung: ['$V_\\text{Würfel} = a^3 = (3\\,\\text{dm})^3 = 27\\,\\text{dm}^3$', 'Herausgeschnitten: $8 \\cdot 1\\,\\text{dm}^3 = 8\\,\\text{dm}^3$', '$V = 27\\,\\text{dm}^3 - 8\\,\\text{dm}^3 = 19\\,\\text{dm}^3$'],
  },
  {
    id: 'ap19-2', quelle: 'AP 2019 HT', thema: 'funktionen', points: 2, type: 'num',
    text: ['Gegeben sind die Punkte $A\\,(1 \\mid 3)$ und $B\\,(-1 \\mid -1)$ sowie die Funktionen $y_1 = -2x + 1$ und $y_2 = x^2 - 3x - 5$.', 'Sind die Behauptungen wahr (w) oder falsch (f)? Begründen Sie rechnerisch.'],
    fields: [{ label: '$A \\in y_1$:', answer: 'f', choices: ['w', 'f'] }, { label: '$B \\in y_2$:', answer: 'w', choices: ['w', 'f'] }],
    loesung: ['$A$ in $y_1$: $\\;3 \\neq -2 \\cdot 1 + 1 = -1$ $\\Rightarrow$ falsch', '$B$ in $y_2$: $\\;-1 = (-1)^2 - 3 \\cdot (-1) - 5 = 1 + 3 - 5 = -1$ $\\Rightarrow$ wahr'],
  },
  {
    id: 'ap19-3', quelle: 'AP 2019 HT', thema: 'prozent', points: 1, type: 'mc',
    text: ['Herr Schneider fährt täglich eine Stunde zur Arbeit. Wegen einer Baustelle verlängert sich die Fahrzeit um 15 %.', 'Wie viele Minuten ist er dadurch länger unterwegs?'],
    options: ['0,1 h', '9 min', '69 min', '6 min'], correct: 1,
    loesung: ['$$PW = \\frac{60\\,\\text{min} \\cdot 15}{100} = 9\\,\\text{min}'],
  },
  {
    id: 'ap19-4', quelle: 'AP 2019 HT', thema: 'raum', points: 1, type: 'mc',
    text: ['Lässt man ein Rechteck um eine seiner Seiten (als Achse) rotieren, so entsteht ein …'],
    options: ['Quader', 'Kegel', 'Würfel', 'Zylinder'], correct: 3,
    loesung: ['Die Achse wird zur Höhe, die andere Seite zum Radius – es entsteht ein **Zylinder**.'],
  },
  {
    id: 'ap19-5', quelle: 'AP 2019 HT', thema: 'zahlen', points: 1, type: 'mc',
    text: ['Welche Potenz ergibt sich bei der Multiplikation $5^3 \\cdot 5^6$?'],
    options: ['$5^{18}$', '$5^{-3}$', '$5^{9}$', '$5^{3}$'], correct: 2,
    loesung: ['$a^m \\cdot a^n = a^{m+n}$', '$5^3 \\cdot 5^6 = 5^{3+6} = 5^9$'],
  },
  {
    id: 'ap19-6', quelle: 'AP 2019 HT', thema: 'daten', points: 1, type: 'mc',
    text: ['Frank hat einen Schlüsselbund mit drei Schlüsseln. Nur einer sperrt die Wohnung auf. Er probiert die Schlüssel in zufälliger Reihenfolge (ohne einen Schlüssel zweimal zu nehmen).', 'Wie groß ist die Wahrscheinlichkeit, dass erst der letzte Schlüssel passt?'],
    options: ['$\\frac{4}{9}$', '$\\frac{1}{3}$', '$\\frac{1}{4}$', '$\\frac{2}{3}$'], correct: 1,
    loesung: ['Baumdiagramm: 1. Schlüssel passt nicht: $\\frac{2}{3}$; 2. Schlüssel passt nicht: $\\frac{1}{2}$; 3. Schlüssel passt: $\\frac{1}{1}$', '$$P = \\frac{2}{3} \\cdot \\frac{1}{2} \\cdot 1 = \\frac{1}{3}'],
  },
  {
    id: 'ap19-7', quelle: 'AP 2019 HT', thema: 'daten', points: 2, type: 'num',
    figur: { k: 'balken', daten: [{ label: 'Tag 1', wert: 50 }, { label: 'Tag 2', wert: 70 }, { label: 'Tag 3', wert: 60 }, { label: 'Tag 4', wert: 40 }, { label: 'Tag 5', wert: 30 }], einheit: 'km', max: 80, schritt: 20 },
    text: ['Petra und Jürgen fahren mit dem Rad von Passau nach Wien. Die Längen der fünf Tagestouren zeigt das Diagramm.', 'Ermitteln Sie, wie viele Kilometer sie durchschnittlich pro Tag gefahren sind.'],
    fields: [{ label: '$\\bar{x} =$', answer: 50, unit: 'km' }],
    loesung: ['Gesamt: $50 + 70 + 60 + 40 + 30 = 250\\,\\text{km}$', '$$\\bar{x} = \\frac{x_1 + x_2 + \\ldots + x_n}{n} = \\frac{250\\,\\text{km}}{5} = 50\\,\\text{km}'],
  },
  {
    id: 'ap19-8', quelle: 'AP 2019 HT', thema: 'daten', points: 2, type: 'num',
    figur: { k: 'saeulen', titel: 'Teilnehmer am Sporttag je Sportart', daten: [{ label: 'Volleyball', wert: 24 }, { label: 'Badminton', wert: 36 }, { label: 'Yoga', wert: null }], max: 40, schritt: 10 },
    text: ['Am Sporttag wählt jeder Schüler genau eine Sportart: Volleyball (30 %), Badminton (45 %), Yoga (? %).', 'Berechnen Sie die Teilnehmerzahl bei Yoga.'],
    fields: [{ label: 'Yoga:', answer: 20, unit: 'Teilnehmer' }],
    loesung: ['Volleyball und Badminton: $30\\,\\% + 45\\,\\% = 75\\,\\% \\;\\hat{=}\\; 24 + 36 = 60$ Teilnehmer', 'Yoga: $100\\,\\% - 75\\,\\% = 25\\,\\%$', '$$x = \\frac{60 \\cdot 25}{75} = 20 \\text{ Teilnehmer}'],
  },
  {
    id: 'ap19-9', quelle: 'AP 2019 HT', thema: 'terme', points: 2, type: 'num',
    text: ['Pia hat versucht, die Gleichung zu lösen. Dabei ist ihr ein Rechenfehler unterlaufen:', '$$\\begin{aligned} x\\,(x - 8) &= (3 - x)^2 \\\\ x^2 - 8x &= 9 - 9x + x^2 \\\\ -8x &= 9 - 9x \\\\ x &= 9 \\end{aligned}', 'Lösen Sie die Gleichung richtig.'],
    fields: [{ label: '$x =$', answer: -4.5 }],
    loesung: ['Fehler: $(3 - x)^2 = 9 - 6x + x^2$ (2. binomische Formel), nicht $-9x$.', '$$\\begin{aligned} x^2 - 8x &= 9 - 6x + x^2 \\quad &&| -x^2 \\\\ -8x &= 9 - 6x &&| +6x \\\\ -2x &= 9 &&| :(-2) \\\\ x &= -4{,}5 \\end{aligned}'],
  },

  // ── 2026 HT ───────────────────────────────────────────────────────────
  {
    id: 'ap26-1', quelle: 'AP 2026', thema: 'prozent', points: 2, type: 'num',
    text: ['Frau Lachner hat ein monatliches Nettoeinkommen von 2.000,00 €. Für Miete und Wohnen muss sie 40 % ihres Verdienstes aufwenden.', 'Berechnen Sie, über welchen Betrag sie anschließend noch verfügen kann.'],
    fields: [{ label: 'Betrag:', answer: 1200, unit: '€' }],
    loesung: ['$$PW = \\frac{GW \\cdot p}{100} = \\frac{2000{,}00\\,€ \\cdot 40}{100} = 800{,}00\\,€', '$2000{,}00\\,€ - 800{,}00\\,€ = 1200{,}00\\,€$'],
  },
  {
    id: 'ap26-2', quelle: 'AP 2026', thema: 'zins', points: 2, type: 'num',
    text: ['Herr Glücklich legt sein Geld zu 5,0 % p. a. an. Nach 30 Tagen erhält er 15,00 € Zinsen.', 'Berechnen Sie die Höhe des eingezahlten Kapitals.'],
    fields: [{ label: '$K =$', answer: 3600, unit: '€' }],
    loesung: ['Aus $Z = \\frac{K \\cdot p \\cdot t}{100 \\cdot 360}$ folgt:', '$$K = \\frac{Z \\cdot 100 \\cdot 360}{p \\cdot t} = \\frac{15 \\cdot 100 \\cdot 360}{5 \\cdot 30} = 3600\\,€'],
  },
  {
    id: 'ap26-3', quelle: 'AP 2026', thema: 'zahlen', points: 1, type: 'num',
    text: ['Bestimmen Sie jeweils die fehlende Quadratwurzel. (Beispiel: $\\sqrt{9} = 3$)'],
    fields: [{ label: '$\\sqrt{144} =$', answer: 12 }, { label: '$\\sqrt{\\tfrac{1}{4}} =$', answer: 0.5 }],
    loesung: ['$\\sqrt{144} = 12$, weil $12^2 = 144$', '$\\sqrt{\\frac{1}{4}} = \\frac{1}{2} = 0{,}5$, weil $\\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}$'],
  },
  {
    id: 'ap26-4', quelle: 'AP 2026', thema: 'funktionen', points: 2, type: 'num',
    text: ['Der Graph einer quadratischen Funktion ist eine **nach unten geöffnete Normalparabel**, die im Vergleich zur Normalparabel um drei nach links und um 1,5 nach oben verschoben ist.', 'Bestimmen Sie den Scheitelpunkt S. Die Funktionsgleichung in Scheitelform vergleichen Sie mit der Lösung.'],
    fields: [{ label: '$x_s =$', answer: -3 }, { label: '$y_s =$', answer: 1.5 }],
    loesung: ['Verschiebung um 3 nach links: $x_s = -3$; um 1,5 nach oben: $y_s = 1{,}5$ $\\Rightarrow S\\,(-3 \\mid 1{,}5)$', 'Nach unten geöffnete Normalparabel: $a = -1$', '$$p\\colon y = a \\cdot (x - x_s)^2 + y_s = -(x + 3)^2 + 1{,}5'],
  },
  {
    id: 'ap26-t1', quelle: 'AP 2026', thema: 'trigo', points: 2, type: 'num', figur: { k: 'bild', name: 'rechteckDiag' },
    text: ['Herr Fuchs teilt sein rechteckiges Grundstück (6 m × 8 m) entlang der Diagonalen $|\\overline{AB}|$ mit einem Zaun.', 'Berechnen Sie, wie viele Zaunelemente er kaufen muss, wenn ein Element 2,50 m lang ist.'],
    fields: [{ label: 'Zaunelemente:', answer: 4 }],
    loesung: ['Satz des Pythagoras:', '$$|\\overline{AB}|^2 = 6^2 + 8^2 = 36 + 64 = 100 \\;\\Rightarrow\\; |\\overline{AB}| = 10\\,\\text{m}', '$10\\,\\text{m} : 2{,}5\\,\\text{m} = 4$ Zaunelemente'],
  },
  {
    id: 'ap26-t2', quelle: 'AP 2026', thema: 'trigo', points: 2, type: 'num', figur: { k: 'bild', name: 'sonnensegel' },
    text: ['Die Terrasse der Familie Fuchs besitzt ein dreieckiges Sonnensegel (Seiten 5 m, 6 m und 3 m, $\\alpha = 30°$ zwischen 5 m und 6 m).', 'Berechnen Sie die Fläche. Nutzen Sie: $\\sin 30° \\approx 0{,}50$; $\\cos 30° \\approx 0{,}87$; $\\sin 56{,}3° \\approx 0{,}83$; $\\cos 56{,}3° \\approx 0{,}55$.'],
    fields: [{ label: '$A =$', answer: 7.5, unit: 'm²' }],
    loesung: ['Flächensatz mit den Seiten am Winkel $\\alpha$:', '$$A_\\Delta = \\frac{1}{2} \\cdot b \\cdot c \\cdot \\sin\\alpha = \\frac{1}{2} \\cdot 5\\,\\text{m} \\cdot 6\\,\\text{m} \\cdot 0{,}50 = 7{,}5\\,\\text{m}^2'],
  },
  {
    id: 'ap26-d1', quelle: 'AP 2026', thema: 'daten', points: 1, type: 'num', figur: { k: 'urne', schwarz: 4, weiss: 0, baum: ['\\frac{1}{3}', '\\frac{2}{3}'] },
    text: ['In einer Urne befinden sich weiße und schwarze Kugeln. Laut Baumdiagramm zieht man mit $\\frac{1}{3}$ eine weiße und mit $\\frac{2}{3}$ eine schwarze Kugel. In der Urne liegen bereits 4 schwarze Kugeln.', 'Wie viele weiße Kugeln fehlen in der Urne?'],
    fields: [{ label: 'weiße Kugeln:', answer: 2 }],
    loesung: ['4 schwarze Kugeln entsprechen $\\frac{2}{3}$ aller Kugeln, also gibt es insgesamt 6 Kugeln.', 'Weiß: $\\frac{1}{3} \\cdot 6 = 2$ Kugeln'],
  },
  {
    id: 'ap26-d2', quelle: 'AP 2026', thema: 'daten', points: 2, type: 'num',
    figur: { k: 'tabelle', zeilen: [['Tag', 'Mo', 'Di', 'Mi', 'Do', 'Fr'], ['Strecke in km', '6,1', '5,5', '5,9', '6,3', '6,2']] },
    text: ['Dieters Fitnessuhr zeichnet die gelaufenen Strecken auf.', 'Bestimmen Sie das arithmetische Mittel der gelaufenen Strecken.'],
    fields: [{ label: '$\\bar{x} =$', answer: 6, unit: 'km' }],
    loesung: ['$$\\bar{x} = \\frac{6{,}1 + 5{,}5 + 5{,}9 + 6{,}3 + 6{,}2}{5} = \\frac{30}{5} = 6\\,\\text{km}'],
  },
  {
    id: 'ap26-r1', quelle: 'AP 2026', thema: 'raum', points: 2, type: 'num', figur: { k: 'bild', name: 'vordach' },
    text: ['Ein Vordach wird mit vier parallelen Streben im Abstand von jeweils 50 cm errichtet. Die Strebe an der Hauswand ist 60 cm lang. (Die Breite der Streben kann vernachlässigt werden.)', 'Bestimmen Sie die Länge der kleinsten Strebe $x$.'],
    fields: [{ label: '$x =$', answer: 15, unit: 'cm' }],
    loesung: ['Abstand der Wandstrebe von der Spitze: $4 \\cdot 50\\,\\text{cm} = 200\\,\\text{cm}$', '2. Strahlensatz:', '$$\\frac{x}{60\\,\\text{cm}} = \\frac{50\\,\\text{cm}}{200\\,\\text{cm}} \\;\\Rightarrow\\; x = \\frac{60 \\cdot 50}{200}\\,\\text{cm} = 15\\,\\text{cm}'],
  },
  {
    id: 'ap26-r2', quelle: 'AP 2026', thema: 'raum', points: 2, type: 'num',
    text: ['Ein quaderförmiger Pflanzkübel ist innen 80 cm lang, 30 cm breit und 30 cm hoch. Er wird bis zur Oberkante mit Erde gefüllt.', 'Berechnen Sie das Volumen der benötigten Erde in Liter.'],
    fields: [{ label: '$V =$', answer: 72, unit: 'Liter' }],
    loesung: ['$$V = a \\cdot b \\cdot h = 8\\,\\text{dm} \\cdot 3\\,\\text{dm} \\cdot 3\\,\\text{dm} = 72\\,\\text{dm}^3 = 72\\,\\ell'],
  },
]
