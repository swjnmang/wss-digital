import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type ExperimentType = 'coin-four' | 'dice-double' | 'mini-wheel' | 'urn-double' | 'card-single';

interface ExperimentConfig {
    type: ExperimentType;
    buttonLabel: string;
    helper?: string;
}

interface ProbabilityTask {
    id: string;
    title: string;
    category: 'Einstufiges Experiment' | 'Mehrstufiges Experiment';
    scenario: string;
    question: string;
    answer: number;
    tolerance?: number;
    solution: string;
    experiment?: ExperimentConfig;
}

interface TaskState {
    answer: string;
    status: 'blank' | 'correct' | 'incorrect' | 'invalid';
    hadWrongAttempt: boolean;
    showSolution: boolean;
    experimentResult: string | null;
}

interface SpinnerSegment {
    label: string;
    color: string;
    weight: number;
    description: string;
    startAngle?: number;
    endAngle?: number;
}

const wheelSegmentsBase: SpinnerSegment[] = [
    { label: 'Rot', color: '#f87171', weight: 2, description: 'Rot (2 Felder)' },
    { label: 'Gelb', color: '#facc15', weight: 1, description: 'Gelb (1 Feld)' },
    { label: 'Blau', color: '#60a5fa', weight: 3, description: 'Blau (3 Felder)' },
    { label: 'Grün', color: '#22c55e', weight: 2, description: 'Grün (2 Felder)' },
    { label: 'Lila', color: '#c084fc', weight: 2, description: 'Lila (2 Felder)' },
    { label: 'Orange', color: '#fb923c', weight: 1, description: 'Orange (1 Feld)' },
    { label: 'Türkis', color: '#06b6d4', weight: 1, description: 'Türkis (1 Feld)' }
];

const totalWheelWeight = wheelSegmentsBase.reduce((sum, segment) => sum + segment.weight, 0);

const spinnerSegments: SpinnerSegment[] = (() => {
    let cumulative = 0;
    return wheelSegmentsBase.map(segment => {
        const startAngle = (cumulative / totalWheelWeight) * 360;
        cumulative += segment.weight;
        const endAngle = (cumulative / totalWheelWeight) * 360;
        return { ...segment, startAngle, endAngle };
    });
})();

const spinnerGradient = spinnerSegments
    .map(segment => `${segment.color} ${segment.startAngle ?? 0}deg ${segment.endAngle ?? 0}deg`)
    .join(', ');

const probabilityTasks: ProbabilityTask[] = [
    {
        id: 'prob-01',
        title: 'Würfel zeigt eine 4',
        category: 'Einstufiges Experiment',
        scenario: 'Ein fairer Spielwürfel (1 bis 6) wird einmal geworfen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass die Zahl 4 fällt?',
        answer: 1 / 6,
        solution: 'Es gibt 6 gleich wahrscheinliche Ergebnisse und nur eines davon ist die 4 ⇒ P = 1/6 ≈ 0,1667.'
    },
    {
        id: 'prob-02',
        title: 'Zahl größer als 4',
        category: 'Einstufiges Experiment',
        scenario: 'Der gleiche Würfel wird erneut nur einmal geworfen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, eine Zahl größer als 4 (also 5 oder 6) zu treffen?',
        answer: 2 / 6,
        solution: 'Die günstigen Ergebnisse sind 5 und 6 (2 Stück). Mit 6 möglichen Zahlen gilt P = 2/6 = 1/3 ≈ 0,3333.'
    },
    {
        id: 'prob-03',
        title: 'Primzahl beim Würfeln',
        category: 'Einstufiges Experiment',
        scenario: 'Noch einmal wird derselbe faire Würfel verwendet.',
        question: 'Wie groß ist die Wahrscheinlichkeit für eine Primzahl (2, 3 oder 5)?',
        answer: 3 / 6,
        solution: 'Drei der sechs Zahlen sind prim ⇒ P = 3/6 = 1/2 = 0,5.'
    },
    {
        id: 'prob-04',
        title: 'Zwei Münzwürfe',
        category: 'Mehrstufiges Experiment',
        scenario: 'Eine faire Münze wird zweimal hintereinander geworfen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass zwei Mal Kopf fällt?',
        answer: 1 / 4,
        solution: 'Die unabhängigen Würfe liefern (K,K) mit P = 0,5 · 0,5 = 0,25 = 1/4.'
    },
    {
        id: 'prob-05',
        title: 'Drei Münzwürfe – genau zwei Köpfe',
        category: 'Mehrstufiges Experiment',
        scenario: 'Eine faire Münze wird dreimal nacheinander geworfen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass genau zwei Köpfe auftreten?',
        answer: 3 / 8,
        solution: 'Es gibt \u201c3 über 2\u201d = 3 passende Ergebnisse unter 2³ = 8 möglichen ⇒ P = 3/8 = 0,375.'
    },
    {
        id: 'prob-06',
        title: 'Urne mit roten und blauen Kugeln',
        category: 'Einstufiges Experiment',
        scenario: 'In einer Urne liegen 3 rote und 2 blaue Kugeln. Es wird eine Kugel zufällig gezogen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, eine rote Kugel zu ziehen?',
        answer: 3 / 5,
        solution: '5 Kugeln insgesamt, davon 3 rot ⇒ P = 3/5 = 0,6.'
    },
    {
        id: 'prob-07',
        title: 'Zweimal ziehen ohne Zurücklegen',
        category: 'Mehrstufiges Experiment',
        scenario: 'Aus derselben Urne (3 rot, 2 blau) werden zwei Kugeln nacheinander ohne Zurücklegen gezogen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass beide Kugeln rot sind?',
        answer: (3 / 5) * (2 / 4),
        solution: 'Erster Zug: 3/5. Danach bleiben 2 rote von 4 Kugeln ⇒ 2/4. Multiplikation ergibt P = 3/5 · 1/2 = 3/10 = 0,3.'
    },
    {
        id: 'prob-08',
        title: 'Nicht grüne Kugel',
        category: 'Einstufiges Experiment',
        scenario: 'In einer Box liegen 4 grüne, 1 gelbe und 2 blaue Kugeln.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass eine zufällige Kugel nicht grün ist?',
        answer: 3 / 7,
        solution: 'Es gibt 7 Kugeln insgesamt. Nicht grün sind 1 gelbe + 2 blaue = 3 Stück ⇒ P = 3/7 ≈ 0,4286.'
    },
    {
        id: 'prob-09',
        title: 'Herz aus dem Kartenspiel',
        category: 'Einstufiges Experiment',
        scenario: 'Aus einem vollständigen 52-Karten-Blatt wird eine Karte gezogen.',
        question: 'Wie groß ist die Wahrscheinlichkeit für eine Herzkarte?',
        answer: 13 / 52,
        solution: 'Jede Farbe besitzt 13 Karten ⇒ P = 13/52 = 1/4 = 0,25.'
    },
    {
        id: 'prob-10',
        title: 'Schwarze Dame',
        category: 'Einstufiges Experiment',
        scenario: 'Es wird erneut eine Karte aus dem 52er-Blatt gezogen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass die Karte eine schwarze Dame ist?',
        answer: 2 / 52,
        solution: 'Es gibt genau zwei schwarze Damen (♣D und ♠D) ⇒ P = 2/52 = 1/26 ≈ 0,0385.'
    },
    {
        id: 'prob-11',
        title: 'Zwei Würfel \u2013 Augensumme 9',
        category: 'Mehrstufiges Experiment',
        scenario: 'Zwei faire Würfel werden gleichzeitig geworfen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass die Augensumme 9 beträgt?',
        answer: 4 / 36,
        solution: 'Günstige Paare: (3,6), (4,5), (5,4), (6,3) ⇒ 4 von 36 Möglichkeiten, also P = 1/9 ≈ 0,1111.'
    },
    {
        id: 'prob-12',
        title: 'Mindestens ein Sechser',
        category: 'Mehrstufiges Experiment',
        scenario: 'Die beiden Würfel aus Aufgabe 11 werden noch einmal betrachtet.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass mindestens ein Würfel eine 6 zeigt?',
        answer: 11 / 36,
        solution: 'Komplement: kein Sechser ⇒ (5/6)·(5/6) = 25/36. Daher P = 1 - 25/36 = 11/36 ≈ 0,3056.'
    },
    {
        id: 'prob-13',
        title: 'Genau eine rote Kugel mit Zurücklegen',
        category: 'Mehrstufiges Experiment',
        scenario: 'Eine Urne enthält 5 rote und 4 blaue Kugeln. Es wird zwei Mal mit Zurücklegen gezogen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass genau eine rote Kugel gezogen wird?',
        answer: (5 / 9) * (4 / 9) * 2,
        solution: 'Die Fälle (rot, blau) und (blau, rot) sind gleich wahrscheinlich. P = 2 · (5/9 · 4/9) = 40/81 ≈ 0,4938.'
    },
    {
        id: 'prob-14',
        title: 'Gold dann Silber',
        category: 'Mehrstufiges Experiment',
        scenario: 'In einer Schachtel liegen 2 Gold-, 3 Silber- und 1 Bronze-Medaille. Es wird ohne Zurücklegen zwei Mal gezogen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, zuerst Gold und dann Silber zu erhalten?',
        answer: (2 / 6) * (3 / 5),
        solution: 'Erster Zug Gold: 2/6. Danach bleiben 3 Silber von 5 Medaillen ⇒ 3/5. Produkt: 6/30 = 1/5 = 0,2.'
    },
    {
        id: 'prob-15',
        title: 'Glücksrad mit 8 Feldern',
        category: 'Einstufiges Experiment',
        scenario: 'Ein Glücksrad besitzt 8 gleich große Felder, 3 davon sind Gewinne.',
        question: 'Wie groß ist die Gewinnwahrscheinlichkeit?',
        answer: 3 / 8,
        solution: 'Alle Felder sind gleich wahrscheinlich ⇒ P = 3/8 = 0,375.'
    },
    {
        id: 'prob-16',
        title: 'Zufällige Ziffer',
        category: 'Einstufiges Experiment',
        scenario: 'Aus den Ziffern 0 bis 9 wird eine zufällig ausgewählt.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass die Ziffer durch 3 teilbar ist?',
        answer: 4 / 10,
        solution: 'Teilbar durch 3 sind 0, 3, 6, 9 ⇒ 4 günstige Ergebnisse unter 10 Möglichkeiten, also P = 0,4.'
    },
    {
        id: 'prob-17',
        title: 'Schülerauswahl',
        category: 'Einstufiges Experiment',
        scenario: 'In einer Klasse sind 12 Mädchen und 13 Jungen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass zufällig ein Junge ausgewählt wird?',
        answer: 13 / 25,
        solution: 'Es gibt 25 Personen, davon 13 Jungen ⇒ P = 13/25 = 0,52.'
    },
    {
        id: 'prob-18',
        title: 'Zwei verschiedene Farben',
        category: 'Mehrstufiges Experiment',
        scenario: 'Eine Kiste enthält 2 rote, 3 grüne und 3 blaue Kugeln. Es wird ohne Zurücklegen zweimal gezogen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, zwei Kugeln mit unterschiedlicher Farbe zu erhalten?',
        answer: 21 / 28,
        solution: 'Insgesamt C(8,2)=28 Paare. Gleichfarbige Paare: C(2,2)+C(3,2)+C(3,2)=1+3+3=7. Daher P = (28-7)/28 = 21/28 = 3/4 = 0,75.'
    },
    {
        id: 'prob-19',
        title: 'Würfel und Münze kombiniert',
        category: 'Mehrstufiges Experiment',
        scenario: 'Ein Würfel wird geworfen und anschließend eine faire Münze geworfen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass eine Zahl größer als 4 erscheint und anschließend Kopf fällt?',
        answer: (2 / 6) * 0.5,
        solution: 'Zahl > 4 hat P = 2/6 = 1/3. Kopf hat P = 1/2. Unabhängig ⇒ P = 1/3 · 1/2 = 1/6 ≈ 0,1667.'
    },
    {
        id: 'prob-20',
        title: 'Quiz mit zwei Fragen',
        category: 'Mehrstufiges Experiment',
        scenario: 'Eine Person beantwortet zwei unabhängige Quizfragen. Die Erfolgswahrscheinlichkeiten liegen bei 70 % bzw. 80 %.',
        question: 'Wie groß ist die Wahrscheinlichkeit, beide Fragen richtig zu beantworten?',
        answer: 0.7 * 0.8,
        solution: 'Unabhängig ⇒ P = 0,7 · 0,8 = 0,56.'
    },
    {
        id: 'prob-21',
        title: 'Glücksrad: Treffwahrscheinlichkeit Blau',
        category: 'Einstufiges Experiment',
        scenario: 'Nutze das interaktive Glücksrad oben. Es besitzt 12 gleich große Felder, davon 3 blaue.',
        question: 'Wie groß ist die Wahrscheinlichkeit für ein blaues Feld?',
        answer: 3 / 12,
        solution: 'Blau belegt drei von zwölf Feldern ⇒ P = 3/12 = 1/4 = 0,25.'
    },
    {
        id: 'prob-22',
        title: 'Glücksrad: Warme Farben',
        category: 'Einstufiges Experiment',
        scenario: 'Zum Glücksrad zählen Rot (2 Felder), Gelb (1 Feld) und Orange (1 Feld) als warme Farben.',
        question: 'Wie groß ist die Wahrscheinlichkeit, auf eine warme Farbe zu landen?',
        answer: 4 / 12,
        solution: 'Rot (2) + Gelb (1) + Orange (1) = 4 Felder ⇒ P = 4/12 = 1/3 ≈ 0,3333.'
    },
    {
        id: 'prob-23',
        title: 'Glücksrad: Einzelne Felder',
        category: 'Einstufiges Experiment',
        scenario: 'Beim Glücksrad haben Gelb, Orange und Türkis jeweils nur ein einziges Feld.',
        question: 'Wie groß ist die Wahrscheinlichkeit, eines dieser Einzel-Felder zu treffen?',
        answer: 3 / 12,
        solution: 'Drei Einzel-Felder bei 12 Gesamtfeldern ⇒ P = 3/12 = 1/4.'
    },
    {
        id: 'prob-24',
        title: 'Glücksrad: Kein Blau oder Grün',
        category: 'Einstufiges Experiment',
        scenario: 'Es sollen beim Glücksrad alle Treffer außer Blau und Grün betrachtet werden.',
        question: 'Wie groß ist die Wahrscheinlichkeit, kein blaues oder grünes Feld zu treffen?',
        answer: 7 / 12,
        solution: 'Blau (3 Felder) und Grün (2 Felder) zusammen 5. Komplement: 12 - 5 = 7 ⇒ P = 7/12 ≈ 0,5833.'
    },
    {
        id: 'prob-30',
        title: 'Glücksrad zweimal drehen – beide Male Blau',
        category: 'Mehrstufiges Experiment',
        scenario: 'Nutze das Glücksrad und denke dir zwei direkt aufeinanderfolgende Drehs.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass beide Ergebnisse blau sind?',
        answer: (3 / 12) * (3 / 12),
        solution: 'Ein Dreh liefert Blau mit P = 3/12 = 1/4. Unabhängig ⇒ P = 1/4 · 1/4 = 1/16 = 0,0625.'
    },
    {
        id: 'prob-31',
        title: 'Glücksrad zweimal drehen – mindestens einmal warm',
        category: 'Mehrstufiges Experiment',
        scenario: 'Warme Farben (Rot, Gelb, Orange) entsprechen 4 von 12 Feldern.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass bei zwei Drehs mindestens einmal eine warme Farbe auftaucht?',
        answer: 1 - (8 / 12) * (8 / 12),
        solution: 'Keine warme Farbe bedeutet zwei Mal kalte Farbe ⇒ (8/12)² = (2/3)² = 4/9. Komplement: 1 - 4/9 = 5/9 ≈ 0,5556.'
    },
    {
        id: 'prob-25',
        title: 'Vier Münzwürfe live testen',
        category: 'Mehrstufiges Experiment',
        scenario: 'Starte unten das Münzexperiment mit vier Würfen. Beobachte das Ergebnis und beurteile anschließend den theoretischen Wert.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass genau drei Köpfe fallen?',
        answer: 4 / 16,
        solution: 'C(4,3) = 4 günstige Ergebnisse (KKKZ in beliebiger Reihenfolge) bei 2⁴ = 16 Möglichkeiten ⇒ P = 4/16 = 1/4.',
        experiment: {
            type: 'coin-four',
            buttonLabel: '4 Münzwürfe simulieren'
        }
    },
    {
        id: 'prob-26',
        title: 'Doppelte Würfel – Summe ab 10',
        category: 'Mehrstufiges Experiment',
        scenario: 'Wirf mit dem Button zwei faire Würfel. Danach beantwortest du die Frage zur Wahrscheinlichkeit.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass die Augensumme mindestens 10 beträgt?',
        answer: 6 / 36,
        solution: 'Mögliche Paare: (4,6), (5,5), (6,4), (5,6), (6,5), (6,6) ⇒ 6/36 = 1/6 ≈ 0,1667.',
        experiment: {
            type: 'dice-double',
            buttonLabel: '2 Würfel werfen'
        }
    },
    {
        id: 'prob-27',
        title: 'Mini-Glücksrad mit Zahlen',
        category: 'Einstufiges Experiment',
        scenario: 'Das kleine Glücksrad liefert die Werte 1, 2, 2, 3 und 4 (alle gleich wahrscheinlich). Lass es ruhig ein paar Mal laufen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass der Wert höchstens 2 beträgt?',
        answer: 3 / 5,
        solution: 'Die Ergebnisse 1, 2, 2 erfüllen die Bedingung ⇒ 3 von 5 Feldern, also P = 3/5 = 0,6.',
        experiment: {
            type: 'mini-wheel',
            buttonLabel: 'Mini-Glücksrad drehen'
        }
    },
    {
        id: 'prob-28',
        title: 'Zweimal ziehen mit Zurücklegen',
        category: 'Mehrstufiges Experiment',
        scenario: 'Eine Urne enthält 4 rote, 3 blaue und 1 schwarze Kugel. Per Button ziehst du zweimal mit Zurücklegen.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass mindestens eine rote Kugel erscheint?',
        answer: 1 - (4 / 8) * (4 / 8),
        solution: 'Nicht rot ist Blau oder Schwarz ⇒ 4/8 pro Zug. Komplement: 1 - (4/8)² = 1 - 1/4 = 3/4 = 0,75.',
        experiment: {
            type: 'urn-double',
            buttonLabel: 'Zweimal ziehen (mit Zurücklegen)'
        }
    },
    {
        id: 'prob-29',
        title: 'Kartenziehen – Rot oder König',
        category: 'Einstufiges Experiment',
        scenario: 'Simuliere eine Karte aus einem vollständigen 52er-Blatt.',
        question: 'Wie groß ist die Wahrscheinlichkeit, dass die Karte rot ist oder ein König?',
        answer: 28 / 52,
        solution: 'Es gibt 26 rote Karten. Zusätzlich zählen die beiden schwarzen Könige ⇒ 26 + 2 = 28 Karten, also P = 28/52 = 7/13.',
        experiment: {
            type: 'card-single',
            buttonLabel: 'Karte ziehen'
        }
    }
];

type FeedbackStatus = Exclude<TaskState['status'], 'blank'>;

const statusMessages: Record<FeedbackStatus, string> = {
    correct: 'Stark! Deine Rechnung stimmt.',
    incorrect: 'Noch nicht richtig. Prüfe deinen Ansatz.',
    invalid: 'Bitte gib eine gültige Wahrscheinlichkeit an (z. B. 0,25 oder 1/4).'
};

const statusClasses: Record<FeedbackStatus, string> = {
    correct: 'text-green-700 bg-green-50 border border-green-200',
    incorrect: 'text-red-700 bg-red-50 border border-red-200',
    invalid: 'text-amber-700 bg-amber-50 border border-amber-200'
};

const parseProbabilityInput = (rawValue: string): number | null => {
    if (!rawValue) return null;
    let value = rawValue.trim();
    if (!value) return null;

    let isPercent = false;
    if (value.endsWith('%')) {
        isPercent = true;
        value = value.slice(0, -1).trim();
    }

    value = value.replace(',', '.');

    let numericValue: number | null = null;

    if (value.includes('/')) {
        const parts = value.split('/').map(part => part.trim());
        if (parts.length === 2) {
            const numerator = Number(parts[0]);
            const denominator = Number(parts[1]);
            if (!Number.isNaN(numerator) && !Number.isNaN(denominator) && denominator !== 0) {
                numericValue = numerator / denominator;
            }
        }
    } else {
        const direct = Number(value);
        if (!Number.isNaN(direct)) {
            numericValue = direct;
        }
    }

    if (numericValue === null) return null;

    if (isPercent) {
        numericValue = numericValue / 100;
    }

    if (numericValue < 0 || numericValue > 1) {
        return null;
    }

    return numericValue;
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomChoice = <T,>(values: T[]): T => values[Math.floor(Math.random() * values.length)];

const simulateExperiment = (type: ExperimentType): string => {
    switch (type) {
        case 'coin-four': {
            const tosses = Array.from({ length: 4 }, () => (Math.random() < 0.5 ? 'K' : 'Z'));
            const heads = tosses.filter(result => result === 'K').length;
            return `Würfe: ${tosses.join(' | ')} (${heads}× Kopf)`;
        }
        case 'dice-double': {
            const first = randomInt(1, 6);
            const second = randomInt(1, 6);
            return `Würfel: ${first} und ${second} (Summe ${first + second})`;
        }
        case 'mini-wheel': {
            const outcomes = [1, 2, 2, 3, 4];
            const value = randomChoice(outcomes);
            return `Mini-Rad: ${value}`;
        }
        case 'urn-double': {
            const pool = ['rot', 'rot', 'rot', 'rot', 'blau', 'blau', 'blau', 'schwarz'];
            const first = randomChoice(pool);
            const second = randomChoice(pool);
            return `Züge: ${first} und ${second}`;
        }
        case 'card-single': {
            const suits = ['♠', '♥', '♦', '♣'];
            const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K'];
            const suit = randomChoice(suits);
            const rank = randomChoice(ranks);
            const color = suit === '♥' || suit === '♦' ? 'rot' : 'schwarz';
            return `Karte: ${rank}${suit} (${color})`;
        }
        default:
            return 'Experiment ausgeführt.';
    }
};

const SpinnerShowcase: React.FC = () => {
    const [rotation, setRotation] = useState(0);
    const [selectedSegment, setSelectedSegment] = useState(spinnerSegments[0]);
    const [isSpinning, setIsSpinning] = useState(false);

    const spinWheel = () => {
        if (isSpinning) return;

        const randomWeight = Math.random() * totalWheelWeight;
        let cumulative = 0;
        let chosen = spinnerSegments[0];
        for (const segment of spinnerSegments) {
            cumulative += segment.weight;
            if (randomWeight <= cumulative) {
                chosen = segment;
                break;
            }
        }

        const start = chosen.startAngle ?? 0;
        const end = chosen.endAngle ?? 0;
        const targetAngle = start + Math.random() * (end - start);
        const normalizedCurrent = ((rotation % 360) + 360) % 360;
        const targetRotation = rotation + 720 + (360 - targetAngle) - normalizedCurrent;

        setIsSpinning(true);
        setRotation(targetRotation);
        setTimeout(() => {
            setSelectedSegment(chosen);
            setIsSpinning(false);
        }, 1600);
    };

    return (
        <div className="bg-slate-50 border border-blue-100 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="relative w-64 h-64 mx-auto">
                    <div
                        className="absolute -top-5 left-1/2 -translate-x-1/2"
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderBottom: '16px solid #dc2626'
                        }}
                    />
                    <div
                        className="w-full h-full rounded-full border-4 border-slate-800 shadow-inner transition-transform duration-[1600ms] ease-out"
                        style={{ background: `conic-gradient(${spinnerGradient})`, transform: `rotate(${rotation}deg)` }}
                    />
                </div>
                <div className="flex-1 space-y-3">
                    <h2 className="text-2xl font-bold text-blue-900">Aufgabe 1 – Interaktives Glücksrad</h2>
                    <p className="text-gray-700">
                        Drehe das Rad, beobachte die Farben und nutze deine Beobachtungen, um die Aufgaben 1.1 bis 1.6 zu bearbeiten.
                        Alle Felder sind gleich groß, die Farbanteile siehst du in der Legende.
                    </p>
                    <button
                        onClick={spinWheel}
                        disabled={isSpinning}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                        {isSpinning ? '... dreht' : 'Glücksrad drehen'}
                    </button>
                    <p className="text-sm text-slate-600">
                        Aktueller Treffer: <span className="font-semibold text-slate-900">{selectedSegment.label}</span>
                    </p>
                </div>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                {spinnerSegments.map(segment => (
                    <li key={segment.label} className="flex items-center gap-2">
                        <span
                            className="inline-block w-3 h-3 rounded-full border border-white"
                            style={{ backgroundColor: segment.color }}
                        />
                        {segment.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Wahrscheinlichkeiten: React.FC = () => {
    const spinnerTaskIds = useMemo(
        () => new Set(['prob-21', 'prob-22', 'prob-23', 'prob-24', 'prob-30', 'prob-31']),
        []
    );
    const spinnerTasks = useMemo(() => probabilityTasks.filter(task => spinnerTaskIds.has(task.id)), [spinnerTaskIds]);
    const otherTasks = useMemo(() => probabilityTasks.filter(task => !spinnerTaskIds.has(task.id)), [spinnerTaskIds]);
    const spinnerLabelMap = useMemo(() => {
        const map: Record<string, string> = {};
        spinnerTasks.forEach((task, index) => {
            map[task.id] = `Aufgabe 1.${index + 1}`;
        });
        return map;
    }, [spinnerTasks]);
    const otherTaskLabelMap = useMemo(() => {
        const map: Record<string, string> = {};
        let counter = 2;
        probabilityTasks.forEach(task => {
            if (!spinnerTaskIds.has(task.id)) {
                map[task.id] = `Aufgabe ${counter}`;
                counter += 1;
            }
        });
        return map;
    }, [spinnerTaskIds]);
    const taskOrderMap = useMemo(
        () =>
            probabilityTasks.reduce((acc, task, index) => {
                acc[task.id] = index + 1;
                return acc;
            }, {} as Record<string, number>),
        []
    );
    const initialStates = useMemo<Record<string, TaskState>>(
        () =>
            probabilityTasks.reduce((acc, task) => {
                acc[task.id] = {
                    answer: '',
                    status: 'blank',
                    hadWrongAttempt: false,
                    showSolution: false,
                    experimentResult: null
                };
                return acc;
            }, {} as Record<string, TaskState>),
        []
    );

    const [taskStates, setTaskStates] = useState<Record<string, TaskState>>(initialStates);

    const handleAnswerChange = (taskId: string, value: string) => {
        setTaskStates(prev => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                answer: value,
                status: 'blank'
            }
        }));
    };

    const checkAnswer = (task: ProbabilityTask) => {
        setTaskStates(prev => {
            const current = prev[task.id];
            const parsed = parseProbabilityInput(current.answer);

            if (parsed === null) {
                return {
                    ...prev,
                    [task.id]: {
                        ...current,
                        status: 'invalid'
                    }
                };
            }

            const tolerance = task.tolerance ?? 0.01;
            const isCorrect = Math.abs(parsed - task.answer) <= tolerance;

            return {
                ...prev,
                [task.id]: {
                    ...current,
                    status: isCorrect ? 'correct' : 'incorrect',
                    hadWrongAttempt: current.hadWrongAttempt || !isCorrect
                }
            };
        });
    };

    const toggleSolution = (taskId: string) => {
        setTaskStates(prev => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                showSolution: !prev[taskId].showSolution
            }
        }));
    };

    const handleExperimentRun = (taskId: string, type: ExperimentType) => {
        const outcome = simulateExperiment(type);
        setTaskStates(prev => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                experimentResult: outcome
            }
        }));
    };

    const renderTask = (task: ProbabilityTask, label: string) => {
        const state = taskStates[task.id];
        const statusKey: FeedbackStatus | null = state.status === 'blank' ? null : state.status;

        return (
            <article key={task.id} className="border border-gray-200 rounded-2xl p-5 bg-slate-50">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-blue-600 font-semibold uppercase">{label}</p>
                        <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">{task.category}</span>
                </div>

                <p className="mt-3 text-gray-700">{task.scenario}</p>
                <p className="mt-2 font-semibold text-gray-900">Frage: {task.question}</p>

                {task.experiment && (
                    <div className="mt-3 space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => handleExperimentRun(task.id, task.experiment!.type)}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
                            >
                                {task.experiment.buttonLabel}
                            </button>
                            {state.experimentResult && <span className="text-sm text-gray-600">Letztes Ergebnis: {state.experimentResult}</span>}
                        </div>
                        {task.experiment.helper && <p className="text-xs text-gray-500">{task.experiment.helper}</p>}
                    </div>
                )}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="text-sm font-semibold text-gray-700" htmlFor={`answer-${task.id}`}>
                        Dein Ergebnis
                    </label>
                    <input
                        id={`answer-${task.id}`}
                        type="text"
                        value={state.answer}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleAnswerChange(task.id, event.target.value)}
                        placeholder="z. B. 3/8 oder 0,375"
                        className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                    />
                    <button onClick={() => checkAnswer(task)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                        Prüfen
                    </button>
                    {state.hadWrongAttempt && (
                        <button onClick={() => toggleSolution(task.id)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">
                            {state.showSolution ? 'Musterlösung verbergen' : 'Musterlösung anzeigen'}
                        </button>
                    )}
                </div>

                {statusKey && <p className={`mt-3 text-sm rounded-lg px-3 py-2 ${statusClasses[statusKey]}`}>{statusMessages[statusKey]}</p>}

                {state.showSolution && (
                    <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                        <p className="font-semibold text-gray-900 mb-1">Musterlösung</p>
                        <p>{task.solution}</p>
                    </div>
                )}
            </article>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Link to="/daten-und-zufall" className="text-blue-600 hover:text-blue-800 font-semibold mb-4 inline-flex items-center">
                ← Zurück zur Übersicht
            </Link>

            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-blue-900 mb-3">Wahrscheinlichkeiten berechnen</h1>
                    <p className="text-gray-700">
                        Dich erwarten jetzt 31 Aufgaben zu ein- und mehrstufigen Zufallsexperimenten. Ein interaktives Glücksrad sowie
                        fünf zusätzliche Simulationen (Münzen, Würfel, Mini-Rad, Urne, Karten) helfen dir, Zufallsergebnisse selbst zu
                        erleben. Gib deine Lösung als Bruch, Dezimalzahl oder Prozentwert an. Die Musterlösung erscheint erst, nachdem
                        du mindestens einen Fehlversuch hattest.
                    </p>
                </div>

                <SpinnerShowcase />

                <section className="space-y-4">
                    <div className="bg-slate-50 border border-blue-100 rounded-2xl p-6 space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-900">Aufgabe 1 – Rechnen mit dem Glücksrad</h2>
                            <p className="text-gray-700">Diese Aufgaben nutzen genau die Farben und Wahrscheinlichkeiten des interaktiven Rads darüber.</p>
                        </div>
                        <div className="grid gap-5">
                            {spinnerTasks.map(task => renderTask(task, spinnerLabelMap[task.id]))}
                        </div>
                    </div>
                </section>

                <div className="grid gap-5">
                    {otherTasks.map(task => renderTask(task, otherTaskLabelMap[task.id] ?? `Aufgabe ${taskOrderMap[task.id]}`))}
                </div>
            </div>
        </div>
    );
};

export default Wahrscheinlichkeiten;
