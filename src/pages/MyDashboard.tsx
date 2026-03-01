import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, Navigate } from 'react-router-dom'
import {
  MessageSquare, Shield, Crown, Pill, Lightbulb, ChevronRight,
  Activity, History, CreditCard, Star, Bot, User, AlertTriangle,
  Calendar, Clock, Sparkles, ArrowUpRight, TrendingUp, Hash,
  Fingerprint, Mail, BadgeCheck,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import { useUserPlan } from '../hooks/useUserPlan'

type Tab = 'overview' | 'history' | 'plans' | 'insights' | 'medications'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Overview',       icon: Activity },
  { id: 'history',     label: 'Chat History',   icon: History },
  { id: 'plans',       label: 'My Plan',        icon: CreditCard },
  { id: 'insights',    label: 'AI Insights',    icon: Lightbulb },
  { id: 'medications', label: 'Medications',    icon: Pill },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
})

// ── Extract AI recommendations from assistant messages ──
function extractRecommendations(messages: { role: string; content: string }[]) {
  const aiMsgs = messages.filter(m => m.role === 'assistant')
  const recommendations: string[] = []
  const medications: string[] = []
  for (const msg of aiMsgs) {
    for (const line of msg.content.split('\n')) {
      const trimmed = line.replace(/^[\s\-*•]+/, '').trim()
      if (!trimmed || trimmed.length < 10) continue
      if (/tablet|capsule|mg|dose|medicine|medication|ibuprofen|paracetamol|acetaminophen|aspirin|antibiotic|antacid|omeprazole|metformin|amoxicillin/i.test(trimmed)) {
        if (!medications.includes(trimmed) && medications.length < 12) medications.push(trimmed)
      }
      if (/recommend|should|try|consider|suggest|avoid|important|ensure|drink|rest|sleep|exercise|consult|visit|doctor/i.test(trimmed)) {
        if (!recommendations.includes(trimmed) && recommendations.length < 12) recommendations.push(trimmed)
      }
    }
  }
  return { recommendations, medications }
}

export default function MyDashboard() {
  const { user } = useAuthStore()
  const { messages } = useChatStore()
  const { plan } = useUserPlan()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [mountTime] = useState(() => Date.now())

  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/login" replace />

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? '?'

  const { recommendations, medications } = extractRecommendations(messages)

  const chatsByDate: Record<string, typeof messages> = {}
  for (const msg of messages) {
    const date = new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    if (!chatsByDate[date]) chatsByDate[date] = []
    chatsByDate[date].push(msg)
  }

  const planLabel = plan.planId === 'premium' ? 'Premium' : plan.planId === 'standard' ? 'Standard' : 'Free'
  const planColor = plan.planId === 'premium' ? '#f59e0b' : plan.planId === 'standard' ? '#0ea5e9' : '#64748b'
  const assistantMsgs = messages.filter(m => m.role === 'assistant').length
  const userMsgs = messages.filter(m => m.role === 'user').length  // Compute days since account creation
  const daysActive = (() => {
    if (!user.createdAt) return 1
    const created = new Date(user.createdAt).getTime()
    return Math.max(1, Math.ceil((mountTime - created) / (1000 * 60 * 60 * 24)))
  })()

  return (
    <div style={{ minHeight: '100vh', background: '#0b1221' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '-12rem', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(14,165,233,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, borderRadius: '50%' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

        {/* ── Header: User Profile Card ── */}
        <motion.div {...fadeUp(0)} style={{
          display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
          padding: '2rem', borderRadius: '1.5rem', marginBottom: '2rem',
          background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)',
          border: '1px solid rgba(51,65,85,0.5)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" style={{
                width: '5rem', height: '5rem', borderRadius: '50%', objectFit: 'cover',
                boxShadow: `0 0 0 3px ${planColor}66, 0 0 24px ${planColor}22`,
              }} />
            ) : (
              <div style={{
                width: '5rem', height: '5rem', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                boxShadow: `0 0 0 3px ${planColor}66, 0 0 24px ${planColor}22`,
              }}>
                {initials}
              </div>
            )}
            <span style={{
              position: 'absolute', bottom: '0', right: '0',
              width: '1rem', height: '1rem', borderRadius: '50%',
              background: '#34d399', border: '3px solid #131f35',
            }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                {user.displayName ?? 'MediMind User'}
              </h1>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                background: `${planColor}18`, border: `1px solid ${planColor}40`, color: planColor,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {planLabel} Plan
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Mail style={{ width: '0.8rem', height: '0.8rem', color: '#64748b' }} />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Fingerprint style={{ width: '0.8rem', height: '0.8rem', color: '#64748b' }} />
                <span style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace' }}>{user.uid.slice(0, 12)}…</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <BadgeCheck style={{ width: '0.8rem', height: '0.8rem', color: '#34d399' }} />
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>Verified</span>
              </div>
            </div>
          </div>

          {/* Quick stats badges */}
          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
            {[
              { icon: MessageSquare, value: String(messages.length), label: 'Chats', color: '#0ea5e9' },
              { icon: Lightbulb,     value: String(recommendations.length), label: 'Insights', color: '#10b981' },
              { icon: Pill,          value: String(medications.length), label: 'Meds', color: '#8b5cf6' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                padding: '0.75rem 1rem', borderRadius: '1rem',
                background: `${color}0a`, border: `1px solid ${color}20`,
                minWidth: '4.5rem',
              }}>
                <Icon style={{ width: '1rem', height: '1rem', color }} />
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Tab Navigation ── */}
        <motion.div {...fadeUp(0.08)} style={{
          display: 'flex', gap: '0.375rem', marginBottom: '2rem',
          padding: '0.375rem', borderRadius: '1rem',
          background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.4)',
          overflowX: 'auto',
        }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 1.1rem', borderRadius: '0.75rem',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                border: 'none', whiteSpace: 'nowrap',
                background: activeTab === id ? 'rgba(14,165,233,0.12)' : 'transparent',
                color: activeTab === id ? '#38bdf8' : '#64748b',
                transition: 'all 0.15s',
              } as React.CSSProperties}
            >
              <Icon style={{ width: '0.9rem', height: '0.9rem' }} />
              {label}
            </button>
          ))}
        </motion.div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* ═══ Overview ═══ */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    { icon: MessageSquare, label: 'Total Messages',   value: String(messages.length), sub: 'All time',       color: '#0ea5e9', gradFrom: '#0ea5e9', gradTo: '#6366f1' },
                    { icon: Bot,           label: 'AI Responses',     value: String(assistantMsgs),     sub: 'Analyzed',       color: '#10b981', gradFrom: '#10b981', gradTo: '#14b8a6' },
                    { icon: User,          label: 'Your Questions',   value: String(userMsgs),          sub: 'Sent',           color: '#8b5cf6', gradFrom: '#8b5cf6', gradTo: '#a855f7' },
                    { icon: Lightbulb,     label: 'AI Insights',      value: String(recommendations.length), sub: 'Extracted', color: '#f59e0b', gradFrom: '#f59e0b', gradTo: '#f97316' },
                    { icon: Pill,          label: 'Medications Found', value: String(medications.length), sub: 'Referenced',   color: '#f43f5e', gradFrom: '#f43f5e', gradTo: '#ec4899' },
                    { icon: Calendar,      label: 'Days Active',      value: String(daysActive),        sub: 'Since signup',   color: '#06b6d4', gradFrom: '#06b6d4', gradTo: '#0ea5e9' },
                  ].map(({ icon: Icon, label, value, sub, color, gradFrom, gradTo }, i) => (
                    <motion.div key={label} {...fadeUp(i * 0.05)} style={{
                      padding: '1.25rem', borderRadius: '1.25rem', position: 'relative', overflow: 'hidden',
                      background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)',
                      border: `1px solid ${color}25`,
                    }}>
                      <div style={{
                        position: 'absolute', top: '-1.5rem', right: '-1.5rem',
                        width: '6rem', height: '6rem', borderRadius: '50%',
                        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
                        pointerEvents: 'none',
                      }} />
                      <div style={{
                        width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', marginBottom: '1rem',
                        background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 14px ${color}44`,
                      }}>
                        <Icon style={{ width: '1rem', height: '1rem', color: '#fff' }} />
                      </div>
                      <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1, marginBottom: '0.25rem' }}>{value}</p>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.125rem' }}>{label}</p>
                      <p style={{ fontSize: '0.65rem', color: '#475569' }}>{sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <motion.div {...fadeUp(0.3)} style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem',
                }}>
                  {[
                    { to: '/chat',     icon: MessageSquare, label: 'Continue AI Chat',   desc: 'Ask health questions',       gradFrom: '#0ea5e9', gradTo: '#6366f1' },
                    { to: '/symptoms', icon: Activity,      label: 'Analyze Symptoms',   desc: 'Check your symptoms',        gradFrom: '#10b981', gradTo: '#14b8a6' },
                    { to: '/pricing',  icon: Crown,         label: 'Upgrade Plan',        desc: 'Unlock premium features',    gradFrom: '#f59e0b', gradTo: '#ef4444' },
                  ].map(({ to, icon: Icon, label, desc, gradFrom, gradTo }) => (
                    <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          padding: '1.25rem', borderRadius: '1.25rem', cursor: 'pointer',
                          background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)',
                          border: '1px solid rgba(51,65,85,0.4)',
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <div style={{
                          width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem', flexShrink: 0,
                          background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: `0 0 16px ${gradFrom}44`,
                        }}>
                          <Icon style={{ width: '1.1rem', height: '1.1rem', color: '#fff' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.125rem' }}>{label}</p>
                          <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{desc}</p>
                        </div>
                        <ArrowUpRight style={{ width: '1rem', height: '1rem', color: '#475569', flexShrink: 0 }} />
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>

                {/* Recent Activity */}
                {messages.length > 0 && (
                  <motion.div {...fadeUp(0.35)} style={{
                    padding: '1.5rem', borderRadius: '1.25rem',
                    background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)',
                    border: '1px solid rgba(51,65,85,0.4)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Clock style={{ width: '1rem', height: '1rem', color: '#0ea5e9' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Recent Activity</h3>
                      </div>
                      <Link to="/chat" style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        View All <ChevronRight style={{ width: '0.7rem', height: '0.7rem' }} />
                      </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {messages.slice(-5).reverse().map(msg => (
                        <div key={msg.id} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                          padding: '0.875rem', borderRadius: '0.875rem',
                          background: msg.role === 'user' ? 'rgba(99,102,241,0.05)' : 'rgba(14,165,233,0.05)',
                          border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.1)' : 'rgba(14,165,233,0.1)'}`,
                        }}>
                          <div style={{
                            width: '1.75rem', height: '1.75rem', borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: msg.role === 'user' ? 'linear-gradient(135deg,#6366f1,#9333ea)' : 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
                          }}>
                            {msg.role === 'user'
                              ? <User style={{ width: '0.75rem', height: '0.75rem', color: '#fff' }} />
                              : <Bot style={{ width: '0.75rem', height: '0.75rem', color: '#fff' }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.55,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>{msg.content}</p>
                            <p style={{ fontSize: '0.65rem', color: '#334155', marginTop: '0.375rem' }}>
                              {new Date(msg.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ═══ Chat History ═══ */}
            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {messages.length === 0 ? (
                  <EmptyState icon={MessageSquare} title="No conversations yet" subtitle="Start chatting with MediMind AI to see your history here" link="/chat" linkText="Start Chat" />
                ) : (
                  <>
                    {/* Summary bar */}
                    <div style={{
                      display: 'flex', gap: '1rem', flexWrap: 'wrap',
                      padding: '1rem 1.25rem', borderRadius: '1rem',
                      background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.12)',
                    }}>
                      {[
                        { icon: Hash, label: 'Total', value: messages.length },
                        { icon: User, label: 'You', value: userMsgs },
                        { icon: Bot,  label: 'AI',  value: assistantMsgs },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Icon style={{ width: '0.8rem', height: '0.8rem', color: '#38bdf8' }} />
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{label}:</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Messages grouped by date */}
                    {Object.entries(chatsByDate).reverse().map(([date, msgs]) => (
                      <div key={date}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{date}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {msgs.map(msg => (
                            <div key={msg.id} style={{
                              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                              padding: '1rem', borderRadius: '1rem',
                              background: msg.role === 'user' ? 'rgba(99,102,241,0.04)' : 'rgba(14,165,233,0.04)',
                              border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.1)' : 'rgba(14,165,233,0.1)'}`,
                            }}>
                              <div style={{
                                width: '1.75rem', height: '1.75rem', borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: msg.role === 'user' ? 'linear-gradient(135deg,#6366f1,#9333ea)' : 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
                              }}>
                                {msg.role === 'user'
                                  ? <User style={{ width: '0.75rem', height: '0.75rem', color: '#fff' }} />
                                  : <Bot style={{ width: '0.75rem', height: '0.75rem', color: '#fff' }} />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>{msg.content}</p>
                                <p style={{ fontSize: '0.62rem', color: '#334155', marginTop: '0.375rem' }}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <Link to="/chat" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '1rem', borderRadius: '1rem', fontSize: '0.88rem', fontWeight: 700,
                      color: '#fff', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      textDecoration: 'none', boxShadow: '0 8px 24px rgba(14,165,233,0.25)',
                    }}>
                      <MessageSquare style={{ width: '0.9rem', height: '0.9rem' }} />
                      Continue Chat
                      <ChevronRight style={{ width: '0.8rem', height: '0.8rem' }} />
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* ═══ My Plan ═══ */}
            {activeTab === 'plans' && (() => {
              const priceDisplay = plan.planId === 'premium'
                ? (plan.billing === 'yearly' ? '$180' : '$19')
                : plan.planId === 'standard'
                  ? (plan.billing === 'yearly' ? '$84' : '$9')
                  : '$0'
              const billingLabel = plan.planId === 'free' ? 'forever' : plan.billing === 'yearly' ? '/year' : '/month'
              const features = plan.planId === 'premium'
                ? ['Unlimited AI Chat', 'Priority AI Response', 'Detailed Health Reports', 'Export Data', '24/7 Priority Support']
                : plan.planId === 'standard'
                  ? ['Unlimited AI Chat', 'Symptom Analyzer', 'Health Dashboard', 'Email Support']
                  : ['5 AI Chats/day', 'Basic Symptom Check', 'View Dashboard']
              const gradientBar = plan.planId === 'premium'
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                : 'linear-gradient(90deg, #0ea5e9, #6366f1)'
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                  {/* Plan Card */}
                  <div style={{
                    borderRadius: '1.5rem', overflow: 'hidden',
                    border: `1px solid ${planColor}35`,
                    boxShadow: `0 0 40px ${planColor}10`,
                  }}>
                    <div style={{ height: '4px', background: gradientBar }} />
                    <div style={{ padding: '2rem', background: `${planColor}06` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <div style={{
                            width: '3rem', height: '3rem', borderRadius: '0.875rem',
                            background: `${planColor}20`, border: `1px solid ${planColor}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {plan.planId === 'premium'
                              ? <Crown style={{ width: '1.25rem', height: '1.25rem', color: planColor }} />
                              : <Shield style={{ width: '1.25rem', height: '1.25rem', color: planColor }} />}
                          </div>
                          <div>
                            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>{planLabel} Plan</p>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'capitalize' }}>{plan.billing} billing</p>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, padding: '4px 12px', borderRadius: '999px',
                          background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>Active</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.375rem', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{priceDisplay}</span>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '5px' }}>{billingLabel}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {features.map(f => (
                          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <Star style={{ width: '0.8rem', height: '0.8rem', color: planColor }} />
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{f}</span>
                          </div>
                        ))}
                      </div>

                      {plan.planId !== 'premium' && (
                        <Link to="/pricing" style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          marginTop: '1.75rem', padding: '1rem', borderRadius: '1rem',
                          fontSize: '0.9rem', fontWeight: 700, color: '#fff',
                          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                          textDecoration: 'none', boxShadow: '0 8px 24px rgba(245,158,11,0.25)',
                        }}>
                          <Crown style={{ width: '1rem', height: '1rem' }} />
                          {plan.planId === 'free' ? 'Upgrade Now' : 'Upgrade to Premium'}
                          <ChevronRight style={{ width: '0.8rem', height: '0.8rem' }} />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[
                      { label: 'AI Messages',  value: String(messages.length), icon: MessageSquare, color: '#0ea5e9' },
                      { label: 'Days Active',   value: String(daysActive),          icon: Calendar,      color: '#10b981' },
                      { label: 'Analyses',       value: String(Math.floor(assistantMsgs / 2)), icon: TrendingUp, color: '#f59e0b' },
                      { label: 'Plan Status',   value: 'Active',                icon: Shield,        color: '#6366f1' },
                      { label: 'AI Insights',   value: String(recommendations.length), icon: Sparkles, color: '#ec4899' },
                      { label: 'Medications',   value: String(medications.length), icon: Pill,       color: '#8b5cf6' },
                    ].map(({ label, value, icon: Icon, color }, i) => (
                      <motion.div key={label} {...fadeUp(i * 0.04)} style={{
                        padding: '1.25rem', borderRadius: '1rem',
                        background: 'linear-gradient(160deg, #131f35, #0f172a)',
                        border: `1px solid ${color}20`,
                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                      }}>
                        <Icon style={{ width: '1rem', height: '1rem', color }} />
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{value}</p>
                        <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* ═══ AI Insights ═══ */}
            {activeTab === 'insights' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {recommendations.length === 0 ? (
                  <EmptyState icon={Lightbulb} title="No insights yet" subtitle="Chat with MediMind AI to get personalized health recommendations" link="/chat" linkText="Ask AI" />
                ) : (
                  <>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '1rem 1.25rem', borderRadius: '1rem',
                      background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)',
                      marginBottom: '0.25rem',
                    }}>
                      <Sparkles style={{ width: '1rem', height: '1rem', color: '#34d399' }} />
                      <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>{recommendations.length}</span> personalized insights extracted from your AI conversations
                      </p>
                    </div>
                    {recommendations.map((rec, i) => (
                      <motion.div key={i} {...fadeUp(i * 0.03)} style={{
                        padding: '1rem 1.25rem', borderRadius: '1rem',
                        background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.1)',
                        display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                      }}>
                        <Lightbulb style={{ width: '1rem', height: '1rem', color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>{rec}</p>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ═══ Medications ═══ */}
            {activeTab === 'medications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {medications.length === 0 ? (
                  <EmptyState icon={Pill} title="No medication info" subtitle="AI will reference medications based on your symptom discussions" link="/symptoms" linkText="Analyze Symptoms" />
                ) : (
                  <>
                    <div style={{
                      padding: '1rem 1.25rem', borderRadius: '1rem',
                      background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    }}>
                      <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#fbbf24', flexShrink: 0, marginTop: '1px' }} />
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.55 }}>
                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>Disclaimer:</span> AI-referenced medications are for informational purposes only. Always consult a healthcare professional before taking any medication.
                      </p>
                    </div>
                    {medications.map((med, i) => (
                      <motion.div key={i} {...fadeUp(i * 0.03)} style={{
                        padding: '1rem 1.25rem', borderRadius: '1rem',
                        background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.1)',
                        display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                      }}>
                        <Pill style={{ width: '1rem', height: '1rem', color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>{med}</p>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Reusable empty state ──
function EmptyState({ icon: Icon, title, subtitle, link, linkText }: {
  icon: React.ElementType; title: string; subtitle: string; link: string; linkText: string
}) {
  return (
    <div style={{
      textAlign: 'center', padding: '4rem 2rem', borderRadius: '1.5rem',
      background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)',
      border: '1px solid rgba(51,65,85,0.4)',
    }}>
      <div style={{
        width: '4.5rem', height: '4.5rem', borderRadius: '1.25rem', margin: '0 auto 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)',
      }}>
        <Icon style={{ width: '2rem', height: '2rem', color: '#475569' }} />
      </div>
      <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>{title}</p>
      <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.5, maxWidth: '320px', margin: '0 auto 1.5rem' }}>{subtitle}</p>
      <Link to={link} style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.75rem 1.5rem', borderRadius: '0.875rem', fontSize: '0.85rem', fontWeight: 600,
        color: '#38bdf8', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.18)',
        textDecoration: 'none',
      }}>
        {linkText}
        <ChevronRight style={{ width: '0.8rem', height: '0.8rem' }} />
      </Link>
    </div>
  )
}
