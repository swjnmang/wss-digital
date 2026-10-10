import MenuPage, { type MenuItem } from '../../components/layout/MenuPage';

const aufgaben: MenuItem[] = [
  { title: '1. Wurzelrechnung', desc: 'Übungen zum Vereinfachen und Berechnen von Wurzeln.', path: '/rechnen_lernen/wurzeln/wurzeln' },
];

export default function Wurzeln() {
  return <MenuPage title="Wurzelrechnung" items={aufgaben} />;
}
