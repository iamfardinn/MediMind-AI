import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Heart, Thermometer, Wind, Activity, TrendingUp,
  Brain, Shield, Zap, ArrowUpRight, CalendarDays, Bell
} from 'lucide-react'
import { useChatStore } from '../store/useChatStore'
import { Link } from 'react-router-dom'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const }
})

function StatCard({
  icon: Icon, label, value, unit, color, sub, index
}: {
  icon: React.ElementType
  label: string
  value: string | number
  unit: string
  color: string
  sub: string
  index: number
}) {
  return (
    <motion.div
      {...fadeUp(index * 0.08)}
      className="relative overflow-hidden rounded-2xl bg-slate-800/60 border border-slate-700/50 p-6 lg:p-7 hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-300 group cursor-default min-w-0"
    >
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${color} opacity-[0.08] group-hover:opacity-[0.15] blur-2xl transition-opacity duration-300`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-[11px] text-slate-500 bg-slate-700/60 px-2 py-0.5 rounded-full leading-5 truncate max-w-[50%] text-right">{sub}</span>
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
        {value}
        <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
      </p>
      <p className="text-sm text-slate-400 mt-1 font-medium truncate">{label}</p>
    </motion.div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { vitals } = useChatStore()
  const latest = vitals[vitals.length - 1]
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 3rem 7rem 3rem' }}>

        {/* PAGE HEADER */}
        <motion.div
          {...fadeUp(0)}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        >
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>{today}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              Health{' '}
              <span className="bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm lg:text-base">
              Your real-time vitals and AI-powered health overview
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-base font-medium transition-all whitespace-nowrap">
              <Bell className="w-5 h-5 shrink-0" />
              Alerts
            </button>
            <Link
              to="/chat"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-all shadow-lg shadow-sky-500/20 whitespace-nowrap"
            >
              <Brain className="w-4 h-4 shrink-0" />
              Ask AI
            </Link>
          </div>
        </motion.div>        {/* VITALS GRID */}
        <section style={{ marginTop: '5rem' }}>
          <SectionHeader title="Current Vitals" subtitle="Updated based on your latest recorded entry" />
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-7">
            <StatCard index={0} icon={Heart} label="Heart Rate" value={latest.heartRate} unit="bpm" color="bg-linear-to-br from-rose-500 to-pink-600" sub="Normal" />
            <StatCard index={1} icon={Activity} label="Blood Pressure" value={`${latest.bloodPressureSys}/${latest.bloodPressureDia}`} unit="mmHg" color="bg-linear-to-br from-sky-500 to-blue-600" sub="Sys/Dia" />
            <StatCard index={2} icon={Thermometer} label="Temperature" value={latest.temperature} unit="°F" color="bg-linear-to-br from-amber-500 to-orange-500" sub="Normal" />
            <StatCard index={3} icon={Wind} label="O₂ Saturation" value={latest.oxygenSat} unit="%" color="bg-linear-to-br from-emerald-500 to-teal-600" sub="SpO₂" />
          </div>
        </section>        {/* CHARTS */}
        <section style={{ marginTop: '5rem' }}>
          <SectionHeader title="Trends Over Time" subtitle="6-month historical health data" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-7 lg:gap-8">

            {/* Heart Rate */}
            <motion.div {...fadeUp(0.15)} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-5 lg:p-7 min-w-0">
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">Heart Rate</h3>
                    <p className="text-xs text-slate-500">beats per minute</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-white shrink-0">
                  {latest.heartRate}
                  <span className="text-xs font-normal text-slate-400 ml-1">bpm</span>
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={vitals} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="transparent" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="transparent" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 90]} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8', marginBottom: 2 }}
                    itemStyle={{ color: '#f43f5e' }}
                  />
                  <Area type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2} fill="url(#heartGrad)" dot={{ fill: '#f43f5e', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Blood Pressure */}
            <motion.div {...fadeUp(0.2)} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-5 lg:p-7 min-w-0">
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">Blood Pressure</h3>
                    <p className="text-xs text-slate-500">systolic / diastolic</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-white shrink-0">
                  {latest.bloodPressureSys}/{latest.bloodPressureDia}
                  <span className="text-xs font-normal text-slate-400 ml-1">mmHg</span>
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={vitals} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="transparent" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="transparent" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[70, 140]} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8', marginBottom: 2 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 12, fontSize: 11, color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="bloodPressureSys" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} name="Systolic" />
                  <Line type="monotone" dataKey="bloodPressureDia" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} name="Diastolic" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </section>        {/* AI TOOLS */}
        <section style={{ marginTop: '5rem', paddingBottom: '2.5rem' }}>
          <SectionHeader title="AI Tools" subtitle="Powered by Gemini 2.0 Flash — real-time intelligence" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
            {[
              {
                icon: Brain, title: 'AI Medical Assistant',
                desc: 'Have a real-time conversation with your personal AI doctor. Get instant, evidence-based guidance on any health concern.',
                gradient: 'from-sky-500/10 to-indigo-500/10', border: 'border-sky-500/20',
                iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400',
                link: '/chat', linkText: 'Start Chatting', linkColor: 'text-sky-400 hover:text-sky-300'
              },
              {
                icon: Shield, title: 'Symptom Analyzer',
                desc: 'Describe your symptoms in plain language and receive a detailed AI assessment with urgency level and next steps.',
                gradient: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/20',
                iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400',
                link: '/symptoms', linkText: 'Analyze Symptoms', linkColor: 'text-emerald-400 hover:text-emerald-300'
              },
              {
                icon: Zap, title: 'Real-Time Insights',
                desc: 'Track your vitals over time, spot trends early, and get AI-driven alerts before small issues become serious.',
                gradient: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/20',
                iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400',
                link: '/', linkText: 'View Trends', linkColor: 'text-amber-400 hover:text-amber-300'
              }
            ].map(({ icon: Icon, title, desc, gradient, border, iconBg, iconColor, link, linkText, linkColor }, i) => (
              <motion.div
                key={title}
                {...fadeUp(0.1 + i * 0.08)}
                className={`rounded-2xl p-7 lg:p-8 bg-linear-to-br ${gradient} border ${border} hover:scale-[1.02] transition-transform duration-300 flex flex-col min-w-0`}
              >                <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-6 shrink-0`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-6">{desc}</p>
                <Link
                  to={link}
                  className={`flex items-center gap-1.5 text-sm font-medium ${linkColor} transition-colors`}
                >
                  {linkText}
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
