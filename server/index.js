// MediMind AI — Express Payment Backend
require('dotenv').config()

const express = require('express')
const cors    = require('cors')
const { v4: uuidv4 } = require('uuid')
const db = require('./db')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Stripe (graceful if key missing) ─────────────────────────────────────────
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || ''
let stripe = null
if (STRIPE_KEY.startsWith('sk_')) {
  stripe = require('stripe')(STRIPE_KEY)
}

// ── SSLCommerz (graceful if credentials missing) ─────────────────────────────
const SSL_STORE_ID     = process.env.SSLCOMMERZ_STORE_ID       || ''
const SSL_STORE_PASSWD = process.env.SSLCOMMERZ_STORE_PASSWORD || ''
const SSL_IS_LIVE      = process.env.SSLCOMMERZ_IS_LIVE === 'true'
const sslEnabled       = SSL_STORE_ID && SSL_STORE_PASSWD && !SSL_STORE_ID.includes('your_')
let SSLCommerzPayment  = null
if (sslEnabled) {
  SSLCommerzPayment = require('sslcommerz-lts')
}

// ── Plan pricing ─────────────────────────────────────────────────────────────
const PLAN_AMOUNTS_CENTS = {
  standard: { monthly: 900,  yearly: 8400  },
  premium:  { monthly: 1900, yearly: 18000 },
}
const PLAN_AMOUNTS_USD = {
  standard: { monthly: 9,  yearly: 84  },
  premium:  { monthly: 19, yearly: 180 },
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5175',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MediMind Payment API',
    stripe: !!stripe,
    sslcommerz: sslEnabled,
  })
})

// ═════════════════════════════════════════════════════════════════════════════
// STRIPE
// ═════════════════════════════════════════════════════════════════════════════

app.post('/api/payments/stripe/create-intent', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to server/.env' })
  }

  try {
    const { planId, billing, userId, userEmail, userName } = req.body

    if (!planId || !billing) {
      return res.status(400).json({ error: 'planId and billing are required' })
    }
    if (!PLAN_AMOUNTS_CENTS[planId]) {
      return res.status(400).json({ error: `Unknown planId: ${planId}` })
    }

    const amountCents = PLAN_AMOUNTS_CENTS[planId][billing]
    const amountUsd   = PLAN_AMOUNTS_USD[planId][billing]
    const tranId      = uuidv4()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: { planId, billing, userId: userId || '', userEmail: userEmail || '', userName: userName || '', tranId },
      automatic_payment_methods: { enabled: true },
      description: `MediMind ${planId} plan (${billing})`,
      receipt_email: userEmail || undefined,
    })

    // Save to PostgreSQL
    await db.insertPayment({
      tranId,
      userId:     userId || '',
      userEmail:  userEmail || '',
      userName:   userName || '',
      planId,
      billing,
      gateway:    'stripe',
      amountUsd,
      currency:   'USD',
      status:     'pending',
      stripePiId: paymentIntent.id,
    })

    console.log(`✅ [Stripe] PaymentIntent created: ${paymentIntent.id} for ${planId}/${billing}`)

    res.json({
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount:          amountCents,
      currency:        'usd',
    })
  } catch (err) {
    console.error('❌ [Stripe] create-intent error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Stripe Webhook (optional)
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.sendStatus(200)
  const sig    = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return res.sendStatus(200)

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret)
  } catch (err) {
    console.error('⚠️  Webhook sig error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const { planId, billing, userId, userEmail, tranId } = pi.metadata
    console.log(`✅ [Stripe] Payment succeeded: ${pi.id}`)

    await db.updatePaymentStatus(tranId, 'paid')
    await db.upsertUserPlan(userId, userEmail, planId, billing)
  }

  res.sendStatus(200)
})

// ═════════════════════════════════════════════════════════════════════════════
// SSLCOMMERZ
// ═════════════════════════════════════════════════════════════════════════════

app.post('/api/payments/sslcommerz/init', async (req, res) => {
  if (!sslEnabled) {
    return res.status(503).json({ error: 'SSLCommerz is not configured. Add real SSLCOMMERZ_STORE_ID & SSLCOMMERZ_STORE_PASSWORD to server/.env' })
  }

  try {
    const { planId, billing, userId, userEmail, userName } = req.body

    if (!planId || !billing) {
      return res.status(400).json({ error: 'planId and billing are required' })
    }

    const amount   = PLAN_AMOUNTS_USD[planId]?.[billing]
    if (!amount) return res.status(400).json({ error: `Unknown planId: ${planId}` })

    const tranId    = uuidv4()
    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5175'

    const data = {
      total_amount:     amount,
      currency:         'USD',
      tran_id:          tranId,
      success_url:      `${clientUrl}/payment/success?tran_id=${tranId}&plan=${planId}&billing=${billing}`,
      fail_url:         `${clientUrl}/payment/fail`,
      cancel_url:       `${clientUrl}/payment/cancel`,
      ipn_url:          `http://localhost:${PORT}/api/payments/sslcommerz/ipn`,
      product_name:     `MediMind ${planId} plan`,
      product_category: 'Software Subscription',
      product_profile:  'general',
      cus_name:         userName  || 'Customer',
      cus_email:        userEmail || 'customer@example.com',
      cus_add1:         'N/A',
      cus_city:         'Dhaka',
      cus_postcode:     '1000',
      cus_country:      'Bangladesh',
      cus_phone:        '01700000000',
      shipping_method:  'NO',
      num_of_item:      1,
      value_a:          userId  || '',
      value_b:          planId,
      value_c:          billing,
    }

    const sslcz = new SSLCommerzPayment(SSL_STORE_ID, SSL_STORE_PASSWD, SSL_IS_LIVE)
    const apiResponse = await sslcz.init(data)

    if (apiResponse?.GatewayPageURL) {
      await db.insertPayment({
        tranId, userId, userEmail, userName, planId, billing,
        gateway: 'sslcommerz', amountUsd: amount, currency: 'USD', status: 'pending',
      })

      console.log(`✅ [SSLCommerz] Session created: ${tranId}`)
      res.json({ status: 'success', redirectUrl: apiResponse.GatewayPageURL, sessionKey: apiResponse.sessionkey || tranId })
    } else {
      console.error('❌ [SSLCommerz] No gateway URL:', apiResponse)
      res.status(500).json({ status: 'fail', error: 'SSLCommerz did not return a gateway URL' })
    }
  } catch (err) {
    console.error('❌ [SSLCommerz] init error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// SSLCommerz IPN callback
app.post('/api/payments/sslcommerz/ipn', async (req, res) => {
  try {
    const { val_id, status, tran_id, value_a: userId, value_b: planId, value_c: billing } = req.body
    console.log('[SSLCommerz] IPN:', { val_id, status, tran_id, planId, billing, userId })

    if (status === 'VALID' && sslEnabled) {
      const sslcz = new SSLCommerzPayment(SSL_STORE_ID, SSL_STORE_PASSWD, SSL_IS_LIVE)
      const validation = await sslcz.validate({ val_id })
      if (validation?.status === 'VALID') {
        await db.updatePaymentStatus(tran_id, 'paid', { sslValId: val_id, rawResponse: validation })
        await db.upsertUserPlan(userId, '', planId, billing)
        console.log(`✅ [SSLCommerz] Payment validated: ${tran_id}`)
      }
    }
    res.sendStatus(200)
  } catch (err) {
    console.error('❌ [SSLCommerz] IPN error:', err.message)
    res.sendStatus(200)
  }
})

// ── Start server ─────────────────────────────────────────────────────────────
async function start() {
  await db.initDb()

  app.listen(PORT, () => {
    console.log(`\n🚀 MediMind backend → http://localhost:${PORT}`)
    console.log(`   Stripe:     ${stripe ? '✅ ready' : '❌ set STRIPE_SECRET_KEY'}`)
    console.log(`   SSLCommerz: ${sslEnabled ? '✅ ready' : '⚠️  placeholder credentials (skipped)'}`)
    console.log(`   PostgreSQL: ✅ connected\n`)
  })
}

start().catch(err => {
  console.error('❌ Server failed to start:', err.message)
  process.exit(1)
})
