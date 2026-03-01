-- Create database
CREATE DATABASE medimind;

-- Connect to it
\c medimind

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  billing TEXT NOT NULL,
  gateway TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  transaction_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Show success
SELECT 'Database setup complete!' AS message;
