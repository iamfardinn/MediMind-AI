# Step 3: Create Database Tables - DETAILED WALKTHROUGH

**Time:** 5-10 minutes  
**Difficulty:** Easy (copy-paste)  
**What you'll do:** Create 3 tables in Supabase

---

## 📍 LOCATION: Where to Paste SQL

### Step 1: Open Supabase SQL Editor

1. Go to **https://supabase.com**
2. **Sign in** with your account
3. Click on your **project name** (the one you created)
4. Left sidebar → Click **"SQL Editor"** (or look for SQL icon)
5. Click **"+ New Query"** (or "New SQL Query")

You should see a blank text editor now.

---

## 🔑 IMPORTANT: Before You Paste Anything

⚠️ **Make sure you're in the RIGHT database:**
- Top of the SQL Editor, you should see your project name
- Verify the database dropdown shows your Supabase project
- If it shows "postgres" or generic name, you're in the right place

---

## 📋 TABLE 1: Chat Messages

### What This Table Does
Stores all chat messages (both user and AI)
- `id` - Unique message ID
- `user_id` - Which user wrote it
- `role` - Either "user" or "assistant"
- `content` - The actual message text
- `created_at` - When it was sent

### Copy & Paste This SQL

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

### How to Execute

1. **Copy** the entire SQL block above
2. **Paste** it into the SQL Editor (blank text area)
3. Click the **"▶ Run"** button (green play button, top right)
4. You should see: **"✓ Success"** message
5. In the bottom panel, you'll see table details

✅ **Table 1 complete!**

---

## 📋 TABLE 2: User Vitals

### What This Table Does
Stores health readings (heart rate, blood pressure, temperature, oxygen)
- `id` - Unique vital reading ID
- `user_id` - Which user it belongs to
- `date` - Date of the reading (e.g., "Mar 17")
- `heart_rate` - Heart rate in BPM
- `blood_pressure_sys` - Systolic BP
- `blood_pressure_dia` - Diastolic BP
- `temperature` - Body temperature in °F
- `oxygen_sat` - Blood oxygen percentage
- `created_at` - When the reading was recorded

### Copy & Paste This SQL

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

### How to Execute

1. **Clear** the previous SQL (select all, delete)
2. **Copy** the SQL block above
3. **Paste** into the SQL Editor
4. Click **"▶ Run"** button
5. You should see: **"✓ Success"**

✅ **Table 2 complete!**

---

## 📋 TABLE 3: User Profiles

### What This Table Does
Stores user account information
- `id` - Same as Firebase UID
- `email` - User's email address
- `display_name` - User's full name
- `avatar_url` - Link to user's profile picture
- `plan_id` - Which plan they have ("free", "standard", "premium")
- `created_at` - Account creation date
- `updated_at` - Last profile update date

### Copy & Paste This SQL

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

### How to Execute

1. **Clear** the SQL Editor
2. **Copy** the SQL block above
3. **Paste** into the editor
4. Click **"▶ Run"** button
5. You should see: **"✓ Success"**

✅ **Table 3 complete!**

---

## ✅ VERIFY ALL TABLES WERE CREATED

### Check in Table Editor

1. Left sidebar → Click **"Table Editor"** (next to SQL Editor)
2. You should see:
   - ✅ `chat_messages`
   - ✅ `user_vitals`
   - ✅ `user_profiles`

3. Click on each table to verify columns are correct:

**chat_messages should have columns:**
- id
- user_id
- role
- content
- created_at

**user_vitals should have columns:**
- id
- user_id
- date
- heart_rate
- blood_pressure_sys
- blood_pressure_dia
- temperature
- oxygen_sat
- created_at

**user_profiles should have columns:**
- id
- email
- display_name
- avatar_url
- plan_id
- created_at
- updated_at

---

## 🔍 WHAT EACH PART DOES

### PRIMARY KEY
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```
- Creates unique ID automatically
- UUID = Universally Unique ID (very safe)
- `gen_random_uuid()` = generates new one each time

### TEXT NOT NULL
```sql
user_id TEXT NOT NULL
```
- `TEXT` = text/string data type
- `NOT NULL` = must always have a value (required field)

### CONSTRAINT (Foreign Key)
```sql
CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
```
- Links `user_id` to Firebase's `auth.users` table
- `ON DELETE CASCADE` = if user deletes account, their data is deleted too
- Safety feature to prevent orphaned data

### CREATE INDEX
```sql
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id)
```
- Makes queries faster
- Especially useful when finding "all messages by user X"
- Like a bookmark for quick lookup

---

## 🐛 TROUBLESHOOTING

### ❌ Error: "relation 'auth.users' does not exist"

**Cause:** Supabase auth system not properly linked

**Fix:**
1. Go to **Authentication** in left sidebar
2. Make sure auth is enabled
3. Try creating the table again

---

### ❌ Error: "already exists"

**Cause:** Table was already created

**Fix:** That's fine! Just skip that table and move to the next one. Or:
1. Delete the table first (Table Editor → right-click table → Delete)
2. Then run the SQL again

---

### ❌ Error: "syntax error"

**Cause:** You may have missed something while copying

**Fix:**
1. Delete everything
2. Copy/paste again carefully
3. Make sure all brackets `()` are matched
4. Make sure all semicolons `;` are there at the end

---

### ❌ SQL Editor shows no "Run" button

**Fix:**
1. Make sure you're in **SQL Editor** (not Table Editor)
2. Try refreshing the page
3. Check that you have a query in the text area

---

## 📸 VISUAL GUIDE

### Where Things Are in Supabase Dashboard

```
Top Left: Project Name ↓
├── Left Sidebar
│   ├── Dashboard (Home icon)
│   ├── SQL Editor ← YOU ARE HERE
│   ├── Table Editor ← Also useful
│   ├── Authentication
│   ├── Database
│   └── Settings
├── Main Area (Center)
│   └── SQL Query Editor (large text area)
└── Top Right
    └── ▶ Run Button (green)
```

---

## ✨ AFTER YOU'RE DONE

Once all 3 tables are created:

1. Go to **Table Editor** in left sidebar
2. Verify all 3 tables are there
3. Click each to see the columns
4. You're ready for **Step 4: Enable RLS Policies**

---

## 🎯 QUICK COPY-PASTE REFERENCE

If you just want to copy all SQL at once (warning: only do this if you know what you're doing):

```sql
-- ═══════════════════════════════════════════
-- TABLE 1: Chat Messages
-- ═══════════════════════════════════════════
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

-- ═══════════════════════════════════════════
-- TABLE 2: User Vitals
-- ═══════════════════════════════════════════
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

-- ═══════════════════════════════════════════
-- TABLE 3: User Profiles
-- ═══════════════════════════════════════════
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

## ⏱️ TIME BREAKDOWN

- **Get to SQL Editor:** 1 min
- **Create Table 1 (chat_messages):** 1 min
- **Create Table 2 (user_vitals):** 1 min
- **Create Table 3 (user_profiles):** 1 min
- **Verify in Table Editor:** 1 min

**Total:** 5 minutes ✅

---

## ✅ CHECKLIST

- [ ] Opened Supabase dashboard
- [ ] Clicked SQL Editor
- [ ] Created `chat_messages` table (✓ Success)
- [ ] Created `user_vitals` table (✓ Success)
- [ ] Created `user_profiles` table (✓ Success)
- [ ] Went to Table Editor
- [ ] Verified all 3 tables exist
- [ ] Verified all columns are correct

**Next:** Go to **Step 4: Enable RLS Policies**

---

## 💡 WHAT HAPPENS NEXT?

Once you create these tables:

✅ **Data can be stored** in Supabase  
⏳ **But it's NOT secure yet** (anyone could read/write)  
🔒 **Step 4 will fix security** by adding Row-Level Security policies

This ensures:
- Users can only see **their own** data
- Users can only modify **their own** data
- AI/admins can only access what they should

---

**Ready? Let's go! 🚀**

See you in Step 4 (Enable RLS Policies)
