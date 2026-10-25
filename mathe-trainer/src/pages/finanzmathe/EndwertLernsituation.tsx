import { useNavigate } from 'react-router-dom'
import VereinsbusEinstieg from './rentenrechnung_einstieg/VereinsbusEinstieg'

// Route der Lernsituation Rentenrechnung (Endwert). Zurück führt in die Auswahl, Weiter zu den Übungsaufgaben.
export default function EndwertLernsituation() {
  const navigate = useNavigate()
  const go = (path: string) => {
    navigate(path)
    window.scrollTo({ top: 0 })
  }
  return <VereinsbusEinstieg onBack={() => go('/finanzmathe/endwert')} onPractice={() => go('/finanzmathe/endwert/ueben')} />
}
