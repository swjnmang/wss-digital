import React, { useEffect, useRef, useState } from 'react'

interface Coin {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  onGraph: boolean
  collected: boolean
}

interface GameState {
  isRunning: boolean
  timeLeft: number
  score: number
  coins: Coin[]
  nextCoinId: number
}

export default function SpielMuenzen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStateRef = useRef<GameState>({
    isRunning: false,
    timeLeft: 120,
    score: 0,
    coins: [],
    nextCoinId: 0,
  })

  const [m, setM] = useState<string>('1')
  const [t, setT] = useState<string>('0')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120)
  const [isRunning, setIsRunning] = useState(false)

  // Canvas dimensions
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600
  const TOPF_Y = CANVAS_HEIGHT - 60
  const TOPF_WIDTH = 60
  const TOPF_X = CANVAS_WIDTH / 2 - TOPF_WIDTH / 2
  const GRAVITY = 0.5
  const COIN_RADIUS = 8

  // Parse function input
  const parseFunction = (mStr: string, tStr: string) => {
    const m = parseFloat(mStr.replace(',', '.')) || 0
    const t = parseFloat(tStr.replace(',', '.')) || 0
    return { m, t }
  }

  // Calculate y value for x on the line
  const getYOnLine = (x: number, m: number, t: number) => {
    return m * x + t
  }

  // Coordinate conversion: canvas to graph
  const canvasToGraph = (canvasX: number, canvasY: number) => {
    const graphX = (canvasX - CANVAS_WIDTH / 2) / 50
    const graphY = (CANVAS_HEIGHT / 2 - canvasY) / 50
    return { x: graphX, y: graphY }
  }

  // Coordinate conversion: graph to canvas
  const graphToCanvas = (graphX: number, graphY: number) => {
    const canvasX = graphX * 50 + CANVAS_WIDTH / 2
    const canvasY = CANVAS_HEIGHT / 2 - graphY * 50
    return { x: canvasX, y: canvasY }
  }

  // Start game
  const startGame = () => {
    gameStateRef.current = {
      isRunning: true,
      timeLeft: 120,
      score: 0,
      coins: [],
      nextCoinId: 0,
    }
    setIsRunning(true)
    setScore(0)
    setTimeLeft(120)
  }

  // Draw canvas
  const draw = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    // Clear canvas
    ctx.fillStyle = '#f0f9ff'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw grid
    ctx.strokeStyle = '#e0e7ff'
    ctx.lineWidth = 1
    for (let i = 0; i <= CANVAS_WIDTH; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, CANVAS_HEIGHT)
      ctx.stroke()
    }
    for (let i = 0; i <= CANVAS_HEIGHT; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(CANVAS_WIDTH, i)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT / 2)
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH / 2, 0)
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    ctx.stroke()

    // Draw function graph
    const { m, t } = parseFunction(m, t)
    if (!isNaN(m) && !isNaN(t)) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      ctx.beginPath()
      let firstPoint = true
      for (let canvasX = 0; canvasX <= CANVAS_WIDTH; canvasX += 2) {
        const graphPos = canvasToGraph(canvasX, 0)
        const y = getYOnLine(graphPos.x, m, t)
        const canvasPos = graphToCanvas(graphPos.x, y)
        if (canvasPos.y >= 0 && canvasPos.y <= CANVAS_HEIGHT) {
          if (firstPoint) {
            ctx.moveTo(canvasPos.x, canvasPos.y)
            firstPoint = false
          } else {
            ctx.lineTo(canvasPos.x, canvasPos.y)
          }
        }
      }
      ctx.stroke()
    }

    // Draw topf (pot)
    ctx.fillStyle = '#92400e'
    ctx.fillRect(TOPF_X, TOPF_Y, TOPF_WIDTH, 50)
    ctx.fillStyle = '#d97706'
    ctx.fillRect(TOPF_X + 5, TOPF_Y + 5, TOPF_WIDTH - 10, 15)

    // Draw coins
    gameState.coins.forEach((coin) => {
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(coin.x, coin.y, COIN_RADIUS, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw UI
    ctx.fillStyle = '#000'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(`Punkte: ${gameState.score}`, 20, 30)
    ctx.fillText(`Zeit: ${gameState.timeLeft}s`, CANVAS_WIDTH - 200, 30)
  }

  // Update game physics
  const update = () => {
    const state = gameStateRef.current
    if (!state.isRunning) return

    const { m, t } = parseFunction(m, t)

    // Spawn new coins
    if (Math.random() < 0.03) {
      const coinX = Math.random() * (CANVAS_WIDTH - 100) + 50
      state.coins.push({
        id: state.nextCoinId++,
        x: coinX,
        y: -COIN_RADIUS,
        vx: 0,
        vy: 0,
        onGraph: false,
        collected: false,
      })
    }

    // Update coins
    state.coins = state.coins.filter((coin) => {
      if (coin.collected) return false

      // Apply gravity
      coin.vy += GRAVITY

      // Update position
      coin.x += coin.vx
      coin.y += coin.vy

      // Check if on graph
      if (!coin.onGraph && !isNaN(m) && !isNaN(t)) {
        const graphPos = canvasToGraph(coin.x, coin.y)
        const expectedY = getYOnLine(graphPos.x, m, t)
        const tolerance = 0.5

        if (Math.abs(graphPos.y - expectedY) < tolerance && coin.vy > 0) {
          coin.onGraph = true
          coin.vy = 0
          coin.vx = 0
        }
      }

      // Roll towards pot if on graph
      if (coin.onGraph) {
        const potCenter = TOPF_X + TOPF_WIDTH / 2
        if (coin.x < potCenter - 5) {
          coin.vx = 2
        } else if (coin.x > potCenter + 5) {
          coin.vx = -2
        } else {
          coin.vx = 0
        }

        // Check if in pot
        if (coin.y >= TOPF_Y && coin.x >= TOPF_X && coin.x <= TOPF_X + TOPF_WIDTH) {
          coin.collected = true
          state.score++
          setScore(state.score)
          return false
        }
      }

      // Remove if falls out of bounds
      if (coin.y > CANVAS_HEIGHT + 50) {
        return false
      }

      return true
    })
  }

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameState = gameStateRef.current

    const animate = () => {
      update()
      draw(ctx, gameState)
      requestAnimationFrame(animate)
    }

    animate()
  }, [m, t])

  // Timer
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      gameStateRef.current.timeLeft--
      setTimeLeft(gameStateRef.current.timeLeft)

      if (gameStateRef.current.timeLeft <= 0) {
        gameStateRef.current.isRunning = false
        setIsRunning(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-2 text-blue-900">Münzen-Sammler</h2>
        <p className="text-gray-700 mb-6">
          Gib eine Funktionsgleichung ein, damit die Münzen auf dem Graph landen und zum Topf rollen!
        </p>

        {/* Function Input */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-lg font-semibold mb-3">Funktionsgleichung: y = mx + t</p>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="font-semibold">m =</label>
              <input
                type="text"
                value={m}
                onChange={(e) => setM(e.target.value)}
                disabled={isRunning}
                className="border border-gray-300 rounded px-3 py-2 w-24 text-center"
                placeholder="z.B. 1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold">t =</label>
              <input
                type="text"
                value={t}
                onChange={(e) => setT(e.target.value)}
                disabled={isRunning}
                className="border border-gray-300 rounded px-3 py-2 w-24 text-center"
                placeholder="z.B. 0"
              />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="mb-6 flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-gray-300 rounded-lg bg-blue-50"
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={startGame}
            disabled={isRunning}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {isRunning ? 'Spiel läuft...' : 'Spiel Starten'}
          </button>
        </div>

        {/* Game End Message */}
        {!isRunning && timeLeft <= 0 && (
          <div className="text-center p-4 bg-yellow-100 rounded-lg">
            <p className="text-2xl font-bold text-yellow-800">Spiel vorbei!</p>
            <p className="text-xl text-yellow-700 mt-2">Endpunkte: {score}</p>
          </div>
        )}
      </div>
    </div>
  )
}
