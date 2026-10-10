import MenuPage, { type MenuItem } from '../../components/layout/MenuPage'

const aufgaben: MenuItem[] = [
  { title: '1. Ardas Kapitalanlagen', desc: 'Nachschüssige Rente, Zinseszins, vorschüssige Kapitalminderung, Annuitätendarlehen und Sondertilgung.', path: '/finanzmathe/anwendungsaufgaben/ardas-kapitalanlagen', icon: 'fa-solid fa-chart-line' },
  { title: '2. Sportladen Eröffnung', desc: 'Gründungsfinanzierung eines Sportladens - Vorschüssige Rente, Zinsberechnung, Kapitalminderung, Ratendarlehen und Zinsen aus Gewinnen.', path: '/finanzmathe/anwendungsaufgaben/sportladen-eröffnung', icon: 'fa-solid fa-store' },
  { title: '3. Die Unfallversicherung', desc: 'Versicherungssumme mit Zinseszins, nachschüssige Rente, vorschüssige Kapitalminderung, Ratendarlehen und Restschuldberechnung.', path: '/finanzmathe/anwendungsaufgaben/die-unfallversicherung', icon: 'fa-solid fa-shield' },
  { title: '4. Ehepaar Tempel', desc: 'Kapitalanlagen mit Zinseszins, Eigenkapitalberechnung, Tilgungsplan und Restschuldberechnung bei Fremdfinanzierung.', path: '/finanzmathe/anwendungsaufgaben/ehepaar-tempel', icon: 'fa-solid fa-home' },
  { title: '5. Familie Kessler', desc: 'Festgeldkonto mit Zinseszins, nachschüssige Rente, Rücklage mit regelmäßigen Einzahlungen, Tilgungsplan und Laufzeitveränderung.', path: '/finanzmathe/anwendungsaufgaben/familie-kessler', icon: 'fa-solid fa-people-roof' },
  { title: '6. Der Autokauf', desc: 'Dispositionskredit mit Tageszinsen, Tilgungsplan, vorschüssige Kapitalmehrung und vorschüssige Rente aus einer Lebensversicherung.', path: '/finanzmathe/anwendungsaufgaben/der-autokauf', icon: 'fa-solid fa-car' },
  { title: '7. Das Elektroauto', desc: 'Nachschüssige Sparrate, Abzinsung mit Zinseszins, Tilgungsplan, Gesamtzinsen und Leasingdauer mit vorschüssiger Kapitalminderung.', path: '/finanzmathe/anwendungsaufgaben/das-elektroauto', icon: 'fa-solid fa-charging-station' },
  { title: '8. Der Foodtruck', desc: 'Zinssatz mit Zinseszins, nachschüssiges Ansparen, Annuität berechnen, Tilgungsplan und Restschuld mit Sondertilgung.', path: '/finanzmathe/anwendungsaufgaben/der-foodtruck', icon: 'fa-solid fa-truck' },
  { title: '9. Digitaler Escape Room', desc: 'Interaktives Video: Löse unterwegs Lückentext-Rätsel rund um Zinsen und Zinseszinsen und knacke den Code.', path: '/finanzmathe/anwendungsaufgaben/escape-room-zinseszins', icon: 'fa-solid fa-door-open' },
  { title: '10. Sarahs Finanzplanung', desc: 'Zinseszins, Zinssatz- und Laufzeitberechnung, Annuitätendarlehen mit Tilgungsplan und Restschuldberechnung.', path: '/finanzmathe/anwendungsaufgaben/sarah-kapitalanlagen', icon: 'fa-solid fa-piggy-bank' },
]

export default function Anwendungsaufgaben() {
  return <MenuPage title="Anwendungsaufgaben" items={aufgaben} />
}
