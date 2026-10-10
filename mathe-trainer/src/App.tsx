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
import Bruchgleichungen from './pages/rechnen_lernen/gleichungen/Bruchgleichungen';
import Abschlusstest from './pages/rechnen_lernen/gleichungen/Abschlusstest';
import { useCallback, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home'
import AreaPage from './pages/AreaPage'
import GemischtesTraining from './pages/GemischtesTraining'
import Terme from './pages/rechnen_lernen/Terme'
import Brueche from './pages/rechnen_lernen/Brueche'
import Potenzen from './pages/rechnen_lernen/Potenzen'
import Wurzeln from './pages/rechnen_lernen/Wurzeln'
import Prozentrechnung from './pages/rechnen_lernen/Prozentrechnung'
import Gleichungen from './pages/rechnen_lernen/Gleichungen'
import Impressum from './pages/Impressum'
import CookieBanner from './components/CookieBanner'
import AppHeader from './components/layout/AppHeader'
import SearchOverlay from './components/layout/SearchOverlay'
import MathKeypad from './components/MathKeypad'
// lineare funktionen pages
import SteigungBerechnen from './pages/lineare_funktionen/SteigungBerechnen'
import SteigungIndex from './pages/lineare_funktionen/SteigungIndex'
import SteigungAblesen from './pages/lineare_funktionen/SteigungAblesen'
import YAchsenabschnitt from './pages/lineare_funktionen/YAchsenabschnitt'
import Funktionsgleichung from './pages/lineare_funktionen/Funktionsgleichung'
import Ablesen from './pages/lineare_funktionen/Ablesen'
import Zeichnen from './pages/lineare_funktionen/Zeichnen'
import Nullstellen from './pages/lineare_funktionen/Nullstellen'
import PunktGerade from './pages/lineare_funktionen/PunktGerade'
import Schnittpunkt from './pages/lineare_funktionen/Schnittpunkt'
import Gleichungssysteme from './pages/lineare_funktionen/Gleichungssysteme'
import SpielMuenzen from './pages/lineare_funktionen/SpielMuenzen'
import TestLF from './pages/lineare_funktionen/Test'
import GemischteAufgabenLF from './pages/lineare_funktionen/GemischteAufgaben'
import AnwendungsaufgabenLF from './pages/lineare_funktionen/Anwendungsaufgaben'
import FussballplatzAufgabe from './pages/lineare_funktionen/FussballplatzAufgabe'
import TipiAufgabe from './pages/lineare_funktionen/TipiAufgabe'
import BergAufgabe from './pages/lineare_funktionen/BergAufgabe'
import SonneAufgabe from './pages/lineare_funktionen/SonneAufgabe'
import BrueckeAufgabe from './pages/lineare_funktionen/BrueckeAufgabe'
import FlughafenAufgabe from './pages/lineare_funktionen/FlughafenAufgabe'
import Wertetabelle from './pages/lineare_funktionen/Wertetabelle'
import Proportional from './pages/lineare_funktionen/Proportional'
import WasIstLinear from './pages/lineare_funktionen/WasIstLinear'
import ParallelSenkrecht from './pages/lineare_funktionen/ParallelSenkrecht'
import ExerciseSheetGenerator from './pages/lineare_funktionen/ExerciseSheetGenerator'
import WerWirdMillionaer from './pages/lineare_funktionen/WerWirdMillionaer'
// Finanzmathe
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
import EscapeRoomZinseszins from './pages/finanzmathe/EscapeRoomZinseszins';
import ArdasKapitalanlagen from './pages/finanzmathe/ArdasKapitalanlagen';
import SarahKapitalanlagen from './pages/finanzmathe/SarahKapitalanlagen';
import SportladenEröffnung from './pages/finanzmathe/SportladenEröffnung';
import DieUnfallversicherung from './pages/finanzmathe/DieUnfallversicherung';
import EhepaartTempel from './pages/finanzmathe/EhepaartTempel';
import FamilieKessler from './pages/finanzmathe/FamilieKessler';
import DerAutokauf from './pages/finanzmathe/DerAutokauf';
import DasElektroauto from './pages/finanzmathe/DasElektroauto';
import DerFoodtruck from './pages/finanzmathe/DerFoodtruck';
import PruefungsModus from './pages/finanzmathe/PruefungsModus';
// Quadratische Funktionen
import WertetabelleQF from './pages/quadratische_funktionen/Wertetabelle';
import Normalparabel from './pages/quadratische_funktionen/Normalparabel';
import VerschiebungNormalparabel from './pages/quadratische_funktionen/VerschiebungNormalparabel';
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
import SchnittpunkteGeradeQF from './pages/quadratische_funktionen/SchnittpunkteGerade';
import SpielNullstellenQF from './pages/quadratische_funktionen/SpielNullstellen';
import AbschlusstestQF from './pages/quadratische_funktionen/Abschlusstest';
// Trigonometrie
import RechtwinkligBeschriften from './pages/trigonometrie/RechtwinkligBeschriften';
import SinusKosinusTangensErkennen from './pages/trigonometrie/SinusKosinusTangensErkennen';
import RechtwinkligStrecken from './pages/trigonometrie/RechtwinkligStrecken';
import RechtwinkligWinkel from './pages/trigonometrie/RechtwinkligWinkel';
import Sinussatz from './pages/trigonometrie/Sinussatz';
import Kosinussatz from './pages/trigonometrie/Kosinussatz';
import Flaechensatz from './pages/trigonometrie/Flaechensatz';
import Sinusfunktion from './pages/trigonometrie/Sinusfunktion';
import Kosinusfunktion from './pages/trigonometrie/Kosinusfunktion';
import Winkelbeziehungen from './pages/trigonometrie/Winkelbeziehungen';
import GemischteUebungsaufgabenTrig from './pages/trigonometrie/GemischteUebungsaufgaben';
import Pruefungsmodus from './pages/trigonometrie/Pruefungsmodus';
import SteigungswinkelProzentGrad from './pages/trigonometrie/SteigungswinkelProzentGrad';
import AnwendungsaufgabenMenu from './pages/trigonometrie/AnwendungsaufgabenMenu';
import OlympiaparkMuenchen from './pages/trigonometrie/anwendungsaufgaben/OlympiaparkMuenchen';
import Stadion from './pages/trigonometrie/anwendungsaufgaben/Stadion';
import Fussballfeld from './pages/trigonometrie/anwendungsaufgaben/Fussballfeld';
import Bergbahn from './pages/trigonometrie/anwendungsaufgaben/Bergbahn';
import NachverfolgungBericht from './pages/trigonometrie/NachverfolgungBericht';
import { useTrackingSession } from './hooks/useTaskTracking';
import { useAppUpdate } from './hooks/useAppUpdate';
// Daten und Zufall
import StatistischeKennwerte from './pages/daten_und_zufall/StatistischeKennwerte';
import Baumdiagramme2 from './pages/daten_und_zufall/Baumdiagramme2';
import DiagrammeErstellen from './pages/daten_und_zufall/DiagrammeErstellen';
import Wahrscheinlichkeiten from './pages/daten_und_zufall/Wahrscheinlichkeiten';
import RelativeAbsoluteHaeufigkeit from './pages/daten_und_zufall/RelativeAbsoluteHaeufigkeit';
import DatenZufallAnwendungsaufgaben from './pages/daten_und_zufall/anwendungsaufgaben/index';
import MensaUmfrage from './pages/daten_und_zufall/anwendungsaufgaben/MensaUmfrage';
import Ticketkontrolle from './pages/daten_und_zufall/anwendungsaufgaben/Ticketkontrolle';
import Elfmeterschiessen from './pages/daten_und_zufall/anwendungsaufgaben/Elfmeterschiessen';
import Sommerfest from './pages/daten_und_zufall/anwendungsaufgaben/Sommerfest';
import Fahrradstation from './pages/daten_und_zufall/anwendungsaufgaben/Fahrradstation';
import BioKiste from './pages/daten_und_zufall/anwendungsaufgaben/BioKiste';
// Raum und Form
import RaumTopicIndex from './pages/raum_und_form/TopicIndex';
import RaumPracticeRoute from './pages/raum_und_form/PracticeRoute';
// Excel Trainer
import { ExcelTrainer } from './pages/ExcelTrainer';
// ... other imports will be added as files are created

export default function App() {
  const location = useLocation();
  const trackingActive = useTrackingSession();
  const update = useAppUpdate();
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    window.addEventListener('bk:search', openSearch);
    return () => window.removeEventListener('bk:search', openSearch);
  }, [openSearch]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-root">
      <Analytics />
      <AppHeader onSearch={openSearch} trackingActive={trackingActive} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      {update.available && (
        <div className="bk-update" role="status">
          <span><i className="fa-solid fa-arrows-rotate" aria-hidden="true" /> Neue Version verfügbar</span>
          <button type="button" className="bk-btn bk-btn-sm" onClick={update.reload}>Aktualisieren</button>
        </div>
      )}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rechnen_lernen" element={<AreaPage id="rechnen" />} />
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
          <Route path="/rechnen_lernen/gleichungen/bruchgleichungen" element={<Bruchgleichungen />} />
          <Route path="/rechnen_lernen/gleichungen/abschlusstest" element={<Abschlusstest />} />
          <Route path="/lineare_funktionen" element={<AreaPage id="linear" />} />
          <Route path="/lineare_funktionen/proportionale_zusammenhaenge" element={<Proportional />} />
          <Route path="/lineare_funktionen/was_ist_linear" element={<WasIstLinear />} />
          <Route path="/lineare_funktionen/wertetabelle" element={<Wertetabelle />} />
          <Route path="/lineare_funktionen/zeichnen" element={<Zeichnen />} />
          <Route path="/lineare_funktionen/ablesen" element={<Ablesen />} />
          <Route path="/lineare_funktionen/steigung" element={<SteigungIndex />} />
          <Route path="/lineare_funktionen/steigung/ablesen" element={<SteigungAblesen />} />
          <Route path="/lineare_funktionen/steigung/berechnen" element={<SteigungBerechnen />} />
          <Route path="/lineare_funktionen/steigung_berechnen" element={<SteigungBerechnen />} />
          <Route path="/lineare_funktionen/y_achsenabschnitt" element={<YAchsenabschnitt />} />
          <Route path="/lineare_funktionen/funktionsgleichung" element={<Funktionsgleichung />} />
          <Route path="/lineare_funktionen/punkt_gerade" element={<PunktGerade />} />
          <Route path="/lineare_funktionen/parallel_senkrecht" element={<ParallelSenkrecht />} />
          <Route path="/lineare_funktionen/nullstellen" element={<Nullstellen />} />
          <Route path="/lineare_funktionen/schnittpunkt" element={<Schnittpunkt />} />
          <Route path="/lineare_funktionen/gleichungssysteme" element={<Gleichungssysteme />} />
          <Route path="/lineare_funktionen/gemischte-aufgaben" element={<GemischteAufgabenLF />} />
          <Route path="/lineare_funktionen/anwendungsaufgaben" element={<AnwendungsaufgabenLF />} />
          <Route path="/lineare_funktionen/anwendungsaufgaben/fussballplatz" element={<FussballplatzAufgabe />} />
          <Route path="/lineare_funktionen/anwendungsaufgaben/tipi" element={<TipiAufgabe />} />
          <Route path="/lineare_funktionen/anwendungsaufgaben/berg" element={<BergAufgabe />} />
          <Route path="/lineare_funktionen/anwendungsaufgaben/sonne" element={<SonneAufgabe />} />
          <Route path="/lineare_funktionen/anwendungsaufgaben/bruecke" element={<BrueckeAufgabe />} />
          <Route path="/lineare_funktionen/anwendungsaufgaben/flughafen" element={<FlughafenAufgabe />} />
          <Route path="/lineare_funktionen/spiel_muenzen" element={<SpielMuenzen />} />
          <Route path="/lineare_funktionen/test" element={<TestLF />} />
          <Route path="/lineare_funktionen/ubungsblatt-generator" element={<ExerciseSheetGenerator />} />
          <Route path="/lineare_funktionen/wer_wird_millionaer" element={<WerWirdMillionaer />} />
          
          <Route path="/finanzmathe" element={<AreaPage id="finanz" />} />
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
          <Route path="/finanzmathe/anwendungsaufgaben/escape-room-zinseszins" element={<EscapeRoomZinseszins />} />
          <Route path="/finanzmathe/anwendungsaufgaben/ardas-kapitalanlagen" element={<ArdasKapitalanlagen />} />
          <Route path="/finanzmathe/anwendungsaufgaben/sarah-kapitalanlagen" element={<SarahKapitalanlagen />} />
          <Route path="/finanzmathe/anwendungsaufgaben/sportladen-eröffnung" element={<SportladenEröffnung />} />
          <Route path="/finanzmathe/anwendungsaufgaben/die-unfallversicherung" element={<DieUnfallversicherung />} />
          <Route path="/finanzmathe/anwendungsaufgaben/ehepaar-tempel" element={<EhepaartTempel />} />
          <Route path="/finanzmathe/anwendungsaufgaben/familie-kessler" element={<FamilieKessler />} />
          <Route path="/finanzmathe/anwendungsaufgaben/der-autokauf" element={<DerAutokauf />} />
          <Route path="/finanzmathe/anwendungsaufgaben/das-elektroauto" element={<DasElektroauto />} />
          <Route path="/finanzmathe/anwendungsaufgaben/der-foodtruck" element={<DerFoodtruck />} />
          <Route path="/finanzmathe/zinsen_test" element={<ZinsenTest />} />
          <Route path="/finanzmathe/pruefungsmodus" element={<PruefungsModus />} />

          <Route path="/quadratische_funktionen" element={<AreaPage id="quadrat" />} />
          <Route path="/quadratische_funktionen/wertetabelle" element={<WertetabelleQF />} />
          <Route path="/quadratische_funktionen/normalparabel" element={<Normalparabel />} />
          <Route path="/quadratische_funktionen/verschiebung_normalparabel" element={<VerschiebungNormalparabel />} />
          <Route path="/quadratische_funktionen/scheitelpunkt_ablesen" element={<ScheitelpunktAblesen />} />
          <Route path="/quadratische_funktionen/scheitelpunkt" element={<Scheitelpunkt />} />
          <Route path="/quadratische_funktionen/scheitelform" element={<Scheitelform />} />
          <Route path="/quadratische_funktionen/graph_zeichnen" element={<GraphZeichnen />} />
          <Route path="/quadratische_funktionen/scheitelform_rechnerisch" element={<ScheitelformRechnerisch />} />
          <Route path="/quadratische_funktionen/scheitel_in_allg_form" element={<ScheitelInAllgForm />} />
          <Route path="/quadratische_funktionen/funktionsgleichung_aufstellen" element={<FunktionsgleichungAufstellen />} />
          <Route path="/quadratische_funktionen/nullstellen" element={<NullstellenQF />} />
          <Route path="/quadratische_funktionen/schnittpunkte" element={<SchnittpunkteGeradeQF />} />
          <Route path="/quadratische_funktionen/schnittpunkte_gerade" element={<SchnittpunkteGeradeQF />} />
          <Route path="/quadratische_funktionen/schnittpunkte_parabel" element={<SchnittpunkteQF initialTaskType="parabola-parabola" />} />
          <Route path="/quadratische_funktionen/schnittpunkte2" element={<Schnittpunkte2QF />} />
          <Route path="/quadratische_funktionen/spiel_nullstellen" element={<SpielNullstellenQF />} />
          <Route path="/quadratische_funktionen/abschlusstest" element={<AbschlusstestQF />} />
          
          <Route path="/trigonometrie" element={<AreaPage id="trigo" />} />
          <Route path="/trigonometrie/rechtwinklig-beschriften" element={<RechtwinkligBeschriften />} />
          <Route path="/trigonometrie/sinus-kosinus-tangens-erkennen" element={<SinusKosinusTangensErkennen />} />
          <Route path="/trigonometrie/rechtwinklig-strecken" element={<RechtwinkligStrecken />} />
          <Route path="/trigonometrie/rechtwinklig-winkel" element={<RechtwinkligWinkel />} />
          <Route path="/trigonometrie/steigungswinkel-prozent-grad" element={<SteigungswinkelProzentGrad />} />
          <Route path="/trigonometrie/sinussatz" element={<Sinussatz />} />
          <Route path="/trigonometrie/kosinussatz" element={<Kosinussatz />} />
          <Route path="/trigonometrie/flaechensatz" element={<Flaechensatz />} />
          <Route path="/trigonometrie/flaechensatz/einstieg" element={<Navigate to="/trigonometrie/flaechensatz" replace />} />
          <Route path="/trigonometrie/flaechensatz/uebung" element={<Navigate to="/trigonometrie/flaechensatz" replace />} />
          <Route path="/trigonometrie/sinusfunktion" element={<Sinusfunktion />} />
          <Route path="/trigonometrie/kosinusfunktion" element={<Kosinusfunktion />} />
          <Route path="/trigonometrie/winkelbeziehungen" element={<Winkelbeziehungen />} />
          <Route path="/trigonometrie/gemischte-uebungsaufgaben" element={<GemischteUebungsaufgabenTrig />} />
          <Route path="/trigonometrie/pruefungsmodus" element={<Pruefungsmodus />} />
          <Route path="/trigonometrie/anwendungsaufgaben" element={<AnwendungsaufgabenMenu />} />
          <Route path="/trigonometrie/anwendungsaufgaben/olympiapark-muenchen" element={<OlympiaparkMuenchen />} />
          <Route path="/trigonometrie/anwendungsaufgaben/stadion" element={<Stadion />} />
          <Route path="/trigonometrie/anwendungsaufgaben/fussballfeld" element={<Fussballfeld />} />
          <Route path="/trigonometrie/anwendungsaufgaben/bergbahn" element={<Bergbahn />} />
          <Route path="/trigonometrie/nachverfolgung-bericht" element={<NachverfolgungBericht area="trigonometrie" />} />
          <Route path="/lineare_funktionen/nachverfolgung-bericht" element={<NachverfolgungBericht area="lineare_funktionen" />} />

          {/* Daten und Zufall */}
          <Route path="/daten-und-zufall" element={<AreaPage id="daten" />} />
          <Route path="/daten-und-zufall/statistische-kennwerte" element={<StatistischeKennwerte />} />
          <Route path="/daten-und-zufall/diagramme-erstellen" element={<DiagrammeErstellen />} />
          <Route path="/daten-und-zufall/baumdiagramme2" element={<Baumdiagramme2 />} />
          <Route path="/daten-und-zufall/relative-absolute-haeufigkeit" element={<RelativeAbsoluteHaeufigkeit />} />
          <Route path="/daten-und-zufall/wahrscheinlichkeiten" element={<Wahrscheinlichkeiten />} />
          <Route path="/daten-und-zufall/anwendungsaufgaben" element={<DatenZufallAnwendungsaufgaben />} />
          <Route path="/daten-und-zufall/anwendungsaufgaben/mensa-umfrage" element={<MensaUmfrage />} />
          <Route path="/daten-und-zufall/anwendungsaufgaben/ticketkontrolle" element={<Ticketkontrolle />} />
          <Route path="/daten-und-zufall/anwendungsaufgaben/elfmeterschiessen" element={<Elfmeterschiessen />} />
          <Route path="/daten-und-zufall/anwendungsaufgaben/sommerfest" element={<Sommerfest />} />
          <Route path="/daten-und-zufall/anwendungsaufgaben/fahrradstation" element={<Fahrradstation />} />
          <Route path="/daten-und-zufall/anwendungsaufgaben/bio-kiste" element={<BioKiste />} />

          {/* Raum und Form */}
          <Route path="/raum-und-form" element={<AreaPage id="raum" />} />
          <Route path="/raum-und-form/:topic" element={<RaumTopicIndex />} />
          <Route path="/raum-und-form/:topic/:page" element={<RaumPracticeRoute />} />

          {/* Excel Trainer */}
          <Route path="/excel-trainer" element={<ExcelTrainer />} />

          <Route path="/gemischtes-training" element={<GemischtesTraining />} />
          <Route path="/impressum" element={<Impressum />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <CookieBanner />
      <MathKeypad />
    </div>
  )
}
