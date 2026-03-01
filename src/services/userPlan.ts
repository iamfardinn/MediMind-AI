// Firestore user-plan read/write helpers
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export type PlanId  = 'free' | 'standard' | 'premium'
export type Billing = 'monthly' | 'yearly'

export interface UserPlan {
  planId:    PlanId
  billing:   Billing
  active:    boolean
  startedAt: Date | null
  updatedAt: Date | null
}

const DEFAULT_PLAN: UserPlan = {
  planId:    'free',
  billing:   'monthly',
  active:    true,
  startedAt: null,
  updatedAt: null,
}

/** Write (or overwrite) the user's plan in Firestore. */
export async function saveUserPlan(
  userId: string,
  planId: PlanId,
  billing: Billing,
) {
  const ref = doc(db, 'user_plans', userId)
  await setDoc(ref, {
    planId,
    billing,
    active:    true,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/** One-off read of user's plan. */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  const ref  = doc(db, 'user_plans', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return DEFAULT_PLAN
  const d = snap.data()
  return {
    planId:    (d.planId  as PlanId)  ?? 'free',
    billing:   (d.billing as Billing) ?? 'monthly',
    active:    d.active ?? true,
    startedAt: d.startedAt?.toDate?.() ?? null,
    updatedAt: d.updatedAt?.toDate?.() ?? null,
  }
}

/** Real-time listener for the user's plan. Returns an unsubscribe function. */
export function onUserPlanChange(
  userId: string,
  callback: (plan: UserPlan) => void,
) {
  const ref = doc(db, 'user_plans', userId)
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(DEFAULT_PLAN)
      return
    }
    const d = snap.data()
    callback({
      planId:    (d.planId  as PlanId)  ?? 'free',
      billing:   (d.billing as Billing) ?? 'monthly',
      active:    d.active ?? true,
      startedAt: d.startedAt?.toDate?.() ?? null,
      updatedAt: d.updatedAt?.toDate?.() ?? null,
    })
  })
}
