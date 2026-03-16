import { motion, AnimatePresence } from 'framer-motion'
import { Brain, LogOut, Menu, X, LayoutGrid } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuthStore } from '../store/useAuthStore'
import { useUserPlan } from '../hooks/useUserPlan'

const navItems = [
  { path: '/',         label: 'Home' },
  { path: '/chat',     label: 'AI Chat' },
  { path: '/symptoms', label: 'Symptoms' },
  { path: '/doctors',  label: 'Doctors' },
  { path: '/pricing',  label: 'Pricing' },
]

export default function Navbar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { plan } = useUserPlan()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    logout()
    setDropOpen(false)
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?'

  const planLabel = plan.planId === 'premium' ? 'Premium' : plan.planId === 'standard' ? 'Standard' : 'Free'
  return (
    <>
      {/* Spacer so content doesn't hide behind fixed navbar */}
      <div style={{ height: '80px' }} />

      {/* Outer wrapper for centering — no framer-motion here to avoid transform conflicts */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          paddingTop: scrolled ? '12px' : '16px',
          transition: 'padding-top 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: scrolled ? 'min(92%, 1100px)' : 'min(96%, 1200px)',
          transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            background: scrolled
              ? 'rgba(8, 12, 24, 0.82)'
              : 'rgba(8, 12, 24, 0.55)',
            backdropFilter: 'blur(24px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
            borderRadius: '1.25rem',
            border: `1px solid ${scrolled ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.06)'}`,
            boxShadow: scrolled
              ? '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(14,165,233,0.04)'
              : '0 4px 24px rgba(0,0,0,0.2)',
            padding: scrolled ? '0.5rem 1.25rem' : '0.65rem 1.5rem',
            transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
              >
                <Brain className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-base font-bold gradient-text whitespace-nowrap">
                MediMind
              </span>
            </Link>            {/* Desktop Nav Links — centered */}
            <div className="hidden md:flex items-center justify-center gap-3 lg:gap-5 flex-1">
              {navItems.map(({ path, label }) => {
                const active = location.pathname === path
                return (
                  <Link key={path} to={path} className="relative group">
                    <motion.div
                      className="relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-300"
                      style={{ color: active ? '#fff' : '#94a3b8' }}
                      whileHover={{ color: '#fff' }}
                    >
                      {label}

                      {/* Animated underline */}
                      <motion.div
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          left: '50%',
                          height: '2px',
                          borderRadius: '1px',
                          background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                        }}
                        initial={false}
                        animate={{
                          width: active ? '60%' : '0%',
                          x: active ? '-50%' : '-50%',
                          opacity: active ? 1 : 0,
                        }}
                        whileHover={{
                          width: '60%',
                          x: '-50%',
                          opacity: 1,
                        }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      />

                      {/* Hover glow background */}
                      {active && (
                        <motion.div
                          layoutId="nav-active-bg"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '0.75rem',
                            background: 'rgba(14,165,233,0.08)',
                            zIndex: -1,
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                )
              })}
              {user && (
                <Link to="/my-dashboard" className="relative group">
                  <motion.div
                    className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-300"
                    style={{ color: location.pathname === '/my-dashboard' ? '#fff' : '#94a3b8' }}
                    whileHover={{ color: '#fff' }}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Dashboard
                    <motion.div
                      style={{
                        position: 'absolute', bottom: '2px', left: '50%', height: '2px', borderRadius: '1px',
                        background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                      }}
                      initial={false}
                      animate={{
                        width: location.pathname === '/my-dashboard' ? '60%' : '0%',
                        x: '-50%',
                        opacity: location.pathname === '/my-dashboard' ? 1 : 0,
                      }}
                      whileHover={{ width: '60%', x: '-50%', opacity: 1 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {location.pathname === '/my-dashboard' && (
                      <motion.div
                        layoutId="nav-active-bg"
                        style={{ position: 'absolute', inset: 0, borderRadius: '0.75rem', background: 'rgba(14,165,233,0.08)', zIndex: -1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {!user ? (
                <Link to="/login">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      boxShadow: '0 4px 20px rgba(14,165,233,0.3)',
                    }}
                  >
                    Get Started
                  </motion.div>
                </Link>
              ) : (
                <div className="relative" ref={dropRef}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all duration-300"
                    style={{
                      background: dropOpen ? 'rgba(14,165,233,0.08)' : 'transparent',
                      border: `1px solid ${dropOpen ? 'rgba(14,165,233,0.2)' : 'transparent'}`,
                    }}
                  >
                    <div className="relative shrink-0">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL} alt="avatar" referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover"
                          style={{ boxShadow: '0 0 0 2px rgba(14,165,233,0.4), 0 0 12px rgba(14,165,233,0.15)' }}
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 0 0 2px rgba(14,165,233,0.4)' }}
                        >
                          {initials}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                    </div>
                    <span className="text-sm text-slate-300 font-medium max-w-20 truncate">
                      {user.displayName?.split(' ')[0] ?? user.email?.split('@')[0]}
                    </span>

                    {/* Plan badge */}
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider rounded-md px-1.5 py-0.5"
                      style={{
                        background: plan.planId === 'premium'
                          ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                          : plan.planId === 'standard'
                          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                          : 'rgba(51,65,85,0.6)',
                        color: '#fff',
                      }}
                    >
                      {planLabel}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 8, scale: 0.95, filter: 'blur(4px)' }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-3 rounded-2xl overflow-hidden"
                        style={{
                          width: '280px',
                          background: 'rgba(8,12,24,0.95)',
                          backdropFilter: 'blur(24px)',
                          border: '1px solid rgba(51,65,85,0.5)',
                          boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,233,0.03)',
                        }}
                      >
                        {/* Profile header */}
                        <div className="px-5 pt-5 pb-4 flex items-center gap-4" style={{ borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
                          <div className="relative shrink-0">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-full object-cover"
                                style={{ boxShadow: '0 0 0 2px rgba(14,165,233,0.3), 0 0 16px rgba(14,165,233,0.12)' }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                                {initials}
                              </div>
                            )}
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                          </div>
                          <div className="min-w-0 flex flex-col gap-1">
                            <p className="text-sm font-semibold text-white truncate">{user.displayName ?? 'MediMind User'}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-[10px] text-emerald-400 font-medium tracking-wide">Active · {planLabel} Plan</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-3">
                          <motion.button
                            whileHover={{ background: 'rgba(239,68,68,0.08)' }}
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                            style={{ color: '#f87171', background: 'transparent' }}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                              <LogOut className="w-3.5 h-3.5" />
                            </div>
                            Sign Out
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden text-slate-400 hover:text-white p-2 rounded-xl transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden mt-2"
              style={{
                background: 'rgba(8,12,24,0.92)',
                backdropFilter: 'blur(24px)',
                borderRadius: '1rem',
                border: '1px solid rgba(148,163,184,0.08)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              }}
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navItems.map(({ path, label }, i) => {
                  const active = location.pathname === path
                  return (
                    <motion.div
                      key={path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <Link to={path} onClick={() => setMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          active ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}>
                        {label}
                        {active && (
                          <motion.span
                            layoutId="mob-active"
                            className="inline-block w-1.5 h-1.5 rounded-full ml-2"
                            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', verticalAlign: 'middle' }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
                {user && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navItems.length * 0.05 }}>
                    <Link to="/my-dashboard" onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                        location.pathname === '/my-dashboard' ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}>
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Dashboard
                    </Link>
                  </motion.div>
                )}
              </div>

              <div className="px-4 pb-3 pt-1" style={{ borderTop: '1px solid rgba(51,65,85,0.3)' }}>
                {!user ? (
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <motion.div
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center py-3 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                    >
                      Get Started
                    </motion.div>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between px-1 py-2">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover" style={{ boxShadow: '0 0 0 2px rgba(14,165,233,0.3)' }} />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.displayName?.split(' ')[0] ?? user.email?.split('@')[0]}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>      </motion.nav>
      </div>
    </>
  )
}
