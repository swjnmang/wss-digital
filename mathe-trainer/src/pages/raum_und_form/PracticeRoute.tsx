import { useParams } from 'react-router-dom';
import Home from '../Home';
import PracticePage from './engine/PracticePage';
import { findTopic } from './registry';

export default function PracticeRoute() {
  const { topic: slug, page } = useParams();
  const topic = findTopic(slug);
  const cfg = topic?.pages.find((p) => p.slug === page);
  if (!topic || !cfg) return <Home />;
  return <PracticePage key={`${topic.slug}/${cfg.slug}`} topic={topic} cfg={cfg} />;
}
