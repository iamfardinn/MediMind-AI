# Step 3: Create Database Tables - COMPLETE GUIDE

**Time to Complete:** 5-10 minutes  
**Difficulty Level:** Easy (copy-paste)  
**Prerequisites:** Supabase account with credentials in `.env.local`

---

## 📊 What We're Creating

You'll create 3 tables in your Supabase database:

| Table | Purpose | Records |
|-------|---------|---------|
| **chat_messages** | Store all chat conversations | User ↔ AI messages |
| **user_vitals** | Store health metrics | Heart rate, BP, temp, O₂ |
| **user_profiles** | Store user accounts | Email, name, avatar, plan |

---

## 🚀 QUICK START (3 Steps)

### Step 1: Open Supabase SQL Editor

```
1. Go to → https://supabase.com
2. Click your project name
3. Left sidebar → "SQL Editor"
4. Click "+ New Query"
```

### Step 2: Copy & Paste SQL

The complete SQL is in `SUPABASE_CREATE_TABLES.sql` in your project root.

**Option A: Copy from file**
- Open `SUPABASE_CREATE_TABLES.sql` in your code editor
- Copy the entire file

**Option B: Copy from below** (see sections below)

### Step 3: Run & Verify

```
1. Paste SQL into Supabase SQL Editor
2. Click "▶ RUN" button (top right)
3. Look for "✓ Success" message
4. Go to "Table Editor" to verify tables exist
```

---

## 📋 TABLE 1: Chat Messages

### What This Table Stores
All messages in conversations between users and the AI assistant.

### SQL to Run

```sql
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_chat_messages_user FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_date ON chat_messages(user_id, created_at DESC);
```

### Column Breakdown

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Unique message ID (auto) | `550e8400-e29b-41d4-a716-446655440000` |
| `user_id` | TEXT | Firebase user ID | `abc123xyz789` |
| `role` | TEXT | "user" or "assistant" | `"assistant"` |
| `content` | TEXT | Message text | `"Your heart rate is 72 BPM"` |
| `created_at` | TIMESTAMP | When message was sent (auto) | `2024-03-17 14:32:00` |

### How to Execute

```
1. Clear any previous SQL from editor
2. Copy the SQL block above
3. Paste into Supabase SQL Editor
4. Click the green "▶ RUN" button
5. Wait for "✓ Success" message
```

### ✅ Success Indicator
You should see:
- Green checkmark (✓)
- Message like: "Successfully executed 4 commands"
- No error messages

---

## 📋 TABLE 2: User Vitals

### What This Table Stores
Health measurements: heart rate, blood pressure, temperature, oxygen levels

### SQL to Run

```sql
CREATE TABLE IF NOT EXISTS user_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  heart_rate INTEGER CHECK (heart_rate >= 0 AND heart_rate <= 300),
  blood_pressure_sys INTEGER CHECK (blood_pressure_sys >= 0 AND blood_pressure_sys <= 300),
  blood_pressure_dia INTEGER CHECK (blood_pressure_dia >= 0 AND blood_pressure_dia <= 200),
  temperature DECIMAL(4,1) CHECK (temperature >= 85 AND temperature <= 110),
  oxygen_sat INTEGER CHECK (oxygen_sat >= 0 AND oxygen_sat <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_vitals_user FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_vitals_user_id ON user_vitals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vitals_created_at ON user_vitals(created_at);
CREATE INDEX IF NOT EXISTS idx_user_vitals_user_date ON user_vitals(user_id, created_at DESC);
```

### Column Breakdown

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Unique vital reading ID (auto) | `550e8400-e29b-41d4-a716-446655440000` |
| `user_id` | TEXT | Firebase user ID | `abc123xyz789` |
| `date` | TEXT | Date of reading | `"Mar 17, 2024"` |
| `heart_rate` | INTEGER | Beats per minute | `72` |
| `blood_pressure_sys` | INTEGER | Systolic (top number) | `120` |
| `blood_pressure_dia` | INTEGER | Diastolic (bottom number) | `80` |
| `temperature` | DECIMAL | Fahrenheit | `98.6` |
| `oxygen_sat` | INTEGER | SpO₂ percentage | `95` |
| `created_at` | TIMESTAMP | When recorded (auto) | `2024-03-17 14:32:00` |

### Data Validation
Each column has CHECK constraints to prevent invalid data:
- Heart rate: 0-300 BPM
- Blood pressure: 0-300 (sys), 0-200 (dia)
- Temperature: 85-110°F
- Oxygen: 0-100%

### How to Execute

```
1. Click "▶ RUN" on your previous success
2. Click "+ New Query" to add a new query
3. Copy the SQL block above
4. Paste and click "▶ RUN"
5. Wait for "✓ Success"
```

---

## 📋 TABLE 3: User Profiles

### What This Table Stores
User account info: email, display name, avatar, subscription plan

### SQL to Run

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan_id TEXT DEFAULT 'free' CHECK (plan_id IN ('free', 'standard', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_id ON user_profiles(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
```

### Column Breakdown

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | TEXT | Firebase user ID (Primary Key) | `abc123xyz789` |
| `email` | TEXT | User email (unique) | `john@example.com` |
| `display_name` | TEXT | User's full name | `"John Doe"` |
| `avatar_url` | TEXT | Link to profile picture | `"https://...jpg"` |
| `plan_id` | TEXT | Subscription plan | `"free"` or `"premium"` |
| `created_at` | TIMESTAMP | Account creation (auto) | `2024-03-17 10:00:00` |
| `updated_at` | TIMESTAMP | Last update (auto) | `2024-03-17 14:32:00` |

### Available Plans
```
"free"     → Free tier
"standard" → $9.99/month
"premium"  → $29.99/month
```

### How to Execute

```
1. Click "+ New Query" again
2. Copy the SQL block above
3. Paste and click "▶ RUN"
4. Wait for "✓ Success"
```

---

## ✅ VERIFY ALL TABLES WERE CREATED

### Method 1: Check in Table Editor

```
1. Left sidebar → "Table Editor"
2. Expand the list under "public"
3. Look for:
   ✓ chat_messages
   ✓ user_vitals
   ✓ user_profiles
```

### Method 2: Run Verification Query

In SQL Editor, run:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_messages', 'user_vitals', 'user_profiles')
ORDER BY table_name;
```

Expected output:
```
chat_messages
user_profiles
user_vitals
```

### Method 3: Check Individual Tables

Click on each table in Table Editor to verify columns:

**chat_messages columns:**
- [ ] id
- [ ] user_id
- [ ] role
- [ ] content
- [ ] created_at

**user_vitals columns:**
- [ ] id
- [ ] user_id
- [ ] date
- [ ] heart_rate
- [ ] blood_pressure_sys
- [ ] blood_pressure_dia
- [ ] temperature
- [ ] oxygen_sat
- [ ] created_at

**user_profiles columns:**
- [ ] id
- [ ] email
- [ ] display_name
- [ ] avatar_url
- [ ] plan_id
- [ ] created_at
- [ ] updated_at

---

## 🔍 Understanding the SQL

### PRIMARY KEY
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```
- Creates a unique ID automatically
- UUID = safer than regular numbers
- Every row gets a different ID

### NOT NULL
```sql
user_id TEXT NOT NULL
```
- Field must always have a value
- Can't be empty or blank
- Ensures data integrity

### CHECK Constraints
```sql
CHECK (role IN ('user', 'assistant'))
```
- Only allows specific values
- Prevents invalid data entry
- Validates data before saving

### FOREIGN KEY
```sql
CONSTRAINT fk_chat_messages_user FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE
```
- Links to Firebase auth.users table
- ON DELETE CASCADE = auto-delete user data if account deleted
- Safety feature against orphaned data

### INDEX
```sql
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id)
```
- Makes queries faster (like a book index)
- Important for common searches
- No downside to having them

---

## 🐛 TROUBLESHOOTING

### ❌ Error: "relation 'auth.users' does not exist"

**What it means:** Supabase authentication isn't set up

**Fix:**
1. Go to "Authentication" in left sidebar
2. Check if auth is enabled
3. Make sure you see "Users" section
4. Try creating the table again

### ❌ Error: "already exists"

**What it means:** Table was already created (not an error!)

**Fix:**
```sql
-- Option 1: Just skip it, proceed to next table
-- Option 2: Delete and recreate:
DROP TABLE chat_messages;
-- Then run CREATE TABLE again
```

### ❌ Error: "relation does not exist"

**What it means:** You're connected to wrong database

**Fix:**
1. Check SQL Editor top bar
2. Make sure your project name is selected
3. Try again

### ❌ Data looks weird after inserting

**Possible causes:**
1. Wrong column type (TEXT vs INTEGER)
2. Values outside CHECK constraints
3. User doesn't exist in auth.users

**Fix:** Check `src/services/supabase.ts` to ensure proper types

---

## 📦 Next Step After Tables Are Created

Once all 3 tables exist, proceed to:
→ **Step 4: Enable RLS Policies** (see `STEP_4_ENABLE_RLS_DETAILED.md`)

This adds security rules so users can only see their own data.

---

## 📝 SQL File Location

The complete SQL code is also in: `SUPABASE_CREATE_TABLES.sql`
- Contains all 3 tables
- Has comments explaining each part
- Can be run all at once or piecemeal

---

## 🎉 What's Next?

After tables are created, you'll need to:
1. ✅ Create tables (THIS STEP)
2. ⏳ Enable RLS policies (Step 4)
3. ⏳ Test Supabase connection
4. ⏳ Integrate with Chat.tsx
5. ⏳ Build vitals dashboard

---

## 📞 Quick Reference

**Supabase Project:** https://supabase.com
**SQL Editor:** Left sidebar → SQL Editor
**Table Editor:** Left sidebar → Table Editor
**Your Env File:** `.env.local` (credentials already here)
**Service Code:** `src/services/supabase.ts` (already written)

---

**Questions?** Check the troubleshooting section above or review the detailed SQL in `SUPABASE_CREATE_TABLES.sql`.
