import { Link, useParams } from 'react-router-dom';
import TaskShell from '../../components/layout/TaskShell';
import { FOS } from '../../data/areas';
import FosOverview from './Overview';
import { FOS_BASE, FOS_TOPICS, findFosTopic } from './registry';

export default function FosTopicIndex() {
  const { topic: slug } = useParams();
  const topic = findFosTopic(slug);
  if (!topic) return <FosOverview />;
  const no = FOS_TOPICS.indexOf(topic) + 1;
  return (
    <TaskShell
      title={`Lernbereich ${no}: ${topic.title}`}
      subtitle={topic.description.replace(/^Lernbereich \d+:\s*/, '')}
      width="wide"
      parent={{ to: FOS_BASE, label: FOS.title }}
    >
      <div className="bk-topics">
        {topic.pages.map((p, i) => (
          <Link key={p.slug} to={`${FOS_BASE}/${topic.slug}/${p.slug}`} className="bk-topic">
            <span className="bk-topic-no">
              {no}.{i + 1}
            </span>
            <span className="bk-topic-text">
              <strong>{p.title}</strong>
              <small>{p.description}</small>
            </span>
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </TaskShell>
  );
}
