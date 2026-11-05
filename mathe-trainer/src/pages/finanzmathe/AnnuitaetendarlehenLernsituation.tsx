import { useNavigate } from 'react-router-dom'
import SolaranlageEinstieg from './annuitaetendarlehen_einstieg/SolaranlageEinstieg'

// Route der Lernsituation Annuitätendarlehen. Zurück führt in die Auswahl, Weiter zu den Übungsaufgaben (Tilgungsplan).
export default function AnnuitaetendarlehenLernsituation() {
  const navigate = useNavigate()
  const go = (path: string) => {
    navigate(path)
    window.scrollTo({ top: 0 })
  }
  return <SolaranlageEinstieg onBack={() => go('/finanzmathe/annuitaetendarlehen')} onPractice={() => go('/finanzmathe/annuitaetendarlehen/ueben')} />
}
