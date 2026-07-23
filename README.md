[README.md](https://github.com/user-attachments/files/30300663/README.md)
# 🍲 Claypot FICA Challenge

**Cook Faster. Archive Smarter.** — an interactive booth game for the SAP IS-U Finance
transformation story. Players pick the right Finance ingredients, archive historical data
past its retention period, and race through month-end reporting for a 90%+ performance win.

This repo is a **static site** (no build step). It deploys to Netlify from GitHub as-is.

---

## What's in the box

| File | Purpose |
|------|---------|
| `index.html` | The game (welcome → registration + photo → 3 stages → results). |
| `leaderboard.html` | **Standalone big-screen leaderboard** for a separate display. |
| `js/store.js` | Shared data layer — Firebase Realtime DB with automatic localStorage fallback. |
| `js/firebase-config.js` | Paste your Firebase config here to enable cross-device sync. |
| `netlify.toml` | Netlify config (pretty `/leaderboard` URL, camera permission header). |

### URLs once deployed
- **Game:** `https://<your-site>.netlify.app/`
- **Leaderboard (separate screen):** `https://<your-site>.netlify.app/leaderboard`

---

## Deploy to Netlify via GitHub

1. **Create a GitHub repo** and push these files:
   ```bash
   git init
   git add .
   git commit -m "Claypot FICA Challenge"
   git branch -M main
   git remote add origin https://github.com/<you>/claypot-fica-challenge.git
   git push -u origin main
   ```
2. In **Netlify** → *Add new site* → *Import an existing project* → **GitHub** → pick the repo.
3. Build settings: leave **Build command empty**, **Publish directory = `.`** (already set in `netlify.toml`). Click **Deploy**.
4. Done. Netlify gives you a URL; every `git push` auto-redeploys.

> The camera on the registration screen requires **HTTPS** — Netlify provides this automatically.

---

## Cross-device leaderboard (Firebase) — recommended for a booth

To show the leaderboard on a **different screen/device** than the game, the two need a shared
online store. This project uses **Firebase Realtime Database** (free tier, no server code).

### One-time setup (~5 min)
1. Go to <https://console.firebase.google.com> → **Add project** (any name).
2. Left menu → **Build → Realtime Database** → **Create Database** → start in **test mode**
   (or set the rules below), pick a location.
3. Project settings (⚙️) → **Your apps** → **Web app** (`</>`) → register → copy the `firebaseConfig` values.
4. Paste them into **`js/firebase-config.js`**, replacing the `YOUR_...` placeholders. Make sure
   `databaseURL` is included (e.g. `https://your-project-default-rtdb.firebaseio.com`).
5. Commit & push — Netlify redeploys. The leaderboard header will show **“Live · Cloud synced.”**

### Database rules
For a short booth event, open read/write is simplest:
```json
{
  "rules": {
    "boards": {
      ".read": true,
      ".write": true
    }
  }
}
```
> This is intentionally open (anyone with the URL can read/write). Fine for a time-boxed event.
> After the event, tighten the rules or clear the data. Do **not** store sensitive data.

### No Firebase configured?
The game still works — it automatically falls back to **localStorage**. In that mode the
leaderboard only reflects games played **in the same browser on the same device** (updates live
across tabs/windows of that browser). The leaderboard header shows **“Local mode.”**

### Multiple booths / fresh boards
Set `window.CLAYPOT_BOARD_ID` in `js/firebase-config.js` to any string to isolate a board
(e.g. `"singapore-day1"`). Change it to start a clean leaderboard.

---

## Leaderboard screen — what it shows
- **Total Number of Players**
- **Count of players scoring 2000** (Claypot Masters)
- **Count scoring 1500–1999** (Finance Chefs)
- **Count scoring under 1500** (Kitchen Apprentices)
- **Ranked list** — every player with their **rank** (🥇🥈🥉 then #4, #5 …), photo, name,
  company, score and month-end time.
- **Today / All-Time** toggle and a **Fastest Month-End** highlight. Updates live.

---

## Run locally
Because the pages load `js/*.js`, use a tiny local server (not `file://`):
```bash
# Python
python -m http.server 8123
# then open http://localhost:8123/  and  http://localhost:8123/leaderboard
```

---

## Notes
- Player photos are stored as small (320px) JPEG data URLs. Keep the event to a reasonable
  number of players; each photo is a few KB in the database.
- Score is capped at **2000**. Scoring: +100 correct ingredient, +150 correct archival,
  −50 / −75 for mistakes, +500 time bonus, +200 performance bonus.
