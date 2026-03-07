        {/* TAB NAVIGATION */}
        <div className="flex gap-2 mb-8 border-b border-slate-300 overflow-x-auto">
          <button
            onClick={() => setActiveTab('aufgaben')}
            className={`px-6 py-3 font-bold whitespace-nowrap transition-colors ${
              activeTab === 'aufgaben'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📝 Aufgaben
          </button>
          <button
            onClick={() => setActiveTab('kostenlose')}
            className={`px-6 py-3 font-bold whitespace-nowrap transition-colors ${
              activeTab === 'kostenlose'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎮 Kostenlose Spiele
          </button>
          <button
            onClick={() => setActiveTab('uebungen')}
            className={`px-6 py-3 font-bold whitespace-nowrap transition-colors ${
              activeTab === 'uebungen'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💪 Übungen
          </button>
        </div>

        {/* AUFGABEN TAB */}
        {activeTab === 'aufgaben' && (
          <div className="space-y-6">
            {/* PLACEHOLDER: All existing task content goes here */}
          </div>
        )}

        {/* KOSTENLOSE SPIELE TAB */}
        {activeTab === 'kostenlose' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">🎮 Kostenlose Spiele zum Testen</h2>
              <p className="text-slate-700 mb-6 leading-relaxed">
                Eine kuratierte Liste wirklich kostenloser Spiele - von Lernspielen bis hin zu qualitativen Indie-Titeln. Alle Links führen zu offiziellen, kostenlosen Versionen ohne versteckte Pay-to-Win Mechaniken.
              </p>
              
              {/* Kategorien von Spielen */}
              <div className="space-y-6">
                {/* LERNSPIELE */}
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">🧠 Lernspiele & Bildung</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { name: 'Khan Academy', url: 'https://www.khanacademy.org', desc: 'Interaktive Kurse mit Gamification' },
                      { name: 'Code.org', url: 'https://code.org', desc: 'Programmierung für alle Altersstufen' },
                      { name: 'Scratch', url: 'https://scratch.mit.edu', desc: 'Visuelles Programmieren mit 3M+ Projekten' },
                    ].map((game, idx) => (
                      <a key={idx} href={game.url} target="_blank" rel="noopener noreferrer" 
                        className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 hover:shadow-lg hover:border-blue-400 transition-all">
                        <h4 className="font-bold text-blue-900">{game.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{game.desc}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÜBUNGEN TAB */}
        {activeTab === 'uebungen' && (
          <div className="space-y-8">
            {/* Exercise 1, 2, 3, 4 go here */}
          </div>
        )}
