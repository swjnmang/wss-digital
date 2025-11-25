import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import styles from './LFCommon.module.css'

type Difficulty = 'normal' | 'medium' | 'hard'
type Ramp = { m: number, b: number } | null
type Obstacle = { x: number, y: number, width: number, height: number }
type Bucket = { x: number, y: number, width: number }
type Coin = { x: number, y: number, vy: number }

const RAMP_COLORS = ['#16a34a', '#2563eb', '#ca8a04', '#c026d3']

export default function SpielMuenzen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [ramps, setRamps] = useState<Ramp[]>([null, null, null, null])
  const [bucket, setBucket] = useState<Bucket>({ x: 0, y: -3.25, width: 3 })
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [coins, setCoins] = useState<Coin[]>([])
  const [inputVals, setInputVals] = useState<{ m: string, b: string }[]>([
    { m: '', b: '' }, { m: '', b: '' }, { m: '', b: '' }, { m: '', b: '' }
  ])
  const [autoLeveledUpOnce, setAutoLeveledUpOnce] = useState(false)
  const [autoLeveledUpTwice, setAutoLeveledUpTwice] = useState(false)
  const [canvasDims, setCanvasDims] = useState({ width: 400, height: 300 })

  // Grid math range
  const gridRangeX = 10
  const gridRangeY = (gridRangeX * canvasDims.height) / canvasDims.width

  // Responsive canvas
  useEffect(() => {
    function resize() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        setCanvasDims({ width: w, height: w * 0.75 })
      }
    }
    window.addEventListener('resize', resize)
    resize()
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Difficulty and game reset
  useEffect(() => {
    setScore(0)
    setCoins([])
    setRamps([null, null, null, null])
    setInputVals([{ m: '', b: '' }, { m: '', b: '' }, { m: '', b: '' }, { m: '', b: '' }])
    setAutoLeveledUpOnce(false)
    setAutoLeveledUpTwice(false)
    setupNewRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty])

  function setupNewRound() {
    // Bucket
    const newBucket = { x: Math.random() * 12 - 6, y: -gridRangeY + 0.5, width: 3 }
    setBucket(newBucket)
    // Obstacles
    let obs: Obstacle[] = []
    if (difficulty === 'medium') {
      obs.push({ x: newBucket.x, y: newBucket.y + 2.5, width: 5, height: 1 })
    } else if (difficulty === 'hard') {
      obs.push({ x: newBucket.x, y: newBucket.y + 2.5, width: 5, height: 1 })
      const secondObstacleX = -newBucket.x * 0.8
      obs.push({ x: secondObstacleX, y: 0, width: 1, height: 4 })
    }
    setObstacles(obs)
  }

  // Coin spawner
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(coins => [
        ...coins,
        { x: Math.random() * (gridRangeX * 1.8) - gridRangeX * 0.9, y: gridRangeY + 1, vy: 0.05 + Math.random() * 0.05 }
      ])
    }, 400)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty])

  // Game loop
  useEffect(() => {
    let animationId: number
    function toCanvasX(mathX: number) { return ((mathX + gridRangeX) / (2 * gridRangeX)) * canvasDims.width }
    function toCanvasY(mathY: number) { return ((-mathY + gridRangeY) / (2 * gridRangeY)) * canvasDims.height }

    function draw() {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvasDims.width, canvasDims.height)
      // Grid
      ctx.strokeStyle = '#d4d4d4'; ctx.lineWidth = 1
      for (let i = Math.floor(-gridRangeX); i <= Math.ceil(gridRangeX); i++) {
        ctx.beginPath(); ctx.moveTo(toCanvasX(i), 0); ctx.lineTo(toCanvasX(i), canvasDims.height); ctx.stroke()
      }
      for (let i = Math.floor(-gridRangeY); i <= Math.ceil(gridRangeY); i++) {
        ctx.beginPath(); ctx.moveTo(0, toCanvasY(i)); ctx.lineTo(canvasDims.width, toCanvasY(i)); ctx.stroke()
      }
      ctx.strokeStyle = '#a3a3a3'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, toCanvasY(0)); ctx.lineTo(canvasDims.width, toCanvasY(0)); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(toCanvasX(0), 0); ctx.lineTo(toCanvasX(0), canvasDims.height); ctx.stroke()
      // Bucket
      const bx = toCanvasX(bucket.x), by = toCanvasY(bucket.y), bw = bucket.width * (canvasDims.width / (2 * gridRangeX))
      ctx.fillStyle = '#525252'; ctx.fillRect(bx - bw / 2, by, bw, 30)
      // Obstacles
      obstacles.forEach(ob => {
        const ox = toCanvasX(ob.x), oy = toCanvasY(ob.y), ow = ob.width * (canvasDims.width / (2 * gridRangeX)), oh = ob.height * (canvasDims.height / (2 * gridRangeY))
        ctx.fillStyle = '#dc2626'; ctx.fillRect(ox - ow / 2, oy - oh / 2, ow, oh)
      })
      // Ramps
      ctx.lineWidth = 6; ctx.lineCap = 'round'
      ramps.forEach((ramp, idx) => {
        if (!ramp) return
        ctx.strokeStyle = RAMP_COLORS[idx % RAMP_COLORS.length]
        ctx.beginPath()
        const y1 = ramp.m * (-gridRangeX) + ramp.b
        const y2 = ramp.m * (gridRangeX) + ramp.b
        ctx.moveTo(toCanvasX(-gridRangeX), toCanvasY(y1))
        ctx.lineTo(toCanvasX(gridRangeX), toCanvasY(y2))
        ctx.stroke()
      })
      // Coins
      coins.forEach(coin => {
        ctx.fillStyle = '#f59e0b'
        ctx.beginPath()
        ctx.arc(toCanvasX(coin.x), toCanvasY(coin.y), 8, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    function gameTick() {
      setCoins(coins => {
        let newCoins = [...coins]
        const activeRamps = ramps.filter(r => r !== null) as { m: number, b: number }[]
        for (let i = newCoins.length - 1; i >= 0; i--) {
          const coin = newCoins[i]
          const potentialNextY = coin.y - coin.vy
          let collisionRamp: { m: number, b: number } | null = null
          let collisionY = -Infinity
          activeRamps.forEach(ramp => {
            const rampYAtCoinX = ramp.m * coin.x + ramp.b
            if (rampYAtCoinX <= coin.y && rampYAtCoinX >= potentialNextY) {
              if (rampYAtCoinX > collisionY) {
                collisionY = rampYAtCoinX
                collisionRamp = ramp
              }
            }
          })
          if (collisionRamp !== null) {
            coin.y = collisionY
            const direction = (collisionRamp as { m: number, b: number }).m < 0 ? 1 : -1
            coin.x += direction * 0.1
            coin.y = (collisionRamp as { m: number, b: number }).m * coin.x + (collisionRamp as { m: number, b: number }).b
          } else {
            coin.y = potentialNextY
          }
          let collidedWithObstacle = false
          obstacles.forEach(ob => {
            if (coin.x > ob.x - ob.width / 2 && coin.x < ob.x + ob.width / 2 && coin.y < ob.y + ob.height / 2 && coin.y > ob.y - ob.height / 2) {
              collidedWithObstacle = true
            }
          })
          if (collidedWithObstacle) { newCoins.splice(i, 1); continue }
          if (coin.y <= bucket.y && Math.abs(coin.x - bucket.x) < bucket.width / 2) {
            setScore(s => s + 10)
            newCoins.splice(i, 1)
            if (score + 10 >= 1000 && difficulty === 'normal' && !autoLeveledUpOnce) {
              setAutoLeveledUpOnce(true)
              setDifficulty('medium')
            }
            if (score + 10 >= 2000 && difficulty === 'medium' && !autoLeveledUpTwice) {
              setAutoLeveledUpTwice(true)
              setDifficulty('hard')
            }
            continue
          }
          if (coin.y < -gridRangeY - 2) { newCoins.splice(i, 1); continue }
        }
        return newCoins
      })
      draw()
      animationId = requestAnimationFrame(gameTick)
    }
    animationId = requestAnimationFrame(gameTick)
    return () => cancelAnimationFrame(animationId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasDims, ramps, coins, bucket, obstacles, difficulty, autoLeveledUpOnce, autoLeveledUpTwice, score])

  // Ramp controls
  function handleRampInput(idx: number, field: 'm' | 'b', val: string) {
    setInputVals(vals => {
      const newVals = [...vals]
      newVals[idx][field] = val
      return newVals
    })
  }
  function buildRamp(idx: number) {
    const m = parseFloat(inputVals[idx].m)
    const b = parseFloat(inputVals[idx].b)
    if (!isNaN(m) && !isNaN(b)) {
      setRamps(ramps => {
        const newRamps = [...ramps]
        newRamps[idx] = { m, b }
        return newRamps
      })
    }
  }
  function clearRamp(idx: number) {
    setRamps(ramps => {
      const newRamps = [...ramps]
      newRamps[idx] = null
      return newRamps
    })
    setInputVals(vals => {
      const newVals = [...vals]
      newVals[idx] = { m: '', b: '' }
      return newVals
    })
  }

  // Difficulty button helpers
  function difficultyBtnClass(level: Difficulty) {
    return `difficulty-btn px-4 py-2 rounded font-bold text-sm ${difficulty === level ? 'bg-blue-700 text-white' : 'bg-neutral-300 text-neutral-800'}`
  }

  // Number of ramps by difficulty
  const numRamps = difficulty === 'hard' ? 4 : difficulty === 'medium' ? 3 : 2

  return (
    <div className={`prose ${styles.container}`}> 
      <Link to="/lineare_funktionen" className={styles.back}>← Zurück</Link>
      <div className={styles.card}>
        <h2 className={styles.title}>Münzen-Sammler</h2>
        <div className={styles.content}>
          <p className="text-neutral-500 mb-2">Baue Rampen, um die Münzen um die Hindernisse in den Eimer zu leiten!</p>
          <div className="flex flex-col sm:flex-row justify-between items-center bg-neutral-100 p-3 rounded-lg mb-4 text-xl gap-4">
            <div>
              <span className="font-bold text-neutral-600">Punkte:</span>
              <span className="font-bold text-amber-500 ml-2">{score}</span>
            </div>
            <div className="flex gap-2">
              <button className={difficultyBtnClass('normal')} onClick={() => setDifficulty('normal')}>Normal</button>
              <button className={difficultyBtnClass('medium')} onClick={() => setDifficulty('medium')}>Mittel</button>
              <button className={difficultyBtnClass('hard')} onClick={() => setDifficulty('hard')}>Schwer</button>
            </div>
          </div>
          <div ref={containerRef} className="relative w-full" style={{ paddingBottom: '75%' }}>
            <canvas ref={canvasRef} width={canvasDims.width} height={canvasDims.height} className="absolute top-0 left-0 w-full h-full rounded-lg" />
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-100 rounded-lg">
            {Array.from({ length: numRamps }).map((_, i) => (
              <div key={i} className="ramp-control p-3 rounded-lg border-2" style={{ borderColor: RAMP_COLORS[i] }}>
                <h3 className="font-bold text-lg mb-2" style={{ color: RAMP_COLORS[i] }}>Rampe {i + 1}</h3>
                <div className="flex items-center gap-2 justify-center mb-3">
                  <span className="input-label">y=</span>
                  <input type="number" className="input-field" step="0.1" value={inputVals[i].m} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRampInput(i, 'm', e.target.value)} />
                  <span className="input-label">x+</span>
                  <input type="number" className="input-field" step="0.5" value={inputVals[i].b} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRampInput(i, 'b', e.target.value)} />
                </div>
                <div className="flex gap-2 justify-center">
                  <button className="build-button bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded text-md w-full" onClick={() => buildRamp(i)}>{ramps[i] ? 'Ändern' : 'Bauen'}</button>
                  {ramps[i] && (
                    <button className="clear-button bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded text-md w-full" onClick={() => clearRamp(i)}>Löschen</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
