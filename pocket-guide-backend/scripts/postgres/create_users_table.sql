-- Create users table for local auth (JWT + bcrypt)
-- Safe to run multiple times.

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep e-mail uniqueness case-insensitive.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique_lower
  ON users (LOWER(email));

-- Helpful lookup index for auth and profile reads.
CREATE INDEX IF NOT EXISTS idx_users_created_at
  ON users (created_at DESC);

-- Trigger to auto-update updated_at on row updates.
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_users_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END;
$$;

COMMIT;

-- Verification:
-- \d users
-- SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC;
