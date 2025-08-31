-- Core identities
create table if not exists profiles (
  id uuid primary key,
  email text unique not null,
  role text not null check (role in ('admin','creator','user')),
  display_name text,
  created_at timestamptz default now()
);

create table if not exists wallets (
  user_id uuid primary key references profiles(id) on delete cascade,
  coin_balance int not null default 0,
  locked_balance int not null default 0,
  updated_at timestamptz default now()
);

create table if not exists passes (
  id text primary key,
  name text not null,
  price_inr int not null,
  entries int not null,
  validity_days int not null
);

create table if not exists user_passes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  pass_id text references passes(id),
  entries_remaining int not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  game text not null,
  mode text not null,
  starts_at timestamptz not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  code text not null,
  capacity int not null,
  state text not null,
  seed text not null,
  created_at timestamptz default now()
);

create table if not exists room_participants (
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  team int,
  score int default 0,
  primary key (room_id, user_id)
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  started_at timestamptz,
  ended_at timestamptz,
  winner_user_id uuid
);

create table if not exists match_inputs (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  payload jsonb not null,
  ts timestamptz default now()
);

create table if not exists leaderboards (
  id uuid primary key default gen_random_uuid(),
  game text not null,
  user_id uuid references profiles(id),
  score int not null,
  season text not null,
  created_at timestamptz default now()
);

create table if not exists creator_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  verified boolean default false
);

create table if not exists tournament_rooms (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references profiles(id),
  game text not null,
  bracket_size int not null check (bracket_size between 3 and 100),
  start_time timestamptz not null,
  prize_table jsonb not null,
  created_at timestamptz default now()
);

create table if not exists tournament_entries (
  room_id uuid references tournament_rooms(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  primary key (room_id, user_id)
);

create table if not exists tournament_prize_escrows (
  room_id uuid primary key references tournament_rooms(id) on delete cascade,
  amount int not null,
  locked boolean default true
);

create table if not exists voucher_catalog (
  id uuid primary key default gen_random_uuid(),
  brand text,
  value_inr int not null,
  stock int not null default 0
);

create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  voucher_id uuid references voucher_catalog(id),
  status text not null check (status in ('pending','issued','failed','refunded')),
  requested_at timestamptz default now(),
  issued_code text
);

create table if not exists compliance_rules (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text,
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists bans (
  user_id uuid primary key,
  reason text,
  until timestamptz
);

create table if not exists feature_flags (
  key text primary key,
  enabled boolean default false
);
