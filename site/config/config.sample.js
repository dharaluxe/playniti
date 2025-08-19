// Copy this file to config.js and fill values from your Firebase Web App settings.
window.PLAYNITI_CONFIG = {
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  adminEmail: "admin@playniti.com",
  qrUPI: {
    // Replace these paths and labels to your real QR codes in /qr
    options: [
      { label: "Pay via PhonePe", img: "../qr/phonepe_qr.png" },
      { label: "Pay via Google Pay", img: "../qr/gpay_qr.png" },
      { label: "Pay via Paytm", img: "../qr/paytm_qr.png" }
    ]
  }
};
