// Doctors directory — browse, search, filter, and book appointments
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, Star, Clock, Video, Building2,
  Filter, ChevronDown, Globe, BadgeCheck, Calendar,
  X, CheckCircle, Loader2, Stethoscope,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { bookAppointment } from '../services/appointments'
import { DOCTORS, SPECIALTIES, type Doctor, type Specialty } from '../data/doctors'

// ── helpers ──────────────────────────────────────────────────────────────────
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function getNextDates(availableDays: string[], count = 7) {
  const dates: { label: string; iso: string; day: string }[] = []
  const d = new Date()
  while (dates.length < count) {
    const dayName = DAY_NAMES[d.getDay()]
    if (availableDays.includes(dayName)) {
      dates.push({
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        iso: d.toISOString().slice(0, 10),
        day: dayName,
      })
    }
    d.setDate(d.getDate() + 1)
  }
  return dates
}

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899&backgroundType=gradientLinear`
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
})

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Doctors() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [searchQ, setSearchQ]             = useState('')
  const [specialty, setSpecialty]          = useState<Specialty>('All')
  const [onlineOnly, setOnlineOnly]       = useState(false)
  const [sortBy, setSortBy]               = useState<'rating' | 'fee-low' | 'fee-high' | 'experience'>('rating')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [bookingDate, setBookingDate]     = useState('')
  const [bookingSlot, setBookingSlot]     = useState('')
  const [bookingType, setBookingType]     = useState<'video' | 'in-person'>('video')
  const [bookingNotes, setBookingNotes]   = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError]   = useState('')

  // ── Filtered + sorted list ──
  const filtered = useMemo(() => {
    let list = [...DOCTORS]
    if (specialty !== 'All') list = list.filter(d => d.specialty === specialty)
    if (onlineOnly) list = list.filter(d => d.online)
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase()
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q)
      )
    }
    switch (sortBy) {
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break
      case 'fee-low':    list.sort((a, b) => a.consultationFee - b.consultationFee); break
      case 'fee-high':   list.sort((a, b) => b.consultationFee - a.consultationFee); break
      case 'experience': list.sort((a, b) => b.experience - a.experience); break
    }
    return list
  }, [searchQ, specialty, onlineOnly, sortBy])
  // ── Book handler ──
  const handleBook = async () => {
    if (!user || !selectedDoctor || !bookingDate || !bookingSlot) return
    setBookingLoading(true)
    setBookingError('')
    try {      // Race the Firestore write against a 15-second timeout
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(
          'Request timed out. This usually means Firestore security rules are blocking the write. ' +
          'Open Firebase Console → Firestore → Rules and ensure authenticated users can write to the "appointments" collection.'
        )), 15000),
      )
      await Promise.race([
        bookAppointment({
          userId: user.uid,
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          doctorSpecialty: selectedDoctor.specialty,
          doctorPhoto: avatarUrl(selectedDoctor.photoSeed),
          consultationType: bookingType,
          date: bookingDate,
          time: bookingSlot,
          fee: selectedDoctor.consultationFee,
          status: 'upcoming',
          notes: bookingNotes,
        }),
        timeout,
      ])
      setBookingSuccess(true)    } catch (err: unknown) {
      console.error('Booking failed:', err)
      const e = err as { code?: string; message?: string }
      let msg: string
      if (e?.code === 'permission-denied' || e?.message?.includes('permission')) {
        msg = 'Permission denied — update your Firestore rules to allow writes to the "appointments" collection.'
      } else if (e?.message?.includes('timed out') || e?.message?.includes('security rules')) {
        msg = e.message!
      } else {
        msg = e?.message || 'Booking failed. Please try again.'
      }
      // Truncate very long messages for the UI
      setBookingError(msg.length > 200 ? msg.slice(0, 200) + '…' : msg)
    } finally {
      setBookingLoading(false)
    }
  }
  const closeModal = () => {
    setSelectedDoctor(null)
    setBookingDate('')
    setBookingSlot('')
    setBookingNotes('')
    setBookingSuccess(false)
    setBookingError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b1221' }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', top: '-10rem', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(14,165,233,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, borderRadius: '50%' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

        {/* ── Header ── */}
        <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.1))',
              border: '1px solid rgba(14,165,233,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Stethoscope style={{ width: '1.4rem', height: '1.4rem', color: '#0ea5e9' }} />
            </div>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Find a Doctor
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            Browse our network of verified specialists. Book video or in-person consultations.
          </p>
        </motion.div>

        {/* ── Search & Filters ── */}
        <motion.div {...fadeUp(0.1)} style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '2rem',
          padding: '1.25rem', borderRadius: '1.25rem',
          background: 'linear-gradient(160deg, #131f35, #0f172a)',
          border: '1px solid rgba(51,65,85,0.5)',
        }}>
          {/* Search */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#475569' }} />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search by name, specialty, or hospital…"
              style={{
                width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                borderRadius: '0.75rem', fontSize: '0.88rem',
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)',
                color: '#f1f5f9', outline: 'none',
              }}
            />
          </div>

          {/* Specialty dropdown */}
          <div style={{ position: 'relative', flex: '0 0 auto' }}>
            <Filter style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '0.85rem', height: '0.85rem', color: '#475569', pointerEvents: 'none' }} />
            <select
              value={specialty}
              onChange={e => setSpecialty(e.target.value as Specialty)}
              style={{
                padding: '0.75rem 2rem 0.75rem 2.25rem',
                borderRadius: '0.75rem', fontSize: '0.85rem',
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)',
                color: '#f1f5f9', outline: 'none', appearance: 'none', cursor: 'pointer',
              }}
            >
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '0.85rem', height: '0.85rem', color: '#475569', pointerEvents: 'none' }} />
          </div>

          {/* Sort */}
          <div style={{ position: 'relative', flex: '0 0 auto' }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              style={{
                padding: '0.75rem 2rem 0.75rem 0.875rem',
                borderRadius: '0.75rem', fontSize: '0.85rem',
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)',
                color: '#f1f5f9', outline: 'none', appearance: 'none', cursor: 'pointer',
              }}
            >
              <option value="rating">Top Rated</option>
              <option value="fee-low">Fee: Low → High</option>
              <option value="fee-high">Fee: High → Low</option>
              <option value="experience">Most Experienced</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '0.85rem', height: '0.85rem', color: '#475569', pointerEvents: 'none' }} />
          </div>

          {/* Online toggle */}
          <button
            onClick={() => setOnlineOnly(!onlineOnly)}
            style={{
              padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: 600,
              background: onlineOnly ? 'rgba(16,185,129,0.12)' : 'rgba(15,23,42,0.8)',
              border: onlineOnly ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(51,65,85,0.6)',
              color: onlineOnly ? '#34d399' : '#94a3b8',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            <Video style={{ width: '0.9rem', height: '0.9rem' }} />
            Online Only
          </button>
        </motion.div>

        {/* ── Results count ── */}
        <motion.p {...fadeUp(0.15)} style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Showing <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{filtered.length}</span> doctor{filtered.length !== 1 ? 's' : ''}
          {specialty !== 'All' && <> in <span style={{ color: '#0ea5e9' }}>{specialty}</span></>}
        </motion.p>

        {/* ── Doctor Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.id}
              {...fadeUp(0.05 * Math.min(i, 8))}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{
                borderRadius: '1.25rem', overflow: 'hidden',
                background: 'linear-gradient(160deg, #131f35, #0f172a)',
                border: '1px solid rgba(51,65,85,0.5)',
                cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(14,165,233,0.4)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(51,65,85,0.5)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onClick={() => {
                setSelectedDoctor(doc)
                setBookingSuccess(false)
              }}
            >
              <div style={{ padding: '1.5rem' }}>
                {/* Top row: avatar + info */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <img
                    src={avatarUrl(doc.photoSeed)}
                    alt={doc.name}
                    style={{
                      width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
                      border: '2px solid rgba(14,165,233,0.3)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.name}
                      </h3>
                      <BadgeCheck style={{ width: '0.9rem', height: '0.9rem', color: '#0ea5e9', flexShrink: 0 }} />
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#0ea5e9', fontWeight: 600 }}>
                      {doc.specialtyIcon} {doc.specialty}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#475569' }}>{doc.degree}</p>
                  </div>
                </div>

                {/* Hospital + experience */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building2 style={{ width: '0.8rem', height: '0.8rem' }} /> {doc.hospital}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock style={{ width: '0.8rem', height: '0.8rem' }} /> {doc.experience} yrs exp
                  </span>
                </div>

                {/* Rating + fee row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.25rem 0.625rem', borderRadius: '999px',
                      background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)',
                    }}>
                      <Star style={{ width: '0.75rem', height: '0.75rem', color: '#facc15', fill: '#facc15' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#facc15' }}>{doc.rating}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#475569' }}>({doc.reviewCount} reviews)</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>${doc.consultationFee}</span>
                    <span style={{ fontSize: '0.72rem', color: '#475569' }}>/visit</span>
                  </div>
                </div>

                {/* Tags + online badge */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                  {doc.online && (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399',
                    }}>
                      <Video style={{ width: '0.65rem', height: '0.65rem' }} /> Video
                    </span>
                  )}
                  {doc.tags.map(t => (
                    <span key={t} style={{
                      padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 600,
                      background: t === 'Top Rated' ? 'rgba(250,204,21,0.08)' : 'rgba(14,165,233,0.08)',
                      border: `1px solid ${t === 'Top Rated' ? 'rgba(250,204,21,0.2)' : 'rgba(14,165,233,0.18)'}`,
                      color: t === 'Top Rated' ? '#fbbf24' : '#94a3b8',
                    }}>
                      {t}
                    </span>
                  ))}
                  <span style={{
                    marginLeft: 'auto',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.72rem', color: '#475569',
                  }}>
                    <Globe style={{ width: '0.7rem', height: '0.7rem' }} />
                    {doc.languages.slice(0, 2).join(', ')}{doc.languages.length > 2 ? ` +${doc.languages.length - 2}` : ''}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div {...fadeUp(0)} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Stethoscope style={{ width: '3rem', height: '3rem', color: '#334155', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b', fontSize: '1rem' }}>No doctors found matching your criteria.</p>
            <button
              onClick={() => { setSearchQ(''); setSpecialty('All'); setOnlineOnly(false) }}
              style={{
                marginTop: '1rem', padding: '0.625rem 1.5rem', borderRadius: '0.75rem',
                background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)',
                color: '#38bdf8', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Booking Modal ── */}
      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
              padding: '1.5rem',
            }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
                borderRadius: '1.5rem',
                background: 'linear-gradient(160deg, #131f35 0%, #0f172a 100%)',
                border: '1px solid rgba(51,65,85,0.6)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Top bar */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #0ea5e9, #6366f1)' }} />

              {bookingSuccess ? (
                /* ── Success state ── */
                <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    style={{
                      width: '4.5rem', height: '4.5rem', borderRadius: '50%',
                      background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(52,211,153,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                    }}
                  >
                    <CheckCircle style={{ width: '2rem', height: '2rem', color: '#34d399' }} />
                  </motion.div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                    Appointment Booked! 🎉
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {selectedDoctor.name} · {selectedDoctor.specialty}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>
                    {new Date(bookingDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {bookingSlot}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => navigate('/my-dashboard')}
                      style={{
                        flex: 1, padding: '0.875rem', borderRadius: '0.875rem',
                        background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)',
                        color: '#38bdf8', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                      }}
                    >
                      My Dashboard
                    </button>
                    <button
                      onClick={closeModal}
                      style={{
                        flex: 1, padding: '0.875rem', borderRadius: '0.875rem',
                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        color: '#fff', fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
                      }}
                    >
                      Browse More
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Booking form ── */
                <div style={{ padding: '2rem' }}>
                  {/* Close */}
                  <button onClick={closeModal} style={{
                    position: 'absolute', top: '1.25rem', right: '1.25rem',
                    background: 'rgba(51,65,85,0.4)', border: 'none', borderRadius: '0.5rem',
                    padding: '0.4rem', cursor: 'pointer', color: '#94a3b8',
                  }}>
                    <X style={{ width: '1rem', height: '1rem' }} />
                  </button>

                  {/* Doctor header */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem' }}>
                    <img
                      src={avatarUrl(selectedDoctor.photoSeed)}
                      alt={selectedDoctor.name}
                      style={{ width: '4rem', height: '4rem', borderRadius: '1rem', border: '2px solid rgba(14,165,233,0.3)', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>{selectedDoctor.name}</h3>
                        <BadgeCheck style={{ width: '1rem', height: '1rem', color: '#0ea5e9' }} />
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#0ea5e9', fontWeight: 600 }}>{selectedDoctor.specialtyIcon} {selectedDoctor.specialty}</p>
                      <p style={{ fontSize: '0.78rem', color: '#475569' }}>{selectedDoctor.degree} · {selectedDoctor.hospital}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Star style={{ width: '0.75rem', height: '0.75rem', color: '#facc15', fill: '#facc15' }} />
                          {selectedDoctor.rating} ({selectedDoctor.reviewCount})
                        </span>
                        <span>·</span>
                        <span>{selectedDoctor.experience} yrs</span>
                        <span>·</span>
                        <span style={{ fontWeight: 700, color: '#f8fafc' }}>${selectedDoctor.consultationFee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p style={{
                    fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6,
                    padding: '1rem', borderRadius: '0.875rem',
                    background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.4)',
                    marginBottom: '1.5rem',
                  }}>
                    {selectedDoctor.bio}
                  </p>

                  {/* Consultation type */}
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '0.625rem' }}>CONSULTATION TYPE</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {(['video', 'in-person'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setBookingType(t)}
                        disabled={t === 'video' && !selectedDoctor.online}
                        style={{
                          padding: '0.75rem', borderRadius: '0.75rem',
                          background: bookingType === t ? 'rgba(14,165,233,0.1)' : 'rgba(15,23,42,0.5)',
                          border: bookingType === t ? '2px solid rgba(14,165,233,0.5)' : '1px solid rgba(51,65,85,0.5)',
                          color: bookingType === t ? '#38bdf8' : '#64748b',
                          fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          opacity: (t === 'video' && !selectedDoctor.online) ? 0.4 : 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        {t === 'video' ? <Video style={{ width: '0.9rem', height: '0.9rem' }} /> : <Building2 style={{ width: '0.9rem', height: '0.9rem' }} />}
                        {t === 'video' ? 'Video Call' : 'In-Person'}
                      </button>
                    ))}
                  </div>

                  {/* Date picker */}
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '0.625rem' }}>SELECT DATE</p>
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
                    {getNextDates(selectedDoctor.availableDays).map(d => (
                      <button
                        key={d.iso}
                        onClick={() => { setBookingDate(d.iso); setBookingSlot('') }}
                        style={{
                          padding: '0.625rem 1rem', borderRadius: '0.75rem', flexShrink: 0,
                          background: bookingDate === d.iso ? 'rgba(14,165,233,0.15)' : 'rgba(15,23,42,0.5)',
                          border: bookingDate === d.iso ? '2px solid rgba(14,165,233,0.5)' : '1px solid rgba(51,65,85,0.5)',
                          color: bookingDate === d.iso ? '#38bdf8' : '#94a3b8',
                          fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                          textAlign: 'center', transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: bookingDate === d.iso ? '#38bdf8' : '#475569', marginBottom: '0.15rem' }}>{d.day}</div>
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {/* Time slots */}
                  {bookingDate && (
                    <>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '0.625rem' }}>SELECT TIME</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        {selectedDoctor.slots.map(s => (
                          <button
                            key={s}
                            onClick={() => setBookingSlot(s)}
                            style={{
                              padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
                              background: bookingSlot === s ? 'rgba(14,165,233,0.15)' : 'rgba(15,23,42,0.5)',
                              border: bookingSlot === s ? '2px solid rgba(14,165,233,0.5)' : '1px solid rgba(51,65,85,0.5)',
                              color: bookingSlot === s ? '#38bdf8' : '#94a3b8',
                              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '0.625rem' }}>NOTES (OPTIONAL)</p>
                  <textarea
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    placeholder="Describe your symptoms or reason for visit…"
                    rows={3}
                    style={{
                      width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                      background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)',
                      color: '#f1f5f9', fontSize: '0.85rem', resize: 'vertical', outline: 'none',
                      marginBottom: '1.5rem',
                    }}
                  />

                  {/* Auth gate */}
                  {!user ? (
                    <div style={{
                      padding: '1rem', borderRadius: '0.875rem', textAlign: 'center',
                      background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                    }}>
                      <p style={{ color: '#fbbf24', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        Please sign in to book an appointment.
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        style={{
                          padding: '0.625rem 1.5rem', borderRadius: '0.75rem',
                          background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                          color: '#fff', fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                        }}
                      >
                        Sign In
                      </button>
                    </div>
                  ) : (
                    /* Book button */
                    <>
                      {bookingError && (
                        <div style={{
                          padding: '0.875rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem',
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                          color: '#f87171', fontSize: '0.85rem', lineHeight: 1.5,
                        }}>
                          ⚠️ {bookingError}
                        </div>
                      )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBook}
                      disabled={!bookingDate || !bookingSlot || bookingLoading}
                      style={{
                        width: '100%', padding: '1rem', borderRadius: '0.875rem',
                        background: (!bookingDate || !bookingSlot) ? 'rgba(51,65,85,0.5)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        color: '#fff', fontWeight: 700, fontSize: '0.95rem', border: 'none',
                        cursor: (!bookingDate || !bookingSlot || bookingLoading) ? 'not-allowed' : 'pointer',
                        opacity: (!bookingDate || !bookingSlot) ? 0.5 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        boxShadow: (!bookingDate || !bookingSlot) ? 'none' : '0 8px 28px rgba(14,165,233,0.3)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {bookingLoading ? (
                        <><Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} /> Booking…</>
                      ) : (
                        <><Calendar style={{ width: '0.9rem', height: '0.9rem' }} /> Book Appointment — ${selectedDoctor.consultationFee}</>
                      )}
                    </motion.button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
