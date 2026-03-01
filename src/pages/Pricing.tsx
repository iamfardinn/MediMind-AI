import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Check, Minus, Zap, Shield, Crown,
  Brain, Activity, MessageSquare, Sparkles, ArrowRight, Star,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

type Billing = 'monthly' | 'yearly'

const FEATURES = [
  { category: 'Core',     label: 'AI Health Chat'           },
  { category: 'Core',     label: 'Health Dashboard'         },
  { category: 'Core',     label: 'Health Tips Feed'         },
  { category: 'AI Tools', label: 'Symptom Analyzer'         },
  { category: 'AI Tools', label: 'Unlimited AI Messages'    },
  { category: 'AI Tools', label: 'Priority AI Response'     },
  { category: 'Reports',  label: 'Detailed Health Reports'  },
  { category: 'Reports',  label: 'Data Export (PDF/CSV)'    },
  { category: 'Support',  label: 'Email Support'            },
  { category: 'Support',  label: 'Dedicated Support'        },
]

type PlanValue = true | false | string
interface PlanDef {
  id:           string
  name:         string
  icon:         React.ElementType
  accent:       string
  glow:         string
  monthly:      number
  yearly:       number
  description:  string
  cta:          string
  highlight:    boolean
  badge?:       string
  values:       PlanValue[]
}

const PLANS: PlanDef[] = [
  {
    id: 'free', name: 'Free', icon: Zap,
    accent: '#64748b', glow: 'rgba(100,116,139,0.18)',
    monthly: 0, yearly: 0,
    description: 'Get started at no cost',
    cta: 'Start for Free',
    highlight: false,
    values: [
      '20 msgs / day', true, true,
      false, false, false,
      false, false, false, false,
    ],
  },
  {
    id: 'standard', name: 'Standard', icon: Shield,
    accent: '#0ea5e9', glow: 'rgba(14,165,233,0.22)',
    monthly: 9, yearly: 7,
    description: 'Best for regular health tracking',
    cta: 'Start Standard',
    highlight: true, badge: 'Most Popular',
    values: [
      'Unlimited', true, true,
      true, true, false,
      false, false, true, false,
    ],
  },
  {
    id: 'premium', name: 'Premium', icon: Crown,
    accent: '#f59e0b', glow: 'rgba(245,158,11,0.22)',
    monthly: 19, yearly: 15,
    description: 'Full power, full insights',
    cta: 'Go Premium',
    highlight: false, badge: 'Best Value',
    values: [
      'Unlimited', true, true,
      true, true, true,
      true, true, true, true,
    ],
  },
]

const STATS = [
  { icon: Brain,         value: '50K+',  label: 'Active Users'      },
  { icon: Activity,      value: '2M+',   label: 'Symptoms Analyzed' },
  { icon: MessageSquare, value: '10M+',  label: 'AI Chats'          },
  { icon: Star,          value: '4.9★',  label: 'User Rating'       },
]

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly')
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen w-full" style={{ background: '#0b1221' }}>

      {/* ── Background decoration ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '600px', background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div className="relative z-10" style={{ maxWidth: '1080px', margin: '0 auto', padding: '5rem 1.5rem 8rem' }}>

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.2)',
              color: '#38bdf8',
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </motion.div>

          <h1 className="text-white font-bold" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Plans that grow{' '}
            <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              with you
            </span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Start free, upgrade when ready. No hidden fees, cancel anytime.
          </p>

          {/* ── Billing toggle ── */}
          <div className="inline-flex items-center rounded-2xl p-1"
               style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.5)', gap: 0 }}>
            {(['monthly', 'yearly'] as Billing[]).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  position: 'relative', padding: '0.6rem 1.4rem',
                  borderRadius: '0.875rem', fontSize: '0.875rem', fontWeight: 600,
                  transition: 'all 0.2s', cursor: 'pointer', border: 'none',
                  background: billing === b ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'transparent',
                  color: billing === b ? '#fff' : '#64748b',
                  boxShadow: billing === b ? '0 4px 16px rgba(14,165,233,0.3)' : 'none',
                }}
              >
                {b === 'monthly' ? 'Monthly' : 'Yearly'}
                {b === 'yearly' && (
                  <span style={{
                    marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: 700,
                    background: billing === 'yearly' ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.15)',
                    border: billing === 'yearly' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(16,185,129,0.3)',
                    color: billing === 'yearly' ? '#fff' : '#34d399',
                    padding: '1px 6px', borderRadius: '999px',
                  }}>
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Plan Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '5rem', alignItems: 'stretch' }}>
          {PLANS.map((plan, i) => {
            const Icon   = plan.icon
            const price  = billing === 'monthly' ? plan.monthly : plan.yearly
            const saving = plan.monthly > 0 ? (plan.monthly - plan.yearly) * 12 : 0

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ y: -8, transition: { duration: 0.22 } }}                style={{
                  position: 'relative',
                  borderRadius: '1.75rem',
                  padding: '0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  background: plan.highlight
                    ? 'linear-gradient(160deg, #0d1f38 0%, #0b1525 100%)'
                    : 'linear-gradient(160deg, #111d2e 0%, #0b1221 100%)',
                  border: plan.highlight
                    ? `1px solid rgba(14,165,233,0.35)`
                    : `1px solid rgba(51,65,85,0.35)`,
                  boxShadow: plan.highlight
                    ? '0 0 60px rgba(14,165,233,0.12), 0 20px 60px rgba(0,0,0,0.4)'
                    : '0 8px 40px rgba(0,0,0,0.3)',
                }}
              >
                {/* Top accent line */}
                <div style={{
                  height: '3px',
                  background: plan.id === 'free'
                    ? 'rgba(100,116,139,0.4)'
                    : plan.id === 'standard'
                    ? 'linear-gradient(90deg, #0ea5e9, #6366f1)'
                    : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                }} />                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Badge row — always reserve space so cards align */}
                  <div style={{ height: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                    {plan.badge && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                        textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px',
                        background: plan.id === 'standard' ? 'rgba(14,165,233,0.12)' : 'rgba(245,158,11,0.12)',
                        border: `1px solid ${plan.id === 'standard' ? 'rgba(14,165,233,0.35)' : 'rgba(245,158,11,0.35)'}`,
                        color: plan.id === 'standard' ? '#38bdf8' : '#fbbf24',
                      }}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Icon + Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: plan.glow,
                      border: `1px solid ${plan.accent}33`,
                      boxShadow: `0 0 24px ${plan.glow}`,
                    }}>
                      <Icon style={{ width: '1.2rem', height: '1.2rem', color: plan.accent }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>{plan.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={price}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          style={{ fontSize: '3rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}
                        >
                          ${price}
                        </motion.span>
                      </AnimatePresence>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
                        {plan.monthly === 0 ? '/ forever' : '/ month'}
                      </span>
                    </div>
                    {billing === 'yearly' && saving > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}
                      >
                        You save ${saving}/year
                      </motion.p>
                    )}
                    {billing === 'yearly' && plan.monthly > 0 && (
                      <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px', textDecoration: 'line-through' }}>
                        ${plan.monthly}/mo billed monthly
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    to={user ? '#' : '/login'}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      width: '100%', padding: '0.875rem 1rem', borderRadius: '0.875rem',
                      fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.75rem',
                      textDecoration: 'none', transition: 'all 0.2s',
                      ...(plan.id === 'standard'
                        ? { background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', boxShadow: '0 8px 24px rgba(14,165,233,0.35)' }
                        : plan.id === 'premium'
                        ? { background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }
                        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }
                      ),
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.filter = 'brightness(1.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.filter = 'brightness(1)' }}
                  >
                    {plan.cta}
                    <ArrowRight style={{ width: '0.9rem', height: '0.9rem' }} />
                  </Link>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'rgba(51,65,85,0.4)', marginBottom: '1.5rem' }} />                  {/* Features */}
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: 'auto' }}>
                    {FEATURES.map(({ label }, fi) => {
                      const val = plan.values[fi]
                      return (
                        <li key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            width: '1.375rem', height: '1.375rem', borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: val ? plan.glow : 'rgba(51,65,85,0.2)',
                            border: `1px solid ${val ? plan.accent + '55' : 'rgba(51,65,85,0.3)'}`,
                          }}>
                            {val
                              ? <Check style={{ width: '0.7rem', height: '0.7rem', color: plan.accent }} />
                              : <Minus style={{ width: '0.7rem', height: '0.7rem', color: '#334155' }} />
                            }
                          </span>
                          <span style={{
                            fontSize: '0.83rem',
                            color: val ? '#cbd5e1' : '#334155',
                          }}>
                            {typeof val === 'string'
                              ? <><span style={{ color: plan.accent, fontWeight: 600 }}>{val}</span> {label}</>
                              : label
                            }
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '5rem' }}
        >
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              padding: '1.75rem 1rem', borderRadius: '1.25rem', textAlign: 'center',
              background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.3)',
            }}>
              <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: '1rem', height: '1rem', color: '#38bdf8' }} />
              </div>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          style={{ marginBottom: '5rem' }}
        >
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9', textAlign: 'center', marginBottom: '2.5rem' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { q: 'Can I cancel anytime?',                 a: 'Yes. Cancel anytime with no questions asked. You keep access until the end of your billing period.' },
              { q: 'Is my health data private?',            a: 'Absolutely. All data is encrypted, never sold, and only accessible to you.' },
              { q: 'Can I switch plans later?',             a: 'Yes — upgrade or downgrade anytime. Changes take effect at the next billing cycle.' },
              { q: 'Is there a free trial?',                a: 'Free plan is free forever. Standard & Premium come with a 7-day trial — no card needed.' },
              { q: 'What payment methods do you accept?',   a: 'All major credit cards, PayPal, and Apple / Google Pay.' },
              { q: 'Is MediMind a replacement for a doctor?', a: 'No. MediMind is a wellness companion. Always consult a qualified medical professional.' },
            ].map(({ q, a }, i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.06, duration: 0.4 }}
                style={{
                  padding: '1.5rem', borderRadius: '1.125rem',
                  background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.3)',
                }}
              >
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.6rem' }}>{q}</p>
                <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.65 }}>{a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          style={{
            textAlign: 'center', borderRadius: '2rem', padding: '4rem 2rem',
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.08) 100%)',
            border: '1px solid rgba(14,165,233,0.18)',
          }}
        >
          <div style={{ position: 'absolute', top: '-5rem', right: '-5rem', width: '20rem', height: '20rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-5rem', left: '-5rem', width: '20rem', height: '20rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 32px rgba(14,165,233,0.4)' }}>
              <Brain style={{ width: '1.5rem', height: '1.5rem', color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.875rem' }}>
              Ready to take control of your health?
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2.5rem', maxWidth: '420px', margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
              Join 50,000+ users who trust MediMind AI for smarter health decisions every day.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', justifyContent: 'center' }}>
              <Link to="/login"
                style={{ padding: '0.9rem 2rem', borderRadius: '0.875rem', fontWeight: 600, fontSize: '0.9rem', color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 8px 28px rgba(14,165,233,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.filter = 'brightness(1.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.filter = 'brightness(1)' }}
              >
                Get Started Free
              </Link>
              <Link to="/"
                style={{ padding: '0.9rem 2rem', borderRadius: '0.875rem', fontWeight: 600, fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.transform = 'scale(1.02)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                Explore Dashboard
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
