# 🚀 SUPABASE QUICK START CARD

**Status:** ✅ Ready to use  
**Time to setup:** 15 minutes  
**Difficulty:** Easy

---

## 1️⃣ GET CREDENTIALS (2 min)

https://supabase.com → Your Project → Settings → API

Copy:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

---

## 2️⃣ ADD TO `.env.local` (1 min)

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Restart: `Ctrl+C` then `npm run dev`

---

## 3️⃣ CREATE TABLES (5 min)

Supabase → SQL Editor → Copy/paste from `SUPABASE_SETUP_GUIDE.md`:
- `chat_messages` table
- `user_vitals` table
- `user_profiles` table

---

## 4️⃣ ENABLE RLS (5 min)

Supabase → SQL Editor → Copy/paste RLS policies from setup guide

---

## 5️⃣ TEST (2 min)

Browser → F12 → Console → Should see `✅ Supabase connected!`

---

## 💻 USE IN CODE

```tsx
import { useSupabase } from '../hooks/useSupabase'

const { 
  createChatMessage,    // Save message
  fetchChatHistory,     // Load messages
  createVital,          // Save health reading
  fetchVitals,          // Get vitals
  updateProfile,        // Update profile
  isAuthenticated       // Check if logged in
} = useSupabase()

// Example: Save a message
await createChatMessage({
  role: 'user',
  content: 'Hello AI!'
})

// Example: Get history
const messages = await fetchChatHistory(50)

// Example: Save health reading
await createVital({
  date: 'Mar 17',
  heart_rate: 72,
  blood_pressure_sys: 120,
  blood_pressure_dia: 80
})
```

---

## 📚 FULL DOCS

See: `SUPABASE_SETUP_GUIDE.md`

---

## ✅ CHECKLIST

- [ ] Add credentials to `.env.local`
- [ ] Restart dev server
- [ ] Create database tables
- [ ] Enable RLS policies
- [ ] Test connection
- [ ] Integrate with Chat page (optional)

---

**DONE! You now have persistent data storage! 🎉**
