import { useNavigate } from 'react-router-dom'
import { BASIS } from './FunktionsgleichungMenu'
import TorbogenEinstieg from './funktionsgleichung_einstieg/TorbogenEinstieg'
import SchuelerfirmaEinstieg from './funktionsgleichung_einstieg/SchuelerfirmaEinstieg'

// Routen der Lernsituationen „Funktionsgleichung aufstellen“: 1 = Scheitelpunkt und ein Punkt (Fall 1), 2 = ein Wert und zwei Punkte (Fall 2).
// Zurück führt in die Auswahl, Weiter zu den Übungsaufgaben des passenden Falls. Beide Lernsituationen betten ihr Lernvideo selbst ein.
export default function FunktionsgleichungLernsituation({ teil = 1 }: { teil?: 1 | 2 }) {
  const navigate = useNavigate()
  const go = (path: string) => {
    navigate(path)
    window.scrollTo({ top: 0 })
  }
  const onBack = () => go(BASIS)
  return teil === 1 ? (
    <TorbogenEinstieg
      onBack={onBack}
      onPractice={() => go(`${BASIS}/ueben?fall=scheitel`)}
      onNext={() => go(`${BASIS}/lernsituation-2`)}
    />
  ) : (
    <SchuelerfirmaEinstieg
      onBack={onBack}
      onPractice={() => go(`${BASIS}/ueben?fall=punkte`)}
      onPrev={() => go(`${BASIS}/lernsituation-1`)}
    />
  )
}
