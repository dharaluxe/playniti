# PLAYNITI — v6 (Monorepo)

Production-grade scaffold for Playniti (web, admin, games, API, realtime, infra).  
Date: 2025-08-31

## Quick Start

```bash
# 1) Install toolchain
corepack enable
corepack prepare pnpm@9.0.0 --activate

# 2) Clone & install
pnpm install

# 3) Set env
cp .env.example .env
# Fill Supabase URL/keys (create a project on supabase.com).

# 4) Database
# -> Open infra/db/migrations in Supabase SQL Editor and run in order:
# 001_init.sql, 002_rls.sql, 003_seeds.sql

# 5) Dev servers (in one terminal)
pnpm dev
# - API: http://localhost:4000 (Swagger at /docs)
# - Realtime WS: ws://localhost:4100
# - Web: http://localhost:3000
# - Admin: http://localhost:3001
```

## Apps
- `apps/web` — Player app (auth, freeplay with ads, events, wallet, redemption).
- `apps/admin` — Admin desk (vouchers, passes, prize tables, compliance, dashboards).
- `apps/games` — Game components (React + Canvas) + net client.
- `apps/api` — Fastify REST API (OpenAPI, Supabase integration).
- `apps/realtime` — Authoritative WS server (rooms, matches, tournaments).

## Infra
- `infra/db` — SQL migrations, seeds, RLS.
- `infra/openapi` — OpenAPI JSON + Swagger HTML.
- `infra/postman` — Postman collection.
- `infra/ci` — GitHub Actions CI.
- `infra/erd` — Mermaid ERD.

## Seed Identities
- Admin: admin@playniti.local / password: Admin@123
- Creator: creator@playniti.local / password: Creator@123
- Users:
  - user1@playniti.local / password: User@123
  - user2@playniti.local / password: User@123
  - user3@playniti.local / password: User@123

> Create these in Supabase Auth → Users. Then run `003_seeds.sql` to link profiles/wallets.
