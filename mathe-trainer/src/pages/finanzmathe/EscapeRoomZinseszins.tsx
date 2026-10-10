import React from 'react'
import TaskShell from '../../components/layout/TaskShell'

const EMBED_URL = 'https://nachhilfe-wirtschaftsschule.de/wordpress/wp-admin/admin-ajax.php?action=h5p_embed&id=2'

export default function EscapeRoomZinseszins() {
  return (
    <TaskShell title="Digitaler Escape Room" width="wide">
    <div className="">
      <div className="max-w-5xl mx-auto">

        <div className="bk-panel">
          <p className="text-gray-600 mb-1">Zinsen und Zinseszinsen</p>
          <p className="bk-feedback bk-feedback-info block text-sm mb-6">
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
    </TaskShell>
  )
}
