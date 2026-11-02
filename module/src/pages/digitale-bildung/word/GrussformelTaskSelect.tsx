import { InfoBox, PageHead, TaskTable, WerkbankShell, tipsLightClass } from '../../../components/digitale-bildung/Werkbank';
import { GRUSSFORMEL_TASKS } from '../../../lib/geschaeftsbrief/grussformel-tasks';
import { GrussformelTippsButton } from './GrussformelTipps';
import { baustein } from './bausteinPfad';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const rows = GRUSSFORMEL_TASKS.map((task) => ({
  key: task.id,
  to: `/digitale-bildung/word/geschaeftsbrief/grussformel/${task.id}`,
  title: task.title,
  text: task.scenario,
  level: difficultyLabel[task.difficulty] ?? task.difficulty,
}));

export default function GrussformelTaskSelect() {
  return (
    <WerkbankShell tool="word" tree path={baustein('Grußformel & Unterschrift')}>
      <PageHead title="Grußformel &amp; Unterschrift" intro="Wähle eine Übung aus.">
        <GrussformelTippsButton className={tipsLightClass} />
      </PageHead>
      <InfoBox>
        Der Geschäftsbrief endet mit „Freundliche Grüße“, gefolgt von Branche und Firmenname. Danach bleiben genau drei Leerzeilen für die Unterschrift frei, bevor der Name gedruckt wird – mit oder ohne „i. A.“, je nachdem, ob im Auftrag geschrieben wird.
      </InfoBox>
      <TaskTable tasks={rows} />
    </WerkbankShell>
  );
}
