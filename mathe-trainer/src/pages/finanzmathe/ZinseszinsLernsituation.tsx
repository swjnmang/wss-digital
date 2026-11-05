import { useNavigate, useSearchParams } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import DreiFragenEinstieg from './zinseszins_lernsituation/DreiFragenEinstieg'
import MuenztuermeEinstieg from './zinseszins_lernsituation/MuenztuermeEinstieg'

// Routen der beiden Zinseszins-Lernsituationen: 1 „Die Münztürme“ (Endkapital) und 2 „Miras drei Fragen“ (K_0, q bzw. p, n).
// Zurück führt in die Auswahl, Weiter üben zum Zinseszinsrechner. Alte Links mit ?teil=2 führen weiterhin auf Lernsituation 2.
export default function ZinseszinsLernsituation({ teil = 1 }: { teil?: 1 | 2 }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const go = (path: string) => {
    navigate(path)
    window.scrollTo({ top: 0 })
  }
  const props = { onBack: () => go('/finanzmathe/zinseszins'), onPractice: () => go('/finanzmathe/zinseszins/ueben') }
  return teil === 2 || params.get('teil') === '2' ? (
    <DreiFragenEinstieg {...props} onPrev={() => go('/finanzmathe/zinseszins/lernsituation')} />
  ) : (
    <MuenztuermeEinstieg {...props} onNext={() => go('/finanzmathe/zinseszins/lernsituation-2')} />
  )
}
