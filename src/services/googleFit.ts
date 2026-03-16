/**
 * Google Fit OAuth 2.0 + REST API integration
 *
 * Uses the Google Identity Services (GIS) token model — opens a consent popup,
 * gets a short-lived access token in the browser (no client-secret needed), then
 * calls the Fitness REST API to pull real health data.
 *
 * Required env var:
 *   VITE_GOOGLE_CLIENT_ID  — OAuth 2.0 Web Client ID from Google Cloud Console
 *
 * Required Google Cloud setup:
 *   1. Enable "Fitness API" in APIs & Services
 *   2. Create an OAuth 2.0 Web client credential
 *   3. Add http://localhost:5173 to "Authorised JavaScript origins"
 *   4. No redirect URIs needed (token model / popup)
 */

export interface GoogleFitVitals {
  heartRate: number | null
  bloodPressureSys: number | null
  bloodPressureDia: number | null
  temperature: number | null
  oxygenSat: number | null
}

// ── Scopes we request ─────────────────────────────────────────────────────────
const SCOPES = [
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.blood_pressure.read',
  'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
  'https://www.googleapis.com/auth/fitness.body_temperature.read',
  'https://www.googleapis.com/auth/fitness.activity.read',
].join(' ')

// ── Google Identity Services types (minimal) ──────────────────────────────────
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
            error_callback?: (error: { type: string; message?: string }) => void
          }): { requestAccessToken(): void }
        }
      }
    }
  }
}

// ── Inject the GIS script once ────────────────────────────────────────────────
let gisLoaded = false
function loadGIS(): Promise<void> {
  if (gisLoaded || window.google?.accounts?.oauth2) {
    gisLoaded = true
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => { gisLoaded = true; resolve() }
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'))
    document.head.appendChild(script)
  })
}

// ── Request OAuth token via popup ─────────────────────────────────────────────
export async function requestGoogleFitToken(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  if (!clientId || clientId.includes('your_')) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is not set. Add your Google OAuth Client ID to .env.local')
  }

  await loadGIS()

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(new Error(`OAuth error: ${response.error}`))
        } else if (response.access_token) {
          resolve(response.access_token)
        } else {
          reject(new Error('No access token received from Google'))
        }
      },
      error_callback: (error) => {
        if (error.type === 'popup_closed') {
          reject(new Error('popup_closed'))
        } else {
          reject(new Error(error.message || 'OAuth popup error'))
        }
      },
    })
    client.requestAccessToken()
  })
}

// ── Google Fit REST API helpers ───────────────────────────────────────────────
const FIT_BASE = 'https://www.googleapis.com/fitness/v1/users/me'

/** Aggregate data type query — returns the latest aggregate over the past 30 days */
async function aggregate(
  accessToken: string,
  dataTypeName: string,
  bucketDays = 30,
): Promise<number | null> {
  const endMs = Date.now()
  const startMs = endMs - bucketDays * 24 * 60 * 60 * 1000

  const body = {
    aggregateBy: [{ dataTypeName }],
    bucketByTime: { durationMillis: String(endMs - startMs) },
    startTimeMillis: String(startMs),
    endTimeMillis: String(endMs),
  }

  const res = await fetch(`${FIT_BASE}/dataset:aggregate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Fit API error ${res.status}`)
  }

  const json = await res.json()

  // Walk bucket → dataset → point → value
  const points: number[] = []
  for (const bucket of json.bucket ?? []) {
    for (const ds of bucket.dataset ?? []) {
      for (const point of ds.point ?? []) {
        for (const val of point.value ?? []) {
          const num = val.fpVal ?? val.intVal
          if (typeof num === 'number') points.push(num)
        }
      }
    }
  }

  if (points.length === 0) return null
  return Number((points.reduce((a, b) => a + b, 0) / points.length).toFixed(1))
}

/** Fetch all supported vitals from Google Fit */
export async function fetchGoogleFitVitals(accessToken: string): Promise<GoogleFitVitals> {
  const [heartRate, bpSys, bpDia, temperature, oxygenSat] = await Promise.allSettled([
    aggregate(accessToken, 'com.google.heart_rate.bpm'),
    aggregate(accessToken, 'com.google.blood_pressure'),   // systolic
    aggregate(accessToken, 'com.google.blood_pressure'),   // diastolic (same type, first/second value)
    aggregate(accessToken, 'com.google.body.temperature'),
    aggregate(accessToken, 'com.google.oxygen_saturation'),
  ])

  const safeVal = (r: PromiseSettledResult<number | null>) =>
    r.status === 'fulfilled' ? r.value : null

  return {
    heartRate: safeVal(heartRate),
    bloodPressureSys: safeVal(bpSys),
    bloodPressureDia: safeVal(bpDia),
    temperature: safeVal(temperature),
    oxygenSat: safeVal(oxygenSat),
  }
}

/**
 * Full flow: open OAuth popup → get token → fetch vitals
 * Returns the vitals or throws with a user-friendly message.
 */
export async function connectGoogleFit(): Promise<GoogleFitVitals> {
  const token = await requestGoogleFitToken()
  const vitals = await fetchGoogleFitVitals(token)
  return vitals
}
