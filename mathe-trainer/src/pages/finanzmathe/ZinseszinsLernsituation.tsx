import { useNavigate, useSearchParams } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import VerdopplungEinstieg from './zinseszins_lernsituation/VerdopplungEinstieg'
import WachstumEinstieg from './zinseszins_lernsituation/WachstumEinstieg'

// Routen der beiden Zinseszins-Lernsituationen: 1 „Wer hat nach 10 Jahren mehr?“ (Endkapital) und 2 „Miras drei Fragen“ (K_0, q bzw. p, n).
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
    <VerdopplungEinstieg {...props} onPrev={() => go('/finanzmathe/zinseszins/lernsituation')} />
  ) : (
    <WachstumEinstieg {...props} onNext={() => go('/finanzmathe/zinseszins/lernsituation-2')} />
  )
}
