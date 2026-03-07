        {/* ===== ÜBUNGEN TAB ===== */}
        {activeTab === 'uebungen' && (
        <div className="space-y-4">
          {/* EXERCISE 1: Spielmechaniken Meister - EXPANDABLE */}
          <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleExercise(1)}
              className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
            >
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-slate-900">1️⃣ Spielmechaniken Meister</h3>
                <p className="text-slate-600 text-sm mt-1">Ziehe die Spielelemente per Drag & Drop in die richtige Kategorie!</p>
              </div>
              <span className={`text-3xl transform transition-transform ml-4 ${expandedExercises[1] ? 'rotate-45' : ''}`}>➕</span>
            </button>

            {expandedExercises[1] && (
              <div className="px-6 pb-6 border-t border-slate-200 bg-white space-y-4">
                {exercise1Items.filter((i) => i.placedIn && i.correctCategories.includes(i.placedIn)).length < exercise1Items.length ? (
                  <>
                    {(() => {
                      const totalPlaced = exercise1Items.filter((i) => i.placedIn).length;
                      const totalErrors = exercise1Items.filter((i) => i.hasError).length;
                      const errorRateValue = totalPlaced > 0 ? (totalErrors / totalPlaced) * 100 : 0;
                      const errorRate = errorRateValue.toFixed(1);
                      const errorColor = errorRateValue === 0 && totalPlaced > 0 ? '#10b981' : errorRateValue < 10 ? '#fbbf24' : '#ef4444';
                      
                      return (
                        <div className="p-3 bg-slate-100 rounded-lg border-2 border-slate-300">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-slate-900">❌ Fehlerquote</span>
                            <span className="text-2xl font-bold" style={{ color: errorColor }}>{errorRate}%</span>
                          </div>
                          {totalPlaced > 0 && <p className="text-xs text-slate-600">{totalErrors} von {totalPlaced} falsch zugeordnet</p>}
                        </div>
                      );
                    })()}

                    <div className="grid gap-4 lg:grid-cols-3">
                      {['Motivationssysteme', 'Spielmechaniken', 'Feedback-Systeme'].map((category) => (
                        <div
                          key={category}
                          onDragOver={handleExercise1DragOver}
                          onDrop={(e) => handleExercise1CategoryDrop(e, category)}
                          className="bg-blue-50 rounded-lg p-4 border-4 border-dashed border-blue-300 min-h-64"
                        >
                          <h3 className="font-bold text-sm mb-4 pb-2 border-b-2 border-blue-300">{category}</h3>
                          <div className="space-y-2">
                            {exercise1Items
                              .filter((item) => item.placedIn === category)
                              .map((item) => {
                                const isCorrect = item.correctCategories.includes(category)
                                return (
                                  <div
                                    key={item.id}
                                    className={`p-2 rounded-lg border-2 font-semibold text-sm cursor-move transition-all ${
                                      isCorrect
                                        ? 'bg-green-100 border-green-500 text-green-900 hover:bg-green-200'
                                        : 'bg-red-100 border-red-500 text-red-900 hover:bg-red-200'
                                    }`}
                                    draggable
                                    onDragStart={(e) => handleExercise1DragStart(e, item.id)}
                                  >
                                    {item.element} {isCorrect ? '✓' : '✗'}
                                  </div>
                                )
                              })}
                            {exercise1Items.filter((item) => item.placedIn === category).length === 0 && (
                              <p className="text-slate-400 italic text-center py-8">Ziehe Elemente hier rein...</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-300">
                      <h4 className="font-bold text-sm text-slate-900 mb-3">📦 Zu sortierende Elemente ({exercise1Items.filter((i) => !i.placedIn).length} verbleibend):</h4>
                      <div className="flex flex-wrap gap-1">
                        {exercise1Items
                          .filter((item) => !item.placedIn)
                          .map((item) => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => handleExercise1DragStart(e, item.id)}
                              className="bg-white p-2 rounded-lg border-2 border-slate-400 cursor-move hover:bg-blue-50 hover:border-blue-400 transition-all font-medium text-sm text-slate-900"
                            >
                              {item.element}
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="flex gap-4 justify-between items-center">
                      <div className="font-bold text-sm">
                        ✓ Richtig: {exercise1Items.filter((i) => i.placedIn && i.correctCategories.includes(i.placedIn)).length}/{exercise1Items.length}
                      </div>
                      {exercise1Items.some((i) => i.placedIn) && (
                        <button onClick={resetExercise1} className="px-4 py-2 bg-slate-300 hover:bg-slate-400 rounded-lg font-semibold transition-colors text-sm">
                          Zurücksetzen
                        </button>
                      )}
                    </div>
                  </>
                ) : exercise1ShowPhaseDecision ? (
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl border-2 border-blue-500 text-center">
                    <h2 className="text-2xl font-bold text-blue-900 mb-3">✅ Phase 1 Erfolgreich!</h2>
                    <p className="text-base text-blue-800 mb-4">Du hast alle 16 Begriffe korrekt zugeordnet. Sehr gut!</p>
                    <p className="text-sm text-slate-700 mb-6">Was möchtest du als Nächstes tun?</p>
                    <div className="grid gap-3 md:grid-cols-2 max-w-md mx-auto">
                      <button
                        onClick={resetExercise1ForRetry}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
                      >
                        🔄 Phase 1 nochmal üben
                      </button>
                      <button
                        onClick={startExercise1Phase2}
                        className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                      >
                        ▶️ Zu Phase 2
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {exercise1Phase2ShowFeedback && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className={`bg-white rounded-xl p-6 max-w-md w-full text-center shadow-xl border-4 ${
                          exercise1Phase2FeedbackIsCorrect ? 'border-green-500 bg-gradient-to-b from-white to-green-50' : 'border-red-500 bg-gradient-to-b from-white to-red-50'
                        }`}>
                          {exercise1Phase2FeedbackIsCorrect ? (
                            <>
                              <div className="text-4xl mb-3">✅</div>
                              <h3 className="text-xl font-bold text-green-900 mb-2">Richtig!</h3>
                              <p className="text-sm text-green-700 mb-4">Die Antwort ist korrekt. Weiter geht's!</p>
                              <button
                                onClick={handleExercise1Phase2ContinueAfterFeedback}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors w-full text-sm"
                              >
                                ▶️ Nächste Situation
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="text-4xl mb-3">❌</div>
                              <h3 className="text-xl font-bold text-red-900 mb-2">Falsch!</h3>
                              <p className="text-sm text-red-700 mb-4">Das ist nicht die richtige Antwort. Versuch die nächste Situation!</p>
                              <button
                                onClick={handleExercise1Phase2ContinueAfterFeedback}
                                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors w-full text-sm"
                              >
                                ▶️ Nächste Situation
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {exercise1SituationIndex < exercise1Situations.length ? (
                      <>
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-300">
                          <h3 className="font-bold text-slate-600 text-xs mb-2">Situation {exercise1SituationIndex + 1}/{exercise1Situations.length}</h3>
                          <div className="w-full bg-slate-300 rounded-full h-2 mb-3">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${((exercise1SituationIndex + 1) / exercise1Situations.length) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-slate-900 text-sm leading-relaxed mb-2">{exercise1Situations[exercise1SituationIndex].situation}</p>
                          <p className="text-slate-600 text-xs italic">Aus: {exercise1Situations[exercise1SituationIndex].game}</p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          {['Motivationssysteme', 'Spielmechaniken', 'Feedback-Systeme'].map((category) => (
                            <button
                              key={category}
                              onClick={() => handleExercise1SituationAnswer(category)}
                              disabled={exercise1Phase2ShowFeedback}
                              className={`p-4 rounded-lg font-bold text-sm transition-all border-2 ${
                                exercise1Phase2ShowFeedback ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                exercise1SituationAnswers[exercise1SituationIndex] === category
                                  ? 'bg-blue-600 text-white border-blue-700'
                                  : 'bg-white text-slate-900 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                            >
                              {category === 'Motivationssysteme' && '🎯'} {category === 'Spielmechaniken' && '⚙️'} {category === 'Feedback-Systeme' && '📢'}
                              <br />
                              <span className="text-sm">{category}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-lg border-2 border-green-500 text-center">
                        <h3 className="text-2xl font-bold text-green-900 mb-3">🎉 Ausgezeichnet!</h3>
                        <p className="text-base text-green-800 mb-3">
                          ✓ Richtig: {getExercise1SituationScore()}/{exercise1Situations.length}
                        </p>
                        <p className="text-sm text-green-700 mb-4">Du beherrschst die Spielmechaniken-Kategorien perfekt! 🏆</p>
                        <button
                          onClick={resetExercise1Phase2}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                        >
                          Nochmal versuchen
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* EXERCISE 2: Zielgruppen-Detective - EXPANDABLE */}
          <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleExercise(2)}
              className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
            >
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-slate-900">2️⃣ Zielgruppen-Detective</h3>
                <p className="text-slate-600 text-sm mt-1">Identifiziere Spielgenres und ihre Charakteristiken!</p>
              </div>
              <span className={`text-3xl transform transition-transform ml-4 ${expandedExercises[2] ? 'rotate-45' : ''}`}>➕</span>
            </button>

            {expandedExercises[2] && (
              <div className="px-6 pb-6 border-t border-slate-200 bg-white">
                {!exercise2ShowResult ? (
                  exercise2Current < exercise2Scenarios.length ? (
                    <div className="space-y-4">
                      <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-300">
                        <h3 className="text-xl font-bold mb-2">
                          Szenario {exercise2Current + 1}/{exercise2Scenarios.length}: {exercise2Scenarios[exercise2Current].name}
                        </h3>
                        <p className="text-slate-700">{exercise2Scenarios[exercise2Current].description}</p>
                      </div>

                      {exercise2Scenarios[exercise2Current].questions.map((q, qIdx) => {
                        const globalIdx = exercise2Current * 2 + qIdx
                        const answered = exercise2Answers.length > globalIdx
                        return (
                          <div key={qIdx} className="bg-slate-50 p-4 rounded-lg border border-slate-300">
                            <h4 className="font-bold text-sm mb-3">{q.text}</h4>
                            <div className="space-y-2">
                              {q.options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  onClick={() => !answered && handleExercise2Answer(oIdx)}
                                  disabled={answered}
                                  className={`w-full p-3 text-left text-sm font-medium rounded-lg transition-all ${
                                    answered && oIdx === q.correct
                                      ? 'bg-green-100 border-2 border-green-500'
                                      : answered && oIdx === exercise2Answers[globalIdx]
                                      ? 'bg-red-100 border-2 border-red-500'
                                      : 'bg-white border-2 border-slate-300 hover:bg-slate-100'
                                  } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : null
                ) : (
                  <div className="bg-green-100 p-6 rounded-lg border-2 border-green-500 text-center">
                    <h3 className="text-xl font-bold text-green-900 mb-3">🎉 Fertig!</h3>
                    <button onClick={resetExercise2} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold">
                      Nochmal
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* EXERCISE 3: Chancen & Gefahren Sortierer - EXPANDABLE */}
          <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleExercise(3)}
              className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
            >
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-slate-900">3️⃣ Chancen & Gefahren Sortierer</h3>
                <p className="text-slate-600 text-sm mt-1">Ziehe die Aussagen per Drag & Drop in die richtige Kategorie!</p>
              </div>
              <span className={`text-3xl transform transition-transform ml-4 ${expandedExercises[3] ? 'rotate-45' : ''}`}>➕</span>
            </button>

            {expandedExercises[3] && (
              <div className="px-6 pb-6 border-t border-slate-200 bg-white space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-300">
                  <h4 className="font-bold text-sm text-slate-900 mb-3">📦 Zu sortierende Elemente ({exercise3Items.filter((i) => !i.placedIn).length} verbleibend):</h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise3Items
                      .filter((item) => !item.placedIn)
                      .map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleExercise3DragStart(e, item.id)}
                          className="bg-white p-2 rounded-lg border-2 border-slate-400 cursor-move hover:bg-blue-50 hover:border-blue-400 transition-all font-medium text-sm text-slate-900"
                        >
                          {item.text}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {['chancen', 'risiken'].map((cat) => (
                    <div 
                      key={cat} 
                      className={`p-4 rounded-lg border-2 min-h-64 ${
                        cat === 'chancen' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                      }`}
                      onDragOver={handleExercise3DragOver}
                      onDrop={(e) => {
                        e.preventDefault()
                        const itemId = parseInt(e.dataTransfer.getData('exercise3ItemId'))
                        if (itemId) handleExercise3Drop(itemId, cat as 'chancen' | 'risiken')
                      }}
                    >
                      <h3 className={`font-bold text-sm mb-3 pb-2 border-b-2 ${
                        cat === 'chancen' ? 'text-green-900 border-green-400' : 'text-red-900 border-red-400'
                      }`}>
                        {cat === 'chancen' ? '✅ Chancen' : '⚠️ Risiken'}
                      </h3>
                      <div className="space-y-2">
                        {exercise3Items
                          .filter((item) => item.placedIn === cat)
                          .map((item) => {
                            const isCorrect = item.correctCategory === cat
                            return (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleExercise3DragStart(e, item.id)}
                                className={`p-2 rounded-lg border-2 font-semibold text-sm cursor-move transition-all ${
                                  isCorrect
                                    ? 'bg-green-100 border-green-500 text-green-900 hover:bg-green-200'
                                    : 'bg-red-100 border-red-500 text-red-900 hover:bg-red-200'
                                }`}
                              >
                                {item.text} {isCorrect ? '✓' : '✗'}
                              </div>
                            )
                          })}
                        {exercise3Items.filter((item) => item.placedIn === cat).length === 0 && (
                          <p className="text-slate-400 italic text-center py-8">Ziehe Elemente hier rein...</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={checkExercise3Score} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                    Score überprüfen
                  </button>
                  {exercise3Score > 0 && (
                    <>
                      <div className="font-bold text-sm">✓ Richtig: {exercise3Items.filter((i) => i.placedIn === i.correctCategory).length}/{exercise3Items.length}</div>
                      <button onClick={resetExercise3} className="px-3 py-1 bg-slate-300 rounded-lg text-sm hover:bg-slate-400">
                        Zurücksetzen
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* EXERCISE 4: Bergen Gaming Addiction Scale - EXPANDABLE */}
          <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleExercise(4)}
              className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
            >
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-slate-900">4️⃣ Spielsucht-Test: Bergen Gaming Addiction Scale</h3>
                <p className="text-slate-600 text-sm mt-1">Erkannter wissenschaftlicher Test für problematisches Spielverhalten</p>
              </div>
              <span className={`text-3xl transform transition-transform ml-4 ${expandedExercises[4] ? 'rotate-45' : ''}`}>➕</span>
            </button>

            {expandedExercises[4] && (
              <div className="px-6 pb-6 border-t border-slate-200 bg-white space-y-4">
                <p className="text-slate-700 text-sm">
                  Beantworte die folgenden Fragen ehrlich. Dies ist ein anerkannter wissenschaftlicher Test für problematisches Spielverhalten.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <p className="text-xs text-slate-700">
                    <strong>Quelle:</strong> Lemmens, J. S., Valkenburg, P. M., & Peter, J. (2015). "Psychometric Evaluation of the Bergen Gaming Addiction Scale." <em>Computers in Human Behavior, 52,</em> 344-350. DOI: 10.1016/j.chb.2015.06.003
                  </p>
                </div>

                {!exercise4ShowResult ? (
                  <div className="space-y-6">
                    {exercise4Questions.map((q, idx) => (
                      <div key={q.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-4 text-sm">{q.id}. {q.question}</p>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { value: 1, label: '(1) Stimme\nüberhaupt nicht zu', bg: 'bg-red-100 hover:bg-red-200' },
                            { value: 2, label: '(2) Stimme\neher nicht zu', bg: 'bg-yellow-100 hover:bg-yellow-200' },
                            { value: 3, label: '(3) Weder noch', bg: 'bg-slate-200 hover:bg-slate-300' },
                            { value: 4, label: '(4) Stimme\neher zu', bg: 'bg-orange-100 hover:bg-orange-200' },
                            { value: 5, label: '(5) Stimme\nvoll zu', bg: 'bg-red-200 hover:bg-red-300' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleExercise4Answer(idx, option.value)}
                              className={`flex-1 p-2 rounded-lg border-2 font-semibold text-xs transition-all min-w-[80px] ${
                                exercise4Answers[idx] === option.value
                                  ? `${option.bg} border-slate-400`
                                  : 'bg-white border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={calculateExercise4Score}
                      disabled={exercise4Answers.some(a => a === 0)}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      🎯 Test abschließen & Ergebnis anzeigen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const score = exercise4Answers.reduce((sum, answer) => sum + answer, 0)
                      const interpretation = getExercise4Interpretation(score)
                      
                      return (
                        <>
                          <div className={`p-6 rounded-lg border-2 ${
                            interpretation.color === 'green' ? 'bg-green-100 border-green-500' :
                            interpretation.color === 'yellow' ? 'bg-yellow-100 border-yellow-500' :
                            interpretation.color === 'orange' ? 'bg-orange-100 border-orange-500' :
                            'bg-red-100 border-red-500'
                          }`}>
                            <h3 className="text-2xl font-bold mb-2">{interpretation.icon} Dein Ergebnis</h3>
                            <p className="text-3xl font-bold mb-4">{score} / 35 Punkte</p>
                            <p className="text-lg font-semibold mb-2">{interpretation.level}</p>
                            <p className="text-sm leading-relaxed">{interpretation.description}</p>
                          </div>

                          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                            <h4 className="font-bold text-slate-900 mb-2">💡 Tipps für gesundes Spielverhalten:</h4>
                            <ul className="text-sm text-slate-700 space-y-1">
                              <li>✓ Setze feste Zeitlimits für dein Spielen pro Tag (z.B. max. 2 Stunden)</li>
                              <li>✓ Mache regelmäßig Pausen (alle 30 Minuten)</li>
                              <li>✓ Spiele nicht direkt vor dem Schlafengehen</li>
                              <li>✓ Habe andere Hobbys und Aktivitäten neben Gaming</li>
                              <li>✓ Sprich mit Freunden und Familie über dein Spielverhalten</li>
                              <li>✓ Wenn du Verluste nicht verkraften kannst, höre damit auf</li>
                            </ul>
                          </div>

                          {score > 13 && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                              <h4 className="font-bold text-red-900 mb-2">⚠️ Wenn du Hilfe brauchst:</h4>
                              <p className="text-sm text-slate-700 mb-2">
                                Wenn du dich von deinem Spielverhalten überfordert fühlst, sprich mit:
                              </p>
                              <ul className="text-sm text-slate-700 space-y-1">
                                <li>• Deinen Eltern oder Erziehungsberechtigten</li>
                                <li>• Dem Schulberater oder der Schulberaterin</li>
                                <li>• Einem Psychologen oder einer Psychologin</li>
                                <li>• Telefonseelsorge: 0800-1110111 oder 0800-1110222 (kostenlos, täglich)</li>
                              </ul>
                            </div>
                          )}

                          <button
                            onClick={resetExercise4}
                            className="w-full bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            Test neu starten
                          </button>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* EXERCISE 5: IGAT - Internet Gaming Addiction Test - EXPANDABLE */}
          <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleExercise(5)}
              className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
            >
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-slate-900">5️⃣ Internet-Spielsucht-Test: IGAT</h3>
                <p className="text-slate-600 text-sm mt-1">Umfassender psychometrischer Screening-Test für Gaming-Sucht</p>
              </div>
              <span className={`text-3xl transform transition-transform ml-4 ${expandedExercises[5] ? 'rotate-45' : ''}`}>➕</span>
            </button>

            {expandedExercises[5] && (
              <div className="px-6 pb-6 border-t border-slate-200 bg-white space-y-4">
                <p className="text-slate-700 text-sm">
                  Beantworte alle 20 Fragen ehrlich. Dies ist ein umfassender Test zur Erfassung problematischen Internetspielens.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <p className="text-xs text-slate-700">
                    <strong>IGAT:</strong> Internet Gaming Addiction Test - Ein validiertes Instrument zur Messung von Spielsucht und problematischem Online-Spielverhalten.
                  </p>
                </div>

                {!exercise5ShowResult ? (
                  <div className="space-y-6">
                    {exercise5Questions.map((q, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-4 text-sm">{idx + 1}. {q}</p>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { value: 1, label: '(1) Nie', bg: 'bg-green-100 hover:bg-green-200' },
                            { value: 2, label: '(2) Selten', bg: 'bg-blue-100 hover:bg-blue-200' },
                            { value: 3, label: '(3) Manchmal', bg: 'bg-yellow-100 hover:bg-yellow-200' },
                            { value: 4, label: '(4) Oft', bg: 'bg-orange-100 hover:bg-orange-200' },
                            { value: 5, label: '(5) Sehr oft', bg: 'bg-red-100 hover:bg-red-200' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleExercise5Answer(idx, option.value)}
                              className={`flex-1 p-2 rounded-lg border-2 font-semibold text-xs transition-all min-w-[70px] ${
                                exercise5Answers[idx] === option.value
                                  ? `${option.bg} border-slate-400`
                                  : 'bg-white border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={calculateExercise5Score}
                      disabled={exercise5Answers.some(a => a === 0)}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      🎯 Test abschließen & Ergebnis anzeigen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const score = exercise5Answers.reduce((sum, answer) => sum + answer, 0)
                      const interpretation = getExercise5Interpretation(score)
                      
                      return (
                        <>
                          <div className={`p-6 rounded-lg border-2 ${
                            interpretation.color === 'green' ? 'bg-green-100 border-green-500' :
                            interpretation.color === 'yellow' ? 'bg-yellow-100 border-yellow-500' :
                            interpretation.color === 'orange' ? 'bg-orange-100 border-orange-500' :
                            'bg-red-100 border-red-500'
                          }`}>
                            <h3 className="text-2xl font-bold mb-2">{interpretation.icon} Dein Ergebnis</h3>
                            <p className="text-3xl font-bold mb-4">{score} / 100 Punkte</p>
                            <p className="text-lg font-semibold mb-2">{interpretation.level}</p>
                            <p className="text-sm leading-relaxed">{interpretation.description}</p>
                          </div>

                          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                            <h4 className="font-bold text-slate-900 mb-2">💡 Tipps für bewusstes Online-Spielen:</h4>
                            <ul className="text-sm text-slate-700 space-y-1">
                              <li>✓ Nutze Elternkontrolltools und Zeit-Management-Features</li>
                              <li>✓ Spiele nicht alleine - verbinde dich mit echten Freunden</li>
                              <li>✓ Denke an körperliche Aktivität und Outdoor-Zeit</li>
                              <li>✓ Behalte ein Tagebuch über deine Spielzeit</li>
                              <li>✓ Kenne deine Trigger und schwachen Punkte</li>
                              <li>✓ Setze klare Grenzen für Spielbudgets und Spielzeit</li>
                            </ul>
                          </div>

                          {score > 40 && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                              <h4 className="font-bold text-red-900 mb-2">⚠️ Wenn du Hilfe brauchst:</h4>
                              <p className="text-sm text-slate-700 mb-2">
                                Dein Spielverhalten könnte problematisch sein. Es ist wichtig, Unterstützung zu suchen:
                              </p>
                              <ul className="text-sm text-slate-700 space-y-1">
                                <li>• Sprich mit deinen Eltern oder Erziehungsberechtigten</li>
                                <li>• Suche einen Schulberater oder eine Schulberaterin auf</li>
                                <li>• Kontaktiere einen Therapeuten oder eine Beratungsstelle</li>
                                <li>• Online-Hilfe: www.telefonseelsorge.de (0800-1110111 oder 0800-1110222)</li>
                                <li>• Suchtberatung: www.suchtberatung.de</li>
                              </ul>
                            </div>
                          )}

                          <button
                            onClick={resetExercise5}
                            className="w-full bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            Test neu starten
                          </button>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
        )}
