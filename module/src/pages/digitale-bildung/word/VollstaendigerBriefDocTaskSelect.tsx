import { InfoBox, PageHead, TaskTable, WerkbankShell } from '../../../components/digitale-bildung/Werkbank';
import { WORD_DOKUMENT_TASKS } from '../../../lib/geschaeftsbrief/word-dokument-tasks';
import { baustein } from './bausteinPfad';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const rows = WORD_DOKUMENT_TASKS.map((task) => ({
  key: task.id,
  to: `/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief-doc/${task.id}`,
  title: task.title,
  text: task.arbeitsauftrag,
  level: difficultyLabel[task.difficulty] ?? task.difficulty,
}));

export default function VollstaendigerBriefDocTaskSelect() {
  return (
    <WerkbankShell tool="word" tree path={baustein('Vollständiger Geschäftsbrief (Word-Editor)')}>
      <PageHead title="Vollständiger Geschäftsbrief (Word-Editor)" intro="Wähle eine Übung aus." />
      <InfoBox>
        Diese Variante läuft in einem echten, frei editierbaren Texteditor direkt im Browser (wie Word), ohne Datei-Upload oder -Download. Anschriftenfeld, Infoblock, Betreff, Anrede, Brieftext sowie Grußformel und Unterschrift werden in einem einzigen Dokument bearbeitet und geprüft.
      </InfoBox>
      <TaskTable tasks={rows} />
    </WerkbankShell>
  );
}
