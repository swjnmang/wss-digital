import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ModuleOverview from './pages/ModuleOverview'
import GamificationModule from './pages/gamification/GamificationModule'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ModuleOverview />} />
        <Route path="/gamification" element={<GamificationModule />} />
      </Routes>
    </Router>
  )
}

export default App
