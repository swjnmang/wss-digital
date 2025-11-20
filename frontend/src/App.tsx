// Rechnen lernen: Terme
import Ohnevariablen from './pages/rechnen_lernen/terme/Ohnevariablen';
import Zusammenfassen from './pages/rechnen_lernen/terme/Zusammenfassen';
import Zusammenfassenpotenz from './pages/rechnen_lernen/terme/Zusammenfassenpotenz';
// Rechnen lernen: Brüche
import Kuerzenerweitern from './pages/rechnen_lernen/brueche/Kuerzenerweitern';
import AddierensubtrahierenBruch from './pages/rechnen_lernen/brueche/Addierensubtrahieren';
import MultiplizierendividierenBruch from './pages/rechnen_lernen/brueche/Multiplizierendividieren';
import GemischtBruch from './pages/rechnen_lernen/brueche/Gemischt';
// Rechnen lernen: Potenzen
import Schreibweise from './pages/rechnen_lernen/potenzen/Schreibweise';
import Zehnerpotenzen from './pages/rechnen_lernen/potenzen/Zehnerpotenzen';
import AddierensubtrahierenPotenzen from './pages/rechnen_lernen/potenzen/Addierensubtrahieren';
import MultiplizierendividierenPotenzen from './pages/rechnen_lernen/potenzen/Multiplizierendividieren';
import Potenzieren from './pages/rechnen_lernen/potenzen/Potenzieren';
import GemischtPotenzen from './pages/rechnen_lernen/potenzen/Gemischt';
// Rechnen lernen: Wurzeln
import WurzelnUebung from './pages/rechnen_lernen/wurzeln/Wurzeln';
// Rechnen lernen: Prozentrechnung
import ProzentrechnungUebung from './pages/rechnen_lernen/prozentrechnung/Prozentrechnung';
import Bezugskalkulation from './pages/rechnen_lernen/prozentrechnung/Bezugskalkulation';
import Handelskalkvw from './pages/rechnen_lernen/prozentrechnung/Handelskalkvw';
import Handelskalkrw from './pages/rechnen_lernen/prozentrechnung/Handelskalkrw';
import Handelskalkdif from './pages/rechnen_lernen/prozentrechnung/Handelskalkdif';
// Rechnen lernen: Gleichungen
import GeneratorLineare from './pages/rechnen_lernen/gleichungen/Generator_lineare';
import Quadratisch from './pages/rechnen_lernen/gleichungen/Quadratisch';
import Abschlusstest from './pages/rechnen_lernen/gleichungen/Abschlusstest';
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import LineareIndex from './pages/LineareIndex'
import QuadratischeIndex from './pages/QuadratischeIndex'
import RechnenLernenIndex from './pages/RechnenLernenIndex'
import Terme from './pages/rechnen_lernen/Terme'
import Brueche from './pages/rechnen_lernen/Brueche'
import Potenzen from './pages/rechnen_lernen/Potenzen'
import Wurzeln from './pages/rechnen_lernen/Wurzeln'
import Prozentrechnung from './pages/rechnen_lernen/Prozentrechnung'
import Gleichungen from './pages/rechnen_lernen/Gleichungen'
// lineare funktionen pages
import SteigungBerechnen from './pages/lineare_funktionen/SteigungBerechnen'
import Funktionsgleichung from './pages/lineare_funktionen/Funktionsgleichung'
import Ablesen from './pages/lineare_funktionen/Ablesen'
import Zeichnen from './pages/lineare_funktionen/Zeichnen'
import Nullstellen from './pages/lineare_funktionen/Nullstellen'
import PunktGerade from './pages/lineare_funktionen/PunktGerade'
import Schnittpunkt from './pages/lineare_funktionen/Schnittpunkt'
import SpielMuenzen from './pages/lineare_funktionen/SpielMuenzen'
import TestLF from './pages/lineare_funktionen/Test'

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <nav>
          <Link to="/">Start</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rechnen_lernen" element={<RechnenLernenIndex />} />
          <Route path="/rechnen_lernen/terme" element={<Terme />} />
          <Route path="/rechnen_lernen/terme/ohnevariablen" element={<Ohnevariablen />} />
          <Route path="/rechnen_lernen/terme/zusammenfassen" element={<Zusammenfassen />} />
          <Route path="/rechnen_lernen/terme/zusammenfassenpotenz" element={<Zusammenfassenpotenz />} />
          <Route path="/rechnen_lernen/brueche" element={<Brueche />} />
          <Route path="/rechnen_lernen/brueche/kuerzenerweitern" element={<Kuerzenerweitern />} />
          <Route path="/rechnen_lernen/brueche/addierensubtrahieren" element={<AddierensubtrahierenBruch />} />
          <Route path="/rechnen_lernen/brueche/multiplizierendividieren" element={<MultiplizierendividierenBruch />} />
          <Route path="/rechnen_lernen/brueche/gemischt" element={<GemischtBruch />} />
          <Route path="/rechnen_lernen/potenzen" element={<Potenzen />} />
          <Route path="/rechnen_lernen/potenzen/schreibweise" element={<Schreibweise />} />
          <Route path="/rechnen_lernen/potenzen/zehnerpotenzen" element={<Zehnerpotenzen />} />
          <Route path="/rechnen_lernen/potenzen/addierensubtrahieren" element={<AddierensubtrahierenPotenzen />} />
          <Route path="/rechnen_lernen/potenzen/multiplizierendividieren" element={<MultiplizierendividierenPotenzen />} />
          <Route path="/rechnen_lernen/potenzen/potenzieren" element={<Potenzieren />} />
          <Route path="/rechnen_lernen/potenzen/gemischt" element={<GemischtPotenzen />} />
          <Route path="/rechnen_lernen/wurzeln" element={<Wurzeln />} />
          <Route path="/rechnen_lernen/wurzeln/wurzeln" element={<WurzelnUebung />} />
          <Route path="/rechnen_lernen/prozentrechnung" element={<Prozentrechnung />} />
          <Route path="/rechnen_lernen/prozentrechnung/prozentrechnung" element={<ProzentrechnungUebung />} />
          <Route path="/rechnen_lernen/prozentrechnung/bezugskalkulation" element={<Bezugskalkulation />} />
          <Route path="/rechnen_lernen/prozentrechnung/handelskalkvw" element={<Handelskalkvw />} />
          <Route path="/rechnen_lernen/prozentrechnung/handelskalkrw" element={<Handelskalkrw />} />
          <Route path="/rechnen_lernen/prozentrechnung/handelskalkdif" element={<Handelskalkdif />} />
          <Route path="/rechnen_lernen/gleichungen" element={<Gleichungen />} />
          <Route path="/rechnen_lernen/gleichungen/generator_lineare" element={<GeneratorLineare />} />
          <Route path="/rechnen_lernen/gleichungen/quadratisch" element={<Quadratisch />} />
          <Route path="/rechnen_lernen/gleichungen/abschlusstest" element={<Abschlusstest />} />
          <Route path="/lineare_funktionen" element={<LineareIndex />} />
          <Route path="/lineare_funktionen/steigung_berechnen" element={<SteigungBerechnen />} />
          <Route path="/lineare_funktionen/funktionsgleichung" element={<Funktionsgleichung />} />
          <Route path="/lineare_funktionen/ablesen" element={<Ablesen />} />
          <Route path="/lineare_funktionen/zeichnen" element={<Zeichnen />} />
          <Route path="/lineare_funktionen/nullstellen" element={<Nullstellen />} />
          <Route path="/lineare_funktionen/punkt_gerade" element={<PunktGerade />} />
          <Route path="/lineare_funktionen/schnittpunkt" element={<Schnittpunkt />} />
          <Route path="/lineare_funktionen/spiel_muenzen" element={<SpielMuenzen />} />
          <Route path="/lineare_funktionen/test" element={<TestLF />} />
          <Route path="/quadratische_funktionen" element={<QuadratischeIndex />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  )
}
