import { useNavigate } from 'react-router-dom'
import BankEinstieg from './zinsrechnung_einstieg/BankEinstieg'
import KasseEinstieg from './zinsrechnung_einstieg/KasseEinstieg'

// Routen der Lernsituation Zinsrechnung: Teil 1 (Z berechnen) und Teil 2 (K, p und t berechnen).
// Zurück führt in die Auswahl, Weiter zu „Zinsrechnung üben“.
export default function ZinsrechnungLernsituation({ teil = 1 }: { teil?: 1 | 2 }) {
  const navigate = useNavigate()
  const go = (path: string) => {
    navigate(path)
    window.scrollTo({ top: 0 })
  }
  const props = { onBack: () => go('/finanzmathe/zinsrechnung'), onPractice: () => go('/finanzmathe/zinsrechnung/ueben') }
  return teil === 1 ? (
    <BankEinstieg {...props} onNext={() => go('/finanzmathe/zinsrechnung/lernsituation-2')} />
  ) : (
    <KasseEinstieg {...props} onPrev={() => go('/finanzmathe/zinsrechnung/lernsituation')} />
  )
}
