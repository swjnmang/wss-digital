import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import Gamification from './pages/gamification/Index'
import Gesellschaftsspiele from './pages/gamification/Gesellschaftsspiele'
import DigitaleSpiele from './pages/gamification/DigitaleSpiele'
import Lernspielen from './pages/gamification/Lernspielen'
import GamificationNutzen from './pages/gamification/GamificationNutzen'
import BeruflicheMoeglichkeiten from './pages/gamification/BeruflicheMoeglichkeiten'
import Gesundheit from './pages/Gesundheit'
import Fit4Finance from './pages/Fit4Finance'
import DigitaleBildungIndex from './pages/digitale-bildung/Index'
import ExcelTaskSelect from './pages/digitale-bildung/ExcelTaskSelect'
import ExcelTrainer from './pages/digitale-bildung/ExcelTrainer'
import { ExcelSessionProvider } from './lib/excel-trainer/ExcelSessionContext'
import WordIndex from './pages/digitale-bildung/word/WordIndex'
import GeschaeftsbriefIndex from './pages/digitale-bildung/word/GeschaeftsbriefIndex'
import AnschriftenfeldTaskSelect from './pages/digitale-bildung/word/AnschriftenfeldTaskSelect'
import AnschriftenfeldTrainer from './pages/digitale-bildung/word/AnschriftenfeldTrainer'
import ImpressumModal from './components/ImpressumModal'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gamification" element={<Gamification />} />
        <Route path="/gamification/gesellschaftsspiele" element={<Gesellschaftsspiele />} />
        <Route path="/gamification/digitale-spiele" element={<DigitaleSpiele />} />
        <Route path="/gamification/lernspielen" element={<Lernspielen />} />
        <Route path="/gamification/gamification-nutzen" element={<GamificationNutzen />} />
        <Route path="/gamification/berufliche-moeglichkeiten" element={<BeruflicheMoeglichkeiten />} />
        <Route path="/gesundheit" element={<Gesundheit />} />
        <Route path="/fit4finance" element={<Fit4Finance />} />
        <Route path="/digitale-bildung" element={<DigitaleBildungIndex />} />
        <Route
          path="/digitale-bildung/excel-trainer"
          element={
            <ExcelSessionProvider>
              <Outlet />
            </ExcelSessionProvider>
          }
        >
          <Route index element={<ExcelTaskSelect />} />
          <Route path=":taskId" element={<ExcelTrainer />} />
        </Route>
        <Route path="/digitale-bildung/word" element={<WordIndex />} />
        <Route path="/digitale-bildung/word/geschaeftsbrief" element={<GeschaeftsbriefIndex />} />
        <Route path="/digitale-bildung/word/geschaeftsbrief/anschriftenfeld" element={<AnschriftenfeldTaskSelect />} />
        <Route
          path="/digitale-bildung/word/geschaeftsbrief/anschriftenfeld/:taskId"
          element={<AnschriftenfeldTrainer />}
        />
      </Routes>
      <ImpressumModal />
    </Router>
  )
}

export default App
