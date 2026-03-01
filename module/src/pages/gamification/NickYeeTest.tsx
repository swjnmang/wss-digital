import { useState } from 'react'
import jsPDF from 'jspdf'

interface NickYeeScores {
  achievement: number
  advancement: number
  power: number
  immersion: number
  social: number
  teamwork: number
  discovery: number
  mastery: number
  escapism: number
  competition: number
  creativity: number
  community: number
}

const questions = [
  // Achievement (Ziele und Vollendung)
  {
    id: 1,
    text: 'Ich mag es, Ziele im Spiel zu setzen und diese zu erreichen.',
    type: 'achievement',
  },
  {
    id: 2,
    text: 'Ich möchte alle Erfolge und Achievements im Spiel freischalten.',
    type: 'achievement',
  },
  {
    id: 3,
    text: 'Es ist wichtig für mich, ein Spiel vollständig zu beenden.',
    type: 'achievement',
  },
  {
    id: 4,
    text: 'Ich verfolge lange Questreihen und Aufgabenlisten.',
    type: 'achievement',
  },

  // Advancement (Charakterentwicklung und Progression)
  {
    id: 5,
    text: 'Ich liebe es, meine Charaktere oder Fähigkeiten zu verbessern.',
    type: 'advancement',
  },
  {
    id: 6,
    text: 'Der Fortschritt (Level-Ups, bessere Ausrüstung) motiviert mich.',
    type: 'advancement',
  },
  {
    id: 7,
    text: 'Ich mag Spiele mit klaren Progression-Systemen.',
    type: 'advancement',
  },
  {
    id: 8,
    text: 'Charakterentwicklung ist ein Hauptgrund für mein Spielen.',
    type: 'advancement',
  },

  // Power (Kontrolle und Überlegenheit)
  {
    id: 9,
    text: 'Ich möchte machtvoll sein und andere outperformen.',
    type: 'power',
  },
  {
    id: 10,
    text: 'Es fasziniert mich, die mächtigsten Charaktere zu haben.',
    type: 'power',
  },
  {
    id: 11,
    text: 'Kontrolle über das Spiel und andere zu haben macht mir Spaß.',
    type: 'power',
  },
  {
    id: 12,
    text: 'Ich möchte Einfluss auf das Spielgeschehen haben.',
    type: 'power',
  },

  // Immersion (Geschichte und Atmosphäre)
  {
    id: 13,
    text: 'Eine fesselnde Geschichte ist sehr wichtig für mich.',
    type: 'immersion',
  },
  {
    id: 14,
    text: 'Ich tauche gerne in die Welt und das Setting eines Spiels ein.',
    type: 'immersion',
  },
  {
    id: 15,
    text: 'Die Atmosphäre und das Storytelling faszinieren mich.',
    type: 'immersion',
  },
  {
    id: 16,
    text: 'Ich spiele Spiele, um in andere Welten einzutauchen.',
    type: 'immersion',
  },

  // Social (Soziale Interaktion)
  {
    id: 17,
    text: 'Mit anderen spielen ist wichtiger als allein zu spielen.',
    type: 'social',
  },
  {
    id: 18,
    text: 'Ich mag Spiele, bei denen ich mit anderen interagieren kann.',
    type: 'social',
  },
  {
    id: 19,
    text: 'Freundschaften im Spiel aufzubauen macht mir Spaß.',
    type: 'social',
  },
  {
    id: 20,
    text: 'Ich spiele hauptsächlich wegen der sozialen Aspekte.',
    type: 'social',
  },

  // Teamwork (Kooperation und Zusammenarbeit)
  {
    id: 21,
    text: 'Ich liebe kooperative Spiele, bei denen wir zusammen gewinnen.',
    type: 'teamwork',
  },
  {
    id: 22,
    text: 'Gemeinsam Herausforderungen zu meistern macht mir Freude.',
    type: 'teamwork',
  },
  {
    id: 23,
    text: 'Ich bevorzuge Team-basierte Spiele.',
    type: 'teamwork',
  },
  {
    id: 24,
    text: 'Das Gefühl, Teil einer Gruppe zu sein, ist mir wichtig.',
    type: 'teamwork',
  },

  // Discovery (Erkundung und Entdeckung)
  {
    id: 25,
    text: 'Ich liebe es, die Welt eines Spiels zu erforschen.',
    type: 'discovery',
  },
  {
    id: 26,
    text: 'Versteckte Orte und Geheimnisse faszinieren mich.',
    type: 'discovery',
  },
  {
    id: 27,
    text: 'Ich experimentiere gerne mit neuen Dingen im Spiel.',
    type: 'discovery',
  },
  {
    id: 28,
    text: 'Das Erforschen ist genauso wichtig wie die Hauptquest.',
    type: 'discovery',
  },

  // Mastery (Meisterschaft und Herausforderung)
  {
    id: 29,
    text: 'Ich liebe schwierige Herausforderungen.',
    type: 'mastery',
  },
  {
    id: 30,
    text: 'Meine Fähigkeiten zu verbessern und zu perfektionieren macht mir Spaß.',
    type: 'mastery',
  },
  {
    id: 31,
    text: 'Ich möchte ein Spiel wirklich beherrschen und zu 100% meistern.',
    type: 'mastery',
  },
  {
    id: 32,
    text: 'Komplexe Mechaniken zu verstehen ist spannend für mich.',
    type: 'mastery',
  },

  // Escapism (Flucht und Fantasy)
  {
    id: 33,
    text: 'Ich spiele, um von der realen Welt abzuschalten.',
    type: 'escapism',
  },
  {
    id: 34,
    text: 'In fantastische Welten einzutauchen ist beruhigend für mich.',
    type: 'escapism',
  },
  {
    id: 35,
    text: 'Spiele helfen mir, Stress abzubauen.',
    type: 'escapism',
  },
  {
    id: 36,
    text: 'Der Alltag zu vergessen und ein anderes Leben zu leben fasziniert mich.',
    type: 'escapism',
  },

  // Competition (Wettbewerb)
  {
    id: 37,
    text: 'Ich liebe Wettbewerb und möchte gewinnen.',
    type: 'competition',
  },
  {
    id: 38,
    text: 'Gegen andere anzutreten motiviert mich.',
    type: 'competition',
  },
  {
    id: 39,
    text: 'Rankings und Leaderboards sind wichtig für mich.',
    type: 'competition',
  },
  {
    id: 40,
    text: 'Es geht mir darum, besser als andere zu sein.',
    type: 'competition',
  },

  // Creativity (Kreativität und Ausdruck)
  {
    id: 41,
    text: 'Ich mag Spiele, bei denen ich kreativ sein kann.',
    type: 'creativity',
  },
  {
    id: 42,
    text: 'Charaktere oder Welten zu designen macht mir Spaß.',
    type: 'creativity',
  },
  {
    id: 43,
    text: 'Ich möchte meine Individualität in Spielen ausdrücken.',
    type: 'creativity',
  },
  {
    id: 44,
    text: 'Modding und Anpassung von Spielen fasziniert mich.',
    type: 'creativity',
  },

  // Community (Gemeinschaft und Zugehörigkeit)
  {
    id: 45,
    text: 'Ich möchte Teil einer Spielergemeinde sein.',
    type: 'community',
  },
  {
    id: 46,
    text: 'Clans, Gilden oder Communities sind wichtig für mich.',
    type: 'community',
  },
  {
    id: 47,
    text: 'Ich mag Events, bei denen sich die Gemeinde trifft.',
    type: 'community',
  },
  {
    id: 48,
    text: 'Der Zusammenhalt mit anderen Spielern ist mir wichtig.',
    type: 'community',
  },
]

type MotivationType = 'achievement' | 'advancement' | 'power' | 'immersion' | 'social' | 'teamwork' | 'discovery' | 'mastery' | 'escapism' | 'competition' | 'creativity' | 'community'

const motivationTypes: Record<MotivationType, { name: string; emoji: string; color: string; description: string }> = {
  achievement: {
    name: 'Zielorientierung (Achievement)',
    emoji: '🎯',
    color: 'blue',
    description: 'Du magst es, klare Ziele zu setzen und diese zu erreichen. Erfolge, Achievements und das Gefühl der Vollendung treiben dich an.',
  },
  advancement: {
    name: 'Charakterentwicklung (Advancement)',
    emoji: '📈',
    color: 'green',
    description: 'Dich motiviert der Fortschritt deines Charakters. Level-Ups, bessere Ausrüstung und sichtbare Verbesserungen sind für dich zentral.',
  },
  power: {
    name: 'Macht und Dominanz (Power)',
    emoji: '👑',
    color: 'purple',
    description: 'Du strebst danach, mächtig zu sein und andere zu dominieren. Die Kontrolle über das Spiel und Überlegenheit faszinieren dich.',
  },
  immersion: {
    name: 'Eintauchen in Geschichten (Immersion)',
    emoji: '📖',
    color: 'indigo',
    description: 'Fesselnde Geschichten und Atmosphäre sind zentral für dein Spielerlebnis. Du tauchst gerne in fiktive Welten ein.',
  },
  social: {
    name: 'Soziale Interaktion (Social)',
    emoji: '💬',
    color: 'pink',
    description: 'Du spielst, um mit anderen zu interagieren. Freundschaften und soziale Verbindungen sind dir wichtiger als das Spielergebnis.',
  },
  teamwork: {
    name: 'Zusammenarbeit (Teamwork)',
    emoji: '🤝',
    color: 'rose',
    description: 'Kooperation und Teamplay treiben dich an. Du magst es, mit anderen zusammen Herausforderungen zu meistern.',
  },
  discovery: {
    name: 'Erkundung (Discovery)',
    emoji: '🔍',
    color: 'cyan',
    description: 'Erkundung und Entdeckung sind zentral. Du liebst versteckte Geheimnisse und experimentierst gerne mit neuen Dingen.',
  },
  mastery: {
    name: 'Meisterschaft (Mastery)',
    emoji: '🏆',
    color: 'amber',
    description: 'Du strebst danach, ein Spiel perfekt zu beherrschen. Komplexe Mechaniken und schwierige Herausforderungen faszinieren dich.',
  },
  escapism: {
    name: 'Flucht aus Alltag (Escapism)',
    emoji: '🌌',
    color: 'violet',
    description: 'Du spielst, um vom Alltag abzuschalten. In fantastische Welten einzutauchen hilft dir, Stress abzubauen und neue Perspektiven zu gewinnen.',
  },
  competition: {
    name: 'Wettbewerb (Competition)',
    emoji: '⚔️',
    color: 'red',
    description: 'Wettbewerb motiviert dich. Du möchtest gewinnen und besser als andere sein. Rankings und Leaderboards sind dir wichtig.',
  },
  creativity: {
    name: 'Kreativität (Creativity)',
    emoji: '🎨',
    color: 'fuchsia',
    description: 'Du nutzt Spiele, um dich kreativ auszudrücken. Charakterdesign, Weltenbau und Anpassungen faszinieren dich.',
  },
  community: {
    name: 'Gemeinschaft (Community)',
    emoji: '👥',
    color: 'teal',
    description: 'Du möchtest Teil einer Spielergemeinde sein. Clans, Gilden und gemeinsame Events sind dir wichtig.',
  },
}

export default function NickYeeTest() {
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scores, setScores] = useState<NickYeeScores | null>(null)

  const handleResponse = (questionId: number, rating: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: rating,
    }))
  }

  const handleSubmit = () => {
    // Calculate scores
    const calculated: NickYeeScores = {
      achievement: 0,
      advancement: 0,
      power: 0,
      immersion: 0,
      social: 0,
      teamwork: 0,
      discovery: 0,
      mastery: 0,
      escapism: 0,
      competition: 0,
      creativity: 0,
      community: 0,
    }

    questions.forEach(q => {
      const response = responses[q.id] || 0
      calculated[q.type as MotivationType] += response
    })

    // Normalize to percentages
    const total = Object.values(calculated).reduce((a, b) => a + b, 0)
    const normalized: NickYeeScores = {
      achievement: total > 0 ? Math.round((calculated.achievement / total) * 100) : 0,
      advancement: total > 0 ? Math.round((calculated.advancement / total) * 100) : 0,
      power: total > 0 ? Math.round((calculated.power / total) * 100) : 0,
      immersion: total > 0 ? Math.round((calculated.immersion / total) * 100) : 0,
      social: total > 0 ? Math.round((calculated.social / total) * 100) : 0,
      teamwork: total > 0 ? Math.round((calculated.teamwork / total) * 100) : 0,
      discovery: total > 0 ? Math.round((calculated.discovery / total) * 100) : 0,
      mastery: total > 0 ? Math.round((calculated.mastery / total) * 100) : 0,
      escapism: total > 0 ? Math.round((calculated.escapism / total) * 100) : 0,
      competition: total > 0 ? Math.round((calculated.competition / total) * 100) : 0,
      creativity: total > 0 ? Math.round((calculated.creativity / total) * 100) : 0,
      community: total > 0 ? Math.round((calculated.community / total) * 100) : 0,
    }

    setScores(normalized)
    setIsSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const downloadTXT = async () => {
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
    pdf.text('Nick Yee Gamer Motivation Profile', pageWidth / 2, yPosition, { align: 'center' })
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
    yPosition += 10

    // Top 3 Motivations Header
    pdf.setFontSize(12)
    pdf.setFont('Helvetica', 'bold')
    pdf.setTextColor(30, 80, 160)
    pdf.text('Deine Top 3 Motivationen:', 15, yPosition)
    pdf.setTextColor(0, 0, 0)
    yPosition += 8

    const topThree = getTopN(scores, 3)
    topThree.forEach((type, idx) => {
      const motivationType = type as MotivationType
      const score = scores[motivationType]
      const info = motivationTypes[motivationType]

      // Background for each top motivation
      if (idx === 0) pdf.setFillColor(255, 250, 200) // Gold
      else if (idx === 1) pdf.setFillColor(240, 240, 240) // Silver
      else pdf.setFillColor(255, 245, 235) // Bronze

      pdf.rect(15, yPosition - 3, pageWidth - 30, 20, 'F')

      pdf.setFontSize(11)
      pdf.setFont('Helvetica', 'bold')
      pdf.text(`${idx + 1}. ${info.name}`, 18, yPosition + 4)
      pdf.text(`${score}%`, pageWidth - 20, yPosition + 4, { align: 'right' })
      yPosition += 22
    })

    yPosition += 5

    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      pdf.addPage()
      yPosition = 15
    }

    // Bar Chart
    pdf.setFontSize(12)
    pdf.setFont('Helvetica', 'bold')
    pdf.text('Alle 12 Motivationsdimensionen:', 15, yPosition)
    yPosition += 8

    const chartCanvas = document.createElement('canvas')
    chartCanvas.width = 600
    chartCanvas.height = 300
    const ctx = chartCanvas.getContext('2d')!
    drawBarChart(ctx, scores)
    const chartImage = chartCanvas.toDataURL('image/png')

    pdf.addImage(chartImage, 'PNG', 10, yPosition, 195, 80)
    yPosition += 85

    if (yPosition > pageHeight - 50) {
      pdf.addPage()
      yPosition = 15
    }

    // Recommendations
    yPosition += 5
    pdf.setFontSize(12)
    pdf.setFont('Helvetica', 'bold')
    pdf.setTextColor(30, 120, 30)
    pdf.text('Empfehlungen:', 15, yPosition)
    pdf.setTextColor(0, 0, 0)
    yPosition += 8

    pdf.setFontSize(10)
    pdf.setFont('Helvetica', 'normal')
    
    // Get recommendations as array
    const recsArray = getRecommendations(scores)

    recsArray.forEach((rec, idx) => {
      pdf.text(`${idx + 1}. ${rec}`, 20, yPosition)
      yPosition += 6
      
      if (yPosition > pageHeight - 20) {
        pdf.addPage()
        yPosition = 15
      }
    })

    // Footer
    pdf.setFontSize(8)
    pdf.setFont('Helvetica', 'italic')
    pdf.setTextColor(120, 120, 120)
    pdf.text(
      'Basierend auf Nick Yee & Nicolas Ducheneaut\'s Gamer Motivation Research (Quantic Foundry)',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    // Download
    pdf.save(`Nick-Yee-Profil-${new Date().getTime()}.pdf`)
  }

  const drawBarChart = (ctx: CanvasRenderingContext2D, scores: NickYeeScores) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, width, height)

    const colors: Record<MotivationType, string> = {
      achievement: '#3b82f6',
      advancement: '#10b981',
      power: '#a855f7',
      immersion: '#6366f1',
      social: '#ec4899',
      teamwork: '#f43f5e',
      discovery: '#06b6d4',
      mastery: '#f59e0b',
      escapism: '#8b5cf6',
      competition: '#ef4444',
      creativity: '#d946ef',
      community: '#14b8a6',
    }

    const sortedEntries = Object.entries(scores).sort(([, a], [, b]) => b - a)
    const barHeight = height / (sortedEntries.length + 1)
    const maxWidth = width - 180

    sortedEntries.forEach(([type, value]) => {
      const idx = sortedEntries.findIndex(e => e[0] === type)
      const y = (idx + 0.7) * barHeight

      // Label (without emoji)
      ctx.font = 'bold 9px Arial'
      ctx.textAlign = 'right'
      ctx.fillStyle = '#000'
      const shortName = motivationTypes[type as MotivationType].name.split('(')[0].trim().substring(0, 18)
      ctx.fillText(shortName, 169, y + 3)

      // Bar
      const barWidth = (value / 100) * maxWidth
      ctx.fillStyle = colors[type as MotivationType]
      ctx.fillRect(175, y - barHeight / 3, barWidth, barHeight * 0.55)

      // Border
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 0.5
      ctx.strokeRect(175, y - barHeight / 3, barWidth, barHeight * 0.55)

      // Percentage
      ctx.textAlign = 'left'
      ctx.font = 'bold 9px Arial'
      ctx.fillStyle = '#000'
      ctx.fillText(`${value}%`, 180 + barWidth + 3, y + 3)
    })
  }

  const getTopN = (scores: NickYeeScores, n: number): string[] => {
    return Object.keys(scores)
      .sort((a, b) => scores[b as MotivationType] - scores[a as MotivationType])
      .slice(0, n)
  }

  const getRecommendations = (scores: NickYeeScores): string[] => {
    const topType1 = getTopN(scores, 1)[0] as MotivationType
    const topType2 = getTopN(scores, 2)[1] as MotivationType

    const recs: string[] = []

    if (topType1 === 'achievement' || topType2 === 'achievement') {
      recs.push('Spiele mit klaren Zielen und umfangreichen Achievements')
    }
    if (topType1 === 'advancement' || topType2 === 'advancement') {
      recs.push('Spiele mit starken Progression-Systemen und Level-Ups')
    }
    if (topType1 === 'power' || topType2 === 'power') {
      recs.push('Spiele, in denen du dominieren kannst')
    }
    if (topType1 === 'immersion' || topType2 === 'immersion') {
      recs.push('Spiele mit tiefgründigen Geschichten und Atmosphäre')
    }
    if (topType1 === 'social' || topType2 === 'social') {
      recs.push('Multiplayer und kooperative Spiele')
    }
    if (topType1 === 'teamwork' || topType2 === 'teamwork') {
      recs.push('Team-basierte Spiele und kooperative Abenteuer')
    }
    if (topType1 === 'discovery' || topType2 === 'discovery') {
      recs.push('Spiele mit großen offenen Welten zum Erkunden')
    }
    if (topType1 === 'mastery' || topType2 === 'mastery') {
      recs.push('Herausfordernde Spiele mit komplexen Mechaniken')
    }
    if (topType1 === 'escapism' || topType2 === 'escapism') {
      recs.push('Immersive Fantasy-Welten und entspannende Spiele')
    }
    if (topType1 === 'competition' || topType2 === 'competition') {
      recs.push('Kompetitive PvP-Spiele und Ranglisten-Systeme')
    }
    if (topType1 === 'creativity' || topType2 === 'creativity') {
      recs.push('Spiele mit Charakteranpassung und Kreativ-Modi')
    }
    if (topType1 === 'community' || topType2 === 'community') {
      recs.push('Spiele mit aktiven Gilden/Communities und gemeinsamen Events')
    }

    return recs
  }

  const allAnswered = Object.keys(responses).length === questions.length

  if (isSubmitted && scores) {
    const topThree = getTopN(scores, 3)

    return (
      <div className="space-y-8">
        {/* Results Header */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-300 p-8">
          <h3 className="text-3xl font-bold text-cyan-900 mb-4">
            🎮 Dein Nick Yee Gamer Motivation Profil
          </h3>
          <p className="text-lg text-cyan-800 mb-4">
            Du hast 48 Fragen beantwortet. Hier ist deine detaillierte Analyse deiner Spieler-Motivationen nach Nick Yee's Modell:
          </p>
          <div className="bg-white rounded-lg p-4 border border-cyan-200">
            <p className="text-sm text-slate-700">
              <strong>Hinweis:</strong> Dieses Modell misst 12 verschiedene Motivationsdimensionen. Du kannst in mehreren Bereichen hoch sein – es geht nicht um strikte "Typen".
            </p>
          </div>
        </div>

        {/* Top 3 Motivations Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((type, idx) => {
            const motivationType = type as MotivationType
            const score = scores[motivationType]
            const info = motivationTypes[motivationType]

            return (
              <div
                key={type}
                className={`rounded-lg p-6 border-2 ${
                  idx === 0
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400'
                    : idx === 1
                      ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-400'
                      : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400'
                }`}
              >
                <div className="text-4xl mb-2">{info.emoji}</div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-lg font-semibold text-slate-900">{idx + 1}. Platz</h5>
                  <span className="text-2xl font-bold text-slate-700">{score}%</span>
                </div>
                <h6 className="font-bold text-slate-900 mb-2">{info.name}</h6>
                <p className="text-sm text-slate-700">{info.description}</p>
              </div>
            )
          })}
        </div>

        {/* All 12 Motivations Grid */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h4 className="text-2xl font-bold text-slate-900 mb-8">Alle 12 Motivations-Dimensionen</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(scores)
              .sort(([, a], [, b]) => b - a)
              .map(([key, value]) => {
                const motivationType = key as MotivationType
                const info = motivationTypes[motivationType]

                return (
                  <div key={key} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{info.emoji}</span>
                        <h5 className="font-semibold text-slate-900">{info.name}</h5>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-600">Wert</span>
                        <span className="text-lg font-bold text-slate-900">{value}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-slate-400 to-slate-600 h-full rounded-full transition-all"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{info.description}</p>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-xl border-2 border-blue-300 p-8">
          <h4 className="text-xl font-bold text-blue-900 mb-4">💡 Empfehlungen:</h4>
          <div className="text-slate-700 space-y-2">
            {getRecommendations(scores).map((rec, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="font-semibold flex-shrink-0">{idx + 1}.</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison with Bartle */}
        <div className="bg-purple-50 rounded-xl border-2 border-purple-300 p-8">
          <h4 className="text-xl font-bold text-purple-900 mb-4">📊 Vergleich: Nick Yee vs. Bartle</h4>
          <div className="text-purple-800 space-y-2 text-sm leading-relaxed">
            <p>
              <strong>Nick Yee's Modell (12 Dimensionen):</strong> Misst spezifische Motivationen und ist differenzierter. 
              Es beschreibt, WARUM du spielst, nicht welcher Typ du bist.
            </p>
            <p>
              <strong>Bartle's Modell (4 Typen):</strong> Teilt Spieler in 4 grundlegende Kategorien ein. 
              Es ist vereinfachter, aber auch praktikabler für schnelle Kategorisierungen.
            </p>
            <p>
              <strong>Fazit:</strong> Beide Modelle sind komplementär! Nick Yee gibt dir eine tiefere Analyse deiner Motivationen, 
              während Bartle dir einen schnellen Überblick über deinen grundlegenden Spielertyp gibt.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={downloadTXT}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            📥 Profil als PDF herunterladen
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
      <div className="bg-cyan-50 rounded-xl border-2 border-cyan-300 p-6">
        <h3 className="text-xl font-bold text-cyan-900 mb-3">🎮 Nick Yee Gamer Motivation Profile</h3>
        <p className="text-cyan-800 text-sm leading-relaxed mb-3">
          Dieses Test basiert auf Nick Yee's Gamer Motivation Profile von Quantic Foundry. 
          Er misst 12 verschiedene Motivationsdimensionen, die erklären, warum du spielst.
        </p>
        <p className="text-cyan-800 text-sm mb-3">
          <strong>Anleitung:</strong> Bewerte die folgenden 48 Aussagen von 1 (stimme nicht zu) bis 5 (stimme komplett zu). 
          Es gibt keine richtigen oder falschen Antworten – es geht um deine persönlichen Motivationen!
        </p>
        <p className="text-cyan-800 text-sm">
          <strong>Zeitaufwand:</strong> Ca. 5-7 Minuten | <strong>Fragen:</strong> 48 (4 pro Dimension)
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-slate-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Fortschritt</span>
          <span className="text-sm font-semibold text-slate-700">{Object.keys(responses).length}/48 Fragen beantwortet</span>
        </div>
        <div className="w-full bg-slate-300 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all"
            style={{ width: `${(Object.keys(responses).length / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-slate-700 text-sm">
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
                          ? 'bg-blue-500 text-white scale-110 shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={
                        rating === 1
                          ? 'Stimme nicht zu'
                          : rating === 5
                            ? 'Stimme komplett zu'
                            : ''
                      }
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
            ? `✅ Profil erstellen (${Object.keys(responses).length}/48 beantwortet)`
            : `⏳ Bitte beantworte alle Fragen (${Object.keys(responses).length}/48)`}
        </button>
      </div>
    </div>
  )
}
