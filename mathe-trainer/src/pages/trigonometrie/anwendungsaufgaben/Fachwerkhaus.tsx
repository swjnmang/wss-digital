import AnwendungsaufgabeSeite, { type SubTask } from './AnwendungsaufgabeSeite';

// Angelehnt an die Abschlussprüfung 2019 (Haupttermin), Aufgabe Trigonometrie – Zahlen und Kontext verändert.

const intro =
    'Die Holzbau Berger KG errichtet für Familie Yilmaz ein Haus mit moderner Fachwerkfassade. ' +
    'Einige Sichtbalken in der Giebelwand sollen farbig lasiert werden. Die Breite der Balken wird bei ' +
    'allen Berechnungen vernachlässigt.';

const tasks: SubTask[] = [
    {
        context:
            intro + '\n\nDie seitliche Erhöhung \\overline{EF} ist 1,05 m hoch, bei E liegt ein rechter Winkel. ' +
            'Der Stützbalken \\overline{DF} ist um β = 26,6° gegen die Waagerechte geneigt.',
        question: 'Berechne die Länge des Stützbalkens \\overline{DF}.',
        hint: 'Im rechtwinkligen Dreieck DEF ist \\overline{EF} die Gegenkathete von β und \\overline{DF} die Hypotenuse.',
        correctAnswer: 2.35,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Sinus aufstellen',
                math: '\\sin\\beta = \\frac{|\\overline{EF}|}{|\\overline{DF}|}'
            },
            {
                heading: 'Schritt 2: Nach |DF| auflösen',
                text: 'Mit \\overline{DF} multiplizieren und durch sin β teilen:',
                math: '|\\overline{DF}| = \\frac{|\\overline{EF}|}{\\sin\\beta} = \\frac{1{,}05}{\\sin(26{,}6^\\circ)}'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: '|\\overline{DF}| \\approx 2{,}35 \\text{ m}'
            }
        ]
    },
    {
        context:
            'In das Dreieck DEF wird ein Glaselement eingesetzt. Es gilt \\overline{DF} = 2,35 m, ' +
            '\\overline{EF} = 1,05 m und β = 26,6°.',
        question: 'Wie groß ist die Glasfläche?',
        hint:
            'Berechne zuerst den Winkel ∢DFE über die Winkelsumme. Dann kennst du zwei Seiten und den ' +
            'eingeschlossenen Winkel.',
        correctAnswer: 1.10,
        correctUnit: 'm²',
        solutionSteps: [
            {
                heading: 'Schritt 1: Winkel bei F',
                math: '\\sphericalangle DFE = 180^\\circ - 90^\\circ - 26{,}6^\\circ = 63{,}4^\\circ'
            },
            {
                heading: 'Schritt 2: Flächenformel mit dem Sinus',
                math: 'A_{\\triangle DEF} = \\frac{1}{2} \\cdot |\\overline{DF}| \\cdot |\\overline{EF}| \\cdot \\sin(\\sphericalangle DFE)'
            },
            {
                heading: 'Schritt 3: Werte einsetzen und berechnen',
                math: 'A_{\\triangle DEF} = \\frac{1}{2} \\cdot 2{,}35 \\cdot 1{,}05 \\cdot \\sin(63{,}4^\\circ) \\approx 1{,}10 \\text{ m}^2'
            }
        ]
    },
    {
        context:
            'Der rechte Dachbalken \\overline{GF} ist 7,06 m lang. Er schließt mit dem senkrechten Balken ' +
            '\\overline{EF} den Winkel γ = ∢EFG = 120,2° ein. Außerdem gilt ∢DFE = 63,4° und \\overline{DF} = 2,35 m.',
        question: 'Berechne die Länge des Balkens \\overline{GD}, der lasiert werden soll.',
        hint:
            'Der Winkel ∢DFG ist der Unterschied zwischen γ und ∢DFE. Danach kennst du im Dreieck DFG zwei ' +
            'Seiten und den eingeschlossenen Winkel – Kosinussatz!',
        correctAnswer: 6.10,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Winkel ∢DFG',
                math: '\\sphericalangle DFG = 120{,}2^\\circ - 63{,}4^\\circ = 56{,}8^\\circ'
            },
            {
                heading: 'Schritt 2: Kosinussatz aufstellen',
                math: '|\\overline{GD}|^2 = |\\overline{GF}|^2 + |\\overline{DF}|^2 - 2 \\cdot |\\overline{GF}| \\cdot |\\overline{DF}| \\cdot \\cos(\\sphericalangle DFG)'
            },
            {
                heading: 'Schritt 3: Werte einsetzen',
                math: '|\\overline{GD}|^2 = 7{,}06^2 + 2{,}35^2 - 2 \\cdot 7{,}06 \\cdot 2{,}35 \\cdot \\cos(56{,}8^\\circ) \\approx 37{,}20'
            },
            {
                heading: 'Schritt 4: Wurzel ziehen',
                math: '|\\overline{GD}| = \\sqrt{37{,}20} \\approx 6{,}10 \\text{ m}'
            }
        ]
    },
    {
        context:
            'Auch der waagerechte Balken \\overline{AD} wird lasiert. Die Balken \\overline{GB} und \\overline{GD} ' +
            'sind gleich lang (6,10 m), und die Teilstücke \\overline{AB}, \\overline{BC} und \\overline{CD} sind ebenfalls ' +
            'gleich lang. Es gilt δ = ∢BAG = 29,9° und ε = ∢AGB = 19,1°.',
        question: 'Berechne die Länge des Balkens \\overline{AD}.',
        hint:
            'Berechne zuerst \\overline{AB} mit dem Sinussatz im Dreieck ABG: \\overline{AB} liegt ε gegenüber, ' +
            '\\overline{GB} liegt δ gegenüber. \\overline{AD} besteht aus drei solchen Teilstücken.',
        correctAnswer: 12.0,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Sinussatz im Dreieck ABG',
                math: '\\frac{|\\overline{AB}|}{\\sin\\varepsilon} = \\frac{|\\overline{GB}|}{\\sin\\delta}'
            },
            {
                heading: 'Schritt 2: Nach |AB| auflösen und berechnen',
                math: '|\\overline{AB}| = \\frac{6{,}10 \\cdot \\sin(19{,}1^\\circ)}{\\sin(29{,}9^\\circ)} \\approx 4{,}00 \\text{ m}'
            },
            {
                heading: 'Schritt 3: Gesamtlänge |AD|',
                math: '|\\overline{AD}| = 3 \\cdot 4{,}00 = 12{,}00 \\text{ m}'
            }
        ]
    },
    {
        context:
            'Eine Nachbarin hält das Dach für zu steil und legt bei der Gemeinde Widerspruch ein. Laut Bebauungsplan ' +
            'darf die Dachneigung des Balkens \\overline{AG} höchstens 60 % betragen. Es gilt δ = 29,9°.',
        question:
            'Berechne die tatsächliche Dachneigung auf der Ostseite in Prozent. (Hat der Widerspruch Erfolg? ' +
            'Die Antwort darauf findest du in der Musterlösung.)',
        hint: 'Die Steigung in Prozent ist tan δ · 100 %.',
        correctAnswer: 57.5,
        correctUnit: '%',
        solutionSteps: [
            {
                heading: 'Schritt 1: Steigung über den Tangens',
                math: 'm = \\tan\\delta = \\tan(29{,}9^\\circ) \\approx 0{,}575'
            },
            {
                heading: 'Schritt 2: In Prozent umrechnen',
                math: '0{,}575 \\cdot 100\\,\\% = 57{,}5\\,\\%'
            },
            {
                heading: 'Schritt 3: Entscheidung',
                text: 'Die Dachneigung beträgt 57,5 % und liegt damit unter der erlaubten Höchstgrenze von 60 %. Der Widerspruch hat keinen Erfolg.'
            }
        ]
    }
];

export default function Fachwerkhaus() {
    return (
        <AnwendungsaufgabeSeite
            title="Das Fachwerkhaus"
            image="/images/fachwerkhaus.svg"
            imageAlt="Skizze einer Hausfassade mit Dachbalken und den Punkten A bis G, dem rechtwinkligen Dreieck DEF und den Winkeln β, γ, δ und ε"
            tasks={tasks}
        />
    );
}
