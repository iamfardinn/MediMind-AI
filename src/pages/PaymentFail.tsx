import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react'

export default function PaymentFail() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0b1221', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '3rem 2rem', borderRadius: '2rem', background: 'linear-gradient(160deg,#1a0f0f,#0b1221)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 0 60px rgba(239,68,68,0.08)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, delay: 0.15 }}
          style={{ width: '5.5rem', height: '5.5rem', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem' }}
        >
          <XCircle style={{ width: '2.75rem', height: '2.75rem', color: '#f87171' }} />
        </motion.div>

        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.75rem' }}>
          Payment Failed
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '2rem' }}>
          Your payment could not be processed. No amount has been charged. Please check your details and try again.
        </p>

        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/checkout')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(14,165,233,0.25)' }}
          >
            <RefreshCw style={{ width: '0.9rem', height: '0.9rem' }} /> Try Again
          </button>
          <button
            onClick={() => navigate('/pricing')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <ArrowLeft style={{ width: '0.9rem', height: '0.9rem' }} /> Back to Pricing
          </button>
        </div>
      </motion.div>
    </div>
  )
}
