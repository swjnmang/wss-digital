// Anwendungsaufgaben auf Prüfungsniveau (angelehnt an die Abschlussprüfungen 2011–2025,
// Texte umformuliert, eigene Namen und Skizzen).

import type { Gen } from '../engine/types';
import { PI, q, round, tx } from '../engine/util';
import Scene, { C, ell, type El, type P } from '../figures/Scene';
import { ob, polyhedron, type V3 } from '../figures/shapes';
import { coneDown, coneUp, cyl, dim, hemiDown, hemiUp, lbl } from '../figures/bodies';
import { choice, num, res } from './helpers';

export type ExamTag = 'kugel' | 'zylinder' | 'kegel' | 'pyramide' | 'prisma' | 'strahlensaetze' | 'pythagoras' | 'flaeche';

interface Exam {
  tags: ExamTag[];
  gen: Gen;
}

const BADGE = 'Prüfungsniveau';
const sq = (x: number) => x * x;

function pyramidEls(a: number, h: number, o: V3 = [0, 0, 0], down = false, fill = C.fill): El[] {
  const [x, y, z] = o;
  const base = down ? y + h : y;
  const tip = down ? y : y + h;
  const V: V3[] = [[x, base, z], [x + a, base, z], [x + a, base, z + a], [x, base, z + a], [x + a / 2, tip, z + a / 2]];
  const F = [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]];
  return polyhedron(V, F, [down ? C.fill2 : undefined, fill, C.fill2, C.fill2, C.fill2]);
}

// ---------------------------------------------------------------------------
// 1) Schultüten (Kegel und Pyramide)
// ---------------------------------------------------------------------------
const schultueten: Gen = () => {
  const d = 18;
  const h = 65;
  const r = 9;
  const V1 = (sq(r) * PI * h) / 3;
  const a = Math.sqrt((3 * V1) / h);
  const s = Math.hypot(h, r);
  const M1 = r * round(s, 2) * PI;
  const hs = Math.hypot(h, round(a, 2) / 2);
  const M2 = 4 * ((round(hs, 2) * round(a, 2)) / 2);
  const A5 = d * PI * 15;
  const r2 = (r * 78) / 65;
  const V2 = (sq(r2) * PI * 78) / 3;
  const els: El[] = [
    ...coneDown(0, h, r, h),
    dim([-r, h], [r, h], 'd = 18 cm', 1, 14),
    dim([-r, 0], [-r, h], 'h = 65 cm', 1, 12),
    ...pyramidEls(16, h, [26, 0, -2], true),
    lbl(ob([34, h, -2]), 'a', 0, -12),
  ];
  return {
    title: 'Schultüten für die ersten Klassen',
    badge: BADGE,
    text: 'Der Elternbeirat einer Grundschule bastelt Schultüten aus Karton – in zwei Formen: als Kegel und als gerade, quadratische Pyramide (Skizze nicht maßstabsgetreu). Die Kegel-Tüte hat oben einen Durchmesser von $18\\,\\text{cm}$, beide Tüten sind $65\\,\\text{cm}$ hoch.',
    figure: <Scene els={els} maxH={190} />,
    parts: [
      num('$V_1$', V1 / 1000, 'l', { strict: true, q: 'a) Berechne das Volumen $V_1$ der Kegel-Tüte in Liter.' }),
      num('$a$', a, 'cm', { q: 'b) Die Pyramiden-Tüte soll genauso hoch sein und genauso viel fassen. Berechne die Kantenlänge $a$ der Öffnung.' }),
      num('$M_1$', M1, 'cm²', { q: 'c) Berechne die Mantelfläche $M_1$ der Kegel-Tüte.' }),
      num('$M_2$', M2, 'cm²', { q: 'd) Berechne die Mantelfläche $M_2$ der Pyramiden-Tüte.', tol: M2 * 0.01 }),
      num('Papier', A5, 'cm²', { q: 'e) Oben an die Kegel-Tüte wird ringsum ein $15\\,\\text{cm}$ hoher Streifen Krepppapier geklebt. Wie groß ist der Streifen?' }),
      num('Zunahme', ((V2 - V1) / V1) * 100, '%', { q: 'f) Eine Riesen-Tüte hat dieselbe Form, ist aber $13\\,\\text{cm}$ länger. Um wie viel Prozent ist ihr Volumen größer?', tol: 0.3 }),
    ],
    solution: [
      `a) $V_1 = \\frac{1}{3} \\cdot 9^2 \\cdot \\pi \\cdot 65 ${res(V1, 'cm³')} ${res(V1 / 1000, 'l')}$`,
      `b) $${tx(V1)} = \\frac{1}{3} \\cdot a^2 \\cdot 65 \\;\\Rightarrow\\; a = \\sqrt{\\frac{3 \\cdot ${tx(V1)}}{65}} ${res(a, 'cm')}$`,
      `c) $s = \\sqrt{65^2 + 9^2} ${res(s, 'cm')}$; $M_1 = 9 \\cdot ${tx(round(s, 2))} \\cdot \\pi ${res(M1, 'cm²')}$`,
      `d) $h_s = \\sqrt{65^2 + \\left(\\frac{${tx(round(a, 2))}}{2}\\right)^2} ${res(hs, 'cm')}$; $M_2 = 4 \\cdot \\frac{${tx(round(hs, 2))} \\cdot ${tx(round(a, 2))}}{2} ${res(M2, 'cm²')}$`,
      `e) $u = 18 \\cdot \\pi ${res(18 * PI, 'cm')}$; $A = u \\cdot 15 ${res(A5, 'cm²')}$`,
      `f) Strahlensatz: $\\frac{r_2}{9} = \\frac{78}{65} \\Rightarrow r_2 = ${q(r2, 'cm')}$; $V_2 = \\frac{1}{3} \\cdot ${tx(r2)}^2 \\cdot \\pi \\cdot 78 ${res(V2, 'cm³')}$`,
      `$p = \\frac{${tx(V2)} - ${tx(V1)}}{${tx(V1)}} \\cdot 100 ${res(((V2 - V1) / V1) * 100, '%')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 2) Silo (Zylinder + Kegel)
// ---------------------------------------------------------------------------
const silo: Gen = () => {
  const r = 1.2;
  const hK = 1.8;
  const VK = (sq(r) * PI * hK) / 3;
  const VZ = 20 - VK;
  const hZ = VZ / (sq(r) * PI);
  const sK = Math.hypot(r, hK);
  const rF = (r * 0.66) / hK;
  const VF = (sq(rF) * PI * 0.66) / 3;
  const Ain = 2 * r * PI * round(hZ, 2) + r * round(sK, 2) * PI;
  const Vband = (sq(123) - sq(121)) * PI * 5;
  const rP = Math.sqrt(5.9 / PI);
  const els: El[] = [
    ...coneDown(0, hK, r, hK, C.fill, false),
    ...cyl(0, hK, r, 3.8),
    dim([r, 0], [r, hK], 'h_K = 1,8 m', -1, 14),
    dim([r, hK], [r, hK + 3.8], 'h_Z = ?', -1, 14),
    dim([-r, hK + 3.8], [r, hK + 3.8], 'd = 2,40 m', 1, 12),
  ];
  return {
    title: 'Baustellen-Silo',
    badge: BADGE,
    text: 'Die Firma Bauprofi Lindner nutzt ein Silo für Baumaterial. Es besteht aus einem Zylinder mit einem nach unten zeigenden Kegel. Innendurchmesser von Zylinder und Kegel: $2{,}40\\,\\text{m}$, Innenhöhe des Kegels: $1{,}80\\,\\text{m}$. Oben ist das Silo offen. Runde auf zwei Nachkommastellen.',
    figure: <Scene els={els} maxH={200} />,
    parts: [
      num('$h_Z$', hZ, 'm', { q: 'a) Wie hoch muss der Zylinder sein, damit das Silo insgesamt $20.000$ Liter fasst?' }),
      num('$s_K$', sK, 'm', { q: 'b) Berechne die Länge der Mantellinie $s_K$ des Kegels.' }),
      num('Rest', VF * 1000, 'l', { q: 'c) Im Kegel liegt noch Material, $66\\,\\text{cm}$ hoch. Wie viele Liter sind das?', tol: 1.5 }),
      num('Fläche', Ain, 'm²', { q: 'd) Das leere Silo wird innen beschichtet. Wie groß ist die Fläche?' }),
      num('Band', Vband, 'cm³', { q: 'e) Das Silo hat außen einen Durchmesser von $2{,}42\\,\\text{m}$. Oben liegt ringsum ein $2\\,\\text{cm}$ dickes und $5\\,\\text{cm}$ hohes Metallband. Berechne sein Volumen.' }),
      num('Überhang', (rP - 1.21) * 100, 'cm', { q: 'f) Eine kreisrunde Plane mit $5{,}9\\,\\text{m}^2$ wird mittig auf das Silo gelegt. Wie weit hängt sie über die Außenkante?', tol: 1 }),
    ],
    solution: [
      `a) $20.000\\,\\text{l} = 20\\,\\text{m}^3$; $V_K = \\frac{1}{3} \\cdot 1{,}2^2 \\cdot \\pi \\cdot 1{,}8 ${res(VK, 'm³')}$`,
      `$V_Z = 20 - ${tx(VK)} ${res(VZ, 'm³')}$; $h_Z = \\frac{${tx(VZ)}}{1{,}2^2 \\cdot \\pi} ${res(hZ, 'm')}$`,
      `b) $s_K = \\sqrt{1{,}8^2 + 1{,}2^2} ${res(sK, 'm')}$`,
      `c) Strahlensatz: $\\frac{r_F}{1{,}2} = \\frac{0{,}66}{1{,}8} \\Rightarrow r_F = ${q(rF, 'm')}$; $V = \\frac{1}{3} \\cdot ${tx(rF)}^2 \\cdot \\pi \\cdot 0{,}66 ${res(VF, 'm³', 4)} ${res(VF * 1000, 'l')}$`,
      `d) $A = M_Z + M_K = 2 \\cdot 1{,}2 \\cdot \\pi \\cdot ${tx(round(hZ, 2))} + 1{,}2 \\cdot ${tx(round(sK, 2))} \\cdot \\pi ${res(Ain, 'm²')}$`,
      `e) $r_1 = 121\\,\\text{cm}$, $r_2 = 123\\,\\text{cm}$; $V = (123^2 - 121^2) \\cdot \\pi \\cdot 5 ${res(Vband, 'cm³')}$`,
      `f) $r_P = \\sqrt{\\frac{5{,}9}{\\pi}} ${res(rP, 'm')}$; Überhang: $${tx(round(rP, 2))} - 1{,}21 = ${q(round(rP, 2) - 1.21, 'm')} = ${q((round(rP, 2) - 1.21) * 100, 'cm')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 3) Abfallbehälter (Quader + Pyramidendeckel)
// ---------------------------------------------------------------------------
const abfall: Gen = () => {
  const Vin = 0.7 * 0.7 * 0.85;
  const Vbeton = 0.8 * 0.8 * 0.9 - Vin;
  const hs = Math.hypot(0.4, 0.4);
  const Md = 4 * 0.5 * 0.8 * round(hs, 3);
  const qu: V3[] = [[0, 0, 0], [80, 0, 0], [80, 0, 80], [0, 0, 80], [0, 90, 0], [80, 90, 0], [80, 90, 80], [0, 90, 80]];
  const els: El[] = [
    ...polyhedron(qu, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], [undefined, C.fill2, '#cbd5e1', '#e2e8f0']),
    ...pyramidEls(80, 40, [0, 90, 0], false, '#94a3b8'),
    dim(ob([80, 0, 0]), ob([80, 90, 0]), 'h = 90 cm', -1, 12),
    dim(ob([0, 0, 0]), ob([80, 0, 0]), 'b = 80 cm', -1, 12),
    lbl(ob([40, 110, 40]), '40 cm', 30, 0, undefined, 'start'),
  ];
  return {
    title: 'Neue Abfallbehälter am Marktplatz',
    badge: BADGE,
    text: 'Für den Marktplatz werden Abfallbehälter aus Beton gebaut: ein Quader mit quadratischer Grundfläche (außen $80\\,\\text{cm}$ breit, $90\\,\\text{cm}$ hoch). Wände und Boden sind je $5\\,\\text{cm}$ dick. Oben sitzt ein pyramidenförmiger Deckel aus Blech ($40\\,\\text{cm}$ hoch).',
    figure: <Scene els={els} maxH={190} />,
    parts: [
      num('Inhalt', Vin, 'm³', { q: 'a) Wie viel passt in einen Behälter (bis zur Oberkante des Betons)?' }),
      num('Kosten', 50 * Vbeton * 120, '€', { q: 'b) Was kostet der Beton für 50 Behälter, wenn $1\\,\\text{m}^3$ Beton $120\\,€$ kostet?', tol: 4 }),
      num('Deckel', Md * 12.5, '€', { q: 'c) Was kostet das Blech für einen Deckel ($12{,}50\\,€$ pro $\\text{m}^2$, Öffnungen nicht abziehen)?', tol: 0.1 }),
    ],
    solution: [
      `a) innen: $b' = 80 - 2 \\cdot 5 = 70\\,\\text{cm}$, $h' = 90 - 5 = 85\\,\\text{cm}$; $V = 0{,}7^2 \\cdot 0{,}85 ${res(Vin, 'm³', 4)}$`,
      `b) $V_{Beton} = 0{,}8^2 \\cdot 0{,}9 - ${tx(Vin, 4)} ${res(Vbeton, 'm³', 4)}$; $50 \\cdot ${tx(Vbeton, 4)} \\cdot 120 ${res(50 * Vbeton * 120, '€')}$`,
      `c) $h_s = \\sqrt{40^2 + 40^2} ${res(hs * 100, 'cm')}$; $M = 4 \\cdot \\frac{0{,}8 \\cdot ${tx(hs, 3)}}{2} ${res(Md, 'm²', 4)}$; $\\cdot 12{,}50\\,€ ${res(Md * 12.5, '€')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 4) Holzschale (Halbkugel)
// ---------------------------------------------------------------------------
const holzschale: Gen = () => {
  const ra = Math.sqrt(1413.72 / (2 * PI));
  const ri = Math.sqrt(1061.86 / (2 * PI));
  const Vi = ((4 / 3) * 13 ** 3 * PI) / 2;
  const els: El[] = [
    { t: 'poly', pts: [...ell([0, 0], 15, 15, 180, 360), ...ell([0, 0], 13, 13, 360, 180)], fill: '#d6a46b' },
    { t: 'poly', pts: ell([0, 0], 13, 13, 235, 305), fill: C.water, stroke: 'none' },
    dim([-15, 0], [15, 0], 'außen', 1, 12),
    lbl([0, -13.5], 'innen r = 13 cm', 0, -12),
  ];
  return {
    title: 'Schale aus Holz',
    badge: BADGE,
    text: 'Eine Holzschale hat die Form einer Halbkugel. Die äußere gewölbte Oberfläche beträgt $1.413{,}72\\,\\text{cm}^2$, die innere $1.061{,}86\\,\\text{cm}^2$ (Querschnitt, nicht maßstabsgetreu).',
    figure: <Scene els={els} maxH={130} />,
    parts: [
      num('Dicke', ra - ri, 'cm', { q: 'a) Wie dick ist die Holzschale?' }),
      num('Wasser', (Vi * 0.9) / 1000, 'l', { q: 'b) Die Schale ist zu $10\\,\\%$ mit Wasser gefüllt. Wie viele Liter passen noch hinein?', strict: true }),
    ],
    solution: [
      `a) gewölbte Halbkugelfläche: $A = 2 \\cdot r^2 \\cdot \\pi \\Rightarrow r = \\sqrt{\\frac{A}{2 \\cdot \\pi}}$`,
      `$r_{außen} = \\sqrt{\\frac{1.413{,}72}{2\\pi}} ${res(ra, 'cm')}$, $r_{innen} = \\sqrt{\\frac{1.061{,}86}{2\\pi}} ${res(ri, 'cm')}$ → Dicke $${q(ra - ri, 'cm')}$`,
      `b) $V_{innen} = \\frac{1}{2} \\cdot \\frac{4}{3} \\cdot 13^3 \\cdot \\pi ${res(Vi, 'cm³')}$; noch frei: $90\\,\\%$ → $${tx(Vi * 0.9)}\\,\\text{cm}^3 ${res((Vi * 0.9) / 1000, 'l')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 5) Gläser im Restaurant
// ---------------------------------------------------------------------------
const glaeser: Gen = () => {
  const V1 = 9 * PI * (11 - 2.16);
  const VHK = ((4 / 3) * 2.5 ** 3 * PI) / 2;
  const hz = (250 - VHK) / (6.25 * PI);
  const r3 = Math.sqrt((3 * 200) / (9 * PI));
  const Mk = 5.47 * 12 * PI;
  const n = Math.floor(60000 / Mk);
  const els: El[] = [
    ...cyl(0, 0, 3, 11, C.fill, false),
    { t: 'line', pts: ell([0, 11 - 2.16], 3, 0.84, 180, 360), stroke: C.red },
    lbl([0, -1], 'Glas 1', 0, 14),
    dim([-3, 11], [3, 11], '6 cm', 1, 10),
    dim([-3, 0], [-3, 11], '11 cm', 1, 10),
    ...hemiDown(11, 2.5, 2.5),
    ...cyl(11, 2.5, 2.5, 12.5, C.fill, false),
    lbl([11, -1], 'Glas 2', 0, 14),
    dim([8.5, 15], [13.5, 15], '5 cm', 1, 10),
    dim([13.5, 2.5], [13.5, 15], '12,5 cm', -1, 10),
    ...coneDown(23, 11, 5.47, 10.1),
    lbl([23, -1], 'Glas 3', 0, 14),
  ];
  return {
    title: 'Gläser im Restaurant',
    badge: BADGE,
    text: 'Ein Restaurant verwendet drei Glasformen: Glas 1 ist ein Zylinder, Glas 2 eine Halbkugel mit aufgesetztem Zylinder, Glas 3 ein Kegel. Die Glasdicke wird vernachlässigt (Maße in cm, nicht maßstabsgetreu).',
    figure: <Scene els={els} maxH={170} />,
    parts: [
      num('$V_1$', V1, 'cm³', { q: 'a) Bei Glas 1 liegt der Eichstrich $2{,}16\\,\\text{cm}$ unter dem Rand. Berechne das Volumen bis zum Eichstrich.' }),
      num('$a_2$', 12.5 - hz, 'cm', { q: 'b) Glas 2 soll bis zum Eichstrich ebenfalls $250\\,\\text{cm}^3$ fassen. Wie weit liegt der Eichstrich unter dem oberen Rand?' }),
      num('$r_3$', r3, 'cm', { q: 'c) Füllt man $200\\,\\text{cm}^3$ in Glas 3, steht die Flüssigkeit $9\\,\\text{cm}$ hoch. Berechne den Radius der Flüssigkeitsoberfläche.' }),
      num('Gläser', n, null, { integer: true, q: 'd) Glas 3 hat oben den Radius $5{,}47\\,\\text{cm}$ und eine Mantellinie von $12\\,\\text{cm}$. Es wird außen glasiert; $1$ Liter Glasur reicht für $6\\,\\text{m}^2$. Wie viele Gläser kann man damit glasieren?' }),
    ],
    solution: [
      `a) $V_1 = 3^2 \\cdot \\pi \\cdot (11 - 2{,}16) ${res(V1, 'cm³')}$ (also $0{,}25$ Liter)`,
      `b) Halbkugel: $\\frac{1}{2} \\cdot \\frac{4}{3} \\cdot 2{,}5^3 \\cdot \\pi ${res(VHK, 'cm³')}$; Zylinder: $250 - ${tx(VHK)} = ${tx(250 - VHK)}$`,
      `$h = \\frac{${tx(250 - VHK)}}{2{,}5^2 \\cdot \\pi} ${res(hz, 'cm')}$; $a_2 = 12{,}5 - ${tx(round(hz, 2))} ${res(12.5 - hz, 'cm')}$`,
      `c) $200 = \\frac{1}{3} \\cdot r_3^2 \\cdot \\pi \\cdot 9 \\Rightarrow r_3 = \\sqrt{\\frac{600}{9\\pi}} ${res(r3, 'cm')}$`,
      `d) $M = 5{,}47 \\cdot 12 \\cdot \\pi ${res(Mk, 'cm²')}$; $6\\,\\text{m}^2 = 60.000\\,\\text{cm}^2$; $60.000 : ${tx(Mk)} \\approx ${tx(60000 / Mk)}$ → $${n}$ Gläser`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 6) Eiscafé (Kugel, Kegel, Pyramide)
// ---------------------------------------------------------------------------
const eiscafe: Gen = () => {
  const Vk = (4 / 3) * 27 * PI;
  const n = Math.floor(6000 / Vk);
  const s = Math.hypot(3.5, 12);
  const M = 3.5 * round(s, 2) * PI;
  const Vt = (1600 * 80) / 3;
  const hs = Math.hypot(80, 20);
  const Mt = 4 * ((40 * round(hs, 2)) / 2);
  const els: El[] = [
    ...coneDown(0, 12, 3.5, 12, '#fcd34d'),
    ...hemiUp(0, 12, 3.5, '#fbcfe8'),
    dim([-3.5, 12], [-3.5, 0], '12 cm', -1, 12),
    ...pyramidEls(16, 32, [12, -12, 0], true, '#fdba74'),
    lbl(ob([20, 20, 0]), '40 cm', 0, -10),
    lbl(ob([30, 4, 8]), '80 cm', 20, 0, undefined, 'start'),
  ];
  return {
    title: 'Im Eiscafé „Cono“',
    badge: BADGE,
    text: 'Im Eiscafé „Cono“ wird das Eis in Behältern mit je $6$ Litern gelagert. Die Eiswaffeln sind Kegel ($12\\,\\text{cm}$ hoch, oben $7\\,\\text{cm}$ Durchmesser). Vor dem Eingang steht ein Pflanzkübel aus Kupfer: eine auf der Spitze stehende quadratische Pyramide ($80\\,\\text{cm}$ hoch, Öffnung $40\\,\\text{cm}$ × $40\\,\\text{cm}$).',
    figure: <Scene els={els} maxH={170} />,
    parts: [
      num('Kugeln', n, null, { integer: true, q: 'a) Wie viele Eiskugeln ($d = 6\\,\\text{cm}$) erhält man aus einem vollen Behälter?' }),
      num('$M$', M, 'cm²', { q: 'b) Berechne die Mantelfläche einer Waffel.' }),
      num('Erde', Vt / 1000, 'l', { q: 'c) Wie viele Liter Erde passen in den Pflanzkübel?', strict: true }),
      num('Kupfer', Mt, 'cm²', { q: 'd) Wie groß sind die vier Seitendreiecke des Kübels zusammen?', tol: 5 }),
    ],
    solution: [
      `a) $V_{Kugel} = \\frac{4}{3} \\cdot 3^3 \\cdot \\pi ${res(Vk, 'cm³')}$; $6.000 : ${tx(Vk)} \\approx ${tx(6000 / Vk)}$ → $${n}$ Kugeln`,
      `b) $s = \\sqrt{3{,}5^2 + 12^2} ${res(s, 'cm')}$; $M = 3{,}5 \\cdot ${tx(round(s, 2))} \\cdot \\pi ${res(M, 'cm²')}$`,
      `c) $V = \\frac{1}{3} \\cdot 40^2 \\cdot 80 ${res(Vt, 'cm³')} ${res(Vt / 1000, 'l')}$ – es passen also mehr als 40 Liter hinein.`,
      `d) $h_s = \\sqrt{80^2 + 20^2} ${res(hs, 'cm')}$; $M = 4 \\cdot \\frac{40 \\cdot ${tx(round(hs, 2))}}{2} ${res(Mt, 'cm²')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 7) Holzbaustein (Quader mit Halbzylinder-Aussparung)
// ---------------------------------------------------------------------------
const baustein: Gen = () => {
  const V = 8 * 5 * 4 - 0.5 * 4 * PI * 5;
  const Aw = 0.5 * 2 * 2 * PI * 5;
  const nSt = Math.floor(80000 / Aw);
  const Vz = 4 * PI * 20;
  const Vkug = 3 * (4 / 3) * 8 * PI;
  const front: P[] = [[0, 0], [2, 0], ...ell([4, 0], 2, 2, 180, 0, 24), [8, 0], [8, 4], [0, 4]];
  const els: El[] = [
    { t: 'poly', pts: front.map((p) => ob([p[0], p[1], 0])), fill: '#e7c08d' },
    { t: 'poly', pts: [ob([0, 4, 0]), ob([8, 4, 0]), ob([8, 4, 5]), ob([0, 4, 5])], fill: '#d6a46b' },
    { t: 'poly', pts: [ob([8, 0, 0]), ob([8, 0, 5]), ob([8, 4, 5]), ob([8, 4, 0])], fill: '#c08a52' },
    dim(ob([0, 4, 0]), ob([8, 4, 0]), '8 cm', 1, 6),
    dim(ob([8, 0, 0]), ob([8, 0, 5]), '5 cm', -1, 8),
    dim(ob([0, 0, 0]), ob([0, 4, 0]), '4 cm', 1, 10),
    lbl(ob([1, 0, 0]), '2 cm', 0, 12),
  ];
  return {
    title: 'Holzbausteine',
    badge: BADGE,
    text: 'Ein Holzbaustein aus der Spielkiste der kleinen Emma ist ein Quader ($8\\,\\text{cm}$ × $5\\,\\text{cm}$ × $4\\,\\text{cm}$), aus dem mittig ein halber Zylinder ($d = 4\\,\\text{cm}$) herausgebohrt wurde. Links und rechts bleiben je $2\\,\\text{cm}$ stehen.',
    figure: <Scene els={els} maxH={150} />,
    parts: [
      num('$V$', V, 'cm³', { q: 'a) Berechne das Volumen des Bausteins.' }),
      num('Steine', nSt, null, { integer: true, q: 'b) Nur die gewölbte Fläche wird schwarz lackiert. $1$ Liter Farbe reicht für $8\\,\\text{m}^2$. Wie viele Steine kann man damit lackieren?' }),
      num('Anteil', (Vkug / Vz) * 100, '%', { q: 'c) Emma stapelt 8 Bausteine so, dass ein senkrechter Hohlzylinder ($d = 4\\,\\text{cm}$, $h = 20\\,\\text{cm}$) entsteht, und legt 3 Kugeln mit $d = 4\\,\\text{cm}$ hinein. Wie viel Prozent des Hohlzylinders füllen sie aus?', tol: 0.2 }),
      num('$h$', 6, 'cm', { q: 'd) Eine Holzpyramide mit quadratischer Grundfläche ($a = 8\\,\\text{cm}$) hat das Volumen $128\\,\\text{cm}^3$. Wie hoch ist sie?' }),
    ],
    solution: [
      `a) $V = 8 \\cdot 5 \\cdot 4 - \\frac{1}{2} \\cdot 2^2 \\cdot \\pi \\cdot 5 ${res(V, 'cm³')}$`,
      `b) gewölbte Fläche (halber Mantel): $\\frac{1}{2} \\cdot 2 \\cdot 2 \\cdot \\pi \\cdot 5 ${res(Aw, 'cm²')}$; $8\\,\\text{m}^2 = 80.000\\,\\text{cm}^2$; $80.000 : ${tx(Aw)} \\approx ${tx(80000 / Aw)}$ → $${nSt}$ Steine`,
      `c) $V_Z = 2^2 \\cdot \\pi \\cdot 20 ${res(Vz, 'cm³')}$; $3 \\cdot \\frac{4}{3} \\cdot 2^3 \\cdot \\pi ${res(Vkug, 'cm³')}$; Anteil: $${tx(Vkug)} : ${tx(Vz)} \\cdot 100 ${res((Vkug / Vz) * 100, '%')}$`,
      `d) $128 = \\frac{1}{3} \\cdot 8^2 \\cdot h \\Rightarrow h = \\frac{3 \\cdot 128}{64} = 6\\,\\text{cm}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 8) Pool im Garten mit Pavillon
// ---------------------------------------------------------------------------
const gartenpool: Gen = () => {
  const A1 = 9 - sq(1.1) * PI;
  const M = 2.2 * PI * 0.8;
  const At = 0.25 * (sq(1.45) - sq(1.1)) * PI;
  const Vw = 0.9 * 1 * PI * 0.8 * 1000;
  const z = (3 * 1.1) / 2.22;
  const hz = Math.sqrt(sq(1.1) - sq(round(z, 2) / 2));
  const Mf = 4 * ((round(z, 2) * round(hz, 2)) / 2);
  const els: El[] = [
    { t: 'poly', pts: [ob([0, 0, 0]), ob([3, 0, 0]), ob([3, 0, 3]), ob([0, 0, 3])], fill: '#e2e8f0' },
    ...cyl(ob([1.5, 0, 1.5])[0], ob([1.5, 0, 1.5])[1], 1.1, 0.8, '#a8a29e'),
    dim(ob([0, 0, 0]), ob([3, 0, 0]), 'a = 3 m', -1, 10),
    lbl([ob([1.5, 0, 1.5])[0], ob([1.5, 0, 1.5])[1] + 0.8], 'd = 2,2 m', 0, -16),
    lbl([ob([1.5, 0, 1.5])[0] + 1.1, ob([1.5, 0, 1.5])[1] + 0.4], '80 cm', 8, 0, undefined, 'start'),
  ];
  return {
    title: 'Pool im Garten',
    badge: BADGE,
    text: 'Jonas baut in seinem Garten einen zylinderförmigen Pool (Außendurchmesser $2{,}2\\,\\text{m}$, Höhe $80\\,\\text{cm}$) auf eine quadratische, gepflasterte Fläche mit $a = 3\\,\\text{m}$.',
    figure: <Scene els={els} maxH={150} />,
    parts: [
      num('Fläche', A1, 'm²', { q: 'a) Wie viel der gepflasterten Fläche bleibt frei?' }),
      num('Holz', M, 'm²', { q: 'b) Die Außenwand wird mit Holz verkleidet. Wie groß ist diese Fläche?' }),
      num('Kosten', At * 59, '€', { q: 'c) Am Pool wird eine Stufe gemauert: ein Viertel eines Kreisrings, der $35\\,\\text{cm}$ über den Pool hinausragt. Die Trittfläche wird mit Platten belegt ($59\\,€$ pro $\\text{m}^2$). Was kosten die Platten?', tol: 0.4 }),
      num('Wasser', Vw, 'l', { q: 'd) Die Wand des Pools ist $10\\,\\text{cm}$ dick. Wie viele Liter Wasser sind im Pool, wenn er zu $90\\,\\%$ gefüllt ist?', tol: 3 }),
      num('$z$', z, 'm', { q: 'e) Über dem Pool steht ein Pavillon mit Pyramidendach ($a = 3\\,\\text{m}$). Die Dachstangen von der Spitze zu den Ecken sind $2{,}22\\,\\text{m}$ lang. $1{,}10\\,\\text{m}$ unterhalb der Spitze (auf den Stangen gemessen) werden waagrechte Querstreben angebracht. Wie lang ist eine Querstrebe $z$?' }),
      num('Folie', Mf, 'm²', { q: 'f) Der obere Teil des Daches (oberhalb der Querstreben) bekommt eine durchsichtige Folie. Wie viel Folie wird benötigt?', tol: 0.03 }),
    ],
    solution: [
      `a) $A = 3^2 - 1{,}1^2 \\cdot \\pi ${res(A1, 'm²')}$`,
      `b) $M = 2{,}2 \\cdot \\pi \\cdot 0{,}8 ${res(M, 'm²')}$`,
      `c) $r_T = 1{,}1 + 0{,}35 = 1{,}45\\,\\text{m}$; $A = \\frac{1}{4} \\cdot (1{,}45^2 - 1{,}1^2) \\cdot \\pi ${res(At, 'm²')}$; $\\cdot 59\\,€ ${res(At * 59, '€')}$`,
      `d) $r_i = 1{,}1 - 0{,}1 = 1\\,\\text{m} = 10\\,\\text{dm}$; $V = 10^2 \\cdot \\pi \\cdot 8 ${res(100 * PI * 8, 'dm³')}$; davon $90\\,\\%$: $${q(Vw, 'l')}$`,
      `e) Strahlensatz: $\\frac{z}{3} = \\frac{1{,}10}{2{,}22} \\Rightarrow z ${res(z, 'm')}$`,
      `f) $h_z = \\sqrt{1{,}1^2 - \\left(\\frac{${tx(round(z, 2))}}{2}\\right)^2} ${res(hz, 'm')}$; $M = 4 \\cdot \\frac{${tx(round(z, 2))} \\cdot ${tx(round(hz, 2))}}{2} ${res(Mf, 'm²')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 9) Schwimmbecken (Stadionform) mit Sonnenschirm
// ---------------------------------------------------------------------------
const stadionbecken: Gen = () => {
  const ri = 1.8;
  const A = sq(ri) * PI + 5 * 3.6;
  const Vw = round(A, 2) * 1.4;
  const U = 2 * ri * PI + 10;
  const hs = Math.hypot(0.5, 1.5);
  const M = 4 * ((3 * round(hs, 2)) / 2);
  const s = Math.hypot(1.5, round(hs, 2));
  const outer: P[] = [...ell([5, 2], 2, 2, -90, 90), ...ell([0, 2], 2, 2, 90, 270)];
  const inner: P[] = [...ell([5, 2], 1.8, 1.8, -90, 90), ...ell([0, 2], 1.8, 1.8, 90, 270)];
  const els: El[] = [
    { t: 'poly', pts: outer, fill: '#fb923c' },
    { t: 'poly', pts: inner, fill: C.water },
    dim([0, 4], [5, 4], '5 m', 1, 12),
    dim([7, 0], [7, 4], '4 m', -1, 12),
    { t: 'line', pts: [[5, 2], [5 + 1.8 * Math.cos(0.6), 2 + 1.8 * Math.sin(0.6)]], stroke: C.blue },
    lbl([5.6, 2.2], 'r_{innen}', 0, 10),
  ];
  return {
    title: 'Schwimmbecken mit Sonnenschirm',
    badge: BADGE,
    text: 'Familie Öztürk baut ein Schwimmbecken (Draufsicht: Rechteck mit zwei Halbkreisen, außen $4\\,\\text{m}$ breit, gerade Seiten $5\\,\\text{m}$). Die senkrechten Seitenwände aus Beton sind $20\\,\\text{cm}$ dick, das Becken ist $1{,}50\\,\\text{m}$ tief.',
    figure: <Scene els={els} maxH={120} />,
    parts: [
      num('$r_{innen}$', ri, 'm', { q: 'a) Berechne den Innenradius des Beckens.' }),
      num('Boden', A, 'm²', { q: 'b) Der Boden wird gefliest. Wie groß ist die Bodenfläche?' }),
      num('Wasser', Vw, 'm³', { q: 'c) Wie viel Wasser ist im Becken bei einer Füllhöhe von $1{,}40\\,\\text{m}$?' }),
      num('Anstrich', U * 1.5, 'm²', { q: 'd) Die Innenwand wird gestrichen. Wie groß ist die Fläche?' }),
      num('Stoff', M, 'm²', { q: 'e) Ein pyramidenförmiger Sonnenschirm hat eine quadratische Grundfläche ($a = 3\\,\\text{m}$) und ist innen $0{,}50\\,\\text{m}$ hoch. Wie viel Stoff hat der Schirm?', tol: 0.05 }),
      num('Streben', 4 * s, 'm', { q: 'f) Wie lang sind die 4 Streben von den Ecken zur Spitze zusammen?', tol: 0.05 }),
    ],
    solution: [
      'a) $r_{innen} = 2\\,\\text{m} - 0{,}2\\,\\text{m} = 1{,}80\\,\\text{m}$',
      `b) Kreis: $1{,}8^2 \\cdot \\pi ${res(sq(ri) * PI, 'm²')}$; Rechteck: $5 \\cdot 3{,}6 = 18\\,\\text{m}^2$; gesamt: $A ${res(A, 'm²')}$`,
      `c) $V = ${tx(round(A, 2))} \\cdot 1{,}4 ${res(Vw, 'm³')}$`,
      `d) $u = 2 \\cdot 1{,}8 \\cdot \\pi + 2 \\cdot 5 ${res(U, 'm')}$; $A = ${tx(round(U, 2))} \\cdot 1{,}5 ${res(U * 1.5, 'm²')}$`,
      `e) $h_s = \\sqrt{0{,}5^2 + 1{,}5^2} ${res(hs, 'm')}$; $M = 4 \\cdot \\frac{3 \\cdot ${tx(round(hs, 2))}}{2} ${res(M, 'm²')}$`,
      `f) $s = \\sqrt{1{,}5^2 + ${tx(round(hs, 2))}^2} ${res(s, 'm')}$; $4 \\cdot ${tx(round(s, 2))} ${res(4 * round(s, 2), 'm')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 10) Grills und Partyzelt
// ---------------------------------------------------------------------------
const grill: Gen = () => {
  const Vh = (2 / 3) * 18 ** 3 * PI;
  const h = (3 * 19000) / (324 * PI);
  const s = Math.hypot(18, 56);
  const M = 18 * round(s, 2) * PI;
  const dd = (36 * 14) / 56;
  const hs = Math.hypot(3, 1);
  const Mz = 4 * 0.5 * 6 * hs;
  const els: El[] = [
    ...hemiDown(0, 18, 18, '#57534e'),
    lbl([0, -2], 'Halbkugelgrill', 0, 14),
    ...coneDown(50, 56, 18, 56, '#57534e'),
    dim([32, 56], [68, 56], 'd = 36 cm', 1, 12),
    dim([68, 0], [68, 56], 'h', -1, 12),
    { t: 'line', pts: [[50 - 4.5, 14], [50 + 4.5, 14]], stroke: C.red, w: 2.5 },
    lbl([50 + 4.5, 14], "d'", 10, 0, C.red, 'start'),
    lbl([50, -2], 'Kegelgrill', 0, 14),
  ];
  return {
    title: 'Grills und Partyzelt',
    badge: BADGE,
    text: 'Die Firma „Glutwerk“ verkauft einen Halbkugelgrill und einen Kegelgrill. Beide haben oben einen Durchmesser von $36\\,\\text{cm}$. Der Kegelgrill hat ein Volumen von $19$ Litern.',
    figure: <Scene els={els} maxH={150} />,
    parts: [
      choice('a) Welcher Grill hat das größere Volumen?', 'der Kegelgrill', ['der Halbkugelgrill']),
      num('$h$', h, 'cm', { q: 'b) Berechne die Höhe $h$ des Kegelgrills.', tol: 0.1 }),
      num('Lack', M / 10000, 'm²', { q: 'c) Der Kegelgrill wird außen lackiert. Wie groß ist die Fläche in $\\text{m}^2$?', strict: true }),
      num("$d'$", dd, 'cm', { q: "d) $42\\,\\text{cm}$ unter dem oberen Rand wird ein zweiter Rost eingebaut. Berechne seinen Durchmesser $d'$." }),
      num('Stoff', Mz, 'm²', { q: 'e) Das Partyzelt der Firma hat ein pyramidenförmiges Dach über einer quadratischen Fläche mit $6\\,\\text{m}$ Kantenlänge. Die Stützen sind $2{,}5\\,\\text{m}$ hoch, das ganze Zelt $3{,}5\\,\\text{m}$. Wie viel Stoff braucht das Dach?' }),
    ],
    solution: [
      `a) $V_{Halbkugel} = \\frac{1}{2} \\cdot \\frac{4}{3} \\cdot 18^3 \\cdot \\pi ${res(Vh, 'cm³')} \\approx 12{,}21\\,\\text{l} < 19\\,\\text{l}$`,
      `b) $19.000 = \\frac{1}{3} \\cdot 18^2 \\cdot \\pi \\cdot h \\Rightarrow h = \\frac{3 \\cdot 19.000}{18^2 \\cdot \\pi} ${res(h, 'cm')}$`,
      `c) $s = \\sqrt{18^2 + 56^2} ${res(s, 'cm')}$; $M = 18 \\cdot ${tx(round(s, 2))} \\cdot \\pi ${res(M, 'cm²')} ${res(M / 10000, 'm²')}$`,
      `d) Strahlensatz: $\\frac{d'}{36} = \\frac{56 - 42}{56} \\Rightarrow d' = ${q(dd, 'cm')}$`,
      `e) Dachhöhe $3{,}5 - 2{,}5 = 1\\,\\text{m}$; $h_s = \\sqrt{3^2 + 1^2} ${res(hs, 'm')}$; $M = 4 \\cdot \\frac{6 \\cdot h_s}{2} ${res(Mz, 'm²')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 11) Zeltlager (Kegelzelt und Pyramidenzelt)
// ---------------------------------------------------------------------------
const zeltlager: Gen = () => {
  const r = Math.sqrt(22.9 / PI);
  const s = Math.hypot(3.5, 2.7);
  const M = 2.7 * round(s, 2) * PI;
  const p = (round(M, 2) / 70) * 100;
  const cd = (2.7 * 1.05) / 3.5;
  const a = 5.4 / Math.SQRT2;
  const Vp = (sq(round(a, 2)) * 3.5) / 3;
  const els: El[] = [
    ...coneUp(0, 0, 2.7, 3.5, '#86efac'),
    { t: 'line', pts: [[0, 0], [0, 3.5]], dash: true, stroke: C.blue },
    lbl([0, 1.75], 'h = 3,5 m', 6, 0, undefined, 'start'),
    { t: 'line', pts: ell([0, 3.5 - 1.05], cd, cd * 0.28, 180, 360), stroke: C.red },
    lbl([cd, 2.45], 'Ring', 8, 0, C.red, 'start'),
    dim([-2.7, 0], [0, 0], 'r = ?', -1, 12),
  ];
  return {
    title: 'Im Zeltlager',
    badge: BADGE,
    text: 'Eine Jugendgruppe baut im Zeltlager ein kegelförmiges Zelt auf. Die kreisrunde Bodenfläche ist $22{,}90\\,\\text{m}^2$ groß, das Zelt ist $3{,}50\\,\\text{m}$ hoch.',
    figure: <Scene els={els} maxH={150} />,
    parts: [
      num('$r$', r, 'm', { q: 'a) Berechne den Radius der Bodenfläche.' }),
      num('$M$', M, 'm²', { q: 'b) Berechne die Fläche der Zelthülle (Mantel).', tol: 0.1 }),
      num('Anteil', p, '%', { q: 'c) Die Hülle wird aus einer rechteckigen Plane ($10\\,\\text{m}$ × $7\\,\\text{m}$) geschnitten. Wie viel Prozent der Plane werden verbraucht?', tol: 0.2 }),
      num('Radius', cd, 'm', { q: 'd) $1{,}05\\,\\text{m}$ unter der Spitze (senkrecht gemessen) hängt ein waagrechter Ring an der Zeltwand. Welchen Radius hat er?' }),
      choice('e) Im Vorjahr stand ein Pyramidenzelt mit quadratischer Grundfläche (Diagonale $5{,}40\\,\\text{m}$, Höhe $3{,}50\\,\\text{m}$). Das Kegelzelt hat $26{,}72\\,\\text{m}^3$. Welches Zelt hat mehr Rauminhalt?', 'das Kegelzelt', ['das Pyramidenzelt']),
    ],
    solution: [
      `a) $22{,}90 = r^2 \\cdot \\pi \\Rightarrow r = \\sqrt{\\frac{22{,}90}{\\pi}} ${res(r, 'm')}$`,
      `b) $s = \\sqrt{3{,}5^2 + 2{,}7^2} ${res(s, 'm')}$; $M = 2{,}7 \\cdot ${tx(round(s, 2))} \\cdot \\pi ${res(M, 'm²')}$`,
      `c) $A = 10 \\cdot 7 = 70\\,\\text{m}^2$; $\\frac{${tx(round(M, 2))}}{70} \\cdot 100 ${res(p, '%')}$`,
      `d) Strahlensatz: $\\frac{r_{Ring}}{2{,}70} = \\frac{1{,}05}{3{,}50} \\Rightarrow r_{Ring} ${res(cd, 'm')}$`,
      `e) $d = a \\cdot \\sqrt{2} \\Rightarrow a = \\frac{5{,}40}{\\sqrt{2}} ${res(a, 'm')}$; $V = \\frac{1}{3} \\cdot ${tx(round(a, 2))}^2 \\cdot 3{,}5 ${res(Vp, 'm³')} < 26{,}72\\,\\text{m}^3$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 12) Marmelade
// ---------------------------------------------------------------------------
const marmelade: Gen = () => {
  const h = 212 / (9 * PI);
  const A = 2 * 3 * PI * 5 * 1.15;
  const z = Math.sqrt(36 + 36 + 56.25);
  const r2 = (5.5 * 13) / 17;
  const h2 = Math.sqrt(169 - sq(round(r2, 2)));
  const V2 = (sq(round(r2, 2)) * PI * round(h2, 2)) / 3;
  const els: El[] = [
    ...cyl(0, 0, 3, 7.5, '#fda4af'),
    dim([-3, 7.5], [3, 7.5], '60 mm', 1, 10),
    dim([3, 0], [3, 7.5], 'h = ?', -1, 10),
    ...coneDown(16, 14, 5.5, 14, '#fde68a'),
    { t: 'line', pts: [[16 + 4.21, 10.7], [16, 0]], stroke: C.red, w: 2 },
    lbl([16 + 5.5, 14], 'r_1 = 5,5 cm', 8, 0, undefined, 'start'),
    lbl([16 + 3, 6], 's_2 = 13 cm', 10, 0, C.red, 'start'),
  ];
  return {
    title: 'Marmelade einkochen',
    badge: BADGE,
    text: 'Frau Kowalski kocht Marmelade ein. Ein zylinderförmiges Glas (Innendurchmesser $60\\,\\text{mm}$) wird mit $212\\,\\text{cm}^3$ gefüllt. In ein quaderförmiges Glas mit quadratischer Grundfläche passen $270\\,\\text{cm}^3$, es ist $7{,}50\\,\\text{cm}$ hoch.',
    figure: <Scene els={els} maxH={160} />,
    parts: [
      num('$h$', h, 'cm', { q: 'a) Wie hoch steht die Marmelade im zylinderförmigen Glas?' }),
      num('Etikett', A, 'cm²', { q: 'b) Um das Zylinderglas wird ein $5\\,\\text{cm}$ breites Etikett geklebt, das $15\\,\\%$ überlappt. Wie groß ist das Etikett?' }),
      choice('c) Passt eine $10\\,\\text{cm}$ lange Zimtstange schräg (Raumdiagonale) in das quaderförmige Glas?', 'Ja', ['Nein']),
      num('$r_2$', r2, 'cm', { q: 'd) Ein kegelförmiger Messbecher (Mantellinie $s_1 = 17\\,\\text{cm}$, oberer Radius $r_1 = 5{,}5\\,\\text{cm}$) wird bis zu einer Markierung gefüllt, die $s_2 = 13\\,\\text{cm}$ (auf der Mantellinie) von der Spitze entfernt ist. Berechne den Radius $r_2$ der Flüssigkeitsoberfläche.' }),
      num('Saft', V2, 'ml', { q: 'e) Berechne die Füllhöhe und dann, wie viele Milliliter im Messbecher sind.', tol: 2 }),
    ],
    solution: [
      `a) $212 = 3^2 \\cdot \\pi \\cdot h \\Rightarrow h = \\frac{212}{9\\pi} ${res(h, 'cm')}$`,
      `b) $A = 2 \\cdot 3 \\cdot \\pi \\cdot 5 ${res(30 * PI, 'cm²')}$; mit Überlappung: $\\cdot 1{,}15 ${res(A, 'cm²')}$`,
      `c) $270 = a^2 \\cdot 7{,}5 \\Rightarrow a = 6\\,\\text{cm}$; $d = \\sqrt{6^2 + 6^2 + 7{,}5^2} ${res(z, 'cm')} > 10\\,\\text{cm}$ → passt`,
      `d) Strahlensatz: $\\frac{r_2}{13} = \\frac{5{,}5}{17} \\Rightarrow r_2 ${res(r2, 'cm')}$`,
      `e) $h_2 = \\sqrt{13^2 - ${tx(round(r2, 2))}^2} ${res(h2, 'cm')}$; $V = \\frac{1}{3} \\cdot ${tx(round(r2, 2))}^2 \\cdot \\pi \\cdot ${tx(round(h2, 2))} ${res(V2, 'cm³')} = ${tx(V2)}\\,\\text{ml}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 13) Bojen
// ---------------------------------------------------------------------------
const bojen: Gen = () => {
  const Vu = (1 * 2.1) / 3;
  const ho = (3 * Vu * 1.2) / 1;
  const VHK = (2 / 3) * 1.5 ** 3 * PI;
  const n = Math.floor(100 / (round(VHK, 2) * 1.03));
  const OHK = 2 * sq(1.5) * PI;
  const s = Math.hypot(1.5, 4.13);
  const MK = 1.5 * round(s, 2) * PI;
  const hv = (0.8 * 4.13) / 3;
  const els: El[] = [...hemiDown(0, 1.5, 1.5, '#fca5a5'), ...coneUp(0, 1.5, 1.5, 4.13, '#fde68a', false), dim([1.5, 1.5], [1.5, 5.63], 'h_K = 4,13 m', -1, 12), dim([-1.5, 1.5], [0, 1.5], 'r = 1,5 m', 1, 8)];
  return {
    title: 'Bojen für die Ostsee',
    badge: BADGE,
    text: 'Die Firma Seezeichen Nord stellt Bojen her. Boje „Kompass“ ist eine Doppelpyramide mit quadratischer Grundfläche ($a = 1\\,\\text{m}$); die untere Pyramide ist $2{,}10\\,\\text{m}$ hoch. Boje „Atlantik“ besteht aus einer Halbkugel ($r = 1{,}50\\,\\text{m}$) mit aufgesetztem Kegel ($h_K = 4{,}13\\,\\text{m}$).',
    figure: <Scene els={els} maxH={170} />,
    parts: [
      num('Höhe', 2.1 + ho, 'm', { q: 'a) Das Volumen der oberen Pyramide von „Kompass“ ist um $20\\,\\%$ größer als das der unteren. Wie hoch ist die ganze Boje?' }),
      num('Bauteile', n, null, { integer: true, q: 'b) Die Halbkugeln werden aus Kork gefertigt; auf Lager sind $100\\,\\text{m}^3$. Mit $3\\,\\%$ Verschnitt: Wie viele Halbkugeln kann man herstellen?' }),
      num('Lack', OHK + MK, 'm²', { q: 'c) „Atlantik“ wird vollständig lackiert. Wie groß ist die Fläche?', tol: 0.1 }),
      num('$h_v$', hv, 'm', { q: 'd) Im Kegel wird eine waagrechte Metallscheibe mit $80\\,\\text{cm}$ Durchmesser eingebaut. Wie weit ist sie von der Spitze entfernt?' }),
    ],
    solution: [
      `a) $V_u = \\frac{1}{3} \\cdot 1^2 \\cdot 2{,}1 = 0{,}7\\,\\text{m}^3$; $V_o = 1{,}2 \\cdot 0{,}7 = 0{,}84\\,\\text{m}^3$`,
      `$0{,}84 = \\frac{1}{3} \\cdot 1^2 \\cdot h_o \\Rightarrow h_o = 2{,}52\\,\\text{m}$; gesamt: $2{,}10 + 2{,}52 = 4{,}62\\,\\text{m}$`,
      `b) $V_{HK} = \\frac{1}{2} \\cdot \\frac{4}{3} \\cdot 1{,}5^3 \\cdot \\pi ${res(VHK, 'm³')}$; $100 : (${tx(round(VHK, 2))} \\cdot 1{,}03) \\approx ${tx(100 / (round(VHK, 2) * 1.03))}$ → $${n}$ Bauteile`,
      `c) Halbkugel: $2 \\cdot 1{,}5^2 \\cdot \\pi ${res(OHK, 'm²')}$; $s = \\sqrt{1{,}5^2 + 4{,}13^2} ${res(s, 'm')}$; $M_K = 1{,}5 \\cdot ${tx(round(s, 2))} \\cdot \\pi ${res(MK, 'm²')}$; Summe: $O ${res(OHK + MK, 'm²')}$`,
      `d) Strahlensatz: $\\frac{h_v}{4{,}13} = \\frac{0{,}80}{2 \\cdot 1{,}50} \\Rightarrow h_v ${res(hv, 'm')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 14) Windmühle
// ---------------------------------------------------------------------------
const windmuehle: Gen = () => {
  const M = 8 * PI * 14;
  const rK = Math.sqrt((3 * 66.5) / (3.6 * PI));
  const s = Math.hypot(3.6, round(rK, 2));
  const MK = round(rK, 2) * round(s, 2) * PI;
  const V = (sq(4.5) - 16) * PI;
  const els: El[] = [...cyl(0, 0, 4, 14, '#e7e5e4', false), ...coneUp(0, 14, 4.2, 3.6, '#fca5a5', false), dim([-4, 0], [4, 0], 'd_Z = 8 m', -1, 12), dim([4, 0], [4, 14], 'h_Z = 14 m', -1, 18), dim([4.2, 14], [4.2, 17.6], 'h_K = 3,6 m', -1, 12)];
  return {
    title: 'Alte Windmühle',
    badge: BADGE,
    text: 'Die Firma Windkraft Ostermann renoviert eine zylinderförmige Windmühle ($d = 8\\,\\text{m}$, $h = 14\\,\\text{m}$) mit kegelförmigem Dach.',
    figure: <Scene els={els} maxH={180} />,
    parts: [
      num('Putz', 0.85 * M, 'm²', { q: 'a) Die Außenwand wird neu verputzt. $15\\,\\%$ davon sind Fenster und Türen. Wie groß ist die zu verputzende Fläche?' }),
      num('Überstand', (rK - 4) * 100, 'cm', { q: 'b) Das kegelförmige Dachgeschoss hat ein Volumen von $66{,}50\\,\\text{m}^3$ und ist $3{,}60\\,\\text{m}$ hoch. Wie weit steht das Dach seitlich über die Mauer?', tol: 1 }),
      num('Dach', MK, 'm²', { q: 'c) Wie groß ist die Dachfläche, die saniert wird?', tol: 0.3 }),
      num('Kies', V, 'm³', { q: 'd) Um die Mühle wird ein $0{,}5\\,\\text{m}$ breiter und $1\\,\\text{m}$ tiefer, kreisförmiger Graben ausgehoben und mit Kies gefüllt. Wie viel Kies ist nötig?' }),
    ],
    solution: [
      `a) $M = 8 \\cdot \\pi \\cdot 14 ${res(M, 'm²')}$; davon $85\\,\\%$: $${q(0.85 * M, 'm²')}$`,
      `b) $66{,}5 = \\frac{1}{3} \\cdot r_K^2 \\cdot \\pi \\cdot 3{,}6 \\Rightarrow r_K ${res(rK, 'm')}$; Überstand: $${tx(round(rK, 2))} - 4 = ${tx(round(rK, 2) - 4)}\\,\\text{m}$`,
      `c) $s = \\sqrt{3{,}6^2 + ${tx(round(rK, 2))}^2} ${res(s, 'm')}$; $M_K = ${tx(round(rK, 2))} \\cdot ${tx(round(s, 2))} \\cdot \\pi ${res(MK, 'm²')}$`,
      `d) Kreisring: $(4{,}5^2 - 4^2) \\cdot \\pi ${res(V, 'm²')}$; $\\cdot 1\\,\\text{m} ${res(V, 'm³')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 15) Zirkuszelt
// ---------------------------------------------------------------------------
const zirkus: Gen = () => {
  const r = Math.sqrt(367.79 / PI);
  const U = 2 * round(r, 2) * PI;
  const n = Math.ceil(round(U, 2) / 0.8);
  const V = sq(10.82) * PI * 4.5 + (sq(10.82) * PI * 3.5) / 3;
  const s = Math.hypot(10.82, 3.5);
  const M = 10.82 * round(s, 2) * PI;
  const x = (21.64 * 1.5) / 3.5;
  const els: El[] = [...cyl(0, 0, 10.82, 4.5, '#fecaca', false), ...coneUp(0, 4.5, 10.82, 3.5, '#bbf7d0', false), dim([10.82, 0], [10.82, 4.5], '4,50 m', -1, 12), dim([-10.82, 0], [-10.82, 8], '8 m', 1, 14)];
  return {
    title: 'Der Zirkus kommt',
    badge: BADGE,
    text: 'Der Zirkus „Stellaris“ beantragt bei der Stadt einen Stellplatz. Das Zelt braucht eine kreisrunde Grundfläche von $367{,}79\\,\\text{m}^2$. Es besteht aus einem $4{,}50\\,\\text{m}$ hohen Zylinder mit kegelförmigem Dach; insgesamt ist es $8\\,\\text{m}$ hoch.',
    figure: <Scene els={els} maxH={130} />,
    parts: [
      num('$r$', r, 'm', { q: 'a) Berechne den Radius des Zeltes.' }),
      num('Seile', n, null, { integer: true, q: 'b) Rundherum werden im Abstand von $80\\,\\text{cm}$ Abspannseile befestigt. Wie viele Seile braucht man?' }),
      num('Besucher', Math.floor(V / 10), null, { integer: true, q: 'c) Pro Besucher müssen $10\\,\\text{m}^3$ Luft vorhanden sein. Wie viele Besucher dürfen höchstens hinein?' }),
      num('Plane', M, 'm²', { q: 'd) Die Dachplane muss ersetzt werden. Wie groß ist sie?', tol: 0.6 }),
      num('Seil 1', x, 'm', { q: 'e) Für eine Hochseilnummer wird in $6{,}50\\,\\text{m}$ Höhe ein Seil quer durch das Zelt gespannt (von Dachwand zu Dachwand, durch die Mitte). Wie lang ist es?' }),
    ],
    solution: [
      `a) $r = \\sqrt{\\frac{367{,}79}{\\pi}} ${res(r, 'm')}$`,
      `b) $u = 2 \\cdot ${tx(round(r, 2))} \\cdot \\pi ${res(U, 'm')}$; $${tx(round(U, 2))} : 0{,}80 \\approx ${tx(round(U, 2) / 0.8)}$ → $${n}$ Seile`,
      `c) $V = 10{,}82^2 \\cdot \\pi \\cdot 4{,}5 + \\frac{1}{3} \\cdot 10{,}82^2 \\cdot \\pi \\cdot 3{,}5 ${res(V, 'm³')}$ → $${Math.floor(V / 10)}$ Besucher`,
      `d) $s = \\sqrt{10{,}82^2 + 3{,}5^2} ${res(s, 'm')}$; $M = 10{,}82 \\cdot ${tx(round(s, 2))} \\cdot \\pi ${res(M, 'm²')}$`,
      `e) Strahlensatz im Dach: $\\frac{x}{21{,}64} = \\frac{8 - 6{,}5}{3{,}5} \\Rightarrow x ${res(x, 'm')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 16) Leuchtturm
// ---------------------------------------------------------------------------
const leuchtturm: Gen = () => {
  const ri = Math.sqrt(113.1 / (PI * 9));
  const M = 2 * 2.2 * PI * 9;
  const s = Math.hypot(2, 2.2);
  const MK = 2.2 * round(s, 2) * PI;
  const x = (22000 * 6) / 15;
  const els: El[] = [
    ...cyl(0, 0, 2.2, 9, '#fde047', false),
    { t: 'poly', pts: [[-2.2, 3], [2.2, 3], [2.2, 6], [-2.2, 6]], fill: '#ef4444', opacity: 0.6, stroke: 'none' },
    ...coneUp(0, 9, 2.2, 2, '#b45309', false),
    dim([2.2, 0], [2.2, 11], 'h_{ges} = 11 m', -1, 14),
    dim([-2.2, 9], [-2.2, 11], 'h_D = 2 m', 1, 10),
  ];
  return {
    title: 'Kleiner Leuchtturm',
    badge: BADGE,
    text: 'Ein kleiner Leuchtturm an der Nordsee besteht aus einem zylinderförmigen Turm mit kegelförmigem Kupferdach. Er ist insgesamt $11\\,\\text{m}$ hoch, das Dach $2\\,\\text{m}$. Die Außenwand ist $20\\,\\text{cm}$ dick.',
    figure: <Scene els={els} maxH={170} />,
    parts: [
      num('$d$', 2 * (ri + 0.2), 'm', { q: 'a) Der Innenraum (ohne Dach) hat ein Volumen von $113{,}10\\,\\text{m}^3$. Berechne den äußeren Durchmesser.' }),
      num('Anstrich', 0.92 * M, 'm²', { q: 'b) Die Außenwand (ohne Dach, $r_{außen} = 2{,}20\\,\\text{m}$) wird gestrichen; $8\\,\\%$ sind Fenster. Wie groß ist die Fläche?' }),
      num('$s$', s, 'm', { q: 'c) Wie lang ist eine Dachstrebe von der Spitze zur Außenkante?' }),
      num('Kosten', round(MK, 2) * 120, '€', { q: 'd) $1\\,\\text{m}^2$ Kupferblech kostet $120\\,€$. Was kostet das neue Dach?', tol: 3 }),
      num('$x$', x, 'm', { q: 'e) Der Turm steht $6\\,\\text{m}$ über dem Meer, das Licht sitzt $9\\,\\text{m}$ über dem Boden, also $15\\,\\text{m}$ über dem Meer. Man sieht es bis zu einer $22\\,\\text{km}$ entfernten Insel. Ein $6\\,\\text{m}$ hohes Schiff fährt von der Insel zur Küste. Nach welcher Strecke $x$ trifft der Lichtstrahl (zur Insel) die Mastspitze?' }),
    ],
    solution: [
      `a) $h_Z = 11 - 2 = 9\\,\\text{m}$; $113{,}10 = r^2 \\cdot \\pi \\cdot 9 \\Rightarrow r_{innen} ${res(ri, 'm')}$; $d_{außen} = 2 \\cdot (2{,}00 + 0{,}20) = 4{,}40\\,\\text{m}$`,
      `b) $M = 2 \\cdot 2{,}2 \\cdot \\pi \\cdot 9 ${res(M, 'm²')}$; davon $92\\,\\%$: $${q(0.92 * M, 'm²')}$`,
      `c) $s = \\sqrt{2^2 + 2{,}2^2} ${res(s, 'm')}$`,
      `d) $M_K = 2{,}2 \\cdot ${tx(round(s, 2))} \\cdot \\pi ${res(MK, 'm²')}$; $\\cdot 120\\,€ ${res(round(MK, 2) * 120, '€')}$`,
      `e) Strahlensatz: $\\frac{x}{22.000} = \\frac{6}{15} \\Rightarrow x = 8.800\\,\\text{m}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 17) Briefkasten
// ---------------------------------------------------------------------------
const briefkasten: Gen = () => {
  const Vq = 20 * 20 * 40;
  const Vh = 0.5 * 100 * PI * 40;
  const A = 3 * 20 * 40 + 0.5 * 2 * 10 * PI * 40;
  const x = (6 * (9.94 - 3.37)) / 9.94;
  const front: P[] = [[0, 0], [20, 0], [20, 20], ...ell([10, 20], 10, 10, 0, 180, 20), [0, 20]];
  const els: El[] = [
    { t: 'poly', pts: front.map((p) => ob([p[0], p[1], 0])), fill: '#fca5a5' },
    { t: 'poly', pts: [ob([20, 0, 0]), ob([20, 0, 40]), ob([20, 20, 40]), ob([20, 20, 0])], fill: '#f87171' },
    { t: 'line', pts: [...ell([10, 20], 10, 10, 0, 180, 20).map((p) => ob([p[0], p[1], 40]))] },
    { t: 'line', pts: [ob([10, 30, 0]), ob([10, 30, 40])] },
    dim(ob([0, 0, 0]), ob([20, 0, 0]), '20 cm', -1, 10),
    dim(ob([20, 0, 0]), ob([20, 0, 40]), '40 cm', -1, 10),
    dim(ob([0, 0, 0]), ob([0, 20, 0]), '20 cm', 1, 10),
    lbl(ob([10, 30, 0]), '10 cm', -30, -8),
  ];
  return {
    title: 'Briefkasten im amerikanischen Stil',
    badge: BADGE,
    text: 'Familie Nguyen kauft einen Briefkasten: ein Quader ($20\\,\\text{cm}$ breit, $40\\,\\text{cm}$ tief, $20\\,\\text{cm}$ hoch) mit aufgesetztem Halbzylinder ($r = 10\\,\\text{cm}$).',
    figure: <Scene els={els} maxH={150} />,
    parts: [
      num('$V$', (Vq + Vh) / 1000, 'l', { strict: true, q: 'a) Berechne das Volumen in Liter.' }),
      num('Lack', A, 'cm²', { q: 'b) Außen (ohne Vorder- und Rückseite) wird der Briefkasten rot lackiert. Wie groß ist die Fläche?' }),
      num('Höhe', 15 + 10, 'cm', { q: 'c) Ein kleineres Modell hat denselben Halbzylinder, aber insgesamt nur $18.283{,}19\\,\\text{cm}^3$. Wie hoch ist es insgesamt?' }),
      num('$x$', x, 'cm', { q: 'd) Ein dreieckiger Wimpel ($6\\,\\text{cm}$ hoch, $9{,}94\\,\\text{cm}$ lang) hat drei parallele Metallstreifen. Das mittlere liegt $3{,}37\\,\\text{cm}$ von der Spitze entfernt (gemessen auf der Wimpelkante). Wie lang ist es?' }),
      num('$O$', 4 * 1.5 * 1.5 * PI, 'cm²', { q: 'e) Vorne sitzt eine Kugel ($d = 3\\,\\text{cm}$) als Griff, die blau lackiert wird. Berechne ihre Oberfläche.' }),
    ],
    solution: [
      `a) $V = 20 \\cdot 20 \\cdot 40 + \\frac{1}{2} \\cdot 10^2 \\cdot \\pi \\cdot 40 = 16.000 + ${tx(Vh)} ${res(Vq + Vh, 'cm³')} ${res((Vq + Vh) / 1000, 'l')}$`,
      `b) $3 \\cdot 20 \\cdot 40 + \\frac{1}{2} \\cdot 2 \\cdot 10 \\cdot \\pi \\cdot 40 = 2.400 + ${tx(0.5 * 2 * 10 * PI * 40)} ${res(A, 'cm²')}$`,
      `c) Quader: $18.283{,}19 - ${tx(Vh)} = 12.000\\,\\text{cm}^3$; $20 \\cdot 40 \\cdot h = 12.000 \\Rightarrow h = 15\\,\\text{cm}$; gesamt $15 + 10 = 25\\,\\text{cm}$`,
      `d) Strahlensatz: $\\frac{x}{6} = \\frac{9{,}94 - 3{,}37}{9{,}94} \\Rightarrow x ${res(x, 'cm')}$`,
      `e) $O = 4 \\cdot 1{,}5^2 \\cdot \\pi ${res(9 * PI, 'cm²')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 18) Glaspyramide
// ---------------------------------------------------------------------------
const glaspyramide: Gen = () => {
  const h = (3 * 148.82) / sq(6.4);
  const hs = Math.hypot(round(h, 2), 3.2);
  const M = 4 * ((round(hs, 2) * 6.4) / 2);
  const hs2 = (1.4 * round(hs, 2)) / 6.4;
  const r = Math.cbrt((89.8 * 3) / (2 * PI));
  const els: El[] = [...pyramidEls(6.4, 10.9, [0, 0, 0], false, '#bae6fd'), dim(ob([0, 0, 0]), ob([6.4, 0, 0]), 'a = 6,40 m', -1, 10), lbl(ob([3.2, 5, 3.2]), 'h = ?', -10, 0, undefined, 'end')];
  return {
    title: 'Die Glaspyramide',
    badge: BADGE,
    text: 'Vor einer Glasmanufaktur steht eine Schutzpyramide aus Glas und Metall mit quadratischer Grundfläche ($a = 6{,}40\\,\\text{m}$). Ihr Volumen beträgt $148{,}82\\,\\text{m}^3$.',
    figure: <Scene els={els} maxH={170} />,
    parts: [
      num('$h$', h, 'm', { q: 'a) Berechne die Höhe der Pyramide.' }),
      num('$M$', M, 'm²', { q: 'b) Die vier Seitenflächen werden gereinigt. Wie groß ist die Fläche?', tol: 0.5 }),
      num("$h_s'$", hs2, 'm', { q: "c) Die Spitze besteht aus Metall; sie ist unten $1{,}40\\,\\text{m}$ breit. Berechne die Höhe $h_s'$ eines Seitendreiecks der Metallspitze." }),
      num('$d$', 2 * r, 'cm', { q: 'd) Im Shop gibt es einen Briefbeschwerer in Form einer Halbkugel mit $89{,}80\\,\\text{cm}^3$ Volumen. Berechne seinen Durchmesser.' }),
      num('$A$', sq(r / 2) * PI, 'cm²', { q: 'e) Unten wird ein rundes Logo aufgeklebt, dessen Durchmesser halb so groß ist. Wie groß ist das Logo?', tol: 0.08 }),
    ],
    solution: [
      `a) $148{,}82 = \\frac{1}{3} \\cdot 6{,}40^2 \\cdot h \\Rightarrow h = \\frac{148{,}82 \\cdot 3}{6{,}40^2} ${res(h, 'm')}$`,
      `b) $h_s = \\sqrt{${tx(round(h, 2))}^2 + 3{,}20^2} ${res(hs, 'm')}$; $M = 4 \\cdot \\frac{${tx(round(hs, 2))} \\cdot 6{,}40}{2} ${res(M, 'm²')}$`,
      `c) Strahlensatz: $\\frac{h_s'}{${tx(round(hs, 2))}} = \\frac{1{,}40}{6{,}40} \\Rightarrow h_s' ${res(hs2, 'm')}$`,
      `d) $89{,}80 = \\frac{1}{2} \\cdot \\frac{4}{3} \\cdot r^3 \\cdot \\pi \\Rightarrow r = \\sqrt[3]{\\frac{89{,}80 \\cdot 3}{2 \\cdot \\pi}} ${res(r, 'cm')}$; $d ${res(2 * r, 'cm')}$`,
      `e) $r_2 = ${tx(round(r, 2))} : 2 ${res(round(r, 2) / 2, 'cm')}$; $A = r_2^2 \\cdot \\pi ${res(sq(round(r, 2) / 2) * PI, 'cm²')}$`,
    ],
  };
};

export const EXAMS: Exam[] = [
  { tags: ['kegel', 'pyramide', 'strahlensaetze'], gen: schultueten },
  { tags: ['zylinder', 'kegel', 'strahlensaetze'], gen: silo },
  { tags: ['prisma', 'pyramide'], gen: abfall },
  { tags: ['kugel'], gen: holzschale },
  { tags: ['zylinder', 'kugel', 'kegel'], gen: glaeser },
  { tags: ['kugel', 'kegel', 'pyramide'], gen: eiscafe },
  { tags: ['prisma', 'zylinder', 'kugel', 'pyramide'], gen: baustein },
  { tags: ['zylinder', 'pyramide', 'strahlensaetze'], gen: gartenpool },
  { tags: ['zylinder', 'pyramide', 'flaeche', 'pythagoras'], gen: stadionbecken },
  { tags: ['kugel', 'kegel', 'pyramide', 'strahlensaetze'], gen: grill },
  { tags: ['kegel', 'pyramide', 'strahlensaetze'], gen: zeltlager },
  { tags: ['zylinder', 'prisma', 'kegel', 'strahlensaetze'], gen: marmelade },
  { tags: ['pyramide', 'kugel', 'kegel'], gen: bojen },
  { tags: ['zylinder', 'kegel'], gen: windmuehle },
  { tags: ['zylinder', 'kegel', 'strahlensaetze'], gen: zirkus },
  { tags: ['zylinder', 'kegel', 'strahlensaetze'], gen: leuchtturm },
  { tags: ['prisma', 'zylinder', 'kugel', 'strahlensaetze'], gen: briefkasten },
  { tags: ['pyramide', 'kugel', 'strahlensaetze'], gen: glaspyramide },
];

export function examsFor(tag: ExamTag): Gen[] {
  return EXAMS.filter((e) => e.tags.includes(tag)).map((e) => e.gen);
}

export const ALL_EXAMS: Gen[] = EXAMS.map((e) => e.gen);
