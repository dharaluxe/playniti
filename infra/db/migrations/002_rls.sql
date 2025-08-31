-- Enable RLS where appropriate
alter table wallets enable row level security;
alter table user_passes enable row level security;
alter table redemptions enable row level security;
alter table tournament_rooms enable row level security;

create policy user_wallet_access on wallets
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy user_pass_access on user_passes
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy user_redemption_access on redemptions
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy creator_room_manage on tournament_rooms
  for select using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);
