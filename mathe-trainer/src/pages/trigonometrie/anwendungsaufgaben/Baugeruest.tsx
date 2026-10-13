import AnwendungsaufgabeSeite, { type SubTask } from './AnwendungsaufgabeSeite';

// Angelehnt an die Abschlussprüfung 2018 (Haupttermin), Aufgabe Trigonometrie – Zahlen und Kontext verändert.

const intro =
    'Malerbetrieb Kaya stellt vor einem Wohnhaus ein Baugerüst auf. Es besteht aus waagerechten ' +
    'Gerüstböden, senkrechten Rahmen, Querstreben und höhenverstellbaren Füßen. Ein Gerüstboden ' +
    '(z. B. \\overline{AB}) ist 2,70 m lang, ein senkrechtes Rahmenteil (z. B. \\overline{BC}) ist 2,00 m hoch.';

const tasks: SubTask[] = [
    {
        context: intro,
        question: 'Berechne die Länge der Querstrebe \\overline{AC}.',
        hint: 'Das Dreieck ABC hat bei B einen rechten Winkel. Nutze den Satz des Pythagoras.',
        correctAnswer: 3.36,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Satz des Pythagoras aufstellen',
                math: '|\\overline{AC}|^2 = |\\overline{AB}|^2 + |\\overline{BC}|^2'
            },
            {
                heading: 'Schritt 2: Werte einsetzen und Wurzel ziehen',
                math: '|\\overline{AC}| = \\sqrt{2{,}70^2 + 2{,}00^2} = \\sqrt{11{,}29} \\approx 3{,}36 \\text{ m}'
            }
        ]
    },
    {
        context: intro,
        question: 'Berechne den Winkel α zwischen dem Gerüstboden \\overline{AB} und der Querstrebe \\overline{AC}.',
        hint: 'Im rechtwinkligen Dreieck ABC ist \\overline{BC} die Gegenkathete und \\overline{AB} die Ankathete von α.',
        correctAnswer: 36.53,
        correctUnit: '°',
        solutionSteps: [
            {
                heading: 'Schritt 1: Tangens aufstellen',
                math: '\\tan\\alpha = \\frac{|\\overline{BC}|}{|\\overline{AB}|} = \\frac{2{,}00}{2{,}70}'
            },
            {
                heading: 'Schritt 2: Winkel berechnen',
                math: '\\alpha = \\tan^{-1}\\left(\\frac{2{,}00}{2{,}70}\\right) \\approx 36{,}53^\\circ'
            }
        ]
    },
    {
        context:
            'Die beiden Querstreben \\overline{AC} und \\overline{BD} halbieren sich gegenseitig im Punkt E. ' +
            'Im Dreieck DEC bringt der Malerbetrieb ein Schild mit seinem Logo an. ' +
            'Es gilt \\overline{AC} = 3,36 m und α = 36,53°.',
        question: 'Wie groß ist die Fläche des Logo-Schildes?',
        hint:
            'Im Dreieck DEC kennst du \\overline{DC} (so lang wie \\overline{AB}) und \\overline{EC} (die halbe Querstrebe). ' +
            'Der Winkel bei C zwischen diesen Seiten ist so groß wie α (Wechselwinkel).',
        correctAnswer: 1.35,
        correctUnit: 'm²',
        solutionSteps: [
            {
                heading: 'Schritt 1: Seiten und Winkel im Dreieck DEC',
                math: '|\\overline{DC}| = 2{,}70 \\text{ m} \\qquad |\\overline{EC}| = \\frac{3{,}36}{2} = 1{,}68 \\text{ m} \\qquad \\sphericalangle DCE = \\alpha = 36{,}53^\\circ'
            },
            {
                heading: 'Schritt 2: Flächenformel mit dem Sinus',
                math: 'A_{\\triangle DEC} = \\frac{1}{2} \\cdot |\\overline{DC}| \\cdot |\\overline{EC}| \\cdot \\sin(\\sphericalangle DCE)'
            },
            {
                heading: 'Schritt 3: Werte einsetzen und berechnen',
                math: 'A_{\\triangle DEC} = \\frac{1}{2} \\cdot 2{,}70 \\cdot 1{,}68 \\cdot \\sin(36{,}53^\\circ) \\approx 1{,}35 \\text{ m}^2'
            }
        ]
    },
    {
        context:
            'Damit das Gerüst bei Sturm nicht kippt, wird links ein Abspannseil vom Punkt D zum Bodenanker L gespannt. ' +
            'Es gilt β = ∢FLD = 63° und γ = ∢LFD = 86°. Der linke Gerüstfuß \\overline{AF} ist auf eine Höhe ' +
            'von 20 cm eingestellt.',
        question: 'Berechne die Länge des linken Abspannseils \\overline{DL}.',
        hint:
            'Die Strecke \\overline{DF} setzt sich aus dem Gerüstfuß und einem Rahmenteil zusammen. ' +
            'Im Dreieck LFD liegt \\overline{DF} dem Winkel β gegenüber und \\overline{DL} dem Winkel γ – Sinussatz!',
        correctAnswer: 2.46,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Länge |DF| bestimmen',
                math: '|\\overline{DF}| = 0{,}20 + 2{,}00 = 2{,}20 \\text{ m}'
            },
            {
                heading: 'Schritt 2: Sinussatz aufstellen',
                math: '\\frac{|\\overline{DL}|}{\\sin\\gamma} = \\frac{|\\overline{DF}|}{\\sin\\beta}'
            },
            {
                heading: 'Schritt 3: Nach |DL| auflösen und berechnen',
                math: '|\\overline{DL}| = \\frac{2{,}20 \\cdot \\sin(86^\\circ)}{\\sin(63^\\circ)} \\approx 2{,}46 \\text{ m}'
            }
        ]
    },
    {
        context:
            'Auf der rechten Seite wird ein zweites Abspannseil \\overline{HJ} gespannt. Der Bodenanker H ist ' +
            '\\overline{GH} = 3,50 m vom rechten Gerüstfuß entfernt. Weil der Boden nach rechts abfällt, ist der ' +
            'rechte Gerüstfuß \\overline{GK} auf 77 cm eingestellt. Wie links gilt: Gerüstrahmen und Boden ' +
            'schließen auf der Hangseite einen Winkel von 86° ein.',
        question: 'Berechne die Länge des Seils \\overline{HJ}.',
        hint:
            'Der Winkel ∢JGH ist der Nebenwinkel von 86°. \\overline{JG} besteht aus Gerüstfuß und Rahmenteil. ' +
            'Dann kennst du zwei Seiten und den eingeschlossenen Winkel – Kosinussatz!',
        correctAnswer: 4.61,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Winkel und Seite bestimmen',
                math: '\\sphericalangle JGH = 180^\\circ - 86^\\circ = 94^\\circ \\qquad |\\overline{JG}| = 0{,}77 + 2{,}00 = 2{,}77 \\text{ m}'
            },
            {
                heading: 'Schritt 2: Kosinussatz aufstellen',
                math: '|\\overline{HJ}|^2 = |\\overline{GH}|^2 + |\\overline{JG}|^2 - 2 \\cdot |\\overline{GH}| \\cdot |\\overline{JG}| \\cdot \\cos(\\sphericalangle JGH)'
            },
            {
                heading: 'Schritt 3: Werte einsetzen',
                math: '|\\overline{HJ}|^2 = 3{,}50^2 + 2{,}77^2 - 2 \\cdot 3{,}50 \\cdot 2{,}77 \\cdot \\cos(94^\\circ) \\approx 21{,}28'
            },
            {
                heading: 'Schritt 4: Wurzel ziehen',
                math: '|\\overline{HJ}| = \\sqrt{21{,}28} \\approx 4{,}61 \\text{ m}'
            }
        ]
    }
];

export default function Baugeruest() {
    return (
        <AnwendungsaufgabeSeite
            title="Das Baugerüst"
            image="/images/baugeruest.svg"
            imageAlt="Skizze eines Baugerüsts an einem Hang mit den Punkten A bis L, Querstreben AC und BD, Logo-Dreieck DEC, zwei Abspannseilen und den Winkeln α, β und γ"
            tasks={tasks}
        />
    );
}
