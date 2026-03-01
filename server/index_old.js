// filepath: a:\project\server\index.js
require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const Stripe  = require('stripe')
const SSLCommerzPayment = require('sslcommerz-lts')
const { v4: uuidv4 } = require('uuid')
const db = require('./db')

const app    = express()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const store_id       = process.env.SSLCOMMERZ_STORE_ID
const store_passwd   = process.env.SSLCOMMERZ_STORE_PASSWD
const is_live        = process.env.SSLCOMMERZ_IS_SANDBOX !== 'true'
const sslcz          = new SSLCommerzPayment(store_id, store_passwd, is_live)

const PORT        = process.env.PORT        || 4000
const CLIENT_URL  = process.env.CLIENT_URL  || 'http://localhost:5175'

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediMind backend is running' })
})

// ── Plan pricing (must match frontend) ───────────────────────────────────────
const PLAN_PRICES = {
  standard: { monthly: 9,   yearly: 84  },
  premium:  { monthly: 19,  yearly: 180 },
}

// ══════════════════════════════════════════════════════════════════════════════
// STRIPE ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// ── 1) Create PaymentIntent ───────────────────────────────────────────────────
app.post('/api/payments/stripe/create-intent', async (req, res) => {
  try {
    const { planId, billing, userId, userEmail, userName } = req.body
    if (!planId || !billing || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const amount = PLAN_PRICES[planId]?.[billing]
    if (!amount) {
      return res.status(400).json({ error: 'Invalid plan or billing cycle' })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // cents
      currency: 'usd',
      metadata: { planId, billing, userId, userEmail, userName },
      description: `MediMind ${planId} (${billing})`,
    })

    // Save intent record to DB
    await db.createPayment({
      user_id: userId,
      plan_id: planId,
      billing_cycle: billing,
      amount,
      currency: 'usd',
      gateway: 'stripe',
      payment_intent_id: paymentIntent.id,
      status: 'pending',
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: 'usd',
    })
  } catch (err) {
    console.error('❌ Stripe intent error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── 2) Stripe webhook (listens to payment_intent.succeeded) ──────────────────
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    console.log('✅ PaymentIntent succeeded:', intent.id)

    // Update DB: mark as succeeded
    await db.updatePaymentStatus(intent.id, 'succeeded')

    // Optional: upgrade user plan in Firebase or Postgres users table
    const { userId, planId, billing } = intent.metadata
    console.log(`🔄 Upgrading user ${userId} to ${planId} (${billing})`)
    // TODO: call Firebase Admin SDK or direct Postgres update to set user.plan = planId
  }

  res.json({ received: true })
})

// ══════════════════════════════════════════════════════════════════════════════
// SSLCOMMERZ ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// ── 1) Initialize payment session ─────────────────────────────────────────────
app.post('/api/payments/sslcommerz/init', async (req, res) => {
  try {
    const { planId, billing, userId, userEmail, userName } = req.body
    if (!planId || !billing || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const amount = PLAN_PRICES[planId]?.[billing]
    if (!amount) {
      return res.status(400).json({ error: 'Invalid plan or billing cycle' })
    }

    const tran_id = `MEDIMIND-${Date.now()}-${uuidv4().slice(0, 8)}`

    const data = {
      total_amount: amount,
      currency: 'BDT', // SSLCommerz uses BDT (convert USD→BDT if needed: amount * 110)
      tran_id,
      success_url: `${CLIENT_URL}/payment/success?tran_id=${tran_id}`,
      fail_url:    `${CLIENT_URL}/payment/fail?tran_id=${tran_id}`,
      cancel_url:  `${CLIENT_URL}/payment/cancel?tran_id=${tran_id}`,
      ipn_url:     `${process.env.SERVER_URL || 'http://localhost:4000'}/api/payments/sslcommerz/ipn`,
      product_name: `MediMind ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
      product_category: 'Subscription',
      product_profile: 'general',
      cus_name: userName,
      cus_email: userEmail,
      cus_add1: 'N/A',
      cus_city: 'N/A',
      cus_country: 'Bangladesh',
      cus_phone: 'N/A',
      shipping_method: 'NO',
    }

    const apiResponse = await sslcz.init(data)

    if (apiResponse.status === 'SUCCESS') {
      // Save to DB with tran_id as reference
      await db.createPayment({
        user_id: userId,
        plan_id: planId,
        billing_cycle: billing,
        amount,
        currency: 'BDT',
        gateway: 'sslcommerz',
        transaction_id: tran_id,
        status: 'pending',
      })

      return res.json({
        status: 'success',
        redirectUrl: apiResponse.GatewayPageURL,
        sessionKey: apiResponse.sessionkey,
      })
    } else {
      return res.status(400).json({ status: 'fail', message: 'SSLCommerz init failed' })
    }
  } catch (err) {
    console.error('❌ SSLCommerz init error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── 2) IPN (Instant Payment Notification) ────────────────────────────────────
app.post('/api/payments/sslcommerz/ipn', async (req, res) => {
  try {
    const { tran_id, status, val_id } = req.body
    console.log('📥 SSLCommerz IPN received:', { tran_id, status, val_id })

    if (status === 'VALID' || status === 'VALIDATED') {
      // Validate with SSLCommerz server
      const validation = await sslcz.validate({ val_id })
      if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
        await db.updatePaymentStatusByTxn(tran_id, 'succeeded')
        console.log(`✅ Payment ${tran_id} validated and marked succeeded`)
        // TODO: upgrade user plan in DB
      }
    } else {
      await db.updatePaymentStatusByTxn(tran_id, 'failed')
      console.log(`❌ Payment ${tran_id} failed`)
    }

    res.status(200).send('OK')
  } catch (err) {
    console.error('❌ SSLCommerz IPN error:', err)
    res.status(500).send('Error')
  }
})

// ── 3) Success callback (user redirected here) ────────────────────────────────
app.get('/api/payments/sslcommerz/success', async (req, res) => {
  const { tran_id } = req.query
  console.log('✅ SSLCommerz success callback:', tran_id)
  // Optionally mark as succeeded (IPN is more reliable)
  await db.updatePaymentStatusByTxn(tran_id, 'succeeded')
  res.redirect(`${CLIENT_URL}/payment/success?tran_id=${tran_id}`)
})

// ── 4) Fail callback ──────────────────────────────────────────────────────────
app.get('/api/payments/sslcommerz/fail', async (req, res) => {
  const { tran_id } = req.query
  console.log('❌ SSLCommerz fail callback:', tran_id)
  await db.updatePaymentStatusByTxn(tran_id, 'failed')
  res.redirect(`${CLIENT_URL}/payment/fail?tran_id=${tran_id}`)
})

// ── 5) Cancel callback ────────────────────────────────────────────────────────
app.get('/api/payments/sslcommerz/cancel', async (req, res) => {
  const { tran_id } = req.query
  console.log('⚠️  SSLCommerz cancel callback:', tran_id)
  await db.updatePaymentStatusByTxn(tran_id, 'cancelled')
  res.redirect(`${CLIENT_URL}/payment/cancel?tran_id=${tran_id}`)
})

// ══════════════════════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`\n🚀 MediMind backend running on http://localhost:${PORT}`)
  console.log(`📡 CORS enabled for: ${CLIENT_URL}`)
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Connected' : '❌ Missing key'}`)
  console.log(`🔐 SSLCommerz: ${store_id ? '✅ Configured' : '❌ Missing credentials'}`)
  console.log(`🗄️  PostgreSQL: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing DATABASE_URL'}\n`)
})
