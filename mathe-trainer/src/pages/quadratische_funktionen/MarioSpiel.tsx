import React, { useEffect, useRef, useState } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { SignToggle, eingabeKlasse, type Vorzeichen } from './quadratischShared';

// Bonus-Aufgabe: Münzen liegen auf einer nach unten geöffneten Parabel. Mario läuft auf der x-Achse
// von links nach rechts und springt auf der Parabel, die der Schüler in Scheitelform eingibt.
// Mario folgt y = max(0, f(x)): Wo die Parabel über dem Boden liegt, ist er in der Luft.

type Level = { a: number; xs: number; ys: number; muenzen: { x: number; y: number }[] };
type Eingabe = { a: string; xsSign: Vorzeichen; xsAbs: string; ysSign: Vorzeichen; ysAbs: string };
type Parabel = { a: number; xs: number; ys: number };
type Phase = 'bereit' | 'laeuft' | 'fertig';

// Spielfeld in Koordinaten: x von −8 bis 8, y von 0 (Boden) bis 9
const X_MIN = -8.5;
const X_MAX = 8.5;
const U = 40; // Pixel pro Einheit
const W = (X_MAX - X_MIN) * U;
const BODEN = 360;
const H = 420;
const START = -8.1; // Marios Start- und Zielpunkt
const ZIEL = 8.1;
const TEMPO = 3.2; // Einheiten pro Sekunde
const TREFFER = 0.25; // so nah müssen Marios Füße an der Münze sein

const px = (x: number) => (x - X_MIN) * U;
const py = (y: number) => BODEN - y * U;

const zahl = (n: number) => String(n).replace('.', ',');
const zufall = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const parseZahl = (raw: string) => {
    const s = raw.trim().replace(/[−–—‐]/g, '-').replace(/,/g, '.');
    if (s === '' || s === '-') return NaN;
    if (s.includes('/')) {
        const [z, n] = s.split('/').map(Number);
        return n ? z / n : NaN;
    }
    return Number(s);
};

const erzeugeLevel = (vorher?: Level): Level => {
    for (;;) {
        const a = [-0.25, -0.5, -1, -2][zufall(0, 3)];
        const ys = zufall(2, 7);
        const halbeBreite = Math.sqrt(ys / -a);
        const xs = zufall(-4, 4);
        if (halbeBreite > 5.5 || xs - halbeBreite < -7.5 || xs + halbeBreite > 7.5) continue;
        if (vorher && vorher.a === a && vorher.xs === xs && vorher.ys === ys) continue;
        const muenzen: { x: number; y: number }[] = [];
        for (let x = Math.ceil(xs - halbeBreite); x <= xs + halbeBreite; x++) {
            const y = a * (x - xs) ** 2 + ys;
            if (y >= 0.5) muenzen.push({ x, y });
        }
        if (muenzen.length >= 3) return { a, xs, ys, muenzen };
    }
};

const leereEingabe = (): Eingabe => ({ a: '', xsSign: null, xsAbs: '', ysSign: null, ysAbs: '' });

const leseParabel = (e: Eingabe): Parabel | string => {
    if (e.a.trim() === '' || e.xsAbs.trim() === '' || e.ysAbs.trim() === '' || !e.xsSign || !e.ysSign) {
        return 'Bitte fülle alle Felder aus und wähle die Vorzeichen.';
    }
    const a = parseZahl(e.a);
    const xsBetrag = parseZahl(e.xsAbs);
    const ysBetrag = parseZahl(e.ysAbs);
    if ([a, xsBetrag, ysBetrag].some((v) => !Number.isFinite(v))) return 'Bitte gib nur Zahlen ein (z. B. -0,5).';
    // In der Klammer steht das umgekehrte Vorzeichen von xs.
    const xs = e.xsSign === '-' ? xsBetrag : -xsBetrag;
    const ys = e.ysSign === '+' ? ysBetrag : -ysBetrag;
    if (a >= 0) return 'So springt Mario nicht: Ein Sprung ist eine nach unten geöffnete Parabel – a muss negativ sein.';
    if (ys <= 0) return 'Mit diesem Scheitelpunkt hebt Mario nicht ab – der höchste Punkt muss über dem Boden liegen.';
    return { a, xs, ys };
};

const vorschauLatex = (e: Eingabe) => {
    const sauber = (raw: string) => raw.trim().replace(',', '{,}').replace(/[−–—‐]/g, '-');
    const a = e.a.trim() !== '' ? sauber(e.a) : 'a';
    const xs = e.xsAbs.trim() !== '' ? sauber(e.xsAbs) : 'x_s';
    const ys = e.ysAbs.trim() !== '' ? sauber(e.ysAbs) : 'y_s';
    return `y = ${a}\\left(x ${e.xsSign ?? '\\pm'} ${xs}\\right)^2 ${e.ysSign ?? '\\pm'} ${ys}`;
};

const scheitelformLatex = ({ a, xs, ys }: Parabel) => {
    const faktor = a === -1 ? '-' : zahl(a).replace(',', '{,}');
    const klammer = xs === 0 ? 'x^2' : `(x ${xs > 0 ? '-' : '+'} ${Math.abs(xs)})^2`;
    return `y = ${faktor}${klammer} + ${ys}`;
};

// ---------- Zeichnen ----------

// Mario als Pixelgrafik (12 × 16), Blick nach rechts
const FARBEN: Record<string, string> = { R: '#d82800', B: '#6b3a10', S: '#fca044', O: '#2038ec', Y: '#fce000' };
const MARIO_KOERPER = [
    '...RRRRR....',
    '..RRRRRRRRR.',
    '..BBBSSBS...',
    '.BSBSSSBSSS.',
    '.BSBBSSSBSSS',
    '.BBSSSSBBBB.',
    '...SSSSSSS..',
    '..RRORRR....',
    '.RRRORRORRR.',
    'RRRROOOORRRR',
    'SSROYOOYORSS',
    'SSSOOOOOOSSS',
    'SSOOOOOOOOSS',
];
const BEINE = [
    ['..OOO..OOO..', '.BBB....BBB.', 'BBBB....BBBB'],
    ['...OOOOOO...', '...BBB.BBB..', '..BBBB.BBBB.'],
];
const SPRUNG_BEINE = ['.OOO....OOO.', 'BBB......BBB', 'BB........BB'];

const zeichneMario = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, springt: boolean) => {
    const p = 3; // Pixelgröße
    const zeilen = [...MARIO_KOERPER, ...(springt ? SPRUNG_BEINE : BEINE[frame])];
    const links = px(x) - 6 * p;
    const oben = py(y) - zeilen.length * p;
    zeilen.forEach((zeile, r) => {
        [...zeile].forEach((c, s) => {
            if (c === '.') return;
            ctx.fillStyle = FARBEN[c];
            ctx.fillRect(links + s * p, oben + r * p, p, p);
        });
    });
};

const zeichneMuenze = (ctx: CanvasRenderingContext2D, x: number, y: number, t: number) => {
    const breite = 9 * Math.abs(Math.cos(t * 3 + x));
    const cx = px(x);
    const cy = py(y);
    ctx.fillStyle = '#c87800';
    ctx.beginPath();
    ctx.ellipse(cx, cy, breite + 2, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fcbc3c';
    ctx.beginPath();
    ctx.ellipse(cx, cy, breite, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    if (breite > 3) {
        ctx.fillStyle = '#fce8a0';
        ctx.fillRect(cx - 1.5, cy - 6, 3, 12);
    }
};

const zeichneWolke = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 10, 20, 0, Math.PI * 2);
    ctx.arc(x + 42, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x, y - 2, 42, 18);
};

const zeichneHuegel = (ctx: CanvasRenderingContext2D, x: number, r: number) => {
    ctx.fillStyle = '#00a800';
    ctx.beginPath();
    ctx.arc(x, BODEN, r, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#005800';
    ctx.fillRect(x - r * 0.35, BODEN - r * 0.6, 4, 10);
    ctx.fillRect(x + r * 0.25, BODEN - r * 0.6, 4, 10);
};

const zeichneSzene = (
    ctx: CanvasRenderingContext2D,
    level: Level,
    eingesammelt: boolean[],
    spur: { x: number; y: number }[],
    mario: { x: number; y: number; frame: number },
    t: number,
    plopps: { x: number; y: number; start: number }[],
) => {
    // Himmel, Hintergrund
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, W, H);
    zeichneWolke(ctx, 190, 40);
    zeichneWolke(ctx, 470, 62);
    zeichneHuegel(ctx, 110, 70);
    zeichneHuegel(ctx, 540, 50);

    // Koordinatengitter
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    for (let x = -8; x <= 8; x++) {
        ctx.beginPath();
        ctx.moveTo(px(x), py(0));
        ctx.lineTo(px(x), py(9));
        ctx.stroke();
    }
    for (let y = 1; y <= 9; y++) {
        ctx.beginPath();
        ctx.moveTo(px(-8), py(y));
        ctx.lineTo(px(8), py(y));
        ctx.stroke();
    }
    // y-Achse
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px(0), py(0));
    ctx.lineTo(px(0), py(9) - 4);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px(0), py(9) - 12);
    ctx.lineTo(px(0) - 5, py(9) - 2);
    ctx.lineTo(px(0) + 5, py(9) - 2);
    ctx.fill();
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    const beschrifte = (text: string, x: number, y: number) => {
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    };
    for (let y = 1; y <= 8; y++) beschrifte(String(y), px(0) - 5, py(y));
    ctx.textAlign = 'left';
    beschrifte('y', px(0) + 8, py(9) + 2);

    // Boden aus Steinen (= x-Achse)
    for (let i = 0; i * 20 < W; i++) {
        for (let r = 0; r < 3; r++) {
            const x0 = i * 20 + (r % 2 ? 10 : 0) - 10;
            ctx.fillStyle = '#c84c0c';
            ctx.fillRect(x0, BODEN + r * 20, 20, 20);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(x0 + 0.5, BODEN + r * 20 + 0.5, 19, 19);
            ctx.fillStyle = '#fcbcb0';
            ctx.fillRect(x0 + 1, BODEN + r * 20 + 1, 18, 2);
        }
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = -8; x <= 8; x++) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(px(x) - 1, BODEN - 4, 2, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(String(x), px(x), BODEN + 8);
    }
    ctx.textAlign = 'right';
    ctx.fillText('x', W - 4, BODEN + 30);

    // Marios bisheriger Weg
    if (spur.length > 1) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        spur.forEach((p, i) => (i ? ctx.lineTo(px(p.x), py(p.y)) : ctx.moveTo(px(p.x), py(p.y))));
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Münzen
    level.muenzen.forEach((m, i) => {
        if (eingesammelt[i]) return;
        zeichneMuenze(ctx, m.x, m.y, t);
    });
    // "+1" über eingesammelten Münzen
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    plopps.forEach((p) => {
        const alter = t - p.start;
        if (alter > 0.8) return;
        ctx.fillStyle = `rgba(255,255,255,${1 - alter / 0.8})`;
        ctx.fillText('+1', px(p.x), py(p.y) - 20 - alter * 40);
    });

    zeichneMario(ctx, mario.x, mario.y, mario.frame, mario.y > 0.01);

    // Anzeige oben links
    const anzahl = eingesammelt.filter(Boolean).length;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(8, 8, 150, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`MÜNZEN ${anzahl}/${level.muenzen.length}`, 16, 22);
};

// ---------- Komponente ----------

const MarioSpiel = ({ onGeloest }: { onGeloest?: (geloest: boolean) => void }) => {
    const [level, setLevel] = useState<Level>(() => erzeugeLevel());
    const [eingabe, setEingabe] = useState<Eingabe>(leereEingabe());
    const [phase, setPhase] = useState<Phase>('bereit');
    const [meldung, setMeldung] = useState<string | null>(null);
    const [ergebnis, setErgebnis] = useState<{ anzahl: number; alle: boolean } | null>(null);
    const [versuche, setVersuche] = useState(0);
    const [zeigeLoesung, setZeigeLoesung] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const onGeloestRef = useRef(onGeloest);
    onGeloestRef.current = onGeloest;
    // Spielzustand für die Animation (ändert sich in jedem Frame, daher nicht als React-State)
    const spiel = useRef({
        parabel: null as Parabel | null,
        x: START,
        eingesammelt: [] as boolean[],
        spur: [] as { x: number; y: number }[],
        plopps: [] as { x: number; y: number; start: number }[],
        laeuft: false,
    });

    const hoehe = (p: Parabel | null, x: number) => (p ? Math.max(0, p.a * (x - p.xs) ** 2 + p.ys) : 0);

    const zuruecksetzen = (l: Level) => {
        spiel.current = { parabel: null, x: START, eingesammelt: l.muenzen.map(() => false), spur: [], plopps: [], laeuft: false };
    };

    useEffect(() => {
        zuruecksetzen(level);
    }, [level]);

    // Zeichen- und Animationsschleife
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        let id = 0;
        let letzte = performance.now();
        const schritt = (jetzt: number) => {
            const dt = Math.min((jetzt - letzte) / 1000, 0.05);
            letzte = jetzt;
            const t = jetzt / 1000;
            const s = spiel.current;
            if (s.laeuft) {
                const alt = s.x;
                s.x = Math.min(ZIEL, s.x + TEMPO * dt);
                s.spur.push({ x: s.x, y: hoehe(s.parabel, s.x) });
                level.muenzen.forEach((m, i) => {
                    if (s.eingesammelt[i] || !(alt < m.x && m.x <= s.x)) return;
                    if (Math.abs(hoehe(s.parabel, m.x) - m.y) < TREFFER) {
                        s.eingesammelt[i] = true;
                        s.plopps.push({ x: m.x, y: m.y, start: t });
                    }
                });
                if (s.x >= ZIEL) {
                    s.laeuft = false;
                    const anzahl = s.eingesammelt.filter(Boolean).length;
                    const alle = anzahl === level.muenzen.length;
                    setErgebnis({ anzahl, alle });
                    setPhase('fertig');
                    if (alle) onGeloestRef.current?.(true);
                }
            }
            const frame = s.laeuft ? Math.floor(t * 8) % 2 : 0;
            zeichneSzene(ctx, level, s.eingesammelt, s.spur, { x: s.x, y: hoehe(s.parabel, s.x), frame }, t, s.plopps);
            id = requestAnimationFrame(schritt);
        };
        id = requestAnimationFrame(schritt);
        return () => cancelAnimationFrame(id);
    }, [level]);

    const aendere = (teil: Partial<Eingabe>) => {
        setEingabe((e) => ({ ...e, ...teil }));
        setMeldung(null);
    };

    const start = () => {
        const p = leseParabel(eingabe);
        if (typeof p === 'string') {
            setMeldung(p);
            return;
        }
        zuruecksetzen(level);
        spiel.current.parabel = p;
        spiel.current.laeuft = true;
        setMeldung(null);
        setErgebnis(null);
        setPhase('laeuft');
        setVersuche((v) => v + 1);
    };

    const neuesLevel = () => {
        setLevel((alt) => erzeugeLevel(alt));
        setEingabe(leereEingabe());
        setPhase('bereit');
        setMeldung(null);
        setErgebnis(null);
        setVersuche(0);
        setZeigeLoesung(false);
    };

    const geloest = ergebnis?.alle ?? false;

    return (
        <div className={`border rounded-lg p-4 ${geloest ? 'border-green-300 bg-green-50/40' : 'border-gray-200'}`}>
            <p className="text-sm font-semibold text-gray-500 mb-1">Aufgabe 6 – Bonus-Level</p>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Mario sammelt Münzen</h2>
            <p className="text-sm text-gray-600 mb-3">
                Mario läuft auf der x-Achse von links nach rechts. Gib eine Funktionsgleichung in Scheitelform ein, sodass
                Mario genau im Bogen der Münzen springt und alle einsammelt. Klicke dann auf <b>Start</b>.
            </p>

            <div className="rounded-lg overflow-hidden border-4 border-gray-800">
                <canvas
                    ref={canvasRef}
                    className="block w-full h-auto"
                    style={{ aspectRatio: `${W} / ${H}`, imageRendering: 'pixelated' }}
                    role="img"
                    aria-label="Spielfeld: Münzen sind parabelförmig angeordnet, Mario läuft auf der x-Achse"
                />
            </div>

            <div className="mt-3 flex flex-nowrap items-center gap-1 bg-slate-50 py-2 px-1.5 rounded-lg border border-slate-200 font-mono text-sm overflow-x-auto">
                <span className="whitespace-nowrap shrink-0">y =</span>
                <input
                    type="text"
                    inputMode="decimal"
                    value={eingabe.a}
                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => aendere({ a: ev.target.value })}
                    placeholder="a"
                    aria-label="Formfaktor a"
                    className={eingabeKlasse}
                    disabled={phase === 'laeuft'}
                />
                <span className="whitespace-nowrap shrink-0">(x</span>
                <SignToggle value={eingabe.xsSign} onChange={(v) => aendere({ xsSign: v })} />
                <input
                    type="text"
                    inputMode="decimal"
                    value={eingabe.xsAbs}
                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => aendere({ xsAbs: ev.target.value })}
                    placeholder="xs"
                    aria-label="Zahl im Klammerterm"
                    className={eingabeKlasse}
                    disabled={phase === 'laeuft'}
                />
                <span className="whitespace-nowrap shrink-0">)²</span>
                <SignToggle value={eingabe.ysSign} onChange={(v) => aendere({ ysSign: v })} />
                <input
                    type="text"
                    inputMode="decimal"
                    value={eingabe.ysAbs}
                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => aendere({ ysAbs: ev.target.value })}
                    placeholder="ys"
                    aria-label="Zahl ys"
                    className={eingabeKlasse}
                    disabled={phase === 'laeuft'}
                />
            </div>
            <div className="mt-2 text-sm text-blue-900 overflow-x-auto">
                <span className="text-xs font-semibold text-blue-700 mr-2">Deine Gleichung:</span>
                <InlineMath math={vorschauLatex(eingabe)} />
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
                <button
                    onClick={start}
                    disabled={phase === 'laeuft'}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm px-5 py-1.5 rounded-md font-bold transition-colors"
                >
                    {versuche === 0 ? '▶ Start' : '▶ Nochmal starten'}
                </button>
                <button
                    onClick={neuesLevel}
                    disabled={phase === 'laeuft'}
                    className="bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 text-sm px-4 py-1.5 rounded-md font-semibold border border-slate-300 transition-colors"
                >
                    Neues Level
                </button>
                {meldung && <span className="text-sm font-semibold text-red-600">{meldung}</span>}
                {ergebnis && (
                    <span className={`text-sm font-semibold ${ergebnis.alle ? 'text-green-700' : 'text-red-600'}`}>
                        {ergebnis.alle
                            ? `🎉 Alle ${level.muenzen.length} Münzen eingesammelt – super!`
                            : `${ergebnis.anzahl} von ${level.muenzen.length} Münzen. Versuch es nochmal!`}
                    </span>
                )}
            </div>

            {ergebnis && !ergebnis.alle && (
                <div className="mt-3 text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-md p-3 space-y-1">
                    <p>
                        <b>Tipp:</b> Die höchste Münze ist der Scheitelpunkt S(x<sub>s</sub> | y<sub>s</sub>). Für a gehst du
                        vom Scheitel aus nach rechts: Bei 1 Schritt sinkt die Münze um |a|, bei 2 Schritten um 4·|a|.
                    </p>
                    <button onClick={() => setZeigeLoesung((v) => !v)} className="text-blue-600 hover:underline">
                        {zeigeLoesung ? 'Lösung ausblenden' : 'Lösung anzeigen'}
                    </button>
                    {zeigeLoesung && (
                        <p>
                            Scheitelpunkt S({zahl(level.xs)} | {zahl(level.ys)}), a = {zahl(level.a)}:{' '}
                            <b>
                                <InlineMath math={scheitelformLatex(level)} />
                            </b>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarioSpiel;
