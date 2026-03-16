-- =============================================================================
-- MEDIMIND AI - DATABASE TABLE SETUP
-- =============================================================================
-- 
-- HOW TO USE THIS FILE:
-- 1. Open Supabase Dashboard: https://supabase.com
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy & paste each section below (one table at a time)
-- 5. Click "RUN" button
-- 6. Verify success message appears
--
-- =============================================================================

-- =============================================================================
-- TABLE 1: CHAT_MESSAGES
-- Purpose: Store all chat conversations between users and AI
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_chat_messages_user FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_date ON chat_messages(user_id, created_at DESC);

-- Comment for documentation
COMMENT ON TABLE chat_messages IS 'Stores chat messages between users and AI assistant';
COMMENT ON COLUMN chat_messages.user_id IS 'Firebase user ID - identifies which user sent the message';
COMMENT ON COLUMN chat_messages.role IS 'Either "user" (user message) or "assistant" (AI response)';
COMMENT ON COLUMN chat_messages.content IS 'The actual message content/text';

-- =============================================================================
-- TABLE 2: USER_VITALS
-- Purpose: Store health metrics and vital signs
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_vitals_user_id ON user_vitals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vitals_created_at ON user_vitals(created_at);
CREATE INDEX IF NOT EXISTS idx_user_vitals_user_date ON user_vitals(user_id, created_at DESC);

-- Comment for documentation
COMMENT ON TABLE user_vitals IS 'Stores health vitals and measurements for users';
COMMENT ON COLUMN user_vitals.user_id IS 'Firebase user ID - identifies which user the vitals belong to';
COMMENT ON COLUMN user_vitals.date IS 'Date of the vital reading (e.g., "Mar 17, 2024")';
COMMENT ON COLUMN user_vitals.heart_rate IS 'Heart rate in beats per minute (BPM)';
COMMENT ON COLUMN user_vitals.blood_pressure_sys IS 'Systolic blood pressure (top number)';
COMMENT ON COLUMN user_vitals.blood_pressure_dia IS 'Diastolic blood pressure (bottom number)';
COMMENT ON COLUMN user_vitals.temperature IS 'Body temperature in Fahrenheit';
COMMENT ON COLUMN user_vitals.oxygen_sat IS 'Blood oxygen saturation percentage (SpO2)';

-- =============================================================================
-- TABLE 3: USER_PROFILES
-- Purpose: Store user account and profile information
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan_id TEXT DEFAULT 'free' CHECK (plan_id IN ('free', 'standard', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_id ON user_profiles(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Comment for documentation
COMMENT ON TABLE user_profiles IS 'Stores user account and profile information';
COMMENT ON COLUMN user_profiles.id IS 'Firebase user ID (same as auth.users.id)';
COMMENT ON COLUMN user_profiles.email IS 'User email address - unique identifier';
COMMENT ON COLUMN user_profiles.display_name IS 'User''s full name for display purposes';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to user''s profile picture';
COMMENT ON COLUMN user_profiles.plan_id IS 'Subscription plan: free, standard, or premium';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- After running the above, you can verify all tables exist by running:
--
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('chat_messages', 'user_vitals', 'user_profiles');
--
-- Expected output:
--   chat_messages
--   user_vitals
--   user_profiles
--
-- =============================================================================
