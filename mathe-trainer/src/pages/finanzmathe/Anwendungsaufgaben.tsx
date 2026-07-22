import React from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Anwendungsaufgaben() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/finanzmathe')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-8">Anwendungsaufgaben</h1>
          
          <div className="grid grid-cols-1 gap-6">
            <Link to="/finanzmathe/anwendungsaufgaben/ardas-kapitalanlagen" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2"><i className="fa-solid fa-chart-line mr-2 text-purple-600"></i>1. Ardas Kapitalanlagen</h2>
              <p className="text-gray-600">Nachschüssige Rente, Zinseszins, vorschüssige Kapitalminderung, Annuitätendarlehen und Sondertilgung.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/sportladen-eröffnung" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2"><i className="fa-solid fa-store mr-2 text-purple-600"></i>2. Sportladen Eröffnung</h2>
              <p className="text-gray-600">Gründungsfinanzierung eines Sportladens - Vorschüssige Rente, Zinsberechnung, Kapitalminderung, Ratendarlehen und Zinsen aus Gewinnen.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/die-unfallversicherung" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2"><i className="fa-solid fa-shield mr-2 text-purple-600"></i>3. Die Unfallversicherung</h2>
              <p className="text-gray-600">Versicherungssumme mit Zinseszins, nachschüssige Rente, vorschüssige Kapitalminderung, Ratendarlehen und Restschuldberechnung.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/ehepaar-tempel" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2"><i className="fa-solid fa-home mr-2 text-purple-600"></i>4. Ehepaar Tempel</h2>
              <p className="text-gray-600">Kapitalanlagen mit Zinseszins, Eigenkapitalberechnung, Tilgungsplan und Restschuldberechnung bei Fremdfinanzierung.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/familie-kessler" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2"><i className="fa-solid fa-people-roof mr-2 text-purple-600"></i>5. Familie Kessler</h2>
              <p className="text-gray-600">Festgeldkonto mit Zinseszins, nachschüssige Rente, Rücklage mit regelmäßigen Einzahlungen, Tilgungsplan und Laufzeitveränderung.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/der-autokauf" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2"><i className="fa-solid fa-car mr-2 text-purple-600"></i>6. Der Autokauf</h2>
              <p className="text-gray-600">Dispositionskredit mit Tageszinsen, Tilgungsplan, vorschüssige Kapitalmehrung und vorschüssige Rente aus einer Lebensversicherung.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/das-elektroauto" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2"><i className="fa-solid fa-charging-station mr-2 text-purple-600"></i>7. Das Elektroauto</h2>
              <p className="text-gray-600">Nachschüssige Sparrate, Abzinsung mit Zinseszins, Tilgungsplan, Gesamtzinsen und Leasingdauer mit vorschüssiger Kapitalminderung.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/der-foodtruck" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2"><i className="fa-solid fa-truck mr-2 text-purple-600"></i>8. Der Foodtruck</h2>
              <p className="text-gray-600">Zinssatz mit Zinseszins, nachschüssiges Ansparen, Annuität berechnen, Tilgungsplan und Restschuld mit Sondertilgung.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/escape-room-zinseszins" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2"><i className="fa-solid fa-door-open mr-2 text-purple-600"></i>9. Digitaler Escape Room</h2>
              <p className="text-gray-600">Interaktives Video: Löse unterwegs Lückentext-Rätsel rund um Zinsen und Zinseszinsen und knacke den Code.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
