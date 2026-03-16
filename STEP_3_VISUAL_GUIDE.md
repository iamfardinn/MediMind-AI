# Step 3: Database Tables - VISUAL GUIDE

## 📊 Database Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MEDIMIND AI DATABASE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌────────────┐ │
│  │  chat_messages       │  │   user_vitals        │  │user_profiles│ │
│  ├──────────────────────┤  ├──────────────────────┤  ├────────────┤ │
│  │ id (UUID)            │  │ id (UUID)            │  │ id (TEXT)  │ │
│  │ user_id (TEXT) ──────┼──┼─ user_id (TEXT) ─────┼──┼─ email     │ │
│  │ role (TEXT)          │  │ date (TEXT)          │  │ display_   │ │
│  │ content (TEXT)       │  │ heart_rate (INT)     │  │ name       │ │
│  │ created_at (TIME)    │  │ blood_pressure_sys   │  │ avatar_url │ │
│  │                      │  │ blood_pressure_dia   │  │ plan_id    │ │
│  │ USER MESSAGES        │  │ temperature (DEC)    │  │ created_at │ │
│  │ ↓                    │  │ oxygen_sat (INT)     │  │ updated_at │ │
│  │ "Hello AI"           │  │ created_at (TIME)    │  │            │ │
│  │ "Tell me about..."   │  │                      │  │ USER PLANS │ │
│  │                      │  │ HEALTH METRICS       │  │ ↓          │ │
│  │ AI RESPONSES         │  │ ↓                    │  │ "free"     │ │
│  │ ↓                    │  │ 72 BPM               │  │ "standard" │ │
│  │ "Based on your..."   │  │ 120/80 mmHg          │  │ "premium"  │ │
│  │                      │  │ 98.6°F               │  │            │ │
│  └──────────────────────┘  │ 95% O₂               │  └────────────┘ │
│                             └──────────────────────┘                  │
│                                                                       │
│  All linked to → Firebase auth.users(id)                            │
│                 ON DELETE CASCADE (auto-cleanup)                     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Step-by-Step Visual Walkthrough

### Step 1: Navigate to Supabase SQL Editor

```
┌─────────────────────────────────────────────────┐
│         SUPABASE DASHBOARD                      │
│  https://supabase.com                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Your Project Name] ← Click here               │
│                                                 │
│  Left Sidebar:                                  │
│  ├─ Dashboard                                   │
│  ├─ SQL Editor ← ← ← CLICK HERE               │
│  ├─ Table Editor                                │
│  ├─ Authentication                              │
│  ├─ Storage                                     │
│  └─ ...                                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Step 2: SQL Editor Interface

```
┌─────────────────────────────────────────────────┐
│         SQL EDITOR                              │
├─────────────────────────────────────────────────┤
│  [+ New Query]  [Templates]  [Share]            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Your Project → public                          │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Paste your SQL code here:                │   │
│  │                                           │   │
│  │ CREATE TABLE chat_messages (             │   │
│  │   id UUID PRIMARY KEY ...                │   │
│  │   ...                                     │   │
│  │ );                                        │   │
│  │                                           │   │
│  │                                           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [▶ RUN]  [Format]  [Save]                      │
│                                                 │
│  ─────────────────────────────────────────────  │
│  OUTPUT:                                        │
│  ✓ Success - 4 commands executed               │
│  ─────────────────────────────────────────────  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📋 Table Creation Timeline

```
TIME: 0 min
START
   │
   ├─ 1 min ────────────────────► Create chat_messages table
   │                               ├─ 3 columns
   │                               ├─ 2 indexes
   │                               └─ ✓ Success
   │
   ├─ 1 min ────────────────────► Create user_vitals table
   │                               ├─ 8 columns
   │                               ├─ 2 indexes
   │                               ├─ Data validation
   │                               └─ ✓ Success
   │
   ├─ 1 min ────────────────────► Create user_profiles table
   │                               ├─ 6 columns
   │                               ├─ 2 indexes
   │                               └─ ✓ Success
   │
   ├─ 1 min ────────────────────► Verify all 3 tables exist
   │                               └─ ✓ All created
   │
   └─ 5-10 min TOTAL
      ✓ DONE - Ready for Step 4
```

---

## 🔄 Data Relationships

### How Tables Connect

```
┌─────────────────────────────────────────────────────────────┐
│                   FIREBASE AUTH.USERS                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id: "user123abc"                                       │ │
│  │ email: "john@example.com"                              │ │
│  │ created_at: "2024-03-10T10:00:00Z"                    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────┬──────────────────────────────────────────────────┘
           │
           │ Links via user_id = id
           │
     ┌─────┴─────┬──────────────────┐
     │           │                  │
     │           │                  │
     ▼           ▼                  ▼
  ┌──────────┐ ┌──────────┐    ┌──────────┐
  │ chat_    │ │ user_    │    │ user_    │
  │messages  │ │ vitals   │    │ profiles │
  ├──────────┤ ├──────────┤    ├──────────┤
  │id: UUID  │ │id: UUID  │    │id: TEXT  │
  │user_id:  │ │user_id:  │    │email:    │
  │"user...  │ │"user...  │    │"john@... │
  │role:     │ │date:     │    │display:  │
  │"user"    │ │"Mar 17"  │    │"John..."│
  │content:  │ │heart...  │    │avatar... │
  │"Hello"   │ │72        │    │plan_id:  │
  │created:  │ │created:  │    │"free"    │
  │[time]    │ │[time]    │    │created:  │
  │          │ │          │    │[time]    │
  └──────────┘ └──────────┘    └──────────┘
  
  Many-to-One: One user → Many messages, vitals, profile
```

---

## 📊 Sample Data After Tables Created

### chat_messages
```
┌──────────────────────────────────────────────────────────────┐
│ id                                   │ user_id       │ role    │
├──────────────────────────────────────────────────────────────┤
│ 550e8400-e29b-41d4-a716-446655440000 │ user123abc    │ user    │
│ 661a9511-f30c-42e5-b827-557766551111 │ user123abc    │ assistant
│ 772b0622-g41d-53f6-c938-668877662222 │ user123abc    │ user    │
└──────────────────────────────────────────────────────────────┘
```

### user_vitals
```
┌──────────────────────────────────────────────────────────┐
│ id        │ user_id    │ date     │ heart_rate │ bp_sys  │
├──────────────────────────────────────────────────────────┤
│ 550e8400..│ user123abc │ Mar 17   │ 72         │ 120     │
│ 661a9511..│ user123abc │ Mar 18   │ 68         │ 118     │
│ 772b0622..│ user123abc │ Mar 19   │ 70         │ 122     │
└──────────────────────────────────────────────────────────┘
```

### user_profiles
```
┌──────────────────────────────────────────────────┐
│ id         │ email              │ display_name   │
├──────────────────────────────────────────────────┤
│ user123abc │ john@example.com   │ John Doe       │
│ user456def │ jane@example.com   │ Jane Smith     │
│ user789ghi │ bob@example.com    │ Bob Johnson    │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Success Checklist

After running all SQL, verify:

```
✓ Step 1: SQL Editor opens without errors
  ├─ Project name shows at top
  ├─ "public" schema visible
  └─ Green "▶ RUN" button appears

✓ Step 2: Create chat_messages
  ├─ Green checkmark appears
  ├─ "Success" message shows
  └─ "3 commands executed" in output

✓ Step 3: Create user_vitals
  ├─ Green checkmark appears
  ├─ "Success" message shows
  └─ "3 commands executed" in output

✓ Step 4: Create user_profiles
  ├─ Green checkmark appears
  ├─ "Success" message shows
  └─ "3 commands executed" in output

✓ Step 5: Verify Tables
  ├─ Go to Table Editor (left sidebar)
  ├─ See "chat_messages" ✓
  ├─ See "user_vitals" ✓
  └─ See "user_profiles" ✓

✓ COMPLETE - All tables created!
  └─ Ready for Step 4: Enable RLS
```

---

## 🚨 Common Issues & Quick Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "relation 'auth.users' does not exist" | Auth not enabled | Check Authentication in left sidebar |
| "already exists" | Table created twice | Skip and move to next table, or DROP first |
| Nothing happens when click RUN | Script not highlighted | Make sure SQL is selected before clicking RUN |
| Database won't connect | Wrong credentials | Check `.env.local` has correct Supabase URL/Key |

---

## 📦 What Each Index Does

```
INDEX: idx_chat_messages_user_id
↓
Speeds up queries like:
  "Get all messages for user123abc"
  "Count messages from user123abc"

INDEX: idx_user_vitals_user_date
↓
Speeds up queries like:
  "Get last 7 days of vitals for user123abc"
  "Find vitals after 2024-03-15"

INDEX: idx_user_profiles_email
↓
Speeds up queries like:
  "Find user profile by email"
  "Check if email already exists"
```

---

## 🔐 Why We Use ON DELETE CASCADE

```
SCENARIO 1: Without ON DELETE CASCADE
─────────────────────────────────────
User deletes their account
  ↓
Firebase deletes auth.users record
  ↓
BUT chat_messages, user_vitals, user_profiles stay
  ↓
❌ ORPHANED DATA (broken references)
  ↓
Database integrity issues!

SCENARIO 2: With ON DELETE CASCADE (what we use)
─────────────────────────────────────
User deletes their account
  ↓
Firebase deletes auth.users record
  ↓
PostgreSQL CASCADE triggers:
  - All chat_messages deleted ✓
  - All user_vitals deleted ✓
  - user_profiles record deleted ✓
  ↓
✅ CLEAN DELETION (data integrity preserved)
```

---

## 📍 Next: Enable Security (Step 4)

After tables are created, you'll run:
```
STEP 4: Enable RLS Policies
├─ chat_messages RLS
├─ user_vitals RLS
└─ user_profiles RLS
```

This ensures users can only see/edit their own data!

---

## 💾 Backup: Complete SQL File

If you prefer, all SQL is in: `SUPABASE_CREATE_TABLES.sql`
```bash
# View in terminal:
cat SUPABASE_CREATE_TABLES.sql

# Or copy the entire file at once to SQL Editor
```

---

**Ready? Open Supabase and start copying SQL!** ▶️

For detailed table explanations → see `STEP_3_CREATE_TABLES_DETAILED_ENHANCED.md`
