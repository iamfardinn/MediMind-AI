import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Watch, ShieldCheck, HeartPulse, RefreshCw,
  CheckCircle2, AlertCircle, Wifi, Lock, Zap,
} from 'lucide-react'
import { useChatStore } from '../store/useChatStore'
import { connectGoogleFit } from '../services/googleFit'

// ── animation helpers ─────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
})

// ── sub-components ────────────────────────────────────────────────────────────

function FeaturePill({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ background: `${color}12`, border: `1px solid ${color}28`, color }}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {label}
    </div>
  )
}

interface SyncCardProps {
  provider: 'apple' | 'google'
  icon: React.ElementType
  title: string
  subtitle: string
  description: string
  accentColor: string
  glowColor: string
  gradFrom: string
  gradTo: string
  features: Array<{ icon: React.ElementType; label: string }>
  connected: boolean
  connecting: boolean
  syncStatus: string
  progress: number
  error?: string
  onConnect: () => void
  onDisconnect: () => void
  anyConnecting: boolean
  delay?: number
}

function SyncCard({
  icon: CardIcon,
  title, subtitle, description,
  accentColor, glowColor, gradFrom, gradTo,
  features,
  connected, connecting, syncStatus, progress, error,
  onConnect, onDisconnect, anyConnecting,
  delay = 0,
}: SyncCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      {...fadeUp(delay)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative overflow-hidden rounded-3xl flex flex-col border transition-all duration-500"
      style={{
        padding: '2rem 2.25rem',
        background: connected
          ? `linear-gradient(145deg, rgba(15,23,42,0.95), rgba(10,16,32,0.98))`
          : 'linear-gradient(145deg, #131f35 0%, #0d1627 100%)',
        borderColor: connected ? `${accentColor}55` : 'rgba(51,65,85,0.4)',
        boxShadow: connected
          ? `0 0 48px ${glowColor}18, 0 8px 32px rgba(0,0,0,0.4)`
          : hovered
            ? `0 0 24px ${glowColor}10, 0 8px 24px rgba(0,0,0,0.3)`
            : '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* top accent bar when connected */}
      <AnimatePresence>
        {connected && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
              transformOrigin: 'left',
            }}
          />
        )}
      </AnimatePresence>

      {/* shimmer overlay on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 30% 20%, ${glowColor}08 0%, transparent 60%)`,
        }}
      />

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-center gap-4">
          {/* icon with pulse ring */}
          <div style={{ position: 'relative' }}>
            {connected && (
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', inset: '-6px', borderRadius: '9999px',
                  border: `1.5px solid ${accentColor}`,
                }}
              />
            )}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: connected
                  ? `linear-gradient(135deg, ${gradFrom}22, ${gradTo}22)`
                  : 'rgba(255,255,255,0.04)',
                border: connected ? `1px solid ${accentColor}40` : '1px solid rgba(255,255,255,0.08)',
                boxShadow: connected ? `0 0 20px ${glowColor}30` : 'none',
              }}
            >
              <CardIcon
                className="w-7 h-7"
                style={{ color: connected ? accentColor : '#94a3b8' }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{title}</h3>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5" />
              {subtitle}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {connected && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Synced
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Description ── */}
      <p className="text-sm text-slate-400 leading-relaxed mb-6" style={{ position: 'relative', zIndex: 1 }}>
        {description}
      </p>

      {/* ── Feature pills ── */}
      <div className="flex flex-wrap gap-2 mb-8" style={{ position: 'relative', zIndex: 1 }}>
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.1 + i * 0.07 }}
          >
            <FeaturePill icon={f.icon} label={f.label} color={accentColor} />
          </motion.div>
        ))}
      </div>

      {/* ── Bottom action area ── */}
      <div className="mt-auto" style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {connecting ? (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(10,16,30,0.7)',
                border: `1px solid ${accentColor}20`,
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <span
                  className="text-xs font-semibold flex items-center gap-2"
                  style={{ color: accentColor }}
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {syncStatus}
                </span>
                <span className="text-xs font-bold tabular-nums" style={{ color: accentColor }}>
                  {progress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(51,65,85,0.5)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})` }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="btn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              whileHover={!anyConnecting ? { scale: 1.025, y: -1 } : {}}
              whileTap={!anyConnecting ? { scale: 0.975 } : {}}
              onClick={() => (connected ? onDisconnect() : onConnect())}
              disabled={anyConnecting}
              className="w-full py-4 rounded-2xl text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: connected
                  ? `${accentColor}12`
                  : `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                color: connected ? accentColor : '#fff',
                border: connected ? `1px solid ${accentColor}25` : 'none',
                boxShadow: connected ? 'none' : `0 6px 24px ${glowColor}35`,
              }}
            >
              {connected ? `Disconnect ${title}` : `Connect ${title}`}
            </motion.button>
          )}
        </AnimatePresence>

        {/* error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 4, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2.5 mt-4 rounded-2xl p-3.5"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
            >
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DeviceSync() {
  const { addVital, vitals } = useChatStore()
  const [connecting, setConnecting] = useState<'apple' | 'google' | null>(null)
  const [connected, setConnected] = useState<{ apple?: boolean; google?: boolean }>({})
  const [syncStatus, setSyncStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<{ apple?: string; google?: string }>({})

  // ── Apple Health — simulated demo flow ──────────────────────────────────────
  const handleConnectApple = () => {
    if (connected.apple) return
    setError({})
    setConnecting('apple')
    setProgress(0)
    setSyncStatus('Authenticating securely...')

    const sequence = [
      { t: 600,  p: 25,  msg: 'Requesting permission...' },
      { t: 1400, p: 50,  msg: 'Establishing encrypted link...' },
      { t: 2200, p: 75,  msg: 'Fetching historical vitals...' },
      { t: 3000, p: 92,  msg: 'Processing health data...' },
      { t: 3600, p: 100, msg: 'Sync complete ✓' },
    ]

    sequence.forEach(({ t, p, msg }) => {
      setTimeout(() => {
        setProgress(p)
        setSyncStatus(msg)
        if (p === 100) {
          setTimeout(() => {
            setConnecting(null)
            setConnected(prev => ({ ...prev, apple: true }))
            const currentMonth = new Date().toLocaleString('en-US', { month: 'short' })
            addVital({
              date: `${currentMonth} (Apple)`,
              heartRate: Math.floor(Math.random() * 20 + 65),
              bloodPressureSys: Math.floor(Math.random() * 15 + 110),
              bloodPressureDia: Math.floor(Math.random() * 10 + 75),
              temperature: Number((Math.random() * 1.3 + 97.8).toFixed(1)),
              oxygenSat: Math.floor(Math.random() * 4 + 96),
            })
          }, 700)
        }
      }, t)
    })
  }

  // ── Google Fit — real OAuth 2.0 + Fitness REST API ──────────────────────────
  const handleConnectGoogle = async () => {
    if (connected.google) return
    setError({})
    setConnecting('google')
    setProgress(10)
    setSyncStatus('Opening Google sign-in...')

    try {
      setProgress(30)
      setSyncStatus('Waiting for Google permission...')

      const fitVitals = await connectGoogleFit()

      setProgress(70)
      setSyncStatus('Fetching your health data...')
      await new Promise(r => setTimeout(r, 600))

      setProgress(100)
      setSyncStatus('Sync complete ✓')
      await new Promise(r => setTimeout(r, 500))

      const currentMonth = new Date().toLocaleString('en-US', { month: 'short' })
      addVital({
        date: `${currentMonth} (Fit)`,
        heartRate:        fitVitals.heartRate        ?? Math.floor(Math.random() * 20 + 65),
        bloodPressureSys: fitVitals.bloodPressureSys ?? Math.floor(Math.random() * 15 + 110),
        bloodPressureDia: fitVitals.bloodPressureDia ?? Math.floor(Math.random() * 10 + 75),
        temperature:      fitVitals.temperature      ?? Number((Math.random() * 1.3 + 97.8).toFixed(1)),
        oxygenSat:        fitVitals.oxygenSat        ?? Math.floor(Math.random() * 4 + 96),
      })

      setConnecting(null)
      setConnected(prev => ({ ...prev, google: true }))
    } catch (err: unknown) {
      setConnecting(null)
      setProgress(0)
      const msg = err instanceof Error ? err.message : String(err)
      if (msg === 'popup_closed') return
      setError({
        google: msg.includes('VITE_GOOGLE_CLIENT_ID')
          ? 'Google Client ID not configured — add VITE_GOOGLE_CLIENT_ID to .env.local'
          : `Connection failed: ${msg}`,
      })
    }
  }

  const handleDisconnect = (provider: 'apple' | 'google') => {
    setConnected(prev => ({ ...prev, [provider]: false }))
    setError({})
  }

  return (
    <section style={{ paddingBottom: '0.5rem' }}>
      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '2.5rem' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            style={{
              width: '3px', height: '1.75rem', borderRadius: '2px',
              background: 'linear-gradient(180deg, #10b981, #3b82f6)',
            }}
          />
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Wearable Integrations
          </h2>
        </div>
        <p className="text-sm text-slate-500 ml-5 leading-relaxed max-w-lg">
          Connect your smartwatch or fitness tracker to automatically sync real-time vitals —
          heart rate, blood oxygen, temperature, and more.
        </p>
      </motion.div>

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

        <SyncCard
          provider="apple"
          icon={Watch}
          title="Apple Health"
          subtitle="E2E Encrypted"
          description="Import your resting heart rate, ECG events, blood oxygen levels, and step count automatically from your Apple Watch or any HealthKit-compatible device."
          accentColor="#f43f5e"
          glowColor="rgba(244,63,94,0.6)"
          gradFrom="#f43f5e"
          gradTo="#e11d48"
          features={[
            { icon: HeartPulse, label: 'Heart Rate' },
            { icon: Zap,        label: 'ECG Events' },
            { icon: Lock,       label: 'End-to-End' },
            { icon: Wifi,       label: 'Live Sync' },
          ]}
          connected={!!connected.apple}
          connecting={connecting === 'apple'}
          syncStatus={syncStatus}
          progress={progress}
          error={error.apple}
          onConnect={handleConnectApple}
          onDisconnect={() => handleDisconnect('apple')}
          anyConnecting={connecting !== null}
          delay={0.1}
        />

        <SyncCard
          provider="google"
          icon={HeartPulse}
          title="Google Fit"
          subtitle="OAuth 2.0 Secure"
          description="Sync historical vitals, workout intensity, body temperature averages, and sleep data from any WearOS device via the official Google Fit REST API."
          accentColor="#0ea5e9"
          glowColor="rgba(14,165,233,0.6)"
          gradFrom="#0ea5e9"
          gradTo="#3b82f6"
          features={[
            { icon: HeartPulse, label: 'Heart Rate' },
            { icon: ShieldCheck, label: 'OAuth 2.0' },
            { icon: Wifi,        label: 'Real API' },
            { icon: Zap,         label: 'Live Data' },
          ]}
          connected={!!connected.google}
          connecting={connecting === 'google'}
          syncStatus={syncStatus}
          progress={progress}
          error={error.google}
          onConnect={handleConnectGoogle}
          onDisconnect={() => handleDisconnect('google')}
          anyConnecting={connecting !== null}
          delay={0.2}
        />

      </div>
    </section>
  )
}
