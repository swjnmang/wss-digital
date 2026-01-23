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
  | 'annuitaet_plan'
  | 'incomplete_tilgungsplan';

type FilterType = TaskType | 'mixed' | 'renten_bundled';

type SimpleInterestVariant = 'Z' | 'K' | 'p' | 't';
type ZinseszinsVariant = 'Kn' | 'K0' | 'p' | 'n';
type KapitalmehrungVariant = 'Kn' | 'K0' | 'r' | 'n';
type RentenVariant = 'Kn' | 'r' | 'K0' | 'n';
type KapitalminderungVariant = 'Kn' | 'K0' | 'r' | 'n';

interface TaskInput {
  id: string;
  label: string;
  unit: string;
  placeholder: string;
  correctValue: number | string;
  tolerance: number;
  displayDecimals?: number;
  type?: 'number' | 'select';
  options?: string[];
}

interface Task {
  type: TaskType;
  question: React.ReactNode;
  solution: React.ReactNode;
  inputs: TaskInput[];
  pointsAwarded?: number; // Punkte für diese Aufgabe basierend auf Schwierigkeit
  formula?: string; // Grundformel für Tipp (LaTeX)
  _incompleteRows?: Array<{ year: number; restStart: number; interest: number; tilgung: number; annuity: number; hiddenFields: Set<string> }>;
  _hiddenFields?: Map<number, Set<string>>;
}

interface TaskCard {
  id: number;
  task: Task;
  userAnswers: Record<string, string>;
  feedback: React.ReactNode | null;
  feedbackType: 'correct' | 'incorrect' | null;
  solutionVisible: boolean;
  tipVisible?: boolean;
}

const taskTypes: TaskType[] = [
  'simple_interest',
  'zinseszins',
  'kapitalmehrung',
  'kapitalminderung',
  'renten_endwert',
  'ratendarlehen_plan',
  'annuitaet_plan',
  'incomplete_tilgungsplan',
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
  
  // Generiere zwei verschiedene Monate im selben Jahr
  const startMonth = randomInt(1, 11); // 1-11, damit Platz für Endmonat bleibt
  const endMonth = randomInt(startMonth + 1, 12); // Endmonat nach Startmonat
  
  // Generiere Tage (vereinfacht auf 1-28 um Gültigkeit zu sichern)
  const startDay = randomInt(1, 28);
  const endDay = randomInt(1, 28);
  
  const startDate = new Date(year, startMonth - 1, startDay);
  const endDate = new Date(year, endMonth - 1, endDay);
  
  // Berechne Zinstage nach Schulformel: t = (monat2 - monat1) * 30 + (tag2 - tag1)
  const days = (endMonth - startMonth) * 30 + (endDay - startDay);
  
  return {
    startLabel: formatDateLabel(startDate),
    endLabel: formatDateLabel(endDate),
    days: days,
  };
};

// Namen für Darlehensverträge
const lenderNames = ['Alpina Bank', 'Bergland Kreditbank', 'Stadtische Sparbank', 'Mittelwald Finance', 'Nordlicht Finanzhaus', 'Waldviertel Darlehensgesellschaft'];
const lenderAddresses = ['Marienplatz 8, 80331 München', 'Schwabing 12, 80804 München', 'Karlsplatz 1, 80333 München', 'Neuhauser Str. 5, 80331 München'];

const borrowerFirstNames = ['Anna', 'Benjamin', 'Caroline', 'David', 'Emma', 'Frank', 'Greta', 'Heinrich', 'Iris', 'Jonas', 'Katharina', 'Laura', 'Markus', 'Natalia', 'Oliver', 'Petra', 'Quirin', 'Rita', 'Stefan', 'Theresa', 'Ulrich', 'Vanessa', 'Werner', 'Xiomara', 'Yannick', 'Zenobia'];
const borrowerLastNames = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Richter', 'Kaiser', 'Krämer', 'Blum', 'Spitz', 'Roth', 'Friedrich', 'Bergmann'];

interface LoanParty {
  name: string;
  street: string;
  postal: string;
  city: string;
}

const generateLoanParty = (type: 'lender' | 'borrower'): LoanParty => {
  if (type === 'lender') {
    return {
      name: randomChoice(lenderNames),
      street: 'Hauptstr. ' + randomInt(1, 200),
      postal: '800' + randomInt(0, 9) + randomInt(0, 9),
      city: 'München',
    };
  } else {
    const firstName = randomChoice(borrowerFirstNames);
    const lastName = randomChoice(borrowerLastNames);
    return {
      name: firstName + ' ' + lastName,
      street: randomChoice(['Schillerstr.', 'Ludwigstr.', 'Maximilianstr.', 'Leopoldstr.', 'Fürstenstr.']) + ' ' + randomInt(1, 150),
      postal: '800' + randomInt(0, 9) + randomInt(0, 9),
      city: randomChoice(['München', 'Schwabing', 'Neuhausen', 'Pasing', 'Bogenhausen']),
    };
  }
};

// Vertragskomponenten
interface LoanContractProps {
  lender: LoanParty;
  borrower: LoanParty;
  loanAmount: number;
  interestRate: number;
  duration: number;
  type: 'rate' | 'annuity';
  tilgung?: number;
  annuity?: number;
}

type ContractDesign = 'classic' | 'modern' | 'compact' | 'minimal' | 'detailed';

const getRandomContractDesign = (): ContractDesign => {
  const designs: ContractDesign[] = ['classic', 'modern', 'compact', 'minimal', 'detailed'];
  return randomChoice(designs);
};

// Design 1: Classic - Zeitloses Design mit Rahmen
const LoanContractClassic: React.FC<LoanContractProps> = ({
  lender,
  borrower,
  loanAmount,
  interestRate,
  duration,
  type,
}) => (
  <div className="mb-6 border-2 border-gray-800 p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
    <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
      <h2 className="text-2xl font-bold tracking-wide">Darlehensvertrag</h2>
      <p className="text-sm text-gray-600 mt-2">zwischen</p>
    </div>

    <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
      <div>
        <p className="font-bold mb-2">{lender.name}</p>
        <p className="text-gray-700">{lender.street}</p>
        <p className="text-gray-700">{lender.postal} {lender.city}</p>
        <p className="text-gray-600 text-xs mt-2">(nachfolgend Darlehensgeber genannt)</p>
      </div>
      <div>
        <p className="font-bold mb-2">{borrower.name}</p>
        <p className="text-gray-700">{borrower.street}</p>
        <p className="text-gray-700">{borrower.postal} {borrower.city}</p>
        <p className="text-gray-600 text-xs mt-2">(nachfolgend Darlehensnehmer genannt)</p>
      </div>
    </div>

    <p className="text-center text-sm mb-6 text-gray-700">wird folgender Vertrag geschlossen.</p>

    <div className="space-y-4 text-sm">
      <div>
        <h3 className="font-bold mb-1">§ 1 Darlehensbetrag</h3>
        <p className="text-gray-700">Der Darlehensgeber gewährt dem Darlehensnehmern ein Darlehen in Höhe von <span className="font-semibold">{formatCurrency(loanAmount)} €</span>.</p>
      </div>
      <div>
        <h3 className="font-bold mb-1">§ 2 Laufzeit</h3>
        <p className="text-gray-700">Das Darlehen hat eine Laufzeit von <span className="font-semibold">{duration} Jahren</span> ab dem Auszahlungsdatum.</p>
      </div>
      <div>
        <h3 className="font-bold mb-1">§ 3 Zinsen</h3>
        <p className="text-gray-700">Das Darlehen ist mit <span className="font-semibold">{formatNumber(interestRate, type === 'rate' ? 1 : 2)} % p.a.</span> zu verzinsen. Die Zinsen werden jährlich berechnet.</p>
      </div>
      <div>
        <h3 className="font-bold mb-1">§ 4 Tilgung</h3>
        {type === 'rate' ? (
          <p className="text-gray-700">Das Darlehen ist in jährlich gleichbleibenden Tilgungsraten jeweils zum 31.12. eines jeden Jahres zu tilgen.</p>
        ) : (
          <p className="text-gray-700">Das Darlehen ist durch jährlich gleiche Annuitäten jeweils zum 31.12. eines jeden Jahres zu tilgen. Die Annuität setzt sich aus Zinsanteil und Tilgungsanteil zusammen.</p>
        )}
      </div>
    </div>
  </div>
);

// Design 2: Modern - Modernes Design mit Farben
const LoanContractModern: React.FC<LoanContractProps> = ({
  lender,
  borrower,
  loanAmount,
  interestRate,
  duration,
  type,
}) => (
  <div className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg max-w-3xl border border-blue-300 mx-auto">
    <div className="text-center mb-6 pb-4">
      <h2 className="text-3xl font-bold text-blue-900">Darlehensvertrag</h2>
      <div className="h-1 bg-blue-400 mt-3 mx-auto w-24 rounded-full"></div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
      <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
        <p className="font-bold text-blue-900 mb-1">{lender.name}</p>
        <p className="text-gray-600">{lender.street}</p>
        <p className="text-gray-600">{lender.postal} {lender.city}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
        <p className="font-bold text-blue-900 mb-1">{borrower.name}</p>
        <p className="text-gray-600">{borrower.street}</p>
        <p className="text-gray-600">{borrower.postal} {borrower.city}</p>
      </div>
    </div>

    <div className="space-y-3 text-sm">
      <div className="bg-white p-3 rounded-lg">
        <p className="text-blue-900 font-bold">Darlehensbetrag: <span className="text-lg">{formatCurrency(loanAmount)} €</span></p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <p className="text-blue-900 font-bold">Laufzeit: <span className="text-lg">{duration} Jahre</span></p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <p className="text-blue-900 font-bold">Zinssatz: <span className="text-lg">{formatNumber(interestRate, type === 'rate' ? 1 : 2)} % p.a.</span></p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <p className="text-blue-900 font-bold">Tilgungsmodus: <span className="text-lg">{type === 'rate' ? 'Gleichbleibende Tilgungsraten' : 'Annuitätendarlehen'}</span></p>
      </div>
    </div>
  </div>
);

// Design 3: Compact - Kompaktes Design
const LoanContractCompact: React.FC<LoanContractProps> = ({
  lender,
  borrower,
  loanAmount,
  interestRate,
  duration,
  type,
}) => (
  <div className="mb-6 bg-slate-100 p-4 rounded-lg max-w-3xl border-l-4 border-slate-700 mx-auto">
    <h2 className="text-xl font-bold mb-3 text-slate-800">Darlehensvertrag</h2>
    
    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
      <div>
        <p className="font-bold text-slate-700">{lender.name}</p>
        <p className="text-slate-600">{lender.street}, {lender.postal} {lender.city}</p>
      </div>
      <div>
        <p className="font-bold text-slate-700">{borrower.name}</p>
        <p className="text-slate-600">{borrower.street}, {borrower.postal} {borrower.city}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded">
      <div><span className="font-bold">Betrag:</span> {formatCurrency(loanAmount)} €</div>
      <div><span className="font-bold">Laufzeit:</span> {duration} J.</div>
      <div><span className="font-bold">Zins:</span> {formatNumber(interestRate, type === 'rate' ? 1 : 2)} %</div>
      <div><span className="font-bold">Tilgung:</span> {type === 'rate' ? 'Raten' : 'Annuität'}</div>
    </div>
  </div>
);

// Design 4: Minimal - Minimalistisches Design
const LoanContractMinimal: React.FC<LoanContractProps> = ({
  lender,
  borrower,
  loanAmount,
  interestRate,
  duration,
  type,
}) => (
  <div className="mb-6 p-4 max-w-3xl mx-auto">
    <h2 className="text-2xl font-bold mb-4">Darlehensvertrag</h2>
    
    <div className="text-sm text-gray-700 space-y-2 mb-4">
      <p><span className="font-bold">Gläubiger:</span> {lender.name}, {lender.street}, {lender.postal} {lender.city}</p>
      <p><span className="font-bold">Schuldner:</span> {borrower.name}, {borrower.street}, {borrower.postal} {borrower.city}</p>
    </div>

    <div className="text-sm space-y-1 border-t border-b border-gray-300 py-3 mb-4">
      <p>• Darlehensbetrag: <span className="font-semibold">{formatCurrency(loanAmount)} €</span></p>
      <p>• Laufzeit: <span className="font-semibold">{duration} Jahre</span></p>
      <p>• Zinssatz: <span className="font-semibold">{formatNumber(interestRate, type === 'rate' ? 1 : 2)} %</span> p.a.</p>
      <p>• Tilgung: <span className="font-semibold">{type === 'rate' ? 'Gleichbleibende Raten' : 'Annuität'}</span></p>
    </div>
  </div>
);

// Design 5: Detailed - Detailliertes Design mit mehr Struktur
const LoanContractDetailed: React.FC<LoanContractProps> = ({
  lender,
  borrower,
  loanAmount,
  interestRate,
  duration,
  type,
}) => (
  <div className="mb-6 border-2 border-green-700 p-6 bg-green-50 rounded-lg max-w-3xl mx-auto">
    <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-green-700">
      <h2 className="text-2xl font-bold text-green-900">Darlehensvertrag</h2>
      <div className="text-xs text-green-700 font-bold">Finanzdokument</div>
    </div>

    <div className="mb-6">
      <h3 className="font-bold text-green-900 mb-2">Vertragsbeteiligte</h3>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="bg-green-100 p-3 rounded">
          <p className="text-green-900 font-bold text-xs mb-1">DARLEHENSGEBER</p>
          <p className="font-semibold">{lender.name}</p>
          <p className="text-gray-700">{lender.street}</p>
          <p className="text-gray-700">{lender.postal} {lender.city}</p>
        </div>
        <div className="bg-green-100 p-3 rounded">
          <p className="text-green-900 font-bold text-xs mb-1">DARLEHENSNEHMER</p>
          <p className="font-semibold">{borrower.name}</p>
          <p className="text-gray-700">{borrower.street}</p>
          <p className="text-gray-700">{borrower.postal} {borrower.city}</p>
        </div>
      </div>
    </div>

    <div className="mb-4">
      <h3 className="font-bold text-green-900 mb-2">Vertragsbedingungen</h3>
      <table className="w-full text-sm">
        <tbody>
          <tr className="border-b border-green-300">
            <td className="py-2 font-semibold text-green-900">Darlehensbetrag</td>
            <td className="py-2 text-right font-semibold">{formatCurrency(loanAmount)} €</td>
          </tr>
          <tr className="border-b border-green-300">
            <td className="py-2 font-semibold text-green-900">Laufzeit</td>
            <td className="py-2 text-right font-semibold">{duration} Jahre</td>
          </tr>
          <tr className="border-b border-green-300">
            <td className="py-2 font-semibold text-green-900">Zinssatz (p.a.)</td>
            <td className="py-2 text-right font-semibold">{formatNumber(interestRate, type === 'rate' ? 1 : 2)} %</td>
          </tr>
          <tr>
            <td className="py-2 font-semibold text-green-900">Tilgungsmodus</td>
            <td className="py-2 text-right font-semibold">{type === 'rate' ? 'Ratentilgung' : 'Annuitätentilgung: Die Summe aus Zins und Tilgung ist jedes Jahr gleich'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// Wrapper-Komponente, die zufällig ein Design auswählt
const LoanContract: React.FC<LoanContractProps> = (props) => {
  const design = getRandomContractDesign();
  
  switch (design) {
    case 'classic':
      return <LoanContractClassic {...props} />;
    case 'modern':
      return <LoanContractModern {...props} />;
    case 'compact':
      return <LoanContractCompact {...props} />;
    case 'minimal':
      return <LoanContractMinimal {...props} />;
    case 'detailed':
      return <LoanContractDetailed {...props} />;
    default:
      return <LoanContractClassic {...props} />;
  }
};

const simpleInterestContexts = [
  'Markus hat von seinem Opa Geld geschenkt bekommen und legt es für kurze Zeit bei der Bank an.',
  'Sophie hat bei einem Wettbewerb gewonnen und parkt das Geld vorübergehend auf einem Tagesgeldkonto.',
  'Der Sportverein erhält ein Sponsoring und lässt das Geld kurzfristig arbeiten.',
  'Ein Handwerksbetrieb legt Reserven für ein paar Monate bei der Bank an.',
  'Die Familie Müller spart auf eine Reise und legt das Geld mit Zinsen an.',
] as const;

const zinseszinsContexts = [
  'Ein Schüler erhält eine Erbschaft und möchte diese sicher anlegen, um sie langfristig wachsen zu lassen.',
  'Eine Familie möchte einen Betrag sparen und mit Zinseszins aufbauen.',
  'Jemand legt Geld an und interessiert sich für die zukünftige Entwicklung des Vermögens.',
  'Eine Person spart auf ein Ziel hin und möchte mit Zinseszins rechnen.',
  'Ein Schüler erhält Preisgeld und möchte wissen, wie sich dieses entwickelt.',
  'Jemand möchte sein Ersparte sicher und mit guten Zinsen anlegen.',
  'Eine Familie plant eine Geldanlage mit regelmäßiger Verzinsung.',
  'Ein Schüler rechnet mit Zinseszins für verschiedene Szenarien.',
] as const;

// Kapitalmehrung: Fall Kn (Endkapital gesucht)
const kapitalmehrungKnContexts = [
  'Die Nachhaltigkeits-AG startet mit einem Grundstock und zahlt am Jahresende zusätzliche Beträge ein.',
  'Der Makerspace spart für einen Lasercutter und füttert das Konto jede Saison mit Projektbeiträgen.',
  'Eine Schülerfirma investiert ihre Jahresgewinne in einen Innovationsfonds.',
  'Der Förderverein sammelt Spendenmittel und macht regelmäßige Jahresverstärkungen.',
  'Eine Jugendgruppe baute sich ein Kapital auf, mit jährlichen Zusätzen zum Sparen.',
  'Ein junges Unternehmen wächst: Mit Startkapital und Reinvestitionen zum Erfolg.',
  'Der Schulverein plant: Stiftungsgründung durch Kapitalaufbau mit Jahresbeiträgen.',
  'Eine Familie spart auf ein Ziel hin: Kombination aus Erbschaft und jährlichen Sparbeiträgen.',
] as const;

// Kapitalmehrung: Fall K0 (Startkapital gesucht)
const kapitalmehrungK0Contexts = [
  'Mit welchem Startkapital und jährlichen Zusatzzahlungen erreicht man ein bestimmtes Endziel?',
  'Ein Projekt braucht eine Anschubfinanzierung: Welches Startkapital ist nötig bei regelmäßigen Jahresverstärkungen?',
  'Rückwärts rechnen: Bei bekanntem Sparplan, welches Startguthaben war erforderlich?',
  'Die Finanzplanung: Welcher Anfangsbetrag und jährliche Raten führen zum Ziel?',
  'Startbudget berechnen: Wie viel muss am Anfang eingezahlt werden bei dem gegebenen Sparplan?',
  'Ein Ziel ist bekannt, die jährlichen Raten feststehen – wie viel Startgeld war nötig?',
  'Investitionsrechnung rückwärts: Welches Anfangskapital ist erforderlich?',
  'Mit diesem Kapitalaufbau zum bekannten Endziel: Welcher Anfangsbetrag?',
] as const;

// Kapitalmehrung: Fall r (Rate gesucht)
const kapitalmehrungRContexts = [
  'Mit einem festen Startguthaben und gezielten Jahresraten zum Endziel sparen.',
  'Das Startkapital ist bekannt: Wie viel muss jährlich zusätzlich eingezahlt werden?',
  'Der Sparplan: Welche Jahresrate führt mit Startkapital zum angestrebten Betrag?',
  'Mit bekanntem Anfangskapital: Welche Jahreseinzahlung ist für das Ziel notwendig?',
  'Die Spardauer ist festgelegt: Welche jährliche Rate braucht man zum geplanten Kapital?',
  'Bei dieser Laufzeit und diesem Ziel: Welche konstanten Jahresraten sind erforderlich?',
  'Wie viel muss jährlich dazu kommen, um diesen Plan zu erfüllen?',
  'Die Investitionsstrategie: Welche jährliche Verstärkung führt zum Erfolg?',
] as const;

// Kapitalmehrung: Fall n (Laufzeit gesucht)
const kapitalmehrungNContexts = [
  'Mit Startkapital und fester Jahresrate sparen: Wie lange bis zum Ziel?',
  'Zeitrahmen planen: Nach wie vielen Jahren ist das Endziel erreicht?',
  'Sparplanung: Wann ist die Sparsumme mit gegebener Rate zusammen?',
  'Die Geduld wird gelohnt: In wie vielen Jahren zeichnet sich das Ersparte ab?',
  'Laufzeitberechnung: Wie lange spart man bei konstanter Jahresrate zum Erfolg?',
  'Bei diesem Aufbau: Wie lange braucht das Projekt zum Zielkapital?',
  'Wie lange reicht die Sparzeit mit dieser Strategie?',
  'Investitionsplanung: In wie vielen Jahren ist das Zielbudget erreicht?',
] as const;

// Kapitalminderung: Fall Kn (Restkapital gesucht)
const kapitalminderungKnContexts = [
  'Der Förderverein entnimmt jedes Jahr Geld aus dem Rücklagenkonto, um eine soziale Initiative zu finanzieren.',
  'Ein Schulorchester zahlt sich jährlich Reisezuschüsse aus seiner Startkasse aus.',
  'Die Umwelt-AG reduziert ihren Klimafonds, indem sie jedes Jahr Projektgelder entnimmt.',
  'Ein Stiftungskapital wird durch Jahresentnahmen aufgebraucht: Wie viel bleibt am Ende?',
  'Mit regelmäßigen Entnahmen vom Ersparten leben: Welches Restkapital ist nach der Laufzeit noch da?',
  'Ein Rentenfonds schrumpft durch regelmäßige Auszahlungen: Wie viel ist noch übrig?',
  'Die Altersvorsorge wird aufgebraucht: Nach der Laufzeit, wie viel fehlt noch zum Ziel?',
  'Rückgang durch Rückzahlungen: Welcher Betrag verbleibt nach allen Entnahmen?',
] as const;

// Kapitalminderung: Fall K0 (Startkapital gesucht)
const kapitalminderungK0Contexts = [
  'Welches Anfangskapital war nötig, um über Jahre hinweg regelmäßige Entnahmen zu machen?',
  'Rückwärts planen: Bei bekannten Entnahmen und geplanten Restkapital, wie viel war am Anfang nötig?',
  'Das Startbudget: Welches Anfangskapital ermöglicht regelmäßige Auszahlungen über die Zeit?',
  'Kapitalplanung: Mit welchem Startkapital und Entnahmen führt die Rechnung zu diesem Endzustand?',
  'Anfangsbestand berechnen: Welcher Betrag war erforderlich für den gegebenen Entnahmeplan?',
  'Rückwärtsrechnung: Bei dieser Entnahmerate bis zum Restkapital, welcher Anfangsbetrag?',
  'Wie hoch muss das Anfangskapital sein für diesen Entnahmeplan?',
  'Kapitalanlage-Berechnung: Welche Einzahlung ist nötig für diese Auszahlungsserie?',
] as const;

// Kapitalminderung: Fall r (Entnahme gesucht)
const kapitalminderungRContexts = [
  'Mit einem Startguthaben und bekannter Ziellaufzeit: Welche Jahresentnahmen sind möglich?',
  'Das verfügbare Kapital und die geplante Nutzungsdauer sind bekannt: Wie viel kann man jährlich entnehmen?',
  'Rente vom Ersparten: Welche feste Jahresentnahme ist möglich?',
  'Jahresentnahmen berechnen: Bei gegebenem Anfangs- und Endkapital, welche Rate ist möglich?',
  'Die Frage nach der möglichen Auszahlung: Welcher Betrag kann regelmäßig entnommen werden?',
  'Wie viel darf ich monatlich, entschuldigung, jährlich entnehmen?',
  'Bei diesem Kapital und dieser Dauer: Welche konstanten Entnahmen sind erlaubt?',
  'Rentensicherung: Welche regelmäßige Auszahlung ist möglich?',
] as const;

// Kapitalminderung: Fall n (Laufzeit gesucht)
const kapitalminderungNContexts = [
  'Mit festen Jahresentnahmen vom Konto: Wie lange reicht das Kapital?',
  'Die Entnahmerate ist bekannt: Nach wie vielen Jahren ist das Geld aufgebraucht?',
  'Wie lange hält das Geld bei gegebenen Jahrzahlungen?',
  'Entnahmeplan: In wie vielen Jahren ist der Kapitalbestand aufgebraucht?',
  'Lebensdauer des Kapitals: Wie lange kann man bei dieser Rate entnehmen?',
  'Restlaufzeit berechnen: Nach wie vielen Jahren erreicht man das Endziel?',
  'Rentendauer planen: Wie lange reichen die Mittel?',
  'Countdown zum Kapitalende: Wie viele Jahre liegen noch vor uns?',
] as const;

// Rentenrechnung: Fall Kn (Endwert gesucht)
const rentenKnContexts = [
  'Ein Schulteam spart für eine Abschlussreise: Jedes Jahr werden die gleichen Beträge am Jahresende eingezahlt.',
  'Der Theaterkurs plant die Anschaffung von Kulissen: Legen Sie das Budget als Jahresrenten an.',
  'Der Chor sammelt für eine Konzerttournee: Jährliche Einzahlungen am Ende des Jahres sollen sich aufzinsen.',
  'Ein Student möchte nach dem Abitur ein Auslandssemester finanzieren: Jedes Jahr Ersparnisse anlegen.',
  'Die Robotik-AG spart für neue Ausrüstung: Gleichmäßige Jahresrenten mit Zinseffekt aufgebaut.',
  'Eine Klasse träumt von einer Studienfahrt und spart mit gleichbleibenden Jahrbeiträgen.',
  'Der Schülerrat legt für ein Sommerfest Rücklagen an: Monatliche Einzahlungen bringen Zinsertrag.',
  'Eine Sportgruppe sammelt für neue Trainingsmaterialien durch regelmäßiges Sparen.',
] as const;

// Rentenrechnung: Fall r (Rate gesucht)
const rentenRContexts = [
  'Für die Abschlussfahrt wird ein festes Sparziel angestrebt: Welche gleiche Jahresrate muss eingezahlt werden?',
  'Die Schülerfirma will einen bestimmten Betrag sparen: Wie viel muss jährlich eingezahlt werden?',
  'Ein Schulverein legt einen Rücklagenbetrag an: Welche Jahresrate wird benötigt, um dieses Ziel zu erreichen?',
  'Für den neuen Sportplatz wird durch Jahresrenten gesammelt: Welche Jahresrate braucht man für das Zielbudget?',
  'Der Musikverein möchte sein Instrumentenbudget aufbauen: Wie hoch muss die jährliche Einzahlung sein?',
  'Welche regelmäßige Sparsumme führt zum angestrebten Traum-Endziel?',
  'Mit gleichen Jahrauszahlungen zu einem konkreten Ersparten: Wie hoch muss jeder Jahresbetrag sein?',
  'Ein Projekt braucht Sparmittel: Welche konstante Jahresrate ist erforderlich?',
] as const;

// Rentenrechnung: Fall n (Zeit gesucht)
const rentenNContexts = [
  'Mit fester Jahresrate sparen: Wie lange dauert es, bis die Sparsumme erreicht ist?',
  'Die Sportgruppe spart mit gleichbleibenden Jahresbeiträgen: Nach wie vielen Jahren ist das Ziel erreicht?',
  'Ein Projekt wird durch jährliche gleiche Einzahlungen finanziert: Wann reicht das gesparte Kapital?',
  'Die AG spart mit konstanter Jahresrate: Wie lange bis zum geplanten Projekt?',
  'Mit regelmäßigen Jahreseinzahlungen sparen: Nach wie vielen Jahren liegt genug Geld vor?',
  'Der Traum rückt näher: Wie lange reichen die Jahrzahlungen zum Ziel?',
  'Welche Spardauer ist notwendig, um die Endsumme zu erreichen?',
  'Mit konstanten jährlichen Beiträgen zum Erfolg: Wie viele Jahre dauert es?',
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
  const Z_rounded = parseFloat(Z.toFixed(2)); // Gerundete Version für Darstellung und weitere Berechnungen

  const durationInfo = useDateRange ? 
    `Zeitraum: ${dateRange!.startLabel} bis ${dateRange!.endLabel} (bankübliches 360-Tage-Jahr).` : 
    `Dauer: ${t} Tage.`;

  const baseStory = `${randomChoice(simpleInterestContexts)} Alle Angaben beziehen sich auf dieselbe Geldanlage.`;

  let question: React.ReactNode = null;
  let inputs: TaskInput[] = [];
  let solution: React.ReactNode = null;

  switch (variant) {
    case 'Z': {
      question = (
        <p>
          {baseStory} Er/Sie legt <strong>{formatCurrency(K)} €</strong> an. Die Bank bietet einen Zinssatz von <strong>{formatNumber(p, 2)} %</strong> p.a. {durationInfo} <span className="text-blue-900 font-semibold">Wie viel Zinsen bekommt er/sie gutgeschrieben?</span>
        </p>
      );
      inputs = [createInputField('Z', '', '€', 'z.B. 248,50', Z_rounded, Math.max(Z_rounded * 0.005, 0.5))];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`Z = \frac{K \cdot p \cdot t}{100 \cdot 360}`} />
          </p>
          <p>
            <InlineMath math={latex`Z = \frac{${mathNumber(K)} \cdot ${mathNumber(p)} \cdot ${mathNumber(t)}}{36000}`} />
          </p>
          <p><strong>{formatCurrency(Z_rounded)} €</strong></p>
        </div>
      );
      break;
    }
    case 'K': {
      const capital = (Z_rounded * 100 * 360) / (p * t);
      question = (
        <p>
          {baseStory} Die Bank bietet einen Zinssatz von <strong>{formatNumber(p, 2)} %</strong> p.a. an. {durationInfo} Am Ende der Anlagezeit werden ihm/ihr <strong>{formatCurrency(Z_rounded)} €</strong> an Zinsen gutgeschrieben. <span className="text-blue-900 font-semibold">Welcher Betrag wurde ursprünglich angelegt?</span>
        </p>
      );
      inputs = [createInputField('K', '', '€', 'z.B. 18.500,00', capital, Math.max(capital * 0.005, 1))];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`K = \frac{Z \cdot 100 \cdot 360}{p \cdot t}`} />
          </p>
          <p>
            <InlineMath math={latex`K = \frac{${mathNumber(Z_rounded)} \cdot 36000}{${mathNumber(p)} \cdot ${mathNumber(t)}}`} />
          </p>
          <p><strong>{formatCurrency(capital)} €</strong></p>
        </div>
      );
      break;
    }
    case 'p': {
      const rate = (Z_rounded * 100 * 360) / (K * t);
      question = (
        <p>
          {baseStory} Er/Sie legt <strong>{formatCurrency(K)} €</strong> an. {durationInfo} Nach der Anlagezeit erhält er/sie <strong>{formatCurrency(Z_rounded)} €</strong> an Zinsen. <span className="text-blue-900 font-semibold">Wie hoch war der vereinbarte Zinssatz?</span>
        </p>
      );
      inputs = [createInputField('p', '', '%', 'z.B. 4,25', rate, 0.05, 2)];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`p = \frac{Z \cdot 100 \cdot 360}{K \cdot t}`} />
          </p>
          <p>
            <InlineMath math={latex`p = \frac{${mathNumber(Z_rounded)} \cdot 36000}{${mathNumber(K)} \cdot ${mathNumber(t)}}`} />
          </p>
          <p><strong>{formatNumber(rate, 2)} %</strong></p>
        </div>
      );
      break;
    }
    case 't': {
      const days = (Z_rounded * 100 * 360) / (K * p);
      question = (
        <p>
          {baseStory} Er/Sie legt <strong>{formatCurrency(K)} €</strong> an einem Konto mit <strong>{formatNumber(p, 2)} %</strong> Zinsen p.a. an. Als die Anlage beendet wird, erhält er/sie <strong>{formatCurrency(Z_rounded)} €</strong> an Zinsen. <span className="text-blue-900 font-semibold">Wie lange war das Geld angelegt?</span>
        </p>
      );
      inputs = [createInputField('t', '', 'Tage', 'z.B. 180', days, 0.5, 1)];
      solution = (
        <div className="space-y-1">
          <p>
            <InlineMath math={latex`t = \frac{Z \cdot 100 \cdot 360}{K \cdot p}`} />
          </p>
          <p>
            <InlineMath math={latex`t = \frac{${mathNumber(Z_rounded)} \cdot 36000}{${mathNumber(K)} \cdot ${mathNumber(p)}}`} />
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
    formula: latex`Z = \frac{K \cdot p \cdot t}{100 \cdot 360}`,
    pointsAwarded: 5,
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
            Startsumme: <strong>{formatCurrency(K0)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a.
          </p>
          <p>Nach {n} Jahren und ohne Abhebungen oder Einzahlungen:</p>
          <p className="text-blue-900 font-semibold">Wie viel Geld befindet sich dann auf dem Konto?</p>
        </div>
      );
      inputs = [createInputField('Kn', '', '€', 'z.B. 14.200,00', Kn, Math.max(Kn * 0.005, 1.5))];
      solution = (
        <div className="space-y-1 text-sm">
          <p><strong>Gegeben:</strong> <InlineMath math={latex`K_0 = ${mathNumber(K0)}\,€; \quad p = ${mathNumber(p, 2)}\,\%; \quad n = ${n}\text{ Jahre}`} /></p>
          <p><strong>Gesucht:</strong> <InlineMath math={latex`K_n`} /></p>
          <p><strong>Ursprungsformel:</strong> <InlineMath math={latex`K_n = K_0 \cdot q^n`} /></p>
          <p><strong>Werte einsetzen:</strong></p>
          <p className="ml-4"><InlineMath math={latex`q = 1 + \frac{${mathNumber(p, 2)}}{100} = ${mathNumber(q, 4)}`} /></p>
          <p className="ml-4"><InlineMath math={latex`K_n = ${mathNumber(K0)} \cdot ${mathNumber(q, 4)}^{${n}}`} /></p>
          <p><strong>Berechnung:</strong></p>
          <p className="ml-4"><InlineMath math={latex`K_n = ${mathNumber(K0)} \cdot ${mathNumber(q, 4)}^{${n}} = ${mathNumber(Kn, 2)}`} /></p>
          <p><strong>Ergebnis:</strong> <InlineMath math={latex`K_n = ${mathNumber(Kn, 2)}\,€`} /></p>
        </div>
      );
      break;
    case 'K0':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Nach {n} Jahren liegt der Kontostand bei <strong>{formatCurrency(Kn)} €</strong>. Der Zinssatz war die ganze Zeit <strong>{formatNumber(p, 2)} %</strong> p.a.
          </p>
          <p className="text-blue-900 font-semibold">Welchen Betrag muss er/sie ursprünglich eingezahlt haben?</p>
        </div>
      );
      inputs = [createInputField('K0', '', '€', 'z.B. 12.000,00', K0, Math.max(K0 * 0.005, 1.5))];
      solution = (
        <div className="space-y-1 text-sm">
          <p><strong>Gegeben:</strong> <InlineMath math={latex`K_n = ${mathNumber(Kn, 2)}\,€; \quad p = ${mathNumber(p, 2)}\,\%; \quad n = ${n}\text{ Jahre}`} /></p>
          <p><strong>Gesucht:</strong> <InlineMath math={latex`K_0`} /></p>
          <p><strong>Ursprungsformel:</strong> <InlineMath math={latex`K_n = K_0 \cdot q^n`} /></p>
          <p><strong>Werte einsetzen:</strong></p>
          <p className="ml-4"><InlineMath math={latex`q = 1 + \frac{${mathNumber(p, 2)}}{100} = ${mathNumber(q, 4)}`} /></p>
          <p className="ml-4"><InlineMath math={latex`${mathNumber(Kn, 2)} = K_0 \cdot ${mathNumber(q, 4)}^{${n}} \quad | : ${mathNumber(q, 4)}^{${n}}`} /></p>
          <p><strong>Umformen nach K₀:</strong></p>
          <p className="ml-4"><InlineMath math={latex`K_0 = \frac{${mathNumber(Kn, 2)}}{${mathNumber(q, 4)}^{${n}}} = ${mathNumber(K0, 2)}`} /></p>
          <p><strong>Ergebnis:</strong> <InlineMath math={latex`K_0 = ${mathNumber(K0, 2)}\,€`} /></p>
        </div>
      );
      break;
    case 'p':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Er/Sie legt <strong>{formatCurrency(K0)} €</strong> an. Nach <strong>{n} Jahren</strong> ist das Geld auf <strong>{formatCurrency(Kn)} €</strong> gewachsen (keine Abhebungen oder Einzahlungen dazwischen).
          </p>
          <p className="text-blue-900 font-semibold">Wie hoch war der jährliche Zinssatz?</p>
        </div>
      );
      inputs = [createInputField('p', '', '%', 'z.B. 3,8', p, 0.05, 2)];
      solution = (
        <div className="space-y-1 text-sm">
          <p><strong>Gegeben:</strong> <InlineMath math={latex`K_0 = ${mathNumber(K0)}\,€; \quad K_n = ${mathNumber(Kn, 2)}\,€; \quad n = ${n}\text{ Jahre}`} /></p>
          <p><strong>Gesucht:</strong> <InlineMath math={latex`p`} /></p>
          <p><strong>Ursprungsformel:</strong> <InlineMath math={latex`K_n = K_0 \cdot q^n`} /></p>
          <p><strong>Werte einsetzen:</strong></p>
          <p className="ml-4"><InlineMath math={latex`${mathNumber(Kn, 2)} = ${mathNumber(K0)} \cdot q^{${n}} \quad | : ${mathNumber(K0)}`} /></p>
          <p><strong>Nach q auflösen:</strong></p>
          <p className="ml-4"><InlineMath math={latex`q^{${n}} = \frac{${mathNumber(Kn, 2)}}{${mathNumber(K0)}} \quad | \sqrt[${n}]{\;}`} /></p>
          <p className="ml-4"><InlineMath math={latex`q = \sqrt[${n}]{\frac{${mathNumber(Kn, 2)}}{${mathNumber(K0)}}} = ${mathNumber(q, 4)}`} /></p>
          <p><strong>In Prozent umformen:</strong></p>
          <p className="ml-4"><InlineMath math={latex`p = (q - 1) \cdot 100 = (${mathNumber(q, 4)} - 1) \cdot 100 = ${mathNumber(p, 2)}\,\%`} /></p>
          <p><strong>Ergebnis:</strong> Der Zinssatz liegt bei <InlineMath math={latex`${mathNumber(p, 2)}\,\%`} /> p.a.</p>
        </div>
      );
      break;
    case 'n':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Startbetrag: <strong>{formatCurrency(K0)} €</strong>, angestrebter Endbetrag: <strong>{formatCurrency(Kn)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a.
          </p>
          <p className="text-blue-900 font-semibold">Wie lange muss das Geld angelegt werden, um den Endbetrag zu erreichen?</p>
        </div>
      );
      inputs = [createInputField('n', '', 'Jahre', 'z.B. 4', n, 0.05, 0)];
      solution = (
        <div className="space-y-1 text-sm">
          <p><strong>Gegeben:</strong> <InlineMath math={latex`K_0 = ${mathNumber(K0)}\,€; \quad K_n = ${mathNumber(Kn, 2)}\,€; \quad p = ${mathNumber(p, 2)}\,\%`} /></p>
          <p><strong>Gesucht:</strong> <InlineMath math={latex`n`} /></p>
          <p><strong>Ursprungsformel:</strong> <InlineMath math={latex`K_n = K_0 \cdot q^n`} /></p>
          <p><strong>Werte einsetzen:</strong></p>
          <p className="ml-4"><InlineMath math={latex`q = 1 + \frac{${mathNumber(p, 2)}}{100} = ${mathNumber(q, 4)}`} /></p>
          <p className="ml-4"><InlineMath math={latex`${mathNumber(Kn, 2)} = ${mathNumber(K0)} \cdot ${mathNumber(q, 4)}^{n} \quad | : ${mathNumber(K0)}`} /></p>
          <p><strong>Nach n auflösen:</strong></p>
          <p className="ml-4"><InlineMath math={latex`${mathNumber(q, 4)}^{n} = \frac{${mathNumber(Kn, 2)}}{${mathNumber(K0)}} \quad | \log_{${mathNumber(q, 4)}}`} /></p>
          <p className="ml-4"><InlineMath math={latex`n = \log_{${mathNumber(q, 4)}}\left(\frac{${mathNumber(Kn, 2)}}{${mathNumber(K0)}}\right) = ${n}`} /></p>
          <p><strong>Ergebnis:</strong> <InlineMath math={latex`n = ${n}\text{ Jahre}`} /></p>
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
    formula: latex`K_n = K_0 \cdot q^n`,
    pointsAwarded: 5,
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

  let story: React.ReactNode = null;
  let contextText: string = '';
  
  // Wähle Kontext basierend auf Variant
  if (variant === 'Kn') {
    contextText = randomChoice(kapitalmehrungKnContexts);
  } else if (variant === 'K0') {
    contextText = randomChoice(kapitalmehrungK0Contexts);
  } else if (variant === 'r') {
    contextText = randomChoice(kapitalmehrungRContexts);
  } else if (variant === 'n') {
    contextText = randomChoice(kapitalmehrungNContexts);
  }
  
  story = <p>{contextText}</p>;
  const areaLabel = 'Kapitalmehrung';
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
            Momentan verfügt sie über <strong>{formatCurrency(K0)} €</strong>. Am Ende eines jeden Jahres werden zusätzlich <strong>{formatCurrency(r)} €</strong> eingezahlt. Die Zinsen betragen <strong>{formatNumber(p, 2)} %</strong> p.a. Über <strong>{n} Jahre</strong>.
          </p>
          <p className="text-blue-900 font-semibold">Welcher Endbetrag hat sich nach {n} Jahren angesammelt?</p>
        </div>
      );
      inputs = [createInputField('Kn', '', '€', 'z.B. 42.500,00', Kn, Math.max(Kn * 0.005, 2))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`K_n = ${mathNumber(K0)} \cdot ${mathNumber(q, 4)}^{${n}} + ${mathNumber(r)} \cdot \frac{${mathNumber(q, 4)}^{${n}} - 1}{${mathNumber(q, 4)} - 1} = ${mathNumber(Kn, 4)}`} />
          </p>
        </div>
      );
      break;
    case 'K0':
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Nach <strong>{n} Jahren</strong> mit jährlichen Zusatzeinzahlungen von <strong>{formatCurrency(r)} €</strong> (am Jahresende) soll <strong>{formatCurrency(Kn)} €</strong> erreicht sein. Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a.
          </p>
          <p className="text-blue-900 font-semibold">Welcher Startbetrag war erforderlich?</p>
        </div>
      );
      inputs = [createInputField('K0', '', '€', 'z.B. 28.000,00', K0, Math.max(K0 * 0.005, 2))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`K_0 = \frac{K_n - r \cdot \frac{q^n - 1}{q - 1}}{q^n}`} />
          </p>
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`K_0 = \frac{${mathNumber(Kn)} - ${mathNumber(r)} \cdot \frac{${mathNumber(q, 4)}^{${n}} - 1}{${mathNumber(q, 4)} - 1}}{${mathNumber(q, 4)}^{${n}}} = ${mathNumber(K0, 4)}`} />
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
            Startkapital: <strong>{formatCurrency(K0)} €</strong>, Zielwert nach <strong>{n} Jahren</strong>: <strong>{formatCurrency(Kn)} €</strong>. Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a. (Einzahlungen jeweils am Jahresende).
          </p>
          <p className="text-blue-900 font-semibold">Welche jährliche Einzahlung ist notwendig?</p>
        </div>
      );
      inputs = [createInputField('r', '', '€', 'z.B. 3.200,00', rate, Math.max(rate * 0.005, 1.5))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`r = \left(K_n - K_0 \cdot q^n\right) \cdot \frac{q - 1}{q^n - 1}`} />
          </p>
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`r = \left(${mathNumber(Kn)} - ${mathNumber(K0)} \cdot ${mathNumber(q, 4)}^{${n}}\right) \cdot \frac{${mathNumber(q, 4)} - 1}{${mathNumber(q, 4)}^{${n}} - 1} = ${mathNumber(r, 4)}`} />
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
            Mit <strong>{formatCurrency(K0)} €</strong> Startkapital und jährlichen Einzahlungen von <strong>{formatCurrency(r)} €</strong> (jeweils zum Jahresende) sollen <strong>{formatCurrency(Kn)} €</strong> erreicht werden. Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a.
          </p>
          <p className="text-blue-900 font-semibold">Nach wie vielen Jahren ist das Zielkapital erreicht?</p>
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
            <InlineMath math={latex`n = \log_q(q^n) = \log_q(${mathNumber(isoQN, 4)}) = ${n}`} />
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
    formula: latex`K_n = K_0 \cdot q^n + r \cdot \frac{q^n - 1}{q - 1}`,
    pointsAwarded: variant === 'n' ? 15 : 8, // 15 für n berechnen (sehr schwer), 8 für andere (mittel)
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

  let story: React.ReactNode = null;
  let contextText: string = '';
  
  // Wähle Kontext basierend auf Variant
  if (variant === 'Kn') {
    contextText = randomChoice(kapitalminderungKnContexts);
  } else if (variant === 'K0') {
    contextText = randomChoice(kapitalminderungK0Contexts);
  } else if (variant === 'r') {
    contextText = randomChoice(kapitalminderungRContexts);
  } else if (variant === 'n') {
    contextText = randomChoice(kapitalminderungNContexts);
  }
  
  story = <p>{contextText}</p>;
  const areaLabel = 'Kapitalminderung';
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
            Das Konto verfügt über ein Startguthaben von <strong>{formatCurrency(K0)} €</strong>. Am Ende eines jeden Jahres wird <strong>{formatCurrency(r)} €</strong> entnommen. Der Zinssatz beträgt <strong>{formatNumber(p, 2)} %</strong> p.a. Über <strong>{n} Jahre</strong>.
          </p>
          <p className="text-blue-900 font-semibold">Welcher Betrag bleibt am Ende nach allen Entnahmen übrig?</p>
        </div>
      );
      inputs = [createInputField('Kn', '', '€', 'z.B. 14.800,00', Kn, Math.max(Kn * 0.005, 1.5))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`K_n = ${mathNumber(K0)} \, ${mathNumber(q, 4)}^{${n}} - ${mathNumber(r)} \cdot \frac{${mathNumber(q, 4)}^{${n}} - 1}{${mathNumber(q, 4)} - 1} = ${mathNumber(Kn, 4)}`} />
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
            Jährliche Entnahmen: <strong>{formatCurrency(r)} €</strong> am Jahresende. Nach <strong>{n} Jahren</strong> sollen noch <strong>{formatCurrency(Kn)} €</strong> übrig sein. Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a.
          </p>
          <p className="text-blue-900 font-semibold">Welches Startkapital war erforderlich?</p>
        </div>
      );
      inputs = [createInputField('K0', '', '€', 'z.B. 35.000,00', startCapital, Math.max(startCapital * 0.005, 2))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`K_0 = \frac{K_n + r \cdot \frac{q^n - 1}{q - 1}}{q^n}`} />
          </p>
          <p>
            <InlineMath math={latex`K_0 = \frac{${mathNumber(Kn)} + ${mathNumber(r)} \cdot \frac{${mathNumber(q, 4)}^{${n}} - 1}{${mathNumber(q, 4)} - 1}}{${mathNumber(q, 4)}^{${n}}} = ${mathNumber(startCapital, 4)}`} />
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
            Startkapital: <strong>{formatCurrency(K0)} €</strong>, Restkapital nach <strong>{n} Jahren</strong>: <strong>{formatCurrency(Kn)} €</strong>. Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a. (Entnahmen am Jahresende).
          </p>
          <p className="text-blue-900 font-semibold">Welche jährliche Entnahme ist möglich?</p>
        </div>
      );
      inputs = [createInputField('r', '', '€', 'z.B. 4.500,00', rate, Math.max(rate * 0.005, 1.5))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`r = (K_0 q^n - K_n) \cdot \frac{q - 1}{q^n - 1}`} />
          </p>
          <p>
            <InlineMath math={latex`r = (${mathNumber(K0)} \cdot ${mathNumber(q, 4)}^{${n}} - ${mathNumber(Kn)}) \cdot \frac{${mathNumber(q, 4)} - 1}{${mathNumber(q, 4)}^{${n}} - 1} = ${mathNumber(rate, 4)}`} />
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
            Mit <strong>{formatCurrency(K0)} €</strong> Startkapital werden jährlich <strong>{formatCurrency(r)} €</strong> am Jahresende entnommen. Noch übriges Kapital: <strong>{formatCurrency(Kn)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a.
          </p>
          <p className="text-blue-900 font-semibold">Nach wie vielen Jahren ist dieser Zustand erreicht?</p>
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
            <InlineMath math={latex`n = \log_q(q^n) = \log_q(${mathNumber(qnIso, 4)}) = ${n}`} />
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
    formula: latex`K_n = K_0 \cdot q^n - r \cdot \frac{q^n - 1}{q - 1}`,
    pointsAwarded: variant === 'n' ? 15 : 8, // 15 für n berechnen (sehr schwer), 8 für andere (mittel)
  };
};

const createRentenEndwertTask = (): Task => {
  const r = randomInt(400, 1400);
  const n = randomInt(4, 10);
  const p = randomFloat(1.8, 4.8, 2);
  const q = 1 + p / 100;
  const qn = Math.pow(q, n);
  const Kn = (r * (qn - 1)) / (q - 1);
  const variant = randomChoice<RentenVariant>(['Kn', 'r', 'K0', 'n']);

  // Determine points based on variant
  const getPointsForVariant = (v: RentenVariant): number => {
    if (v === 'Kn') return 8;      // Mittel
    if (v === 'r') return 15;      // Sehr schwer - Rate bestimmen
    if (v === 'K0') return 15;     // Sehr schwer - Anfangskapital bestimmen
    if (v === 'n') return 15;      // Sehr schwer - Zeit bestimmen
    return 8;
  };

  let story: React.ReactNode = null;
  let contextText: string = '';
  
  // Wähle Kontext basierend auf Variant
  if (variant === 'Kn') {
    contextText = randomChoice(rentenKnContexts);
  } else if (variant === 'r') {
    contextText = randomChoice(rentenRContexts);
  } else if (variant === 'K0') {
    contextText = randomChoice(rentenKnContexts); // Verwende ähnliche Kontexte
  } else if (variant === 'n') {
    contextText = randomChoice(rentenNContexts);
  }
  
  story = <p>{contextText}</p>;
  const areaLabel = 'Rentensparrate';
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
            Die Sparquote liegt bei <strong>{formatCurrency(r)} €</strong> pro Jahr (Einzahlung am Ende des Jahres). Die Bank bietet <strong>{formatNumber(p, 2)} %</strong> Verzinsung p.a.
          </p>
          <p className="text-blue-900 font-semibold">Wie viel Geld hat sich nach {n} Jahren angesammelt?</p>
        </div>
      );
      inputs = [createInputField('Kn', '', '€', 'z.B. 18.700,00', Kn, Math.max(Kn * 0.005, 1.5))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`K_n = ${mathNumber(r)} \cdot \frac{${mathNumber(q, 4)}^{${n}} - 1}{${mathNumber(q, 4)} - 1} = ${mathNumber(Kn, 4)}`} />
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
            Zielkapital: <strong>{formatCurrency(Kn)} €</strong>. Zeitraum: <strong>{n} Jahre</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a., Einzahlungen jeweils am Jahresende.
          </p>
          <p className="text-blue-900 font-semibold">Welcher gleiche Jahresbetrag muss eingezahlt werden?</p>
        </div>
      );
      inputs = [createInputField('r', '', '€', 'z.B. 1.150,00', rate, Math.max(rate * 0.005, 1))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`q = 1 + \frac{${mathNumber(p)}}{100} = ${mathNumber(q, 4)}`} />
          </p>
          <p>
            <InlineMath math={latex`r = ${mathNumber(Kn)} \cdot \frac{${mathNumber(q, 4)} - 1}{${mathNumber(q, 4)}^{${n}} - 1} = ${mathNumber(rate, 4)}`} />
          </p>
        </div>
      );
      break;
    }
    case 'K0': {
      // K0 (Anfangskapital): Lege Betrag an, der sich ansammelt
      const K0 = Kn / qn;
      question = (
        <div className="space-y-2">
          {story}
          <p>
            Nach <strong>{n} Jahren</strong> mit jährlichen Zusatzeinzahlungen von <strong>{formatCurrency(r)} €</strong> (jeweils am Jahresende) soll <strong>{formatCurrency(Kn)} €</strong> erreicht sein. Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a.
          </p>
          <p className="text-blue-900 font-semibold">Welches Anfangskapital war notwendig?</p>
        </div>
      );
      inputs = [createInputField('K0', '', '€', 'z.B. 8.500,00', K0, Math.max(K0 * 0.005, 1))];
      solution = (
        <div className="space-y-1">
          {solutionIntro}
          <p>
            <InlineMath math={latex`K_0 = \frac{${mathNumber(Kn)}}{${mathNumber(q, 4)}^{${n}}} = ${mathNumber(K0, 4)}`} />
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
            Jährliche Sparquote: <strong>{formatCurrency(r)} €</strong> (jeweils am Jahresende eingezahlt). Zielkapital: <strong>{formatCurrency(Kn)} €</strong>, Zinssatz: <strong>{formatNumber(p, 2)} %</strong> p.a.
          </p>
          <p className="text-blue-900 font-semibold">Wie viele Jahre sind erforderlich, um das Ziel zu erreichen?</p>
        </div>
      );
      inputs = [createInputField('n', '', 'Jahre', 'z.B. 6', n, 0.05, 0)];
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
            <InlineMath math={latex`n = \log_q(q^n) = \log_q(${mathNumber(qn, 4)}) = ${n}`} />
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
    formula: latex`K_n = r \cdot \frac{q^n - 1}{q - 1}`,
    pointsAwarded: getPointsForVariant(variant),
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
    const match = input.id.match(/(?:_y|incomplete_plan_y)(\d+)_(debt|interest|tilgung|annuity)$/);
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

  // Für incomplete_tilgungsplan: Akzeptiere auch unvollständige Reihen (nur versteckte Felder)
  // Für andere Plans: Verlange alle 4 Spalten
  return Object.values(rows)
    .map(row => {
      const cells: Record<string, TaskInput> = {};
      const cellsArray = Object.values(row.cells);
      const hasIncompletePattern = cellsArray.length > 0 && 
        cellsArray[0]?.id?.includes('incomplete_plan');
      
      if (hasIncompletePattern) {
        // Für incomplete plans: Nur die Felder verwenden, die vorhanden sind
        PLAN_COLUMNS.forEach(col => {
          if (row.cells[col.key]) {
            cells[col.key] = row.cells[col.key];
          }
        });
      } else {
        // Für normale plans: Alle 4 Spalten verlangen
        PLAN_COLUMNS.forEach(col => {
          if (!row.cells[col.key]) {
            throw new Error(`Missing ${col.key} input for Jahr ${row.year}`);
          }
          cells[col.key] = row.cells[col.key];
        });
      }
      
      return {
        year: row.year,
        cells: cells as Record<PlanColumnKey, TaskInput>,
      };
    })
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
      '',
      '€',
      'z.B. 100.000,00',
      row.restStart,
      0.02
    ),
    createInputField(
      `${prefix}_y${row.year}_interest`,
      '',
      '€',
      'z.B. 3.200,00',
      row.interest,
      0.02
    ),
    createInputField(
      `${prefix}_y${row.year}_tilgung`,
      '',
      '€',
      'z.B. 12.500,00',
      row.tilgung,
      0.02
    ),
    createInputField(
      `${prefix}_y${row.year}_annuity`,
      '',
      '€',
      'z.B. 15.700,00',
      row.annuity,
      0.02
    ),
  ]);

const createRatendarlehenPlanTask = (): Task => {
  const loan = randomInt(50, 140) * 1000;
  const years = randomInt(5, 8);
  const rate = randomFloat(1.5, 4.0, 1);
  const tilgung = loan / years;

  const lender = generateLoanParty('lender');
  const borrower = generateLoanParty('borrower');

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
    <div className="space-y-4">
      <LoanContract
        lender={lender}
        borrower={borrower}
        loanAmount={loan}
        interestRate={rate}
        duration={years}
        type="rate"
        tilgung={tilgung}
      />
      <div>
        <p className="mb-3">{contextLine}</p>
        <p className="text-blue-900 font-semibold">
          Ergänze die Werte für Jahr 1, Jahr 2 sowie Jahr {targetYears[targetYears.length - 1]} (Schuld, Zins, Tilgung,
          Annuität).
        </p>
      </div>
    </div>
  );

  const solution = (
    <div className="space-y-2">
      <p>
        Tilgung T = {formatCurrency(tilgung)} € pro Jahr, Zins = Restschuld · {formatNumber(rate, 1)} %.
      </p>
      {renderPlanSolution(rows)}
    </div>
  );

  return {
    type: 'ratendarlehen_plan',
    question,
    solution,
    inputs: buildPlanInputs('rate', rows),
    formula: '1. Die Tilgung ist konstant: T = Darlehen ÷ Laufzeit\n2. Für jedes Jahr: Zinsen = Restschuld × Zinssatz\n3. Annuität = Tilgung + Zinsen\n4. Neue Restschuld = Restschuld − Tilgung',
    pointsAwarded: 12,
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

  const lender = generateLoanParty('lender');
  const borrower = generateLoanParty('borrower');

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
    rest = Math.round(rest * 100) / 100;  // Round to 2 decimals to avoid floating-point errors
  }

  const question = (
    <div className="space-y-4">
      <LoanContract
        lender={lender}
        borrower={borrower}
        loanAmount={loan}
        interestRate={rate}
        duration={years}
        type="annuity"
        annuity={annuity}
      />
      <div>
        <p className="mb-3">{randomChoice(annuitaetPlanContexts)}</p>
        <p className="text-blue-900 font-semibold">
          Ergänze die Werte für Jahr 1, Jahr 2 sowie Jahr {targetYears[targetYears.length - 1]} (Schuld, Zinsanteil, Tilgung, Annuität).
        </p>
      </div>
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
    formula: '1. Die Annuität ist konstant: A = T₁ × q^n (bereits gegeben oder zu berechnen)\n2. Für jedes Jahr: Zinsen = Restschuld × Zinssatz\n3. Tilgung = Annuität − Zinsen\n4. Neue Restschuld = Restschuld − Tilgung',
    pointsAwarded: 12,
  };
};

const createIncompleteTilgungsplanTask = (): Task => {
  const isRatenplan = Math.random() < 0.5;
  const loan = randomInt(50, 200) * 1000;
  const years = randomInt(5, 10);
  const rate = randomFloat(1.5, 4.0, isRatenplan ? 1 : 2);
  
  let rows: PlanRow[] = [];
  let tilgungsart: 'Ratentilgung' | 'Annuitätentilgung';
  
  if (isRatenplan) {
    tilgungsart = 'Ratentilgung';
    const tilgung = loan / years;
    for (let year = 1; year <= 2; year++) {
      const restStart = loan - tilgung * (year - 1);
      const interest = restStart * rate / 100;
      const annuity = tilgung + interest;
      rows.push({ year, restStart, interest, tilgung, annuity });
    }
  } else {
    tilgungsart = 'Annuitätentilgung';
    const q = 1 + rate / 100;
    const qn = Math.pow(q, years);
    const tilgungFirst = (loan * (q - 1)) / (qn - 1);
    const annuity = tilgungFirst * qn;
    
    let rest = loan;
    for (let year = 1; year <= 2; year++) {
      const interest = rest * rate / 100;
      const tilgung = annuity - interest;
      rows.push({ year, restStart: rest, interest, tilgung, annuity });
      rest -= tilgung;
    }
  }
  
  // Erstelle halb ausgefüllten Plan mit gezielt fehlenden Zellen
  // Wichtig: Das definierende Merkmal (konstante Tilgung oder Annuität) MUSS sichtbar sein,
  // damit der Schüler die Tilgungsart erkennen kann!
  const incompleteRows = rows.map((row, yearIndex) => {
    const hide = new Set<string>();
    
    if (isRatenplan) {
      // Ratentilgung: Tilgung ist konstant und IMMER sichtbar
      // Pro Jahr unterschiedliche Kombinationen verstecken
      
      if (yearIndex === 0) {
        // Jahr 1: restStart + Tilgung sichtbar → Schüler kann Zinsen + Annuität berechnen
        hide.add('interest');
        hide.add('annuity');
      } else {
        // Jahr 2: Tilgung + Annuität sichtbar → Schüler kann Zinsen + restStart berechnen
        hide.add('restStart');
        hide.add('interest');
      }
    } else {
      // Annuitätentilgung: Annuität ist konstant und IMMER sichtbar
      // Pro Jahr unterschiedliche Kombinationen verstecken
      
      if (yearIndex === 0) {
        // Jahr 1: restStart + Annuität sichtbar → Schüler kann Zinsen + Tilgung berechnen
        hide.add('interest');
        hide.add('tilgung');
      } else {
        // Jahr 2: Tilgung + Annuität sichtbar → Schüler kann Zinsen berechnen
        hide.add('restStart');
        hide.add('interest');
      }
    }

    return {
      year: row.year,
      restStart: row.restStart,
      interest: row.interest,
      tilgung: row.tilgung,
      annuity: row.annuity,
      hiddenFields: hide,
    };
  });

  const question = (
    <div className="space-y-4">
      <p className="text-gray-700">
        <strong>Aufgabe:</strong> Vervollständige den Tilgungsplan und gib an, um welche Tilgungsart es sich handelt.
      </p>
    </div>
  );

  const solution = (
    <div className="space-y-2">
      <p><strong>Tilgungsart:</strong> {tilgungsart}</p>
      {renderPlanSolution(rows)}
    </div>
  );

  // Füge Select für Tilgungsart hinzu - ZUERST in der Array
  const inputs: TaskInput[] = [];
  
  inputs.push({
    id: 'tilgungsart',
    label: 'Tilgungsart',
    unit: '',
    placeholder: 'Wähle aus',
    correctValue: tilgungsart,
    tolerance: 0,
    type: 'select',
    options: ['Ratentilgung', 'Annuitätentilgung'],
    displayDecimals: 0,
  });

  // Dann Inputs für alle fehlenden Zellen
  incompleteRows.forEach((row) => {
    if (row.hiddenFields.has('restStart')) {
      inputs.push({
        id: `incomplete_plan_y${row.year}_debt`,
        label: '',
        unit: '€',
        placeholder: 'z.B. 100.000,00',
        correctValue: row.restStart,
        tolerance: 0.02,
        displayDecimals: 2,
      });
    }
    if (row.hiddenFields.has('interest')) {
      inputs.push({
        id: `incomplete_plan_y${row.year}_interest`,
        label: '',
        unit: '€',
        placeholder: 'z.B. 3.200,00',
        correctValue: row.interest,
        tolerance: 0.02,
        displayDecimals: 2,
      });
    }
    if (row.hiddenFields.has('tilgung')) {
      inputs.push({
        id: `incomplete_plan_y${row.year}_tilgung`,
        label: '',
        unit: '€',
        placeholder: 'z.B. 12.500,00',
        correctValue: row.tilgung,
        tolerance: 0.02,
        displayDecimals: 2,
      });
    }
    if (row.hiddenFields.has('annuity')) {
      inputs.push({
        id: `incomplete_plan_y${row.year}_annuity`,
        label: '',
        unit: '€',
        placeholder: 'z.B. 15.700,00',
        correctValue: row.annuity,
        tolerance: 0.02,
        displayDecimals: 2,
      });
    }
  });

  return {
    type: 'incomplete_tilgungsplan',
    question,
    solution,
    inputs,
    formula: 'Erkenne das Muster: Ist die Tilgung konstant (Ratentilgung) oder die Annuität konstant (Annuitätentilgung)? Das verrät die Tilgungsart. Nutze dann:\n• Bei Ratentilgung: T konstant, Zinsen = Restschuld × p%, Annuität = T + Zinsen\n• Bei Annuitätentilgung: A konstant, Zinsen = Restschuld × p%, Tilgung = A − Zinsen',
    _incompleteRows: incompleteRows, // Speichere die Reihen für das Rendering
    pointsAwarded: 8,
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
  incomplete_tilgungsplan: createIncompleteTilgungsplanTask,
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
    tipVisible: false,
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

// Exports für Prüfungsmodus
export {
  createSimpleInterestTask,
  createZinseszinsTask,
  createKapitalmehrungTask,
  createKapitalminderungTask,
  createRentenEndwertTask,
  createRatendarlehenPlanTask,
  createAnnuitaetPlanTask,
};

export default function GemischteFinanzaufgaben() {
  const [filter, setFilter] = useState<FilterType>('mixed');
  const [cards, setCards] = useState<TaskCard[]>(() => createCards('mixed'));
  const [stats, setStats] = useState(() => createInitialStats());
  const [notifications, setNotifications] = useState<Array<{ id: string; points: number }>>([]);

  // Debug: Log wenn Stats sich ändern
  useEffect(() => {
    console.log('Stats changed:', stats);
  }, [stats]);

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
          tipVisible: false,
        };
      })
    );
  };

  const regenerateAll = () => {
    setCards(createCards(filter));
    setStats(createInitialStats());
  };

  // Parst deutsche Zahlenformate: "99.000,00" oder "99000,00" oder "99000"
  const parseGermanNumber = (str: string): number => {
    let cleaned = str.trim();
    
    // Wenn Komma vorhanden, ist das der Dezimaltrennzeichen
    // Alle Punkte davor sind Tausender-Trennzeichen
    if (cleaned.includes(',')) {
      cleaned = cleaned.replace(/\./g, ''); // Entferne Punkte (Tausender-Trennzeichen)
      cleaned = cleaned.replace(',', '.'); // Ersetze Komma durch Punkt
    }
    
    return parseFloat(cleaned);
  };

  const isInputCorrect = (input: TaskInput, userValue: string): boolean => {
    if (!userValue.trim()) return false;
    
    // Für Select-Felder: direkter String-Vergleich
    if (input.type === 'select') {
      return userValue === input.correctValue;
    }
    
    // Für Zahlfelder: numerischer Vergleich
    const parsed = parseGermanNumber(userValue);
    return !Number.isNaN(parsed) && Math.abs(parsed - (input.correctValue as number)) <= input.tolerance;
  };

  const handleInputChange = (cardId: number, inputId: string, value: string) => {
    // Erst Cards aktualisieren
    const oldCards = cards;
    const updatedCards = oldCards.map(card => {
      if (card.id !== cardId) return card;
      return { ...card, userAnswers: { ...card.userAnswers, [inputId]: value } };
    });
    setCards(updatedCards);
    
    // DANN: Tilgungspläne auto-score wenn nicht gelöst angezeigt
    const card = updatedCards.find(c => c.id === cardId);
    if (card && (card.task.type === 'ratendarlehen_plan' || card.task.type === 'annuitaet_plan' || card.task.type === 'incomplete_tilgungsplan') && !card.solutionVisible) {
      // Finde die gerade eingefüllte Input
      const changedInput = card.task.inputs.find(i => i.id === inputId);
      if (changedInput && changedInput.type !== 'select') {
        const userValue = card.userAnswers[inputId];
        if (userValue?.trim()) {
          const isCorrect = isInputCorrect(changedInput, userValue);
          if (isCorrect) {
            // Nur für diese neue Eingabe: Punkt und Notification
            setStats(prev => ({
              ...prev,
              points: prev.points + 1,
            }));
            
            const notifId = `${cardId}-${inputId}-${Date.now()}`;
            const newNotif = { id: notifId, points: 1 };
            
            // Notification anzeigen
            setNotifications(prev => [...prev, newNotif]);
            
            // Nach 2 Sekunden entfernen
            const timerId = setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notifId));
            }, 2000);
            
            // Cleanup wenn component unmounted
            return () => clearTimeout(timerId);
          }
        }
      }
    }
  };

  const checkAnswer = (id: number) => {
    setCards(prev => {
      const updatedCards = prev.map(c => {
        if (c.id !== id) return c;
        console.log('Checking card', id, 'taskType:', c.task.type);

        // Wenn Lösung bereits angezeigt wurde, keine Punkte mehr - aber als Versuch zählen
        if (c.solutionVisible) {
          // Lösung angezeigt: nur Versuch zählen, keine Punkte
          setStats(prev => ({
            correct: prev.correct, // Unverändert
            points: prev.points,   // Unverändert
            total: prev.total + 1,
            streak: 0, // Streak bricht ab
          }));
          return {
            ...c,
            feedback: 'Lösung wurde bereits angezeigt. Diese Aufgabe bringt keine Punkte mehr.',
            feedbackType: 'incorrect' as const,
          };
        }

        // Spezial-Handling für Tilgungspläne: Prüfe NICHT task.inputs (nur Dropdown), prüfe die Plan-Zellen direkt
        if (c.task.type === 'ratendarlehen_plan' || c.task.type === 'annuitaet_plan' || c.task.type === 'incomplete_tilgungsplan') {
          // Für Tilgungspläne: Zähle korrekte Zellen und prüfe Tilgungsart
          let correctCells = 0;
          let totalCells = 0;
          let tilgungsartCorrect = true;

          // Prüfe Plan-Zellen (nicht Select-Felder)
          c.task.inputs.forEach(input => {
            if (input.type === 'select') {
              // Prüfe Tilgungsart
              const userValue = c.userAnswers[input.id];
              if (!userValue || userValue !== input.correctValue) {
                tilgungsartCorrect = false;
              }
              return;
            }
            
            // Plan-Zelle
            totalCells++;
            const userValue = c.userAnswers[input.id];
            if (userValue?.trim()) {
              const isCorrect = isInputCorrect(input, userValue);
              if (isCorrect) {
                correctCells++;
              }
            }
          });

          const isCorrect = correctCells === totalCells && tilgungsartCorrect;
          // Pro richtige Zelle: 1 Punkt
          const pointsToAward = isCorrect ? correctCells : 0;

          if (isCorrect) {
            setStats(prev => ({
              correct: prev.correct + 1,
              total: prev.total + 1,
              streak: prev.streak + 1,
              points: prev.points + pointsToAward,
            }));
          } else {
            setStats(prev => ({
              correct: prev.correct,
              total: prev.total + 1,
              streak: 0,
              points: prev.points,
            }));
          }

          return {
            ...c,
            feedback: isCorrect ? (
              `Stark! Alle Werte stimmen und die Tilgungsart ist korrekt. (+${pointsToAward} Punkte)`
            ) : (
              `Es wurden ${correctCells} von ${totalCells} Zellen korrekt ausgefüllt. ${tilgungsartCorrect ? '' : 'Die Tilgungsart ist falsch.'}`
            ),
            feedbackType: isCorrect ? 'correct' : 'incorrect',
          };
        }

        // Für NORMALE Aufgaben: Prüfe alle task.inputs
        const missingInput = c.task.inputs.some(input => !c.userAnswers[input.id]?.trim());
        
        if (missingInput) {
          return {
            ...c,
            feedback: 'Bitte alle Felder ausfüllen (Komma oder Punkt sind erlaubt).',
            feedbackType: 'incorrect',
          };
        }

        const wrongFields: TaskInput[] = [];

        c.task.inputs.forEach(input => {
          const parsed = parseGermanNumber(c.userAnswers[input.id]);
          // Nur Zahlen-Felder überprüfen, Select-Felder skip
          if (input.type === 'select') return;
          if (Number.isNaN(parsed) || Math.abs(parsed - (input.correctValue as number)) > input.tolerance) {
            wrongFields.push(input);
          }
        });

        const isCorrect = wrongFields.length === 0;
        const pointsToAward = c.task.pointsAwarded || POINTS_PER_CORRECT;

        if (isCorrect) {
          setStats(prev => ({
            correct: prev.correct + 1,
            total: prev.total + 1,
            streak: prev.streak + 1,
            points: prev.points + pointsToAward,
          }));
        } else {
          setStats(prev => ({
            correct: prev.correct,
            total: prev.total + 1,
            streak: 0,
            points: prev.points,
          }));
        }

        return {
          ...c,
          feedback: isCorrect ? (
            `Stark! Alle Werte stimmen. (+${pointsToAward} Punkte)`
          ) : (
            <div>
              Nicht ganz. Richtige Werte:
              <ul className="mt-2 space-y-1 text-sm">
                {wrongFields.map(field => (
                  <li key={field.id}>
                    <strong>{field.label}:</strong>{' '}
                    {formatValueWithUnit(field.correctValue as number, field.unit, field.displayDecimals ?? 2)}
                  </li>
                ))}
              </ul>
            </div>
          ),
          feedbackType: isCorrect ? 'correct' : 'incorrect',
        };
      });
      return updatedCards;
    });
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

  const showTip = (id: number) => {
    setCards(prev =>
      prev.map(card =>
        card.id === id
          ? { ...card, tipVisible: !card.tipVisible }
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
                  const planTable = extractPlanTable(card.task.inputs.filter(i => i.type !== 'select'));
                  const tilgungsartInput = card.task.inputs.find(i => i.type === 'select');
                  
                  if (!planTable) {
                    return (
                      <div className="flex flex-col items-center justify-center gap-3 mb-3">
                        {card.task.inputs.map(input => (
                          <div key={input.id} className="max-w-sm flex flex-col items-center gap-1">
                            <label className="font-semibold text-slate-600">{input.label}</label>
                            <div className="flex items-center gap-2 flex-1 max-w-xs">
                              {input.type === 'select' ? (
                                <select
                                  value={card.userAnswers[input.id] || ''}
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    handleInputChange(card.id, input.id, e.target.value)
                                  }
                                  className="flex-1 border-2 border-slate-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-blue-400 bg-white"
                                >
                                  <option value="">{input.placeholder}</option>
                                  {input.options?.map(opt => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={card.userAnswers[input.id]}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleInputChange(card.id, input.id, e.target.value)
                                  }
                                  placeholder={input.placeholder}
                                  className="flex-1 border-2 border-slate-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-blue-400"
                                />
                              )}
                              <span className="text-base font-bold text-slate-600">{input.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  // Für incomplete_tilgungsplan: Dropdown oben + einzelne Tabelle mit allen Werten
                  if (tilgungsartInput) {
                    return (
                      <div className="space-y-4">
                        {/* Dropdown für Tilgungsart */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="font-semibold text-slate-600 sm:min-w-[220px]">{tilgungsartInput.label}</label>
                          <select
                            value={card.userAnswers[tilgungsartInput.id] || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                              handleInputChange(card.id, tilgungsartInput.id, e.target.value)
                            }
                            className="flex-1 border-2 border-slate-300 rounded-xl px-4 py-2 text-lg focus:outline-none focus:border-blue-400 bg-white max-w-sm"
                          >
                            <option value="">{tilgungsartInput.placeholder}</option>
                            {tilgungsartInput.options?.map(opt => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Einzelne Tabelle mit bekannten und unbekannten Werten */}
                        <div className="overflow-x-auto">
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
                                      if (!input) {
                                        // Bekannter Wert - aus incompleteRows auslesen
                                        const incRow = (card.task as any)._incompleteRows?.find((r: any) => r.year === row.year);
                                        if (incRow) {
                                          const fieldMap: Record<string, string> = {
                                            'debt': 'restStart',
                                            'interest': 'interest',
                                            'tilgung': 'tilgung',
                                            'annuity': 'annuity',
                                          };
                                          const fieldName = fieldMap[col.key];
                                          const value = (incRow as any)[fieldName];
                                          return (
                                            <td key={col.key} className="p-2 text-center text-slate-700 font-semibold">
                                              {formatCurrency(value)} €
                                            </td>
                                          );
                                        }
                                        return <td key={col.key} className="p-2"></td>;
                                      }
                                      const userValue = card.userAnswers[input.id];
                                      const isCorrect = isInputCorrect(input, userValue);
                                      return (
                                        <td key={col.key} className="p-2 align-middle">
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="text"
                                              aria-label={`${col.label} Jahr ${row.year}`}
                                              value={userValue}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleInputChange(card.id, input.id, e.target.value)
                                              }
                                              placeholder={input.placeholder}
                                              className={`w-full border-2 rounded-xl px-3 py-2 text-base focus:outline-none ${
                                                userValue && isCorrect
                                                  ? 'border-green-500 bg-green-50 focus:border-green-600'
                                                  : userValue && !isCorrect
                                                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                  : 'border-slate-300 focus:border-blue-400'
                                              }`}
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
                                  if (!input) {
                                    // Spalte existiert nicht als Input
                                    return <td key={col.key} className="p-2"></td>;
                                  }
                                  const userValue = card.userAnswers[input.id];
                                  const isCorrect = isInputCorrect(input, userValue);
                                  return (
                                    <td key={col.key} className="p-2 align-middle">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          aria-label={`${col.label} Jahr ${row.year}`}
                                          value={userValue}
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleInputChange(card.id, input.id, e.target.value)
                                          }
                                          placeholder={input.placeholder}
                                          className={`w-full border-2 rounded-xl px-3 py-2 text-base focus:outline-none ${
                                            userValue && isCorrect
                                              ? 'border-green-500 bg-green-50 focus:border-green-600'
                                              : userValue && !isCorrect
                                              ? 'border-red-500 bg-red-50 focus:border-red-600'
                                              : 'border-slate-300 focus:border-blue-400'
                                          }`}
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
                    onClick={() => showTip(card.id)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl shadow"
                  >
                    💡 Tipp
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

                {card.tipVisible && card.task.formula && (
                  <div className="mb-3 rounded-2xl px-4 py-3 bg-amber-50 border-2 border-amber-200 text-amber-900">
                    <p className="font-semibold mb-2">� Hinweis:</p>
                    <div className="bg-white rounded-lg px-3 py-2">
                      {typeof card.task.formula === 'string' && (card.task.formula.includes('\n') || card.task.formula.includes('konstant') || card.task.formula.includes('Erkenne') || card.task.formula.includes('jährlich')) ? (
                        <div className="space-y-2 text-sm text-gray-700">
                          {card.task.formula.split('\n').map((line, idx) => (
                            line.trim() && <p key={idx}>{line.trim()}</p>
                          ))
                          }
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <InlineMath math={card.task.formula} />
                        </div>
                      )}
                    </div>
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

          {/* Notifications für Punkt-Popups */}
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 pointer-events-none z-50">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="mb-3 bg-green-500 text-white font-bold px-6 py-3 rounded-full shadow-2xl text-2xl animate-pulse"
                style={{
                  animation: `popupFloat 2s ease-out forwards`,
                }}
              >
                +{notif.points}
              </div>
            ))}
          </div>
          <style>{`
            @keyframes popupFloat {
              0% {
                opacity: 1;
                transform: translateY(0);
              }
              100% {
                opacity: 0;
                transform: translateY(-40px);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

