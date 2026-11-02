import { PageHead, TaskTable, WerkbankShell } from '../../components/digitale-bildung/Werkbank';
import { ALL_TASKS } from '../../lib/excel-trainer/tasks';
import { useExcelSession } from '../../lib/excel-trainer/ExcelSessionContext';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const rows = ALL_TASKS.map((task) => ({
  key: task.id,
  to: `/digitale-bildung/excel-trainer/${task.id}`,
  title: task.title,
  text: task.instruction[0],
  level: difficultyLabel[task.difficulty] ?? task.difficulty,
}));

export default function ExcelTaskSelect() {
  const { recording, hasProgress, startRecording, discardRecording } = useExcelSession();
  const toggle = () => (recording ? discardRecording() : startRecording());

  return (
    <WerkbankShell tool="excel" path={[{ label: 'Digitale Bildung', to: '/digitale-bildung' }, { label: 'Excel-Trainer' }]}>
      <PageHead title="Excel-Trainer" intro="Wähle eine Übung aus.">
        <label className="flex min-h-11 max-w-sm cursor-pointer items-center gap-2.5 font-medium">
          <input
            type="checkbox"
            role="switch"
            checked={recording}
            disabled={hasProgress}
            onChange={toggle}
            className="h-[22px] w-[22px] shrink-0 accent-[#0f7b4f]"
          />
          <span>
            Arbeitsnachweis aufzeichnen
            <span className="block text-sm font-normal leading-snug text-ink-muted">
              {hasProgress
                ? 'Läuft. Beenden kannst du die Aufzeichnung in einer Übung.'
                : recording
                  ? 'Läuft. Zeit und Ergebnis werden festgehalten.'
                  : 'Zeit und Ergebnis festhalten, am Ende als PDF speichern.'}
            </span>
          </span>
        </label>
      </PageHead>
      <TaskTable tasks={rows} />
    </WerkbankShell>
  );
}
