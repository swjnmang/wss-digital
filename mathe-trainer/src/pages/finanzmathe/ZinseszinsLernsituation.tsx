import { Link, useSearchParams } from 'react-router-dom'
import TaskShell from '../../components/layout/TaskShell'
import 'katex/dist/katex.min.css'
import '../daten_und_zufall/lernpfad/lernpfad.css'
import Teil1 from './zinseszins_lernsituation/Teil1'
import Teil2 from './zinseszins_lernsituation/Teil2'

// Einstiegs-Lernsituation „Wer hat nach 10 Jahren mehr?“ zum Zinseszins, zwei Teile à 90 Minuten.
// Teil 1: Endkapital K_n. Teil 2: K_0, q (p) und n. Format Kontrastierende Fälle, Look Messenger-Chat,
// Lernprodukt analog (Concept Map). Die Videos kommen aus der Übungsseite „Zinseszins“, die unverändert bleibt.
// Der Teil steht in der Adresse (?teil=2), damit die Lehrkraft direkt auf Teil 2 verlinken kann.

export default function ZinseszinsLernsituation() {
  const [params, setParams] = useSearchParams()
  const teil = params.get('teil') === '2' ? 2 : 1

  const wechsel = (t: 1 | 2) => {
    setParams(t === 1 ? {} : { teil: '2' })
    window.scrollTo({ top: 0 })
  }

  return (
    <TaskShell title="Zinseszins: Lernsituation" subtitle="Wer hat nach 10 Jahren mehr?" width="wide">
      <div className="lp">
        <div className="bk-seg" role="tablist" aria-label="Teil der Lernsituation" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" role="tab" aria-selected={teil === 1} className={`bk-btn ${teil === 1 ? 'bk-btn-primary' : ''}`} onClick={() => wechsel(1)}>
            Teil 1 · Endkapital <span aria-hidden="true">(90 min)</span>
          </button>
          <button type="button" role="tab" aria-selected={teil === 2} className={`bk-btn ${teil === 2 ? 'bk-btn-primary' : ''}`} onClick={() => wechsel(2)}>
            Teil 2 · Anfangskapital, Zinssatz, Laufzeit <span aria-hidden="true">(90 min)</span>
          </button>
        </div>

        {teil === 1 ? <Teil1 /> : <Teil2 />}

        <nav className="lp-nav" aria-label="Weiter">
          {teil === 1 ? (
            <>
              <Link className="bk-btn" to="/finanzmathe">
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zur Übersicht Finanzmathematik
              </Link>
              <button type="button" className="bk-btn bk-btn-primary" onClick={() => wechsel(2)}>
                Weiter zu Teil 2 <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="bk-btn" onClick={() => wechsel(1)}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zu Teil 1
              </button>
              <Link className="bk-btn bk-btn-primary" to="/finanzmathe/zinseszins">
                Weiter üben: Zinseszins-Aufgaben <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </TaskShell>
  )
}
