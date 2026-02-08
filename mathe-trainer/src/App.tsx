// Rechnen lernen: Terme
import Ohnevariablen from './pages/rechnen_lernen/terme/Ohnevariablen';
import Zusammenfassen from './pages/rechnen_lernen/terme/Zusammenfassen';
import TermeZusammenfassen from './pages/rechnen_lernen/TermeZusammenfassen';
import TermeMitPotenzen from './pages/rechnen_lernen/TermeMitPotenzen';
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
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react';
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
import Impressum from './pages/Impressum'
import CookieBanner from './components/CookieBanner'
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
import GemischteAufgabenLF from './pages/lineare_funktionen/GemischteAufgaben'
import AnwendungsaufgabenLF from './pages/lineare_funktionen/Anwendungsaufgaben'
// Finanzmathe
import FinanzmatheIndex from './pages/FinanzmatheIndex';
import ZinsrechnungMenu from './pages/finanzmathe/ZinsrechnungMenu';
import Zinsrechnung from './pages/finanzmathe/Zinsrechnung';
import Zinstage from './pages/finanzmathe/Zinstage';
import Zinseszins from './pages/finanzmathe/Zinseszins';
import MehrungMinderung from './pages/finanzmathe/MehrungMinderung';
import Endwert from './pages/finanzmathe/Endwert';
import Ratendarlehen from './pages/finanzmathe/Ratendarlehen';
import Annuitaetendarlehen from './pages/finanzmathe/Annuitaetendarlehen';
import ZinsenTest from './pages/finanzmathe/ZinsenTest';
import GemischteFinanzaufgaben from './pages/finanzmathe/GemischteFinanzaufgaben';
import Anwendungsaufgaben from './pages/finanzmathe/Anwendungsaufgaben';
import ArdasKapitalanlagen from './pages/finanzmathe/ArdasKapitalanlagen';
import SportladenEröffnung from './pages/finanzmathe/SportladenEröffnung';
import DieUnfallversicherung from './pages/finanzmathe/DieUnfallversicherung';
import EhepaartTempel from './pages/finanzmathe/EhepaartTempel';
import FamilieKessler from './pages/finanzmathe/FamilieKessler';
import PruefungsModus from './pages/finanzmathe/PruefungsModus';
// Quadratische Funktionen
import QuadratischeFunktionenMenu from './pages/quadratische_funktionen/QuadratischeFunktionenMenu';
import Normalparabel from './pages/quadratische_funktionen/Normalparabel';
import ScheitelpunktAblesen from './pages/quadratische_funktionen/ScheitelpunktAblesen';
import Scheitelpunkt from './pages/quadratische_funktionen/Scheitelpunkt';
import Scheitelform from './pages/quadratische_funktionen/Scheitelform';
import GraphZeichnen from './pages/quadratische_funktionen/GraphZeichnen';
import ScheitelformRechnerisch from './pages/quadratische_funktionen/ScheitelformRechnerisch';
import ScheitelInAllgForm from './pages/quadratische_funktionen/ScheitelInAllgForm';
import FunktionsgleichungAufstellen from './pages/quadratische_funktionen/FunktionsgleichungAufstellen';
import NullstellenQF from './pages/quadratische_funktionen/Nullstellen';
import SchnittpunkteQF from './pages/quadratische_funktionen/Schnittpunkte';
import Schnittpunkte2QF from './pages/quadratische_funktionen/Schnittpunkte2';
import SpielNullstellenQF from './pages/quadratische_funktionen/SpielNullstellen';
import AbschlusstestQF from './pages/quadratische_funktionen/Abschlusstest';
// Trigonometrie
import TrigonometrieIndex from './pages/TrigonometrieIndex';
import Rechtwinklig2 from './pages/trigonometrie/Rechtwinklig2';
import Sinussatz from './pages/trigonometrie/Sinussatz';
import Kosinussatz from './pages/trigonometrie/Kosinussatz';
import Flaechensatz from './pages/trigonometrie/Flaechensatz';
import GemischteAufgaben from './pages/trigonometrie/GemischteAufgaben';
// Daten und Zufall
import DatenUndZufallIndex from './pages/DatenUndZufallIndex';
import StatistischeKennwerte from './pages/daten_und_zufall/StatistischeKennwerte';
import Baumdiagramme2 from './pages/daten_und_zufall/Baumdiagramme2';
import DiagrammeErstellen from './pages/daten_und_zufall/DiagrammeErstellen';
import Wahrscheinlichkeiten from './pages/daten_und_zufall/Wahrscheinlichkeiten';
// Raum und Form
import RaumUndFormIndex from './pages/RaumUndFormIndex';
import Flaechengeometrie from './pages/raum_und_form/Flaechengeometrie';
import SatzDesPythagoras from './pages/raum_und_form/SatzDesPythagoras';
import Strahlensaetze from './pages/raum_und_form/Strahlensaetze';
import Kugel from './pages/raum_und_form/Kugel';
import Kegel from './pages/raum_und_form/Kegel';
import Pyramide from './pages/raum_und_form/Pyramide';
import Zylinder from './pages/raum_und_form/Zylinder';
import Prisma from './pages/raum_und_form/Prisma';
import Dreiecke from './pages/raum_und_form/Dreiecke';
import Trapez from './pages/raum_und_form/Trapez';
import Rechteck from './pages/raum_und_form/Rechteck';
import Parallelogramm from './pages/raum_und_form/Parallelogramm';
import Raute from './pages/raum_und_form/Raute';
import Kreis from './pages/raum_und_form/Kreis';
import GemischteFlaechenaufgaben from './pages/raum_und_form/GemischteFlaechenaufgaben';
import AnwendungsUebungsaufgaben from './pages/raum_und_form/AnwendungsUebungsaufgaben';
import Pausenhof from './pages/raum_und_form/Pausenhof';
import Fussballplatz from './pages/raum_und_form/Fussballplatz';
import Haus from './pages/raum_und_form/Haus';
import DieLeinwand from './pages/raum_und_form/DieLeinwand';
// Pythagoras
import KathetenHypotenuse from './pages/raum_und_form/pythagoras/KathetenHypotenuse';
import SeitenBerechnen from './pages/raum_und_form/pythagoras/SeitenBerechnen';
import AnwendungsaufgabenPythagoras from './pages/raum_und_form/pythagoras/Anwendungsaufgaben';
// Excel Trainer
import { ExcelTrainer } from './pages/ExcelTrainer';
// ... other imports will be added as files are created

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const hideHeader = location.pathname === '/';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="app-root">
      <Analytics />
      {!hideHeader && (
        <header className="app-header">
          <div className="app-shell flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="ghost-link text-sm sm:text-base">
                ← Zurück
              </button>
              <div className="hidden sm:block w-px h-6 bg-slate-200" aria-hidden />
              <span className="text-lg sm:text-xl font-bold text-slate-800">Mathe-Trainer</span>
            </div>
            <a
              href="https://swjnmang.github.io/wss-digital/"
              className="ghost-link text-xs sm:text-sm"
            >
              WSS-Digital
            </a>
          </div>
        </header>
      )}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rechnen_lernen" element={<RechnenLernenIndex />} />
          <Route path="/rechnen_lernen/terme" element={<Terme />} />
          <Route path="/rechnen_lernen/terme/ohnevariablen" element={<Ohnevariablen />} />
          <Route path="/rechnen_lernen/terme/zusammenfassen" element={<TermeZusammenfassen />} />
          <Route path="/rechnen_lernen/terme/mitpotenzen" element={<TermeMitPotenzen />} />
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
          <Route path="/lineare_funktionen/gemischte-aufgaben" element={<GemischteAufgabenLF />} />
          <Route path="/lineare_funktionen/anwendungsaufgaben" element={<AnwendungsaufgabenLF />} />
          <Route path="/lineare_funktionen/spiel_muenzen" element={<SpielMuenzen />} />
          <Route path="/lineare_funktionen/test" element={<TestLF />} />
          
          <Route path="/finanzmathe" element={<FinanzmatheIndex />} />
          <Route path="/finanzmathe/zinsrechnung" element={<ZinsrechnungMenu />} />
          <Route path="/finanzmathe/zinsrechnung/ueben" element={<Zinsrechnung />} />
          <Route path="/finanzmathe/zinsrechnung/tage" element={<Zinstage />} />
          <Route path="/finanzmathe/zinseszins" element={<Zinseszins />} />
          <Route path="/finanzmathe/mehrung_minderung" element={<MehrungMinderung />} />
          <Route path="/finanzmathe/endwert" element={<Endwert />} />
          <Route path="/finanzmathe/ratendarlehen" element={<Ratendarlehen />} />
          <Route path="/finanzmathe/annuitaetendarlehen" element={<Annuitaetendarlehen />} />
          <Route path="/finanzmathe/gemischte-aufgaben" element={<GemischteFinanzaufgaben />} />
          <Route path="/finanzmathe/anwendungsaufgaben" element={<Anwendungsaufgaben />} />
          <Route path="/finanzmathe/anwendungsaufgaben/ardas-kapitalanlagen" element={<ArdasKapitalanlagen />} />
          <Route path="/finanzmathe/anwendungsaufgaben/sportladen-eröffnung" element={<SportladenEröffnung />} />
          <Route path="/finanzmathe/anwendungsaufgaben/die-unfallversicherung" element={<DieUnfallversicherung />} />
          <Route path="/finanzmathe/anwendungsaufgaben/ehepaar-tempel" element={<EhepaartTempel />} />
          <Route path="/finanzmathe/anwendungsaufgaben/familie-kessler" element={<FamilieKessler />} />
          <Route path="/finanzmathe/zinsen_test" element={<ZinsenTest />} />
          <Route path="/finanzmathe/pruefungsmodus" element={<PruefungsModus />} />

          <Route path="/quadratische_funktionen" element={<QuadratischeFunktionenMenu />} />
          <Route path="/quadratische_funktionen/normalparabel" element={<Normalparabel />} />
          <Route path="/quadratische_funktionen/scheitelpunkt_ablesen" element={<ScheitelpunktAblesen />} />
          <Route path="/quadratische_funktionen/scheitelpunkt" element={<Scheitelpunkt />} />
          <Route path="/quadratische_funktionen/scheitelform" element={<Scheitelform />} />
          <Route path="/quadratische_funktionen/graph_zeichnen" element={<GraphZeichnen />} />
          <Route path="/quadratische_funktionen/scheitelform_rechnerisch" element={<ScheitelformRechnerisch />} />
          <Route path="/quadratische_funktionen/scheitel_in_allg_form" element={<ScheitelInAllgForm />} />
          <Route path="/quadratische_funktionen/funktionsgleichung_aufstellen" element={<FunktionsgleichungAufstellen />} />
          <Route path="/quadratische_funktionen/nullstellen" element={<NullstellenQF />} />
          <Route path="/quadratische_funktionen/schnittpunkte" element={<SchnittpunkteQF />} />
          <Route path="/quadratische_funktionen/schnittpunkte_gerade" element={<SchnittpunkteQF initialTaskType="line-parabola" />} />
          <Route path="/quadratische_funktionen/schnittpunkte_parabel" element={<SchnittpunkteQF initialTaskType="parabola-parabola" />} />
          <Route path="/quadratische_funktionen/schnittpunkte2" element={<Schnittpunkte2QF />} />
          <Route path="/quadratische_funktionen/spiel_nullstellen" element={<SpielNullstellenQF />} />
          <Route path="/quadratische_funktionen/abschlusstest" element={<AbschlusstestQF />} />
          
          <Route path="/trigonometrie" element={<TrigonometrieIndex />} />
          <Route path="/trigonometrie/rechtwinklig2" element={<Rechtwinklig2 />} />
          <Route path="/trigonometrie/sinussatz" element={<Sinussatz />} />
          <Route path="/trigonometrie/kosinussatz" element={<Kosinussatz />} />
          <Route path="/trigonometrie/flaechensatz" element={<Flaechensatz />} />
          <Route path="/trigonometrie/gemischte-aufgaben" element={<GemischteAufgaben />} />

          {/* Daten und Zufall */}
          <Route path="/daten-und-zufall" element={<DatenUndZufallIndex />} />
          <Route path="/daten-und-zufall/statistische-kennwerte" element={<StatistischeKennwerte />} />
          <Route path="/daten-und-zufall/diagramme-erstellen" element={<DiagrammeErstellen />} />
          <Route path="/daten-und-zufall/baumdiagramme2" element={<Baumdiagramme2 />} />
          <Route path="/daten-und-zufall/wahrscheinlichkeiten" element={<Wahrscheinlichkeiten />} />

          {/* Raum und Form */}
          <Route path="/raum-und-form" element={<RaumUndFormIndex />} />
          <Route path="/raum-und-form/flaechengeometrie" element={<Flaechengeometrie />} />
          <Route path="/raum-und-form/satz-des-pythagoras" element={<SatzDesPythagoras />} />
          <Route path="/raum-und-form/satz-des-pythagoras/katheten-hypotenuse" element={<KathetenHypotenuse />} />
          <Route path="/raum-und-form/satz-des-pythagoras/berechnen" element={<SeitenBerechnen />} />
          <Route path="/raum-und-form/satz-des-pythagoras/anwendung" element={<AnwendungsaufgabenPythagoras />} />
          <Route path="/raum-und-form/strahlensaetze" element={<Strahlensaetze />} />
          <Route path="/raum-und-form/kugel" element={<Kugel />} />
          <Route path="/raum-und-form/kegel" element={<Kegel />} />
          <Route path="/raum-und-form/pyramide" element={<Pyramide />} />
          <Route path="/raum-und-form/zylinder" element={<Zylinder />} />
          <Route path="/raum-und-form/prisma" element={<Prisma />} />
          <Route path="/raum-und-form/flaechengeometrie/dreiecke" element={<Dreiecke />} />
          <Route path="/raum-und-form/flaechengeometrie/trapez" element={<Trapez />} />
          <Route path="/raum-und-form/flaechengeometrie/rechteck" element={<Rechteck />} />
          <Route path="/raum-und-form/flaechengeometrie/parallelogramm" element={<Parallelogramm />} />
          <Route path="/raum-und-form/flaechengeometrie/raute" element={<Raute />} />
          <Route path="/raum-und-form/flaechengeometrie/kreis" element={<Kreis />} />
          <Route path="/raum-und-form/flaechengeometrie/gemischte-aufgaben" element={<GemischteFlaechenaufgaben />} />
          <Route path="/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben" element={<AnwendungsUebungsaufgaben />} />
          <Route path="/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben/pausenhof" element={<Pausenhof />} />
          <Route path="/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben/fussballplatz" element={<Fussballplatz />} />
          <Route path="/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben/haus" element={<Haus />} />
          <Route path="/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben/die-leinwand" element={<DieLeinwand />} />

          {/* Excel Trainer */}
          <Route path="/excel-trainer" element={<ExcelTrainer />} />

          <Route path="/impressum" element={<Impressum />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <CookieBanner />
    </div>
  )
}
