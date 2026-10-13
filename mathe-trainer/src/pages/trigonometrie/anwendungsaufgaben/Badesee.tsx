import AnwendungsaufgabeSeite, { type SubTask } from './AnwendungsaufgabeSeite';

// Angelehnt an die Abschlussprüfung 2018 (Nachtermin), Aufgabe Trigonometrie – Zahlen und Kontext verändert.

const intro =
    'Der Badesee in Weiherbach ist in Bereiche für Tretboote, Schwimmer und Nichtschwimmer aufgeteilt. ' +
    'Die Bootsstege A, B und C begrenzen den Tretbootbereich; A und B sind durch eine 2.150,00 m lange ' +
    'Trennleine geradlinig verbunden. Im Punkt S steht der Turm der Wasserwacht: Er ist 1.180,00 m vom ' +
    'Steg A und 1.420,00 m vom Steg B entfernt.';

const tasks: SubTask[] = [
    {
        context: intro + '\n\nDer Steg C ist 1.480,00 m vom Steg B entfernt. Bei C liegt ein rechter Winkel.',
        question: 'Berechne die Länge der Strecke \\overline{AC}.',
        hint: 'Im rechtwinkligen Dreieck ABC ist die Trennleine \\overline{AB} die Hypotenuse. Nutze den Satz des Pythagoras.',
        correctAnswer: 1559.52,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Satz des Pythagoras nach |AC| umstellen',
                math: '|\\overline{AB}|^2 = |\\overline{AC}|^2 + |\\overline{BC}|^2 \\;\\Rightarrow\\; |\\overline{AC}| = \\sqrt{|\\overline{AB}|^2 - |\\overline{BC}|^2}'
            },
            {
                heading: 'Schritt 2: Werte einsetzen und berechnen',
                math: '|\\overline{AC}| = \\sqrt{2150^2 - 1480^2} \\approx 1.559{,}52 \\text{ m}'
            }
        ]
    },
    {
        context:
            'Lena und Jonas starten am Steg C zu einem Tretbootrennen. Gewonnen hat, wer zuerst die Trennleine ' +
            '\\overline{AB} erreicht. Es gilt \\overline{AB} = 2.150,00 m, \\overline{BC} = 1.480,00 m und ' +
            '\\overline{AC} = 1.559,52 m.',
        question: 'Wie lang ist die kürzeste Strecke vom Steg C zur Trennleine \\overline{AB}?',
        hint:
            'Die kürzeste Strecke ist das Lot von C auf \\overline{AB} (Fußpunkt D). Berechne zuerst den Winkel ' +
            '∢CAB mit dem Sinus im Dreieck ABC und dann die Höhe im rechtwinkligen Dreieck ADC.',
        correctAnswer: 1073.53,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Winkel bei A im Dreieck ABC',
                text: '\\overline{BC} ist die Gegenkathete, \\overline{AB} die Hypotenuse:',
                math: '\\sin(\\sphericalangle CAB) = \\frac{1480}{2150} \\;\\Rightarrow\\; \\sphericalangle CAB \\approx 43{,}50^\\circ'
            },
            {
                heading: 'Schritt 2: Sinus im rechtwinkligen Dreieck ADC',
                text: 'Die gesuchte Strecke \\overline{DC} ist die Gegenkathete, \\overline{AC} die Hypotenuse:',
                math: '\\sin(43{,}50^\\circ) = \\frac{|\\overline{DC}|}{1559{,}52}'
            },
            {
                heading: 'Schritt 3: Nach |DC| auflösen und berechnen',
                math: '|\\overline{DC}| = 1559{,}52 \\cdot \\sin(43{,}50^\\circ) \\approx 1.073{,}5 \\text{ m}'
            }
        ]
    },
    {
        context:
            'Genau in der Mitte der Trennleine \\overline{AB} schwimmt eine Boje M. Eine Leine von M zum Turm S ' +
            'trennt den flachen Nichtschwimmerbereich (links) vom tiefen Schwimmerbereich (rechts).\n\n' +
            'Es gilt \\overline{AB} = 2.150,00 m, \\overline{AS} = 1.180,00 m und \\overline{BS} = 1.420,00 m.',
        question: 'Berechne den Blickwinkel α, unter dem man vom Turm S aus die Stege A und B sieht.',
        hint: 'Im Dreieck ASB sind alle drei Seiten bekannt. Stelle den Kosinussatz nach cos α um.',
        correctAnswer: 111.23,
        correctUnit: '°',
        solutionSteps: [
            {
                heading: 'Schritt 1: Kosinussatz aufstellen',
                text: 'α liegt bei S und damit der Seite \\overline{AB} gegenüber:',
                math: '|\\overline{AB}|^2 = |\\overline{AS}|^2 + |\\overline{BS}|^2 - 2 \\cdot |\\overline{AS}| \\cdot |\\overline{BS}| \\cdot \\cos\\alpha'
            },
            {
                heading: 'Schritt 2: Nach cos α umstellen',
                math: '\\cos\\alpha = \\frac{|\\overline{AS}|^2 + |\\overline{BS}|^2 - |\\overline{AB}|^2}{2 \\cdot |\\overline{AS}| \\cdot |\\overline{BS}|}'
            },
            {
                heading: 'Schritt 3: Werte einsetzen und berechnen',
                math: '\\cos\\alpha = \\frac{1180^2 + 1420^2 - 2150^2}{2 \\cdot 1180 \\cdot 1420} \\approx -0{,}3621 \\;\\Rightarrow\\; \\alpha \\approx 111{,}23^\\circ'
            }
        ]
    },
    {
        context:
            'Es gilt α = 111,23°, \\overline{AB} = 2.150,00 m und \\overline{BS} = 1.420,00 m.',
        question: 'Berechne den Winkel γ, unter dem man vom Steg A aus die Leine \\overline{MS} sieht (γ = ∢SAM).',
        hint:
            'M liegt auf \\overline{AB}, also ist γ auch der Winkel bei A im Dreieck ASB. ' +
            'γ liegt der Seite \\overline{BS} gegenüber – Sinussatz!',
        correctAnswer: 38.0,
        correctUnit: '°',
        solutionSteps: [
            {
                heading: 'Schritt 1: Sinussatz im Dreieck ASB',
                math: '\\frac{\\sin\\gamma}{|\\overline{BS}|} = \\frac{\\sin\\alpha}{|\\overline{AB}|}'
            },
            {
                heading: 'Schritt 2: Nach sin γ auflösen',
                math: '\\sin\\gamma = \\frac{1420 \\cdot \\sin(111{,}23^\\circ)}{2150} \\approx 0{,}6157'
            },
            {
                heading: 'Schritt 3: Winkel berechnen',
                math: '\\gamma = \\sin^{-1}(0{,}6157) \\approx 38{,}00^\\circ'
            }
        ]
    },
    {
        context:
            'Auf einer Infotafel am Turm soll die Größe des Nichtschwimmerbereichs ASM in Quadratmetern stehen. ' +
            'Es gilt \\overline{AS} = 1.180,00 m, \\overline{AB} = 2.150,00 m und γ = 38,00°.',
        question: 'Welcher Wert muss auf der Infotafel stehen?',
        hint:
            'Da M die Mitte von \\overline{AB} ist, gilt \\overline{AM} = \\overline{AB} : 2. ' +
            'Du kennst dann zwei Seiten und den eingeschlossenen Winkel γ.',
        correctAnswer: 390483,
        correctUnit: 'm²',
        solutionSteps: [
            {
                heading: 'Schritt 1: Länge |AM|',
                math: '|\\overline{AM}| = \\frac{2150}{2} = 1075 \\text{ m}'
            },
            {
                heading: 'Schritt 2: Flächenformel mit dem Sinus',
                math: 'A_{\\triangle ASM} = \\frac{1}{2} \\cdot |\\overline{AM}| \\cdot |\\overline{AS}| \\cdot \\sin\\gamma'
            },
            {
                heading: 'Schritt 3: Werte einsetzen und berechnen',
                math: 'A_{\\triangle ASM} = \\frac{1}{2} \\cdot 1075 \\cdot 1180 \\cdot \\sin(38{,}00^\\circ) \\approx 390.483 \\text{ m}^2'
            }
        ]
    },
    {
        context:
            'Für die Trennleine zwischen Boje und Turm muss noch Seil bestellt werden. ' +
            'Es gilt \\overline{AM} = 1.075,00 m, \\overline{AS} = 1.180,00 m und γ = 38,00°.',
        question: 'Wie lang muss die Leine \\overline{MS} mindestens sein?',
        hint: 'Im Dreieck ASM kennst du zwei Seiten und den eingeschlossenen Winkel γ – Kosinussatz!',
        correctAnswer: 740.84,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Kosinussatz aufstellen',
                math: '|\\overline{MS}|^2 = |\\overline{AM}|^2 + |\\overline{AS}|^2 - 2 \\cdot |\\overline{AM}| \\cdot |\\overline{AS}| \\cdot \\cos\\gamma'
            },
            {
                heading: 'Schritt 2: Werte einsetzen',
                math: '|\\overline{MS}|^2 = 1075^2 + 1180^2 - 2 \\cdot 1075 \\cdot 1180 \\cdot \\cos(38{,}00^\\circ) \\approx 548.842'
            },
            {
                heading: 'Schritt 3: Wurzel ziehen',
                math: '|\\overline{MS}| = \\sqrt{548.842} \\approx 740{,}84 \\text{ m}'
            }
        ]
    }
];

export default function Badesee() {
    return (
        <AnwendungsaufgabeSeite
            title="Der Badesee"
            image="/images/badesee.svg"
            imageAlt="Skizze eines Sees mit den Bootsstegen A, B und C (rechter Winkel bei C), dem Turm S, der Boje M und den Winkeln α und γ"
            tasks={tasks}
        />
    );
}
