import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

interface RightSketchOptions {
    base: string;
    height: string;
    hyp: string;
    angle?: string;
    note?: string;
}

interface ObliqueSketchOptions {
    sideAB: string;
    sideBC: string;
    sideAC: string;
    angleA?: string;
    angleB?: string;
    angleC?: string;
    note?: string;
}

type ConceptTag = 'Sinussatz' | 'Kosinussatz' | 'Rechtwinklige Trigonometrie' | 'Flächensatz';
type Difficulty = 'leicht' | 'mittel' | 'anspruchsvoll';

interface AppliedTask {
    id: string;
    title: string;
    scenario: string;
    question: string;
    givens: string[];
    hint: string;
    concepts: ConceptTag[];
    difficulty: Difficulty;
    sketch: string;
}

const createRightTriangleSketch = ({ base, height, hyp, angle, note }: RightSketchOptions) =>
    `
<svg width="260" height="180" viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg">
  <polygon points="40,140 220,140 40,40" fill="#ecfeff" stroke="#0f172a" stroke-width="2" />
  <polyline points="40,140 70,140 70,110" fill="none" stroke="#0f172a" stroke-width="2" />
  <text x="30" y="150" font-size="12" fill="#0f172a">A</text>
  <text x="225" y="150" font-size="12" fill="#0f172a">B</text>
  <text x="25" y="35" font-size="12" fill="#0f172a">C</text>
  <text x="120" y="160" font-size="13" fill="#0f172a">${base}</text>
  <text x="5" y="95" font-size="13" fill="#0f172a" transform="rotate(-90 5 95)">${height}</text>
  <text x="150" y="80" font-size="13" fill="#0f172a">${hyp}</text>
  ${angle ? `<text x="55" y="132" font-size="12" fill="#dc2626">${angle}</text>` : ''}
  ${note ? `<text x="130" y="20" font-size="12" fill="#0369a1">${note}</text>` : ''}
</svg>
`.trim();

const createObliqueTriangleSketch = ({ sideAB, sideBC, sideAC, angleA, angleB, angleC, note }: ObliqueSketchOptions) =>
    `
<svg width="260" height="180" viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg">
  <polygon points="30,150 230,150 150,40" fill="#f0f9ff" stroke="#0f172a" stroke-width="2" />
  <text x="25" y="165" font-size="12" fill="#0f172a">A</text>
  <text x="235" y="165" font-size="12" fill="#0f172a">B</text>
  <text x="150" y="30" font-size="12" fill="#0f172a" text-anchor="middle">C</text>
  <text x="130" y="170" font-size="13" fill="#0f172a">${sideAB}</text>
  <text x="205" y="100" font-size="13" fill="#0f172a">${sideAC}</text>
  <text x="70" y="95" font-size="13" fill="#0f172a">${sideBC}</text>
  ${angleA ? `<text x="55" y="140" font-size="12" fill="#dc2626">${angleA}</text>` : ''}
  ${angleB ? `<text x="205" y="140" font-size="12" fill="#dc2626">${angleB}</text>` : ''}
  ${angleC ? `<text x="150" y="55" font-size="12" fill="#dc2626">${angleC}</text>` : ''}
  ${note ? `<text x="130" y="20" font-size="12" fill="#0369a1" text-anchor="middle">${note}</text>` : ''}
</svg>
`.trim();

const appliedTasks: AppliedTask[] = [
    {
        id: 'task-01',
        title: 'Seilbahn am Gletscher',
        scenario: 'Talstation T und Bergstation B bilden mit der Höhendifferenz ein rechtwinkliges Dreieck.',
        question: 'Wie groß ist die waagrechte Distanz T–B?',
        givens: ['Seillänge TB = 860 m', 'Steigungswinkel bei T = 28°', 'Höhenunterschied = 72 m'],
        hint: 'Projiziere die Seillänge mit cos(28°) auf den Boden.',
        concepts: ['Rechtwinklige Trigonometrie'],
        difficulty: 'mittel',
        sketch: createRightTriangleSketch({ base: 'x = ?', height: '72 m', hyp: '860 m', angle: '28°', note: 'Seiltrasse' })
    },
    {
        id: 'task-02',
        title: 'Parkweg zwischen Brunnen und Café',
        scenario: 'Die Punkte A (Brunnen), B (Café) und C (Pavillon) liegen auf ebener Fläche.',
        question: 'Bestimme die Länge des direkten Weges A–B.',
        givens: ['AC = 48 m', 'BC = 54 m', 'Winkel γ = 70°'],
        hint: 'Nutze den Kosinussatz für die dritte Seite.',
        concepts: ['Kosinussatz'],
        difficulty: 'leicht',
        sketch: createObliqueTriangleSketch({ sideAB: 'AB = ?', sideAC: '48 m', sideBC: '54 m', angleC: '70°', note: 'Parkgrundriss' })
    },
    {
        id: 'task-03',
        title: 'Schatten einer Windkraftanlage',
        scenario: 'Ein 6 m hohes Fundament trägt den Turm, der bei Sonnenstand 34° einen 132 m langen Schatten wirft.',
        question: 'Wie hoch über dem Boden liegt der Rotorkopf?',
        givens: ['Schattenlänge = 132 m', 'Sonnenwinkel = 34°', 'Fundamenthöhe = 6 m'],
        hint: 'tan(34°) liefert den Höhenzuwachs, anschließend das Fundament addieren.',
        concepts: ['Rechtwinklige Trigonometrie'],
        difficulty: 'leicht',
        sketch: createRightTriangleSketch({ base: '132 m', height: 'h = ?', hyp: 'Turm', angle: '34°', note: 'Schattenbild' })
    },
    {
        id: 'task-04',
        title: 'Boje gegenüber der Promenade',
        scenario: 'Die Messpunkte A und B auf dem Ufer liegen 38 m auseinander und peilen die Boje C.',
        question: 'Wie weit ist die Boje von Punkt A entfernt?',
        givens: ['AB = 38 m', 'Winkel α = 52°', 'Winkel β = 64°'],
        hint: 'Stelle den Sinussatz auf und löse nach AC.',
        concepts: ['Sinussatz'],
        difficulty: 'mittel',
        sketch: createObliqueTriangleSketch({ sideAB: '38 m', sideAC: 'AC = ?', sideBC: 'BC = ?', angleA: '52°', angleB: '64°', note: 'Uferdreieck' })
    },
    {
        id: 'task-05',
        title: 'Kranabspannung auf dem Bauhof',
        scenario: 'Zwei Bodenanker A und B halten den Mastkopf C mit unterschiedlich langen Seilen.',
        question: 'Welchen Winkel schließen die beiden Seile am Mast ein?',
        givens: ['AB = 18 m', 'AC = 22 m', 'BC = 26 m'],
        hint: 'Der Kosinussatz liefert unmittelbar den Winkel γ.',
        concepts: ['Kosinussatz'],
        difficulty: 'mittel',
        sketch: createObliqueTriangleSketch({ sideAB: '18 m', sideAC: '22 m', sideBC: '26 m', angleC: 'γ = ?', note: 'Kranabspannung' })
    },
    {
        id: 'task-06',
        title: 'Skitour zur Hochalm',
        scenario: 'Der Zustieg verläuft als gerade Linie über einen Hang mit 17° Neigung.',
        question: 'Wie viele Höhenmeter gewinnst du nach 620 m Strecke?',
        givens: ['Hangstrecke = 620 m', 'Neigungswinkel = 17°'],
        hint: 'Der Höhengewinn ist die Gegenkathete: 620 · sin(17°).',
        concepts: ['Rechtwinklige Trigonometrie'],
        difficulty: 'leicht',
        sketch: createRightTriangleSketch({ base: '620 m', height: 'Δh = ?', hyp: 'Route', angle: '17°', note: 'Hangprofil' })
    },
    {
        id: 'task-07',
        title: 'Großsegel-Trimm',
        scenario: 'Mastfuß A, Bug B und Segelkopf C bilden ein Dreieck.',
        question: 'Bestimme den Winkel γ am Segelkopf.',
        givens: ['AB = 11,2 m', 'AC = 9,6 m', 'Winkel α = 43°'],
        hint: 'Nutze den Sinussatz, um von α auf γ zu schließen.',
        concepts: ['Sinussatz'],
        difficulty: 'mittel',
        sketch: createObliqueTriangleSketch({ sideAB: '11,2 m', sideAC: '9,6 m', sideBC: 'BC = ?', angleA: '43°', angleC: 'γ = ?', note: 'Segelplan' })
    },
    {
        id: 'task-08',
        title: 'Drohnenvermessung eines Innenhofs',
        scenario: 'Die Punkte A, B und C werden per Drohne eingemessen.',
        question: 'Wie lang ist die Strecke B–C?',
        givens: ['AB = 65 m', 'AC = 58 m', 'Winkel α = 47°'],
        hint: 'Ermittle BC via Kosinussatz und prüfe anschließend mit dem Sinussatz.',
        concepts: ['Kosinussatz', 'Sinussatz'],
        difficulty: 'mittel',
        sketch: createObliqueTriangleSketch({ sideAB: '65 m', sideAC: '58 m', sideBC: 'BC = ?', angleA: '47°', note: 'Innenhof' })
    },
    {
        id: 'task-09',
        title: 'Leuchtturm und Rettungsboot',
        scenario: 'Ein Boot beobachtet den Turmkopf unter einem Höhenwinkel von 18°.',
        question: 'Wie hoch ist der Leuchtturm bei 420 m Bodenabstand?',
        givens: ['Abstand zum Turmfuß = 420 m', 'Sichtwinkel = 18°'],
        hint: 'tan(18°) · 420 ergibt die Turmhöhe.',
        concepts: ['Rechtwinklige Trigonometrie'],
        difficulty: 'leicht',
        sketch: createRightTriangleSketch({ base: '420 m', height: 'h = ?', hyp: 'Sichtlinie', angle: '18°', note: 'Leuchtturm' })
    },
    {
        id: 'task-10',
        title: 'Dachbinder eines Stadions',
        scenario: 'Zwei Stahlträger treffen sich im Firstpunkt C.',
        question: 'Welche Spannweite AB wird überbrückt?',
        givens: ['AC = 14,5 m', 'BC = 17,2 m', 'Winkel γ = 92°'],
        hint: 'Setze den Kosinussatz an, weil zwei Seiten und der eingeschlossene Winkel gegeben sind.',
        concepts: ['Kosinussatz'],
        difficulty: 'mittel',
        sketch: createObliqueTriangleSketch({ sideAB: 'AB = ?', sideAC: '14,5 m', sideBC: '17,2 m', angleC: '92°', note: 'Dachbinder' })
    },
    {
        id: 'task-11',
        title: 'Flutlicht über dem Stadion',
        scenario: 'Die Masten an A und B (Abstand 52 m) beleuchten die Mitte C mit bekannten Winkeln.',
        question: 'Wie weit ist der Lichtpunkt C vom Mast A entfernt?',
        givens: ['AB = 52 m', 'Winkel α = 58°', 'Winkel β = 43°'],
        hint: 'Der Sinussatz liefert beide Schenkel AC und BC.',
        concepts: ['Sinussatz'],
        difficulty: 'mittel',
        sketch: createObliqueTriangleSketch({ sideAB: '52 m', sideAC: 'AC = ?', sideBC: 'BC = ?', angleA: '58°', angleB: '43°', note: 'Lichtkegel' })
    },
    {
        id: 'task-12',
        title: 'Steilküste mit Aussichtspunkt',
        scenario: 'Der Höhenunterschied zwischen Aussichtspunkt und Meer beträgt 48 m.',
        question: 'Wie weit liegt das Floß vom Klippenfuß entfernt, wenn der Blickwinkel 27° beträgt?',
        givens: ['Höhenunterschied = 48 m', 'Sinkwinkel = 27°'],
        hint: 'Verwende tan(27°) = 48 / d.',
        concepts: ['Rechtwinklige Trigonometrie'],
        difficulty: 'leicht',
        sketch: createRightTriangleSketch({ base: 'd = ?', height: '48 m', hyp: 'Sichtlinie', angle: '27°', note: 'Klippe' })
    },
    {
        id: 'task-13',
        title: 'Funkdreieck zwischen zwei Sendemasten',
        scenario: 'Die Sender A und B stehen 2,3 km auseinander und peilen denselben Gipfel C.',
        question: 'Wie weit ist der Gipfel von Sender A entfernt?',
        givens: ['AB = 2,3 km', 'Winkel α = 63°', 'Winkel β = 41°'],
        hint: 'Sinussatz aufstellen, um AC zu erhalten.',
        concepts: ['Sinussatz'],
        difficulty: 'anspruchsvoll',
        sketch: createObliqueTriangleSketch({ sideAB: '2,3 km', sideAC: 'AC = ?', sideBC: 'BC = ?', angleA: '63°', angleB: '41°', note: 'Funknetz' })
    },
    {
        id: 'task-14',
        title: 'Schrägaufzug in der Skihalle',
        scenario: 'Der Aufzug folgt einer Schiene mit 12° Steigung und Länge 32 m.',
        question: 'Wie hoch liegt die Bergstation über dem Einstieg?',
        givens: ['Schienenlänge = 32 m', 'Winkel = 12°'],
        hint: '32 · sin(12°) liefert die Höhendifferenz.',
        concepts: ['Rechtwinklige Trigonometrie'],
        difficulty: 'leicht',
        sketch: createRightTriangleSketch({ base: 'Basis', height: 'Δh = ?', hyp: '32 m', angle: '12°', note: 'Schrägaufzug' })
    },
    {
        id: 'task-15',
        title: 'Bewässerungsdreieck im Obstgarten',
        scenario: 'Zwei Sprinklerarme bilden ein Dreieck mit dem Weg zwischen den Endpunkten.',
        question: 'Wie groß ist der bewässerte Flächeninhalt?',
        givens: ['Arm a = 52 m', 'Arm b = 47 m', 'eingeschlossener Winkel γ = 58°'],
        hint: 'Nutze den Flächensatz A = 0,5 · a · b · sin(γ).',
        concepts: ['Flächensatz'],
        difficulty: 'mittel',
        sketch: createObliqueTriangleSketch({ sideAB: '52 m', sideAC: '47 m', sideBC: 'c', angleC: '58°', note: 'Bewässerung' })
    },
    {
        id: 'task-16',
        title: 'Kabelweg im Solarpark',
        scenario: 'Die Wartungspfade A–B und A–C treffen sich im Winkel von 51°.',
        question: 'Welche Kabellänge B–C wird benötigt?',
        givens: ['AB = 36 m', 'AC = 44 m', 'Winkel α = 51°'],
        hint: 'Über den Kosinussatz erhältst du BC, danach kannst du weitere Winkel mit dem Sinussatz prüfen.',
        concepts: ['Kosinussatz', 'Sinussatz'],
        difficulty: 'mittel',
        sketch: createObliqueTriangleSketch({ sideAB: '36 m', sideAC: '44 m', sideBC: 'BC = ?', angleA: '51°', note: 'Solarpark' })
    },
    {
        id: 'task-17',
        title: 'Bogenfeld einer Fußgängerbrücke',
        scenario: 'Zwei Stahlbögen treffen sich im Scheitel und schließen 124° ein.',
        question: 'Wie breit ist der Fluss, wenn die Bögen 18 m und 22 m lang sind?',
        givens: ['AC = 18 m', 'BC = 22 m', 'Winkel γ = 124°'],
        hint: 'Kosinussatz für die Spannweite AB einsetzen.',
        concepts: ['Kosinussatz'],
        difficulty: 'anspruchsvoll',
        sketch: createObliqueTriangleSketch({ sideAB: 'AB = ?', sideAC: '18 m', sideBC: '22 m', angleC: '124°', note: 'Brückenbogen' })
    },
    {
        id: 'task-18',
        title: 'Zeltbahn für eine Kletterexpedition',
        scenario: 'Die Plane soll ein Dreieck mit zwei bekannten Seiten bilden.',
        question: 'Welche Fläche deckt die Plane ab?',
        givens: ['Seite a = 5,2 m', 'Seite b = 4,1 m', 'eingeschlossener Winkel γ = 38°'],
        hint: 'Flächensatz anwenden; bei Bedarf liefert der Sinussatz weitere Winkel für die Verstärkungen.',
        concepts: ['Flächensatz', 'Sinussatz'],
        difficulty: 'leicht',
        sketch: createObliqueTriangleSketch({ sideAB: '5,2 m', sideAC: '4,1 m', sideBC: 'c', angleC: '38°', note: 'Zeltbahn' })
    },
    {
        id: 'task-19',
        title: 'Dachbegrünung eines Atriums',
        scenario: 'Das Glasdach bildet ein spitzwinkliges Dreieck.',
        question: 'Berechne die Fläche, die begrünt werden kann.',
        givens: ['Seite a = 24 m', 'Seite b = 31 m', 'eingeschlossener Winkel γ = 74°'],
        hint: 'A = 0,5 · a · b · sin(γ) liefert sofort den Flächeninhalt.',
        concepts: ['Flächensatz'],
        difficulty: 'mittel',
        sketch: createObliqueTriangleSketch({ sideAB: '24 m', sideAC: '31 m', sideBC: 'c', angleC: '74°', note: 'Atriumdach' })
    },
    {
        id: 'task-20',
        title: 'Segment einer Hängebrücke',
        scenario: 'Die Ankerpunkte A und B sind 46 m auseinander, der Tragseilabschnitt AC misst 52 m.',
        question: 'Bestimme den Winkel γ im Tragseil und die Distanz C–B.',
        givens: ['AB = 46 m', 'AC = 52 m', 'Winkel α = 39°'],
        hint: 'Nutze zuerst den Sinussatz für γ und anschließend den Kosinussatz für BC.',
        concepts: ['Sinussatz', 'Kosinussatz'],
        difficulty: 'anspruchsvoll',
        sketch: createObliqueTriangleSketch({ sideAB: '46 m', sideAC: '52 m', sideBC: 'BC = ?', angleA: '39°', angleC: 'γ = ?', note: 'Brückensegment' })
    }
];

const conceptFilters: Array<'Alle' | ConceptTag> = ['Alle', 'Sinussatz', 'Kosinussatz', 'Rechtwinklige Trigonometrie', 'Flächensatz'];

const difficultyStyles: Record<Difficulty, string> = {
    leicht: 'bg-emerald-50 text-emerald-700',
    mittel: 'bg-amber-50 text-amber-700',
    anspruchsvoll: 'bg-rose-50 text-rose-700'
};

const GemischteAufgaben: React.FC = () => {
    const [conceptFilter, setConceptFilter] = useState<'Alle' | ConceptTag>('Alle');
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const filteredTasks = useMemo(() => {
        if (conceptFilter === 'Alle') {
            return appliedTasks;
        }
        return appliedTasks.filter(task => task.concepts.includes(conceptFilter));
    }, [conceptFilter]);

    const highlightRandomTask = () => {
        if (!filteredTasks.length) return;
        const pick = filteredTasks[Math.floor(Math.random() * filteredTasks.length)];
        setHighlightedId(pick.id);
        const element = document.getElementById(pick.id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Link to="/trigonometrie" className="text-teal-600 hover:text-teal-700 font-bold mb-4 inline-block">
                ← Zurück zur Übersicht
            </Link>

            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-teal-800">Gemischte Anwendungsaufgaben</h1>
                    <p className="text-gray-700">
                        Zwanzig praxisnahe Dreiecksaufgaben verbinden Sinus- und Kosinussatz, rechtwinklige Trigonometrie sowie den
                        Flächensatz. Jede Karte verrät dir das Szenario, die gegebenen Größen, eine Leitfrage, einen Hinweis und eine
                        Skizze. Perfekt, um Anwendungen quer durch die Trigonometrie zu trainieren.
                    </p>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="concept-filter">
                            Konzeptfilter
                        </label>
                        <select
                            id="concept-filter"
                            value={conceptFilter}
                            onChange={event => setConceptFilter(event.target.value as 'Alle' | ConceptTag)}
                            className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-64"
                        >
                            {conceptFilters.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={highlightRandomTask}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
                        >
                            Zufallsaufgabe markieren
                        </button>
                        <p className="text-sm text-gray-600">
                            Angezeigt: {filteredTasks.length} von {appliedTasks.length} Aufgaben
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {filteredTasks.map((task, index) => {
                        const isHighlighted = task.id === highlightedId;
                        return (
                            <article
                                key={task.id}
                                id={task.id}
                                className={`border rounded-2xl p-5 transition-shadow ${
                                    isHighlighted ? 'border-teal-400 shadow-xl' : 'border-gray-200 shadow-sm'
                                }`}
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm uppercase tracking-wide text-teal-600 font-semibold">Aufgabe {index + 1}</p>
                                        <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyStyles[task.difficulty]}`}>
                                        {task.difficulty}
                                    </span>
                                </div>

                                <p className="text-gray-700 mt-3">{task.scenario}</p>
                                <p className="mt-2 font-semibold text-gray-900">Frage: {task.question}</p>

                                <div className="mt-3 text-sm text-gray-600 space-y-1">
                                    <p className="font-semibold text-gray-800">Gegeben:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {task.givens.map(item => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <p className="mt-3 text-sm text-gray-600">
                                    <span className="font-semibold text-gray-800">Konzepte:</span> {task.concepts.join(', ')}
                                </p>

                                <details className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <summary className="cursor-pointer font-semibold text-gray-800">Skizze & Hinweis anzeigen</summary>
                                    <div className="mt-3 flex flex-col gap-3">
                                        <div
                                            className="w-full max-w-sm"
                                            dangerouslySetInnerHTML={{ __html: task.sketch }}
                                        />
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold text-gray-800">Hinweis:</span> {task.hint}
                                        </p>
                                    </div>
                                </details>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GemischteAufgaben;
