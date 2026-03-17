import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import CustomCursor from '../components/CustomCursor'
import ScrollReveal from '../components/ScrollReveal'
import DeviceSync from '../components/DeviceSync'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Heart, Thermometer, Wind, Activity, TrendingUp,
  Brain, Shield, Zap, ArrowUpRight, CalendarDays,
  Users, UserCheck, UserPlus, Star, Crown, BadgeCheck, MoreHorizontal, TrendingDown, Minus, MessageSquare, Stethoscope, LayoutDashboard, CreditCard, Sparkles,
} from 'lucide-react'
import { useChatStore } from '../store/useChatStore'
import { Link } from 'react-router-dom'

const CLIENTS = [
  { name: 'Sarah Johnson', age: 34, plan: 'Premium', status: 'Active', lastVisit: 'Feb 25, 2026', condition: 'Hypertension', avatar: 'SJ', avatarColor: 'bg-rose-500' },
  { name: 'Michael Torres', age: 52, plan: 'Premium', status: 'Active', lastVisit: 'Feb 27, 2026', condition: 'Diabetes T2', avatar: 'MT', avatarColor: 'bg-sky-500' },
  { name: 'Aisha Patel', age: 28, plan: 'Standard', status: 'Active', lastVisit: 'Feb 20, 2026', condition: 'Anxiety', avatar: 'AP', avatarColor: 'bg-emerald-500' },
  { name: 'David Kim', age: 61, plan: 'Premium', status: 'Review', lastVisit: 'Feb 15, 2026', condition: 'Cardiac Monitor', avatar: 'DK', avatarColor: 'bg-amber-500' },
  { name: 'Elena Vasquez', age: 45, plan: 'Standard', status: 'Active', lastVisit: 'Feb 26, 2026', condition: 'Migraine', avatar: 'EV', avatarColor: 'bg-purple-500' },
  { name: 'James Okafor', age: 39, plan: 'Premium', status: 'Inactive', lastVisit: 'Jan 30, 2026', condition: 'Asthma', avatar: 'JO', avatarColor: 'bg-teal-500' },
]

const REVIEWS = [
  {
    name: 'Sarah Johnson', avatar: 'SJ', avatarColor: 'bg-rose-500', plan: 'Premium',
    rating: 5, date: 'Feb 26, 2026',
    text: 'MediMind AI completely changed how I manage my hypertension. The real-time insights and AI assistant give me confidence between doctor visits. Absolutely worth every penny.',
  },
  {
    name: 'Michael Torres', avatar: 'MT', avatarColor: 'bg-sky-500', plan: 'Premium',
    rating: 5, date: 'Feb 24, 2026',
    text: 'The symptom analyzer caught a pattern in my blood sugar readings before my doctor did. The AI explanations are clear and never alarmist. I recommend it to everyone in my diabetes support group.',
  },
  {
    name: 'David Kim', avatar: 'DK', avatarColor: 'bg-amber-500', plan: 'Premium',
    rating: 4, date: 'Feb 18, 2026',
    text: 'Excellent platform for ongoing cardiac monitoring. The trend charts are easy to read and the AI assistant answers my questions at 2am when I\'m worried. Would love more wearable integrations.',
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const }
})

function StatCard({
  icon: Icon, label, value, unit, sub, index,
  gradientFrom, gradientTo, glowColor, trend, trendValue, barPct
}: {
  icon: React.ElementType
  label: string
  value: string | number
  unit: string
  sub: string
  index: number
  gradientFrom: string
  gradientTo: string
  glowColor: string
  trend: 'up' | 'down' | 'stable'
  trendValue: string
  barPct: number
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? '#34d399' : trend === 'down' ? '#f87171' : '#94a3b8'
  return (
    <MagneticCard
      glowColor={glowColor}
      className="relative overflow-hidden rounded-2xl cursor-default group"
      style={{
        background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)',
        border: `1px solid ${glowColor}33`,
        padding: '1.6rem',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: '-2.5rem', right: '-2.5rem',
        width: '9rem', height: '9rem', borderRadius: '9999px',
        background: `radial-gradient(circle, ${glowColor}44 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Top row: icon + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{
          width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem', flexShrink: 0,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 18px ${glowColor}55`,
        }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span style={{
          fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em',
          padding: '0.25rem 0.6rem', borderRadius: '9999px',
          background: `${glowColor}18`, border: `1px solid ${glowColor}33`,
          color: glowColor,
        }}>{sub}</span>
      </div>

      {/* Value */}
      <div style={{ marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {value}
        </span>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: '0.35rem', fontWeight: 400 }}>{unit}</span>
      </div>

      {/* Label */}
      <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginBottom: '1.1rem' }}>{label}</p>

      {/* Progress bar */}
      <div style={{ height: '4px', borderRadius: '9999px', background: 'rgba(51,65,85,0.6)', marginBottom: '1rem', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barPct}%` }}
          transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: '9999px', background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}
        />
      </div>

      {/* Trend row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <TrendIcon style={{ width: '0.875rem', height: '0.875rem', color: trendColor, flexShrink: 0 }} />
        <span style={{ fontSize: '0.72rem', color: trendColor, fontWeight: 600 }}>{trendValue}</span>        <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.1rem' }}>vs last month</span>
      </div>
    </MagneticCard>
  )
}

// ─── Trend Panel ──────────────────────────────────────────────────────────────

const TABS = [
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', color: '#f43f5e', gradFrom: '#f43f5e', gradTo: '#ec4899' },
  { key: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg', color: '#0ea5e9', gradFrom: '#0ea5e9', gradTo: '#6366f1' },
  { key: 'temperature', label: 'Temperature', unit: '°F', color: '#f59e0b', gradFrom: '#f59e0b', gradTo: '#f97316' },
  { key: 'oxygenSat', label: 'O₂ Saturation', unit: '%', color: '#10b981', gradFrom: '#10b981', gradTo: '#14b8a6' },
] as const

type TabKey = typeof TABS[number]['key']

type VitalEntry = {
  date: string
  heartRate: number
  bloodPressureSys: number
  bloodPressureDia: number
  temperature: number
  oxygenSat: number
}

function ChartTooltip({
  active, payload, label, unit, accentColor,
}: {
  active?: boolean
  payload?: readonly { value: number; name: string; color: string }[]
  label?: string | number
  unit: string
  accentColor: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(15,23,42,0.95)', border: `1px solid ${accentColor}44`, borderRadius: '0.75rem', padding: '0.85rem 1.1rem', backdropFilter: 'blur(8px)' }}>
      <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 500 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: '0.88rem', color: p.color, fontWeight: 700 }}>
          {p.value} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.75rem' }}>{unit}</span>
        </p>
      ))}
    </div>
  )
}

function TrendPanel({ vitals }: { vitals: VitalEntry[]; latest: VitalEntry }) {
  const [activeTab, setActiveTab] = useState<TabKey>('heartRate')
  const tab = TABS.find(t => t.key === activeTab)!

  /* Build chart data — for blood pressure we show both lines */
  const chartData = vitals.map(v => ({
    date: v.date,
    heartRate: v.heartRate,
    sys: v.bloodPressureSys,
    dia: v.bloodPressureDia,
    temperature: v.temperature,
    oxygenSat: v.oxygenSat,
  }))

  /* Stat summary for active tab */
  const values = vitals.map(v =>
    activeTab === 'bloodPressure' ? v.bloodPressureSys : (v as never)[activeTab] as number
  )
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const avgVal = Math.round(values.reduce((a, b) => a + b, 0) / values.length)

  const isBP = activeTab === 'bloodPressure'
  return (
    <motion.div
      {...fadeUp(0.1)}
      className="rounded-3xl overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)', border: '1px solid rgba(51,65,85,0.5)' }}
    >
      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', borderBottom: '1px solid rgba(51,65,85,0.5)', padding: '0 1.5rem', overflowX: 'auto' }}>
        {TABS.map(t => {
          const isActive = t.key === activeTab
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '1.15rem 1.35rem',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? t.color : '#64748b',
                borderBottom: isActive ? `2px solid ${t.color}` : '2px solid transparent',
                background: 'transparent',
                border: 'none',
                borderBottomWidth: '2px',
                borderBottomStyle: 'solid',
                borderBottomColor: isActive ? t.color : 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s',
                flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>      {/* Body */}
      <div className="p-4 sm:p-6 md:p-8" style={{ paddingBottom: '1.5rem' }}>
        {/* Stat pills */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {[
            { label: 'Average', value: avgVal },
            { label: 'Min', value: minVal },
            { label: 'Max', value: maxVal },
          ].map(s => (
            <div key={s.label} style={{ background: `${tab.color}10`, border: `1px solid ${tab.color}25`, borderRadius: '0.875rem', padding: '0.6rem 1rem' }}>
              <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, display: 'block' }}>{s.label}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {s.value} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#94a3b8' }}>{tab.unit}</span>
              </span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <span style={{ width: '8px', height: '8px', borderRadius: '9999px', background: tab.color, display: 'inline-block', boxShadow: `0 0 6px ${tab.color}` }} />
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{vitals.length} entries</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 sm:h-64 md:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {isBP ? (
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="bpSys" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="bpDia" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />                <Tooltip content={(props) => <ChartTooltip {...props} unit={tab.unit} accentColor={tab.color} />} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8', paddingTop: '1rem' }} />
                <Line type="monotone" dataKey="sys" name="Systolic" stroke="url(#bpSys)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#0ea5e9' }} />
                <Line type="monotone" dataKey="dia" name="Diastolic" stroke="url(#bpDia)" strokeWidth={2} strokeDasharray="5 3" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tab.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={tab.color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`line-${activeTab}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={tab.gradFrom} />
                    <stop offset="100%" stopColor={tab.gradTo} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />                <Tooltip content={(props) => <ChartTooltip {...props} unit={tab.unit} accentColor={tab.color} />} />
                <Area
                  type="monotone"
                  dataKey={activeTab}
                  stroke={`url(#line-${activeTab})`}
                  strokeWidth={2.5}
                  fill={`url(#grad-${activeTab})`}
                  dot={false}
                  activeDot={{ r: 5, fill: tab.color, stroke: 'transparent' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="flex items-center gap-3 mb-2">
        <div style={{ width: '3px', height: '1.5rem', borderRadius: '2px', background: 'linear-gradient(180deg, #0ea5e9, #6366f1)' }} />
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-slate-500 ml-5">{subtitle}</p>}
    </div>
  )
}

// ─── Cursor Spotlight (replaced by CustomCursor component) ────────────────────

// ─── Floating Side Tabs ───────────────────────────────────────────────────────
const SIDE_TABS = [
  { icon: MessageSquare, label: 'AI Chat', to: '/chat', color: '#0ea5e9', glow: 'rgba(14,165,233,0.4)' },
  { icon: Stethoscope, label: 'Doctors', to: '/doctors', color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
  { icon: Shield, label: 'Symptoms', to: '/symptoms', color: '#10b981', glow: 'rgba(16,185,129,0.4)' },
  { icon: LayoutDashboard, label: 'Dashboard', to: '/my-dashboard', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  { icon: CreditCard, label: 'Pricing', to: '/pricing', color: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
]

function FloatingSideTabs() {
  const [visible, setVisible] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useEffect(() => {
    const check = () => setVisible(window.scrollY > 200 && window.innerWidth >= 768)
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }} style={{
            position: 'fixed', right: '1rem', top: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 50,
            justifyContent: 'center',
          }}
        >
          {SIDE_TABS.map((tab, i) => {
            const Icon = tab.icon
            const isHovered = hoveredIdx === i
            return (
              <motion.div
                key={tab.label}
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.06 }}
              >
                <Link
                  to={tab.to}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.6rem 0.75rem', borderRadius: '0.875rem',
                    background: isHovered
                      ? `linear-gradient(135deg, ${tab.color}22, ${tab.color}10)`
                      : 'rgba(15,23,42,0.85)',
                    border: `1px solid ${isHovered ? tab.color + '55' : 'rgba(51,65,85,0.5)'}`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: isHovered ? `0 0 20px ${tab.glow}` : '0 4px 12px rgba(0,0,0,0.3)',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  <Icon style={{
                    width: '1.1rem', height: '1.1rem',
                    color: isHovered ? tab.color : '#94a3b8',
                    transition: 'color 0.2s',
                    flexShrink: 0,
                  }} />
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          fontSize: '0.78rem', fontWeight: 600,
                          color: tab.color,
                          overflow: 'hidden',
                        }}
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── GSAP Magnetic Tilt Card Wrapper ──────────────────────────────────────────
function MagneticCard({ children, glowColor, className, style }: {
  children: React.ReactNode
  glowColor: string
  className?: string
  style?: React.CSSProperties
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const glow = glowRef.current
    if (!card || !glow) return

    const handleEnter = () => {
      gsap.to(card, {
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out',
        boxShadow: `0 0 30px ${glowColor}33, 0 8px 32px rgba(0,0,0,0.3)`,
      })
    }

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      const rx = (py - 0.5) * -10 // rotateX
      const ry = (px - 0.5) * 10  // rotateY

      gsap.to(card, {
        rotateX: rx,
        rotateY: ry,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 800,
      })

      gsap.to(glow, {
        opacity: 1,
        background: `radial-gradient(circle at ${px * 100}% ${py * 100}%, ${glowColor}35 0%, transparent 60%)`,
        duration: 0.3,
      })
    }

    const handleLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
        boxShadow: 'none',
      })
      gsap.to(glow, { opacity: 0, duration: 0.4 })
    }

    card.addEventListener('mouseenter', handleEnter)
    card.addEventListener('mousemove', handleMove)
    card.addEventListener('mouseleave', handleLeave)

    return () => {
      card.removeEventListener('mouseenter', handleEnter)
      card.removeEventListener('mousemove', handleMove)
      card.removeEventListener('mouseleave', handleLeave)
    }
  }, [glowColor])

  return (
    <div
      ref={cardRef}
      className={className}
      data-magnetic
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        position: 'relative',
      }}
    >
      <div
        ref={glowRef}
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          pointerEvents: 'none', zIndex: 1, opacity: 0,
        }}
      />
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { vitals } = useChatStore()
  const latest = vitals[vitals.length - 1]
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0f172a', position: 'relative', overflow: 'hidden' }}>      {/* Ambient background glow that follows cursor */}
      <CustomCursor />
      {/* Floating side quick-action tabs */}
      <FloatingSideTabs />

      {/* Animated floating background icons */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '500px', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[
          { Icon: Heart, x: '10%', y: '15%', size: 28, delay: 0, color: 'rgba(244,63,94,0.08)' },
          { Icon: Brain, x: '85%', y: '20%', size: 32, delay: 0.5, color: 'rgba(14,165,233,0.08)' },
          { Icon: Shield, x: '75%', y: '60%', size: 24, delay: 1, color: 'rgba(16,185,129,0.07)' },
          { Icon: Activity, x: '20%', y: '70%', size: 26, delay: 1.5, color: 'rgba(99,102,241,0.08)' },
          { Icon: Zap, x: '50%', y: '25%', size: 20, delay: 0.8, color: 'rgba(245,158,11,0.07)' },
          { Icon: Thermometer, x: '35%', y: '55%', size: 22, delay: 1.2, color: 'rgba(249,115,22,0.07)' },
          { Icon: Stethoscope, x: '65%', y: '40%', size: 30, delay: 0.3, color: 'rgba(139,92,246,0.08)' },
        ].map(({ Icon, x, y, size, delay, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1, scale: 1,
              y: [0, -12, 0, 12, 0],
            }}
            transition={{
              opacity: { duration: 0.8, delay },
              scale: { duration: 0.8, delay },
              y: { duration: 6 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay },
            }}
            style={{ position: 'absolute', left: x, top: y }}
          >
            <Icon style={{ width: size, height: size, color, strokeWidth: 1.2 }} />
          </motion.div>
        ))}
      </div>      <div className="px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:px-12" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '5rem', position: 'relative', zIndex: 2 }}>        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center text-center gap-5"
          style={{ marginTop: '2rem', marginBottom: '1rem', position: 'relative' }}
        >
          {/* Pulsing rings behind the title */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.15, 0, 0.15] }}
                transition={{ duration: 4, delay: i * 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: `${140 + i * 80}px`, height: `${140 + i * 80}px`,
                  borderRadius: '9999px',
                  border: '1px solid rgba(14,165,233,0.15)',
                }}
              />
            ))}
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.15)',
              color: '#7dd3fc',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{today}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
          >
            Your Health,{' '}
            <span className="bg-linear-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed"
          >
            Real-time vitals monitoring, AI-powered insights, and personalised health intelligence — all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-2"
          >
            <Link to="/chat">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  boxShadow: '0 4px 24px rgba(14,165,233,0.35)',
                }}
              >
                <Brain className="w-4 h-4" />
                Start AI Chat
              </motion.div>
            </Link>
            <Link to="/symptoms">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
                style={{
                  color: '#94a3b8',
                  background: 'rgba(30,41,59,0.6)',
                  border: '1px solid rgba(51,65,85,0.5)',
                }}
              >
                <Shield className="w-4 h-4" />
                Check Symptoms
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>{/* Section divider */}
        <div className="section-divider" />

        {/* VITALS GRID */}
        <ScrollReveal direction="up" delay={0}>
          <section>
            <SectionHeader title="Current Vitals" subtitle="Updated based on your latest recorded entry" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <ScrollReveal direction="up" delay={0.05}><StatCard
                index={0} icon={Heart} label="Heart Rate"
                value={latest.heartRate} unit="bpm" sub="Normal"
                gradientFrom="#f43f5e" gradientTo="#ec4899"
                glowColor="#f43f5e" trend="up" trendValue="+2 bpm" barPct={72}
              /></ScrollReveal>
              <ScrollReveal direction="up" delay={0.12}><StatCard
                index={1} icon={Activity} label="Blood Pressure"
                value={`${latest.bloodPressureSys}/${latest.bloodPressureDia}`} unit="mmHg" sub="Sys / Dia"
                gradientFrom="#0ea5e9" gradientTo="#3b82f6"
                glowColor="#0ea5e9" trend="stable" trendValue="No change" barPct={60}
              /></ScrollReveal>
              <ScrollReveal direction="up" delay={0.19}><StatCard
                index={2} icon={Thermometer} label="Temperature"
                value={latest.temperature} unit="°F" sub="Normal"
                gradientFrom="#f59e0b" gradientTo="#f97316"
                glowColor="#f59e0b" trend="down" trendValue="-0.2°F" barPct={55}
              /></ScrollReveal>
              <ScrollReveal direction="up" delay={0.26}><StatCard
                index={3} icon={Wind} label="O₂ Saturation"
                value={latest.oxygenSat} unit="%" sub="SpO₂"
                gradientFrom="#10b981" gradientTo="#14b8a6"
                glowColor="#10b981" trend="up" trendValue="+1%" barPct={98}
              /></ScrollReveal>
            </div>
          </section>
        </ScrollReveal>

        <div className="section-divider" />

        {/* CHARTS */}
        <ScrollReveal direction="scale" delay={0.1}>
          <section>
            <SectionHeader title="Trends Over Time" subtitle="6-month historical health data" />
            <TrendPanel vitals={vitals} latest={latest} />
          </section>
        </ScrollReveal>

        <div className="section-divider" />

        {/* DEVICE SYNC FEATURE */}
        <ScrollReveal direction="up" delay={0.1}>
          <DeviceSync />
        </ScrollReveal>

        <div className="section-divider" />

        {/* AI TOOLS */}
        <ScrollReveal direction="up" delay={0}>
          <section style={{ paddingBottom: '1rem' }}>
            <SectionHeader title="AI Tools" subtitle="Powered by GitHub Copilot — real-time intelligence" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* ── Card 1: AI Medical Assistant ── */}
              <MagneticCard
                glowColor="#0ea5e9"
                className="relative overflow-hidden rounded-3xl flex flex-col"
                style={{ background: 'linear-gradient(145deg, #0c1a2e 0%, #0f172a 60%, #0c1929 100%)', border: '1px solid rgba(14,165,233,0.2)', padding: '2rem' }}
              >
                {/* Decorative blob */}
                <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '10rem', height: '10rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-2rem', left: '-2rem', width: '8rem', height: '8rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Top badge */}
                <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                  <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full" style={{ padding: '0.3rem 0.8rem' }}>Most Used</span>
                  <span className="text-xs text-slate-500">Gemini 2.0</span>
                </div>

                {/* Icon */}
                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: '0 0 24px rgba(14,165,233,0.4)' }}>
                  <Brain className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-lg font-bold text-white" style={{ marginBottom: '0.6rem' }}>AI Medical Assistant</h3>
                <p className="text-slate-400 text-sm leading-relaxed" style={{ marginBottom: '1.5rem' }}>
                  Real-time conversation with your personal AI doctor. Evidence-based guidance on any health concern, 24/7.
                </p>

                {/* Feature list */}
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                  {['Instant symptom triage', 'Drug interaction checks', 'Personalised health tips'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <span style={{ width: '1.25rem', height: '1.25rem', borderRadius: '9999px', background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Stat */}
                <div className="flex items-center gap-2 border-t border-slate-700/40" style={{ paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                  <span className="text-2xl font-bold text-white">98%</span>
                  <span className="text-xs text-slate-400">user satisfaction rate</span>
                </div>

                {/* CTA */}
                <Link to="/chat" className="flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                  style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 4px 20px rgba(14,165,233,0.3)' }}>
                  Start Chatting <ArrowUpRight className="w-4 h-4" />              </Link>
              </MagneticCard>

              {/* ── Card 2: Symptom Analyzer ── */}
              <MagneticCard
                glowColor="#10b981"
                className="relative overflow-hidden rounded-3xl flex flex-col"
                style={{ background: 'linear-gradient(145deg, #0a1f18 0%, #0f172a 60%, #0a1a14 100%)', border: '1px solid rgba(16,185,129,0.2)', padding: '2rem' }}
              >
                <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '10rem', height: '10rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-2rem', left: '-2rem', width: '8rem', height: '8rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full" style={{ padding: '0.3rem 0.8rem' }}>AI Powered</span>
                  <span className="text-xs text-slate-500">Instant Results</span>
                </div>

                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #10b981, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: '0 0 24px rgba(16,185,129,0.4)' }}>
                  <Shield className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-lg font-bold text-white" style={{ marginBottom: '0.6rem' }}>Symptom Analyzer</h3>
                <p className="text-slate-400 text-sm leading-relaxed" style={{ marginBottom: '1.5rem' }}>
                  Describe symptoms in plain language. Get a detailed AI assessment with urgency level and clear next steps.
                </p>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                  {['Urgency classification', 'Condition probability', 'Action plan & next steps'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <span style={{ width: '1.25rem', height: '1.25rem', borderRadius: '9999px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 border-t border-slate-700/40" style={{ paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                  <span className="text-2xl font-bold text-white">2.4s</span>
                  <span className="text-xs text-slate-400">average analysis time</span>
                </div>

                <Link to="/symptoms" className="flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                  style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #10b981, #14b8a6)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                  Analyze Symptoms <ArrowUpRight className="w-4 h-4" />              </Link>
              </MagneticCard>

              {/* ── Card 3: Real-Time Insights ── */}
              <MagneticCard
                glowColor="#f59e0b"
                className="relative overflow-hidden rounded-3xl flex flex-col"
                style={{ background: 'linear-gradient(145deg, #1a1200 0%, #0f172a 60%, #1a1200 100%)', border: '1px solid rgba(245,158,11,0.2)', padding: '2rem' }}
              >
                <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '10rem', height: '10rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-2rem', left: '-2rem', width: '8rem', height: '8rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full" style={{ padding: '0.3rem 0.8rem' }}>Live Data</span>
                  <span className="text-xs text-slate-500">Auto-updated</span>
                </div>

                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: '0 0 24px rgba(245,158,11,0.4)' }}>
                  <Zap className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-lg font-bold text-white" style={{ marginBottom: '0.6rem' }}>Real-Time Insights</h3>
                <p className="text-slate-400 text-sm leading-relaxed" style={{ marginBottom: '1.5rem' }}>
                  Track vitals over time, spot trends early, and receive AI-driven alerts before small issues become serious.
                </p>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                  {['6-month trend charts', 'Smart anomaly alerts', 'Predictive health scoring'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <span style={{ width: '1.25rem', height: '1.25rem', borderRadius: '9999px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 border-t border-slate-700/40" style={{ paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                  <span className="text-2xl font-bold text-white">+31%</span>
                  <span className="text-xs text-slate-400">earlier issue detection</span>
                </div>

                <Link to="/" className="flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                  style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
                  View Trends <ArrowUpRight className="w-4 h-4" />              </Link>
              </MagneticCard>          </div>
          </section>
        </ScrollReveal>

        <div className="section-divider" />

        {/* CLIENTS */}
        <ScrollReveal direction="up" delay={0}>
          <section>
            <SectionHeader title="Clients" subtitle="Active patients and their current health plans" />

            {/* Client stat pills */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5" style={{ marginBottom: '1.5rem' }}>
              {[
                { icon: Users, label: 'Total Clients', value: '1,284', change: '+12%', up: true, iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400' },
                { icon: UserCheck, label: 'Active', value: '1,047', change: '+8%', up: true, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400' },
                { icon: Crown, label: 'Premium', value: '386', change: '+21%', up: true, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400' },
                { icon: UserPlus, label: 'New This Month', value: '57', change: '-4%', up: false, iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400' },].map(({ icon: Icon, label, value, change, up, iconBg, iconColor }, i) => (
                  <motion.div
                    key={label}
                    {...fadeUp(i * 0.07)}
                    className="rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3 p-4 sm:p-6"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl sm:text-2xl font-bold text-white leading-tight">{value}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{label}</p>
                    </div>
                    <span className={`text-xs font-semibold shrink-0 rounded-full ${up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}
                      style={{ padding: '0.25rem 0.5rem' }}>
                      {change}
                    </span>
                  </motion.div>
                ))}
            </div>

            {/* Client table */}
            <motion.div {...fadeUp(0.15)} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">            <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3 sm:px-6 sm:py-4">
              <h3 className="text-sm font-semibold text-white">Recent Clients</h3>
              <button className="text-xs text-sky-400 hover:text-sky-300 transition-colors">View All</button>
            </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-130">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700/30">
                      <th className="font-medium text-left px-4 py-3 sm:px-6">Client</th>
                      <th className="font-medium text-left px-4 py-3 sm:px-6 hidden sm:table-cell">Age</th>
                      <th className="font-medium text-left px-4 py-3 sm:px-6">Condition</th>
                      <th className="font-medium text-left px-4 py-3 sm:px-6 hidden md:table-cell">Plan</th>
                      <th className="font-medium text-left px-4 py-3 sm:px-6 hidden lg:table-cell">Last Visit</th>
                      <th className="font-medium text-left px-4 py-3 sm:px-6">Status</th>
                      <th className="px-4 py-3 sm:px-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLIENTS.map((c, i) => (
                      <motion.tr
                        key={c.name}
                        {...fadeUp(0.1 + i * 0.05)}
                        className="border-b border-slate-700/20 last:border-0 hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="px-4 py-3 sm:px-6 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                              {c.avatar}
                            </div>
                            <span className="text-white font-medium whitespace-nowrap text-xs sm:text-sm">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-slate-400 text-xs sm:text-sm hidden sm:table-cell">{c.age}</td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-slate-300 text-xs sm:text-sm">{c.condition}</td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 hidden md:table-cell">
                          {c.plan === 'Premium' ? (
                            <span className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                              <Crown className="w-3 h-3" /> Premium
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Standard</span>
                          )}
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-slate-400 text-xs whitespace-nowrap hidden lg:table-cell">{c.lastVisit}</td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4">
                          <span className={`text-xs font-medium rounded-full px-2 py-1 ${c.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' :
                              c.status === 'Review' ? 'bg-amber-500/15 text-amber-400' :
                                'bg-slate-700/60 text-slate-400'
                            }`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4">
                          <button className="text-slate-500 hover:text-slate-300 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>          </motion.div>
          </section>
        </ScrollReveal>

        <div className="section-divider" />

        {/* PREMIUM REVIEWS */}
        <ScrollReveal direction="up" delay={0}>
          <section style={{ paddingBottom: '2rem' }}>
            <SectionHeader title="Premium Client Reviews" subtitle="What our top-tier members are saying" />

            {/* Review cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">            {REVIEWS.map((r, i) => (
              <motion.div
                key={r.name}
                {...fadeUp(0.1 + i * 0.08)}
                className="rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col hover:border-slate-600 transition-colors p-5 sm:p-8"
              >
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={`w-4 h-4 ${s < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-300 text-sm leading-relaxed flex-1" style={{ margin: '1.25rem 0' }}>"{r.text}"</p>

                {/* Author */}
                <div className="flex items-center justify-between gap-3 border-t border-slate-700/50" style={{ paddingTop: '1.25rem' }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${r.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {r.avatar}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{r.name}</p>
                      <p className="text-slate-500 text-xs" style={{ marginTop: '0.15rem' }}>{r.date}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full shrink-0"
                    style={{ padding: '0.3rem 0.75rem' }}>
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                </div>
              </motion.div>
            ))}
            </div>          {/* Overall rating summary */}
            <motion.div
              {...fadeUp(0.3)}
              className="rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 sm:p-8"
              style={{ marginTop: '1.5rem' }}
            >
              {/* Score */}
              <div className="text-center shrink-0">
                <p className="text-5xl sm:text-6xl font-bold text-white">4.9</p>
                <div className="flex items-center justify-center gap-1 mt-1.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-500 text-xs mt-1">Based on 386 reviews</p>
              </div>

              {/* Bars */}
              <div className="flex-1 w-full flex flex-col gap-2.5">
                {[
                  { label: '5 stars', pct: 78 },
                  { label: '4 stars', pct: 16 },
                  { label: '3 stars', pct: 4 },
                  { label: '2 stars', pct: 1 },
                  { label: '1 star', pct: 1 },
                ].map(({ label, pct }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 shrink-0 w-12">{label}</span>
                    <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                        className="h-full bg-amber-400 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>

              {/* Verified badge */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <BadgeCheck className="w-5 h-5" />
                  Verified Reviews
                </div>
                <p className="text-slate-500 text-xs text-center max-w-32">
                  All reviews from active premium members
                </p>
              </div>          </motion.div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  )
}
