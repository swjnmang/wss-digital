import { Link } from 'react-router-dom';
import TaskShell from '../../components/layout/TaskShell';
import { FOS } from '../../data/areas';
import { FOS_BASE, FOS_TOPICS } from './registry';

// Vorbereitung FOS/BOS: die acht Lernbereiche der Vorklasse als nummerierte Zeilen.

export default function FosOverview() {
  return (
    <TaskShell title={FOS.title} subtitle={FOS.long} width="wide">
      <div className="bk-topics">
        {FOS_TOPICS.map((t, i) => (
          <Link key={t.slug} to={`${FOS_BASE}/${t.slug}`} className="bk-topic">
            <span className="bk-topic-no">{i + 1}</span>
            <span className="bk-topic-text">
              <strong>{t.title}</strong>
              <small>
                {t.description} · {t.pages.length} Themen
              </small>
            </span>
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </TaskShell>
  );
}
