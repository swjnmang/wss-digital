import React from 'react'
import { useNavigate } from 'react-router-dom'

const EMBED_URL = 'https://nachhilfe-wirtschaftsschule.de/wordpress/wp-admin/admin-ajax.php?action=h5p_embed&id=2'

export default function EscapeRoomZinseszins() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/finanzmathe/anwendungsaufgaben')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">
            <i className="fa-solid fa-door-open mr-2"></i>Digitaler Escape Room
          </h1>
          <p className="text-gray-600 mb-1">Zinsen und Zinseszinsen</p>
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6">
            Hinweis: Der Escape Room wird nur auf großen Displays korrekt dargestellt (z.B. Windows-PC).
          </p>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <iframe
              src={EMBED_URL}
              width="100%"
              height={700}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, backgroundColor: 'white' }}
              allowFullScreen
              title="Escaperoom (Zinsen und Zinseszinsen)"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
