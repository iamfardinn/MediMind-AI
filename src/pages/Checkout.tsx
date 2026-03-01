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
import {
  stripePromise, createStripeIntent, initSSLCommerz,
  PLAN_PRICES, PLAN_LABELS,
  type PlanId, type Billing, type Gateway, type OrderPayload,
} from '../services/payment'
import { saveUserPlan } from '../services/userPlan'

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
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(51,65,85,0.6)',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.5rem', letterSpacing: '0.03em' }}>CARD NUMBER</label>
        <div style={inputBox}><CardNumberElement options={STRIPE_STYLE} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.5rem', letterSpacing: '0.03em' }}>EXPIRY</label>
          <div style={inputBox}><CardExpiryElement options={STRIPE_STYLE} /></div>
        </div>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.5rem', letterSpacing: '0.03em' }}>CVC</label>
          <div style={inputBox}><CardCvcElement options={STRIPE_STYLE} /></div>
        </div>
      </div>
      <motion.button
        type="submit"
        disabled={!stripe || processing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          marginTop: '0.5rem',
          padding: '1rem',
          borderRadius: '0.875rem',
          background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
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
          boxShadow: '0 8px 28px rgba(14,165,233,0.35)',
        }}
      >
        {processing ? <><Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} /> Processing…</> : <><Lock style={{ width: '0.9rem', height: '0.9rem' }} /> Pay with Stripe</>}
      </motion.button>
      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#475569' }}>
        🔒 Secured by Stripe · 256-bit SSL encryption
      </p>
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

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ plan, billing }: { plan: PlanId; billing: Billing }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '3rem 2rem' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}
      >
        <CheckCircle style={{ width: '2.5rem', height: '2.5rem', color: '#34d399' }} />
      </motion.div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>Payment Successful!</h2>
      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
        You're now on the <span style={{ color: '#34d399', fontWeight: 600 }}>{PLAN_LABELS[plan]} ({billing})</span> plan.
      </p>
      <p style={{ color: '#475569', fontSize: '0.83rem', marginBottom: '2.5rem' }}>A confirmation has been sent to your email.</p>
      <button
        onClick={() => navigate('/')}
        style={{ padding: '0.875rem 2.5rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(14,165,233,0.3)' }}
      >
        Go to Dashboard
      </button>
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
  // Save plan to Firestore + mark success
  const handlePaymentSuccess = async () => {
    try {
      if (user) {
        await saveUserPlan(user.uid, planId as 'standard' | 'premium', billing)
      }
    } catch (err) {
      console.warn('Firestore plan save failed (non-blocking):', err)
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
    <div style={{ minHeight: '100vh', background: '#0b1221', padding: '2rem 1rem 6rem' }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', top: '-10rem', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, borderRadius: '50%' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '980px', margin: '0 auto' }}>

        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/pricing')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Back to Pricing
          </button>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '2rem', alignItems: 'start' }}>

          {/* ── Left: Order Summary ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.75rem' }}>Order Summary</h1>

            {/* Plan card */}
            <div style={{ borderRadius: '1.25rem', overflow: 'hidden', border: `1px solid ${planColor}33`, boxShadow: `0 0 40px ${planColor}12`, marginBottom: '1.5rem' }}>
              <div style={{ height: '3px', background: planId === 'premium' ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#0ea5e9,#6366f1)' }} />
              <div style={{ padding: '1.5rem', background: 'linear-gradient(160deg,#111d2e,#0b1221)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: `${planColor}22`, border: `1px solid ${planColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlanIcon style={{ width: '1.2rem', height: '1.2rem', color: planColor }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>{PLAN_LABELS[planId]} Plan</p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'capitalize' }}>{billing} billing</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  {[
                    planId === 'standard' ? 'Symptom Analyzer' : 'Everything in Standard',
                    'Unlimited AI Chat',
                    planId === 'premium' ? 'Priority AI Response' : 'Health Dashboard',
                    planId === 'premium' ? 'Detailed Health Reports + Export' : 'Health Tips Feed',
                  ].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <CheckCircle style={{ width: '0.875rem', height: '0.875rem', color: planColor, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.83rem', color: '#94a3b8' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{ height: '1px', background: 'rgba(51,65,85,0.4)', marginBottom: '1.25rem' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total {billing === 'yearly' ? '(billed yearly)' : '(billed monthly)'}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>${price}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{billing === 'yearly' ? '/yr' : '/mo'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { icon: Lock,   text: '256-bit SSL encryption' },
                { icon: Shield, text: 'PCI DSS compliant' },
                { icon: CheckCircle, text: 'Cancel anytime, no questions asked' },
              ].map(({ icon: I, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <I style={{ width: '0.875rem', height: '0.875rem', color: '#34d399', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Payment form ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            style={{ borderRadius: '1.5rem', background: 'linear-gradient(160deg,#111d2e,#0b1221)', border: '1px solid rgba(51,65,85,0.4)', overflow: 'hidden' }}
          >
            {success ? (
              <SuccessScreen plan={planId} billing={billing} />
            ) : (
              <div style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.75rem' }}>
                  Payment Method
                </h2>

                {/* Gateway selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '2rem' }}>
                  {([
                    { id: 'stripe',     label: 'Stripe',      sub: 'Card / Apple Pay',  color: '#6366f1' },
                    { id: 'sslcommerz', label: 'SSLCommerz',  sub: 'bKash / Nagad +',   color: '#16a34a' },
                  ] as const).map(g => (
                    <button
                      key={g.id}
                      onClick={() => { setGateway(g.id); setError('') }}
                      style={{
                        padding: '1rem',
                        borderRadius: '0.875rem',
                        border: gateway === g.id ? `2px solid ${g.color}` : '1px solid rgba(51,65,85,0.5)',
                        background: gateway === g.id ? `${g.color}14` : 'rgba(15,23,42,0.5)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.18s',
                        boxShadow: gateway === g.id ? `0 0 20px ${g.color}22` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <CreditCard style={{ width: '1rem', height: '1rem', color: g.color }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{g.label}</span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{g.sub}</p>
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
                </AnimatePresence>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  )
}
