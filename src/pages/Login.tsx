import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../services/firebase'
import { useAuthStore } from '../store/useAuthStore'
import {
  Brain, Mail, Lock, User, Eye, EyeOff,
  Loader2, AlertCircle, ArrowLeft,
} from 'lucide-react'

type Mode = 'login' | 'signup'

const fieldVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
}

export default function Login() {
  const { setUser } = useAuthStore()
  const navigate    = useNavigate()

  const [mode, setMode]         = useState<Mode>('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError]       = useState('')

  const clearError = () => setError('')

  const switchMode = (m: Mode) => { setMode(m); clearError() }

  const saveUserToFirestore = async (
    uid: string, email: string | null,
    displayName: string | null, photoURL: string | null,
  ) => {
    const ref  = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, { uid, email, displayName, photoURL, createdAt: serverTimestamp(), plan: 'Standard' })
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setLoading(true)
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (name) await updateProfile(cred.user, { displayName: name })
        await saveUserToFirestore(cred.user.uid, cred.user.email, name || cred.user.displayName, cred.user.photoURL)
        setUser({ uid: cred.user.uid, email: cred.user.email, displayName: name || null, photoURL: null })
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        setUser({ uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName, photoURL: cred.user.photoURL })
      }
      navigate('/', { replace: true })
    } catch (err: unknown) {
      console.error('[EmailAuth error]', err)
      const code = (err as { code?: string }).code ?? ''
      if      (code === 'auth/email-already-in-use')   setError('This email is already registered. Try logging in.')
      else if (code === 'auth/invalid-credential')     setError('Invalid email or password.')
      else if (code === 'auth/user-not-found')         setError('No account found with that email. Try signing up.')
      else if (code === 'auth/wrong-password')         setError('Incorrect password. Please try again.')
      else if (code === 'auth/weak-password')          setError('Password must be at least 6 characters.')
      else if (code === 'auth/invalid-email')          setError('Please enter a valid email address.')
      else if (code === 'auth/too-many-requests')      setError('Too many attempts. Please wait and retry.')
      else if (code === 'auth/network-request-failed') setError('Network error. Check your connection.')
      else if (code === 'auth/operation-not-allowed')  setError('Email/password sign-in is disabled. Contact support.')
      else setError(`Sign-in failed (${code || 'unknown'}). Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    clearError()
    setGLoading(true)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await saveUserToFirestore(cred.user.uid, cred.user.email, cred.user.displayName, cred.user.photoURL)
      setUser({ uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName, photoURL: cred.user.photoURL })
      navigate('/', { replace: true })
    } catch (err: unknown) {
      console.error('[Google error]', err)
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // silent
      } else if (code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups for this site.')
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled. Contact support.')
      } else {
        setError(`Google sign-in failed (${code || 'unknown'}). Please try again.`)
      }
    } finally {
      setGLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(14,165,233,0.15) 0%, #0f172a 55%)', paddingTop: '3rem', paddingBottom: '3rem' }}
    >
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: '-12rem', left: '-12rem', width: '36rem', height: '36rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-12rem', right: '-12rem', width: '36rem', height: '36rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', left: '60%', width: '20rem', height: '20rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full relative z-10"
        style={{ maxWidth: '460px' }}
      >
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          style={{ marginBottom: '1.75rem' }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all duration-200 group"
          >
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </span>
            Back to Home
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col items-center"
          style={{ marginBottom: '2.5rem' }}
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 0 40px rgba(14,165,233,0.45)', marginBottom: '1.25rem' }}
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">MediMind AI</h1>
          <p className="text-slate-400 text-sm mt-2">Your AI-powered health companion</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="rounded-3xl"
          style={{
            background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)',
            border: '1px solid rgba(51,65,85,0.6)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(14,165,233,0.04)',
            padding: '2.25rem',
          }}
        >
          {/* Mode tabs */}
          <div
            className="flex rounded-2xl p-1"
            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.5)', marginBottom: '1.75rem' }}
          >
            {(['login', 'signup'] as Mode[]).map((m) => (
              <motion.button
                key={m}
                onClick={() => switchMode(m)}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-250 relative"
                style={
                  mode === m
                    ? { background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', boxShadow: '0 4px 18px rgba(14,165,233,0.35)' }
                    : { color: '#64748b' }
                }
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </motion.button>
            ))}
          </div>

          {/* Google button */}
          <motion.button
            onClick={handleGoogle}
            disabled={gLoading || loading}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-medium text-sm disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#e2e8f0',
              transition: 'box-shadow 0.2s',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              marginBottom: '1.75rem',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)')}
          >
            {gLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ marginBottom: '1.75rem' }}>
            <div className="flex-1 h-px" style={{ background: 'rgba(51,65,85,0.6)' }} />
            <span className="text-xs text-slate-500 font-medium">or with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(51,65,85,0.6)' }} />
          </div>

          {/* Animated form fields */}
          <form onSubmit={handleEmailAuth}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {/* Name field — signup only */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      key="name"
                      custom={0}
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="relative"
                    >
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-2xl text-sm text-white outline-none transition-all duration-200"
                        style={{
                          padding: '0.875rem 1rem 0.875rem 2.75rem',
                          background: 'rgba(15,23,42,0.8)',
                          border: name ? '1px solid rgba(14,165,233,0.5)' : '1px solid rgba(51,65,85,0.5)',
                          boxShadow: name ? '0 0 0 3px rgba(14,165,233,0.08)' : 'none',
                          color: '#f1f5f9',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <motion.div custom={mode === 'signup' ? 1 : 0} variants={fieldVariants} className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl text-sm text-white outline-none transition-all duration-200"
                    style={{
                      padding: '0.875rem 1rem 0.875rem 2.75rem',
                      background: 'rgba(15,23,42,0.8)',
                      border: email ? '1px solid rgba(14,165,233,0.5)' : '1px solid rgba(51,65,85,0.5)',
                      boxShadow: email ? '0 0 0 3px rgba(14,165,233,0.08)' : 'none',
                      color: '#f1f5f9',
                    }}
                  />
                </motion.div>

                {/* Password */}
                <motion.div custom={mode === 'signup' ? 2 : 1} variants={fieldVariants} className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl text-sm text-white outline-none transition-all duration-200"
                    style={{
                      padding: '0.875rem 3rem 0.875rem 2.75rem',
                      background: 'rgba(15,23,42,0.8)',
                      border: password ? '1px solid rgba(14,165,233,0.5)' : '1px solid rgba(51,65,85,0.5)',
                      boxShadow: password ? '0 0 0 3px rgba(14,165,233,0.08)' : 'none',
                      color: '#f1f5f9',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-start gap-3 px-4 py-3.5 rounded-2xl text-sm"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.div
                  custom={mode === 'signup' ? 3 : 2}
                  variants={fieldVariants}
                  style={{ paddingTop: '0.5rem' }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading || gLoading}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      boxShadow: '0 8px 32px rgba(14,165,233,0.35)',
                      transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 40px rgba(14,165,233,0.5)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.35)')}
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : mode === 'login' ? <Mail className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </motion.button>
                </motion.div>

                {/* Mode switch hint */}
                <motion.p
                  custom={mode === 'signup' ? 4 : 3}
                  variants={fieldVariants}
                  className="text-center text-sm text-slate-500"
                  style={{ paddingTop: '0.25rem', paddingBottom: '0.25rem' }}
                >
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-slate-600 mt-6 leading-relaxed"
        >
          By continuing, you agree to MediMind&apos;s{' '}
          <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
          {' '}and{' '}
          <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>.
        </motion.p>
      </motion.div>
    </div>
  )
}
