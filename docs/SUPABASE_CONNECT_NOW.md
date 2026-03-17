# 🎯 DO THIS RIGHT NOW - 3 SIMPLE STEPS

**You have 5 minutes. Let's go!**

---

## ✅ YOU DID: Added Credentials
**Good! Now finish the job.**

---

## 🔴 STEP 1: Create Tables (3 minutes)

### A. Open Supabase
```
1. Go to → https://supabase.com
2. Sign in
3. Click your PROJECT NAME
4. Look left → SQL Editor
5. Click "+ New Query"
```

### B. Copy This SQL (select all, copy)

```sql
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_chat_messages_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);

CREATE TABLE IF NOT EXISTS user_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  heart_rate INTEGER,
  blood_pressure_sys INTEGER,
  blood_pressure_dia INTEGER,
  temperature DECIMAL(4,1),
  oxygen_sat INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_vitals_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_vitals_user_id ON user_vitals(user_id);

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan_id TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
```

### C. Paste & Run
```
1. Paste into the SQL editor
2. Click green ▶ RUN button
3. Wait for ✓ Success
```

**Done with Step 1!**

---

## 🟡 STEP 2: Restart Your App (1 minute)

In your terminal:
```powershell
Ctrl + C   (stop the dev server)
npm run dev  (restart it)
```

Wait for it to say: `VITE v... ready in ...`

**Done with Step 2!**

---

## 🟢 STEP 3: Test It (1 minute)

Open your app in browser.

Press **F12** to open Developer Tools.

Go to **Console** tab.

Paste and run:

```javascript
console.log('Testing Supabase connection...');
import { supabase } from './src/services/supabase.ts';
const { data, error } = await supabase.from('chat_messages').select('*').limit(1);
console.log(error ? '❌ Error: ' + error.message : '✅ Success! Connected to Supabase');
```

You should see: **✅ Success! Connected to Supabase**

**Done! You're connected!**

---

## 🎉 NOW YOU CAN USE IT

In any component:

```typescript
import { useSupabase } from '@/hooks/useSupabase'

export function MyComponent() {
  const { createChatMessage, createVital, fetchChatHistory } = useSupabase()

  // Save a message
  await createChatMessage({ role: 'user', content: 'Hello!' })

  // Save a vital
  await createVital({ date: 'Mar 17', heart_rate: 72 })

  // Get messages
  const messages = await fetchChatHistory(50)

  return <div>Ready to use Supabase!</div>
}
```

---

## ⚠️ IF SOMETHING FAILS

**Error 1:** "relation 'auth.users' does not exist"
→ Supabase Auth not enabled
→ Go to Supabase dashboard → Check Authentication sidebar is there
→ Try again

**Error 2:** "already exists"
→ Tables already created, that's good!
→ Skip and move on

**Connection fails in console test?**
→ Make sure you ran `npm run dev` to restart
→ Check browser console for full error
→ Check `.env.local` has the credentials

---

## ✅ CHECKLIST

- [x] Added credentials to `.env.local`
- [ ] Copied SQL
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked RUN (got ✓ Success)
- [ ] Restarted app (`npm run dev`)
- [ ] Tested in browser console (got ✅)

---

**THAT'S IT! You're done!** 🎉

Your Supabase is now connected to your app. Start using `useSupabase()` in your components!

---

## 📚 MORE INFO

- Full guide: `SUPABASE_QUICK_START_SIMPLE.md`
- Examples: `SUPABASE_QUICK_START_SIMPLE.md` → "HOW TO USE IN YOUR CODE"
- Detailed help: `STEP_3_QUICK_REFERENCE.md`

---

**Questions? Read SUPABASE_QUICK_START_SIMPLE.md** 

**Ready to build? Start using useSupabase() now!** 🚀
