import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './Nullstellen.module.css'

declare global {
  interface Window { 
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function Nullstellen() {
  const [m, setM] = useState<number>(1)
  const [t, setT] = useState<number>(0)
  const [xInput, setXInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const youtubePlayerRef = useRef<any>(null)

  useEffect(() => {
    gen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load YouTube IFrame API when video modal opens
  useEffect(() => {
    if (!showVideoModal) return

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    }

    // Initialize player when API is ready
    const initializePlayer = () => {
      if (window.YT && window.YT.Player && !youtubePlayerRef.current) {
        youtubePlayerRef.current = new window.YT.Player('youtube-player-nullstellen', {
          height: '390',
          width: '640',
          videoId: 'yIaIp8YaZp4'
        })
      }
    }

    // Check if API is ready, otherwise wait for onYouTubeIframeAPIReady
    if (window.YT && window.YT.Player) {
      initializePlayer()
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer
    }

    return () => {
      // Cleanup when modal closes
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.destroy === 'function') {
        youtubePlayerRef.current.destroy()
        youtubePlayerRef.current = null
      }
    }
  }, [showVideoModal])

  function gen() {
    let slope = 0
    while (slope === 0) slope = randInt(-4, 4)
    const intercept = randInt(-6, 6)
    setM(slope)
    setT(intercept)
    setXInput('')
    setFeedback('')
    setShowSolution(false)
  }

  function check() {
    setFeedback('')
    const xi = parseFloat(xInput.replace(',', '.'))
    if (isNaN(xi)) {
      setFeedback('Bitte eine gültige Zahl eingeben.')
      return
    }
    const xTrue = -t / m
    if (Math.abs(xi - xTrue) < 0.02) {
      setFeedback('Richtig!')
    } else {
      setFeedback('Falsch. Versuche es noch einmal oder zeige die Lösung.')
    }
  }

  return (
    <div className={`prose ${styles.container}`}>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Nullstellen berechnen</h2>
        <p>Gegeben ist die Gerade y = {m}x {t >= 0 ? '+ ' + t : '- ' + Math.abs(t)}. Bestimme die Nullstelle (x-Wert), also die Lösung von y = 0.</p>

        <div className={styles.inputRow}>
          <label className={styles.label}>x = <input value={xInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXInput(e.target.value)} className={styles.input} placeholder="z.B. 2.5" /></label>
        </div>

        <div className={styles.actions}>
          <button onClick={check} className={styles.primary}>Prüfen</button>
          <button onClick={() => setShowSolution(true)} className={styles.secondary}>Lösung anzeigen</button>
          <button onClick={() => setShowVideoModal(true)} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}>🎥 Erklärvideo</button>
          <button onClick={gen} className={styles.ghost}>Neue Aufgabe</button>
        </div>

        {feedback && <div className={styles.feedback}>{feedback}</div>}

        {showSolution && (
          <div className={styles.solution}>
            <h3>Lösungsschritte</h3>
            <p>{`Setze y = 0: 0 = ${m}x ${t >= 0 ? '+ ' + t : '- ' + Math.abs(t)}`}</p>
            <p>{`=> ${m}x = ${-t}`}</p>
            <p>{`=> x = ${-t} / ${m} = ${((-t / m)).toFixed(4)}`}</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', maxWidth: '800px', width: '90%', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Erklärvideo: Nullstellen berechnen</h3>
              <button onClick={() => setShowVideoModal(false)} style={{ backgroundColor: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div id="youtube-player-nullstellen" style={{ marginBottom: '1rem' }}></div>
            <button onClick={() => setShowVideoModal(false)} style={{ marginTop: '1.5rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Schließen</button>
          </div>
        </div>
      )}
    </div>
  )
}

