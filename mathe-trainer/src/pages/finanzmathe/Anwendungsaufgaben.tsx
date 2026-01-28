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
            <Link to="/finanzmathe/anwendungsaufgaben/lucas-kapitalanlagen" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-2">Lucas Kapitalanlagen</h2>
              <p className="text-gray-600">Eine umfassende Aufgabe zu Kapitalanlage, Zinseszins, Darlehen und Tilgungsplänen.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
