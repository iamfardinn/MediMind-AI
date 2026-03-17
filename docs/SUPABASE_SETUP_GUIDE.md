# Supabase Integration Setup Guide

## ✅ Installation Complete

Supabase has been installed and integrated into your MediMind AI project!

---

## 🚀 Quick Setup (5 minutes)

### 1. Get Your Supabase Credentials

1. Go to **https://supabase.com** and log in
2. Click on your **project** in the dashboard
3. Go to **Settings → API** (left sidebar)
4. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon public key** (under "Project API keys")

### 2. Add Credentials to `.env.local`

Edit `a:\project\.env.local` and replace:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

**Save the file and restart the dev server:**

```powershell
# Press Ctrl+C to stop the dev server, then:
npm run dev
```

---

## 📊 Create Required Tables in Supabase

In your Supabase dashboard, go to **SQL Editor** and run these queries:

### Chat Messages Table

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

### User Vitals Table

```sql
CREATE TABLE user_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  heart_rate INTEGER,
  blood_pressure_sys INTEGER,
  blood_pressure_dia INTEGER,
  temperature DECIMAL(4,1),
  oxygen_sat INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_vitals_user_id ON user_vitals(user_id);
CREATE INDEX idx_user_vitals_created_at ON user_vitals(created_at);
```

### User Profiles Table

```sql
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  plan_id TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
```

---

## 🔒 Set Row-Level Security (RLS) Policies

For each table, enable RLS and add policies:

### For `chat_messages` table:

```sql
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own messages"
ON chat_messages FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own messages"
ON chat_messages FOR SELECT
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own messages"
ON chat_messages FOR DELETE
USING (user_id = auth.uid()::text);
```

### For `user_vitals` table:

```sql
ALTER TABLE user_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own vitals"
ON user_vitals FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own vitals"
ON user_vitals FOR SELECT
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own vitals"
ON user_vitals FOR DELETE
USING (user_id = auth.uid()::text);
```

### For `user_profiles` table:

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own profile"
ON user_profiles FOR INSERT
WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (id = auth.uid()::text);

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);
```

---

## 💻 Use Supabase in Your Code

### Option 1: Use the Hook (Recommended)

```tsx
import { useSupabase } from '../hooks/useSupabase'

export function MyComponent() {
  const { createChatMessage, fetchChatHistory, user, isAuthenticated } = useSupabase()

  // Save a message
  const handleSave = async () => {
    const result = await createChatMessage({
      role: 'user',
      content: 'Hello, AI!'
    })
    console.log('Saved:', result)
  }

  // Fetch history
  const handleFetch = async () => {
    const messages = await fetchChatHistory(50)
    console.log('Messages:', messages)
  }

  return (
    <div>
      <button onClick={handleSave}>Save Message</button>
      <button onClick={handleFetch}>Load Messages</button>
      <p>User: {user?.email}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

### Option 2: Use the Service Directly

```tsx
import { saveChatMessage, getChatHistory } from '../services/supabase'

// Save a message
const result = await saveChatMessage(userId, {
  role: 'user',
  content: 'Hello!'
})

// Get history
const messages = await getChatHistory(userId, 50)
```

---

## 📝 Example: Save Chat Messages

Here's how to integrate with the Chat page (recommended future enhancement):

```tsx
// In Chat.tsx, after a message is sent:
import { useSupabase } from '../hooks/useSupabase'

const handleSend = async () => {
  const text = input.trim()
  if (!text || isStreaming) return

  // Add to local store
  addMessage({ role: 'user', content: text })

  // Save to Supabase
  if (user) {
    await createChatMessage({
      role: 'user',
      content: text
    })
  }

  setInput('')
  setStreaming(true)

  // ... rest of send logic
}
```

---

## 🧪 Test the Connection

Add this temporary code to a component to test:

```tsx
import { useEffect } from 'react'
import { useSupabase } from '../hooks/useSupabase'

export function SupabaseTest() {
  const { fetchProfile, isAuthenticated } = useSupabase()

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated')
      return
    }

    async function test() {
      const profile = await fetchProfile()
      console.log('✅ Supabase connected! Profile:', profile)
    }
    test()
  }, [isAuthenticated, fetchProfile])

  return <p>Check browser console for test result</p>
}
```

---

## 🔧 Available Functions

### Chat Messages

```typescript
// Save a message
await createChatMessage({ role: 'user', content: 'Hello' })

// Get chat history
const messages = await fetchChatHistory(50) // optional limit

// Delete a message
await removeChatMessage(messageId)
```

### Vitals

```typescript
// Save a vital reading
await createVital({
  date: 'Mar 17',
  heart_rate: 72,
  blood_pressure_sys: 120,
  blood_pressure_dia: 80,
  temperature: 98.6,
  oxygen_sat: 98
})

// Get vitals
const vitals = await fetchVitals(30) // optional limit
```

### User Profile

```typescript
// Update profile
await updateProfile({
  display_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
  plan_id: 'premium'
})

// Get profile
const profile = await fetchProfile()
```

---

## 🆘 Troubleshooting

### "Missing Supabase env vars" warning

**Solution:** Make sure you added `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` and restarted the dev server.

### "CORS error" or "permission denied"

**Solution:** 
1. Check that RLS policies are set correctly
2. Make sure policies reference `auth.uid()::text` (not `auth.uid()`)
3. Verify user is authenticated before making queries

### Queries return empty

**Solution:**
1. Verify you're authenticated (check `user` in console)
2. Check RLS policies allow the operation
3. Verify data exists in Supabase SQL Editor

### Table doesn't exist

**Solution:** Run the SQL queries from "Create Required Tables" section above.

---

## 📚 Files Added/Modified

**New Files:**
- `src/services/supabase.ts` - Supabase client and functions
- `src/hooks/useSupabase.ts` - React hook for easier usage

**Modified Files:**
- `.env.local` - Added Supabase env variables
- `package.json` - Added @supabase/supabase-js dependency

---

## ✨ What's Ready to Use

✅ **Chat message storage** - Save and retrieve conversations  
✅ **Vitals tracking** - Store health readings  
✅ **User profiles** - Store user information  
✅ **Secure access** - Row-level security policies  
✅ **Real-time ready** - Can add real-time subscriptions  

---

## 🚀 Next Steps

1. **Add credentials** (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
2. **Create tables** (Run SQL queries in Supabase)
3. **Set RLS policies** (Secure your data)
4. **Test connection** (Use the test component)
5. **Integrate with Chat page** (Save messages to Supabase)

---

## 📖 More Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase JS Client:** https://github.com/supabase/supabase-js
- **React Integration:** https://supabase.com/docs/guides/getting-started/quickstarts/reactjs

---

**Status:** ✅ Ready to connect and use!
