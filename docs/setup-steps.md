# Firebase Setup Steps (Detailed)

1. Go to https://console.firebase.google.com → Create project "Playniti".
2. Build > Authentication → Get started → Sign-in method → Enable "Email/Password".
3. Build > Firestore Database → Create database → Start in **production mode**.
4. Build > Storage → Get started → Set default bucket.
5. Project settings → Your apps → Web app → Register app (Hosting optional) → Copy `firebaseConfig`.
6. In this kit, copy `/site/config/config.sample.js` to `/site/config/config.js` and paste your config values.
7. Replace admin email in `/docs/firestore.rules` and `/docs/storage.rules` (and then publish rules in Firebase console).
8. Authentication → Users → Add user → create your admin account using the same email used in the rules.
9. Deploy:
   - Netlify: Drag `/site` as one site and `/admin` as another site.
   - Vercel: Create two projects; import each folder.
10. Test flow:
   - Sign up as a normal user in `/site/dashboard.html` → submit a deposit request with QR screenshot.
   - Open `/admin/console.html` as admin → approve deposit → check user's balance updated.
