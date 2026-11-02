import { InfoBox, PageHead, TaskTable, WerkbankShell } from '../../../components/digitale-bildung/Werkbank';
import { VOLLSTAENDIGER_BRIEF_TASKS } from '../../../lib/geschaeftsbrief/vollstaendiger-brief-tasks';
import { baustein } from './bausteinPfad';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const rows = VOLLSTAENDIGER_BRIEF_TASKS.map((task) => ({
  key: task.id,
  to: `/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief/${task.id}`,
  title: task.title,
  text: task.arbeitsauftrag,
  level: difficultyLabel[task.difficulty] ?? task.difficulty,
}));

export default function VollstaendigerBriefTaskSelect() {
  return (
    <WerkbankShell tool="word" tree path={baustein('Vollständiger Geschäftsbrief')}>
      <PageHead title="Vollständiger Geschäftsbrief" intro="Wähle eine Übung aus." />
      <InfoBox>
        Jetzt kommt alles zusammen: Anschriftenfeld, Infoblock, Betreff, Anrede sowie Grußformel und Unterschrift werden in einem einzigen Arbeitsauftrag geprüft, so wie in einem echten Geschäftsbrief.
      </InfoBox>
      <TaskTable tasks={rows} />
    </WerkbankShell>
  );
}
