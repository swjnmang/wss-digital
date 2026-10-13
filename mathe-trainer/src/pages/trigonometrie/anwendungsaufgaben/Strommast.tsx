import AnwendungsaufgabeSeite, { type SubTask } from './AnwendungsaufgabeSeite';

// Angelehnt an die Musterprüfung 2017 (LP plus), Aufgabe Trigonometrie – Zahlen und Kontext verändert.

const tasks: SubTask[] = [
    {
        context:
            'Die Skizze zeigt den rechten unteren Teil eines Strommastes an einer Bundesstraße. Weil sich ' +
            'an mehreren Streben Rost gebildet hat, lässt der Netzbetreiber einige Stangen neu lackieren. ' +
            'Die Stangen \\overline{DE} und \\overline{FG} verlaufen waagerecht, also parallel zum Boden.\n\n' +
            'Es gilt: \\overline{DE} = 1,35 m, \\overline{AE} = 2,10 m und α = ∢DEA = 105°.',
        question: 'Berechne die Länge der Metallstange \\overline{DA}.',
        hint:
            'Im Dreieck ADE kennst du zwei Seiten und den Winkel, den sie einschließen. ' +
            'Damit kannst du den Kosinussatz verwenden.',
        correctAnswer: 2.77,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Kosinussatz aufstellen',
                text: 'Der Winkel α liegt zwischen den bekannten Seiten \\overline{DE} und \\overline{AE}:',
                math: '|\\overline{DA}|^2 = |\\overline{DE}|^2 + |\\overline{AE}|^2 - 2 \\cdot |\\overline{DE}| \\cdot |\\overline{AE}| \\cdot \\cos\\alpha'
            },
            {
                heading: 'Schritt 2: Werte einsetzen',
                math: '|\\overline{DA}|^2 = 1{,}35^2 + 2{,}10^2 - 2 \\cdot 1{,}35 \\cdot 2{,}10 \\cdot \\cos(105^\\circ) \\approx 7{,}70'
            },
            {
                heading: 'Schritt 3: Wurzel ziehen',
                math: '|\\overline{DA}| = \\sqrt{7{,}70} \\approx 2{,}77 \\text{ m}'
            }
        ]
    },
    {
        context:
            'Für die Werkstatt muss auch der Winkel γ = ∢ADE bekannt sein, unter dem die Stange ' +
            '\\overline{DA} an die waagerechte Stange \\overline{DE} angeschweißt ist. ' +
            'Es gilt \\overline{DA} = 2,77 m, \\overline{AE} = 2,10 m und α = 105°.',
        question: 'Berechne den Winkel γ.',
        hint:
            'Der Winkel γ liegt der Seite \\overline{AE} gegenüber, α liegt der Seite \\overline{DA} gegenüber. ' +
            'Verwende den Sinussatz.',
        correctAnswer: 47.08,
        correctUnit: '°',
        solutionSteps: [
            {
                heading: 'Schritt 1: Sinussatz aufstellen',
                math: '\\frac{\\sin\\gamma}{|\\overline{AE}|} = \\frac{\\sin\\alpha}{|\\overline{DA}|}'
            },
            {
                heading: 'Schritt 2: Nach sin γ auflösen',
                text: 'Beide Seiten mit \\overline{AE} multiplizieren:',
                math: '\\sin\\gamma = \\frac{2{,}10 \\cdot \\sin(105^\\circ)}{2{,}77} \\approx 0{,}7323'
            },
            {
                heading: 'Schritt 3: Winkel berechnen',
                math: '\\gamma = \\sin^{-1}(0{,}7323) \\approx 47{,}08^\\circ'
            }
        ]
    },
    {
        context:
            'Die Punkte A, E und G liegen auf einer geraden Stange. Außerdem gilt β = ∢EDG = 64°.',
        question: 'Berechne die Länge der Stange \\overline{GE}.',
        hint:
            'Berechne zuerst den Winkel ∢GED als Nebenwinkel von α und dann den Winkel bei G über die ' +
            'Winkelsumme. Danach hilft der Sinussatz im Dreieck DEG.',
        correctAnswer: 1.85,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Winkel ∢GED (Nebenwinkel von α)',
                math: '\\sphericalangle GED = 180^\\circ - 105^\\circ = 75^\\circ'
            },
            {
                heading: 'Schritt 2: Winkel ∢DGE (Winkelsumme im Dreieck)',
                math: '\\sphericalangle DGE = 180^\\circ - 64^\\circ - 75^\\circ = 41^\\circ'
            },
            {
                heading: 'Schritt 3: Sinussatz aufstellen',
                text: '\\overline{GE} liegt β gegenüber, \\overline{DE} liegt dem Winkel bei G gegenüber:',
                math: '\\frac{|\\overline{GE}|}{\\sin(64^\\circ)} = \\frac{1{,}35}{\\sin(41^\\circ)}'
            },
            {
                heading: 'Schritt 4: Nach |GE| auflösen und berechnen',
                math: '|\\overline{GE}| = \\frac{1{,}35 \\cdot \\sin(64^\\circ)}{\\sin(41^\\circ)} \\approx 1{,}85 \\text{ m}'
            }
        ]
    },
    {
        context:
            'Alle Stangen, die das große Dreieck AGF begrenzen, werden mit Rostschutzfarbe gestrichen. ' +
            'Zusätzlich ist bekannt: \\overline{FD} = 2,44 m und \\overline{FG} = 2,54 m. ' +
            'Die Punkte F, D und A liegen auf einer Geraden.\n\n' +
            'Bisherige Ergebnisse: \\overline{DA} = 2,77 m, \\overline{GE} = 1,85 m, \\overline{AE} = 2,10 m.',
        question: 'Berechne die Gesamtlänge der Stangen, die gestrichen werden müssen.',
        hint:
            'Gesucht ist der Umfang des Dreiecks AGF. Setze die Seiten \\overline{AG} und \\overline{FA} ' +
            'jeweils aus zwei Teilstücken zusammen.',
        correctAnswer: 11.7,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Seiten des Dreiecks AGF zusammensetzen',
                math: '|\\overline{AG}| = 2{,}10 + 1{,}85 = 3{,}95 \\text{ m} \\qquad |\\overline{FA}| = 2{,}44 + 2{,}77 = 5{,}21 \\text{ m}'
            },
            {
                heading: 'Schritt 2: Umfang berechnen',
                math: 'u = |\\overline{AG}| + |\\overline{FG}| + |\\overline{FA}| = 3{,}95 + 2{,}54 + 5{,}21 = 11{,}70 \\text{ m}'
            }
        ]
    },
    {
        context:
            'Zur Verstärkung wird vom Punkt D aus eine Strebe s senkrecht nach oben bis zur Stange ' +
            '\\overline{FG} eingebaut (Fußpunkt H). Es gilt weiterhin \\overline{DE} = 1,35 m, β = 64°, ' +
            '∢GED = 75° und ∢DGE = 41°.',
        question: 'Berechne die Länge der Strebe s.',
        hint:
            'Berechne zuerst \\overline{DG} mit dem Sinussatz im Dreieck DEG. Weil \\overline{FG} parallel zu ' +
            '\\overline{DE} ist, ist ∢DGH genauso groß wie β (Wechselwinkel). Im rechtwinkligen Dreieck DHG ' +
            'hilft dann der Sinus.',
        correctAnswer: 1.79,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Länge |DG| mit dem Sinussatz',
                math: '\\frac{|\\overline{DG}|}{\\sin(75^\\circ)} = \\frac{1{,}35}{\\sin(41^\\circ)} \\;\\Rightarrow\\; |\\overline{DG}| = \\frac{1{,}35 \\cdot \\sin(75^\\circ)}{\\sin(41^\\circ)} \\approx 1{,}99 \\text{ m}'
            },
            {
                heading: 'Schritt 2: Winkel bei G (Wechselwinkel)',
                text: 'Da \\overline{FG} parallel zu \\overline{DE} verläuft, gilt:',
                math: '\\sphericalangle DGH = \\beta = 64^\\circ'
            },
            {
                heading: 'Schritt 3: Sinus im rechtwinkligen Dreieck DHG',
                text: 's ist die Gegenkathete des Winkels bei G, \\overline{DG} die Hypotenuse:',
                math: '\\sin(64^\\circ) = \\frac{s}{1{,}99} \\;\\Rightarrow\\; s = 1{,}99 \\cdot \\sin(64^\\circ) \\approx 1{,}79 \\text{ m}'
            }
        ]
    },
    {
        context:
            'Eine Firma aus dem Ort möchte die dreieckige Fläche DEG mit einem Werbebanner verkleiden. ' +
            'Es gilt \\overline{DE} = 1,35 m, \\overline{GE} = 1,85 m und ∢GED = 75°.',
        question: 'Wie groß ist die Fläche, die für das Werbebanner zur Verfügung steht?',
        hint: 'Du kennst zwei Seiten und den eingeschlossenen Winkel – nutze die Flächenformel mit dem Sinus.',
        correctAnswer: 1.21,
        correctUnit: 'm²',
        solutionSteps: [
            {
                heading: 'Schritt 1: Flächenformel aufstellen',
                math: 'A_{\\triangle DEG} = \\frac{1}{2} \\cdot |\\overline{DE}| \\cdot |\\overline{GE}| \\cdot \\sin(\\sphericalangle GED)'
            },
            {
                heading: 'Schritt 2: Werte einsetzen und berechnen',
                math: 'A_{\\triangle DEG} = \\frac{1}{2} \\cdot 1{,}35 \\cdot 1{,}85 \\cdot \\sin(75^\\circ) \\approx 1{,}21 \\text{ m}^2'
            }
        ]
    }
];

export default function Strommast() {
    return (
        <AnwendungsaufgabeSeite
            title="Der Strommast"
            image="/images/strommast.svg"
            imageAlt="Skizze des rechten unteren Teils eines Strommastes mit den Punkten A, D, E, F, G, H, der Werbefläche DEG, der Strebe s und den Winkeln α, β und γ"
            tasks={tasks}
        />
    );
}
