-- =============================================================================
-- MEDIMIND AI - DATABASE TABLE SETUP (FIREBASE COMPATIBLE)
-- =============================================================================
-- If you created tables previously, this section completely removes them
-- so we can recreate them perfectly for Firebase user IDs (Strings).
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS user_vitals;
DROP TABLE IF EXISTS user_profiles;

-- =============================================================================
-- TABLE 1: CHAT_MESSAGES
-- =============================================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, 
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- =============================================================================
-- TABLE 2: USER_VITALS
-- =============================================================================
CREATE TABLE user_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  heart_rate INTEGER CHECK (heart_rate >= 0 AND heart_rate <= 300),
  blood_pressure_sys INTEGER CHECK (blood_pressure_sys >= 0 AND blood_pressure_sys <= 300),
  blood_pressure_dia INTEGER CHECK (blood_pressure_dia >= 0 AND blood_pressure_dia <= 200),
  temperature DECIMAL(4,1) CHECK (temperature >= 85 AND temperature <= 110),
  oxygen_sat INTEGER CHECK (oxygen_sat >= 0 AND oxygen_sat <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_vitals_user_id ON user_vitals(user_id);
CREATE INDEX idx_user_vitals_created_at ON user_vitals(created_at);

-- =============================================================================
-- TABLE 3: USER_PROFILES
-- =============================================================================
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan_id TEXT DEFAULT 'free' CHECK (plan_id IN ('free', 'standard', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_plan_id ON user_profiles(plan_id);

-- =============================================================================
-- ROW LEVEL SECURITY (Public allowed for Firebase users)
-- =============================================================================
-- Since you are using Firebase for authentication instead of Supabase Auth,
-- these tables need to be publicly read/writable by your React Vite client.
-- Your frontend code (supabase.ts) is already filtering the user_ids mathematically.

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all access to chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access to user_vitals" ON user_vitals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access to user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
