import type { Feld } from '../../abschlusspruefung/kopfrechnen/typen'

// Anwendungsaufgaben „Funktionaler Zusammenhang“ (quadratische Funktionen), nachgebaut nach Abschlussprüfungen der
// Wirtschaftsschule Bayern. Namen, Formulierungen und Zahlenwerte sind verändert; alle Ergebnisse sind neu berechnet.
// Formeln nach der Merkhilfe (Normalform, Zweipunkteform, Scheitelform, Lösungsformel, Scheitelpunktkoordinaten).

export type SkizzeName = 'wurf' | 'freiwurf' | 'feuerwehr' | 'haengebruecke' | 'skater' | 'glastunnel' | 'minigolf' | 'torbogen'

export interface Teil {
  nr: string
  punkte: number
  /** Situationstext vor der Teilaufgabe (Zwischentext wie in der Prüfung) */
  vorher?: string[]
  text: string[]
  felder: Feld[]
  loesung: string[]
}

export interface Anwendung {
  slug: string
  titel: string
  kurz: string
  quelle: string
  intro: string[]
  skizze: SkizzeName
  teile: Teil[]
}

const JN = ['ja', 'nein']

export const ANWENDUNGEN: Anwendung[] = [
  {
    slug: 'wurfprobe', titel: 'Die Wurfprobe', quelle: 'nach AP 2017', skizze: 'wurf',
    kurz: 'Flugparabel aus drei Punkten, Hang als Gerade, Auftreffpunkt und Wandhöhe.',
    intro: ['Beim Sporttag der 10. Klasse gibt es eine Wurfprobe: Für die Bestnote muss der Ball über eine 4 m hohe Wand geworfen werden, die auf einem Hang im Punkt E steht.', 'Lena wirft den Ball im Punkt A ab. Er fliegt parabelförmig durch die Punkte B und C. Alle Angaben in Meter, die Skizze ist nicht maßstabsgetreu.'],
    teile: [
      {
        nr: '2.1', punkte: 4,
        text: ['Ermitteln Sie die Funktionsgleichung der Flugparabel p durch $A\\,(0 \\mid 2)$, $B\\,(10 \\mid 5{,}5)$ und $C\\,(20 \\mid 7)$.', '(Ergebnis: $p\\colon y = -0{,}01x^2 + 0{,}45x + 2$)'],
        felder: [{ label: '$a =$', answer: -0.01 }, { label: '$b =$', answer: 0.45 }, { label: '$c =$', answer: 2 }],
        loesung: ['Aus $A\\,(0 \\mid 2)$ folgt $c = 2$, also $y = a \\cdot x^2 + b \\cdot x + 2$.', '$$\\begin{aligned} \\text{I}\\colon\\; 5{,}5 &= a \\cdot 10^2 + b \\cdot 10 + 2 &&\\Rightarrow\\; 100a + 10b = 3{,}5 \\\\ \\text{II}\\colon\\; 7 &= a \\cdot 20^2 + b \\cdot 20 + 2 &&\\Rightarrow\\; 400a + 20b = 5 \\end{aligned}', '$$\\text{II} - 2 \\cdot \\text{I}\\colon\\; 200a = -2 \\;\\Rightarrow\\; a = -0{,}01', '$a$ in I: $\\;-1 + 10b = 3{,}5 \\;\\Rightarrow\\; b = 0{,}45$', '$$p\\colon y = -0{,}01x^2 + 0{,}45x + 2'],
      },
      {
        nr: '2.2', punkte: 3,
        vorher: ['Der Hang wird durch die Gerade h beschrieben, die durch die Punkte $D\\,(12 \\mid 0)$ und $E\\,(28 \\mid 2{,}4)$ verläuft.'],
        text: ['Bestimmen Sie die Funktionsgleichung des Hanges h.', '(Ergebnis: $h\\colon y = 0{,}15x - 1{,}8$)'],
        felder: [{ label: '$m =$', answer: 0.15 }, { label: '$t =$', answer: -1.8 }],
        loesung: ['$$m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{2{,}4 - 0}{28 - 12} = \\frac{2{,}4}{16} = 0{,}15', '$D$ einsetzen in $y = m \\cdot x + t$: $\\;0 = 0{,}15 \\cdot 12 + t \\;\\Rightarrow\\; t = -1{,}8$', '$$h\\colon y = 0{,}15x - 1{,}8'],
      },
      {
        nr: '2.3', punkte: 4,
        text: ['Berechnen Sie die Koordinaten des Auftreffpunktes F des Balles am Hang.'],
        felder: [{ label: '$x_F =$', answer: 39.6, tol: 0.02 }, { label: '$y_F =$', answer: 4.14, tol: 0.02 }],
        loesung: ['Gleichsetzen von p und h:', '$$\\begin{aligned} -0{,}01x^2 + 0{,}45x + 2 &= 0{,}15x - 1{,}8 \\quad &&| -0{,}15x \\; +1{,}8 \\\\ -0{,}01x^2 + 0{,}3x + 3{,}8 &= 0 \\end{aligned}', '$$x_{1,2} = \\frac{-0{,}3 \\pm \\sqrt{0{,}3^2 - 4 \\cdot (-0{,}01) \\cdot 3{,}8}}{2 \\cdot (-0{,}01)} = \\frac{-0{,}3 \\pm \\sqrt{0{,}242}}{-0{,}02}', '$x_1 \\approx -9{,}60$ (entfällt, liegt hinter Lena); $\\;x_2 \\approx 39{,}60$', '$x_2$ in h: $\\;y = 0{,}15 \\cdot 39{,}60 - 1{,}8 \\approx 4{,}14$', 'Der Ball trifft im Punkt $F\\,(39{,}60 \\mid 4{,}14)$ auf den Hang.'],
      },
      {
        nr: '2.4', punkte: 2,
        text: ['Zeigen Sie rechnerisch, dass Lena für diesen Wurf die Bestnote erhält. Geben Sie dazu die Höhe des Balles an der Stelle der Wand an.'],
        felder: [{ label: 'Höhe des Balles bei $x = 28$:', answer: 6.76, unit: 'm' }, { label: 'Ball fliegt über die Wand?', answer: 'ja', choices: JN }],
        loesung: ['Die Wand steht in E auf 2,4 m Höhe und ist 4 m hoch: Der Ball muss höher als $2{,}4 + 4 = 6{,}4\\,\\text{m}$ fliegen.', '$$p(28) = -0{,}01 \\cdot 28^2 + 0{,}45 \\cdot 28 + 2 = -7{,}84 + 12{,}6 + 2 = 6{,}76', '$6{,}76\\,\\text{m} > 6{,}4\\,\\text{m}$ – der Ball fliegt über die Wand, Lena erhält die Bestnote.'],
      },
      {
        nr: '2.5', punkte: 2,
        text: ['Berechnen Sie, nach wie vielen Metern (waagrecht) der Ball den höchsten Punkt der Flugbahn erreicht.'],
        felder: [{ label: '$x_s =$', answer: 22.5, unit: 'm' }],
        loesung: ['$$x_s = -\\frac{b}{2 \\cdot a} = -\\frac{0{,}45}{2 \\cdot (-0{,}01)} = 22{,}5', 'Der Ball erreicht nach 22,5 m seinen höchsten Punkt.'],
      },
    ],
  },
  {
    slug: 'freiwurf', titel: 'Der Freiwurf', quelle: 'nach AP 2018', skizze: 'freiwurf',
    kurz: 'Flugkurve mit gegebenem Formfaktor, Scheitelpunkt, schräge Bank und Aufsprungpunkt.',
    intro: ['Jonas trainiert Freiwürfe für das nächste Basketballspiel. Der Ball wird im Punkt $A\\,(0 \\mid 2{,}5)$ abgeworfen, fliegt durch den Punkt $B\\,(2 \\mid 4{,}7)$ und landet genau im Korb $K\\,(6 \\mid y_K)$.', 'Die Flugkurve $p_1$ ist eine Parabel mit dem Formfaktor $a = -0{,}25$. Alle Angaben in Meter, die Skizze ist nicht maßstabsgetreu.'],
    teile: [
      {
        nr: '2.1', punkte: 3,
        text: ['Ermitteln Sie die Funktionsgleichung der Flugparabel $p_1$.', '(Ergebnis: $p_1\\colon y = -0{,}25x^2 + 1{,}6x + 2{,}5$)'],
        felder: [{ label: '$b =$', answer: 1.6 }, { label: '$c =$', answer: 2.5 }],
        loesung: ['Aus $A\\,(0 \\mid 2{,}5)$ folgt $c = 2{,}5$: $\\;y = -0{,}25x^2 + b \\cdot x + 2{,}5$', '$B\\,(2 \\mid 4{,}7)$ einsetzen:', '$$\\begin{aligned} 4{,}7 &= -0{,}25 \\cdot 2^2 + b \\cdot 2 + 2{,}5 \\\\ 4{,}7 &= -1 + 2b + 2{,}5 \\quad &&| -1{,}5 \\\\ 3{,}2 &= 2b &&| :2 \\\\ b &= 1{,}6 \\end{aligned}', '$$p_1\\colon y = -0{,}25x^2 + 1{,}6x + 2{,}5'],
      },
      {
        nr: '2.2', punkte: 1,
        text: ['Berechnen Sie die Höhe $y_K$ des Korbrings über dem Boden.'],
        felder: [{ label: '$y_K =$', answer: 3.1, unit: 'm' }],
        loesung: ['$$y_K = p_1(6) = -0{,}25 \\cdot 6^2 + 1{,}6 \\cdot 6 + 2{,}5 = -9 + 9{,}6 + 2{,}5 = 3{,}10\\,\\text{m}'],
      },
      {
        nr: '2.3', punkte: 3,
        vorher: ['Für das Training der optimalen Flugkurve hängt Jonas einen Reifen an die Hallendecke, durch den der Ball fliegen soll.'],
        text: ['Berechnen Sie die Koordinaten des höchsten Punktes der Flugkurve $p_1$.'],
        felder: [{ label: '$x_s =$', answer: 3.2 }, { label: '$y_s =$', answer: 5.06 }],
        loesung: ['$$S\\left(-\\frac{b}{2 \\cdot a} \\;\\middle|\\; c - \\frac{b^2}{4 \\cdot a}\\right) = S\\left(-\\frac{1{,}6}{2 \\cdot (-0{,}25)} \\;\\middle|\\; 2{,}5 - \\frac{1{,}6^2}{4 \\cdot (-0{,}25)}\\right)', '$$S\\,(3{,}2 \\mid 5{,}06)'],
      },
      {
        nr: '2.4', punkte: 3,
        vorher: ['Damit der Ball nach einem Treffer zurückspringt, stellt Jonas eine Sitzbank g schräg an die Wand.'],
        text: ['Ermitteln Sie die Funktionsgleichung der Bank g durch die Punkte $P\\,(5 \\mid 0)$ und $Q\\,(7 \\mid 1{,}6)$.', '(Ergebnis: $g\\colon y = 0{,}8x - 4$)'],
        felder: [{ label: '$m =$', answer: 0.8 }, { label: '$t =$', answer: -4 }],
        loesung: ['$$m = \\frac{1{,}6 - 0}{7 - 5} = 0{,}8', '$P$ einsetzen: $\\;0 = 0{,}8 \\cdot 5 + t \\;\\Rightarrow\\; t = -4$', '$$g\\colon y = 0{,}8x - 4'],
      },
      {
        nr: '2.5', punkte: 2,
        vorher: ['Nach dem Treffer fällt der Ball senkrecht nach unten auf die Bank (Punkt C) und springt dann parabelförmig zurück. Die Flugbahn wird durch $p_2\\colon y = -0{,}5x^2 + 5{,}7x - 15{,}4$ beschrieben.'],
        text: ['Berechnen Sie die Fallhöhe f des Balls vom Korbring im Punkt K bis zum Aufprall auf die Bank im Punkt C.'],
        felder: [{ label: '$f =$', answer: 2.3, unit: 'm' }],
        loesung: ['Der Ball fällt senkrecht: C liegt bei $x = 6$ auf der Bank.', '$$y_C = 0{,}8 \\cdot 6 - 4 = 0{,}8', '$$f = y_K - y_C = 3{,}10\\,\\text{m} - 0{,}80\\,\\text{m} = 2{,}30\\,\\text{m}'],
      },
      {
        nr: '2.6', punkte: 3,
        text: ['Jonas steht nach dem Wurf wieder im Ursprung des Koordinatensystems. Berechnen Sie, wie viele Meter vor ihm der Ball das erste Mal auf dem Boden aufspringt.'],
        felder: [{ label: 'Abstand:', answer: 4.4, unit: 'm' }],
        loesung: ['Nullstellen von $p_2$:', '$$x_{1,2} = \\frac{-5{,}7 \\pm \\sqrt{5{,}7^2 - 4 \\cdot (-0{,}5) \\cdot (-15{,}4)}}{2 \\cdot (-0{,}5)} = \\frac{-5{,}7 \\pm \\sqrt{1{,}69}}{-1} = \\frac{-5{,}7 \\pm 1{,}3}{-1}', '$x_1 = 4{,}4$; $\\;(x_2 = 7$, liegt an der Wand hinter der Bank$)$', 'Der Ball springt 4,4 m vor Jonas das erste Mal auf.'],
      },
    ],
  },
  {
    slug: 'feuerwehruebung', titel: 'Die Feuerwehrübung', quelle: 'nach AP 2018 NT', skizze: 'feuerwehr',
    kurz: 'Dachseiten als Geraden, Wasserstrahl aus Scheitel und Punkt, Treffer im Dachfenster.',
    intro: ['Für eine Feuerwehrübung stellt Familie Huber ihre Scheune zur Verfügung. Eine Feuerwehrfrau hält das Strahlrohr so, dass der Wasserstrahl p parabelförmig auf das Dach spritzt.', 'Das Dach wird durch zwei lineare Funktionen beschrieben. Alle Angaben in Meter, die Skizze ist nicht maßstabsgetreu.'],
    teile: [
      {
        nr: '2.1', punkte: 3,
        vorher: ['Die rechte Dachseite $d_1$ verläuft durch die Punkte $A\\,(16 \\mid 4)$ und $B\\,(14 \\mid 6{,}4)$.'],
        text: ['Ermitteln Sie die Funktionsgleichung der Geraden $d_1$.', '(Ergebnis: $d_1\\colon y = -1{,}2x + 23{,}2$)'],
        felder: [{ label: '$m =$', answer: -1.2 }, { label: '$t =$', answer: 23.2 }],
        loesung: ['Zweipunkteform:', '$$\\frac{y - 4}{x - 16} = \\frac{6{,}4 - 4}{14 - 16} = \\frac{2{,}4}{-2} = -1{,}2', '$$y - 4 = -1{,}2 \\cdot (x - 16) \\;\\Rightarrow\\; y = -1{,}2x + 23{,}2'],
      },
      {
        nr: '2.2', punkte: 3,
        vorher: ['Rechts neben der Scheune steht ein 1,10 m breiter Anhänger mit 40 cm Sicherheitsabstand zur Hauswand (Hauswand bei $x = 16$). Das Dach endet auf dieser Seite in 2 m Höhe über dem Boden.'],
        text: ['Entscheiden Sie durch Rechnung, ob der Anhänger vollständig unter dem Dach steht.'],
        felder: [{ label: 'Dachende bei $x =$', answer: 17.67, tol: 0.02 }, { label: 'Anhänger vollständig unter dem Dach?', answer: 'ja', choices: JN }],
        loesung: ['Dachende: $y = 2$ in $d_1$ einsetzen:', '$$\\begin{aligned} 2 &= -1{,}2x + 23{,}2 \\quad &&| -23{,}2 \\\\ -21{,}2 &= -1{,}2x &&| :(-1{,}2) \\\\ x &\\approx 17{,}67 \\end{aligned}', 'Anhänger reicht bis $16 + 0{,}4 + 1{,}1 = 17{,}5\\,\\text{m} < 17{,}67\\,\\text{m}$', 'Der Anhänger steht vollständig unter dem Dach.'],
      },
      {
        nr: '2.3', punkte: 4,
        vorher: ['Der Wasserstrahl p verläuft durch den Punkt $W\\,(4 \\mid 6{,}92)$ und erreicht im Punkt $S\\,(7 \\mid 8)$ seinen höchsten Punkt.'],
        text: ['Bestimmen Sie die allgemeine Form der Funktionsgleichung des Wasserstrahls p.', '(Ergebnis: $p\\colon y = -0{,}12x^2 + 1{,}68x + 2{,}12$)'],
        felder: [{ label: '$a =$', answer: -0.12 }, { label: '$b =$', answer: 1.68 }, { label: '$c =$', answer: 2.12 }],
        loesung: ['Scheitelform mit $S\\,(7 \\mid 8)$: $\\;y = a \\cdot (x - 7)^2 + 8$', '$W$ einsetzen:', '$$\\begin{aligned} 6{,}92 &= a \\cdot (4 - 7)^2 + 8 \\quad &&| -8 \\\\ -1{,}08 &= 9a &&| :9 \\\\ a &= -0{,}12 \\end{aligned}', '$$\\begin{aligned} y &= -0{,}12 \\cdot (x - 7)^2 + 8 \\\\ &= -0{,}12 \\cdot (x^2 - 14x + 49) + 8 \\\\ &= -0{,}12x^2 + 1{,}68x + 2{,}12 \\end{aligned}'],
      },
      {
        nr: '2.4', punkte: 1,
        text: ['In welcher Höhe (Punkt E) hält die Feuerwehrfrau das Strahlrohr?'],
        felder: [{ label: 'Höhe:', answer: 2.12, unit: 'm' }],
        loesung: ['Das Strahlrohr ist bei $x = 0$: $\\;p(0) = c = 2{,}12$', 'Sie hält das Strahlrohr in 2,12 m Höhe.'],
      },
      {
        nr: '2.5', punkte: 4,
        vorher: ['Die linke Dachseite wird durch $d_2\\colon y = 1{,}2x - 8$ beschrieben. Zwischen den Punkten $C\\,(11 \\mid y_C)$ und $D\\,(12 \\mid y_D)$ liegt ein Dachfenster, das bei der Übung getroffen werden soll.'],
        text: ['Überprüfen Sie rechnerisch, ob der Wasserstrahl das Dachfenster trifft.'],
        felder: [{ label: 'Auftreffstelle $x =$', answer: 11.4, tol: 0.02 }, { label: 'Dachfenster getroffen?', answer: 'ja', choices: JN }],
        loesung: ['Gleichsetzen von p und $d_2$:', '$$\\begin{aligned} -0{,}12x^2 + 1{,}68x + 2{,}12 &= 1{,}2x - 8 \\quad &&| -1{,}2x \\; +8 \\\\ -0{,}12x^2 + 0{,}48x + 10{,}12 &= 0 \\end{aligned}', '$$x_{1,2} = \\frac{-0{,}48 \\pm \\sqrt{0{,}48^2 - 4 \\cdot (-0{,}12) \\cdot 10{,}12}}{2 \\cdot (-0{,}12)} = \\frac{-0{,}48 \\pm \\sqrt{5{,}088}}{-0{,}24}', '$(x_1 \\approx -7{,}40)$; $\\;x_2 \\approx 11{,}40$', '$11 < 11{,}40 < 12$ – der Wasserstrahl trifft das Dachfenster.'],
      },
    ],
  },
  {
    slug: 'haengebruecke', titel: 'Die Hängebrücke', quelle: 'nach AP 2019', skizze: 'haengebruecke',
    kurz: 'Parabelstücke einer Brücke: Gleichung, tiefster Punkt, Seillänge, Auflager und Bootsausstieg.',
    intro: ['Eine Hängebrücke besteht aus zwei Auflagern A und B, zwei Stützen E und F sowie drei Parabelstücken, an denen die Fahrbahn mit Seilen aufgehängt ist.', 'Vereinfacht ist die x-Achse die Fahrbahn und die Stütze E die y-Achse. Alle Angaben in Meter, die Skizze ist nicht maßstabsgetreu.'],
    teile: [
      {
        nr: '2.1', punkte: 4,
        text: ['Das mittlere Parabelstück $p_2$ verläuft durch $C\\,(2 \\mid 5{,}2)$ und $D\\,(4 \\mid 3{,}2)$ und hat den Formfaktor $a = 0{,}1$. Bestimmen Sie seine Funktionsgleichung.', '(Ergebnis: $p_2\\colon y = 0{,}1x^2 - 1{,}6x + 8$)'],
        felder: [{ label: '$b =$', answer: -1.6 }, { label: '$c =$', answer: 8 }],
        loesung: ['$$\\begin{aligned} \\text{I}\\colon\\; 5{,}2 &= 0{,}1 \\cdot 2^2 + 2b + c &&\\Rightarrow\\; 2b + c = 4{,}8 \\\\ \\text{II}\\colon\\; 3{,}2 &= 0{,}1 \\cdot 4^2 + 4b + c &&\\Rightarrow\\; 4b + c = 1{,}6 \\end{aligned}', '$$\\text{II} - \\text{I}\\colon\\; 2b = -3{,}2 \\;\\Rightarrow\\; b = -1{,}6', '$b$ in I: $\\;-3{,}2 + c = 4{,}8 \\;\\Rightarrow\\; c = 8$', '$$p_2\\colon y = 0{,}1x^2 - 1{,}6x + 8'],
      },
      {
        nr: '2.2', punkte: 3,
        vorher: ['Bei einer Wartung wurden Mängel festgestellt: Am tiefsten Punkt von $p_2$ muss die Aufhängung erneuert werden.'],
        text: ['Berechnen Sie die Koordinaten des tiefsten Punktes von $p_2$.'],
        felder: [{ label: '$x_s =$', answer: 8 }, { label: '$y_s =$', answer: 1.6 }],
        loesung: ['$$S\\left(-\\frac{b}{2 \\cdot a} \\;\\middle|\\; c - \\frac{b^2}{4 \\cdot a}\\right) = S\\left(-\\frac{-1{,}6}{2 \\cdot 0{,}1} \\;\\middle|\\; 8 - \\frac{(-1{,}6)^2}{4 \\cdot 0{,}1}\\right) = S\\,(8 \\mid 1{,}6)'],
      },
      {
        nr: '2.3', punkte: 2,
        text: ['Berechnen Sie die Länge des Seils $a_1$, das im Abstand von 3,00 m parallel zur Stütze E verläuft.'],
        felder: [{ label: '$a_1 =$', answer: 4.1, unit: 'm' }],
        loesung: ['$$p_2(3) = 0{,}1 \\cdot 3^2 - 1{,}6 \\cdot 3 + 8 = 0{,}9 - 4{,}8 + 8 = 4{,}1', 'Das Seil $a_1$ ist 4,10 m lang.'],
      },
      {
        nr: '2.4', punkte: 3,
        vorher: ['Das linke Parabelstück wird durch $p_1\\colon y = 0{,}125x^2 + 2x + 8$ beschrieben. Es berührt die Fahrbahn im Auflager A.'],
        text: ['Berechnen Sie den Abstand des Auflagers A von der Stütze E.'],
        felder: [{ label: 'Abstand:', answer: 8, unit: 'm' }],
        loesung: ['Nullstelle von $p_1$:', '$$x_{1,2} = \\frac{-2 \\pm \\sqrt{2^2 - 4 \\cdot 0{,}125 \\cdot 8}}{2 \\cdot 0{,}125} = \\frac{-2 \\pm \\sqrt{0}}{0{,}25} = -8', 'Das Auflager A liegt bei $x = -8$, also 8 m von der Stütze E entfernt.'],
      },
      {
        nr: '2.5', punkte: 3,
        vorher: ['Vom Punkt $G\\,(16 \\mid -6)$ am Fluss führt ein geradliniger Weg g zum Auflager $B\\,(24 \\mid 0)$, auf dem Kajakfahrer ihr Boot nach oben tragen.'],
        text: ['Bestimmen Sie die Funktionsgleichung des Bootsausstiegs g.'],
        felder: [{ label: '$m =$', answer: 0.75 }, { label: '$t =$', answer: -18 }],
        loesung: ['$$m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{0 - (-6)}{24 - 16} = \\frac{6}{8} = 0{,}75', '$B$ einsetzen: $\\;0 = 0{,}75 \\cdot 24 + t \\;\\Rightarrow\\; t = -18$', '$$g\\colon y = 0{,}75x - 18'],
      },
    ],
  },
  {
    slug: 'skatesprung', titel: 'Der Skatesprung', quelle: 'nach AP 2021', skizze: 'skater',
    kurz: 'Steigung der Rampe, Flugparabel, Absprungpunkt als Schnittpunkt, Flughöhe und Landung.',
    intro: ['Emre ist ein begeisterter Skateboarder. Er möchte mithilfe einer Rampe über die Stufen des Jugendzentrums bis auf die Straße springen.', 'Alle Angaben in Meter, die Skizze ist nicht maßstabsgetreu.'],
    teile: [
      {
        nr: '2.1', punkte: 2,
        text: ['Bestimmen Sie die Steigung m der geradlinigen Rampe g durch die Punkte $A\\,(-1 \\mid 1{,}6)$ und $B\\,(1 \\mid 2)$.'],
        felder: [{ label: '$m =$', answer: 0.2 }],
        loesung: ['$$m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{2 - 1{,}6}{1 - (-1)} = \\frac{0{,}4}{2} = 0{,}2'],
      },
      {
        nr: '2.2', punkte: 4,
        vorher: ['Emres Flugbahn ist eine Parabel p durch die Punkte $D\\,(2 \\mid 2{,}45)$ und $E\\,(4 \\mid 1{,}85)$ mit dem Formfaktor $a = -0{,}25$.'],
        text: ['Bestimmen Sie die Funktionsgleichung der Flugparabel p.', '(Ergebnis: $p\\colon y = -0{,}25x^2 + 1{,}2x + 1{,}05$)'],
        felder: [{ label: '$b =$', answer: 1.2 }, { label: '$c =$', answer: 1.05 }],
        loesung: ['$$\\begin{aligned} \\text{I}\\colon\\; 2{,}45 &= -0{,}25 \\cdot 2^2 + 2b + c &&\\Rightarrow\\; 2b + c = 3{,}45 \\\\ \\text{II}\\colon\\; 1{,}85 &= -0{,}25 \\cdot 4^2 + 4b + c &&\\Rightarrow\\; 4b + c = 5{,}85 \\end{aligned}', '$$\\text{II} - \\text{I}\\colon\\; 2b = 2{,}4 \\;\\Rightarrow\\; b = 1{,}2', '$b$ in I: $\\;2{,}4 + c = 3{,}45 \\;\\Rightarrow\\; c = 1{,}05$', '$$p\\colon y = -0{,}25x^2 + 1{,}2x + 1{,}05'],
      },
      {
        nr: '2.3', punkte: 4,
        vorher: ['Freundin Mia will den Sprung fotografieren. Dafür werden vorab einige Werte berechnet. Die Rampe wird durch $g\\colon y = 0{,}2x + 1{,}8$ beschrieben.'],
        text: ['Berechnen Sie die Koordinaten des Absprungpunktes C (erster gemeinsamer Punkt von Rampe und Flugbahn).'],
        felder: [{ label: '$x_C =$', answer: 1 }, { label: '$y_C =$', answer: 2 }],
        loesung: ['$$\\begin{aligned} -0{,}25x^2 + 1{,}2x + 1{,}05 &= 0{,}2x + 1{,}8 \\quad &&| -0{,}2x \\; -1{,}8 \\\\ -0{,}25x^2 + x - 0{,}75 &= 0 \\end{aligned}', '$$x_{1,2} = \\frac{-1 \\pm \\sqrt{1^2 - 4 \\cdot (-0{,}25) \\cdot (-0{,}75)}}{2 \\cdot (-0{,}25)} = \\frac{-1 \\pm 0{,}5}{-0{,}5}', '$x_1 = 1$; $\\;(x_2 = 3)$ – abgesprungen wird an der ersten Stelle.', '$x_1$ in g: $\\;y = 0{,}2 \\cdot 1 + 1{,}8 = 2 \\;\\Rightarrow\\; C\\,(1 \\mid 2)$'],
      },
      {
        nr: '2.4', punkte: 2,
        text: ['Berechnen Sie die maximale Höhe, die Emre auf seiner Flugbahn über der Straße erreicht.'],
        felder: [{ label: 'max. Höhe:', answer: 2.49, unit: 'm' }],
        loesung: ['$$y_s = c - \\frac{b^2}{4 \\cdot a} = 1{,}05 - \\frac{1{,}2^2}{4 \\cdot (-0{,}25)} = 1{,}05 + 1{,}44 = 2{,}49', 'Die maximale Flughöhe beträgt 2,49 m.'],
      },
      {
        nr: '2.5', punkte: 3,
        vorher: ['Damit Emre den Sprung stehen kann, darf er nicht auf dem Schotter am Ende der Stufen landen. Die Straße beginnt bei $x = 5{,}3$.'],
        text: ['Zeigen Sie rechnerisch, dass Emre auf der Straße landet.'],
        felder: [{ label: 'Landestelle $x =$', answer: 5.56, tol: 0.02 }, { label: 'Landet er auf der Straße?', answer: 'ja', choices: JN }],
        loesung: ['Landung: Nullstelle von p', '$$x_{1,2} = \\frac{-1{,}2 \\pm \\sqrt{1{,}2^2 - 4 \\cdot (-0{,}25) \\cdot 1{,}05}}{2 \\cdot (-0{,}25)} = \\frac{-1{,}2 \\pm \\sqrt{2{,}49}}{-0{,}5}', '$(x_1 \\approx -0{,}76)$; $\\;x_2 \\approx 5{,}56$', '$5{,}56 > 5{,}3$ – Emre landet auf der Straße.'],
      },
    ],
  },
  {
    slug: 'glastunnel', titel: 'Der Glastunnel', quelle: 'nach AP 2022', skizze: 'glastunnel',
    kurz: 'Parabel aus Scheitel und Punkt, Spannweite prüfen, Rolltreppe als Tangente, Säulenlänge.',
    intro: ['Für die Präsentation einer Magnetschwebebahn wird ein Glastunnel mit Besucherplattform aufgebaut. Der Tunnel ist parabelförmig mit dem Scheitel $S\\,(6 \\mid 6{,}25)$ und verläuft durch den Punkt $A\\,(2 \\mid 2{,}25)$.', 'Alle Angaben in Meter, die Skizze ist nicht maßstabsgetreu.'],
    teile: [
      {
        nr: '2.1', punkte: 3,
        text: ['Ermitteln Sie die Funktionsgleichung p des Tunnels in allgemeiner Form.', '(Ergebnis: $p\\colon y = -0{,}25x^2 + 3x - 2{,}75$)'],
        felder: [{ label: '$a =$', answer: -0.25 }, { label: '$b =$', answer: 3 }, { label: '$c =$', answer: -2.75 }],
        loesung: ['Scheitelform: $\\;y = a \\cdot (x - 6)^2 + 6{,}25$; $\\;A$ einsetzen:', '$$\\begin{aligned} 2{,}25 &= a \\cdot (2 - 6)^2 + 6{,}25 \\quad &&| -6{,}25 \\\\ -4 &= 16a &&| :16 \\\\ a &= -0{,}25 \\end{aligned}', '$$y = -0{,}25 \\cdot (x^2 - 12x + 36) + 6{,}25 = -0{,}25x^2 + 3x - 2{,}75'],
      },
      {
        nr: '2.2', punkte: 4,
        vorher: ['Der Hersteller gibt die Spannweite $\\overline{DE}$ des Tunnels (Abstand der Fußpunkte am Boden) mit 10 m an.'],
        text: ['Überprüfen Sie diesen Wert rechnerisch.'],
        felder: [{ label: 'Spannweite:', answer: 10, unit: 'm' }, { label: 'Angabe korrekt?', answer: 'ja', choices: JN }],
        loesung: ['$$x_{1,2} = \\frac{-3 \\pm \\sqrt{3^2 - 4 \\cdot (-0{,}25) \\cdot (-2{,}75)}}{2 \\cdot (-0{,}25)} = \\frac{-3 \\pm \\sqrt{6{,}25}}{-0{,}5} = \\frac{-3 \\pm 2{,}5}{-0{,}5}', '$x_1 = 1$; $\\;x_2 = 11$', 'Spannweite: $11 - 1 = 10\\,\\text{m}$ – die Angabe des Herstellers ist korrekt.'],
      },
      {
        nr: '2.3', punkte: 3,
        vorher: ['Eine geradlinige Rolltreppe g durch die Punkte $B\\,(-3 \\mid 2)$ und $C\\,(10 \\mid 8{,}5)$ führt zur Besucherplattform.'],
        text: ['Berechnen Sie die Funktionsgleichung der Rolltreppe g.', '(Ergebnis: $g\\colon y = 0{,}5x + 3{,}5$)'],
        felder: [{ label: '$m =$', answer: 0.5 }, { label: '$t =$', answer: 3.5 }],
        loesung: ['$$m = \\frac{8{,}5 - 2}{10 - (-3)} = \\frac{6{,}5}{13} = 0{,}5', '$C$ einsetzen: $\\;8{,}5 = 0{,}5 \\cdot 10 + t \\;\\Rightarrow\\; t = 3{,}5$', '$$g\\colon y = 0{,}5x + 3{,}5'],
      },
      {
        nr: '2.4', punkte: 3,
        text: ['Zeigen Sie rechnerisch, dass die Rolltreppe genau auf dem Glastunnel aufliegt (genau ein gemeinsamer Punkt). Geben Sie die Diskriminante an.'],
        felder: [{ label: 'Diskriminante $D =$', answer: 0 }, { label: 'Liegt die Rolltreppe auf?', answer: 'ja', choices: JN }],
        loesung: ['$$\\begin{aligned} -0{,}25x^2 + 3x - 2{,}75 &= 0{,}5x + 3{,}5 \\quad &&| -0{,}5x \\; -3{,}5 \\\\ -0{,}25x^2 + 2{,}5x - 6{,}25 &= 0 \\end{aligned}', '$$D = b^2 - 4 \\cdot a \\cdot c = 2{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-6{,}25) = 6{,}25 - 6{,}25 = 0', '$D = 0$: genau ein gemeinsamer Punkt – die Rolltreppe liegt auf dem Glastunnel auf.'],
      },
      {
        nr: '2.5', punkte: 2,
        vorher: ['Die Besucherplattform wird durch senkrechte Säulen gestützt. Die Säule $s_1$ steht bei $x = 10$ auf dem Glastunnel.'],
        text: ['Bestimmen Sie rechnerisch die Länge der Säule $s_1$.'],
        felder: [{ label: '$s_1 =$', answer: 6.25, unit: 'm' }],
        loesung: ['$$p(10) = -0{,}25 \\cdot 10^2 + 3 \\cdot 10 - 2{,}75 = -25 + 30 - 2{,}75 = 2{,}25', 'Länge der Säule: $s_1 = 8{,}5\\,\\text{m} - 2{,}25\\,\\text{m} = 6{,}25\\,\\text{m}$'],
      },
    ],
  },
  {
    slug: 'minigolf', titel: 'Die Minigolf-Station', quelle: 'nach AP 2023 NT', skizze: 'minigolf',
    kurz: 'Flugparabel mit Formfaktor, maximale Höhe, Loch in der Wand, Brett als Gerade, Schnittpunkt.',
    intro: ['Am Wandertag geht die 10. Klasse zum Minigolf. An Station 7 wird der Ball von einem Podest im Punkt $A\\,(0 \\mid 0{,}4)$ abgeschlagen. Er muss durch ein Loch in einer Wand fliegen; dahinter ist ein gerades Brett mit mehreren Löchern angebracht.', 'Bei der idealen Flugkurve p landet der Ball direkt im Loch an der Fahne. Alle Angaben in Meter, die Skizze ist nicht maßstabsgetreu.'],
    teile: [
      {
        nr: '2.1', punkte: 4,
        text: ['Ermitteln Sie die Funktionsgleichung der Flugparabel p durch $B\\,(2 \\mid 1{,}8)$ und $C\\,(8 \\mid 1{,}2)$ mit dem Formfaktor $a = -0{,}1$.', '(Ergebnis: $p\\colon y = -0{,}1x^2 + 0{,}9x + 0{,}4$)'],
        felder: [{ label: '$b =$', answer: 0.9 }, { label: '$c =$', answer: 0.4 }],
        loesung: ['$$\\begin{aligned} \\text{I}\\colon\\; 1{,}8 &= -0{,}1 \\cdot 2^2 + 2b + c &&\\Rightarrow\\; 2b + c = 2{,}2 \\\\ \\text{II}\\colon\\; 1{,}2 &= -0{,}1 \\cdot 8^2 + 8b + c &&\\Rightarrow\\; 8b + c = 7{,}6 \\end{aligned}', '$$\\text{II} - \\text{I}\\colon\\; 6b = 5{,}4 \\;\\Rightarrow\\; b = 0{,}9', '$b$ in I: $\\;1{,}8 + c = 2{,}2 \\;\\Rightarrow\\; c = 0{,}4$', '$$p\\colon y = -0{,}1x^2 + 0{,}9x + 0{,}4'],
      },
      {
        nr: '2.2', punkte: 2,
        text: ['Bestimmen Sie die maximale Höhe des Balles über dem Boden.'],
        felder: [{ label: 'max. Höhe:', answer: 2.425, unit: 'm', tol: 0.006 }],
        loesung: ['$$y_s = c - \\frac{b^2}{4 \\cdot a} = 0{,}4 - \\frac{0{,}9^2}{4 \\cdot (-0{,}1)} = 0{,}4 + 2{,}025 = 2{,}425', 'Der Ball erreicht eine maximale Höhe von etwa 2,43 m.'],
      },
      {
        nr: '2.3', punkte: 2,
        vorher: ['Die Wand steht 5 m vom Abschlagpunkt entfernt. Das Loch reicht von $P_1\\,(5 \\mid 1{,}9)$ bis $P_2\\,(5 \\mid 2{,}9)$.'],
        text: ['Weisen Sie durch Rechnung nach, dass der Ball durch das Loch in der Wand fliegt.'],
        felder: [{ label: 'Höhe bei $x = 5$:', answer: 2.4, unit: 'm' }, { label: 'Fliegt der Ball durch das Loch?', answer: 'ja', choices: JN }],
        loesung: ['$$p(5) = -0{,}1 \\cdot 5^2 + 0{,}9 \\cdot 5 + 0{,}4 = -2{,}5 + 4{,}5 + 0{,}4 = 2{,}4', '$1{,}9 < 2{,}4 < 2{,}9$ – der Ball fliegt durch das Loch.'],
      },
      {
        nr: '2.4', punkte: 3,
        vorher: ['Das Brett verläuft durch die Punkte $M\\,(5 \\mid 0)$ und $N\\,(10 \\mid 4{,}5)$ und wird durch eine lineare Funktion g beschrieben.'],
        text: ['Bestimmen Sie rechnerisch die Funktionsgleichung der Geraden g.', '(Ergebnis: $g\\colon y = 0{,}9x - 4{,}5$)'],
        felder: [{ label: '$m =$', answer: 0.9 }, { label: '$t =$', answer: -4.5 }],
        loesung: ['$$m = \\frac{4{,}5 - 0}{10 - 5} = 0{,}9', '$M$ einsetzen: $\\;0 = 0{,}9 \\cdot 5 + t \\;\\Rightarrow\\; t = -4{,}5$', '$$g\\colon y = 0{,}9x - 4{,}5'],
      },
      {
        nr: '2.5', punkte: 4,
        vorher: ['Im Punkt E fliegt der Ball auf der Flugkurve p durch das Brett g.'],
        text: ['Berechnen Sie die Koordinaten des Punktes E.'],
        felder: [{ label: '$x_E =$', answer: 7 }, { label: '$y_E =$', answer: 1.8 }],
        loesung: ['$$\\begin{aligned} -0{,}1x^2 + 0{,}9x + 0{,}4 &= 0{,}9x - 4{,}5 \\quad &&| -0{,}9x \\; +4{,}5 \\\\ -0{,}1x^2 + 4{,}9 &= 0 &&| -4{,}9 \\\\ -0{,}1x^2 &= -4{,}9 &&| :(-0{,}1) \\\\ x^2 &= 49 \\end{aligned}', '$(x_1 = -7)$; $\\;x_2 = 7$', '$x_2$ in g: $\\;y = 0{,}9 \\cdot 7 - 4{,}5 = 1{,}8 \\;\\Rightarrow\\; E\\,(7 \\mid 1{,}8)$'],
      },
    ],
  },
  {
    slug: 'torbogen', titel: 'Der Torbogen', quelle: 'nach AP 2025', skizze: 'torbogen',
    kurz: 'Parabelförmiger Bogen: Gleichung, Höhe, Spannweite, Gondelbahnen und Skywalk.',
    intro: ['Eine Stadt plant als Touristenattraktion einen parabelförmigen Torbogen mit einem Skywalk, den die Besucher überqueren können. Vorbild ist das Denkmal „Gateway Arch“ in St. Louis, das genauso hoch wie breit ist.', 'Der Bogen p verläuft durch die Punkte $A\\,(100 \\mid 97{,}5)$ und $B\\,(200 \\mid 97{,}5)$ und hat den Formfaktor $a = -0{,}025$. Alle Angaben in Meter, die Skizze ist nicht maßstabsgetreu.'],
    teile: [
      {
        nr: '2.1', punkte: 4,
        text: ['Ermitteln Sie die Funktionsgleichung der Parabel p.', '(Ergebnis: $p\\colon y = -0{,}025x^2 + 7{,}5x - 402{,}5$)'],
        felder: [{ label: '$b =$', answer: 7.5 }, { label: '$c =$', answer: -402.5 }],
        loesung: ['$$\\begin{aligned} \\text{I}\\colon\\; 97{,}5 &= -0{,}025 \\cdot 100^2 + 100b + c &&\\Rightarrow\\; 100b + c = 347{,}5 \\\\ \\text{II}\\colon\\; 97{,}5 &= -0{,}025 \\cdot 200^2 + 200b + c &&\\Rightarrow\\; 200b + c = 1097{,}5 \\end{aligned}', '$$\\text{II} - \\text{I}\\colon\\; 100b = 750 \\;\\Rightarrow\\; b = 7{,}5', '$b$ in I: $\\;750 + c = 347{,}5 \\;\\Rightarrow\\; c = -402{,}5$', '$$p\\colon y = -0{,}025x^2 + 7{,}5x - 402{,}5'],
      },
      {
        nr: '2.2', punkte: 2,
        vorher: ['Wegen eines nahen Flughafens ist die Höhe des Torbogens von Bedeutung.'],
        text: ['Berechnen Sie die maximale Höhe des Torbogens.'],
        felder: [{ label: 'Höhe:', answer: 160, unit: 'm' }],
        loesung: ['$$y_s = c - \\frac{b^2}{4 \\cdot a} = -402{,}5 - \\frac{7{,}5^2}{4 \\cdot (-0{,}025)} = -402{,}5 + 562{,}5 = 160', 'Der Torbogen ist 160 m hoch.'],
      },
      {
        nr: '2.3', punkte: 3,
        vorher: ['Der Torbogen gilt als originalgetreu, wenn seine Spannweite w (Abstand der Fußpunkte) gleich seiner Höhe ist.'],
        text: ['Zeigen Sie rechnerisch, dass der 160 m hohe Torbogen originalgetreu ist.'],
        felder: [{ label: 'Spannweite $w =$', answer: 160, unit: 'm' }, { label: 'Originalgetreu?', answer: 'ja', choices: JN }],
        loesung: ['$$x_{1,2} = \\frac{-7{,}5 \\pm \\sqrt{7{,}5^2 - 4 \\cdot (-0{,}025) \\cdot (-402{,}5)}}{2 \\cdot (-0{,}025)} = \\frac{-7{,}5 \\pm \\sqrt{16}}{-0{,}05} = \\frac{-7{,}5 \\pm 4}{-0{,}05}', '$x_1 = 70$; $\\;x_2 = 230$', '$w = 230 - 70 = 160\\,\\text{m}$ = Höhe – der Torbogen ist originalgetreu.'],
      },
      {
        nr: '2.4', punkte: 3,
        vorher: ['Den Skywalk erreicht und verlässt man mit Gondeln. Die Gondelbahnen g und h verlaufen geradlinig.'],
        text: ['Berechnen Sie die Funktionsgleichung der Gondelbahn g durch die Punkte $C\\,(-20 \\mid 25{,}5)$ und $A\\,(100 \\mid 97{,}5)$.'],
        felder: [{ label: '$m =$', answer: 0.6 }, { label: '$t =$', answer: 37.5 }],
        loesung: ['$$m = \\frac{97{,}5 - 25{,}5}{100 - (-20)} = \\frac{72}{120} = 0{,}6', '$A$ einsetzen: $\\;97{,}5 = 0{,}6 \\cdot 100 + t \\;\\Rightarrow\\; t = 37{,}5$', '$$g\\colon y = 0{,}6x + 37{,}5'],
      },
      {
        nr: '2.5', punkte: 1,
        text: ['Bestimmen Sie die Länge des Skywalks von A nach B.'],
        felder: [{ label: 'Länge:', answer: 100, unit: 'm' }],
        loesung: ['A und B liegen auf gleicher Höhe: $\\;200 - 100 = 100\\,\\text{m}$'],
      },
      {
        nr: '2.6', punkte: 2,
        vorher: ['Die Gondelbahn h wird durch $h\\colon y = -0{,}6x + 217{,}5$ beschrieben.'],
        text: ['Berechnen Sie die Höhe $y_D$ der Gondel über dem Boden im Punkt $D\\,(300 \\mid y_D)$.'],
        felder: [{ label: '$y_D =$', answer: 37.5, unit: 'm' }],
        loesung: ['$$y_D = -0{,}6 \\cdot 300 + 217{,}5 = -180 + 217{,}5 = 37{,}5', 'Die Gondel befindet sich 37,50 m über dem Boden.'],
      },
    ],
  },
]

export const anwendungBySlug = (slug?: string) => ANWENDUNGEN.find((a) => a.slug === slug)
