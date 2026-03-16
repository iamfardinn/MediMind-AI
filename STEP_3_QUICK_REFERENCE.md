# ⚡ STEP 3 QUICK REFERENCE CARD

## 🎯 Your Goal
Create 3 database tables in Supabase in 5-10 minutes

---

## 📍 LOCATION
```
1. Go to: https://supabase.com
2. Click your project
3. Left sidebar → SQL Editor
4. Click "+ New Query"
```

---

## 📋 TABLE 1: chat_messages (Stores chat history)

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

**Columns:** id | user_id | role | content | created_at

---

## 📋 TABLE 2: user_vitals (Stores health metrics)

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

**Columns:** id | user_id | date | heart_rate | blood_pressure_sys | blood_pressure_dia | temperature | oxygen_sat | created_at

---

## 📋 TABLE 3: user_profiles (Stores user account info)

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

**Columns:** id | email | display_name | avatar_url | plan_id | created_at | updated_at

---

## 🚀 EXECUTION STEPS

```
1. Copy SQL above (Table 1, 2, or 3)
2. Paste into Supabase SQL Editor
3. Click ▶ RUN button
4. Wait for ✓ Success
5. Repeat for Tables 2 and 3
```

---

## ✅ VERIFY SUCCESS

### In Supabase:
1. Left sidebar → Table Editor
2. Look for:
   - [ ] chat_messages
   - [ ] user_vitals
   - [ ] user_profiles

### Or Run This Query:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('chat_messages', 'user_vitals', 'user_profiles');
```

Expected: 3 tables listed

---

## 🎓 KEY CONCEPTS

| Term | Meaning |
|------|---------|
| UUID | Universal unique ID (safer than numbers) |
| NOT NULL | Field cannot be empty |
| PRIMARY KEY | Unique identifier for each row |
| INDEX | Makes searches faster |
| CONSTRAINT | Rule to keep data clean |
| FOREIGN KEY | Link to another table (auth.users) |
| ON DELETE CASCADE | Auto-delete when user deleted |
| CHECK | Validates data (e.g., 0-100 for percentages) |

---

## 🐛 COMMON ERRORS

| Error | Fix |
|-------|-----|
| "relation 'auth.users' does not exist" | Check Authentication in left sidebar is enabled |
| "already exists" | Table created before. Skip or DROP it first |
| "syntax error" | Copy entire block, not just part of it |

---

## 📱 SAMPLE DATA (After Tables Exist)

**chat_messages:**
```
user123abc said: "What's my heart rate?"
AI responded: "Your last reading was 72 BPM"
```

**user_vitals:**
```
Heart Rate: 72 BPM
Blood Pressure: 120/80
Temperature: 98.6°F
Oxygen: 95%
```

**user_profiles:**
```
ID: user123abc
Email: john@example.com
Name: John Doe
Plan: free
```

---

## 📂 ALL SUPABASE DOCS IN YOUR PROJECT

- `SUPABASE_QUICK_START.md` - 2-minute overview
- `SUPABASE_SETUP_GUIDE.md` - Complete guide
- `STEP_3_CREATE_TABLES_DETAILED_ENHANCED.md` - Full details
- `STEP_3_VISUAL_GUIDE.md` - Diagrams & visuals
- `STEP_3_QUICK_REFERENCE.md` - This file
- `STEP_4_ENABLE_RLS_DETAILED.md` - Next step
- `SUPABASE_CREATE_TABLES.sql` - All SQL in one file

---

## ⏭️ NEXT STEP

After tables created:
→ Enable RLS policies (Step 4)
→ See: `STEP_4_ENABLE_RLS_DETAILED.md`

---

## ⏱️ TIME BUDGET

```
Paste Table 1 SQL: 1 min
Execute Table 1: 1 min
Paste Table 2 SQL: 1 min
Execute Table 2: 1 min
Paste Table 3 SQL: 1 min
Execute Table 3: 1 min
Verify tables: 1 min
─────────────────────
TOTAL: 7-10 minutes
```

---

## 🎉 SUCCESS INDICATORS

✓ All 3 SQL blocks execute without error
✓ See "✓ Success" message after each
✓ Table Editor shows all 3 tables
✓ No red error messages
✓ Ready for Step 4!

---

**Questions?** See detailed guide: `STEP_3_CREATE_TABLES_DETAILED_ENHANCED.md`
