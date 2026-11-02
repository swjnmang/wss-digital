import { InfoBox, PageHead, TaskTable, WerkbankShell, tipsLightClass } from '../../../components/digitale-bildung/Werkbank';
import { AUFZAEHLUNG_TASKS } from '../../../lib/geschaeftsbrief/aufzaehlung-tasks';
import { AufzaehlungTippsButton } from './AufzaehlungTipps';
import { baustein } from './bausteinPfad';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const rows = AUFZAEHLUNG_TASKS.map((task) => ({
  key: task.id,
  to: `/digitale-bildung/word/geschaeftsbrief/aufzaehlung/${task.id}`,
  title: task.title,
  text: task.intro,
  level: difficultyLabel[task.difficulty] ?? task.difficulty,
}));

export default function AufzaehlungTaskSelect() {
  return (
    <WerkbankShell tool="word" tree path={baustein('Aufzählung & Nummerierung')}>
      <PageHead title="Aufzählung &amp; Nummerierung" intro="Wähle eine Übung aus.">
        <AufzaehlungTippsButton className={tipsLightClass} />
      </PageHead>
      <InfoBox>
        Du liest jeweils ein Beispiel und beantwortest Fragen zu Leerzeilen, Einzug und Satzzeichen bei Aufzählungen und Nummerierungen nach DIN 5008.
      </InfoBox>
      <TaskTable tasks={rows} />
    </WerkbankShell>
  );
}
