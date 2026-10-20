import { useNavigate } from 'react-router-dom'
import BankEinstieg from './zinsrechnung_einstieg/BankEinstieg'

// Route /finanzmathe/zinsrechnung/lernsituation: Zurück führt in die Auswahl, Weiter zu „Zinsrechnung üben“
export default function ZinsrechnungLernsituation() {
  const navigate = useNavigate()
  return (
    <BankEinstieg
      onBack={() => {
        navigate('/finanzmathe/zinsrechnung')
        window.scrollTo({ top: 0 })
      }}
      onPractice={() => {
        navigate('/finanzmathe/zinsrechnung/ueben')
        window.scrollTo({ top: 0 })
      }}
    />
  )
}
