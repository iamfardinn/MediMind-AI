// Real-time hook: reads user's appointments from Firestore
import { useEffect, useSyncExternalStore, useCallback, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { onAppointmentsChange, type Appointment } from '../services/appointments'

// Module-level cache
let cachedAppointments: Appointment[] = []
let cachedLoading = true
const listeners = new Set<() => void>()

function notify() { listeners.forEach(l => l()) }

export function useAppointments() {
  const user = useAuthStore(s => s.user)
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!user?.uid) {
      unsubRef.current?.()
      unsubRef.current = null
      cachedAppointments = []
      cachedLoading = false
      notify()
      return
    }

    cachedLoading = true
    notify()

    const unsub = onAppointmentsChange(user.uid, (items) => {
      cachedAppointments = items
      cachedLoading = false
      notify()
    })
    unsubRef.current = unsub

    return () => {
      unsub()
      unsubRef.current = null
    }
  }, [user?.uid])

  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb)
    return () => { listeners.delete(cb) }
  }, [])

  const appointments = useSyncExternalStore(subscribe, () => cachedAppointments)
  const loading      = useSyncExternalStore(subscribe, () => cachedLoading)

  const upcoming  = appointments.filter(a => a.status === 'upcoming')
  const completed = appointments.filter(a => a.status === 'completed')
  const cancelled = appointments.filter(a => a.status === 'cancelled')

  return { appointments, upcoming, completed, cancelled, loading }
}
