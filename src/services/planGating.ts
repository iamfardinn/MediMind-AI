// Plan-based feature gating definitions & daily message tracking

import type { PlanId } from './userPlan'

// ── Feature list ─────────────────────────────────────────────────────────────
export type Feature =
  | 'ai_chat'
  | 'health_dashboard'
  | 'health_tips'
  | 'symptom_analyzer'
  | 'unlimited_messages'
  | 'priority_ai'
  | 'health_reports'
  | 'data_export'
  | 'email_support'
  | 'dedicated_support'

// ── Per-plan access map ──────────────────────────────────────────────────────
const PLAN_FEATURES: Record<PlanId, Set<Feature>> = {
  free: new Set([
    'ai_chat',           // limited: 20 msgs/day
    'health_dashboard',
    'health_tips',
  ]),
  standard: new Set([
    'ai_chat',
    'health_dashboard',
    'health_tips',
    'symptom_analyzer',
    'unlimited_messages',
  ]),
  premium: new Set([
    'ai_chat',
    'health_dashboard',
    'health_tips',
    'symptom_analyzer',
    'unlimited_messages',
    'priority_ai',
    'health_reports',
    'data_export',
    'email_support',
    'dedicated_support',
  ]),
}

/** Check if a plan has access to a given feature */
export function hasFeature(planId: PlanId, feature: Feature): boolean {
  return PLAN_FEATURES[planId]?.has(feature) ?? false
}

// ── Daily message limit for free plan ────────────────────────────────────────
const FREE_DAILY_LIMIT = 20

function dailyKey(uid: string): string {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  return `medimind-daily-msgs-${uid}-${today}`
}

/** Get how many messages the user has sent today */
export function getDailyMessageCount(uid: string): number {
  try {
    const val = localStorage.getItem(dailyKey(uid))
    return val ? parseInt(val, 10) : 0
  } catch {
    return 0
  }
}

/** Increment today's message count by 1. Returns the new count. */
export function incrementDailyMessageCount(uid: string): number {
  const count = getDailyMessageCount(uid) + 1
  try {
    localStorage.setItem(dailyKey(uid), String(count))
  } catch { /* ignore */ }
  return count
}

/** How many messages remain for a free-plan user today */
export function getRemainingMessages(uid: string): number {
  return Math.max(0, FREE_DAILY_LIMIT - getDailyMessageCount(uid))
}

/** Whether the free user has hit their daily cap */
export function isAtDailyLimit(uid: string): boolean {
  return getDailyMessageCount(uid) >= FREE_DAILY_LIMIT
}

export { FREE_DAILY_LIMIT }
