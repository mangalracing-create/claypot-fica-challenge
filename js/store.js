/*
 * Claypot FICA Challenge — shared leaderboard store
 * -------------------------------------------------
 * One data layer used by BOTH the game (index.html) and the standalone
 * leaderboard screen (leaderboard.html).
 *
 *   - If a real Firebase config is present  -> Firebase Realtime Database (live, cross-device)
 *   - Otherwise                              -> localStorage (single browser, live across tabs)
 *
 * API (window.ClaypotStore):
 *   .add(entry)        -> persist a score entry (returns a Promise)
 *   .clearAll()        -> wipe the board (returns a Promise)
 *   .get()             -> synchronous snapshot (array) of the latest known entries
 *   .subscribe(fn)     -> fn(list) is called now and on every change; returns an unsubscribe fn
 *   .mode()            -> "firebase" | "local"
 *
 * Entry shape (written by the game): { name, company, photo, score, rank, time, improvement, ts }
 */
window.ClaypotStore = (function () {
  var LS_KEY = "claypot_leaderboard_v1";
  var boardId = window.CLAYPOT_BOARD_ID || "default";
  var cache = [];
  var subs = [];
  var mode = "local";
  var dbRef = null;

  function notify() {
    var snapshot = cache.slice();
    subs.forEach(function (fn) { try { fn(snapshot); } catch (e) { /* ignore */ } });
  }

  function lsRead() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch (e) { return []; }
  }
  function lsWrite(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) { /* quota / disabled */ }
  }

  function initLocal() {
    mode = "local";
    cache = lsRead();
    // live updates across tabs/windows of the SAME browser
    window.addEventListener("storage", function (e) {
      if (e.key === LS_KEY) { cache = lsRead(); notify(); }
    });
    notify();
  }

  function initFirebase(cfg) {
    try {
      if (!firebase.apps || !firebase.apps.length) { firebase.initializeApp(cfg); }
      dbRef = firebase.database().ref("boards/" + boardId + "/scores");
      mode = "firebase";
      dbRef.on("value", function (snap) {
        var val = snap.val() || {};
        cache = Object.keys(val).map(function (k) {
          var row = val[k] || {};
          row.id = k;
          return row;
        });
        notify();
      }, function (err) {
        console.warn("[ClaypotStore] Firebase read failed, falling back to localStorage.", err);
        initLocal();
      });
    } catch (e) {
      console.warn("[ClaypotStore] Firebase init failed, using localStorage.", e);
      initLocal();
    }
  }

  function isConfigured(cfg) {
    if (!cfg) return false;
    var s = JSON.stringify(cfg);
    return !!cfg.apiKey && !!cfg.databaseURL && s.indexOf("YOUR_") === -1;
  }

  function add(entry) {
    if (mode === "firebase" && dbRef) {
      return dbRef.push(entry);
    }
    cache = lsRead();
    cache.push(entry);
    lsWrite(cache);
    notify();
    return Promise.resolve();
  }

  function clearAll() {
    if (mode === "firebase" && dbRef) {
      return dbRef.remove();
    }
    cache = [];
    lsWrite(cache);
    notify();
    return Promise.resolve();
  }

  function get() { return cache.slice(); }

  function subscribe(fn) {
    subs.push(fn);
    try { fn(cache.slice()); } catch (e) { /* ignore */ }
    return function () { subs = subs.filter(function (s) { return s !== fn; }); };
  }

  // ---- boot ----
  var cfg = window.CLAYPOT_FIREBASE_CONFIG;
  if (isConfigured(cfg) && typeof firebase !== "undefined") {
    initFirebase(cfg);
  } else {
    initLocal();
  }

  return { add: add, clearAll: clearAll, get: get, subscribe: subscribe, mode: function () { return mode; } };
})();
