import { useNavigate } from 'react-router-dom'
import BackofenEinstieg from './ratendarlehen_einstieg/BackofenEinstieg'

// Route der Lernsituation Ratendarlehen. Zurück führt in die Auswahl, Weiter zu den Übungsaufgaben (Tilgungsplan).
export default function RatendarlehenLernsituation() {
  const navigate = useNavigate()
  const go = (path: string) => {
    navigate(path)
    window.scrollTo({ top: 0 })
  }
  return <BackofenEinstieg onBack={() => go('/finanzmathe/ratendarlehen')} onPractice={() => go('/finanzmathe/ratendarlehen/ueben')} />
}
