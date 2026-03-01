<p align="center">
  <img src="https://img.shields.io/badge/MediMind-AI-0ea5e9?style=for-the-badge&logo=brain&logoColor=white" alt="MediMind AI" />
</p>

<h1 align="center">🧠 MediMind AI</h1>

<p align="center">
  <strong>An AI-powered health dashboard with real-time medical chat, symptom analysis, vitals tracking, and payment integration.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
</p>

---

## ✨ Features

### 🤖 AI Medical Assistant
- Real-time streaming chat powered by **GPT-4o-mini** (via GitHub Models) with markdown rendering
- Context-aware medical responses with safety guidelines and emergency detection
- Chat history persistence via Zustand + localStorage

### 🩺 Symptom Checker
- Multi-step symptom analysis with body system selection, severity rating, and duration tracking
- AI-powered urgency detection (Emergency / Moderate / Routine)
- Structured medical assessments with possible conditions, warning signs, and action steps

### 📊 Vitals Dashboard
- Interactive health metrics — heart rate, blood pressure, temperature, oxygen saturation
- Trend visualization with **Recharts** (line charts, area charts)
- Client management overview with status tracking

### 👤 My Dashboard (Personalized)
- Full-page user dashboard with 5 tabs: Overview, Chat History, My Plan, AI Insights, Medications
- Profile card with avatar, plan badge, verified status, and dynamic "Days Active" counter
- AI-extracted recommendations and medication references from chat history
- Plan details pulled in real-time from Firestore

### 🔐 Authentication
- **Firebase Auth** — email/password sign-up & sign-in
- **Google OAuth** — one-click Google sign-in
- Persistent sessions with auto-restore on page refresh
- User data stored in Firestore (`users` collection)

### 💳 Payments & Pricing
- **3-tier pricing** — Free, Standard ($19/mo), Premium ($39/mo) with annual billing discounts
- **Stripe** — full card payment flow with PaymentIntent + Stripe Elements
- **SSLCommerz** — alternative payment gateway with redirect flow
- Payment records stored in **PostgreSQL** + plan synced to **Firestore**
- Success / Fail / Cancel callback pages

### 🎨 UI/UX
- Dark-themed, glassmorphic design with gradient accents
- Smooth page transitions and micro-animations via **Framer Motion**
- Fully responsive — mobile hamburger menu + desktop nav
- Avatar dropdown with profile info, plan badge, and quick actions

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4 |
| **State** | Zustand (persisted stores for auth, chat, vitals) |
| **Routing** | React Router DOM 7 |
| **AI** | OpenAI SDK → GPT-4o-mini via GitHub Models |
| **Auth & DB** | Firebase Auth, Firestore |
| **Payments** | Stripe (Elements + PaymentIntent), SSLCommerz |
| **Backend** | Express.js, PostgreSQL 18, Node.js |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Markdown** | react-markdown |

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   └── Navbar.tsx              # Top nav with auth-aware links & avatar dropdown
│   ├── hooks/
│   │   ├── useAuthListener.ts      # Firebase auth state observer
│   │   └── useUserPlan.ts          # Real-time Firestore plan listener
│   ├── pages/
│   │   ├── Dashboard.tsx           # Home — vitals charts, stats, client list
│   │   ├── Chat.tsx                # AI medical chat with streaming
│   │   ├── SymptomChecker.tsx      # Multi-step symptom analyzer
│   │   ├── Pricing.tsx             # 3-tier pricing page with FAQ
│   │   ├── Checkout.tsx            # Stripe / SSLCommerz payment flow
│   │   ├── MyDashboard.tsx         # Personalized user dashboard (5 tabs)
│   │   ├── Login.tsx               # Email/password + Google auth
│   │   ├── PaymentSuccess.tsx      # Post-payment success handler
│   │   ├── PaymentFail.tsx         # Payment failure page
│   │   └── PaymentCancel.tsx       # Payment cancellation page
│   ├── services/
│   │   ├── copilot.ts              # GPT-4o-mini streaming via GitHub Models
│   │   ├── gemini.ts               # Gemini 1.5 Flash (alternate AI provider)
│   │   ├── firebase.ts             # Firebase app, auth, Firestore init
│   │   ├── payment.ts              # Stripe & SSLCommerz client helpers
│   │   └── userPlan.ts             # Firestore CRUD for user plans
│   └── store/
│       ├── useAuthStore.ts         # Auth state (Zustand + persist)
│       └── useChatStore.ts         # Chat messages + vitals (Zustand + persist)
├── server/
│   ├── index.js                    # Express API — Stripe, SSLCommerz, user endpoints
│   ├── db.js                       # PostgreSQL pool + query helpers
│   └── setup.sql                   # Database schema (payments table)
└── public/
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 15
- **Firebase project** with Auth + Firestore enabled
- **Stripe account** (test mode)
- **GitHub token** for AI (GitHub Models access)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/medimind-ai.git
cd medimind-ai
```

### 2. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 3. Set up environment variables

Create **`.env.local`** in the project root:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI
VITE_GITHUB_TOKEN=your_github_token

# Stripe (publishable key)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend URL
VITE_API_URL=http://localhost:4000
```

Create **`server/.env`**:

```env
STRIPE_SECRET_KEY=sk_test_...
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_SANDBOX=true
DATABASE_URL=postgresql://postgres:password@localhost:5432/medimind
PORT=4000
```

### 4. Set up PostgreSQL

```bash
psql -U postgres -f server/setup.sql
```

### 5. Run the app

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📸 Pages Overview

| Page | Route | Description |
|---|---|---|
| Home | `/` | Vitals dashboard, health stats, client list, reviews |
| AI Chat | `/chat` | Streaming AI medical assistant |
| Symptom Checker | `/symptoms` | Multi-step symptom analysis with urgency detection |
| Pricing | `/pricing` | Plan comparison with billing toggle & FAQ |
| Checkout | `/checkout` | Stripe / SSLCommerz payment flow |
| My Dashboard | `/my-dashboard` | Personalized user dashboard (auth required) |
| Login | `/login` | Email/password & Google sign-in |

---

## 🔒 Security Notes

- Firebase Auth handles all authentication — no passwords stored in the app
- Stripe payments use PaymentIntent (server-side secret key never exposed to client)
- API keys are loaded from environment variables (`.env.local` / `server/.env`)
- All `.env` files are gitignored

---

## ⚠️ Disclaimer

MediMind AI is an **educational/portfolio project**. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.

---

## 📄 License

This project is for educational and portfolio purposes.

---

<p align="center">
  Built with ❤️ by <strong>Fahim Abrar</strong>
</p>
