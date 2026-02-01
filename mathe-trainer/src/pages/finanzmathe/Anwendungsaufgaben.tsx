import React from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Anwendungsaufgaben() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-8">Anwendungsaufgaben</h1>
          
          <div className="grid grid-cols-1 gap-6">
            <Link to="/finanzmathe/anwendungsaufgaben/ardas-kapitalanlagen" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2">Ardas Kapitalanlagen</h2>
              <p className="text-gray-600">Nachschüssige Rente, Zinseszins, vorschüssige Kapitalminderung, Annuitätendarlehen und Sondertilgung.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/sportladen-eröffnung" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2">Sportladen Eröffnung</h2>
              <p className="text-gray-600">Gründungsfinanzierung eines Sportladens - Vorschüssige Rente, Zinsberechnung, Kapitalminderung, Ratendarlehen und Zinsen aus Gewinnen.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/die-unfallversicherung" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2">Die Unfallversicherung</h2>
              <p className="text-gray-600">Versicherungssumme mit Zinseszins, nachschüssige Rente, vorschüssige Kapitalminderung, Ratendarlehen und Restschuldberechnung.</p>
            </Link>
            <Link to="/finanzmathe/anwendungsaufgaben/ehepaar-tempel" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2">Ehepaar Tempel</h2>
              <p className="text-gray-600">Kapitalanlagen mit Zinseszins, Eigenkapitalberechnung, Tilgungsplan und Restschuldberechnung bei Fremdfinanzierung.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
