import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { useAuthListener } from './hooks/useAuthListener'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import SymptomChecker from './pages/SymptomChecker'
import Pricing from './pages/Pricing'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFail from './pages/PaymentFail'
import PaymentCancel from './pages/PaymentCancel'
import Login from './pages/Login'
import MyDashboard from './pages/MyDashboard'
import './App.css'

function App() {
  useAuthListener()
  const { user, loading } = useAuthStore()

  // While Firebase is restoring session, show a minimal spinner
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 text-sm">Loading MediMind…</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-slate-950">
        <Routes>
          {/* Login page — redirect to home if already logged in */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

          {/* All other routes are public — Navbar always visible */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="w-full">
                <Routes>
                  <Route path="/"                  element={<Dashboard />} />
                  <Route path="/chat"              element={<Chat />} />
                  <Route path="/symptoms"          element={<SymptomChecker />} />
                  <Route path="/pricing"           element={<Pricing />} />
                  <Route path="/checkout"          element={<Checkout />} />
                  <Route path="/my-dashboard"      element={<MyDashboard />} />
                  <Route path="/payment/success"   element={<PaymentSuccess />} />
                  <Route path="/payment/fail"      element={<PaymentFail />} />
                  <Route path="/payment/cancel"    element={<PaymentCancel />} />
                </Routes>
              </main>
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
