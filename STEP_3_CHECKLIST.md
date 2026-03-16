# ✅ STEP 3: Database Tables - CHECKLIST

## 🎯 YOUR MISSION
Create 3 database tables in Supabase in under 10 minutes

---

## 📋 PRE-FLIGHT CHECKLIST

Before you start, verify you have:

- [ ] Supabase account created (https://supabase.com)
- [ ] Supabase project set up
- [ ] Credentials in `.env.local`:
  - [ ] `VITE_SUPABASE_URL` filled in
  - [ ] `VITE_SUPABASE_ANON_KEY` filled in
- [ ] Can access Supabase dashboard
- [ ] This checklist open to track progress

**Status:** Ready to proceed? ✓ Go to next section!

---

## 🚀 EXECUTION CHECKLIST

### STEP 1: Open Supabase SQL Editor

- [ ] Go to https://supabase.com
- [ ] Sign in with your account
- [ ] Click your project name
- [ ] Left sidebar → "SQL Editor"
- [ ] Click "+ New Query"

**Time: 1 minute**

---

### STEP 2: Create Table 1 - chat_messages

- [ ] Copy SQL from one of:
  - `STEP_3_QUICK_REFERENCE.md`, OR
  - `SUPABASE_CREATE_TABLES.sql`, OR
  - `STEP_3_CREATE_TABLES_DETAILED_ENHANCED.md`

- [ ] Paste entire block into SQL Editor

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

- [ ] Click green "▶ RUN" button
- [ ] Wait for response...
- [ ] See "✓ Success" message?
  - [ ] YES → Continue to Table 2 ✓
  - [ ] NO → Check troubleshooting section below

**Time: 2 minutes**
**Status:** ☐ Complete

---

### STEP 3: Create Table 2 - user_vitals

- [ ] Click "+ New Query"
- [ ] Clear previous SQL
- [ ] Copy SQL for user_vitals:

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

- [ ] Click "▶ RUN"
- [ ] See "✓ Success"?
  - [ ] YES → Continue to Table 3 ✓
  - [ ] NO → Check troubleshooting section below

**Time: 2 minutes**
**Status:** ☐ Complete

---

### STEP 4: Create Table 3 - user_profiles

- [ ] Click "+ New Query"
- [ ] Clear previous SQL
- [ ] Copy SQL for user_profiles:

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

- [ ] Click "▶ RUN"
- [ ] See "✓ Success"?
  - [ ] YES → Continue to verification ✓
  - [ ] NO → Check troubleshooting section below

**Time: 2 minutes**
**Status:** ☐ Complete

---

## 🔍 VERIFICATION CHECKLIST

After all 3 tables created, verify they exist:

### Method 1: Table Editor (Visual)

- [ ] Left sidebar → "Table Editor"
- [ ] Look in the list and find:
  - [ ] ✓ chat_messages
  - [ ] ✓ user_vitals
  - [ ] ✓ user_profiles

- [ ] Click on **chat_messages** table, verify columns:
  - [ ] id (UUID)
  - [ ] user_id (TEXT)
  - [ ] role (TEXT)
  - [ ] content (TEXT)
  - [ ] created_at (TIMESTAMP)

- [ ] Click on **user_vitals** table, verify columns:
  - [ ] id (UUID)
  - [ ] user_id (TEXT)
  - [ ] date (TEXT)
  - [ ] heart_rate (INTEGER)
  - [ ] blood_pressure_sys (INTEGER)
  - [ ] blood_pressure_dia (INTEGER)
  - [ ] temperature (DECIMAL)
  - [ ] oxygen_sat (INTEGER)
  - [ ] created_at (TIMESTAMP)

- [ ] Click on **user_profiles** table, verify columns:
  - [ ] id (TEXT)
  - [ ] email (TEXT)
  - [ ] display_name (TEXT)
  - [ ] avatar_url (TEXT)
  - [ ] plan_id (TEXT)
  - [ ] created_at (TIMESTAMP)
  - [ ] updated_at (TIMESTAMP)

### Method 2: SQL Query (Verify All at Once)

- [ ] Click "+ New Query"
- [ ] Paste this verification query:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_messages', 'user_vitals', 'user_profiles')
ORDER BY table_name;
```

- [ ] Click "▶ RUN"
- [ ] You should see:
  ```
  chat_messages
  user_profiles
  user_vitals
  ```
- [ ] All 3 tables listed?
  - [ ] YES → Success! ✓
  - [ ] NO → Troubleshoot below

**Time: 1 minute**
**Status:** ☐ Complete

---

## 🎉 FINAL CHECKLIST

Congratulations! You've completed Step 3 if:

- [ ] All 3 SQL blocks executed without errors
- [ ] Green "✓ Success" messages appeared for each
- [ ] All 3 tables visible in Table Editor
- [ ] All columns appear in each table
- [ ] Verification query shows 3 tables
- [ ] Zero red error messages anywhere

**Overall Status:** ☐ STEP 3 COMPLETE ✓

---

## 🐛 TROUBLESHOOTING CHECKLIST

### ❌ Error: "relation 'auth.users' does not exist"

**What it means:** Supabase Authentication not enabled

**Diagnosis:**
- [ ] Go to left sidebar
- [ ] Look for "Authentication" option
- [ ] Does it exist?
  - [ ] YES → Click it
  - [ ] NO → Auth not enabled

**Fix:**
- [ ] Click "Authentication" in left sidebar
- [ ] Make sure auth is enabled/active
- [ ] Try creating the table again
- [ ] Still failing?
  - [ ] Check Supabase project settings
  - [ ] Verify project is fully initialized

---

### ❌ Error: "already exists"

**What it means:** You already created this table (not a problem!)

**Options:**
- [ ] Option 1: Just skip this table, move to next one
- [ ] Option 2: Delete and recreate:
  ```sql
  DROP TABLE IF EXISTS chat_messages CASCADE;
  -- Then paste CREATE TABLE block again
  ```

---

### ❌ Error: "syntax error"

**What it means:** SQL has a typo or incomplete copy

**Diagnosis:**
- [ ] Check error message for which line
- [ ] Did you copy the ENTIRE block?
  - [ ] YES → Re-read for typos
  - [ ] NO → Copy full block including final semicolon

**Fix:**
- [ ] Delete everything in editor
- [ ] Copy SQL again (all the way to final `;`)
- [ ] Make sure entire block is selected
- [ ] Run again

---

### ❌ Nothing happens when clicking RUN

**Diagnosis:**
- [ ] Did SQL text get highlighted/selected?
  - [ ] YES → Text should appear highlighted before RUN
  - [ ] NO → Nothing to run

**Fix:**
- [ ] Click in the SQL editor area
- [ ] Select all text (Ctrl+A or Cmd+A)
- [ ] Now click RUN button

---

### ✅ Solution: Use Guaranteed Working SQL

If you keep getting errors:

- [ ] Open file: `SUPABASE_CREATE_TABLES.sql`
- [ ] Copy from there instead
- [ ] This file is tested and confirmed working
- [ ] If still fails → Contact support

---

## 📞 HELP RESOURCES

### If You're Stuck

**For detailed help**, read:
- `STEP_3_CREATE_TABLES_DETAILED_ENHANCED.md` → Troubleshooting section
- `STEP_3_VISUAL_GUIDE.md` → Troubleshooting section

**For quick answers:**
- `STEP_3_QUICK_REFERENCE.md` → Common Errors table

**For raw SQL:**
- `SUPABASE_CREATE_TABLES.sql` → Full working code

---

## ⏱️ TIME TRACKING

```
Pre-flight:      1 minute
Create Table 1:  2 minutes
Create Table 2:  2 minutes
Create Table 3:  2 minutes
Verification:    1 minute
─────────────────────────
TOTAL:           8 minutes ✓
```

---

## 🎯 NEXT STEP

After this checklist is complete:

→ **STEP 4: Enable RLS (Row-Level Security)**
→ See: `STEP_4_ENABLE_RLS_DETAILED.md`

This adds security policies so users can only see their own data.

---

## 📊 PROGRESS TRACKER

```
STEP 1: Install Supabase npm package      ✓ Done
STEP 2: Create Supabase service           ✓ Done
STEP 3: Create Database Tables            ☐ IN PROGRESS (This)
  └─ Table 1: chat_messages               ☐ 
  └─ Table 2: user_vitals                 ☐ 
  └─ Table 3: user_profiles               ☐ 
  └─ Verification                         ☐ 
STEP 4: Enable RLS Policies               ⏳ Next
STEP 5: Test Connection                   ⏳ Later
STEP 6: Integrate with React              ⏳ Later
```

---

## 🎓 LEARNING SUMMARY

By completing this step, you've learned:

- How to use Supabase SQL Editor
- How to create database tables
- Understanding PRIMARY KEY
- Understanding FOREIGN KEY
- Using CHECK constraints
- Creating indexes for speed
- Verifying table creation

---

## ✨ FINAL NOTES

- All your data is encrypted in Supabase
- Tables auto-clean if user deletes account
- Indexes make queries fast
- Ready for RLS security (next step)
- Code in your repo ready to use

---

**Ready to proceed?** Check off all items above and move to Step 4!

```
[ ] All 3 tables created
[ ] All columns verified
[ ] No error messages
[ ] Ready for Step 4
```

**Status: ☐ COMPLETE - Move to Step 4**
