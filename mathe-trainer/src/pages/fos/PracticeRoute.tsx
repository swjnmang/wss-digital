import { useParams } from 'react-router-dom';
import { FOS } from '../../data/areas';
import PracticePage from '../raum_und_form/engine/PracticePage';
import FosOverview from './Overview';
import { FOS_BASE, findFosTopic } from './registry';

export default function FosPracticeRoute() {
  const { topic: slug, page } = useParams();
  const topic = findFosTopic(slug);
  const cfg = topic?.pages.find((p) => p.slug === page);
  if (!topic || !cfg) return <FosOverview />;
  return (
    <PracticePage
      key={`${topic.slug}/${cfg.slug}`}
      topic={topic}
      cfg={cfg}
      base={FOS_BASE}
      root={{ to: FOS_BASE, label: FOS.title }}
    />
  );
}
