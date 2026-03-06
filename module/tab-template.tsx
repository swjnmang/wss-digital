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
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">🎮 Kostenlose Spiele zum Testen</h2>
              <p className="text-slate-700 mb-6">Spiele hier zum Überprüfen...</p>
            </div>
          </div>
        )}

        {/* ÜBUNGEN TAB */}
        {activeTab === 'uebungen' && (
          <div className="space-y-8">
            {/* Exercise 1, 2, 3, 4 go here */}
          </div>
        )}
