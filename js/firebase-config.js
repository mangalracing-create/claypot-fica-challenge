/*
 * Claypot FICA Challenge — Firebase configuration
 * ------------------------------------------------
 * Paste your Firebase Web App config below to enable the CROSS-DEVICE leaderboard
 * (game on one screen, leaderboard on another). See README.md → "Cross-device leaderboard".
 *
 * If you leave the placeholder "YOUR_..." values, the game automatically falls back to
 * localStorage (single-device / single-browser mode) so it still runs with zero setup.
 *
 * NOTE: These Firebase web values are NOT secrets — they are meant to ship in the client.
 * Access is controlled by your Realtime Database security rules (see README).
 */
window.CLAYPOT_FIREBASE_CONFIG = {
  apiKey:      "YOUR_API_KEY",
  authDomain:  "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:   "YOUR_PROJECT",
  appId:       "YOUR_APP_ID"
};

/* Optional: separate leaderboards per event/booth. Change this string to start a fresh board. */
window.CLAYPOT_BOARD_ID = "default";

/* Optional: admin PIN for the leaderboard's "Reset board" button.
   Leave "" to require only a confirmation. Set a code (e.g. "2468") to also prompt for a PIN
   so passers-by can't wipe the board on a public screen. */
window.CLAYPOT_ADMIN_PIN = "";
