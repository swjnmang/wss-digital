import React, { useEffect, useRef, useState } from 'react'
import styles from './Ablesen.module.css'

declare global {
  interface Window { GGBApplet: any }
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function Ablesen() {
  const [m, setM] = useState<number>(1)
  const [t, setT] = useState<number>(0)
  const [mInput, setMInput] = useState('')
  const [tInput, setTInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const ggbRef = useRef<HTMLDivElement | null>(null)
  const ggbInstance = useRef<any>(null)

  // Load GeoGebra script once and initialize applet
  useEffect(() => {
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]')
    function initApplet() {
      if (!window.GGBApplet || !ggbRef.current) return
      const params: any = {
        // match the original static page: use classic app and Graphics-only perspective
        appName: 'classic', width: 350, height: 350,
        showToolBar: false, showAlgebraInput: false, showMenuBar: false,
        perspective: 'G', useBrowserForJS: true,
        appletOnLoad: (api: any) => {
          ggbInstance.current = api
          // Best-effort: tell the applet to hide algebra & switch to graph view.
          try { if (typeof api.setAlgebraVisible === 'function') api.setAlgebraVisible(false) } catch(e) {}
          try { if (typeof api.setActiveView === 'function') api.setActiveView('G') } catch(e) {}

          // Some versions of GeoGebra re-create UI after load. Call the safe API several times
          // and schedule a couple of retries. If the API is missing, we'll fall back to DOM cleanup.
          for (let i = 0; i < 3; i++) {
            const delay = i * 300
            setTimeout(() => {
              try { if (typeof api.setAlgebraVisible === 'function') api.setAlgebraVisible(false) } catch(e) {}
              // NOTE: avoid calling evalCommand('ShowView[...]') because some GeoGebra builds
              // show a modal dialog for unknown commands (we saw "Unbekannter Befehl : ShowView").
              // We rely on the safe setAlgebraVisible API above and a DOM fallback below.
            }, delay)
          }

          // Install a MutationObserver fallback to hide any left-side panel that appears later.
          installLeftPanelHider()
          installModalHider()

          // Extra defensive calls for different GeoGebra API variants
          try { if (typeof api.setAlgebraVisible === 'function') api.setAlgebraVisible(false) } catch (e) {}
          try { if (typeof api.setShowAlgebra === 'function') api.setShowAlgebra(false) } catch (e) {}
          try { if (typeof api.setShowAlgebraView === 'function') api.setShowAlgebraView(false) } catch (e) {}

          // small delayed attempt: call variants again and inspect DOM to find any remaining panels
          setTimeout(() => {
            try { if (typeof api.setAlgebraVisible === 'function') api.setAlgebraVisible(false) } catch (e) {}
            try { if (typeof api.setShowAlgebra === 'function') api.setShowAlgebra(false) } catch (e) {}
            try { if (typeof api.setShowAlgebraView === 'function') api.setShowAlgebraView(false) } catch (e) {}

            // Debug: enumerate potential left-panel elements and log details to console so we can tune selectors
            try {
              const container = document.getElementById('ggb-container')
              if (container) {
                const parentRect = container.getBoundingClientRect()
                const candidates: Element[] = []
                Array.from(container.querySelectorAll('*')).forEach(el => {
                  if (!(el instanceof HTMLElement)) return
                  const r = el.getBoundingClientRect()
                  if (r.width >= 6 && r.width < parentRect.width * 0.6 && Math.abs(r.left - parentRect.left) < 20 && r.height > 30) {
                    candidates.push(el)
                  }
                })
                if (candidates.length) {
                  console.group('GeoGebra: left-panel candidates')
                  candidates.forEach((el, idx) => {
                    console.log(idx, { tag: el.tagName, class: el.className, aria: (el as HTMLElement).getAttribute('aria-label'), outer: (el as HTMLElement).outerHTML.slice(0,400) })
                    // try hiding aggressively
                    try { (el as HTMLElement).style.display = 'none'; (el as HTMLElement).dataset.ggHidden = '1' } catch (e) {}
                  })
                  console.groupEnd()
                } else {
                  console.debug('GeoGebra: no left-panel-like candidates found in #ggb-container')
                }
              }
            } catch (e) { /* ignore */ }
          }, 450)

          generateNew(api)
        }
      }
      const applet = new window.GGBApplet(params, true)
      // inject into the original static element id so GeoGebra picks up intended options
      applet.inject('ggb-element')
    }

    if (!existing) {
      const s = document.createElement('script')
      s.src = 'https://www.geogebra.org/apps/deployggb.js'
      s.async = true
      s.onload = () => initApplet()
      document.body.appendChild(s)
    } else {
      initApplet()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Helper: hide left-side GeoGebra panel by observing DOM changes ---
  function installLeftPanelHider() {
    const container = document.getElementById('ggb-container')
    if (!container) return

    // Inject a small, targeted CSS fallback to hide common GeoGebra algebra/sidebar selectors.
    // This is scoped to #ggb-container and uses !important to beat inline styles from the applet.
    try {
      if (!document.getElementById('ggb-hide-left-panel-style')) {
        const s = document.createElement('style')
        s.id = 'ggb-hide-left-panel-style'
        s.textContent = `#ggb-container .algebraView, #ggb-container .ggbAlgebraView, #ggb-container .ggbSidebar, #ggb-container [class*="Algebra"], #ggb-container [aria-label*="Algebra"], #ggb-container .sidebar { display: none !important; }
        #ggb-container [role="complementary"] { display: none !important; }`
        document.head.appendChild(s)
      }
    } catch (e) { /* ignore */ }

    const hideIfLeftPanel = (el: Element) => {
      if (!(el instanceof HTMLElement)) return false
      // Already hidden by us?
      if (el.dataset && el.dataset.ggHidden === '1') return false
      const rect = el.getBoundingClientRect()
      const parentRect = container.getBoundingClientRect()
      // Heuristic: element anchored to left of container and occupies a vertical band
      // Accept narrow collapsed panels too (width >= 8px) since some GeoGebra builds may show a thin strip.
      if (rect.width >= 8 && rect.width < parentRect.width * 0.5 && Math.abs(rect.left - parentRect.left) < 12 && rect.height > 40) {
        // Also check textual hints (labels or inner text GeoGebra often shows)
        const txt = (el.textContent || '').trim()
        if (txt.length > 0 && (txt.includes('f(x)') || txt.includes('GeoGebra') || txt.includes('P1') || txt.includes('y-Achse') || txt.includes('Algebra'))) {
          el.style.display = 'none'
          el.dataset.ggHidden = '1'
          console.debug('Hid left panel by text heuristic', el)
          return true
        }
        // If no text, still hide panels that look like an algebra sidebar (likely ARIA role or many inputs)
        const inputs = el.querySelectorAll('input, button, label')
        if (inputs.length >= 2) {
          el.style.display = 'none'
          el.dataset.ggHidden = '1'
          console.debug('Hid left panel by input-count heuristic', el)
          return true
        }
        // Also hide if element has aria-label mentioning algebra
        const aria = el.getAttribute('aria-label') || ''
        if (aria.toLowerCase().includes('algebra')) {
          el.style.display = 'none'
          el.dataset.ggHidden = '1'
          console.debug('Hid left panel by aria-label', el)
          return true
        }
      }
      return false
    }

    // Initial pass: scan existing children
    Array.from(container.querySelectorAll('*')).forEach(n => hideIfLeftPanel(n))
    // Also try explicit selectors in case the panel uses known classes/attributes
    try {
      const explicit = container.querySelectorAll('.algebraView, .ggbAlgebraView, .ggbSidebar, [aria-label*="Algebra"], [class*="Algebra"], [role="complementary"]')
      explicit.forEach((el) => { (el as HTMLElement).style.display = 'none'; (el as HTMLElement).dataset.ggHidden = '1'; console.debug('Hid left panel by explicit selector', el) })
    } catch (e) { /* ignore */ }

    const observer = new MutationObserver(muts => {
      for (const m of muts) {
        m.addedNodes.forEach(n => {
          try {
            hideIfLeftPanel(n as Element)
            // also check descendants
            if (n instanceof Element) Array.from(n.querySelectorAll('*')).forEach(d => hideIfLeftPanel(d))
          } catch (e) { /* ignore */ }
        })
      }
    })

    observer.observe(container, { childList: true, subtree: true })

    // cleanup on unmount
    const to = setTimeout(() => { observer.disconnect() }, 30_000)
    // store on ref so we can clear if component unmounts quickly
    ;(ggbRef.current as any).__ggb_panel_observer = { observer, timeoutId: to }
  }

  // --- Helper: hide GeoGebra error modal dialogs that some builds show for unsupported commands ---
  function installModalHider() {
    const body = document.body
    if (!body) return

    const hideModalNode = (n: Node) => {
      try {
        if (!(n instanceof Element)) return false
        const text = (n.textContent || '')
        if (!text) return false
        const lowered = text.toLowerCase()
        if (lowered.includes('unbekannter befehl') || lowered.includes('fehler') || lowered.includes('unknown command')) {
          // prefer hiding the dialog container (role=dialog) if present
          const dialog = (n as Element).closest('[role="dialog"], .modal, .Dialog, .ggb-dialog')
          const target = dialog || (n as Element)
          ;(target as HTMLElement).style.display = 'none'
          console.debug('GeoGebra modal hidden by installModalHider', { textSnippet: text.slice(0, 80), target })
          return true
        }
      } catch (e) { /* ignore */ }
      return false
    }

    // initial sweep
    Array.from(body.querySelectorAll('*')).forEach(el => hideModalNode(el))

    const obs = new MutationObserver(muts => {
      for (const m of muts) {
        m.addedNodes.forEach(n => {
          try {
            if (hideModalNode(n)) return
            if (n instanceof Element) Array.from(n.querySelectorAll('*')).forEach(el => hideModalNode(el))
          } catch (e) { /* ignore */ }
        })
      }
    })

    obs.observe(body, { childList: true, subtree: true })
    const to = setTimeout(() => obs.disconnect(), 30_000)
    ;(ggbRef.current as any).__ggb_modal_observer = { observer: obs, timeoutId: to }
  }


  function generateNew(instance?: any) {
    const api = instance || ggbInstance.current
    const slopeCandidates = [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2]
    const slope = slopeCandidates[Math.floor(Math.random() * slopeCandidates.length)]
    const intercept = randInt(-4, 4)
    setM(slope); setT(intercept); setMInput(''); setTInput(''); setFeedback(''); setShowSolution(false)
    if (!api) return
    const correctM = Math.round(slope * 100) / 100
    const correctT = Math.round(intercept * 100) / 100
    try {
      api.reset()
      api.evalCommand(`f(x) = ${correctM}*x + ${correctT}`)
      api.evalCommand(`P1=(0, ${correctT})`)
      api.evalCommand(`P2=(1, ${correctM + correctT})`)
      try { api.setVisible('P1', false); api.setVisible('P2', false) } catch(e) {}
      try { if (typeof api.setAxesVisible === 'function') api.setAxesVisible(true, true) } catch(e) {}
      try { if (typeof api.setGridVisible === 'function') api.setGridVisible(true) } catch(e) {}
      try { if (typeof api.setCoordSystem === 'function') api.setCoordSystem(-7, 7, -7, 7) } catch(e) {}
    } catch (e) { /* ignore */ }
  }

  function check() {
    setFeedback('')
    const mi = parseFloat(mInput.replace(',', '.'))
    const ti = parseFloat(tInput.replace(',', '.'))
    if (isNaN(mi) || isNaN(ti)) { setFeedback('Bitte gültige Zahlen für m und t eingeben.'); return }
    const ok = Math.abs(mi - m) < 0.03 && Math.abs(ti - t) < 0.03
    if (ok) setFeedback('Richtig — gut abgelesen!')
    else setFeedback('Nicht ganz. Probiere es noch einmal oder zeige die Lösung.')
  }

  return (
    <div className={`prose ${styles.container}`}>
      <div className={styles.card}>
        <h2>Funktionsgleichung ablesen</h2>
        <p>Ableseaufgabe: Lies Steigung m und y-Achsenabschnitt t aus dem Graphen ab.</p>

        <div id="ggb-container" className={styles.svgWrap}>
          <div id="ggb-element" ref={ggbRef} style={{ width: 350, height: 350, border: '1px solid #ccc', borderRadius: 8, background: 'white' }} />
        </div>

        <div className={styles.inputRow}>
          <label className={styles.label}>m = <input value={mInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMInput(e.target.value)} className={styles.input} placeholder="z.B. 1.5" /></label>
          <label className={styles.label}>t = <input value={tInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTInput(e.target.value)} className={styles.input} placeholder="z.B. 2" /></label>
        </div>

        <div className={styles.actions}>
          <button onClick={check} className={styles.primary}>Prüfen</button>
          <button onClick={() => setShowSolution(true)} className={styles.secondary}>Lösung anzeigen</button>
          <button onClick={() => generateNew()} className={styles.ghost}>Neue Aufgabe</button>
        </div>

        {feedback && <div className={styles.feedback}>{feedback}</div>}

        {showSolution && (
          <div className={styles.solution}>
            <p>Steigung m = {m}</p>
            <p>y-Achsenabschnitt t = {t}</p>
            <p>Gleichung: y = {m}x {t >= 0 ? '+ ' + t : '- ' + Math.abs(t)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
