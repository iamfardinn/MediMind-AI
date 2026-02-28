import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import SymptomChecker from './pages/SymptomChecker'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-slate-950">
        <Navbar />
        <main className="w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/symptoms" element={<SymptomChecker />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
