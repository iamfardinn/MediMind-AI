import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import {
  ArrowLeft, Shield, Lock, CheckCircle,
  CreditCard, Smartphone, Loader2, AlertCircle, Crown, Zap,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { saveUserPlan } from '../services/userPlan'
import {
  stripePromise, createStripeIntent, initSSLCommerz,
  PLAN_PRICES, PLAN_LABELS,
  type PlanId, type Billing, type Gateway, type OrderPayload,
} from '../services/payment'

// ── Stripe element appearance ─────────────────────────────────────────────────
const STRIPE_STYLE = {
  style: {
    base: {
      color: '#f1f5f9',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      '::placeholder': { color: '#475569' },
    },
    invalid: { color: '#f87171' },
  },
}

// ── Inner Stripe form (must be inside <Elements>) ────────────────────────────
function StripeForm({
  payload,
  onSuccess,
  onError,
}: {
  payload: OrderPayload
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    try {
      // 1. Ask your backend to create a PaymentIntent
      const { clientSecret } = await createStripeIntent(payload)

      // 2. Confirm the card payment in the browser
      const cardNumber = elements.getElement(CardNumberElement)
      if (!cardNumber) throw new Error('Card element not found')
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardNumber },
      })
      if (result.error) {
        onError(result.error.message ?? 'Payment failed.')
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess()
      }
    } catch (err: unknown) {
      // Backend not connected yet — show a helpful message in dev
      const msg = (err as Error).message ?? 'Something went wrong.'
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        onError('Backend not connected. Set VITE_API_URL in .env.local and start your server.')
      } else {
        onError(msg)
      }
    } finally {
      setProcessing(false)
    }
  }

  const inputBox: React.CSSProperties = {
    padding: '0.875rem 1.125rem',
    borderRadius: '0.875rem',
    background: 'rgba(15,23,42,0.85)',
    border: '1px solid rgba(51,65,85,0.7)',
    transition: 'all 0.2s ease',
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Card Number
        </label>
        <div style={inputBox} className="focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
          <CardNumberElement options={STRIPE_STYLE} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Expiration Date
          </label>
          <div style={inputBox} className="focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
            <CardExpiryElement options={STRIPE_STYLE} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            CVC Security Code
          </label>
          <div style={inputBox} className="focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
            <CardCvcElement options={STRIPE_STYLE} />
          </div>
        </div>
      </div>
      <motion.button
        type="submit"
        disabled={!stripe || processing}
        whileHover={!processing ? { scale: 1.015, y: -1 } : {}}
        whileTap={!processing ? { scale: 0.985 } : {}}
        className="mt-3 w-full py-3.5 px-5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
          opacity: processing ? 0.75 : 1,
        }}
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Secure Payment…</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Pay with Stripe</span>
          </>
        )}
      </motion.button>
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-1">
        <Shield className="w-3.5 h-3.5 text-emerald-400" />
        <span>256-bit End-to-End SSL Encryption · PCI DSS Level 1</span>
      </div>
    </form>
  )
}

// ── SSLCommerz form (redirects to hosted page) ───────────────────────────────
function SSLCommerzForm({
  payload,
  onError,
}: {
  payload: OrderPayload
  onError: (msg: string) => void
}) {
  const [processing, setProcessing] = useState(false)

  const handlePay = async () => {
    setProcessing(true)
    try {
      const res = await initSSLCommerz(payload)
      if (res.status === 'success') {
        // Redirect to SSLCommerz hosted payment page
        window.location.href = res.redirectUrl
      } else {
        onError('SSLCommerz initialisation failed. Try again.')
      }
    } catch (err: unknown) {
      const msg = (err as Error).message ?? 'Something went wrong.'
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        onError('Backend not connected. Set VITE_API_URL in .env.local and start your server.')
      } else {
        onError(msg)
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Supported methods */}
      <div style={{ padding: '1.25rem', borderRadius: '0.875rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.4)' }}>
        <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '0.875rem', letterSpacing: '0.03em' }}>SUPPORTED PAYMENT METHODS</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['bKash', 'Nagad', 'Rocket', 'Visa', 'Mastercard', 'DBBL Nexus', 'Dutch-Bangla', 'City Bank'].map(m => (
            <span key={m} style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.18)', color: '#94a3b8' }}>{m}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '1rem', borderRadius: '0.875rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <p style={{ fontSize: '0.8rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Smartphone style={{ width: '0.9rem', height: '0.9rem', flexShrink: 0 }} />
          You'll be redirected to the SSLCommerz secure payment portal.
        </p>
      </div>

      <motion.button
        onClick={handlePay}
        disabled={processing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: '1rem',
          borderRadius: '0.875rem',
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.95rem',
          border: 'none',
          cursor: processing ? 'not-allowed' : 'pointer',
          opacity: processing ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 8px 28px rgba(22,163,74,0.3)',
        }}
      >
        {processing ? <><Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} /> Redirecting…</> : <><Shield style={{ width: '0.9rem', height: '0.9rem' }} /> Pay with SSLCommerz</>}
      </motion.button>
      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#475569' }}>
        🔒 Secured by SSLCommerz · PCI DSS Compliant
      </p>
    </div>
  )
}

// ── Pre-computed particle data (avoids Math.random during render) ─────────────
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  yEnd: -120 - (((i * 7 + 3) * 13) % 160),
  xEnd: (((i * 11 + 5) % 300) - 150),
  dur: 1.8 + ((i * 7) % 12) / 10,
  w: 6 + ((i * 3 + 2) % 8),
  h: 6 + ((i * 5 + 1) % 8),
  round: i % 2 === 0,
  color: ['#34d399', '#0ea5e9', '#f59e0b', '#a855f7', '#f43f5e', '#6366f1'][i % 6],
}))

// ── Success popup overlay ─────────────────────────────────────────────────────
function SuccessPopup({ plan, billing, onClose }: { plan: PlanId; billing: Billing; onClose: () => void }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, p.yEnd],
            x: [p.xEnd],
            scale: [0, 1, 0.5],
          }}
          transition={{ duration: p.dur, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: `${p.w}px`,
            height: `${p.h}px`,
            borderRadius: p.round ? '50%' : '2px',
            background: p.color,
            pointerEvents: 'none',
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.75, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 30 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.05 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '440px',
          borderRadius: '1.5rem', overflow: 'hidden',
          background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)',
          border: '1px solid rgba(52,211,153,0.25)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(52,211,153,0.08)',
          textAlign: 'center',
        }}
      >
        {/* Top gradient bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #34d399, #0ea5e9, #6366f1)' }} />

        <div style={{ padding: '2.5rem 2rem 2rem' }}>
          {/* Animated check icon */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
            style={{
              width: '5rem', height: '5rem', borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(52,211,153,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 40px rgba(52,211,153,0.15)',
            }}
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <CheckCircle style={{ width: '2.5rem', height: '2.5rem', color: '#34d399' }} />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}
          >
            🎉 Plan Purchased!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '0.25rem' }}
          >
            You're now on the
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: '999px', marginBottom: '1rem',
              background: plan === 'premium'
                ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))'
                : 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.1))',
              border: `1px solid ${plan === 'premium' ? 'rgba(245,158,11,0.3)' : 'rgba(14,165,233,0.3)'}`,
            }}
          >
            {plan === 'premium' ? <Crown style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} /> : <Shield style={{ width: '1rem', height: '1rem', color: '#0ea5e9' }} />}
            <span style={{ fontSize: '1rem', fontWeight: 700, color: plan === 'premium' ? '#fbbf24' : '#38bdf8' }}>
              {PLAN_LABELS[plan]} · {billing === 'yearly' ? 'Annual' : 'Monthly'}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ color: '#475569', fontSize: '0.82rem', marginBottom: '2rem' }}
          >
            A confirmation has been sent to your email.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            style={{ display: 'flex', gap: '0.75rem' }}
          >
            <button
              onClick={() => navigate('/my-dashboard')}
              style={{
                flex: 1, padding: '0.875rem', borderRadius: '0.875rem',
                background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)',
                color: '#38bdf8', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.1)' }}
            >
              My Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                flex: 1, padding: '0.875rem', borderRadius: '0.875rem',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: '#fff', fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              Go to Home
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Checkout page ────────────────────────────────────────────────────────
export default function Checkout() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user }  = useAuthStore()

  // Expect state passed from Pricing page: { planId, billing }
  const state    = (location.state ?? {}) as { planId?: PlanId; billing?: Billing }
  const planId   = state.planId  ?? 'standard'
  const billing  = state.billing ?? 'monthly'
  const price    = PLAN_PRICES[planId][billing]
  const [gateway,  setGateway]  = useState<Gateway>('stripe')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const handlePaymentSuccess = async () => {
    try {
      if (user) {
        await saveUserPlan(user.uid, planId, billing)
      }
    } catch (err) {
      console.error('Failed to save plan to Firestore:', err)
    }
    setSuccess(true)
  }

  // Must be logged in
  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Please sign in to complete your purchase.</p>
          <Link to="/login" style={{ padding: '0.75rem 2rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    )
  }

  const payload: OrderPayload = {
    planId, billing, gateway,
    userId:    user.uid,
    userEmail: user.email    ?? '',
    userName:  user.displayName ?? user.email ?? '',
  }

  const planIcon  = planId === 'premium' ? Crown : planId === 'standard' ? Shield : Zap
  const PlanIcon  = planIcon
  const planColor = planId === 'premium' ? '#f59e0b' : planId === 'standard' ? '#0ea5e9' : '#64748b'

  return (
    <div className="min-h-screen bg-[#0b1221] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
      {/* Ambient */}
      <div style={{ position: 'fixed', top: '-10rem', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, borderRadius: '50%' }} />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Pricing
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ── Left: Order Summary ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-5"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-6">Order Summary</h1>

            {/* Plan card */}
            <div className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl mb-6" style={{ borderColor: `${planColor}33`, boxShadow: `0 0 32px ${planColor}10` }}>
              <div style={{ height: '3px', background: planId === 'premium' ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#0ea5e9,#6366f1)' }} />
              <div className="p-5 sm:p-6" style={{ background: 'linear-gradient(160deg,#111d2e,#0b1221)' }}>
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${planColor}22`, border: `1px solid ${planColor}44` }}>
                    <PlanIcon className="w-5 h-5" style={{ color: planColor }} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-100">{PLAN_LABELS[planId]} Plan</p>
                    <p className="text-xs text-slate-400 capitalize">{billing} billing</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mb-5">
                  {[
                    planId === 'standard' ? 'Symptom Analyzer' : 'Everything in Standard',
                    'Unlimited AI Chat',
                    planId === 'premium' ? 'Priority AI Response' : 'Health Dashboard',
                    planId === 'premium' ? 'Detailed Health Reports + Export' : 'Health Tips Feed',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: planColor }} />
                      <span className="text-xs text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-slate-700/40 mb-5" />

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total {billing === 'yearly' ? '(billed yearly)' : '(billed monthly)'}</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white">${price}</span>
                    <span className="text-xs text-slate-400 ml-1">{billing === 'yearly' ? '/yr' : '/mo'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-col gap-2.5 px-1">
              {[
                { icon: Lock,   text: '256-bit SSL encryption' },
                { icon: Shield, text: 'PCI DSS compliant' },
                { icon: CheckCircle, text: 'Cancel anytime, no questions asked' },
              ].map(({ icon: I, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <I className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-400">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Payment form ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-7 rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl"
            style={{ background: 'linear-gradient(160deg,#111d2e,#0b1221)' }}
          >
            <div className="p-5 sm:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-6">
                  Payment Method
                </h2>

                {/* Gateway selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {([
                    { id: 'stripe',     label: 'Stripe',      sub: 'Card / Apple Pay',  color: '#6366f1' },
                    { id: 'sslcommerz', label: 'SSLCommerz',  sub: 'bKash / Nagad +',   color: '#16a34a' },
                  ] as const).map(g => (
                    <button
                      key={g.id}
                      onClick={() => { setGateway(g.id); setError('') }}
                      className={`p-4 rounded-xl text-left transition-all cursor-pointer ${
                        gateway === g.id
                          ? 'border-2 ring-1'
                          : 'border border-slate-700/50 bg-slate-900/50 hover:border-slate-600'
                      }`}
                      style={{
                        borderColor: gateway === g.id ? g.color : undefined,
                        background: gateway === g.id ? `${g.color}15` : undefined,
                        boxShadow: gateway === g.id ? `0 0 20px ${g.color}20` : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4" style={{ color: g.color }} />
                        <span className="text-sm font-bold text-white">{g.label}</span>
                      </div>
                      <p className="text-xs text-slate-400">{g.sub}</p>
                    </button>
                  ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: '1.25rem' }}
                    >
                      <AlertCircle style={{ width: '1rem', height: '1rem', color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
                      <p style={{ fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.5 }}>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form by gateway */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={gateway}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    {gateway === 'stripe' ? (
                      <Elements stripe={stripePromise}>
                        <StripeForm
                          payload={payload}
                          onSuccess={handlePaymentSuccess}
                          onError={setError}
                        />
                      </Elements>
                    ) : (
                      <SSLCommerzForm
                        payload={payload}
                        onError={setError}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>              </div>
          </motion.div>

        </div>
      </div>

      {/* Success popup overlay */}
      <AnimatePresence>
        {success && <SuccessPopup plan={planId} billing={billing} onClose={() => setSuccess(false)} />}
      </AnimatePresence>
    </div>
  )
}
