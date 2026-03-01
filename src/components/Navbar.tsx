import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Activity, MessageSquare, LayoutDashboard, Menu, X, LogOut, CreditCard, LayoutGrid } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuthStore } from '../store/useAuthStore'
import { useUserPlan } from '../hooks/useUserPlan'

const navItems = [
  { path: '/',        label: 'Home',          icon: LayoutDashboard },
  { path: '/chat',    label: 'AI Assistant',  icon: MessageSquare   },
  { path: '/symptoms',label: 'Symptom Check', icon: Activity        },
  { path: '/pricing', label: 'Pricing',       icon: CreditCard      },
]

export default function Navbar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { plan } = useUserPlan()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    logout()
    setDropOpen(false)
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?'

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800"
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}
           className="h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text whitespace-nowrap">MediMind AI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  active ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25'
                         : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}

          {/* My Dashboard — only visible when logged in */}
          {user && (
            <Link to="/my-dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                location.pathname === '/my-dashboard'
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              My Dashboard
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Sign In button when logged out */}
          {!user && (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 4px 16px rgba(14,165,233,0.25)' }}
            >
              Sign In
            </Link>
          )}

          {/* User avatar dropdown */}
          {user && (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200 group"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover"
                      style={{ boxShadow: '0 0 0 2px rgba(14,165,233,0.5), 0 0 12px rgba(14,165,233,0.2)' }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 0 0 2px rgba(14,165,233,0.5)' }}
                    >
                      {initials}
                    </div>
                  )}
                  {/* Online dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                </div>
                <span className="text-sm text-slate-300 font-medium max-w-24 truncate group-hover:text-white transition-colors">
                  {user.displayName?.split(' ')[0] ?? user.email?.split('@')[0]}
                </span>
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-3 rounded-2xl overflow-hidden"
                    style={{
                      width: '260px',
                      background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)',
                      border: '1px solid rgba(51,65,85,0.7)',
                      boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,233,0.05)',
                    }}
                  >
                    {/* Profile header */}
                    <div className="px-5 pt-5 pb-4 flex items-center gap-4"
                         style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
                      <div className="relative shrink-0">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="avatar"
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover"
                            style={{ boxShadow: '0 0 0 2px rgba(14,165,233,0.4), 0 0 16px rgba(14,165,233,0.15)' }}
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 0 0 2px rgba(14,165,233,0.4)' }}
                          >
                            {initials}
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                      </div>
                      <div className="min-w-0 flex flex-col gap-1">
                        <p className="text-sm font-semibold text-white truncate leading-tight">
                          {user.displayName ?? 'MediMind User'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-medium tracking-wide">
                            Active • {plan.planId === 'premium' ? 'Premium' : plan.planId === 'standard' ? 'Standard' : 'Free'} Plan
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-3 py-3">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{ color: '#f87171' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                             style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <LogOut className="w-3.5 h-3.5" />
                        </div>
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-slate-400 hover:text-white p-1 shrink-0"
                onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 flex flex-col gap-1">

          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  active ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}

          {/* My Dashboard — only visible when logged in */}
          {user && (
            <Link to="/my-dashboard" onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                location.pathname === '/my-dashboard' ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <LayoutGrid className="w-4 h-4" />
              My Dashboard
            </Link>
          )}

          {/* Mobile user strip */}
          <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(51,65,85,0.5)' }}>
            {!user ? (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                Sign In
              </Link>
            ) : (
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover"
                      style={{ boxShadow: '0 0 0 2px rgba(14,165,233,0.4)' }} />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                         style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate leading-tight">
                      {user.displayName?.split(' ')[0] ?? user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 transition-colors"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
