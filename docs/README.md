# Playniti — Soft Launch Kit (QR Payments MVP)
This kit gives you a ready-to-host web app: Landing + Auth + Wallet (NC) + QR-based deposit/withdraw + Admin console + Sarp Niti demo (1-minute).

## What you get
- **/site** — Public web app (PWA):
  - `index.html` Landing + Waitlist + How it works
  - `dashboard.html` User dashboard (auth, wallet, deposit/withdraw, history)
  - `game.html` Sarp Niti (1-minute single-player demo)
  - `manifest.json` + `service-worker.js` for installable PWA
  - `/config/config.sample.js` (copy to `config.js` and fill Firebase keys)
- **/admin** — Admin Console:
  - `console.html` Approve deposits/withdrawals and credit NC, view ledgers
- **/qr** — Placeholder UPI QR images (replace with your own)
- **/docs** — Firestore Security Rules + Setup Steps

## Quick Start (15–30 mins)
1) Create a **Firebase project** → Enable **Authentication (Email/Password)**, **Firestore**, **Storage**.
2) In Firebase Console → Project settings → copy web app config.  
   - Copy `/site/config/config.sample.js` to `/site/config/config.js` and paste your config + update admin email.
3) Set **Firestore Rules** and **Storage Rules** from `/docs/firestore.rules` and `/docs/storage.rules`.  
   - Replace `admin@playniti.com` with your admin email in the rules.
4) Deploy `/site` and `/admin` to **Netlify** or **Vercel** (drag-and-drop folder).
5) In Firebase Auth → create your **admin account** with the email used in rules.
6) Replace QR images inside `/qr` and update the paths in `dashboard.html` (Add NC modal).

## Notes
- This kit is **client-only**. Admin permissions are enforced via **Firestore rules** using the admin email.
- For production, migrate to **custom claims** and/or a secure backend for admin ops.
- Sarp Niti demo is local single-player; matchmaking/real-time multiplayer is phase-2.

## Next Up
- Integrate Razorpay/Cashfree for automated deposits
- Real-time sessions + 1v1 and lobby modes
- Anti-cheat and server authoritative gameplay backend

