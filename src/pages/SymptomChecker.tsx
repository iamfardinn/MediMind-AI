import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, AlertTriangle, CheckCircle, Info, Loader2, RotateCcw, Shield, Clock, User, Activity, Sparkles, Lock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { streamGeminiResponse } from '../services/copilot'
import { useAuthStore } from '../store/useAuthStore'

const BODY_SYSTEMS = [
  'Head & Neurological', 'Eyes & Vision', 'Ears, Nose & Throat',
  'Chest & Respiratory', 'Heart & Cardiovascular', 'Digestive',
  'Urinary', 'Musculoskeletal', 'Skin', 'Mental Health'
]

const SEVERITY_OPTIONS = [
  { label: 'Mild', emoji: '🟢', activeClass: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-emerald-500/20' },
  { label: 'Moderate', emoji: '🟡', activeClass: 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-amber-500/20' },
  { label: 'Severe', emoji: '🔴', activeClass: 'bg-red-500/15 border-red-500/50 text-red-300 shadow-red-500/20' },
]

const DURATION_OPTIONS = ['Just started', 'Hours', 'Days', 'Weeks', 'Months']

type UrgencyLevel = 'emergency' | 'moderate' | 'routine'
interface AnalysisResult { text: string; urgency: UrgencyLevel }

function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const config = {
    emergency: { icon: AlertTriangle, text: 'Emergency — Seek Immediate Care', color: 'text-red-300 bg-red-500/15 border-red-500/40', glow: 'shadow-red-500/20' },
    moderate: { icon: Info, text: 'See a Doctor Soon', color: 'text-amber-300 bg-amber-500/15 border-amber-500/40', glow: 'shadow-amber-500/20' },
    routine: { icon: CheckCircle, text: 'Routine Care Recommended', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40', glow: 'shadow-emerald-500/20' },
  }
  const { icon: Icon, text, color, glow } = config[level]
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold shadow-lg ${color} ${glow}`}>
      <Icon className="w-4 h-4 shrink-0" />
      {text}
    </div>
  )
}

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('')
  const [selectedSystem, setSelectedSystem] = useState('')
  const [severity, setSeverity] = useState('')
  const [duration, setDuration] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

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

  const { user } = useAuthStore()

  // ── Auth Gate ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16"
           style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, #0f172a 60%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-center text-center"
          style={{ maxWidth: '480px' }}
        >
          {/* Lock icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(14,165,233,0.15))', border: '1px solid rgba(16,185,129,0.25)' }}>
              <Shield className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Sign in to use the<br />
            <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Symptom Analyzer</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This AI-powered tool is available to registered users only. Create a free account or sign in to get an instant health assessment.
          </p>

          {/* Features preview */}
          <div className="w-full rounded-2xl p-5 mb-8 text-left"
               style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.5)' }}>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">What you get</p>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: '🧠', text: 'AI-powered symptom analysis in seconds' },
                { icon: '⚡', text: 'Urgency level: routine, moderate or emergency' },
                { icon: '📋', text: 'Possible conditions & recommended actions' },
                { icon: '🔒', text: 'Your data is private and secure' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="text-base">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link to="/login"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-[1.02] hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}>
              Sign In / Sign Up — It's Free
            </Link>
          </div>

          <p className="text-xs text-slate-600 mt-5">
            You can still browse the{' '}
            <Link to="/" className="text-sky-500 hover:text-sky-400 underline underline-offset-2">Dashboard</Link>
            {' '}and{' '}
            <Link to="/chat" className="text-sky-500 hover:text-sky-400 underline underline-offset-2">AI Chat</Link>
            {' '}without signing in.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 md:px-10" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '2.5rem', paddingBottom: '6rem' }}>

      {/* ── Header ── */}      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <div className="flex flex-col items-center text-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 0 24px rgba(16,185,129,0.4)' }}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Symptom <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Analyzer</span>
            </h1>            <p className="text-slate-400 text-sm mt-0.5">AI-powered assessment — not a replacement for medical care</p>
          </div>
        </div>        {/* Info bar */}
        <div className="flex flex-wrap justify-center gap-3" style={{ marginTop: '2rem' }}>
          {[
            { icon: Sparkles, text: 'AI Powered Analysis' },
            { icon: Clock, text: 'Results in seconds' },
            { icon: Shield, text: '24/7 Available' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1.5">
              <Icon className="w-3.5 h-3.5 text-emerald-400" />
              {text}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Form Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl"
        style={{
          background: 'linear-gradient(160deg, #0f1f35 0%, #0f172a 100%)',
          border: '1px solid rgba(51,65,85,0.6)',
          padding: '2rem',
          display: 'flex', flexDirection: 'column', gap: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Symptom textarea */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            Describe your symptoms <span className="text-red-400 ml-0.5">*</span>
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. I have a persistent headache, dizziness, and slight nausea for the past 2 days..."
            rows={4}
            className="w-full rounded-2xl px-4 py-3.5 text-white placeholder:text-slate-500 text-sm outline-none resize-none transition-all duration-200"
            style={{
              background: 'rgba(15,23,42,0.8)',
              border: symptoms ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(51,65,85,0.5)',
              boxShadow: symptoms ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
            }}
          />
          <p className="text-xs text-slate-500 mt-2">Be as specific as possible for a more accurate analysis</p>
        </div>

        {/* Age + Duration row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Age */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
              <User className="w-4 h-4 text-sky-400" />
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 28"
              className="w-full rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: age ? '1px solid rgba(14,165,233,0.4)' : '1px solid rgba(51,65,85,0.5)',
                boxShadow: age ? '0 0 0 3px rgba(14,165,233,0.08)' : 'none',
              }}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
              <Clock className="w-4 h-4 text-violet-400" />
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-200 cursor-pointer"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: duration ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(51,65,85,0.5)',
                color: duration ? '#e2e8f0' : '#64748b',
                boxShadow: duration ? '0 0 0 3px rgba(139,92,246,0.08)' : 'none',
              }}
            >
              <option value="">Select duration</option>
              {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Severity Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {SEVERITY_OPTIONS.map(({ label, emoji, activeClass }) => {
              const isActive = severity === label
              return (
                <button
                  key={label}
                  onClick={() => setSeverity(isActive ? '' : label)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? `${activeClass} shadow-lg scale-[1.03]`
                      : 'border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Body System */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
            <Shield className="w-4 h-4 text-teal-400" />
            Body System <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {BODY_SYSTEMS.map((sys) => {
              const isActive = selectedSystem === sys
              return (
                <button
                  key={sys}
                  onClick={() => setSelectedSystem(isActive ? '' : sys)}
                  className={`text-xs px-3.5 py-2 rounded-xl border font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 shadow-lg shadow-sky-500/10 scale-[1.04]'
                      : 'border-slate-700/50 text-slate-400 hover:border-sky-500/30 hover:text-sky-400 hover:bg-sky-500/5'
                  }`}
                >
                  {sys}
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(51,65,85,0.8), transparent)' }} />

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!symptoms.trim() || loading}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 hover:scale-[1.02] hover:shadow-2xl"
            style={{
              background: loading ? 'rgba(14,165,233,0.5)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              boxShadow: symptoms.trim() && !loading ? '0 8px 30px rgba(14,165,233,0.35)' : 'none',
            }}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
            {loading ? 'Analyzing your symptoms...' : 'Analyze Symptoms'}
          </button>

          {(result || symptoms || selectedSystem || severity || duration || age) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 text-sm font-medium transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}

          {loading && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              AI is analyzing...
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Result ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl"
            style={{
              marginTop: '2rem',
              background: 'linear-gradient(160deg, #0f1f35 0%, #0f172a 100%)',
              border: '1px solid rgba(14,165,233,0.2)',
              padding: '2rem',
              display: 'flex', flexDirection: 'column', gap: '1.5rem',
              boxShadow: '0 20px 60px rgba(14,165,233,0.08)',
            }}
          >
            {/* Result header */}
            <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">AI Analysis Result</h2>
              </div>
              <UrgencyBadge level={result.urgency} />
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent)' }} />

            {/* Result content */}
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-sky-300 prose-strong:text-white prose-li:text-slate-300 prose-p:text-slate-300 prose-p:leading-relaxed">
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(51,65,85,0.5)' }} />

            {/* Disclaimer */}
            <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-amber-400 font-semibold">Medical Disclaimer: </span>
                This analysis is AI-generated and for informational purposes only. Always consult a licensed healthcare professional for medical advice, diagnosis, or treatment.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
