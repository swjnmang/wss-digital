import { useParams } from 'react-router-dom';
import Home from '../Home';
import MenuPage from '../../components/layout/MenuPage';
import { findTopic } from './registry';

export default function TopicIndex() {
  const { topic: slug } = useParams();
  const topic = findTopic(slug);
  if (!topic) return <Home />;
  const items = topic.pages.map((p) => ({ title: p.title, desc: p.description, path: `/raum-und-form/${topic.slug}/${p.slug}` }));
  return <MenuPage title={topic.title} subtitle={topic.description} items={items} />;
}
