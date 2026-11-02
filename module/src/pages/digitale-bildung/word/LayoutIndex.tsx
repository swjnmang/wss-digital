import { InfoBox, PageHead, TaskTable, WerkbankShell } from '../../../components/digitale-bildung/Werkbank';
import { LAYOUT_TASKS } from '../../../lib/word-layout/tasks';
import type { LayoutTask } from '../../../lib/word-layout/types';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const toRow = (task: LayoutTask) => ({
  key: task.id,
  to: `/digitale-bildung/word/layout/${task.id}`,
  nr: String(LAYOUT_TASKS.indexOf(task) + 1).padStart(2, '0'),
  title: task.title,
  text: task.intro,
  level: difficultyLabel[task.difficulty] ?? task.difficulty,
  meta: `${task.steps.reduce((n, st) => n + st.checks.length, 0)} Vorgaben`,
});

const groups = [
  {
    title: 'Grundlagen',
    text: 'Schritt für Schritt: Zeichen-, Absatz- und Seitenformatierung kennenlernen.',
    tasks: LAYOUT_TASKS.filter((t) => t.kind !== 'projekt').map(toRow),
  },
  {
    title: 'Projektaufgaben wie im Unterricht',
    text: 'Umfangreiche Arbeitsaufträge mit knappen Vorgaben: Kopf-/Fußzeile, Seitenränder, Spalten, Einzüge, Tabelle und Fußnote.',
    tasks: LAYOUT_TASKS.filter((t) => t.kind === 'projekt').map(toRow),
  },
];

export default function LayoutIndex() {
  return (
    <WerkbankShell
      tool="word"
      tree
      path={[
        { label: 'Digitale Bildung', to: '/digitale-bildung' },
        { label: 'Word', to: '/digitale-bildung/word' },
        { label: 'Layouten', to: '/digitale-bildung/word/layout' },
        { label: 'Digitale Übungen' },
      ]}
    >
      <PageHead title="Digitale Übungen" intro="Wähle eine Aufgabe aus." />
      <InfoBox>
        Der Text ist jeweils schon vorgegeben. Deine Aufgabe ist es, ihn direkt im Word-Editor zu gestalten: Schriftart und
        -größe, Farben, Ausrichtung, Überschriften, Listen, Tabellen, Absatzabstände, Seitenränder und Spalten. Mit „Prüfen“
        siehst du, welche Arbeitsaufträge schon erfüllt sind. Am Ende speicherst du dein Ergebnis als Word-Datei oder als
        PDF-Arbeitsnachweis für deine Lehrkraft. Dein Zwischenstand bleibt im Browser erhalten.
      </InfoBox>
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-2.5">
          <div>
            <h2 className="m-0 text-xl font-bold">{group.title}</h2>
            <p className="m-0 text-[15.5px] text-ink-muted">{group.text}</p>
          </div>
          <TaskTable tasks={group.tasks} filter={false} />
        </section>
      ))}
    </WerkbankShell>
  );
}
