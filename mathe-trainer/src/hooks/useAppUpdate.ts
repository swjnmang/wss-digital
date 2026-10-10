import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Automatisches Aktualisieren auf Schul-Tablets, ohne angefangene Aufgaben zu verlieren.
// Die App vergleicht ihre Build-Kennung regelmäßig mit /version.json. Liegt eine neue Version vor,
// wird nur an „sicheren“ Stellen neu geladen:
//   1. beim nächsten Seitenwechsel (die alte Seite wird ohnehin verlassen),
//   2. wenn der Tab an einem neuen Tag wieder sichtbar wird oder 30 Minuten lang nichts eingegeben wurde,
//   3. wenn der Nutzer im Hinweisband auf „Aktualisieren“ tippt.

declare const __BUILD_ID__: string

const CHECK_EVERY = 10 * 60 * 1000
const IDLE_LIMIT = 30 * 60 * 1000

const dayOf = (t: number) => new Date(t).toDateString()

async function latestBuild(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { build?: string }
    return data.build ?? null
  } catch {
    return null
  }
}

export function useAppUpdate() {
  const { pathname } = useLocation()
  const [available, setAvailable] = useState(false)
  const availableRef = useRef(false)
  const lastActivity = useRef(Date.now())
  const firstPath = useRef(pathname)

  const reload = useCallback(() => window.location.reload(), [])

  const check = useCallback(async () => {
    if (import.meta.env.DEV || availableRef.current) return availableRef.current
    const build = await latestBuild()
    if (build && build !== __BUILD_ID__) {
      availableRef.current = true
      setAvailable(true)
    }
    return availableRef.current
  }, [])

  // 1. Seitenwechsel: die neue Seite gleich frisch vom Server laden
  useEffect(() => {
    if (pathname === firstPath.current) return
    firstPath.current = pathname
    if (availableRef.current) reload()
  }, [pathname, reload])

  // 2. Aktivität merken, regelmäßig prüfen, nach Pause oder am neuen Tag neu laden
  useEffect(() => {
    const touch = () => { lastActivity.current = Date.now() }
    const events = ['pointerdown', 'keydown', 'input', 'wheel', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }))

    const reloadIfIdle = async () => {
      const now = Date.now()
      const newDay = dayOf(now) !== dayOf(lastActivity.current)
      const idle = now - lastActivity.current >= IDLE_LIMIT
      const has = await check()
      if (has && (newDay || idle)) reload()
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') void reloadIfIdle()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)

    void check()
    const timer = window.setInterval(() => {
      void check().then((has) => {
        if (has && Date.now() - lastActivity.current >= IDLE_LIMIT) reload()
      })
    }, CHECK_EVERY)
    const idleTimer = window.setInterval(() => {
      if (availableRef.current && Date.now() - lastActivity.current >= IDLE_LIMIT) reload()
    }, 60 * 1000)

    return () => {
      events.forEach((e) => window.removeEventListener(e, touch))
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      window.clearInterval(timer)
      window.clearInterval(idleTimer)
    }
  }, [check, reload])

  // 3. Hinweisband
  return { available, reload }
}
