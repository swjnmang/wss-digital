import { useState } from 'react'
import jsPDF from 'jspdf'

interface BartleScores {
  achiever: number
  explorer: number
  socializer: number
  killer: number
}

const questions = [
  // Achiever questions
  {
    id: 1,
    text: 'Ich mag es, Ziele zu erreichen und Erfolge zu sammeln.',
    type: 'achiever',
  },
  {
    id: 2,
    text: 'Ich bin motiviert durch Fortschritt, Punkte und hohe Scores.',
    type: 'achiever',
  },
  {
    id: 3,
    text: 'Ich möchte alle Erfolge und Achievements im Spiel freischalten.',
    type: 'achiever',
  },
  {
    id: 4,
    text: 'Rankings und Leaderboards sind wichtig für mich.',
    type: 'achiever',
  },
  {
    id: 5,
    text: 'Ich werde nicht müde, bis ich ein Spiel vollständig „besiegt" habe.',
    type: 'achiever',
  },

  // Explorer questions
  {
    id: 6,
    text: 'Ich liebe es, die Welt eines Spiels zu entdecken und zu erforschen.',
    type: 'explorer',
  },
  {
    id: 7,
    text: 'Ich experimentiere gerne mit neuen Mechaniken und Strategien.',
    type: 'explorer',
  },
  {
    id: 8,
    text: 'Geheime Bereiche und versteckte Inhalte faszinieren mich.',
    type: 'explorer',
  },
  {
    id: 9,
    text: 'Ich erkunde jeden Winkel und möchte alles entdecken.',
    type: 'explorer',
  },
  {
    id: 10,
    text: 'Die Spielmechaniken zu verstehen und zu meistern macht mir Spaß.',
    type: 'explorer',
  },

  // Socializer questions
  {
    id: 11,
    text: 'Mit anderen Menschen zu spielen ist wichtiger als zu gewinnen.',
    type: 'socializer',
  },
  {
    id: 12,
    text: 'Ich liebe Teamspiele und Kooperation.',
    type: 'socializer',
  },
  {
    id: 13,
    text: 'Ich mag freundliche Kommunikation und den Austausch mit Mitspielern.',
    type: 'socializer',
  },
  {
    id: 14,
    text: 'Gemeinschaft und Freundschaften sind mir wichtiger als Erfolge.',
    type: 'socializer',
  },
  {
    id: 15,
    text: 'Ich spiele, um Zeit mit anderen zu verbringen.',
    type: 'socializer',
  },

  // Killer questions
  {
    id: 16,
    text: 'Ich liebe Wettbewerb und möchte gewinnen.',
    type: 'killer',
  },
  {
    id: 17,
    text: 'Ich möchte andere Spieler herausfordern und besiegen.',
    type: 'killer',
  },
  {
    id: 18,
    text: 'Ich bin motiviert durch Rivalität und den Drang zu siegen.',
    type: 'killer',
  },
  {
    id: 19,
    text: 'Ich mag aggressive Strategien und Kampf-Mechaniken.',
    type: 'killer',
  },
  {
    id: 20,
    text: 'Für mich zählt nur: Siegen oder verlieren!',
    type: 'killer',
  },
]

type PlayerType = 'achiever' | 'explorer' | 'socializer' | 'killer'

const playerTypes: Record<PlayerType, { name: string; emoji: string; color: string; description: string }> = {
  achiever: {
    name: 'Erfolgsorientiert (Achiever)',
    emoji: '🏆',
    color: 'yellow',
    description: 'Du brauchst Ziele, Erfolge und erkennbare Fortschritte. Dich motivieren Punkte, Level-Ups und Rankings. Du spielst, um zu gewinnen und alles zu meistern.',
  },
  explorer: {
    name: 'Entdecker (Explorer)',
    emoji: '🔍',
    color: 'blue',
    description: 'Du liebst es, Neues zu entdecken und Geheimnisse zu enthüllen. Die Spielmechaniken zu verstehen und alle versteckten Inhalte zu finden macht dir Spaß.',
  },
  socializer: {
    name: 'Sozialer Typ (Socializer)',
    emoji: '👥',
    color: 'green',
    description: 'Für dich steht das gemeinsame Spielen im Vordergrund, nicht das Gewinnen. Du bevorzugst Teamspiele und Kooperation. Freundschaften und Spaß mit anderen sind dir wichtiger als Erfolge.',
  },
  killer: {
    name: 'Wettbewerbs-orientiert (Killer)',
    emoji: '⚔️',
    color: 'red',
    description: 'Du spielst, um zu gewinnen! Wettbewerb, Rivalität und die Herausforderung, andere zu besiegen, treiben dich an. Du magst aggressive Strategien und Kampf-Mechaniken.',
  },
}

export default function BartleTest() {
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scores, setScores] = useState<BartleScores | null>(null)

  const handleResponse = (questionId: number, rating: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: rating,
    }))
  }

  const handleSubmit = () => {
    // Calculate scores
    const calculated: BartleScores = {
      achiever: 0,
      explorer: 0,
      socializer: 0,
      killer: 0,
    }

    questions.forEach(q => {
      const response = responses[q.id] || 0
      calculated[q.type as PlayerType] += response
    })

    // Normalize to percentages
    const total = calculated.achiever + calculated.explorer + calculated.socializer + calculated.killer
    const normalized: BartleScores = {
      achiever: total > 0 ? Math.round((calculated.achiever / total) * 100) : 0,
      explorer: total > 0 ? Math.round((calculated.explorer / total) * 100) : 0,
      socializer: total > 0 ? Math.round((calculated.socializer / total) * 100) : 0,
      killer: total > 0 ? Math.round((calculated.killer / total) * 100) : 0,
    }

    setScores(normalized)
    setIsSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const downloadPDF = async () => {
    if (!scores) return

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageHeight = pdf.internal.pageSize.getHeight()
    const pageWidth = pdf.internal.pageSize.getWidth()
    let yPosition = 15

    // Title
    pdf.setFontSize(20)
    pdf.setFont('Helvetica', 'bold')
    pdf.text('Bartle Player Type Test', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8

    // Date
    pdf.setFontSize(10)
    pdf.setFont('Helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, pageWidth / 2, yPosition, { align: 'center' })
    pdf.setTextColor(0, 0, 0)
    yPosition += 10

    // Separator Line
    pdf.setDrawColor(200, 200, 200)
    pdf.line(15, yPosition, pageWidth - 15, yPosition)
    yPosition += 8

    // Main Result Box
    const primaryType = getPrimaryType(scores)
    const primaryInfo = playerTypes[primaryType]
    
    // Background for result box
    pdf.setFillColor(240, 245, 255)
    pdf.rect(15, yPosition, pageWidth - 30, 35, 'F')
    
    pdf.setFontSize(16)
    pdf.setFont('Helvetica', 'bold')
    pdf.setTextColor(30, 80, 160)
    pdf.text(`Dein Spielertyp: ${primaryInfo.name}`, 20, yPosition + 8)
    
    pdf.setFontSize(11)
    pdf.setFont('Helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    const descLines = pdf.splitTextToSize(primaryInfo.description, pageWidth - 40)
    pdf.text(descLines, 20, yPosition + 16)
    yPosition += 40

    // Chart
    const chartCanvas = document.createElement('canvas')
    chartCanvas.width = 400
    chartCanvas.height = 400
    const ctx = chartCanvas.getContext('2d')!
    drawPieChart(ctx, scores)
    const chartImage = chartCanvas.toDataURL('image/png')
    pdf.addImage(chartImage, 'PNG', pageWidth / 2 - 35, yPosition, 70, 70)
    yPosition += 75

    // Scores Table
    pdf.setFontSize(12)
    pdf.setFont('Helvetica', 'bold')
    pdf.text('Spielertyp-Verteilung:', 15, yPosition)
    yPosition += 8

    pdf.setFontSize(11)
    pdf.setFont('Helvetica', 'normal')
    
    const colorMap: Record<string, [number, number, number]> = {
      achiever: [251, 191, 36],
      explorer: [96, 165, 250],
      socializer: [52, 211, 153],
      killer: [248, 113, 113],
    }

    Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, percentage]) => {
        pdf.setFillColor(...colorMap[type])
        pdf.rect(15, yPosition - 3, 4, 4, 'F')
        pdf.text(playerTypes[type as PlayerType].name, 22, yPosition)
        pdf.text(`${percentage}%`, pageWidth - 25, yPosition, { align: 'right' })
        yPosition += 6
      })

    yPosition += 5

    if (yPosition > pageHeight - 50) {
      pdf.addPage()
      yPosition = 15
    }

    // Recommendations
    pdf.setFontSize(12)
    pdf.setFont('Helvetica', 'bold')
    pdf.setTextColor(30, 120, 30)
    pdf.text('Empfehlungen:', 15, yPosition)
    pdf.setTextColor(0, 0, 0)
    yPosition += 8

    pdf.setFontSize(10)
    pdf.setFont('Helvetica', 'normal')
    
    const recsArray = getRecommendations(scores)
    recsArray.forEach((rec, idx) => {
      pdf.text(`${idx + 1}. ${rec}`, 20, yPosition)
      yPosition += 6
      
      if (yPosition > pageHeight - 25) {
        pdf.addPage()
        yPosition = 15
      }
    })

    // Footer
    pdf.setFontSize(8)
    pdf.setFont('Helvetica', 'italic')
    pdf.setTextColor(120, 120, 120)
    pdf.text(
      'Basierend auf Richard Bartle\'s Spieler-Typen Klassifikation',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    // Download
    pdf.save(`Bartle-Test-${new Date().getTime()}.pdf`)
  }

  const drawPieChart = (ctx: CanvasRenderingContext2D, scores: BartleScores) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const radius = 110
    const centerX = width / 2
    const centerY = height / 2

    const colors = {
      achiever: '#FBBF24',
      explorer: '#60A5FA',
      socializer: '#34D399',
      killer: '#F87171',
    }

    // Background
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, width, height)

    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    let currentAngle = -Math.PI / 2

    Object.entries(scores).forEach(([type, value]) => {
      if (value === 0) return

      const sliceAngle = (value / total) * 2 * Math.PI

      // Draw slice
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.lineTo(centerX, centerY)
      ctx.fillStyle = colors[type as PlayerType]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw percentage label
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.65)
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.65)

      ctx.fillStyle = '#000'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${value}%`, labelX, labelY)

      currentAngle += sliceAngle
    })

    // Draw legend instead of center text
    let legendY = height - 80

    ctx.fillStyle = '#000'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('Spielertyp-Verteilung:', 20, legendY)
    legendY += 20

    Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, value]) => {
        ctx.fillStyle = colors[type as PlayerType]
        ctx.fillRect(20, legendY - 6, 12, 12)
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 1
        ctx.strokeRect(20, legendY - 6, 12, 12)

        ctx.fillStyle = '#000'
        ctx.font = '12px Arial'
        ctx.fillText(`${playerTypes[type as PlayerType].name}: ${value}%`, 40, legendY)
        legendY += 18
      })
  }

  const getPrimaryType = (scores: BartleScores): PlayerType => {
    return Object.keys(scores).reduce((a, b) => 
      scores[b as PlayerType] > scores[a as PlayerType] ? (b as PlayerType) : a
    ) as PlayerType
  }

  const getRecommendations = (scores: BartleScores): string[] => {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a)
    const primary = sorted[0][0] as PlayerType

    const recs: string[] = []
    
    if (primary === 'achiever') {
      recs.push('Spiele mit klaren Zielen und Progression-Systemen')
      recs.push('Sammle alle Achievements und maximiere deinen Score')
      recs.push('Versuche, auf Leaderboards aufzusteigen')
    } else if (primary === 'explorer') {
      recs.push('Wähle Spiele mit großen, offenen Welten')
      recs.push('Nimm dir Zeit, um alle Geheimnisse zu entdecken')
      recs.push('Experimentiere mit verschiedenen Strategien')
    } else if (primary === 'socializer') {
      recs.push('Bevorzuge Multiplayer und Kooperations-Spiele')
      recs.push('Spiele mit Freunden statt allein')
      recs.push('Versuche Teamspiele und gemeinsame Projekte')
    } else if (primary === 'killer') {
      recs.push('Suche nach kompetitiven und PvP-Spielen')
      recs.push('Fordere andere Spieler heraus')
      recs.push('Nutze aggressive und gewinnorientierte Strategien')
    }
    
    return recs
  }

  const allAnswered = Object.keys(responses).length === questions.length

  if (isSubmitted && scores) {
    const primaryType = getPrimaryType(scores)

    return (
      <div className="space-y-8">
        {/* Results Header */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-300 p-8">
          <h3 className="text-3xl font-bold text-purple-900 mb-2">
            {playerTypes[primaryType].emoji} Dein Spieletyp ist: {playerTypes[primaryType].name}
          </h3>
          <p className="text-lg text-purple-800 mt-4">{playerTypes[primaryType].description}</p>
        </div>

        {/* Score Visualization */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h4 className="text-2xl font-bold text-slate-900 mb-8">Deine Spieletyp-Verteilung</h4>
          
          <div className="space-y-6">
            {/* Achiever */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="font-semibold text-slate-900">Erfolgsorientiert (Achiever)</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">{scores.achiever}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all"
                  style={{ width: `${scores.achiever}%` }}
                />
              </div>
            </div>

            {/* Explorer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <span className="font-semibold text-slate-900">Entdecker (Explorer)</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{scores.explorer}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${scores.explorer}%` }}
                />
              </div>
            </div>

            {/* Socializer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  <span className="font-semibold text-slate-900">Sozialer Typ (Socializer)</span>
                </div>
                <span className="text-xl font-bold text-green-600">{scores.socializer}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all"
                  style={{ width: `${scores.socializer}%` }}
                />
              </div>
            </div>

            {/* Killer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  <span className="font-semibold text-slate-900">Wettbewerbs-orientiert (Killer)</span>
                </div>
                <span className="text-xl font-bold text-red-600">{scores.killer}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-400 to-red-500 h-full rounded-full transition-all"
                  style={{ width: `${scores.killer}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(playerTypes).map(([key, type]) => {
            const score = scores[key as PlayerType]
            const isHighest = key === getPrimaryType(scores).toString()

            return (
              <div
                key={key}
                className={`rounded-lg p-6 border-2 transition-all ${
                  isHighest
                    ? 'bg-purple-50 border-purple-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-lg font-semibold text-slate-900">{type.emoji} {type.name}</h5>
                  <span className={`text-xl font-bold ${
                    isHighest ? 'text-purple-600' : 'text-slate-600'
                  }`}>
                    {score}%
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{type.description}</p>
              </div>
            )
          })}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-xl border-2 border-blue-300 p-8">
          <h4 className="text-xl font-bold text-blue-900 mb-4">💡 Empfehlungen für dich:</h4>
          <div className="text-slate-700 space-y-2">
            {getRecommendations(scores).map((rec, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="font-semibold flex-shrink-0">{idx + 1}.</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={downloadPDF}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            📥 Ergebnisse als PDF herunterladen
          </button>
          <button
            onClick={() => {
              setIsSubmitted(false)
              setScores(null)
              setResponses({})
            }}
            className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            🔄 Test wiederholen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-xl border-2 border-blue-300 p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-3">🎮 Bartle Player Type Test</h3>
        <p className="text-blue-800 text-sm leading-relaxed">
          Dieser Test basiert auf Richard Bartles Klassifikation von Spieler-Typen aus den 1990ern. 
          Er hilft dir zu verstehen, welcher Spieler-Typ du bist und welche Spiele dir am meisten Spaß machen.
        </p>
        <p className="text-blue-800 text-sm mt-3">
          <strong>Anleitung:</strong> Bewerte die folgenden 20 Aussagen von 1 (stimme nicht zu) bis 5 (stimme komplett zu). 
          Es gibt keine richtigen oder falschen Antworten – es geht um deine persönlichen Vorlieben!
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-slate-700">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-slate-900 font-medium mb-4">{q.text}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleResponse(q.id, rating)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        responses[q.id] === rating
                          ? 'bg-blue-500 text-white scale-110'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all ${
            allAnswered
              ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          {allAnswered
            ? `✅ Test absenden (${Object.keys(responses).length}/20 beantwortet)`
            : `⏳ Bitte beantworte alle Fragen (${Object.keys(responses).length}/20)`}
        </button>
      </div>
    </div>
  )
}
