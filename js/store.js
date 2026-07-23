/*
 * Claypot FICA Challenge — shared leaderboard store
 * -------------------------------------------------
 * One data layer used by BOTH the game (index.html) and the standalone
 * leaderboard screen (leaderboard.html).
 *
 *   - When deployed to Netlify  -> talks to the /.netlify/functions/scores endpoint
 *                                  (backed by Netlify Blobs). Cross-device, auto-updating.
 *   - When that endpoint is not reachable (local file testing, offline)
 *                               -> falls back to localStorage (this device only).
 *
 * API (window.ClaypotStore):
 *   .add(entry)     -> persist a score entry (returns a Promise)
 *   .clearAll()     -> wipe the board (returns a Promise)
 *   .get()          -> synchronous snapshot (array) of the latest known entries
 *   .subscribe(fn)  -> fn(list) called now and on every change; returns an unsubscribe fn
 *   .refresh()      -> force a re-read from the backend (returns a Promise)
 *   .mode()         -> "cloud" | "local"
 *
 * Entry shape (written by the game): { name, company, score, rank, time, improvement, ts }
 */
window.ClaypotStore = (function () {
  var cfg = window.CLAYPOT_CONFIG || {};
  var LS_KEY = "claypot_leaderboard_v1";
  var boardId = cfg.boardId || "default";
  var apiBase = cfg.apiBase || "/.netlify/functions/scores";
  var POLL_MS = cfg.pollMs || 3500;

  var cache = [];
  var subs = [];
  var mode = "local";
  var pollTimer = null;

  function notify() {
    var snapshot = cache.slice();
    subs.forEach(function (fn) { try { fn(snapshot); } catch (e) { /* ignore */ } });
  }
  function sameData(a, b) { try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; } }

  // ---- localStorage helpers ----
  function lsRead() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch (e) { return []; } }
  function lsWrite(list) { try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) { /* quota/disabled */ } }

  function apiUrl() { return apiBase + "?board=" + encodeURIComponent(boardId); }

  function fetchCloud() {
    return fetch(apiUrl(), { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function (data) { return Array.isArray(data) ? data : []; });
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(function () {
      fetchCloud().then(function (list) {
        if (!sameData(list, cache)) { cache = list; notify(); }
      }).catch(function () { /* transient network hiccup — keep last cache */ });
    }, POLL_MS);
  }

  function add(entry) {
    if (mode === "cloud") {
      return fetch(apiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      }).then(function () { return fetchCloud(); })
        .then(function (list) { cache = list; notify(); })
        .catch(function () { /* keep going even if the write response is slow */ });
    }
    cache = lsRead(); cache.push(entry); lsWrite(cache); notify();
    return Promise.resolve();
  }

  function clearAll() {
    if (mode === "cloud") {
      return fetch(apiUrl(), { method: "DELETE" })
        .then(function () { cache = []; notify(); });
    }
    cache = []; lsWrite(cache); notify();
    return Promise.resolve();
  }

  function get() { return cache.slice(); }

  function refresh() {
    if (mode === "cloud") {
      return fetchCloud().then(function (list) { cache = list; notify(); }).catch(function () {});
    }
    cache = lsRead(); notify();
    return Promise.resolve();
  }

  function subscribe(fn) {
    subs.push(fn);
    try { fn(cache.slice()); } catch (e) { /* ignore */ }
    return function () { subs = subs.filter(function (s) { return s !== fn; }); };
  }

  // ---- boot: probe the cloud endpoint, else fall back to localStorage ----
  function initLocal() {
    mode = "local";
    cache = lsRead();
    window.addEventListener("storage", function (e) {
      if (e.key === LS_KEY) { cache = lsRead(); notify(); }
    });
    notify();
  }

  fetchCloud().then(function (list) {
    mode = "cloud";
    cache = list;
    notify();
    startPolling();
  }).catch(function () {
    initLocal();
  });

  return {
    add: add, clearAll: clearAll, get: get, refresh: refresh,
    subscribe: subscribe, mode: function () { return mode; }
  };
})();
