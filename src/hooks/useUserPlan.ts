// Real-time hook: reads the user's active plan from Firestore
import { useEffect, useSyncExternalStore, useCallback, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { onUserPlanChange, type UserPlan, type PlanId, type Billing } from '../services/userPlan'

const DEFAULT: UserPlan = {
  planId:    'free',
  billing:   'monthly',
  active:    true,
  startedAt: null,
  updatedAt: null,
}

// Module-level cache so we avoid setState-in-effect lint issues
let cachedPlan: UserPlan = DEFAULT
let cachedLoading = true
const listeners: Set<() => void> = new Set()

function notify() {
  listeners.forEach(l => l())
}

export function useUserPlan() {
  const user = useAuthStore(s => s.user)
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!user?.uid) {
      // Clean up previous subscription
      unsubRef.current?.()
      unsubRef.current = null
      cachedPlan = DEFAULT
      cachedLoading = false
      notify()
      return
    }

    cachedLoading = true
    notify()

    const unsub = onUserPlanChange(user.uid, (p) => {
      cachedPlan = p
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

  const plan = useSyncExternalStore(subscribe, () => cachedPlan)
  const planLoading = useSyncExternalStore(subscribe, () => cachedLoading)

  return { plan, planLoading }
}

export type { UserPlan, PlanId, Billing }
