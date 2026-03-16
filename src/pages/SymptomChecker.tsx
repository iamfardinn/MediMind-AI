import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, AlertTriangle, CheckCircle, Info, Loader2, RotateCcw,
  Shield, Clock, User, Activity, Lock, Sparkles, Zap, ArrowRight,
  Crown, Stethoscope, HeartPulse,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { streamGeminiResponse } from '../services/copilot'
import { useAuthStore } from '../store/useAuthStore'
import { useUserPlan } from '../hooks/useUserPlan'

const BODY_SYSTEMS = [
  'Head & Neurological', 'Eyes & Vision', 'Ears, Nose & Throat',
  'Chest & Respiratory', 'Heart & Cardiovascular', 'Digestive',
  'Urinary', 'Musculoskeletal', 'Skin', 'Mental Health',
]

const SEVERITY_OPTIONS = [
  { label: 'Mild',     emoji: '🟢', color: '#10b981', activeClass: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' },
  { label: 'Moderate', emoji: '🟡', color: '#f59e0b', activeClass: 'bg-amber-500/15  border-amber-500/50  text-amber-300'   },
  { label: 'Severe',   emoji: '🔴', color: '#ef4444', activeClass: 'bg-red-500/15    border-red-500/50    text-red-300'     },
]

const DURATION_OPTIONS = ['Just started', 'Hours', 'Days', 'Weeks', 'Months']

type UrgencyLevel = 'emergency' | 'moderate' | 'routine'
interface AnalysisResult { text: string; urgency: UrgencyLevel }

const URGENCY_CONFIG = {
  emergency: {
    icon: AlertTriangle,
    text: 'Emergency — Seek Immediate Care',
    color: '#f87171',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
  },
  moderate: {
    icon: Info,
    text: 'See a Doctor Soon',
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
  },
  routine: {
    icon: CheckCircle,
    text: 'Routine Care Recommended',
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
  },
}

function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const { icon: Icon, text, color, bg, border } = URGENCY_CONFIG[level]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      className="flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold"
      style={{ background: bg, border: `1.5px solid ${border}`, color, boxShadow: `0 0 24px ${bg}` }}
    >
      <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: '1.1rem', height: '1.1rem' }} />
      {text}
    </motion.div>
  )
}

// ── Field wrapper for consistent label + spacing ──────────────────────────────
function Field({ label, icon: Icon, iconColor, hint, children }: {
  label: string
  icon: React.ElementType
  iconColor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <Icon className="w-4 h-4 shrink-0" style={{ color: iconColor }} />
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500 leading-relaxed">{hint}</p>}
    </div>
  )
}

// ── Section divider ───────────────────────────────────────────────────────────
function Divider() {
  return (
    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(51,65,85,0.7), transparent)', margin: '0.5rem 0' }} />
  )
}

// ── Logged-out gate ───────────────────────────────────────────────────────────
function LoggedOutGate() {
  const steps = [
    { num: '01', title: 'Describe symptoms', desc: 'Tell us what you feel', color: '#10b981' },
    { num: '02', title: 'AI analyzes',        desc: 'Models cross-reference data', color: '#0ea5e9' },
    { num: '03', title: 'Get assessment',     desc: 'Urgency & next steps', color: '#6366f1' },
  ]
  const features = [
    { icon: Stethoscope, text: 'AI-powered symptom analysis' },
    { icon: Zap,         text: 'Instant urgency assessment' },
    { icon: HeartPulse,  text: 'Possible conditions & next steps' },
    { icon: Shield,      text: 'Your data is private & encrypted' },
  ]

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 80px)', width: '100%' }}>
      {/* ── Ambient BG ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 rounded-full opacity-25"
             style={{ width: '44rem', height: '32rem', background: 'radial-gradient(ellipse, rgba(16,185,129,.14) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 rounded-full opacity-20"
             style={{ width: '38rem', height: '32rem', background: 'radial-gradient(circle, rgba(14,165,233,.1) 0%, transparent 70%)' }} />
        {[
          { size: 5, x: '14%', y: '22%', delay: 0,   c: 'rgba(16,185,129,.11)' },
          { size: 7, x: '82%', y: '18%', delay: 2,   c: 'rgba(14,165,233,.07)' },
          { size: 4, x: '66%', y: '68%', delay: 1,   c: 'rgba(99,102,241,.09)' },
          { size: 3, x: '28%', y: '74%', delay: 3,   c: 'rgba(16,185,129,.09)' },
        ].map((o, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: `${o.size}rem`, height: `${o.size}rem`, left: o.x, top: o.y, background: o.c, filter: 'blur(20px)' }}
            animate={{ y: [-8, 8, -8], scale: [1, 1.06, 1] }}
            transition={{ duration: 7, repeat: Infinity, delay: o.delay, ease: 'easeInOut' }} />
        ))}
        <div className="absolute inset-0 opacity-[0.025]"
             style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '860px', margin: '0 auto', padding: 'clamp(3rem,8vw,5rem) clamp(1.25rem,5vw,3rem)' }}>
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}
          className="text-center mb-12 w-full">
          <motion.div initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .12 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6"
            style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.18)', color: '#6ee7b7' }}>
            <Sparkles className="w-3.5 h-3.5" />
            AI Symptom Analyzer
          </motion.div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, color: '#f8fafc', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1.25rem', textAlign: 'center' }}>
            Understand your symptoms{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">instantly</span>
              <motion.span className="absolute -bottom-1 left-0 h-[2.5px] rounded-full"
                style={{ background: 'linear-gradient(90deg,#10b981,#0ea5e9)' }}
                initial={{ width: 0 }} animate={{ width: '100%' }}
                transition={{ delay: .75, duration: .55, ease: [.22,1,.36,1] }} />
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            Describe how you're feeling and our AI will assess urgency, suggest possible conditions, and recommend next steps.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28, duration: .45 }}
          style={{ maxWidth: '700px', margin: '0 auto', marginBottom: '3rem' }}>
          <div className="grid grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .36 + i * .1 }}
                className="relative flex flex-col items-center text-center rounded-2xl"
                style={{ background: 'rgba(15,23,42,.55)', border: '1px solid rgba(51,65,85,.38)', backdropFilter: 'blur(10px)', padding: '1.75rem 1rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: step.color, opacity: 0.22, lineHeight: 1, marginBottom: '0.5rem', display: 'block' }}>{step.num}</span>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-1 leading-snug">{step.title}</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features + CTA */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5, duration: .45 }}
          style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl opacity-20"
                 style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,.1), transparent 70%)', filter: 'blur(22px)' }} />
            <div className="relative rounded-2xl p-6 sm:p-8"
                 style={{ background: 'rgba(15,23,42,.6)', border: '1px solid rgba(51,65,85,.4)', backdropFilter: 'blur(18px)' }}>
              <div className="grid grid-cols-2 gap-3 mb-7">
                {features.map((f, i) => (
                  <motion.div key={f.text}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: .62 + i * .07 }}
                    className="flex items-center gap-2.5 p-3.5 rounded-xl"
                    style={{ background: 'rgba(15,23,42,.5)', border: '1px solid rgba(51,65,85,.4)' }}>
                    <f.icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-300 font-medium leading-tight">{f.text}</span>
                  </motion.div>
                ))}
              </div>
              <div className="h-px mb-7" style={{ background: 'linear-gradient(90deg,transparent,rgba(51,65,85,.5),transparent)' }} />
              <div className="flex flex-col items-center gap-3">
                <Link to="/login"
                  className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  style={{ background: 'linear-gradient(135deg,#10b981,#0ea5e9)', boxShadow: '0 6px 24px rgba(16,185,129,.22)' }}>
                  Sign In to Analyze Symptoms
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <p className="text-xs text-slate-500">
                  Available on <span className="text-emerald-400 font-semibold">Standard</span> &{' '}
                  <span className="text-violet-400 font-semibold">Premium</span> plans
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .9 }}
          className="text-xs text-slate-600 mt-8 text-center leading-relaxed">
          Have an account?{' '}
          <Link to="/login" className="text-sky-500 hover:text-sky-400 underline underline-offset-2">Sign in</Link>
          {' · '}
          <Link to="/chat" className="text-sky-500 hover:text-sky-400 underline underline-offset-2">Try AI Chat</Link>
          {' · '}
          <Link to="/" className="text-sky-500 hover:text-sky-400 underline underline-offset-2">Dashboard</Link>
        </motion.p>
      </div>
    </div>
  )
}

// ── Free-plan upgrade gate ────────────────────────────────────────────────────
function FreePlanGate() {
  const plans = [
    { name: 'Standard', price: '$9.99/mo', color: '#0ea5e9', features: ['Symptom Analyzer', 'Unlimited AI Chat', 'Health Reports'] },
    { name: 'Premium',  price: '$19.99/mo', color: '#8b5cf6', features: ['Everything in Standard', 'Doctor Consultations', 'Priority Support'] },
  ]
  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 rounded-full opacity-25"
             style={{ width: '44rem', height: '32rem', background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
        {[
          { size: 6, x: '18%', y: '28%', delay: 0,   color: 'rgba(139,92,246,0.1)' },
          { size: 5, x: '72%', y: '55%', delay: 1.5, color: 'rgba(14,165,233,0.08)' },
          { size: 4, x: '50%', y: '70%', delay: 0.8, color: 'rgba(99,102,241,0.07)' },
        ].map((orb, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: `${orb.size}rem`, height: `${orb.size}rem`, left: orb.x, top: orb.y, background: orb.color, filter: 'blur(24px)' }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 7, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }} />
        ))}
        <div className="absolute inset-0 opacity-[0.025]"
             style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-5 sm:px-8 pt-24 sm:pt-32 pb-20 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
          className="flex flex-col items-center text-center mb-12 w-full">

          {/* Icon */}
          <motion.div initial={{ scale: .82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: .1, type: 'spring', stiffness: 200 }}
            className="relative inline-flex mb-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, rgba(139,92,246,.18), rgba(14,165,233,.18))', border: '1px solid rgba(139,92,246,.28)', boxShadow: '0 0 40px rgba(139,92,246,0.15)' }}>
              <Crown className="w-9 h-9 text-violet-400" />
            </div>
            <motion.div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}
              animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Lock className="w-3.5 h-3.5 text-white" />
            </motion.div>
          </motion.div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-5"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#c4b5fd' }}>
            <Crown className="w-3.5 h-3.5" />
            Premium Feature
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Upgrade to unlock the{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">Symptom Analyzer</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            This premium feature provides detailed AI health assessments. Choose a plan that works for you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7 w-full max-w-2xl mb-12">
          {plans.map((p, i) => (
            <motion.div key={p.name}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .3 + i * .1, ease: [0.22,1,0.36,1] }}
              className="relative rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:scale-[1.02] group"
              style={{ background: 'linear-gradient(145deg, #131f35, #0d1627)', border: `1.5px solid ${p.color}28`, backdropFilter: 'blur(16px)' }}>
              {/* top accent */}
              <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1.5px', background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)`, borderRadius: '9999px' }} />
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                   style={{ background: `radial-gradient(ellipse at 40% 0%, ${p.color}0a, transparent 70%)` }} />
              <div className="relative">
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: `${p.color}18`, border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Crown className="w-4 h-4" style={{ color: p.color }} />
                </div>
                <div className="flex items-end justify-between mb-5">
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold" style={{ color: p.color }}>{p.price.split('/')[0]}</span>
                    <span className="text-xs text-slate-500 ml-1">/mo</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-3.5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '9999px', background: `${p.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle className="w-3 h-3" style={{ color: p.color }} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .55 }}
          className="flex flex-col items-center gap-4">
          <Link to="/pricing"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)', boxShadow: '0 8px 32px rgba(139,92,246,.25)' }}>
            <Crown className="w-4 h-4" />
            View Plans & Upgrade
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="text-xs text-slate-600 text-center leading-relaxed">
            You can still use{' '}
            <Link to="/chat" className="text-sky-500 hover:text-sky-400 underline underline-offset-2">AI Chat</Link>
            {' '}and the{' '}
            <Link to="/" className="text-sky-500 hover:text-sky-400 underline underline-offset-2">Dashboard</Link>
            {' '}on the Free plan.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SymptomChecker() {
  const [symptoms,       setSymptoms]       = useState('')
  const [selectedSystem, setSelectedSystem] = useState('')
  const [severity,       setSeverity]       = useState('')
  const [duration,       setDuration]       = useState('')
  const [age,            setAge]            = useState('')
  const [loading,        setLoading]        = useState(false)
  const [result,         setResult]         = useState<AnalysisResult | null>(null)

  const { user } = useAuthStore()
  const { plan } = useUserPlan()

  if (!user)              return <LoggedOutGate />
  if (plan.planId === 'free') return <FreePlanGate />

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return
    const prompt = `You are a medical AI. Analyze these symptoms and provide a structured assessment:

Patient Info:
- Age: ${age || 'Not specified'}
- Body System: ${selectedSystem || 'Not specified'}
- Symptoms: ${symptoms}
- Severity: ${severity || 'Not specified'}
- Duration: ${duration || 'Not specified'}

Provide a detailed response with:
1. **Possible Conditions** (list 2-4 likely causes)
2. **Key Warning Signs** to watch for
3. **Recommended Actions** (home care vs. doctor visit vs. ER)
4. **Prevention Tips**

Be concise, clear, and empathetic. Always recommend professional consultation.`

    setLoading(true)
    setResult(null)
    let fullText = ''
    await streamGeminiResponse(
      prompt,
      (chunk) => { fullText += chunk },
      () => {
        const urgency: UrgencyLevel =
          symptoms.toLowerCase().includes('chest pain') ||
          symptoms.toLowerCase().includes("can't breathe") ||
          symptoms.toLowerCase().includes('severe') ||
          severity === 'Severe'
            ? 'emergency'
            : severity === 'Moderate' || duration === 'Weeks' || duration === 'Months'
            ? 'moderate'
            : 'routine'
        setResult({ text: fullText, urgency })
        setLoading(false)
      },
      () => { setLoading(false) }
    )
  }

  const handleReset = () => {
    setSymptoms(''); setSelectedSystem(''); setSeverity('')
    setDuration(''); setAge(''); setResult(null)
  }

  const hasAnyInput = symptoms || selectedSystem || severity || duration || age

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-10 pt-28 sm:pt-32 pb-20">

      {/* ── Hero header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 w-full max-w-2xl"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 0 32px rgba(16,185,129,0.35)' }}
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Symptom{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Analyzer
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Describe your symptoms and get an instant AI-powered health assessment — urgency level, possible conditions, and next steps.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Form card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="w-full max-w-2xl mb-8"
        style={{
          background: 'linear-gradient(160deg, #131f35 0%, #0d1525 100%)',
          border: '1px solid rgba(51,65,85,0.5)',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex flex-col gap-7">

          {/* symptoms textarea */}
          <Field
            label="Describe your symptoms"
            icon={Activity}
            iconColor="#10b981"
            hint="Be as specific as possible — include when it started, what makes it better or worse, and any related symptoms."
          >
            <textarea
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="e.g. I have a persistent headache, dizziness, and slight nausea for the past 2 days…"
              rows={4}
              className="w-full rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 text-sm outline-none resize-none transition-all duration-300"
              style={{
                background: 'rgba(10,16,30,0.7)',
                border: symptoms ? '1px solid rgba(16,185,129,0.45)' : '1px solid rgba(51,65,85,0.5)',
                boxShadow: symptoms ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
                lineHeight: '1.6',
              }}
            />
          </Field>

          <Divider />

          {/* Age + Duration row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Age" icon={User} iconColor="#38bdf8">
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 28"
                className="w-full rounded-2xl px-5 py-3.5 text-white placeholder:text-slate-500 text-sm outline-none transition-all duration-300"
                style={{
                  background: 'rgba(10,16,30,0.7)',
                  border: age ? '1px solid rgba(14,165,233,0.45)' : '1px solid rgba(51,65,85,0.5)',
                  boxShadow: age ? '0 0 0 3px rgba(14,165,233,0.08)' : 'none',
                }}
              />
            </Field>

            <Field label="Duration" icon={Clock} iconColor="#a78bfa">
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-300 cursor-pointer"
                style={{
                  background: 'rgba(10,16,30,0.7)',
                  border: duration ? '1px solid rgba(139,92,246,0.45)' : '1px solid rgba(51,65,85,0.5)',
                  color: duration ? '#e2e8f0' : '#64748b',
                  boxShadow: duration ? '0 0 0 3px rgba(139,92,246,0.08)' : 'none',
                }}
              >
                <option value="">Select duration</option>
                {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>

          <Divider />

          {/* Severity */}
          <Field label="Severity Level" icon={AlertTriangle} iconColor="#fbbf24">
            <div className="grid grid-cols-3 gap-3">
              {SEVERITY_OPTIONS.map(({ label, emoji, color, activeClass }) => {
                const isActive = severity === label
                return (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSeverity(isActive ? '' : label)}
                    className={`flex flex-col items-center gap-2.5 py-5 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? `${activeClass} shadow-lg`
                        : 'border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800/40'
                    }`}
                    style={isActive ? { boxShadow: `0 0 20px ${color}20` } : {}}
                  >
                    <span className="text-2xl">{emoji}</span>
                    {label}
                  </motion.button>
                )
              })}
            </div>
          </Field>

          <Divider />

          {/* Body System */}
          <Field label="Body System" icon={Shield} iconColor="#2dd4bf" hint="Optional — helps narrow down the assessment.">
            <div className="flex flex-wrap gap-2.5">
              {BODY_SYSTEMS.map(sys => {
                const isActive = selectedSystem === sys
                return (
                  <motion.button
                    key={sys}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedSystem(isActive ? '' : sys)}
                    className={`text-xs px-4 py-2 rounded-xl border font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 shadow-sky-500/10'
                        : 'border-slate-700/50 text-slate-400 hover:border-sky-500/30 hover:text-sky-400 hover:bg-sky-500/5'
                    }`}
                    style={isActive ? { boxShadow: '0 0 14px rgba(14,165,233,0.15)' } : {}}
                  >
                    {sys}
                  </motion.button>
                )
              })}
            </div>
          </Field>

          <Divider />

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <motion.button
              whileHover={!loading && symptoms.trim() ? { scale: 1.025, y: -1 } : {}}
              whileTap={!loading && symptoms.trim() ? { scale: 0.975 } : {}}
              onClick={handleAnalyze}
              disabled={!symptoms.trim() || loading}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                boxShadow: symptoms.trim() && !loading ? '0 8px 30px rgba(14,165,233,0.35)' : 'none',
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Analyzing your symptoms…' : 'Analyze Symptoms'}
            </motion.button>

            <AnimatePresence>
              {(result || hasAnyInput) && (
                <motion.button
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 text-sm font-medium transition-all duration-200"
                  style={{ borderColor: 'rgba(51,65,85,0.6)' }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-slate-500 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  AI is analyzing…
                </motion.p>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>

      {/* ── Result ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-2xl mb-8"
          >
            <div
              className="flex flex-col gap-6 p-7 sm:p-9"
              style={{
                background: 'linear-gradient(160deg, #131f35, #0d1525)',
                border: '1px solid rgba(51,65,85,0.5)',
                borderRadius: '1.5rem',
                boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
              }}
            >
              <UrgencyBadge level={result.urgency} />

              <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(51,65,85,0.6),transparent)' }} />

              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed prose-headings:text-white prose-strong:text-white prose-li:text-slate-300">
                <ReactMarkdown>{result.text}</ReactMarkdown>
              </div>

              <div className="flex justify-end pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all duration-200"
                  style={{ background: 'rgba(51,65,85,0.3)', border: '1px solid rgba(51,65,85,0.5)' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New analysis
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
