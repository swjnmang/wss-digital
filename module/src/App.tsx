import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Gamification from './pages/Gamification'
import Gesundheit from './pages/Gesundheit'
import Fit4Finance from './pages/Fit4Finance'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gamification" element={<Gamification />} />
        <Route path="/gesundheit" element={<Gesundheit />} />
        <Route path="/fit4finance" element={<Fit4Finance />} />
      </Routes>
    </Router>
  )
}

export default App
