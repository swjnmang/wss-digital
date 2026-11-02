import { InfoBox, PageHead, TaskTable, WerkbankShell, tipsLightClass } from '../../../components/digitale-bildung/Werkbank';
import { INFOBLOCK_TASKS } from '../../../lib/geschaeftsbrief/infoblock-tasks';
import { InfoblockTippsButton } from './InfoblockTipps';
import { baustein } from './bausteinPfad';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const rows = INFOBLOCK_TASKS.map((task) => ({
  key: task.id,
  to: `/digitale-bildung/word/geschaeftsbrief/infoblock/${task.id}`,
  title: task.title,
  text: task.arbeitsauftrag,
  level: difficultyLabel[task.difficulty] ?? task.difficulty,
}));

export default function InfoblockTaskSelect() {
  return (
    <WerkbankShell tool="word" tree path={baustein('Infoblock')}>
      <PageHead title="Infoblock" intro="Wähle eine Übung aus.">
        <InfoblockTippsButton className={tipsLightClass} />
      </PageHead>
      <InfoBox>
        Du erhältst jeweils einen kurzen Arbeitsauftrag mit allen nötigen Angaben. Trage daraus die Felder des Infoblocks korrekt in den Geschäftsbrief ein: Bezüge auf frühere Schreiben, das Kürzel „Unser Zeichen“, Name sowie die Kontaktdaten.
      </InfoBox>
      <TaskTable tasks={rows} />
    </WerkbankShell>
  );
}
