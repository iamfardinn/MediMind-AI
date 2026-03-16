// db.js — PostgreSQL connection pool + schema bootstrap
require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // In production add: ssl: { rejectUnauthorized: false }
})

// ── Auto-create tables on first run ──────────────────────────────────────────
async function initDb() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id            SERIAL PRIMARY KEY,
        tran_id       TEXT UNIQUE NOT NULL,
        user_id       TEXT,
        user_email    TEXT,
        user_name     TEXT,
        plan_id       TEXT        NOT NULL,
        billing       TEXT        NOT NULL,
        gateway       TEXT        NOT NULL,   -- 'stripe' | 'sslcommerz'
        amount_usd    NUMERIC(10,2),
        currency      TEXT        DEFAULT 'USD',
        status        TEXT        DEFAULT 'pending',  -- pending | paid | failed | cancelled
        stripe_pi_id  TEXT,                  -- Stripe paymentIntent id
        ssl_val_id    TEXT,                  -- SSLCommerz val_id
        raw_response  JSONB,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_plans (
        user_id      TEXT PRIMARY KEY,
        user_email   TEXT,
        plan_id      TEXT DEFAULT 'free',
        billing      TEXT DEFAULT 'monthly',
        active       BOOLEAN DEFAULT TRUE,
        started_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log('✅ PostgreSQL tables ready')
  } catch (err) {
    console.error('⚠️  PostgreSQL init error (payments will still work without DB):', err.message)
  } finally {
    client.release()
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function insertPayment(data) {
  try {
    await pool.query(`
      INSERT INTO payments
        (tran_id, user_id, user_email, user_name, plan_id, billing, gateway, amount_usd, currency, status, stripe_pi_id, raw_response)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (tran_id) DO NOTHING
    `, [
      data.tranId, data.userId, data.userEmail, data.userName,
      data.planId, data.billing, data.gateway,
      data.amountUsd, data.currency || 'USD',
      data.status || 'pending',
      data.stripePiId || null,
      data.rawResponse ? JSON.stringify(data.rawResponse) : null,
    ])
  } catch (err) {
    console.error('[DB] insertPayment error:', err.message)
  }
}

async function updatePaymentStatus(tranId, status, extraFields = {}) {
  try {
    const { sslValId, rawResponse } = extraFields
    await pool.query(`
      UPDATE payments
      SET status = $1,
          ssl_val_id   = COALESCE($2, ssl_val_id),
          raw_response = COALESCE($3, raw_response),
          updated_at   = NOW()
      WHERE tran_id = $4
    `, [status, sslValId || null, rawResponse ? JSON.stringify(rawResponse) : null, tranId])
  } catch (err) {
    console.error('[DB] updatePaymentStatus error:', err.message)
  }
}

async function upsertUserPlan(userId, userEmail, planId, billing) {
  try {
    await pool.query(`
      INSERT INTO user_plans (user_id, user_email, plan_id, billing, active, started_at, updated_at)
      VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE
        SET plan_id    = EXCLUDED.plan_id,
            billing    = EXCLUDED.billing,
            user_email = EXCLUDED.user_email,
            active     = TRUE,
            updated_at = NOW()
    `, [userId, userEmail, planId, billing])
  } catch (err) {
    console.error('[DB] upsertUserPlan error:', err.message)
  }
}

module.exports = { pool, initDb, insertPayment, updatePaymentStatus, upsertUserPlan }
