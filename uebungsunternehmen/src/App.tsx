import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Buchungssaetze from './pages/Buchungssaetze';
import Kalkulation from './pages/Kalkulation';
import Angebotsvergleich from './pages/Angebotsvergleich';
import Geschaeftsbriefe from './pages/Geschaeftsbriefe';
import Anschriftenfeld from './pages/Anschriftenfeld';
import Einkaufsprozess from './pages/Einkaufsprozess';
import Verkaufsprozess from './pages/Verkaufsprozess';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buchungssaetze" element={<Buchungssaetze />} />
        <Route path="/kalkulation" element={<Kalkulation />} />
        <Route path="/angebotsvergleich" element={<Angebotsvergleich />} />
        <Route path="/geschaeftsbriefe" element={<Geschaeftsbriefe />} />
        <Route path="/anschriftenfeld" element={<Anschriftenfeld />} />
        <Route path="/einkaufsprozess" element={<Einkaufsprozess />} />
        <Route path="/verkaufsprozess" element={<Verkaufsprozess />} />
      </Routes>
    </Router>
  );
}

export default App;
