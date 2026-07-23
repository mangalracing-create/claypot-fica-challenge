/*
 * Claypot FICA Challenge — configuration
 * --------------------------------------
 * These settings are safe to ship in the browser.
 */
window.CLAYPOT_CONFIG = {
  /* Separate leaderboards per event/booth. Change to start a fresh board. */
  boardId: "default",

  /* Admin PIN for the leaderboard "Reset board" button.
     Leave "" to require only a confirmation. Set a code (e.g. "2468") so passers-by
     can't wipe the board on a public screen. */
  adminPin: "",

  /* Leaderboard backend endpoint. Leave as-is to use the built-in Netlify Function
     (works automatically once deployed to Netlify — no external accounts needed).
     If the endpoint is unreachable (e.g. local file testing), the game falls back to
     this-device-only localStorage mode. */
  apiBase: "/.netlify/functions/scores",

  /* How often the leaderboard re-checks the backend for new scores (ms). */
  pollMs: 3500
};
