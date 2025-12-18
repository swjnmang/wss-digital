import React, { useEffect, useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const TASK_COUNT = 10;
const POINTS_PER_CORRECT = 10;

type TaskType =
  | 'simple_interest'
  | 'zinseszins'
  | 'kapitalmehrung'
  | 'kapitalminderung'
  | 'renten_endwert'
  | 'ratendarlehen_plan'
  | 'annuitaet_plan';

type FilterType = TaskType | 'mixed' | 'renten_bundled';

type SimpleInterestVariant = 'Z' | 'K' | 'p' | 't';
type ZinseszinsVariant = 'Kn' | 'K0' | 'p' | 'n';
type KapitalmehrungVariant = 'Kn' | 'K0' | 'r' | 'n';
type RentenVariant = 'Kn' | 'r' | 'p' | 'n';
type KapitalminderungVariant = 'Kn' | 'K0' | 'r' | 'n';

interface TaskInput {
  id: string;
  label: string;
  unit: string;
  placeholder: string;
  correctValue: number;
  tolerance: number;
  displayDecimals?: number;
}

interface Task {
  type: TaskType;
  question: React.ReactNode;
  solution: React.ReactNode;
  inputs: TaskInput[];
}

interface TaskCard {
  id: number;
  task: Task;
  userAnswers: Record<string, string>;
  feedback: React.ReactNode | null;
  feedbackType: 'correct' | 'incorrect' | null;
  solutionVisible: boolean;
}

const taskTypes: TaskType[] = [
  'simple_interest',
  'zinseszins',
  'kapitalmehrung',
  'kapitalminderung',
  'renten_endwert',
  'ratendarlehen_plan',
  'annuitaet_plan',
];

const taskFilterButtons: { id: FilterType; label: string }[] = [
  { id: 'mixed', label: 'Alle gemischt' },
  { id: 'simple_interest', label: 'Zinsrechnung' },
  { id: 'zinseszins', label: 'Zinseszins' },
  { id: 'renten_bundled', label: 'Rentenrechnung' },
  { id: 'ratendarlehen_plan', label: 'Ratentilgung' },
  { id: 'annuitaet_plan', label: 'Annuitätentilgung' },
];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals = 2) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};
const randomChoice = <T,>(arr: readonly T[]): T => arr[randomInt(0, arr.length - 1)];

const latex = String.raw;

const renderSolutionIntro = (areaLabel: string, baseFormula: string) => (
  <div className="space-y-0.5 text-sm text-slate-600">
    <p className="font-semibold">Bereich: {areaLabel}</p>
    <p>
      Grundformel: <InlineMath math={baseFormula} />
    </p>
  </div>
);

interface InterestDateRange {
  startLabel: string;
  endLabel: string;
  days: number;
}

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

const randomInterestDateRange = (): InterestDateRange => {
  const year = 2025;
  const span = randomInt(30, 250);
  const startDay = randomInt(1, 360 - span);
  const startDate = new Date(year, 0, 1);
  startDate.setDate(startDate.getDate() + startDay);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + span);
  return {
    startLabel: formatDateLabel(startDate),
    endLabel: formatDateLabel(endDate),
    days: span,
  };
};

const simpleInterestContexts = [
  'Die Schülerfirma SolarJuice legt einen Teil ihrer Smoothie-Einnahmen kurzfristig bei der Schülerbank an.',
  'Der Nachhaltigkeitsclub verwaltet Sponsorengelder für ein Urban-Gardening-Projekt.',
  'Eine Abschlussklasse erhält eine Reisekasse und möchte das Geld bis zur Fahrt verzinst parken.',
] as const;

const zinseszinsContexts = [
  'Lilly lässt ihr Preisgeld mit jährlicher Verzinsung ruhen – ohne Entnahmen.',
  'Der Schulsanitätsdienst spart Spenden für neue Ausrüstung und lässt das Kapital wachsen.',
  'Ein eSports-Schulteam legt seine Gewinne auf einem Festgeldkonto an.',
] as const;

const kapitalmehrungContexts = [
  'Die Nachhaltigkeits-AG startet mit einem Grundstock und zahlt am Jahresende zusätzliche Beträge ein.',
  'Der Makerspace spart für einen Lasercutter und füttert das Konto jede Saison mit Projektbeiträgen.',
  'Eine Schülerfirma investiert ihre Monatsgewinne in einen Innovationsfonds.',
] as const;

const kapitalminderungContexts = [
  'Der Förderverein entnimmt jedes Jahr Geld aus dem Rücklagenkonto, um eine soziale Initiative zu finanzieren.',
  'Ein Schulorchester zahlt sich jährlich Reisezuschüsse aus seiner Startkasse aus.',
  'Die Umwelt-AG reduziert ihren Klimafonds, indem sie jedes Jahr Projektgelder entnimmt.',
] as const;

const rentenContexts = [
  'Ein Schulteam spart nachschüssig für eine Abschlussreise und zahlt am Ende jedes Jahres denselben Betrag ein.',
  'Der Theaterkurs plant Kulissen und legt jedes Jahr Honorar-Reste zur Seite.',
  'Der Chor sammelt für eine Konzerttournee und überweist regelmäßig Vereinsbeiträge.',
] as const;

const ratendarlehenContexts = [
  'Für den neuen Kreativraum nimmt die Schule ein Ratendarlehen auf.',
  'Familie Müller stemmt den Kauf eines Energiesparhauses über ein Ratendarlehen.',
  'Der Sportkurs beschafft Fitnessgeräte und zahlt sie über ein klassisches Ratendarlehen zurück.',
] as const;

const annuitaetPlanContexts = [
  'Eine Stadt finanziert eine LED-Flutlichtanlage über ein Annuitätendarlehen.',
  'Der Landkreis ersetzt Tablets und bündelt die Finanzierung über konstante Raten.',
  'Ein Start-up aus der Schülerfirma baut seinen Maschinenpark per Annuitätendarlehen aus.',
] as const;

const rentenBundleTypes: TaskType[] = ['kapitalmehrung', 'kapitalminderung', 'renten_endwert'];

const createInitialStats = () => ({ correct: 0, total: 0, streak: 0, points: 0 });

const formatCurrency = (val: number) =>
  val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatNumber = (val: number, decimals = 2) =>
  val.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const formatValueWithUnit = (val: number, unit: string, decimals = 2) => {
  if (unit === '€') return `${formatCurrency(val)} €`;
  if (unit === '%') return `${formatNumber(val, decimals)} %`;
  return `${formatNumber(val, decimals)} ${unit}`;
};

const mathNumber = (value: number, decimals = 6) => {
  const str = value.toFixed(decimals);
  return str.replace(/0+$/, '').replace(/\.$/, '');
};

const createInputField = (
  id: string,
  label: string,
  unit: string,
  placeholder: string,
  correctValue: number,
  tolerance: number,
  displayDecimals = 2
): TaskInput => ({ id, label, unit, placeholder, correctValue, tolerance, displayDecimals });

const buildInputRecord = (task: Task) =>
  task.inputs.reduce<Record<string, string>>((acc, input) => {
    acc[input.id] = '';
    return acc;
  }, {});

const createSimpleInterestTask = (): Task => {
  const K = randomInt(30, 150) * 100;
  const p = randomFloat(1.2, 7.5, 2);
  let t = randomInt(30, 340);
  const variant = randomChoice<SimpleInterestVariant>(['Z', 'K', 'p', 't']);

  const useDateRange = variant !== 't' && Math.random() < 0.5;
  const dateRange = useDateRange ? randomInterestDateRange() : null;
  if (dateRange) {
    t = dateRange.days;
  }
  const Z = (K * p * t) / (100 * 360);

  const durationInfo = useDateRange ? (
    <p>
      Zeitraum: <strong>{dateRange!.startLabel} bis {dateRange!.endLabel}</strong> (bankübliches 360-Tage-Jahr).
    </p>
  ) : (
    <p>
      Dauer: <strong>{t} Tage</strong>.
    </p>
  );

  const baseStory = (
    <div className="space-y-2">
      <p>{randomChoice(simpleInterestContexts)}</p>
      <p>Alle Angaben beziehen sich auf dieselbe Geldanlage.</p>
    </div>
  );

  let question: React.ReactNode = null;
  let inputs: TaskInput[] = [];
  let solution: React.ReactNode = null;

  switch (variant) {
    case 'Z': {
      question = (
        <div className="space-y-2">
          {baseStory}
          <p>
            Einlage: <strong>{formatCurrency(K)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong>.
          </p>
          {durationInfo}
          <p className="text-blue-900 font-semibold">Welche Zinsen fallen an?</p>
        </div>
      );
      inputs = [createInputField('Z', 'Zinsen', '€', 'z.B. 248,50', Z, Math.max(Z * 0.002, 0.5))];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`Z = \frac{K \cdot p \cdot t}{100 \cdot 360}`} />
          </p>
          <p>
            <InlineMath math={latex`Z = \frac{${mathNumber(K)} \cdot ${mathNumber(p)} \cdot ${mathNumber(t)}}{36000}`} />
          </p>
          <p><strong>{formatCurrency(Z)} €</strong></p>
        </div>
      );
      break;
    }
    case 'K': {
      const capital = (Z * 100 * 360) / (p * t);
      question = (
        <div className="space-y-2">
          {baseStory}
          <p>
            Zinssatz: <strong>{formatNumber(p, 2)} %</strong>, Zinsen: <strong>{formatCurrency(Z)} €</strong>.
          </p>
          {durationInfo}
          <p className="text-blue-900 font-semibold">Welches Startkapital wurde angelegt?</p>
        </div>
      );
      inputs = [createInputField('K', 'Kapital', '€', 'z.B. 18.500,00', capital, Math.max(capital * 0.002, 1))];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`K = \frac{Z \cdot 100 \cdot 360}{p \cdot t}`} />
          </p>
          <p>
            <InlineMath math={latex`K = \frac{${mathNumber(Z)} \cdot 36000}{${mathNumber(p)} \cdot ${mathNumber(t)}}`} />
          </p>
          <p><strong>{formatCurrency(capital)} €</strong></p>
        </div>
      );
      break;
    }
    case 'p': {
      const rate = (Z * 100 * 360) / (K * t);
      question = (
        <div className="space-y-2">
          {baseStory}
          <p>
            Startkapital: <strong>{formatCurrency(K)} €</strong>, Zinsen: <strong>{formatCurrency(Z)} €</strong>.
          </p>
          {durationInfo}
          <p className="text-blue-900 font-semibold">Wie hoch war der Zinssatz?</p>
        </div>
      );
      inputs = [createInputField('p', 'Zinssatz', '%', 'z.B. 4,25', rate, 0.05, 2)];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`p = \frac{Z \cdot 100 \cdot 360}{K \cdot t}`} />
          </p>
          <p>
            <InlineMath math={latex`p = \frac{${mathNumber(Z)} \cdot 36000}{${mathNumber(K)} \cdot ${mathNumber(t)}}`} />
          </p>
          <p><strong>{formatNumber(rate, 2)} %</strong></p>
        </div>
      );
      break;
    }
    case 't': {
      const days = (Z * 100 * 360) / (K * p);
      question = (
        <div className="space-y-2">
          {baseStory}
          <p>
            Startkapital: <strong>{formatCurrency(K)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong>, Zinsen:{' '}
            <strong>{formatCurrency(Z)} €</strong>.
          </p>
          <p className="text-blue-900 font-semibold">Wie viele Tage war das Geld angelegt?</p>
        </div>
      );
      inputs = [createInputField('t', 'Tage', 'Tage', 'z.B. 180', days, 0.5, 1)];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`t = \frac{Z \cdot 100 \cdot 360}{K \cdot p}`} />
          </p>
          <p>
            <InlineMath math={latex`t = \frac{${mathNumber(Z)} \cdot 36000}{${mathNumber(K)} \cdot ${mathNumber(p)}}`} />
          </p>
          <p><strong>{formatNumber(days, 1)} Tage</strong></p>
        </div>
      );
      break;
    }
    default:
      break;
  }

  return {
    type: 'simple_interest',
    question,
    solution,
    inputs,
  };
};

const createZinseszinsTask = (): Task => {
  const K0 = randomInt(8, 25) * 1000;
  const n = randomInt(2, 6);
  const p = randomFloat(1.4, 6.2, 2);
  const q = 1 + p / 100;
  const qn = Math.pow(q, n);
  const Kn = K0 * qn;
  const variant = randomChoice<ZinseszinsVariant>(['Kn', 'K0', 'p', 'n']);

  const story = <p>{randomChoice(zinseszinsContexts)}</p>;

  let question: React.ReactNode = null;
  let inputs: TaskInput[] = [];
  let solution: React.ReactNode = null;

  switch (variant) {
    case 'Kn':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Startkapital: <strong>{formatCurrency(K0)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong>, Laufzeit:{' '}
            <strong>{n} Jahre</strong>.
          </p>
          <p className="text-blue-900 font-semibold">Wie groß ist das Endkapital?</p>
        </div>
      );
      inputs = [createInputField('Kn', 'Endkapital', '€', 'z.B. 14.200,00', Kn, Math.max(Kn * 0.002, 1.5))];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`K_n = K_0 \cdot q^n`} />
          </p>
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`K_n = ${mathNumber(K0)} \cdot ${mathNumber(q, 4)}^{${n}} = ${mathNumber(Kn, 4)}`} />
          </p>
        </div>
      );
      break;
    case 'K0':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Endkapital: <strong>{formatCurrency(Kn)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong>, Laufzeit:{' '}
            <strong>{n} Jahre</strong>.
          </p>
          <p className="text-blue-900 font-semibold">Welches Anfangskapital wurde angelegt?</p>
        </div>
      );
      inputs = [createInputField('K0', 'Anfangskapital', '€', 'z.B. 12.000,00', K0, Math.max(K0 * 0.002, 1.5))];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`K_0 = \frac{K_n}{q^n}`} />
          </p>
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`K_0 = \frac{${mathNumber(Kn)}}{${mathNumber(qn, 4)}} = ${mathNumber(K0, 4)}`} />
          </p>
        </div>
      );
      break;
    case 'p':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Startkapital: <strong>{formatCurrency(K0)} €</strong>, Endkapital: <strong>{formatCurrency(Kn)} €</strong>, Laufzeit:{' '}
            <strong>{n} Jahre</strong>.
          </p>
          <p className="text-blue-900 font-semibold">Welcher Zinssatz führte zu diesem Wachstum?</p>
        </div>
      );
      inputs = [createInputField('p', 'Zinssatz', '%', 'z.B. 3,8', p, 0.05, 2)];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`\frac{K_n}{K_0} = q^n`} />
          </p>
          <p>
            <InlineMath math={latex`q = \sqrt[${n}]{\frac{${mathNumber(Kn)}}{${mathNumber(K0)}}} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`p = (q - 1) \cdot 100 = ${formatNumber(p, 2)}\,\%`} />
          </p>
        </div>
      );
      break;
    case 'n':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Startkapital: <strong>{formatCurrency(K0)} €</strong>, Endkapital: <strong>{formatCurrency(Kn)} €</strong>, Zinssatz:{' '}
            <strong>{formatNumber(p, 2)} %</strong>.
          </p>
          <p className="text-blue-900 font-semibold">Wie viele volle Jahre sind nötig?</p>
        </div>
      );
      inputs = [createInputField('n', 'Jahre', 'Jahre', 'z.B. 4', n, 0.05, 0)];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`n = \frac{\ln \left(\frac{K_n}{K_0}\right)}{\ln(q)}`} />
          </p>
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`n = \frac{\ln\left(\frac{${mathNumber(Kn)}}{${mathNumber(K0)}}\right)}{\ln(${mathNumber(q, 4)})} = ${n}`} />
          </p>
        </div>
      );
      break;
    default:
      break;
  }

  return {
    type: 'zinseszins',
    question,
    solution,
    inputs,
  };
};

const createKapitalmehrungTask = (): Task => {
  const K0 = randomInt(10, 40) * 1000;
  const r = randomInt(4, 12) * 500;
  const n = randomInt(3, 7);
  const p = randomFloat(1.8, 5.2, 2);
  const q = 1 + p / 100;
  const qn = Math.pow(q, n);
  const qMinus1 = q - 1;
  const Kn = K0 * qn + (r * (qn - 1)) / qMinus1;
  const variant = randomChoice<KapitalmehrungVariant>(['Kn', 'K0', 'r', 'n']);

  const story = <p>{randomChoice(kapitalmehrungContexts)}</p>;
  const areaLabel = 'nachschüssige Kapitalmehrung';
  const baseFormula = latex`K_n = K_0 \cdot q^n + r \cdot \frac{q^n - 1}{q - 1}`;
  const solutionIntro = renderSolutionIntro(areaLabel, baseFormula);

  let question: React.ReactNode = null;
  let inputs: TaskInput[] = [];
  let solution: React.ReactNode = null;

  switch (variant) {
    case 'Kn':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Start: <strong>{formatCurrency(K0)} €</strong>, Rate: <strong>{formatCurrency(r)} €</strong>, Zinssatz:{' '}
            <strong>{formatNumber(p, 2)} %</strong>, Laufzeit: <strong>{n} Jahre</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Am Jahresende (nachschüssig) wird nach den Zinsen jeweils {formatCurrency(r)} € auf ein Startpolster von{' '}
            {formatCurrency(K0)} € gelegt – typische Kapitalmehrung.
          </p>
          <p className="text-blue-900 font-semibold">Wie hoch ist der Endwert?</p>
        </div>
      );
      inputs = [createInputField('Kn', 'Endwert', '€', 'z.B. 42.500,00', Kn, Math.max(Kn * 0.002, 2))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`q^n = ${mathNumber(q, 4)}^{${n}} = ${mathNumber(qn, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`K_n = ${mathNumber(K0)} \cdot ${mathNumber(qn, 4)} + ${mathNumber(r)} \cdot \frac{${mathNumber(qn, 4)} - 1}{${mathNumber(q, 4)} - 1} = ${mathNumber(Kn, 4)}`} />
          </p>
        </div>
      );
      break;
    case 'K0':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Endwert: <strong>{formatCurrency(Kn)} €</strong>, Rate: <strong>{formatCurrency(r)} €</strong>, Zinssatz:{' '}
            <strong>{formatNumber(p, 2)} %</strong>, Laufzeit: <strong>{n} Jahre</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Die nachschüssigen Jahresraten von {formatCurrency(r)} € wachsen mit; gesucht ist das anfängliche Guthaben, das
            zusammen mit diesen Einzahlungen den Endwert erreicht.
          </p>
          <p className="text-blue-900 font-semibold">Welcher Startbetrag war nötig?</p>
        </div>
      );
      inputs = [createInputField('K0', 'Startkapital', '€', 'z.B. 28.000,00', K0, Math.max(K0 * 0.002, 2))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`K_0 = \frac{K_n - r \cdot \frac{q^n - 1}{q - 1}}{q^n}`} />
          </p>
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)},\; q^n = ${mathNumber(qn, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`K_0 = \frac{${mathNumber(Kn)} - ${mathNumber(r)} \cdot \frac{${mathNumber(qn, 4)} - 1}{${mathNumber(q, 4)} - 1}}{${mathNumber(qn, 4)}} = ${mathNumber(K0, 4)}`} />
          </p>
        </div>
      );
      break;
    case 'r': {
      const rate = (Kn - K0 * qn) * (q - 1) / (qn - 1);
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Start: <strong>{formatCurrency(K0)} €</strong>, Endwert: <strong>{formatCurrency(Kn)} €</strong>, Zinssatz:{' '}
            <strong>{formatNumber(p, 2)} %</strong>, Laufzeit: <strong>{n} Jahre</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Kapitalmehrung mit nachschüssigen Raten: Das Anfangskonto soll zusammen mit gleich hohen Jahreszahlungen den
            Endwert erreichen.
          </p>
          <p className="text-blue-900 font-semibold">Wie hoch ist die nachschüssige Rate?</p>
        </div>
      );
      inputs = [createInputField('r', 'Jahresrate', '€', 'z.B. 3.200,00', rate, Math.max(rate * 0.002, 1.5))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`r = \left(K_n - K_0 \cdot q^n\right) \cdot \frac{q - 1}{q^n - 1}`} />
          </p>
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)},\; q^n = ${mathNumber(qn, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`r = \left(${mathNumber(Kn)} - ${mathNumber(K0)} \cdot ${mathNumber(qn, 4)}\right) \cdot \frac{${mathNumber(q, 4)} - 1}{${mathNumber(qn, 4)} - 1} = ${mathNumber(r, 4)}`} />
          </p>
        </div>
      );
      break;
    }
    case 'n':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Start: <strong>{formatCurrency(K0)} €</strong>, Rate: <strong>{formatCurrency(r)} €</strong>, Zinssatz:{' '}
            <strong>{formatNumber(p, 2)} %</strong>, Endwert: <strong>{formatCurrency(Kn)} €</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Nachschüssige Kapitalmehrung: Auf das Startguthaben folgen jedes Jahresende identische Einzahlungen.
          </p>
          <p className="text-blue-900 font-semibold">Wie viele Jahre dauerte der Plan?</p>
        </div>
      );
      inputs = [createInputField('n', 'Jahre', 'Jahre', 'z.B. 5', n, 0.05, 0)];
      const isoQN = (Kn * qMinus1 + r) / (K0 * qMinus1 + r);
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`q^n = \frac{K_n (q - 1) + r}{K_0 (q - 1) + r}`} />
          </p>
          <p>
            <InlineMath math={latex`q^n = \frac{${mathNumber(Kn)} \cdot (${mathNumber(qMinus1, 4)}) + ${mathNumber(r)}}{${mathNumber(K0)} \cdot (${mathNumber(qMinus1, 4)}) + ${mathNumber(r)}} = ${mathNumber(isoQN, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`n = \frac{\ln(q^n)}{\ln(q)} = \frac{\ln(${mathNumber(isoQN, 4)})}{\ln(${mathNumber(q, 4)})} = ${n}`} />
          </p>
        </div>
      );
      break;
    default:
      break;
  }

  return {
    type: 'kapitalmehrung',
    question,
    solution,
    inputs,
  };
};

const createKapitalminderungTask = (): Task => {
  let K0 = randomInt(30, 70) * 1000;
  const r = randomInt(15, 50) * 100;
  const n = randomInt(3, 8);
  const p = randomFloat(1.4, 4.5, 2);
  const q = 1 + p / 100;
  const qn = Math.pow(q, n);
  const qMinus1 = q - 1;
  // ensure withdrawals don't exceed growth
  if (K0 * qMinus1 <= r) {
    K0 = Math.max(K0, Math.ceil((r + 500) / qMinus1));
  }
  const Kn = K0 * qn - (r * (qn - 1)) / qMinus1;
  const variant = randomChoice<KapitalminderungVariant>(['Kn', 'K0', 'r', 'n']);

  const story = <p>{randomChoice(kapitalminderungContexts)}</p>;
  const areaLabel = 'nachschüssige Kapitalminderung';
  const baseFormula = latex`K_n = K_0 \cdot q^n - r \cdot \frac{q^n - 1}{q - 1}`;
  const solutionIntro = renderSolutionIntro(areaLabel, baseFormula);

  let question: React.ReactNode = null;
  let inputs: TaskInput[] = [];
  let solution: React.ReactNode = null;

  switch (variant) {
    case 'Kn':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Startkapital: <strong>{formatCurrency(K0)} €</strong>, jährliche Entnahme:{' '}
            <strong>{formatCurrency(r)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong>, Laufzeit:{' '}
            <strong>{n} Jahre</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Das Kapital wird verzinst, erst danach wird am Jahresende eine feste Summe entnommen – nachschüssige
            Kapitalminderung.
          </p>
          <p className="text-blue-900 font-semibold">Wie hoch ist die Restkasse nach allen Entnahmen?</p>
        </div>
      );
      inputs = [createInputField('Kn', 'Restkapital', '€', 'z.B. 14.800,00', Kn, Math.max(Kn * 0.002, 1.5))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`K_n = ${mathNumber(K0)} \, ${mathNumber(q, 4)}^{${n}} - ${mathNumber(r)} \cdot \frac{${mathNumber(qn, 4)} - 1}{${mathNumber(q, 4)} - 1} = ${mathNumber(Kn, 4)}`} />
          </p>
        </div>
      );
      break;
    case 'K0': {
      const startCapital = (Kn + (r * (qn - 1)) / qMinus1) / qn;
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Restkapital: <strong>{formatCurrency(Kn)} €</strong>, Entnahme: <strong>{formatCurrency(r)} €</strong>, Zinssatz:{' '}
            <strong>{formatNumber(p, 2)} %</strong>, Laufzeit: <strong>{n} Jahre</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Es wird nachschüssig entnommen. Wie groß musste der Anfangsbestand sein, damit nach den festen Entnahmen noch
            {formatCurrency(Kn)} € übrig bleiben?
          </p>
          <p className="text-blue-900 font-semibold">Wie groß war das ursprüngliche Kapital?</p>
        </div>
      );
      inputs = [createInputField('K0', 'Startkapital', '€', 'z.B. 35.000,00', startCapital, Math.max(startCapital * 0.002, 2))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`K_0 = \frac{K_n + r \cdot \frac{q^n - 1}{q - 1}}{q^n}`} />
          </p>
          <p>
            <InlineMath math={latex`K_0 = \frac{${mathNumber(Kn)} + ${mathNumber(r)} \cdot \frac{${mathNumber(qn, 4)} - 1}{${mathNumber(q, 4)} - 1}}{${mathNumber(qn, 4)}} = ${mathNumber(startCapital, 4)}`} />
          </p>
        </div>
      );
      break;
    }
    case 'r': {
      const rate = (K0 * qn - Kn) * qMinus1 / (qn - 1);
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Startkapital: <strong>{formatCurrency(K0)} €</strong>, Restkapital: <strong>{formatCurrency(Kn)} €</strong>, Zinssatz:{' '}
            <strong>{formatNumber(p, 2)} %</strong>, Laufzeit: <strong>{n} Jahre</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Nachschüssige Entnahmen: Nach jeder Verzinsung stehen konstante Zuschüsse zur Verfügung – wie hoch dürfen sie
            sein?
          </p>
          <p className="text-blue-900 font-semibold">Wie groß darf die jährliche Entnahme sein?</p>
        </div>
      );
      inputs = [createInputField('r', 'Entnahme', '€', 'z.B. 4.500,00', rate, Math.max(rate * 0.002, 1.5))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`r = (K_0 q^n - K_n) \cdot \frac{q - 1}{q^n - 1}`} />
          </p>
          <p>
            <InlineMath math={latex`r = (${mathNumber(K0)} \cdot ${mathNumber(qn, 4)} - ${mathNumber(Kn)}) \cdot \frac{${mathNumber(q, 4)} - 1}{${mathNumber(qn, 4)} - 1} = ${mathNumber(rate, 4)}`} />
          </p>
        </div>
      );
      break;
    }
    case 'n': {
      const numerator = (qMinus1 * Kn) - r;
      const denominator = (qMinus1 * K0) - r;
      const qnIso = numerator / denominator;
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Startkapital: <strong>{formatCurrency(K0)} €</strong>, Entnahme: <strong>{formatCurrency(r)} €</strong>, Zinssatz:{' '}
            <strong>{formatNumber(p, 2)} %</strong>, Restkapital: <strong>{formatCurrency(Kn)} €</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Das Kapital wird nachschüssig vermindert: fixe Entnahmen nach jeder Verzinsung.
          </p>
          <p className="text-blue-900 font-semibold">Wie viele Jahre reichen die Entnahmen?</p>
        </div>
      );
      inputs = [createInputField('n', 'Jahre', 'Jahre', 'z.B. 5', n, 0.05, 0)];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`q^n = \frac{K_n (q - 1) - r}{K_0 (q - 1) - r}`} />
          </p>
          <p>
            <InlineMath math={latex`q^n = \frac{${mathNumber(Kn)} \cdot (${mathNumber(q, 4)} - 1) - ${mathNumber(r)}}{${mathNumber(K0)} \cdot (${mathNumber(q, 4)} - 1) - ${mathNumber(r)}} = ${mathNumber(qnIso, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`n = \frac{\ln(q^n)}{\ln(q)} = \frac{\ln(${mathNumber(qnIso, 4)})}{\ln(${mathNumber(q, 4)})} = ${n}`} />
          </p>
        </div>
      );
      break;
    }
    default:
      break;
  }

  return {
    type: 'kapitalminderung',
    question,
    solution,
    inputs,
  };
};

const createRentenEndwertTask = (): Task => {
  const r = randomInt(400, 1400);
  const n = randomInt(4, 10);
  const p = randomFloat(1.8, 4.8, 2);
  const q = 1 + p / 100;
  const qn = Math.pow(q, n);
  const Kn = (r * (qn - 1)) / (q - 1);
  const variant = randomChoice<RentenVariant>(['Kn', 'r', 'p', 'n']);

  const story = <p>{randomChoice(rentenContexts)}</p>;
  const areaLabel = 'nachschüssige Rentensparrate';
  const baseFormula = latex`K_n = r \cdot \frac{q^n - 1}{q - 1}`;
  const solutionIntro = renderSolutionIntro(areaLabel, baseFormula);

  let question: React.ReactNode = null;
  let inputs: TaskInput[] = [];
  let solution: React.ReactNode = null;

  switch (variant) {
    case 'Kn':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Rate: <strong>{formatCurrency(r)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong>, Laufzeit:{' '}
            <strong>{n} Jahre</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Es gibt kein Startkapital – die Sparrate wird nach den Zinsen am Jahresende eingezahlt.
          </p>
          <p className="text-blue-900 font-semibold">Wie groß ist der Endwert?</p>
        </div>
      );
      inputs = [createInputField('Kn', 'Endwert', '€', 'z.B. 18.700,00', Kn, Math.max(Kn * 0.002, 1.5))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`K_n = ${mathNumber(r)} \cdot \frac{${mathNumber(qn, 4)} - 1}{${mathNumber(q, 4)} - 1} = ${mathNumber(Kn, 4)}`} />
          </p>
        </div>
      );
      break;
    case 'r': {
      const rate = Kn * (q - 1) / (qn - 1);
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Endwert: <strong>{formatCurrency(Kn)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong>, Laufzeit:{' '}
            <strong>{n} Jahre</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Gesucht ist die nachschüssige Jahresrate ohne Startkapital.
          </p>
          <p className="text-blue-900 font-semibold">Wie hoch muss die Jahresrate sein?</p>
        </div>
      );
      inputs = [createInputField('r', 'Jahresrate', '€', 'z.B. 1.150,00', rate, Math.max(rate * 0.002, 1))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)},\; q^n = ${mathNumber(qn, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`r = ${mathNumber(Kn)} \cdot \frac{${mathNumber(q, 4)} - 1}{${mathNumber(qn, 4)} - 1} = ${mathNumber(r, 4)}`} />
          </p>
        </div>
      );
      break;
    }
    case 'p':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Rate: <strong>{formatCurrency(r)} €</strong>, Endwert: <strong>{formatCurrency(Kn)} €</strong>, Laufzeit:{' '}
            <strong>{n} Jahre</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Nachschüssige Rente ohne Startkapital: Der Zinssatz bestimmt das Wachstum.
          </p>
          <p className="text-blue-900 font-semibold">Welcher Zinssatz steckt dahinter?</p>
        </div>
      );
      inputs = [createInputField('p', 'Zinssatz', '%', 'z.B. 3,2', p, 0.05, 2)];
      solution = (
        <div className="space-y-2">
          {solutionIntro}
          <p>
            <InlineMath math={latex`\frac{K_n}{r} = \frac{q^n - 1}{q - 1}`} />
          </p>
          <p>
            Diese Gleichung wird nach <InlineMath math={latex`q`} /> gelöst (z.&nbsp;B. Tabellenkalkulation/Solver).
          </p>
          <p>
            Für die gegebenen Werte erhält man <InlineMath math={latex`q \approx ${mathNumber(q, 4)}`} /> und damit{' '}
            <InlineMath math={latex`p = (q - 1) \cdot 100 = ${formatNumber(p, 2)}\,\%`} />.
          </p>
        </div>
      );
      break;
    case 'n':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Rate: <strong>{formatCurrency(r)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong>, Endwert:{' '}
            <strong>{formatCurrency(Kn)} €</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Alle Einzahlungen erfolgen nachschüssig bei leerem Startkonto.
          </p>
          <p className="text-blue-900 font-semibold">Wie lange muss gespart werden?</p>
        </div>
      );
      inputs = [createInputField('n', 'Jahre', 'Jahre', 'z.B. 6', n, 0.05, 0)];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`q^n = 1 + \frac{K_n (q - 1)}{r}`} />
          </p>
          <p>
            <InlineMath math={latex`q^n = 1 + \frac{${mathNumber(Kn)} \cdot (${mathNumber(q, 4)} - 1)}{${mathNumber(r)}} = ${mathNumber(qn, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`n = \frac{\ln(q^n)}{\ln(q)} = \frac{\ln(${mathNumber(qn, 4)})}{\ln(${mathNumber(q, 4)})} = ${n}`} />
          </p>
        </div>
      );
      break;
    default:
      break;
  }

  return {
    type: 'renten_endwert',
    question,
    solution,
    inputs,
  };
};

interface PlanRow {
  year: number;
  restStart: number;
  interest: number;
  tilgung: number;
  annuity: number;
}

const PLAN_COLUMNS = [
  { key: 'debt', label: 'Schuld (Anfang)' },
  { key: 'interest', label: 'Zinsen' },
  { key: 'tilgung', label: 'Tilgung' },
  { key: 'annuity', label: 'Annuität' },
] as const;

type PlanColumnKey = (typeof PLAN_COLUMNS)[number]['key'];

interface PlanTableRow {
  year: number;
  cells: Record<PlanColumnKey, TaskInput>;
}

const extractPlanTable = (inputs: TaskInput[]): PlanTableRow[] | null => {
  const rows: Record<number, PlanTableRow> = {};
  let hasPlanPattern = false;

  inputs.forEach(input => {
    const match = input.id.match(/_y(\d+)_(debt|interest|tilgung|annuity)$/);
    if (!match) return;
    hasPlanPattern = true;
    const year = Number(match[1]);
    const column = match[2] as PlanColumnKey;
    if (!rows[year]) {
      rows[year] = { year, cells: {} as Record<PlanColumnKey, TaskInput> };
    }
    rows[year].cells[column] = input;
  });

  if (!hasPlanPattern) return null;

  return Object.values(rows)
    .map(row => ({
      year: row.year,
      cells: PLAN_COLUMNS.reduce((acc, col) => {
        if (!row.cells[col.key]) {
          throw new Error(`Missing ${col.key} input for Jahr ${row.year}`);
        }
        acc[col.key] = row.cells[col.key];
        return acc;
      }, {} as Record<PlanColumnKey, TaskInput>),
    }))
    .sort((a, b) => a.year - b.year);
};

const renderPlanSolution = (rows: PlanRow[]) => (
  <table className="w-full text-sm border border-blue-200 bg-white">
    <thead>
      <tr className="bg-blue-100 text-blue-900">
        <th className="p-2 text-left">Jahr</th>
        <th className="p-2 text-left">Schuld</th>
        <th className="p-2 text-left">Zins</th>
        <th className="p-2 text-left">Tilgung</th>
        <th className="p-2 text-left">Annuität</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(row => (
        <tr key={row.year} className="border-t border-blue-200">
          <td className="p-2 font-semibold">{row.year}</td>
          <td className="p-2">{formatCurrency(row.restStart)} €</td>
          <td className="p-2">{formatCurrency(row.interest)} €</td>
          <td className="p-2">{formatCurrency(row.tilgung)} €</td>
          <td className="p-2">{formatCurrency(row.annuity)} €</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const buildPlanInputs = (prefix: string, rows: PlanRow[]) =>
  rows.flatMap(row => [
    createInputField(
      `${prefix}_y${row.year}_debt`,
      `Jahr ${row.year} • Schuld`,
      '€',
      'z.B. 100.000,00',
      row.restStart,
      1
    ),
    createInputField(
      `${prefix}_y${row.year}_interest`,
      `Jahr ${row.year} • Zins`,
      '€',
      'z.B. 3.200,00',
      row.interest,
      1
    ),
    createInputField(
      `${prefix}_y${row.year}_tilgung`,
      `Jahr ${row.year} • Tilgung`,
      '€',
      'z.B. 12.500,00',
      row.tilgung,
      1
    ),
    createInputField(
      `${prefix}_y${row.year}_annuity`,
      `Jahr ${row.year} • Annuität`,
      '€',
      'z.B. 15.700,00',
      row.annuity,
      1
    ),
  ]);

const createRatendarlehenPlanTask = (): Task => {
  const loan = randomInt(50, 140) * 1000;
  const years = randomInt(5, 8);
  const rate = randomFloat(1.5, 4.0, 1);
  const tilgung = loan / years;

  const extraYear = randomInt(5, years);
  const targetYears = Array.from(new Set([1, 2, extraYear])).sort((a, b) => a - b);

  const buildRow = (year: number): PlanRow => {
    const restStart = loan - tilgung * (year - 1);
    const interest = restStart * rate / 100;
    const annuity = tilgung + interest;
    return { year, restStart, interest, tilgung, annuity };
  };

  const rows = targetYears.map(buildRow);

  const contextLine = randomChoice(ratendarlehenContexts);

  const question = (
    <div className="space-y-3">
      <p>{contextLine}</p>
      <p>
        Darlehenshöhe: <strong>{formatCurrency(loan)} €</strong>, Laufzeit: <strong>{years} Jahre</strong>, Zinssatz:{' '}
        <strong>{formatNumber(rate, 1)} %</strong>. Die Tilgung ist jedes Jahr gleich.
      </p>
      <p className="text-blue-900 font-semibold">
        Ergänze die Werte für Jahr 1, Jahr 2 sowie Jahr {targetYears[targetYears.length - 1]} (Schuld, Zins, Tilgung,
        Annuität).
      </p>
    </div>
  );

  const solution = (
    <div className="space-y-2">
      <p>
        Tilgung = {formatCurrency(tilgung)} € pro Jahr, Zins = Restschuld · {formatNumber(rate, 1)} %.
      </p>
      {renderPlanSolution(rows)}
    </div>
  );

  return {
    type: 'ratendarlehen_plan',
    question,
    solution,
    inputs: buildPlanInputs('rate', rows),
  };
};

const createAnnuitaetPlanTask = (): Task => {
  const loan = randomInt(80, 220) * 1000;
  const years = randomInt(6, 14);
  const rate = randomFloat(1.4, 3.6, 2);
  const q = 1 + rate / 100;
  const qn = Math.pow(q, years);
  const tilgungFirst = (loan * (q - 1)) / (qn - 1);
  const annuity = tilgungFirst * qn;

  const extraYear = randomInt(5, years);
  const targetYears = Array.from(new Set([1, 2, extraYear])).sort((a, b) => a - b);

  const rows: PlanRow[] = [];
  let rest = loan;
  const targets = new Set(targetYears);
  const maxTarget = targetYears[targetYears.length - 1];
  for (let year = 1; year <= maxTarget; year++) {
    const interest = rest * rate / 100;
    const tilgung = annuity - interest;
    if (targets.has(year)) {
      rows.push({ year, restStart: rest, interest, tilgung, annuity });
    }
    rest -= tilgung;
  }

  const question = (
    <div className="space-y-3">
      <p>{randomChoice(annuitaetPlanContexts)}</p>
      <p>
        Darlehenshöhe: <strong>{formatCurrency(loan)} €</strong>, Laufzeit: <strong>{years} Jahre</strong>, Zinssatz:{' '}
        <strong>{formatNumber(rate, 2)} %</strong>. Die Annuität bleibt konstant.
      </p>
      <p className="text-blue-900 font-semibold">
        Ergänze die Werte für Jahr 1, Jahr 2 sowie Jahr {targetYears[targetYears.length - 1]} (Schuld, Zinsanteil, Tilgung, Annuität).
      </p>
    </div>
  );

  const solution = (
    <div className="space-y-2">
      <p>
        Anfangstilgung <InlineMath math={latex`T_1 = \frac{K_0 (q - 1)}{q^n - 1}`} />, Annuität <InlineMath math={latex`A = T_1 \cdot q^n`} />.
      </p>
      {renderPlanSolution(rows)}
    </div>
  );

  return {
    type: 'annuitaet_plan',
    question,
    solution,
    inputs: buildPlanInputs('ann', rows),
  };
};

const generators: Record<TaskType, () => Task> = {
  simple_interest: createSimpleInterestTask,
  zinseszins: createZinseszinsTask,
  kapitalmehrung: createKapitalmehrungTask,
  kapitalminderung: createKapitalminderungTask,
  renten_endwert: createRentenEndwertTask,
  ratendarlehen_plan: createRatendarlehenPlanTask,
  annuitaet_plan: createAnnuitaetPlanTask,
};

const randomTaskType = (): TaskType => randomChoice<TaskType>(taskTypes);

const resolveTaskTypeForFilter = (filter: FilterType): TaskType => {
  if (filter === 'mixed') return randomTaskType();
  if (filter === 'renten_bundled') return randomChoice(rentenBundleTypes);
  return filter;
};

const createTaskForFilter = (filter: FilterType) => {
  const type = resolveTaskTypeForFilter(filter);
  return generators[type]();
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const createCards = (filter: FilterType): TaskCard[] => {
  const buildCard = (task: Task, index: number): TaskCard => ({
    id: index + 1,
    task,
    userAnswers: buildInputRecord(task),
    feedback: null,
    feedbackType: null,
    solutionVisible: false,
  });

  if (filter === 'mixed') {
    const baseTypes: TaskType[] = [...taskTypes];
    while (baseTypes.length < TASK_COUNT) {
      baseTypes.push(randomTaskType());
    }
    const selection = shuffleArray(baseTypes).slice(0, TASK_COUNT);
    return selection.map((type, index) => buildCard(generators[type](), index));
  }

  if (filter === 'renten_bundled') {
    const rentenTypes: TaskType[] = [...rentenBundleTypes];
    while (rentenTypes.length < TASK_COUNT) {
      rentenTypes.push(randomChoice(rentenBundleTypes));
    }
    const selection = shuffleArray(rentenTypes).slice(0, TASK_COUNT);
    return selection.map((type, index) => buildCard(generators[type](), index));
  }

  return Array.from({ length: TASK_COUNT }, (_, index) => buildCard(createTaskForFilter(filter), index));
};

export default function GemischteFinanzaufgaben() {
  const [filter, setFilter] = useState<FilterType>('mixed');
  const [cards, setCards] = useState<TaskCard[]>(() => createCards('mixed'));
  const [stats, setStats] = useState(() => createInitialStats());

  useEffect(() => {
    setCards(createCards(filter));
    setStats(createInitialStats());
  }, [filter]);

  const regenerateCard = (id: number) => {
    setCards(prev =>
      prev.map(card => {
        if (card.id !== id) return card;
        const task = createTaskForFilter(filter);
        return {
          ...card,
          task,
          userAnswers: buildInputRecord(task),
          feedback: null,
          feedbackType: null,
          solutionVisible: false,
        };
      })
    );
  };

  const regenerateAll = () => {
    setCards(createCards(filter));
    setStats(createInitialStats());
  };

  const handleInputChange = (cardId: number, inputId: string, value: string) => {
    setCards(prev =>
      prev.map(card =>
        card.id === cardId
          ? { ...card, userAnswers: { ...card.userAnswers, [inputId]: value } }
          : card
      )
    );
  };

  const checkAnswer = (id: number) => {
    let attempt: 'correct' | 'incorrect' | 'invalid' = 'invalid';

    setCards(prev =>
      prev.map(card => {
        if (card.id !== id) return card;

        const missingInput = card.task.inputs.some(input => !card.userAnswers[input.id]?.trim());
        if (missingInput) {
          attempt = 'invalid';
          return {
            ...card,
            feedback: 'Bitte alle Felder ausfüllen (Komma oder Punkt sind erlaubt).',
            feedbackType: 'incorrect',
          };
        }

        const wrongFields: TaskInput[] = [];

        card.task.inputs.forEach(input => {
          const parsed = parseFloat(card.userAnswers[input.id].replace(',', '.'));
          if (Number.isNaN(parsed) || Math.abs(parsed - input.correctValue) > input.tolerance) {
            wrongFields.push(input);
          }
        });

        const isCorrect = wrongFields.length === 0;
        attempt = isCorrect ? 'correct' : 'incorrect';

        return {
          ...card,
          feedback: isCorrect ? (
            `Stark! Alle Werte stimmen. (+${POINTS_PER_CORRECT} Punkte)`
          ) : (
            <div>
              Nicht ganz. Richtige Werte:
              <ul className="mt-2 space-y-1 text-sm">
                {wrongFields.map(field => (
                  <li key={field.id}>
                    <strong>{field.label}:</strong>{' '}
                    {formatValueWithUnit(field.correctValue, field.unit, field.displayDecimals ?? 2)}
                  </li>
                ))}
              </ul>
            </div>
          ),
          feedbackType: isCorrect ? 'correct' : 'incorrect',
        };
      })
    );

    if (attempt !== 'invalid') {
      setStats(prev => ({
        correct: prev.correct + (attempt === 'correct' ? 1 : 0),
        total: prev.total + 1,
        streak: attempt === 'correct' ? prev.streak + 1 : 0,
        points: prev.points + (attempt === 'correct' ? POINTS_PER_CORRECT : 0),
      }));
    }
  };

  const showSolution = (id: number) => {
    setCards(prev =>
      prev.map(card =>
        card.id === id
          ? {
              ...card,
              solutionVisible: true,
              feedback: null,
              feedbackType: null,
            }
          : card
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-100">
      <div className="flex-1 flex flex-col items center px-3 py-8 sm:px-6">
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10">
          <div className="text-center mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-500 font-semibold">Finanzmathematik</p>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Gemischte Übungsaufgaben</h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Jede Runde liefert zehn Szenarien aus allen Themenblöcken – mindestens eine Aufgabe pro Bereich. Regeneriere
              einzelne Karten oder den kompletten Stapel.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {taskFilterButtons.map(btn => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition border ${
                  filter === btn.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-end mb-6">
            <button
              onClick={regenerateAll}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 shadow"
            >
              Alle Aufgaben neu
            </button>
          </div>

          <div className="space-y-6">
            {cards.map(card => (
              <div key={card.id} className="border border-slate-200 rounded-2xl p-5 shadow-sm bg-white">
                <div className="flex flex-wrap justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 border border-blue-200">
                      Aufgabe {card.id}
                    </span>
                  </div>
                  <button
                    onClick={() => regenerateCard(card.id)}
                    className="text-sm text-purple-600 font-semibold hover:underline"
                  >
                    Aufgabe neu
                  </button>
                </div>

                <div className="text-base text-slate-800 leading-relaxed mb-4">{card.task.question}</div>

                {(() => {
                  const planTable = extractPlanTable(card.task.inputs);
                  if (!planTable) {
                    return (
                      <div className="grid gap-3 mb-3">
                        {card.task.inputs.map(input => (
                          <div key={input.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <label className="font-semibold text-slate-600 sm:min-w-[220px]">{input.label}:</label>
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={card.userAnswers[input.id]}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleInputChange(card.id, input.id, e.target.value)
                                }
                                placeholder={input.placeholder}
                                className="flex-1 border-2 border-slate-300 rounded-xl px-4 py-2 text-lg focus:outline-none focus:border-blue-400"
                              />
                              <span className="text-xl font-bold text-slate-600">{input.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full border border-slate-200 text-sm">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700">
                            <th className="p-2 text-center font-semibold">Jahr</th>
                            {PLAN_COLUMNS.map(col => (
                              <th key={col.key} className="p-2 text-center font-semibold">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {planTable.map((row, index) => {
                            const rowsToRender: React.ReactNode[] = [];
                            if (index > 0 && row.year - planTable[index - 1].year > 1) {
                              rowsToRender.push(
                                <tr key={`gap-${row.year}`}>
                                  <td colSpan={PLAN_COLUMNS.length + 1} className="p-2 text-center text-slate-400">
                                    …
                                  </td>
                                </tr>
                              );
                            }
                            rowsToRender.push(
                              <tr key={`plan-row-${row.year}`} className="border-t border-slate-200">
                                <td className="p-2 text-center font-semibold text-slate-600">{row.year}</td>
                                {PLAN_COLUMNS.map(col => {
                                  const input = row.cells[col.key];
                                  return (
                                    <td key={col.key} className="p-2 align-middle">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          aria-label={`${col.label} Jahr ${row.year}`}
                                          value={card.userAnswers[input.id]}
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleInputChange(card.id, input.id, e.target.value)
                                          }
                                          placeholder={input.placeholder}
                                          className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-blue-400"
                                        />
                                        <span className="text-base font-semibold text-slate-600">{input.unit}</span>
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                            return rowsToRender;
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                <div className="flex flex-wrap gap-3 mb-3 justify-center text-center">
                  <button
                    onClick={() => checkAnswer(card.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow"
                  >
                    Überprüfen
                  </button>
                  <button
                    onClick={() => showSolution(card.id)}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-xl shadow"
                  >
                    Lösung zeigen
                  </button>
                </div>

                {card.feedback && (
                  <div
                    className={`mb-3 rounded-2xl px-4 py-3 font-semibold shadow border ${
                      card.feedbackType === 'correct'
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    {card.feedback}
                  </div>
                )}

                {card.solutionVisible && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-900">
                    <h3 className="font-semibold mb-2">Musterlösung:</h3>
                    <div className="space-y-2 text-base">{card.task.solution}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-8">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="text-3xl font-bold text-emerald-600">{stats.points}</div>
              <p className="text-sm text-slate-600">Punkte</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="text-3xl font-bold text-blue-800">{stats.correct}</div>
              <p className="text-sm text-slate-600">richtig</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="text-3xl font-bold text-purple-600">{stats.streak}</div>
              <p className="text-sm text-slate-600">Streak</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="text-3xl font-bold text-blue-800">{stats.total}</div>
              <p className="text-sm text-slate-600">Versuche</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

