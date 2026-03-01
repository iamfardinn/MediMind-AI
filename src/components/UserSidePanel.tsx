import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  X, MessageSquare, Shield, Crown,
  Pill, Lightbulb, ChevronRight, Activity, History,
  CreditCard, Star, Bot, User, AlertTriangle,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import { useUserPlan } from '../hooks/useUserPlan'

type Tab = 'history' | 'plans' | 'recommendations' | 'medications'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'history',         label: 'Chat History',     icon: History },
  { id: 'plans',           label: 'My Plan',          icon: CreditCard },
  { id: 'recommendations', label: 'AI Insights',      icon: Lightbulb },
  { id: 'medications',     label: 'Medications',      icon: Pill },
]

// ── Extract AI recommendations from assistant messages ──
function extractRecommendations(messages: { role: string; content: string }[]) {
  const aiMsgs = messages.filter(m => m.role === 'assistant')
  const recommendations: string[] = []
  const medications: string[] = []

  for (const msg of aiMsgs) {
    // Extract bullet points that look like recommendations
    const lines = msg.content.split('\n')
    for (const line of lines) {
      const trimmed = line.replace(/^[\s\-*•]+/, '').trim()
      if (!trimmed || trimmed.length < 10) continue

      // Medication-related keywords
      if (/tablet|capsule|mg|dose|medicine|medication|ibuprofen|paracetamol|acetaminophen|aspirin|antibiotic|antacid|omeprazole|metformin|amoxicillin/i.test(trimmed)) {
        if (!medications.includes(trimmed) && medications.length < 8) {
          medications.push(trimmed)
        }
      }
      // Recommendation-related keywords
      if (/recommend|should|try|consider|suggest|avoid|important|ensure|drink|rest|sleep|exercise|consult|visit|doctor/i.test(trimmed)) {
        if (!recommendations.includes(trimmed) && recommendations.length < 8) {
          recommendations.push(trimmed)
        }
      }
    }
  }
  return { recommendations, medications }
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function UserSidePanel({ open, onClose }: Props) {  const { user } = useAuthStore()
  const { messages } = useChatStore()
  const { plan } = useUserPlan()
  const [activeTab, setActiveTab] = useState<Tab>('history')

  if (!user) return null

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? '?'

  const { recommendations, medications } = extractRecommendations(messages)

  // Group conversations by date
  const chatsByDate: Record<string, typeof messages> = {}
  for (const msg of messages) {
    const date = new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    if (!chatsByDate[date]) chatsByDate[date] = []
    chatsByDate[date].push(msg)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 70,
              width: '380px', maxWidth: '90vw',
              background: 'linear-gradient(180deg, #0d1a2d 0%, #0b1221 100%)',
              borderLeft: '1px solid rgba(51,65,85,0.5)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              padding: '1.25rem 1.25rem 1rem',
              borderBottom: '1px solid rgba(51,65,85,0.4)',
              display: 'flex', flexDirection: 'column', gap: '1rem',
            }}>
              {/* Close + title */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>My Dashboard</h2>
                <button
                  onClick={onClose}
                  style={{
                    width: '2rem', height: '2rem', borderRadius: '0.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(51,65,85,0.3)', border: '1px solid rgba(51,65,85,0.4)',
                    color: '#94a3b8', cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>

              {/* User card */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '1rem', borderRadius: '1rem',
                background: 'rgba(14,165,233,0.06)',
                border: '1px solid rgba(14,165,233,0.15)',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      style={{
                        width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover',
                        boxShadow: '0 0 0 2px rgba(14,165,233,0.4)',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '3rem', height: '3rem', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      fontSize: '0.875rem', fontWeight: 700, color: '#fff',
                    }}>
                      {initials}
                    </div>
                  )}
                  <span style={{
                    position: 'absolute', bottom: '-2px', right: '-2px',
                    width: '0.75rem', height: '0.75rem', borderRadius: '50%',
                    background: '#34d399', border: '2px solid #0d1a2d',
                  }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>
                    {user.displayName ?? 'MediMind User'}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{user.email}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem' }}>                    <Shield style={{ width: '0.7rem', height: '0.7rem', color: plan.planId === 'premium' ? '#f59e0b' : '#0ea5e9' }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: plan.planId === 'premium' ? '#fbbf24' : '#38bdf8' }}>
                      {plan.planId === 'free' ? 'Free Plan' : plan.planId === 'premium' ? 'Premium Plan' : 'Standard Plan'}
                    </span>
                  </div>
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem',
                  padding: '0.5rem', borderRadius: '0.625rem',
                  background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)',
                }}>
                  <MessageSquare style={{ width: '0.875rem', height: '0.875rem', color: '#38bdf8' }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#38bdf8' }}>{messages.length}</span>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    style={{
                      flex: 1, padding: '0.5rem 0.25rem', borderRadius: '0.625rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                      fontSize: '0.6rem', fontWeight: 600, cursor: 'pointer',
                      border: 'none',
                      background: activeTab === id ? 'rgba(14,165,233,0.12)' : 'transparent',
                      color: activeTab === id ? '#38bdf8' : '#475569',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon style={{ width: '0.875rem', height: '0.875rem' }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Content ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* ── Chat History Tab ── */}
                  {activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {messages.length === 0 ? (
                        <EmptyState icon={MessageSquare} title="No conversations yet" subtitle="Start chatting with MediMind AI" link="/chat" linkText="Start Chat" />
                      ) : (
                        Object.entries(chatsByDate).reverse().map(([date, msgs]) => (
                          <div key={date}>
                            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                              {date}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                              {msgs.slice(-6).map((msg) => (
                                <div
                                  key={msg.id}
                                  style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                                    padding: '0.625rem', borderRadius: '0.75rem',
                                    background: msg.role === 'user' ? 'rgba(99,102,241,0.06)' : 'rgba(14,165,233,0.06)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.12)' : 'rgba(14,165,233,0.12)'}`,
                                  }}
                                >
                                  <div style={{
                                    width: '1.25rem', height: '1.25rem', borderRadius: '50%', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: msg.role === 'user'
                                      ? 'linear-gradient(135deg,#6366f1,#9333ea)'
                                      : 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
                                    marginTop: '1px',
                                  }}>
                                    {msg.role === 'user'
                                      ? <User style={{ width: '0.6rem', height: '0.6rem', color: '#fff' }} />
                                      : <Bot style={{ width: '0.6rem', height: '0.6rem', color: '#fff' }} />
                                    }
                                  </div>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{
                                      fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5,
                                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}>
                                      {msg.content}
                                    </p>
                                    <p style={{ fontSize: '0.6rem', color: '#334155', marginTop: '0.25rem' }}>
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                      {messages.length > 0 && (
                        <Link
                          to="/chat"
                          onClick={onClose}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.78rem', fontWeight: 600,
                            color: '#38bdf8', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)',
                            textDecoration: 'none', transition: 'all 0.15s',
                          }}
                        >
                          <MessageSquare style={{ width: '0.8rem', height: '0.8rem' }} />
                          Continue Chat
                          <ChevronRight style={{ width: '0.7rem', height: '0.7rem' }} />
                        </Link>
                      )}
                    </div>
                  )}                  {/* ── Plans Tab ── */}
                  {activeTab === 'plans' && (() => {
                    const planLabel = plan.planId === 'premium' ? 'Premium Plan' : plan.planId === 'standard' ? 'Standard Plan' : 'Free Plan'
                    const planColor = plan.planId === 'premium' ? '#f59e0b' : plan.planId === 'standard' ? '#0ea5e9' : '#64748b'
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Active Plan */}
                      <div style={{
                        borderRadius: '1rem', overflow: 'hidden',
                        border: `1px solid ${planColor}40`,
                        boxShadow: `0 0 30px ${planColor}14`,
                      }}>
                        <div style={{ height: '3px', background: gradientBar }} />
                        <div style={{ padding: '1.25rem', background: `${planColor}08` }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <div style={{
                                width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                                background: `${planColor}25`, border: `1px solid ${planColor}50`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {plan.planId === 'premium'
                                  ? <Crown style={{ width: '1rem', height: '1rem', color: planColor }} />
                                  : <Shield style={{ width: '1rem', height: '1rem', color: planColor }} />}
                              </div>
                              <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{planLabel}</p>
                                <p style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'capitalize' }}>{plan.billing} billing</p>
                              </div>
                            </div>
                            <span style={{
                              fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: '999px',
                              background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)',
                              textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                              Active
                            </span>
                          </div>                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{priceDisplay}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '3px' }}>{billingLabel}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            {features.map(f => (
                              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Star style={{ width: '0.65rem', height: '0.65rem', color: planColor }} />
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>                      {/* Upgrade CTA — only show if not premium */}
                      {plan.planId !== 'premium' && (
                      <Link
                        to="/pricing"
                        onClick={onClose}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          padding: '0.875rem', borderRadius: '0.875rem', fontSize: '0.82rem', fontWeight: 700,
                          color: '#fff', background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                          textDecoration: 'none', boxShadow: '0 8px 24px rgba(245,158,11,0.25)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Crown style={{ width: '0.9rem', height: '0.9rem' }} />
                        {plan.planId === 'free' ? 'Upgrade Now' : 'Upgrade to Premium'}
                        <ChevronRight style={{ width: '0.75rem', height: '0.75rem' }} />
                      </Link>
                      )}

                      {/* Quick stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                        {[
                          { label: 'AI Messages', value: String(messages.length), icon: MessageSquare, color: '#0ea5e9' },
                          { label: 'Days Active', value: '7', icon: Activity, color: '#10b981' },
                          { label: 'Analyses', value: String(Math.floor(messages.filter(m => m.role === 'assistant').length / 2)), icon: AlertTriangle, color: '#f59e0b' },
                          { label: 'Plan Status', value: 'Active', icon: Shield, color: '#6366f1' },
                        ].map(({ label, value, icon: Icon, color }) => (
                          <div key={label} style={{
                            padding: '0.75rem', borderRadius: '0.75rem',
                            background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.3)',
                            display: 'flex', flexDirection: 'column', gap: '0.375rem',
                          }}>
                            <Icon style={{ width: '0.875rem', height: '0.875rem', color }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{value}</p>
                            <p style={{ fontSize: '0.62rem', color: '#475569' }}>{label}</p>
                          </div>
                        ))}                      </div>
                    </div>
                  )})()}

                  {/* ── Recommendations Tab ── */}
                  {activeTab === 'recommendations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {recommendations.length === 0 ? (
                        <EmptyState icon={Lightbulb} title="No insights yet" subtitle="Chat with AI to get personalized health recommendations" link="/chat" linkText="Ask AI" />
                      ) : (
                        recommendations.map((rec, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            style={{
                              padding: '0.75rem', borderRadius: '0.75rem',
                              background: 'rgba(16,185,129,0.04)',
                              border: '1px solid rgba(16,185,129,0.12)',
                              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                            }}
                          >
                            <Lightbulb style={{ width: '0.875rem', height: '0.875rem', color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.55 }}>{rec}</p>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ── Medications Tab ── */}
                  {activeTab === 'medications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {medications.length === 0 ? (
                        <EmptyState icon={Pill} title="No medication info" subtitle="AI will suggest medications based on your symptom discussions" link="/symptoms" linkText="Analyze Symptoms" />
                      ) : (
                        <>
                          <div style={{
                            padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '0.25rem',
                            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                          }}>
                            <AlertTriangle style={{ width: '0.8rem', height: '0.8rem', color: '#fbbf24', flexShrink: 0, marginTop: '1px' }} />
                            <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.5 }}>
                              <span style={{ color: '#fbbf24', fontWeight: 600 }}>Disclaimer:</span> AI-suggested medications are for reference only. Always consult a doctor before taking any medication.
                            </p>
                          </div>
                          {medications.map((med, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                              style={{
                                padding: '0.75rem', borderRadius: '0.75rem',
                                background: 'rgba(99,102,241,0.04)',
                                border: '1px solid rgba(99,102,241,0.12)',
                                display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                              }}
                            >
                              <Pill style={{ width: '0.875rem', height: '0.875rem', color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
                              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.55 }}>{med}</p>
                            </motion.div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div style={{
              padding: '0.875rem 1.25rem',
              borderTop: '1px solid rgba(51,65,85,0.4)',
              display: 'flex', gap: '0.5rem',
            }}>
              <Link
                to="/chat"
                onClick={onClose}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                  padding: '0.625rem', borderRadius: '0.625rem', fontSize: '0.75rem', fontWeight: 600,
                  color: '#fff', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
              >
                <MessageSquare style={{ width: '0.75rem', height: '0.75rem' }} />
                AI Chat
              </Link>
              <Link
                to="/symptoms"
                onClick={onClose}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                  padding: '0.625rem', borderRadius: '0.625rem', fontSize: '0.75rem', fontWeight: 600,
                  color: '#cbd5e1', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
              >
                <Activity style={{ width: '0.75rem', height: '0.75rem' }} />
                Symptoms
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Reusable empty state ──
function EmptyState({ icon: Icon, title, subtitle, link, linkText }: {
  icon: React.ElementType; title: string; subtitle: string; link: string; linkText: string
}) {
  return (
    <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
      <div style={{
        width: '3.5rem', height: '3.5rem', borderRadius: '1rem', margin: '0 auto 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)',
      }}>
        <Icon style={{ width: '1.5rem', height: '1.5rem', color: '#475569' }} />
      </div>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '0.375rem' }}>{title}</p>
      <p style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '1.25rem', lineHeight: 1.5 }}>{subtitle}</p>
      <Link
        to={link}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.5rem 1rem', borderRadius: '0.625rem', fontSize: '0.75rem', fontWeight: 600,
          color: '#38bdf8', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.18)',
          textDecoration: 'none',
        }}
      >
        {linkText}
        <ChevronRight style={{ width: '0.7rem', height: '0.7rem' }} />
      </Link>
    </div>
  )
}
