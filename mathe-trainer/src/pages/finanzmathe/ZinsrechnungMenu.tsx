import MenuPage, { type MenuItem } from '../../components/layout/MenuPage';

export const aufgaben: MenuItem[] = [
  { title: 'Zinsrechnung üben', desc: 'Berechne Zinsen, Kapital, Zinssatz oder Laufzeit.', path: '/finanzmathe/zinsrechnung/ueben', icon: 'fa-solid fa-percent' },
  { title: 'Zinstage aus Datum berechnen', desc: 'Bestimme die Zinstage t zwischen zwei Kalenderdaten.', path: '/finanzmathe/zinsrechnung/tage', icon: 'fa-solid fa-calendar-days' },
  { title: 'Test: Zinsrechnung', desc: 'Teste dein Wissen unter Prüfungsbedingungen.', path: '/finanzmathe/zinsen_test', icon: 'fa-solid fa-graduation-cap' },
];

export default function ZinsrechnungMenu() {
  return <MenuPage title="Zinsrechnung" items={aufgaben} />;
}
