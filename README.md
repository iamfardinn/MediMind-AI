<div align="center">
  <img src="https://img.shields.io/badge/MediMind-AI-0ea5e9?style=for-the-badge&logo=brain&logoColor=white" alt="MediMind AI" />
  <h1>🧠 MediMind AI</h1>
  <p>
    <strong>A Production-Ready AI Health Dashboard & Telemedicine Platform</strong>
  </p>
  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" /></a>
    <a href="https://stripe.com/"><img src="https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white" alt="Stripe" /></a>
    <a href="https://postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  </p>
</div>

---

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Security & Best Practices](#-security--best-practices)
- [License](#-license)

---

## 🚀 About the Project

**MediMind AI** is a comprehensive, full-stack telemedicine and AI healthcare assessment platform. Built with a focus on **scalability, real-time data synchronization, and secure payment processing**, this project demonstrates production-level architectural patterns. It proves a strong understanding of how to bridge advanced frontend React patterns with secure backend microservices.

- **LLM Streaming Integration**: Low-latency medical chat powered by GPT-4o-mini with Markdown rendering.
- **Robust State Management**: Persistent, decoupled global state using Zustand.
- **Microservice-Oriented Payments**: A dedicated Node.js/Express backend purely for handling secure Stripe & SSLCommerz payment intents and webhooks.
- **Real-time Database**: Cloud Firestore integration for instant UI updates across concurrent sessions.

This repository serves as a showcase of modern web engineering capabilities, designed to stand out in technical reviews.

---

## ⚙️ System Architecture

MediMind AI utilizes a decoupled architecture separating the client-side application from the secure payment processing backend, unified by Firebase Auth and Firestore.

```mermaid
graph TD;
    Client[React/Vite Frontend] -->|Auth & DB Listener| Firebase[(Firebase Firestore)]
    Client -->|API Requests| PaymentAPI[Express Payment Backend]
    Client -->|Streaming Request| LLM[GitHub Models / OpenAI API]
    PaymentAPI -->|Create Intent| Stripe[Stripe API]
    PaymentAPI -->|Initialize| SSLCommerz[SSLCommerz API]
    PaymentAPI -->|Transaction Logs| Postgres[(PostgreSQL)]
```

---

## ✨ Key Features

### 🤖 Generative AI Medical Assistant
- **Real-Time Streaming**: Implemented OpenAI's streaming SDK to deliver zero-latency perceived response times, managing complex chunks on the client.
- **Context Preservation**: Persisted chat histories via Zustand and `localStorage` for returning users.
- **Safety Rails**: Pre-prompted LLM constraints to detect emergencies and refuse definitive medical diagnoses, ensuring ethical AI usage.

### 🩺 Multi-Step Symptom Checker
- **Form State Management**: Complex multi-step wizard handling body systems, severities, and durations cleanly.
- **Dynamic Assessment Algorithm**: AI-powered urgency detection (Routine / Moderate / Emergency) with actionable next steps mapping to UI states.

### 🩻 Doctor Consultation Booking
- **Complex Filtering Data Structures**: Browse by specialty, sorting by fees, experience, and rating using efficient array manipulations.
- **Real-Time Sync**: Appointments are persisted to Firestore with real-time snapshot listeners updating the UI instantly without manual refetching.
- **Conflict Management**: Upcoming, completed, and canceled status tracking lifecycle.

### 💳 Tiered Subscription & Payments
- **Secure Transaction Flow**: Backend-generated Stripe PaymentIntents to securely process cards without ever exposing API secrets to the client side.
- **Multi-Gateway Support**: Integrated both Stripe (Global) and SSLCommerz (Regional) to demonstrate payment gateway abstraction.
- **Webhook Handlers**: Express backend listens for Stripe Webhooks to asynchronously fulfill subscriptions and write immutable records to PostgreSQL.

---

## 🛠️ Tech Stack

### Frontend Ecosystem
- **Core**: React 19, TypeScript 5.9, Vite 7
- **Styling**: Tailwind CSS 4, Framer Motion (for hardware-accelerated micro-interactions)
- **State Management**: Zustand (with Persist Middleware)
- **Routing**: React Router DOM 7
- **Data Visualization**: Recharts

### Backend & Infrastructure
- **Server**: Node.js, Express.js (REST API design)
- **Database**: PostgreSQL 18 (Transaction logging), Firebase Firestore (Real-time application state)
- **Authentication**: Firebase Auth (OAuth2.0 Google Provider + secure Email/Password)
- **Third-Party APIs**: Stripe, SSLCommerz, OpenAI SDK

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://postgresql.org/) (v15+)
- Firebase Account (Auth & Firestore configured)
- Stripe Developer Account

### 1. Clone the repository
```bash
git clone https://github.com/your-username/medimind-ai.git
cd medimind-ai
```

### 2. Install Dependencies
```bash
# Install frontend dependencies (Vite/React)
npm install

# Install backend dependencies (Express)
cd server
npm install
cd ..
```

### 3. Database Setup (PostgreSQL)
Ensure your local PostgreSQL service is running, then initialize the database schema:
```bash
psql -U postgres -f server/setup.sql
```

### 4. Firestore Security Rules & Indexes
If deploying to a production Firebase environment, deploy the security rules and composite indexes:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore
```

### 5. Start Development Servers
```bash
# Terminal 1: Start Express Backend (Port 4000)
cd server
npm run dev

# Terminal 2: Start Vite Frontend (Port 5173)
npm run dev
```

---

## 🔐 Environment Variables

For security reasons, `.env` files are ignored by git. You must create them locally.

### Frontend (`.env.local` in root)
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Provider (GitHub Models)
VITE_GITHUB_TOKEN=your_github_token_here

# Payment gateways
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Backend Connection
VITE_API_URL=http://localhost:4000
```

### Backend (`server/.env`)
```env
# Stripe Secret (DO NOT EXPOSE TO FRONTEND)
STRIPE_SECRET_KEY=sk_test_your_secret_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Postgres Connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/medimind
PORT=4000
```

---

## 📁 Project Structure

```text
medimind-ai/
├── src/
│   ├── components/      # Reusable UI elements (Navbar, Modals, Badges)
│   ├── hooks/           # Custom React hooks (useAppointments, useAuthListener)
│   ├── pages/           # Route-level components (Dashboard, Chat, Checkout)
│   ├── services/        # External API integrations (Firebase, Stripe, AI wrappers)
│   └── store/           # Global State Management (Zustand slices)
├── server/
│   ├── index.js         # Express entry point & payment webhook controllers
│   ├── db.js            # PostgreSQL connection pool & queries
│   └── setup.sql        # Relational database schema definitions
└── docs/                # Architecture diagrams and extended documentation
```

---

## 🛡️ Security & Best Practices
- **Secret Management**: Heavy emphasis on keeping private keys (Stripe Secret, DB Credentials) strictly server-side.
- **Sanitization & Validation**: Prevents manipulation of payment amounts or bypassing subscription gateways.
- **Component Reusability**: Adherence to DRY principles, extracting repeating UI logic into configurable components.
- **Responsive by Design**: Mobile-first Tailwind CSS patterns ensuring flawless rendering across extreme viewports without relying on fixed media queries.

---

## ⚠️ Disclaimer
**MediMind AI** is an educational engineering portfolio project. It is **not** a diagnostic medical tool. The AI models can hallucinate. Always consult a licensed healthcare professional for medical advice.

---

<div align="center">
  <p>Engineered with dedication by <strong>Fahim Abrar</strong>.</p>
  <p>If you find this project interesting or helpful, consider giving it a ⭐!</p>
</div>
