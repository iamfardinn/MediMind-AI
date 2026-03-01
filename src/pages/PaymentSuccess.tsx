import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function PaymentSuccess() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const planId    = params.get('plan')    ?? 'standard'
  const billing   = params.get('billing') ?? 'monthly'
  const tranId    = params.get('tran_id') ?? ''

  useEffect(() => {
    // Auto-redirect to dashboard after 5 s
    const t = setTimeout(() => navigate('/'), 5000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div style={{ minHeight: '100vh', background: '#0b1221', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '3rem 2rem', borderRadius: '2rem', background: 'linear-gradient(160deg,#111d2e,#0b1221)', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 60px rgba(16,185,129,0.1)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, delay: 0.15 }}
          style={{ width: '5.5rem', height: '5.5rem', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem' }}
        >
          <CheckCircle style={{ width: '2.75rem', height: '2.75rem', color: '#34d399' }} />
        </motion.div>

        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.75rem' }}>
          Payment Successful! 🎉
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '0.5rem' }}>
          You're now on the{' '}
          <span style={{ color: '#34d399', fontWeight: 600, textTransform: 'capitalize' }}>
            {planId} ({billing})
          </span>{' '}
          plan.
        </p>
        {tranId && (
          <p style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '2rem', fontFamily: 'monospace' }}>
            Transaction ID: {tranId}
          </p>
        )}
        {!tranId && <div style={{ marginBottom: '2rem' }} />}

        <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '2rem' }}>
          A confirmation has been sent to your email. Redirecting to dashboard in 5 s…
        </p>

        <button
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(14,165,233,0.3)' }}
        >
          Go to Dashboard <ArrowRight style={{ width: '0.9rem', height: '0.9rem' }} />
        </button>
      </motion.div>
    </div>
  )
}
