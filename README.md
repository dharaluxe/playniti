# Playniti – Skill‑based Esports Platform

Playniti is a subscription based esports platform built on top of Supabase.  The aim of the project is to provide quick, one‑minute skill games (snake, observation and quiz challenges) where players compete for rewards.  Instead of taking an entry fee, players purchase a weekly access pass that grants a fixed number of entries into any of the available events.  A separate mega event pass allows players to enter a high stakes tournament once per week.  This repository contains a full stack example written with React on the front‑end, Supabase edge functions and tables on the back‑end, and a simple administrator panel for managing events and users.

## Features

- **Supabase backend** – Utilises Supabase Authentication for login/signup and Supabase Database for event, match and user storage.
- **Weekly access pass** – Users purchase a weekly pass (₹49 by default) which grants seven entries.  A top‑up mechanism allows additional entries to be bought without repurchasing the pass.
- **Mega events** – A separate ₹499 pass grants access to an exclusive weekly event where rewards are distributed dynamically based on total participants.
- **Skill games** – Quick mini‑games (snake, reflex and observation quiz) with no element of chance.  Gameplay is client side; scores and times are uploaded to Supabase.
- **Dynamic reward distribution** – Rewards are a fixed percentage of the entry revenue.  A tie handler splits or replays matches to determine winners.  Inactive players are automatically disqualified.
- **Admin panel** – An administrator dashboard allows creation and management of events, viewing of user statistics, approval of payouts and manual burn of disqualified rewards.
- **Responsive design** – Built with React and Tailwind for a modern look and feel.  A hero image created via AI is used in the home page (see `src/assets/hero-bg.png`).

## Project Structure

```
playniti-project/
│
├── README.md                 → This file
├── backend/                  → Supabase database and edge functions
│   ├── schema.sql            → SQL definitions for users, events and matches
│   ├── functions/            → Edge functions (e.g. updateRewards.js)
│   └── README.md             → How to deploy functions to Supabase
│
└── frontend/                 → React application
    ├── package.json          → Front‑end dependencies
    ├── .env.example          → Sample environment variables
    ├── src/
    │   ├── index.js          → Entry point
    │   ├── App.js            → Routes and layout
    │   ├── supabaseClient.js → Initialise Supabase client
    │   ├── assets/
    │   │   └── hero-bg.png   → Hero image used on the home page
    │   ├── components/       → Reusable UI components
    │   │   ├── Navbar.js
    │   │   ├── Footer.js
    │   │   └── GameCanvas.js
    │   └── pages/            → Top level pages
    │       ├── Home.js
    │       ├── Login.js
    │       ├── Signup.js
    │       ├── Dashboard.js
    │       ├── Game.js
    │       ├── Leaderboard.js
    │       └── AdminPanel.js
    └── README.md             → Front‑end setup instructions
```

## Getting Started

1. **Clone and install:**
   ```sh
   git clone https://example.com/your/playniti-project.git
   cd playniti-project/frontend
   npm install
   ```

2. **Configure Supabase:**
   - Create a Supabase project at [supabase.com](https://supabase.com) and note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
   - Copy `.env.example` to `.env` and fill in your Supabase credentials.
   - Run the SQL in `backend/schema.sql` within the Supabase SQL editor to create the necessary tables.
   - Deploy the edge functions from `backend/functions` using `supabase functions deploy`.

3. **Run the development server:**
   ```sh
   npm start
   ```

4. **Admin access:**
   - To enable the admin panel for a user, add their user ID to the `is_admin` column in the `users` table or implement a role check in `AdminPanel.js`.

## Deployment

The React application can be built and deployed to any static host (Netlify, Vercel, etc.).  Supabase handles all database, authentication and serverless functions.  For production, remember to set up [Supabase Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security) to protect data and restrict access.
