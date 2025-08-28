-- Database schema for Playniti
-- Run this script in the Supabase SQL editor to set up your tables.

-- Extension for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table.  Supabase Auth automatically manages id/email for users.
-- Additional fields store username and admin flag.
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE,
  username text UNIQUE,
  is_admin boolean NOT NULL DEFAULT FALSE,
  created_at timestamp WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Events table.  Represents tournaments or matches that users can enter.
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  scheduled_at timestamp WITH TIME ZONE NOT NULL,
  entry_fee numeric NOT NULL,
  reward_percentage numeric NOT NULL DEFAULT 0.75,
  -- Type of game: snake, reaction, target or color
  game_type text NOT NULL DEFAULT 'snake',
  is_active boolean NOT NULL DEFAULT TRUE,
  created_at timestamp WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Matches table.  Stores each user's attempt in an event.
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  score integer NOT NULL,
  time_taken numeric NOT NULL, -- time in seconds
  created_at timestamp WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Subscriptions table.  Tracks weekly pass purchases.
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan text NOT NULL, -- e.g. 'weekly', 'mega'
  entries_remaining integer NOT NULL,
  expires_at timestamp WITH TIME ZONE NOT NULL,
  created_at timestamp WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Transactions table.  Records all monetary transactions (pass purchases, rewards, burns).
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  type text NOT NULL, -- 'subscription', 'reward', 'burn'
  amount numeric NOT NULL,
  created_at timestamp WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Burned rewards.  If a player is disqualified their potential reward is burned and recorded here.
CREATE TABLE IF NOT EXISTS burned_rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  reason text,
  created_at timestamp WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Leaderboard view.  A convenient view to see top scores per event ordered by score desc, time asc.
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  m.event_id,
  m.user_id,
  m.score,
  m.time_taken,
  ROW_NUMBER() OVER (PARTITION BY m.event_id ORDER BY m.score DESC, m.time_taken ASC) AS rank
FROM matches m;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_event_id ON matches(event_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
