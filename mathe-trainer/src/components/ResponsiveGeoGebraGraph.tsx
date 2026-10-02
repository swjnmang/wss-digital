import { useEffect, useRef, useState } from 'react'
import GeoGebraGraph from './GeoGebraGraph'

/** GeoGebra-Graph, der sich der verfügbaren Breite anpasst (quadratisch, 240–480 px). */
export default function ResponsiveGeoGebraGraph({ m, t }: { m: number; t: number }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(400)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    // Größe in 40-px-Schritten, damit der Graph nicht bei jedem Pixel neu lädt
    const update = () => setSize(Math.max(240, Math.min(480, Math.floor((el.clientWidth - 24) / 40) * 40)))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={boxRef} className="flex justify-center mb-4 w-full overflow-hidden">
      <div key={size}>
        <GeoGebraGraph m={m} t={t} width={size} height={size} />
      </div>
    </div>
  )
}
