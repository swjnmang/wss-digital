import type { PracticeConfig, TopicConfig } from '../engine/types';
import { ALL_EXAMS } from './pruefung';
import { KUGEL_APPS } from './kugel';
import { ZYLINDER_APPS } from './zylinder';
import { PRISMA_APPS } from './prisma';
import { KEGEL_APPS } from './kegel';
import { PYRAMIDE_APPS } from './pyramide';

const ALL_FORMULAS = [
  'V_{Prisma} = G \\cdot h',
  'V_{Zylinder} = r^2 \\cdot \\pi \\cdot h',
  'V_{Kegel} = \\frac{1}{3} \\cdot r^2 \\cdot \\pi \\cdot h',
  'V_{Pyramide} = \\frac{1}{3} \\cdot a^2 \\cdot h',
  'V_{Kugel} = \\frac{4}{3} \\cdot r^3 \\cdot \\pi',
  'O_{Kugel} = 4 \\cdot r^2 \\cdot \\pi',
  'M_{Kegel} = r \\cdot s \\cdot \\pi',
  'M_{Pyramide} = 4 \\cdot \\frac{h_s \\cdot a}{2}',
];

const pages: PracticeConfig[] = [
  {
    slug: 'pruefungsaufgaben',
    title: 'Aufgaben auf Prüfungsniveau',
    description: 'Zusammengesetzte Körper wie in der Abschlussprüfung',
    formulas: ALL_FORMULAS,
    example: {
      title: 'So gehst du bei großen Aufgaben vor',
      text: 'Prüfungsaufgaben bestehen aus mehreren Teilaufgaben, die aufeinander aufbauen.',
      steps: [
        '1. Skizze ansehen: Aus welchen Körpern besteht das Objekt? Gegebene Maße markieren.',
        '2. Für jede Teilaufgabe die passende Formel aus der Merkhilfe aufschreiben.',
        '3. Einheiten angleichen (Liter → dm, Ergebnis in m² → alles in m).',
        '4. Mit Zwischenergebnissen weiterrechnen – auf zwei Nachkommastellen runden.',
        '5. Oft gebraucht: Pythagoras für $s$ oder $h_s$, Strahlensätze für Teilhöhen und Radien.',
      ],
      tip: 'Ein Zwischenergebnis aus der Aufgabe darfst du immer zum Weiterrechnen verwenden, auch wenn dein eigenes Ergebnis abweicht.',
    },
    gens: [],
    fixed: ALL_EXAMS,
    nBasic: 0,
    nApp: 0,
    nFixed: 5,
  },
  {
    slug: 'koerper-gemischt',
    title: 'Gemischte Anwendungsaufgaben Körper',
    description: 'Alltagsaufgaben zu allen Körpern',
    formulas: ALL_FORMULAS,
    example: {
      title: 'Welcher Körper steckt dahinter?',
      text: 'Ein Eimer, ein Sandhaufen, eine Glaspyramide – erkenne zuerst die Körperform.',
      steps: ['Dose, Tonne, Turm → **Zylinder**', 'Waffel, Sandhaufen, Trichter, Tipi → **Kegel**', 'Ball, Eiskugel → **Kugel**', 'Zelt, Karton, Becken → **Prisma/Quader**', 'Dach, Glaspyramide → **Pyramide**'],
    },
    gens: [],
    apps: [...KUGEL_APPS, ...ZYLINDER_APPS, ...PRISMA_APPS, ...KEGEL_APPS, ...PYRAMIDE_APPS],
    nBasic: 0,
    nApp: 6,
  },
];

export const anwendung: TopicConfig = {
  slug: 'anwendungsaufgaben',
  title: 'Anwendungsaufgaben',
  description: 'Prüfungsniveau und gemischte Alltagsaufgaben',
  icon: 'exam',
  pages,
};
