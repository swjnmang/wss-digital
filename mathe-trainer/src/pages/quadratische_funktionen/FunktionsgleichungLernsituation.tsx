import { useNavigate } from 'react-router-dom'
import { BASIS } from './FunktionsgleichungMenu'
import TorbogenEinstieg from './funktionsgleichung_einstieg/TorbogenEinstieg'
import LaborEinstieg from './funktionsgleichung_einstieg/LaborEinstieg'
import KorbwurfEinstieg from './funktionsgleichung_einstieg/KorbwurfEinstieg'

// Routen der Lernsituationen „Funktionsgleichung aufstellen“: 1 = Scheitelpunkt und ein Punkt (Fall 1), 2 = Additions- und Subtraktionsverfahren
// (Grundlage für Fall 2), 3 = ein Wert und zwei Punkte (Fall 2). Zurück führt in die Auswahl, Weiter zu den passenden Übungsaufgaben.
// Alle Lernsituationen betten ihr Lernvideo selbst ein.
export default function FunktionsgleichungLernsituation({ teil = 1 }: { teil?: 1 | 2 | 3 }) {
  const navigate = useNavigate()
  const go = (path: string) => {
    navigate(path)
    window.scrollTo({ top: 0 })
  }
  const onBack = () => go(BASIS)
  if (teil === 1)
    return (
      <TorbogenEinstieg
        onBack={onBack}
        onPractice={() => go(`${BASIS}/ueben?fall=scheitel`)}
        onNext={() => go(`${BASIS}/lernsituation-2`)}
      />
    )
  if (teil === 2)
    return (
      <LaborEinstieg
        onBack={onBack}
        onPractice={() => go('/lineare_funktionen/gleichungssysteme?verfahren=addieren')}
        onPrev={() => go(`${BASIS}/lernsituation-1`)}
        onNext={() => go(`${BASIS}/lernsituation-3`)}
      />
    )
  return (
    <KorbwurfEinstieg
      onBack={onBack}
      onPractice={() => go(`${BASIS}/ueben?fall=punkte`)}
      onPrev={() => go(`${BASIS}/lernsituation-2`)}
    />
  )
}
