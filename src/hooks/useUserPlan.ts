// Real-time hook: reads the user's active plan from Firestore
// Also caches in localStorage for instant restore on refresh
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

// ── localStorage cache for instant plan restore on refresh ───────────────────
function planCacheKey(uid: string) { return `medimind-plan-${uid}` }

function cachePlan(uid: string, plan: UserPlan) {
  try {
    localStorage.setItem(planCacheKey(uid), JSON.stringify({
      planId:  plan.planId,
      billing: plan.billing,
      active:  plan.active,
    }))
  } catch { /* ignore */ }
}

function loadCachedPlan(uid: string): UserPlan {
  try {
    const raw = localStorage.getItem(planCacheKey(uid))
    if (!raw) return DEFAULT
    const d = JSON.parse(raw)
    return {
      planId:    (d.planId  as PlanId)  ?? 'free',
      billing:   (d.billing as Billing) ?? 'monthly',
      active:    d.active ?? true,
      startedAt: null,
      updatedAt: null,
    }
  } catch { return DEFAULT }
}

// ── Module-level cache ───────────────────────────────────────────────────────
// Initialise from localStorage immediately so the first render has the right plan
const initialUid = useAuthStore.getState().user?.uid
let cachedPlan: UserPlan = initialUid ? loadCachedPlan(initialUid) : DEFAULT
let cachedLoading = !!initialUid   // if user exists, we're "loading" until Firestore confirms
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

    // Restore from localStorage immediately (so we don't flash "Free")
    cachedPlan = loadCachedPlan(user.uid)
    cachedLoading = true
    notify()

    const unsub = onUserPlanChange(user.uid, (p) => {
      cachedPlan = p
      cachedLoading = false
      cachePlan(user.uid, p)   // persist to localStorage
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
