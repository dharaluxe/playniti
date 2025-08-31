-- Passes
insert into passes (id,name,price_inr,entries,validity_days) values
('weekly','Weekly Pass',49,7,7)
on conflict (id) do nothing;
insert into passes (id,name,price_inr,entries,validity_days) values
('mega','Mega Pass',499,30,30)
on conflict (id) do nothing;

-- Seed users (link to Supabase Auth users you created)
-- Replace UUIDs with actual auth user IDs
with ids as (
  select
    '00000000-0000-0000-0000-000000000001'::uuid as admin_id,
    '00000000-0000-0000-0000-000000000002'::uuid as creator_id,
    '00000000-0000-0000-0000-000000000003'::uuid as user1_id,
    '00000000-0000-0000-0000-000000000004'::uuid as user2_id,
    '00000000-0000-0000-0000-000000000005'::uuid as user3_id
)
insert into profiles (id,email,role,display_name)
select admin_id,'admin@playniti.local','admin','Admin' from ids
on conflict (id) do nothing;

insert into profiles (id,email,role,display_name)
select creator_id,'creator@playniti.local','creator','Creator' from ids
on conflict (id) do nothing;

insert into profiles (id,email,role,display_name)
select user1_id,'user1@playniti.local','user','User One' from ids
on conflict (id) do nothing;

insert into profiles (id,email,role,display_name)
select user2_id,'user2@playniti.local','user','User Two' from ids
on conflict (id) do nothing;

insert into profiles (id,email,role,display_name)
select user3_id,'user3@playniti.local','user','User Three' from ids
on conflict (id) do nothing;

-- Wallets
insert into wallets (user_id, coin_balance, locked_balance) values
('00000000-0000-0000-0000-000000000002', 500, 0)
on conflict (user_id) do nothing;
insert into wallets (user_id, coin_balance, locked_balance) values
('00000000-0000-0000-0000-000000000003', 200, 0)
on conflict (user_id) do nothing;
insert into wallets (user_id, coin_balance, locked_balance) values
('00000000-0000-0000-0000-000000000004', 0, 0)
on conflict (user_id) do nothing;
insert into wallets (user_id, coin_balance, locked_balance) values
('00000000-0000-0000-0000-000000000005', 0, 0)
on conflict (user_id) do nothing;

-- Creator
insert into creator_profiles (user_id, verified) values
('00000000-0000-0000-0000-000000000002', true)
on conflict (user_id) do nothing;

-- Voucher catalog
insert into voucher_catalog (brand, value_inr, stock) values
('Amazon', 500, 10),
('Flipkart', 500, 10)
on conflict do nothing;
