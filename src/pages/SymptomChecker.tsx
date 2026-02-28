import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, AlertTriangle, CheckCircle, Info, Loader2, RotateCcw, Shield } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { streamGeminiResponse } from '../services/gemini'

const BODY_SYSTEMS = [
  'Head & Neurological', 'Eyes & Vision', 'Ears, Nose & Throat',
  'Chest & Respiratory', 'Heart & Cardiovascular', 'Digestive',
  'Urinary', 'Musculoskeletal', 'Skin', 'Mental Health'
]

const SEVERITY_OPTIONS = [
  { label: 'Mild', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { label: 'Moderate', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { label: 'Severe', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
]

const DURATION_OPTIONS = ['Just started', 'Hours', 'Days', 'Weeks', 'Months']

type UrgencyLevel = 'emergency' | 'moderate' | 'routine'

interface AnalysisResult {
  text: string
  urgency: UrgencyLevel
}

function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const config = {
    emergency: { icon: AlertTriangle, text: 'Emergency — Seek Immediate Care', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
    moderate: { icon: Info, text: 'See a Doctor Soon', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    routine: { icon: CheckCircle, text: 'Routine Care Recommended', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  }
  const { icon: Icon, text, color } = config[level]
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4" />
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
          symptoms.toLowerCase().includes('can\'t breathe') ||
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
    setSymptoms('')
    setSelectedSystem('')
    setSeverity('')
    setDuration('')
    setAge('')
    setResult(null)
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 2rem 4rem 2rem' }}
         className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Symptom <span className="gradient-text">Analyzer</span>
          </h1>
        </div>
        <p className="text-slate-400 ml-13">AI-powered symptom assessment — not a replacement for medical care</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 space-y-5"
      >
        {/* Symptom description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Describe your symptoms <span className="text-red-400">*</span>
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. I have a persistent headache, dizziness, and slight nausea for the past 2 days..."
            rows={3}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none focus:border-sky-500/50 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 28"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 text-sm outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
            <div className="flex gap-2">
              {SEVERITY_OPTIONS.map(({ label, color }) => (
                <button
                  key={label}
                  onClick={() => setSeverity(severity === label ? '' : label)}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-all ${
                    severity === label ? color : 'border-slate-700/50 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-sky-500/50 transition-colors"
            >
              <option value="">Select duration</option>
              {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Body System */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Body System (optional)</label>
          <div className="flex flex-wrap gap-2">
            {BODY_SYSTEMS.map((sys) => (
              <button
                key={sys}
                onClick={() => setSelectedSystem(selectedSystem === sys ? '' : sys)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedSystem === sys
                    ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                    : 'border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleAnalyze}
            disabled={!symptoms.trim() || loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:from-sky-400 hover:to-indigo-400 transition-all glow"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
          {result && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-white">AI Analysis Result</h2>
              <UrgencyBadge level={result.urgency} />
            </div>
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-sky-300 prose-strong:text-white prose-li:text-slate-300 border-t border-slate-700/50 pt-4">
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>
            <p className="text-xs text-slate-500 border-t border-slate-700/50 pt-3">
              ⚕️ This analysis is AI-generated and is for informational purposes only. Always consult a licensed healthcare professional for medical advice, diagnosis, or treatment.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
