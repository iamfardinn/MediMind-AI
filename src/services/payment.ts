/**
 * payment.ts — Payment gateway service
 *
 * ARCHITECTURE NOTE:
 * ─────────────────────────────────────────────────────────────────────────────
 * Both Stripe and SSLCommerz require a backend server to handle secret keys.
 * This file calls YOUR backend API endpoints, which then talk to the gateways.
 *
 * Backend endpoints you need to implement:
 *   POST /api/payments/stripe/create-intent   → calls Stripe to create PaymentIntent
 *   POST /api/payments/sslcommerz/init        → calls SSLCommerz to init transaction
 *   POST /api/payments/verify                 → verify payment after callback
 *
 * For local testing, set VITE_API_URL=http://localhost:4000 in .env.local
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { loadStripe } from '@stripe/stripe-js'

const API_URL             = import.meta.env.VITE_API_URL             ?? 'http://localhost:4000'
const STRIPE_PUB_KEY      = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''
const SSLCOMMERZ_STORE_ID = import.meta.env.VITE_SSLCOMMERZ_STORE_ID   ?? ''

// Stripe singleton
export const stripePromise = loadStripe(STRIPE_PUB_KEY)

export type PlanId   = 'standard' | 'premium'
export type Gateway  = 'stripe' | 'sslcommerz'
export type Billing  = 'monthly' | 'yearly'

export interface OrderPayload {
  planId:    PlanId
  billing:   Billing
  gateway:   Gateway
  userId:    string
  userEmail: string
  userName:  string
}

export interface StripeIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
}

export interface SSLCommerzInitResponse {
  status:      'success' | 'fail'
  redirectUrl: string  // SSLCommerz hosted payment page URL
  sessionKey:  string
}

/**
 * Calls your backend to create a Stripe PaymentIntent.
 * Your backend uses the Stripe secret key to create it and returns the clientSecret.
 */
export async function createStripeIntent(payload: OrderPayload): Promise<StripeIntentResponse> {
  const res = await fetch(`${API_URL}/api/payments/stripe/create-intent`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Stripe intent failed: ${res.statusText}`)
  return res.json()
}

/**
 * Calls your backend to initialise an SSLCommerz transaction.
 * Your backend uses store_passwd to call SSLCommerz and returns the redirect URL.
 */
export async function initSSLCommerz(payload: OrderPayload): Promise<SSLCommerzInitResponse> {
  const res = await fetch(`${API_URL}/api/payments/sslcommerz/init`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`SSLCommerz init failed: ${res.statusText}`)
  return res.json()
}

export const PLAN_PRICES: Record<PlanId, Record<Billing, number>> = {
  standard: { monthly: 9,  yearly: 84  },   // $9/mo or $84/yr (7×12)
  premium:  { monthly: 19, yearly: 180 },   // $19/mo or $15×12=$180/yr
}

export const PLAN_LABELS: Record<PlanId, string> = {
  standard: 'Standard',
  premium:  'Premium',
}

export { SSLCOMMERZ_STORE_ID }
