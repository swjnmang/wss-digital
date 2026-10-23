import { useEffect, useRef, useState } from 'react'
import GeoGebraGraph from './GeoGebraGraph'

/** GeoGebra-Graph, der sich der verfügbaren Breite anpasst (quadratisch, 200–480 px) und der Fensterhöhe. */
export default function ResponsiveGeoGebraGraph({ m, t }: { m: number; t: number }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(400)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    // Größe in 40-px-Schritten, damit der Graph nicht bei jedem Pixel neu lädt
    const update = () => {
      const byHeight = Math.floor(window.innerHeight * 0.5)
      setSize(Math.max(200, Math.min(480, byHeight, Math.floor((el.clientWidth - 24) / 40) * 40)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div ref={boxRef} className="flex justify-center mb-4 w-full overflow-hidden">
      <div key={size}>
        <GeoGebraGraph m={m} t={t} width={size} height={size} />
      </div>
    </div>
  )
}
