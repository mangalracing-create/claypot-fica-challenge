[README.md](https://github.com/user-attachments/files/30303420/README.md)
# 🍲 Claypot FICA Challenge

**Cook Faster. Archive Smarter.** — an interactive booth game for the SAP IS-U Finance
transformation story. Players pick the right Finance ingredients, archive historical data
past its 7-year retention period, and race through month-end reporting for a 90%+ win.

Works on **desktop, touchscreens and mobile phones** (portrait). Deploys to Netlify from GitHub.

---

## What's in the box

| File | Purpose |
|------|---------|
| `index.html` | The game (welcome → registration → 3 stages → results). |
| `leaderboard.html` | Standalone **big-screen leaderboard** for a separate display. |
| `js/config.js` | Board id, admin PIN, backend endpoint, poll interval. |
| `js/store.js` | Shared data layer — Netlify Function backend with localStorage fallback. |
| `netlify/functions/scores.mjs` | Serverless leaderboard API, backed by **Netlify Blobs**. |
| `package.json` | Declares the `@netlify/blobs` dependency for the function. |
| `netlify.toml` | Netlify config (functions dir, pretty `/leaderboard` URL). |

### URLs once deployed
- **Game:** `https://<your-site>.netlify.app/`
- **Leaderboard (separate screen):** `https://<your-site>.netlify.app/leaderboard`

---

## Deploy to Netlify via GitHub  ← recommended

The live cross-device leaderboard uses a Netlify Function, which Netlify builds from your
repo. Use the GitHub route (not drag-and-drop) so the function is bundled.

1. **Create an empty repo** on GitHub (no README/.gitignore — they're here already).
2. **Push these files:**
   ```bash
   cd claypot-fica-challenge
   git init
   git add .
   git commit -m "Claypot FICA Challenge"
   git branch -M main
   git remote add origin https://github.com/<YOU>/claypot-fica-challenge.git
   git push -u origin main
   ```
3. In **Netlify** → *Add new site* → *Import an existing project* → **GitHub** → pick the repo.
4. Settings are auto-detected from `netlify.toml` (publish `.`, functions in `netlify/functions`,
   no build command needed). Click **Deploy**.
5. Done. Every `git push` auto-redeploys.

That's it — **the leaderboard syncs across devices automatically**, with no external accounts
or API keys. It's powered by Netlify Blobs (built into your Netlify site).

---

## How the leaderboard sync works
- **On Netlify:** the game POSTs each result to `/.netlify/functions/scores`; the leaderboard
  screen **polls every ~3.5s** and updates live. Open it on any device/screen — they all stay
  in sync. Header shows **“Live · Cloud synced.”**
- **Local file testing (no function):** falls back to `localStorage` (this browser only; updates
  live across tabs). Header shows **“Local mode.”**

No setup required. Optional tweaks in `js/config.js`:
- `boardId` — change to start a fresh board or run multiple booths (`"singapore-day1"`).
- `adminPin` — set a code (e.g. `"2468"`) so only staff can use the leaderboard **Reset board** button.
- `pollMs` — how often the leaderboard re-checks for new scores.

---

## Leaderboard screen — what it shows
- **Total Number of Players**
- **Count scoring 2000** (Claypot Masters)
- **Count scoring 1500–1999** (Finance Chefs)
- **Count scoring under 1500** (Kitchen Apprentices)
- **Ranked list** — every player with their **rank** (🥇🥈🥉 then #4, #5 …), name, company,
  score and month-end time.
- **Today / All-Time** toggle, **Fastest Month-End** highlight, and a discreet admin **Reset board**.
- Updates **live** (no refresh needed).

---

## Run locally
Because the pages load `js/*.js`, use a local server (not `file://`):
```bash
python -m http.server 8123      # then open http://localhost:8123/
```
In this mode the leaderboard runs in local (single-device) mode. To exercise the cloud/auto-update
path locally, `netlify dev` (Netlify CLI) runs the real function; a lightweight `dev-server.py`
(git-ignored) is also included that mimics the function contract.

---

## Notes
- Score is capped at **2000**. Scoring: +100 correct ingredient, +150 correct archival,
  −50 / −75 for mistakes, +500 time bonus, +200 performance bonus.
- Player registration collects name (required), company/team and optional email — **no photo**.
- Netlify Blobs stores the board as one small JSON document (function keeps the latest 500 entries).
- Open read/write is fine for a time-boxed booth event; no sensitive data is stored.
